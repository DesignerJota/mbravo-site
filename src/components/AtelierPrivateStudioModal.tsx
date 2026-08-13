import React, { useState } from 'react';
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
  Plus
} from 'lucide-react';

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
    id: 'almofada-atelier', 
    name: 'Almofada Atelier', 
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

// 2. Official Raw Materials (Clean Swatches)
const YARN_COLORS = [
  { id: 'natural', name: 'Natural Areia', hex: '#F5EBE0' },
  { id: 'floresta', name: 'Verde Floresta', hex: '#416335' },
  { id: 'cafe', name: 'Café M★BRAVO', hex: '#5C3A21' },
  { id: 'rosa', name: 'Rosa Deserto', hex: '#F4B3BA' },
  { id: 'azul', name: 'Azul Pó Marea', hex: '#B8D8EB' },
  { id: 'baunilha', name: 'Baunilha Dourada', hex: '#F8C53A' }
];

const SIZES = ['Único', 'S-M', 'L-XL', 'Por Medida'];

export const AtelierPrivateStudioModal: React.FC<AtelierPrivateStudioModalProps> = ({
  isOpen,
  onClose
}) => {
  const [selectedProduct, setSelectedProduct] = useState(ATELIER_PRODUCTS[0]);
  const [selectedColor, setSelectedColor] = useState(YARN_COLORS[0]);
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

  if (!isOpen) return null;

  // Handle image fallback gracefully
  const currentImageUrl = imgError ? selectedProduct.fallbackImage : selectedProduct.image;

  // Colors visible (4 main or all 6)
  const visibleColors = showAllColors ? YARN_COLORS : YARN_COLORS.slice(0, 4);

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

Gostaria de agendar a minha sessão privada no Atelier.`;
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

    // 1. Save in backend persistent store & localStorage
    try {
      fetch('/api/private-studio/passports', {
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
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 md:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/65 backdrop-blur-xs"
        />

        {/* Editorial Premium Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 280 }}
          className="relative w-full max-w-xl bg-[#FAF7F2] border border-[#C5A059]/40 rounded-3xl p-5 sm:p-7 text-[#243119] shadow-2xl z-10 overflow-hidden my-auto max-h-[92vh] flex flex-col justify-between"
        >
          {/* Header - Clean Editorial */}
          <div className="flex items-center justify-between border-b border-[#243119]/10 pb-4 shrink-0">
            <div>
              <h2 
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
                className="text-2xl sm:text-3xl font-serif text-[#243119] font-normal leading-tight"
              >
                Passaporte de Co-Criação
              </h2>
              <span className="text-[10px] uppercase tracking-[0.25em] font-sans font-semibold text-[#8C6D3B] block mt-0.5">
                M★BRAVO Atelier
              </span>
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
          <div className="overflow-y-auto my-4 pr-1 space-y-5 flex-1 custom-scrollbar">
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
                  A abrir a conversa com o Atelier no WhatsApp... A Carolina estará à sua espera para confirmar a sua sessão privada.
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
                    1. Escolha a Peça do Atelier
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

                  {/* SINGLE FEATURED PHOTO OF SELECTED PIECE */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={selectedProduct.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.25 }}
                      className="relative w-full aspect-[21/9] sm:aspect-[2.4/1] rounded-2xl overflow-hidden bg-[#EFE8D8] border border-[#C5A059]/30 shadow-2xs group"
                    >
                      <img 
                        src={currentImageUrl} 
                        alt={selectedProduct.name}
                        onError={() => setImgError(true)}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent pointer-events-none" />
                      
                      <div className="absolute bottom-2.5 left-3 right-3 flex items-end justify-between text-white z-10">
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
                        <span className="text-[9px] font-sans uppercase tracking-widest text-white/80 bg-black/40 px-2.5 py-0.5 rounded-full border border-white/20 backdrop-blur-xs">
                          M★BRAVO
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
                      {showAllColors ? 'Menos Cores' : '+ Outras Cores da Paleta'}
                    </button>
                  </div>

                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 bg-white/60 p-3 rounded-2xl border border-[#243119]/10">
                    {visibleColors.map((color) => {
                      const isSelected = selectedColor.id === color.id;
                      return (
                        <button
                          key={color.id}
                          type="button"
                          onClick={() => setSelectedColor(color)}
                          className="flex flex-col items-center gap-1.5 cursor-pointer group py-1"
                        >
                          <div className={`relative w-7 h-7 sm:w-8 sm:h-8 rounded-full border transition-all flex items-center justify-center shadow-2xs ${
                            isSelected 
                              ? 'ring-2 ring-[#C5A059] ring-offset-2 border-black/20 scale-105' 
                              : 'border-black/15 group-hover:scale-105'
                          }`}
                          style={{ backgroundColor: color.hex }}
                          >
                            {isSelected && (
                              <Check size={12} className={color.hex === '#F5EBE0' || color.hex === '#F8C53A' ? 'text-black' : 'text-white'} />
                            )}
                          </div>
                          <span className={`text-[9px] font-sans text-center leading-tight transition-colors ${
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

                    {/* Data de Aniversário */}
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider font-sans font-medium text-[#243119]/80 mb-1 flex items-center gap-1">
                        <Calendar size={11} className="text-[#8C6D3B]" />
                        <span>Data de Aniversário</span>
                      </label>
                      <input
                        type="text"
                        placeholder="DD / MM"
                        value={clientBirthday}
                        onChange={(e) => setClientBirthday(e.target.value)}
                        className="w-full bg-white border border-[#243119]/15 rounded-xl px-3 py-2 text-xs text-[#243119] placeholder-[#243119]/35 focus:outline-none focus:border-[#C5A059] transition-all"
                      />
                      <span className="block text-[9px] text-[#8C6D3B] font-sans mt-0.5 italic">
                        Para mimá-la na sua data especial.
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
                <span>{isSubmitting ? 'A ABRIR WHATSAPP...' : 'SOLICITAR PASSAPORTE DE CO-CRIAÇÃO'}</span>
              </button>
            </div>
          )}

        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AtelierPrivateStudioModal;
