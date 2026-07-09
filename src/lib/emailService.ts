import fs from 'fs';
import path from 'path';

export interface OrderData {
  orderId: string;
  productName: string;
  price: string;
  selections: {
    cor: string;
    tamanho?: string;
    quantidade?: string;
  };
  customer: {
    nome: string;
    email: string;
    telefone: string;
    morada: string;
    codigoPostal: string;
    cidade: string;
  };
  paymentMethod: 'mbway' | 'multibanco' | 'card';
  status: 'pending_payment' | 'paid' | 'failed';
  priority: 'ALTA (Atelier Urgente)' | 'NORMAL';
  createdAt: string;
}

/**
 * Generates the elegant cream & forest green customer purchase confirmation HTML email template.
 */
export function generateCustomerEmailHtml(order: OrderData): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmação de Encomenda - M★BRAVO</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #F5F2ED;
      color: #243119;
      font-family: 'Georgia', 'Garamond', serif;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      background-color: #F5F2ED;
      padding: 40px 20px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #FCFBF9;
      border: 1px solid rgba(36, 49, 25, 0.08);
      border-radius: 4px;
      padding: 50px 40px;
      box-shadow: 0 10px 30px rgba(36, 49, 25, 0.02);
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
      margin-bottom: 10px;
      display: inline-block;
      border-bottom: 1px solid #C5A059;
      padding-bottom: 5px;
    }
    .subtitle {
      font-size: 9px;
      text-transform: uppercase;
      letter-spacing: 0.4em;
      color: #C5A059;
      font-weight: bold;
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    }
    .greeting {
      font-size: 20px;
      line-height: 1.5;
      font-style: italic;
      text-align: center;
      margin-bottom: 30px;
      font-weight: 300;
    }
    .divider {
      height: 1px;
      background-color: rgba(36, 49, 25, 0.08);
      margin: 30px 0;
    }
    .story-text {
      font-size: 14px;
      line-height: 1.8;
      color: rgba(36, 49, 25, 0.85);
      text-align: justify;
      margin-bottom: 30px;
      font-weight: 300;
    }
    .order-details {
      background-color: #FBF9F6;
      border: 1px solid rgba(197, 160, 89, 0.15);
      border-radius: 8px;
      padding: 25px;
      margin-bottom: 30px;
    }
    .section-title {
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.2em;
      color: #A68244;
      font-weight: bold;
      margin-bottom: 15px;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
      font-size: 13px;
    }
    .detail-label {
      color: rgba(36, 49, 25, 0.5);
      font-weight: 300;
    }
    .detail-value {
      font-weight: bold;
      text-align: right;
    }
    .shipping-box {
      font-size: 13px;
      line-height: 1.6;
      color: rgba(36, 49, 25, 0.8);
      margin-bottom: 30px;
    }
    .shipping-title {
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.2em;
      color: rgba(36, 49, 25, 0.5);
      font-weight: bold;
      margin-bottom: 8px;
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
 * Generates the administrator notification HTML email template.
 */
export function generateAdminEmailHtml(order: OrderData): string {
  const priorityColor = order.priority.includes('ALTA') ? '#922B21' : '#243119';
  
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>[NOVO PEDIDO] M BRAVO - ${order.orderId}</title>
  <style>
    body {
      background-color: #f4f4f4;
      color: #333;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, sans-serif;
      padding: 20px;
    }
    .card {
      max-width: 600px;
      margin: 0 auto;
      background: white;
      border: 1px solid #ddd;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    }
    .header {
      background-color: #243119;
      color: #F5F2ED;
      padding: 20px 25px;
    }
    .header h2 {
      margin: 0;
      font-size: 18px;
      letter-spacing: 0.1em;
      text-transform: uppercase;
    }
    .priority-badge {
      display: inline-block;
      background-color: ${priorityColor};
      color: white;
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 10px;
      font-weight: bold;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      margin-top: 8px;
    }
    .content {
      padding: 25px;
    }
    .section-title {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #888;
      border-bottom: 1px solid #eee;
      padding-bottom: 5px;
      margin-top: 20px;
      margin-bottom: 12px;
    }
    .field-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: 13px;
    }
    .label {
      color: #666;
    }
    .value {
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h2>M★BRAVO &bull; Notificação de Atelier</h2>
      <div class="priority-badge">Prioridade: ${order.priority}</div>
    </div>
    <div class="content">
      <p style="font-size: 14px; margin-top: 0;">Novo pedido recebido e processado com sucesso. Status do pagamento: <strong>PAGO (Aprovado em Sandbox)</strong>.</p>
      
      <div class="section-title">Dados de Production</div>
      <div class="field-row">
        <span class="label">ID Encomenda:</span>
        <span class="value" style="font-family: monospace;">${order.orderId}</span>
      </div>
      <div class="field-row">
        <span class="label">Modelo:</span>
        <span class="value">${order.productName}</span>
      </div>
      <div class="field-row">
        <span class="label">Cor Selecionada:</span>
        <span class="value">${order.selections.cor}</span>
      </div>
      <div class="field-row">
        <span class="label">Tamanho:</span>
        <span class="value">${order.selections.tamanho || 'Customizado'}</span>
      </div>
      <div class="field-row">
        <span class="label">Quantidade:</span>
        <span class="value">${order.selections.quantidade || '1'}</span>
      </div>
      <div class="field-row">
        <span class="label">Método Pagamento:</span>
        <span class="value" style="text-transform: uppercase;">${order.paymentMethod}</span>
      </div>
      <div class="field-row">
        <span class="label">Total da Venda:</span>
        <span class="value" style="color: #243119;">${order.price}</span>
      </div>

      <div class="section-title">Dados de Envio & Contato Cliente</div>
      <div class="field-row">
        <span class="label">Nome Cliente:</span>
        <span class="value">${order.customer.nome}</span>
      </div>
      <div class="field-row">
        <span class="label">E-mail:</span>
        <span class="value">${order.customer.email}</span>
      </div>
      <div class="field-row">
        <span class="label">Contacto:</span>
        <span class="value">${order.customer.telefone}</span>
      </div>
      <div class="field-row" style="margin-bottom: 2px;">
        <span class="label">Morada:</span>
        <span class="value" style="text-align: right; max-width: 70%;">${order.customer.morada}</span>
      </div>
      <div class="field-row">
        <span class="label">Código Postal / Cidade:</span>
        <span class="value">${order.customer.codigoPostal}, ${order.customer.cidade}</span>
      </div>

      <div class="section-title">Instruções Próximas Horas</div>
      <p style="font-size: 12px; color: #555; line-height: 1.5; margin-bottom: 0;">
        1. Validar as dimensões do molde para o tamanho <strong>${order.selections.tamanho || 'Sob Medida'}</strong>.<br>
        2. Reservar o novelo de fio de cor <strong>${order.selections.cor}</strong> no estoque.<br>
        3. Emitir a etiqueta em couro M★BRAVO correspondente ao pedido.
      </p>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Main service method that log-creates visual template previews on-disk,
 * triggers terminal logs, and integrates actual email gateways when keys are provided.
 */
export function sendTransactionEmails(order: OrderData): { customerEmailUrl: string; adminEmailUrl: string } {
  const customerHtml = generateCustomerEmailHtml(order);
  const adminHtml = generateAdminEmailHtml(order);

  const publicEmailsDir = path.join(process.cwd(), 'public', 'emails');
  
  if (!fs.existsSync(publicEmailsDir)) {
    fs.mkdirSync(publicEmailsDir, { recursive: true });
  }

  const custFileName = `customer-${order.orderId}.html`;
  const adminFileName = `admin-${order.orderId}.html`;

  fs.writeFileSync(path.join(publicEmailsDir, custFileName), customerHtml, 'utf-8');
  fs.writeFileSync(path.join(publicEmailsDir, adminFileName), adminHtml, 'utf-8');

  console.log(`[M.BRAVO EMAIL SYSTEM] Emails generated in Sandbox mode!`);
  console.log(`  - Customer confirmation: /emails/${custFileName}`);
  console.log(`  - Admin Atelier Notification: /emails/${adminFileName}`);

  const hasSendGridKey = process.env.SENDGRID_API_KEY && 
                        process.env.SENDGRID_API_KEY !== "" && 
                        process.env.SENDGRID_API_KEY.startsWith("SG.") &&
                        !process.env.SENDGRID_API_KEY.includes("INSERT_") &&
                        !process.env.SENDGRID_API_KEY.includes("YOUR_") &&
                        !process.env.SENDGRID_API_KEY.includes("mock") &&
                        !process.env.SENDGRID_API_KEY.includes("test");

  if (hasSendGridKey) {
    console.log(`[M.BRAVO EMAIL SYSTEM] SendGrid API Key detected! Dispatched live email requests in background...`);
    
    sendViaSendGrid(process.env.SENDGRID_API_KEY!, order.customer.email, `M BRAVO | Encomenda Confirmada - ${order.orderId}`, customerHtml)
      .then(() => console.log(`[M.BRAVO EMAIL SYSTEM] Customer email sent successfully via SendGrid.`))
      .catch(err => {
        console.warn(`\n[M.BRAVO EMAIL SYSTEM WARNING] Could not send Customer email via SendGrid:`);
        console.warn(`  - Logged Detail: ${err.message}`);
        console.warn(`  - Sandbox Status: Local template preview generated successfully at /emails/${custFileName}\n`);
      });

    const adminEmail = process.env.ADMIN_NOTIFY_EMAIL || 'joaopedrojota83@gmail.com';
    sendViaSendGrid(process.env.SENDGRID_API_KEY!, adminEmail, `[NOVO PEDIDO] ${order.orderId} - Prioridade Atelier`, adminHtml)
      .then(() => console.log(`[M.BRAVO EMAIL SYSTEM] Admin notification email sent successfully via SendGrid.`))
      .catch(err => {
        console.warn(`\n[M.BRAVO EMAIL SYSTEM WARNING] Could not send Admin notification email via SendGrid:`);
        console.warn(`  - Logged Detail: ${err.message}`);
        console.warn(`  - Sandbox Status: Local template preview generated successfully at /emails/${adminFileName}\n`);
      });
  } else {
    console.log(`[M.BRAVO EMAIL SYSTEM] Live SendGrid key absent or unconfigured. Falling back entirely to
