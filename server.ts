import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { sendTransactionEmails, sendMultibancoEmails, sendShippedEmails, OrderData } from "./src/lib/emailService";
import Stripe from "stripe";
import pg from "pg";

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

let stripeInstance: Stripe | null = null;
function getStripeInstance(): Stripe | null {
  try {
    if (!stripeInstance) {
      const key = process.env.STRIPE_SECRET_KEY;
      if (key && key.trim() !== "" && !key.startsWith("sk_test_mock")) {
        // Clean up any extra whitespaces, newlines or quotes that might be in the env key
        const cleanKey = key.trim().replace(/^["']|["']$/g, '');
        stripeInstance = new Stripe(cleanKey);
      }
    }
    return stripeInstance;
  } catch (err) {
    console.error("[STRIPE INITIALIZATION ERROR]", err);
    return null;
  }
}

// CORS Middleware to allow requests from any frontend domain dynamically
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
  } else {
    res.setHeader("Access-Control-Allow-Origin", "*");
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, Accept");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Enable JSON body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Persistent file-backed order store to preserve data during sandbox testing and server restarts
// On Railway with a persistent volume mounted at /app/data/, write to /app/data/orders.json. Fall back to current directory otherwise.
const getOrdersFilePath = () => {
  const railwayPersistentDir = "/app/data";
  try {
    if (!fs.existsSync(railwayPersistentDir)) {
      fs.mkdirSync(railwayPersistentDir, { recursive: true });
    }
    console.log(`[ORDERS DATABASE] Using Railway persistent storage directory: ${railwayPersistentDir}`);
    return path.join(railwayPersistentDir, "orders.json");
  } catch (e) {
    console.warn("[ORDERS DATABASE] /app/data is not accessible or writable. Falling back to local workspace orders.json.");
    return path.join(process.cwd(), "orders.json");
  }
};

const ORDERS_FILE = getOrdersFilePath();

function loadOrders() {
  const map = new Map<string, any>();
  if (fs.existsSync(ORDERS_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf8'));
      for (const [id, ord] of Object.entries(data)) {
        map.set(id, ord);
      }
      console.log(`[ORDERS DATABASE] Loaded ${map.size} orders from persistent orders.json`);
    } catch (err) {
      console.error("[ORDERS DATABASE ERROR] Failed to load orders.json", err);
    }
  }
  return map;
}

function saveOrders(map: Map<string, any>) {
  try {
    const obj = Object.fromEntries(map);
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(obj, null, 2), 'utf8');
  } catch (err) {
    console.error("[ORDERS DATABASE ERROR] Failed to save orders.json", err);
  }
}

const activeOrders = loadOrders();

// Serve public directory statically so sandbox emails can be viewed in browser tabs
app.use('/emails', express.static(path.join(process.cwd(), 'public', 'emails')));

/**
 * 1. CREATE PAYMENT INTENT ENDPOINT
 * Handles Credit Card, MB WAY and Multibanco initial creation.
 * Implements sandbox mode with mock stress test data.
 */
app.post("/api/payment/create-intent", async (req, res) => {
  try {
    const { product, selections, checkoutForm, paymentMethod, mode = 'test' } = req.body;

    if (!product || !checkoutForm || !paymentMethod) {
      return res.status(400).json({ error: "Missing required transaction fields" });
    }

    // Generate distinctive Portuguese order code for M.BRAVO
    const orderId = `MB-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const createdAt = new Date().toISOString();

    // Determine production priority: custom sizing or quantity > 1 flags high priority
    const isCustomSize = selections.tamanho === "Sob Medida" || selections.tamanho === "Customizado" || !selections.tamanho;
    const isBulk = parseInt(selections.quantidade || "1") > 1;
    const priority = (isCustomSize || isBulk) ? "ALTA (Atelier Urgente)" : "NORMAL";

    const order: any = {
      orderId,
      productName: product.name,
      price: product.price,
      selections,
      customer: {
        nome: checkoutForm.nome,
        email: checkoutForm.email,
        telefone: checkoutForm.telefone,
        morada: checkoutForm.morada,
        codigoPostal: checkoutForm.codigoPostal,
        cidade: checkoutForm.cidade,
        nif: checkoutForm.nif
      },
      paymentMethod,
      status: "pending_payment",
      priority,
      createdAt,
      mbwayPhone: checkoutForm.mbwayPhone?.replace(/\s+/g, ""),
      cardNumber: checkoutForm.cardNumber?.replace(/\s+/g, ""),
      emailSent: false
    };

    // Process payment using Stripe if available
    const { amountInCents } = req.body;
    
    // Calculate correct price in cents if not provided or 0
    let finalAmountInCents = amountInCents;
    if (!finalAmountInCents || finalAmountInCents <= 0) {
      try {
        const productPrice = typeof product.price === 'string' 
          ? parseFloat(product.price.replace(/[^0-9.]/g, '')) 
          : parseFloat(product.price);
        const qty = parseInt(selections.quantidade || "1") || 1;
        finalAmountInCents = Math.round(productPrice * qty * 100);
        console.log(`[STRIPE] Dynamically calculated server-side amountInCents for ${orderId}: ${finalAmountInCents} cents`);
      } catch (calcErr) {
        console.warn(`[STRIPE WARNING] Could not calculate price for ${orderId}, falling back to 5000 cents:`, calcErr);
        finalAmountInCents = 5000;
      }
    }

    const stripe = getStripeInstance();
    const paymentMethodConfig = "pmc_1TqbCW2FDCus4I5c6LgT17T9";

    if (paymentMethod === 'card') {
      if (stripe && checkoutForm && checkoutForm.cardNumber) {
        try {
          // Parse Card expiry (MM/YY)
          const expiryParts = (checkoutForm.cardExpiry || "").split('/');
          const expMonth = parseInt(expiryParts[0]?.trim() || "0");
          const expYear = parseInt(expiryParts[1]?.trim() || "0");
          const fullExpYear = expYear < 100 ? 2000 + expYear : expYear;

          console.log(`[STRIPE] Creating PaymentIntent with payment_method_data for order ${orderId}`);
          
          const paymentIntent = await stripe.paymentIntents.create({
            amount: finalAmountInCents || 5000,
            currency: 'eur',
            payment_method_data: {
              type: 'card' as any,
              card: {
                number: checkoutForm.cardNumber.replace(/\s+/g, ''),
                exp_month: expMonth,
                exp_year: fullExpYear,
                cvc: checkoutForm.cardCvv?.trim(),
              },
              billing_details: {
                name: checkoutForm.cardName || checkoutForm.nome,
                email: checkoutForm.email,
                phone: checkoutForm.telefone,
                address: {
                  line1: checkoutForm.morada,
                  postal_code: checkoutForm.codigoPostal,
                  city: checkoutForm.cidade,
                  country: 'PT'
                }
              }
            } as any,
            confirm: true,
            return_url: `${req.headers.origin || 'https://www.mbravobycarolina.com'}/`,
            payment_method_types: ['card'],
            payment_method_configuration: paymentMethodConfig as any,
            description: `M BRAVO - Encomenda ${orderId}`,
            receipt_email: checkoutForm.email,
            metadata: {
              orderId,
              customerName: checkoutForm.nome,
              customerEmail: checkoutForm.email
            }
          });

          console.log(`[STRIPE] PaymentIntent created status: ${paymentIntent.status}`);
          order.stripePaymentIntentId = paymentIntent.id;

          if (paymentIntent.status === 'succeeded') {
            order.status = 'paid';
            const emailLinks = sendTransactionEmails(order);
            order.emailSent = true;
            order.emailLinks = emailLinks;
          } else if (paymentIntent.status === 'requires_action') {
            order.status = 'pending_payment';
            order.stripeClientSecret = paymentIntent.client_secret;
          } else {
            order.status = 'failed';
            order.errorMessage = `Stripe status: ${paymentIntent.status}`;
          }
        } catch (stripeErr: any) {
          console.error("[STRIPE ERROR]", stripeErr);
          if (stripeErr.type === 'StripeAuthenticationError' || stripeErr.statusCode === 401 || (stripeErr.message && (stripeErr.message.includes('Invalid API Key') || stripeErr.message.includes('API key provided')))) {
            console.warn("[STRIPE WARNING] Invalid Stripe API key provided or auth failed. Falling back gracefully to sandbox simulation...");
            const cardNum = checkoutForm.cardNumber || '';
            if (cardNum.endsWith('5001')) {
              order.status = 'failed';
              order.errorMessage = 'Declined by credit card gateway (Simulation Error 5001 - Insufficient Funds)';
            } else if (cardNum.endsWith('5002')) {
              order.status = 'failed';
              order.errorMessage = 'Credit card transaction timeout/expired (Simulation Error 5002)';
            } else {
              order.status = 'paid';
              const emailLinks = sendTransactionEmails(order);
              order.emailSent = true;
              order.emailLinks = emailLinks;
            }
          } else {
            order.status = 'failed';
            order.errorMessage = stripeErr.message || 'Erro no processamento com o Stripe';
          }
        }
      } else {
        // Fallback simulation if no real Stripe configuration is present (keeps sandbox testing working)
        const cardNum = order.cardNumber || '';
        if (cardNum.endsWith('5001')) {
          // Immediate failure test card
          order.status = 'failed';
          order.errorMessage = 'Declined by credit card gateway (Simulation Error 5001 - Insufficient Funds)';
        } else if (cardNum.endsWith('5002')) {
          // Immediate expiration / fraud test card
          order.status = 'failed';
          order.errorMessage = 'Credit card transaction timeout/expired (Simulation Error 5002)';
        } else {
          // Successful card transaction
          order.status = 'paid';
          const emailLinks = sendTransactionEmails(order);
          order.emailSent = true;
          order.emailLinks = emailLinks;
        }
      }
    } else if (paymentMethod === 'multibanco') {
      if (stripe && checkoutForm) {
        try {
          console.log(`[STRIPE] Creating Multibanco PaymentIntent for order ${orderId} with amount ${finalAmountInCents} cents`);
          
          const customerName = checkoutForm.nome?.trim() || "M BRAVO Cliente";
          // CORREÇÃO: Removido o fallback para o gmail antigo
          const customerEmail = checkoutForm.email?.trim() || "encomendas@mbravobycarolina.com";

          const paymentIntent = await stripe.paymentIntents.create({
            amount: finalAmountInCents || 5000,
            currency: 'eur',
            payment_method_types: ['multibanco'],
            payment_method_data: {
              type: 'multibanco',
              billing_details: {
                name: customerName,
                email: customerEmail,
              }
            },
            confirm: true,
            return_url: `${req.headers.origin || 'https://www.mbravobycarolina.com'}/`,
            description: `M BRAVO - Encomenda ${orderId}`,
            receipt_email: customerEmail,
            metadata: {
              orderId,
              customerName,
              customerEmail
            }
          });

          console.log(`[STRIPE MULTIBANCO] Created PaymentIntent ID: ${paymentIntent.id}, status: ${paymentIntent.status}`);
          order.stripePaymentIntentId = paymentIntent.id;

          if (paymentIntent.next_action?.multibanco_display_details) {
            const details = paymentIntent.next_action.multibanco_display_details;
            order.multibancoRef = {
              entidade: details.entity,
              referencia: details.reference
            };
            console.log(`[STRIPE MULTIBANCO] Extracted real reference details: Entidade ${details.entity}, Ref ${details.reference}`);
          } else {
            console.warn(`[STRIPE MULTIBANCO] PaymentIntent created, but no next_action.multibanco_display_details returned. Falling back to sandbox simulation values...`);
            order.multibancoRef = {
              entidade: "12445",
              referencia: `${Math.floor(100 + Math.random() * 900)} ${Math.floor(100 + Math.random() * 900)} ${Math.floor(100 + Math.random() * 900)}`
            };
          }
        } catch (stripeErr: any) {
          console.error("[STRIPE MULTIBANCO FULL ERROR OBJECT]", stripeErr);
          if (stripeErr && typeof stripeErr === 'object') {
            console.error(JSON.stringify(stripeErr, null, 2));
          }
          const stripeKey = process.env.STRIPE_SECRET_KEY || "";
          const isLiveMode = stripeKey.startsWith("sk_live");
          
          if (isLiveMode) {
            order.status = 'failed';
            order.errorMessage = `Este método de pagamento (Multibanco) não está disponível ou não foi ativo na conta Stripe. Detalhe técnico: ${stripeErr.message}`;
            
            console.warn("\n========================================================");
            console.warn("[STRIPE CONFIGURATION WARNING]");
            console.warn("Multibanco payment creation failed on a live Stripe account!");
            console.warn("Please make sure you have enabled 'Multibanco' in your Stripe Dashboard:");
            console.warn("https://dashboard.stripe.com/settings/payment_methods");
            console.warn("========================================================\n");
            
            return res.status(400).json({ 
              error: "Este método de pagamento (Multibanco) ainda não está ativo na conta do Stripe da loja. Por favor, ative-o no painel do Stripe (Settings > Payment Methods) ou utilize outro método como Cartão de Crédito." 
            });
          } else {
            // Fallback reference if Stripe has key/auth issue or setup fails in test mode
            order.multibancoRef = {
              entidade: "12445",
              referencia: `${Math.floor(100 + Math.random() * 900)} ${Math.floor(100 + Math.random() * 900)} ${Math.floor(100 + Math.random() * 900)}`
            };
          }
        }
      } else {
        // Fallback simulation if no real Stripe configuration is present (keeps sandbox testing working)
        order.multibancoRef = {
          entidade: "12445",
          referencia: `${Math.floor(100 + Math.random() * 900)} ${Math.floor(100 + Math.random() * 900)} ${Math.floor(100 + Math.random() * 900)}`
        };
      }

      // Dispatch Multibanco payment instruction email immediately so client gets reference in inbox!
      if (order.multibancoRef) {
        try {
          const mbEmails = sendMultibancoEmails(order, order.multibancoRef);
          order.emailLinks = mbEmails;
        } catch (emailErr) {
          console.error("[M.BRAVO EMAIL SYSTEM ERROR] Failed to dispatch Multibanco instruction email:", emailErr);
        }
      }
    } else if (paymentMethod === 'mbway') {
      const phone = order.mbwayPhone || '';
      if (stripe && checkoutForm && phone && !phone.startsWith('911') && !phone.startsWith('922') && !phone.startsWith('933')) {
        try {
          console.log(`[STRIPE] Creating MB WAY PaymentIntent for order ${orderId}`);
          
          let formattedPhone = phone.trim();
          if (formattedPhone && !formattedPhone.startsWith('+')) {
            formattedPhone = '+351' + formattedPhone;
          }

          const paymentIntent = await stripe.paymentIntents.create({
            amount: finalAmountInCents || 5000,
            currency: 'eur',
            payment_method_types: ['mb_way'],
            payment_method_data: {
              type: 'mb_way',
              billing_details: {
                phone: formattedPhone
              }
            },
            confirm: true,
            mandate_data: {
              customer_acceptance: {
                type: 'online',
                online: {
                  ip_address: req.ip || '127.0.0.1',
                  user_agent: req.headers['user-agent'] || 'unknown'
                }
              }
            },
            description: `M BRAVO - Encomenda ${orderId}`,
            receipt_email: checkoutForm.email,
            metadata: {
              orderId,
              customerName: checkoutForm.nome,
              customerEmail: checkoutForm.email
            }
          });

          order.stripePaymentIntentId = paymentIntent.id;
          order.status = 'pending_payment';
        } catch (stripeErr: any) {
          console.error("[STRIPE MBWAY FULL ERROR OBJECT]", stripeErr);
          if (stripeErr && typeof stripeErr === 'object') {
            console.error(JSON.stringify(stripeErr, null, 2));
          }
          const stripeKey = process.env.STRIPE_SECRET_KEY || "";
          const isLiveMode = stripeKey.startsWith("sk_live");
          
          if (isLiveMode) {
            order.status = 'failed';
            order.errorMessage = `Este método de pagamento (MB WAY) não está disponível ou não foi ativo na conta Stripe. Detalhe técnico: ${stripeErr.message}`;
            
            console.warn("\n========================================================");
            console.warn("[STRIPE CONFIGURATION WARNING]");
            console.warn("MB WAY payment creation failed on a live Stripe account!");
            console.warn("Please make sure you have enabled 'MB WAY' in your Stripe Dashboard:");
            console.warn("https://dashboard.stripe.com/settings/payment_methods");
            console.warn("========================================================\n");
            
            return res.status(400).json({ 
              error: "Este método de pagamento (MB WAY) ainda não está ativo na conta do Stripe da loja. Por favor, ative-o no painel do Stripe (Settings > Payment Methods) ou utilize outro método como Cartão de Crédito." 
            });
          } else {
            // Fallback simulation if Stripe fails (e.g. key issue) in test mode
            if (phone === '922222222') {
              order.simulatedOutcome = 'failed';
            } else if (phone === '933333333') {
              order.simulatedOutcome = 'expired';
            } else {
              order.simulatedOutcome = 'paid';
            }
          }
        }
      } else {
        // Fallback simulation if sandbox numbers are used or Stripe is unavailable
        if (phone === '922222222') {
          order.simulatedOutcome = 'failed';
        } else if (phone === '933333333') {
          order.simulatedOutcome = 'expired';
        } else {
          order.simulatedOutcome = 'paid';
        }
      }
    } else if (paymentMethod === 'wallet') {
      if (stripe) {
        try {
          console.log(`[STRIPE WALLET] Creating PaymentIntent for digital wallet order ${orderId}`);
          
          const paymentIntent = await stripe.paymentIntents.create({
            amount: finalAmountInCents || 5000,
            currency: 'eur',
            payment_method_types: ['card'], // Wallet payments (Apple Pay / Google Pay) are processed as cards under the hood
            payment_method_configuration: paymentMethodConfig as any,
            description: `M BRAVO - Encomenda ${orderId}`,
            receipt_email: checkoutForm.email,
            metadata: {
              orderId,
              customerName: checkoutForm.nome,
              customerEmail: checkoutForm.email
            }
          });

          order.stripePaymentIntentId = paymentIntent.id;
          order.stripeClientSecret = paymentIntent.client_secret;
          order.status = 'pending_payment';
          console.log(`[STRIPE WALLET] Created PaymentIntent ID ${paymentIntent.id}, status: ${paymentIntent.status}`);
        } catch (stripeErr: any) {
          console.error("[STRIPE WALLET ERROR]", stripeErr);
          order.status = 'failed';
          order.errorMessage = stripeErr.message || 'Erro ao inicializar carteira com Stripe';
        }
      } else {
        // Fallback simulation for local sandbox / testing
        order.status = 'paid';
        const emailLinks = sendTransactionEmails(order);
        order.emailSent = true;
        order.emailLinks = emailLinks;
      }
    }

    // Save order in memory and write to disk immediately to persist and sync across containers/webhooks
    activeOrders.set(orderId, order);
    saveOrders(activeOrders);

    res.json({
      success: true,
      orderId,
      status: order.status,
      priority: order.priority,
      multibancoRef: order.multibancoRef,
      emailLinks: order.emailLinks,
      errorMessage: order.errorMessage,
      stripeClientSecret: order.stripeClientSecret
    });
  } catch (error: any) {
    console.error("[PAYMENT ERROR]", error);
    res.status(500).json({ error: "Internal server error processing transaction intent" });
  }
});

/**
 * 2. GET PAYMENT STATUS / POLLING ENDPOINT
 * Simulates real-time push notification / polling loop.
 * Resolves asynchronous transactions (like MB WAY app confirmations).
 */
app.get("/api/payment/status/:orderId", async (req, res) => {
  const { orderId } = req.params;
  const order = activeOrders.get(orderId);

  if (!order) {
    return res.status(404).json({ error: "Order not found" });
  }

  // Real Stripe Payment status poll
  if (order.status === 'pending_payment' && order.stripePaymentIntentId) {
    const stripe = getStripeInstance();
    if (stripe) {
      try {
        const intent = await stripe.paymentIntents.retrieve(order.stripePaymentIntentId);
        if (intent.status === 'succeeded') {
          order.status = 'paid';
          if (!order.emailSent) {
            order.emailLinks = sendTransactionEmails(order);
            order.emailSent = true;
          }
        } else if (intent.status === 'canceled' || (intent.last_payment_error && intent.status !== 'requires_action')) {
          order.status = 'failed';
          order.errorMessage = intent.last_payment_error?.message || `Stripe payment failed with status: ${intent.status}`;
        }
      } catch (err: any) {
        console.error("[STRIPE STATUS POLL ERROR]", err);
      }
    }
  }

  // Simulate gateway latency (MBWAY user checking app and confirming)
  const secondsElapsed = (Date.now() - new Date(order.createdAt).getTime()) / 1000;

  if (order.status === 'pending_payment') {
    if (order.paymentMethod === 'mbway') {
      // Async MBWAY Simulation
      if (order.simulatedOutcome === 'failed' && secondsElapsed >= 3) {
        order.status = 'failed';
        order.errorMessage = 'MB WAY user rejected the push authorization request.';
      } else if (order.simulatedOutcome === 'expired' && secondsElapsed >= 5) {
        order.status = 'failed';
        order.errorMessage = 'MB WAY payment expired. The 5-minute confirmation window elapsed.';
      } else if (order.simulatedOutcome === 'paid' && secondsElapsed >= 4) {
        order.status = 'paid';
        if (!order.emailSent) {
          order.emailLinks = sendTransactionEmails(order);
          order.emailSent = true;
        }
      }
    }
  }

  res.json({
    orderId,
    status: order.status,
    errorMessage: order.errorMessage,
    emailLinks: order.emailLinks,
    multibancoRef: order.multibancoRef
  });
});

/**
 * 3. REAL-TIME WEBHOOK INTEGRATION ENDPOINT
 * Listens to external post-payment notifications (payment_intent.succeeded or Multibanco completion).
 * Dispatches automatic client purchase emails and notifies Atelier administrators.
 */
app.post("/api/payment/webhook", (req, res) => {
  console.log("[WEBHOOK RECEIVED] Processing payload.");
  
  const payload = req.body;
  console.log("[WEBHOOK PAYLOAD DETAIL]", JSON.stringify(payload, null, 2));

  // Reload current orders from disk to stay perfectly synchronized in multi-container/cluster environments
  const currentOrders = loadOrders();
  activeOrders.clear();
  for (const [id, ord] of currentOrders.entries()) {
    activeOrders.set(id, ord);
  }

  let orderId = payload.orderId || req.query.orderId || req.body.orderId;
  let event = payload.event || payload.type;
  let stripeIntentId: string | undefined = undefined;

  // Handle Stripe Webhook format where metadata holds the orderId
  if (payload.data && payload.data.object) {
    const stripeObj = payload.data.object;
    console.log(`[WEBHOOK STRIPE OBJECT] Object type: ${stripeObj.object}, ID: ${stripeObj.id}`);
    
    if (stripeObj.metadata) {
      if (stripeObj.metadata.orderId) {
        orderId = stripeObj.metadata.orderId;
        console.log(`[WEBHOOK STRIPE METADATA] Found Order ID: ${orderId}`);
      } else if (stripeObj.metadata.order_id) {
        orderId = stripeObj.metadata.order_id;
        console.log(`[WEBHOOK STRIPE METADATA] Found Order ID (alternate key): ${orderId}`);
      }
    }

    if (!orderId && stripeObj.description) {
      const descMatch = stripeObj.description.match(/(?:encomenda|order)\s*#?\s*([A-Za-z0-9_-]+)/i);
      if (descMatch && descMatch[1]) {
        orderId = descMatch[1];
        console.log(`[WEBHOOK STRIPE DESCRIPTION MATCH] Parsed Order ID from description: ${orderId}`);
      }
    }
    
    if (stripeObj.object === "payment_intent") {
      stripeIntentId = stripeObj.id;
    } else if (stripeObj.object === "charge") {
      stripeIntentId = stripeObj.payment_intent;
    }
  }

  // Fallback: search by stripePaymentIntentId if we didn't find orderId in metadata/description
  if (!orderId && stripeIntentId) {
    console.log(`[WEBHOOK FALLBACK] orderId not found in metadata/description, searching in activeOrders by stripePaymentIntentId: ${stripeIntentId}`);
    for (const [id, ord] of activeOrders.entries()) {
      if (ord.stripePaymentIntentId === stripeIntentId) {
        orderId = id;
        console.log(`[WEBHOOK FALLBACK] Found matching order in memory store: ${orderId}`);
        break;
      }
    }
  }

  if (!orderId) {
    const randomId = Math.random().toString(36).substring(2, 7).toUpperCase();
    const cleanIntentSuffix = stripeIntentId ? stripeIntentId.slice(-5).toUpperCase() : randomId;
    orderId = `MB-RECU-${cleanIntentSuffix}`;
    console.log(`[WEBHOOK AUTO-RECOVERY] Could not find orderId in payload. Generated fallback recovery orderId: ${orderId}`);
  }

  let order = activeOrders.get(orderId);
  
  // SELF-HEALING AUTO-RECOVERY: Recreate order if not found in memory (e.g., after a production server redeployment)
  if (!order) {
    console.log(`[WEBHOOK AUTO-RECOVERY] Order ${orderId} not found in database. Reconstructing order from Stripe webhook payload...`);
    
    const stripeObj = (payload.data && payload.data.object) ? payload.data.object : {};
    const metadata = stripeObj.metadata || {};
    
    const customerName = metadata.customerName || stripeObj.billing_details?.name || stripeObj.shipping?.name || "Cliente M★BRAVO (Recuperado)";
    const customerEmail = metadata.customerEmail || stripeObj.receipt_email || stripeObj.billing_details?.email || "";
    const customerPhone = metadata.customerPhone || stripeObj.billing_details?.phone || stripeObj.shipping?.phone || "912 828 182";
    
    const morada = stripeObj.shipping?.address?.line1 || stripeObj.billing_details?.address?.line1 || "Não especificada";
    const postal = stripeObj.shipping?.address?.postal_code || stripeObj.billing_details?.address?.postal_code || "0000-000";
    const cidade = stripeObj.shipping?.address?.city || stripeObj.billing_details?.address?.city || "Portugal";
    
    const amountCents = stripeObj.amount || 1600;
    const priceValue = (amountCents / 100).toFixed(2);
    
    let method = "mbway";
    if (stripeObj.payment_method_types) {
      if (stripeObj.payment_method_types.includes("card")) {
        method = "card";
      } else if (stripeObj.payment_method_types.includes("multibanco")) {
        method = "multibanco";
      } else if (stripeObj.payment_method_types.includes("mb_way")) {
        method = "mbway";
      }
    } else if (stripeObj.payment_method_details?.type) {
      const pmType = stripeObj.payment_method_details.type;
      if (pmType === "card") method = "card";
      else if (pmType === "multibanco") method = "multibanco";
      else if (pmType === "mb_way" || pmType === "mbway") method = "mbway";
    }

    const createdTime = stripeObj.created ? new Date(stripeObj.created * 1000).toISOString() : new Date().toISOString();

    order = {
      orderId,
      productName: "Peça M★BRAVO (Recuperada via Stripe)",
      price: `${priceValue} €`,
      selections: {
        cor: "Única",
        tamanho: "Único",
        quantidade: "1"
      },
      customer: {
        nome: customerName,
        email: customerEmail,
        telefone: customerPhone,
        morada: morada,
        codigoPostal: postal,
        cidade: cidade,
        nif: metadata.nif || ""
      },
      paymentMethod: method,
      status: "pending_payment",
      priority: "normal",
      createdAt: createdTime,
      stripePaymentIntentId: stripeIntentId || stripeObj.id || "",
      emailSent: false
    };

    activeOrders.set(orderId, order);
    saveOrders(activeOrders);
    console.log(`[WEBHOOK AUTO-RECOVERY] Successfully reconstructed and added order ${orderId} to local persistent database.`);
  }

  if (event === "payment_intent.succeeded" || event === "payment.succeeded" || event === "charge.succeeded" || event === "checkout.session.completed" || event === "checkout.session.async_payment_succeeded") {
    console.log(`[WEBHOOK SUCCESS] Webhook event "${event}" received. Updating order ${orderId} status to PAID.`);
    order.status = "paid";
    
    if (!order.emailSent) {
      console.log(`[WEBHOOK EMAIL TRIGGER] Dispatching transactional confirmation emails for order: ${orderId}`);
      order.emailLinks = sendTransactionEmails(order);
      order.emailSent = true;
    } else {
      console.log(`[WEBHOOK EMAIL SKIP] Emails already sent for order: ${orderId}`);
    }

    saveOrders(activeOrders);
    return res.json({
      received: true,
      status: "paid",
      message: "Order finalized and transaction notification emails dispatched successfully",
      emailLinks: order.emailLinks
    });
  }

  saveOrders(activeOrders);
  res.json({ received: true, status: order.status, message: `Unhandled event type: ${event}` });
});

/**
 * 4. DEBUG / SANDBOX SIMULATION ENDPOINT
 * Lets testers trigger webhook actions or payment cancellations on-demand.
 */
app.post("/api/payment/simulate-action", (req, res) => {
  const { orderId, action } = req.body;
  const order = activeOrders.get(orderId);

  if (!order) {
    return res.status(404).json({ error: "Order not found" });
  }

  if (action === 'simulate_payment') {
    order.status = 'paid';
    if (!order.emailSent) {
      order.emailLinks = sendTransactionEmails(order);
      order.emailSent = true;
    }
  } else if (action === 'simulate_failure') {
    order.status = 'failed';
    order.errorMessage = 'Simulated administrative cancellation / Gateway declined.';
  }

  saveOrders(activeOrders);
  res.json({ success: true, order });
});

/**
 * 5. SHIP ORDER ENDPOINT
 * Generates and triggers the shipped/dispatched notification email with tracking.
 */
app.post("/api/payment/ship-order", (req, res) => {
  const { orderId, trackingCode = "DA123456789PT" } = req.body;
  const order = activeOrders.get(orderId);

  if (!order) {
    return res.status(404).json({ error: "Order not found" });
  }

  try {
    const { shippedEmailUrl } = sendShippedEmails(order, trackingCode);
    order.status = 'paid'; // ensure it's paid or handled
    order.shippedEmailUrl = shippedEmailUrl;
    order.trackingCode = trackingCode;
    activeOrders.set(orderId, order);

    // Merge shipped links into order email links so the frontend can display them easily!
    if (!order.emailLinks) {
      order.emailLinks = {};
    }
    order.emailLinks.shippedEmailUrl = shippedEmailUrl;

    saveOrders(activeOrders);
    res.json({
      success: true,
      shippedEmailUrl,
      emailLinks: order.emailLinks,
      order
    });
  } catch (error: any) {
    console.error("[SHIP ORDER ERROR]", error);
    res.status(500).json({ error: "Internal server error generating shipped email" });
  }
});

/**
 * 6. ADMINISTRATIVE DASHBOARD ENDPOINTS
 */
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'CarolinaM26';

function verifyAdmin(req: any, res: any, next: any) {
  const auth = req.headers['x-admin-password'] || req.headers['authorization'];
  if (auth === ADMIN_PASSWORD) {
    next();
  } else {
    res.status(401).json({ error: "Acesso administrativo não autorizado. Palavra-passe incorreta." });
  }
}

// Endpoint to verify password
app.post("/api/admin/login", (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    return res.json({ success: true });
  }
  return res.status(401).json({ error: "Palavra-passe incorreta" });
});

// Endpoint to fetch all orders
app.get("/api/admin/orders", verifyAdmin, (req, res) => {
  // Reload current orders from disk to stay perfectly synchronized in multi-container/cluster environments
  const currentOrders = loadOrders();
  activeOrders.clear();
  for (const [id, ord] of currentOrders.entries()) {
    activeOrders.set(id, ord);
  }

  const ordersList = Array.from(activeOrders.values());
  // Sort by createdAt descending (newest first)
  ordersList.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json({ success: true, orders: ordersList });
});

// Endpoint to update an order
app.post("/api/admin/orders/update", verifyAdmin, (req, res) => {
  const { orderId, status, trackingCode, priority, selections } = req.body;
  
  // Reload current orders from disk to stay perfectly synchronized
  const currentOrders = loadOrders();
  activeOrders.clear();
  for (const [id, ord] of currentOrders.entries()) {
    activeOrders.set(id, ord);
  }

  const order = activeOrders.get(orderId);

  if (!order) {
    return res.status(404).json({ error: "Order not found" });
  }

  if (status) {
    order.status = status;
  }
  if (trackingCode !== undefined) {
    order.trackingCode = trackingCode;
  }
  if (priority) {
    order.priority = priority;
  }
  if (selections) {
    order.selections = { ...order.selections, ...selections };
  }

  // If status is updated to shipped, generate the shipped email!
  if (status === 'shipped') {
    try {
      const code = trackingCode || order.trackingCode || "DA123456789PT";
      const { shippedEmailUrl } = sendShippedEmails(order, code);
      order.shippedEmailUrl = shippedEmailUrl;
      if (!order.emailLinks) {
        order.emailLinks = {};
      }
      order.emailLinks.shippedEmailUrl = shippedEmailUrl;
    } catch (emailErr: any) {
      console.error("[ADMIN SHIPPED EMAIL ERROR]", emailErr);
    }
  }

  activeOrders.set(orderId, order);
  saveOrders(activeOrders);

  res.json({ success: true, order });
});

// Endpoint to manually register/add an order (e.g. past manual purchases or recovery)
app.post("/api/admin/orders/create", verifyAdmin, (req, res) => {
  const { productName, price, selections, customer, paymentMethod, status, priority, createdAt } = req.body;

  if (!productName || !customer || !customer.nome) {
    return res.status(400).json({ error: "Nome do produto e Nome do cliente são obrigatórios" });
  }

  // Generate distinctive order ID
  const orderId = `MB-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  
  const newOrder = {
    orderId,
    productName,
    price: price || 0,
    selections: selections || { cor: "Padrão", tamanho: "M", quantidade: "1" },
    customer: {
      nome: customer.nome,
      email: customer.email || "",
      telefone: customer.telefone || "",
      morada: customer.morada || "",
      codigoPostal: customer.codigoPostal || "",
      cidade: customer.cidade || "",
      nif: customer.nif || ""
    },
    paymentMethod: paymentMethod || "manual",
    status: status || "paid",
    priority: priority || "NORMAL",
    createdAt: createdAt || new Date().toISOString(),
    emailSent: false
  };

  // Reload current orders to stay perfectly synchronized
  const currentOrders = loadOrders();
  activeOrders.clear();
  for (const [id, ord] of currentOrders.entries()) {
    activeOrders.set(id, ord);
  }

  activeOrders.set(orderId, newOrder);
  saveOrders(activeOrders);

  res.json({ success: true, order: newOrder });
});


// Supabase PostgreSQL Connection Pool & Initialization
const connectionString = process.env.DATABASE_URL || "postgresql://postgres:DesignerJota83$$@db.trmsteycllxspudgpxsu.supabase.co:5432/postgres";

const dbPool = new pg.Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  },
  connectionTimeoutMillis: 5000 // fail fast if wrong credentials or unreachable
});

// Create table if not exists on startup
async function initDatabase() {
  try {
    await dbPool.query(`
      CREATE TABLE IF NOT EXISTS testimonials (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        text TEXT NOT NULL,
        product VARCHAR(255) DEFAULT '',
        rating INTEGER DEFAULT 5,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("[DATABASE SUCCESS] PostgreSQL testimonials table initialized successfully.");

    // Pre-seed if empty
    const checkEmpty = await dbPool.query("SELECT COUNT(*) FROM testimonials");
    const count = parseInt(checkEmpty.rows[0].count, 10);
    if (count === 0) {
      console.log("[DATABASE SEED] Pre-seeding testimonials table with premium brand reviews...");
      const seeds = [
        {
          name: "Maria S.",
          text: "A mala Daisy é ainda mais bonita ao vivo... O trabalho e o detalhe das flores de crochet são admiráveis, nota-se o amor em cada linha.",
          product: "Mala Daisy",
          rating: 5
        },
        {
          name: "Carolina P.",
          text: "Os coasters dão um toque único à mesa. São super delicados, mas nota-se logo a excelente qualidade do material.",
          product: "Daisy Coasters",
          rating: 5
        },
        {
          name: "Emma W.",
          text: "A mala Granny Square superou todas as minhas expectativas. É lindíssima, super robusta e cabe perfeitamente tudo o que preciso no dia a dia.",
          product: "Mala Granny Square",
          rating: 5
        },
        {
          name: "Joana R.",
          text: "Comprei o biquíni Marea e o caimento é impecável. A minúcia do trabalho manual e o toque do algodão orgânico são indescritíveis.",
          product: "Marea Bikini Set",
          rating: 5
        },
        {
          name: "Teresa B.",
          text: "O cardigan Alma é uma peça intemporal de um conforto absoluto. Recebo elogios sempre que o uso, uma verdadeira obra de arte!",
          product: "Alma Cardigan",
          rating: 5
        }
      ];
      for (const s of seeds) {
        await dbPool.query(
          `INSERT INTO testimonials (name, text, product, rating) VALUES ($1, $2, $3, $4)`,
          [s.name, s.text, s.product, s.rating]
        );
      }
      console.log("[DATABASE SEED] Pre-seeded 5 testimonials in PostgreSQL.");
    }

    // Attempt Google Places API reviews sync if configured
    await syncGoogleReviews();
  } catch (err) {
    console.error("[DATABASE ERROR] Failed to initialize testimonials table in Supabase. Check credentials.", err);
  }
}

// Native Google Places Reviews API synchronization
async function syncGoogleReviews() {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY || process.env.GOOGLE_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;

  if (!apiKey || !placeId) {
    console.log("[GOOGLE REVIEWS SYNC] Missing GOOGLE_PLACES_API_KEY or GOOGLE_PLACE_ID. Skipping native Google Reviews sync.");
    return;
  }

  console.log(`[GOOGLE REVIEWS SYNC] Fetching reviews for Place ID: ${placeId}...`);
  try {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=reviews&key=${apiKey}&language=pt`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Google Places API responded with status ${response.status}`);
    }
    const data: any = await response.json();
    
    if (data.status !== "OK") {
      throw new Error(`Google Places API error status: ${data.status}. Details: ${data.error_message || "None"}`);
    }

    const reviews = data.result?.reviews || [];
    console.log(`[GOOGLE REVIEWS SYNC] Retrieved ${reviews.length} reviews from Google Places.`);

    let insertedCount = 0;
    for (const r of reviews) {
      const name = r.author_name || "Cliente Google";
      const text = r.text || "";
      const rating = r.rating ? parseInt(r.rating, 10) : 5;
      const product = "Avaliação Google";

      if (!text.trim()) continue;

      // Check if this testimonial already exists to avoid duplication
      const checkResult = await dbPool.query(
        `SELECT id FROM testimonials WHERE name = $1 AND text = $2 AND rating = $3`,
        [name, text, rating]
      );

      if (checkResult.rows.length === 0) {
        await dbPool.query(
          `INSERT INTO testimonials (name, text, product, rating) VALUES ($1, $2, $3, $4)`,
          [name, text, product, rating]
        );
        insertedCount++;
      }
    }

    console.log(`[GOOGLE REVIEWS SYNC] Successfully synchronized ${insertedCount} new reviews into PostgreSQL.`);
    
    if (insertedCount > 0) {
      const updatedResult = await dbPool.query(
        `SELECT name, text, product, rating, created_at AS "createdAt" FROM testimonials ORDER BY id DESC LIMIT 100`
      );
      activeTestimonials = updatedResult.rows;
      saveTestimonials(activeTestimonials);
    }
  } catch (err: any) {
    console.error("[GOOGLE REVIEWS SYNC ERROR] Failed to fetch or save Google Reviews:", err.message || err);
  }
}

initDatabase();

// Persistent file-backed Testimonials store (used as fallback)
const getTestimonialsFilePath = () => {
  const railwayPersistentDir = "/app/data";
  try {
    if (!fs.existsSync(railwayPersistentDir)) {
      fs.mkdirSync(railwayPersistentDir, { recursive: true });
    }
    return path.join(railwayPersistentDir, "testimonials.json");
  } catch (e) {
    return path.join(process.cwd(), "testimonials.json");
  }
};

const TESTIMONIALS_FILE = getTestimonialsFilePath();

function loadTestimonials() {
  if (fs.existsSync(TESTIMONIALS_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(TESTIMONIALS_FILE, 'utf8'));
      if (Array.isArray(data)) return data;
    } catch (err) {
      console.error("[TESTIMONIALS DATABASE ERROR] Failed to load testimonials.json", err);
    }
  }
  return [];
}

function saveTestimonials(list: any[]) {
  try {
    fs.writeFileSync(TESTIMONIALS_FILE, JSON.stringify(list, null, 2), 'utf8');
  } catch (err) {
    console.error("[TESTIMONIALS DATABASE ERROR] Failed to save testimonials.json", err);
  }
}

let activeTestimonials = loadTestimonials();

// Testimonials Endpoints with Direct database sync + fallback
app.get("/api/testimonials", async (req, res) => {
  try {
    const result = await dbPool.query(
      `SELECT name, text, product, rating, created_at AS "createdAt" FROM testimonials ORDER BY id DESC LIMIT 100`
    );
    res.json(result.rows);
  } catch (err) {
    console.error("[DATABASE READ ERROR] Falling back to file storage.", err);
    res.json(activeTestimonials);
  }
});

app.post("/api/testimonials", async (req, res) => {
  try {
    const { name, text, product, rating } = req.body;
    if (!name || !text) {
      return res.status(400).json({ error: "Name and comment are required." });
    }
    const cleanRating = rating ? parseInt(rating, 10) : 5;
    const cleanProduct = product || "";

    try {
      const result = await dbPool.query(
        `INSERT INTO testimonials (name, text, product, rating) VALUES ($1, $2, $3, $4) RETURNING name, text, product, rating, created_at AS "createdAt"`,
        [name, text, cleanProduct, cleanRating]
      );
      res.json({ success: true, testimonial: result.rows[0] });
    } catch (dbErr) {
      console.error("[DATABASE WRITE ERROR] Falling back to file storage.", dbErr);
      const testimonial = {
        name,
        text,
        product: cleanProduct,
        rating: cleanRating,
        createdAt: new Date().toISOString()
      };
      activeTestimonials.unshift(testimonial); // Add newest first
      saveTestimonials(activeTestimonials);
      res.json({ success: true, testimonial });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});


// Configure Vite middleware in development or serve production build
async function startServer() {
  const isProduction = process.env.NODE_ENV === "production" || 
                       !!process.env.RAILWAY_ENVIRONMENT || 
                       process.env.CF_PAGES === "1";

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    const indexPath = path.join(distPath, 'index.html');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(200).send(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>MBravo API Server</title>
              <style>
                body { font-family: sans-serif; text-align: center; padding: 50px; background: #0f172a; color: #f8fafc; }
                h1 { color: #38bdf8; }
                p { color: #94a3b8; }
              </style>
            </head>
            <body>
              <h1>MBravo API Engine</h1>
              <p>The backend API server is running successfully on Railway!</p>
              <p>The client application is hosted on Cloudflare Pages.</p>
            </body>
          </html>
        `);
      }
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[M.BRAVO SERVER] Fullstack engine running on port ${PORT}`);
  });
}

startServer();
