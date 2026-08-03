import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { loadStripe, Stripe, PaymentRequest } from '@stripe/stripe-js';
import { 
  X, Plus, Minus, Trash2, ArrowRight, ArrowLeft, MapPin, Sparkles, 
  ShieldCheck, CheckCircle2, Lock, CreditCard, Phone, Building, AlertTriangle,
  ChevronDown, ChevronUp, ChevronRight
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { SHIPPING_ZONES } from '../types';
import { useLanguage, formatColorName, translateColor } from '../translations';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// Official Apple Pay Brand Mark Vector SVG - Refined viewBox & height to prevent top clipping
const ApplePayIcon: React.FC<{ className?: string }> = ({ className = "h-5 w-auto" }) => (
  <svg
    viewBox="0 -8 220 92"
    className={className}
    aria-label="Apple Pay"
    preserveAspectRatio="xMidYMid meet"
  >
    <path
      fill="currentColor"
      d="M33.72,37.28c0-7.83,6.38-11.83,6.67-12-3.64-5.32-9.31-6.06-11.33-6.14-4.83-.49-9.45,2.85-11.9,2.85-2.46,0-6.27-2.78-10.28-2.71-5.26,.08-10.11,3.06-12.82,7.78-5.48,9.51-1.4,23.59,3.94,31.31,2.61,3.77,5.72,7.99,9.79,7.84,3.92-.16,5.41-2.53,10.14-2.53s6.07,2.53,10.15,2.45c4.15-.08,6.79-3.77,9.33-7.53,2.94-4.29,4.15-8.45,4.22-8.66-.09-.04-8.1-3.11-8.1-12.35M27.27,13.79c2.18-2.64,3.64-6.31,3.24-9.98-3.14,.13-6.95,2.09-9.2,4.73-2.02,2.33-3.79,6.07-3.31,9.66,3.5,.27,7.1-1.78,9.27-4.41"
    />
    <text
      x="52"
      y="58"
      fontFamily="-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif"
      fontSize="48"
      fontWeight="500"
      fill="currentColor"
    >
      Pay
    </text>
  </svg>
);

// Official Google Pay Brand Vector SVG
const GooglePayIcon: React.FC<{ className?: string }> = ({ className = "h-5 w-auto" }) => (
  <svg
    viewBox="0 0 74 30"
    className={className}
    aria-label="Google Pay"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="xMidYMid meet"
  >
    <path d="M12.92 12.38v3.25h8.04c-.33 2.08-2.38 6.08-8.04 6.08-4.88 0-8.86-4.04-8.86-9.02s3.98-9.02 8.86-9.02c2.78 0 4.64 1.18 5.7 2.2l2.58-2.48C19.55 1.83 16.54.5 12.92.5 5.95.5.3 6.15.3 13.12s5.65 12.62 12.62 12.62c7.28 0 12.12-5.12 12.12-12.33 0-.83-.09-1.46-.2-2.03H12.92z" fill="#FFFFFF"/>
    <path d="M38.8 1.5h-5.8v23.2h3.8v-8.8h2c4.1 0 7.8-2.9 7.8-7.2 0-4.3-3.7-7.2-7.8-7.2zm.1 11.2h-2.1V4.7h2.1c2.4 0 4 1.7 4 4 0 2.2-1.6 4-4 4zM53.1 8.8c-2.8 0-5.3 1.2-6.5 3.7l3.3 1.4c.7-1.3 2-2.1 3.3-2.1 1.9 0 3.8 1.1 3.8 3.1v.2a7.6 7.6 0 00-3.6-.9c-3.3 0-6.6 1.8-6.6 5.2 0 3.1 2.7 5.1 5.8 5.1 2.3 0 4.2-1.1 5.1-2.5h.1v2h3.6V14.3c0-3.8-2.8-5.5-8.3-5.5zm-.4 12.7c-1.2 0-2.8-.6-2.8-2 0-1.7 1.9-2.3 3.5-2.3 1 0 2.2.2 3.1.7-.3 2.1-2 3.6-3.8 3.6zM73.4 9h-4.3l-5.6 14.1h.1L57.8 9h-4.1l8 18.2-3.9 8.7h3.9L73.4 9z" fill="#FFFFFF"/>
  </svg>
);

export const AtelierCartDrawer: React.FC = () => {
  const { lang } = useLanguage();
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    isCheckoutOpen,
    setIsCheckoutOpen,
    removeFromCart,
    updateQuantity,
    selectedShippingZone,
    setSelectedShippingZone,
    subtotal,
    shippingFee,
    totalPrice,
    totalItemCount,
    maxLeadTimeDays,
    isFreeShipping,
    amountNeededForFreeShipping,
    clearCart
  } = useCart();

  const isPt = lang === 'pt';
  const isOpen = isCartOpen || isCheckoutOpen;

  // Active step in unified flow: 'cart' | 'checkout'
  const [step, setStep] = useState<'cart' | 'checkout'>('cart');
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(true);

  // Form & Payment State
  const [paymentMethod, setPaymentMethod] = useState<'mbway' | 'card' | 'multibanco' | 'wallet'>('mbway');
  const [isPaying, setIsPaying] = useState(false);
  const [activeExpressWallet, setActiveExpressWallet] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [completedOrder, setCompletedOrder] = useState<any>(null);

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

  // Stripe & Wallet Refs for Native Payment Sheet
  const stripeRef = useRef<Stripe | null>(null);
  const paymentRequestRef = useRef<PaymentRequest | null>(null);
  const walletTypeRef = useRef<'Apple Pay' | 'Google Pay'>('Apple Pay');

  // Strict Ecosystem Detection: Apple Ecosystem -> ONLY Apple Pay | Android/Chrome/Windows -> ONLY Google Pay
  const [detectedEcosystem, setDetectedEcosystem] = useState<'apple' | 'google'>('google');

  // Sync step based on triggers
  useEffect(() => {
    if (isCheckoutOpen) {
      setStep('checkout');
    } else if (isCartOpen) {
      setStep('cart');
    }
  }, [isCheckoutOpen, isCartOpen]);

  // Ecosystem detection (Apple vs Google strictly)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const ua = window.navigator.userAgent.toLowerCase();
      const isAppleDevice = /iphone|ipad|ipod|macintosh/.test(ua) || (typeof (window as any).ApplePaySession !== 'undefined' && (window as any).ApplePaySession.canMakePayments());
      
      if (isAppleDevice) {
        setDetectedEcosystem('apple');
      } else {
        setDetectedEcosystem('google');
      }
    }
  }, []);

  // Initialize and maintain Stripe Payment Request for Native Sheet (Apple/Google Pay)
  useEffect(() => {
    let isMounted = true;
    const stripePubKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';
    if (!stripePubKey || !isOpen) return;

    loadStripe(stripePubKey).then((stripe) => {
      if (!stripe || !isMounted) return;
      stripeRef.current = stripe;

      const totalInCents = Math.round((totalPrice + shippingFee) * 100);
      if (totalInCents <= 0) return;

      const dynamicShippingLabel = lang === 'en'
        ? (selectedShippingZone?.id === 'pt-islands' ? 'Portugal (Islands)' : selectedShippingZone?.id === 'eu' ? 'European Union' : 'Portugal (Mainland & Islands)')
        : (selectedShippingZone?.name || 'Portugal (Continental e Ilhas)');

      const dynamicShippingDetail = lang === 'en'
        ? 'Handcrafted Production + CTT Express (1 to 3 business days)'
        : 'Produção Artesanal + Envio CTT (1 a 3 dias úteis)';

      const pr = stripe.paymentRequest({
        country: 'PT',
        currency: 'eur',
        total: {
          label: 'M★BRAVO Atelier',
          amount: totalInCents,
        },
        requestPayerName: true,
        requestPayerEmail: true,
        requestPayerPhone: true,
        requestShipping: true, // Native sheet autofills shipping address from Apple Wallet / Google Pay
        shippingOptions: [
          {
            id: selectedShippingZone?.id || 'pt-mainland',
            label: dynamicShippingLabel,
            detail: dynamicShippingDetail,
            amount: Math.round((shippingFee || 0) * 100)
          }
        ]
      });

      pr.canMakePayment().then((result) => {
        if (result && isMounted) {
          paymentRequestRef.current = pr;
        }
      });

      pr.on('shippingaddresschange', (ev) => {
        ev.updateWith({
          status: 'success',
          shippingOptions: [
            {
              id: selectedShippingZone?.id || 'pt-mainland',
              label: dynamicShippingLabel,
              detail: dynamicShippingDetail,
              amount: Math.round((shippingFee || 0) * 100)
            }
          ]
        });
      });

      pr.on('paymentmethod', async (ev) => {
        console.log('[STRIPE WALLET NATIVE AUTHORIZED]', ev);
        
        const shipping = ev.shippingAddress || {};
        const payerName = ev.payerName || shipping.recipient || checkoutForm.nome || 'Cliente Carteira Digital';
        const payerEmail = ev.payerEmail || checkoutForm.email || 'encomendas@mbravobycarolina.com';
        const payerPhone = ev.payerPhone || checkoutForm.telefone || '';

        const addressLines = Array.isArray(shipping.addressLine)
          ? shipping.addressLine.filter(Boolean).join(', ')
          : (shipping.addressLine || checkoutForm.morada || 'Morada Registada na Carteira Digital');

        const expressCustomer = {
          nome: payerName,
          email: payerEmail,
          telefone: payerPhone,
          morada: addressLines,
          codigoPostal: shipping.postalCode || checkoutForm.codigoPostal || '1000-001',
          cidade: shipping.city || checkoutForm.cidade || 'Lisboa',
          pais: shipping.country || 'PT',
          nif: checkoutForm.nif || '',
          mbwayPhone: '',
          cardNumber: '',
          cardName: '',
          cardExpiry: '',
          cardCvv: ''
        };

        setIsPaying(true);
        setErrorMessage('');

        try {
          const response = await fetch(`${API_BASE_URL}/api/payment/create-intent`, {
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
              amountInCents: totalInCents,
              checkoutForm: expressCustomer,
              paymentMethod: 'wallet',
              walletType: walletTypeRef.current
            })
          });

          const data = await response.json();
          if (!response.ok || data.error) {
            ev.complete('fail');
            throw new Error(data.error || (isPt ? 'Erro ao processar intenção de pagamento no Stripe.' : 'Error creating payment intent in Stripe.'));
          }

          if (data.stripeClientSecret && stripeRef.current) {
            const { paymentIntent, error: confirmError } = await stripeRef.current.confirmCardPayment(
              data.stripeClientSecret,
              { payment_method: ev.paymentMethod.id },
              { handleActions: false }
            );

            if (confirmError) {
              ev.complete('fail');
              throw new Error(confirmError.message || (isPt ? 'Recusado pela entidade bancária.' : 'Bank declined transaction.'));
            }

            if (paymentIntent && paymentIntent.status === 'succeeded') {
              ev.complete('success'); // Native green checkmark animation!

              // Trigger webhook & email confirmations
              await fetch(`${API_BASE_URL}/api/payment/webhook`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  orderId: data.orderId,
                  event: 'payment_intent.succeeded'
                })
              });

              setCompletedOrder(data.order || {
                orderId: data.orderId,
                total: totalPrice + shippingFee,
                customer: expressCustomer,
                shippingZone: selectedShippingZone,
                paymentMethod: `wallet (${walletTypeRef.current})`
              });
              clearCart();
              setStep('checkout');
            } else {
              ev.complete('fail');
              throw new Error(isPt ? 'A transação não pôde ser completada.' : 'Transaction could not be completed.');
            }
          } else {
            // Simulated/test fallback
            ev.complete('success');
            setCompletedOrder(data.order || {
              orderId: data.orderId || `MB-${Math.floor(100000 + Math.random() * 900000)}`,
              total: totalPrice + shippingFee,
              customer: expressCustomer,
              shippingZone: selectedShippingZone,
              paymentMethod: `wallet (${walletTypeRef.current})`
            });
            clearCart();
            setStep('checkout');
          }
        } catch (err: any) {
          console.error('[STRIPE WALLET PROCESS ERROR]', err);
          setErrorMessage(err.message || (isPt ? 'Erro ao autorizar pagamento por carteira digital.' : 'Digital wallet authorization error.'));
        } finally {
          setIsPaying(false);
          setActiveExpressWallet(null);
        }
      });
    });

    return () => {
      isMounted = false;
    };
  }, [totalPrice, shippingFee, selectedShippingZone, cart, isOpen]);

  if (!isOpen || typeof window === 'undefined') return null;

  const handleClose = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(false);
    setCompletedOrder(null);
    setErrorMessage('');
  };

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  };

  const suggestCorrectEmail = (email: string) => {
    if (!email || !email.includes('@')) return null;
    const parts = email.split('@');
    if (parts.length !== 2) return null;
    const user = parts[0];
    const domain = parts[1].toLowerCase();

    const commonTypos: Record<string, string> = {
      'gmai.com': 'gmail.com',
      'gmial.com': 'gmail.com',
      'gmaill.com': 'gmail.com',
      'hotmail.co': 'hotmail.com',
      'hotmial.com': 'hotmail.com',
      'outlok.com': 'outlook.com',
      'sapo.p': 'sapo.pt',
      'sapo.c': 'sapo.pt'
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
    (paymentMethod !== 'mbway' || checkoutForm.mbwayPhone.replace(/\D/g, '').length >= 9 || checkoutForm.telefone.replace(/\D/g, '').length >= 9) &&
    (paymentMethod !== 'card' || (checkoutForm.cardNumber.replace(/\D/g, '').length >= 15 && checkoutForm.cardExpiry && checkoutForm.cardCvv));

  // Express Checkout Payment Handler - Invokes Native OS Payment Sheet (Apple Pay / Google Pay)
  const handleExpressWalletPay = async (e: React.MouseEvent, walletType: 'Apple Pay' | 'Google Pay') => {
    e.preventDefault();
    e.stopPropagation();

    if (isPaying) return;
    const targetWalletKey = walletType === 'Apple Pay' ? 'applepay' : 'googlepay';
    walletTypeRef.current = walletType;
    setActiveExpressWallet(targetWalletKey);
    setErrorMessage('');
    setPaymentMethod('wallet');

    // 1. If Stripe Payment Request instance is already ready, show native sheet directly
    if (paymentRequestRef.current) {
      try {
        setIsPaying(true);
        paymentRequestRef.current.show();
        return;
      } catch (showErr: any) {
        console.warn('[STRIPE WALLET SHOW ERROR]', showErr);
      }
    }

    // 2. Dynamic initialization fallback if not cached yet
    const stripePubKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';
    if (!stripePubKey) {
      setActiveExpressWallet(null);
      setErrorMessage(
        isPt 
          ? 'Chave pública da Stripe não configurada.' 
          : 'Stripe public key not configured.'
      );
      return;
    }

    try {
      setIsPaying(true);
      const stripe = stripeRef.current || (await loadStripe(stripePubKey));
      if (!stripe) throw new Error('Stripe JS failed to initialize');
      stripeRef.current = stripe;

      const totalInCents = Math.round((totalPrice + shippingFee) * 100);
      const getZoneNameString = (zone: any, isEnglish: boolean) => {
  if (!zone) return isEnglish ? 'Portugal (Mainland & Islands)' : 'Portugal (Continental e Ilhas)';
  const rawName = zone.name || zone.label;
  if (typeof rawName === 'object' && rawName !== null) {
    return isEnglish ? (rawName.en || rawName.pt || '') : (rawName.pt || rawName.en || '');
  }
  return String(rawName || (isEnglish ? 'Portugal (Mainland & Islands)' : 'Portugal (Continental e Ilhas)'));
};

const dynamicShippingLabel = getZoneNameString(selectedShippingZone, (typeof lang === 'object' ? (lang as any)?.code : lang) === 'en');

      const dynamicShippingDetail = lang === 'en'
        ? 'Handcrafted Production + CTT Express (1 to 3 business days)'
        : 'Produção Artesanal + Envio CTT (1 a 3 dias úteis)';

      const pr = stripe.paymentRequest({
        country: 'PT',
        currency: 'eur',
        total: {
          label: 'M★BRAVO Atelier',
          amount: totalInCents,
        },
        requestPayerName: true,
        requestPayerEmail: true,
        requestPayerPhone: true,
        requestShipping: true,
        shippingOptions: [
          {
            id: selectedShippingZone?.id || 'pt-mainland',
            label: dynamicShippingLabel,
            detail: dynamicShippingDetail,
            amount: Math.round((shippingFee || 0) * 100)
          }
        ]
      });

      const canPay = await pr.canMakePayment();
      if (canPay) {
        paymentRequestRef.current = pr;

        pr.on('shippingaddresschange', (ev) => {
          ev.updateWith({
            status: 'success',
            shippingOptions: [
              {
                id: selectedShippingZone?.id || 'pt-mainland',
                label: dynamicShippingLabel,
                detail: dynamicShippingDetail,
                amount: Math.round((shippingFee || 0) * 100)
              }
            ]
          });
        });

        pr.on('paymentmethod', async (ev) => {
          console.log('[STRIPE WALLET DYNAMIC AUTHORIZED]', ev);
          const shipping = ev.shippingAddress || {};
          const payerName = ev.payerName || shipping.recipient || checkoutForm.nome || 'Cliente Carteira Digital';
          const payerEmail = ev.payerEmail || checkoutForm.email || 'encomendas@mbravobycarolina.com';
          const payerPhone = ev.payerPhone || checkoutForm.telefone || '';

          const addressLines = Array.isArray(shipping.addressLine)
            ? shipping.addressLine.filter(Boolean).join(', ')
            : (shipping.addressLine || checkoutForm.morada || 'Morada Registada na Carteira Digital');

          const expressCustomer = {
            nome: payerName,
            email: payerEmail,
            telefone: payerPhone,
            morada: addressLines,
            codigoPostal: shipping.postalCode || checkoutForm.codigoPostal || '1000-001',
            cidade: shipping.city || checkoutForm.cidade || 'Lisboa',
            pais: shipping.country || 'PT',
            nif: checkoutForm.nif || '',
            mbwayPhone: '',
            cardNumber: '',
            cardName: '',
            cardExpiry: '',
            cardCvv: ''
          };

          try {
            const response = await fetch(`${API_BASE_URL}/api/payment/create-intent`, {
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
                amountInCents: totalInCents,
                checkoutForm: expressCustomer,
                paymentMethod: 'wallet',
                walletType: walletTypeRef.current
              })
            });

            const data = await response.json();
            if (!response.ok || data.error) {
              ev.complete('fail');
              throw new Error(data.error || 'Erro ao criar intenção de pagamento no Stripe.');
            }

            if (data.stripeClientSecret && stripeRef.current) {
              const { paymentIntent, error: confirmError } = await stripeRef.current.confirmCardPayment(
                data.stripeClientSecret,
                { payment_method: ev.paymentMethod.id },
                { handleActions: false }
              );

              if (confirmError) {
                ev.complete('fail');
                throw new Error(confirmError.message || 'Falha na confirmação do pagamento com o cartão.');
              }

              if (paymentIntent && paymentIntent.status === 'succeeded') {
                ev.complete('success');

                await fetch(`${API_BASE_URL}/api/payment/webhook`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    orderId: data.orderId,
                    event: 'payment_intent.succeeded'
                  })
                });

                setCompletedOrder(data.order || {
                  orderId: data.orderId,
                  total: totalPrice + shippingFee,
                  customer: expressCustomer,
                  shippingZone: selectedShippingZone,
                  paymentMethod: `wallet (${walletTypeRef.current})`
                });
                clearCart();
                setStep('checkout');
              } else {
                ev.complete('fail');
                throw new Error('O pagamento por carteira digital não pôde ser completado.');
              }
            } else {
              ev.complete('success');
              setCompletedOrder(data.order || {
                orderId: data.orderId || `MB-${Math.floor(100000 + Math.random() * 900000)}`,
                total: totalPrice + shippingFee,
                customer: expressCustomer,
                shippingZone: selectedShippingZone,
                paymentMethod: `wallet (${walletTypeRef.current})`
              });
              clearCart();
              setStep('checkout');
            }
          } catch (err: any) {
            ev.complete('fail');
            setErrorMessage(err.message || 'Erro durante a confirmação de pagamento.');
          } finally {
            setIsPaying(false);
            setActiveExpressWallet(null);
          }
        });

        pr.show();
      } else {
        setIsPaying(false);
        setActiveExpressWallet(null);
        setErrorMessage(
          isPt 
            ? 'O Apple Pay / Google Pay exige um dispositivo compatível e o domínio verificado na Stripe. Por favor, avance para o preenchimento de morada ou selecione MB Way / Cartão.' 
            : 'Apple Pay / Google Pay requires a compatible device and verified domain in Stripe.'
        );
      }
    } catch (err: any) {
      setIsPaying(false);
      setActiveExpressWallet(null);
      setErrorMessage(err.message || (isPt ? 'Erro ao iniciar Apple Pay / Google Pay.' : 'Error starting Apple Pay / Google Pay.'));
    }
  };

  // Standard Order Processing Handler
  const handleProcessOrder = async () => {
    if (!isFormValid || isPaying) return;
    setIsPaying(true);
    setErrorMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/payment/create-intent`, {
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
          amountInCents: Math.round(Math.max(0, parseFloat(String(totalPrice || 0).replace(',', '.').replace(/[^0-9.]/g, '')) || 0) * 100),
          checkoutForm,
          paymentMethod,
          mode: 'test'
        })
      });

      const resText = await response.text();
      let data: any = {};
      try {
        data = resText ? JSON.parse(resText) : {};
      } catch (parseErr) {
        console.error('[PAYMENT API PARSE ERROR]', resText);
        throw new Error(isPt ? 'Erro de formato na resposta do servidor de pagamentos.' : 'Invalid response format from payment gateway.');
      }

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
      setErrorMessage(err.message || (isPt ? 'Falha no processamento do pagamento. Tente novamente.' : 'Payment processing failed. Please try again.'));
    } finally {
      setIsPaying(false);
    }
  };

  // Shared Order Items List Component for Left Column & Step 1
  const renderCartItemsList = () => (
    <div className="divide-y divide-forest/10">
      {cart.map((item) => {
        const colorDisplay = item.selections?.cor ? formatColorName(item.selections.cor) : '';
        return (
          <div key={item.cartItemId} className="py-3 flex gap-3.5 items-start">
            <img
              src={item.img}
              alt={item.productName}
              className="w-16 h-20 object-cover rounded-lg border border-forest/10 shrink-0 bg-[#F6F1E5]"
            />

            <div className="flex-1 flex flex-col justify-between min-h-[80px] py-0.5">
              <div>
                <div className="flex justify-between items-start gap-2">
                  <h4 className="text-xs font-serif font-medium text-forest leading-snug">
                    {item.productName}
                  </h4>
                  <button
                    onClick={() => removeFromCart(item.cartItemId)}
                    className="text-forest/30 hover:text-red-700 p-0.5 transition-colors cursor-pointer"
                    title={isPt ? 'Remover' : 'Remove'}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 mt-1">
                  {colorDisplay && (
                    <span className="text-[10px] font-sans font-medium text-forest/70">
                      {isPt ? 'Cor' : 'Color'}: {translateColor(colorDisplay, lang)}
                    </span>
                  )}
                  {item.selections?.tamanho && (
                    <span className="text-[10px] font-sans font-medium text-forest/60">
                      • {isPt ? 'Tam' : 'Size'}: {item.selections.tamanho}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-1.5">
                <div className="flex items-center gap-1.5 border border-forest/15 rounded-full px-2 py-0.5 bg-white">
                  <button
                    onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                    className="text-forest/50 hover:text-forest p-0.5 transition-colors cursor-pointer"
                  >
                    <Minus size={10} />
                  </button>
                  <span className="text-[11px] font-sans font-medium text-forest min-w-[14px] text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                    className="text-forest/50 hover:text-forest p-0.5 transition-colors cursor-pointer"
                  >
                    <Plus size={10} />
                  </button>
                </div>

                <span className="text-xs font-serif font-semibold text-forest">
                  {(item.unitPrice * item.quantity).toFixed(2)}€
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[9990] flex items-end md:items-center md:justify-center p-0 md:p-4 lg:p-6 landscape:p-2 landscape:md:p-4 overflow-hidden">
        {/* Soft Translucent Editorial Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={handleClose}
          className="fixed inset-0 bg-forest/35 backdrop-blur-[3px] cursor-pointer"
        />

        {/* Dynamic Drawer / Proportional Tablet-Desktop Modal Panel */}
        <motion.div
          data-lenis-prevent
          initial={{ y: '100%', opacity: 0.5 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 32, stiffness: 350 }}
          className={`relative w-full bg-[#FCFBF9] text-forest shadow-2xl flex flex-col z-10 border-t md:border border-forest/10 transition-all duration-300 ease-in-out ${
            // Mobile: Step 1 opens as compact bottom sheet (~58vh), Step 2 opens as full sheet (94dvh)
            // Tablet & Desktop (md: 768px+): Compact floating centered modal with balanced proportions
            step === 'cart'
              ? 'h-[58vh] max-h-[60vh] md:h-auto md:max-h-[640px] landscape:h-[88dvh] landscape:max-h-[88dvh]'
              : 'h-[94dvh] max-h-[94dvh] md:h-auto md:max-h-[700px] lg:max-h-[740px] landscape:h-[92dvh] landscape:max-h-[92dvh] landscape:md:max-h-[88vh]'
          } md:w-[740px] lg:w-[860px] xl:w-[900px] md:max-w-[90vw] rounded-t-3xl md:rounded-3xl`}
        >
          {/* Mobile M★BRAVO Star Bidirectional Drag Badge (Half outside / Half inside top boundary) */}
          <div 
            onClick={() => setStep(step === 'cart' ? 'checkout' : 'cart')}
            className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-50 md:hidden cursor-pointer group flex items-center justify-center select-none"
            title={step === 'cart' ? (isPt ? 'Clique para expandir' : 'Click to expand') : (isPt ? 'Clique para recolher ao carrinho' : 'Click to collapse to cart')}
          >
            <div className="w-8 h-8 flex items-center justify-center bg-[#FCFBF9] border border-[#C5A059]/50 rounded-full shadow-lg hover:border-[#C5A059] transition-all transform active:scale-95">
              <span className="text-[#C5A059] text-base font-serif leading-none select-none animate-bounce drop-shadow-[0_0_8px_rgba(197,160,89,0.7)]">
                ☆
              </span>
            </div>
          </div>

          {/* Inner Overflow Clipping Container */}
          <div className="w-full h-full flex flex-col overflow-hidden rounded-t-3xl md:rounded-3xl">
            {/* 1. FIXED UNIFIED HEADER (MINIMALIST BRAND DESIGN) */}
            <div className="px-5 py-3.5 border-b border-forest/10 flex items-center justify-between shrink-0 bg-[#FCFBF9] sticky top-0 z-30">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#C5A059]" />

              <div>
                <span className="text-[8.5px] uppercase tracking-[0.35em] text-[#C5A059] font-semibold block font-sans">
                  M★BRAVO
                </span>
                <h3 className="text-base font-serif font-light text-forest tracking-tight flex items-center gap-2">
                  {completedOrder ? (
                    isPt ? 'Encomenda Confirmada' : 'Order Confirmed'
                  ) : step === 'checkout' ? (
                    isPt ? 'Finalizar Encomenda' : 'Checkout Order'
                  ) : (
                    <>
                      {isPt ? 'A sua Encomenda' : 'Your Order'}
                      {totalItemCount > 0 && (
                        <span className="text-[10px] font-sans font-normal text-forest/50">
                          ({totalItemCount} {totalItemCount === 1 ? (isPt ? 'peça' : 'piece') : (isPt ? 'peças' : 'pieces')})
                        </span>
                      )}
                    </>
                  )}
                </h3>
              </div>
            </div>

            {/* Step Badge or Close Button */}
            <div className="flex items-center gap-3">
              {!completedOrder && cart.length > 0 && (
                <span className="text-[9px] uppercase tracking-widest font-mono text-forest/50 bg-forest/5 px-2.5 py-1 rounded-full border border-forest/10">
                  {step === 'cart' ? (isPt ? 'Passo 1/2' : 'Step 1/2') : (isPt ? 'Passo 2/2' : 'Step 2/2')}
                </span>
              )}

              <button
                onClick={handleClose}
                className="p-2 rounded-full hover:bg-forest/5 text-forest/50 hover:text-forest transition-colors cursor-pointer shrink-0"
                title={isPt ? 'Fechar' : 'Close'}
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* 2. COMPLETED ORDER SCREEN (THANK YOU) */}
          {completedOrder ? (
            <div className="p-6 md:p-10 flex-1 min-h-0 overflow-y-auto text-center flex flex-col justify-center items-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-forest/5 text-[#C5A059] flex items-center justify-center mx-auto border border-forest/10">
                <CheckCircle2 size={32} />
              </div>

              <div className="space-y-2 max-w-md mx-auto">
                <span className="text-[9px] uppercase tracking-[0.35em] font-semibold text-[#A68244] block font-sans">
                  {isPt ? 'ENCOMENDA REGISTADA NO ATELIER' : 'ORDER REGISTERED IN ATELIER'}
                </span>
                <h3 className="text-2xl font-serif text-forest font-light">
                  {isPt ? 'Agradecemos a sua preferência!' : 'Thank you for your order!'}
                </h3>
                <p className="text-xs font-mono text-forest/70 bg-forest/5 py-1 px-3 rounded-full inline-block border border-forest/10 mt-1">
                  Nº {completedOrder.orderId}
                </p>
              </div>

              <p className="text-xs md:text-sm text-forest/70 max-w-md mx-auto leading-relaxed font-sans font-light">
                {isPt
                  ? (maxLeadTimeDays === 0 
                      ? 'O seu pedido foi registado no atelier. Artigo disponível em Atelier com envio imediato CTT Expresso em 1 a 3 dias úteis.'
                      : `O seu pedido entrou em fila de produção manual no Atelier M★BRAVO (${maxLeadTimeDays} ${maxLeadTimeDays === 1 ? 'dia útil' : 'dias úteis'} de produção + 1 a 3 dias úteis de envio CTT Expresso).`)
                  : `Your order is registered in M★BRAVO Atelier (${maxLeadTimeDays} business days handcrafted production + 1 to 3 days express CTT shipping).`
                }
              </p>

              {/* Google Avaliações do Consumidor & Merchant Center Card */}
              <div className="bg-[#FCF8F2] rounded-2xl p-5 border border-[#C5A059]/30 w-full max-w-md mx-auto text-center space-y-2.5 shadow-xs">
                <div className="flex items-center justify-center gap-1.5 text-[#C5A059]">
                  <span className="text-[10px] uppercase font-sans font-bold tracking-widest text-[#A68244]">
                    Google Avaliações do Consumidor
                  </span>
                </div>
                <div className="flex justify-center gap-1 text-[#C5A059] text-sm">
                  <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                </div>
                <p className="text-xs text-forest/80 font-sans leading-relaxed">
                  {isPt
                    ? 'Ajude outros clientes a conhecer o nosso trabalho artesanal. Deixe a sua avaliação no perfil Google M★BRAVO!'
                    : 'Help other customers discover our handcrafted work. Leave your review on Google Merchant M★BRAVO!'}
                </p>
                <a
                  href="https://g.page/r/Cdo7JGP_Xpc3EBM/review"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-forest text-cream rounded-full text-[10px] tracking-widest uppercase font-bold hover:bg-[#1C2713] transition-all shadow-xs cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M12.545 10.239v3.821h5.445c-0.712 2.315-2.647 3.972-5.445 3.972-3.332 0-6.033-2.701-6.033-6.032s2.701-6.032 6.033-6.032c1.498 0 2.866 0.549 3.921 1.453l2.814-2.814c-1.79-1.677-4.184-2.702-6.735-2.702-5.522 0-10 4.478-10 10s4.478 10 10 10c8.396 0 10.249-7.85 9.426-11.748l-9.426 0.082z"/>
                  </svg>
                  <span>{isPt ? 'Avaliar no Google' : 'Review on Google'}</span>
                </a>
              </div>

              <div className="pt-2 border-t border-forest/10 w-full max-w-xs mx-auto">
                <button
                  onClick={handleClose}
                  className="w-full py-3 bg-forest text-cream hover:bg-[#1C2713] rounded-full text-[10px] uppercase tracking-[0.25em] font-medium transition-colors shadow-xs cursor-pointer"
                >
                  {isPt ? 'Voltar ao Atelier' : 'Back to Atelier'}
                </button>
              </div>
            </div>
          ) : cart.length === 0 ? (
            /* EMPTY CART STATE */
            <div className="py-20 text-center space-y-4 flex flex-col items-center justify-center flex-1">
              <span className="text-[9px] uppercase tracking-[0.35em] text-[#C5A059] font-medium block font-sans">
                {isPt ? 'O SEU CARRINHO ESTÁ VAZIO' : 'YOUR CART IS EMPTY'}
              </span>
              <p className="text-xs font-serif font-light text-forest/70 max-w-xs leading-relaxed">
                {isPt
                  ? 'Ainda não adicionou nenhuma peça artesanal ao seu carrinho.'
                  : 'You have not added any handcrafted piece to your cart yet.'}
              </p>
              <button
                onClick={handleClose}
                className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 bg-forest text-cream rounded-full text-[9px] uppercase tracking-[0.25em] font-medium hover:bg-[#1C2713] transition-colors shadow-xs cursor-pointer"
              >
                <span>{isPt ? 'Voltar à Coleção' : 'Explore Collection'}</span>
                <ArrowRight size={12} />
              </button>
            </div>
          ) : (
            /* 3. DUAL LAYOUT: MOBILE BOTTOM SHEET vs TABLET/DESKTOP 2-COLUMN MODAL */
            <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
              
              {/* --- TABLET & DESKTOP 2-COLUMN PROPORTIONAL LAYOUT (md:flex md:flex-row) --- */}
              <div className="hidden md:flex md:flex-row flex-1 min-h-0 overflow-hidden divide-x divide-forest/10">
                {/* LEFT COLUMN: Order Summary & Item List (5/12) */}
                <div className="w-[42%] bg-[#F8F6F0] p-6 flex flex-col h-full overflow-y-auto space-y-4 shrink-0">
                  <div className="flex items-center justify-between pb-2 border-b border-forest/10">
                    <span className="text-[9px] uppercase tracking-[0.25em] font-bold text-[#A68244] block">
                      {isPt ? 'Resumo do Pedido' : 'Order Summary'}
                    </span>
                    <span className="text-[10px] text-forest/60 font-sans">
                      {totalItemCount} {totalItemCount === 1 ? (isPt ? 'peça' : 'piece') : (isPt ? 'peças' : 'pieces')}
                    </span>
                  </div>

                  {/* Deep Green Luxury Courtesy Shipping Upsell Banner */}
                  <div className="p-3.5 rounded-2xl bg-forest border border-[#C5A059]/60 shadow-md space-y-2.5">
                    <div className="flex items-center justify-between gap-2.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-6 h-6 rounded-full bg-[#C5A059]/20 flex items-center justify-center shrink-0 border border-[#C5A059]/40">
                          <Sparkles size={13} className="text-[#C5A059]" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11px] font-serif font-light text-cream leading-tight">
                            {isFreeShipping ? (
                              <span className="font-medium text-[#E5C17C]">
                                {isPt 
                                  ? 'Parabéns! O seu Envio & Packaging Personalizado M★BRAVO é de Cortesia.' 
                                  : 'Congratulations! Your M★BRAVO Custom Shipping & Packaging is Complimentary.'}
                              </span>
                            ) : (
                              isPt ? (
                                <>Faltam <strong className="font-bold text-[#E5C17C]">{amountNeededForFreeShipping.toFixed(2)}€</strong> para Envio & Packaging Personalizado M★BRAVO de Cortesia</>
                              ) : (
                                <>Add <strong className="font-bold text-[#E5C17C]">{amountNeededForFreeShipping.toFixed(2)}€</strong> for Complimentary M★BRAVO Custom Shipping & Packaging</>
                              )
                            )}
                          </p>
                          <p className="text-[9.5px] font-sans text-cream/70 truncate mt-0.5">
                            {isFreeShipping 
                              ? (isPt ? 'Entrega expressa CTT sem custos de envio.' : 'Express CTT delivery with zero shipping costs.') 
                              : (isPt ? 'Adicione mais peças sem custos adicionais de envio.' : 'Add more items with zero extra shipping fee.')}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-[#E5C17C] shrink-0 bg-[#C5A059]/20 px-2 py-0.5 rounded-full border border-[#C5A059]/40">
                        {isFreeShipping ? '100%' : `${Math.min(100, Math.max(0, Math.round((subtotal / 100) * 100)))}%`}
                      </span>
                    </div>

                    {/* Golden Shimmer Progress Bar with Sliding M★BRAVO Star at the Tip */}
                    <div className="relative w-full bg-[#131B0D] h-2 rounded-full p-0.5 border border-[#C5A059]/30">
                      <div 
                        className="animate-gold-shimmer h-full rounded-full transition-all duration-500 ease-out shadow-[0_0_8px_rgba(197,160,89,0.6)]" 
                        style={{ width: `${isFreeShipping ? 100 : Math.min(100, Math.max(0, Math.round((subtotal / 100) * 100)))}%` }}
                      />
                      
                      {/* Sliding Star Icon at the Tip */}
                      <div 
                        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 transition-all duration-500 ease-out pointer-events-none"
                        style={{ left: `${isFreeShipping ? 100 : Math.min(100, Math.max(0, Math.round((subtotal / 100) * 100)))}%` }}
                      >
                        <div className="w-4 h-4 rounded-full bg-[#FCFBF9] border border-[#C5A059] flex items-center justify-center shadow-md">
                          <span className="text-[#C5A059] text-[8.5px] font-bold leading-none select-none drop-shadow-[0_0_4px_rgba(197,160,89,0.8)]">
                            ★
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Cart Items List */}
                  <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-1">
                    {renderCartItemsList()}
                  </div>

                  {/* Shipping Region Selector */}
                  <div className="pt-3 border-t border-forest/10 flex items-center justify-between text-xs font-sans">
                    <div className="flex items-center gap-1 text-forest/70">
                      <MapPin size={12} className="text-[#C5A059]" />
                      <span className="text-[9px] uppercase tracking-wider font-semibold">
                        {isPt ? 'Região' : 'Region'}
                      </span>
                    </div>

                    <select
                      value={selectedShippingZone.id}
                      onChange={(e) => {
                        const zone = SHIPPING_ZONES.find((z) => z.id === e.target.value);
                        if (zone) setSelectedShippingZone(zone);
                      }}
                      className="bg-transparent border-b border-forest/20 rounded-none text-xs font-serif font-normal text-forest px-1 py-0.5 focus:outline-none focus:border-forest cursor-pointer"
                    >
                      {SHIPPING_ZONES.map((zone) => (
                        <option key={zone.id} value={zone.id}>
                          {zone.name[isPt ? 'pt' : 'en']} ({isFreeShipping && zone.id === 'PT' ? 'Cortesia' : `+${zone.price.toFixed(2)}€`})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Timelines */}
                  <div className="space-y-1 text-[10px] text-forest/75 font-sans border-t border-forest/5 pt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-forest/60">{isPt ? 'Produção Manual:' : 'Production:'}</span>
                      <span className="font-serif font-medium text-forest">
                        {maxLeadTimeDays === 0
                          ? (isPt ? 'Disponível em Atelier' : 'Available in Atelier')
                          : (isPt ? `${maxLeadTimeDays} ${maxLeadTimeDays === 1 ? 'dia útil' : 'dias úteis'}` : `${maxLeadTimeDays} business days`)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-forest/60">{isPt ? 'Envio Expresso (CTT):' : 'Express (CTT):'}</span>
                      <span className="font-serif font-medium text-forest">1 a 3 dias úteis</span>
                    </div>
                  </div>

                  {/* Financial Breakdown with Explicit (+ Portes) Discrimination */}
                  <div className="space-y-1.5 font-sans text-xs pt-2.5 border-t border-forest/10">
                    <div className="flex justify-between text-forest/70">
                      <span>{isPt ? 'Subtotal dos Artigos' : 'Items Subtotal'}</span>
                      <span className="font-serif font-medium text-forest">{subtotal.toFixed(2)}€</span>
                    </div>
                    <div className="flex justify-between text-forest/70">
                      <span>{isPt ? 'Portes de Envio' : 'Shipping'} ({selectedShippingZone.name[isPt ? 'pt' : 'en']})</span>
                      <span className="font-serif font-medium">
                        {shippingFee === 0 ? (
                          <span className="text-[#987834] font-bold text-[10px] bg-[#C5A059]/15 px-2 py-0.5 rounded-full border border-[#C5A059]/30">
                            {isPt ? 'Cortesia (0.00€)' : 'Courtesy (0.00€)'}
                          </span>
                        ) : (
                          <span className="font-bold text-forest">+ {shippingFee.toFixed(2)}€</span>
                        )}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-forest/10 flex justify-between items-baseline">
                      <div>
                        <span className="text-xs font-serif font-bold text-forest uppercase tracking-wider block">
                          {isPt ? 'Total Final' : 'Final Total'}
                        </span>
                        <span className="text-[9px] text-forest/50 font-sans block">
                          ({subtotal.toFixed(2)}€ {shippingFee === 0 ? (isPt ? '+ Portes Cortesia' : '+ Courtesy Shipping') : (isPt ? `+ ${shippingFee.toFixed(2)}€ portes` : `+ ${shippingFee.toFixed(2)}€ shipping`)})
                        </span>
                      </div>
                      <span className="text-xl font-serif font-bold text-forest">{totalPrice.toFixed(2)}€</span>
                    </div>
                  </div>

                  {/* Golden Badge 2: Commercial Incentive for Fixed Shipping Rate (Multipack Upsell) */}
                  <div className="p-3 rounded-2xl bg-[#F6F2EA] border border-[#C5A059]/35 text-forest font-sans shadow-xs space-y-1 mt-2">
                    <div className="flex items-center gap-1.5 text-[#987834]">
                      <Sparkles size={12} className="shrink-0 text-[#C5A059]" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">
                        {isPt ? 'Nota de Envio' : 'Shipping Note'}
                      </span>
                    </div>
                    <p className="text-[11px] font-serif text-forest leading-snug">
                      {isPt ? (
                        <>Pelo mesmo valor de portes (<strong className="font-bold text-[#A68244]">{shippingFee === 0 ? '4,50€' : `${shippingFee.toFixed(2)}€`}</strong>), pode incluir até <strong className="font-bold text-[#A68244]">3 peças</strong> na mesma encomenda!</>
                      ) : (
                        <>For the same shipping fee (<strong className="font-bold text-[#A68244]">{shippingFee === 0 ? '4.50€' : `${shippingFee.toFixed(2)}€`}</strong>), you can include up to <strong className="font-bold text-[#A68244]">3 items</strong> in one shipment!</>
                      )}
                    </p>
                    <p className="text-[9.5px] text-forest/60">
                      {isPt ? 'Aproveite a mesma caixa e otimize o custo de transporte.' : 'Maximize your shipment box and optimize delivery value.'}
                    </p>
                  </div>
                </div>

                {/* RIGHT COLUMN: Express Checkout & Form (7/12) */}
                <div className="w-[58%] bg-[#FCFBF9] p-6 flex flex-col h-full overflow-y-auto space-y-5">
                  {errorMessage && (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
                      <AlertTriangle size={15} className="shrink-0 text-red-600" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {/* ⚡ 1-CLICK EXPRESS CHECKOUT WALLET (STRICT ECOSYSTEM) */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-0.5">
                      <span className="text-[9px] uppercase tracking-[0.25em] font-semibold text-[#A68244] flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059] animate-pulse" />
                        {isPt ? 'Checkout Expresso 1-Clique' : '1-Click Express Checkout'}
                      </span>
                      <span className="text-[9px] text-forest/50 font-sans italic">
                        {isPt ? 'Autorização imediata' : 'Instant auth'}
                      </span>
                    </div>

                    {/* Show ONLY Apple Pay on Apple ecosystem, or ONLY Google Pay on Android/Windows/Chrome */}
                    <div>
                      {detectedEcosystem === 'apple' ? (
                        <button
                          type="button"
                          disabled={isPaying}
                          onClick={(e) => handleExpressWalletPay(e, 'Apple Pay')}
                          className={`w-full h-10 max-h-[40px] bg-black rounded-sm flex items-center justify-center transition-all hover:bg-black/90 cursor-pointer shadow-xs border border-black/80 px-4 ${
                            activeExpressWallet === 'applepay' ? 'ring-2 ring-[#C5A059] scale-[0.99]' : 'active:scale-[0.98]'
                          } ${isPaying && activeExpressWallet !== 'applepay' ? 'opacity-50 cursor-not-allowed' : ''}`}
                          title={isPt ? 'Pagar com Apple Pay' : 'Pay with Apple Pay'}
                        >
                          {isPaying && activeExpressWallet === 'applepay' ? (
                            <span className="text-[10px] uppercase tracking-wider text-white font-mono animate-pulse">
                              {isPt ? 'A autorizar Apple Pay...' : 'Authorizing Apple Pay...'}
                            </span>
                          ) : (
                            <ApplePayIcon className="h-5 w-auto text-white fill-current pointer-events-none shrink-0 overflow-visible" />
                          )}
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={isPaying}
                          onClick={(e) => handleExpressWalletPay(e, 'Google Pay')}
                          className={`w-full h-10 max-h-[40px] bg-black rounded-sm flex items-center justify-center transition-all hover:bg-black/90 cursor-pointer shadow-xs border border-black/80 px-4 ${
                            activeExpressWallet === 'googlepay' ? 'ring-2 ring-[#C5A059] scale-[0.99]' : 'active:scale-[0.98]'
                          } ${isPaying && activeExpressWallet !== 'googlepay' ? 'opacity-50 cursor-not-allowed' : ''}`}
                          title={isPt ? 'Pagar com Google Pay' : 'Pay with Google Pay'}
                        >
                          {isPaying && activeExpressWallet === 'googlepay' ? (
                            <span className="text-[10px] uppercase tracking-wider text-white font-mono animate-pulse">
                              {isPt ? 'A autorizar Google Pay...' : 'Authorizing Google Pay...'}
                            </span>
                          ) : (
                            <GooglePayIcon className="h-5 w-auto pointer-events-none shrink-0" />
                          )}
                        </button>
                      )}
                    </div>

                    <div className="relative flex py-1 items-center">
                      <div className="flex-grow border-t border-forest/15"></div>
                      <span className="flex-shrink mx-3 text-[8.5px] uppercase tracking-[0.2em] text-forest/40 font-semibold font-sans">
                        {isPt ? 'OU PREENCHA MANUALMENTE' : 'OR FILL MANUAL FORM'}
                      </span>
                      <div className="flex-grow border-t border-forest/15"></div>
                    </div>
                  </div>

                  {/* Shipping & Billing Details Inputs */}
                  <div className="space-y-3">
                    <span className="text-[8.5px] uppercase tracking-[0.3em] font-semibold text-forest/50 block">
                      {isPt ? '1. Dados de Envio & Faturação' : '1. Shipping & Billing Details'}
                    </span>

                    <div className="grid grid-cols-2 gap-2.5 text-xs">
                      <div>
                        <label className="block text-[8.5px] uppercase tracking-wider font-semibold text-forest/70 mb-1">
                          {isPt ? 'Nome Completo *' : 'Full Name *'}
                        </label>
                        <input
                          type="text"
                          value={checkoutForm.nome}
                          onChange={(e) => setCheckoutForm({ ...checkoutForm, nome: e.target.value })}
                          placeholder={isPt ? "Nome do destinatário" : "Recipient name"}
                          className="w-full px-3 py-2 rounded-xl border border-forest/15 bg-white focus:outline-none focus:border-[#C5A059] text-xs text-forest placeholder-forest/30 transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-[8.5px] uppercase tracking-wider font-semibold text-forest/70 mb-1">
                          {isPt ? 'E-mail *' : 'Email *'}
                        </label>
                        <input
                          type="email"
                          value={checkoutForm.email}
                          onChange={(e) => setCheckoutForm({ ...checkoutForm, email: e.target.value })}
                          placeholder={isPt ? "nome@dominio.com" : "name@domain.com"}
                          className={`w-full px-3 py-2 rounded-xl border bg-white focus:outline-none text-xs text-forest placeholder-forest/30 transition-all ${
                            checkoutForm.email && !isValidEmail(checkoutForm.email)
                              ? 'border-red-300 focus:border-red-400'
                              : 'border-forest/15 focus:border-[#C5A059]'
                          }`}
                        />
                        {checkoutForm.email && suggestCorrectEmail(checkoutForm.email) && (
                          <div className="text-[9.5px] text-amber-900 bg-amber-50 border border-amber-200 rounded-lg p-1.5 flex items-center justify-between gap-1 mt-1 font-sans">
                            <span>
                              {isPt ? 'Quis dizer ' : 'Did you mean '}
                              <strong
                                className="underline cursor-pointer font-bold"
                                onClick={() => setCheckoutForm({ ...checkoutForm, email: suggestCorrectEmail(checkoutForm.email)! })}
                              >
                                {suggestCorrectEmail(checkoutForm.email)}
                              </strong>?
                            </span>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-[8.5px] uppercase tracking-wider font-semibold text-forest/70 mb-1">
                          {isPt ? 'Telefone *' : 'Phone *'}
                        </label>
                        <input
                          type="tel"
                          value={checkoutForm.telefone}
                          onChange={(e) => setCheckoutForm({ ...checkoutForm, telefone: e.target.value.replace(/[^0-9+]/g, '') })}
                          placeholder={isPt ? "9xx xxx xxx" : "Phone number"}
                          className="w-full px-3 py-2 rounded-xl border border-forest/15 bg-white focus:outline-none focus:border-[#C5A059] text-xs text-forest placeholder-forest/30 transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-[8.5px] uppercase tracking-wider font-semibold text-forest/70 mb-1">
                          {isPt ? 'NIF (Opcional)' : 'Tax ID (Optional)'}
                        </label>
                        <input
                          type="text"
                          maxLength={9}
                          value={checkoutForm.nif}
                          onChange={(e) => setCheckoutForm({ ...checkoutForm, nif: e.target.value.replace(/\D/g, '') })}
                          placeholder={isPt ? "NIF Fatura" : "Tax ID"}
                          className="w-full px-3 py-2 rounded-xl border border-forest/15 bg-white focus:outline-none focus:border-[#C5A059] text-xs text-forest placeholder-forest/30 transition-all"
                        />
                      </div>

                      <div className="col-span-2">
                        <label className="block text-[8.5px] uppercase tracking-wider font-semibold text-forest/70 mb-1">
                          {isPt ? 'Morada de Envio *' : 'Shipping Address *'}
                        </label>
                        <input
                          type="text"
                          value={checkoutForm.morada}
                          onChange={(e) => setCheckoutForm({ ...checkoutForm, morada: e.target.value })}
                          placeholder={isPt ? "Morada completa de entrega" : "Full shipping address"}
                          className="w-full px-3 py-2 rounded-xl border border-forest/15 bg-white focus:outline-none focus:border-[#C5A059] text-xs text-forest placeholder-forest/30 transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-[8.5px] uppercase tracking-wider font-semibold text-forest/70 mb-1">
                          {isPt ? 'Código Postal *' : 'Postal Code *'}
                        </label>
                        <input
                          type="text"
                          maxLength={8}
                          value={checkoutForm.codigoPostal}
                          onChange={(e) => setCheckoutForm({ ...checkoutForm, codigoPostal: formatPostalCodePT(e.target.value) })}
                          placeholder="XXXX-XXX"
                          className="w-full px-3 py-2 rounded-xl border border-forest/15 bg-white focus:outline-none focus:border-[#C5A059] text-xs text-forest placeholder-forest/30 transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-[8.5px] uppercase tracking-wider font-semibold text-forest/70 mb-1">
                          {isPt ? 'Cidade *' : 'City *'}
                        </label>
                        <input
                          type="text"
                          value={checkoutForm.cidade}
                          onChange={(e) => setCheckoutForm({ ...checkoutForm, cidade: e.target.value })}
                          placeholder={isPt ? "Cidade" : "City"}
                          className="w-full px-3 py-2 rounded-xl border border-forest/15 bg-white focus:outline-none focus:border-[#C5A059] text-xs text-forest placeholder-forest/30 transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Payment Method Selector */}
                  <div className="space-y-2.5 pt-1">
                    <span className="text-[8.5px] uppercase tracking-[0.3em] font-semibold text-forest/50 block">
                      {isPt ? '2. Método de Pagamento' : '2. Payment Method'}
                    </span>

                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('mbway')}
                        className={`py-2.5 px-2 rounded-xl border text-center transition-all cursor-pointer ${
                          paymentMethod === 'mbway'
                            ? 'border-[#C5A059] bg-[#343E2C] text-[#C5A059] font-medium shadow-xs'
                            : 'border-forest/15 bg-white text-forest/70 hover:bg-forest/5'
                        }`}
                      >
                        <Phone size={15} className="mx-auto mb-0.5 text-[#C5A059]" />
                        <span className="text-[10px] block font-sans font-semibold">MB WAY</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('multibanco')}
                        className={`py-2.5 px-2 rounded-xl border text-center transition-all cursor-pointer ${
                          paymentMethod === 'multibanco'
                            ? 'border-[#C5A059] bg-[#343E2C] text-[#C5A059] font-medium shadow-xs'
                            : 'border-forest/15 bg-white text-forest/70 hover:bg-forest/5'
                        }`}
                      >
                        <Building size={15} className="mx-auto mb-0.5 text-[#C5A059]" />
                        <span className="text-[10px] block font-sans font-semibold">Multibanco</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('card')}
                        className={`py-2.5 px-2 rounded-xl border text-center transition-all cursor-pointer ${
                          paymentMethod === 'card'
                            ? 'border-[#C5A059] bg-[#343E2C] text-[#C5A059] font-medium shadow-xs'
                            : 'border-forest/15 bg-white text-forest/70 hover:bg-forest/5'
                        }`}
                      >
                        <CreditCard size={15} className="mx-auto mb-0.5 text-[#C5A059]" />
                        <span className="text-[10px] block font-sans font-semibold">Cartão</span>
                      </button>
                    </div>

                    {paymentMethod === 'mbway' && (
                      <div className="p-3 rounded-xl bg-forest/5 border border-forest/10 space-y-1.5">
                        <label className="block text-[8.5px] uppercase tracking-wider font-semibold text-forest/70">
                          {isPt ? 'Telemóvel MB WAY' : 'MB WAY Phone'}
                        </label>
                        <input
                          type="tel"
                          value={checkoutForm.mbwayPhone || checkoutForm.telefone}
                          onChange={(e) => setCheckoutForm({ ...checkoutForm, mbwayPhone: e.target.value.replace(/[^0-9+]/g, '') })}
                          placeholder="9xx xxx xxx"
                          className="w-full px-3 py-2 rounded-xl border border-forest/15 bg-white text-xs text-forest focus:outline-none focus:border-[#C5A059]"
                        />
                        <p className="text-[9.5px] text-forest/60 font-sans">
                          {isPt ? 'Notificação enviada para a app MB WAY para autorizar.' : 'Notification sent to MB WAY app.'}
                        </p>
                      </div>
                    )}

                    {paymentMethod === 'multibanco' && (
                      <div className="p-3 rounded-xl bg-forest/5 border border-forest/10 text-xs text-forest/80 font-sans">
                        <p className="font-semibold text-forest text-[10.5px]">
                          {isPt ? 'Entidade e Referência' : 'Entity and Reference'}
                        </p>
                        <p className="text-[10px] text-forest/60 leading-relaxed">
                          {isPt ? 'Gerados imediatamente após confirmar.' : 'Generated right after confirmation.'}
                        </p>
                      </div>
                    )}

                    {paymentMethod === 'card' && (
                      <div className="p-3 rounded-xl bg-forest/5 border border-forest/10 space-y-2 text-xs">
                        <div>
                          <label className="block text-[8.5px] uppercase tracking-wider font-semibold text-forest/70 mb-1">
                            {isPt ? 'Número do Cartão' : 'Card Number'}
                          </label>
                          <input
                            type="text"
                            maxLength={19}
                            value={checkoutForm.cardNumber}
                            onChange={(e) => setCheckoutForm({ ...checkoutForm, cardNumber: e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim() })}
                            placeholder="0000 0000 0000 0000"
                            className="w-full px-3 py-2 rounded-xl border border-forest/15 bg-white text-xs text-forest focus:outline-none focus:border-[#C5A059] font-mono"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[8.5px] uppercase tracking-wider font-semibold text-forest/70 mb-1">
                              Validade (MM/AA)
                            </label>
                            <input
                              type="text"
                              maxLength={5}
                              value={checkoutForm.cardExpiry}
                              onChange={(e) => {
                                const v = e.target.value.replace(/\D/g, '');
                                const formatted = v.length > 2 ? `${v.slice(0,2)}/${v.slice(2,4)}` : v;
                                setCheckoutForm({ ...checkoutForm, cardExpiry: formatted });
                              }}
                              placeholder="MM/AA"
                              className="w-full px-3 py-2 rounded-xl border border-forest/15 bg-white text-xs text-forest focus:outline-none focus:border-[#C5A059] font-mono"
                            />
                          </div>

                          <div>
                            <label className="block text-[8.5px] uppercase tracking-wider font-semibold text-forest/70 mb-1">
                              CVC / CVV
                            </label>
                            <input
                              type="password"
                              maxLength={4}
                              value={checkoutForm.cardCvv}
                              onChange={(e) => setCheckoutForm({ ...checkoutForm, cardCvv: e.target.value.replace(/\D/g, '') })}
                              placeholder="123"
                              className="w-full px-3 py-2 rounded-xl border border-forest/15 bg-white text-xs text-forest focus:outline-none focus:border-[#C5A059] font-mono"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Security Guarantees */}
                  <div className="pt-1 flex items-center justify-center gap-4 text-[9.5px] text-forest/60 font-sans border-t border-forest/10">
                    <span className="flex items-center gap-1">
                      <Lock size={11} className="text-[#C5A059]" />
                      SSL 256-Bit
                    </span>
                    <span className="flex items-center gap-1">
                      <ShieldCheck size={11} className="text-[#C5A059]" />
                      Atelier M★BRAVO
                    </span>
                  </div>

                  {/* Final Submit Button */}
                  <button
                    type="button"
                    disabled={!isFormValid || isPaying}
                    onClick={handleProcessOrder}
                    className={`w-full h-10 max-h-[40px] px-5 rounded-sm text-[10px] sm:text-[11px] uppercase tracking-[0.2em] font-medium transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer ${
                      isFormValid && !isPaying
                        ? 'bg-forest text-cream hover:bg-[#1C2713] active:scale-[0.99]'
                        : 'bg-forest/20 text-forest/40 cursor-not-allowed'
                    }`}
                  >
                    {isPaying ? (
                      <span className="font-mono text-xs animate-pulse">
                        {isPt ? 'A processar...' : 'Processing...'}
                      </span>
                    ) : (
                      <>
                        <span>{isPt ? 'Confirmar e Pagar' : 'Confirm & Pay'}</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059]" />
                        <span className="font-serif">{totalPrice.toFixed(2)}€</span>
                        <ArrowRight size={13} />
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* --- MOBILE SINGLE-COLUMN FLUID SHEET (< md) --- */}
              <div className="md:hidden flex-1 min-h-0 overflow-y-auto overscroll-contain px-5 py-3 space-y-4 touch-pan-y text-forest select-text font-sans">
                {step === 'cart' ? (
                  /* STEP 1: MOBILE COMPACT CART VIEW */
                  <div className="space-y-4">
                    {/* Deep Green Luxury Courtesy Shipping Upsell Banner */}
                    <div className="p-3.5 rounded-2xl bg-forest border border-[#C5A059]/60 shadow-md space-y-2.5">
                      <div className="flex items-center justify-between gap-2.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-6 h-6 rounded-full bg-[#C5A059]/20 flex items-center justify-center shrink-0 border border-[#C5A059]/40">
                            <Sparkles size={13} className="text-[#C5A059]" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[11px] font-serif font-light text-cream leading-tight">
                              {isFreeShipping ? (
                                <span className="font-medium text-[#E5C17C]">
                                  {isPt 
                                    ? 'Parabéns! O seu Envio & Packaging Personalizado M★BRAVO é de Cortesia.' 
                                    : 'Congratulations! Your M★BRAVO Custom Shipping & Packaging is Complimentary.'}
                                </span>
                              ) : (
                                isPt ? (
                                  <>Faltam <strong className="font-bold text-[#E5C17C]">{amountNeededForFreeShipping.toFixed(2)}€</strong> para Envio & Packaging Personalizado M★BRAVO de Cortesia</>
                                ) : (
                                  <>Add <strong className="font-bold text-[#E5C17C]">{amountNeededForFreeShipping.toFixed(2)}€</strong> for Complimentary M★BRAVO Custom Shipping & Packaging</>
                                )
                              )}
                            </p>
                            <p className="text-[9.5px] font-sans text-cream/70 truncate mt-0.5">
                              {isFreeShipping 
                                ? (isPt ? 'Entrega expressa CTT sem custos de envio.' : 'Express CTT delivery with zero shipping costs.') 
                                : (isPt ? 'Adicione mais peças sem custos adicionais de envio.' : 'Add more items with zero extra shipping fee.')}
                            </p>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-[#E5C17C] shrink-0 bg-[#C5A059]/20 px-2 py-0.5 rounded-full border border-[#C5A059]/40">
                          {isFreeShipping ? '100%' : `${Math.min(100, Math.max(0, Math.round((subtotal / 100) * 100)))}%`}
                        </span>
                      </div>

                      {/* Golden Shimmer Progress Bar with Sliding M★BRAVO Star at the Tip */}
                      <div className="relative w-full bg-[#131B0D] h-2 rounded-full p-0.5 border border-[#C5A059]/30">
                        <div 
                          className="animate-gold-shimmer h-full rounded-full transition-all duration-500 ease-out shadow-[0_0_8px_rgba(197,160,89,0.6)]" 
                          style={{ width: `${isFreeShipping ? 100 : Math.min(100, Math.max(0, Math.round((subtotal / 100) * 100)))}%` }}
                        />
                        
                        {/* Sliding Star Icon at the Tip */}
                        <div 
                          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 transition-all duration-500 ease-out pointer-events-none"
                          style={{ left: `${isFreeShipping ? 100 : Math.min(100, Math.max(0, Math.round((subtotal / 100) * 100)))}%` }}
                        >
                          <div className="w-4 h-4 rounded-full bg-[#FCFBF9] border border-[#C5A059] flex items-center justify-center shadow-md">
                            <span className="text-[#C5A059] text-[8.5px] font-bold leading-none select-none drop-shadow-[0_0_4px_rgba(197,160,89,0.8)]">
                              ★
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Render Cart Items */}
                    {renderCartItemsList()}

                    {/* Destination Zone Selector */}
                    <div className="flex items-center justify-between pt-2 text-xs font-sans border-t border-forest/10">
                      <div className="flex items-center gap-1.5 text-forest/60">
                        <MapPin size={12} className="text-[#C5A059]" />
                        <span className="text-[9.5px] uppercase tracking-[0.2em] font-semibold text-forest/60">
                          {isPt ? 'Região' : 'Region'}
                        </span>
                      </div>

                      <select
                        value={selectedShippingZone.id}
                        onChange={(e) => {
                          const zone = SHIPPING_ZONES.find((z) => z.id === e.target.value);
                          if (zone) setSelectedShippingZone(zone);
                        }}
                        className="bg-transparent border-b border-forest/20 rounded-none text-xs font-serif font-normal text-forest px-1 py-0.5 focus:outline-none focus:border-forest cursor-pointer"
                      >
                        {SHIPPING_ZONES.map((zone) => (
                          <option key={zone.id} value={zone.id}>
                            {zone.name[isPt ? 'pt' : 'en']} ({isFreeShipping && zone.id === 'PT' ? 'Cortesia' : `+${zone.price.toFixed(2)}€`})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Golden Badge 2: Commercial Incentive for Fixed Shipping Rate (Multipack Upsell) */}
                    <div className="p-3 rounded-2xl bg-[#F6F2EA] border border-[#C5A059]/35 text-forest font-sans shadow-xs space-y-1">
                      <div className="flex items-center gap-1.5 text-[#987834]">
                        <Sparkles size={12} className="shrink-0 text-[#C5A059]" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">
                          {isPt ? 'Nota de Envio' : 'Shipping Note'}
                        </span>
                      </div>
                      <p className="text-[11px] font-serif text-forest leading-snug">
                        {isPt ? (
                          <>Pelo mesmo valor de portes (<strong className="font-bold text-[#A68244]">{shippingFee === 0 ? '4,50€' : `${shippingFee.toFixed(2)}€`}</strong>), pode incluir até <strong className="font-bold text-[#A68244]">3 peças</strong> na mesma encomenda!</>
                        ) : (
                          <>For the same shipping fee (<strong className="font-bold text-[#A68244]">{shippingFee === 0 ? '4.50€' : `${shippingFee.toFixed(2)}€`}</strong>), you can include up to <strong className="font-bold text-[#A68244]">3 items</strong> in one shipment!</>
                        )}
                      </p>
                      <p className="text-[9.5px] text-forest/60">
                        {isPt ? 'Aproveite a mesma caixa e otimize o custo de transporte.' : 'Maximize your shipment box and optimize delivery value.'}
                      </p>
                    </div>

                    {/* Totals & Proceed CTA with Explicit (+ Portes) Discrimination */}
                    <div className="space-y-2 pt-2 border-t border-forest/10 font-sans text-xs">
                      <div className="flex justify-between text-forest/70">
                        <span>{isPt ? 'Subtotal dos Artigos' : 'Items Subtotal'}</span>
                        <span className="font-serif font-medium text-forest">{subtotal.toFixed(2)}€</span>
                      </div>
                      <div className="flex justify-between text-forest/70">
                        <span>{isPt ? 'Portes de Envio' : 'Shipping'} ({selectedShippingZone.name[isPt ? 'pt' : 'en']})</span>
                        <span className="font-serif font-medium">
                          {shippingFee === 0 ? (
                            <span className="text-[#987834] font-bold text-[10px] bg-[#C5A059]/15 px-2 py-0.5 rounded-full border border-[#C5A059]/30">
                              {isPt ? 'Cortesia (0.00€)' : 'Courtesy (0.00€)'}
                            </span>
                          ) : (
                            <span className="font-bold text-forest">+ {shippingFee.toFixed(2)}€</span>
                          )}
                        </span>
                      </div>
                      <div className="pt-2 border-t border-forest/10 flex justify-between items-baseline">
                        <div>
                          <span className="font-serif font-bold uppercase tracking-wider text-forest text-xs block">
                            {isPt ? 'Total Final' : 'Final Total'}
                          </span>
                          <span className="text-[9px] text-forest/50 font-sans block">
                            ({subtotal.toFixed(2)}€ {shippingFee === 0 ? (isPt ? '+ Portes Cortesia' : '+ Courtesy Shipping') : (isPt ? `+ ${shippingFee.toFixed(2)}€ portes` : `+ ${shippingFee.toFixed(2)}€ shipping`)})
                          </span>
                        </div>
                        <span className="text-lg font-serif font-bold text-forest">{totalPrice.toFixed(2)}€</span>
                      </div>

                      <button
                        onClick={() => setStep('checkout')}
                        className="w-full h-10 max-h-[40px] px-5 bg-forest hover:bg-[#1C2713] text-cream rounded-sm text-[10px] sm:text-[11px] uppercase tracking-[0.2em] font-medium transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] group mt-1"
                      >
                        <span>{isPt ? 'Concluir Encomenda' : 'Proceed to Checkout'}</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059]" />
                        <span className="font-serif">{totalPrice.toFixed(2)}€</span>
                        <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </div>
                  </div>
                ) : (
                  /* STEP 2: MOBILE CHECKOUT & PAYMENT FORM VIEW */
                  <div className="space-y-4 pb-4">
                    {errorMessage && (
                      <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
                        <AlertTriangle size={15} className="shrink-0 text-red-600" />
                        <span>{errorMessage}</span>
                      </div>
                    )}

                    {/* Top Order Summary with Always-Expanded Items & Explicit (+ Portes) Breakdown */}
                    <div className="bg-[#F8F6F0] rounded-2xl p-3.5 border border-forest/10 space-y-2.5">
                      <div className="flex items-center justify-between text-xs font-sans font-medium text-forest">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#A68244]">
                            {isPt ? 'Resumo da Encomenda' : 'Order Summary'}
                          </span>
                          <span className="text-[10px] text-forest/50 font-normal">
                            ({totalItemCount} {totalItemCount === 1 ? (isPt ? 'item' : 'item') : (isPt ? 'itens' : 'items')})
                          </span>
                        </div>

                        <div className="text-right">
                          <span className="font-serif font-bold text-forest text-sm block leading-none">{totalPrice.toFixed(2)}€</span>
                          <span className="text-[8.5px] text-forest/60 font-sans font-normal block mt-0.5">
                            ({subtotal.toFixed(2)}€ {shippingFee === 0 ? (isPt ? '+ Cortesia' : '+ Free') : (isPt ? `+ ${shippingFee.toFixed(2)}€ portes` : `+ ${shippingFee.toFixed(2)}€ ship`)})
                          </span>
                        </div>
                      </div>

                      {/* Always Visible Detailed Item List & Explicit Financial Breakdown */}
                      <div className="pt-2 border-t border-forest/10 space-y-2 text-xs">
                        {cart.map((item) => {
                          const colorDisplay = item.selections?.cor ? formatColorName(item.selections.cor) : '';
                          return (
                            <div key={item.cartItemId} className="flex items-center justify-between gap-3 text-xs py-1">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <img src={item.img} alt="" className="w-9 h-11 object-cover rounded-md border border-forest/10 bg-[#F6F1E5] shrink-0" />
                                <div className="min-w-0">
                                  <p className="font-serif font-medium text-forest text-xs leading-snug truncate">{item.productName}</p>
                                  <p className="text-[10px] text-forest/60 font-sans truncate">
                                    {item.quantity}x {colorDisplay && `• ${isPt ? 'Cor' : 'Color'}: ${translateColor(colorDisplay, lang)}`}
                                  </p>
                                </div>
                              </div>
                              <span className="font-serif font-semibold text-forest text-xs shrink-0">
                                {(item.unitPrice * item.quantity).toFixed(2)}€
                              </span>
                            </div>
                          );
                        })}

                          {/* Explicit Financial Breakdown in Expanded Accordion */}
                          <div className="pt-2 border-t border-forest/10 space-y-1.5 font-sans text-[11px]">
                            <div className="flex justify-between text-forest/70">
                              <span>{isPt ? 'Subtotal dos Artigos' : 'Items Subtotal'}</span>
                              <span className="font-serif font-medium text-forest">{subtotal.toFixed(2)}€</span>
                            </div>
                            <div className="flex justify-between text-forest/70">
                              <span>{isPt ? 'Portes de Envio CTT' : 'CTT Shipping'} ({selectedShippingZone.name[isPt ? 'pt' : 'en']})</span>
                              <span className="font-serif font-medium">
                                {shippingFee === 0 ? (
                                  <span className="text-[#987834] font-bold text-[10px]">{isPt ? 'Cortesia (0.00€)' : 'Courtesy (0.00€)'}</span>
                                ) : (
                                  <span className="font-bold text-forest">+ {shippingFee.toFixed(2)}€</span>
                                )}
                              </span>
                            </div>
                            <div className="pt-1.5 border-t border-forest/10 flex justify-between items-baseline font-bold text-forest">
                              <div>
                                <span className="font-serif uppercase tracking-wider block text-xs">{isPt ? 'Total Final' : 'Final Total'}</span>
                                <span className="text-[9px] text-forest/50 font-normal">
                                  ({subtotal.toFixed(2)}€ {shippingFee === 0 ? (isPt ? '+ Portes Cortesia' : '+ Courtesy Shipping') : (isPt ? `+ ${shippingFee.toFixed(2)}€ portes` : `+ ${shippingFee.toFixed(2)}€ shipping`)})
                                </span>
                              </div>
                              <span className="text-base font-serif">{totalPrice.toFixed(2)}€</span>
                            </div>
                          </div>
                        </div>
                      </div>

                    {/* ⚡ 1-CLICK EXPRESS CHECKOUT (STRICT ECOSYSTEM) */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between px-0.5">
                        <span className="text-[9px] uppercase tracking-[0.25em] font-semibold text-[#A68244] flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059] animate-pulse" />
                          {isPt ? 'Checkout Expresso 1-Clique' : '1-Click Express Checkout'}
                        </span>
                        <span className="text-[9px] text-forest/50 font-sans italic">
                          {isPt ? 'Autorização imediata' : 'Instant auth'}
                        </span>
                      </div>

                      {/* Show ONLY Apple Pay on Apple ecosystem, or ONLY Google Pay on Android/Windows/Chrome */}
                      <div>
                        {detectedEcosystem === 'apple' ? (
                          <button
                            type="button"
                            disabled={isPaying}
                            onClick={(e) => handleExpressWalletPay(e, 'Apple Pay')}
                            className={`w-full h-12 bg-black rounded-xl flex items-center justify-center transition-all hover:bg-black/90 cursor-pointer shadow-xs border border-black/80 px-4 py-2 ${
                              activeExpressWallet === 'applepay' ? 'ring-2 ring-[#C5A059] scale-[0.99]' : 'active:scale-[0.98]'
                            } ${isPaying && activeExpressWallet !== 'applepay' ? 'opacity-50 cursor-not-allowed' : ''}`}
                            title={isPt ? 'Pagar com Apple Pay' : 'Pay with Apple Pay'}
                          >
                            {isPaying && activeExpressWallet === 'applepay' ? (
                              <span className="text-[10px] uppercase tracking-wider text-white font-mono animate-pulse">
                                {isPt ? 'A autorizar Apple Pay...' : 'Authorizing Apple Pay...'}
                              </span>
                            ) : (
                              <ApplePayIcon className="h-5 w-auto text-white fill-current pointer-events-none shrink-0 overflow-visible" />
                            )}
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled={isPaying}
                            onClick={(e) => handleExpressWalletPay(e, 'Google Pay')}
                            className={`w-full h-12 bg-black rounded-xl flex items-center justify-center transition-all hover:bg-black/90 cursor-pointer shadow-xs border border-black/80 px-4 py-2 ${
                              activeExpressWallet === 'googlepay' ? 'ring-2 ring-[#C5A059] scale-[0.99]' : 'active:scale-[0.98]'
                            } ${isPaying && activeExpressWallet !== 'googlepay' ? 'opacity-50 cursor-not-allowed' : ''}`}
                            title={isPt ? 'Pagar com Google Pay' : 'Pay with Google Pay'}
                          >
                            {isPaying && activeExpressWallet === 'googlepay' ? (
                              <span className="text-[10px] uppercase tracking-wider text-white font-mono animate-pulse">
                                {isPt ? 'A autorizar Google Pay...' : 'Authorizing Google Pay...'}
                              </span>
                            ) : (
                              <GooglePayIcon className="h-5 w-auto pointer-events-none shrink-0" />
                            )}
                          </button>
                        )}
                      </div>

                      <div className="relative flex py-1 items-center">
                        <div className="flex-grow border-t border-forest/15"></div>
                        <span className="flex-shrink mx-3 text-[8.5px] uppercase tracking-[0.2em] text-forest/40 font-semibold font-sans">
                          {isPt ? 'OU PREENCHA MANUALMENTE' : 'OR FILL MANUAL FORM'}
                        </span>
                        <div className="flex-grow border-t border-forest/15"></div>
                      </div>
                    </div>

                    {/* Form Fields */}
                    <div className="space-y-2.5">
                      <span className="text-[8.5px] uppercase tracking-[0.3em] font-semibold text-forest/50 block">
                        {isPt ? '1. Dados de Envio & Faturação' : '1. Shipping & Billing Details'}
                      </span>

                      <div className="grid grid-cols-1 gap-2.5 text-xs">
                        <div>
                          <label className="block text-[8.5px] uppercase tracking-wider font-semibold text-forest/70 mb-1">
                            {isPt ? 'Nome Completo *' : 'Full Name *'}
                          </label>
                          <input
                            type="text"
                            value={checkoutForm.nome}
                            onChange={(e) => setCheckoutForm({ ...checkoutForm, nome: e.target.value })}
                            placeholder={isPt ? "Nome do destinatário" : "Recipient name"}
                            className="w-full px-3 py-2 rounded-xl border border-forest/15 bg-white focus:outline-none focus:border-[#C5A059] text-xs text-forest placeholder-forest/30 transition-all"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[8.5px] uppercase tracking-wider font-semibold text-forest/70 mb-1">
                              {isPt ? 'E-mail *' : 'Email *'}
                            </label>
                            <input
                              type="email"
                              value={checkoutForm.email}
                              onChange={(e) => setCheckoutForm({ ...checkoutForm, email: e.target.value })}
                              placeholder={isPt ? "nome@dominio.com" : "name@domain.com"}
                              className={`w-full px-3 py-2 rounded-xl border bg-white focus:outline-none text-xs text-forest placeholder-forest/30 transition-all ${
                                checkoutForm.email && !isValidEmail(checkoutForm.email)
                                  ? 'border-red-300 focus:border-red-400'
                                  : 'border-forest/15 focus:border-[#C5A059]'
                              }`}
                            />
                          </div>

                          <div>
                            <label className="block text-[8.5px] uppercase tracking-wider font-semibold text-forest/70 mb-1">
                              {isPt ? 'Telefone *' : 'Phone *'}
                            </label>
                            <input
                              type="tel"
                              value={checkoutForm.telefone}
                              onChange={(e) => setCheckoutForm({ ...checkoutForm, telefone: e.target.value.replace(/[^0-9+]/g, '') })}
                              placeholder={isPt ? "9xx xxx xxx" : "Phone number"}
                              className="w-full px-3 py-2 rounded-xl border border-forest/15 bg-white focus:outline-none focus:border-[#C5A059] text-xs text-forest placeholder-forest/30 transition-all"
                            />
                          </div>
                        </div>

                        {checkoutForm.email && suggestCorrectEmail(checkoutForm.email) && (
                          <div className="text-[9.5px] text-amber-900 bg-amber-50 border border-amber-200 rounded-lg p-1.5 flex items-center justify-between gap-1 font-sans">
                            <span>
                              {isPt ? 'Quis dizer ' : 'Did you mean '}
                              <strong
                                className="underline cursor-pointer font-bold"
                                onClick={() => setCheckoutForm({ ...checkoutForm, email: suggestCorrectEmail(checkoutForm.email)! })}
                              >
                                {suggestCorrectEmail(checkoutForm.email)}
                              </strong>?
                            </span>
                          </div>
                        )}

                        <div>
                          <label className="block text-[8.5px] uppercase tracking-wider font-semibold text-forest/70 mb-1">
                            {isPt ? 'Morada de Envio *' : 'Shipping Address *'}
                          </label>
                          <input
                            type="text"
                            value={checkoutForm.morada}
                            onChange={(e) => setCheckoutForm({ ...checkoutForm, morada: e.target.value })}
                            placeholder={isPt ? "Morada completa de entrega" : "Full shipping address"}
                            className="w-full px-3 py-2 rounded-xl border border-forest/15 bg-white focus:outline-none focus:border-[#C5A059] text-xs text-forest placeholder-forest/30 transition-all"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[8.5px] uppercase tracking-wider font-semibold text-forest/70 mb-1">
                              {isPt ? 'Código Postal *' : 'Postal Code *'}
                            </label>
                            <input
                              type="text"
                              maxLength={8}
                              value={checkoutForm.codigoPostal}
                              onChange={(e) => setCheckoutForm({ ...checkoutForm, codigoPostal: formatPostalCodePT(e.target.value) })}
                              placeholder="XXXX-XXX"
                              className="w-full px-3 py-2 rounded-xl border border-forest/15 bg-white focus:outline-none focus:border-[#C5A059] text-xs text-forest placeholder-forest/30 transition-all"
                            />
                          </div>

                          <div>
                            <label className="block text-[8.5px] uppercase tracking-wider font-semibold text-forest/70 mb-1">
                              {isPt ? 'Cidade *' : 'City *'}
                            </label>
                            <input
                              type="text"
                              value={checkoutForm.cidade}
                              onChange={(e) => setCheckoutForm({ ...checkoutForm, cidade: e.target.value })}
                              placeholder={isPt ? "Cidade" : "City"}
                              className="w-full px-3 py-2 rounded-xl border border-forest/15 bg-white focus:outline-none focus:border-[#C5A059] text-xs text-forest placeholder-forest/30 transition-all"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Payment Method Selector */}
                    <div className="space-y-2 pt-1">
                      <span className="text-[8.5px] uppercase tracking-[0.3em] font-semibold text-forest/50 block">
                        {isPt ? '2. Método de Pagamento' : '2. Payment Method'}
                      </span>

                      <div className="grid grid-cols-3 gap-1.5">
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('mbway')}
                          className={`py-2 px-1 rounded-xl border text-center transition-all cursor-pointer ${
                            paymentMethod === 'mbway'
                              ? 'border-[#C5A059] bg-[#343E2C] text-[#C5A059] font-medium shadow-xs'
                              : 'border-forest/15 bg-white text-forest/70 hover:bg-forest/5'
                          }`}
                        >
                          <Phone size={14} className="mx-auto mb-0.5 text-[#C5A059]" />
                          <span className="text-[9.5px] block font-sans font-semibold">MB WAY</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setPaymentMethod('multibanco')}
                          className={`py-2 px-1 rounded-xl border text-center transition-all cursor-pointer ${
                            paymentMethod === 'multibanco'
                              ? 'border-[#C5A059] bg-[#343E2C] text-[#C5A059] font-medium shadow-xs'
                              : 'border-forest/15 bg-white text-forest/70 hover:bg-forest/5'
                          }`}
                        >
                          <Building size={14} className="mx-auto mb-0.5 text-[#C5A059]" />
                          <span className="text-[9.5px] block font-sans font-semibold">Multibanco</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setPaymentMethod('card')}
                          className={`py-2 px-1 rounded-xl border text-center transition-all cursor-pointer ${
                            paymentMethod === 'card'
                              ? 'border-[#C5A059] bg-[#343E2C] text-[#C5A059] font-medium shadow-xs'
                              : 'border-forest/15 bg-white text-forest/70 hover:bg-forest/5'
                          }`}
                        >
                          <CreditCard size={14} className="mx-auto mb-0.5 text-[#C5A059]" />
                          <span className="text-[9.5px] block font-sans font-semibold">Cartão</span>
                        </button>
                      </div>

                      {paymentMethod === 'mbway' && (
                        <div className="p-2.5 rounded-xl bg-forest/5 border border-forest/10 space-y-1">
                          <label className="block text-[8.5px] uppercase tracking-wider font-semibold text-forest/70">
                            Telemóvel MB WAY
                          </label>
                          <input
                            type="tel"
                            value={checkoutForm.mbwayPhone || checkoutForm.telefone}
                            onChange={(e) => setCheckoutForm({ ...checkoutForm, mbwayPhone: e.target.value.replace(/[^0-9+]/g, '') })}
                            placeholder="9xx xxx xxx"
                            className="w-full px-3 py-2 rounded-xl border border-forest/15 bg-white text-xs text-forest focus:outline-none focus:border-[#C5A059]"
                          />
                        </div>
                      )}

                      {paymentMethod === 'card' && (
                        <div className="p-2.5 rounded-xl bg-forest/5 border border-forest/10 space-y-2 text-xs">
                          <div>
                            <input
                              type="text"
                              maxLength={19}
                              value={checkoutForm.cardNumber}
                              onChange={(e) => setCheckoutForm({ ...checkoutForm, cardNumber: e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim() })}
                              placeholder="Número do Cartão (0000 ...)"
                              className="w-full px-3 py-2 rounded-xl border border-forest/15 bg-white text-xs text-forest focus:outline-none focus:border-[#C5A059] font-mono"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              maxLength={5}
                              value={checkoutForm.cardExpiry}
                              onChange={(e) => {
                                const v = e.target.value.replace(/\D/g, '');
                                const formatted = v.length > 2 ? `${v.slice(0,2)}/${v.slice(2,4)}` : v;
                                setCheckoutForm({ ...checkoutForm, cardExpiry: formatted });
                              }}
                              placeholder="MM/AA"
                              className="w-full px-3 py-2 rounded-xl border border-forest/15 bg-white text-xs text-forest focus:outline-none focus:border-[#C5A059] font-mono"
                            />
                            <input
                              type="password"
                              maxLength={4}
                              value={checkoutForm.cardCvv}
                              onChange={(e) => setCheckoutForm({ ...checkoutForm, cardCvv: e.target.value.replace(/\D/g, '') })}
                              placeholder="CVC"
                              className="w-full px-3 py-2 rounded-xl border border-forest/15 bg-white text-xs text-forest focus:outline-none focus:border-[#C5A059] font-mono"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Final Mobile Submit Button */}
                    <button
                      type="button"
                      disabled={!isFormValid || isPaying}
                      onClick={handleProcessOrder}
                      className={`w-full h-10 max-h-[40px] px-5 rounded-sm text-[10px] sm:text-[11px] uppercase tracking-[0.2em] font-medium transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer ${
                        isFormValid && !isPaying
                          ? 'bg-forest text-cream hover:bg-[#1C2713] active:scale-[0.99]'
                          : 'bg-forest/20 text-forest/40 cursor-not-allowed'
                      }`}
                    >
                      {isPaying ? (
                        <span className="font-mono text-xs animate-pulse">
                          {isPt ? 'A processar...' : 'Processing...'}
                        </span>
                      ) : (
                        <>
                          <span>{isPt ? 'Confirmar e Pagar' : 'Confirm & Pay'}</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059]" />
                          <span className="font-serif">{totalPrice.toFixed(2)}€</span>
                          <ArrowRight size={13} />
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
};
