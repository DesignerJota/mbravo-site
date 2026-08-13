import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Check, 
  MessageCircle, 
  ShieldCheck, 
  Heart, 
  Calendar,
  User,
  Mail,
  Phone,
  Sparkles
} from 'lucide-react';

interface AtelierPrivateStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// 1. Official Catalog Pieces with Direct Photo Links
const ATELIER_PRODUCTS = [
  { 
    id: 'cardigan-alma', 
    name: 'Cardigan Alma', 
    category: 'Vestuário Autoral',
    image: '/products/alma-cardigan/1.webp',
    fallbackImage: '/vestuario.webp',
    desc: 'Peça de vestuário de alta-costura em crochet com abotoamento frontal e punhos canelados.'
  },
  { 
    id: 'mala-b2-sling', 
    name: 'Mala B2 Sling', 
    category: 'Mala em Crochet',
    image: '/products/granny-square-sling-bag/1.webp',
    fallbackImage: '/malas.webp',
    desc: 'Mala de ombro utilitária e elegante com pala arredondada e estrutura reforçada.'
  },
  { 
    id: 'pouch-b1-mini', 
    name: 'Pouch B1 Mini', 
    category: 'Mini Mala & Acessório',
    image: '/products/mini-pouches/1.webp',
    fallbackImage: '/acessorios.webp',
    desc: 'Bolsa compacta para essenciais, porta-chaves ou Airpods com fecho artesanal.'
  },
  { 
    id: 'poncho-v1', 
    name: 'Poncho V1 / V2C', 
    category: 'Acessório Nobre',
    image: '/products/signature-granny-poncho/1.webp',
    fallbackImage: '/vestuario.webp',
    desc: 'Capa envolvente de ombros com drapeado natural e gola estruturada.'
  },
  { 
    id: 'decor-h2b', 
    name: 'Almofada H2B', 
    category: 'Decor para a Casa',
    image: '/products/stella-cushion/1.webp',
    fallbackImage: '/casa.webp',
    desc: 'Peça decorativa para a casa com borlas nos cantos e ponto rendado exclusivo.'
  },
  { 
    id: 'coasters-mbravo', 
    name: 'Porta-Copos Coasters', 
    category: 'Mesa & Decor',
    image: '/products/coraline-coasters/1.webp',
    fallbackImage: '/casa.webp',
    desc: 'Conjunto de base para copos em algodão penteado para momentos especiais à mesa.'
  }
];

// 2. Official Raw Materials & Yarn Palettes (DROPS Safran & DROPS Paris)
const YARN_COLORS = [
  { id: 'natural', name: 'Natural & Areia', hex: '#F5EBE0', borderHex: '#D8C3A5', yarnLine: 'DROPS Safran 18' },
  { id: 'floresta', name: 'Verde Floresta', hex: '#416335', borderHex: '#2E4825', yarnLine: 'DROPS Safran 78' },
  { id: 'cafe', name: 'Café M★BRAVO', hex: '#5C3A21', borderHex: '#422815', yarnLine: 'DROPS Safran 68' },
  { id: 'rosa', name: 'Rosa do Deserto', hex: '#F4B3BA', borderHex: '#E39DA5', yarnLine: 'DROPS Safran 01' },
  { id: 'azul', name: 'Azul Pó Marea', hex: '#B8D8EB', borderHex: '#9DC1D8', yarnLine: 'DROPS Safran 76' },
  { id: 'baunilha', name: 'Baunilha Dourada', hex: '#F8C53A', borderHex: '#D9AA2B', yarnLine: 'DROPS Paris 35' }
];

export const AtelierPrivateStudioModal: React.FC<AtelierPrivateStudioModalProps> = ({
  isOpen,
  onClose
}) => {
  const [selectedProduct, setSelectedProduct] = useState(ATELIER_PRODUCTS[0]);
  const [selectedColor, setSelectedColor] = useState(YARN_COLORS[0]);
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

  // Generate formatted WhatsApp Passaporte Criativo text
  const generateWhatsAppMessage = () => {
    const namePart = clientName.trim() ? `O meu nome é ${clientName.trim()}. ` : '';
    const emailPart = clientEmail.trim() ? ` (Email: ${clientEmail.trim()})` : '';
    const phonePart = clientPhone.trim() ? ` | Contacto: ${clientPhone.trim()}` : '';
    const bdayPart = clientBirthday.trim() ? ` | Aniversário: ${clientBirthday.trim()}` : '';
    const notesPart = customNotes.trim() ? ` | Notas: "${customNotes.trim()}"` : '';

    return `Olá Carolina! ${namePart}Envio o meu Passaporte de Co-Criação M★BRAVO:
✦ Peça Selecionada: ${selectedProduct.name} (${selectedProduct.category})
✦ Tom do Algodão: ${selectedColor.name} (${selectedColor.yarnLine})${emailPart}${phonePart}${bdayPart}${notesPart}

Gostaria de agendar a minha sessão privada com a Carolina Bravo.`;
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
      yarnLine: selectedColor.yarnLine,
      notes: customNotes.trim()
    };

    // 1. Save in backend persistent store & localStorage
    try {
      fetch('/api/private-studio/passports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(passaporteData)
      }).catch(err => console.warn('[PASSAPORTE API] Submit notice:', err));

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
          className="relative w-full max-w-2xl bg-[#FAF7F2] border border-[#C5A059]/40 rounded-3xl p-5 sm:p-7 text-[#243119] shadow-2xl z-10 overflow-hidden my-auto max-h-[92vh] flex flex-col justify-between"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-4 border-b border-[#243119]/10 pb-4 shrink-0">
            <div>
              <span className="text-[10px] uppercase tracking-[0.3em] font-sans font-semibold text-[#8C6D3B] block mb-0.5">
                M★BRAVO Atelier
              </span>
              <h2 
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
                className="text-2xl sm:text-3xl font-serif text-[#243119] font-normal leading-tight"
              >
                Passaporte de Co-Criação
              </h2>
              <p className="text-xs text-[#243119]/70 font-sans mt-1 max-w-lg leading-relaxed">
                Inicie o processo artesanal da sua peça sob medida. Preencha os detalhes para agendar a sua sessão privada com a Carolina.
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
          <div className="overflow-y-auto my-4 pr-1 space-y-6 flex-1 custom-scrollbar">
            {bookingSuccess ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-10 text-center space-y-4"
              >
                <div className="w-16 h-16 rounded-full bg-[#243119] text-[#C5A059] flex items-center justify-center mx-auto text-2xl shadow-sm border border-[#C5A059]">
                  ★
                </div>
                <h3 
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                  className="text-2xl sm:text-3xl text-[#243119] font-normal"
                >
                  Passaporte Registado
                </h3>
                <p className="text-xs sm:text-sm text-[#243119]/80 max-w-md mx-auto leading-relaxed">
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
              <form id="passaporte-form" onSubmit={handleSubmitPassaporte} className="space-y-6">
                
                {/* 1. SELEÇÃO DE PRODUTO & FOTO DE DESTAQUE */}
                <div>
                  <label className="block text-[11px] uppercase tracking-[0.2em] font-sans font-semibold text-[#8C6D3B] mb-2">
                    1. Escolha a Peça do Atelier
                  </label>

                  {/* Horizontal Scroll / Grid for Product Selection Pills */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
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
                          className={`p-2.5 rounded-2xl border text-left cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-[#243119] border-[#243119] text-[#FAF8F5] shadow-xs'
                              : 'bg-white border-[#243119]/10 text-[#243119] hover:border-[#C5A059]'
                          }`}
                        >
                          <span className={`block font-serif italic text-sm ${isSelected ? 'text-[#FAF8F5]' : 'text-[#243119]'}`}>
                            {prod.name}
                          </span>
                          <span className={`block text-[9px] uppercase tracking-wider font-sans mt-0.5 ${isSelected ? 'text-[#C5A059]' : 'text-[#243119]/50'}`}>
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
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="relative w-full aspect-[16/9] sm:aspect-[2/1] rounded-2xl overflow-hidden bg-[#EFE8D8] border border-[#C5A059]/40 shadow-xs group"
                    >
                      <img 
                        src={currentImageUrl} 
                        alt={selectedProduct.name}
                        onError={() => setImgError(true)}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />
                      
                      <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white z-10">
                        <div>
                          <span className="text-[10px] uppercase tracking-[0.2em] font-sans font-semibold text-[#C5A059] block">
                            {selectedProduct.category}
                          </span>
                          <h3 
                            style={{ fontFamily: "'Cormorant Garamond', serif" }}
                            className="text-xl sm:text-2xl font-serif text-[#FAF8F5] leading-tight"
                          >
                            {selectedProduct.name}
                          </h3>
                        </div>
                        <span className="text-[10px] font-sans uppercase tracking-widest text-white/80 bg-black/40 px-2.5 py-1 rounded-full border border-white/20 backdrop-blur-xs">
                          Peça Artesanal
                        </span>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* 2. OPÇÕES BÁSICAS: ALGODÃO VIRGEM */}
                <div>
                  <label className="block text-[11px] uppercase tracking-[0.2em] font-sans font-semibold text-[#8C6D3B] mb-2">
                    2. Escolha o Tom do Algodão
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {YARN_COLORS.map((color) => {
                      const isSelected = selectedColor.id === color.id;
                      return (
                        <button
                          key={color.id}
                          type="button"
                          onClick={() => setSelectedColor(color)}
                          className={`p-2.5 rounded-2xl border text-left cursor-pointer transition-all flex items-center gap-2.5 ${
                            isSelected
                              ? 'bg-white border-[#C5A059] ring-1 ring-[#C5A059] shadow-xs'
                              : 'bg-white/80 border-[#243119]/10 hover:border-[#C5A059]/50'
                          }`}
                        >
                          <span 
                            className="w-5 h-5 rounded-full border border-black/15 shrink-0 shadow-2xs"
                            style={{ backgroundColor: color.hex }}
                          />
                          <div className="min-w-0">
                            <span className="block text-xs font-sans font-medium text-[#243119] truncate">
                              {color.name}
                            </span>
                            <span className="block text-[9px] text-[#243119]/50 font-sans truncate">
                              {color.yarnLine}
                            </span>
                          </div>
                          {isSelected && <Check size={14} className="text-[#8C6D3B] ml-auto shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. FORMULÁRIO DE CAPTAÇÃO & ANIVERSÁRIO */}
                <div className="space-y-3 pt-2 border-t border-[#243119]/10">
                  <span className="block text-[11px] uppercase tracking-[0.2em] font-sans font-semibold text-[#8C6D3B]">
                    3. Os seus Dados para Agendamento
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Nome Completo */}
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider font-sans font-medium text-[#243119]/80 mb-1 flex items-center gap-1">
                        <User size={12} className="text-[#8C6D3B]" />
                        <span>Nome Completo *</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Maria Santos"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        className="w-full bg-white border border-[#243119]/15 rounded-xl px-3 py-2 text-xs text-[#243119] placeholder-[#243119]/35 focus:outline-none focus:border-[#C5A059] transition-all"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider font-sans font-medium text-[#243119]/80 mb-1 flex items-center gap-1">
                        <Mail size={12} className="text-[#8C6D3B]" />
                        <span>Email *</span>
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="Ex: maria@email.com"
                        value={clientEmail}
                        onChange={(e) => setClientEmail(e.target.value)}
                        className="w-full bg-white border border-[#243119]/15 rounded-xl px-3 py-2 text-xs text-[#243119] placeholder-[#243119]/35 focus:outline-none focus:border-[#C5A059] transition-all"
                      />
                    </div>

                    {/* Contacto / WhatsApp */}
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider font-sans font-medium text-[#243119]/80 mb-1 flex items-center gap-1">
                        <Phone size={12} className="text-[#8C6D3B]" />
                        <span>Contacto / WhatsApp *</span>
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="Ex: +351 912 345 678"
                        value={clientPhone}
                        onChange={(e) => setClientPhone(e.target.value)}
                        className="w-full bg-white border border-[#243119]/15 rounded-xl px-3 py-2 text-xs text-[#243119] placeholder-[#243119]/35 focus:outline-none focus:border-[#C5A059] transition-all"
                      />
                    </div>

                    {/* Data de Aniversário (Dia / Mês) */}
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider font-sans font-medium text-[#243119]/80 mb-1 flex items-center gap-1">
                        <Calendar size={12} className="text-[#8C6D3B]" />
                        <span>Data de Aniversário (Dia/Mês)</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: 14/10"
                        value={clientBirthday}
                        onChange={(e) => setClientBirthday(e.target.value)}
                        className="w-full bg-white border border-[#243119]/15 rounded-xl px-3 py-2 text-xs text-[#243119] placeholder-[#243119]/35 focus:outline-none focus:border-[#C5A059] transition-all"
                      />
                      <span className="block text-[9px] text-[#8C6D3B] font-sans mt-0.5 italic">
                        Para mimos e ofertas exclusivas no seu dia especial.
                      </span>
                    </div>
                  </div>

                  {/* Notas do seu pedido / Ocasião especial */}
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-sans font-medium text-[#243119]/80 mb-1">
                      Notas do seu Pedido / Ocasião Especial (Opcional)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Ex: Peça para presente de aniversário em Outubro, tom neutro..."
                      value={customNotes}
                      onChange={(e) => setCustomNotes(e.target.value)}
                      className="w-full bg-white border border-[#243119]/15 rounded-xl p-3 text-xs text-[#243119] placeholder-[#243119]/35 focus:outline-none focus:border-[#C5A059] transition-all resize-none"
                    />
                  </div>
                </div>

              </form>
            )}
          </div>

          {/* Footer CTA */}
          {!bookingSuccess && (
            <div className="pt-3 border-t border-[#243119]/10 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-left hidden sm:block">
                <span className="block text-[10px] uppercase tracking-widest text-[#8C6D3B] font-semibold">
                  M★BRAVO — Peças Feitas Sob Medida
                </span>
                <span className="text-[11px] text-[#243119]/70 font-serif italic">
                  Envio do Passaporte para o WhatsApp oficial do Atelier.
                </span>
              </div>

              <button
                type="submit"
                form="passaporte-form"
                disabled={isSubmitting}
                className="w-full sm:w-auto py-3.5 px-6 rounded-2xl bg-[#243119] hover:bg-[#1A2412] text-[#FAF8F5] font-sans text-xs uppercase tracking-[0.2em] font-semibold shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 border border-[#243119] active:scale-[0.99]"
              >
                <MessageCircle size={16} className="text-[#C5A059]" />
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
