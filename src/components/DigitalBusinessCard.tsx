import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingBag, 
  Instagram, 
  Share2, 
  Check, 
  Sparkles, 
  ArrowLeft, 
  ShieldCheck, 
  Heart, 
  Store, 
  QrCode,
  X,
  Copy,
  Palette,
  UserPlus
} from 'lucide-react';
import AtelierPrivateStudioModal from './AtelierPrivateStudioModal';

// Official minimal SVG icons for iOS Dock
const WhatsAppIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984 0 1.758.459 3.474 1.33 4.982l-1.413 5.16 5.283-1.385c1.453.792 3.09 1.21 4.786 1.21 5.507 0 9.99-4.478 9.99-9.985 0-5.506-4.482-9.986-9.986-9.986zm5.82 14.123c-.242.684-1.22 1.305-1.996 1.385-.53.056-1.218.113-3.526-.838-2.951-1.215-4.858-4.225-5.006-4.422-.148-.196-1.202-1.603-1.202-3.056 0-1.453.757-2.17 1.028-2.464.271-.294.591-.368.788-.368.197 0 .394.002.566.01.182.008.428-.069.67.512.242.58.822 2.01.895 2.158.073.148.123.32.025.516-.098.196-.148.32-.295.492-.148.172-.31.384-.442.516-.148.148-.303.31-.131.606.172.295.766 1.265 1.644 2.046 1.128.998 2.082 1.312 2.378 1.459.295.148.468.123.64-.074.172-.197.738-.861.935-1.156.197-.295.394-.246.664-.148.271.098 1.722.812 2.018.96.295.148.492.221.566.344.074.123.074.713-.168 1.397z"/>
  </svg>
);

const PinterestIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z"/>
  </svg>
);

const GoogleIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 15.96 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/>
  </svg>
);

interface DigitalBusinessCardProps {
  onNavigateHome?: () => void;
}

export const DigitalBusinessCard: React.FC<DigitalBusinessCardProps> = ({ onNavigateHome }) => {
  const [copied, setCopied] = useState(false);
  const [recommendCopied, setRecommendCopied] = useState(false);
  const [vCardAdded, setVCardAdded] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [modalCopied, setModalCopied] = useState(false);
  const [showPrivateStudioModal, setShowPrivateStudioModal] = useState(false);

  // 1. Native Mobile Contact Addition (MIME text/vcard)
  const handleAddContact = () => {
    const vcardData = `BEGIN:VCARD
VERSION:3.0
N:Bravo;Carolina;;;
FN:Carolina | M★BRAVO
ORG:M★BRAVO Atelier
TITLE:Fundadora & Designer
TEL;TYPE=CELL,VOICE;TYPE=pref:+351912828182
EMAIL:encomendas@mbravobycarolina.com
URL:https://mbravobycarolina.com/card
NOTE:M★BRAVO Atelier — Peças artesanais feitas com tempo, amor e memórias. Handmade in Portugal.
END:VCARD`;

    const blob = new Blob([vcardData], { type: 'text/vcard;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    // Check if on mobile (iOS / Android)
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (isMobile) {
      // Direct navigation to Object URL prompts native Contact Sheet import on iOS/Android
      window.location.href = url;
    } else {
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Carolina_MBRAVO.vcf');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    setVCardAdded(true);
    setTimeout(() => setVCardAdded(false), 4000);
  };

  // 2. Share card action
  const handleShareCard = async () => {
    const shareData = {
      title: 'M★BRAVO — Cartão de Visita Digital',
      text: 'Peças feitas com tempo, amor e memórias: https://mbravobycarolina.com/card',
      url: 'https://mbravobycarolina.com/card',
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // Dismissed
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareData.url);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      } catch (e) {
        // Fallback
      }
    }
  };

  // 3. Recommend action
  const handleRecommend = async () => {
    const shareText = "Conhece a M★BRAVO — Peças feitas com tempo, amor e memórias: https://mbravobycarolina.com/card";
    const shareData = {
      title: 'M★BRAVO Atelier',
      text: shareText,
      url: 'https://mbravobycarolina.com/card',
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // Dismissed
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareText);
        setRecommendCopied(true);
        setTimeout(() => setRecommendCopied(false), 3500);
      } catch (e) {
        // Fallback
      }
    }
  };

  // 4. Copy Modal Link
  const handleCopyModalLink = async () => {
    try {
      await navigator.clipboard.writeText('https://mbravobycarolina.com/card');
      setModalCopied(true);
      setTimeout(() => setModalCopied(false), 3000);
    } catch (e) {
      // Fallback
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#243119] flex flex-col items-center justify-between p-4 sm:p-6 md:p-8 relative overflow-hidden font-sans select-none antialiased">
      {/* Subtle paper background texture */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-multiply"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 250 250' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseBg'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseBg)'/%3E%3C/svg%3E")`
        }}
      />

      {/* Subtle silk accent curve */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-15" viewBox="0 0 800 1200" fill="none">
        <path 
          d="M 100 -50 C 400 300, 700 100, 400 600 C 100 1100, 700 900, 850 1250" 
          stroke="url(#cardGoldGrad)" 
          strokeWidth="1.2" 
          strokeDasharray="5 10"
        />
        <defs>
          <linearGradient id="cardGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#C5A059" stopOpacity="0.1" />
            <stop offset="50%" stopColor="#8C6D3B" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#C5A059" stopOpacity="0.1" />
          </linearGradient>
        </defs>
      </svg>

      {/* Top Header Bar */}
      <header className="w-full max-w-md flex items-center justify-between z-20 pt-2 mb-3">
        <button
          onClick={() => {
            if (onNavigateHome) {
              onNavigateHome();
            } else {
              window.location.href = '/';
            }
          }}
          className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs uppercase tracking-[0.18em] font-sans font-medium text-[#243119]/80 hover:text-[#8C6D3B] transition-colors py-2 px-3.5 rounded-full bg-white/80 hover:bg-white backdrop-blur-md border border-[#243119]/10 shadow-xs cursor-pointer"
        >
          <ArrowLeft size={13} className="text-[#8C6D3B]" />
          <span>Voltar ao site</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowQrModal(true)}
            className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs uppercase tracking-[0.18em] font-sans font-medium text-[#8C6D3B] hover:text-[#243119] transition-colors py-2 px-3 rounded-full bg-[#C5A059]/15 hover:bg-[#C5A059]/30 backdrop-blur-md border border-[#C5A059]/40 cursor-pointer"
            title="QR Code"
          >
            <QrCode size={13} className="text-[#8C6D3B]" />
            <span>QR Code</span>
          </button>

          <button
            onClick={handleShareCard}
            className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs uppercase tracking-[0.18em] font-sans font-medium text-[#243119]/80 hover:text-[#8C6D3B] transition-colors py-2 px-3 rounded-full bg-white/80 hover:bg-white backdrop-blur-md border border-[#243119]/10 shadow-xs cursor-pointer"
            title="Partilhar"
          >
            <Share2 size={13} className="text-[#8C6D3B]" />
            <span>{copied ? 'Copiado!' : 'Partilhar'}</span>
          </button>
        </div>
      </header>

      {/* Main Digital Pass Content */}
      <main className="w-full max-w-md flex flex-col items-center text-center z-10 my-auto py-1 gap-3.5">
        
        {/* 1. HERO PROFILE CARD WITH INTEGRATED "ADICIONAR AOS CONTACTOS" BUTTON */}
        <motion.div
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7 }}
          className="w-full bg-white/95 border border-[#C5A059]/35 rounded-3xl p-5 shadow-sm relative overflow-hidden backdrop-blur-xs flex flex-col items-center"
        >
          {/* Accent corner glow */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-[radial-gradient(circle_at_top_right,rgba(197,160,89,0.15),transparent_70%)] pointer-events-none" />

          {/* Profile Photo */}
          <div className="relative mb-3">
            <div className="w-22 h-22 sm:w-24 sm:h-24 rounded-full p-0.5 bg-gradient-to-b from-[#C5A059] via-[#8C6D3B] to-[#C5A059]/40 shadow-xs">
              <div className="w-full h-full rounded-full overflow-hidden border border-[#FAF7F2] bg-[#EFE8D8] relative">
                <img 
                  src="/story-1.webp" 
                  alt="Carolina — M★BRAVO Atelier" 
                  className="w-full h-full object-cover object-center"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
            </div>
            {/* Star Emblem */}
            <div className="absolute -bottom-0.5 -right-0.5 w-6 h-6 rounded-full bg-[#243119] border border-[#C5A059] text-[#C5A059] flex items-center justify-center text-[10px] shadow-sm">
              ★
            </div>
          </div>

          {/* Name & Title */}
          <h1 
            style={{ fontFamily: "'Cormorant Garamond', serif", letterSpacing: '0.04em' }}
            className="text-2xl sm:text-3xl font-normal text-[#243119] leading-tight"
          >
            Carolina <span className="text-[#8C6D3B] font-serif">|</span> M<span className="text-[#8C6D3B] mx-0.5">★</span>BRAVO
          </h1>
          <p className="text-[11px] font-sans font-medium text-[#8C6D3B] mt-0.5 mb-2.5">
            Fundadora & Designer
          </p>

          {/* Welcome Note */}
          <p 
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
            className="font-serif italic text-sm sm:text-base text-[#243119]/85 leading-snug max-w-[320px] mb-4"
          >
            &ldquo;Olá! Cada peça M★BRAVO carrega tempo, intenção e alma. Leva-nos contigo.&rdquo;
          </p>

          {/* Primary Action Button Integrated directly in Card */}
          <button
            onClick={handleAddContact}
            className="w-full py-3 px-4 rounded-2xl bg-[#243119] hover:bg-[#1A2412] text-[#FAF8F5] shadow-sm transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2.5 border border-[#243119]"
          >
            {vCardAdded ? <Check size={17} className="text-[#C5A059]" /> : <UserPlus size={17} className="text-[#C5A059]" />}
            <span className="font-serif italic text-base sm:text-lg font-medium">
              {vCardAdded ? 'Contacto Adicionado!' : 'Adicionar aos Contactos'}
            </span>
            <Sparkles size={15} className="text-[#C5A059]" />
          </button>
        </motion.div>

        {/* 2. MÓDULO ATELIER (BLOCO HORIZONTAL EM DESTAQUE) */}
        <motion.button
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.7 }}
          onClick={() => setShowPrivateStudioModal(true)}
          className="group w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#F6F0E4] via-[#FFFDF9] to-[#F6F0E4] hover:from-[#EFE8D8] hover:to-[#EFE8D8] border border-[#C5A059]/70 shadow-xs hover:shadow-sm transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] cursor-pointer flex items-center justify-between text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#C5A059]/20 border border-[#C5A059]/40 flex items-center justify-center text-[#8C6D3B] group-hover:bg-[#C5A059] group-hover:text-[#243119] transition-colors shrink-0">
              <Palette size={18} />
            </div>
            <span className="font-serif italic text-base sm:text-lg font-medium text-[#243119]">
              Personalizar Peça (Passaporte)
            </span>
          </div>
          <Sparkles size={16} className="text-[#8C6D3B] group-hover:rotate-12 transition-transform shrink-0" />
        </motion.button>

        {/* 3. GRELHA DUPLA (2 COLUNAS DE BLOCOS QUADRADOS) */}
        <div className="w-full grid grid-cols-2 gap-3">
          {/* Coleção Online */}
          <motion.button
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.22, duration: 0.7 }}
            onClick={() => {
              if (onNavigateHome) {
                onNavigateHome();
              } else {
                window.location.href = '/#collection';
              }
            }}
            className="group py-4 px-3 rounded-2xl bg-white hover:bg-[#FAF6EE] border border-[#243119]/10 hover:border-[#C5A059] shadow-xs transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] cursor-pointer flex flex-col items-center justify-center text-center gap-2 min-h-[96px]"
          >
            <div className="w-9 h-9 rounded-xl bg-[#C5A059]/15 border border-[#C5A059]/30 flex items-center justify-center text-[#8C6D3B] group-hover:bg-[#8C6D3B] group-hover:text-white transition-colors">
              <ShoppingBag size={18} />
            </div>
            <span className="font-serif italic text-base sm:text-lg font-medium text-[#243119] leading-tight">
              Coleção Online
            </span>
          </motion.button>

          {/* Catálogo de Peças */}
          <motion.button
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.28, duration: 0.7 }}
            onClick={() => {
              if (onNavigateHome) {
                onNavigateHome();
              } else {
                window.location.href = '/#catalogo';
              }
            }}
            className="group py-4 px-3 rounded-2xl bg-white hover:bg-[#FAF6EE] border border-[#243119]/10 hover:border-[#C5A059] shadow-xs transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] cursor-pointer flex flex-col items-center justify-center text-center gap-2 min-h-[96px]"
          >
            <div className="w-9 h-9 rounded-xl bg-[#C5A059]/15 border border-[#C5A059]/30 flex items-center justify-center text-[#8C6D3B] group-hover:bg-[#8C6D3B] group-hover:text-white transition-colors">
              <Store size={18} />
            </div>
            <span className="font-serif italic text-base sm:text-lg font-medium text-[#243119] leading-tight">
              Catálogo de Peças
            </span>
          </motion.button>
        </div>

        {/* 4. DOCK HORIZONTAL DE REDES (ESTILO iOS DOCK - APENAS ÍCONES) */}
        <motion.div
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.35, duration: 0.7 }}
          className="w-full bg-white/90 border border-[#C5A059]/35 rounded-full py-2.5 px-6 shadow-xs backdrop-blur-md flex items-center justify-between mt-1"
        >
          {/* WhatsApp */}
          <a
            href="https://wa.me/351912828182?text=Ol%C3%A1%20Carolina%2C%20gostaria%20de%20saber%20mais%20sobre%20as%20pe%C3%A7as%20M%E2%98%85BRAVO."
            target="_blank"
            rel="noopener noreferrer"
            title="WhatsApp"
            className="w-11 h-11 rounded-full bg-[#25D366]/10 hover:bg-[#25D366] text-[#128C7E] hover:text-white transition-all duration-300 flex items-center justify-center hover:scale-110 active:scale-95"
          >
            <WhatsAppIcon size={20} />
          </a>

          {/* Instagram */}
          <a
            href="https://www.instagram.com/mbravobycarolina/"
            target="_blank"
            rel="noopener noreferrer"
            title="Instagram"
            className="w-11 h-11 rounded-full bg-[#E4405F]/10 hover:bg-[#E4405F] text-[#E4405F] hover:text-white transition-all duration-300 flex items-center justify-center hover:scale-110 active:scale-95"
          >
            <Instagram size={20} />
          </a>

          {/* Pinterest */}
          <a
            href="https://www.pinterest.com/mbravobycarolina/"
            target="_blank"
            rel="noopener noreferrer"
            title="Pinterest"
            className="w-11 h-11 rounded-full bg-[#BD081C]/10 hover:bg-[#BD081C] text-[#BD081C] hover:text-white transition-all duration-300 flex items-center justify-center hover:scale-110 active:scale-95"
          >
            <PinterestIcon size={20} />
          </a>

          {/* Google */}
          <a
            href="https://g.page/r/Cdo7JGP_Xpc3EBM/review"
            target="_blank"
            rel="noopener noreferrer"
            title="Google Avaliações"
            className="w-11 h-11 rounded-full bg-[#4285F4]/10 hover:bg-[#4285F4] text-[#4285F4] hover:text-white transition-all duration-300 flex items-center justify-center hover:scale-110 active:scale-95"
          >
            <GoogleIcon size={20} />
          </a>
        </motion.div>

        {/* 5. PÍLULA DISCRETA DE PARTILHA */}
        <motion.button
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.42, duration: 0.7 }}
          onClick={handleRecommend}
          className="inline-flex items-center gap-2 text-xs font-sans font-medium text-[#8C6D3B] hover:text-[#243119] transition-colors py-2 px-4 rounded-full bg-[#EFE8D8]/80 hover:bg-[#EFE8D8] border border-[#C5A059]/40 cursor-pointer shadow-2xs mt-0.5"
        >
          <Share2 size={13} className="text-[#8C6D3B]" />
          <span>{recommendCopied ? 'Link Copiado!' : 'Partilhar Cartão'}</span>
        </motion.button>
      </main>

      {/* Footer Authenticity */}
      <footer className="w-full max-w-md flex flex-col items-center gap-1.5 z-20 pb-2 mt-4">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] font-sans font-medium text-[#8C6D3B] bg-white/80 py-1.5 px-4 rounded-full border border-[#C5A059]/30 shadow-2xs backdrop-blur-md">
          <ShieldCheck size={12} className="text-[#8C6D3B]" />
          <span>M★BRAVO — Handmade in Portugal</span>
        </div>
        <p className="text-[9px] font-sans uppercase tracking-[0.25em] text-[#243119]/50 flex items-center gap-1">
          <span>Created with time</span>
          <span>•</span>
          <Heart size={9} className="text-[#8C6D3B] inline fill-[#8C6D3B]" />
        </p>
      </footer>

      {/* MODAL QR CODE */}
      <AnimatePresence>
        {showQrModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-sm bg-[#FAF7F2] border border-[#C5A059] rounded-3xl p-6 text-center shadow-2xl overflow-hidden"
            >
              {/* Close Button */}
              <button
                onClick={() => setShowQrModal(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white border border-[#243119]/10 text-[#243119] hover:text-[#8C6D3B] hover:bg-[#FAF6EE] flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Fechar"
              >
                <X size={16} />
              </button>

              {/* Title */}
              <div className="mt-2 mb-4">
                <h2 
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                  className="text-2xl sm:text-3xl font-serif text-[#243119] font-normal"
                >
                  M★BRAVO | QR Code
                </h2>
                <p className="text-xs text-[#243119]/70 font-sans mt-1.5 max-w-[270px] mx-auto leading-relaxed">
                  Aponta a câmara do telemóvel para aceder diretamente a este cartão digital.
                </p>
              </div>

              {/* QR Frame */}
              <div className="relative my-4 mx-auto w-44 h-44 p-2 bg-white rounded-2xl shadow-xs border border-[#C5A059]/60 flex items-center justify-center overflow-hidden">
                <img 
                  src="/qr-code.webp" 
                  alt="QR Code M★BRAVO" 
                  className="w-full h-full object-contain rounded-xl"
                />
              </div>

              {/* Copy Link */}
              <button
                onClick={handleCopyModalLink}
                className="w-full py-2.5 px-4 rounded-xl bg-[#243119] hover:bg-[#1A2412] text-[#FAF8F5] text-xs font-sans font-medium flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs mt-2"
              >
                {modalCopied ? <Check size={14} className="text-[#C5A059]" /> : <Copy size={14} className="text-[#C5A059]" />}
                <span>{modalCopied ? 'Link Copiado!' : 'Copiar mbravobycarolina.com/card'}</span>
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Atelier Private Studio Modal */}
      <AtelierPrivateStudioModal
        isOpen={showPrivateStudioModal}
        onClose={() => setShowPrivateStudioModal(false)}
      />
    </div>
  );
};

export default DigitalBusinessCard;


