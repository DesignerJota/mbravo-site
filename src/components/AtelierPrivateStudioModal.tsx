import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Check, 
  MessageCircle, 
  User, 
  Mail, 
  Phone, 
  Calendar,
  Minus,
  Plus,
  Maximize2,
  Sparkles
} from 'lucide-react';
import { YARN_COLORS_DATABASE, YarnColor, getCleanColorName } from '../data/yarns';

interface AtelierPrivateStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// 1. Official Catalog Pieces without technical code noise
const ATELIER_PRODUCTS = [
  { 
    id: 'cardigan-alma', 
    name: 'Cardigan Alma', 
    category: 'Vestuário Autoral',
    image: '/products/alma-cardigan/1.webp',
    fallbackImage: '/vestuario.webp'
  },
  { 
    id: 'mala-sling', 
    name: 'Mala Sling', 
    category: 'Mala em Crochet',
    image: '/products/granny-square-sling-bag/1.webp',
    fallbackImage: '/malas.webp'
  },
  { 
    id: 'pouch-mini', 
    name: 'Pouch Mini', 
    category: 'Mini Mala & Acessório',
    image: '/products/mini-pouches/1.webp',
    fallbackImage: '/acessorios.webp'
  },
  { 
    id: 'poncho-couture', 
    name: 'Poncho Couture', 
    category: 'Acessório Nobre',
    image: '/products/signature-granny-poncho/1.webp',
    fallbackImage: '/vestuario.webp'
  },
  { 
    id: 'almofada-mbravo', 
    name: 'Almofada M★BRAVO', 
    category: 'Decor para a Casa',
    image: '/products/stella-cushion/1.webp',
    fallbackImage: '/casa.webp'
  },
  { 
    id: 'porta-copos', 
    name: 'Porta-Copos', 
    category: 'Mesa & Decor',
    image: '/products/coraline-coasters/1.webp',
    fallbackImage: '/casa.webp'
  }
];

// 2. Official Color Swatches synchronized with AdminDashboard & YARN_COLORS_DATABASE
const INITIAL_FEATURED_COLORS = [
  { id: 'natural', name: 'Natural Areia', hex: '#F5EBE0', swatchUrl: '/swatches/safran-18.webp' },
  { id: 'floresta', name: 'Verde Floresta', hex: '#2D442B', swatchUrl: '/swatches/safran-78.webp' },
  { id: 'cafe', name: 'Café M★BRAVO', hex: '#4A3525', swatchUrl: '/swatches/safran-68.webp' },
  { id: 'rosa', name: 'Rosa Deserto', hex: '#E2A9B0', swatchUrl: '/swatches/safran-01.webp' },
  { id: 'azul', name: 'Azul Pó Marea', hex: '#A0B4C8', swatchUrl: '/swatches/safran-76.webp' },
  { id: 'baunilha', name: 'Baunilha Dourada', hex: '#F3E2B8', swatchUrl: '/swatches/paris-35.webp' }
];

const SIZES = ['Único', 'S-M', 'L-XL', 'Por Medida'];

export const AtelierPrivateStudioModal: React.FC<AtelierPrivateStudioModalProps> = ({
  isOpen,
  onClose
}) => {
  const [selectedProduct, setSelectedProduct] = useState(ATELIER_PRODUCTS[0]);
  const [selectedColor, setSelectedColor] = useState(INITIAL_FEATURED_COLORS[0]);
  const [showAllColors, setShowAllColors] = useState(false);
  const [selectedSize, setSelectedSize] = useState('Por Medida');
  const [quantity, setQuantity] = useState(1);
  
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientBirthday, setClientBirthday] = useState('');
  const [customNotes, setCustomNotes] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Sync with official YARN_COLORS_DATABASE or inventory endpoint on mount
  const allOfficialColors = React.useMemo(() => {
    if (!YARN_COLORS_DATABASE || YARN_COLORS_DATABASE.length === 0) return INITIAL_FEATURED_COLORS;
    
    // Map unique clean color names
    const colorMap = new Map<string, { id: string; name: string; hex: string; swatchUrl: string }>();
    YARN_COLORS_DATABASE.forEach((item) => {
      const cleanName = getCleanColorName(item.name) || item.name;
      if (!colorMap.has(cleanName.toLowerCase())) {
        colorMap.set(cleanName.toLowerCase(), {
          id: item.id,
          name: cleanName,
          hex: item.colorHex || '#E5E0D8',
          swatchUrl: item.swatchUrl
        });
      }
    });

    return Array.from(colorMap.values());
  }, []);

  if (!isOpen) return null;

  // Handle image fallback gracefully
  const currentImageUrl = imgError ? selectedProduct.fallbackImage : selectedProduct.image;

  // Swatches displayed
  const visibleColors = showAllColors ? allOfficialColors : allOfficialColors.slice(0, 6);

  // Generate formatted WhatsApp Passaporte Criativo text
  const generateWhatsAppMessage = () => {
    const namePart = clientName.trim() ? `O meu nome é ${clientName.trim()}. ` : '';
    const emailPart = clientEmail.trim() ? `\n• Email: ${clientEmail.trim()}` : '';
    const phonePart = clientPhone.trim() ? `\n• Contacto: ${clientPhone.trim()}` : '';
    const bdayPart = clientBirthday.trim() ? `\n• Aniversário: ${clientBirthday.trim()}` : '';
    const notesPart = customNotes.trim() ? `\n• Visão / Notas: "${customNotes.trim()}"` : '';

    return `Olá Carolina! ${namePart}Gostaria de solicitar o meu Passaporte de Co-Criação M★BRAVO:

✦ PEÇA SELECIONADA:
• Peça: ${selectedProduct.name} (${selectedProduct.category})
• Tom: ${selectedColor.name}
• Tamanho / Escala: ${selectedSize}
• Quantidade: ${quantity}

✦ DADOS DO CLIENTE:${emailPart}${phonePart}${bdayPart}${notesPart}

Gostaria de agendar a minha sessão privada com a M★BRAVO.`;
  };

  const handleSubmitPassaporte = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const passaporteData = {
      timestamp: new Date().toISOString(),
      clientName: clientName.trim() || 'Cliente M★BRAVO',
      clientEmail: clientEmail.trim(),
      clientPhone: clientPhone.trim(),
      clientBirthday: clientBirthday.trim(),
      productName: selectedProduct.name,
      productCategory: selectedProduct.category,
      colorName: selectedColor.name,
      size: selectedSize,
      quantity,
      notes: customNotes.trim()
    };

    // 1. Save in backend persistent store & send email notification
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || '';
      await fetch(`${API_BASE_URL}/api/private-studio/passports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(passaporteData)
      }).catch(err => console.warn('[PASSAPORTE API] Notice:', err));

      const existing = JSON.parse(localStorage.getItem('mbravo_creative_passports') || '[]');
      existing.unshift(passaporteData);
      localStorage.setItem('mbravo_creative_passports', JSON.stringify(existing.slice(0, 20)));
    } catch (err) {
      console.warn('[PASSAPORTE] Storage save notice:', err);
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
      <div 
        className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 md:p-6 overflow-y-auto overscroll-contain"
        data-lenis-prevent
        data-lenis-prevent-wheel
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/65 backdrop-blur-xs"
          data-lenis-prevent
        />

        {/* Editorial Premium Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 280 }}
          className="relative w-full max-w-xl bg-[#FAF7F2] border border-[#C5A059]/40 rounded-3xl p-5 sm:p-7 text-[#243119] shadow-2xl z-10 overflow-hidden my-auto max-h-[90vh] sm:max-h-[85vh] flex flex-col justify-between"
          data-lenis-prevent
        >
          {/* Header - Official Logo M★BRAVO & Clean Editorial */}
          <div className="flex items-center justify-between border-b border-[#243119]/10 pb-4 shrink-0">
            <div>
              <div className="flex items-center gap-2">
                <h2 
                  style={{ fontFamily: "'Cormorant Garamond', serif", letterSpacing: '0.04em' }}
                  className="text-2xl sm:text-3xl font-serif text-[#243119] font-normal leading-tight"
                >
                  M<span className="text-[#8C6D3B] mx-0.5">★</span>BRAVO
                </h2>
                <span className="text-[10px] uppercase tracking-[0.2em] font-sans font-semibold text-[#8C6D3B] block border-l border-[#243119]/20 pl-2">
                  Co-Criação
                </span>
              </div>
              <p className="text-[11px] font-sans text-[#243119]/70 mt-0.5">
                Passaporte de Co-Criação Sob Medida
              </p>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white border border-[#243119]/10 text-[#243119] hover:text-[#8C6D3B] hover:bg-[#FAF6EE] flex items-center justify-center transition-colors cursor-pointer shrink-0"
              aria-label="Fechar Modal"
            >
              <X size={16} />
            </button>
          </div>

          {/* Modal Content - Scrollable Form */}
          <div 
            className="overflow-y-auto my-3 pr-1 space-y-5 flex-1 custom-scrollbar overscroll-contain"
            data-lenis-prevent
            data-lenis-prevent-wheel
          >
            {bookingSuccess ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-10 text-center space-y-4"
              >
                <div className="w-14 h-14 rounded-full bg-[#243119] text-[#C5A059] flex items-center justify-center mx-auto text-xl shadow-sm border border-[#C5A059]">
                  ★
                </div>
                <h3 
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                  className="text-2xl sm:text-3xl text-[#243119] font-normal"
                >
                  Passaporte Registado
                </h3>
                <p className="text-xs sm:text-sm text-[#243119]/80 max-w-md mx-auto leading-relaxed font-sans">
                  O seu Passaporte de Co-Criação foi gravado e o comprovativo enviado para o seu e-mail. A Carolina entrará em contacto para confirmar a sua sessão privada.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => {
                      setBookingSuccess(false);
                      onClose();
                    }}
                    className="py-2.5 px-6 rounded-full bg-[#243119] text-[#FAF8F5] text-xs uppercase tracking-widest font-sans font-medium hover:bg-[#1A2412] transition-colors cursor-pointer"
                  >
                    Concluir & Fechar
                  </button>
                </div>
              </motion.div>
            ) : (
              <form id="passaporte-form" onSubmit={handleSubmitPassaporte} className="space-y-5">
                
                {/* 1. SELEÇÃO DE PEÇA & FOTO DE DESTAQUE */}
                <div>
                  <label className="block text-[11px] uppercase tracking-[0.2em] font-sans font-semibold text-[#8C6D3B] mb-2">
                    1. Escolha a Peça M★BRAVO
                  </label>

                  {/* Grid for Product Selection Pills */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
                    {ATELIER_PRODUCTS.map((prod) => {
                      const isSelected = selectedProduct.id === prod.id;
                      return (
                        <button
                          key={prod.id}
                          type="button"
                          onClick={() => {
                            setSelectedProduct(prod);
                            setImgError(false);
                          }}
                          className={`p-2 rounded-xl border text-left cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-[#243119] border-[#243119] text-[#FAF8F5] shadow-xs'
                              : 'bg-white border-[#243119]/10 text-[#243119] hover:border-[#C5A059]'
                          }`}
                        >
                          <span className={`block font-serif italic text-xs sm:text-sm ${isSelected ? 'text-[#FAF8F5]' : 'text-[#243119]'}`}>
                            {prod.name}
                          </span>
                          <span className={`block text-[8px] uppercase tracking-wider font-sans mt-0.5 ${isSelected ? 'text-[#C5A059]' : 'text-[#243119]/50'}`}>
                            {prod.category}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* SINGLE FEATURED PHOTO OF SELECTED PIECE WITH LIGHTBOX / ZOOM CLICK */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={selectedProduct.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.25 }}
                      onClick={() => setIsLightboxOpen(true)}
                      className="relative w-full aspect-[21/9] sm:aspect-[2.4/1] rounded-2xl overflow-hidden bg-[#EFE8D8] border border-[#C5A059]/30 shadow-2xs group cursor-pointer"
                      title="Clique para Ampliar / Zoom"
                    >
                      <img 
                        src={currentImageUrl} 
                        alt={selectedProduct.name}
                        onError={() => setImgError(true)}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent pointer-events-none" />
                      
                      {/* Zoom Badge Indicator */}
                      <div className="absolute top-2.5 right-2.5 bg-black/50 text-white/90 p-1.5 rounded-full backdrop-blur-xs group-hover:bg-[#8C6D3B] transition-colors border border-white/20">
                        <Maximize2 size={12} />
                      </div>

                      <div className="absolute bottom-2.5 left-3 right-3 flex items-end justify-between text-white z-10 pointer-events-none">
                        <div>
                          <span className="text-[9px] uppercase tracking-[0.2em] font-sans font-semibold text-[#C5A059] block">
                            {selectedProduct.category}
                          </span>
                          <h3 
                            style={{ fontFamily: "'Cormorant Garamond', serif" }}
                            className="text-lg sm:text-xl font-serif text-[#FAF8F5] leading-tight"
                          >
                            {selectedProduct.name}
                          </h3>
                        </div>
                        <span className="text-[9px] font-sans uppercase tracking-widest text-white/90 bg-black/40 px-2.5 py-0.5 rounded-full border border-white/20 backdrop-blur-xs flex items-center gap-1">
                          <span>Ampliar</span>
                          <Maximize2 size={9} />
                        </span>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* 2. REORGANIZAÇÃO DO SELECTOR DE CORES (SWATCHES CIRCULARES ELEGANTES) */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[11px] uppercase tracking-[0.2em] font-sans font-semibold text-[#8C6D3B]">
                      2. Tom do Algodão
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowAllColors(!showAllColors)}
                      className="text-[10px] uppercase tracking-wider font-sans font-medium text-[#8C6D3B] hover:text-[#243119] underline transition-colors cursor-pointer"
                    >
                      {showAllColors ? 'Menos Cores' : `+ Paleta Completa (${allOfficialColors.length} Tons)`}
                    </button>
                  </div>

                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5 bg-white/60 p-3 rounded-2xl border border-[#243119]/10">
                    {visibleColors.map((color) => {
                      const isSelected = selectedColor.name === color.name;
                      return (
                        <button
                          key={color.id || color.name}
                          type="button"
                          onClick={() => setSelectedColor(color)}
                          className="flex flex-col items-center gap-1.5 cursor-pointer group py-1"
                        >
                          <div className={`relative w-8 h-8 rounded-full border transition-all flex items-center justify-center shadow-2xs overflow-hidden ${
                            isSelected 
                              ? 'ring-2 ring-[#C5A059] ring-offset-2 border-black/20 scale-105' 
                              : 'border-black/15 group-hover:scale-105'
                          }`}
                          style={{ backgroundColor: color.hex }}
                          >
                            {color.swatchUrl && (
                              <img 
                                src={color.swatchUrl} 
                                alt={color.name}
                                className="w-full h-full object-cover absolute inset-0"
                                onError={(e) => {
                                  // Hide image on error to fallback to hex color
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                              />
                            )}
                            {isSelected && (
                              <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-10">
                                <Check size={12} className="text-white drop-shadow-xs" />
                              </div>
                            )}
                          </div>
                          <span className={`text-[9px] font-sans text-center leading-tight transition-colors line-clamp-1 px-0.5 ${
                            isSelected ? 'font-semibold text-[#243119]' : 'text-[#243119]/60 group-hover:text-[#243119]'
                          }`}>
                            {color.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. ESPECIFICAÇÕES DA PEÇA (TAMANHO & QUANTIDADE) */}
                <div>
                  <label className="block text-[11px] uppercase tracking-[0.2em] font-sans font-semibold text-[#8C6D3B] mb-2">
                    3. Especificações da Peça
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white/60 p-3 rounded-2xl border border-[#243119]/10">
                    {/* Escala / Tamanho */}
                    <div>
                      <span className="block text-[10px] uppercase tracking-wider font-sans text-[#243119]/70 mb-1.5 font-medium">
                        Tamanho / Escala
                      </span>
                      <div className="flex items-center gap-1">
                        {SIZES.map((sz) => {
                          const isSel = selectedSize === sz;
                          return (
                            <button
                              key={sz}
                              type="button"
                              onClick={() => setSelectedSize(sz)}
                              className={`flex-1 py-1.5 px-1 rounded-lg text-[10px] font-sans font-medium transition-all border cursor-pointer text-center ${
                                isSel 
                                  ? 'bg-[#243119] text-[#FAF8F5] border-[#243119] shadow-2xs' 
                                  : 'bg-white text-[#243119] border-[#243119]/15 hover:border-[#C5A059]'
                              }`}
                            >
                              {sz}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Quantidade */}
                    <div>
                      <span className="block text-[10px] uppercase tracking-wider font-sans text-[#243119]/70 mb-1.5 font-medium">
                        Quantidade
                      </span>
                      <div className="flex items-center justify-between bg-white border border-[#243119]/15 rounded-lg p-1 max-w-[130px]">
                        <button
                          type="button"
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="w-6 h-6 rounded-md bg-[#FAF7F2] hover:bg-[#EFE8D8] text-[#243119] flex items-center justify-center transition-colors cursor-pointer"
                          aria-label="Diminuir"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="text-xs font-sans font-semibold text-[#243119] px-2">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => setQuantity(quantity + 1)}
                          className="w-6 h-6 rounded-md bg-[#FAF7F2] hover:bg-[#EFE8D8] text-[#243119] flex items-center justify-center transition-colors cursor-pointer"
                          aria-label="Aumentar"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. FORMULÁRIO DE CAPTAÇÃO & ANIVERSÁRIO */}
                <div className="space-y-3 pt-2 border-t border-[#243119]/10">
                  <span className="block text-[11px] uppercase tracking-[0.2em] font-sans font-semibold text-[#8C6D3B]">
                    4. Dados de Agendamento
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Nome Completo */}
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider font-sans font-medium text-[#243119]/80 mb-1 flex items-center gap-1">
                        <User size={11} className="text-[#8C6D3B]" />
                        <span>Nome Completo *</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Seu nome completo"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        className="w-full bg-white border border-[#243119]/15 rounded-xl px-3 py-2 text-xs text-[#243119] placeholder-[#243119]/35 focus:outline-none focus:border-[#C5A059] transition-all"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider font-sans font-medium text-[#243119]/80 mb-1 flex items-center gap-1">
                        <Mail size={11} className="text-[#8C6D3B]" />
                        <span>Email *</span>
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="seu.email@exemplo.com"
                        value={clientEmail}
                        onChange={(e) => setClientEmail(e.target.value)}
                        className="w-full bg-white border border-[#243119]/15 rounded-xl px-3 py-2 text-xs text-[#243119] placeholder-[#243119]/35 focus:outline-none focus:border-[#C5A059] transition-all"
                      />
                    </div>

                    {/* Contacto / WhatsApp */}
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider font-sans font-medium text-[#243119]/80 mb-1 flex items-center gap-1">
                        <Phone size={11} className="text-[#8C6D3B]" />
                        <span>Contacto / WhatsApp *</span>
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+351 --- --- ---"
                        value={clientPhone}
                        onChange={(e) => setClientPhone(e.target.value)}
                        className="w-full bg-white border border-[#243119]/15 rounded-xl px-3 py-2 text-xs text-[#243119] placeholder-[#243119]/35 focus:outline-none focus:border-[#C5A059] transition-all"
                      />
                    </div>

                    {/* Data de Aniversário (Com Ano) */}
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider font-sans font-medium text-[#243119]/80 mb-1 flex items-center gap-1">
                        <Calendar size={11} className="text-[#8C6D3B]" />
                        <span>Data de Aniversário</span>
                      </label>
                      <input
                        type="text"
                        placeholder="DD / MM / AAAA"
                        value={clientBirthday}
                        onChange={(e) => setClientBirthday(e.target.value)}
                        className="w-full bg-white border border-[#243119]/15 rounded-xl px-3 py-2 text-xs text-[#243119] placeholder-[#243119]/35 focus:outline-none focus:border-[#C5A059] transition-all"
                      />
                      <span className="block text-[9px] text-[#8C6D3B] font-sans mt-0.5 italic">
                        Para mimá-la na sua data especial e métricas exclusivas.
                      </span>
                    </div>
                  </div>

                  {/* Notas do seu pedido / Ocasião especial */}
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-sans font-medium text-[#243119]/80 mb-1">
                      Notas do Pedido / Ocasião Especial (Opcional)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Detalhes do seu pedido ou visão para a peça..."
                      value={customNotes}
                      onChange={(e) => setCustomNotes(e.target.value)}
                      className="w-full bg-white border border-[#243119]/15 rounded-xl p-2.5 text-xs text-[#243119] placeholder-[#243119]/35 focus:outline-none focus:border-[#C5A059] transition-all resize-none"
                    />
                  </div>
                </div>

              </form>
            )}
          </div>

          {/* Footer CTA - Centered Noble Button */}
          {!bookingSuccess && (
            <div className="pt-3 border-t border-[#243119]/10 shrink-0 flex items-center justify-center">
              <button
                type="submit"
                form="passaporte-form"
                disabled={isSubmitting}
                className="w-full sm:w-auto py-3.5 px-8 rounded-full bg-[#243119] hover:bg-[#1A2412] text-[#FAF8F5] font-sans text-xs uppercase tracking-[0.2em] font-semibold shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center justify-center gap-2.5 border border-[#243119] active:scale-[0.99]"
              >
                <MessageCircle size={15} className="text-[#C5A059]" />
                <span>{isSubmitting ? 'A ENVIAR PASSAPORTE...' : 'CONFIRMAR & ENVIAR PASSAPORTE'}</span>
              </button>
            </div>
          )}

        </motion.div>
      </div>

      {/* LIGHTBOX / ZOOM MODAL FOR PRODUCT PHOTO */}
      {isLightboxOpen && (
        <div 
          className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
          onClick={() => setIsLightboxOpen(false)}
          data-lenis-prevent
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative max-w-4xl max-h-[90vh] p-3 rounded-2xl bg-[#FAF7F2]/10 border border-white/20 overflow-hidden text-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setIsLightboxOpen(false)} 
              className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors cursor-pointer border border-white/20"
              aria-label="Fechar Visualização"
            >
              <X size={20} />
            </button>
            <img 
              src={currentImageUrl} 
              alt={selectedProduct.name} 
              className="max-h-[80vh] w-auto max-w-full object-contain rounded-xl mx-auto shadow-2xl" 
            />
            <div className="mt-3 text-white font-serif text-lg sm:text-xl flex items-center justify-center gap-2">
              <span className="font-semibold">{selectedProduct.name}</span>
              <span className="text-[#C5A059] italic text-sm">&bull; {selectedProduct.category}</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AtelierPrivateStudioModal;
