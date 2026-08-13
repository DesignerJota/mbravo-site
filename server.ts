import express from "express";
import path from "path";
import fs from "fs";
import dns from "dns";

try {
  dns.setDefaultResultOrder("ipv4first");
} catch (e) {
  // Graceful fallback for older engines
}

import { createServer as createViteServer } from "vite";
import { 
  sendTransactionEmails, 
  sendMultibancoEmails, 
  sendShippedEmails, 
  sendAtelierNotificationOnly, 
  generateShippedEmailHtml, 
  generateAdminEmailHtml, 
  generateCustomerEmailHtml, 
  generateMultibancoEmailHtml, 
  OrderData 
} from "./src/lib/emailService";
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

// CORS Middleware to allow requests from https://mbravobycarolina.com and any frontend domain
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
  } else {
    res.setHeader("Access-Control-Allow-Origin", "https://mbravobycarolina.com");
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, Accept, X-Admin-Password, X-Requested-With");

  // CABEÇALHOS DE SEGURANÇA E PROTEÇÃO (TICKET 1.2)
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://cdn.jsdelivr.net; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com data:; " +
    "img-src 'self' data: blob: https:; " +
    "connect-src 'self' https://api.stripe.com https://maps.googleapis.com wss: https:; " +
    "frame-src 'self' https://js.stripe.com; " +
    "object-src 'none';"
  );

  // Prevent Google and search crawlers from indexing any requests directed to the API subdomain or raw API endpoints
  const host = req.headers.host || "";
  const isApiHost = host.toLowerCase().startsWith("api.");
  const isApiRoute = req.path.startsWith("/api/");
  if (isApiHost || isApiRoute) {
    res.setHeader("X-Robots-Tag", "noindex, nofollow");
  }

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Enable JSON body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Dynamic robots.txt route protecting api.mbravobycarolina.com from search engine indexing
app.get("/robots.txt", (req, res) => {
  const host = req.headers.host || "";
  if (host.toLowerCase().startsWith("api.")) {
    res.setHeader("X-Robots-Tag", "noindex, nofollow");
    res.type("text/plain");
    return res.send("User-agent: *\nDisallow: /\nAllow: /api/v1/products/feed.xml\n");
  }
  res.type("text/plain");
  return res.send("User-agent: *\nAllow: /\nDisallow: /api/\nAllow: /api/v1/products/feed.xml\nAllow: /feed.xml\nDisallow: /admin\nSitemap: https://mbravobycarolina.com/sitemap.xml\n");
});

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

  // 1. Primary & Sovereign Read-Only Load from Volume / Persistent Store (/app/data/orders.json)
  if (fs.existsSync(ORDERS_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf8'));
      for (const [id, ord] of Object.entries(data)) {
        map.set(id, ord);
      }
      console.log(`[ORDERS DATABASE READ-ONLY BOOT] Loaded ${map.size} orders from persistent store (${ORDERS_FILE})`);
      return map;
    } catch (err) {
      console.error("[ORDERS DATABASE ERROR] Failed to load orders.json from persistent store", err);
    }
  }

  // 2. Read-Only Fallback from workspace local store ONLY if persistent file does not exist yet (NO disk write)
  const localFallbackPath = path.join(process.cwd(), "orders.json");
  if (fs.existsSync(localFallbackPath)) {
    try {
      const localData = JSON.parse(fs.readFileSync(localFallbackPath, 'utf8'));
      for (const [id, ord] of Object.entries(localData)) {
        map.set(id, ord);
      }
      console.log(`[ORDERS DATABASE FALLBACK] Read ${map.size} initial orders into memory from workspace fallback.`);
    } catch (err) {
      console.warn("[ORDERS DATABASE FALLBACK ERROR] Could not parse local workspace orders.json", err);
    }
  }

  return map;
}

function saveOrders(map: Map<string, any>) {
  try {
    // Automatically manage physical raw materials inventory and finished product stock when order status transitions to 'paid' or 'failed'
    for (const order of map.values()) {
      if (order.status === 'paid') {
        if (!order.inventoryAbated) {
          if (typeof abateInventoryForOrder === 'function') {
            abateInventoryForOrder(order);
          }
        }
        if (!order.productStockAbated) {
          if (typeof abateProductStockForOrder === 'function') {
            abateProductStockForOrder(order);
          }
        }
      } else if (order.status === 'failed') {
        if (order.inventoryAbated) {
          if (typeof restoreInventoryForOrder === 'function') {
            restoreInventoryForOrder(order);
          }
        }
        if (order.productStockAbated) {
          if (typeof restoreProductStockForOrder === 'function') {
            restoreProductStockForOrder(order);
          }
        }
      }
    }
    const obj = Object.fromEntries(map);
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(obj, null, 2), 'utf8');
  } catch (err) {
    console.error("[ORDERS DATABASE ERROR] Failed to save orders.json", err);
  }
}

const activeOrders = loadOrders();

// Helper sanitization and validation functions for strict data integrity
function sanitizeText(val: any): string {
  if (val === null || val === undefined) return "";
  return String(val).trim();
}

function sanitizeNumber(val: any, defaultVal: number = 0): number {
  if (val === null || val === undefined || val === "") return defaultVal;
  if (typeof val === "number") return isNaN(val) ? defaultVal : val;
  const clean = String(val).replace(/[^0-9.,]/g, "").replace(",", ".");
  const parsed = parseFloat(clean);
  return isNaN(parsed) ? defaultVal : parsed;
}

function formatPostalCode(val: any): string {
  if (!val) return "";
  const str = String(val).trim();
  const digits = str.replace(/\D/g, "");
  if (digits.length === 7) {
    return `${digits.slice(0, 4)}-${digits.slice(4)}`;
  }
  return str;
}

function isValidEmailStrict(email: any): boolean {
  if (!email) return false;
  const str = String(email).trim();
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(str);
}

// Serve dynamic robots.txt depending on whether the request accesses the brand site or the API subdomain
app.get("/robots.txt", (req, res) => {
  const host = req.headers.host || "";
  res.type("text/plain");
  if (host.toLowerCase().startsWith("api.")) {
    res.send("User-agent: *\nDisallow: /\n");
  } else {
    res.send("User-agent: *\nAllow: /\n");
  }
});

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

    const emailClean = sanitizeText(checkoutForm.email);
    if (!emailClean || !isValidEmailStrict(emailClean)) {
      return res.status(400).json({ error: "O e-mail fornecido é inválido. Por favor introduza um e-mail com formato válido (utilizador@dominio.com)." });
    }

    const nameClean = sanitizeText(checkoutForm.nome);
    if (!nameClean) {
      return res.status(400).json({ error: "O nome do cliente é obrigatório." });
    }

    // Generate distinctive Portuguese order code for M.BRAVO
    const orderId = `MB-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const createdAt = new Date().toISOString();

    const priceNum = sanitizeNumber(product.price, 0);

    // Determine production priority: custom sizing or quantity > 1 flags high priority
    const isCustomSize = selections?.tamanho === "Sob Medida" || selections?.tamanho === "Customizado" || !selections?.tamanho;
    const isBulk = parseInt(selections?.quantidade || "1") > 1;
    const priority = (isCustomSize || isBulk) ? "ALTA (Atelier Urgente)" : "NORMAL";

    const stripeKey = process.env.STRIPE_SECRET_KEY || "";
    const isTestMode = !stripeKey.startsWith("sk_live");

    const sanitizedCustomer = {
      nome: nameClean,
      email: emailClean,
      telefone: sanitizeText(checkoutForm.telefone).replace(/[^0-9+]/g, ""),
      morada: sanitizeText(checkoutForm.morada),
      codigoPostal: formatPostalCode(checkoutForm.codigoPostal),
      cidade: sanitizeText(checkoutForm.cidade),
      nif: sanitizeText(checkoutForm.nif).replace(/\D/g, "")
    };

    const productHasSize = (selections?.hasSize !== false) && 
                          (product?.hasSize !== false) && 
                          (product?.sizes && Array.isArray(product.sizes) && product.sizes.length > 0);

    const sanitizedSelections = {
      cor: sanitizeText(selections?.cor) || "Padrão",
      tamanho: productHasSize ? sanitizeText(selections?.tamanho) : "",
      quantidade: sanitizeText(selections?.quantidade).replace(/\D/g, "") || "1",
      hasSize: productHasSize
    };

    const order: any = {
      orderId,
      productName: sanitizeText(product.name),
      price: priceNum,
      selections: sanitizedSelections,
      customer: sanitizedCustomer,
      paymentMethod,
      status: "pending_payment",
      priority,
      createdAt,
      isTestMode,
      mbwayPhone: sanitizeText(checkoutForm.mbwayPhone).replace(/\D/g, ""),
      cardNumber: sanitizeText(checkoutForm.cardNumber).replace(/\D/g, ""),
      emailSent: false
    };

    const commonMetadata = {
      orderId,
      productName: product.name || '',
      cor: selections?.cor || '',
      tamanho: productHasSize ? (selections?.tamanho || '') : '',
      hasSize: productHasSize ? 'true' : 'false',
      quantidade: selections?.quantidade || '1',
      customerName: checkoutForm.nome || '',
      customerEmail: checkoutForm.email || '',
      customerPhone: checkoutForm.telefone || '',
      nif: checkoutForm.nif || ''
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
            metadata: commonMetadata
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
          order.status = 'failed';
          order.errorMessage = stripeErr.message || 'Erro no processamento do pagamento com o Stripe.';
        }
      } else {
        // Stripe credentials not set or missing form data
        order.status = 'failed';
        order.errorMessage = 'A gateway de pagamentos Stripe não está configurada ou faltam dados do cartão.';
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
            metadata: commonMetadata
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
            metadata: commonMetadata
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
            metadata: commonMetadata
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
        // Stripe unconfigured for wallet payments
        order.status = 'failed';
        order.errorMessage = 'A gateway de pagamentos Stripe não está configurada no servidor.';
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
          saveOrders(activeOrders);
        } else if (intent.status === 'canceled' || (intent.last_payment_error && intent.status !== 'requires_action')) {
          order.status = 'failed';
          order.errorMessage = intent.last_payment_error?.message || `Stripe payment failed with status: ${intent.status}`;
          saveOrders(activeOrders);
        }
      } catch (err: any) {
        console.error("[STRIPE STATUS POLL ERROR]", err);
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

    const productName = metadata.productName || "Peça M★BRAVO (Recuperada via Stripe)";
    const cor = metadata.cor || "Única";
    const tamanho = metadata.tamanho || "";
    const hasSize = metadata.hasSize === 'true';
    const quantidade = metadata.quantidade || "1";

    order = {
      orderId,
      productName,
      price: `${priceValue} €`,
      selections: {
        cor,
        tamanho,
        quantidade,
        hasSize
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
      priority: "NORMAL",
      createdAt: createdTime,
      stripePaymentIntentId: stripeIntentId || stripeObj.id || "",
      isTestMode: stripeObj.livemode === false,
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
 * 5.1 AUDIT LOGGING SYSTEM FOR ADMINISTRATIVE ACTIONS
 * Tracks state changes, manual order registrations, and CTT label generations.
 */
const getLogsFilePath = () => {
  const railwayPersistentDir = "/app/data";
  try {
    if (!fs.existsSync(railwayPersistentDir)) {
      fs.mkdirSync(railwayPersistentDir, { recursive: true });
    }
    return path.join(railwayPersistentDir, "audit_logs.json");
  } catch (e) {
    return path.join(process.cwd(), "audit_logs.json");
  }
};

const LOGS_FILE = getLogsFilePath();

function loadLogs(): any[] {
  if (fs.existsSync(LOGS_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(LOGS_FILE, 'utf8'));
      if (Array.isArray(data)) {
        console.log(`[LOGS DATABASE READ-ONLY BOOT] Loaded ${data.length} audit logs from persistent store (${LOGS_FILE})`);
        return data;
      }
    } catch (err) {
      console.error("[LOGS DATABASE ERROR] Failed to load audit_logs.json", err);
    }
  }

  const localFallbackPath = path.join(process.cwd(), "audit_logs.json");
  if (fs.existsSync(localFallbackPath)) {
    try {
      const localData = JSON.parse(fs.readFileSync(localFallbackPath, 'utf8'));
      if (Array.isArray(localData)) return localData;
    } catch (err) {
      console.warn("[LOGS DATABASE FALLBACK ERROR]", err);
    }
  }

  return [];
}

function saveLogs(list: any[]) {
  try {
    fs.writeFileSync(LOGS_FILE, JSON.stringify(list, null, 2), 'utf8');
  } catch (err) {
    console.error("[LOGS DATABASE ERROR] Failed to save audit_logs.json", err);
  }
}

let activeLogs = loadLogs();

function addAuditLog(event: 'state_change' | 'manual_order_creation' | 'ctt_label_generation' | 'crm_customer_update' | 'order_deletion', description: string, orderId?: string, details?: any) {
  const logEntry = {
    id: `LOG-${Math.floor(100000 + Math.random() * 900000)}`,
    timestamp: new Date().toISOString(),
    event,
    description,
    orderId,
    user: 'Carolina (Atelier)', // default admin role for the atelier
    details: details || {}
  };
  activeLogs.unshift(logEntry);
  if (activeLogs.length > 500) {
    activeLogs = activeLogs.slice(0, 500);
  }
  saveLogs(activeLogs);
  console.log(`[AUDIT LOG] [${event.toUpperCase()}] ${description}`);
}

/**
 * ATELIER CATALOG & PHYSICAL INVENTORY MANAGER (FASE 2)
 */

const getCatalogFilePath = () => {
  const railwayPersistentDir = "/app/data";
  try {
    if (!fs.existsSync(railwayPersistentDir)) {
      fs.mkdirSync(railwayPersistentDir, { recursive: true });
    }
    return path.join(railwayPersistentDir, "catalog.json");
  } catch (e) {
    return path.join(process.cwd(), "catalog.json");
  }
};

const CATALOG_FILE = getCatalogFilePath();

const OFFICIAL_PRODUCT_PRICES: { [key: string]: number } = {
  'h1': 4.00,
  'h1c': 4.00,
  'h1f': 4.00,
  'h1_classic': 4.00,
  'h2b': 40.00,
  'b1': 37.00,
  'b1b': 13.00,
  'b1_airpods': 16.00,
  'b2_sling': 47.00,
  'b2_shell': 22.00,
  'v1': 67.00,
  'v1b': 37.00,
  'v2b': 57.00,
  'v2c': 72.00,
  'alma_cardigan': 97.00,
  'mini_alma_cardigan': 57.00,
  'v3': 30.00,
  'v3b': 27.00,
  'h3': 19.00,
  'v3c': 32.00
};

const CATEGORY_IMAGE_MAPPING: Record<string, string> = {
  home: '/categories/category-casa.webp',
  bags: '/categories/category-malas.webp',
  vestuario: '/categories/category-vestuario.webp',
  premium: '/categories/category-acessorios.webp'
};

function loadCatalog() {
  let catalogData: any[] | null = null;

  if (fs.existsSync(CATALOG_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(CATALOG_FILE, 'utf8'));
      if (Array.isArray(data) && data.length > 0) {
        catalogData = data;
      }
    } catch (err) {
      console.error("[CATALOG DATABASE ERROR] Failed to load catalog.json", err);
    }
  }

  if (!catalogData) {
    const localFallbackPath = path.join(process.cwd(), "catalog.json");
    if (fs.existsSync(localFallbackPath)) {
      try {
        const localData = JSON.parse(fs.readFileSync(localFallbackPath, 'utf8'));
        if (Array.isArray(localData) && localData.length > 0) catalogData = localData;
      } catch (err) {
        console.warn("[CATALOG DATABASE FALLBACK ERROR]", err);
      }
    }
  }

  if (catalogData) {
    let updated = false;
    for (const cat of catalogData) {
      if (CATEGORY_IMAGE_MAPPING[cat.id]) {
        const expectedImage = CATEGORY_IMAGE_MAPPING[cat.id];
        if (cat.image !== expectedImage || cat.img) {
          cat.image = expectedImage;
          delete cat.img;
          updated = true;
        }
      }

      if (!cat.products || !Array.isArray(cat.products)) continue;
      for (const prod of cat.products) {
        const targetPrice = OFFICIAL_PRODUCT_PRICES[prod.id];
        if (targetPrice !== undefined) {
          const formattedTarget = `${targetPrice}€`;
          if (prod.price !== targetPrice && prod.price !== formattedTarget) {
            prod.price = formattedTarget;
            updated = true;
          }
        }
      }
    }
    if (updated && fs.existsSync(CATALOG_FILE)) {
      try {
        fs.writeFileSync(CATALOG_FILE, JSON.stringify(catalogData, null, 2), 'utf8');
        console.log("[CATALOG DATABASE] Updated category images & product prices in catalog.json store");
      } catch (e) {}
    }
  }

  return catalogData;
}

function saveCatalog(catalog: any[]) {
  try {
    fs.writeFileSync(CATALOG_FILE, JSON.stringify(catalog, null, 2), 'utf8');
  } catch (err) {
    console.error("[CATALOG DATABASE ERROR] Failed to save catalog.json", err);
  }
}

const getInventoryFilePath = () => {
  const railwayPersistentDir = "/app/data";
  try {
    if (!fs.existsSync(railwayPersistentDir)) {
      fs.mkdirSync(railwayPersistentDir, { recursive: true });
    }
    return path.join(railwayPersistentDir, "inventory.json");
  } catch (e) {
    return path.join(process.cwd(), "inventory.json");
  }
};

const INVENTORY_FILE = getInventoryFilePath();

const DEFAULT_INVENTORY = [
  // Linha DROPS Safran (Total: 37 novelos) - Encomenda #18241
  { id: 'rm_safran_18_natural', name: 'DROPS Safran 18 (Natural)', quantity: 10.0, unit: 'novelos', minSafety: 3.0 },
  { id: 'rm_safran_17_branco', name: 'DROPS Safran 17 (Branco)', quantity: 8.0, unit: 'novelos', minSafety: 2.0 },
  { id: 'rm_safran_68_cafe', name: 'DROPS Safran 68 (Café)', quantity: 5.0, unit: 'novelos', minSafety: 2.0 },
  { id: 'rm_safran_01_rosa_deserto', name: 'DROPS Safran 01 (Rosa do Deserto)', quantity: 3.0, unit: 'novelos', minSafety: 1.0 },
  { id: 'rm_safran_78_verde_floresta', name: 'DROPS Safran 78 (Verde Floresta)', quantity: 3.0, unit: 'novelos', minSafety: 1.0 },
  { id: 'rm_safran_60_verde_musgo', name: 'DROPS Safran 60 (Verde Musgo)', quantity: 3.0, unit: 'novelos', minSafety: 1.0 },
  { id: 'rm_safran_73_azul_cobalto', name: 'DROPS Safran 73 (Azul Cobalto)', quantity: 3.0, unit: 'novelos', minSafety: 1.0 },
  { id: 'rm_safran_50_menta', name: 'DROPS Safran 50 (Menta)', quantity: 3.0, unit: 'novelos', minSafety: 1.0 },
  { id: 'rm_safran_19_vermelho', name: 'DROPS Safran 19 (Vermelho)', quantity: 1.0, unit: 'novelos', minSafety: 1.0 },
  { id: 'rm_safran_76_azul_po', name: 'DROPS Safran 76 (Azul Pó)', quantity: 5.0, unit: 'novelos', minSafety: 2.0 },

  // Linha DROPS Paris (Total: 58 novelos) - Encomenda #18241
  { id: 'rm_paris_16_branco', name: 'DROPS Paris 16 (Branco)', quantity: 10.0, unit: 'novelos', minSafety: 3.0 },
  { id: 'rm_paris_17_natural', name: 'DROPS Paris 17 (Natural)', quantity: 5.0, unit: 'novelos', minSafety: 2.0 },
  { id: 'rm_paris_43_verde', name: 'DROPS Paris 43 (Verde)', quantity: 5.0, unit: 'novelos', minSafety: 2.0 },
  { id: 'rm_paris_25_verde_musgo', name: 'DROPS Paris 25 (Verde Musgo)', quantity: 5.0, unit: 'novelos', minSafety: 2.0 },
  { id: 'rm_paris_48_petroleo', name: 'DROPS Paris 48 (Petróleo)', quantity: 5.0, unit: 'novelos', minSafety: 2.0 },
  { id: 'rm_paris_76_azul_ternura', name: 'DROPS Paris 76 (Azul Ternura)', quantity: 5.0, unit: 'novelos', minSafety: 2.0 },
  { id: 'rm_paris_57_rosa_clarissimo', name: 'DROPS Paris 57 (Rosa Claríssimo)', quantity: 5.0, unit: 'novelos', minSafety: 2.0 },
  { id: 'rm_paris_35_baunilha', name: 'DROPS Paris 35 (Baunilha)', quantity: 5.0, unit: 'novelos', minSafety: 2.0 },
  { id: 'rm_paris_19_amarelo_claro', name: 'DROPS Paris 19 (Amarelo Claro)', quantity: 5.0, unit: 'novelos', minSafety: 2.0 },
  { id: 'rm_paris_44_castanho', name: 'DROPS Paris 44 (Castanho)', quantity: 5.0, unit: 'novelos', minSafety: 2.0 },
  { id: 'rm_paris_12_vermelho', name: 'DROPS Paris 12 (Vermelho)', quantity: 5.0, unit: 'novelos', minSafety: 2.0 },
  { id: 'rm_paris_15_preto', name: 'DROPS Paris 15 (Preto)', quantity: 3.0, unit: 'novelos', minSafety: 1.0 },

  // Acessórios e Embalagem
  { id: 'rm_fecho_correr', name: 'Fecho de Correr (Zipper)', quantity: 45.0, unit: 'unidades', minSafety: 10.0 },
  { id: 'rm_botao_madeira', name: 'Botão de Madeira M★BRAVO', quantity: 60.0, unit: 'unidades', minSafety: 15.0 },
  { id: 'rm_forro_tecido', name: 'Tecido para Forro (Algodão)', quantity: 20.0, unit: 'metros', minSafety: 5.0 },
  { id: 'rm_caixa_embalamento', name: 'Caixa de Embalamento Premium', quantity: 50.0, unit: 'unidades', minSafety: 12.0 },
  { id: 'rm_etiqueta_couro', name: 'Etiqueta em Couro M★BRAVO', quantity: 100.0, unit: 'unidades', minSafety: 20.0 },
  { id: 're_saco_envelope', name: 'Saco Envelope Personalizado M★BRAVO', quantity: 50.0, unit: 'unidades', minSafety: 10.0 }
];

function loadInventory() {
  let list: any[] = [];
  let loadedFromStore = false;

  // 1. Primary Read from Persistent Volume /app/data/inventory.json
  if (fs.existsSync(INVENTORY_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(INVENTORY_FILE, 'utf8'));
      if (Array.isArray(data) && data.length > 0) {
        list = data;
        loadedFromStore = true;
      }
    } catch (err) {
      console.error("[INVENTORY DATABASE ERROR] Failed to load inventory.json from persistent store", err);
    }
  }

  // 2. Fallback read from local workspace file if persistent store does not exist yet
  if (!loadedFromStore) {
    const localFallbackPath = path.join(process.cwd(), "inventory.json");
    if (fs.existsSync(localFallbackPath)) {
      try {
        const fileData = JSON.parse(fs.readFileSync(localFallbackPath, 'utf8'));
        if (Array.isArray(fileData) && fileData.length > 0) {
          list = fileData;
          loadedFromStore = true;
        }
      } catch (e) {
        // ignore
      }
    }
  }

  // 3. If neither file exists, initialize with DEFAULT_INVENTORY
  if (!loadedFromStore) {
    list = DEFAULT_INVENTORY.map(item => ({ ...item }));
    saveInventory(list);
    console.log(`[INVENTORY DATABASE INITIALIZED] Initialized ${list.length} inventory items to persistent store (${INVENTORY_FILE})`);
    return list;
  }

  let modified = false;

  // 3.5 SANITIZATION: Purge any obsolete legacy cotton yarn items (e.g. rm_fio_algodao, algodão cru, cacau escuro)
  const lenBefore = list.length;
  list = list.filter((item: any) => {
    const id = (item.id || '').toLowerCase();
    const name = (item.name || '').toLowerCase();
    return !id.includes('fio_algodao') && !name.includes('algodão cru') && !name.includes('cacau escuro');
  });
  if (list.length !== lenBefore) {
    modified = true;
    console.log(`[INVENTORY SANITIZATION] Removed ${lenBefore - list.length} legacy raw materials from persistent store.`);
  }

  // 4. SMART UPSERT: Check if any raw material declared in DEFAULT_INVENTORY is missing from list
  const existingIds = new Set(list.map((item: any) => item.id).filter(Boolean));
  const existingNames = new Set(list.map((item: any) => (item.name || '').toLowerCase().trim()).filter(Boolean));

  for (const defaultItem of DEFAULT_INVENTORY) {
    const normName = (defaultItem.name || '').toLowerCase().trim();
    const hasId = existingIds.has(defaultItem.id);
    const hasName = existingNames.has(normName);

    if (!hasId && !hasName) {
      list.push({ ...defaultItem });
      existingIds.add(defaultItem.id);
      existingNames.add(normName);
      modified = true;
      console.log(`[INVENTORY SMART UPSERT] Automatically added missing raw material '${defaultItem.name}' (${defaultItem.id}) to persistent store (${INVENTORY_FILE})`);
    }
  }

  if (modified) {
    saveInventory(list);
    console.log(`[INVENTORY SMART UPSERT COMPLETE] Preserved existing stock and saved updated ${list.length} items to ${INVENTORY_FILE}`);
  } else {
    console.log(`[INVENTORY DATABASE READ-ONLY BOOT] Loaded ${list.length} inventory items from persistent store (${INVENTORY_FILE})`);
  }

  return list;
}

function saveInventory(list: any[]) {
  try {
    fs.writeFileSync(INVENTORY_FILE, JSON.stringify(list, null, 2), 'utf8');
  } catch (err) {
    console.error("[INVENTORY DATABASE ERROR] Failed to save inventory.json", err);
  }
}

function getProductCustomConsumption(productName: string, selectedColor: string): number | null {
  try {
    const catalogData = loadCatalog();
    if (!catalogData || !Array.isArray(catalogData)) return null;
    
    const normProdName = (productName || '').toLowerCase().trim();
    const normColor = (selectedColor || '').toLowerCase().trim();

    for (const cat of catalogData) {
      if (!cat.products || !Array.isArray(cat.products)) continue;
      for (const prod of cat.products) {
        const prodName = (prod.name || prod.title || '').toLowerCase().trim();
        if (prodName && (prodName === normProdName || normProdName.includes(prodName) || prodName.includes(normProdName))) {
          const map = prod.colorConsumptions || prod.colorConsumption;
          if (map && typeof map === 'object') {
            for (const [colorKey, val] of Object.entries(map)) {
              if (typeof val === 'number' && !isNaN(val)) {
                const normKey = colorKey.toLowerCase().trim();
                if (normKey === normColor || (normColor && normKey && (normColor.includes(normKey) || normKey.includes(normColor)))) {
                  return val;
                }
              }
            }
          }
        }
      }
    }
  } catch (err) {
    console.error("[CATALOG CONSUMPTION LOOKUP ERROR]", err);
  }
  return null;
}

function getMaterialsNeededForProduct(productName: string, selections: any = {}) {
  const nameLower = (productName || '').toLowerCase();
  const quantity = parseInt(selections.quantidade || "1", 10) || 1;
  
  // Determine colors
  let primColor = (selections.corPrincipal || '').trim();
  let detColor = (selections.corDetalhe || '').trim();
  let fullColor = (selections.cor || selections.corFio || '').trim();

  // If fullColor contains '&' or ' e ' or ' / ' or ' + ' and primColor/detColor are not set:
  if (!primColor && !detColor && fullColor) {
    const parts = fullColor.split(/&| e |\/|\+/i).map((s: string) => s.trim()).filter(Boolean);
    if (parts.length >= 2) {
      primColor = parts[0];
      detColor = parts[1];
    } else {
      primColor = fullColor;
    }
  } else if (!primColor && fullColor) {
    primColor = fullColor;
  }

  const isBicolor = Boolean(primColor && detColor && primColor.toLowerCase() !== detColor.toLowerCase());

  const materials: { id: string; quantityNeeded: number }[] = [];
  
  // Helper to resolve yarn bobbin ID by color name
  function getYarnIdForColor(colorName: string) {
    const norm = (colorName || '').toLowerCase().trim();
    if (!norm) return 'rm_safran_18_natural';
    if (norm.startsWith('rm_')) return norm;

    // Direct lookup in loadInventory() by exact id or name matching
    try {
      const invData = loadInventory();
      if (Array.isArray(invData)) {
        const exactItem = invData.find((i: any) => {
          if (!i || !i.id || !i.name) return false;
          const iId = i.id.toLowerCase();
          const iName = i.name.toLowerCase();
          return iId === norm || iName === norm || norm.includes(iId) || norm.includes(iName);
        });
        if (exactItem) return exactItem.id;
      }
    } catch (e) {
      // ignore
    }
    
    // DROPS Paris Specific Checks
    if (norm.includes('baunilha') || norm.includes('vanilla') || norm.includes('35')) return 'rm_paris_35_baunilha';
    if (norm.includes('amarelo claro') || norm.includes('light yellow') || (norm.includes('19') && norm.includes('amarelo'))) return 'rm_paris_19_amarelo_claro';
    if (norm.includes('paris 17') || (norm.includes('natural') && norm.includes('paris'))) return 'rm_paris_17_natural';
    if (norm.includes('paris 16') || (norm.includes('branco') && norm.includes('paris'))) return 'rm_paris_16_branco';
    if (norm.includes('paris 43') || (norm.includes('verde') && !norm.includes('musgo') && !norm.includes('floresta') && !norm.includes('menta') && !norm.includes('safran'))) return 'rm_paris_43_verde';
    if (norm.includes('paris 25') || (norm.includes('musgo') && !norm.includes('safran'))) return 'rm_paris_25_verde_musgo';
    if (norm.includes('48') || norm.includes('petróleo') || norm.includes('petroleo')) return 'rm_paris_48_petroleo';
    if (norm.includes('76') && norm.includes('ternura')) return 'rm_paris_76_azul_ternura';
    if (norm.includes('57') || norm.includes('claríssimo') || norm.includes('clarissimo')) return 'rm_paris_57_rosa_clarissimo';
    if (norm.includes('44') || norm.includes('castanho') || norm.includes('cacau')) return 'rm_paris_44_castanho';
    if (norm.includes('paris 12') || (norm.includes('vermelho') && norm.includes('paris'))) return 'rm_paris_12_vermelho';
    if (norm.includes('15') || norm.includes('preto')) return 'rm_paris_15_preto';

    // DROPS Safran Specific Checks
    if (norm.includes('68') || norm.includes('café') || norm.includes('cafe')) return 'rm_safran_68_cafe';
    if (norm.includes('01') || norm.includes('deserto')) return 'rm_safran_01_rosa_deserto';
    if (norm.includes('78') || norm.includes('floresta')) return 'rm_safran_78_verde_floresta';
    if (norm.includes('60') || (norm.includes('musgo') && norm.includes('safran'))) return 'rm_safran_60_verde_musgo';
    if (norm.includes('73') || norm.includes('cobalto')) return 'rm_safran_73_azul_cobalto';
    if (norm.includes('50') || norm.includes('menta')) return 'rm_safran_50_menta';
    if (norm.includes('safran 19') || (norm.includes('vermelho') && norm.includes('safran'))) return 'rm_safran_19_vermelho';
    if (norm.includes('safran 76') || norm.includes('azul pó') || norm.includes('azul po')) return 'rm_safran_76_azul_po';
    if (norm.includes('safran 17') || (norm.includes('branco') && norm.includes('safran'))) return 'rm_safran_17_branco';
    if (norm.includes('safran 18') || (norm.includes('natural') && norm.includes('safran'))) return 'rm_safran_18_natural';

    // General Fallbacks
    if (norm.includes('musgo')) return 'rm_paris_25_verde_musgo';
    if (norm.includes('vermelho')) return 'rm_paris_12_vermelho';
    if (norm.includes('branco')) return 'rm_paris_16_branco';
    if (norm.includes('natural') || norm.includes('cru')) return 'rm_safran_18_natural';
    if (norm.includes('verde')) return 'rm_paris_43_verde';

    return 'rm_safran_18_natural';
  }

  // Helper to resolve zipper ID matching piece color
  function getZipperIdForColor(colorName: string): string {
    const norm = (colorName || '').toLowerCase().trim();
    try {
      const invData = loadInventory();
      if (Array.isArray(invData)) {
        const zippers = invData.filter((i: any) => 
          i && i.id && i.name && (i.id.toLowerCase().includes('fecho') || i.name.toLowerCase().includes('fecho') || i.id.toLowerCase().includes('zipper'))
        );
        if (zippers.length > 0) {
          if (norm) {
            const normWords = norm.split(/[\s,()/]+/).filter(w => w.length > 2 && !['drops', 'safran', 'paris', '100%'].includes(w));
            const colorMatch = zippers.find((z: any) => {
              const zId = z.id.toLowerCase();
              const zName = z.name.toLowerCase();
              return normWords.some(w => zId.includes(w) || zName.includes(w));
            });
            if (colorMatch) return colorMatch.id;
          }
          const base = zippers.find((z: any) => z.id === 'rm_fecho_correr') || zippers[0];
          return base.id;
        }
      }
    } catch (e) {
      // ignore
    }
    return 'rm_fecho_correr';
  }

  // Helper to resolve lining ID matching piece color
  function getLiningIdForColor(colorName: string): string {
    const norm = (colorName || '').toLowerCase().trim();
    try {
      const invData = loadInventory();
      if (Array.isArray(invData)) {
        const linings = invData.filter((i: any) => 
          i && i.id && i.name && (i.id.toLowerCase().includes('forro') || i.name.toLowerCase().includes('forro'))
        );
        if (linings.length > 0) {
          if (norm) {
            const normWords = norm.split(/[\s,()/]+/).filter(w => w.length > 2 && !['drops', 'safran', 'paris', '100%'].includes(w));
            const colorMatch = linings.find((l: any) => {
              const lId = l.id.toLowerCase();
              const lName = l.name.toLowerCase();
              return normWords.some(w => lId.includes(w) || lName.includes(w));
            });
            if (colorMatch) return colorMatch.id;
          }
          const base = linings.find((l: any) => l.id === 'rm_forro_tecido') || linings[0];
          return base.id;
        }
      }
    } catch (e) {
      // ignore
    }
    return 'rm_forro_tecido';
  }

  // Check if product has explicit custom color consumption specified in catalog.json
  const customConsumption = getProductCustomConsumption(productName, fullColor || primColor);

  let totalYarnNeeded = 1.0;
  let hasZipper = false;
  let hasLining = false;
  let hasButton = false;

  if (customConsumption !== null) {
    totalYarnNeeded = customConsumption;
  } else if (nameLower.includes('african flower pouch')) {
    totalYarnNeeded = 0.15;
    hasZipper = true;
    hasLining = true;
  } else if (nameLower.includes('mini pouches') || nameLower.includes('mini pouch')) {
    totalYarnNeeded = 0.08;
    hasZipper = true;
  } else if (nameLower.includes('mini shell pouch')) {
    totalYarnNeeded = 0.10;
    hasButton = true;
  } else if (nameLower.includes('airpods case')) {
    totalYarnNeeded = 0.05;
  } else if (nameLower.includes('daisy coasters') || nameLower.includes('coasters') || nameLower.includes('coaster')) {
    totalYarnNeeded = 0.07;
  } else if (nameLower.includes('bikini') || nameLower.includes('top')) {
    totalYarnNeeded = 0.30;
  } else if (nameLower.includes('cardigan') || nameLower.includes('poncho')) {
    totalYarnNeeded = 1.20;
  } else if (nameLower.includes('bandana') || nameLower.includes('headband')) {
    totalYarnNeeded = 0.20;
  }

  // Add yarn materials
  if (nameLower.includes('daisy coasters')) {
    materials.push({ id: 'rm_safran_17_branco', quantityNeeded: 0.05 * quantity });
    materials.push({ id: 'rm_safran_18_natural', quantityNeeded: 0.02 * quantity });
  } else if (isBicolor) {
    const mainYarnId = getYarnIdForColor(primColor);
    const detailYarnId = getYarnIdForColor(detColor);

    if (mainYarnId === detailYarnId) {
      materials.push({ id: mainYarnId, quantityNeeded: parseFloat((totalYarnNeeded * quantity).toFixed(2)) });
    } else {
      // 70% main color, 30% detail color
      const mainQty = parseFloat((totalYarnNeeded * 0.70 * quantity).toFixed(2));
      const detQty = parseFloat((totalYarnNeeded * 0.30 * quantity).toFixed(2));
      materials.push({ id: mainYarnId, quantityNeeded: Math.max(0.01, mainQty) });
      materials.push({ id: detailYarnId, quantityNeeded: Math.max(0.01, detQty) });
    }
  } else {
    const yarnId = getYarnIdForColor(primColor || fullColor);
    materials.push({ id: yarnId, quantityNeeded: parseFloat((totalYarnNeeded * quantity).toFixed(2)) });
  }

  // Add accessories based on selections.accessories -> catalogAcc -> smart fallbacks
  let catalogAcc: any = null;
  try {
    const catalogData = loadCatalog();
    if (catalogData && Array.isArray(catalogData)) {
      const normProdName = (productName || '').toLowerCase().trim();
      for (const cat of catalogData) {
        if (!cat.products || !Array.isArray(cat.products)) continue;
        for (const prod of cat.products) {
          const pName = (prod.name || prod.title || '').toLowerCase().trim();
          if (pName && (pName === normProdName || normProdName.includes(pName) || pName.includes(normProdName))) {
            if (prod.accessories && typeof prod.accessories === 'object') {
              catalogAcc = prod.accessories;
              break;
            }
          }
        }
        if (catalogAcc) break;
      }
    }
  } catch (e) {
    // lookup fallback
  }

  const customAcc = selections?.accessories || catalogAcc || {};

  const wantZipper = customAcc.fecho !== undefined ? Boolean(customAcc.fecho) : hasZipper;
  const wantLining = customAcc.forro !== undefined ? Boolean(customAcc.forro) : hasLining;
  const wantButton = customAcc.botao !== undefined ? Boolean(customAcc.botao) : hasButton;
  const wantEtiqueta = customAcc.etiqueta !== undefined ? Boolean(customAcc.etiqueta) : !nameLower.includes('digital');
  const wantCaixa = customAcc.caixa !== undefined ? Boolean(customAcc.caixa) : !nameLower.includes('digital');
  const wantSaco = customAcc.sacoEnvelope !== undefined ? Boolean(customAcc.sacoEnvelope) : (customAcc.saco !== undefined ? Boolean(customAcc.saco) : (customAcc.envelope !== undefined ? Boolean(customAcc.envelope) : false));

  const pieceColor = primColor || fullColor || '';

  if (wantZipper) {
    const zipperId = getZipperIdForColor(pieceColor);
    const qtyPerPiece = customAcc.fechoQty && !isNaN(parseFloat(customAcc.fechoQty)) ? Math.max(1, parseFloat(customAcc.fechoQty)) : 1;
    materials.push({ id: zipperId, quantityNeeded: qtyPerPiece * quantity });
  }
  if (wantLining) {
    const liningId = getLiningIdForColor(pieceColor);
    const metersPerPiece = customAcc.forroMeters && !isNaN(parseFloat(customAcc.forroMeters)) 
      ? Math.max(0.01, parseFloat(customAcc.forroMeters)) 
      : (customAcc.forroConsumo && !isNaN(parseFloat(customAcc.forroConsumo)) ? Math.max(0.01, parseFloat(customAcc.forroConsumo)) : 0.25);
    materials.push({ id: liningId, quantityNeeded: parseFloat((metersPerPiece * quantity).toFixed(3)) });
  }
  if (wantButton) {
    const qtyPerPiece = customAcc.botaoQty && !isNaN(parseFloat(customAcc.botaoQty)) ? Math.max(1, parseFloat(customAcc.botaoQty)) : 1;
    materials.push({ id: 'rm_botao_madeira', quantityNeeded: qtyPerPiece * quantity });
  }
  if (wantEtiqueta) {
    const qtyPerPiece = customAcc.etiquetaQty && !isNaN(parseFloat(customAcc.etiquetaQty)) ? Math.max(1, parseFloat(customAcc.etiquetaQty)) : 1;
    materials.push({ id: 'rm_etiqueta_couro', quantityNeeded: qtyPerPiece * quantity });
  }
  if (wantCaixa) {
    const qtyPerPiece = customAcc.caixaQty && !isNaN(parseFloat(customAcc.caixaQty)) ? Math.max(1, parseFloat(customAcc.caixaQty)) : 1;
    materials.push({ id: 'rm_caixa_embalamento', quantityNeeded: qtyPerPiece * quantity });
  }
  if (wantSaco) {
    const qtyPerPiece = customAcc.sacoEnvelopeQty && !isNaN(parseFloat(customAcc.sacoEnvelopeQty)) 
      ? Math.max(1, parseFloat(customAcc.sacoEnvelopeQty)) 
      : (customAcc.sacoQty && !isNaN(parseFloat(customAcc.sacoQty)) ? Math.max(1, parseFloat(customAcc.sacoQty)) : 1);
    materials.push({ id: 're_saco_envelope', quantityNeeded: qtyPerPiece * quantity });
  }
  
  return materials;
}

function abateInventoryForOrder(order: any) {
  if (!order || order.inventoryAbated) return;
  
  console.log(`[INVENTORY] Deducting raw materials for order ${order.orderId} (${order.productName})`);
  const inventoryList = loadInventory();
  const needed = getMaterialsNeededForProduct(order.productName, order.selections);
  const alerts: string[] = [];
  
  needed.forEach(item => {
    const rawMaterial = inventoryList.find(rm => rm.id === item.id);
    if (rawMaterial) {
      const oldQty = rawMaterial.quantity;
      rawMaterial.quantity = Math.max(0, parseFloat((rawMaterial.quantity - item.quantityNeeded).toFixed(2)));
      console.log(` - ${rawMaterial.name}: ${oldQty} -> ${rawMaterial.quantity} ${rawMaterial.unit} (deducted ${item.quantityNeeded})`);
      
      if (rawMaterial.quantity < rawMaterial.minSafety) {
        alerts.push(`${rawMaterial.name} está abaixo do limite de segurança (${rawMaterial.quantity} ${rawMaterial.unit} restante, mínimo: ${rawMaterial.minSafety})`);
      }
    }
  });
  
  saveInventory(inventoryList);
  order.inventoryAbated = true;
  
  addAuditLog(
    'state_change',
    `Matérias-primas deduzidas automaticamente para a encomenda ${order.orderId}. ` + 
    (alerts.length > 0 ? `⚠️ ALERTA DE STOCK: ${alerts.join("; ")}` : `Stock atualizado com sucesso.`),
    order.orderId,
    { needed, alerts }
  );
}

function restoreInventoryForOrder(order: any) {
  if (!order || !order.inventoryAbated) return;
  
  console.log(`[INVENTORY] Restoring raw materials for order ${order.orderId} (${order.productName})`);
  const inventoryList = loadInventory();
  const needed = getMaterialsNeededForProduct(order.productName, order.selections);
  
  needed.forEach(item => {
    const rawMaterial = inventoryList.find(rm => rm.id === item.id);
    if (rawMaterial) {
      const oldQty = rawMaterial.quantity;
      rawMaterial.quantity = parseFloat((rawMaterial.quantity + item.quantityNeeded).toFixed(2));
      console.log(` - ${rawMaterial.name}: ${oldQty} -> ${rawMaterial.quantity} ${rawMaterial.unit} (restored ${item.quantityNeeded})`);
    }
  });
  
  saveInventory(inventoryList);
  order.inventoryAbated = false;
  
  addAuditLog(
    'state_change',
    `Matérias-primas repostas no inventário devido ao cancelamento da encomenda ${order.orderId}.`,
    order.orderId,
    { needed }
  );
}

function abateProductStockForOrder(order: any) {
  if (!order || order.productStockAbated) return;
  const catalog = loadCatalog();
  if (!catalog) return;

  let updated = false;
  for (const category of catalog) {
    if (category.products) {
      for (const prod of category.products) {
        if (prod.name.toLowerCase() === order.productName.toLowerCase()) {
          if (prod.stock !== undefined && prod.stock !== null && prod.stock > 0) {
            // Determine quantity ordered
            const qty = parseInt(order.selections?.quantidade || "1") || 1;
            const oldStock = prod.stock;
            prod.stock = Math.max(0, prod.stock - qty);
            console.log(`[FINISHED PRODUCT STOCK] Abated stock for ${prod.name}: ${oldStock} -> ${prod.stock}`);
            
            addAuditLog(
              'state_change',
              `Stock do produto final '${prod.name}' reduzido de ${oldStock} para ${prod.stock} devido à encomenda paga ${order.orderId}.`,
              order.orderId
            );
            
            updated = true;
          }
        }
      }
    }
  }

  if (updated) {
    saveCatalog(catalog);
    order.productStockAbated = true;
  }
}

function restoreProductStockForOrder(order: any) {
  if (!order || !order.productStockAbated) return;
  const catalog = loadCatalog();
  if (!catalog) return;

  let updated = false;
  for (const category of catalog) {
    if (category.products) {
      for (const prod of category.products) {
        if (prod.name.toLowerCase() === order.productName.toLowerCase()) {
          if (prod.stock !== undefined && prod.stock !== null) {
            const qty = parseInt(order.selections?.quantidade || "1") || 1;
            const oldStock = prod.stock;
            prod.stock = prod.stock + qty;
            console.log(`[FINISHED PRODUCT STOCK] Restored stock for ${prod.name}: ${oldStock} -> ${prod.stock}`);
            
            addAuditLog(
              'state_change',
              `Stock do produto final '${prod.name}' restaurado de ${oldStock} para ${prod.stock} devido ao cancelamento da encomenda ${order.orderId}.`,
              order.orderId
            );
            
            updated = true;
          }
        }
      }
    }
  }

  if (updated) {
    saveCatalog(catalog);
    order.productStockAbated = false;
  }
}

// --- CMS & Inventory Endpoints ---
function generateGoogleMerchantXmlFeed(): string {
  const catalog = loadCatalog() || [];
  const baseUrl = "https://mbravobycarolina.com";
  
  let itemsXml = "";
  
  for (const category of catalog) {
    if (!category.products || !Array.isArray(category.products)) continue;
    
    for (const prod of category.products) {
      if (!prod || !prod.name) continue;
      
      const rawId = String(prod.id || prod.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
      const prodId = rawId.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const title = String(prod.name).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const rawDesc = prod.description || `Peça artesanal M★BRAVO ${prod.name} feita à mão com amor e precisão.`;
      const description = String(rawDesc).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      
      const officialPrice = OFFICIAL_PRODUCT_PRICES[prod.id] || OFFICIAL_PRODUCT_PRICES[rawId];
      const priceNum = officialPrice !== undefined ? officialPrice : (typeof prod.price === 'number' ? prod.price : parseFloat(String(prod.price || '0').replace(/[^0-9.,]/g, '').replace(',', '.')) || 0);
      const priceFormatted = `${priceNum.toFixed(2)} EUR`;
      
      let imageUrl = prod.img || `/hero-bg-1-desktop.webp`;
      if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
        if (!imageUrl.startsWith('/')) imageUrl = `/${imageUrl}`;
        imageUrl = `${baseUrl}${imageUrl}`;
      }
      imageUrl = imageUrl.replace(/&/g, '&amp;');
      
      const isAvailable = prod.stock === undefined || prod.stock === null || (typeof prod.stock === 'number' ? prod.stock > 0 : parseInt(String(prod.stock), 10) > 0);
      const availability = isAvailable ? "in_stock" : "out_of_stock";
      const productLink = `${baseUrl}/#catalogo`;
      
      const materialXml = prod.material ? `\n      <g:material>${String(prod.material).replace(/&/g, '&amp;')}</g:material>` : '';

      itemsXml += `
    <item>
      <g:id>${prodId}</g:id>
      <g:title>${title}</g:title>
      <g:description>${description}</g:description>
      <g:link>${productLink}</g:link>
      <g:image_link>${imageUrl}</g:image_link>
      <g:price>${priceFormatted}</g:price>
      <g:availability>${availability}</g:availability>
      <g:condition>new</g:condition>
      <g:brand>M★BRAVO</g:brand>${materialXml}
      <g:google_product_category>Apparel &amp; Accessories &gt; Handbags, Wallets &amp; Cases &gt; Handbags</g:google_product_category>
    </item>`;
    }
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>M★BRAVO | Atelier &amp; Peças Únicas</title>
    <link>${baseUrl}</link>
    <description>Catálogo Oficial M★BRAVO - Peças em crochet e acessórios artesanais de luxo.</description>
    ${itemsXml}
  </channel>
</rss>`;
}

app.get(["/feed.xml", "/api/v1/products/feed.xml"], (req, res) => {
  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=3600");
  res.send(generateGoogleMerchantXmlFeed());
});

app.get("/api/catalog", (req, res) => {
  const catalog = loadCatalog();
  if (!catalog) {
    return res.json({ success: true, empty: true });
  }
  res.json({ success: true, categories: catalog });
});

app.post("/api/admin/catalog/seed", (req, res) => {
  const { categories } = req.body;
  if (!categories || !Array.isArray(categories)) {
    return res.status(400).json({ error: "Coleções inválidas para seed" });
  }
  saveCatalog(categories);
  res.json({ success: true, categories });
});

app.post("/api/admin/catalog/save", verifyAdmin, (req, res) => {
  const { categories } = req.body;
  if (!categories || !Array.isArray(categories)) {
    return res.status(400).json({ error: "Coleções inválidas" });
  }
  saveCatalog(categories);
  
  addAuditLog(
    'state_change',
    `Catálogo do Atelier atualizado no CMS (Categorias, Produtos, Preços ou Cores alterados)`
  );
  
  res.json({ success: true, categories });
});

app.get("/api/inventory", (req, res) => {
  const list = loadInventory();
  res.json({ success: true, inventory: list });
});

app.get("/api/admin/inventory", verifyAdmin, (req, res) => {
  const list = loadInventory();
  res.json({ success: true, inventory: list });
});

app.post("/api/admin/inventory/save", verifyAdmin, (req, res) => {
  const { inventory } = req.body;
  if (!inventory || !Array.isArray(inventory)) {
    return res.status(400).json({ error: "Inventário inválido" });
  }
  saveInventory(inventory);
  
  addAuditLog(
    'state_change',
    `Inventário de matérias-primas atualizado globalmente no painel`
  );
  
  res.json({ success: true, inventory });
});

app.post("/api/admin/inventory/update", verifyAdmin, (req, res) => {
  const { materialId, quantity, minSafety, name } = req.body;
  const list = loadInventory();
  const index = list.findIndex((m: any) => m.id === materialId);
  
  if (index !== -1) {
    if (quantity !== undefined) list[index].quantity = quantity;
    if (minSafety !== undefined) list[index].minSafety = minSafety;
    if (name !== undefined) list[index].name = name;
    
    saveInventory(list);
    
    addAuditLog(
      'state_change',
      `Matéria-prima ${list[index].name} atualizada. Stock: ${list[index].quantity} ${list[index].unit}`
    );
    
    return res.json({ success: true, item: list[index] });
  }
  
  res.status(404).json({ error: "Matéria-prima não encontrada" });
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

// Endpoint to fetch all audit logs
app.get("/api/admin/logs", verifyAdmin, (req, res) => {
  const currentLogs = loadLogs();
  activeLogs = currentLogs;
  res.json({ success: true, logs: activeLogs });
});

// Endpoint to generate and return HTML email previews directly for Admin Modal
app.get("/api/admin/orders/:orderId/email-preview", verifyAdmin, (req, res) => {
  const { orderId } = req.params;
  const type = (req.query.type as string) || 'shipped'; // 'shipped' | 'customer' | 'admin' | 'multibanco'

  // Reload current orders to guarantee freshness
  const currentOrders = loadOrders();
  const order = currentOrders.get(orderId) || activeOrders.get(orderId);

  if (!order) {
    return res.status(404).json({ error: "Encomenda não encontrada no sistema" });
  }

  try {
    let html = '';
    let title = '';

    if (type === 'shipped') {
      const code = order.trackingCode || "DA123456789PT";
      html = generateShippedEmailHtml(order, code);
      title = `E-mail de Expedição CTT - ${order.orderId}`;
    } else if (type === 'admin') {
      html = generateAdminEmailHtml(order);
      title = `Notificação do Atelier - ${order.orderId}`;
    } else if (type === 'multibanco') {
      const ref = order.multibancoRef || { entidade: "12345", referencia: "123 456 789" };
      html = generateMultibancoEmailHtml(order, ref);
      title = `Instruções Multibanco - ${order.orderId}`;
    } else {
      // 'customer' or default receipt
      html = generateCustomerEmailHtml(order);
      title = `Recibo & Confirmação - ${order.orderId}`;
    }

    res.json({ success: true, orderId, type, title, html });
  } catch (err: any) {
    console.error("[EMAIL PREVIEW GENERATION ERROR]", err);
    res.status(500).json({ error: "Erro ao gerar a pré-visualização do e-mail" });
  }
});

// Endpoint to update an order
app.post("/api/admin/orders/update", verifyAdmin, (req, res) => {
  const { orderId, status, trackingCode, priority, selections, productName, price, customer, paymentMethod, notes, items, accessories } = req.body;
  
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

  const oldStatus = order.status;
  const oldTrackingCode = order.trackingCode;

  if (status) {
    order.status = status;
  }
  if (trackingCode !== undefined) {
    order.trackingCode = trackingCode;
  }
  if (priority) {
    order.priority = priority;
  }
  if (productName) {
    order.productName = productName;
  }
  if (price !== undefined) {
    order.price = price;
  }
  if (customer) {
    order.customer = { ...(order.customer || {}), ...customer };
  }
  if (paymentMethod) {
    order.paymentMethod = paymentMethod;
  }
  if (notes !== undefined) {
    order.notes = notes;
  }
  if (items) {
    order.items = items;
  }
  if (accessories) {
    order.accessories = accessories;
  }
  if (selections) {
    order.selections = { ...(order.selections || {}), ...selections };
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

  // Trigger audit log for status change
  if (status && status !== oldStatus) {
    addAuditLog(
      'state_change',
      `Estado da encomenda ${orderId} alterado de '${oldStatus}' para '${status}'`,
      orderId,
      { oldStatus, newStatus: status }
    );
  }

  // Trigger audit log for CTT label registration/generation
  if (trackingCode !== undefined && trackingCode !== oldTrackingCode) {
    addAuditLog(
      'ctt_label_generation',
      `Etiqueta de envio CTT registada para a encomenda ${orderId} com código ${trackingCode}`,
      orderId,
      { trackingCode }
    );
  }

  res.json({ success: true, order });
});

// Endpoint to manually register/add an order (pure local Volume/JSON storage, no PostgreSQL/external DB to prevent ENETUNREACH errors)
app.post("/api/admin/orders/create", verifyAdmin, async (req, res) => {
  const { productName, price, selections, customer, paymentMethod, status, priority, createdAt } = req.body;

  const cleanCustomerNome = sanitizeText(customer?.nome);
  const cleanProductName = sanitizeText(productName);
  const cleanCustomerEmail = sanitizeText(customer?.email);

  if (!cleanProductName || !cleanCustomerNome) {
    return res.status(400).json({ error: "Nome do produto e Nome do cliente são obrigatórios" });
  }

  if (cleanCustomerEmail && !isValidEmailStrict(cleanCustomerEmail)) {
    return res.status(400).json({ error: "Por favor introduza um e-mail com formato válido (utilizador@dominio.com)." });
  }

  const priceNum = sanitizeNumber(price, 0);
  const selCorPrincipal = sanitizeText(selections?.corPrincipal);
  const selCorDetalhe = sanitizeText(selections?.corDetalhe);
  let selCor = sanitizeText(selections?.cor);
  if (!selCor && selCorPrincipal) {
    selCor = selCorDetalhe ? `${selCorPrincipal} & ${selCorDetalhe}` : selCorPrincipal;
  }
  if (!selCor) selCor = "Padrão";

  const selTam = sanitizeText(selections?.tamanho);
  const selQtd = sanitizeText(selections?.quantidade).replace(/\D/g, "") || "1";

  const noSizeTerms = ["", "único", "única", "padrão", "sem tamanho", "n/a", "na"];
  const hasSize = selTam ? !noSizeTerms.includes(selTam.toLowerCase()) : false;

  // Generate distinctive order ID
  const orderId = `MB-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  
  const newOrder: any = {
    orderId,
    productName: cleanProductName,
    price: priceNum,
    selections: {
      cor: selCor,
      corPrincipal: selCorPrincipal || undefined,
      corDetalhe: selCorDetalhe || undefined,
      tamanho: selTam,
      hasSize,
      quantidade: selQtd
    },
    customer: {
      nome: cleanCustomerNome,
      email: cleanCustomerEmail,
      telefone: sanitizeText(customer?.telefone).replace(/[^0-9+]/g, ""),
      morada: sanitizeText(customer?.morada),
      codigoPostal: formatPostalCode(customer?.codigoPostal),
      cidade: sanitizeText(customer?.cidade),
      nif: sanitizeText(customer?.nif).replace(/\D/g, "")
    },
    paymentMethod: paymentMethod || "manual",
    status: status || "paid",
    priority: priority || "NORMAL",
    createdAt: createdAt || new Date().toISOString(),
    emailSent: false
  };

  // 1. Reload current orders from local JSON volume (no PostgreSQL/external DB call)
  const currentOrders = loadOrders();
  activeOrders.clear();
  for (const [id, ord] of currentOrders.entries()) {
    activeOrders.set(id, ord);
  }

  // 2. Dispatch notification EXCLUSIVELY to Atelier (encomendas@mbravobycarolina.com) in background via Resend
  try {
    const { adminEmailUrl } = await sendAtelierNotificationOnly(newOrder);
    newOrder.emailLinks = { adminEmailUrl };
  } catch (emailErr: any) {
    console.error("[ADMIN MANUAL ORDER ATELIER EMAIL ERROR]", emailErr);
  }

  // 3. Save order to persistent Volume JSON storage (ORDERS_FILE)
  activeOrders.set(orderId, newOrder);
  saveOrders(activeOrders);

  // 4. Trigger audit log for manual order registration
  addAuditLog(
    'manual_order_creation',
    `Encomenda manual registada: ${orderId} para o cliente ${customer.nome} (${productName})`,
    orderId,
    { customerName: customer.nome, productName }
  );

  res.json({ success: true, order: newOrder });
});

// Endpoint to delete/remove an order permanently
app.post("/api/admin/orders/delete", verifyAdmin, (req, res) => {
  const { orderId } = req.body;

  if (!orderId) {
    return res.status(400).json({ error: "orderId é obrigatório" });
  }

  const currentOrders = loadOrders();
  activeOrders.clear();
  for (const [id, ord] of currentOrders.entries()) {
    activeOrders.set(id, ord);
  }

  if (!activeOrders.has(orderId)) {
    return res.status(404).json({ error: "Encomenda não encontrada" });
  }

  activeOrders.delete(orderId);
  saveOrders(activeOrders);

  addAuditLog(
    'order_deletion',
    `Encomenda ${orderId} eliminada permanentemente do sistema pelo administrador.`,
    orderId,
    { orderId }
  );

  res.json({ success: true, deletedOrderId: orderId });
});


/**
 * 7. CRM & CLIENT PROFILE PERSISTENCE AND ENDPOINTS
 */
const getCustomersFilePath = () => {
  const railwayPersistentDir = "/app/data";
  try {
    if (!fs.existsSync(railwayPersistentDir)) {
      fs.mkdirSync(railwayPersistentDir, { recursive: true });
    }
    return path.join(railwayPersistentDir, "customers.json");
  } catch (e) {
    return path.join(process.cwd(), "customers.json");
  }
};

const CUSTOMERS_FILE = getCustomersFilePath();

function loadCustomers() {
  const map = new Map<string, any>();

  if (fs.existsSync(CUSTOMERS_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(CUSTOMERS_FILE, 'utf8'));
      for (const [email, cust] of Object.entries(data)) {
        map.set(email.toLowerCase().trim(), cust);
      }
      console.log(`[CRM DATABASE READ-ONLY BOOT] Loaded ${map.size} customer profiles from persistent store (${CUSTOMERS_FILE})`);
      return map;
    } catch (err) {
      console.error("[CRM DATABASE] Failed to load customers.json", err);
    }
  }

  const localFallbackPath = path.join(process.cwd(), "customers.json");
  if (fs.existsSync(localFallbackPath)) {
    try {
      const localData = JSON.parse(fs.readFileSync(localFallbackPath, 'utf8'));
      for (const [email, cust] of Object.entries(localData)) {
        map.set(email.toLowerCase().trim(), cust);
      }
    } catch (err) {
      console.warn("[CRM DATABASE FALLBACK ERROR]", err);
    }
  }

  return map;
}

function saveCustomers(map: Map<string, any>) {
  try {
    const obj = Object.fromEntries(map);
    fs.writeFileSync(CUSTOMERS_FILE, JSON.stringify(obj, null, 2), 'utf8');
  } catch (err) {
    console.error("[CRM DATABASE] Failed to save customers.json", err);
  }
}

// CRM Endpoint to retrieve consolidated list of all unique customers from actual orders + custom metadata
app.get("/api/admin/customers", verifyAdmin, (req, res) => {
  try {
    const cMap = loadCustomers();
    const ordersMap = loadOrders();
    const customerConsolidation = new Map<string, any>();

    // 1. Gather distinct customers from actual orders
    for (const order of ordersMap.values()) {
      if (order.customer && order.customer.email) {
        const email = order.customer.email.toLowerCase().trim();
        const existing = customerConsolidation.get(email);
        const orderDate = new Date(order.createdAt).getTime();
        const priceNum = parseFloat(String(order.price || "0").replace(/[^0-9.,]/g, "").replace(",", ".") || "0");
        
        if (!existing || orderDate > existing.latestOrderDate) {
          customerConsolidation.set(email, {
            email,
            name: order.customer.nome,
            phone: order.customer.telefone || "",
            address: `${order.customer.morada || ""}, ${order.customer.codigoPostal || ""} ${order.customer.cidade || ""}`,
            latestOrderDate: orderDate,
            orderCount: (existing?.orderCount || 0) + 1,
            totalSpent: (existing?.totalSpent || 0) + priceNum
          });
        } else {
          existing.orderCount += 1;
          existing.totalSpent += priceNum;
        }
      }
    }

    // 2. Merge with CRM-specific fields
    const customersList = Array.from(customerConsolidation.values()).map(c => {
      const crmData = cMap.get(c.email) || {};
      return {
        ...c,
        instagram: crmData.instagram || "",
        birthday: crmData.birthday || "",
        instagramNotes: crmData.instagramNotes || "",
        customNotes: crmData.customNotes || "",
        createdAt: crmData.createdAt || new Date(c.latestOrderDate).toISOString(),
        updatedAt: crmData.updatedAt || new Date(c.latestOrderDate).toISOString()
      };
    });

    // Add any CRM-only customers who have no orders yet
    for (const [email, crmData] of cMap.entries()) {
      if (!customerConsolidation.has(email)) {
        customersList.push({
          email,
          name: crmData.name || "",
          phone: crmData.phone || "",
          address: "",
          latestOrderDate: 0,
          orderCount: 0,
          totalSpent: 0,
          instagram: crmData.instagram || "",
          birthday: crmData.birthday || "",
          instagramNotes: crmData.instagramNotes || "",
          customNotes: crmData.customNotes || "",
          createdAt: crmData.createdAt || new Date().toISOString(),
          updatedAt: crmData.updatedAt || new Date().toISOString()
        });
      }
    }

    // Sort by latest activity (recent orders first)
    customersList.sort((a, b) => b.latestOrderDate - a.latestOrderDate);

    res.json({ success: true, customers: customersList });
  } catch (error: any) {
    console.error("[CRM API ERROR] GET /api/admin/customers failed:", error);
    res.status(500).json({ error: "Erro interno ao carregar a lista de clientes." });
  }
});

// CRM Endpoint to retrieve a specific customer profile and all their associated orders
app.get("/api/admin/customers/:email", verifyAdmin, (req, res) => {
  try {
    const email = req.params.email.toLowerCase().trim();
    const cMap = loadCustomers();
    const ordersMap = loadOrders();
    
    // Scan all orders matching this client
    const clientOrders = Array.from(ordersMap.values())
      .filter(order => order.customer && order.customer.email && order.customer.email.toLowerCase().trim() === email)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const latestOrder = clientOrders[0];
    const defaultName = latestOrder?.customer?.nome || "";
    const defaultPhone = latestOrder?.customer?.telefone || "";

    const crmData = cMap.get(email) || {};

    const profile = {
      email,
      name: crmData.name || defaultName,
      phone: crmData.phone || defaultPhone,
      instagram: crmData.instagram || "",
      birthday: crmData.birthday || "",
      instagramNotes: crmData.instagramNotes || "",
      customNotes: crmData.customNotes || "",
      createdAt: crmData.createdAt || (latestOrder ? latestOrder.createdAt : new Date().toISOString()),
      updatedAt: crmData.updatedAt || (latestOrder ? latestOrder.createdAt : new Date().toISOString()),
      orders: clientOrders
    };

    res.json({ success: true, profile });
  } catch (error: any) {
    console.error("[CRM API ERROR] GET /api/admin/customers/:email failed:", error);
    res.status(500).json({ error: "Erro interno ao obter ficha de cliente." });
  }
});

// CRM Endpoint to update/save custom CRM metadata fields for a specific customer
app.post("/api/admin/customers/:email", verifyAdmin, (req, res) => {
  try {
    const email = req.params.email.toLowerCase().trim();
    const { name, phone, instagram, birthday, instagramNotes, customNotes } = req.body;

    const cMap = loadCustomers();
    const existing = cMap.get(email) || {};

    const updatedProfile = {
      ...existing,
      email,
      name: name !== undefined ? name : (existing.name || ""),
      phone: phone !== undefined ? phone : (existing.phone || ""),
      instagram: instagram !== undefined ? instagram : (existing.instagram || ""),
      birthday: birthday !== undefined ? birthday : (existing.birthday || ""),
      instagramNotes: instagramNotes !== undefined ? instagramNotes : (existing.instagramNotes || ""),
      customNotes: customNotes !== undefined ? customNotes : (existing.customNotes || ""),
      createdAt: existing.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    cMap.set(email, updatedProfile);
    saveCustomers(cMap);

    // Audit Log to trace changes
    addAuditLog(
      'crm_customer_update',
      `Ficha do cliente atualizada no CRM: ${email} (Insta: ${updatedProfile.instagram || 'n/a'}, Aniv: ${updatedProfile.birthday || 'n/a'})`,
      '',
      { email, instagram: updatedProfile.instagram, birthday: updatedProfile.birthday }
    );

    res.json({ success: true, profile: updatedProfile });
  } catch (error: any) {
    console.error("[CRM API ERROR] POST /api/admin/customers/:email failed:", error);
    res.status(500).json({ error: "Erro interno ao gravar dados da ficha de cliente." });
  }
});

// --- PRIVATE STUDIO CREATIVE PASSPORTS PERSISTENCE ---
const getPassportsFilePath = () => {
  const railwayPersistentDir = "/app/data";
  try {
    if (!fs.existsSync(railwayPersistentDir)) {
      fs.mkdirSync(railwayPersistentDir, { recursive: true });
    }
    return path.join(railwayPersistentDir, "passports.json");
  } catch (e) {
    return path.join(process.cwd(), "passports.json");
  }
};

const PASSPORTS_FILE = getPassportsFilePath();

function loadPassports(): any[] {
  if (fs.existsSync(PASSPORTS_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(PASSPORTS_FILE, 'utf8'));
      if (Array.isArray(data)) return data;
    } catch (err) {
      console.error("[PASSPORTS DATABASE] Failed to load passports.json", err);
    }
  }
  return [];
}

function savePassports(list: any[]) {
  try {
    fs.writeFileSync(PASSPORTS_FILE, JSON.stringify(list, null, 2), 'utf8');
  } catch (err) {
    console.error("[PASSPORTS DATABASE] Failed to save passports.json", err);
  }
}

// Public Endpoint to register a new Creative Passport from Private Studio
app.post("/api/private-studio/passports", (req, res) => {
  try {
    const { 
      clientName, 
      pieceType, 
      yarnPalette, 
      primaryYarn, 
      secondaryYarn, 
      isBicolor, 
      hardware, 
      estimatedHours, 
      estimatedPrice, 
      notes 
    } = req.body;
    
    const passportId = `MB-PASS-${Math.floor(1000 + Math.random() * 9000)}`;
    const newPassport = {
      id: passportId,
      timestamp: new Date().toISOString(),
      clientName: sanitizeText(clientName) || 'Cliente M★BRAVO',
      pieceType: sanitizeText(pieceType) || 'Peça Sob Medida',
      yarnPalette: sanitizeText(yarnPalette) || 'Cru Natural',
      primaryYarn: sanitizeText(primaryYarn) || '',
      secondaryYarn: sanitizeText(secondaryYarn) || '',
      isBicolor: Boolean(isBicolor),
      hardware: sanitizeText(hardware) || 'Acabamento Padrão',
      estimatedHours: parseInt(estimatedHours) || 20,
      estimatedPrice: sanitizeText(estimatedPrice) || 'Consultar',
      notes: sanitizeText(notes) || ''
    };

    const currentList = loadPassports();
    currentList.unshift(newPassport);
    savePassports(currentList.slice(0, 200)); // Preserve up to 200 recent passports

    addAuditLog(
      'manual_order_creation',
      `Novo Passaporte Criativo registado (${passportId}) para ${newPassport.clientName}: ${newPassport.pieceType} (${newPassport.yarnPalette})`,
      passportId,
      newPassport
    );

    res.json({ success: true, passport: newPassport });
  } catch (error: any) {
    console.error("[PRIVATE STUDIO API ERROR] POST /api/private-studio/passports failed:", error);
    res.status(500).json({ error: "Erro ao registar o Passaporte Criativo." });
  }
});

// Admin Endpoint to consult registered Creative Passports
app.get("/api/admin/passports", verifyAdmin, (req, res) => {
  try {
    const passports = loadPassports();
    res.json({ success: true, passports });
  } catch (error: any) {
    console.error("[PRIVATE STUDIO API ERROR] GET /api/admin/passports failed:", error);
    res.status(500).json({ error: "Erro ao carregar os Passaportes Criativos." });
  }
});


// PostgreSQL Connection Pool & Initialization via Environment Variables
const connectionString = process.env.DATABASE_URL;

const dbPool = connectionString ? new pg.Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  },
  connectionTimeoutMillis: 3000, // 3s defensive timeout for fast fallback
  idleTimeoutMillis: 10000
}) : null;

if (dbPool) {
  dbPool.on('error', (err) => {
    console.warn("[POSTGRESQL POOL WARN] Non-blocking network or idle client connection warning:", err.message || err);
  });
}

// Create table if not exists on startup (non-blocking)
async function initDatabase() {
  if (!dbPool) {
    console.log("[DATABASE INFO] DATABASE_URL is not set. Operating in 3-layer High Availability fallback mode.");
    return;
  }
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

    // Attempt Google Places API reviews sync if configured
    await syncGoogleReviews();
  } catch (err: any) {
    console.warn("[DATABASE WARN] Non-blocking PostgreSQL initialization warning (seamless 3-layer fallback active):", err.message || err);
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

  if (!dbPool) {
    console.log("[GOOGLE REVIEWS SYNC] DATABASE_URL is not set. Skipping sync to PostgreSQL.");
    return;
  }

  console.log(`[GOOGLE REVIEWS SYNC] Fetching reviews for Place ID: ${placeId}...`);
  try {
    let reviews: any[] = [];
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=reviews&key=${apiKey}&language=pt`;
    const response = await fetch(url);
    if (response.ok) {
      const data: any = await response.json();
      if (data.status === "OK" && data.result?.reviews?.length > 0) {
        reviews = data.result.reviews.map((r: any) => ({
          author: r.author_name || "Cliente Google",
          text: r.text || "",
          rating: r.rating ? parseInt(r.rating, 10) : 5
        }));
      }
    }

    if (reviews.length === 0) {
      const newUrl = `https://places.googleapis.com/v1/places/${placeId}`;
      const newRes = await fetch(newUrl, {
        headers: {
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': 'reviews,rating,userRatingCount',
          'Accept-Language': 'pt-PT,pt;q=0.9'
        }
      });
      if (newRes.ok) {
        const newData: any = await newRes.json();
        if (newData.reviews && Array.isArray(newData.reviews)) {
          reviews = newData.reviews.map((r: any) => ({
            author: r.authorAttribution?.displayName || "Cliente Google",
            text: r.text?.text || r.originalText?.text || "",
            rating: r.rating ? parseInt(r.rating, 10) : 5
          }));
        }
      }
    }

    console.log(`[GOOGLE REVIEWS SYNC] Retrieved ${reviews.length} reviews from Google Places.`);

    let insertedCount = 0;
    for (const r of reviews) {
      const name = r.author || "Cliente Google";
      const text = r.text || "";
      const rating = r.rating || 5;
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
  } catch (err: any) {
    console.warn("[GOOGLE REVIEWS SYNC WARN] Non-blocking Google Reviews sync issue:", err.message || err);
  }
}

initDatabase();

// Native Google Places Reviews Fetcher (Google Places New v1 + Legacy)
async function fetchGoogleReviews(): Promise<any[]> {
  let googleReviews: any[] = [];
  const apiKey = (process.env.GOOGLE_PLACES_API_KEY || process.env.GOOGLE_API_KEY || '').trim();
  const rawPlaceId = (process.env.GOOGLE_PLACE_ID || '').trim();
  const placeId = rawPlaceId.replace(/^places\//, '');

  if (!apiKey) {
    console.warn("[GOOGLE REVIEWS WARN] GOOGLE_PLACES_API_KEY / GOOGLE_API_KEY is NOT configured in environment.");
  }
  if (!placeId) {
    console.warn("[GOOGLE REVIEWS WARN] GOOGLE_PLACE_ID is NOT configured in environment.");
  }

  if (apiKey && placeId) {
    // 1. Try Places API (New) v1 with English & Multi-Language headers to catch all reviews (e.g. English, Portuguese)
    try {
      console.log(`[GOOGLE REVIEWS API] Fetching Places API (New) v1 for Place ID: ${placeId}...`);
      const newUrl = `https://places.googleapis.com/v1/places/${placeId}?key=${encodeURIComponent(apiKey)}&languageCode=en`;
      const newRes = await fetch(newUrl, {
        headers: {
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': 'reviews,rating,userRatingCount,displayName',
          'X-Goog-Request-Params': 'languageCode=en-US',
          'Accept-Language': 'en-US,en;q=0.9,pt-PT;q=0.8,pt;q=0.7,*;q=0.5'
        }
      });
      if (newRes.ok) {
        const newData: any = await newRes.json();
        console.log(`[GOOGLE REVIEWS API v1 RESPONSE STATUS] 200 OK. Reviews count: ${newData.reviews?.length || 0}`);
        if (newData.reviews && Array.isArray(newData.reviews) && newData.reviews.length > 0) {
          googleReviews = newData.reviews.map((r: any, idx: number) => ({
            id: r.name || `google-v1-${idx}`,
            name: r.authorAttribution?.displayName || "Cliente Google",
            text: r.text?.text || r.originalText?.text || (typeof r.text === 'string' ? r.text : ""),
            product: "Avaliação Verificada Google",
            rating: r.rating ? parseInt(r.rating, 10) : 5,
            createdAt: r.publishTime || new Date().toISOString()
          })).filter((item: any) => item.text && item.text.trim().length > 0);
          console.log(`[GOOGLE REVIEWS API SUCCESS] Extracted ${googleReviews.length} live reviews via Places API (New).`);
        } else {
          console.log(`[GOOGLE REVIEWS API INFO] Places API (New) v1 with languageCode=en returned 0 reviews.`);
        }
      } else {
        const errBody = await newRes.text();
        console.warn(`[GOOGLE REVIEWS API WARN] Places API (New) v1 HTTP ${newRes.status}: ${errBody}`);
      }
    } catch (newErr: any) {
      console.warn(`[GOOGLE REVIEWS API WARN] Places API (New) v1 fetch exception: ${newErr.message || newErr}`);
    }

    // 1b. If 0 reviews returned, try Places API (New) v1 without language parameter
    if (googleReviews.length === 0) {
      try {
        console.log(`[GOOGLE REVIEWS API] Trying Places API (New) v1 without language restrictions...`);
        const unconstrainedUrl = `https://places.googleapis.com/v1/places/${placeId}?key=${encodeURIComponent(apiKey)}`;
        const unconstrainedRes = await fetch(unconstrainedUrl, {
          headers: {
            'X-Goog-Api-Key': apiKey,
            'X-Goog-FieldMask': 'reviews,rating,userRatingCount,displayName',
            'Accept-Language': '*'
          }
        });
        if (unconstrainedRes.ok) {
          const unconstrainedData: any = await unconstrainedRes.json();
          if (unconstrainedData.reviews && Array.isArray(unconstrainedData.reviews) && unconstrainedData.reviews.length > 0) {
            googleReviews = unconstrainedData.reviews.map((r: any, idx: number) => ({
              id: r.name || `google-v1-unconstrained-${idx}`,
              name: r.authorAttribution?.displayName || "Cliente Google",
              text: r.text?.text || r.originalText?.text || (typeof r.text === 'string' ? r.text : ""),
              product: "Avaliação Verificada Google",
              rating: r.rating ? parseInt(r.rating, 10) : 5,
              createdAt: r.publishTime || new Date().toISOString()
            })).filter((item: any) => item.text && item.text.trim().length > 0);
            console.log(`[GOOGLE REVIEWS API SUCCESS] Extracted ${googleReviews.length} live reviews via Places API (New) unconstrained.`);
          }
        }
      } catch (err: any) {
        console.warn(`[GOOGLE REVIEWS API WARN] Places API (New) unconstrained exception: ${err.message || err}`);
      }
    }

    // 2. Fallback to Legacy Places Details API without language restriction if v1 returned 0 reviews
    if (googleReviews.length === 0) {
      try {
        console.log(`[GOOGLE REVIEWS API] Trying Google Places (Legacy) details API for Place ID: ${placeId}...`);
        const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=reviews,rating&key=${encodeURIComponent(apiKey)}`;
        const response = await fetch(url);
        if (response.ok) {
          const data: any = await response.json();
          console.log(`[GOOGLE REVIEWS API Legacy RESPONSE] Status: ${data.status}`);
          if (data.status === "OK" && data.result?.reviews?.length > 0) {
            googleReviews = data.result.reviews.map((r: any, idx: number) => ({
              id: r.time ? String(r.time) : `google-legacy-${idx}`,
              name: r.author_name || "Cliente Google",
              text: r.text || "",
              product: "Avaliação Verificada Google",
              rating: r.rating ? parseInt(r.rating, 10) : 5,
              createdAt: r.time ? new Date(r.time * 1000).toISOString() : new Date().toISOString()
            })).filter((item: any) => item.text && item.text.trim().length > 0);
            console.log(`[GOOGLE REVIEWS API SUCCESS] Extracted ${googleReviews.length} live Google Places (Legacy) reviews.`);
          } else {
            console.warn(`[GOOGLE REVIEWS API WARN] Legacy Places API status: ${data.status} - ${data.error_message || 'No error message provided'}`);
          }
        } else {
          console.warn(`[GOOGLE REVIEWS API WARN] Legacy Places API HTTP status: ${response.status}`);
        }
      } catch (err: any) {
        console.warn(`[GOOGLE REVIEWS API WARN] Legacy Places API fetch exception: ${err.message || err}`);
      }
    }
  }

  // Sort reviews chronologically (newest first)
  if (googleReviews.length > 0) {
    googleReviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Strictly return real Google reviews or [] if none exist
  return googleReviews;
}

// Endpoints for Google Reviews & Testimonials
app.get("/api/testimonials", async (req, res) => {
  try {
    const list = await fetchGoogleReviews();
    res.json(list);
  } catch (err: any) {
    console.warn("[TESTIMONIALS API WARN] Error fetching reviews, returning empty list:", err.message || err);
    res.json([]);
  }
});

app.get("/api/google-reviews", async (req, res) => {
  try {
    const list = await fetchGoogleReviews();
    res.json(list);
  } catch (err: any) {
    console.warn("[GOOGLE REVIEWS API WARN] Error fetching reviews, returning empty list:", err.message || err);
    res.json([]);
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

    if (dbPool) {
      try {
        await dbPool.query(
          `INSERT INTO testimonials (name, text, product, rating) VALUES ($1, $2, $3, $4)`,
          [name, text, cleanProduct, cleanRating]
        );
      } catch (dbErr: any) {
        console.warn("[DATABASE WRITE WARN] PostgreSQL write non-blocking issue:", dbErr.message || dbErr);
      }
    }

    res.json({ success: true, message: "Testimonial received." });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint: Instagram feed via Behold API with fallback
app.get("/api/instagram", async (req, res) => {
  const rawFeedId = process.env.BEHOLD_FEED_ID || process.env.VITE_BEHOLD_WIDGET_ID || "bsBrFKD7BzlZyS6ABOlJ";
  
  // Defensive extraction: strip domain if full Behold URL was pasted into environment variable
  const feedId = rawFeedId
    .replace(/^https?:\/\/(www\.)?behold\.so\/(w\/)?/, '')
    .replace(/^https?:\/\/feeds\.behold\.so\//, '')
    .trim();

  const curatedFallback = [
    {
      id: "1",
      img: 'https://i.ibb.co/mCmVm2rL/mockup-coosters-luxury-1.png',
      alt: 'Daisy Coasters M★BRAVO',
      productName: 'Daisy Coasters Set',
      likes: '20',
      comments: '5',
      permalink: 'https://instagram.com/mbravobycarolina/'
    },
    {
      id: "2",
      img: 'https://i.ibb.co/NnCJyRTF/African-Flower-Pouch-10-1.png',
      alt: 'African Flower Pouch M★BRAVO',
      productName: 'African Flower Pouch',
      likes: '17',
      comments: '12',
      permalink: 'https://instagram.com/mbravobycarolina/'
    },
    {
      id: "3",
      img: 'https://i.ibb.co/zWNCP5Nx/Stella-Cushion-7-1.png',
      alt: 'Stella Cushion M★BRAVO',
      productName: 'Stella Cushion',
      likes: '34',
      comments: '9',
      permalink: 'https://instagram.com/mbravobycarolina/'
    },
    {
      id: "4",
      img: 'https://i.ibb.co/wNdC8NNG/Granny-square-sling-bag-20.png',
      alt: 'Granny Square Sling Bag M★BRAVO',
      productName: 'Granny Square Sling Bag',
      likes: '17',
      comments: '8',
      permalink: 'https://instagram.com/mbravobycarolina/'
    },
    {
      id: "5",
      img: 'https://i.ibb.co/kVZvr34t/Sunflower-coasters-5.png',
      alt: 'Sunflower Coasters M★BRAVO',
      productName: 'Sunflower Coasters Set',
      likes: '14',
      comments: '4',
      permalink: 'https://instagram.com/mbravobycarolina/'
    },
    {
      id: "6",
      img: 'https://i.ibb.co/VY1dx3nt/Mini-shell-Pouch.png',
      alt: 'Mini Shell Pouch M★BRAVO',
      productName: 'Mini Shell Pouch',
      likes: '12',
      comments: '7',
      permalink: 'https://instagram.com/mbravobycarolina/'
    }
  ];

  try {
    console.log(`[INSTAGRAM BEHOLD API] Requesting Behold feed for ID: "${feedId}"...`);
    const beholdRes = await fetch(`https://feeds.behold.so/${feedId}`, {
      headers: { 'Accept': 'application/json' }
    });
    
    if (beholdRes.ok) {
      const data = await beholdRes.json();
      const rawPosts = Array.isArray(data) ? data : (Array.isArray(data?.posts) ? data.posts : (Array.isArray(data?.data) ? data.data : []));
      
      console.log(`[INSTAGRAM BEHOLD API SUCCESS] Status 200. Retreived ${rawPosts.length} raw posts from Behold.`);

      if (rawPosts.length > 0) {
        const formatted = rawPosts.slice(0, 6).map((post: any, idx: number) => {
          const rawCaption = post.caption || '';
          let cleanedName = rawCaption.split('\n')[0]?.replace(/[#@]/g, '').trim();
          if (!cleanedName || cleanedName.length > 35) {
            cleanedName = curatedFallback[idx % curatedFallback.length].productName;
          }
          const rawLikes = post.likeCount ?? post.like_count ?? post.likes ?? post.likesCount;
          const cleanLikes = (rawLikes !== undefined && rawLikes !== null && String(rawLikes).trim() !== '' && String(rawLikes) !== '0') 
            ? String(rawLikes) 
            : curatedFallback[idx % curatedFallback.length].likes;
          const rawComments = post.commentsCount ?? post.comments_count ?? post.comments;
          const cleanComments = (rawComments !== undefined && rawComments !== null && String(rawComments).trim() !== '') ? String(rawComments) : '';

          const mediaUrl = post.sizes?.large?.mediaUrl || 
                           post.sizes?.medium?.mediaUrl || 
                           post.sizes?.small?.mediaUrl || 
                           post.mediaUrl || 
                           post.thumbnailUrl || 
                           post.displayUrl || 
                           post.children?.[0]?.mediaUrl || 
                           curatedFallback[idx % curatedFallback.length].img;

          return {
            id: post.id || String(idx + 1),
            img: mediaUrl,
            alt: `${cleanedName} M★BRAVO`,
            productName: cleanedName,
            likes: cleanLikes,
            comments: cleanComments,
            permalink: post.permalink || 'https://instagram.com/mbravobycarolina/'
          };
        });
        return res.json(formatted);
      }
    } else {
      const errText = await beholdRes.text();
      console.warn(`[INSTAGRAM BEHOLD API WARN] Behold returned HTTP ${beholdRes.status} for feed ID "${feedId}": ${errText}`);
    }

    console.log(`[INSTAGRAM BEHOLD API INFO] Returning curated fallback posts.`);
    return res.json(curatedFallback);
  } catch (err: any) {
    console.warn('[INSTAGRAM BEHOLD API WARN] Exception while fetching Behold feed:', err.message || err);
    return res.json(curatedFallback);
  }
});

// Redirect user directly to Google Place review page
app.get("/api/write-review", (req, res) => {
  // Direct official link provided by the user for M★BRAVO
  return res.redirect("https://g.page/r/Cdo7JGP_Xpc3EBM/review");
});

// Strict API route fallback: prevent any unhandled /api/* request from returning HTML
app.use("/api/*", (req, res) => {
  return res.status(404).json({ error: `API endpoint ${req.originalUrl} not found` });
});

// Global Express Error Handling Middleware - Prevents HTML errors on API endpoints
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[EXPRESS UNCAUGHT ERROR]', err);
  if (req.path.startsWith('/api/') || req.originalUrl.startsWith('/api/')) {
    return res.status(500).json({ error: err?.message || 'Internal Server Error' });
  }
  next(err);
});

// Configure Vite middleware in development or serve production build
async function startServer() {
  // Boot persistent inventory check & smart upsert immediately on server start
  try {
    const bootInventory = loadInventory();
    console.log(`[M.BRAVO INVENTORY BOOT] Persistent inventory synchronized successfully (${bootInventory.length} raw materials available in /app/data/inventory.json)`);
  } catch (err) {
    console.error("[M.BRAVO INVENTORY BOOT ERROR] Failed to synchronize inventory on boot:", err);
  }

  const isProduction = process.env.NODE_ENV === "production" || 
                       !!process.env.RAILWAY_ENVIRONMENT || 
                       process.env.CF_PAGES === "1" ||
                       fs.existsSync(path.join(process.cwd(), 'dist', 'index.html'));

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    const publicPath = path.join(process.cwd(), 'public');
    const indexPath = path.join(distPath, 'index.html');

    // Serve static files from dist and public directories
    app.use(express.static(distPath));

    if (fs.existsSync(publicPath)) {
      app.use(express.static(publicPath));
      app.use('/public', express.static(publicPath));
      app.use('/products', express.static(path.join(publicPath, 'products')));
    }

    app.use('/public', express.static(distPath));
    app.use('/products', express.static(path.join(distPath, 'products')));

    app.get('*', (req, res) => {
      if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: `API endpoint ${req.path} not found` });
      }

      // Safeguard: Never return index.html HTML page for missing media/image assets
      if (/\.(webp|jpg|jpeg|png|svg|ico|css|js|woff|woff2|ttf|map)$/i.test(req.path)) {
        return res.status(404).send('Asset not found');
      }

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
              <p>The client application is served from the static build.</p>
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
