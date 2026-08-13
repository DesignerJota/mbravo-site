import fs from 'fs';
import path from 'path';

const FROM_EMAIL = process.env.FROM_EMAIL || 'encomendas@mbravobycarolina.com';
const NOTIFICATION_EMAIL = process.env.NOTIFICATION_EMAIL || 'handmade.mbravo@gmail.com';

export interface OrderData {
  orderId: string;
  productName: string;
  price: string;
  selections: {
    cor: string;
    tamanho?: string;
    quantidade?: string;
    hasSize?: boolean;
  };
  customer: {
    nome: string;
    email: string;
    telefone: string;
    morada: string;
    codigoPostal: string;
    cidade: string;
    nif?: string;
  };
  paymentMethod: 'mbway' | 'multibanco' | 'card' | string;
  status: 'pending_payment' | 'paid' | 'failed' | string;
  priority: 'ALTA (Atelier Urgente)' | 'NORMAL' | string;
  createdAt: string;
  isTestMode?: boolean;
}

/**
 * Formats phone numbers into a clean, human-readable masked format (e.g., +351 917 827 458).
 */
export function formatPhoneReadable(phone?: string): string {
  if (!phone) return '';
  const trimmed = phone.trim();
  if (!trimmed) return '';

  const hasPlus = trimmed.startsWith('+');
  const digits = trimmed.replace(/\D/g, '');
  if (!digits) return trimmed;

  if (digits.startsWith('351') && digits.length === 12) {
    return `+351 ${digits.slice(3, 6)} ${digits.slice(6, 9)} ${digits.slice(9)}`;
  } else if (digits.length === 9) {
    return `+351 ${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
  } else if (digits.startsWith('351') && digits.length > 9) {
    const rest = digits.slice(3);
    if (rest.length === 9) {
      return `+351 ${rest.slice(0, 3)} ${rest.slice(3, 6)} ${rest.slice(6)}`;
    }
    return `+351 ${rest}`;
  } else if (hasPlus) {
    if (digits.length <= 10) {
      return `+${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
    }
    return `+${digits}`;
  } else if (digits.length === 10) {
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
  }

  return trimmed;
}

/**
 * Helper to determine if a product has a valid explicit sizing selection
 */
export function hasValidSize(tamanho?: string, hasSizeFlag?: boolean): boolean {
  if (hasSizeFlag === false) return false;
  if (!tamanho) return false;
  const clean = tamanho.trim().toLowerCase();
  const invalidValues = [
    'n/a', 'na', 'none', 'não aplicável', 'nao aplicavel',
    'único', 'unico', 'padrão', 'padrao', 'nenhum', '-', ''
  ];
  return !invalidValues.includes(clean);
}

/**
 * Dynamically formats product specification attributes (Color, Size, Quantity)
 * rendering only attributes actually selected by the customer.
 */
export function formatOrderSpecifications(selections: OrderData['selections']): string {
  const parts: string[] = [];
  
  if (selections?.cor && selections.cor.trim() !== '' && !['n/a', 'na', 'nenhum', 'padrão', 'padrao', '-'].includes(selections.cor.trim().toLowerCase())) {
    parts.push(`Cor: ${selections.cor.trim()}`);
  }
  
  if (hasValidSize(selections?.tamanho, selections?.hasSize)) {
    parts.push(`Tam. ${selections.tamanho!.trim()}`);
  }
  
  if (selections?.quantidade && selections.quantidade.trim() !== '') {
    parts.push(`Qtd. ${selections.quantidade.trim()}`);
  }
  
  return parts.length > 0 ? parts.join(' | ') : 'Padrão Atelier';
}

/**
 * Generates the elegant cream & forest green customer purchase confirmation HTML email template.
 */
export function generateCustomerEmailHtml(order: OrderData): string {
  const showSize = hasValidSize(order.selections?.tamanho, order.selections?.hasSize);
  const corText = order.selections?.cor && order.selections.cor.trim() !== '' && !['n/a', 'na', 'nenhum', 'padrão', 'padrao', '-'].includes(order.selections.cor.trim().toLowerCase())
    ? order.selections.cor.trim()
    : null;
  const rawQtd = order.selections?.quantidade && order.selections.quantidade.trim() !== '' ? order.selections.quantidade.trim() : '1';
  const qtdFormatted = `${rawQtd} ${rawQtd === '1' ? 'unidade' : 'unidades'}`;
  const footerNotice = 'Esta é uma mensagem automática de confirmação de encomenda M★BRAVO.';

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmação de Encomenda - M★BRAVO</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F5F2ED; color: #243119; font-family: 'Georgia', 'Garamond', serif; -webkit-font-smoothing: antialiased;">
  <div class="wrapper" style="width: 100%; background-color: #F5F2ED; padding: 40px 0; font-family: 'Georgia', 'Garamond', serif;">
    <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #FCFBF9; border: 1px solid rgba(36, 49, 25, 0.08); border-radius: 4px; box-shadow: 0 10px 30px rgba(36, 49, 25, 0.02); margin: 0 auto;">
      <tr>
        <td style="padding: 50px 40px;">
          <!-- HEADER -->
          <table align="center" border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto 40px auto; text-align: center;">
            <tr>
              <td align="center">
                <table align="center" border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                  <tr>
                    <td align="center" style="border-bottom: 1px solid #C5A059; padding-bottom: 5px; font-size: 24px; letter-spacing: 0.3em; font-weight: bold; color: #243119; text-transform: uppercase; font-family: 'Georgia', 'Garamond', serif;">
                      M★BRAVO
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td align="center" style="font-size: 9px; text-transform: uppercase; letter-spacing: 0.4em; color: #C5A059; font-weight: bold; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding-top: 10px;">
                Handmade with Love
              </td>
            </tr>
          </table>

          <!-- GREETING -->
          <div style="font-size: 20px; line-height: 1.5; font-style: italic; text-align: center; margin-bottom: 25px; font-weight: 300; color: #243119;">
            Olá, ${order.customer.nome}.<br>O seu pagamento foi confirmado!
          </div>

          <!-- RECEIPT BANNER -->
          <div style="background-color: #E2EAD9; border: 1px solid #BACAA5; border-radius: 8px; padding: 18px; margin-bottom: 30px; text-align: center; font-family: 'Georgia', 'Garamond', serif;">
            <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 10px; text-transform: uppercase; letter-spacing: 0.25em; color: #243119; font-weight: bold; margin-bottom: 6px;">
              PAGAMENTO CONFIRMADO &bull; RECIBO
            </div>
            <div style="font-size: 13px; color: #243119; font-style: italic; line-height: 1.5;">
              O seu pagamento foi validado com sucesso e o recibo referente a esta encomenda encontra-se emitido abaixo.
            </div>
          </div>

          <!-- STORY TEXT -->
          <div style="font-size: 14px; line-height: 1.8; color: rgba(36, 49, 25, 0.85); text-align: justify; margin-bottom: 30px; font-weight: 300;">
            Confirmamos com gosto a receção do seu pedido. A sua peça M★BRAVO foi integrada no nosso calendário de produção e começará em breve a ser moldada à mão no atelier com o ritmo e rigor que o trabalho artesanal exige.
          </div>

          <!-- DIVIDER -->
          <div style="height: 1px; background-color: rgba(36, 49, 25, 0.08); margin: 30px 0;"></div>

          <!-- ORDER DETAILS TITLE -->
          <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 10px; text-transform: uppercase; letter-spacing: 0.2em; color: #A68244; font-weight: bold; margin-bottom: 15px;">
            Artigos & Dados Faturação
          </div>

          <!-- ORDER DETAILS TABLE -->
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #FBF9F6; border: 1px solid rgba(197, 160, 89, 0.15); border-radius: 8px; border-collapse: separate; border-spacing: 0; font-family: 'Georgia', 'Garamond', serif; margin-bottom: 30px;">
            <tr>
              <td style="padding: 25px;">
                <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                  <!-- Row: ID -->
                  <tr>
                    <td style="color: rgba(36, 49, 25, 0.5); font-weight: 300; padding-bottom: 12px; font-size: 13px; text-align: left; border-bottom: 1px dashed rgba(36, 49, 25, 0.08);">ID da Encomenda:</td>
                    <td align="right" style="font-weight: bold; font-family: monospace; padding-bottom: 12px; font-size: 13px; color: #243119; text-align: right; border-bottom: 1px dashed rgba(36, 49, 25, 0.08);">${order.orderId}</td>
                  </tr>
                  <!-- Row: Peça -->
                  <tr>
                    <td style="color: rgba(36, 49, 25, 0.5); font-weight: 300; padding-top: 12px; padding-bottom: 12px; font-size: 13px; text-align: left; border-bottom: 1px dashed rgba(36, 49, 25, 0.08);">Peça Selecionada:</td>
                    <td align="right" style="font-weight: bold; padding-top: 12px; padding-bottom: 12px; font-size: 13px; color: #243119; text-align: right; border-bottom: 1px dashed rgba(36, 49, 25, 0.08);">${order.productName}</td>
                  </tr>
                  ${corText ? `
                  <!-- Row: Tom / Cor -->
                  <tr>
                    <td style="color: rgba(36, 49, 25, 0.5); font-weight: 300; padding-top: 12px; padding-bottom: 12px; font-size: 13px; text-align: left; border-bottom: 1px dashed rgba(36, 49, 25, 0.08);">Tom / Cor:</td>
                    <td align="right" style="font-weight: bold; padding-top: 12px; padding-bottom: 12px; font-size: 13px; color: #243119; text-align: right; border-bottom: 1px dashed rgba(36, 49, 25, 0.08);">${corText}</td>
                  </tr>
                  ` : ''}
                  ${showSize ? `
                  <!-- Row: Tamanho -->
                  <tr>
                    <td style="color: rgba(36, 49, 25, 0.5); font-weight: 300; padding-top: 12px; padding-bottom: 12px; font-size: 13px; text-align: left; border-bottom: 1px dashed rgba(36, 49, 25, 0.08);">Tamanho:</td>
                    <td align="right" style="font-weight: bold; padding-top: 12px; padding-bottom: 12px; font-size: 13px; color: #243119; text-align: right; border-bottom: 1px dashed rgba(36, 49, 25, 0.08);">${order.selections.tamanho}</td>
                  </tr>
                  ` : ''}
                  <!-- Row: Quantidade -->
                  <tr>
                    <td style="color: rgba(36, 49, 25, 0.5); font-weight: 300; padding-top: 12px; padding-bottom: 12px; font-size: 13px; text-align: left; border-bottom: 1px dashed rgba(36, 49, 25, 0.08);">Quantidade:</td>
                    <td align="right" style="font-weight: bold; padding-top: 12px; padding-bottom: 12px; font-size: 13px; color: #243119; text-align: right; border-bottom: 1px dashed rgba(36, 49, 25, 0.08);">${qtdFormatted}</td>
                  </tr>
                  <!-- Row: Método de Pagamento -->
                  <tr>
                    <td style="color: rgba(36, 49, 25, 0.5); font-weight: 300; padding-top: 12px; padding-bottom: 12px; font-size: 13px; text-align: left; border-bottom: 1px dashed rgba(36, 49, 25, 0.08);">Método de Pagamento:</td>
                    <td align="right" style="font-weight: bold; text-transform: uppercase; padding-top: 12px; padding-bottom: 12px; font-size: 13px; color: #243119; text-align: right; border-bottom: 1px dashed rgba(36, 49, 25, 0.08);">${order.paymentMethod === 'mbway' ? 'MB WAY' : order.paymentMethod === 'multibanco' ? 'Referência Multibanco' : 'Cartão de Crédito'}</td>
                  </tr>
                  ${order.customer.nif ? `
                  <!-- Row: NIF -->
                  <tr>
                    <td style="color: rgba(36, 49, 25, 0.5); font-weight: 300; padding-top: 12px; padding-bottom: 12px; font-size: 13px; text-align: left; border-bottom: 1px dashed rgba(36, 49, 25, 0.08);">NIF do Adquirente:</td>
                    <td align="right" style="font-weight: bold; padding-top: 12px; padding-bottom: 12px; font-size: 13px; color: #243119; text-align: right; border-bottom: 1px dashed rgba(36, 49, 25, 0.08);">${order.customer.nif}</td>
                  </tr>
                  ` : ''}
                  <!-- Row: Estado Pagamento -->
                  <tr>
                    <td style="color: rgba(36, 49, 25, 0.5); font-weight: 300; padding-top: 12px; padding-bottom: 15px; font-size: 13px; text-align: left; border-bottom: 1px solid rgba(36, 49, 25, 0.05);">Estado da Transação:</td>
                    <td align="right" style="font-weight: bold; text-transform: uppercase; padding-top: 12px; padding-bottom: 15px; font-size: 13px; color: #243119; text-align: right; border-bottom: 1px solid rgba(36, 49, 25, 0.05);">LIQUIDADO / CONFIRMADO</td>
                  </tr>
                  <!-- Row: Total -->
                  <tr>
                    <td style="color: #243119; font-weight: bold; padding-top: 15px; font-size: 15px; text-align: left;">Total Recebido:</td>
                    <td align="right" style="color: #A68244; font-weight: bold; padding-top: 15px; font-size: 16px; text-align: right;">${order.price}</td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          <!-- SHIPPING BOX -->
          <div style="font-size: 13px; line-height: 1.6; color: rgba(36, 49, 25, 0.8); margin-bottom: 30px;">
            <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 10px; text-transform: uppercase; letter-spacing: 0.2em; color: rgba(36, 49, 25, 0.5); font-weight: bold; margin-bottom: 8px;">
              Morada de Entrega
            </div>
            <div style="font-weight: 300; color: #243119;">
              ${order.customer.morada}<br>
              ${order.customer.codigoPostal}, ${order.customer.cidade}<br>
              Telemóvel: ${formatPhoneReadable(order.customer.telefone)}
            </div>
          </div>

          <!-- PRODUCTION NOTE -->
          <div style="background-color: #FDFBF7; border-left: 3px solid #C5A059; padding: 15px; font-size: 12px; line-height: 1.6; font-style: italic; color: rgba(36, 49, 25, 0.8); margin-bottom: 35px;">
            <strong>Nota de Produção Artesanal:</strong> Por se tratar de um processo meticuloso e 100% manual, estimamos que a sua peça seja expedida num prazo de 7 a 14 dias úteis. Receberá uma nova notificação com o código de acompanhamento assim que for enviada.
          </div>

          <!-- DIVIDER -->
          <div style="height: 1px; background-color: rgba(36, 49, 25, 0.08); margin: 30px 0;"></div>

          <!-- FOOTER -->
          <div style="text-align: center; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 10px; text-transform: uppercase; letter-spacing: 0.15em; color: rgba(36, 49, 25, 0.4); line-height: 1.8;">
            M★BRAVO ATELIER &bull; PORTUGAL<br>
            <a href="mailto:${FROM_EMAIL}" style="color: #C5A059; text-decoration: none;">${FROM_EMAIL}</a><br>
            <span style="font-size: 8px; margin-top: 15px; display: block; color: rgba(36, 49, 25, 0.25); text-transform: none; letter-spacing: normal;">${footerNotice}</span>
          </div>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>`;
}

/**
 * Generates the administrator notification HTML email template.
 */
export function generateAdminEmailHtml(order: OrderData): string {
  const priorityColor = order.priority.includes('ALTA') ? '#922B21' : '#243119';
  const showSize = hasValidSize(order.selections.tamanho, order.selections.hasSize);
  const corText = order.selections?.cor && order.selections.cor.trim() && !['n/a', 'na', 'nenhum', 'padrão', 'padrao', '-'].includes(order.selections.cor.trim().toLowerCase()) 
    ? order.selections.cor.trim() 
    : null;
  
  const paymentStatusText = order.status === 'paid'
    ? 'PAGO & LIQUIDADO (Confirmado via Stripe)'
    : order.status.toUpperCase();

  const instructionStep1 = showSize
    ? `1. Validar as dimensões do molde para o tamanho <strong>${order.selections.tamanho}</strong>.<br>`
    : `1. Preparar a base do modelo <strong>${order.productName}</strong>${corText ? ` na cor <strong>${corText}</strong>` : ''}.<br>`;

  const instructionStep2 = corText
    ? `2. Reservar o novelo de fio de cor <strong>${corText}</strong> no stock.<br>`
    : `2. Separar as matérias-primas de produção correspondentes.<br>`;

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
      <p style="font-size: 14px; margin-top: 0;">Novo pedido recebido e processado com sucesso. Status do pagamento: <strong>${paymentStatusText}</strong>.</p>
      
      <div class="section-title">Dados de Produção</div>
      <div class="field-row">
        <span class="label">ID Encomenda:</span>
        <span class="value" style="font-family: monospace;">${order.orderId}</span>
      </div>
      <div class="field-row">
        <span class="label">Modelo:</span>
        <span class="value">${order.productName}</span>
      </div>
      ${corText ? `
      <div class="field-row">
        <span class="label">Cor Selecionada:</span>
        <span class="value">${corText}</span>
      </div>
      ` : ''}
      ${showSize ? `
      <div class="field-row">
        <span class="label">Tamanho:</span>
        <span class="value">${order.selections.tamanho}</span>
      </div>
      ` : ''}
      <div class="field-row">
        <span class="label">Quantidade:</span>
        <span class="value">${order.selections.quantidade || '1'}</span>
      </div>
      <div class="field-row">
        <span class="label">Método Pagamento:</span>
        <span class="value" style="text-transform: uppercase;">${order.paymentMethod === 'mbway' ? 'MB WAY' : order.paymentMethod === 'multibanco' ? 'Multibanco' : 'Cartão de Crédito'}</span>
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
        <span class="value">${formatPhoneReadable(order.customer.telefone)}</span>
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
        ${instructionStep1}
        ${instructionStep2}
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
  // STRICT PAYMENT GUARD: Never send transaction/confirmation emails unless order status is explicitly 'paid'
  if (order.status !== 'paid') {
    console.warn(`[M.BRAVO EMAIL SYSTEM GUARD] Order ${order.orderId} status is '${order.status}' (NOT 'paid'). Confirmation email dispatch aborted.`);
    return { customerEmailUrl: '', adminEmailUrl: '' };
  }

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

  console.log(`[M.BRAVO EMAIL SYSTEM] Emails generated for order ${order.orderId}!`);
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
    
    const customerEmail = (order.customer.email || "").trim();
    if (customerEmail && customerEmail.includes('@')) {
      sendViaSendGrid(process.env.SENDGRID_API_KEY!, customerEmail, `M BRAVO | Encomenda Confirmada - ${order.orderId}`, customerHtml)
        .then(() => console.log(`[M.BRAVO EMAIL SYSTEM] Customer email sent successfully via SendGrid to ${customerEmail}.`))
        .catch(err => {
          console.warn(`\n[M.BRAVO EMAIL SYSTEM WARNING] Could not send Customer email via SendGrid:`);
          console.warn(`  - Logged Detail: ${err.message}`);
          console.warn(`  - Local Preview: /emails/${custFileName}\n`);
        });
    } else {
      console.log(`[M.BRAVO EMAIL SYSTEM] Skipping customer email dispatch because customer email address is absent or invalid.`);
    }

    const adminEmail = NOTIFICATION_EMAIL;
    sendViaSendGrid(process.env.SENDGRID_API_KEY!, adminEmail, `[NOVO PEDIDO] ${order.orderId} - Prioridade Atelier`, adminHtml)
      .then(() => console.log(`[M.BRAVO EMAIL SYSTEM] Admin notification email sent successfully via SendGrid.`))
      .catch(err => {
        console.warn(`\n[M.BRAVO EMAIL SYSTEM WARNING] Could not send Admin notification email via SendGrid:`);
        console.warn(`  - Logged Detail: ${err.message}`);
        console.warn(`  - Local Preview: /emails/${adminFileName}\n`);
      });
  } else {
    console.log(`[M.BRAVO EMAIL SYSTEM] SendGrid key unconfigured. Local Previews saved.`);
  }

  return {
    customerEmailUrl: `/emails/${custFileName}`,
    adminEmailUrl: `/emails/${adminFileName}`
  };
}

/**
 * Generates the elegant Multibanco payment instruction HTML email template.
 */
export function generateMultibancoEmailHtml(order: OrderData, multibancoRef: { entidade: string; referencia: string }): string {
  const footerNotice = 'Esta é uma mensagem de instruções de pagamento automático para encomenda M★BRAVO.';

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dados de Pagamento Multibanco - M★BRAVO</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F5F2ED; color: #243119; font-family: 'Georgia', 'Garamond', serif; -webkit-font-smoothing: antialiased;">
  <div class="wrapper" style="width: 100%; background-color: #F5F2ED; padding: 40px 0; font-family: 'Georgia', 'Garamond', serif;">
    <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #FCFBF9; border: 1px solid rgba(36, 49, 25, 0.08); border-radius: 4px; box-shadow: 0 10px 30px rgba(36, 49, 25, 0.02); margin: 0 auto;">
      <tr>
        <td style="padding: 50px 40px;">
          <!-- HEADER -->
          <table align="center" border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto 40px auto; text-align: center;">
            <tr>
              <td align="center">
                <table align="center" border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                  <tr>
                    <td align="center" style="border-bottom: 1px solid #C5A059; padding-bottom: 5px; font-size: 24px; letter-spacing: 0.3em; font-weight: bold; color: #243119; text-transform: uppercase; font-family: 'Georgia', 'Garamond', serif;">
                      M★BRAVO
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td align="center" style="font-size: 9px; text-transform: uppercase; letter-spacing: 0.4em; color: #C5A059; font-weight: bold; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding-top: 10px;">
                Handmade with Love
              </td>
            </tr>
          </table>

          <!-- GREETING -->
          <div style="font-size: 20px; line-height: 1.5; font-style: italic; text-align: center; margin-bottom: 30px; font-weight: 300; color: #243119;">
            Olá, ${order.customer.nome}.<br>A sua referência Multibanco foi gerada.
          </div>

          <!-- INSTRUCTION TEXT -->
          <div style="font-size: 14px; line-height: 1.8; color: rgba(36, 49, 25, 0.85); text-align: center; margin-bottom: 30px; font-weight: 300;">
            Para concluir a sua encomenda M★BRAVO, efetue o pagamento com os dados abaixo através de Homebanking ou caixa ATM (Pagamento de Serviços).
          </div>

          <!-- PAYMENT BOX TABLE -->
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #FCF8F2; border: 1px solid #C5A059; border-radius: 12px; border-collapse: separate; border-spacing: 0; font-family: 'Georgia', 'Garamond', serif; margin-bottom: 30px;">
            <tr>
              <td style="padding: 25px;">
                <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                  <tr>
                    <td colspan="2" align="center" style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 11px; text-transform: uppercase; letter-spacing: 0.2em; color: #A68244; font-weight: bold; padding-bottom: 20px; text-align: center;">
                      Dados para Pagamento
                    </td>
                  </tr>
                  <!-- Row: Entidade -->
                  <tr>
                    <td style="color: rgba(36, 49, 25, 0.6); font-weight: 300; padding-bottom: 12px; font-size: 14px; text-align: left; border-bottom: 1px dashed rgba(36, 49, 25, 0.08);">Entidade:</td>
                    <td align="right" style="font-weight: bold; font-family: monospace; font-size: 15px; padding-bottom: 12px; color: #243119; text-align: right; border-bottom: 1px dashed rgba(36, 49, 25, 0.08);">${multibancoRef.entidade}</td>
                  </tr>
                  <!-- Row: Referência -->
                  <tr>
                    <td style="color: rgba(36, 49, 25, 0.6); font-weight: 300; padding-top: 12px; padding-bottom: 12px; font-size: 14px; text-align: left; border-bottom: 1px dashed rgba(36, 49, 25, 0.08);">Referência:</td>
                    <td align="right" style="font-weight: bold; font-family: monospace; font-size: 15px; padding-top: 12px; padding-bottom: 12px; color: #243119; text-align: right; border-bottom: 1px dashed rgba(36, 49, 25, 0.08);">${multibancoRef.referencia}</td>
                  </tr>
                  <!-- Row: Montante -->
                  <tr>
                    <td style="color: rgba(36, 49, 25, 0.6); font-weight: 300; padding-top: 12px; font-size: 14px; text-align: left;">Montante:</td>
                    <td align="right" style="font-weight: bold; color: #A68244; font-size: 16px; padding-top: 12px; text-align: right;">Total: ${order.price}</td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          <!-- NOTE TEXT -->
          <div style="font-size: 12px; font-style: italic; color: rgba(36, 49, 25, 0.6); text-align: center; line-height: 1.6; margin-bottom: 30px; font-weight: 300;">
            Nota: O prazo limite para pagamento desta referência é de 3 dias. Assim que efetuar o pagamento, receberá um e-mail de confirmação automático e iniciaremos a produção manual da sua peça.
          </div>

          <!-- DIVIDER -->
          <div style="height: 1px; background-color: rgba(36, 49, 25, 0.08); margin: 30px 0;"></div>

          <!-- FOOTER -->
          <div style="text-align: center; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 10px; text-transform: uppercase; letter-spacing: 0.15em; color: rgba(36, 49, 25, 0.4); line-height: 1.8;">
            M★BRAVO ATELIER &bull; PORTUGAL<br>
            <a href="mailto:${FROM_EMAIL}" style="color: #C5A059; text-decoration: none;">${FROM_EMAIL}</a><br>
            <span style="font-size: 8px; margin-top: 15px; display: block; color: rgba(36, 49, 25, 0.25); text-transform: none; letter-spacing: normal;">${footerNotice}</span>
          </div>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>`;
}

export function sendMultibancoEmails(order: OrderData, multibancoRef: { entidade: string; referencia: string }): { customerEmailUrl: string } {
  const customerHtml = generateMultibancoEmailHtml(order, multibancoRef);

  const publicEmailsDir = path.join(process.cwd(), 'public', 'emails');
  if (!fs.existsSync(publicEmailsDir)) {
    fs.mkdirSync(publicEmailsDir, { recursive: true });
  }

  const custFileName = `multibanco-instruction-${order.orderId}.html`;
  fs.writeFileSync(path.join(publicEmailsDir, custFileName), customerHtml, 'utf-8');

  console.log(`[M.BRAVO EMAIL SYSTEM] Multibanco Instruction Email generated for ${order.orderId}`);

  const hasSendGridKey = process.env.SENDGRID_API_KEY && 
                        process.env.SENDGRID_API_KEY !== "" && 
                        process.env.SENDGRID_API_KEY.startsWith("SG.") &&
                        !process.env.SENDGRID_API_KEY.includes("INSERT_") &&
                        !process.env.SENDGRID_API_KEY.includes("YOUR_") &&
                        !process.env.SENDGRID_API_KEY.includes("mock") &&
                        !process.env.SENDGRID_API_KEY.includes("test");

  if (hasSendGridKey) {
    sendViaSendGrid(process.env.SENDGRID_API_KEY!, order.customer.email, `M BRAVO | Dados para Pagamento Multibanco - Encomenda ${order.orderId}`, customerHtml)
      .then(() => console.log(`[M.BRAVO EMAIL SYSTEM] Multibanco instructions email sent successfully via SendGrid.`))
      .catch(err => {
        console.warn(`[M.BRAVO EMAIL SYSTEM WARNING] Could not send Multibanco instructions email via SendGrid: ${err.message}`);
      });
  }

  return {
    customerEmailUrl: `/emails/${custFileName}`
  };
}

async function sendViaSendGrid(apiKey: string, toEmail: string, subject: string, htmlContent: string, bccEmails?: string[]) {
  const url = 'https://api.sendgrid.com/v3/mail/send';
  const personalization: any = { to: [{ email: toEmail }] };
  if (bccEmails && bccEmails.length > 0) {
    personalization.bcc = bccEmails.map(email => ({ email }));
  }
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      personalizations: [personalization],
      from: { email: process.env.FROM_EMAIL || 'encomendas@mbravobycarolina.com', name: 'M BRAVO' },
      subject: subject,
      content: [{ type: 'text/html', value: htmlContent }]
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`SendGrid API failure: ${response.status} - ${errText}`);
  }
}

async function sendViaResend(apiKey: string, toEmail: string, subject: string, htmlContent: string, bccEmails?: string[]) {
  const url = 'https://api.resend.com/emails';
  const bodyData: any = {
    from: `M BRAVO <${process.env.FROM_EMAIL || 'encomendas@mbravobycarolina.com'}>`,
    to: [toEmail],
    subject: subject,
    html: htmlContent
  };
  if (bccEmails && bccEmails.length > 0) {
    bodyData.bcc = bccEmails;
  }
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify(bodyData)
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Resend API failure: ${response.status} - ${errText}`);
  }
}

/**
 * Sends a notification exclusively to the Atelier (encomendas@mbravobycarolina.com)
 * for manual orders registered via Admin Dashboard. No email is sent to the customer.
 */
export async function sendAtelierNotificationOnly(order: OrderData): Promise<{ adminEmailUrl: string }> {
  const adminHtml = generateAdminEmailHtml(order);

  const publicEmailsDir = path.join(process.cwd(), 'public', 'emails');
  if (!fs.existsSync(publicEmailsDir)) {
    fs.mkdirSync(publicEmailsDir, { recursive: true });
  }

  const adminFileName = `admin-manual-${order.orderId}.html`;
  fs.writeFileSync(path.join(publicEmailsDir, adminFileName), adminHtml, 'utf-8');

  console.log(`[M.BRAVO EMAIL SYSTEM] Manual Order Atelier Notification generated for ${order.orderId}`);
  console.log(`  - Admin Atelier Notification preview: /emails/${adminFileName}`);

  const atelierEmail = 'encomendas@mbravobycarolina.com';
  const subject = `[NOVA ENCOMENDA MANUAL] ${order.orderId} - Prioridade: ${order.priority || 'NORMAL'}`;

  const resendKey = process.env.RESEND_API_KEY && 
                    process.env.RESEND_API_KEY !== "" && 
                    !process.env.RESEND_API_KEY.includes("INSERT_") &&
                    !process.env.RESEND_API_KEY.includes("YOUR_");

  const sendGridKey = process.env.SENDGRID_API_KEY && 
                      process.env.SENDGRID_API_KEY !== "" && 
                      process.env.SENDGRID_API_KEY.startsWith("SG.") &&
                      !process.env.SENDGRID_API_KEY.includes("INSERT_");

  if (resendKey) {
    try {
      await sendViaResend(process.env.RESEND_API_KEY!, atelierEmail, subject, adminHtml);
      console.log(`[M.BRAVO EMAIL SYSTEM] Atelier notification sent successfully via Resend to ${atelierEmail}.`);
    } catch (err: any) {
      console.warn(`[M.BRAVO EMAIL SYSTEM WARNING] Could not send Atelier notification via Resend: ${err.message}`);
    }
  } else if (sendGridKey) {
    try {
      await sendViaSendGrid(process.env.SENDGRID_API_KEY!, atelierEmail, subject, adminHtml);
      console.log(`[M.BRAVO EMAIL SYSTEM] Atelier notification sent successfully via SendGrid to ${atelierEmail}.`);
    } catch (err: any) {
      console.warn(`[M.BRAVO EMAIL SYSTEM WARNING] Could not send Atelier notification via SendGrid: ${err.message}`);
    }
  } else {
    console.log(`[M.BRAVO EMAIL SYSTEM] No live email gateway configured. Local preview saved at /emails/${adminFileName}`);
  }

  return { adminEmailUrl: `/emails/${adminFileName}` };
}

/**
 * Generates the elegant cream & forest green customer order shipped HTML email template.
 */
export function generateShippedEmailHtml(order: OrderData, trackingCode: string): string {
  const trackingUrl = `https://www.ctt.pt/feapl_2/app/open/objectSearch/objectSearch.jspx?lang=def&objects=${trackingCode}`;
  const showSize = hasValidSize(order.selections?.tamanho, order.selections?.hasSize);
  const corText = order.selections?.cor && order.selections.cor.trim() !== '' && !['n/a', 'na', 'nenhum', 'padrão', 'padrao', '-'].includes(order.selections.cor.trim().toLowerCase())
    ? order.selections.cor.trim()
    : null;
  const rawQtd = order.selections?.quantidade && order.selections.quantidade.trim() !== '' ? order.selections.quantidade.trim() : '1';
  const qtdFormatted = `${rawQtd} ${rawQtd === '1' ? 'unidade' : 'unidades'}`;
  const footerNotice = 'Esta é uma mensagem automática de aviso de expedição M★BRAVO.';

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>A sua Encomenda foi Enviada! - M★BRAVO</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F5F2ED; color: #243119; font-family: 'Georgia', 'Garamond', serif; -webkit-font-smoothing: antialiased;">
  <div class="wrapper" style="width: 100%; background-color: #F5F2ED; padding: 40px 0; font-family: 'Georgia', 'Garamond', serif;">
    <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #FCFBF9; border: 1px solid rgba(36, 49, 25, 0.08); border-radius: 4px; box-shadow: 0 10px 30px rgba(36, 49, 25, 0.02); margin: 0 auto;">
      <tr>
        <td style="padding: 50px 40px;">
          <!-- HEADER -->
          <table align="center" border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto 40px auto; text-align: center;">
            <tr>
              <td align="center">
                <table align="center" border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                  <tr>
                    <td align="center" style="border-bottom: 1px solid #C5A059; padding-bottom: 5px; font-size: 24px; letter-spacing: 0.3em; font-weight: bold; color: #243119; text-transform: uppercase; font-family: 'Georgia', 'Garamond', serif;">
                      M★BRAVO
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td align="center" style="font-size: 9px; text-transform: uppercase; letter-spacing: 0.4em; color: #C5A059; font-weight: bold; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding-top: 10px;">
                Handmade with Love
              </td>
            </tr>
          </table>

          <!-- GREETING -->
          <div style="font-size: 20px; line-height: 1.5; font-style: italic; text-align: center; margin-bottom: 30px; font-weight: 300; color: #243119;">
            Olá, ${order.customer.nome}.<br>A sua peça M★BRAVO já está a caminho!
          </div>

          <!-- SHIPPED STORY TEXT -->
          <div style="font-size: 14px; line-height: 1.8; color: rgba(36, 49, 25, 0.85); text-align: justify; margin-bottom: 30px; font-weight: 300;">
            A sua peça M★BRAVO está pronta. Foi criada à mão no nosso atelier, inspecionada ao detalhe e cuidadosamente embalada. Encontra-se neste momento a caminho da sua morada através dos CTT.
          </div>

          <!-- TRACKING BOX TABLE -->
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #FCF8F2; border: 1px solid #C5A059; border-radius: 12px; border-collapse: separate; border-spacing: 0; font-family: 'Georgia', 'Garamond', serif; margin-bottom: 30px;">
            <tr>
              <td style="padding: 25px;">
                <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                  <tr>
                    <td colspan="2" align="center" style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 11px; text-transform: uppercase; letter-spacing: 0.2em; color: #A68244; font-weight: bold; padding-bottom: 20px; text-align: center;">
                      Acompanhamento do Envio
                    </td>
                  </tr>
                  <!-- Row: Transportadora -->
                  <tr>
                    <td style="color: rgba(36, 49, 25, 0.6); font-weight: 300; padding-bottom: 12px; font-size: 14px; text-align: left; border-bottom: 1px dashed rgba(36, 49, 25, 0.08);">Transportadora:</td>
                    <td align="right" style="font-weight: bold; font-size: 14px; padding-bottom: 12px; color: #243119; text-align: right; border-bottom: 1px dashed rgba(36, 49, 25, 0.08);">CTT - Correios de Portugal</td>
                  </tr>
                  <!-- Row: Código de Rastreamento -->
                  <tr>
                    <td style="color: rgba(36, 49, 25, 0.6); font-weight: 300; padding-top: 12px; padding-bottom: 20px; font-size: 14px; text-align: left; border-bottom: 1px solid rgba(36, 49, 25, 0.05);">Código de Rastreio (Tracking):</td>
                    <td align="right" style="font-weight: bold; font-family: monospace; font-size: 15px; padding-top: 12px; padding-bottom: 20px; color: #A68244; text-align: right; border-bottom: 1px solid rgba(36, 49, 25, 0.05);">${trackingCode}</td>
                  </tr>
                  <!-- Row: Button -->
                  <tr>
                    <td colspan="2" align="center" style="padding-top: 20px; text-align: center;">
                      <a href="${trackingUrl}" target="_blank" style="display: inline-block; background-color: #243119; color: #FAF8F5; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.12em; text-decoration: none; padding: 10px 22px; border-radius: 4px; transition: all 0.2s ease;">
                        Rastrear nos CTT
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          <!-- DIVIDER -->
          <div style="height: 1px; background-color: rgba(36, 49, 25, 0.08); margin: 30px 0;"></div>

          <!-- ORDER DETAILS TITLE -->
          <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 10px; text-transform: uppercase; letter-spacing: 0.2em; color: #A68244; font-weight: bold; margin-bottom: 15px;">
            Artigos Enviados
          </div>

          <!-- ORDER DETAILS TABLE -->
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #FBF9F6; border: 1px solid rgba(197, 160, 89, 0.15); border-radius: 8px; border-collapse: separate; border-spacing: 0; font-family: 'Georgia', 'Garamond', serif; margin-bottom: 30px;">
            <tr>
              <td style="padding: 25px;">
                <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                  <!-- Row: ID -->
                  <tr>
                    <td style="color: rgba(36, 49, 25, 0.5); font-weight: 300; padding-bottom: 12px; font-size: 13px; text-align: left; border-bottom: 1px dashed rgba(36, 49, 25, 0.08);">ID da Encomenda:</td>
                    <td align="right" style="font-weight: bold; font-family: monospace; padding-bottom: 12px; font-size: 13px; color: #243119; text-align: right; border-bottom: 1px dashed rgba(36, 49, 25, 0.08);">${order.orderId}</td>
                  </tr>
                  <!-- Row: Peça -->
                  <tr>
                    <td style="color: rgba(36, 49, 25, 0.5); font-weight: 300; padding-top: 12px; padding-bottom: 12px; font-size: 13px; text-align: left; border-bottom: 1px dashed rgba(36, 49, 25, 0.08);">Peça Selecionada:</td>
                    <td align="right" style="font-weight: bold; padding-top: 12px; padding-bottom: 12px; font-size: 13px; color: #243119; text-align: right; border-bottom: 1px dashed rgba(36, 49, 25, 0.08);">${order.productName}</td>
                  </tr>
                  ${corText ? `
                  <!-- Row: Tom / Cor -->
                  <tr>
                    <td style="color: rgba(36, 49, 25, 0.5); font-weight: 300; padding-top: 12px; padding-bottom: 12px; font-size: 13px; text-align: left; border-bottom: 1px dashed rgba(36, 49, 25, 0.08);">Tom / Cor:</td>
                    <td align="right" style="font-weight: bold; padding-top: 12px; padding-bottom: 12px; font-size: 13px; color: #243119; text-align: right; border-bottom: 1px dashed rgba(36, 49, 25, 0.08);">${corText}</td>
                  </tr>
                  ` : ''}
                  ${showSize ? `
                  <!-- Row: Tamanho -->
                  <tr>
                    <td style="color: rgba(36, 49, 25, 0.5); font-weight: 300; padding-top: 12px; padding-bottom: 12px; font-size: 13px; text-align: left; border-bottom: 1px dashed rgba(36, 49, 25, 0.08);">Tamanho:</td>
                    <td align="right" style="font-weight: bold; padding-top: 12px; padding-bottom: 12px; font-size: 13px; color: #243119; text-align: right; border-bottom: 1px dashed rgba(36, 49, 25, 0.08);">${order.selections.tamanho}</td>
                  </tr>
                  ` : ''}
                  <!-- Row: Quantidade -->
                  <tr>
                    <td style="color: rgba(36, 49, 25, 0.5); font-weight: 300; padding-top: 12px; padding-bottom: 12px; font-size: 13px; text-align: left;">Quantidade:</td>
                    <td align="right" style="font-weight: bold; padding-top: 12px; padding-bottom: 12px; font-size: 13px; color: #243119; text-align: right;">${qtdFormatted}</td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          <!-- SHIPPING BOX -->
          <div style="font-size: 13px; line-height: 1.6; color: rgba(36, 49, 25, 0.8); margin-bottom: 30px;">
            <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 10px; text-transform: uppercase; letter-spacing: 0.2em; color: rgba(36, 49, 25, 0.5); font-weight: bold; margin-bottom: 8px;">
              Destinatário & Morada de Entrega
            </div>
            <div style="font-weight: 300; color: #243119;">
              <strong>${order.customer.nome}</strong><br>
              ${order.customer.morada}<br>
              ${order.customer.codigoPostal}, ${order.customer.cidade}<br>
              Telemóvel: ${formatPhoneReadable(order.customer.telefone)}
            </div>
          </div>

          <!-- SHIPPED NOTE -->
          <div style="background-color: #FDFBF7; border-left: 3px solid #C5A059; padding: 15px; font-size: 12px; line-height: 1.6; font-style: italic; color: rgba(36, 49, 25, 0.8); margin-bottom: 35px;">
            <strong>Nota de Entrega:</strong> O tempo estimado para entrega em Portugal Continental é de 1 a 3 dias úteis. Caso se trate de um envio para as Ilhas (Açores e Madeira) ou Internacional, o prazo poderá estender-se até 5 a 10 dias úteis. Acompanhe o estado do envio usando o botão acima.
          </div>

          <!-- GOOGLE REVIEWS REQUEST -->
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #FAF8F5; border: 1px solid rgba(197, 160, 89, 0.25); border-radius: 8px; font-family: 'Georgia', 'Garamond', serif; margin-top: 30px; margin-bottom: 30px; text-align: center;">
            <tr>
              <td style="padding: 24px; text-align: center;">
                <div style="color: #C5A059; font-size: 15px; margin-bottom: 8px; letter-spacing: 0.15em;">★ ★ ★ ★ ★</div>
                <div style="font-size: 15px; font-style: italic; font-weight: bold; color: #243119; margin-bottom: 8px;">Partilhe a sua experiência</div>
                <div style="font-size: 13px; line-height: 1.6; color: rgba(36, 49, 25, 0.8); margin-bottom: 18px; font-weight: 300;">
                  A sua opinião é fundamental para o nosso atelier. Conte-nos como foi a sua experiência com a M★BRAVO.
                </div>
                <a href="https://g.page/r/Cdo7JGP_Xpc3EBM/review" target="_blank" style="display: inline-block; background-color: #243119; color: #FAF8F5; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.12em; text-decoration: none; padding: 10px 22px; border-radius: 4px; transition: all 0.2s ease;">
                  Avaliar no Google
                </a>
              </td>
            </tr>
          </table>

          <!-- DIVIDER -->
          <div style="height: 1px; background-color: rgba(36, 49, 25, 0.08); margin: 30px 0;"></div>

          <!-- FOOTER -->
          <div style="text-align: center; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 10px; text-transform: uppercase; letter-spacing: 0.15em; color: rgba(36, 49, 25, 0.4); line-height: 1.8;">
            M★BRAVO ATELIER &bull; PORTUGAL<br>
            <a href="mailto:${FROM_EMAIL}" style="color: #C5A059; text-decoration: none;">${FROM_EMAIL}</a><br>
            <span style="font-size: 8px; margin-top: 15px; display: block; color: rgba(36, 49, 25, 0.25); text-transform: none; letter-spacing: normal;">${footerNotice}</span>
          </div>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>`;
}

export function sendShippedEmails(order: OrderData, trackingCode: string): { shippedEmailUrl: string } {
  const customerHtml = generateShippedEmailHtml(order, trackingCode);

  const publicEmailsDir = path.join(process.cwd(), 'public', 'emails');
  if (!fs.existsSync(publicEmailsDir)) {
    fs.mkdirSync(publicEmailsDir, { recursive: true });
  }

  const custFileName = `shipped-notification-${order.orderId}.html`;
  fs.writeFileSync(path.join(publicEmailsDir, custFileName), customerHtml, 'utf-8');

  console.log(`[M.BRAVO EMAIL SYSTEM] Shipped Notification Email generated for ${order.orderId}`);

  // Atelier BCC list: automatically sends hidden copy to Atelier
  const atelierBcc = [
    process.env.NOTIFICATION_EMAIL || 'handmade.mbravo@gmail.com',
    'encomendas@mbravobycarolina.com'
  ].filter((v, i, a) => v && a.indexOf(v) === i);

  const resendKey = process.env.RESEND_API_KEY && 
                    process.env.RESEND_API_KEY !== "" && 
                    !process.env.RESEND_API_KEY.includes("INSERT_") &&
                    !process.env.RESEND_API_KEY.includes("YOUR_");

  const sendGridKey = process.env.SENDGRID_API_KEY && 
                      process.env.SENDGRID_API_KEY !== "" && 
                      process.env.SENDGRID_API_KEY.startsWith("SG.") &&
                      !process.env.SENDGRID_API_KEY.includes("INSERT_") &&
                      !process.env.SENDGRID_API_KEY.includes("YOUR_") &&
                      !process.env.SENDGRID_API_KEY.includes("mock") &&
                      !process.env.SENDGRID_API_KEY.includes("test");

  if (resendKey) {
    sendViaResend(process.env.RESEND_API_KEY!, order.customer.email, `M BRAVO | A sua Encomenda foi Enviada! - ${order.orderId}`, customerHtml, atelierBcc)
      .then(() => console.log(`[M.BRAVO EMAIL SYSTEM] Shipped Notification email sent successfully via Resend with BCC to Atelier (${atelierBcc.join(', ')}).`))
      .catch(err => {
        console.warn(`[M.BRAVO EMAIL SYSTEM WARNING] Could not send Shipped Notification email via Resend: ${err.message}`);
      });
  } else if (sendGridKey) {
    sendViaSendGrid(process.env.SENDGRID_API_KEY!, order.customer.email, `M BRAVO | A sua Encomenda foi Enviada! - ${order.orderId}`, customerHtml, atelierBcc)
      .then(() => console.log(`[M.BRAVO EMAIL SYSTEM] Shipped Notification email sent successfully via SendGrid with BCC to Atelier (${atelierBcc.join(', ')}).`))
      .catch(err => {
        console.warn(`[M.BRAVO EMAIL SYSTEM WARNING] Could not send Shipped Notification email via SendGrid: ${err.message}`);
      });
  } else {
    console.log(`[M.BRAVO EMAIL SYSTEM] Live email gateway unconfigured. Local preview saved at /emails/${custFileName}`);
  }

  return {
    shippedEmailUrl: `/emails/${custFileName}`
  };
}

/**
 * Generates and dispatches notification & confirmation emails for new Passaporte de Co-Criação requests
 */
export function sendPassportNotificationEmails(passportData: {
  id?: string;
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  clientBirthday?: string;
  productName: string;
  productCategory?: string;
  colorName: string;
  size?: string;
  quantity?: number | string;
  notes?: string;
}): { customerEmailUrl?: string; adminEmailUrl?: string } {
  const passportId = passportData.id || `MB-PASS-${Math.floor(1000 + Math.random() * 9000)}`;
  const clientName = passportData.clientName || 'Cliente M★BRAVO';
  const clientEmail = passportData.clientEmail;
  const clientPhone = passportData.clientPhone || 'Não especificado';
  const clientBirthday = passportData.clientBirthday || 'Não especificado';
  const productName = passportData.productName || 'Peça Sob Medida';
  const productCategory = passportData.productCategory || 'Atelier M★BRAVO';
  const colorName = passportData.colorName || 'Cor Personalizada';
  const size = passportData.size || 'Por Medida';
  const quantity = passportData.quantity || 1;
  const notes = passportData.notes || 'Sem observações adicionais.';

  // 1. Admin Email HTML Template
  const adminHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Novo Passaporte M★BRAVO - ${passportId}</title>
</head>
<body style="margin:0; padding:20px; background-color:#F5F2ED; color:#243119; font-family:'Georgia', serif;">
  <div style="max-width:600px; margin:0 auto; background:#FCFBF9; border:1px solid #C5A059; border-radius:12px; padding:30px;">
    <div style="text-align:center; border-bottom:1px solid #243119/10; padding-bottom:15px; margin-bottom:20px;">
      <h1 style="font-size:22px; color:#243119; margin:0; letter-spacing:0.15em;">M★BRAVO</h1>
      <span style="font-size:10px; text-transform:uppercase; color:#8C6D3B; letter-spacing:0.2em;">Novo Passaporte de Co-Criação</span>
    </div>
    
    <div style="background-color:#EFE8D8; padding:15px; border-radius:8px; margin-bottom:20px;">
      <p style="margin:0 0 5px 0; font-size:11px; text-transform:uppercase; color:#8C6D3B; font-weight:bold;">ID Passaporte: ${passportId}</p>
      <p style="margin:0; font-size:16px; font-weight:bold; color:#243119;">Cliente: ${clientName}</p>
    </div>

    <table width="100%" cellpadding="8" cellspacing="0" style="border-collapse:collapse; font-size:13px; margin-bottom:20px;">
      <tr style="border-bottom:1px dashed #C5A059/40;">
        <td style="color:#8C6D3B; font-weight:bold;">Peça Selecionada:</td>
        <td style="text-align:right; font-weight:bold;">${productName} (${productCategory})</td>
      </tr>
      <tr style="border-bottom:1px dashed #C5A059/40;">
        <td style="color:#8C6D3B; font-weight:bold;">Tom / Cor:</td>
        <td style="text-align:right;">${colorName}</td>
      </tr>
      <tr style="border-bottom:1px dashed #C5A059/40;">
        <td style="color:#8C6D3B; font-weight:bold;">Tamanho / Escala:</td>
        <td style="text-align:right;">${size}</td>
      </tr>
      <tr style="border-bottom:1px dashed #C5A059/40;">
        <td style="color:#8C6D3B; font-weight:bold;">Quantidade:</td>
        <td style="text-align:right;">${quantity}</td>
      </tr>
      <tr style="border-bottom:1px dashed #C5A059/40;">
        <td style="color:#8C6D3B; font-weight:bold;">Email do Cliente:</td>
        <td style="text-align:right;">${clientEmail || 'Não indicado'}</td>
      </tr>
      <tr style="border-bottom:1px dashed #C5A059/40;">
        <td style="color:#8C6D3B; font-weight:bold;">Telemóvel / WhatsApp:</td>
        <td style="text-align:right;">${clientPhone}</td>
      </tr>
      <tr style="border-bottom:1px dashed #C5A059/40;">
        <td style="color:#8C6D3B; font-weight:bold;">Data Aniversário:</td>
        <td style="text-align:right;">${clientBirthday}</td>
      </tr>
    </table>

    <div style="background:#FAF8F5; border-left:3px solid #8C6D3B; padding:12px; font-size:12px; color:#243119; font-style:italic; margin-bottom:20px;">
      <strong>Visão / Observações do Cliente:</strong><br>
      "${notes}"
    </div>

    <div style="text-align:center; font-size:10px; color:#8C6D3B; uppercase; letter-spacing:0.15em;">
      M★BRAVO ATELIER &bull; SISTEMA DE GESTÃO DE PASSAPORTES
    </div>
  </div>
</body>
</html>`;

  // 2. Customer Email HTML Template
  const customerHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Comprovativo de Passaporte - M★BRAVO</title>
</head>
<body style="margin:0; padding:20px; background-color:#F5F2ED; color:#243119; font-family:'Georgia', serif;">
  <div style="max-width:600px; margin:0 auto; background:#FCFBF9; border:1px solid #C5A059; border-radius:12px; padding:30px;">
    <div style="text-align:center; border-bottom:1px solid #243119/10; padding-bottom:15px; margin-bottom:20px;">
      <h1 style="font-size:24px; color:#243119; margin:0; letter-spacing:0.2em;">M★BRAVO</h1>
      <span style="font-size:10px; text-transform:uppercase; color:#8C6D3B; letter-spacing:0.25em;">Passaporte de Co-Criação</span>
    </div>

    <p style="font-size:15px; font-style:italic; text-align:center; color:#243119; margin-bottom:25px;">
      Olá, ${clientName}.<br>O seu Passaporte de Co-Criação foi registado com sucesso!
    </p>

    <p style="font-size:13px; line-height:1.7; color:#243119/80; text-align:justify; margin-bottom:25px;">
      Agradecemos a sua preferência. A Carolina analisará as suas especificações e entrará em contacto muito em breve para dar início ao processo de co-criação da sua peça exclusiva M★BRAVO.
    </p>

    <div style="background-color:#FAF8F5; border:1px solid #C5A059/30; border-radius:10px; padding:20px; margin-bottom:25px;">
      <h2 style="font-size:11px; text-transform:uppercase; letter-spacing:0.2em; color:#8C6D3B; margin:0 0 15px 0;">Resumo da Co-Criação (${passportId})</h2>
      <ul style="list-style:none; padding:0; margin:0; font-size:13px; line-height:1.8; color:#243119;">
        <li><strong>Peça Escolhida:</strong> ${productName}</li>
        <li><strong>Tom Selecionado:</strong> ${colorName}</li>
        <li><strong>Tamanho / Escala:</strong> ${size}</li>
        <li><strong>Quantidade:</strong> ${quantity}</li>
        ${clientBirthday !== 'Não especificado' ? `<li><strong>Aniversário:</strong> ${clientBirthday}</li>` : ''}
      </ul>
    </div>

    <div style="text-align:center; font-size:10px; text-transform:uppercase; letter-spacing:0.2em; color:#243119/50;">
      M★BRAVO &bull; CREATED WITH TIME
    </div>
  </div>
</body>
</html>`;

  const publicEmailsDir = path.join(process.cwd(), 'public', 'emails');
  if (!fs.existsSync(publicEmailsDir)) {
    fs.mkdirSync(publicEmailsDir, { recursive: true });
  }

  const adminFileName = `passport-admin-${passportId}.html`;
  const custFileName = `passport-customer-${passportId}.html`;
  fs.writeFileSync(path.join(publicEmailsDir, adminFileName), adminHtml, 'utf-8');
  fs.writeFileSync(path.join(publicEmailsDir, custFileName), customerHtml, 'utf-8');

  const notifyEmail = process.env.NOTIFICATION_EMAIL || 'handmade.mbravo@gmail.com';
  const resendKey = process.env.RESEND_API_KEY && 
                    process.env.RESEND_API_KEY !== "" && 
                    !process.env.RESEND_API_KEY.includes("INSERT_") &&
                    !process.env.RESEND_API_KEY.includes("YOUR_");

  if (resendKey) {
    // 1. Send Admin Notification Email
    sendViaResend(process.env.RESEND_API_KEY!, notifyEmail, `✦ Novo Passaporte de Co-Criação M★BRAVO: ${clientName} - ${productName}`, adminHtml, ['encomendas@mbravobycarolina.com'])
      .then(() => console.log(`[PASSAPORTE EMAIL SYSTEM] Admin email sent via Resend for ${passportId}`))
      .catch(err => console.warn(`[PASSAPORTE EMAIL WARN] Resend admin fail:`, err.message));

    // 2. Send Customer Confirmation Email if email provided
    if (clientEmail && clientEmail.includes('@')) {
      sendViaResend(process.env.RESEND_API_KEY!, clientEmail, `M★BRAVO | Comprovativo do seu Passaporte de Co-Criação - ${passportId}`, customerHtml)
        .then(() => console.log(`[PASSAPORTE EMAIL SYSTEM] Customer confirmation email sent via Resend to ${clientEmail}`))
        .catch(err => console.warn(`[PASSAPORTE EMAIL WARN] Resend customer fail:`, err.message));
    }
  }

  return {
    adminEmailUrl: `/emails/${adminFileName}`,
    customerEmailUrl: `/emails/${custFileName}`
  };
}

