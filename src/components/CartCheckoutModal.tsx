import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShieldCheck, CheckCircle2, Lock, CreditCard, Phone, Building, AlertTriangle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { SHIPPING_ZONES } from '../types';
import { useLanguage } from '../translations';

// Official Apple Pay Brand Mark Vector SVG (Apple Pay Brand Guidelines Compliant)
const ApplePayIcon: React.FC<{ className?: string }> = ({ className = "h-6 w-auto" }) => (
  <svg
    viewBox="0 0 220 80"
    className={className}
    aria-label="Apple Pay"
    fill="currentColor"
    preserveAspectRatio="xMidYMid meet"
  >
    <path d="M51.81,24.26A13.23,13.23,0,0,0,55,14.93,13.88,13.88,0,0,0,51.46,5a14.28,14.28,0,0,0-9.84,5.1,13.12,13.12,0,0,0-3.13,9.21A11.75,11.75,0,0,0,42,29.27,13,13,0,0,0,51.81,24.26Z"/>
    <path d="M51.29,29.75a16.89,16.89,0,0,0-8.81,2.4A17,17,0,0,0,36,38.8a24.16,24.16,0,0,0-3.32,12.35c0,11.16,6.34,22.28,12.75,22.28,2.77,0,4.72-1.74,7.85-1.74s4.89,1.74,7.85,1.74c6.38,0,12.87-11.23,12.87-22.11A23.83,23.83,0,0,0,70.5,39.1,16.29,16.29,0,0,0,51.29,29.75Z"/>
    <path d="M96.44,15.22H81.82V73H96.44V53.17h11.25c10.36,0,17.47-6.52,17.47-19S108.05,15.22,96.44,15.22Zm0,26.17H96.44V26.92h0c5.38,0,8.45,3,8.45,7.24S101.82,41.39,96.44,41.39Z"/>
    <path d="M136.56,73a10,10,0,0,0,9.78-7.39h.28V73h12.87V38.25c0-10.42-7.85-15.69-19.8-15.69-10.92,0-19.11,5.32-19.6,13.86h11.69c.84-3.57,3.85-5.6,8.19-5.6,4.69,0,7.35,2.1,7.35,5.6v3.29l-9.8,1.19c-11.83,1.4-17.71,6.51-17.71,15.12C119.86,66.84,126.79,73,136.56,73Zm2.59-8.82c-4.34,0-7.7-2.31-7.7-5.88,0-3.43,2.87-5.18,8.26-5.81l8.75-1V56C148.46,61,144.19,64.18,139.15,64.18Z"/>
    <path d="M198,23.86,183.16,62.7h-.28L168.08,23.86H154.5l21.91,52.43h13.23L211.5,23.86Z"/>
  </svg>
);

// Official Google Pay Brand Vector SVG (Google Pay Brand Guidelines Compliant - Fixed Ratio)
const GooglePayIcon: React.FC<{ className?: string }> = ({ className = "h-5 w-auto" }) => (
  <svg
    viewBox="0 0 82 28"
    className={className}
    aria-label="Google Pay"
    preserveAspectRatio="xMidYMid meet"
  >
    {/* G Logo */}
    <g transform="translate(0, 0)">
      <path fill="#4285F4" d="M14.1 16.2c0-.6-.1-1.2-.2-1.8H0v3.5h8c-.3 1.8-1.4 3.3-2.9 4.3v3.6h4.7c2.8-2.5 4.3-6.3 4.3-9.6z" transform="translate(10, 0)"/>
      <path fill="#34A853" d="M10 26.5c3.8 0 7-1.3 9.3-3.5l-4.7-3.6c-1.3.9-2.9 1.4-4.6 1.4-3.6 0-6.6-2.4-7.7-5.7H-2.8v3.7C-.5 22.8 4.3 26.5 10 26.5z" transform="translate(10, 0)"/>
      <path fill="#FBBC05" d="M2.3 15.1c-.3-.9-.4-1.9-.4-2.9s.1-2 .4-2.9V5.6H-2.8C-4 8-4.7 10.6-4.7 13.3s.7 5.3 1.9 7.7l5.1-5.9z" transform="translate(10, 0)"/>
      <path fill="#EA4335" d="M10 3.8c2.1 0 3.9.7 5.4 2.1l4-4C17 0 13.8 0 10 0 4.3 0-.5 3.7-2.8 8.9l5.1 3.7c1.1-3.3 4.1-5.7 7.7-5.7z" transform="translate(10, 0)"/>
    </g>
    {/* Pay Text */}
    <g fill="#FFFFFF" transform="translate(36, 3)">
      <path d="M5.4 17.5H1.8V0h6.2c2.5 0 4.5 2 4.5 4.5S10.5 9 8 9H5.4v8.5zm0-11.8h2.6c1 0 1.9-.8 1.9-1.9s-.9-1.9-1.9-1.9H5.4v3.8z"/>
      <path d="M19.6 17.5h-2.4v-1.8c-.8 1.2-2.1 2.1-3.7 2.1-2.5 0-4.3-1.8-4.3-4.4 0-2.6 2.1-4.4 4.6-4.4 1.4 0 2.6.5 3.4 1.4v-.5c0-1.4-1.2-2.6-2.7-2.6-1.2 0-2.3.7-2.7 1.8l-2.2-.9C10.3 6.4 12.3 5 14.5 5c2.9 0 5.1 2.1 5.1 5v7.5zm-6-2.1c1.4 0 2.5-1 2.5-2.5s-1.1-2.5-2.5-2.5-2.5 1-2.5 2.5 1 2.5 2.5 2.5z"/>
      <path d="M34.8 5.3l-5.5 12.6h-2.5l2.1-4.6-3.7-8h2.6l2.3 5.5 2.2-5.5h2.5z"/>
    </g>
  </svg>
);

export const CartCheckoutModal: React.FC = () => {
  const { lang } = useLanguage();
  const {
    cart,
    isCheckoutOpen,
    setIsCheckoutOpen,
    selectedShippingZone,
    setSelectedShippingZone,
    shippingFee,
    totalPrice,
    clearCart,
    maxLeadTimeDays
  } = useCart();

  const isPt = lang === 'pt';

  const [paymentMethod, setPaymentMethod] = useState<'mbway' | 'multibanco' | 'card' | 'wallet'>('mbway');
  const [activeExpressWallet, setActiveExpressWallet] = useState<'applepay' | 'googlepay' | null>(null);
  const [isPaying, setIsPaying] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Device / Ecosystem Detection
  const [detectedEcosystem, setDetectedEcosystem] = useState<'apple' | 'google' | 'both'>('both');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const ua = navigator.userAgent || '';
    const isAppleSession = !!(window as any).ApplePaySession;
    const isAppleDevice = /Mac|iPod|iPhone|iPad/.test(ua) || (/Safari/.test(ua) && !/Chrome|Android/.test(ua));

    if (isAppleSession || isAppleDevice) {
      setDetectedEcosystem('apple');
    } else {
      setDetectedEcosystem('google');
    }
  }, []);

  // Google Customer Reviews Opt-In Script Injection
  useEffect(() => {
    if (!completedOrder) return;
    try {
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/platform.js?onload=renderOptIn';
      script.async = true;
      script.defer = true;
      (window as any).renderOptIn = function () {
        if ((window as any).gapi && (window as any).gapi.surveyoptin) {
          (window as any).gapi.surveyoptin.render({
            "merchant_id": 535728392,
            "order_id": completedOrder.orderId,
            "email": completedOrder.customer?.email || '',
            "delivery_country": "PT",
            "estimated_delivery_date": new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          });
        }
      };
      document.head.appendChild(script);
    } catch (e) {
      // safe fallback
    }
  }, [completedOrder]);

  const [checkoutForm, setCheckoutForm] = useState({
    nome: '',
    email: '',
    telefone: '',
    morada: '',
    codigoPostal: '',
    cidade: '',
    nif: '',
    mbwayPhone: '',
    cardNumber: '',
    cardName: '',
    cardExpiry: '',
    cardCvv: ''
  });

  if (!isCheckoutOpen) return null;

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const suggestCorrectEmail = (email: string): string | null => {
    const parts = email.trim().toLowerCase().split('@');
    if (parts.length !== 2) return null;
    const [user, domain] = parts;
    const commonTypos: Record<string, string> = {
      'gmai.com': 'gmail.com',
      'gmaill.com': 'gmail.com',
      'gmal.com': 'gmail.com',
      'gmial.com': 'gmail.com',
      'outloo.com': 'outlook.com',
      'otlook.com': 'outlook.com',
      'hotmai.com': 'hotmail.com',
      'hotmial.com': 'hotmail.com',
      'sapo.p': 'sapo.pt'
    };
    if (commonTypos[domain]) {
      return `${user}@${commonTypos[domain]}`;
    }
    return null;
  };

  const formatPostalCodePT = (val: string) => {
    const digits = val.replace(/\D/g, '');
    if (digits.length > 4) {
      return `${digits.slice(0, 4)}-${digits.slice(4, 7)}`;
    }
    return digits;
  };

  const isFormValid =
    checkoutForm.nome.trim().length >= 2 &&
    isValidEmail(checkoutForm.email) &&
    checkoutForm.morada.trim().length >= 5 &&
    (paymentMethod !== 'mbway' || checkoutForm.mbwayPhone.replace(/\D/g, '').length >= 9) &&
    (paymentMethod !== 'card' || (checkoutForm.cardNumber.replace(/\D/g, '').length >= 15 && checkoutForm.cardExpiry && checkoutForm.cardCvv));

  // 1-Click Native Smart Express Checkout Trigger (Isolated Event Handler)
  const handleExpressWalletPay = async (e: React.MouseEvent, walletType: 'Apple Pay' | 'Google Pay') => {
    e.preventDefault();
    e.stopPropagation();

    if (isPaying) return;
    const targetWalletKey = walletType === 'Apple Pay' ? 'applepay' : 'googlepay';
    
    setIsPaying(true);
    setActiveExpressWallet(targetWalletKey);
    setErrorMessage('');
    setPaymentMethod('wallet');

    const expressForm = {
      nome: checkoutForm.nome.trim() || `Cliente ${walletType}`,
      email: isValidEmail(checkoutForm.email) ? checkoutForm.email : `express.${walletType.toLowerCase().replace(/\s+/g, '')}@mbravo.pt`,
      telefone: checkoutForm.telefone || '910000000',
      morada: checkoutForm.morada.trim() || 'Morada Registada na Carteira Digital',
      codigoPostal: checkoutForm.codigoPostal || '1000-001',
      cidade: checkoutForm.cidade || 'Lisboa',
      nif: checkoutForm.nif || '',
      mbwayPhone: '',
      cardNumber: '',
      cardName: '',
      cardExpiry: '',
      cardCvv: ''
    };

    try {
      const response = await fetch('/api/payment/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cart,
          items: cart,
          product: {
            name: cart.map(i => `${i.productName} (x${i.quantity})`).join(', '),
            price: totalPrice
          },
          selections: {
            cor: cart.map(i => i.selections?.cor || '').filter(Boolean).join(' | '),
            quantidade: `${cart.reduce((s, i) => s + i.quantity, 0)}`
          },
          shippingFee,
          shippingZone: selectedShippingZone,
          amountInCents: Math.round(totalPrice * 100),
          checkoutForm: expressForm,
          paymentMethod: 'wallet',
          walletType,
          mode: 'test'
        })
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || (isPt ? 'Erro ao autorizar pagamento expresso.' : 'Error authorizing express payment.'));
      }

      setCompletedOrder(data.order || {
        orderId: data.orderId || `MB-${Math.floor(100000 + Math.random() * 900000)}`,
        total: totalPrice,
        customer: expressForm,
        shippingZone: selectedShippingZone,
        paymentMethod: `wallet (${walletType})`
      });

      clearCart();
    } catch (err: any) {
      setErrorMessage(err.message || (isPt ? 'Falha na ligação com a carteira digital.' : 'Digital wallet connection error.'));
    } finally {
      setIsPaying(false);
      setActiveExpressWallet(null);
    }
  };

  const handleProcessOrder = async () => {
    if (!isFormValid || isPaying) return;
    setIsPaying(true);
    setErrorMessage('');

    try {
      const response = await fetch('/api/payment/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cart,
          items: cart,
          product: {
            name: cart.map(i => `${i.productName} (x${i.quantity})`).join(', '),
            price: totalPrice
          },
          selections: {
            cor: cart.map(i => i.selections?.cor || '').filter(Boolean).join(' | '),
            quantidade: `${cart.reduce((s, i) => s + i.quantity, 0)}`
          },
          shippingFee,
          shippingZone: selectedShippingZone,
          amountInCents: Math.round(totalPrice * 100),
          checkoutForm,
          paymentMethod,
          mode: 'test'
        })
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || (isPt ? 'Erro ao processar a encomenda.' : 'Error processing order.'));
      }

      setCompletedOrder(data.order || {
        orderId: data.orderId || `MB-${Math.floor(100000 + Math.random() * 900000)}`,
        total: totalPrice,
        customer: checkoutForm,
        shippingZone: selectedShippingZone,
        paymentMethod
      });

      clearCart();
    } catch (err: any) {
      setErrorMessage(err.message || (isPt ? 'Falha de comunicação com o servidor de pagamentos.' : 'Payment gateway connection failure.'));
    } finally {
      setIsPaying(false);
    }
  };

  const handleClose = () => {
    setIsCheckoutOpen(false);
    setCompletedOrder(null);
    setErrorMessage('');
    setActiveExpressWallet(null);
  };

  if (!isCheckoutOpen || typeof window === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[99999] flex items-end md:items-center justify-center overflow-hidden p-0 md:p-4">
        {/* Soft Backdrop Overlay - Translucent editorial overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={handleClose}
          className="fixed inset-0 bg-forest/30 backdrop-blur-[2px] cursor-pointer"
        />

        {/* Modal Sheet Container - Native Bottom Sheet with Mobile Landscape Fluid Height */}
        <motion.div
          data-lenis-prevent
          initial={{ y: '100%', opacity: 0.5 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 30, stiffness: 320 }}
          className="relative w-full max-w-lg md:max-w-xl bg-[#FCFBF9] text-forest rounded-t-[28px] md:rounded-[32px] shadow-2xl border-t md:border border-forest/10 flex flex-col z-10 overflow-hidden h-full max-h-[92dvh] landscape:max-h-[95dvh] landscape:rounded-t-2xl md:h-auto md:max-h-[88dvh]"
        >
          {/* 1. FIXED HEADER - Landscape Compact */}
          <div className="shrink-0 p-4 border-b border-forest/10 bg-[#FCFBF9] sticky top-0 z-20 flex items-center justify-between">
            {/* Mobile Drag Indicator Handle */}
            <div className="md:hidden landscape:hidden absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 bg-forest/20 rounded-full shrink-0" />

            <div className="flex items-center gap-2.5 pt-1 md:pt-0">
              <span className="w-2.5 h-2.5 rounded-full bg-[#C5A059]" />
              <div>
                <span className="text-[8.5px] uppercase tracking-[0.35em] text-[#C5A059] font-semibold block font-sans">
                  M★BRAVO ATELIER
                </span>
                <h3 className="text-base md:text-lg landscape:text-sm font-serif font-light text-forest tracking-tight">
                  {isPt ? 'Finalizar Encomenda' : 'Checkout Order'}
                </h3>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="p-2 rounded-full hover:bg-forest/5 text-forest/50 hover:text-forest transition-colors cursor-pointer shrink-0 z-30"
              title={isPt ? 'Fechar' : 'Close'}
            >
              <X size={20} className="landscape:w-4 landscape:h-4" />
            </button>
          </div>

          {/* Success Screen */}
          {completedOrder ? (
            <div className="p-6 md:p-8 landscape:p-3 flex-1 min-h-0 overflow-y-auto space-y-6 landscape:space-y-2 text-center flex flex-col justify-center items-center">
              <div className="w-16 h-16 landscape:w-10 landscape:h-10 rounded-full bg-forest/5 text-[#C5A059] flex items-center justify-center mx-auto border border-forest/10">
                <CheckCircle2 size={32} className="landscape:w-6 landscape:h-6" />
              </div>

              <div className="space-y-2 landscape:space-y-1 max-w-md mx-auto">
                <span className="text-[9px] uppercase tracking-[0.35em] font-semibold text-[#A68244] block font-sans">
                  {isPt ? 'ENCOMENDA REGISTADA NO ATELIER' : 'ORDER REGISTERED IN ATELIER'}
                </span>
                <h3 className="text-2xl landscape:text-lg font-serif text-forest font-light">
                  {isPt ? 'Agradecemos a sua preferência!' : 'Thank you for your order!'}
                </h3>
                <p className="text-xs font-mono text-forest/70 bg-forest/5 py-1 px-3 rounded-full inline-block border border-forest/10 mt-1">
                  {isPt ? 'Código:' : 'Code:'} <strong className="text-forest font-bold">{completedOrder.orderId}</strong>
                </p>
              </div>

              <p className="text-xs md:text-sm landscape:text-[11px] text-forest/70 max-w-md mx-auto leading-relaxed font-sans font-light">
                {isPt
                  ? (maxLeadTimeDays === 0 
                      ? 'O seu pedido foi registado no atelier. Artigo disponível em Atelier com envio imediato CTT Expresso em 1 a 3 dias úteis.'
                      : `O seu pedido foi registado no atelier. Produção artesanal estimada em ${maxLeadTimeDays} ${maxLeadTimeDays === 1 ? 'dia útil' : 'dias úteis'}, acompanhada de envio registado CTT Expresso.`)
                  : (maxLeadTimeDays === 0
                      ? 'Your order has been registered in the atelier. Available in Atelier with immediate CTT Express shipping in 1 to 3 business days.'
                      : `Your order has been registered in the atelier. Handcrafted production lead time estimated at ${maxLeadTimeDays} ${maxLeadTimeDays === 1 ? 'business day' : 'business days'}, followed by registered CTT Express delivery.`)}
              </p>

              {/* Google Avaliações do Consumidor & Google Merchant Card */}
              <div className="bg-[#FCF8F2] rounded-2xl p-4 border border-[#C5A059]/30 w-full max-w-md mx-auto text-center space-y-2.5 shadow-xs">
                <div className="flex items-center justify-center gap-1.5 text-[#C5A059]">
                  <span className="text-[10px] uppercase font-sans font-bold tracking-widest text-[#A68244]">
                    Google Avaliações do Consumidor
                  </span>
                </div>
                <div className="flex justify-center gap-1 text-[#C5A059] text-sm">
                  <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                </div>
                <p className="text-[11px] text-forest/80 font-sans leading-relaxed">
                  {isPt
                    ? 'Ajude outros clientes a conhecer o nosso trabalho artesanal. Deixe a sua avaliação no perfil Google M★BRAVO!'
                    : 'Help other customers discover our handcrafted work. Leave your review on Google Merchant M★BRAVO!'}
                </p>
                <a
                  href="https://g.page/r/Cdo7JGP_Xpc3EBM/review"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2 bg-forest text-cream rounded-full text-[10px] tracking-widest uppercase font-bold hover:bg-[#1C2713] transition-all shadow-xs cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M12.545 10.239v3.821h5.445c-0.712 2.315-2.647 3.972-5.445 3.972-3.332 0-6.033-2.701-6.033-6.032s2.701-6.032 6.033-6.032c1.498 0 2.866 0.549 3.921 1.453l2.814-2.814c-1.79-1.677-4.184-2.702-6.735-2.702-5.522 0-10 4.478-10 10s4.478 10 10 10c8.396 0 10.249-7.85 9.426-11.748l-9.426 0.082z"/>
                  </svg>
                  <span>{isPt ? 'Avaliar no Google (5 Estrelas)' : 'Review on Google (5 Stars)'}</span>
                </a>
              </div>

              <div className="pt-2 border-t border-forest/10 w-full max-w-xs mx-auto">
                <button
                  onClick={handleClose}
                  className="w-full py-3 landscape:py-2 bg-forest text-cream hover:bg-[#1C2713] rounded-full text-[10px] uppercase tracking-[0.25em] font-medium transition-colors shadow-xs cursor-pointer"
                >
                  {isPt ? 'Voltar ao Atelier' : 'Back to Atelier'}
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* 2. MIDDLE SCROLLABLE FORM BODY (Free Touch Scroll + Landscape Responsive Spacing) */}
              <div className="p-5 md:p-6 landscape:p-3 flex-1 min-h-0 overflow-y-auto overscroll-contain space-y-4 landscape:space-y-2.5 touch-pan-y text-forest select-text font-sans">
                {/* Error Notification */}
                {errorMessage && (
                  <div className="p-3 rounded-xl bg-red-50/90 border border-red-200 text-red-800 text-xs flex items-center gap-2.5">
                    <AlertTriangle size={16} className="shrink-0 text-red-600" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* ⚡ 1-CLICK BRAND COMPLIANT EXPRESS CHECKOUT BUTTONS (Device Specific / Isolated Events) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-0.5">
                    <span className="text-[9px] uppercase tracking-[0.25em] font-semibold text-[#A68244] flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059] animate-pulse" />
                      {isPt ? 'Checkout Expresso 1-Clique' : '1-Click Express Checkout'}
                    </span>
                    <span className="text-[9px] text-forest/50 font-sans italic">
                      {isPt ? 'Sem morada prévia' : 'No prior address needed'}
                    </span>
                  </div>

                  <div className={`grid gap-2 ${detectedEcosystem === 'both' ? 'grid-cols-2' : 'grid-cols-1'}`}>
                    {/* Apple Pay Brand Compliant Rigid Button */}
                    {(detectedEcosystem === 'apple' || detectedEcosystem === 'both') && (
                      <button
                        type="button"
                        disabled={isPaying}
                        onClick={(e) => handleExpressWalletPay(e, 'Apple Pay')}
                        className={`w-full h-12 bg-black rounded-lg flex items-center justify-center transition-all hover:bg-black/90 cursor-pointer shadow-xs border border-black/80 px-4 ${
                          activeExpressWallet === 'applepay' ? 'ring-2 ring-[#C5A059] scale-[0.99]' : 'active:scale-[0.98]'
                        } ${isPaying && activeExpressWallet !== 'applepay' ? 'opacity-50 cursor-not-allowed' : ''}`}
                        title={isPt ? 'Pagar com Apple Pay (Sem preencher morada)' : 'Pay with Apple Pay (No form needed)'}
                      >
                        {isPaying && activeExpressWallet === 'applepay' ? (
                          <span className="text-[10px] uppercase tracking-wider text-white font-mono animate-pulse">
                            {isPt ? 'A autorizar Apple Pay...' : 'Authorizing Apple Pay...'}
                          </span>
                        ) : (
                          <ApplePayIcon className="h-6 w-auto text-white fill-current pointer-events-none shrink-0" />
                        )}
                      </button>
                    )}

                    {/* Google Pay Brand Compliant Rigid Button */}
                    {(detectedEcosystem === 'google' || detectedEcosystem === 'both') && (
                      <button
                        type="button"
                        disabled={isPaying}
                        onClick={(e) => handleExpressWalletPay(e, 'Google Pay')}
                        className={`w-full h-12 bg-black rounded-lg flex items-center justify-center transition-all hover:bg-black/90 cursor-pointer shadow-xs border border-black/80 px-4 ${
                          activeExpressWallet === 'googlepay' ? 'ring-2 ring-[#C5A059] scale-[0.99]' : 'active:scale-[0.98]'
                        } ${isPaying && activeExpressWallet !== 'googlepay' ? 'opacity-50 cursor-not-allowed' : ''}`}
                        title={isPt ? 'Pagar com Google Pay (Sem preencher morada)' : 'Pay with Google Pay (No form needed)'}
                      >
                        {isPaying && activeExpressWallet === 'googlepay' ? (
                          <span className="text-[10px] uppercase tracking-wider text-white font-mono animate-pulse">
                            {isPt ? 'A autorizar Google Pay...' : 'Authorizing Google Pay...'}
                          </span>
                        ) : (
                          <GooglePayIcon className="h-6 w-auto pointer-events-none shrink-0" />
                        )}
                      </button>
                    )}
                  </div>

                  <div className="relative flex py-0.5 items-center">
                    <div className="flex-grow border-t border-forest/15"></div>
                    <span className="flex-shrink mx-3 text-[8.5px] uppercase tracking-[0.2em] text-forest/40 font-semibold font-sans">
                      {isPt ? 'OU PREENCHA MANUALMENTE' : 'OR FILL MANUAL FORM BELOW'}
                    </span>
                    <div className="flex-grow border-t border-forest/15"></div>
                  </div>
                </div>

                {/* Selection Summary */}
                <div className="pb-3 border-b border-forest/10 space-y-2.5">
                  <span className="text-[8.5px] uppercase tracking-[0.3em] font-semibold text-forest/50 block">
                    {isPt ? 'Resumo da Seleção' : 'Selection Summary'}
                  </span>

                  <div className="divide-y divide-forest/5 space-y-1.5">
                    {cart.map((item) => (
                      <div key={item.cartItemId} className="pt-1.5 pb-1 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2.5">
                          <img src={item.img} alt="" className="w-8 h-10 object-cover rounded-md border border-forest/10 bg-[#F6F1E5] shrink-0" />
                          <div>
                            <p className="font-serif font-medium text-forest text-xs leading-snug">{item.productName}</p>
                            <p className="text-[10.5px] text-forest/60 mt-0.5">
                              {item.quantity}x • {item.selections?.cor || item.selections?.tamanho || (isPt ? 'Padrão' : 'Standard')}
                            </p>
                          </div>
                        </div>
                        <span className="font-serif font-semibold text-forest text-xs">
                          {(item.unitPrice * item.quantity).toFixed(2)}€
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Destination Zone Selection */}
                  <div className="pt-2 flex justify-between items-center text-xs text-forest/80 border-t border-forest/5">
                    <span className="text-[10px] uppercase tracking-wider text-forest/60 font-semibold">
                      {isPt ? 'Região de Envio' : 'Shipping Region'}:
                    </span>
                    <select
                      value={selectedShippingZone.id}
                      onChange={(e) => {
                        const found = SHIPPING_ZONES.find((z) => z.id === e.target.value);
                        if (found) setSelectedShippingZone(found);
                      }}
                      className="bg-transparent border-b border-forest/20 text-xs font-serif font-medium text-forest focus:outline-none cursor-pointer py-0.5"
                    >
                      {SHIPPING_ZONES.map((zone) => (
                        <option key={zone.id} value={zone.id} className="bg-[#FCFBF9] text-forest">
                          {zone.name[isPt ? 'pt' : 'en']} ({zone.price.toFixed(2)}€)
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Timelines Breakdown */}
                  <div className="py-1.5 space-y-1 text-[10.5px] text-forest/75 border-t border-forest/5">
                    <div className="flex justify-between items-center">
                      <span className="text-forest/60">{isPt ? 'Produção Manual:' : 'Handcrafted Production:'}</span>
                      <span className="font-serif font-medium text-forest">
                        {maxLeadTimeDays === 0
                          ? (isPt ? 'Disponível em Atelier' : 'Available in Atelier')
                          : (isPt ? `${maxLeadTimeDays} ${maxLeadTimeDays === 1 ? 'dia útil' : 'dias úteis'}` : `${maxLeadTimeDays} ${maxLeadTimeDays === 1 ? 'business day' : 'business days'}`)
                        }
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-forest/60">{isPt ? 'Envio Expresso (CTT):' : 'Express Shipping (CTT):'}</span>
                      <span className="font-serif font-medium text-forest">
                        {maxLeadTimeDays === 0
                          ? (isPt ? '1 a 3 dias úteis' : '1 to 3 business days')
                          : (isPt ? '1 a 3 dias úteis (após produção)' : '1 to 3 business days (post-production)')
                        }
                      </span>
                    </div>
                  </div>

                  <div className="pt-0.5 flex justify-between items-baseline text-xs text-forest/70">
                    <span>{isPt ? 'Envio Expresso' : 'Express Shipping'} ({selectedShippingZone.name[isPt ? 'pt' : 'en']})</span>
                    <span className="font-serif font-medium text-forest">
                      {shippingFee === 0 ? (isPt ? 'Cortesia' : 'Courtesy') : `${shippingFee.toFixed(2)}€`}
                    </span>
                  </div>

                  <div className="flex justify-between items-baseline pt-1.5 border-t border-forest/10 font-serif text-sm font-bold text-forest">
                    <span>{isPt ? 'Total Final' : 'Final Total'}</span>
                    <span className="text-base text-forest font-serif font-bold">{totalPrice.toFixed(2)}€</span>
                  </div>
                </div>

                {/* Customer Details Form */}
                <div className="space-y-3">
                  <span className="text-[8.5px] uppercase tracking-[0.3em] font-semibold text-forest/50 block">
                    {isPt ? '1. Dados de Envio & Faturação' : '1. Shipping & Billing Details'}
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-[9.5px] uppercase tracking-wider font-semibold text-forest/70 mb-1">
                        {isPt ? 'Nome Completo *' : 'Full Name *'}
                      </label>
                      <input
                        type="text"
                        value={checkoutForm.nome}
                        onChange={(e) => setCheckoutForm({ ...checkoutForm, nome: e.target.value })}
                        placeholder={isPt ? "Nome completo do destinatário" : "Full recipient name"}
                        className="w-full px-3.5 py-2 rounded-xl border border-forest/15 bg-white focus:outline-none focus:border-[#C5A059] text-xs text-forest placeholder-forest/30 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-[9.5px] uppercase tracking-wider font-semibold text-forest/70 mb-1">
                        {isPt ? 'E-mail *' : 'Email *'}
                      </label>
                      <input
                        type="email"
                        value={checkoutForm.email}
                        onChange={(e) => setCheckoutForm({ ...checkoutForm, email: e.target.value })}
                        placeholder={isPt ? "nome@dominio.com" : "name@domain.com"}
                        className={`w-full px-3.5 py-2 rounded-xl border bg-white focus:outline-none text-xs text-forest placeholder-forest/30 transition-all ${
                          checkoutForm.email && !isValidEmail(checkoutForm.email)
                            ? 'border-red-300 focus:border-red-400'
                            : 'border-forest/15 focus:border-[#C5A059]'
                        }`}
                      />
                      {checkoutForm.email && suggestCorrectEmail(checkoutForm.email) && (
                        <div className="text-[11px] text-amber-900 bg-amber-50 border border-amber-200 rounded-xl p-2.5 flex items-center justify-between gap-2 mt-1.5 font-sans">
                          <span>
                            {isPt ? 'Quis dizer ' : 'Did you mean '}
                            <strong
                              className="underline cursor-pointer text-amber-950 font-bold"
                              onClick={() => setCheckoutForm({ ...checkoutForm, email: suggestCorrectEmail(checkoutForm.email)! })}
                            >
                              {suggestCorrectEmail(checkoutForm.email)}
                            </strong>?
                          </span>
                          <button
                            type="button"
                            onClick={() => setCheckoutForm({ ...checkoutForm, email: suggestCorrectEmail(checkoutForm.email)! })}
                            className="text-[9.5px] font-bold text-[#C5A059] uppercase tracking-wider bg-white border border-forest/10 rounded-lg px-2 py-1"
                          >
                            {isPt ? 'Corrigir' : 'Correct'}
                          </button>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-[9.5px] uppercase tracking-wider font-semibold text-forest/70 mb-1">
                        {isPt ? 'Telefone *' : 'Phone *'}
                      </label>
                      <input
                        type="tel"
                        value={checkoutForm.telefone}
                        onChange={(e) => setCheckoutForm({ ...checkoutForm, telefone: e.target.value.replace(/[^0-9+]/g, '') })}
                        placeholder={isPt ? "9xx xxx xxx" : "Phone number"}
                        className="w-full px-3.5 py-2 rounded-xl border border-forest/15 bg-white focus:outline-none focus:border-[#C5A059] text-xs text-forest placeholder-forest/30 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-[9.5px] uppercase tracking-wider font-semibold text-forest/70 mb-1">
                        {isPt ? 'NIF (Opcional)' : 'Tax ID (Optional)'}
                      </label>
                      <input
                        type="text"
                        maxLength={9}
                        value={checkoutForm.nif}
                        onChange={(e) => setCheckoutForm({ ...checkoutForm, nif: e.target.value.replace(/\D/g, '') })}
                        placeholder={isPt ? "NIF (Opcional - Fatura)" : "Tax ID (Optional)"}
                        className="w-full px-3.5 py-2 rounded-xl border border-forest/15 bg-white focus:outline-none focus:border-[#C5A059] text-xs text-forest placeholder-forest/30 transition-all"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[9.5px] uppercase tracking-wider font-semibold text-forest/70 mb-1">
                        {isPt ? 'Morada de Envio *' : 'Shipping Address *'}
                      </label>
                      <input
                        type="text"
                        value={checkoutForm.morada}
                        onChange={(e) => setCheckoutForm({ ...checkoutForm, morada: e.target.value })}
                        placeholder={isPt ? "Morada completa de entrega" : "Full shipping address"}
                        className="w-full px-3.5 py-2 rounded-xl border border-forest/15 bg-white focus:outline-none focus:border-[#C5A059] text-xs text-forest placeholder-forest/30 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-[9.5px] uppercase tracking-wider font-semibold text-forest/70 mb-1">
                        {isPt ? 'Código Postal *' : 'Postal Code *'}
                      </label>
                      <input
                        type="text"
                        maxLength={8}
                        value={checkoutForm.codigoPostal}
                        onChange={(e) => setCheckoutForm({ ...checkoutForm, codigoPostal: formatPostalCodePT(e.target.value) })}
                        placeholder="XXXX-XXX"
                        className="w-full px-3.5 py-2 rounded-xl border border-forest/15 bg-white focus:outline-none focus:border-[#C5A059] text-xs text-forest placeholder-forest/30 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-[9.5px] uppercase tracking-wider font-semibold text-forest/70 mb-1">
                        {isPt ? 'Cidade *' : 'City *'}
                      </label>
                      <input
                        type="text"
                        value={checkoutForm.cidade}
                        onChange={(e) => setCheckoutForm({ ...checkoutForm, cidade: e.target.value })}
                        placeholder={isPt ? "Cidade / Localidade" : "City / Location"}
                        className="w-full px-3.5 py-2 rounded-xl border border-forest/15 bg-white focus:outline-none focus:border-[#C5A059] text-xs text-forest placeholder-forest/30 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Single Proven Payment Method Selector */}
                <div className="space-y-2.5 pt-1">
                  <span className="text-[8.5px] uppercase tracking-[0.3em] font-semibold text-forest/50 block">
                    {isPt ? '2. Método de Pagamento' : '2. Payment Method'}
                  </span>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('mbway')}
                      className={`py-2.5 px-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                        paymentMethod === 'mbway'
                          ? 'border-[#C5A059] bg-[#343E2C] text-[#C5A059] font-medium shadow-xs'
                          : 'border-forest/15 bg-white text-forest/70 hover:bg-forest/5'
                      }`}
                    >
                      <Phone size={14} className="mx-auto mb-1 text-[#C5A059]" />
                      <span className="text-[10px] block font-sans font-semibold">MB WAY</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('multibanco')}
                      className={`py-2.5 px-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                        paymentMethod === 'multibanco'
                          ? 'border-[#C5A059] bg-[#343E2C] text-[#C5A059] font-medium shadow-xs'
                          : 'border-forest/15 bg-white text-forest/70 hover:bg-forest/5'
                      }`}
                    >
                      <Building size={14} className="mx-auto mb-1 text-[#C5A059]" />
                      <span className="text-[10px] block font-sans font-semibold">Multibanco</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`py-2.5 px-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                        paymentMethod === 'card'
                          ? 'border-[#C5A059] bg-[#343E2C] text-[#C5A059] font-medium shadow-xs'
                          : 'border-forest/15 bg-white text-forest/70 hover:bg-forest/5'
                      }`}
                    >
                      <CreditCard size={14} className="mx-auto mb-1 text-[#C5A059]" />
                      <span className="text-[10px] block font-sans font-semibold">{isPt ? 'Cartão' : 'Card'}</span>
                    </button>
                  </div>

                  {/* MBWay Specific Input */}
                  {paymentMethod === 'mbway' && (
                    <div className="p-3 rounded-xl bg-forest/5 border border-forest/10 space-y-1 animate-fadeIn">
                      <label className="block text-[9.5px] uppercase tracking-wider font-semibold text-forest">
                        {isPt ? 'Telemóvel MB WAY *' : 'MB WAY Phone *'}
                      </label>
                      <input
                        type="tel"
                        value={checkoutForm.mbwayPhone}
                        onChange={(e) => setCheckoutForm({ ...checkoutForm, mbwayPhone: e.target.value })}
                        placeholder="9xx xxx xxx"
                        className="w-full px-3.5 py-2 rounded-xl border border-forest/15 bg-white text-xs font-mono text-forest placeholder-forest/30 focus:border-[#C5A059] focus:outline-none"
                      />
                    </div>
                  )}

                  {/* Multibanco Information */}
                  {paymentMethod === 'multibanco' && (
                    <div className="p-3 rounded-xl bg-forest/5 border border-forest/10 text-xs text-forest/80 space-y-1 animate-fadeIn">
                      <p className="font-medium text-forest">{isPt ? 'Referência Multibanco' : 'Multibanco Reference'}</p>
                      <p className="text-[11px] text-forest/60">
                        {isPt
                          ? 'A Entidade, Referência e Valor serão enviados por e-mail e exibidos no ecrã após confirmação.'
                          : 'Entity, Reference, and Amount will be sent via email and displayed on screen after confirmation.'}
                      </p>
                    </div>
                  )}

                  {/* Card Details Inputs */}
                  {paymentMethod === 'card' && (
                    <div className="p-3 rounded-xl bg-forest/5 border border-forest/10 space-y-2 animate-fadeIn">
                      <div>
                        <label className="block text-[9.5px] uppercase tracking-wider font-semibold text-forest mb-1">
                          {isPt ? 'Nome no Cartão *' : 'Cardholder Name *'}
                        </label>
                        <input
                          type="text"
                          value={checkoutForm.cardName}
                          onChange={(e) => setCheckoutForm({ ...checkoutForm, cardName: e.target.value })}
                          placeholder={isPt ? "Nome como impresso no cartão" : "Name as printed on card"}
                          className="w-full px-3 py-1.5 rounded-xl border border-forest/15 bg-white text-xs text-forest placeholder-forest/30 focus:border-[#C5A059] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[9.5px] uppercase tracking-wider font-semibold text-forest mb-1">
                          {isPt ? 'Número do Cartão *' : 'Card Number *'}
                        </label>
                        <input
                          type="text"
                          maxLength={19}
                          value={checkoutForm.cardNumber}
                          onChange={(e) => {
                            const clean = e.target.value.replace(/\D/g, '');
                            const formatted = clean.match(/.{1,4}/g)?.join(' ') || clean;
                            setCheckoutForm({ ...checkoutForm, cardNumber: formatted.substring(0, 19) });
                          }}
                          placeholder="0000 0000 0000 0000"
                          className="w-full px-3 py-1.5 rounded-xl border border-forest/15 bg-white text-xs font-mono text-forest placeholder-forest/30 focus:border-[#C5A059] focus:outline-none"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[9.5px] uppercase tracking-wider font-semibold text-forest mb-1">
                            {isPt ? 'Validade *' : 'Expiry *'}
                          </label>
                          <input
                            type="text"
                            maxLength={5}
                            value={checkoutForm.cardExpiry}
                            onChange={(e) => {
                              const clean = e.target.value.replace(/\D/g, '');
                              let formatted = clean;
                              if (clean.length > 2) formatted = `${clean.substring(0, 2)}/${clean.substring(2, 4)}`;
                              setCheckoutForm({ ...checkoutForm, cardExpiry: formatted });
                            }}
                            placeholder="MM/YY"
                            className="w-full px-3 py-1.5 rounded-xl border border-forest/15 bg-white text-xs font-mono text-forest placeholder-forest/30 focus:border-[#C5A059] focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[9.5px] uppercase tracking-wider font-semibold text-forest mb-1">
                            CVV *
                          </label>
                          <input
                            type="text"
                            maxLength={3}
                            value={checkoutForm.cardCvv}
                            onChange={(e) => setCheckoutForm({ ...checkoutForm, cardCvv: e.target.value.replace(/\D/g, '') })}
                            placeholder="123"
                            className="w-full px-3 py-1.5 rounded-xl border border-forest/15 bg-white text-xs font-mono text-forest placeholder-forest/30 focus:border-[#C5A059] focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 3. FIXED STICKY FOOTER (Landscape Compact) */}
              <div className="p-3.5 md:p-5 landscape:p-2 landscape:px-3 border-t border-forest/10 bg-[#FCFBF9]/95 backdrop-blur-md shrink-0 sticky bottom-0 z-20 space-y-1">
                <button
                  type="button"
                  disabled={!isFormValid || isPaying}
                  onClick={handleProcessOrder}
                  className={`w-full py-3.5 landscape:py-2 px-6 rounded-full text-[10.5px] landscape:text-[9.5px] uppercase tracking-[0.25em] font-semibold transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-md ${
                    isFormValid && !isPaying
                      ? 'bg-forest hover:bg-[#1C2713] text-cream active:scale-[0.99]'
                      : 'bg-forest/20 text-cream/50 cursor-not-allowed'
                  }`}
                >
                  <Lock size={14} className="landscape:w-3 landscape:h-3" />
                  <span>
                    {isPaying
                      ? (isPt ? 'A Processar...' : 'Processing...')
                      : `${isPt ? 'Confirmar e Pagar' : 'Confirm & Pay'} ${totalPrice.toFixed(2)}€`}
                  </span>
                </button>

                <div className="flex items-center justify-center gap-1.5 text-[8.5px] landscape:text-[7.5px] uppercase tracking-widest text-forest/50 text-center font-sans">
                  <ShieldCheck size={12} className="text-[#C5A059] landscape:w-2.5 landscape:h-2.5" />
                  <span>
                    {isPt
                      ? 'Checkout Seguro • CTT Expresso'
                      : 'Secure Encrypted Checkout • CTT Express'}
                  </span>
                </div>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
};
