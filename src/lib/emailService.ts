import fs from 'fs';
import path from 'path';

// DEFINIÇÃO OFICIAL DOS E-MAILS DA M★BRAVO
const FROM_EMAIL = process.env.FROM_EMAIL || 'encomendas@mbravobycarolina.com';
const NOTIFICATION_EMAIL = process.env.NOTIFICATION_EMAIL || 'handmade@mbravobycarolina.com';

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
    nif?: string;
  };
  paymentMethod: 'mbway' | 'multibanco' | 'card' | 'stripe' | 'manual' | string;
  status: 'pending_payment' | 'paid' | 'failed' | string;
  priority: 'ALTA (Atelier Urgente)' | 'NORMAL' | string;
  createdAt: string;
}

/**
 * Função auxiliar para legibilidade do método de pagamento nos e-mails
 */
function formatPaymentMethod(method: string): string {
  switch (method?.toLowerCase()) {
    case 'mbway': return 'MB WAY';
    case 'multibanco': return 'Referência Multibanco';
    case 'card':
    case 'stripe': return 'Cartão de Crédito';
    case 'manual': return 'Venda Manual / Presencial';
    default: return method?.toUpperCase() || 'PAGAMENTO CONFIRMADO';
  }
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
              RECIBO DE PAGAMENTO &bull; COMPROVATIVO
            </div>
            <div style="font-size: 13px; color: #243119; font-style: italic; line-height: 1.5;">
              Este documento serve como comprovativo de pagamento elegível da sua encomenda. O pagamento foi validado com sucesso e a peça entrou em confecção.
            </div>
          </div>

          <!-- STORY TEXT -->
          <div style="font-size: 14px; line-height: 1.8; color: rgba(36, 49, 25, 0.85); text-align: justify; margin-bottom: 30px; font-weight: 300;">
            Cada peça M★BRAVO é tecida à mão, respeitando o ritmo orgânico do trabalho artesanal e a nobreza das matérias-primas nacionais. O seu pedido acaba de dar entrada no nosso atelier e começará a ganhar forma pelas mãos da nossa equipa.
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
                  <tr>
                    <td style="color: rgba(36, 49, 25, 0.5); font-weight: 300; padding-bottom: 12px; font-size: 13px; text-align: left; border-bottom: 1px dashed rgba(36, 49, 25, 0.08);">ID da Encomenda:</td>
                    <td align="right" style="font-weight: bold; font-family: monospace; padding-bottom: 12px; font-size: 13px; color: #243119; text-align: right; border-bottom: 1px dashed rgba(36, 49, 25, 0.08);">${order.orderId}</td>
                  </tr>
                  <tr>
                    <td style="color: rgba(36, 49, 25, 0.5); font-weight: 300; padding-top: 12px; padding-bottom: 12px; font-size: 13px; text-align: left; border-bottom: 1px dashed rgba(36, 49, 25, 0.08);">Peça Selecionada:</td>
                    <td align="right" style="font-weight: bold; padding-top: 12px; padding-bottom: 12px; font-size: 13px; color: #243119; text-align: right; border-bottom: 1px dashed rgba(36, 49, 25, 0.08);">${order.productName}</td>
                  </tr>
                  <tr>
                    <td style="color: rgba(36, 49, 25, 0.5); font-weight: 300; padding-top: 12px; padding-bottom: 12px; font-size: 13px; text-align: left; border-bottom: 1px dashed rgba(36, 49, 25, 0.08);">Especificações:</td>
                    <td align="right" style="font-weight: bold; padding-top: 12px; padding-bottom: 12px; font-size: 13px; color: #243119; text-align: right; border-bottom: 1px dashed rgba(36, 49, 25, 0.08);">${order.selections.cor} ${order.selections.tamanho ? `| Tam. ${order.selections.tamanho}` : ''} ${order.selections.quantidade ? `| Qtd. ${order.selections.quantidade}` : ''}</td>
                  </tr>
                  <tr>
                    <td style="color: rgba(36, 49, 25, 0.5); font-weight: 300; padding-top: 12px; padding-bottom: 12px; font-size: 13px; text-align: left; border-bottom: 1px dashed rgba(36, 49, 25, 0.08);">Método de Pagamento:</td>
                    <td align="right" style="font-weight: bold; text-transform: uppercase; padding-top: 12px; padding-bottom: 12px; font-size: 13px; color: #243119; text-align: right; border-bottom: 1px dashed rgba(36, 49, 25, 0.08);">${formatPaymentMethod(order.paymentMethod)}</td>
                  </tr>
                  ${order.customer.nif ? `
                  <tr>
                    <td style="color: rgba(36, 49, 25, 0.5); font-weight: 300; padding-top: 12px; padding-bottom: 12px; font-size: 13px; text-align: left; border-bottom: 1px dashed rgba(36, 49, 25, 0.08);">NIF do Adquirente:</td>
                    <td align="right" style="font-weight: bold; padding-top: 12px; padding-bottom: 12px; font-size: 13px; color: #243119; text-align: right; border-bottom: 1px dashed rgba(36, 49, 25, 0.08);">${order.customer.nif}</td>
                  </tr>
                  ` : ''}
                  <tr>
                    <td style="color: rgba(36, 49, 25, 0.5); font-weight: 300; padding-top: 12px; padding-bottom: 15px; font-size: 13px; text-align: left; border-bottom: 1px solid rgba(36, 49, 25, 0.05);">Estado da Transação:</td>
                    <td align="right" style="font-weight: bold; text-transform: uppercase; padding-top: 12px; padding-bottom: 15px; font-size: 13px; color: #243119; text-align: right; border-bottom: 1px solid rgba(36, 49, 25, 0.05);">LIQUIDADO / CONFIRMADO</td>
                  </tr>
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
              Telemóvel: ${order.customer.telefone}
            </div>
          </div>

          <!-- PRODUCTION NOTE -->
          <div style="background-color: #FDFBF7; border-left: 3px solid #C5A059; padding: 15px; font-size: 12px; line-height: 1.6; font-style: italic; color: rgba(36, 49, 25, 0.8); margin-bottom: 35px;">
            <strong>Nota de Confecção:</strong> Por se tratar de um processo meticuloso e 100% manual, estimamos que a sua peça seja expedida num prazo de 7 a 14 dias úteis. Receberá uma nova notificação com o código de acompanhamento assim que for enviada.
          </div>

          <!-- DIVIDER -->
          <div style="height: 1px; background-color: rgba(36, 49, 25, 0.08); margin: 30px 0;"></div>

          <!-- FOOTER -->
          <div style="text-align: center; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 10px; text-transform: uppercase; letter-spacing: 0.15em; color: rgba(36, 49, 25, 0.4); line-height: 1.8;">
            M★BRAVO ATELIER &bull; PORTUGAL<br>
            <a href="mailto:${FROM_EMAIL}" style="color: #C5A059; text-decoration: none;">${FROM_EMAIL}</a>
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
  
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>[NOVO PEDIDO CONFIRMADO] M★BRAVO - ${order.orderId}</title>
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
      <p style="font-size: 14px; margin-top: 0;">Novo pedido recebido e pago com sucesso. Pagamento verificado em sistema.</p>
      
      <div class="section-title">Dados de Produção</div>
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
        <span class="value" style="text-transform: uppercase;">${formatPaymentMethod(order.paymentMethod)}</span>
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
        2. Reservar o novelo de fio de cor <strong>${order.selections.cor}</strong> no stock.<br>
        3. Emitir a etiqueta em couro M★BRAVO correspondente ao pedido.
      </p>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Main service method that handles emails.
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

  const hasSendGridKey = process.env.SENDGRID_API_KEY && 
                        process.env.SENDGRID_API_KEY !== "" && 
                        process.env.SENDGRID_API_KEY.startsWith("SG.") &&
                        !process.env.SENDGRID_API_KEY.includes("INSERT_") &&
                        !process.env.SENDGRID_API_KEY.includes("YOUR_") &&
                        !process.env.SENDGRID_API_KEY.includes("mock") &&
                        !process.env.SENDGRID_API_KEY.includes("test");

  if (hasSendGridKey) {
    const customerEmail = (order.customer.email || "").trim();
    if (customerEmail && customerEmail.includes('@')) {
      sendViaSendGrid(process.env.SENDGRID_API_KEY!, customerEmail, `M★BRAVO | Encomenda Confirmada - ${order.orderId}`, customerHtml)
        .catch(err => console.warn(`[EMAIL SYSTEM] SendGrid Error (Customer): ${err.message}`));
    }

    const adminEmail = NOTIFICATION_EMAIL; // handmade@mbravobycarolina.com
    sendViaSendGrid(process.env.SENDGRID_API_KEY!, adminEmail, `[NOVA ENCOMENDA PAGA] ${order.orderId} - Prioridade Atelier`, adminHtml)
      .catch(err => console.warn(`[EMAIL SYSTEM] SendGrid Error (Admin): ${err.message}`));
  }

  return {
    customerEmailUrl: `/emails/${custFileName}`,
    adminEmailUrl: `/emails/${adminFileName}`
  };
}

/**
 * Generates Multibanco payment instruction HTML.
 */
export function generateMultibancoEmailHtml(order: OrderData, multibancoRef: { entidade: string; referencia: string }): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dados de Pagamento Multibanco - M★BRAVO</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F5F2ED; color: #243119; font-family: 'Georgia', 'Garamond', serif;">
  <div class="wrapper" style="width: 100%; background-color: #F5F2ED; padding: 40px 0;">
    <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #FCFBF9; border: 1px solid rgba(36, 49, 25, 0.08); border-radius: 4px; margin: 0 auto;">
      <tr>
        <td style="padding: 50px 40px;">
          <table align="center" border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto 40px auto; text-align: center;">
            <tr>
              <td align="center" style="border-bottom: 1px solid #C5A059; padding-bottom: 5px; font-size: 24px; letter-spacing: 0.3em; font-weight: bold; color: #243119; text-transform: uppercase;">
                M★BRAVO
              </td>
            </tr>
          </table>

          <div style="font-size: 20px; line-height: 1.5; font-style: italic; text-align: center; margin-bottom: 30px; font-weight: 300; color: #243119;">
            Olá, ${order.customer.nome}.<br>A sua referência Multibanco foi gerada.
          </div>

          <div style="font-size: 14px; line-height: 1.8; color: rgba(36, 49, 25, 0.85); text-align: center; margin-bottom: 30px;">
            Para concluir a sua encomenda M★BRAVO, efetue o pagamento com os dados abaixo através de Homebanking ou caixa ATM (Pagamento de Serviços).
          </div>

          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #FCF8F2; border: 1px solid #C5A059; border-radius: 12px; margin-bottom: 30px;">
            <tr>
              <td style="padding: 25px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td colspan="2" align="center" style="font-family: sans-serif; font-size: 11px; text-transform: uppercase; letter-spacing: 0.2em; color: #A68244; font-weight: bold; padding-bottom: 20px;">
                      Dados para Pagamento
                    </td>
                  </tr>
                  <tr>
                    <td style="color: rgba(36, 49, 25, 0.6); padding-bottom: 12px; font-size: 14px;">Entidade:</td>
                    <td align="right" style="font-weight: bold; font-family: monospace; font-size: 15px; padding-bottom: 12px; color: #243119;">${multibancoRef.entidade}</td>
                  </tr>
                  <tr>
                    <td style="color: rgba(36, 49, 25, 0.6); padding-top: 12px; padding-bottom: 12px; font-size: 14px;">Referência:</td>
                    <td align="right" style="font-weight: bold; font-family: monospace; font-size: 15px; padding-top: 12px; padding-bottom: 12px; color: #243119;">${multibancoRef.referencia}</td>
                  </tr>
                  <tr>
                    <td style="color: rgba(36, 49, 25, 0.6); padding-top: 12px; font-size: 14px;">Montante:</td>
                    <td align="right" style="font-weight: bold; color: #A68244; font-size: 16px; padding-top: 12px;">Total: ${order.price}</td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          <div style="font-size: 12px; font-style: italic; color: rgba(36, 49, 25, 0.6); text-align: center; line-height: 1.6; margin-bottom: 30px;">
            Nota: Assim que efetuar o pagamento, receberá um e-mail de confirmação automático e iniciaremos a confeção da sua peça.
          </div>

          <div style="text-align: center; font-family: sans-serif; font-size: 10px; text-transform: uppercase; letter-spacing: 0.15em; color: rgba(36, 49, 25, 0.4);">
            M★BRAVO ATELIER &bull; PORTUGAL<br>
            <a href="mailto:${FROM_EMAIL}" style="color: #C5A059; text-decoration: none;">${FROM_EMAIL}</a>
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

  const hasSendGridKey = process.env.SENDGRID_API_KEY && 
                        process.env.SENDGRID_API_KEY !== "" && 
                        process.env.SENDGRID_API_KEY.startsWith("SG.");

  if (hasSendGridKey) {
    sendViaSendGrid(process.env.SENDGRID_API_KEY!, order.customer.email, `M★BRAVO | Dados para Pagamento Multibanco - Encomenda ${order.orderId}`, customerHtml)
      .catch(err => console.warn(`[EMAIL SYSTEM] SendGrid Error (Multibanco): ${err.message}`));
  }

  return { customerEmailUrl: `/emails/${custFileName}` };
}

async function sendViaSendGrid(apiKey: string, toEmail: string, subject: string, htmlContent: string) {
  const url = 'https://api.sendgrid.com/v3/mail/send';
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: toEmail }] }],
      from: { email: FROM_EMAIL, name: 'M BRAVO' },
      subject: subject,
      content: [{ type: 'text/html', value: htmlContent }]
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`SendGrid API failure: ${response.status} - ${errText}`);
  }
}

export function generateShippedEmailHtml(order: OrderData, trackingCode: string): string {
  const trackingUrl = `https://www.ctt.pt/feapl_2/app/open/objectSearch/objectSearch.jspx?lang=def&objects=${trackingCode}`;
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>A sua Encomenda foi Enviada! - M★BRAVO</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F5F2ED; color: #243119; font-family: 'Georgia', 'Garamond', serif;">
  <div class="wrapper" style="width: 100%; background-color: #F5F2ED; padding: 40px 0;">
    <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #FCFBF9; border: 1px solid rgba(36, 49, 25, 0.08); border-radius: 4px; margin: 0 auto;">
      <tr>
        <td style="padding: 50px 40px;">
          <table align="center" border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto 40px auto; text-align: center;">
            <tr>
              <td align="center" style="border-bottom: 1px solid #C5A059; padding-bottom: 5px; font-size: 24px; letter-spacing: 0.3em; font-weight: bold; color: #243119; text-transform: uppercase;">
                M★BRAVO
              </td>
            </tr>
          </table>

          <div style="font-size: 20px; line-height: 1.5; font-style: italic; text-align: center; margin-bottom: 30px; font-weight: 300; color: #243119;">
            Olá, ${order.customer.nome}.<br>A sua peça M★BRAVO já está a caminho!
          </div>

          <div style="font-size: 14px; line-height: 1.8; color: rgba(36, 49, 25, 0.85); text-align: justify; margin-bottom: 30px;">
            A sua peça foi tecida à mão no nosso atelier com todo o afeto e dedicação. A sua encomenda foi carinhosamente embalada e entregue aos CTT para envio.
          </div>

          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #FCF8F2; border: 1px solid #C5A059; border-radius: 12px; margin-bottom: 30px;">
            <tr>
              <td style="padding: 25px; text-align: center;">
                <div style="font-size: 14px; margin-bottom: 8px;">Código de Rastreio (CTT):</div>
                <div style="font-family: monospace; font-size: 18px; font-weight: bold; color: #A68244; margin-bottom: 15px;">${trackingCode}</div>
                <a href="${trackingUrl}" target="_blank" style="display: inline-block; background-color: #243119; color: #F5F2ED; font-family: sans-serif; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.15em; text-decoration: none; padding: 12px 24px; border-radius: 50px;">
                  Rastrear nos CTT
                </a>
              </td>
            </tr>
          </table>

          <div style="text-align: center; font-family: sans-serif; font-size: 10px; text-transform: uppercase; letter-spacing: 0.15em; color: rgba(36, 49, 25, 0.4);">
            M★BRAVO ATELIER &bull; PORTUGAL<br>
            <a href="mailto:${FROM_EMAIL}" style="color: #C5A059; text-decoration: none;">${FROM_EMAIL}</a>
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

  const hasSendGridKey = process.env.SENDGRID_API_KEY && 
                        process.env.SENDGRID_API_KEY !== "" && 
                        process.env.SENDGRID_API_KEY.startsWith("SG.");

  if (hasSendGridKey) {
    sendViaSendGrid(process.env.SENDGRID_API_KEY!, order.customer.email, `M★BRAVO | A sua Encomenda foi Enviada! - ${order.orderId}`, customerHtml)
      .catch(err => console.warn(`[EMAIL SYSTEM] SendGrid Error (Shipped): ${err.message}`));
  }

  return { shippedEmailUrl: `/emails/${custFileName}` };
}
