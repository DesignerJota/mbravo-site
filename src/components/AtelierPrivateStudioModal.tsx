import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TextureSwatchPicker } from './TextureSwatchPicker';
import { getColorSwatchBg } from '../translations';
import { 
  X, 
  Sparkles, 
  Check, 
  Clock, 
  MessageCircle, 
  ShieldCheck, 
  Eye,
  Layers,
  Award,
  Info
} from 'lucide-react';

interface AtelierPrivateStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// 1. Official Raw Materials & Yarns from M★BRAVO Inventory (DROPS Safran & DROPS Paris)
const YARN_PALETTES = [
  { 
    id: 'safran-18-natural', 
    name: 'DROPS Safran 18 (Natural & Areia)', 
    shortName: 'Safran Natural',
    hex: '#F5EBE0', 
    borderHex: '#D8C3A5', 
    desc: '100% Algodão Egípcio Penteado. Textura suave e tom cru virgem de assinatura.' 
  },
  { 
    id: 'safran-78-floresta', 
    name: 'DROPS Safran 78 (Verde Floresta M★BRAVO)', 
    shortName: 'Safran Verde Floresta',
    hex: '#416335', 
    borderHex: '#2E4825', 
    desc: 'Cor nobre de assinatura do Atelier. Profunda, vegetal e atemporal.' 
  },
  { 
    id: 'safran-68-cafe', 
    name: 'DROPS Safran 68 (Café M★BRAVO)', 
    shortName: 'Safran Café',
    hex: '#5C3A21', 
    borderHex: '#422815', 
    desc: 'Pigmentação mineral castanha inspirada no grão de café e terra.' 
  },
  { 
    id: 'safran-01-rosa', 
    name: 'DROPS Safran 01 (Rosa do Deserto)', 
    shortName: 'Safran Rosa Deserto',
    hex: '#F4B3BA', 
    borderHex: '#E39DA5', 
    desc: 'Rosa terroso e delicado para detalhes sofisticados e femininos.' 
  },
  { 
    id: 'safran-76-azul-po', 
    name: 'DROPS Safran 76 (Azul Pó Marea)', 
    shortName: 'Safran Azul Pó',
    hex: '#B8D8EB', 
    borderHex: '#9DC1D8', 
    desc: 'Tom oceânico sereno com reflexos aveludados em malha fechada.' 
  },
  { 
    id: 'paris-17-natural', 
    name: 'DROPS Paris 17 (Natural Estruturado)', 
    shortName: 'Paris Natural',
    hex: '#F3EBE1', 
    borderHex: '#DDD2C3', 
    desc: '100% Algodão Virgem Encorpado (50g) ideal para peças de estrutura firme.' 
  },
  { 
    id: 'paris-43-verde-musgo', 
    name: 'DROPS Paris 43 (Verde Musgo)', 
    shortName: 'Paris Verde Musgo',
    hex: '#536D43', 
    borderHex: '#3B502F', 
    desc: 'Algodão rústico encorpado para mantas decorativas e grandes volumes.' 
  },
  { 
    id: 'paris-35-baunilha', 
    name: 'DROPS Paris 35 (Baunilha Dourada)', 
    shortName: 'Paris Baunilha',
    hex: '#F8C53A', 
    borderHex: '#D9AA2B', 
    desc: 'Tom sol de verão para destaques vibrantes e acabamentos de festa.' 
  }
];

// 2. Official M★BRAVO Catalog Pieces with Real Pricing & Crafting Time Formulas
const CUSTOM_PIECE_TYPES = [
  { 
    id: 'cardigan-alma', 
    name: 'Cardigan Alma (Vestuário Autoral)', 
    shortName: 'Cardigan Alma',
    baseHours: 35, 
    basePrice: 97, 
    leadTime: '15-20 dias úteis',
    desc: 'Peça de vestuário de alta-costura em crochet com abotoamento frontal e punhos canelados.'
  },
  { 
    id: 'mala-b2-sling', 
    name: 'Mala B2 Sling (Mala em Crochet)', 
    shortName: 'Mala B2 Sling',
    baseHours: 18, 
    basePrice: 47, 
    leadTime: '10-15 dias úteis',
    desc: 'Mala de ombro utilitária e elegante com pala arredondada e estrutura reforçada.'
  },
  { 
    id: 'pouch-b1-mini', 
    name: 'Pouch B1 Mini (Mini Mala & Acessório)', 
    shortName: 'Pouch B1 Mini',
    baseHours: 12, 
    basePrice: 37, 
    leadTime: '7-12 dias úteis',
    desc: 'Bolsa compacta para essenciais, porta-chaves ou Airpods com fecho artesanal.'
  },
  { 
    id: 'poncho-v1', 
    name: 'Poncho V1 / V2C (Acessório Nobre)', 
    shortName: 'Poncho V1',
    baseHours: 24, 
    basePrice: 67, 
    leadTime: '12-16 dias úteis',
    desc: 'Capa envolvente de ombros com drapeado natural e gola estruturada.'
  },
  { 
    id: 'decor-h2b', 
    name: 'Almofada H2B (Decor para a Casa)', 
    shortName: 'Almofada H2B',
    baseHours: 15, 
    basePrice: 40, 
    leadTime: '8-12 dias úteis',
    desc: 'Peça decorativa para a casa com borlas nos cantos e ponto rendado exclusivo.'
  }
];

// 3. Official Finishing Details & Accessories from Admin Catalog Rules
const HARDWARE_OPTIONS = [
  { 
    id: 'fecho-imantado', 
    name: 'Fecho Íman Oculto & Botão Madeira M★BRAVO', 
    shortName: 'Fecho Íman & Botão Madeira',
    extraCost: 0,
    desc: 'Fecho magnético invisível complementado com o icónico botão de madeira gravado.'
  },
  { 
    id: 'zip-metal-forro', 
    name: 'Fecho Zíper Metálico Dourado com Forro de Algodão', 
    shortName: 'Zíper Dourado & Forro',
    extraCost: 8,
    desc: 'Zíper metálico de alta durabilidade com forro interno de algodão costurado à mão.'
  },
  { 
    id: 'alca-crochet', 
    name: 'Alça em Crochet Manual Contínuo Reforçado', 
    shortName: 'Alça Crochet Contínua',
    extraCost: 5,
    desc: 'Alça tecida no mesmo ponto da peça com núcleo estrutural para não ceder.'
  },
  { 
    id: 'alca-pele', 
    name: 'Alça em Pele Genuína Removível com Mosquetões', 
    shortName: 'Alça Pele Genuína',
    extraCost: 12,
    desc: 'Pele genuína em tom castanho nobre com ferragens metálicas douradas removíveis.'
  }
];

// Admin Calculator Rules: Dynamically compute budget range, materials cost & labor hours
function calculatePieceSpecs(
  piece: typeof CUSTOM_PIECE_TYPES[0],
  isBicolor: boolean,
  hardware: typeof HARDWARE_OPTIONS[0]
) {
  let totalHours = piece.baseHours;
  if (isBicolor) {
    // Multi-zone bicolor weaving adds ~15% extra handcrafting time for thread changes & seamless joins
    totalHours = Math.round(totalHours * 1.15);
  }

  const extraCost = hardware.extraCost || 0;
  const minPrice = piece.basePrice + extraCost + (isBicolor ? 6 : 0);
  const maxPrice = Math.round(minPrice * 1.35);

  const materialsEst = Math.round(minPrice * 0.38);
  const laborEst = minPrice - materialsEst;

  return {
    hours: totalHours,
    minPrice,
    maxPrice,
    budgetRange: `${minPrice}€ - ${maxPrice}€`,
    materialsEst,
    laborEst
  };
}

// Highly Refined Vector SVG Renderer simulating tactile crochet, realistic depth & metallic hardware
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
    <div className="relative w-full aspect-[4/3] bg-[#0A0F08] border border-[#C5A059]/40 rounded-2xl overflow-hidden flex items-center justify-center shadow-[inset_0_0_30px_rgba(0,0,0,0.9)] group">
      {/* Soft Luxury Volumetric Lighting Behind Product */}
      <div 
        className="absolute inset-0 opacity-25 transition-all duration-700 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 45%, ${pColor} 0%, rgba(197,160,89,0.15) 45%, transparent 75%)`
        }}
      />

      {/* Grid Pattern Background for Atelier Technical Canvas */}
      <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#C5A059_1px,transparent_1px),linear-gradient(to_bottom,#C5A059_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />

      <svg 
        viewBox="0 0 320 250" 
        className="w-full h-full max-h-[230px] drop-shadow-[0_15px_25px_rgba(0,0,0,0.85)] transition-all duration-500 relative z-10"
      >
        <defs>
          {/* Gold Metallic Shimmer Gradient */}
          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E6CA85" />
            <stop offset="35%" stopColor="#C5A059" />
            <stop offset="70%" stopColor="#D4B06A" />
            <stop offset="100%" stopColor="#8F723B" />
          </linearGradient>

          {/* Leather Strap Shimmer Gradient */}
          <linearGradient id="leatherGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7A4B2A" />
            <stop offset="50%" stopColor="#5C3A21" />
            <stop offset="100%" stopColor="#3D2412" />
          </linearGradient>

          {/* Dynamic Volumetric Shading for Primary Color */}
          <radialGradient id="primary3D" cx="40%" cy="30%" r="70%">
            <stop offset="0%" stopColor={pColor} />
            <stop offset="100%" stopColor={pColor} style={{ filter: 'brightness(0.72)' }} />
          </radialGradient>

          {/* Dynamic Volumetric Shading for Secondary Color */}
          <radialGradient id="secondary3D" cx="40%" cy="30%" r="70%">
            <stop offset="0%" stopColor={sColor} />
            <stop offset="100%" stopColor={sColor} style={{ filter: 'brightness(0.72)' }} />
          </radialGradient>

          {/* Tactile Interlocking Crochet Loop Pattern */}
          <pattern id="crochetTexture" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 0 5 Q 5 0 10 5 Q 5 10 0 5 Z" fill="none" stroke="rgba(0,0,0,0.18)" strokeWidth="0.9" />
            <path d="M 5 0 Q 10 5 5 10 Q 0 5 5 0 Z" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
          </pattern>
        </defs>

        {/* 1. CARDIGAN ALMA */}
        {pieceId === 'cardigan-alma' && (
          <g className="transition-all duration-500">
            {/* Main Torso & Body */}
            <path 
              d="M 90 70 L 125 70 L 160 90 L 195 70 L 230 70 L 240 195 L 80 195 Z" 
              fill="url(#primary3D)" 
              stroke="#080C06" 
              strokeWidth="2.5" 
            />
            {/* Left Sleeve */}
            <path d="M 90 70 L 50 135 L 78 145 L 102 92 Z" fill="url(#primary3D)" stroke="#080C06" strokeWidth="2" />
            {/* Right Sleeve */}
            <path d="M 230 70 L 270 135 L 242 145 L 218 92 Z" fill="url(#primary3D)" stroke="#080C06" strokeWidth="2" />

            {/* Crochet Texture Overlay */}
            <path 
              d="M 90 70 L 125 70 L 160 90 L 195 70 L 230 70 L 240 195 L 80 195 Z" 
              fill="url(#crochetTexture)" 
            />

            {/* Ribbed Placket & Collar (Secondary Color if Bicolor) */}
            <path 
              d="M 125 70 L 160 112 L 195 70 L 175 195 L 145 195 Z" 
              fill="url(#secondary3D)" 
              stroke="#080C06" 
              strokeWidth="1.8" 
            />
            {/* Sleeve Cuffs */}
            <rect x="50" y="133" width="28" height="12" rx="3" fill="url(#secondary3D)" stroke="#080C06" strokeWidth="1" />
            <rect x="242" y="133" width="28" height="12" rx="3" fill="url(#secondary3D)" stroke="#080C06" strokeWidth="1" />
            {/* Hem Band */}
            <rect x="80" y="185" width="160" height="10" rx="3" fill="url(#secondary3D)" stroke="#080C06" strokeWidth="1" />

            {/* Wood Buttons or Zipper */}
            {hardware.id === 'zip-metal-forro' ? (
              <line x1="160" y1="112" x2="160" y2="185" stroke="url(#goldGradient)" strokeWidth="3" strokeDasharray="2 1" />
            ) : (
              <g>
                <circle cx="160" cy="130" r="5" fill="#8F5C38" stroke="url(#goldGradient)" strokeWidth="1.2" />
                <circle cx="160" cy="152" r="5" fill="#8F5C38" stroke="url(#goldGradient)" strokeWidth="1.2" />
                <circle cx="160" cy="174" r="5" fill="#8F5C38" stroke="url(#goldGradient)" strokeWidth="1.2" />
              </g>
            )}

            {/* M★BRAVO Leather Brand Tag */}
            <rect x="86" y="172" width="22" height="10" rx="2" fill="url(#leatherGradient)" stroke="#8F723B" strokeWidth="0.8" />
            <text x="97" y="179" fill="#E6CA85" fontSize="5" fontWeight="bold" textAnchor="middle" fontFamily="serif">M★B</text>
          </g>
        )}

        {/* 2. MALA B2 SLING */}
        {pieceId === 'mala-b2-sling' && (
          <g className="transition-all duration-500">
            {/* Handle / Strap */}
            {hardware.id === 'alca-pele' ? (
              <g>
                <path d="M 110 85 C 110 22, 210 22, 210 85" fill="none" stroke="url(#leatherGradient)" strokeWidth="7" strokeLinecap="round" />
                <path d="M 110 85 C 110 22, 210 22, 210 85" fill="none" stroke="#E6CA85" strokeWidth="0.8" strokeDasharray="3 2" />
                {/* Brass Carabiner Rings */}
                <circle cx="110" cy="85" r="4.5" fill="none" stroke="url(#goldGradient)" strokeWidth="2" />
                <circle cx="210" cy="85" r="4.5" fill="none" stroke="url(#goldGradient)" strokeWidth="2" />
              </g>
            ) : (
              <path d="M 110 85 C 110 20, 210 20, 210 85" fill="none" stroke={sColor} strokeWidth="8" strokeDasharray="5 2" strokeLinecap="round" />
            )}

            {/* Main Pouch Body */}
            <rect x="75" y="85" width="170" height="120" rx="22" fill="url(#primary3D)" stroke="#080C06" strokeWidth="2.5" />
            <rect x="75" y="85" width="170" height="120" rx="22" fill="url(#crochetTexture)" />

            {/* Flap / Accent Band */}
            <path d="M 75 115 Q 160 160 245 115 L 245 85 Q 160 72 75 85 Z" fill="url(#secondary3D)" stroke="#080C06" strokeWidth="2" />
            <path d="M 75 115 Q 160 160 245 115 L 245 85 Q 160 72 75 85 Z" fill="url(#crochetTexture)" />

            {/* Hardware Closure */}
            {hardware.id === 'zip-metal-forro' ? (
              <rect x="80" y="82" width="160" height="6" rx="3" fill="url(#goldGradient)" />
            ) : (
              <circle cx="160" cy="122" r="8.5" fill="url(#goldGradient)" stroke="#5C3A21" strokeWidth="1.5" />
            )}

            {/* Leather Tag on Flap */}
            <rect x="148" y="148" width="24" height="11" rx="2" fill="url(#leatherGradient)" stroke="#8F723B" strokeWidth="0.8" />
            <text x="160" y="155.5" fill="#E6CA85" fontSize="5.5" fontWeight="bold" textAnchor="middle" fontFamily="serif">M★BRAVO</text>
          </g>
        )}

        {/* 3. POUCH B1 MINI */}
        {pieceId === 'pouch-b1-mini' && (
          <g className="transition-all duration-500">
            {/* Small Wrist Strap */}
            <path d="M 120 100 C 120 45, 160 45, 160 100" fill="none" stroke={sColor} strokeWidth="5" strokeDasharray="3 1.5" />

            {/* Compact Body */}
            <rect x="100" y="100" width="120" height="105" rx="16" fill="url(#primary3D)" stroke="#080C06" strokeWidth="2" />
            <rect x="100" y="100" width="120" height="105" rx="16" fill="url(#crochetTexture)" />

            {/* Mini Flap (Secondary Color if Bicolor) */}
            <path d="M 100 120 Q 160 150 220 120 L 220 100 Q 160 90 100 100 Z" fill="url(#secondary3D)" stroke="#080C06" strokeWidth="1.5" />

            {/* Wood Button Closure */}
            <circle cx="160" cy="124" r="6" fill="#8F5C38" stroke="url(#goldGradient)" strokeWidth="1.2" />

            {/* Leather Label */}
            <rect x="148" y="165" width="24" height="10" rx="2" fill="url(#leatherGradient)" stroke="#8F723B" strokeWidth="0.8" />
            <text x="160" y="172" fill="#E6CA85" fontSize="5" fontWeight="bold" textAnchor="middle" fontFamily="serif">M★B</text>
          </g>
        )}

        {/* 4. PONCHO V1 */}
        {pieceId === 'poncho-v1' && (
          <g className="transition-all duration-500">
            {/* Draped Cape Body */}
            <path d="M 160 45 L 265 160 L 160 215 L 55 160 Z" fill="url(#primary3D)" stroke="#080C06" strokeWidth="2.5" />
            <path d="M 160 45 L 265 160 L 160 215 L 55 160 Z" fill="url(#crochetTexture)" />

            {/* Neck Collar */}
            <path d="M 130 45 C 140 70, 180 70, 190 45 Z" fill="url(#secondary3D)" stroke="#080C06" strokeWidth="1.5" />

            {/* Bottom Fringe Border */}
            <path d="M 55 160 L 160 215 L 265 160 L 258 172 L 160 227 L 62 172 Z" fill="url(#secondary3D)" stroke="#080C06" strokeWidth="1.5" />

            {/* Star Brooch Detail */}
            <polygon points="160,52 162.5,58 168,58 163.5,61 165.5,67 160,63 154.5,67 156.5,61 152,58 157.5,58" fill="url(#goldGradient)" />
          </g>
        )}

        {/* 5. ALMOFADA H2B */}
        {pieceId === 'decor-h2b' && (
          <g className="transition-all duration-500">
            {/* Outer Frame Border */}
            <rect x="65" y="45" width="190" height="160" rx="20" fill="url(#secondary3D)" stroke="#080C06" strokeWidth="2.5" />
            {/* Inner Center Cushion Pattern */}
            <rect x="88" y="65" width="144" height="120" rx="12" fill="url(#primary3D)" stroke="#080C06" strokeWidth="1.5" />
            <rect x="88" y="65" width="144" height="120" rx="12" fill="url(#crochetTexture)" />

            {/* Corner Tassels */}
            <circle cx="65" cy="45" r="6.5" fill="url(#goldGradient)" />
            <circle cx="255" cy="45" r="6.5" fill="url(#goldGradient)" />
            <circle cx="65" cy="205" r="6.5" fill="url(#goldGradient)" />
            <circle cx="255" cy="205" r="6.5" fill="url(#goldGradient)" />

            {/* Center Leather Patch */}
            <rect x="148" y="115" width="24" height="10" rx="2" fill="url(#leatherGradient)" stroke="#8F723B" strokeWidth="0.8" />
            <text x="160" y="122" fill="#E6CA85" fontSize="5" fontWeight="bold" textAnchor="middle" fontFamily="serif">M★BRAVO</text>
          </g>
        )}
      </svg>

      {/* Floating Canvas Tag Bar */}
      <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[10px] font-mono bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-cream">
        <div className="flex items-center gap-1.5 min-w-0">
          <span
            className="w-3 h-3 rounded-full border border-white/30 shrink-0 bg-cover bg-center"
            style={{ background: getColorSwatchBg(primaryYarn.shortName || primaryYarn.name) }}
          />
          <span className="text-[#D4C3A3] font-sans font-medium truncate">
            {isBicolor ? `Corpo: ${primaryYarn.shortName}` : primaryYarn.shortName}
          </span>
        </div>
        {isBicolor && (
          <div className="flex items-center gap-1.5 min-w-0 shrink-0">
            <span
              className="w-3 h-3 rounded-full border border-white/30 shrink-0 bg-cover bg-center"
              style={{ background: getColorSwatchBg(secondaryYarn.shortName || secondaryYarn.name) }}
            />
            <span className="text-[#C5A059] font-sans font-medium truncate">
              Destaque: {secondaryYarn.shortName}
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
  const [selectedPiece, setSelectedPiece] = useState(CUSTOM_PIECE_TYPES[0]); // Cardigan Alma
  const [primaryYarn, setPrimaryYarn] = useState(YARN_PALETTES[1]); // Verde Floresta
  const [secondaryYarn, setSecondaryYarn] = useState(YARN_PALETTES[0]); // Natural
  const [isBicolor, setIsBicolor] = useState(true); // Default Bicolor Multi-Zona
  const [selectedHardware, setSelectedHardware] = useState(HARDWARE_OPTIONS[0]);
  const [customNotes, setCustomNotes] = useState('');
  const [clientName, setClientName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  if (!isOpen) return null;

  // Calculate real specs & budget using Admin Calculator formulas
  const specs = calculatePieceSpecs(selectedPiece, isBicolor, selectedHardware);

  // Palette string representation
  const paletteText = isBicolor 
    ? `${primaryYarn.name} (Corpo) + ${secondaryYarn.name} (Destaque)`
    : primaryYarn.name;

  // Generate formatted WhatsApp Passaporte Criativo text
  const generateWhatsAppMessage = () => {
    const namePart = clientName.trim() ? `O meu nome é ${clientName.trim()}. ` : '';
    const notesPart = customNotes.trim() ? ` | Notas: "${customNotes.trim()}"` : '';
    
    return `Olá Carolina! ${namePart}Criei o meu Passaporte Criativo M★BRAVO no Private Studio:
✦ Peça: ${selectedPiece.name}
✦ Paleta (${isBicolor ? 'Bicolor Multi-Zona' : 'Monocolor'}): ${paletteText}
✦ Detalhes/Acabamento: ${selectedHardware.name}
✦ Dedicação Estimada: ~${specs.hours}h de confeção manual (${specs.budgetRange})${notesPart}

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
      estimatedHours: `~${specs.hours} Horas`,
      estimatedBudget: specs.budgetRange,
      estimatedPrice: specs.budgetRange,
      notes: customNotes.trim()
    };

    // 1. Save in backend persistent store & localStorage
    try {
      fetch('/api/private-studio/passports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(passaporteCriativo)
      }).catch(err => console.warn('[PRIVATE STUDIO API] Submit notice:', err));

      const existing = JSON.parse(localStorage.getItem('mbravo_creative_passports') || '[]');
      existing.unshift(passaporteCriativo);
      localStorage.setItem('mbravo_creative_passports', JSON.stringify(existing.slice(0, 20)));
    } catch (err) {
      console.warn('[PRIVATE STUDIO] Storage save notice:', err);
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
                Customize a sua peça com as matérias-primas reais M★BRAVO e agende a sua consultoria privada com a Carolina.
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
                      {isBicolor ? 'Bicolor Multi-Zona' : 'Monocolor'}
                    </span>
                  </div>

                  {/* Visualizer Canvas Component with Smooth 200ms Cross-Fade */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`${selectedPiece.id}-${primaryYarn.id}-${secondaryYarn.id}-${isBicolor}-${selectedHardware.id}`}
                      initial={{ opacity: 0.82, scale: 0.99 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0.82, scale: 0.99 }}
                      transition={{ duration: 0.2, ease: 'easeOut' }}
                    >
                      <PieceVisualizerSVG 
                        pieceId={selectedPiece.id}
                        primaryYarn={primaryYarn}
                        secondaryYarn={secondaryYarn}
                        isBicolor={isBicolor}
                        hardware={selectedHardware}
                      />
                    </motion.div>
                  </AnimatePresence>

                  {/* Real-time Summary Badge (Integrated Admin Pricing Formula) */}
                  <div className="bg-[#1C2A15]/80 border border-[#C5A059]/30 rounded-2xl p-3.5 space-y-2.5 backdrop-blur-md text-left">
                    <div className="flex items-center justify-between border-b border-[#C5A059]/20 pb-2">
                      <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#C5A059] flex items-center gap-1.5">
                        <ShieldCheck size={14} />
                        Cálculo do Atelier (Calculadora Admin)
                      </span>
                      <span className="text-[10px] font-mono text-[#D4C3A3]/80 font-semibold">
                        {selectedPiece.shortName}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="block text-[9px] uppercase tracking-wider text-[#D4C3A3]/60">Dedicação Artesanal</span>
                        <span className="font-serif italic font-bold text-[#F5EEDC]">~{specs.hours} Horas Manuais</span>
                      </div>
                      <div>
                        <span className="block text-[9px] uppercase tracking-wider text-[#D4C3A3]/60">Estimativa Orçamento</span>
                        <span className="font-serif italic font-bold text-[#C5A059]">{specs.budgetRange}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-[#D4C3A3]/70 font-sans">
                      <span className="flex items-center gap-1">
                        <Award size={11} className="text-[#C5A059]" /> 100% Confecção Nacional
                      </span>
                      <span>Prazo: {selectedPiece.leadTime}</span>
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN: INTERACTIVE CONTROLS */}
                <div className="md:col-span-7 space-y-5 text-left">
                  
                  {/* 1. Escolha do Tipo de Peça */}
                  <div>
                    <label className="block text-[11px] uppercase tracking-[0.2em] font-sans font-bold text-[#C5A059] mb-2">
                      1. Selecione a Tipologia do Catálogo M★BRAVO
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
                            <p className="text-[10px] text-[#D4C3A3]/70 font-sans mt-1 line-clamp-1">
                              {piece.desc}
                            </p>
                            <div className="flex items-center gap-2 text-[10px] text-[#C5A059] font-sans font-medium mt-1">
                              <span className="flex items-center gap-1">
                                <Clock size={10} /> ~{piece.baseHours}h
                              </span>
                              <span>•</span>
                              <span>Desde {piece.basePrice}€</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 2. Toggle Modo de Cor (Monocolor vs Bicolor Multi-Zona) */}
                  <div className="bg-white/5 p-3.5 rounded-2xl border border-white/10 space-y-3.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] uppercase tracking-[0.2em] font-sans font-bold text-[#C5A059] flex items-center gap-1.5">
                        <Layers size={13} />
                        2. Fios de Algodão (DROPS Safran & Paris)
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
                          Bicolor Multi-Zona
                        </button>
                      </div>
                    </div>

                    {/* Zone 1: Cor Principal */}
                    <TextureSwatchPicker
                      label={isBicolor ? 'Cor Principal (Corpo / Base)' : 'Cor Principal da Peça'}
                      selectedColor={primaryYarn.shortName || primaryYarn.name}
                      yarnLineId={selectedPiece.id.includes('cardigan') || selectedPiece.id.includes('poncho') ? 'drops-safran' : 'drops-paris'}
                      onChange={(colorName) => {
                        const match = YARN_PALETTES.find(p => p.name.includes(colorName) || p.shortName.includes(colorName)) || {
                          id: `custom-${colorName}`,
                          name: `DROPS Safran (${colorName})`,
                          shortName: colorName,
                          hex: '#D8C3A5',
                          borderHex: '#C5A059',
                          desc: 'Algodão de fibra virgem M★BRAVO.'
                        };
                        setPrimaryYarn(match);
                      }}
                    />

                    {/* Zone 2: Cor Secundária (If Bicolor) */}
                    {isBicolor && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="pt-2 border-t border-white/10"
                      >
                        <TextureSwatchPicker
                          label="Cor Secundária (Aba / Bordos / Destaque)"
                          selectedColor={secondaryYarn.shortName || secondaryYarn.name}
                          yarnLineId={selectedPiece.id.includes('cardigan') || selectedPiece.id.includes('poncho') ? 'drops-safran' : 'drops-paris'}
                          onChange={(colorName) => {
                            const match = YARN_PALETTES.find(p => p.name.includes(colorName) || p.shortName.includes(colorName)) || {
                              id: `custom-${colorName}`,
                              name: `DROPS Safran (${colorName})`,
                              shortName: colorName,
                              hex: '#D8C3A5',
                              borderHex: '#C5A059',
                              desc: 'Algodão de fibra virgem M★BRAVO.'
                            };
                            setSecondaryYarn(match);
                          }}
                        />
                      </motion.div>
                    )}
                  </div>

                  {/* 3. Estilo de Acabamento & Ferragens */}
                  <div>
                    <label className="block text-[11px] uppercase tracking-[0.2em] font-sans font-bold text-[#C5A059] mb-2">
                      3. Acabamentos & Ferragens do Atelier
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {HARDWARE_OPTIONS.map((hw) => {
                        const isSelected = selectedHardware.id === hw.id;
                        return (
                          <div
                            key={hw.id}
                            onClick={() => setSelectedHardware(hw)}
                            className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-[#1C2A15] border-[#C5A059] text-[#F5EEDC] ring-1 ring-[#C5A059]'
                                : 'bg-white/5 border-white/10 text-[#D4C3A3]/80 hover:border-[#C5A059]/40'
                            }`}
                          >
                            <div className="flex items-center justify-between text-xs font-semibold text-[#F5EEDC]">
                              <span className="line-clamp-1">{hw.shortName}</span>
                              {isSelected && <Check size={14} className="text-[#C5A059] shrink-0" />}
                            </div>
                            <p className="text-[10px] text-[#D4C3A3]/60 font-sans mt-0.5 line-clamp-1">
                              {hw.desc}
                            </p>
                            {hw.extraCost > 0 && (
                              <span className="inline-block mt-1 text-[9px] font-mono text-[#C5A059] font-bold">
                                +{hw.extraCost}.00€ no orçamento
                              </span>
                            )}
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
                        className="w-full bg-transparent border-b border-[#C5A059]/30 py-2 text-xs text-[#F5EEDC] placeholder-[#D4C3A3]/40 focus:outline-none focus:border-[#C5A059] transition-all"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] uppercase tracking-[0.2em] font-sans font-semibold text-[#D4C3A3] mb-1">
                        Notas de Inspiração / Ocasião (Opcional)
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Para evento em Outubro, tons terrosos..."
                        value={customNotes}
                        onChange={(e) => setCustomNotes(e.target.value)}
                        className="w-full bg-transparent border-b border-[#C5A059]/30 py-2 text-xs text-[#F5EEDC] placeholder-[#D4C3A3]/40 focus:outline-none focus:border-[#C5A059] transition-all"
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
