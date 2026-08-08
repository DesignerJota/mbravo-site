import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Sparkles, 
  Check, 
  Clock, 
  MessageCircle, 
  ShieldCheck, 
  Palette, 
  Eye,
  Sliders,
  Layers
} from 'lucide-react';

interface AtelierPrivateStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Yarns / Palettes of luxury cotton
const YARN_PALETTES = [
  { id: 'cru-natural', name: 'Cru Natural & Areia', hex: '#EAE3D2', borderHex: '#D4C3A3', desc: 'Fio de algodão virgem não tingido, textura orgânica e toque macio.' },
  { id: 'verde-floresta', name: 'Verde Floresta M★BRAVO', hex: '#1C2A15', borderHex: '#8F723B', desc: 'A cor de assinatura do Atelier. Profunda, nobre e atemporal.' },
  { id: 'terracota-sol', name: 'Terracota Sólido & Âmbar', hex: '#A8583B', borderHex: '#C5A059', desc: 'Pigmentação mineral calorosa inspirada na luz do entardecer.' },
  { id: 'azul-marea', name: 'Azul Marea Profundo', hex: '#1E3A4C', borderHex: '#3B6B88', desc: 'Tom oceânico suave com reflexos aveludados em malha fechada.' },
  { id: 'ouro-atelier', name: 'Creme Dourado & Mostarda', hex: '#D4B06A', borderHex: '#C5A059', desc: 'Toque de luminosidade artesanal para peças de festa e edições únicas.' }
];

// Product Types for Custom Order
const CUSTOM_PIECE_TYPES = [
  { id: 'pouch-mala', name: 'Mala / Pouch Autoral', baseHours: 18, baseEstimate: '45€ - 85€', leadTime: '10-15 dias úteis' },
  { id: 'cardigan-vestuario', name: 'Cardigan / Peça de Vestuário', baseHours: 35, baseEstimate: '95€ - 165€', leadTime: '15-20 dias úteis' },
  { id: 'poncho-acessorio', name: 'Poncho / Acessório Nobre', baseHours: 22, baseEstimate: '55€ - 95€', leadTime: '10-15 dias úteis' },
  { id: 'casa-decor', name: 'Decor / Peça por Medida para a Casa', baseHours: 12, baseEstimate: '35€ - 75€', leadTime: '7-12 dias úteis' }
];

// Finishing details
const HARDWARE_OPTIONS = [
  { id: 'fecho-imantado', name: 'Fecho Íman Oculto & Botão Madeira' },
  { id: 'zip-metal', name: 'Fecho Zíper Metálico Dourado com Forro' },
  { id: 'alca-crochet', name: 'Alça em Crochet Manual Continuo' },
  { id: 'alca-pele', name: 'Alça em Pele Genuína Removível' }
];

// Dynamic Multi-Zone Vector SVG Renderer
const PieceVisualizerSVG: React.FC<{
  pieceId: string;
  primaryYarn: typeof YARN_PALETTES[0];
  secondaryYarn: typeof YARN_PALETTES[0];
  isBicolor: boolean;
  hardware: typeof HARDWARE_OPTIONS[0];
}> = ({ pieceId, primaryYarn, secondaryYarn, isBicolor, hardware }) => {
  const pColor = primaryYarn.hex;
  const sColor = isBicolor ? secondaryYarn.hex : primaryYarn.hex;

  return (
    <div className="relative w-full aspect-[4/3] bg-[#0E150B] border border-[#C5A059]/30 rounded-2xl overflow-hidden flex items-center justify-center shadow-inner group">
      {/* Background Subtle Luxury Glow */}
      <div 
        className="absolute inset-0 opacity-20 transition-all duration-700 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${pColor} 0%, transparent 70%)`
        }}
      />

      <svg 
        viewBox="0 0 300 240" 
        className="w-full h-full max-h-[220px] drop-shadow-[0_10px_20px_rgba(0,0,0,0.6)] transition-all duration-500"
      >
        <defs>
          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D4B06A" />
            <stop offset="50%" stopColor="#C5A059" />
            <stop offset="100%" stopColor="#8F723B" />
          </linearGradient>

          {/* Crochet Texture Pattern */}
          <pattern id="crochetTexture" width="12" height="12" patternUnits="userSpaceOnUse">
            <path d="M 0 6 Q 6 0 12 6 Q 6 12 0 6 Z" fill="none" stroke="rgba(0,0,0,0.12)" strokeWidth="0.8" />
          </pattern>
        </defs>

        {/* 1. MALA / POUCH AUTORAL */}
        {pieceId === 'pouch-mala' && (
          <g className="transition-all duration-500">
            {/* Handle / Strap */}
            {hardware.id === 'alca-pele' ? (
              <path 
                d="M 105 80 C 105 25, 195 25, 195 80" 
                fill="none" 
                stroke="#5C3A21" 
                strokeWidth="7" 
                strokeLinecap="round" 
              />
            ) : (
              <path 
                d="M 105 80 C 105 20, 195 20, 195 80" 
                fill="none" 
                stroke={sColor} 
                strokeWidth="8" 
                strokeDasharray="4 2" 
                strokeLinecap="round" 
              />
            )}

            {/* Main Pouch Body (Zone 1) */}
            <rect 
              x="70" 
              y="80" 
              width="160" 
              height="115" 
              rx="20" 
              fill={pColor} 
              stroke="#0B1008" 
              strokeWidth="2.5" 
            />
            {/* Crochet Texture Overlay */}
            <rect x="70" y="80" width="160" height="115" rx="20" fill="url(#crochetTexture)" />

            {/* Flap / Accent Band (Zone 2 - Secondary Color if Bicolor) */}
            <path 
              d="M 70 110 Q 150 155 230 110 L 230 80 Q 150 68 70 80 Z" 
              fill={sColor} 
              stroke="#0B1008" 
              strokeWidth="2" 
            />
            <path d="M 70 110 Q 150 155 230 110 L 230 80 Q 150 68 70 80 Z" fill="url(#crochetTexture)" />

            {/* Closure Hardware */}
            {hardware.id === 'zip-metal' ? (
              <rect x="75" y="77" width="150" height="5" rx="2.5" fill="url(#goldGradient)" />
            ) : (
              <circle cx="150" cy="118" r="8" fill="url(#goldGradient)" stroke="#5C3A21" strokeWidth="1.5" />
            )}
          </g>
        )}

        {/* 2. CARDIGAN / VESTUÁRIO */}
        {pieceId === 'cardigan-vestuario' && (
          <g className="transition-all duration-500">
            {/* Main Torso & Sleeves (Zone 1 - Primary Color) */}
            <path 
              d="M 85 65 L 120 65 L 150 85 L 180 65 L 215 65 L 225 190 L 75 190 Z" 
              fill={pColor} 
              stroke="#0B1008" 
              strokeWidth="2.5" 
            />
            {/* Left Sleeve */}
            <path d="M 85 65 L 48 130 L 75 140 L 98 88 Z" fill={pColor} stroke="#0B1008" strokeWidth="2" />
            {/* Right Sleeve */}
            <path d="M 215 65 L 252 130 L 225 140 L 202 88 Z" fill={pColor} stroke="#0B1008" strokeWidth="2" />

            {/* Knit Texture Overlay */}
            <path 
              d="M 85 65 L 120 65 L 150 85 L 180 65 L 215 65 L 225 190 L 75 190 Z" 
              fill="url(#crochetTexture)" 
            />

            {/* Ribbed Collar & Placket (Zone 2 - Secondary Color if Bicolor) */}
            <path 
              d="M 120 65 L 150 108 L 180 65 L 162 190 L 138 190 Z" 
              fill={sColor} 
              stroke="#0B1008" 
              strokeWidth="1.5" 
            />
            {/* Cuffs */}
            <rect x="48" y="128" width="27" height="12" rx="3" fill={sColor} stroke="#0B1008" strokeWidth="1" />
            <rect x="225" y="128" width="27" height="12" rx="3" fill={sColor} stroke="#0B1008" strokeWidth="1" />
            {/* Bottom Hem */}
            <rect x="75" y="180" width="150" height="10" rx="3" fill={sColor} stroke="#0B1008" strokeWidth="1" />

            {/* Buttons */}
            <circle cx="150" cy="125" r="4.5" fill="#8F5C38" stroke="url(#goldGradient)" strokeWidth="1" />
            <circle cx="150" cy="148" r="4.5" fill="#8F5C38" stroke="url(#goldGradient)" strokeWidth="1" />
            <circle cx="150" cy="171" r="4.5" fill="#8F5C38" stroke="url(#goldGradient)" strokeWidth="1" />
          </g>
        )}

        {/* 3. PONCHO / ACESSÓRIO NOBRE */}
        {pieceId === 'poncho-acessorio' && (
          <g className="transition-all duration-500">
            {/* Main Draped Cape Body (Zone 1) */}
            <path 
              d="M 150 45 L 248 155 L 150 205 L 52 155 Z" 
              fill={pColor} 
              stroke="#0B1008" 
              strokeWidth="2.5" 
            />
            <path d="M 150 45 L 248 155 L 150 205 L 52 155 Z" fill="url(#crochetTexture)" />

            {/* Neck Collar (Zone 2 if Bicolor) */}
            <path 
              d="M 122 45 C 132 68, 168 68, 178 45 Z" 
              fill={sColor} 
              stroke="#0B1008" 
              strokeWidth="1.5" 
            />

            {/* Bottom Fringe Border (Zone 2 if Bicolor) */}
            <path 
              d="M 52 155 L 150 205 L 248 155 L 242 166 L 150 216 L 58 166 Z" 
              fill={sColor} 
              stroke="#0B1008" 
              strokeWidth="1.5" 
            />

            {/* Star Brooch at Neck */}
            <polygon points="150,52 152.5,58 158,58 153.5,61 155.5,67 150,63 144.5,67 146.5,61 142,58 147.5,58" fill="url(#goldGradient)" />
          </g>
        )}

        {/* 4. DECOR / PEÇA PARA A CASA */}
        {pieceId === 'casa-decor' && (
          <g className="transition-all duration-500">
            {/* Outer Frame (Zone 2 if Bicolor) */}
            <rect 
              x="60" 
              y="40" 
              width="180" 
              height="155" 
              rx="18" 
              fill={sColor} 
              stroke="#0B1008" 
              strokeWidth="2.5" 
            />
            {/* Inner Center Cushion/Throw (Zone 1) */}
            <rect 
              x="82" 
              y="60" 
              width="136" 
              height="115" 
              rx="10" 
              fill={pColor} 
              stroke="#0B1008" 
              strokeWidth="1.5" 
            />
            <rect x="82" y="60" width="136" height="115" rx="10" fill="url(#crochetTexture)" />

            {/* Corner Tassels */}
            <circle cx="60" cy="40" r="6" fill="url(#goldGradient)" />
            <circle cx="240" cy="40" r="6" fill="url(#goldGradient)" />
            <circle cx="60" cy="195" r="6" fill="url(#goldGradient)" />
            <circle cx="240" cy="195" r="6" fill="url(#goldGradient)" />
          </g>
        )}
      </svg>

      {/* Floating Tag Overlay */}
      <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[10px] font-mono bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-cream">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full border" style={{ backgroundColor: pColor }} />
          <span className="text-[#D4C3A3] font-sans font-medium line-clamp-1">
            {isBicolor ? `Corpo: ${primaryYarn.name.split(' ')[0]}` : primaryYarn.name}
          </span>
        </div>
        {isBicolor && (
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full border" style={{ backgroundColor: sColor }} />
            <span className="text-[#C5A059] font-sans font-medium line-clamp-1">
              Destaque: {secondaryYarn.name.split(' ')[0]}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export const AtelierPrivateStudioModal: React.FC<AtelierPrivateStudioModalProps> = ({
  isOpen,
  onClose
}) => {
  const [selectedPiece, setSelectedPiece] = useState(CUSTOM_PIECE_TYPES[0]);
  const [primaryYarn, setPrimaryYarn] = useState(YARN_PALETTES[1]); // Verde Floresta
  const [secondaryYarn, setSecondaryYarn] = useState(YARN_PALETTES[0]); // Cru Natural
  const [isBicolor, setIsBicolor] = useState(true); // Default to Bicolor multi-zone for rich customization
  const [selectedHardware, setSelectedHardware] = useState(HARDWARE_OPTIONS[0]);
  const [customNotes, setCustomNotes] = useState('');
  const [clientName, setClientName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  if (!isOpen) return null;

  // Palette string representation
  const paletteText = isBicolor 
    ? `${primaryYarn.name} (Corpo) + ${secondaryYarn.name} (Destaque)`
    : primaryYarn.name;

  // Generate creative passports text for WhatsApp
  const generateWhatsAppMessage = () => {
    const namePart = clientName.trim() ? `O meu nome é ${clientName.trim()}. ` : '';
    const notesPart = customNotes.trim() ? ` | Notas: "${customNotes.trim()}"` : '';
    
    return `Olá Carolina! ${namePart}Criei o meu Passaporte Criativo M★BRAVO no Private Studio:
✦ Peça: ${selectedPiece.name}
✦ Paleta (${isBicolor ? 'Bicolor Multi-Zona' : 'Monocolor'}): ${paletteText}
✦ Detalhes/Acabamento: ${selectedHardware.name}
✦ Dedicação Estimada: ~${selectedPiece.baseHours}h de confeção manual (${selectedPiece.baseEstimate})${notesPart}

Gostaria de agendar a minha sessão privada de design com a Carolina.`;
  };

  const handleReserveSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const passaporteCriativo = {
      timestamp: new Date().toISOString(),
      clientName: clientName.trim() || 'Cliente M★BRAVO',
      pieceType: selectedPiece.name,
      yarnPalette: paletteText,
      primaryYarn: primaryYarn.name,
      secondaryYarn: isBicolor ? secondaryYarn.name : '',
      isBicolor: isBicolor,
      hardware: selectedHardware.name,
      estimatedHours: selectedPiece.baseHours,
      estimatedPrice: selectedPiece.baseEstimate,
      notes: customNotes.trim()
    };

    // 1. Save in backend persistent store & localStorage
    try {
      fetch('/api/private-studio/passports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(passaporteCriativo)
      }).catch(err => console.warn('[PRIVATE STUDIO API] Non-blocking submit notice:', err));

      const existing = JSON.parse(localStorage.getItem('mbravo_creative_passports') || '[]');
      existing.unshift(passaporteCriativo);
      localStorage.setItem('mbravo_creative_passports', JSON.stringify(existing.slice(0, 20)));
    } catch (err) {
      console.warn('[PRIVATE STUDIO] Local storage save notice:', err);
    }

    // 2. Open WhatsApp with structured message
    const message = generateWhatsAppMessage();
    const whatsappUrl = `https://wa.me/351912828182?text=${encodeURIComponent(message)}`;

    setIsSubmitting(false);
    setBookingSuccess(true);

    setTimeout(() => {
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    }, 400);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 md:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 280 }}
          className="relative w-full max-w-4xl bg-[#121A0D] border border-[#C5A059]/50 rounded-3xl p-5 sm:p-7 text-[#F5EEDC] shadow-[0_25px_60px_rgba(0,0,0,0.85)] z-10 overflow-hidden my-auto max-h-[92vh] flex flex-col justify-between"
        >
          {/* Ambient Lighting Accent */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-[radial-gradient(ellipse_at_top_right,rgba(197,160,89,0.18),transparent_70%)] pointer-events-none" />

          {/* Header */}
          <div className="flex items-start justify-between gap-4 border-b border-[#C5A059]/20 pb-4 shrink-0">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C5A059]/10 border border-[#C5A059]/30 text-[#C5A059] text-[10px] uppercase tracking-[0.25em] font-semibold mb-1.5">
                <Sparkles size={12} />
                <span>Configurador Visual & Co-Criação Exclusiva</span>
              </div>
              <h2 
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
                className="text-2xl sm:text-3xl text-[#F5EEDC] font-normal leading-none"
              >
                Atelier Private Studio
              </h2>
              <p className="text-xs text-[#D4C3A3]/80 font-sans mt-1">
                Customize a sua peça com o simulador visual dinâmico e agende uma consultoria privada com Carolina Bravo.
              </p>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/5 border border-[#C5A059]/30 text-[#D4C3A3] hover:text-[#C5A059] hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer shrink-0"
              aria-label="Fechar Modal"
            >
              <X size={18} />
            </button>
          </div>

          {/* Modal Body - Scrollable 2-Column Grid */}
          <div className="overflow-y-auto my-4 pr-1 space-y-6 flex-1 custom-scrollbar">
            {bookingSuccess ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-12 text-center space-y-4"
              >
                <div className="w-16 h-16 rounded-full bg-[#C5A059]/20 border border-[#C5A059] text-[#C5A059] flex items-center justify-center mx-auto text-2xl shadow-lg">
                  ★
                </div>
                <h3 
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                  className="text-2xl sm:text-3xl text-[#F5EEDC]"
                >
                  Passaporte Criativo Registado
                </h3>
                <p className="text-sm text-[#D4C3A3]/90 max-w-md mx-auto leading-relaxed">
                  A abrir a conversa com o Atelier no WhatsApp... A Carolina Bravo está à sua espera para definir os pormenores da sua peça sob medida.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => {
                      setBookingSuccess(false);
                      onClose();
                    }}
                    className="py-2.5 px-6 rounded-full bg-[#C5A059] text-[#121A0D] text-xs uppercase tracking-widest font-bold hover:bg-[#D4B06A] transition-colors cursor-pointer"
                  >
                    Concluir & Fechar
                  </button>
                </div>
              </motion.div>
            ) : (
              <form id="private-studio-form" onSubmit={handleReserveSession} className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                
                {/* LEFT COLUMN: DYNAMIC VISUAL PREVIEW MOCKUP */}
                <div className="md:col-span-5 space-y-3 md:sticky md:top-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-[0.2em] font-sans font-bold text-[#C5A059] flex items-center gap-1.5">
                      <Eye size={12} />
                      Simulação Visual em Tempo Real
                    </span>
                    <span className="text-[9px] uppercase tracking-wider text-[#D4C3A3]/60 font-mono">
                      {isBicolor ? 'Bicolor' : 'Monocolor'}
                    </span>
                  </div>

                  {/* Visualizer Canvas */}
                  <PieceVisualizerSVG 
                    pieceId={selectedPiece.id}
                    primaryYarn={primaryYarn}
                    secondaryYarn={secondaryYarn}
                    isBicolor={isBicolor}
                    hardware={selectedHardware}
                  />

                  {/* Real-time Summary Badge */}
                  <div className="bg-[#1C2A15]/80 border border-[#C5A059]/30 rounded-2xl p-3.5 space-y-2 backdrop-blur-md text-left">
                    <div className="flex items-center justify-between border-b border-[#C5A059]/20 pb-2">
                      <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#C5A059] flex items-center gap-1.5">
                        <ShieldCheck size={14} />
                        Especificações da Peça
                      </span>
                      <span className="text-[10px] font-mono text-[#D4C3A3]/70">
                        {selectedPiece.name.split(' ')[0]}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="block text-[9px] uppercase tracking-wider text-[#D4C3A3]/60">Dedicação</span>
                        <span className="font-serif italic font-bold text-[#F5EEDC]">~{selectedPiece.baseHours} Horas Manuais</span>
                      </div>
                      <div>
                        <span className="block text-[9px] uppercase tracking-wider text-[#D4C3A3]/60">Estimativa</span>
                        <span className="font-serif italic font-bold text-[#C5A059]">{selectedPiece.baseEstimate}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN: INTERACTIVE CONTROLS */}
                <div className="md:col-span-7 space-y-5 text-left">
                  
                  {/* 1. Escolha do Tipo de Peça */}
                  <div>
                    <label className="block text-[11px] uppercase tracking-[0.2em] font-sans font-bold text-[#C5A059] mb-2">
                      1. Selecione a Tipologia de Peça
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {CUSTOM_PIECE_TYPES.map((piece) => {
                        const isSelected = selectedPiece.id === piece.id;
                        return (
                          <div
                            key={piece.id}
                            onClick={() => setSelectedPiece(piece)}
                            className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-[#1C2A15] border-[#C5A059] ring-1 ring-[#C5A059] shadow-md'
                                : 'bg-white/5 border-white/10 hover:border-[#C5A059]/40'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-serif italic text-sm text-[#F5EEDC] font-semibold">
                                {piece.name}
                              </span>
                              {isSelected && <Check size={14} className="text-[#C5A059]" />}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-[#D4C3A3]/70 font-sans mt-1">
                              <span className="flex items-center gap-1">
                                <Clock size={10} className="text-[#C5A059]" /> ~{piece.baseHours}h
                              </span>
                              <span>•</span>
                              <span>{piece.baseEstimate}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 2. Toggle Modo de Cor (Monocolor vs Bicolor) */}
                  <div className="bg-white/5 p-3 rounded-2xl border border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] uppercase tracking-[0.2em] font-sans font-bold text-[#C5A059] flex items-center gap-1.5">
                        <Layers size={13} />
                        2. Combinação de Cores & Zonas
                      </label>
                      
                      {/* Toggle Buttons */}
                      <div className="inline-flex p-1 rounded-xl bg-black/40 border border-white/10 text-xs">
                        <button
                          type="button"
                          onClick={() => setIsBicolor(false)}
                          className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
                            !isBicolor 
                              ? 'bg-[#C5A059] text-[#121A0D] shadow-sm' 
                              : 'text-[#D4C3A3]/60 hover:text-[#F5EEDC]'
                          }`}
                        >
                          Monocolor
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsBicolor(true)}
                          className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
                            isBicolor 
                              ? 'bg-[#C5A059] text-[#121A0D] shadow-sm' 
                              : 'text-[#D4C3A3]/60 hover:text-[#F5EEDC]'
                          }`}
                        >
                          Bicolor (Multi-Zona)
                        </button>
                      </div>
                    </div>

                    {/* Zone 1: Cor Principal */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] text-[#D4C3A3]">
                        <span className="font-bold uppercase tracking-wider text-[#C5A059]">
                          {isBicolor ? '✦ Cor Principal (Corpo / Base)' : '✦ Cor da Peça'}
                        </span>
                        <span className="font-serif italic text-[#F5EEDC]">{primaryYarn.name}</span>
                      </div>
                      <div className="grid grid-cols-5 gap-1.5">
                        {YARN_PALETTES.map((yarn) => {
                          const isSelected = primaryYarn.id === yarn.id;
                          return (
                            <div
                              key={`p-${yarn.id}`}
                              onClick={() => setPrimaryYarn(yarn)}
                              className={`p-2 rounded-xl border text-center cursor-pointer transition-all flex flex-col items-center gap-1 ${
                                isSelected
                                  ? 'bg-[#1C2A15] border-[#C5A059] ring-1 ring-[#C5A059]'
                                  : 'bg-black/20 border-white/10 hover:border-[#C5A059]/40'
                              }`}
                            >
                              <div 
                                className="w-6 h-6 rounded-full border shadow-inner transition-transform"
                                style={{ 
                                  backgroundColor: yarn.hex, 
                                  borderColor: yarn.borderHex,
                                  transform: isSelected ? 'scale(1.15)' : 'scale(1)'
                                }}
                              />
                              <span className="text-[9px] font-sans text-[#F5EEDC] line-clamp-1 leading-tight font-medium">
                                {yarn.name.split(' ')[0]}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Zone 2: Cor Secundária (If Bicolor) */}
                    {isBicolor && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-1.5 pt-2 border-t border-white/10"
                      >
                        <div className="flex items-center justify-between text-[10px] text-[#D4C3A3]">
                          <span className="font-bold uppercase tracking-wider text-[#C5A059]">
                            ✦ Cor Secundária (Aba / Bordos / Destaque)
                          </span>
                          <span className="font-serif italic text-[#F5EEDC]">{secondaryYarn.name}</span>
                        </div>
                        <div className="grid grid-cols-5 gap-1.5">
                          {YARN_PALETTES.map((yarn) => {
                            const isSelected = secondaryYarn.id === yarn.id;
                            return (
                              <div
                                key={`s-${yarn.id}`}
                                onClick={() => setSecondaryYarn(yarn)}
                                className={`p-2 rounded-xl border text-center cursor-pointer transition-all flex flex-col items-center gap-1 ${
                                  isSelected
                                    ? 'bg-[#1C2A15] border-[#C5A059] ring-1 ring-[#C5A059]'
                                    : 'bg-black/20 border-white/10 hover:border-[#C5A059]/40'
                                }`}
                              >
                                <div 
                                  className="w-6 h-6 rounded-full border shadow-inner transition-transform"
                                  style={{ 
                                    backgroundColor: yarn.hex, 
                                    borderColor: yarn.borderHex,
                                    transform: isSelected ? 'scale(1.15)' : 'scale(1)'
                                  }}
                                />
                                <span className="text-[9px] font-sans text-[#F5EEDC] line-clamp-1 leading-tight font-medium">
                                  {yarn.name.split(' ')[0]}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* 3. Estilo de Acabamento & Ferragens */}
                  <div>
                    <label className="block text-[11px] uppercase tracking-[0.2em] font-sans font-bold text-[#C5A059] mb-2">
                      3. Detalhes & Ferragens do Atelier
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {HARDWARE_OPTIONS.map((hw) => {
                        const isSelected = selectedHardware.id === hw.id;
                        return (
                          <div
                            key={hw.id}
                            onClick={() => setSelectedHardware(hw)}
                            className={`p-2.5 px-3 rounded-xl border text-left cursor-pointer transition-all flex items-center justify-between text-xs ${
                              isSelected
                                ? 'bg-[#1C2A15] border-[#C5A059] text-[#F5EEDC] font-medium'
                                : 'bg-white/5 border-white/10 text-[#D4C3A3]/80 hover:border-[#C5A059]/40'
                            }`}
                          >
                            <span className="line-clamp-1">{hw.name}</span>
                            {isSelected && <Check size={14} className="text-[#C5A059] shrink-0" />}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 4. Nome e Notas de Inspiração */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-1">
                      <label className="block text-[10px] uppercase tracking-[0.2em] font-sans font-semibold text-[#D4C3A3] mb-1">
                        O seu Nome
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Maria Santos"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-xs text-[#F5EEDC] placeholder-[#D4C3A3]/40 focus:outline-none focus:border-[#C5A059]"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] uppercase tracking-[0.2em] font-sans font-semibold text-[#D4C3A3] mb-1">
                        Notas de Inspiração / Ocasião (Opcional)
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Para casamento em Outubro, tons terrosos..."
                        value={customNotes}
                        onChange={(e) => setCustomNotes(e.target.value)}
                        className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-xs text-[#F5EEDC] placeholder-[#D4C3A3]/40 focus:outline-none focus:border-[#C5A059]"
                      />
                    </div>
                  </div>

                </div>

              </form>
            )}
          </div>

          {/* Footer CTA */}
          {!bookingSuccess && (
            <div className="pt-3 border-t border-[#C5A059]/20 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-left hidden sm:block">
                <span className="block text-[10px] uppercase tracking-widest text-[#C5A059] font-bold">
                  Sessão Privada com Carolina Bravo
                </span>
                <span className="text-[11px] text-[#D4C3A3]/70 font-serif italic">
                  Envio automático do Passaporte Criativo para o WhatsApp do Atelier.
                </span>
              </div>

              <button
                type="submit"
                form="private-studio-form"
                disabled={isSubmitting}
                className="w-full sm:w-auto py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#C5A059] via-[#D4B06A] to-[#C5A059] text-[#121A0D] font-sans text-xs uppercase tracking-[0.2em] font-extrabold shadow-[0_8px_25px_rgba(197,160,89,0.35)] hover:shadow-[0_12px_32px_rgba(197,160,89,0.5)] transition-all cursor-pointer flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
              >
                <MessageCircle size={16} className="fill-[#121A0D]" />
                <span>{isSubmitting ? 'A ABRIR O WHATSAPP...' : 'RESERVAR SESSÃO & ENVIAR PASSAPORTE'}</span>
              </button>
            </div>
          )}

        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AtelierPrivateStudioModal;
