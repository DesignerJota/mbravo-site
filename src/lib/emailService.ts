import fs from "fs";
import path from "path";

export interface OrderData {
  orderId: string;
  productName: string;
  price: string;
  selections: {
    cor: string;
    tamanho?: string;
    quantidade?: string;
    comprimento?: string;
    manga?: string;
    cintura?: string;
  };
  customer: {
    nome: string;
    email: string;
    telefone: string;
    morada: string;
    codigoPostal: string;
    cidade: string;
  };
  paymentMethod: 'card' | 'mbway' | 'multibanco';
  status: string;
  priority: string;
  createdAt: string;
}

/**
 * Produces elegant, transactional HTML for Order Confirmations.
 * Adheres to the M.BRAVO high-contrast aesthetic: warm beige background, dark forest text, and gold accents.
 */
function getReceiptTemplate(order: OrderData): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>M BRAVO - Confirmação de Pedido</title>
  <style>
    body {
      background-color: #F8F6F0;
      color: #243119;
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      background-color: #F8F6F0;
      padding: 40px 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #FFFFFF;
      border: 1px solid rgba(36, 49, 25, 0.08);
      padding: 50px;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
    }
    .logo {
      font-size: 24px;
      letter-spacing: 0.3em;
      font-weight: bold;
      color: #243119;
      text-transform: uppercase;
      margin-bottom: 5px;
    }
    .subtitle {
      font-size: 10px;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: rgba(36, 49, 25, 0.5);
    }
    .greeting {
      font-size: 18px;
      line-height: 1.6;
      font-weight: 300;
      color: #243119;
      margin-bottom: 25px;
    }
    .story-text {
      font-size: 13px;
      line-height: 1.7;
      color: rgba(36, 49, 25, 0.85);
      margin-bottom: 35px;
      font-weight: 300;
    }
    .divider {
      border-top: 1px solid rgba(36, 49, 25, 0.1);
      margin: 30px 0;
    }
    .section-title {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      color: rgba(36, 49, 25, 0.5);
      margin-bottom: 15px;
      font-weight: bold;
    }
    .order-details {
      background-color: #FAF9F5;
      padding: 25px;
      margin-bottom: 35px;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 12px;
      font-size: 13px;
    }
    .detail-row:last-child {
      margin-bottom: 0;
    }
    .detail-label {
      color: rgba(36, 49, 25, 0.6);
      font-weight: 300;
    }
    .detail-value {
      font-weight: bold;
      color: #243119;
    }
    .shipping-box {
      border: 1px solid rgba(36, 49, 25, 0.08);
      padding: 25px;
      margin-bottom: 35px;
      font-size: 13px;
      line-height: 1.6;
    }
    .shipping-title {
      font-weight: bold;
      margin-bottom: 10px;
      color: #243119;
      text-transform: uppercase;
      font-size: 11px;
      letter-spacing: 0.1em;
    }
    .production-note {
      background-color: #FDFBF7;
      border-left: 3px solid #C5A059;
      padding: 15px;
      font-size: 12px;
      line-height: 1.6;
      font-style: italic;
      color: rgba(36, 49, 25, 0.8);
      margin-bottom: 35px;
    }
    .footer {
      text-align: center;
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      color: rgba(36, 49, 25, 0.4);
      line-height: 1.8;
    }
    .footer a {
      color: #C5A059;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <div class="logo">M★BRAVO</div>
        <div class="subtitle">Handmade with Love</div>
      </div>
      
      <div class="greeting">
        Olá, ${order.customer.nome}.<br>O seu pedido foi recebido com afeto.
      </div>

      <div class="story-text">
        Cada peça M★BRAVO é tecida à mão, respeitando o ritmo orgânico do trabalho artesanal e a nobreza das matérias-primas nacionais. O seu pedido acaba de dar entrada no nosso atelier e começará a ganhar forma pelas mãos da nossa equipa.
      </div>

      <div class="divider"></div>

      <div class="section-title">Detalhes do Pedido</div>
      <div class="order-details">
        <div class="detail-row">
          <span class="detail-label">ID da Encomenda:</span>
          <span class="detail-value" style="font-family: monospace;">${order.orderId}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Peça Selecionada:</span>
          <span class="detail-value">${order.productName}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Especificações:</span>
          <span class="detail-value">${order.selections.cor} ${order.selections.tamanho ? `| Tam. ${order.selections.tamanho}` : ''} ${order.selections.quantidade ? `| Qtd. ${order.selections.quantidade}` : ''}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Método de Pagamento:</span>
          <span class="detail-value" style="text-transform: uppercase;">${order.paymentMethod === 'mbway' ? 'MB WAY' : order.paymentMethod === 'multibanco' ? 'Referência Multibanco' : 'Cartão de Crédito'}</span>
        </div>
        <div class="detail-row" style="margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(36, 49, 25, 0.05); font-size: 15px;">
          <span class="detail-label" style="color: #243119; font-weight: bold;">Total:</span>
          <span class="detail-value" style="color: #A68244; font-weight: bold;">${order.price}</span>
        </div>
      </div>

      <div class="shipping-box">
        <div class="shipping-title">Morada de Entrega</div>
        <div style="font-weight: 300;">
          ${order.customer.morada}<br>
          ${order.customer.codigoPostal}, ${order.customer.cidade}<br>
          Telemóvel: ${order.customer.telefone}
        </div>
      </div>

      <div class="production-note">
        <strong>Nota de Confecção:</strong> Por se tratar de um processo meticuloso e 100% manual, estimamos que a sua peça seja expedida num prazo de 7 a 14 dias úteis. Receberá uma nova notificação com o código de acompanhamento assim que for enviada.
      </div>

      <div class="divider"></div>

      <div class="footer">
        M★BRAVO ATELIER &bull; PORTUGAL<br>
        <a href="mailto:handmade.mbravo@gmail.com">handmade.mbravo@gmail.com</a><br>
        <span style="font-size: 8px; margin-top: 15px; display: block; color: rgba(36, 49, 25, 0.25);">Esta é uma mensagem automática de confirmação de transação em Sandbox de Testes.</span>
      </div>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Renders the internal administrator notification template.
 * Highlights custom specifications, Atelier priority levels, and production workflows.
 */
function getAdminTemplate(order: OrderData): string {
  const specs = order.selections;
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>M BRAVO - Nova Encomenda Recebida</title>
  <style>
    body {
      background-color: #FAF9F6;
      color: #243119;
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 0;
    }
    .wrapper {
      width: 100%;
      background-color: #FAF9F6;
      padding: 40px 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #FFFFFF;
      border: 1px solid #EAE6DF;
      padding: 40px;
    }
    .header {
      border-bottom: 2px solid #243119;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .title {
      font-size: 20px;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      font-weight: bold;
      color: #243119;
    }
    .priority-badge {
      display: inline-block;
      background-color: ${order.priority.includes('ALTA') ? '#92400e' : '#243119'};
      color: #FFFFFF;
      font-size: 10px;
      font-weight: bold;
      letter-spacing: 0.1em;
      padding: 6px 12px;
      text-transform: uppercase;
      margin-top: 10px;
    }
    .section-title {
      font-size: 11px;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: rgba(36, 49, 25, 0.5);
      margin: 25px 0 10px 0;
      border-bottom: 1px solid #EAE6DF;
      padding-bottom: 5px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    td {
      padding: 8px 0;
      font-size: 13px;
      border-bottom: 1px solid #F3F1ED;
    }
    .label {
      color: rgba(36, 49, 25, 0.6);
      width: 150px;
    }
    .val {
      font-weight: bold;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <div class="title">Atelier M★BRAVO</div>
        <div class="priority-badge">Prioridade: ${order.priority}</div>
      </div>

      <div class="section-title">Dados da Transação</div>
      <table>
        <tr><td class="label">ID Encomenda:</td><td class="val">${order.orderId}</td></tr>
        <tr><td class="label">Data de Criação:</td><td class="val">${new Date(order.createdAt).toLocaleString('pt-PT')}</td></tr>
        <tr><td class="label">Método Pagamento:</td><td class="val" style="text-transform: uppercase;">${order.paymentMethod}</td></tr>
        <tr><td class="label">Valor Cobrado:</td><td class="val" style="color: #A68244;">${order.price}</td></tr>
      </table>

      <div class="section-title">Especificações do Produto</div>
      <table>
        <tr><td class="label">Peça:</td><td class="val">${order.productName}</td></tr>
        <tr><td class="label">Cor Principal:</td><td class="val">${specs.cor}</td></tr>
        <tr><td class="label">Tamanho:</td><td class="val">${specs.tamanho || 'Sob Medida'}</td></tr>
        <tr><td class="label">Quantidade:</td><td class="val">${specs.quantidade || '1'}</td></tr>
        ${specs.comprimento ? `<tr><td class="label">Comprimento:</td><td class="val">${specs.comprimento}</td></tr>` : ''}
        ${specs.manga ? `<tr><td class="label">Ajuste de Manga:</td><td class="val">${specs.manga}</td></tr>` : ''}
        ${specs.cintura ? `<tr><td class="label">Ajuste de Cintura:</td><td class="val">${specs.cintura}</td></tr>` : ''}
      </table>

      <div class="section-title">Contacto do Cliente</div>
      <table>
        <tr><td class="label">Nome:</td><td class="val">${order.customer.nome}</td></tr>
        <tr><td class="label">E-mail:</td><td class="val">${order.customer.email}</td></tr>
        <tr><td class="label">Telemóvel:</td><td class="val">${order.customer.telefone}</td></tr>
        <tr><td class="label">Morada:</td><td class="val">${order.customer.morada}, ${order.customer.codigoPostal} ${order.customer.cidade}</td></tr>
      </table>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Primary action to send transaction emails after a successful checkout.
 * Dispatches Client Confirmation and notifies Admin, with a fallback local file system logging.
 */
export function sendTransactionEmails(order: OrderData): { clientPreviewLink?: string; adminPreviewLink?: string } {
  const clientHtml = getReceiptTemplate(order);
  const adminHtml = getAdminTemplate(order);

  const clientFileName = `${order.orderId}-recibo-cliente.html`;
  const adminFileName = `${order.orderId}-admin-notificacao.html`;

  const publicEmailsDir = path.join(process.cwd(), 'public', 'emails');

  try {
    if (!fs.existsSync(publicEmailsDir)) {
      fs.mkdirSync(publicEmailsDir, { recursive: true });
    }
    fs.writeFileSync(path.join(publicEmailsDir, clientFileName), clientHtml);
    fs.writeFileSync(path.join(publicEmailsDir, adminFileName), adminHtml);
    console.log(`[M.BRAVO EMAIL SYSTEM] Local sandbox HTML previews created:`);
    console.log(`  - Client Link: /emails/${clientFileName}`);
    console.log(`  - Admin Link: /emails/${adminFileName}`);
  } catch (fsErr) {
    console.error("[M.BRAVO EMAIL SYSTEM] Failed to write local sandbox HTML files:", fsErr);
  }

  // Check for SendGrid API key to trigger production emails
  if (process.env.SENDGRID_API_KEY && process.env.SENDGRID_API_KEY.trim() !== "") {
    console.log(`[M.BRAVO EMAIL SYSTEM] SendGrid API Key identified. Initiating dispatch to client: ${order.customer.email}`);
    
    // Dispatch Client Receipt
    sendSendGridEmail(order.customer.email, `M BRAVO - Confirmação de Pedido #${order.orderId}`, clientHtml)
      .then(() => console.log(`[M.BRAVO EMAIL SYSTEM] Client receipt dispatched to: ${order.customer.email}`))
      .catch(err => {
        console.warn(`\n[M.BRAVO EMAIL SYSTEM WARNING] Could not send Client receipt email via SendGrid:`);
        console.warn(`  - Logged Detail: ${err.message}`);
        console.warn(`  - Action: Ensure your SendGrid Sender Identity aligns with the "from" address ('${process.env.FROM_EMAIL || 'encomendas@mbravobycarolina.com'}').`);
        console.warn(`  - Sandbox Status: Local template preview generated successfully at /emails/${clientFileName}\n`);
      });

    // Dispatch Admin Notification
    const adminEmailDest = process.env.ADMIN_NOTIFY_EMAIL || "joaopedrojota83@gmail.com";
    console.log(`[M.BRAVO EMAIL SYSTEM] Dispatched administrative notify to: ${adminEmailDest}`);
    sendSendGridEmail(adminEmailDest, `[ATELIER NOTIFY] Nova Encomenda #${order.orderId} (${order.priority})`, adminHtml)
      .then(() => console.log(`[M.BRAVO EMAIL SYSTEM] Admin receipt dispatched to: ${adminEmailDest}`))
      .catch(err => {
        console.warn(`\n[M.BRAVO EMAIL SYSTEM WARNING] Could not send Admin notification email via SendGrid:`);
        console.warn(`  - Logged Detail: ${err.message}`);
        console.warn(`  - Action: Ensure your SendGrid Sender Identity aligns with the "from" address ('${process.env.FROM_EMAIL || 'encomendas@mbravobycarolina.com'}').`);
        console.warn(`  - Sandbox Status: Local template preview generated successfully at /emails/${adminFileName}\n`);
      });
  } else {
    console.warn("\n==================================================================");
    console.warn("[M.BRAVO EMAIL SYSTEM NOTICE]");
    console.warn("SENDGRID_API_KEY was not found in environment variables.");
    console.warn("Emails will be simulated. Please check the local HTML generated previews:");
    console.warn(`Client link: /emails/${clientFileName}`);
    console.warn(`Admin link: /emails/${adminFileName}`);
    console.warn("==================================================================\n");
  }

  return {
    clientPreviewLink: `/emails/${clientFileName}`,
    adminPreviewLink: `/emails/${adminFileName}`
  };
}

/**
 * Generates an elegant email with Bank Transfer / Multibanco instructions.
 */
function getMultibancoTemplate(order: OrderData, ref: { entidade: string; referencia: string }): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>M BRAVO - Instruções de Pagamento</title>
  <style>
    body {
      background-color: #F8F6F0;
      color: #243119;
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      background-color: #F8F6F0;
      padding: 40px 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #FFFFFF;
      border: 1px solid rgba(36, 49, 25, 0.08);
      padding: 50px;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
    }
    .logo {
      font-size: 24px;
      letter-spacing: 0.3em;
      font-weight: bold;
      color: #243119;
      text-transform: uppercase;
      margin-bottom: 5px;
    }
    .subtitle {
      font-size: 10px;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: rgba(36, 49, 25, 0.5);
    }
    .greeting {
      font-size: 18px;
      line-height: 1.6;
      font-weight: 300;
      color: #243119;
      margin-bottom: 25px;
    }
    .instruction-text {
      font-size: 13px;
      line-height: 1.7;
      color: rgba(36, 49, 25, 0.85);
      margin-bottom: 30px;
      font-weight: 300;
    }
    .divider {
      border-top: 1px solid rgba(36, 49, 25, 0.1);
      margin: 30px 0;
    }
    .payment-box {
      background-color: #FAF9F5;
      border: 1px solid rgba(166, 130, 68, 0.15);
      padding: 30px;
      margin: 30px 0;
    }
    .payment-title {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      color: #A68244;
      font-weight: bold;
      margin-bottom: 20px;
      text-align: center;
    }
    .payment-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 12px;
      font-size: 14px;
      border-bottom: 1px dashed rgba(36, 49, 25, 0.08);
      padding-bottom: 10px;
    }
    .payment-row:last-child {
      border-bottom: none;
      margin-bottom: 0;
      padding-bottom: 0;
    }
    .payment-label {
      color: rgba(36, 49, 25, 0.6);
      font-weight: 300;
    }
    .payment-value {
      font-weight: bold;
      font-family: monospace;
      font-size: 15px;
    }
    .footer {
      text-align: center;
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      color: rgba(36, 49, 25, 0.4);
      line-height: 1.8;
    }
    .footer a {
      color: #C5A059;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <div class="logo">M★BRAVO</div>
        <div class="subtitle">Handmade with Love</div>
      </div>
      
      <div class="greeting">
        Olá, ${order.customer.nome}.<br>A sua referência Multibanco foi gerada.
      </div>

      <div class="instruction-text">
        Para concluir a sua encomenda M★BRAVO, efetue o pagamento com os dados abaixo através de Homebanking ou caixa ATM (Pagamento de Serviços).
      </div>

      <div class="payment-box">
        <div class="payment-title">Dados para Pagamento</div>
        <div class="payment-row">
          <span class="payment-label">Entidade:</span>
          <span class="payment-value">${ref.entidade}</span>
        </div>
        <div class="payment-row">
          <span class="payment-label">Referência:</span>
          <span class="payment-value">${ref.referencia}</span>
        </div>
        <div class="payment-row">
          <span class="payment-label">Montante:</span>
          <span class="payment-value" style="color: #A68244; font-size: 16px;">${order.price}</span>
        </div>
      </div>

      <div class="instruction-text" style="font-size: 12px; font-style: italic; color: rgba(36, 49, 25, 0.6);">
        Nota: O prazo limite para pagamento desta referência é de 3 dias. Assim que efetuar o pagamento, receberá um e-mail de confirmação automático e iniciaremos a confecção da sua peça.
      </div>

      <div class="divider"></div>

      <div class="footer">
        M★BRAVO ATELIER &bull; PORTUGAL<br>
        <a href="mailto:handmade.mbravo@gmail.com">handmade.mbravo@gmail.com</a><br>
        <span style="font-size: 8px; margin-top: 15px; display: block; color: rgba(36, 49, 25, 0.25);">Esta é uma mensagem de instruções de pagamento automático para encomenda em processamento.</span>
      </div>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Handles dispatching Multibanco pay instructions.
 */
export function sendMultibancoEmails(order: OrderData, ref: { entidade: string; referencia: string }): { clientPreviewLink?: string } {
  const mbHtml = getMultibancoTemplate(order, ref);
  const clientFileName = `${order.orderId}-instrucoes-pagamento.html`;

  const publicEmailsDir = path.join(process.cwd(), 'public', 'emails');

  try {
    if (!fs.existsSync(publicEmailsDir)) {
      fs.mkdirSync(publicEmailsDir, { recursive: true });
    }
    fs.writeFileSync(path.join(publicEmailsDir, clientFileName), mbHtml);
    console.log(`[M.BRAVO MULTIBANCO] Local instructions page created: /emails/${clientFileName}`);
  } catch (err) {
    console.error("[M.BRAVO MULTIBANCO] Local file write failed:", err);
  }

  if (process.env.SENDGRID_API_KEY && process.env.SENDGRID_API_KEY.trim() !== "") {
    sendSendGridEmail(order.customer.email, `M BRAVO - Dados para Pagamento #${order.orderId}`, mbHtml)
      .then(() => console.log(`[M.BRAVO MULTIBANCO] Dispatched instructions directly to client inbox: ${order.customer.email}`))
      .catch(err => {
        console.warn(`[M.BRAVO EMAIL SYSTEM WARNING] Could not send Multibanco instructions: ${err.message}`);
      });
  }

  return {
    clientPreviewLink: `/emails/${clientFileName}`
  };
}

/**
 * Underlying helper that sends standard Web requests towards SendGrid's API v3.
 * Eliminates custom libraries, ensuring high speed and complete platform portability.
 */
async function sendSendGridEmail(toEmail: string, subject: string, htmlContent: string): Promise<void> {
  const apiKey = process.env.SENDGRID_API_KEY;
  if (!apiKey) {
    throw new Error("SENDGRID_API_KEY not configured");
  }

  const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: toEmail }] }],
      from: { email: process.env.FROM_EMAIL || 'encomendas@mbravobycarolina.com', name: 'M BRAVO' },
      subject: subject,
      content: [{ type: 'text/html', value: htmlContent }]
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`SendGrid API bad status: ${response.status} - ${errText}`);
  }
}
