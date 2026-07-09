import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { sendTransactionEmails, sendMultibancoEmails, OrderData } from "./src/lib/emailService";
import Stripe from "stripe";

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

let stripeInstance: Stripe | null = null;
function getStripeInstance(): Stripe | null {
  try {
    if (!stripeInstance) {
      const key = process.env.STRIPE_SECRET_KEY;
      if (key && key.trim() !== "" && !key.startsWith("sk_test_mock")) {
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

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const activeOrders = new Map<string, any>();

app.use('/emails', express.static(path.join(process.cwd(), 'public', 'emails')));

const formatPortuguesePhone = (phone: string) => {
  if (!phone) return "";
  const clean = phone.replace(/\s+/g, "");
  if (clean.startsWith("9") && clean.length === 9) {
    return `+351${clean}`;
  }
  return clean.startsWith("+") ? clean : `+${clean}`;
};

/**
 * 1. CREATE PAYMENT INTENT ENDPOINT (CORRIGIDO E SEGURO)
 */
app.post("/api/payment/create-intent", async (req, res) => {
  try {
    const { product, selections, checkoutForm, paymentMethod } = req.body;

    if (!product || !checkoutForm || !paymentMethod) {
      return res.status(400).json({ error: "Missing required transaction fields" });
    }

    const orderId = `MB-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const createdAt = new Date().toISOString();

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
        cidade: checkoutForm.cidade
      },
      paymentMethod,
      status: "pending_payment",
      priority,
      createdAt,
      emailSent: false
    };

    const { amountInCents } = req.body;
    let finalAmountInCents = amountInCents;
    if (!finalAmountInCents || finalAmountInCents <= 0) {
      try {
        const productPrice = typeof product.price === 'string' 
          ? parseFloat(product.price.replace(/[^0-9.]/g, '')) 
          : parseFloat(product.price);
        const qty = parseInt(selections.quantidade || "1") || 1;
        finalAmountInCents = Math.round(productPrice * qty * 100);
      } catch (calcErr) {
        finalAmountInCents = 5000;
      }
    }

    const stripe = getStripeInstance();

    // ---- MÉTODOS COM INTENT COMPARTILHADO (CARD, MBWAY, MULTIBANCO) ----
    if (stripe) {
      try {
        let paymentMethodTypes: string[] = ['card'];
        
        if (paymentMethod === 'mbway') {
          paymentMethodTypes = ['mb_way'];
        } else if (paymentMethod === 'multibanco') {
          paymentMethodTypes = ['multibanco'];
        }

        console.log(`[STRIPE] Criando PaymentIntent seguro para ${paymentMethod} - Encomenda ${orderId}`);
        
        // Estrutura de criação universal recomendada pela Stripe
        const intentOptions: Stripe.PaymentIntentCreateParams = {
          amount: finalAmountInCents || 5000,
          currency: 'eur',
          payment_method_types: paymentMethodTypes,
          description: `M★BRAVO - Encomenda ${orderId}`,
          receipt_email: checkoutForm.email || undefined,
          metadata: {
            orderId,
            customerName: checkoutForm.nome || "Cliente",
            customerEmail: checkoutForm.email || "N/A"
          }
        };

        // Correção do erro 400 do MB WAY: Passar o telefone no sítio certo exigido pela API da Stripe
        if (paymentMethod === 'mbway') {
          const rawPhone = checkoutForm.mbwayPhone || checkoutForm.telefone || '';
          const phone = formatPortuguesePhone(rawPhone);
          intentOptions.payment_method_data = {
            type: 'mb_way',
            billing_details: {
              phone: phone,
              name: (checkoutForm.nome || "Cliente M★BRAVO").trim(),
              email: (checkoutForm.email || "handmade.mbravo@gmail.com").trim(),
            }
          };
        }

        // Configuração inicial para o Multibanco
        if (paymentMethod === 'multibanco') {
          intentOptions.payment_method_data = {
            type: 'multibanco',
            billing_details: {
              name: (checkoutForm.nome || "Cliente M★BRAVO").trim(),
              email: (checkoutForm.email || "handmade.mbravo@gmail.com").trim(),
            }
          };
        }

        const paymentIntent = await stripe.paymentIntents.create(intentOptions);
        
        order.stripePaymentIntentId = paymentIntent.id;
        order.stripeClientSecret = paymentIntent.client_secret;

        // Se for Multibanco, precisamos de extrair logo as referências geradas
        if (paymentMethod === 'multibanco' && paymentIntent.next_action?.multibanco_display_details) {
          const details = paymentIntent.next_action.multibanco_display_details;
          order.multibancoRef = {
            entidade: details.entity,
            referencia: details.reference
          };
          try {
            sendMultibancoEmails(order, order.multibancoRef);
          } catch (e) { console.error("Erro email MB", e); }
        }

      } catch (stripeErr: any) {
        console.error("[STRIPE ENGINE ERROR]", stripeErr);
        order.status = 'failed';
        order.errorMessage = stripeErr.message || 'Erro no Stripe';
        return res.status(400).json({ error: order.errorMessage });
      }
    } else {
      // Fallback para simulação local caso não haja chaves válidas
      order.status = 'paid';
      order.stripeClientSecret = "mock_secret_for_sandbox_testing";
    }

    activeOrders.set(orderId, order);

    // Retornamos o clientSecret para que o frontend conclua o pagamento de forma segura
    return res.json({
      success: true,
      orderId,
      status: order.status,
      priority: order.priority,
      multibancoRef: order.multibancoRef,
      errorMessage: order.errorMessage,
      stripeClientSecret: order.stripeClientSecret
    });

  } catch (error: any) {
    console.error("[PAYMENT ERROR]", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * 2. GET PAYMENT STATUS / POLLING ENDPOINT
 */
app.get("/api/payment/status/:orderId", async (req, res) => {
  const { orderId } = req.params;
  const order = activeOrders.get(orderId);

  if (!order) {
    return res.status(404).json({ error: "Order not found" });
  }

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
          order.errorMessage = intent.last_payment_error?.message || `Falhou com estado: ${intent.status}`;
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
 */
app.post("/api/payment/webhook", (req, res) => {
  console.log("[WEBHOOK RECEIVED] Processing payload.");
  const payload = req.body;
  let orderId = payload.orderId;
  let event = payload.event || payload.type;

  if (payload.data && payload.data.object) {
    const stripeObj = payload.data.object;
    if (stripeObj.metadata && stripeObj.metadata.orderId) {
      orderId = stripeObj.metadata.orderId;
    }
  }

  if (!orderId) {
    return res.status(400).json({ error: "Webhook missing orderId target" });
  }

  const order = activeOrders.get(orderId);
  if (!order) {
    return res.status(404).json({ error: "Target order for webhook not found" });
  }

  if (event === "payment_intent.succeeded" || event === "payment.succeeded" || event === "charge.succeeded") {
    console.log(`[WEBHOOK SUCCESS] Updating order ${orderId} status to PAID.`);
    order.status = "paid";
    
    if (!order.emailSent) {
      order.emailLinks = sendTransactionEmails(order);
      order.emailSent = true;
    }

    return res.json({
      received: true,
      status: "paid",
      message: "Order finalized successfully",
      emailLinks: order.emailLinks
    });
  }

  res.json({ received: true, status: order.status, message: "Unhandled event type" });
});

/**
 * 4. DEBUG / SANDBOX SIMULATION ENDPOINT
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
    order.errorMessage = 'Simulated failure.';
  }

  res.json({ success: true, order });
});

async function startServer() {
  const isProduction = process.env.NODE_ENV === "production" || 
                       !!process.env.RAILWAY_ENVIRONMENT || 
                       !!process.env.PORT || 
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
            <head><title>MBravo API Server</title></head>
            <body>
              <h1>MBravo API Engine</h1>
              <p>The backend API server is running successfully on Railway!</p>
            </body>
          </html>
        `);
      }
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[M★BRAVO SERVER] Fullstack engine running on port ${PORT}`);
  });
}

startServer();
