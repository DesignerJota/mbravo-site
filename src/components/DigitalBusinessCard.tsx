import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Download, 
  ShoppingBag, 
  Instagram, 
  MessageCircle, 
  Share2, 
  Check, 
  Sparkles, 
  ArrowLeft, 
  ShieldCheck, 
  Heart, 
  Star, 
  Compass, 
  Store, 
  Users,
  QrCode,
  X,
  Copy,
  Palette
} from 'lucide-react';
import AtelierPrivateStudioModal from './AtelierPrivateStudioModal';

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
        // User cancelled or share dismissed
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
        // User dismissed
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
    <div className="min-h-screen bg-[#121A0D] text-[#F5EEDC] flex flex-col items-center justify-between p-4 sm:p-6 md:p-10 relative overflow-hidden font-sans select-none">
      {/* Background radial atmosphere & luxury lighting */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(197,160,89,0.24)_0%,rgba(18,26,13,0.98)_65%)] pointer-events-none" />
      
      {/* Subtle organic noise overlay */}
      <div 
        className="absolute inset-0 opacity-[0.035] pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 250 250' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseBg'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.80' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseBg)'/%3E%3C/svg%3E")`
        }}
      />

      {/* Floating silk thread SVG graphic in background */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" viewBox="0 0 800 1200" fill="none">
        <path 
          d="M 100 -50 C 400 300, 700 100, 400 600 C 100 1100, 700 900, 850 1250" 
          stroke="url(#cardGoldGrad)" 
          strokeWidth="1" 
          strokeDasharray="4 8"
        />
        <defs>
          <linearGradient id="cardGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#C5A059" stopOpacity="0.1" />
            <stop offset="50%" stopColor="#C5A059" stopOpacity="0.85" />
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
          className="inline-flex items-center gap-2 text-[11px] sm:text-xs uppercase tracking-[0.2em] font-sans font-medium text-[#D4C3A3]/90 hover:text-[#C5A059] transition-colors py-2 px-3.5 rounded-full bg-white/5 hover:bg-white/10 backdrop-blur-md border border-[#C5A059]/25 cursor-pointer"
        >
          <ArrowLeft size={14} className="text-[#C5A059]" />
          <span>Voltar ao Site</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowQrModal(true)}
            className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs uppercase tracking-[0.18em] font-sans font-medium text-[#C5A059] hover:text-[#F5EEDC] transition-colors py-2 px-3 rounded-full bg-[#C5A059]/10 hover:bg-[#C5A059]/25 backdrop-blur-md border border-[#C5A059]/40 cursor-pointer"
            title="Mostrar QR Code de Partilha"
          >
            <QrCode size={14} className="text-[#C5A059]" />
            <span>QR Code</span>
          </button>

          <button
            onClick={handleShareCard}
            className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs uppercase tracking-[0.18em] font-sans font-medium text-[#D4C3A3]/90 hover:text-[#C5A059] transition-colors py-2 px-3 rounded-full bg-white/5 hover:bg-white/10 backdrop-blur-md border border-[#C5A059]/25 cursor-pointer"
            title="Partilhar Cartão Digital"
          >
            <Share2 size={14} className="text-[#C5A059]" />
            <span>{copied ? 'Copiado!' : 'Partilhar'}</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="w-full max-w-md flex flex-col items-center text-center z-10 my-auto py-2">
        {/* Carolina / Atelier Portrait Header */}
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative mb-4"
        >
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full p-1 bg-gradient-to-b from-[#C5A059] via-[#8F723B] to-[#1C2A15] shadow-[0_0_40px_rgba(197,160,89,0.3)]">
            <div className="w-full h-full rounded-full overflow-hidden border border-[#121A0D] bg-[#1C2A15] relative">
              <img 
                src="/story-1.webp" 
                alt="Carolina — M★BRAVO Atelier" 
                className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-700"
                onError={(e) => {
                  // Fallback to star emblem if image fails to render
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#121A0D]/40 via-transparent to-transparent pointer-events-none" />
            </div>
          </div>

          {/* Floating Brand Star Emblem */}
          <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[#1C2A15] border border-[#C5A059] text-[#C5A059] flex items-center justify-center text-sm shadow-md ring-2 ring-[#121A0D]">
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
            style={{ fontFamily: "'Cormorant Garamond', serif", letterSpacing: '0.08em' }}
            className="text-3xl sm:text-4xl font-normal text-[#F5EEDC] drop-shadow-[0_4px_16px_rgba(0,0,0,0.5)]"
          >
            Carolina <span className="text-[#C5A059] font-serif">|</span> M<span className="text-[#C5A059] mx-0.5">★</span>BRAVO
          </h1>
          <p className="text-[10px] uppercase tracking-[0.4em] text-[#C5A059] font-sans font-semibold mt-1">
            Fundadora & Designer
          </p>
        </motion.div>

        {/* Welcome Message Card (Mensagem de Boas-Vindas Pessoal) */}
        <motion.div
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.25, duration: 0.8 }}
          className="w-full bg-[#1C2A15]/60 border border-[#C5A059]/25 rounded-2xl p-4 sm:p-4.5 backdrop-blur-md mb-6 shadow-[0_8px_24px_rgba(0,0,0,0.3)] relative overflow-hidden text-left"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-[radial-gradient(circle_at_top_right,rgba(197,160,89,0.15),transparent_70%)] pointer-events-none" />
          <p 
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
            className="font-serif italic text-base sm:text-lg text-[#F5EEDC] leading-snug mb-2 antialiased"
          >
            &ldquo;Olá! Que bom ter-te por aqui. Cada peça M★BRAVO carrega tempo, intenção e alma. Leva-nos contigo.&rdquo;
          </p>
          <div className="flex items-center justify-between pt-2 border-t border-[#C5A059]/15">
            <span className="text-[10px] uppercase tracking-[0.3em] font-sans text-[#C5A059] font-medium">
              ✦ Carolina Bravo
            </span>
            <span className="font-serif italic text-xs text-[#D4C3A3]/80">
              Handmade in Portugal
            </span>
          </div>
        </motion.div>

        {/* Action Buttons List */}
        <div className="w-full flex flex-col gap-3 px-0.5">
          {/* 1. Guardar Contacto (vCard .vcf) */}
          <motion.button
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.35, duration: 0.7 }}
            onClick={handleDownloadVCard}
            className="group relative w-full py-3.5 px-4 sm:px-5 rounded-2xl bg-gradient-to-r from-[#C5A059] via-[#D4B06A] to-[#C5A059] text-[#121A0D] shadow-[0_8px_28px_rgba(197,160,89,0.3)] hover:shadow-[0_12px_36px_rgba(197,160,89,0.45)] transition-all duration-300 hover:scale-[1.015] active:scale-[0.985] cursor-pointer flex items-center justify-between text-left overflow-hidden"
          >
            <div className="flex items-center gap-3.5 z-10">
              <div className="w-10 h-10 rounded-xl bg-[#121A0D]/15 flex items-center justify-center shrink-0 border border-black/10">
                {vCardDownloaded ? <Check size={20} className="text-[#121A0D]" /> : <Download size={20} className="text-[#121A0D]" />}
              </div>
              <div>
                <span className="block text-[9px] uppercase tracking-[0.25em] font-sans font-extrabold text-[#121A0D]/75">
                  ✦ AGENDA DO TELEMÓVEL
                </span>
                <span className="block font-serif italic text-base sm:text-lg font-bold text-[#121A0D] leading-tight">
                  {vCardDownloaded ? 'Contacto Guardado na Agenda!' : 'Guardar Contacto (vCard)'}
                </span>
              </div>
            </div>
            <Sparkles size={18} className="text-[#121A0D]/80 group-hover:rotate-12 transition-transform shrink-0 z-10" />
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
          </motion.button>

          {/* 2. Explorar Coleção Online (Loja Principal) */}
          <motion.button
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.42, duration: 0.7 }}
            onClick={() => {
              if (onNavigateHome) {
                onNavigateHome();
              } else {
                window.location.href = '/#collection';
              }
            }}
            className="group relative w-full py-3.5 px-4 sm:px-5 rounded-2xl bg-[#1C2A15]/80 hover:bg-[#24361C]/90 backdrop-blur-xl border border-[#C5A059]/30 hover:border-[#C5A059] shadow-[0_4px_20px_rgba(0,0,0,0.3)] transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] cursor-pointer flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#C5A059]/10 border border-[#C5A059]/30 flex items-center justify-center shrink-0 text-[#C5A059] group-hover:bg-[#C5A059] group-hover:text-[#121A0D] transition-colors">
                <ShoppingBag size={18} />
              </div>
              <div>
                <span className="block text-[9px] uppercase tracking-[0.2em] font-sans font-semibold text-[#D4C3A3]/70">
                  CATÁLOGO & LOJA OFICIAL
                </span>
                <span className="block font-serif italic text-base sm:text-lg font-medium text-[#F5EEDC] group-hover:text-[#C5A059] transition-colors">
                  Explorar Coleção Online
                </span>
              </div>
            </div>
            <span className="text-[#C5A059] text-xs font-sans tracking-widest opacity-80 group-hover:translate-x-1 transition-transform">
              →
            </span>
          </motion.button>

          {/* 3. Atelier Private Studio (Co-Criação & Encomenda Sob Medida) */}
          <motion.button
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.46, duration: 0.7 }}
            onClick={() => setShowPrivateStudioModal(true)}
            className="group relative w-full py-3.5 px-4 sm:px-5 rounded-2xl bg-gradient-to-r from-[#1C2A15] via-[#2A3E20] to-[#1C2A15] hover:from-[#24361C] hover:to-[#24361C] backdrop-blur-xl border border-[#C5A059]/60 hover:border-[#C5A059] shadow-[0_4px_24px_rgba(197,160,89,0.2)] transition-all duration-300 hover:scale-[1.015] active:scale-[0.985] cursor-pointer flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-3.5 z-10">
              <div className="w-10 h-10 rounded-xl bg-[#C5A059]/20 border border-[#C5A059]/50 flex items-center justify-center shrink-0 text-[#C5A059] group-hover:bg-[#C5A059] group-hover:text-[#121A0D] transition-colors">
                <Palette size={18} />
              </div>
              <div>
                <span className="block text-[9px] uppercase tracking-[0.25em] font-sans font-extrabold text-[#C5A059]">
                  ✦ PRIVATE STUDIO & CO-CRIAÇÃO
                </span>
                <span className="block font-serif italic text-base sm:text-lg font-medium text-[#F5EEDC] group-hover:text-[#C5A059] transition-colors">
                  Criar Passaporte & Agendar Sessão
                </span>
              </div>
            </div>
            <Sparkles size={16} className="text-[#C5A059] group-hover:rotate-12 transition-transform shrink-0 z-10" />
          </motion.button>

          {/* 4. Atendimento Privado via WhatsApp */}
          <motion.a
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.52, duration: 0.7 }}
            href="https://wa.me/351912828182?text=Ol%C3%A1%20Carolina%2C%20gostaria%20de%20saber%20mais%20sobre%20as%20pe%C3%A7as%20M%E2%98%85BRAVO."
            target="_blank"
            rel="noopener noreferrer"
            className="group relative w-full py-3.5 px-4 sm:px-5 rounded-2xl bg-[#1C2A15]/80 hover:bg-[#24361C]/90 backdrop-blur-xl border border-[#C5A059]/30 hover:border-[#C5A059] shadow-[0_4px_20px_rgba(0,0,0,0.3)] transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] cursor-pointer flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#C5A059]/10 border border-[#C5A059]/30 flex items-center justify-center shrink-0 text-[#C5A059] group-hover:bg-[#C5A059] group-hover:text-[#121A0D] transition-colors">
                <MessageCircle size={18} />
              </div>
              <div>
                <span className="block text-[9px] uppercase tracking-[0.2em] font-sans font-semibold text-[#D4C3A3]/70">
                  ATENDIMENTO DIRETO
                </span>
                <span className="block font-serif italic text-base sm:text-lg font-medium text-[#F5EEDC] group-hover:text-[#C5A059] transition-colors">
                  Atendimento Privado via WhatsApp
                </span>
              </div>
            </div>
            <span className="text-[#C5A059] text-xs font-sans tracking-widest opacity-80 group-hover:translate-x-1 transition-transform">
              ↗
            </span>
          </motion.a>

          {/* 4. Instagram Oficial (@mbravobycarolina) */}
          <motion.a
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.56, duration: 0.7 }}
            href="https://www.instagram.com/mbravobycarolina/"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative w-full py-3.5 px-4 sm:px-5 rounded-2xl bg-[#1C2A15]/80 hover:bg-[#24361C]/90 backdrop-blur-xl border border-[#C5A059]/30 hover:border-[#C5A059] shadow-[0_4px_20px_rgba(0,0,0,0.3)] transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] cursor-pointer flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#C5A059]/10 border border-[#C5A059]/30 flex items-center justify-center shrink-0 text-[#C5A059] group-hover:bg-[#C5A059] group-hover:text-[#121A0D] transition-colors">
                <Instagram size={18} />
              </div>
              <div>
                <span className="block text-[9px] uppercase tracking-[0.2em] font-sans font-semibold text-[#D4C3A3]/70">
                  INSTAGRAM
                </span>
                <span className="block font-serif italic text-base sm:text-lg font-medium text-[#F5EEDC] group-hover:text-[#C5A059] transition-colors">
                  @mbravobycarolina
                </span>
              </div>
            </div>
            <span className="text-[#C5A059] text-xs font-sans tracking-widest opacity-80 group-hover:translate-x-1 transition-transform">
              ↗
            </span>
          </motion.a>

          {/* 5. Pinterest Oficial */}
          <motion.a
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.63, duration: 0.7 }}
            href="https://www.pinterest.com/mbravobycarolina/"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative w-full py-3.5 px-4 sm:px-5 rounded-2xl bg-[#1C2A15]/80 hover:bg-[#24361C]/90 backdrop-blur-xl border border-[#C5A059]/30 hover:border-[#C5A059] shadow-[0_4px_20px_rgba(0,0,0,0.3)] transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] cursor-pointer flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#C5A059]/10 border border-[#C5A059]/30 flex items-center justify-center shrink-0 text-[#C5A059] group-hover:bg-[#C5A059] group-hover:text-[#121A0D] transition-colors">
                <Compass size={18} />
              </div>
              <div>
                <span className="block text-[9px] uppercase tracking-[0.2em] font-sans font-semibold text-[#D4C3A3]/70">
                  INSPIRAÇÃO VISUAL
                </span>
                <span className="block font-serif italic text-base sm:text-lg font-medium text-[#F5EEDC] group-hover:text-[#C5A059] transition-colors">
                  Pinterest Oficial M★BRAVO
                </span>
              </div>
            </div>
            <span className="text-[#C5A059] text-xs font-sans tracking-widest opacity-80 group-hover:translate-x-1 transition-transform">
              ↗
            </span>
          </motion.a>

          {/* 6. Google / Avaliações & Perfil da Marca */}
          <motion.a
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.70, duration: 0.7 }}
            href="https://g.page/r/Cdo7JGP_Xpc3EBM/review"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative w-full py-3.5 px-4 sm:px-5 rounded-2xl bg-[#1C2A15]/80 hover:bg-[#24361C]/90 backdrop-blur-xl border border-[#C5A059]/30 hover:border-[#C5A059] shadow-[0_4px_20px_rgba(0,0,0,0.3)] transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] cursor-pointer flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#C5A059]/10 border border-[#C5A059]/30 flex items-center justify-center shrink-0 text-[#C5A059] group-hover:bg-[#C5A059] group-hover:text-[#121A0D] transition-colors">
                <Star size={18} />
              </div>
              <div>
                <span className="block text-[9px] uppercase tracking-[0.2em] font-sans font-semibold text-[#D4C3A3]/70">
                  PROVA SOCIAL & AVALIAÇÕES
                </span>
                <span className="block font-serif italic text-base sm:text-lg font-medium text-[#F5EEDC] group-hover:text-[#C5A059] transition-colors">
                  Perfil & Opiniões no Google
                </span>
              </div>
            </div>
            <span className="text-[#C5A059] text-xs font-sans tracking-widest opacity-80 group-hover:translate-x-1 transition-transform">
              ↗
            </span>
          </motion.a>

          {/* 8. Merchant / Feed & Loja de Produtos */}
          <motion.button
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.79, duration: 0.7 }}
            onClick={() => {
              if (onNavigateHome) {
                onNavigateHome();
              } else {
                window.location.href = '/#catalogo';
              }
            }}
            className="group relative w-full py-3.5 px-4 sm:px-5 rounded-2xl bg-[#1C2A15]/80 hover:bg-[#24361C]/90 backdrop-blur-xl border border-[#C5A059]/30 hover:border-[#C5A059] shadow-[0_4px_20px_rgba(0,0,0,0.3)] transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] cursor-pointer flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#C5A059]/10 border border-[#C5A059]/30 flex items-center justify-center shrink-0 text-[#C5A059] group-hover:bg-[#C5A059] group-hover:text-[#121A0D] transition-colors">
                <Store size={18} />
              </div>
              <div>
                <span className="block text-[9px] uppercase tracking-[0.2em] font-sans font-semibold text-[#D4C3A3]/70">
                  ENVIO NACIONAL & INTERNACIONAL
                </span>
                <span className="block font-serif italic text-base sm:text-lg font-medium text-[#F5EEDC] group-hover:text-[#C5A059] transition-colors">
                  Merchant / Catálogo de Peças
                </span>
              </div>
            </div>
            <span className="text-[#C5A059] text-xs font-sans tracking-widest opacity-80 group-hover:translate-x-1 transition-transform">
              →
            </span>
          </motion.button>

          {/* 9. Recomendar a um Amigo (Partilha do Cartão) */}
          <motion.button
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.86, duration: 0.7 }}
            onClick={handleRecommendToFriend}
            className="group relative w-full py-3.5 px-4 sm:px-5 rounded-2xl bg-gradient-to-r from-[#1C2A15] via-[#2A3E20] to-[#1C2A15] hover:from-[#24361C] hover:to-[#24361C] backdrop-blur-xl border border-[#C5A059]/50 hover:border-[#C5A059] shadow-[0_4px_20px_rgba(197,160,89,0.15)] transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] cursor-pointer flex items-center justify-between text-left mt-1"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#C5A059]/20 border border-[#C5A059]/40 flex items-center justify-center shrink-0 text-[#C5A059] group-hover:bg-[#C5A059] group-hover:text-[#121A0D] transition-colors">
                {recommendCopied ? <Check size={18} /> : <Users size={18} />}
              </div>
              <div>
                <span className="block text-[9px] uppercase tracking-[0.2em] font-sans font-bold text-[#C5A059]">
                  ✦ RECOMENDAÇÃO DE MARCA
                </span>
                <span className="block font-serif italic text-base sm:text-lg font-medium text-[#F5EEDC] group-hover:text-[#C5A059] transition-colors">
                  {recommendCopied ? 'Mensagem Copiada!' : 'Recomendar a um Amigo'}
                </span>
              </div>
            </div>
            <Share2 size={16} className="text-[#C5A059] group-hover:scale-110 transition-transform shrink-0" />
          </motion.button>
        </div>
      </main>

      {/* Footer Authenticity Badge */}
      <footer className="w-full max-w-md flex flex-col items-center gap-2 z-20 pb-2 mt-6">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] font-sans font-medium text-[#C5A059]/90 bg-white/5 py-1.5 px-4 rounded-full border border-[#C5A059]/25 backdrop-blur-md">
          <ShieldCheck size={12} className="text-[#C5A059]" />
          <span>M★BRAVO — Peças artesanais exclusivas</span>
        </div>
        <p className="text-[9px] font-sans uppercase tracking-[0.25em] text-[#D4C3A3]/60 flex items-center gap-1.5">
          <span>Handmade in Portugal</span>
          <span>•</span>
          <Heart size={9} className="text-[#C5A059] inline fill-[#C5A059]" />
          <span>Created with time</span>
        </p>
      </footer>

      {/* MODAL QR CODE "Conecta-te com a M★BRAVO" */}
      <AnimatePresence>
        {showQrModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-sm bg-[#121A0D] border border-[#C5A059]/50 rounded-3xl p-6 text-center shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden"
            >
              {/* Gold gradient glow effect */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-[radial-gradient(ellipse_at_top,rgba(197,160,89,0.3),transparent_70%)] pointer-events-none" />

              {/* Close Button */}
              <button
                onClick={() => setShowQrModal(false)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/5 border border-[#C5A059]/30 text-[#D4C3A3] hover:text-[#C5A059] hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Fechar Modal"
              >
                <X size={18} />
              </button>

              {/* Header Title */}
              <div className="mt-2 mb-4">
                <span className="text-[10px] uppercase tracking-[0.3em] font-sans font-semibold text-[#C5A059] block mb-1">
                  CARTÃO DE VISITA DIGITAL
                </span>
                <h2 
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                  className="text-2xl sm:text-3xl font-serif text-[#F5EEDC] font-normal"
                >
                  Conecta-te com a M★BRAVO
                </h2>
                <p className="text-xs text-[#D4C3A3]/70 font-sans mt-1.5 max-w-[270px] mx-auto leading-relaxed">
                  Aponta a câmara do teu telemóvel para o código para acederes aos contactos e à história do Atelier.
                </p>
              </div>

              {/* High Quality Official QR Code Frame */}
              <div className="relative my-5 mx-auto w-52 h-52 p-2.5 bg-white rounded-2xl shadow-[0_10px_30px_rgba(197,160,89,0.25)] border-2 border-[#C5A059] flex items-center justify-center overflow-hidden">
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
                  className="w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 border border-[#C5A059]/40 text-[#F5EEDC] text-xs font-sans font-medium flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  {modalCopied ? <Check size={14} className="text-[#C5A059]" /> : <Copy size={14} className="text-[#C5A059]" />}
                  <span>{modalCopied ? 'Link Copiado!' : 'Copiar mbravobycarolina.com/card'}</span>
                </button>
              </div>

              <p className="text-[10px] text-[#D4C3A3]/50 font-serif italic mt-3">
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

