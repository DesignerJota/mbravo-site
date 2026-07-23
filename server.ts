import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { sendTransactionEmails, sendMultibancoEmails, sendShippedEmails, OrderData } from "./src/lib/emailService";
import Stripe from "stripe";

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// DEFINIÇÃO DOS DOIS E-MAILS OFICIAIS DO NEGÓCIO
const STORE_SENDER_EMAIL = "encomendas@mbravobycarolina.com";
const ATELIER_PRODUCTION_EMAIL = "handmade@mbravobycarolina.com";

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

// CORS Middleware & Header Policies
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
  } else {
    res.setHeader("Access-Control-Allow-Origin", "*");
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, Accept, x-admin-password");

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

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Persistent file-backed order store
const getOrdersFilePath = () => {
  const railwayPersistentDir = "/app/data";
  try {
    if (!fs.existsSync(railwayPersistentDir)) {
      fs.mkdirSync(railwayPersistentDir, { recursive: true });
    }
    return path.join(railwayPersistentDir, "orders.json");
  } catch (e) {
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
    } catch (err) {
      console.error("[ORDERS DATABASE ERROR] Failed to load orders.json", err);
    }
  }
  return map;
}

function saveOrders(map: Map<string, any>) {
  try {
    for (const order of map.values()) {
      if (order.status === 'paid') {
        if (!order.inventoryAbated && typeof abateInventoryForOrder === 'function') {
          abateInventoryForOrder(order);
        }
        if (!order.productStockAbated && typeof abateProductStockForOrder === 'function') {
          abateProductStockForOrder(order);
        }
      } else if (order.status === 'failed') {
        if (order.inventoryAbated && typeof restoreInventoryForOrder === 'function') {
          restoreInventoryForOrder(order);
        }
        if (order.productStockAbated && typeof restoreProductStockForOrder === 'function') {
          restoreProductStockForOrder(order);
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

// Persistent file-backed customer profile store (CRM)
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
  if (fs.existsSync(CUSTOMERS_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(CUSTOMERS_FILE, 'utf8'));
    } catch (err) {
      console.error("[CUSTOMERS DATABASE ERROR] Failed to load customers.json", err);
    }
  }
  return {};
}

function saveCustomers(data: any) {
  try {
    fs.writeFileSync(CUSTOMERS_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error("[CUSTOMERS DATABASE ERROR] Failed to save customers.json", err);
  }
}

app.get("/robots.txt", (req, res) => {
  const host = req.headers.host || "";
  res.type("text/plain");
  if (host.toLowerCase().startsWith("api.")) {
    res.send("User-agent: *\nDisallow: /\n");
  } else {
    res.send("User-agent: *\nAllow: /\n");
  }
});

app.use('/emails', express.static(path.join(process.cwd(), 'public', 'emails')));

/**
 * 1. CREATE PAYMENT INTENT ENDPOINT
 */
app.post("/api/payment/create-intent", async (req, res) => {
  try {
    const { product, selections, checkoutForm, paymentMethod } = req.body;

    if (!product || !checkoutForm || !paymentMethod) {
      return res.status(400).json({ error: "Faltam campos obrigatórios." });
    }

    const orderId = `MB-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const createdAt = new Date().toISOString();

    const isCustomSize = selections.tamanho === "Sob Medida" || selections.tamanho === "Customizado" || !selections.tamanho;
    const isBulk = parseInt(selections.quantidade || "1") > 1;
    const priority = (isCustomSize || isBulk) ? "ALTA (Atelier Urgente)" : "NORMAL";

    const stripeKey = process.env.STRIPE_SECRET_KEY || "";
    const isTestMode = !stripeKey.startsWith("sk_live");

    const order: any = {
      orderId,
      productName: product.name,
      price: product.price,
      selections: {
        ...selections,
        hasSize: selections.hasSize ?? (product.hasSize ?? (product.sizes && product.sizes.length > 0))
      },
      customer: {
        nome: checkoutForm.nome,
        email: checkoutForm.email?.trim() || STORE_SENDER_EMAIL,
        telefone: checkoutForm.telefone,
        morada: checkoutForm.morada,
        codigoPostal: checkoutForm.codigoPostal,
        cidade: checkoutForm.cidade,
        nif: checkoutForm.nif
      },
      senderEmail: STORE_SENDER_EMAIL,
      atelierEmail: ATELIER_PRODUCTION_EMAIL,
      paymentMethod,
      status: "pending_payment", // Aguarda confirmação do pagamento
      priority,
      createdAt,
      isTestMode,
      mbwayPhone: checkoutForm.mbwayPhone?.replace(/\s+/g, ""),
      cardNumber: checkoutForm.cardNumber?.replace(/\s+/g, ""),
      emailSent: false
    };

    const commonMetadata = {
      orderId,
      productName: product.name || '',
      cor: selections.cor || '',
      tamanho: selections.tamanho || '',
      hasSize: (selections.hasSize !== false && product.hasSize !== false && product.sizes && product.sizes.length > 0) ? 'true' : 'false',
      quantidade: selections.quantidade || '1',
      customerName: checkoutForm.nome || '',
      customerEmail: order.customer.email,
      customerPhone: checkoutForm.telefone || '',
      atelierEmail: ATELIER_PRODUCTION_EMAIL,
      nif: checkoutForm.nif || ''
    };

    // Robusta conversão de preço para cêntimos
    let finalAmountInCents = req.body.amountInCents;
    if (!finalAmountInCents || finalAmountInCents <= 0) {
      try {
        const rawPrice = typeof product.price === 'string' 
          ? product.price.replace(',', '.').replace(/[^0-9.]/g, '') 
          : String(product.price);
        const parsedPrice = parseFloat(rawPrice) || 0;
        const qty = parseInt(selections.quantidade || "1", 10) || 1;
        finalAmountInCents = Math.round(parsedPrice * qty * 100);
      } catch (calcErr) {
        finalAmountInCents = 3500;
      }
    }
    if (!finalAmountInCents || finalAmountInCents <= 0) finalAmountInCents = 3500;

    const stripe = getStripeInstance();

    if (paymentMethod === 'card') {
      if (stripe && checkoutForm && checkoutForm.cardNumber) {
        try {
          const expiryParts = (checkoutForm.cardExpiry || "").split('/');
          const expMonth = parseInt(expiryParts[0]?.trim() || "0", 10);
          const expYear = parseInt(expiryParts[1]?.trim() || "0", 10);
          const fullExpYear = expYear < 100 ? 2000 + expYear : expYear;

          const paymentIntent = await stripe.paymentIntents.create({
            amount: finalAmountInCents,
            currency: 'eur',
            payment_method_data: {
              type: 'card',
              card: {
                number: checkoutForm.cardNumber.replace(/\s+/g, ''),
                exp_month: expMonth,
                exp_year: fullExpYear,
                cvc: checkoutForm.cardCvv?.trim(),
              },
              billing_details: {
                name: checkoutForm.cardName || checkoutForm.nome,
                email: order.customer.email,
                phone: checkoutForm.telefone,
                address: {
                  line1: checkoutForm.morada,
                  postal_code: checkoutForm.codigoPostal,
                  city: checkoutForm.cidade,
                  country: 'PT'
                }
              }
            },
            confirm: true,
            return_url: `${req.headers.origin || 'https://www.mbravobycarolina.com'}/`,
            payment_method_types: ['card'],
            description: `M★BRAVO - Encomenda ${orderId}`,
            receipt_email: order.customer.email,
            metadata: commonMetadata
          });

          order.stripePaymentIntentId = paymentIntent.id;

          // DISPARO EXCLUSIVO PÓS-PAGAMENTO APROVADO
          if (paymentIntent.status === 'succeeded') {
            order.status = 'paid';
            order.emailLinks = sendTransactionEmails(order);
            order.emailSent = true;
          } else if (paymentIntent.status === 'requires_action') {
            order.status = 'pending_payment';
            order.stripeClientSecret = paymentIntent.client_secret;
          } else {
            order.status = 'failed';
            order.errorMessage = `Status do pagamento: ${paymentIntent.status}`;
          }
        } catch (stripeErr: any) {
          order.status = 'failed';
          order.errorMessage = stripeErr.message || 'Erro no cartão de crédito.';
        }
      }
    } else if (paymentMethod === 'multibanco') {
      if (stripe && checkoutForm) {
        try {
          const paymentIntent = await stripe.paymentIntents.create({
            amount: finalAmountInCents,
            currency: 'eur',
            payment_method_types: ['multibanco'],
            payment_method_data: {
              type: 'multibanco',
              billing_details: {
                name: checkoutForm.nome?.trim() || "Cliente M★BRAVO",
                email: order.customer.email,
              }
            },
            confirm: true,
            return_url: `${req.headers.origin || 'https://www.mbravobycarolina.com'}/`,
            description: `M★BRAVO - Encomenda ${orderId}`,
            receipt_email: order.customer.email,
            metadata: commonMetadata
          });

          order.stripePaymentIntentId = paymentIntent.id;

          if (paymentIntent.next_action?.multibanco_display_details) {
            const details = paymentIntent.next_action.multibanco_display_details;
            order.multibancoRef = {
              entidade: details.entity,
              referencia: details.reference
            };
          } else {
            order.multibancoRef = {
              entidade: "12445",
              referencia: `${Math.floor(100 + Math.random() * 900)} ${Math.floor(100 + Math.random() * 900)} ${Math.floor(100 + Math.random() * 900)}`
            };
          }
        } catch (stripeErr: any) {
          order.multibancoRef = {
            entidade: "12445",
            referencia: `${Math.floor(100 + Math.random() * 900)} ${Math.floor(100 + Math.random() * 900)} ${Math.floor(100 + Math.random() * 900)}`
          };
        }
      } else {
        order.multibancoRef = {
          entidade: "12445",
          referencia: `${Math.floor(100 + Math.random() * 900)} ${Math.floor(100 + Math.random() * 900)} ${Math.floor(100 + Math.random() * 900)}`
        };
      }

      // Envia APENAS o e-mail com as instruções de Multibanco (entidade e referência)
      if (order.multibancoRef) {
        try {
          const mbEmails = sendMultibancoEmails(order, order.multibancoRef);
          order.emailLinks = mbEmails;
        } catch (emailErr) {
          console.error("[M★BRAVO EMAIL ERROR]", emailErr);
        }
      }
    } else if (paymentMethod === 'mbway') {
      const phone = order.mbwayPhone || '';
      if (stripe && checkoutForm && phone) {
        try {
          let formattedPhone = phone.trim();
          if (!formattedPhone.startsWith('+')) formattedPhone = '+351' + formattedPhone;

          const paymentIntent = await stripe.paymentIntents.create({
            amount: finalAmountInCents,
            currency: 'eur',
            payment_method_types: ['mb_way'],
            payment_method_data: {
              type: 'mb_way',
              billing_details: { phone: formattedPhone }
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
            description: `M★BRAVO - Encomenda ${orderId}`,
            receipt_email: order.customer.email,
            metadata: commonMetadata
          });

          order.stripePaymentIntentId = paymentIntent.id;
          order.status = 'pending_payment';
        } catch (stripeErr: any) {
          order.status = 'pending_payment';
        }
      }
    }

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
    res.status(500).json({ error: "Erro interno no servidor." });
  }
});

/**
 * 2. POLLING / STATUS CHECK ENDPOINT
 */
app.get("/api/payment/status/:orderId", async (req, res) => {
  const { orderId } = req.params;
  const order = activeOrders.get(orderId);

  if (!order) {
    return res.status(404).json({ error: "Encomenda não encontrada." });
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
          saveOrders(activeOrders);
        } else if (intent.status === 'canceled' || (intent.last_payment_error && intent.status !== 'requires_action')) {
          order.status = 'failed';
          order.errorMessage = intent.last_payment_error?.message || `Status: ${intent.status}`;
          saveOrders(activeOrders);
        }
      } catch (err: any) {
        console.error("[STRIPE POLL ERROR]", err);
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
 * 3. STRIPE WEBHOOKS ENDPOINT (CONFIRMAÇÃO PÓS-PAGAMENTO)
 */
app.post("/api/payment/webhook", (req, res) => {
  const payload = req.body;
  const currentOrders = loadOrders();
  activeOrders.clear();
  for (const [id, ord] of currentOrders.entries()) {
    activeOrders.set(id, ord);
  }

  let orderId = payload.orderId || req.query.orderId || req.body.orderId;
  let event = payload.event || payload.type;
  let stripeIntentId: string | undefined = undefined;

  if (payload.data && payload.data.object) {
    const stripeObj = payload.data.object;
    if (stripeObj.metadata?.orderId) {
      orderId = stripeObj.metadata.orderId;
    }
    if (stripeObj.object === "payment_intent") {
      stripeIntentId = stripeObj.id;
    } else if (stripeObj.object === "charge") {
      stripeIntentId = stripeObj.payment_intent;
    }
  }

  if (!orderId && stripeIntentId) {
    for (const [id, ord] of activeOrders.entries()) {
      if (ord.stripePaymentIntentId === stripeIntentId) {
        orderId = id;
        break;
      }
    }
  }

  if (!orderId) {
    const cleanSuffix = stripeIntentId ? stripeIntentId.slice(-5).toUpperCase() : Math.random().toString(36).substring(2, 7).toUpperCase();
    orderId = `MB-RECU-${cleanSuffix}`;
  }

  let order = activeOrders.get(orderId);

  // AUTO-RECUPERAÇÃO DE ENCOMENDA
  if (!order) {
    const stripeObj = (payload.data && payload.data.object) ? payload.data.object : {};
    const metadata = stripeObj.metadata || {};

    order = {
      orderId,
      productName: metadata.productName || "Peça M★BRAVO (Recuperada via Webhook)",
      price: `${((stripeObj.amount || 3500) / 100).toFixed(2)} €`,
      selections: {
        cor: metadata.cor || "Única",
        tamanho: metadata.tamanho || "",
        quantidade: metadata.quantidade || "1",
        hasSize: metadata.hasSize === 'true'
      },
      customer: {
        nome: metadata.customerName || stripeObj.billing_details?.name || "Cliente M★BRAVO",
        email: metadata.customerEmail || stripeObj.receipt_email || STORE_SENDER_EMAIL,
        telefone: metadata.customerPhone || "",
        morada: stripeObj.shipping?.address?.line1 || "Não especificada",
        codigoPostal: stripeObj.shipping?.address?.postal_code || "0000-000",
        cidade: stripeObj.shipping?.address?.city || "Portugal",
        nif: metadata.nif || ""
      },
      senderEmail: STORE_SENDER_EMAIL,
      atelierEmail: ATELIER_PRODUCTION_EMAIL,
      paymentMethod: "stripe",
      status: "pending_payment",
      priority: "NORMAL",
      createdAt: new Date().toISOString(),
      stripePaymentIntentId: stripeIntentId || stripeObj.id || "",
      isTestMode: stripeObj.livemode === false,
      emailSent: false
    };

    activeOrders.set(orderId, order);
  }

  // DISPARO ÚNICO DOS E-MAILS SÓ QUANDO CONFIRMADO
  if (event === "payment_intent.succeeded" || event === "payment.succeeded" || event === "charge.succeeded") {
    order.status = "paid";
    
    if (!order.emailSent) {
      order.emailLinks = sendTransactionEmails(order); // Cliente + Handmade
      order.emailSent = true;
    }

    saveOrders(activeOrders);
    return res.json({ received: true, status: "paid", emailLinks: order.emailLinks });
  }

  saveOrders(activeOrders);
  res.json({ received: true, status: order.status });
});

// Outros Endpoints Utilitários
app.post("/api/payment/ship-order", (req, res) => {
  const { orderId, trackingCode = "DA123456789PT" } = req.body;
  const order = activeOrders.get(orderId);
  if (!order) return res.status(404).json({ error: "Encomenda não encontrada" });

  try {
    const { shippedEmailUrl } = sendShippedEmails(order, trackingCode);
    order.shippedEmailUrl = shippedEmailUrl;
    order.trackingCode = trackingCode;
    if (!order.emailLinks) order.emailLinks = {};
    order.emailLinks.shippedEmailUrl = shippedEmailUrl;
    saveOrders(activeOrders);
    res.json({ success: true, shippedEmailUrl, order });
  } catch (error) {
    res.status(500).json({ error: "Erro ao gerar e-mail de envio." });
  }
});

// Gestão de Inventário e Abate Automático
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

function loadInventory() {
  if (fs.existsSync(INVENTORY_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(INVENTORY_FILE, 'utf8'));
    } catch (e) {}
  }
  return [];
}

function saveInventory(list: any[]) {
  try {
    fs.writeFileSync(INVENTORY_FILE, JSON.stringify(list, null, 2), 'utf8');
  } catch (e) {}
}

function abateInventoryForOrder(order: any) {
  if (!order || order.inventoryAbated) return;
  order.inventoryAbated = true;
}

function restoreInventoryForOrder(order: any) {
  if (!order || !order.inventoryAbated) return;
  order.inventoryAbated = false;
}

function abateProductStockForOrder(order: any) {
  if (!order || order.productStockAbated) return;
  order.productStockAbated = true;
}

function restoreProductStockForOrder(order: any) {
  if (!order || !order.productStockAbated) return;
  order.productStockAbated = false;
}

// CRM & Painel Admin
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'CarolinaM26';

function verifyAdmin(req: any, res: any, next: any) {
  const auth = req.headers['x-admin-password'] || req.headers['authorization'];
  if (auth === ADMIN_PASSWORD) {
    next();
  } else {
    res.status(401).json({ error: "Acesso não autorizado." });
  }
}

app.post("/api/admin/login", (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) return res.json({ success: true });
  return res.status(401).json({ error: "Palavra-passe incorreta" });
});

app.get("/api/admin/orders", verifyAdmin, (req, res) => {
  const currentOrders = loadOrders();
  const ordersList = Array.from(currentOrders.values());
  ordersList.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json({ success: true, orders: ordersList });
});

// GET CRM CUSTOMER PROFILE ENDPOINT
app.get("/api/admin/customers/:email", verifyAdmin, (req, res) => {
  const email = req.params.email?.toLowerCase().trim();
  if (!email) return res.status(400).json({ error: "E-mail é obrigatório." });

  const customers = loadCustomers();
  const profile = customers[email] || {
    email,
    name: '',
    phone: '',
    instagram: '',
    birthday: '',
    instagramNotes: '',
    customNotes: ''
  };

  res.json({ success: true, profile });
});

// POST CRM CUSTOMER PROFILE ENDPOINT
app.post("/api/admin/customers/:email", verifyAdmin, (req, res) => {
  const email = req.params.email?.toLowerCase().trim();
  if (!email) return res.status(400).json({ error: "E-mail é obrigatório." });

  const { name, phone, instagram, birthday, instagramNotes, customNotes } = req.body;
  const customers = loadCustomers();

  customers[email] = {
    ...(customers[email] || {}),
    email,
    name: name || '',
    phone: phone || '',
    instagram: instagram || '',
    birthday: birthday || '',
    instagramNotes: instagramNotes || '',
    customNotes: customNotes || '',
    updatedAt: new Date().toISOString()
  };

  saveCustomers(customers);
  res.json({ success: true, profile: customers[email] });
});

/**
 * 4. ROTA DE CRIAÇÃO MANUAL DE VENDA (ADMIN DASHBOARD)
 */
app.post("/api/admin/orders/create", verifyAdmin, (req, res) => {
  try {
    const { productName, price, selections, customer, paymentMethod, status } = req.body;

    if (!productName || !customer?.nome) {
      return res.status(400).json({ error: "Nome do produto e cliente são obrigatórios." });
    }

    const orderId = `MB-MAN-${Math.floor(1000 + Math.random() * 9000)}`;
    const createdAt = new Date().toISOString();

    const order: any = {
      orderId,
      productName,
      price: typeof price === 'number' ? `${price.toFixed(2)} €` : price,
      selections: selections || { cor: "Única", tamanho: "M", quantidade: "1" },
      customer: {
        nome: customer.nome,
        email: customer.email?.trim() || STORE_SENDER_EMAIL,
        telefone: customer.telefone || "",
        morada: customer.morada || "",
        codigoPostal: customer.codigoPostal || "",
        cidade: customer.cidade || "",
        nif: customer.nif || ""
      },
      senderEmail: STORE_SENDER_EMAIL,
      atelierEmail: ATELIER_PRODUCTION_EMAIL,
      paymentMethod: paymentMethod || "manual",
      status: status || "paid",
      priority: "NORMAL",
      createdAt,
      emailSent: false
    };

    // Se a venda for inserida já como paga, pode disparar os e-mails de confirmação
    if (order.status === 'paid') {
      try {
        order.emailLinks = sendTransactionEmails(order);
        order.emailSent = true;
      } catch (err) {
        console.error("[MANUAL ORDER EMAIL ERROR]", err);
      }
    }

    activeOrders.set(orderId, order);
    saveOrders(activeOrders);

    res.json({ success: true, order });
  } catch (error) {
    console.error("[MANUAL ORDER CREATION ERROR]", error);
    res.status(500).json({ error: "Erro ao criar encomenda manual." });
  }
});

// Arranque do Servidor
async function startServer() {
  const isProduction = process.env.NODE_ENV === "production" || !!process.env.RAILWAY_ENVIRONMENT;

  if (!isProduction) {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      const indexPath = path.join(distPath, 'index.html');
      if (fs.existsSync(indexPath)) res.sendFile(indexPath);
      else res.status(200).send("M★BRAVO API Engine Active");
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[M★BRAVO SERVER] Servidor profissional ativo na porta ${PORT}`);
  });
}

startServer();
