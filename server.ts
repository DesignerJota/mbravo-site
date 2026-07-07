import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { sendTransactionEmails, OrderData } from "./src/lib/emailService";
import Stripe from "stripe";

const app = express();
const PORT = 3000;

let stripeInstance: Stripe | null = null;
function getStripeInstance(): Stripe | null {
  if (!stripeInstance) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (key && !key.startsWith("sk_test_mock")) {
      stripeInstance = new Stripe(key);
    }
  }
  return stripeInstance;
}

// Enable JSON body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Temporary in-memory order store to simulate database persistence during sandbox testing
const activeOrders = new Map<string, any>();

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

    // Generate distinctive Portuguese order code for M★BRAVO
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
        cidade: checkoutForm.cidade
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
    if (paymentMethod === 'card') {
      const { amountInCents } = req.body;
      const stripe = getStripeInstance();
      
      if (stripe && checkoutForm && checkoutForm.cardNumber) {
        try {
          // Parse Card expiry (MM/YY)
          const expiryParts = (checkoutForm.cardExpiry || "").split('/');
          const expMonth = parseInt(expiryParts[0]?.trim() || "0");
          const expYear = parseInt(expiryParts[1]?.trim() || "0");
          const fullExpYear = expYear < 100 ? 2000 + expYear : expYear;

          console.log(`[STRIPE] Creating PaymentIntent with payment_method_data for order ${orderId}`);
          
          const paymentIntent = await stripe.paymentIntents.create({
            amount: amountInCents || 5000,
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
            return_url: `${req.headers.origin || 'http://localhost:3000'}/`,
            payment_method_types: ['card'],
            description: `M★BRAVO - Encomenda ${orderId}`,
            receipt_email: checkoutForm.email,
            metadata: {
              orderId,
              customerName: checkoutForm.nome,
              customerEmail: checkoutForm.email
            }
          });

          console.log(`[STRIPE] PaymentIntent created status: ${paymentIntent.status}`);

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
      // Multibanco is always created in pending status, generates real-looking mock references
      order.multibancoRef = {
        entidade: "12445",
        referencia: `${Math.floor(100 + Math.random() * 900)} ${Math.floor(100 + Math.random() * 900)} ${Math.floor(100 + Math.random() * 900)}`
      };
    } else if (paymentMethod === 'mbway') {
      // MBWAY is asynchronous. We initialize as pending_payment.
      // Polling will handle the transition depending on the phone number configured!
      const phone = order.mbwayPhone || '';
      if (phone === '922222222') {
        order.simulatedOutcome = 'failed';
      } else if (phone === '933333333') {
        order.simulatedOutcome = 'expired';
      } else {
        order.simulatedOutcome = 'paid';
      }
    }

    // Save order in memory
    activeOrders.set(orderId, order);

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
app.get("/api/payment/status/:orderId", (req, res) => {
  const { orderId } = req.params;
  const order = activeOrders.get(orderId);

  if (!order) {
    return res.status(404).json({ error: "Order not found" });
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
  let orderId = payload.orderId;
  let event = payload.event || payload.type;

  // Handle Stripe Webhook format where metadata holds the orderId
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
      message: "Order finalized and transaction notification emails dispatched successfully",
      emailLinks: order.emailLinks
    });
  }

  res.json({ received: true, status: order.status, message: "Unhandled event type" });
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

  res.json({ success: true, order });
});

// Configure Vite middleware in development or serve production build
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[M★BRAVO SERVER] Fullstack engine running on port ${PORT}`);
  });
}

startServer();
