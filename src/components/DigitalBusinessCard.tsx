import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Download, 
  ShoppingBag, 
  Instagram, 
  Share2, 
  Check, 
  Sparkles, 
  ArrowLeft, 
  ShieldCheck, 
  Heart, 
  Star, 
  Store, 
  Users,
  QrCode,
  X,
  Copy,
  Palette
} from 'lucide-react';
import AtelierPrivateStudioModal from './AtelierPrivateStudioModal';

// Official minimal SVG icons
const WhatsAppIcon = ({ size = 18, className = "" }: { size?: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984 0 1.758.459 3.474 1.33 4.982l-1.413 5.16 5.283-1.385c1.453.792 3.09 1.21 4.786 1.21 5.507 0 9.99-4.478 9.99-9.985 0-5.506-4.482-9.986-9.986-9.986zm5.82 14.123c-.242.684-1.22 1.305-1.996 1.385-.53.056-1.218.113-3.526-.838-2.951-1.215-4.858-4.225-5.006-4.422-.148-.196-1.202-1.603-1.202-3.056 0-1.453.757-2.17 1.028-2.464.271-.294.591-.368.788-.368.197 0 .394.002.566.01.182.008.428-.069.67.512.242.58.822 2.01.895 2.158.073.148.123.32.025.516-.098.196-.148.32-.295.492-.148.172-.31.384-.442.516-.148.148-.303.31-.131.606.172.295.766 1.265 1.644 2.046 1.128.998 2.082 1.312 2.378 1.459.295.148.468.123.64-.074.172-.197.738-.861.935-1.156.197-.295.394-.246.664-.148.271.098 1.722.812 2.018.96.295.148.492.221.566.344.074.123.074.713-.168 1.397z"/>
  </svg>
);

const PinterestIcon = ({ size = 18, className = "" }: { size?: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z"/>
  </svg>
);

const GoogleIcon = ({ size = 18, className = "" }: { size?: number, className?: string }) => (
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
  const [vCardDownloaded, setVCardDownloaded] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [modalCopied, setModalCopied] = useState(false);
  const [showPrivateStudioModal, setShowPrivateStudioModal] = useState(false);

  // 1. Validated vCard download (.vcf) formatted for iOS & Android Contacts
  const handleDownloadVCard = () => {
    const vcardData = `BEGIN:VCARD
VERSION:3.0
N:Bravo;Carolina;;;
FN:Carolina — M★BRAVO
ORG:M★BRAVO Atelier
TITLE:Fundadora & Designer
TEL;TYPE=CELL,VOICE;TYPE=pref:+351912828182
EMAIL:encomendas@mbravobycarolina.com
URL:https://mbravobycarolina.com/card
NOTE:Peças feitas com tempo\\, amor e memórias. Handmade in Portugal.
END:VCARD`;

    const blob = new Blob([vcardData], { type: 'text/vcard;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Carolina_MBRAVO.vcf');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setVCardDownloaded(true);
    setTimeout(() => setVCardDownloaded(false), 4000);
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

  // 3. Recommend to a friend action
  const handleRecommendToFriend = async () => {
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
    <div className="min-h-screen bg-[#FAF7F2] text-[#243119] flex flex-col items-center justify-between p-4 sm:p-6 md:p-10 relative overflow-hidden font-sans select-none antialiased">
      {/* Subtle luxury paper texture pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-multiply"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 250 250' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseBg'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseBg)'/%3E%3C/svg%3E")`
        }}
      />

      {/* Floating subtle silk accent curve */}
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

      {/* Top Navigation Bar */}
      <header className="w-full max-w-md flex items-center justify-between z-20 pt-2 mb-4 sm:mb-6">
        <button
          onClick={() => {
            if (onNavigateHome) {
              onNavigateHome();
            } else {
              window.location.href = '/';
            }
          }}
          className="inline-flex items-center gap-2 text-[11px] sm:text-xs uppercase tracking-[0.2em] font-sans font-medium text-[#243119]/80 hover:text-[#8C6D3B] transition-colors py-2 px-3.5 rounded-full bg-white/80 hover:bg-white backdrop-blur-md border border-[#243119]/10 shadow-xs cursor-pointer"
        >
          <ArrowLeft size={14} className="text-[#8C6D3B]" />
          <span>Voltar ao Site</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowQrModal(true)}
            className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs uppercase tracking-[0.18em] font-sans font-medium text-[#8C6D3B] hover:text-[#243119] transition-colors py-2 px-3 rounded-full bg-[#C5A059]/15 hover:bg-[#C5A059]/30 backdrop-blur-md border border-[#C5A059]/40 cursor-pointer"
            title="Mostrar QR Code de Partilha"
          >
            <QrCode size={14} className="text-[#8C6D3B]" />
            <span>QR Code</span>
          </button>

          <button
            onClick={handleShareCard}
            className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs uppercase tracking-[0.18em] font-sans font-medium text-[#243119]/80 hover:text-[#8C6D3B] transition-colors py-2 px-3 rounded-full bg-white/80 hover:bg-white backdrop-blur-md border border-[#243119]/10 shadow-xs cursor-pointer"
            title="Partilhar Cartão Digital"
          >
            <Share2 size={14} className="text-[#8C6D3B]" />
            <span>{copied ? 'Copiado!' : 'Partilhar'}</span>
          </button>
        </div>
      </header>

      {/* Main Digital Pass Container */}
      <main className="w-full max-w-md flex flex-col items-center text-center z-10 my-auto py-2">
        {/* Profile Hero Section */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative mb-3.5"
        >
          <div className="relative w-24 h-24 sm:w-26 sm:h-26 rounded-full p-1 bg-gradient-to-b from-[#C5A059] via-[#8C6D3B] to-[#C5A059]/40 shadow-sm">
            <div className="w-full h-full rounded-full overflow-hidden border border-[#FAF7F2] bg-[#EFE8D8] relative">
              <img 
                src="/story-1.webp" 
                alt="Carolina — M★BRAVO Atelier" 
                className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-700"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
          </div>

          {/* Floating Brand Star Badge */}
          <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#243119] border border-[#C5A059] text-[#C5A059] flex items-center justify-center text-xs shadow-md">
            ★
          </div>
        </motion.div>

        {/* Brand Name & Title */}
        <motion.div
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.8 }}
          className="mb-3"
        >
          <h1 
            style={{ fontFamily: "'Cormorant Garamond', serif", letterSpacing: '0.06em' }}
            className="text-3xl sm:text-4xl font-normal text-[#243119] leading-tight"
          >
            Carolina <span className="text-[#8C6D3B] font-serif">|</span> M<span className="text-[#8C6D3B] mx-0.5">★</span>BRAVO
          </h1>
          <p className="text-[10px] uppercase tracking-[0.35em] text-[#8C6D3B] font-sans font-semibold mt-1">
            Fundadora & Designer
          </p>
        </motion.div>

        {/* Welcome Editorial Note */}
        <motion.div
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.22, duration: 0.8 }}
          className="w-full bg-white/90 border border-[#C5A059]/30 rounded-2xl p-4 sm:p-4.5 shadow-sm mb-5 text-left relative overflow-hidden backdrop-blur-xs"
        >
          <div className="absolute top-0 right-0 w-20 h-20 bg-[radial-gradient(circle_at_top_right,rgba(197,160,89,0.12),transparent_70%)] pointer-events-none" />
          <p 
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
            className="font-serif italic text-base sm:text-lg text-[#243119] leading-snug mb-2 antialiased"
          >
            &ldquo;Olá! Que bom ter-te por aqui. Cada peça M★BRAVO carrega tempo, intenção e alma. Leva-nos contigo.&rdquo;
          </p>
          <div className="flex items-center justify-between pt-2 border-t border-[#C5A059]/20">
            <span className="text-[10px] uppercase tracking-[0.25em] font-sans text-[#8C6D3B] font-semibold">
              ✦ Carolina Bravo
            </span>
            <span className="font-serif italic text-xs text-[#243119]/60">
              Handmade in Portugal
            </span>
          </div>
        </motion.div>

        {/* Actions Block */}
        <div className="w-full flex flex-col gap-3">
          {/* 1. Cartão Destaque Topo: Guardar Contacto (vCard .vcf) */}
          <motion.button
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            onClick={handleDownloadVCard}
            className="group relative w-full py-3.5 px-4 sm:px-5 rounded-2xl bg-[#243119] hover:bg-[#1A2412] text-[#FAF8F5] shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] cursor-pointer flex items-center justify-between text-left overflow-hidden border border-[#243119]"
          >
            <div className="flex items-center gap-3.5 z-10">
              <div className="w-10 h-10 rounded-xl bg-[#C5A059] text-[#243119] flex items-center justify-center shrink-0 shadow-xs">
                {vCardDownloaded ? <Check size={20} /> : <Download size={20} />}
              </div>
              <div>
                <span className="block text-[9px] uppercase tracking-[0.25em] font-sans font-bold text-[#C5A059]">
                  ✦ AGENDA DO TELEMÓVEL
                </span>
                <span className="block font-serif italic text-base sm:text-lg font-medium text-[#FAF8F5] leading-tight">
                  {vCardDownloaded ? 'Contacto Guardado na Agenda!' : 'Guardar Contacto (vCard)'}
                </span>
              </div>
            </div>
            <Sparkles size={18} className="text-[#C5A059] group-hover:rotate-12 transition-transform shrink-0 z-10" />
            <div className="absolute inset-0 bg-white/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
          </motion.button>

          {/* 2. Bloco de Experiência: Personalizar Peça (Atelier Private Studio) */}
          <motion.button
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.38, duration: 0.7 }}
            onClick={() => setShowPrivateStudioModal(true)}
            className="group relative w-full py-3.5 px-4 sm:px-5 rounded-2xl bg-gradient-to-r from-[#F6F0E4] via-[#FFFDF9] to-[#F6F0E4] hover:from-[#EFE8D8] hover:to-[#EFE8D8] border border-[#C5A059] shadow-xs hover:shadow-md transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] cursor-pointer flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-3.5 z-10">
              <div className="w-10 h-10 rounded-xl bg-[#C5A059]/20 border border-[#C5A059]/40 flex items-center justify-center shrink-0 text-[#8C6D3B] group-hover:bg-[#C5A059] group-hover:text-[#243119] transition-colors">
                <Palette size={18} />
              </div>
              <div>
                <span className="block text-[9px] uppercase tracking-[0.25em] font-sans font-bold text-[#8C6D3B]">
                  ✦ ATELIER PRIVATE STUDIO
                </span>
                <span className="block font-serif italic text-base sm:text-lg font-medium text-[#243119] group-hover:text-[#8C6D3B] transition-colors">
                  Personalizar Peça (Passaporte)
                </span>
              </div>
            </div>
            <Sparkles size={16} className="text-[#8C6D3B] group-hover:rotate-12 transition-transform shrink-0 z-10" />
          </motion.button>

          {/* 3. Bloco Duplo (2 Colunas): Coleção Online & Catálogo de Peças */}
          <div className="grid grid-cols-2 gap-3">
            {/* Coleção Online */}
            <motion.button
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.44, duration: 0.7 }}
              onClick={() => {
                if (onNavigateHome) {
                  onNavigateHome();
                } else {
                  window.location.href = '/#collection';
                }
              }}
              className="group relative py-3.5 px-3.5 rounded-2xl bg-white hover:bg-[#FAF6EE] border border-[#243119]/10 hover:border-[#C5A059] shadow-xs transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] cursor-pointer flex flex-col items-start justify-between text-left min-h-[92px]"
            >
              <div className="w-8 h-8 rounded-lg bg-[#C5A059]/15 border border-[#C5A059]/30 flex items-center justify-center text-[#8C6D3B] group-hover:bg-[#8C6D3B] group-hover:text-white transition-colors mb-2">
                <ShoppingBag size={16} />
              </div>
              <div>
                <span className="block text-[8.5px] uppercase tracking-[0.2em] font-sans font-semibold text-[#8C6D3B]/80">
                  LOJA OFICIAL
                </span>
                <span className="block font-serif italic text-sm sm:text-base font-medium text-[#243119] leading-tight">
                  Coleção Online
                </span>
              </div>
            </motion.button>

            {/* Catálogo de Peças */}
            <motion.button
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.48, duration: 0.7 }}
              onClick={() => {
                if (onNavigateHome) {
                  onNavigateHome();
                } else {
                  window.location.href = '/#catalogo';
                }
              }}
              className="group relative py-3.5 px-3.5 rounded-2xl bg-white hover:bg-[#FAF6EE] border border-[#243119]/10 hover:border-[#C5A059] shadow-xs transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] cursor-pointer flex flex-col items-start justify-between text-left min-h-[92px]"
            >
              <div className="w-8 h-8 rounded-lg bg-[#C5A059]/15 border border-[#C5A059]/30 flex items-center justify-center text-[#8C6D3B] group-hover:bg-[#8C6D3B] group-hover:text-white transition-colors mb-2">
                <Store size={16} />
              </div>
              <div>
                <span className="block text-[8.5px] uppercase tracking-[0.2em] font-sans font-semibold text-[#8C6D3B]/80">
                  CATÁLOGO
                </span>
                <span className="block font-serif italic text-sm sm:text-base font-medium text-[#243119] leading-tight">
                  Catálogo de Peças
                </span>
              </div>
            </motion.button>
          </div>

          {/* 4. Canais Diretos (Lista Limpa & Minimalista) */}
          <div className="flex flex-col gap-2.5 mt-1">
            {/* WhatsApp */}
            <motion.a
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.54, duration: 0.7 }}
              href="https://wa.me/351912828182?text=Ol%C3%A1%20Carolina%2C%20gostaria%20de%20saber%20mais%20sobre%20as%20pe%C3%A7as%20M%E2%98%85BRAVO."
              target="_blank"
              rel="noopener noreferrer"
              className="group relative w-full py-3 px-4 rounded-2xl bg-white hover:bg-[#FAF6EE] border border-[#243119]/10 hover:border-[#C5A059] shadow-xs transition-all duration-300 hover:scale-[1.005] active:scale-[0.995] cursor-pointer flex items-center justify-between text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#25D366]/10 border border-[#25D366]/30 flex items-center justify-center text-[#128C7E] shrink-0">
                  <WhatsAppIcon size={16} />
                </div>
                <div>
                  <span className="block text-[8.5px] uppercase tracking-[0.2em] font-sans font-semibold text-[#243119]/50">
                    ATENDIMENTO DIRETO
                  </span>
                  <span className="block font-serif italic text-sm sm:text-base font-medium text-[#243119] group-hover:text-[#8C6D3B] transition-colors">
                    WhatsApp Privado (+351 912 828 182)
                  </span>
                </div>
              </div>
              <span className="text-[#8C6D3B] text-xs font-sans tracking-widest opacity-80 group-hover:translate-x-1 transition-transform">
                ↗
              </span>
            </motion.a>

            {/* Instagram */}
            <motion.a
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.58, duration: 0.7 }}
              href="https://www.instagram.com/mbravobycarolina/"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative w-full py-3 px-4 rounded-2xl bg-white hover:bg-[#FAF6EE] border border-[#243119]/10 hover:border-[#C5A059] shadow-xs transition-all duration-300 hover:scale-[1.005] active:scale-[0.995] cursor-pointer flex items-center justify-between text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#E4405F]/10 border border-[#E4405F]/30 flex items-center justify-center text-[#E4405F] shrink-0">
                  <Instagram size={16} />
                </div>
                <div>
                  <span className="block text-[8.5px] uppercase tracking-[0.2em] font-sans font-semibold text-[#243119]/50">
                    INSTAGRAM
                  </span>
                  <span className="block font-serif italic text-sm sm:text-base font-medium text-[#243119] group-hover:text-[#8C6D3B] transition-colors">
                    @mbravobycarolina
                  </span>
                </div>
              </div>
              <span className="text-[#8C6D3B] text-xs font-sans tracking-widest opacity-80 group-hover:translate-x-1 transition-transform">
                ↗
              </span>
            </motion.a>

            {/* Pinterest */}
            <motion.a
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.62, duration: 0.7 }}
              href="https://www.pinterest.com/mbravobycarolina/"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative w-full py-3 px-4 rounded-2xl bg-white hover:bg-[#FAF6EE] border border-[#243119]/10 hover:border-[#C5A059] shadow-xs transition-all duration-300 hover:scale-[1.005] active:scale-[0.995] cursor-pointer flex items-center justify-between text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#BD081C]/10 border border-[#BD081C]/30 flex items-center justify-center text-[#BD081C] shrink-0">
                  <PinterestIcon size={16} />
                </div>
                <div>
                  <span className="block text-[8.5px] uppercase tracking-[0.2em] font-sans font-semibold text-[#243119]/50">
                    INSPIRAÇÃO VISUAL
                  </span>
                  <span className="block font-serif italic text-sm sm:text-base font-medium text-[#243119] group-hover:text-[#8C6D3B] transition-colors">
                    Pinterest Oficial M★BRAVO
                  </span>
                </div>
              </div>
              <span className="text-[#8C6D3B] text-xs font-sans tracking-widest opacity-80 group-hover:translate-x-1 transition-transform">
                ↗
              </span>
            </motion.a>

            {/* Google / Avaliações */}
            <motion.a
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.66, duration: 0.7 }}
              href="https://g.page/r/Cdo7JGP_Xpc3EBM/review"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative w-full py-3 px-4 rounded-2xl bg-white hover:bg-[#FAF6EE] border border-[#243119]/10 hover:border-[#C5A059] shadow-xs transition-all duration-300 hover:scale-[1.005] active:scale-[0.995] cursor-pointer flex items-center justify-between text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#4285F4]/10 border border-[#4285F4]/30 flex items-center justify-center text-[#4285F4] shrink-0">
                  <GoogleIcon size={16} />
                </div>
                <div>
                  <span className="block text-[8.5px] uppercase tracking-[0.2em] font-sans font-semibold text-[#243119]/50">
                    PROVA SOCIAL
                  </span>
                  <span className="block font-serif italic text-sm sm:text-base font-medium text-[#243119] group-hover:text-[#8C6D3B] transition-colors">
                    Perfil & Avaliações no Google
                  </span>
                </div>
              </div>
              <span className="text-[#8C6D3B] text-xs font-sans tracking-widest opacity-80 group-hover:translate-x-1 transition-transform">
                ↗
              </span>
            </motion.a>
          </div>

          {/* 5. Ação Viral: Recomendar a um Amigo / Partilhar Cartão */}
          <motion.button
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.72, duration: 0.7 }}
            onClick={handleRecommendToFriend}
            className="group relative w-full py-3.5 px-4 rounded-2xl bg-[#EFE8D8] hover:bg-[#E5DDCB] border border-[#C5A059]/40 text-[#243119] transition-all duration-300 hover:scale-[1.005] active:scale-[0.995] cursor-pointer flex items-center justify-between text-left mt-1"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-[#C5A059]/25 border border-[#C5A059]/50 flex items-center justify-center shrink-0 text-[#8C6D3B]">
                {recommendCopied ? <Check size={16} /> : <Users size={16} />}
              </div>
              <div>
                <span className="block text-[8.5px] uppercase tracking-[0.2em] font-sans font-bold text-[#8C6D3B]">
                  ✦ AÇÃO VIRAL DE RECOMENDAÇÃO
                </span>
                <span className="block font-serif italic text-sm sm:text-base font-medium text-[#243119]">
                  {recommendCopied ? 'Mensagem Copiada!' : 'Recomendar a um Amigo (Partilhar)'}
                </span>
              </div>
            </div>
            <Share2 size={16} className="text-[#8C6D3B] group-hover:scale-110 transition-transform shrink-0" />
          </motion.button>
        </div>
      </main>

      {/* Footer Authenticity Badge */}
      <footer className="w-full max-w-md flex flex-col items-center gap-2 z-20 pb-2 mt-6">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] font-sans font-medium text-[#8C6D3B] bg-white/80 py-1.5 px-4 rounded-full border border-[#C5A059]/30 shadow-xs backdrop-blur-md">
          <ShieldCheck size={12} className="text-[#8C6D3B]" />
          <span>M★BRAVO — Peças artesanais exclusivas</span>
        </div>
        <p className="text-[9px] font-sans uppercase tracking-[0.25em] text-[#243119]/50 flex items-center gap-1.5">
          <span>Handmade in Portugal</span>
          <span>•</span>
          <Heart size={9} className="text-[#8C6D3B] inline fill-[#8C6D3B]" />
          <span>Created with time</span>
        </p>
      </footer>

      {/* MODAL QR CODE "Conecta-te com a M★BRAVO" */}
      <AnimatePresence>
        {showQrModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm">
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
                aria-label="Fechar Modal"
              >
                <X size={16} />
              </button>

              {/* Header Title */}
              <div className="mt-2 mb-4">
                <span className="text-[10px] uppercase tracking-[0.3em] font-sans font-semibold text-[#8C6D3B] block mb-1">
                  CARTÃO DE VISITA DIGITAL
                </span>
                <h2 
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                  className="text-2xl sm:text-3xl font-serif text-[#243119] font-normal"
                >
                  Conecta-te com a M★BRAVO
                </h2>
                <p className="text-xs text-[#243119]/70 font-sans mt-1.5 max-w-[270px] mx-auto leading-relaxed">
                  Aponta a câmara do teu telemóvel para o código para acederes aos contactos e à história do Atelier.
                </p>
              </div>

              {/* High Quality Official QR Code Frame */}
              <div className="relative my-5 mx-auto w-48 h-48 p-2.5 bg-white rounded-2xl shadow-sm border border-[#C5A059]/60 flex items-center justify-center overflow-hidden">
                <img 
                  src="/qr-code.webp" 
                  alt="QR Code M★BRAVO" 
                  className="w-full h-full object-contain rounded-xl"
                />
              </div>

              {/* Direct Link Copy Button */}
              <div className="flex items-center justify-center gap-2 mt-4">
                <button
                  onClick={handleCopyModalLink}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#243119] hover:bg-[#1A2412] text-[#FAF8F5] text-xs font-sans font-medium flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
                >
                  {modalCopied ? <Check size={14} className="text-[#C5A059]" /> : <Copy size={14} className="text-[#C5A059]" />}
                  <span>{modalCopied ? 'Link Copiado!' : 'Copiar mbravobycarolina.com/card'}</span>
                </button>
              </div>

              <p className="text-[10px] text-[#243119]/50 font-serif italic mt-3">
                M★BRAVO — Peças feitas com tempo, amor e memórias.
              </p>
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


