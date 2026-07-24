import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useVelocity, useMotionValue, animate } from 'motion/react';
import { Menu, X, Instagram, Facebook, ArrowRight, ArrowLeft, ChevronLeft, ChevronRight, Share2, Mail, MessageCircle, Sparkles, Feather, Palette, Heart, Maximize2 } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import Lenis from 'lenis';
const AdminDashboardModal = React.lazy(() => import('./components/AdminDashboardModal'));
const LegalModal = React.lazy(() => import('./components/LegalModal'));
import { 
  useLanguage, 
  translateProduct, 
  translateCategory, 
  translateColor, 
  translateSize, 
  translateQuantity,
  translateBackendError
} from './translations';

// API Base URL config for Railway production backend vs local development
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// Strict email validation checking for invalid characters, spaces, and standard format in real time
export function isValidEmail(email: string): boolean {
  if (!email) return false;
  const trimmed = email.trim();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (trimmed.includes(' ') || trimmed.includes('@@') || trimmed.includes(',')) {
    return false;
  }
  return emailRegex.test(trimmed);
}

// Portuguese Postal Code Auto-Masking (XXXX-XXX)
export function formatPostalCodePT(val: string): string {
  if (!val) return '';
  const digits = val.replace(/\D/g, '').slice(0, 7);
  if (digits.length <= 4) return digits;
  return `${digits.slice(0, 4)}-${digits.slice(4)}`;
}

// Intelligent automatic spelling correction suggester (similar to Mailcheck library, zero external dependencies)
export function suggestCorrectEmail(email: string): string | null {
  if (!email) return null;
  let trimmed = email.trim().toLowerCase();
  
  // Replace trailing commas or typos
  trimmed = trimmed.replace(/,com$/, '.com');
  trimmed = trimmed.replace(/,pt$/, '.pt');
  trimmed = trimmed.replace(/,net$/, '.net');
  trimmed = trimmed.replace(/,org$/, '.org');
  
  // Fix multiple @ symbols
  if (trimmed.includes('@@')) {
    trimmed = trimmed.replace(/@@+/g, '@');
  }
  
  const parts = trimmed.split('@');
  if (parts.length !== 2) return null;
  const [local, domain] = parts;
  if (!local || !domain) return null;

  const domainSuggestions: Record<string, string> = {
    'gamil.com': 'gmail.com',
    'gmaill.com': 'gmail.com',
    'gmal.com': 'gmail.com',
    'gmeil.com': 'gmail.com',
    'gmial.com': 'gmail.com',
    'gamil.co': 'gmail.com',
    'gamil.com.pt': 'gmail.com',
    'gmail.co': 'gmail.com',
    'gmail.com.pt': 'gmail.com',
    'hotamil.com': 'hotmail.com',
    'hotmial.com': 'hotmail.com',
    'hotmaill.com': 'hotmail.com',
    'hotmal.com': 'hotmail.com',
    'outlok.com': 'outlook.com',
    'outloo.com': 'outlook.com',
    'yaho.com': 'yahoo.com',
    'yaho.com.br': 'yahoo.com',
    'icoud.com': 'icloud.com',
    'iclod.com': 'icloud.com',
    'icloud.co': 'icloud.com',
    'sapo,pt': 'sapo.pt',
    'sapo.p': 'sapo.pt'
  };

  if (domainSuggestions[domain]) {
    return `${local}@${domainSuggestions[domain]}`;
  }

  // Handle generic TLD typo checks
  if (domain.endsWith('.con')) {
    return `${local}@${domain.slice(0, -4)}.com`;
  }
  if (domain.endsWith('.cm')) {
    return `${local}@${domain.slice(0, -3)}.com`;
  }
  if (domain.endsWith('.coom')) {
    return `${local}@${domain.slice(0, -5)}.com`;
  }

  const candidate = `${local}@${domain}`;
  if (candidate !== email.trim().toLowerCase()) {
    return candidate;
  }

  return null;
}

// Hero background images for automatic rotation
const HERO_BACKGROUNDS = [
  {
    mobile: "/hero-bg-1-mobile.webp",
    desktop: "/hero-bg-1-desktop.webp",
    fallback: "https://i.ibb.co/KppF2KLq/Background.png"
  },
  {
    mobile: "/hero-bg-2-mobile.webp",
    desktop: "/hero-bg-2-desktop.webp",
    fallback: "https://i.ibb.co/Z6z6D2W9/Background04.png"
  },
  {
    mobile: "/hero-bg-3-mobile.webp",
    desktop: "/hero-bg-3-desktop.webp",
    fallback: "https://i.ibb.co/JjKC14LX/Backgrounde03.png"
  },
  {
    mobile: "/hero-bg-4-mobile.webp",
    desktop: "/hero-bg-4-desktop.webp",
    fallback: "https://i.ibb.co/nK7Y2Rc/Background06.png"
  }
];

// --- Constants & Types ---
const NAV_LINKS = [
  { name: 'História', href: '#sobre' },
  { name: 'Catálogo', href: '#collection' },
  { name: 'Contactos', href: '#contacto' },
];

const CONTACT_EMAIL = "encomendas@mbravobycarolina.com";
const EMAIL_SUBJECT = "Pedido de Informações - M★BRAVO";
const MAILTO_LINK = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(EMAIL_SUBJECT)}`;

const WHATSAPP_NUMBER = '351912828182';

// --- Pricing & Customization Logic ---
const BASE_PRICES: { [key: string]: number | string } = {
    'alma cardigan': 95,
    'm★bravo cardigan': 95,
    'geometric poncho': 75,
    'cozy mesh poncho': 55,
    'mesh poncho': 55,
    'signature granny poncho': 70,
    'mini alma cardigan': 55,
    'granny square bag': 75,
    'granny square sling bag': 45,
    'marea bikini set': 65,
    'luxury clutch': 45,
    'coral bikini top': 35,
    'crystalline top': 35,
    'african flower pouch': 35,
    'mini pouches': 12,
    'mini shell pouch': 20,
    'airpods case': 15,
    'booksleeve': 32,
    'stella cushion': 38,
    'dragonfly bandana': 28,
    'classic bandana': 25,
    'scarf hip bandana': 30,
    'dragonfly headband': 18,
    'placemats': 18,
    'bookmarks': 12,
    'daisycoasters': 4,
    'coralinecoasters': 4,
    'yellowcoasters': 4,
    'sunflowercoasters': 4,
    'bluecoasters': 4,
    'pinkcoasters': 4,
    'classiccoasters': 4
};

const getApprovedPrice = (name: string): number | string => {
    const n = name.toLowerCase().trim().replace(/\s+/g, '');
    // Try exact match first
    for (const key in BASE_PRICES) {
        const cleanKey = key.replace(/\s+/g, '');
        if (n === cleanKey) {
            return BASE_PRICES[key];
        }
    }
    // Substring fallback
    for (const key in BASE_PRICES) {
        const cleanKey = key.replace(/\s+/g, '');
        if (n.includes(cleanKey)) {
            return BASE_PRICES[key];
        }
    }
    return 'Sob Consulta';
};

const calculateProductRange = (name: string) => {
    const price = getApprovedPrice(name);
    if (typeof price === 'string') {
        return price;
    }
    return `${price}€`;
};

const cleanEditorialText = (text: string): string[] => {
    if (!text) return [];
    return text.split('\n')
        .map(line => {
            let cleared = line.trim();
            // Remove leading hyphens, bullets, or asterisks
            cleared = cleared.replace(/^[-*•●]\s*/, '');
            // Remove prefixes like "Material: ", "Care: ", etc.
            cleared = cleared.replace(/^(Material|Care|De manutenção|Opção Leve|Opção Cozy|Opção \d+|Opção \d):\s*/i, '');
            return cleared.trim();
        })
        .filter(Boolean);
};

interface MaterialOption {
    title?: string;
    description: string;
}

const parseMaterials = (text: string): MaterialOption[] => {
    if (!text) return [];
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    
    if (lines.length === 1 && !lines[0].startsWith('-') && !lines[0].startsWith('•') && !lines[0].startsWith('*')) {
        return [{ description: lines[0] }];
    }
    
    return lines.map(line => {
        let cleanLine = line.replace(/^[-*•●]\s*/, '').trim();
        
        // Match e.g. "Opção Leve: 100% algodão" or "Opção 2: 50% algodão / 50% lã" or "Material: 100% algodão"
        const matchColon = cleanLine.match(/^(Opção\s+[0-9a-zA-Záéíóúâêîôûàèìòùãõç]+|Opção\s+Leve|Opção\s+Cozy|Composição|Material|Detalhes|Dimensões)\s*:\s*(.*)$/i);
        if (matchColon) {
            return {
                title: matchColon[1],
                description: matchColon[2]
            };
        }
        
        // Match e.g. "Opção Leve (100% Algodão)" or "Opção 1: 100% algodão (opção leve)"
        return {
            description: cleanLine
        };
    });
};

export function getShippingEstimate(product: any, lang: 'pt' | 'en') {
  const stock = product.stock !== undefined && product.stock !== null && product.stock !== '' ? parseInt(product.stock, 10) : 0;
  
  if (stock > 0) {
    return {
      inStock: true,
      title: lang === 'pt' ? 'Artigo em Stock' : 'Item in Stock',
      desc: lang === 'pt' 
        ? 'Esta peça já se encontra confecionada por nós. O envio será processado no prazo imediato de 24h a 48h úteis.' 
        : 'This piece is already crafted by us. Shipping will be processed immediately within 24h to 48h business hours.',
      badge: lang === 'pt' ? 'Envio em 24h/48h' : 'Shipping 24h/48h'
    };
  } else {
    const craftingDays = product.craftingTime !== undefined && product.craftingTime !== null && product.craftingTime !== '' ? parseInt(product.craftingTime, 10) : 10;
    
    // Calculate date: today + craftingDays
    const estimateDate = new Date();
    estimateDate.setDate(estimateDate.getDate() + craftingDays);
    
    // Format date in PT or EN
    const formattedDate = estimateDate.toLocaleDateString(lang === 'pt' ? 'pt-PT' : 'en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    
    return {
      inStock: false,
      title: lang === 'pt' ? 'Peça por Encomenda (Produção Artesanal)' : 'Made to Order (Artisanal Production)',
      desc: lang === 'pt'
        ? `Por ser um artigo artesanal e não haver stock imediato, esta peça será tecida especialmente para si. O tempo estimado de produção é de ${craftingDays} dias, com expedição prevista para ${formattedDate}.`
        : `Since this is a handmade item with no immediate stock, this piece will be woven especially for you. Estimated crafting time is ${craftingDays} days, with shipping expected on ${formattedDate}.`,
      badge: lang === 'pt' ? `Produção: ${craftingDays} dias` : `Crafting: ${craftingDays} days`
    };
  }
}

export let SHOP_CATEGORIES = [
  {
    id: 'home',
    name: 'Casa',
    items: 'Coasters, Stella Cushion',
    img: 'https://i.ibb.co/j9LHyxq6/Firefly-Gemini-Flash-Imagem-com-ambiente-cosy-tema-handmade-crochet-usar-o-logo-em-label-de-cartao.png',
    products: [
      { 
        id: 'h1', 
        name: 'Daisy Coasters', 
        price: calculateProductRange('Daisy Coasters'), 
        img: 'https://i.ibb.co/mCmVm2rL/mockup-coosters-luxury-1.png',
        images: [
          'https://i.ibb.co/mCmVm2rL/mockup-coosters-luxury-1.png',
          'https://i.ibb.co/B2RnQ4cJ/mockup-coosters-luxury-4.png',
          'https://i.ibb.co/tTzJFNwF/mockup-coosters-luxury-3.png',
          'https://i.ibb.co/qL0PPg2G/mockup-coosters-luxury-2.png'
        ],
        description: "Bases em crochet inspiradas na delicadeza das margaridas e nos tons suaves da natureza. Um conjunto handmade pensado para trazer um toque cozy e acolhedor ao teu espaço.",
        material: "- Material: 100% algodão",
        care: "- Lavagem delicada\n- Secar na horizontal"
      },
      { 
        id: 'h1c', 
        name: 'Sunflower Coasters', 
        price: calculateProductRange('Sunflower Coasters'), 
        img: 'https://i.ibb.co/kVZvr34t/Sunflower-coasters-5.png',
        images: [
          'https://i.ibb.co/kVZvr34t/Sunflower-coasters-5.png',
          'https://i.ibb.co/7mtncnc/Sunflower-coasters-2.png',
          'https://i.ibb.co/JWxHQQwY/Sunflower-coasters-3.png',
          'https://i.ibb.co/27J2MWwz/Sunflower-coasters-4-4.png'
        ],
        description: "Bases em crochet inspiradas na beleza dos girassóis e nos seus tons quentes e acolhedores. Um conjunto handmade pensado para trazer um toque cozy e luminoso ao teu espaço.",
        material: "- Material: 100% algodão",
        care: "- Lavagem delicada\n- Secar na horizontal"
      },
      { 
        id: 'h1f', 
        name: 'Coraline Coasters', 
        price: calculateProductRange('Coraline Coasters'), 
        img: 'https://i.ibb.co/ZzRSR1V8/Coraline-coasters-6.png',
        images: [
          'https://i.ibb.co/ZzRSR1V8/Coraline-coasters-6.png',
          'https://i.ibb.co/mVxVF0MM/Coraline-coasters-2.png',
          'https://i.ibb.co/FqyRfSw2/Coraline-coasters-3.png',
          'https://i.ibb.co/WvPWRnhs/Coraline-coasters-4.png',
          'https://i.ibb.co/tpyY6NRY/Coraline-coasters-5.png'
        ],
        description: "Bases em crochet inspiradas no design Coraline, tecidas à mão com todo o carinho para trazer um toque aconchegante, elegante e especial ao teu espaço.",
        material: "- Material: 100% algodão",
        care: "- Lavagem delicada\n- Secar na horizontal"
      },
      { 
        id: 'h1_classic', 
        name: 'Classic Coasters', 
        price: calculateProductRange('Classic Coasters'), 
        img: 'https://i.ibb.co/qMXpNrT0/Blue-coasters-7.png',
        images: [
          'https://i.ibb.co/qMXpNrT0/Blue-coasters-7.png',
          'https://i.ibb.co/PGmrtMMx/Pink-coasters4-2.png',
          'https://i.ibb.co/WvBLxKxN/Pink-coasters5.png',
          'https://i.ibb.co/Kc6bxwjq/Pink-coasters3.png',
          'https://i.ibb.co/MypCdtFK/Blue-coasters5-2.png',
          'https://i.ibb.co/93h01qf9/Blue-coasters4.png',
          'https://i.ibb.co/BK4VfFCx/Blue-coasters6.png',
          'https://i.ibb.co/spZcZY4b/Yellow-Coaster6.png',
          'https://i.ibb.co/cXVG6sfL/Yellow-Coaster3.png',
          'https://i.ibb.co/VY68YgyL/Yellow-Coaster4.png'
        ],
        description: "Bases em crochet com um design floral clássico e delicado, pensadas para trazer um toque cozy e elegante ao teu espaço. Disponíveis em várias cores, mantendo sempre as pétalas brancas para um acabamento suave e delicado.",
        material: "- Material: 100% algodão",
        care: "- Lavagem delicada\n- Secar na horizontal"
      },
      { 
        id: 'h2b', 
        name: 'Stella Cushion', 
        price: calculateProductRange('Stella Cushion'), 
        img: 'https://i.ibb.co/zWNCP5Nx/Stella-Cushion-7-1.png',
        images: [
          'https://i.ibb.co/zWNCP5Nx/Stella-Cushion-7-1.png',
          'https://i.ibb.co/wFBSmPFt/Stella-Cushion-8.png',
          'https://i.ibb.co/spPW5TxT/Stella-Cushion-9.png',
          'https://i.ibb.co/KPtgjRk/Stella-Cushion-10.png'
        ],
        description: "Almofada decorativa em forma de estrela, feita à mão em crochet para dar um toque delicado e cozy a qualquer espaço. Perfeita para decorar camas, sofás, cadeiras, quartos infantis ou qualquer cantinho especial. Disponível em várias cores para combinar com diferentes estilos de decoração.",
        material: "- Material: 100% poliéster (Fio macio e estruturado, ideal para peças decorativas)",
        care: "- Limpeza delicada à mão\n- Secar na horizontal em superfície plana\n- Evitar torcer a peça"
      }
    ]
  },
  {
    id: 'bags',
    name: 'Malas',
    items: ' Mini Pouches, AirPods Case',
    img: 'https://i.ibb.co/nM8RVGGt/Capa-Malas.png',
    products: [
      { 
        id: 'b1', 
        name: 'African Flower Pouch', 
        price: calculateProductRange('African Flower Pouch'), 
        img: 'https://i.ibb.co/NnCJyRTF/African-Flower-Pouch-10-1.png',
        images: [
          'https://i.ibb.co/NnCJyRTF/African-Flower-Pouch-10-1.png',
          'https://i.ibb.co/TDL7gj28/African-Flower-Pouch-112-1.png',
          'https://i.ibb.co/jk86rkbh/Firefly-7.jpg',
          'https://i.ibb.co/PvjVXHPV/pouch-luxury-1.png',
        ],
        description: "Pouch em crochet com padrão African Flower, cuidadosamente feito à mão e forrado no interior para maior estrutura e proteção. Finalizado com fecho, é perfeito para guardar os teus essenciais do dia a dia com um toque cozy e handmade.",
        material: "- Material: 100% algodão\n- Detalhe: Forro interior em tecido",
        care: "- Lavagem delicada à mão\n- Secar na horizontal\n- Evitar máquina de secar",
        dimensions: "25 cm (largura) × 14 cm (altura)"
      },
      { 
        id: 'b1b', 
        name: 'Mini Pouches', 
        price: calculateProductRange('Mini Pouches'), 
        img: 'https://i.ibb.co/4RdPTkr4/Mini-pouches-CAPA.png',
        images: [
          'https://i.ibb.co/4RdPTkr4/Mini-pouches-CAPA.png',
          'https://i.ibb.co/GfxGK5d3/Mini-pouches-9.jpg',
          'https://i.ibb.co/1fcmcPSM/Mini-pouches-7.jpg',
          'https://i.ibb.co/356r9hSN/Mini-pouches-12.jpg'
        ],
        description: `Mini pouch em crochet feito à mão, criado com um design simples e intemporal para guardar pequenos essenciais do dia a dia.
Com fecho ajustável em cordão e um acabamento delicado handmade, é perfeito para moedas, cartões, joias, lip products ou pequenos tesouros do dia a dia.`,
        material: `- Fecho ajustável com cordão
- Ideal para moedas, cartões, joias ou pequenos acessórios
- Disponível em várias cores
- Composição: 100% algodão`,
        care: "- Lavagem delicada à mão\n- Secar na horizontal em superfície plana"
      },
      { 
        id: 'b1_airpods', 
        name: 'AirPods Case', 
        price: calculateProductRange('AirPods Case'), 
        img: 'https://i.ibb.co/b5QdC7vh/Air-Pods-case-9.jpg',
        images: [
          'https://i.ibb.co/b5QdC7vh/Air-Pods-case-9.jpg',
          'https://i.ibb.co/YBmMhjqX/Firefly-8.jpg',
          'https://i.ibb.co/S4zY5CbT/Air-Pods-case-1.jpg'
        ],
        description: "Capa para AirPods em crochet feita à mão, criada para proteger os teus auriculares com charme, estilo e um toque cozy especial. Prática, delicada e perfeita para o dia a dia.",
        material: `- Design minimalista e intemporal
- Ajuste seguro à caixa dos AirPods
- Disponível em várias combinações de cores
- Composição: 100% algodão`,
        care: "- Lavagem delicada à mão\n- Secar na horizontal em superfície plana"
      },
      { 
        id: 'b2_sling', 
        name: 'Granny Square Sling Bag', 
        price: calculateProductRange('Granny Square Sling Bag'), 
        img: 'https://i.ibb.co/wNdC8NNG/Granny-square-sling-bag-20.png',
        images: [
          'https://i.ibb.co/wNdC8NNG/Granny-square-sling-bag-20.png',
          'https://i.ibb.co/1t3HW02t/Granny-square-sling-bag-12.png',
          'https://i.ibb.co/JjC82Njj/Granny-square-sling-bag-13.png',
          'https://i.ibb.co/Df0JxNDd/Granny-square-sling-bag-14.png'
        ],
        description: "Mala em crochet com padrão Granny Square floral, cuidadosamente feita à mão e forrada no interior para maior estrutura e durabilidade. Com alça ajustável e fecho de correr, pode ser usada à cintura, a tiracolo ou ao ombro, adaptando-se facilmente ao teu estilo e às tuas necessidades do dia a dia.\nDimensões aproximadas: 26 cm (largura) × 11 cm (altura)",
        material: "- Material: 100% algodão de alta qualidade\n- Detalhe: Forro interno macio para maior segurança e estrutura",
        care: "- Lavagem delicada à mão\n- Secar na horizontal\n- Não utilizar máquina de secar"
      },
      { 
        id: 'b2_shell', 
        name: 'Mini shell Pouch', 
        price: calculateProductRange('Mini shell Pouch'), 
        img: 'https://i.ibb.co/VY1dx3nt/Mini-shell-Pouch.png',
        images: [
          'https://i.ibb.co/VY1dx3nt/Mini-shell-Pouch.png',
          'https://i.ibb.co/bRv6mfKC/Mini-shell-Pouch-1.png',
          'https://i.ibb.co/N6QD0ksq/Mini-shell-Pouch-2.png',
          'https://i.ibb.co/TDMrr2tc/Mini-shell-Pouch-3.png'
        ],
        description: `Mini pouch em crochet com design inspirado em conchas, cuidadosamente feita à mão.
Compacta e prática, fecha com um botão de madeira com estrela, um detalhe especial que reflete a identidade da marca, sendo perfeita para guardar os teus essenciais do dia a dia com um toque cozy e handmade.`,
        material: `- Detalhes: Ideal para moedas, auriculares/AirPods, anéis e pequenos tesouros do dia a dia
- Dimensões: 8,5 cm (largura) × 7,5 cm (altura)
- Composição: 100% algodão
- Material: Botão em madeira`,
        care: "- Lavagem delicada\n- Secar na horizontal"
      }
    ]
  },
  {
    id: 'vestuario',
    name: 'Vestuário',
    items: 'Bikini, Ponchos, Cardigans',
    img: 'https://i.ibb.co/CKMWVc9L/IMG-2691.jpg',
    products: [
      { 
        id: 'v1', 
        name: 'Marea Bikini Set', 
        price: calculateProductRange('Marea Bikini Set'), 
        img: 'https://i.ibb.co/whQzXMvv/Bikini-CAPA.png',
        images: [
          'https://i.ibb.co/whQzXMvv/Bikini-CAPA.png',
          'https://i.ibb.co/Dfzz9dm2/BIKINI-FRENTE.png'
        ],
        description: "Biquíni em crochet feito à mão, pensado para os dias de verão e momentos à beira-mar. O Marea Bikini combina um design de riscas delicadas com um ajuste confortável, criando um look handmade, minimalista e cozy. Disponível em várias combinações de cores.",
        material: "- Material: 100% algodão",
        care: "- Lavar à mão\n- Secar à sombra"
      },
      { 
        id: 'v1b', 
        name: 'Coral Bikini Top', 
        price: calculateProductRange('Coral Bikini Top'), 
        img: 'https://i.ibb.co/sv0rY2J1/IMG-3187.jpg',
        images: [
          'https://i.ibb.co/sv0rY2J1/IMG-3187.jpg',
          'https://i.ibb.co/TBYpCxxR/IMG-2959.jpg',
          'https://i.ibb.co/N2QHbvnL/IMG-3020.jpg',
          'https://i.ibb.co/sd7FbbXr/IMG-2935-2.jpg'
        ],
        description: `Bikini top em crochet feito à mão, com um design triangular clássico e detalhes delicados.
Ajustável no pescoço e nas costas para um ajuste confortável e personalizado.
Disponível em várias combinações de cores, foi criado para acompanhar os dias de verão com um toque artesanal.`,
        material: "- Material: 100% algodão",
        care: "- Lavar à mão\n- Secar à sombra"
      },
      { 
        id: 'v2b', name: 'Mesh Poncho', price: calculateProductRange('Mesh Poncho'), img: 'https://i.ibb.co/Qj7Lgf1Q/Poncho-2.png',
        images: [
          'https://i.ibb.co/Qj7Lgf1Q/Poncho-2.png',
          'https://i.ibb.co/TBWgdX6h/Poncho-3.png',
        ],
        description: "Poncho em crochet leve e delicado, feito à mão com um design de malha aberta para um look effortless and cozy. Perfeito para sobrepor a tops, vestidos ou biquínis, criando um toque elegante e descontraído ao outfit. Disponível em várias cores.",
        material: "- Material: 100% algodão",
        care: "- Lavagem delicada à mão\n- Secar na horizontal\n- Evitar máquina de secar"
      },
      { 
        id: 'v2c', 
        name: 'Signature Granny Poncho', 
        price: calculateProductRange('Signature Granny Poncho'), 
        img: 'https://i.ibb.co/3907byLt/IMG-2738-2.jpg',
        images: [
          'https://i.ibb.co/3907byLt/IMG-2738-2.jpg',
          'https://i.ibb.co/gbVfh1Nc/IMG-2858.jpg',
          'https://i.ibb.co/TBVVLngk/IMG-2720.jpg',
          'https://i.ibb.co/qMKY04T8/IMG-2806.jpg',
          'https://i.ibb.co/YB0LYVMV/IMG-2891.jpg',
          'https://i.ibb.co/RTggwnnR/IMG-2856.jpg'
        ],
        description: "Poncho em crochet feito à mão, criado com um clássico padrão granny stitch e combinação de duas cores para um look cozy e intemporal. Com um ajuste confortável e textura aconchegante, é perfeito para sobrepor a diferentes looks e acrescentar um toque handmade e effortless ao visual.",
        details: "• Ideal para layering em diferentes looks\n• Disponível em várias combinações de cores",
        material: "- Composição: 100% algodão egípcio de alta qualidade ou mistura de algodão and lã macia (Consulte para opções)",
        care: "- Lavagem delicada à mão com sabão neutro\n- Secar na horizontal em superfície plana\n- Evitar máquina de secar"
      },
      { 
        id: 'alma_cardigan', 
        name: 'Alma Cardigan', 
        price: calculateProductRange('Alma Cardigan'), 
        img: 'https://i.ibb.co/Xk8DF1Y7/Alma-Cardigan.jpg',
        images: [
          'https://i.ibb.co/Xk8DF1Y7/Alma-Cardigan.jpg',
          'https://i.ibb.co/bMHd2XWZ/Alma-Cardigan.png',
          'https://i.ibb.co/N2jxrrx3/image.png',
          'https://i.ibb.co/JR9rXrty/image-3.png'
        ],
        description: "Cardigan em crochet feito à mão com granny squares clássicos e um design cozy e intemporal. Uma peça confortável e delicada, perfeita para dias frescos de verão, outono ou para criar um look mais acolhedor e effortless. Disponível em várias combinações de cores e materiais.",
        material: "- Opção 1: 100% algodão (Leve, respirável e ideal para dias mais amenos ou meia-estação)\n- Opção 2: 50% algodão / 50% lã (Mais quente, macio e aconchegante, ideal para dias mais frios)",
        care: "- Lavagem delicada à mão\n- Secar na horizontal em superfície plana\n- Evitar torcer a peça",
        details: "- Modelo de manga comprida\n- Fecho em laço frontal"
      },
      { 
        id: 'mini_alma_cardigan', 
        name: 'Mini Alma Cardigan', 
        price: calculateProductRange('Mini Alma Cardigan'), 
        img: 'https://i.ibb.co/8nQtzsbY/Mini-Alma-Cardigan-1.jpg',
        images: [
          'https://i.ibb.co/8nQtzsbY/Mini-Alma-Cardigan-1.jpg',
          'https://i.ibb.co/PzzS4Vm2/Mini-Alma-Cardigan-4.jpg',
          'https://i.ibb.co/4nXVDvLh/Mini-Alma-Cardigan-3.jpg'
        ],
        sizes: ['2 anos', '4 anos', '6 anos'],
        description: "Versão mini do Alma Cardigan, feita à mão em crochet com granny squares clássicos e um design cozy e intemporal. Pensado para os mais pequenos, combina conforto, delicadeza e um toque handmade especial. Disponível em várias combinações de cores and materiais.",
        material: "- Opção Leve: 100% algodão\n- Opção Cozy: 50% algodão, 50% lã",
        care: "- Lavagem delicada à mão\n- Secar na horizontal em superfície plana\n- Evitar máquina de secar",
        details: "- Modelo de manga comprida\n- Fecho em laço frontal"
      }
    ]
  },
  {
    id: 'premium',
    name: 'Acessórios',
    items: 'Bandanas, Headbands,',
    img: 'https://i.ibb.co/ZpMNXV24/Capa-Acessorios.jpg',
    products: [
      { 
        id: 'v3', 
        name: 'Dragonfly Bandana', 
        price: calculateProductRange('Dragonfly Bandana'), 
        img: 'https://i.ibb.co/xqRg1L26/IMG-2833.jpg',
        images: [
          'https://i.ibb.co/xqRg1L26/IMG-2833.jpg',
          'https://i.ibb.co/Hs65ksV/IMG-2777.jpg',
          'https://i.ibb.co/h1ZRfGbb/IMG-2770.jpg',
          'https://i.ibb.co/XfWmYnYm/IMG-2753.jpg',
          'https://i.ibb.co/nNbwppxF/Bandana-LIBELINHA-capa.png',
          'https://i.ibb.co/M5hJdHrK/Dragonfly-Bandana-Libelinha-1.png',
          'https://i.ibb.co/HDzn9x8m/Dragonfly-Bandana-Libelinha-3.png'
        ],
        description: "Bandana em crochet com delicado padrão de libelinhas, feita à mão para dar um toque cozy e especial ao teu look. Leve, confortável e versátil, perfeita para usar no dia a dia. Disponível em várias cores e em duas opções de material.",
        material: "- Opção 1: 100% algodão (opção leve)\n- Opção 2: 50% algodão, 50% lã (opção mais cozy)",
        care: "- Lavagem delicada\n- Secar na horizontal"
      },
      { 
        id: 'v3b', 
        name: 'Classic Bandana', 
        price: calculateProductRange('Classic Bandana'), 
        img: 'https://i.ibb.co/PZHFmt0D/Bandanas-2.png',
        images: [
          'https://i.ibb.co/PZHFmt0D/Bandanas-2.png',
          'https://i.ibb.co/KxvZDqZY/Bandanas-6.png',
          'https://i.ibb.co/JjHRR7vq/Bandanas-3.png',
          'https://i.ibb.co/HfSJtngW/Bandanas-1.png'
        ],
        description: `Bandana em crochet feita à mão, com um design clássico em granny stitch.
Leve, versátil e ajustável através de fitas, foi criada para complementar qualquer look com um toque artesanal e intemporal.
Disponível em várias cores.`,
        material: "- Opção 1: 100% algodão (opção leve)\n- Opção 2: 50% algodão, 50% lã (opção mais cozy)",
        care: "- Lavagem delicada\n- Secar na horizontal"
      },
      { 
        id: 'h3', 
        name: 'Dragonfly Headband', 
        price: calculateProductRange('Dragonfly Headband'), 
        img: 'https://i.ibb.co/yckQG5rv/Dragonfly-Headband.png',
        images: [
          'https://i.ibb.co/yckQG5rv/Dragonfly-Headband.png',
          'https://i.ibb.co/zWwqkHxZ/Dragonfly-Headband-Costas.png',
          'https://i.ibb.co/xSf76VVQ/Dragonfly-Headband-2.png'
        ],
        description: "Headband em crochet com delicado padrão de libelinhas, feita à mão para um toque leve e especial no dia a dia. Confortável, versátil e perfeita para complementar qualquer look com um detalhe handmade e cozy. Disponível em várias cores.",
        material: "- Material: 100% algodão",
        care: "- Lavagem delicada à mão\n- Secar na horizontal\n- Evitar máquina de secar"
      },
      { 
        id: 'v3c', 
        name: 'Scarf Hip Bandana', 
        price: calculateProductRange('Scarf Hip Bandana'), 
        img: 'https://i.ibb.co/YFjN9D5K/Scarf-Hip-Bandana.png',
        images: [
          'https://i.ibb.co/YFjN9D5K/Scarf-Hip-Bandana.png',
          'https://i.ibb.co/vCrXKGMM/Scarf-Hip-Bandana02.png',
          'https://i.ibb.co/TD45GRqx/Scarf-Hip-Bandana03.png',
          'https://i.ibb.co/yB5QZ0rP/Scarf-Hip-Bandana-20.png'
        ],
        description: `Peça em crochet leve e versátil, cuidadosamente feita à mão.
Pode ser usada como hip scarf ou bandana, adicionando um toque boho e handmade a qualquer look.
Perfeita para os dias mais quentes ou para complementar o teu estilo de forma única e delicada.`,
        material: "- Material: 100% algodão premium leve e fresco\n- Acabamento: Detalhe de franjas artesanais na extremidade",
        care: "- Lavagem delicada à mão com sabão neutro\n- Secar horizontalmente à sombra para preservar as franjas\n- Não utilizar máquina de secar"
      }
    ]
  }
];

// Luxury Futurist Models
const PRODUCTS = [
  { 
    id: 1, 
    title: 'Aura Crystalline', 
    desc: 'Um volume arquitetónico que desafia a gravidade, marcado pela assinatura linear de Carolina. Cada ponto é uma coordenada num mapa de luxo sensorial.',
    img: 'https://images.unsplash.com/photo-1614633833026-07205c9d640f?auto=format&fit=crop&q=80&w=800', 
    price: '€285' 
  },
  { 
    id: 2, 
    title: 'Nebula Silk', 
    desc: 'A fluidez da malha encontra o design de impacto. Uma peça que carrega o DNA autoral da marca em texturas que parecem esculpidas pela luz.',
    img: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&q=80&w=800', 
    price: '€310' 
  },
  { 
    id: 3, 
    title: 'Vector Nomad', 
    desc: 'O equilíbrio perfeito entre o saber-fazer manual e o utilitarismo futurista. Uma declaração de exclusividade gravada em cada entrelaçar de fio.',
    img: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800', 
    price: '€245' 
  },
];

// --- Components ---

const LogoIcon = ({ className = "h-6", light = false }: { className?: string; light?: boolean }) => {
  const color = light ? '#FAF9F6' : '#243119';
  return (
    <svg viewBox="0 0 120 120" className={className} fill="none">
      <path 
        d="M60 0 L78 38 L118 42 L90 71 L96 111 L60 93 L24 111 L30 71 L2 42 L42 38 Z" 
        fill={color} 
      />
      <text 
        x="60" 
        y="72" 
        textAnchor="middle" 
        fill={light ? '#243119' : '#FAF9F6'} 
        style={{ fontSize: '32px', fontFamily: 'Playfair Display, serif', fontWeight: 'bold' }}
      >
        M
      </text>
    </svg>
  );
};

const Logo = ({ className = "h-12", light = false }: { className?: string, light?: boolean }) => {
  const primaryColor = light ? '#C5A059' : '#243119'; // Gold for dark backgrounds, New Brand Green for light
  
  return (
    <div className={`${className} flex items-center justify-center transition-svg`}>
      <svg 
        viewBox="0 0 500 430" 
        className="w-full h-full"
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <path id="handmadePath" d="M 135 80 A 380 380 0 0 1 365 80" fill="none" />
        </defs>

        {/* HANDMADE On Curved Path */}
        <text 
          fill={primaryColor} 
          style={{ fontSize: '12px', letterSpacing: '0.85em', fontWeight: 600, fontFamily: "'Cormorant Garamond', serif" }}
        >
          <textPath href="#handmadePath" startOffset="50%" textAnchor="middle">
            HANDMADE
          </textPath>
        </text>

        {/* STAR WITH M */}
        <g transform="translate(250, 135)">
          <path 
            d="M0 -45 L13 -16 L44 -13 L22 8 L27 38 L0 24 L-27 38 L-22 8 L-44 -13 L-13 -16 Z" 
            fill={primaryColor} 
          />
          <text 
            y="9" 
            textAnchor="middle" 
            fill={light ? '#243119' : '#FAF9F6'} 
            style={{ fontSize: '24px', fontFamily: "'Cormorant Garamond', serif", fontWeight: 'bold' }}
          >
            M
          </text>
        </g>

        {/* BRAVO */}
        <text 
          x="50%" 
          y="310" 
          textAnchor="middle" 
          fill={primaryColor} 
          style={{ fontSize: '105px', fontFamily: "'Cormorant Garamond', serif", letterSpacing: '0.04em', fontWeight: 400 }}
        >
          BRAVO
        </text>

        {/* BY CAROLINA with Lines */}
        <g transform="translate(250, 395)">
          <text 
            x="0" 
            y="0" 
            textAnchor="middle" 
            fill={primaryColor} 
            style={{ fontSize: '12px', letterSpacing: '0.6em', fontWeight: 600, fontFamily: "'Cormorant Garamond', serif" }}
          >
            BY CAROLINA
          </text>
          
          {/* Decorative Lines */}
          <line x1="-135" y1="-4" x2="-90" y2="-4" stroke={primaryColor} strokeWidth="1.2" opacity={light ? "0.8" : "0.5"} />
          <line x1="90" y1="-4" x2="135" y2="-4" stroke={primaryColor} strokeWidth="1.2" opacity={light ? "0.8" : "0.5"} />
        </g>
      </svg>
    </div>
  );
};

const LoadingScreen = ({ onComplete }: { onComplete: () => void; key?: string }) => {
  const { t } = useLanguage();
  const onCompleteRef = useRef(onComplete);
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const timer = setTimeout(() => {
      onCompleteRef.current();
    }, 2600);
    return () => clearTimeout(timer);
  }, []);

  // Smooth numerical percentage counter 0% -> 100%
  useEffect(() => {
    const startTime = Date.now();
    const duration = 2400;
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.floor((elapsed / duration) * 100));
      setProgress(pct);
      if (pct >= 100) clearInterval(interval);
    }, 25);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-[100] bg-[#1F2A18] flex flex-col items-center justify-center overflow-hidden select-none px-6"
      exit={{ opacity: 0, y: '-100%', transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] } }}
    >
      {/* Dynamic Ambient Background Illumination - Light wave moving across forest background */}
      <motion.div 
        initial={{ x: "-100%", opacity: 0 }}
        animate={{ x: ["-60%", "30%", "140%"], opacity: [0.1, 0.4, 0.1] }}
        transition={{ duration: 2.5, ease: "easeInOut" }}
        className="absolute inset-y-0 w-[70vw] bg-[radial-gradient(ellipse_at_center,rgba(230,198,137,0.3)_0%,rgba(230,198,137,0.08)_45%,transparent_75%)] pointer-events-none blur-3xl"
      />

      {/* Fluid Handcrafted Golden Threads ("Os Fios M★BRAVO - Alinhavo a Mão") - Ultra-fine luxury silk sewing lines */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center z-0">
        <svg className="w-full h-full min-w-[800px]" preserveAspectRatio="none" viewBox="0 0 1200 600" fill="none">
          <defs>
            <linearGradient id="silkThreadGold1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FFF5E1" stopOpacity="0.1" />
              <stop offset="20%" stopColor="#E6C687" stopOpacity="0.85" />
              <stop offset="60%" stopColor="#C5A059" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#8C6B2D" stopOpacity="0.15" />
            </linearGradient>

            <linearGradient id="silkThreadGold2" x1="100%" y1="0%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#8C6B2D" stopOpacity="0.1" />
              <stop offset="30%" stopColor="#C5A059" stopOpacity="0.85" />
              <stop offset="70%" stopColor="#E6C687" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#FFF5E1" stopOpacity="0.15" />
            </linearGradient>

            <filter id="silkThreadGlow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#E6C687" floodOpacity="0.35" />
            </filter>
          </defs>

          {/* 1. Upper Silk Thread ("Alinhavo Superior") - Delicate hand-sewn curve flowing with needle rhythm */}
          <motion.path
            d="M -100 70 C 160 140, 360 35, 580 50 C 780 65, 960 160, 1300 80"
            stroke="url(#silkThreadGold1)"
            strokeWidth="0.75"
            strokeLinecap="round"
            filter="url(#silkThreadGlow)"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.75 }}
            exit={{ opacity: 0, scale: 1.03 }}
            transition={{ duration: 2.3, ease: [0.25, 0.1, 0.25, 1] }}
          />

          {/* Upper Tactile Hand-Stitch Lines - Fine, delicate dashed sewing dots */}
          <motion.path
            d="M -100 70 C 160 140, 360 35, 580 50 C 780 65, 960 160, 1300 80"
            stroke="#FFF5E1"
            strokeWidth="0.45"
            strokeDasharray="2 6"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2.3, ease: [0.25, 0.1, 0.25, 1], delay: 0.05 }}
          />

          {/* 2. Lower Silk Thread ("Costura Inferior em Contraponto") - Independent asymmetric counter-rhythm */}
          <motion.path
            d="M -100 540 C 200 440, 380 560, 620 545 C 820 530, 1020 420, 1300 520"
            stroke="url(#silkThreadGold2)"
            strokeWidth="0.7"
            strokeLinecap="round"
            filter="url(#silkThreadGlow)"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.7 }}
            exit={{ opacity: 0, scale: 1.03 }}
            transition={{ duration: 2.4, ease: [0.25, 0.1, 0.25, 1], delay: 0.12 }}
          />

          {/* Lower Tactile Hand-Stitch Lines */}
          <motion.path
            d="M -100 540 C 200 440, 380 560, 620 545 C 820 530, 1020 420, 1300 520"
            stroke="#FFF5E1"
            strokeWidth="0.4"
            strokeDasharray="3 8"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.45 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2.4, ease: [0.25, 0.1, 0.25, 1], delay: 0.18 }}
          />
        </svg>
      </div>

      {/* Central Brand Frame */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        {/* Main Logo Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="py-2 sm:py-4 px-4"
        >
          <Logo light className="h-20 sm:h-28 md:h-36 landscape:h-16" />
        </motion.div>
      </div>

      {/* Brand Slogan */}
      <motion.p
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.9 }}
        className="mt-3 sm:mt-5 landscape:mt-2 text-cream/80 font-serif italic tracking-[0.2em] sm:tracking-[0.35em] text-[10px] sm:text-xs uppercase text-center px-4 max-w-[90vw] leading-relaxed relative z-10"
      >
        {t('loading.slogan')}
      </motion.p>

      {/* Craft Loading Indicator with Numerical Progress (0% -> 100%) */}
      <div className="mt-6 sm:mt-8 landscape:mt-4 flex flex-col items-center gap-2.5 relative z-10">
        {/* Golden Progress Bar Container */}
        <div className="w-40 sm:w-52 h-[2px] bg-[#E6C687]/20 rounded-full overflow-hidden relative">
          <motion.div 
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 2.3, ease: "easeInOut" }}
            className="h-full bg-gradient-to-r from-[#C5A059] via-[#E6C687] to-[#C5A059] rounded-full shadow-[0_0_10px_rgba(230,198,137,0.7)]"
          />
        </div>

        {/* Star & Numerical Progress Counter */}
        <div className="flex items-center gap-2 text-[#E6C687] opacity-90">
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="text-[10px] leading-none inline-block"
          >
            ★
          </motion.span>
          <span className="text-[10px] sm:text-[11px] font-sans tracking-[0.2em] font-medium text-[#E6C687]">
            {progress}%
          </span>
        </div>
      </div>
    </motion.div>
  );
};

const Navbar = ({ currentPage, setCurrentPage, pathname, isAppLoading = false }: { currentPage: 'home' | 'essence', setCurrentPage: (page: 'home' | 'essence') => void, pathname: string, isAppLoading?: boolean }) => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isDarkBg, setIsDarkBg] = useState(true);
    const { lang: activeLang, t } = useLanguage();
    const lang = activeLang.toUpperCase() as 'PT' | 'EN';

    useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = 'hidden';
            (window as any).lenis?.stop();
            window.dispatchEvent(new CustomEvent('mbravo-mobile-menu-open'));
        } else {
            document.body.style.overflow = '';
            (window as any).lenis?.start();
        }
        return () => {
            document.body.style.overflow = '';
            (window as any).lenis?.start();
        };
    }, [mobileMenuOpen]);

    const handleLanguageChange = (newLang: 'PT' | 'EN') => {
        localStorage.setItem('mbravo_lang', newLang);
        window.dispatchEvent(new CustomEvent('mbravo-lang-change', { detail: newLang }));
    };

    const NAV_LINKS_LIST = [
        { name: 'História', href: '#sobre', key: 'nav.story' },
        { name: 'Catálogo', href: '#collection', key: 'nav.collection' },
        { name: 'Essência', href: 'essence', key: 'nav.philosophy' },
        { name: 'Contactos', href: '#contacto', key: 'nav.contacts' },
    ];

    const handleLinkClick = (e: React.MouseEvent, href: string) => {
        setMobileMenuOpen(false);
        // Start lenis immediately to allow scroll to work and clear overflow lock
        (window as any).lenis?.start();
        document.body.style.overflow = '';

        const activePath = pathname;
        const isHomePage = activePath === '/' || activePath === '/home' || activePath.startsWith('/#');

        if (href === 'essence') {
            e.preventDefault();
            navigateTo('/essencia');
        } else {
            if (!isHomePage) {
                e.preventDefault();
                navigateTo('/' + href);
            } else {
                const targetId = href.replace('#', '');
                const element = document.getElementById(targetId);
                if (element) {
                    e.preventDefault();
                    setTimeout(() => {
                        if (targetId === 'collection') {
                            const targetScrollTop = getCollectionScrollTarget(element);
                            (window as any).lenis?.scrollTo(targetScrollTop, { duration: 1.2 });
                        } else {
                            (window as any).lenis?.scrollTo(element, { duration: 1.2 });
                        }
                    }, 150);
                }
            }
        }
    };

    useEffect(() => {
        // Set initial color state based on page type
        const activePath = pathname;
        if (activePath === '/essencia' || activePath === '/essence') {
            setIsDarkBg(false);
        } else if (activePath === '/' || activePath === '/home') {
            setIsDarkBg(true);
        } else if (activePath.startsWith('/produtos/') || activePath.startsWith('/colecoes/') || activePath === '/admin') {
            setIsDarkBg(false); // Default for Category, Product detail, Admin is light background
        } else {
            setIsDarkBg(false);
        }

        let scrollTicking = false;
        const handleScroll = () => {
            if (!scrollTicking) {
                requestAnimationFrame(() => {
                    const scrolled = window.scrollY > 50;
                    setIsScrolled(prev => prev !== scrolled ? scrolled : prev);
                    scrollTicking = false;
                });
                scrollTicking = true;
            }
        };

        const runInitialDetection = () => {
            const sections = document.querySelectorAll('section[data-background], div[data-background]');
            let detected = false;
            sections.forEach((section) => {
                const rect = section.getBoundingClientRect();
                if (rect.top <= 120 && rect.bottom >= 30) {
                    const bg = section.getAttribute('data-background');
                    if (bg) {
                        setIsDarkBg(bg === 'dark');
                        detected = true;
                    }
                }
            });
            if (!detected) {
                const p = pathname;
                setIsDarkBg(p === '/' || p === '/home');
            }
        };

        const sections = document.querySelectorAll('section, [data-background]');
        const observerOptions = {
            root: null,
            rootMargin: '0px 0px -90% 0px', // Target the top portion of the screen
            threshold: 0
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const bgType = entry.target.getAttribute('data-background');
                    if (bgType) {
                        setIsDarkBg(bgType === 'dark');
                    }
                }
            });
        }, observerOptions);

        sections.forEach(section => observer.observe(section));
        window.addEventListener('scroll', handleScroll, { passive: true });
        
        const initialTimer = setTimeout(runInitialDetection, 150);
        const secondTimer = setTimeout(runInitialDetection, 400); // safety fallback after AnimatePresence finishes
        
        return () => {
            observer.disconnect();
            window.removeEventListener('scroll', handleScroll);
            clearTimeout(initialTimer);
            clearTimeout(secondTimer);
        };
    }, [currentPage, pathname]);

    // Totally transparent with contrast-based dynamic text color as requested
    const navBg = 'bg-transparent';
    const textColor = isDarkBg ? 'text-cream' : 'text-forest';

  return (
    <nav className={`fixed top-0 left-0 w-full z-[100] transition-opacity duration-500 ${isAppLoading ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'} ${isScrolled ? 'py-4' : 'py-8'} ${navBg}`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        {/* Logo with entry animation and Smart Invert */}
        <motion.a 
            href="/" 
            onClick={(e) => {
                e.preventDefault();
                navigateTo('/');
            }}
            initial={{ opacity: 0, y: -20 }}
            animate={isAppLoading ? { opacity: 0, y: -20 } : { opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
            className="relative"
            aria-label="M★BRAVO"
        >
          <Logo light={isDarkBg} className="h-10 md:h-12" />
        </motion.a>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-6 lg:gap-10">
          {NAV_LINKS_LIST.map((link, i) => {
            const displayName = t(link.key);
            const isHighlight = link.name === 'Contactos';
            const isActive = (link.href === 'essence' && currentPage === 'essence') || (link.href !== 'essence' && currentPage === 'home' && typeof window !== 'undefined' && window.location.hash === link.href);
            return (
              <motion.a
                key={link.name}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link.href)}
                initial={{ opacity: 0, y: -10 }}
                animate={isAppLoading ? { opacity: 0, y: -10 } : { opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + (i * 0.08), duration: 0.6 }}
                className={`text-[10px] uppercase tracking-[0.4em] font-bold transition-all duration-200 relative group ${textColor} ${
                  isHighlight 
                    ? `px-6 py-2 border rounded-full transition-all duration-200 ${
                        isDarkBg 
                          ? 'border-cream/30 hover:bg-cream hover:text-forest' 
                          : 'border-forest/30 hover:bg-forest hover:text-cream'
                       }` 
                    : 'hover:opacity-60'
                } ${isActive ? 'text-[#C5A059]' : ''}`}
              >
                {displayName}
                {!isHighlight && (
                  <div className={`absolute -bottom-1 left-0 w-0 h-[1px] ${isDarkBg ? 'bg-cream' : 'bg-forest'} group-hover:w-full transition-all duration-200 opacity-40`} />
                )}
              </motion.a>
            );
          })}

          {/* Elegant Minimalist Language Selector */}
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={isAppLoading ? { opacity: 0, y: -10 } : { opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + (NAV_LINKS_LIST.length * 0.08), duration: 0.6 }}
            className={`flex items-center text-[10px] uppercase tracking-[0.2em] font-medium transition-all duration-200 pl-4 lg:pl-6 border-l ${isDarkBg ? 'border-cream/20' : 'border-forest/20'} ${textColor}`}
          >
            <button 
              onClick={() => handleLanguageChange('PT')} 
              className={`transition-all duration-200 cursor-pointer hover:text-[#C5A059] ${lang === 'PT' ? 'font-bold opacity-100' : 'opacity-40 hover:opacity-80'}`}
            >
              PT
            </button>
            <span className={`mx-2 lg:mx-3 ${isDarkBg ? 'text-cream/20' : 'text-forest/20'}`}>|</span>
            <button 
              onClick={() => handleLanguageChange('EN')} 
              className={`transition-all duration-200 cursor-pointer hover:text-[#C5A059] ${lang === 'EN' ? 'font-bold opacity-100' : 'opacity-40 hover:opacity-80'}`}
            >
              EN
            </button>
          </motion.div>
        </div>

        {/* Mobile Toggle */}
        {!mobileMenuOpen && (
          <motion.button 
            initial={{ opacity: 0, x: 20 }}
            animate={isAppLoading ? { opacity: 0, x: 20 } : { opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className={`lg:hidden transition-colors duration-200 ${textColor}`}
            onClick={() => setMobileMenuOpen(true)}
            aria-label={lang === 'PT' ? 'Abrir Menu' : 'Open Menu'}
          >
            <Menu size={24} />
          </motion.button>
        )}
      </div>

      {/* Mobile Menu Overlay - Refined with Forest theme */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(20px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            className="fixed inset-0 z-[999] bg-forest flex flex-col items-center justify-center p-6 sm:p-8 space-y-6 sm:space-y-10 overflow-y-auto max-h-screen my-auto"
          >
             <button 
                className="absolute top-8 right-8 text-cream hover:text-brand-green-light transition-all duration-300 p-3 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 flex items-center justify-center cursor-pointer shadow-lg"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Fechar Menu"
             >
                <X size={28} />
             </button>
             
             {/* Centered navigation links with balanced vertical gap */}
             <div className="flex flex-col items-center justify-center space-y-4 sm:space-y-5">
               {NAV_LINKS_LIST.map((link, i) => {
                const displayName = t(link.key);
                return (
                  <motion.a
                    key={link.name}
                    href={link.href}
                    onClick={(e) => handleLinkClick(e, link.href)}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ 
                      duration: 0.6,
                      delay: i * 0.08,
                      ease: [0.16, 1, 0.3, 1]
                    }}
                    className="text-2xl sm:text-3xl md:text-4xl font-serif text-cream hover:text-brand-green-light hover:italic transition-all duration-500 tracking-wide text-center"
                  >
                    {displayName}
                  </motion.a>
                );
               })}
             </div>

             {/* Mobile Language Selector with proportional sizing and elegant stagger */}
             <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.6,
                  delay: NAV_LINKS_LIST.length * 0.08 + 0.1,
                  ease: [0.16, 1, 0.3, 1]
                }}
                className="flex items-center text-xs uppercase tracking-[0.25em] font-medium text-cream"
             >
                <button 
                  onClick={() => handleLanguageChange('PT')} 
                  className={`transition-all duration-500 cursor-pointer ${lang === 'PT' ? 'font-bold text-cream' : 'text-cream/40 hover:text-cream/80'}`}
                >
                  PT
                </button>
                <span className="mx-3 text-cream/20">|</span>
                <button 
                  onClick={() => handleLanguageChange('EN')} 
                  className={`transition-all duration-500 cursor-pointer ${lang === 'EN' ? 'font-bold text-cream' : 'text-cream/40 hover:text-cream/80'}`}
                >
                  EN
                </button>
             </motion.div>

             {/* Delicate footer icons matching the refined proportions */}
             <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.6,
                  delay: NAV_LINKS_LIST.length * 0.08 + 0.2,
                  ease: [0.16, 1, 0.3, 1]
                }}
                className="flex gap-8"
             >
                 <a href="https://instagram.com/mbravobycarolina/" target="_blank" rel="noopener noreferrer" className="p-2">
                     <Instagram className="text-cream/40 hover:text-cream transition-colors duration-300" size={20} />
                 </a>
                 <a href={MAILTO_LINK} className="p-2">
                     <Mail className="text-cream/40 hover:text-cream transition-colors duration-300" size={20} />
                 </a>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

// Precomputed Bezier coordinates and slope angles for O(1) frame lookup
const FIO_STAR_Y_COORDS = [
    40,  200, 380, 540, 700, 870, 1040, 1210, 1380, 1560, 1740, 1910, 2080, 2260, 2440, 2620, 2800, 3000,
    3160, 3320, 3480, 3640, 3800, 3960, 4120, 4280, 4440, 4600, 4760, 4920, 5080, 5240, 5400, 5560, 5720, 5900
];
const FIO_STAR_X_RANGE = [
    720, 1030, 1340, 1030, 720, 410, 100, 410, 
    720, 1030, 1340, 1030, 720, 410, 100, 410, 
    720, 1030, 1340, 1030, 720, 410, 100, 410, 
    720, 1030, 1340, 1030, 720, 410, 100, 410,
    720, 1030, 1340, 720
];

function calcBezierPointAndAngle(clampedY: number) {
    let i = 0;
    for (let j = 0; j < FIO_STAR_Y_COORDS.length - 1; j++) {
        if (clampedY >= FIO_STAR_Y_COORDS[j] && clampedY <= FIO_STAR_Y_COORDS[j + 1]) {
            i = j;
            break;
        }
    }
    const y0 = FIO_STAR_Y_COORDS[i];
    const y1 = FIO_STAR_Y_COORDS[i + 1];
    const x0 = FIO_STAR_X_RANGE[i];
    const x1 = FIO_STAR_X_RANGE[i + 1];
    const dy = y1 - y0;
    const dx = x1 - x0;
    if (dy === 0) return { x: x0, angle: 0 };
    let tMin = 0;
    let tMax = 1;
    let t = 0.5;
    for (let step = 0; step < 10; step++) {
        t = (tMin + tMax) / 2;
        const currentY = y0 + dy * (1.5 * t - 1.5 * t * t + t * t * t);
        if (currentY < clampedY) tMin = t;
        else tMax = t;
    }
    const x = x0 + dx * (3 * t * t - 2 * t * t * t);
    const dXdT = 6 * (1 - t) * t * dx;
    const dYdT = 1.5 * dy * ((1 - t) * (1 - t) + t * t);
    const slope = dXdT / dYdT;
    const angleRad = Math.atan(slope);
    const angleDeg = (angleRad * 180) / Math.PI;
    return { x, angle: angleDeg };
}

const FIO_STEP = 5;
const FIO_LOOKUP: Array<{ x: number; angle: number }> = [];
for (let y = 0; y <= 6000; y += FIO_STEP) {
    FIO_LOOKUP.push(calcBezierPointAndAngle(y));
}

function getBezierFast(yVal: number) {
    const idx = Math.min(FIO_LOOKUP.length - 1, Math.max(0, Math.round(yVal / FIO_STEP)));
    return FIO_LOOKUP[idx];
}

const generateSmoothPath = (xCoords: number[], yCoords: number[]) => {
    if (xCoords.length === 0 || yCoords.length === 0) return '';
    let d = `M ${xCoords[0]} ${yCoords[0]}`;
    for (let i = 0; i < xCoords.length - 1; i++) {
        const x0 = xCoords[i];
        const y0 = yCoords[i];
        const x1 = xCoords[i + 1];
        const y1 = yCoords[i + 1];
        const cy0 = y0 + (y1 - y0) / 2;
        const cy1 = y0 + (y1 - y0) / 2;
        d += ` C ${x0} ${cy0}, ${x1} ${cy1}, ${x1} ${y1}`;
    }
    return d;
};
const FIO_PATH_D = generateSmoothPath(FIO_STAR_X_RANGE, FIO_STAR_Y_COORDS);

const FioCondutor = () => {
    const { scrollY } = useScroll();
    const pathD = FIO_PATH_D;

    // Responsive State: check if screen is mobile (width < 768px)
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // 1. Dynamic Thread Opacity based on scroll progress & page density
    const rawThreadOpacity = useTransform(
        scrollY,
        [0, 200, 450, 750, 1100, 1450, 1850, 2200, 2550, 2900, 3200, 3600, 4000, 4400, 4800, 5200, 5600, 6000],
        [0, 0.35, 0.45, 0.12, 0.08, 0.15, 0.42, 0.35, 0.12, 0.08, 0.25, 0.35, 0.45, 0.35, 0.12, 0.08, 0.15, 0.1]
    );
    const threadOpacity = useSpring(rawThreadOpacity, { stiffness: 60, damping: 22, mass: 0.8 });

    // Map scrollY [0, 6000] to vertical position of the star [40, 5900]
    const rawStarY = useTransform(scrollY, [0, 6000], [40, 5900], { clamp: true });
    
    const starY = useSpring(rawStarY, {
        stiffness: isMobile ? 85 : 35,
        damping: isMobile ? 24 : 28,
        mass: isMobile ? 0.4 : 1.0
    });

    const starX = useTransform(starY, (y) => getBezierFast(y).x);
    const starRotation = useTransform(starY, (y) => getBezierFast(y).angle);

    const starLeft = useTransform(starX, (x) => `${(x / 1440) * 100}%`);
    const starTop = useTransform(starY, (y) => `${(y / 6000) * 100}%`);

    // 3. The Breathing Star based on scroll speed / velocity
    const scrollVelocity = useVelocity(scrollY);
    
    // Transform raw velocity frequency to normalized active scale [0, 1]
    const rawActiveScroll = useTransform(scrollVelocity, (val) => {
        const absoluteSpeed = Math.abs(val);
        // Fully awake/active scroll is around absolute velocity 300
        return Math.min(absoluteSpeed / 300, 1);
    });

    // Highly responsive breathing spring for the star activity state (keeps glow alive short time after stopping)
    const starActivity = useSpring(rawActiveScroll, { stiffness: 45, damping: 18 });

    // Map activity state into opacity: when stopped, it fades to a faint gold glow (0.2), when scrolling, fully visible (1)
    const starOpacity = useTransform(starActivity, [0, 1], [0.22, 1.0]);
    const starGlowScale = useTransform(starActivity, [0, 1], [0.85, 1.35]);

    // Apply half-thickness stroke measurements for Mobile
    const shadowStrokeWidth = isMobile ? 0.6 : 1.2;
    const coreStrokeWidth   = isMobile ? 0.25 : 0.5;
    const glowStrokeWidth   = isMobile ? 0.4 : 0.8;
    const specularStrokeWidth = isMobile ? 0.12 : 0.25;

    return (
        <div className="absolute top-[75vh] left-0 w-full bottom-0 pointer-events-none select-none z-[5] overflow-x-hidden overflow-y-hidden">
            <motion.div 
                style={{ opacity: threadOpacity }}
                transition={{ duration: 0.5 }}
                className="relative w-full h-full flex flex-col items-center justify-start overflow-hidden"
            >
                <svg 
                    viewBox="0 0 1440 6000" 
                    fill="none" 
                    className="select-none pointer-events-none overflow-hidden w-full h-full"
                    preserveAspectRatio="none"
                >
                    <defs>
                        {/* High-quality warm golden daylight gradient with sunset vibe fading entirely at bottom */}
                        <linearGradient id="warmSunlight" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#FFF4D6" stopOpacity="0.95" />
                            <stop offset="25%" stopColor="#C5A059" stopOpacity="0.9" />
                            <stop offset="50%" stopColor="#D4B26F" stopOpacity="0.85" />
                            <stop offset="85%" stopColor="#C5A059" stopOpacity="0.7" />
                            <stop offset="100%" stopColor="#C5A059" stopOpacity="0" />
                        </linearGradient>

                        {/* Fading transparent gradient for the underlying thread shadow to integrate flawlessly on the cream block */}
                        <linearGradient id="shadowGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#182414" stopOpacity="0.32" />
                            <stop offset="85%" stopColor="#182414" stopOpacity="0.12" />
                            <stop offset="100%" stopColor="#182414" stopOpacity="0" />
                        </linearGradient>

                        {/* Transparent fading gradient for the core metallic thread */}
                        <linearGradient id="solidThreadGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#C5A059" stopOpacity="0.85" />
                            <stop offset="85%" stopColor="#C5A059" stopOpacity="0.65" />
                            <stop offset="100%" stopColor="#C5A059" stopOpacity="0" />
                        </linearGradient>

                        {/* Transparent fading gradient for the shiny specular highlight */}
                        <linearGradient id="specularGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#FFE8B6" stopOpacity="0.95" />
                            <stop offset="85%" stopColor="#FFE8B6" stopOpacity="0.55" />
                            <stop offset="100%" stopColor="#FFE8B6" stopOpacity="0" />
                        </linearGradient>

                        {/* Warm, soft focus sunbeam blur/glow for active light particles */}
                        <filter id="subtleThreadGlow" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="1.1" result="blur" />
                            <feMerge>
                                <feMergeNode in="blur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    {/* 1. Underlying shadow/glow depth to give dimensional physical presence to the fine thread */}
                    <motion.path 
                        d={pathD}
                        stroke="url(#shadowGradient)" 
                        strokeWidth={shadowStrokeWidth} 
                        strokeLinecap="round"
                        className="blur-[0.7px]"
                    />

                    {/* 2. Core extremely thin handcrafted thread */}
                    <motion.path 
                        d={pathD}
                        stroke="url(#solidThreadGradient)" 
                        strokeWidth={coreStrokeWidth} 
                        strokeLinecap="round"
                    />

                    {/* 3. Soft warm sunlight catching the thread, breathing gently with a slow downward flow */}
                    <motion.path 
                        d={pathD}
                        stroke="url(#warmSunlight)" 
                        strokeWidth={glowStrokeWidth} 
                        strokeLinecap="round"
                        filter="url(#subtleThreadGlow)"
                        animate={{
                            strokeDashoffset: [1200, 0]
                        }}
                        transition={{
                            duration: 25,
                            ease: "linear",
                            repeat: Infinity
                        }}
                        style={{
                            strokeDasharray: "150 450"
                        }}
                    />

                    {/* 4. Ultra-thin glowing specular highlight catching natural afternoon glare, flowing in counter-pulse */}
                    <motion.path 
                        d={pathD}
                        stroke="url(#specularGradient)" 
                        strokeWidth={specularStrokeWidth} 
                        strokeLinecap="round"
                        animate={{
                            strokeDashoffset: [0, 1200]
                        }}
                        transition={{
                            duration: 35,
                            ease: "linear",
                            repeat: Infinity
                        }}
                        style={{
                            strokeDasharray: "80 240"
                        }}
                    />
                </svg>

                {/* Star shape, absolutely positioned to bypass preserveAspectRatio="none" stretching and keep aspect-ratio perfect */}
                <motion.div 
                    className="absolute z-10 pointer-events-none select-none flex items-center justify-center w-12 h-12"
                    style={{ 
                        left: starLeft, 
                        top: starTop,
                        rotate: starRotation,
                        opacity: starOpacity,
                        x: "-50%",
                        y: "-50%"
                    }}
                >
                    {/* Elegant background halo glow that increases size and visible light during scroll activity */}
                    <motion.div
                        className="absolute w-10 h-10 rounded-full bg-[#C5A059]/25 filter blur-[6px] will-change-transform transform-gpu"
                        style={{
                            scale: starGlowScale,
                            opacity: starActivity
                        }}
                    />

                    {/* Official M★Bravo Star shape, solid gold - aspect-ratio preserved perfectly */}
                    <motion.svg 
                        width="34"
                        height="34"
                        viewBox="0 0 34 34"
                        className="overflow-visible aspect-square w-[34px] h-[34px] flex-shrink-0"
                        style={{ width: '34px', height: '34px', minWidth: '34px', minHeight: '34px' }}
                    >
                        <g transform="translate(17, 23.5)">
                            <path 
                                d="M0 -23 L4.3 -13.3 L14.7 -12.3 L7.3 -5.3 L9 4.7 L0 0 L-9 4.7 L-7.3 -5.3 L-14.7 -12.3 L-4.3 -13.3 Z" 
                                fill="#C5A059"
                            />
                            {/* Elegant Serif "M" inside the star */}
                            <text 
                                x="0" 
                                y="-6.5" 
                                textAnchor="middle" 
                                fill="#243119" 
                                style={{ fontSize: '7.5px', fontFamily: "'Cormorant Garamond', serif", fontWeight: 'bold' }}
                            >
                                M
                            </text>
                        </g>
                    </motion.svg>
                </motion.div>
            </motion.div>
        </div>
    );
};

const Hero = () => {
    const { scrollY } = useScroll();
    // Parallax background movement: background slowly slides up or down on scroll
    const bgY = useTransform(scrollY, [0, 800], [0, 150]);
    const bgScale = useTransform(scrollY, [0, 800], [1.02, 1.12]);
    const logoScale = useTransform(scrollY, [0, 500], [1, 0.92]);
    const logoOpacity = useTransform(scrollY, [0, 400], [1, 0]);
    const contentY = useTransform(scrollY, [0, 500], [0, 60]);
    const scrollYTransform = useTransform(scrollY, [0, 400], [0, -50]);

    // Automatic rotating background slideshow
    const [bgIndex, setBgIndex] = useState(0);
    const { t } = useLanguage();

    useEffect(() => {
        const timer = setInterval(() => {
            setBgIndex((prev) => (prev + 1) % HERO_BACKGROUNDS.length);
        }, 8000); // Cycle backgrounds every 8 seconds
        return () => {
            clearInterval(timer);
        };
    }, []);

    // Words for the cinematic stagger fade-in
    const titleWords = t('brand.slogan').split(" ");

    return (
        <>
            <section data-background="dark" className="relative z-20 min-h-[100dvh] lg:h-screen pt-28 pb-20 md:pt-24 lg:py-0 flex flex-col items-center justify-center overflow-hidden text-cream bg-[#1F2A18]" style={{ background: 'linear-gradient(to bottom, #1F2A18 0%, #1F2A18 85%, #24301d 100%)' }}>
                {/* Ambient Overlay Image with Parallax & Slow Animation - Revealing more texture and matter with a bottom dissolution fade matching our background gradient transition */}
                <div 
                    className="absolute inset-0 z-0 select-none pointer-events-none bg-[#1F2A18]"
                    style={{
                        WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black calc(100% - 100px), transparent 100%)',
                        maskImage: 'linear-gradient(to bottom, black 0%, black calc(100% - 100px), transparent 100%)'
                    }}
                >
                    {/* Estado 1: Pulsing, dreaming fade-in of the background images with breathing texture depth, merging organically with our deep brand green */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{
                            opacity: [0.82, 0.90, 0.82],
                        }}
                        transition={{
                            duration: 8,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="absolute inset-0"
                    >
                        {HERO_BACKGROUNDS.map((bgItem, index) => (
                            <motion.div 
                                key={bgItem.mobile}
                                style={{ y: bgY, scale: bgScale }}
                                initial={{ opacity: index === 0 ? 0.93 : 0 }}
                                animate={{ 
                                    opacity: bgIndex === index ? 0.93 : 0,
                                }}
                                transition={{ duration: 2.2, ease: "easeInOut" }}
                                className="absolute inset-0 brightness-[0.46] contrast-[1.40] saturate-[1.05]"
                            >
                                <picture className="w-full h-full block">
                                    <source media="(max-width: 640px)" srcSet={bgItem.mobile} type="image/webp" />
                                    <source media="(min-width: 641px)" srcSet={bgItem.desktop} type="image/webp" />
                                    <img 
                                        src={bgItem.desktop} 
                                        alt={`M★BRAVO Background ${index + 1}`}
                                        className="w-full h-full object-cover"
                                        fetchPriority={index === 0 ? "high" : "low"}
                                        loading={index === 0 ? "eager" : "lazy"}
                                        width={1920}
                                        height={1080}
                                        decoding="async"
                                        onError={(e) => {
                                          const target = e.currentTarget;
                                          const parent = target.parentElement;
                                          if (parent && parent.tagName === 'PICTURE') {
                                            const sources = parent.querySelectorAll('source');
                                            sources.forEach(s => s.remove());
                                          }
                                          if (target.src !== bgItem.fallback) {
                                            target.src = bgItem.fallback;
                                          }
                                        }}
                                        style={{
                                            WebkitBackfaceVisibility: 'hidden',
                                            backfaceVisibility: 'hidden',
                                            transform: 'translateZ(0)',
                                        }}
                                    />
                                </picture>
                            </motion.div>
                        ))}
                    </motion.div>

                        {/* Golden ambient studio lighting leak/flare overlay, adding richness and luxury with organic movement */}
                        <motion.div 
                            animate={{ 
                                opacity: [0.75, 0.95, 0.75],
                                scale: [1, 1.04, 1],
                            }}
                            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute inset-0 bg-[radial-gradient(circle_at_75%_35%,rgba(197,160,89,0.24)_0%,transparent_60%)] z-10 pointer-events-none mix-blend-color-dodge origin-top-right"
                        />
                        <motion.div 
                            animate={{ 
                                opacity: [0.50, 0.72, 0.50],
                                x: [-20, 20, -20],
                                y: [-10, 10, -10]
                            }}
                            transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute inset-0 bg-[radial-gradient(circle_at_25%_65%,rgba(197,160,89,0.15)_0%,transparent_50%)] z-10 pointer-events-none mix-blend-overlay"
                        />
         
                        {/* Subtle volumetric ray of light sweeping slowly like workshop window sun shafts */}
                        <motion.div 
                            animate={{ 
                                opacity: [0.38, 0.58, 0.38],
                                rotate: [-1, 1, -1]
                            }}
                            transition={{ duration: 32, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute inset-0 bg-[radial-gradient(ellipse_at_35%_0%,rgba(255,251,240,0.15)_0%,transparent_45%)] z-10 pointer-events-none mix-blend-screen origin-top"
                        />
          
                        {/* Handmade texture layer: Premium subtle cellulose/organic film grain */}
                        <div 
                            className="absolute inset-0 pointer-events-none z-10 opacity-[0.075] mix-blend-overlay"
                            style={{
                                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 250 250' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.68' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
                            }}
                        />
                        
                        {/* Soft bloom backglow centered right behind the signature to separate and spotlight the brand from the background */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[850px] bg-[radial-gradient(circle_at_center,rgba(197,160,89,0.22)_0%,rgba(197,160,89,0.05)_45%,transparent_70%)] z-10 pointer-events-none mix-blend-screen" />
         
                        {/* Radial gradient vignette and linear gradients for ultimate depth and blend - bottom is completely transparent to flow into page below */}
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,#243119_90%)] z-10 pointer-events-none opacity-50 [mask-image:linear-gradient(to_bottom,black_75%,transparent_100%)]" />
                        <div className="absolute inset-0 bg-gradient-to-b from-[#243119]/40 via-transparent to-transparent z-10 pointer-events-none" />
                    </div>
         
                    {/* Cinematic Centered Editorial Content */}
                    <motion.div 
                        style={{ 
                            scale: logoScale, 
                            y: contentY
                        }}
                        className="relative z-20 flex flex-col items-center px-6 text-center select-none"
                    >
                        {/* Scroll-fading content wrapper to keep the primary brand elements clean while scroll progresses */}
                        <motion.div
                            style={{ opacity: logoOpacity }}
                            className="flex flex-col items-center"
                        >
                            {/* Estado 1: Official Logo M★Bravo - An elegant editorial brand signature, emerging naturally over 1.5s immediately when image is ready */}
                            <motion.div
                                initial={{ scale: 0.98, opacity: 0, filter: "blur(4px)", y: -8 }}
                                animate={{ scale: 1.0, opacity: 1.0, filter: "blur(0px)", y: 0 }}
                                transition={{ 
                                    duration: 1.5,
                                    delay: 0,
                                    ease: [0.25, 1, 0.5, 1] 
                                }}
                                whileHover={{ opacity: 1, scale: 1.008, transition: { duration: 1.0 } }}
                                style={{ 
                                    filter: "drop-shadow(0 24px 54px rgba(18,26,13,0.95)) drop-shadow(0 4px 20px rgba(197,160,89,0.18))"
                                }}
                                className="h-28 xs:h-36 sm:h-[11rem] md:h-[12.5rem] lg:h-[14.4rem] xl:h-[17.5rem] mb-[5px] sm:mb-[7px] md:mb-[9.5px] lg:mb-[11.5px] -mt-3 md:-mt-5 origin-center select-none"
                            >
                                <Logo light className="h-full" />
                            </motion.div>
         
                            {/* Estado 2: Headline: "Cada ponto guarda uma memória." - Refined to a luxury editorial masterwork with staggered word reveal starting exactly at t = 1.5s */}
                            <h1
                                style={{ 
                                    fontFamily: "'Cormorant Garamond', serif",
                                    textShadow: "0 15px 40px rgba(18, 26, 13, 0.95), 0 4px 12px rgba(18, 26, 13, 0.7)",
                                    letterSpacing: "-0.012em"
                                }}
                                className="italic text-[clamp(1.1rem,4.5vw,2.85rem)] leading-relaxed font-normal mb-4 md:mb-5 antialiased selection:bg-[#C5A059]/30 flex flex-wrap justify-center gap-x-[0.22em] md:gap-x-[0.25em] max-w-none w-full"
                            >
                                {titleWords.map((word, i) => {
                                    // Highlight the core brand word "memória." or "memory." in the signature gold color for stunning luxury contrast
                                    const isGoldWord = word.toLowerCase().includes('memória') || word.toLowerCase().includes('memory');
                                    return (
                                        <motion.span
                                            key={i}
                                            initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
                                            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                                            transition={{
                                                delay: 1.5 + i * 0.25,
                                                duration: 1.5,
                                                ease: [0.25, 1, 0.5, 1]
                                            }}
                                            className={`inline-block ${isGoldWord ? 'text-[#C5A059] font-medium' : 'text-[#F5EEDC]'}`}
                                        >
                                            {word}
                                        </motion.span>
                                    );
                                })}
                            </h1>
         
                            {/* Estado 3: Subheadline: "Criado à mão, com tempo, amor e memórias." - Soft, quiet luxury whispering text layout starting at t = 4.0s */}
                            <motion.p
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 0.58, y: 0 }}
                                transition={{ delay: 4.0, duration: 2.0, ease: [0.16, 1, 0.3, 1] }}
                                style={{
                                    fontFamily: "'Cormorant Garamond', serif",
                                    textShadow: "0 4px 12px rgba(18, 26, 13, 0.25)",
                                    letterSpacing: "0.024em"
                                }}
                                className="italic text-xs sm:text-sm md:text-base font-light text-[#D4C3A3] max-w-[260px] sm:max-w-xs md:max-w-sm mx-auto leading-relaxed mb-0 antialiased"
                            >
                                {t('brand.subheadline')}
                            </motion.p>
                        </motion.div>


                    </motion.div>
 
            {/* Corner Labels (Editorial feel) */}
            <div className="absolute bottom-12 left-12 hidden lg:block z-20 pointer-events-none select-none">
                <span className="text-[9px] uppercase tracking-[0.4em] text-cream/20 [writing-mode:vertical-rl] rotate-180">EST. 2026</span>
            </div>
            <div className="absolute bottom-12 right-12 hidden lg:block z-20 pointer-events-none select-none">
                <span className="text-[9px] uppercase tracking-[0.4em] text-cream/20 [writing-mode:vertical-rl]">HANDMADE IN PORTUGAL</span>
            </div>
                </section>
        </>
    );
};

const StorySection = () => {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    });
    const { t } = useLanguage();

    const smoothProgress = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    const xTrack = useTransform(smoothProgress, [0, 1], ["-15%", "15%"]);
    const yTrack = useTransform(smoothProgress, [0, 1], ["-20%", "30%"]);
    const opacityTrack = useTransform(smoothProgress, [0, 0.2, 0.8, 1], [0, 0.03, 0.03, 0]);

    const storyImages = [
        "https://i.ibb.co/S48hcbDp/Firefly-Gemini-Flash-Imagem-com-ambiente-cosy-tema-handmade-crochet-usar-o-logo-em-label-costirado.png",
        "https://i.ibb.co/9krmWqpD/organic-cotton-labels-1.png",
        "https://i.ibb.co/XktWbR4R/laser-engraved-wood-tag-1.png"
    ];

    const [currentImg, setCurrentImg] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentImg(prev => (prev + 1) % storyImages.length);
        }, 6000);
        return () => clearInterval(timer);
    }, []);

    return (
        <section ref={containerRef} id="sobre" data-background="light" className="pt-12 xs:pt-16 sm:pt-20 md:pt-24 lg:pt-32 xl:pt-36 pb-0 relative overflow-hidden select-none px-6 md:px-8 lg:px-16" style={{ backgroundColor: '#F6F1E5' }}>
            {/* Elements of Fundo Subtis: Handcrafted loose cotton fibers / wavy spinning threads running deep inside the cream canvas, completely backgrounded */}
            <div className="absolute inset-x-0 bottom-0 top-[150px] pointer-events-none z-0 overflow-hidden">
                {/* Subtle organic textile noise */}
                <div 
                    className="absolute inset-0 opacity-[0.035] mix-blend-overlay"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 250 250' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseTrans'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.80' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseTrans)'/%3E%3C/svg%3E")`
                    }}
                />
                
                {/* Abstract spinning textile thread born gracefully inside the cream space (opacity 0.04) */}
                <svg className="w-full h-full min-w-[900px] absolute left-1/2 -translate-x-1/2 top-40 opacity-[0.04] z-0" viewBox="0 0 1000 600" fill="none">
                    <defs>
                        <filter id="subtleFiberBlur">
                            <feGaussianBlur stdDeviation="4.0" />
                        </filter>
                    </defs>
                    <path 
                        d="M -50 200 C 180 250, 320 80, 520 180 C 720 280, 800 50, 1050 120" 
                        stroke="#C5A059" 
                        strokeWidth="2.5" 
                        strokeLinecap="round" 
                        filter="url(#subtleFiberBlur)"
                    />
                </svg>
            </div>
            {/* Elegant Large Watermark Signature in Background */}
            <motion.div 
                style={{ x: xTrack, y: yTrack, opacity: opacityTrack, fontFamily: "'Great Vibes', cursive" }}
                className="absolute inset-0 pointer-events-none text-forest text-[26vw] md:text-[32vw] leading-none whitespace-nowrap text-center flex items-center justify-center select-none z-0"
            >
                Carolina
            </motion.div>

            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:grid md:grid-cols-2 md:portrait:flex md:portrait:flex-col lg:grid-cols-12 gap-12 lg:gap-12 items-center relative z-10">
                {/* Left Side: Elegant Portrait / Working Hands Presentation */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.96, y: 30 }}
                    whileInView={{ opacity: 1, scale: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
                    className="relative w-full max-w-md mx-auto lg:max-w-none md:w-full lg:w-auto lg:col-span-5"
                >
                    <div className="w-full aspect-[4/5] max-h-[50vh] sm:max-h-[60vh] lg:max-h-none overflow-hidden rounded-xl xs:rounded-2xl md:rounded-[2rem] lg:rounded-[2.5rem] shadow-2xl relative bg-forest/5">
                        <AnimatePresence mode="wait">
                            <motion.img 
                                key={currentImg}
                                src={storyImages[currentImg]} 
                                alt="Crochet craft hands and label process by M★Bravo" 
                                loading="lazy"
                                decoding="async"
                                initial={{ opacity: 0, scale: 1.05, filter: "contrast(0.92) brightness(1.04)" }}
                                animate={{ opacity: 0.95, scale: 1, filter: "contrast(1.02) brightness(1.0)" }}
                                exit={{ opacity: 0, scale: 0.97 }}
                                transition={{ duration: 1.8, ease: "easeInOut" }}
                                className="w-full h-full object-cover select-none"
                            />
                        </AnimatePresence>
                        
                        {/* Organic cotton/linen thread tactile overlay on top of images for workshop feel */}
                        <div 
                            className="absolute inset-0 pointer-events-none z-10 opacity-[0.14] mix-blend-multiply rounded-xl xs:rounded-2xl md:rounded-[2rem] lg:rounded-[2.5rem]"
                            style={{
                                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='paperNoise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.05' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='0.8 0 0 0 0 0 0.8 0 0 0 0 0 0.8 0 0 0 0 0 0.5 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23paperNoise)'/%3E%3C/svg%3E")`
                            }}
                        />
                        <div className="absolute inset-0 ring-1 ring-inset ring-forest/10 rounded-xl xs:rounded-2xl md:rounded-[2rem] lg:rounded-[2.5rem] z-20" />
                        
                        {/* Slide Indicators */}
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20 bg-black/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
                            {storyImages.map((_, idx) => (
                                <button 
                                    key={idx}
                                    onClick={() => setCurrentImg(idx)}
                                    className={`h-1 rounded-full transition-all duration-500 cursor-pointer ${
                                        currentImg === idx ? 'w-8 bg-cream' : 'w-1.5 bg-cream/40 hover:bg-cream/70'
                                    }`}
                                    aria-label={`Show slide ${idx + 1}`}
                                />
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Right Side: Emotional Storytelling & Pure Philosophy */}
                <motion.div 
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 1.4, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="flex flex-col gap-12 md:gap-14 md:portrait:gap-8 pb-12 md:portrait:pb-12 lg:pb-0 md:col-span-1 lg:col-span-7 lg:pl-12 text-left w-full md:w-full lg:w-auto"
                >
                    <div className="space-y-6">
                        <span className="text-[10px] uppercase tracking-[0.45em] font-bold text-forest/35 block font-sans">
                            {t('story.badge')}
                        </span>
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif text-forest tracking-tight leading-tight font-light">
                            {t('story.title.part1')}{" "}
                            <span className="italic font-normal text-[#C5A059]">{t('story.title.part2')}</span>
                        </h2>
                    </div>
                    
                    <div className="space-y-8">
                        <p className="text-forest font-serif italic text-lg md:text-xl lg:text-2xl leading-relaxed font-light text-forest/90">
                            {t('story.subtitle')} <br />
                            <span className="text-sm md:text-base font-sans not-italic text-forest/70 block mt-3 font-light leading-relaxed">
                                {t('story.subtitle2')}
                            </span>
                        </p>
                        
                        <p className="text-forest font-serif italic text-lg md:text-xl lg:text-2xl leading-relaxed font-light text-forest/95">
                            {t('story.p1')}
                        </p>
                        
                        <p className="text-forest/70 text-sm md:text-base leading-relaxed font-sans font-light max-w-2xl">
                            {t('story.p2')}
                        </p>
                    </div>

                    {/* Staggered Mantras (M★Bravo Pillars) with elegant lines */}
                    <div className="space-y-6 pt-10 border-t border-forest/10 max-w-xl">
                        {[
                            t('story.mantra1'),
                            t('story.mantra2')
                        ].map((mantra, idx) => (
                            <motion.div 
                                key={idx}
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8, delay: 0.4 + idx * 0.2 }}
                                className="flex items-center gap-4 group"
                            >
                                <span className="text-[#C5A059] text-xs font-serif select-none transition-transform duration-500 group-hover:scale-125">★</span>
                                <span className="text-forest lg:text-forest font-serif text-sm xs:text-base md:text-xl font-light tracking-wide">
                                    {mantra}
                                </span>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Centered Transitional Slogan and Rotating Badge Seal */}
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 md:mt-24 text-center relative z-10">
                <div className="h-[1px] w-24 bg-forest/10 mx-auto mb-10" />
                <p className="text-center text-forest/40 font-serif italic text-base md:text-xl tracking-wide max-w-xl mx-auto mb-10 leading-relaxed select-text">
                    "{t('interlude.sub')}"
                </p>
                
                {/* Rotating Brand Badge */}
                <div className="mx-auto w-36 h-36 md:w-40 md:h-40 bg-forest rounded-full p-1 border-4 border-cream overflow-hidden group relative">
                    <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                        className="w-full h-full relative flex items-center justify-center"
                    >
                        <svg viewBox="0 0 100 100" className="w-full h-full">
                            <path
                                id="circlePathBadgeCentered"
                                d="M 50, 50 m -36, 0 a 36,36 0 1, 1 72,0 a 36,36 0 1, 1 -72,0"
                                fill="none"
                            />
                            <text style={{ fontSize: '9px', lineHeight: '13.5px' }} className="font-bold uppercase tracking-[0.14em] fill-cream">
                                <textPath href="#circlePathBadgeCentered" startOffset="0%" style={{ fontSize: '9px', lineHeight: '13.5px' }}>
                                    M★BRAVO ★ HANDMADE ★ EST. 2026 ★
                                </textPath>
                            </text>
                        </svg>
                    </motion.div>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <svg viewBox="0 0 120 120" className="w-14 h-14 md:w-16 md:h-16">
                            <path 
                                d="M60 0 L78 38 L118 42 L90 71 L96 111 L60 93 L24 111 L30 71 L2 42 L42 38 Z" 
                                fill="#C5A059" 
                            />
                            <text 
                                x="60" 
                                y="72" 
                                textAnchor="middle" 
                                fill="#243119" 
                                style={{ fontSize: '32px', fontFamily: 'Playfair Display, serif', fontWeight: 'bold' }}
                            >
                                M
                            </text>
                        </svg>
                    </div>
                </div>
            </div>
        </section>
    );
};

const MadeWithTimeSection = () => {
    const { t } = useLanguage();
    return (
        <section id="manifesto" data-background="light" className="py-[clamp(3rem,8vw,5.5rem)] bg-[#FCFBF9] relative overflow-hidden select-none px-6 md:px-8 lg:px-16">
            <div className="w-full max-w-7xl mx-auto">
                {/* Header: Large Asymmetrical Editorial Typography */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-16 items-baseline mb-12 sm:mb-16 md:mb-16 border-b border-forest/10 pb-8 md:pb-12">
                    <div className="lg:col-span-12">
                        <span className="text-[10px] uppercase tracking-[0.45em] font-semibold text-forest/35 block mb-4 font-sans">
                            {t('manifesto.choice')}
                        </span>
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif text-forest tracking-tight leading-tight lg:leading-[1.15] font-light">
                            {t('manifesto.title')} <br />
                            <span className="italic font-normal text-[#C5A059]">{t('manifesto.subtitle')}</span>
                        </h2>
                    </div>
                </div>

                {/* Main Content Grid: Balanced 12-column layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
                    
                    {/* Left Column: The 4 editorial pillars (spans 7 columns) */}
                    <div className="lg:col-span-7">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6">
                            
                            {/* Pillar 1 - O Ritmo */}
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                                className="group flex flex-col justify-between bg-[#FAF8F5]/80 hover:bg-white p-5 sm:p-6 rounded-2xl border border-forest/5 hover:border-[#C5A059]/30 transition-all duration-500 shadow-sm hover:shadow-md h-full space-y-4"
                            >
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between border-b border-forest/10 pb-2.5">
                                        <div className="flex items-center gap-2">
                                            <Feather size={14} className="text-[#C5A059] opacity-80" />
                                            <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-forest/40">{t('manifesto.pillar1.num')}</span>
                                        </div>
                                        <span className="font-serif italic text-sm text-[#C5A059]/50 group-hover:text-[#C5A059] transition-colors duration-500 font-light select-none">I</span>
                                    </div>
                                    <h3 className="text-[clamp(1rem,2vw,1.15rem)] font-serif text-forest tracking-normal group-hover:text-[#C5A059] transition-colors duration-300 font-light leading-snug">
                                        {t('manifesto.pillar1.title')}
                                    </h3>
                                </div>
                                <p className="text-forest/65 font-sans font-light text-[clamp(0.75rem,1.4vw,0.8125rem)] leading-relaxed text-justify">
                                    {t('manifesto.pillar1.p1')} {t('manifesto.pillar1.p2')} {t('manifesto.pillar1.p3')}
                                </p>
                            </motion.div>

                            {/* Pillar 2 - A Presença */}
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                                className="group flex flex-col justify-between bg-[#FAF8F5]/80 hover:bg-white p-5 sm:p-6 rounded-2xl border border-forest/5 hover:border-[#C5A059]/30 transition-all duration-500 shadow-sm hover:shadow-md h-full space-y-4"
                            >
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between border-b border-forest/10 pb-2.5">
                                        <div className="flex items-center gap-2">
                                            <Sparkles size={14} className="text-[#C5A059] opacity-80" />
                                            <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-forest/40">{t('manifesto.pillar2.num')}</span>
                                        </div>
                                        <span className="font-serif italic text-sm text-[#C5A059]/50 group-hover:text-[#C5A059] transition-colors duration-500 font-light select-none">II</span>
                                    </div>
                                    <h3 className="text-[clamp(1rem,2vw,1.15rem)] font-serif text-forest tracking-normal group-hover:text-[#C5A059] transition-colors duration-300 font-light leading-snug">
                                        {t('manifesto.pillar2.title')}
                                    </h3>
                                </div>
                                <p className="text-forest/65 font-sans font-light text-[clamp(0.75rem,1.4vw,0.8125rem)] leading-relaxed text-justify">
                                    {t('manifesto.pillar2.p1')} {t('manifesto.pillar2.p2')} {t('manifesto.pillar2.p3')}
                                </p>
                            </motion.div>

                            {/* Pillar 3 - A Matéria */}
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                                className="group flex flex-col justify-between bg-[#FAF8F5]/80 hover:bg-white p-5 sm:p-6 rounded-2xl border border-forest/5 hover:border-[#C5A059]/30 transition-all duration-500 shadow-sm hover:shadow-md h-full space-y-4"
                            >
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between border-b border-forest/10 pb-2.5">
                                        <div className="flex items-center gap-2">
                                            <Palette size={14} className="text-[#C5A059] opacity-80" />
                                            <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-forest/40">{t('manifesto.pillar3.num')}</span>
                                        </div>
                                        <span className="font-serif italic text-sm text-[#C5A059]/50 group-hover:text-[#C5A059] transition-colors duration-500 font-light select-none">III</span>
                                    </div>
                                    <h3 className="text-[clamp(1rem,2vw,1.15rem)] font-serif text-forest tracking-normal group-hover:text-[#C5A059] transition-colors duration-300 font-light leading-snug">
                                        {t('manifesto.pillar3.title')}
                                    </h3>
                                </div>
                                <p className="text-forest/65 font-sans font-light text-[clamp(0.75rem,1.4vw,0.8125rem)] leading-relaxed text-justify">
                                    {t('manifesto.pillar3.p1')} {t('manifesto.pillar3.p2')} {t('manifesto.pillar3.p3')}
                                </p>
                            </motion.div>

                            {/* Pillar 4 - O Afeto */}
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                                className="group flex flex-col justify-between bg-[#FAF8F5]/80 hover:bg-white p-5 sm:p-6 rounded-2xl border border-forest/5 hover:border-[#C5A059]/30 transition-all duration-500 shadow-sm hover:shadow-md h-full space-y-4"
                            >
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between border-b border-forest/10 pb-2.5">
                                        <div className="flex items-center gap-2">
                                            <Heart size={14} className="text-[#C5A059] opacity-80" />
                                            <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-forest/40">{t('manifesto.pillar4.num')}</span>
                                        </div>
                                        <span className="font-serif italic text-sm text-[#C5A059]/50 group-hover:text-[#C5A059] transition-colors duration-500 font-light select-none">IV</span>
                                    </div>
                                    <h3 className="text-[clamp(1rem,2vw,1.15rem)] font-serif text-forest tracking-normal group-hover:text-[#C5A059] transition-colors duration-300 font-light leading-snug">
                                        {t('manifesto.pillar4.title')}
                                    </h3>
                                </div>
                                <p className="text-forest/65 font-sans font-light text-[clamp(0.75rem,1.4vw,0.8125rem)] leading-relaxed text-justify">
                                    {t('manifesto.pillar4.p1')} {t('manifesto.pillar4.p2')} {t('manifesto.pillar4.p3')}
                                </p>
                            </motion.div>

                        </div>
                    </div>

                    {/* Right Column: The Refined Image (spans 5 columns) - Elegantly proportioned to balance the text column */}
                    <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-36 md:portrait:max-w-md md:portrait:mx-auto md:portrait:w-full">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.98, y: 20 }}
                            whileInView={{ opacity: 1, scale: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
                            className="w-full aspect-[3/4] relative rounded-2xl overflow-hidden shadow-[0_20px_40px_rgba(31,42,24,0.05)] group border border-forest/5"
                        >
                            <img 
                                src="https://i.ibb.co/j9LHyxq6/Firefly-Gemini-Flash-Imagem-com-ambiente-cosy-tema-handmade-crochet-usar-o-logo-em-label-de-cartao.png" 
                                alt="Destaque de textura de lã e rótulo M★Bravo" 
                                loading="lazy"
                                decoding="async"
                                className="w-full h-full object-cover select-none brightness-[0.98] transition-transform duration-[3000ms] ease-out group-hover:scale-[1.03]"
                            />
                            
                            {/* Subtle natural woven paper overtexture */}
                            <div 
                                className="absolute inset-0 pointer-events-none z-10 opacity-[0.04] mix-blend-overlay"
                                style={{
                                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='paperNoise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.05' numOctaves='4' stitchTiles='stitch'/%3E%3Crect width='100%25' height='100%25' filter='url(%23paperNoise)'/%3E%3C/svg%3E")`
                                }}
                            />
                            
                            {/* Overlay Vignette */}
                            <div className="absolute inset-0 bg-gradient-to-t from-forest/30 via-transparent to-transparent opacity-80" />

                            {/* Intimate overlay tag */}
                            <div className="absolute bottom-5 left-5 right-5 flex justify-between items-end">
                                <p className="text-cream font-serif italic text-sm font-light leading-snug drop-shadow-sm max-w-[180px]">
                                    "{t('manifesto.imageQuote')}"
                                </p>
                                <span className="font-mono text-[8px] tracking-[0.3em] text-cream/70 uppercase">M★B</span>
                            </div>
                        </motion.div>
                        
                        {/* Under-image captioning */}
                        <div className="flex justify-between items-center px-4 py-1.5 border-t border-forest/10 font-sans text-forest/40 select-none">
                            <span className="text-[9px] uppercase tracking-[0.2em] font-mono">ESTÚDIO DE CRIAÇÃO / REGISTO N° 0124</span>
                            <span className="text-[9px] uppercase tracking-[0.2em] font-mono">PORTUGAL</span>
                        </div>
                    </div>

                </div>

            </div>
        </section>
    );
};

const KnotSection = () => {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    });
    const { t } = useLanguage();

    const smoothProgress = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    const xTrack = useTransform(smoothProgress, [0, 1], ["30%", "-30%"]);
    const yTrack = useTransform(smoothProgress, [0, 1], ["-35%", "25%"]);
    const opacityTrack = useTransform(smoothProgress, [0, 0.2, 0.8, 1], [0, 0.04, 0.04, 0]);

    return (
        <section 
            ref={containerRef} 
            id="feeling" 
            data-background="dark" 
            className="py-[clamp(3rem,8vw,5.5rem)] relative overflow-hidden px-6 md:px-8 lg:px-16" 
            style={{ 
                backgroundColor: '#243119'
            }}
        >
            <motion.div 
                style={{ x: xTrack, y: yTrack, opacity: opacityTrack, fontFamily: "'Cormorant Garamond', serif" }}
                className="absolute inset-0 pointer-events-none text-cream text-[26vw] md:text-[35vw] leading-none italic font-light whitespace-nowrap text-center flex items-center justify-center select-none z-0"
            >
                Handmade
            </motion.div>

            <div className="w-full max-w-7xl mx-auto relative z-10">
                {/* Editorial Split Header */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start mb-12 md:mb-16">
                    <div className="lg:col-span-6 space-y-4 text-center lg:text-left">
                        <motion.span 
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-[10px] uppercase tracking-[0.4em] font-bold text-[#C5A059] mb-2 block"
                        >
                            {t('feeling.badge')}
                        </motion.span>
                        <motion.h2 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1 }}
                            className="text-3xl md:text-4xl lg:text-5xl font-serif text-cream leading-tight tracking-tight font-light"
                        >
                            {t('feeling.title.part1')} <br />
                            <span className="italic font-normal text-brand-green-light">{t('feeling.title.part2')}</span>
                        </motion.h2>
                    </div>
                    
                    <div className="lg:col-span-6 text-center lg:text-left">
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, delay: 0.2 }}
                            className="space-y-4 text-cream/75 font-sans font-light text-sm md:text-base leading-relaxed max-w-xl mx-auto lg:mx-0"
                        >
                            <p>{t('feeling.p1')}</p>
                            <p>{t('feeling.p2')}</p>
                            <p>{t('feeling.p3')}</p>
                        </motion.div>
                    </div>
                </div>

                {/* Compact Horizontal Gallery (3 columns) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 lg:gap-8 mt-12 md:mt-16">
                    {/* Card 1 */}
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.2 }}
                        className="aspect-[3/4] overflow-hidden rounded-[12px] relative group shadow-2xl"
                    >
                        <img 
                            src="https://i.ibb.co/F4Z4Fp4Z/LOGOTIPOo.jpg" 
                            alt="Textura de malha" 
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover brightness-95 group-hover:scale-105 transition-all duration-[1.5s] ease-out"
                        />
                        <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-[#121a0d]/90 via-[#121a0d]/40 to-transparent">
                            <span className="text-[9px] uppercase tracking-[0.4em] text-cream/50 mb-1 block">{t('feeling.label')}</span>
                            <p className="text-cream text-sm md:text-base font-serif italic">{t('feeling.caption')}</p>
                        </div>
                    </motion.div>

                    {/* Card 2 */}
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.2, delay: 0.2 }}
                        className="aspect-[3/4] overflow-hidden rounded-[12px] relative group shadow-2xl"
                    >
                        <img 
                            src="https://i.ibb.co/d0Rn6jC7/MOOD-01.png" 
                            alt="Mãos da artesã" 
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover brightness-95 group-hover:scale-105 transition-all duration-[1.5s] ease-out"
                        />
                        <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-[#121a0d]/90 via-[#121a0d]/40 to-transparent">
                            <span className="text-[9px] uppercase tracking-[0.4em] text-cream/50 mb-1 block">Process</span>
                            <p className="text-cream text-sm md:text-base font-serif italic">Mãos que tecem histórias.</p>
                        </div>
                    </motion.div>

                    {/* Card 3 */}
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.2, delay: 0.4 }}
                        className="aspect-[3/4] overflow-hidden rounded-[12px] relative group shadow-2xl"
                    >
                        <img 
                            src="https://i.ibb.co/PKJgWZM/emotional-thank-you-card-1.png" 
                            alt="Detalhe de material" 
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover brightness-95 group-hover:scale-105 transition-all duration-[1.5s] ease-out"
                        />
                        <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-[#121a0d]/90 via-[#121a0d]/40 to-transparent">
                            <span className="text-[9px] uppercase tracking-[0.4em] text-cream/50 mb-1 block">Detail</span>
                            <p className="text-cream text-sm md:text-base font-serif italic">A delicadeza do acabamento.</p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

const slideVariants = {
    enter: (direction: number) => ({
        x: direction > 0 ? "100%" : direction < 0 ? "-100%" : 0,
        opacity: 0,
    }),
    center: {
        x: 0,
        opacity: 1,
    },
    exit: (direction: number) => ({
        x: direction < 0 ? "100%" : direction > 0 ? "-100%" : 0,
        opacity: 0,
    }),
};

interface ProductCardProps {
    product: any;
    i: number;
    isFocused: boolean;
    isSubdued: boolean;
    onFocus: (id: string | null) => void;
    onPrevProduct?: () => void;
    onNextProduct?: () => void;
}

const ProductCardComponent: React.FC<ProductCardProps> = ({ product: rawProduct, i, isFocused, isSubdued, onFocus, onPrevProduct, onNextProduct }) => {
    const { lang, t } = useLanguage();
    const product = translateProduct(rawProduct, lang);
    const n = product.name.toLowerCase();
    const isVestuario = n.includes('bikini') || n.includes('top') || n.includes('cardigan') || n.includes('poncho') || n.includes('belt') || n.includes('bandana') || n.includes('headband');
    const isBag = n.includes('bag') || n.includes('pouch') || n.includes('booksleeve') || n.includes('clutch');
    const isHomeSet = n.includes('coasters') || n.includes('placemats');
    const isCoaster = n.includes('coasters');
    const hasSize = isVestuario && 
                    !n.includes('dragonfly bandana') && 
                    !n.includes('classic bandana') && 
                    !n.includes('dragonfly headband');
    const hasQuantity = isHomeSet;
    const rawPrice = getApprovedPrice(product.name);
    const isAfricanFlowerPouch = product.name.toLowerCase().includes('african flower pouch');
    const isMiniPouches = product.name.toLowerCase().includes('mini pouches');
    const isClassicCoasters = product.name.toLowerCase().includes('classic coasters');
    const isDualColor = isAfricanFlowerPouch || 
                        product.name.toLowerCase().includes('marea bikini set') ||
                        product.name.toLowerCase().includes('coral bikini top') ||
                        product.name.toLowerCase().includes('signature granny poncho') ||
                        product.name.toLowerCase().includes('cardigan') ||
                        isClassicCoasters;
    const initialColor = isDualColor 
        ? 'Azul Água & Branco' 
        : 'Verde Musgo';
    const defaultSize = product.sizes ? product.sizes[0] : 'M';
    const [selections, setSelections] = useState({
        tamanho: defaultSize,
        cor: initialColor,
        corFio: isMiniPouches ? 'Branco Creme' : '',
        quantidade: product.name.toLowerCase().includes('coasters') ? '4und.' : '2und.',
        fecho: '',
        forro: '',
        detalhe: ''
    });
    const totalPrice = typeof rawPrice === 'number' 
        ? `${rawPrice * (hasQuantity ? (parseInt(selections.quantidade) || 1) : 1)}`
        : 'Sob Consulta';
    const cardRef = useRef<HTMLDivElement>(null);
    const [activeImgIndex, setActiveImgIndex] = useState(0);
    const [direction, setDirection] = useState(0);

    // New Direct Checkout Gateway States
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'mbway' | 'multibanco' | 'card' | 'wallet'>('mbway');
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
    const [isPaying, setIsPaying] = useState(false);
    const [paymentCompleted, setPaymentCompleted] = useState(false);
    const [multibancoRef, setMultibancoRef] = useState<{ entidade: string, referencia: string } | null>(null);
    const [orderId, setOrderId] = useState('');
    const [checkoutError, setCheckoutError] = useState<string | null>(null);
    const [sandboxEmails, setSandboxEmails] = useState<{ customerEmailUrl: string, adminEmailUrl: string, shippedEmailUrl?: string } | null>(null);
    const [isShipping, setIsShipping] = useState(false);
    const [canUseWallet, setCanUseWallet] = useState(false);
    const prButtonRef = useRef<any>(null);

    const handleShipOrder = async () => {
        if (!orderId) return;
        setIsShipping(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/payment/ship-order`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId, trackingCode: "DA" + Math.floor(100000000 + Math.random() * 900000000) + "PT" })
            });
            const data = await res.json();
            if (data.success && data.shippedEmailUrl) {
                setSandboxEmails(prev => prev ? { ...prev, shippedEmailUrl: data.shippedEmailUrl } : null);
            }
        } catch (err) {
            console.error("Error shipping order simulation:", err);
        } finally {
            setIsShipping(false);
        }
    };

    // Live Stripe Wallet/ApplePay/GooglePay Initialization & Orchestration
    useEffect(() => {
        let active = true;
        if (!isCheckingOut) return;

        const initStripeWallet = async () => {
            const stripePubKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "";
            if (!stripePubKey) {
                console.warn("[STRIPE WALLET] Stripe Publishable Key not configured in .env");
                return;
            }

            try {
                const stripe = await loadStripe(stripePubKey);
                if (!stripe || !active) return;

                let amountInCents = 5000;
                try {
                    const priceVal = typeof rawPrice === 'number' ? rawPrice : parseFloat(String(rawPrice).replace(/[^0-9.]/g, ''));
                    const qty = hasQuantity ? (parseInt(selections.quantidade) || 1) : 1;
                    amountInCents = Math.round(priceVal * qty * 100);
                } catch (e) {
                    amountInCents = 5000;
                }

                console.log(`[STRIPE WALLET] Registering payment request for ${amountInCents} cents.`);

                const paymentRequest = stripe.paymentRequest({
                    country: 'PT',
                    currency: 'eur',
                    total: {
                        label: `M.BRAVO - ${product.name.substring(0, 25)}`,
                        amount: amountInCents,
                    },
                    requestPayerName: true,
                    requestPayerEmail: true,
                    requestPayerPhone: true,
                    requestShipping: false, // We collect customized PT address on checkout step 1 which is more accurate
                });

                const result = await paymentRequest.canMakePayment();
                if (result && active) {
                    console.log("[STRIPE WALLET] Apple Pay / Google Pay is fully supported on this device/browser!");
                    setCanUseWallet(true);

                    if (paymentMethod === 'wallet') {
                        setTimeout(() => {
                            if (!active) return;
                            const container = document.getElementById('payment-request-button');
                            if (container) {
                                container.innerHTML = ''; // Clear previous instances
                                const elements = stripe.elements();
                                const prButton = elements.create('paymentRequestButton', {
                                    paymentRequest,
                                    style: {
                                        paymentRequestButton: {
                                            theme: 'dark',
                                            height: '44px',
                                        },
                                    },
                                });
                                prButton.mount('#payment-request-button');
                                prButtonRef.current = prButton;
                                console.log("[STRIPE WALLET] Payment Request Button successfully mounted.");
                            }
                        }, 150);
                    }
                } else {
                    console.log("[STRIPE WALLET] Apple Pay / Google Pay not available on this device/browser.");
                    setCanUseWallet(false);
                }

                // Stripe paymentmethod authorized callback
                paymentRequest.on('paymentmethod', async (ev) => {
                    console.log("[STRIPE WALLET SUCCESS] Wallet sheet authorized. Capturing buyer details:", ev.paymentMethod);
                    
                    const buyerName = ev.payerName || checkoutForm.nome || "Cliente Carteira Digital";
                    const buyerEmail = ev.payerEmail || checkoutForm.email || "encomendas@mbravobycarolina.com";
                    const buyerPhone = ev.payerPhone || checkoutForm.telefone || "";

                    // Synchronize React state
                    setCheckoutForm(prev => ({
                        ...prev,
                        nome: buyerName,
                        email: buyerEmail,
                        telefone: buyerPhone
                    }));

                    setIsPaying(true);
                    setCheckoutError(null);

                    try {
                        const response = await fetch(`${API_BASE_URL}/api/payment/create-intent`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                product: {
                                    id: product.id,
                                    name: product.name,
                                    price: currentPrice
                                },
                                selections,
                                checkoutForm: {
                                    ...checkoutForm,
                                    nome: buyerName,
                                    email: buyerEmail,
                                    telefone: buyerPhone,
                                },
                                paymentMethod: 'wallet',
                                amountInCents
                            })
                        });

                        const data = await response.json();

                        if (!response.ok || data.error) {
                            throw new Error(data.error || "Falha do servidor ao inicializar transação de carteira.");
                        }

                        console.log("[STRIPE WALLET] PaymentIntent created, client secret received. Confirming client-side...");
                        setOrderId(data.orderId);

                        // Confirm Stripe PaymentIntent
                        const { paymentIntent, error: confirmError } = await stripe.confirmCardPayment(
                            data.stripeClientSecret,
                            { payment_method: ev.paymentMethod.id },
                            { handleActions: false }
                        );

                        if (confirmError) {
                            ev.complete('fail');
                            throw new Error(confirmError.message);
                        }

                        if (paymentIntent && paymentIntent.status === 'succeeded') {
                            ev.complete('success');
                            console.log("[STRIPE WALLET CONFIRMED] Confirming success webhook with server...");

                            // Notify webhook endpoint of successful payment completion
                            const confirmRes = await fetch(`${API_BASE_URL}/api/payment/webhook`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    orderId: data.orderId,
                                    event: 'payment_intent.succeeded'
                                })
                            });

                            const confirmData = await confirmRes.json();
                            setIsPaying(false);
                            setPaymentCompleted(true);
                            if (confirmData.emailLinks) {
                                setSandboxEmails(confirmData.emailLinks);
                            }
                        } else {
                            ev.complete('fail');
                            throw new Error("A autorização da carteira digital não pôde ser completada.");
                        }
                    } catch (err: any) {
                        console.error("[STRIPE WALLET PROCESS ERROR]", err);
                        setCheckoutError(err.message || "Erro durante o processamento do Apple/Google Pay.");
                        setIsPaying(false);
                    }
                });

            } catch (err) {
                console.error("[STRIPE WALLET SYSTEM ERROR]", err);
            }
        };

        initStripeWallet();

        return () => {
            active = false;
            if (prButtonRef.current) {
                try {
                    prButtonRef.current.unmount();
                    console.log("[STRIPE WALLET] Unmounted payment request button.");
                } catch (e) {}
            }
        };
    }, [isCheckingOut, paymentMethod, totalPrice, lang]);
    const isLiveMode = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY?.startsWith('pk_live') || false;

    const productImages = product.images || [product.img];

    useEffect(() => {
        setActiveImgIndex(0);
        setDirection(0);
    }, [product.id, isFocused]);

    // Logic for Material & Care
    const isSafran = isVestuario || product.id.startsWith('v') || product.id.startsWith('p');
    
    const materialText = product.material || (lang === 'pt' 
        ? (isSafran 
            ? "Produzido em 100% Algodão Egípcio Safran. Um fio nobre, fino e delicado, com um brilho suave e toque refrescante. Garante conforto térmico e elegância no caimento."
            : "Produzido em 100% Algodão. Um fio de fibra grossa e penteada que confere estrutura e alta resistência. Ideal para suportar o uso diário mantendo a forma original.")
        : (isSafran
            ? "Produced in 100% Safran Egyptian Cotton. A noble, fine, and delicate yarn with a subtle sheen and refreshing touch. Guarantees thermal comfort and elegant drape."
            : "Produced in 100% Cotton. A thick, combed fiber yarn that provides structure and high durability. Ideal for daily use while maintaining its original shape."));

    const careText = product.care || (lang === 'pt'
        ? (isSafran
            ? "Lavar em ciclo delicado ou à mão (30ºC). Não usar amaciador e não deixar de molho. Secar à sombra e sempre na horizontal para evitar que a peça estique."
            : "Lavável à máquina (40ºC). Não usar lixívia. Secar na horizontal para manter a estrutura da peça.")
        : (isSafran
            ? "Wash on delicate cycle or by hand (30ºC). Do not use softener and do not soak. Dry in shade and always flat to prevent stretching."
            : "Machine washable (40ºC). Do not bleach. Dry flat to maintain the structure of the piece."));

    const finalNote = t('product.final_note');

    const calculatePrice = () => {
        const price = getApprovedPrice(product.name);
        if (typeof price === 'string') {
            return price;
        }

        const qty = hasQuantity ? (parseInt(selections.quantidade) || 1) : 1;
        const total = price * qty;
        return `Total: ${total}€`;
    };

    const currentPrice = calculatePrice();

    const selectedSize = hasSize ? selections.tamanho : 'Não aplicável';
    const selectedColor = (isCoaster && !isClassicCoasters) ? 'Padrão' : selections.cor;
    const quantity = hasQuantity ? selections.quantidade : '1';

    const messageText = lang === 'pt'
        ? `Olá Carolina! Quero encomendar uma peça M★BRAVO.\n\nProduto: ${product.name}\nTamanho: ${selectedSize}\n${(isCoaster && !isClassicCoasters) ? '' : (isMiniPouches ? `Cor do Saquinho: ${selectedColor}\nCor do Fio: ${selections.corFio}\n` : `Cor: ${selectedColor}\n`)}Quantidade: ${quantity}\n\nValor Total: ${totalPrice}€\n\nFico a aguardar os detalhes para combinarmos o envio e o pagamento. Obrigada!`
        : `Hello Carolina! I would like to order an M★BRAVO piece.\n\nProduct: ${product.name}\nSize: ${translateSize(selectedSize, lang)}\n${(isCoaster && !isClassicCoasters) ? '' : (isMiniPouches ? `Pouch Color: ${translateColor(selectedColor, lang)}\nYarn Color: ${translateColor(selections.corFio, lang)}\n` : `Color: ${translateColor(selectedColor, lang)}\n`)}Quantity: ${translateQuantity(quantity, lang)}\n\nTotal Price: ${totalPrice}€\n\nI look forward to details on shipping and payment. Thank you!`;

    const whatsappUrl = `https://wa.me/351912828182?text=${encodeURIComponent(messageText)}`;

    useEffect(() => {
        if (!isFocused) {
            setSelections({ 
                tamanho: product.sizes ? product.sizes[0] : 'M', 
                cor: initialColor, 
                corFio: isMiniPouches ? 'Branco Creme' : '',
                quantidade: product.name.toLowerCase().includes('coasters') ? '4und.' : '2und.', 
                fecho: '', 
                forro: '', 
                detalhe: '' 
            });
            setIsCheckingOut(false);
            setPaymentCompleted(false);
            setMultibancoRef(null);
            setCheckoutError(null);
            setSandboxEmails(null);
            setCheckoutForm({
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
        }
    }, [isFocused, product.name, product.sizes, initialColor]);

    const sizes = product.sizes || (product.name.toLowerCase().includes('marea bikini') || product.name.toLowerCase().includes('coral bikini top')
        ? ['XS', 'S', 'M', 'L'] 
        : ['S', 'M', 'L']);
    const quantities = isCoaster
        ? ['1und.', '2und.', '4und.', '6und.', '8und.']
        : ['2und.', '4und.', '6und.', '8und.'];

    const colors = isDualColor ? [
        { name: 'Azul Água & Branco', bg: 'linear-gradient(45deg, #A6BCAE 50%, #FFFFFF 50%)' },
        { name: 'Amarelo & Branco', bg: 'linear-gradient(45deg, #F4D03F 50%, #FFFFFF 50%)' },
        { name: 'Rosa & Branco', bg: 'linear-gradient(45deg, #FADADD 50%, #FFFFFF 50%)' },
        { name: 'Verde & Branco', bg: 'linear-gradient(45deg, #243119 50%, #FFFFFF 50%)' },
        { name: 'Vermelho & Branco', bg: 'linear-gradient(45deg, #C0392B 50%, #FFFFFF 50%)' }
    ] : isMiniPouches ? [
        { name: 'Verde Musgo', hex: '#2E3B26' },
        { name: 'Azul Noite', hex: '#1C2D37' },
        { name: 'Amarelo Baunilha', hex: '#F2E3A9' },
        { name: 'Terracota', hex: '#A85B40' },
        { name: 'Branco Creme', hex: '#F5F2ED' },
        { name: 'Rosa Quartzo Subtil', hex: '#EADAD6' }
    ] : [
        { name: 'Verde Musgo', hex: '#243119' },
        { name: 'Hortelã-Pimenta', hex: '#789D8A' },
        { name: 'Petróleo', hex: '#005F6B' },
        { name: 'Azul Glaciar', hex: '#A2C2D1' },
        { name: 'Sorvete Limão', hex: '#F4D03F' },
        { name: 'Creme', hex: '#FDFBF7' },
        { name: 'Bege Claro', hex: '#E1D5C9' },
        { name: 'Rosa Ternura', hex: '#FADADD' },
        { name: 'Castanho', hex: '#5D4037' },
        { name: 'Branco', hex: '#FFFFFF' }
    ];

    const yarnColors = isMiniPouches ? [
        { name: 'Verde Musgo', hex: '#2E3B26' },
        { name: 'Azul Noite', hex: '#1C2D37' },
        { name: 'Amarelo Baunilha', hex: '#F2E3A9' },
        { name: 'Terracota', hex: '#A85B40' },
        { name: 'Branco Creme', hex: '#F5F2ED' },
        { name: 'Rosa Quartzo Subtil', hex: '#EADAD6' }
    ] : [
        { name: 'Algodão Cru', hex: '#EFECE6' },
        { name: 'Cacau Escuro', hex: '#4A3728' },
        { name: 'Oliva Suave', hex: '#556B2F' }
    ];

    const handleToggle = () => {
        onFocus(isFocused ? null : product.id);
    };

    if (!isFocused) {
        return (
            <motion.div 
                ref={cardRef}
                layoutId={`product-card-${product.id}`}
                className="group relative flex flex-col h-full bg-white rounded-[12px] shadow-[0_4px_22px_-10px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_45px_-12px_rgba(36,49,25,0.14)] hover:-translate-y-1.5 transition-all duration-500 overflow-hidden"
                style={{
                    WebkitBackfaceVisibility: 'hidden',
                    backfaceVisibility: 'hidden',
                    transform: 'translateZ(0)',
                    contentVisibility: 'auto',
                    containIntrinsicSize: '0 420px'
                }}
            >
                <div className="flex flex-col h-full">
                    {/* Image Container with Fixed Aspect Ratio */}
                    <div 
                        className="relative overflow-hidden aspect-[4/5] cursor-pointer"
                        onClick={handleToggle}
                        style={{ 
                            borderTopLeftRadius: 'inherit', 
                            borderTopRightRadius: 'inherit',
                            WebkitBackfaceVisibility: 'hidden',
                            backfaceVisibility: 'hidden',
                            transform: 'translateZ(0)'
                        }}
                    >
                        <div className="relative w-full h-full overflow-hidden bg-white">
                            <motion.img 
                                layoutId={`product-img-${product.id}`}
                                src={productImages[0]} 
                                alt={product.name} 
                                width={600}
                                height={750}
                                loading={i < 2 ? "eager" : "lazy"}
                                fetchPriority={i < 2 ? "high" : "low"}
                                decoding="async"
                                style={{ 
                                    imageRendering: 'crisp-edges', 
                                    filter: 'none', 
                                    opacity: 1,
                                    WebkitBackfaceVisibility: 'hidden',
                                    backfaceVisibility: 'hidden',
                                    transform: 'translateZ(0)'
                                }}
                                className="w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-700 ease-out antialiased filter-none opacity-100"
                            />
                        </div>
                        <div className="absolute top-4 left-4 z-10 pointer-events-none">
                            <span className="brand-patch">
                                M★BRAVO
                            </span>
                        </div>
                        {isClassicCoasters && (
                            <div className="absolute bottom-4 right-4 z-10 pointer-events-none">
                                <span className="colors-patch">
                                    VÁRIAS<br/>CORES
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Content Section */}
                    <div className="p-4 xs:p-5 sm:p-6 flex flex-col justify-between flex-grow bg-white">
                        <div>
                            <h3 className="font-serif font-normal tracking-wide text-forest mb-1 line-clamp-1" style={{ fontSize: 'clamp(11px, 0.8vw + 5px, 14px)' }}>{product.name}</h3>
                            <p className="text-forest/40 uppercase tracking-[0.3em] font-semibold mb-3 sm:mb-4 font-sans" style={{ fontSize: 'clamp(7px, 0.8vw + 4px, 9px)' }}>HANDMADE EXCLUSIVE</p>
                        </div>
                        <div className="flex justify-between items-end">
                            <span className="text-xs sm:text-sm font-sans font-semibold tracking-wider text-forest/70">{product.price}</span>
                            <button 
                                onClick={handleToggle}
                                className="p-1.5 sm:p-2 rounded-full bg-forest text-cream hover:bg-forest/90 transition-all shadow-lg shadow-forest/10 hover:scale-105 active:scale-95 duration-200"
                                aria-label={lang === 'pt' ? 'Ver Detalhes do Produto' : 'View Product Details'}
                            >
                                <ArrowRight size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    }

    // FOCUSED/EXPANDED MODAL LAYOUT
    const currentImg = productImages[activeImgIndex];

    return (
        <>
        <div data-lenis-prevent className="w-full h-auto lg:h-[88vh] lg:max-w-6xl bg-[#FCFBF9] rounded-none md:rounded-[2rem] lg:rounded-[2.5rem] flex flex-col lg:flex-row shadow-2xl relative overflow-visible lg:overflow-hidden text-forest select-none">
            {/* a) Área de Visualização */}
            <div 
                className="w-full lg:w-[62%] h-[52vh] sm:h-[56vh] lg:h-full shrink-0 border-b lg:border-b-0 lg:border-r border-forest/10 p-1 sm:p-2 lg:p-4 flex flex-col items-center justify-center overflow-hidden bg-[#F5F2ED] relative transition-colors duration-500"
                style={{ touchAction: 'pan-y' }}
            >
                {/* Floating label in top-left corner */}
                <div className="absolute top-6 left-6 z-20 pointer-events-none hidden lg:block">
                    <span className="bg-forest/5 backdrop-blur-md text-forest/70 text-[8px] uppercase tracking-[0.25em] px-3.5 py-1.5 rounded-full border border-forest/10 font-medium">
                        Clique para aproximar a foto
                    </span>
                </div>

                {/* Custom Elegant Zoom Button */}
                <button 
                    onClick={() => {
                        window.dispatchEvent(new CustomEvent('mbravo-zoom-image', { detail: currentImg }));
                    }}
                    className="absolute top-6 right-6 z-20 p-2.5 sm:p-3 rounded-full bg-[#FCFBF9]/80 text-forest hover:bg-forest hover:text-cream backdrop-blur-md shadow-md border border-forest/10 cursor-pointer flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-300"
                    title={lang === 'pt' ? 'Ampliar Imagem' : 'Zoom Image'}
                    aria-label={lang === 'pt' ? 'Ampliar Imagem' : 'Zoom Image'}
                >
                    <Maximize2 size={16} />
                </button>

                {/* Main Proportional Visual Frame with layoutId */}
                <div className="relative w-full h-full max-w-full max-h-[82vh] flex items-center justify-center">
                    <AnimatePresence initial={false} custom={direction} mode="popLayout">
                        <motion.img 
                            key={activeImgIndex}
                            layoutId={activeImgIndex === 0 ? `product-img-${product.id}` : undefined}
                            src={currentImg} 
                            alt={`${product.name} - Imagem ${activeImgIndex + 1}`} 
                            loading="lazy"
                            decoding="async"
                            style={{ imageRendering: 'crisp-edges', filter: 'none', opacity: 1 }}
                            custom={direction}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ 
                                x: { type: "spring", stiffness: 350, damping: 33 },
                                opacity: { duration: 0.15 }
                            }}
                            drag="x"
                            dragConstraints={{ left: 0, right: 0 }}
                            dragElastic={0.4}
                            onDragEnd={(e, info) => {
                                if (info.offset.x < -60) {
                                    if (productImages.length > 1) {
                                        setDirection(1);
                                        setActiveImgIndex((prev) => (prev === productImages.length - 1 ? 0 : prev + 1));
                                    }
                                } else if (info.offset.x > 60) {
                                    if (productImages.length > 1) {
                                        setDirection(-1);
                                        setActiveImgIndex((prev) => (prev === 0 ? productImages.length - 1 : prev - 1));
                                    }
                                }
                            }}
                            className="max-w-full max-h-full object-contain cursor-grab active:cursor-grabbing select-none rounded-[1rem] sm:rounded-[1.5rem] transition-transform duration-300 hover:scale-[1.01] antialiased filter-none opacity-100"
                            onClick={() => {
                                window.dispatchEvent(new CustomEvent('mbravo-zoom-image', { detail: currentImg }));
                            }}
                        />
                    </AnimatePresence>
                </div>

                {/* Gallery Nav Arrows inside Área de Visualização */}
                {productImages.length > 1 && (
                    <>
                        <div className="absolute inset-y-0 left-4 md:left-6 flex items-center z-30 pointer-events-none">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setDirection(-1);
                                    setActiveImgIndex((prev) => (prev === 0 ? productImages.length - 1 : prev - 1));
                                }}
                                className="w-11 h-11 rounded-full bg-[#FCFBF9]/85 hover:bg-forest text-forest hover:text-cream backdrop-blur-md shadow-md flex items-center justify-center transition-all duration-300 pointer-events-auto hover:scale-105 active:scale-95 border border-forest/5 cursor-pointer"
                                aria-label={lang === 'pt' ? 'Imagem anterior' : 'Previous image'}
                            >
                                <ChevronLeft size={20} />
                            </button>
                        </div>
                        <div className="absolute inset-y-0 right-4 md:right-6 flex items-center z-30 pointer-events-none">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setDirection(1);
                                    setActiveImgIndex((prev) => (prev === productImages.length - 1 ? 0 : prev + 1));
                                }}
                                className="w-11 h-11 rounded-full bg-[#FCFBF9]/85 hover:bg-forest text-forest hover:text-cream backdrop-blur-md shadow-md flex items-center justify-center transition-all duration-300 pointer-events-auto hover:scale-105 active:scale-95 border border-forest/5 cursor-pointer"
                                aria-label={lang === 'pt' ? 'Próxima imagem' : 'Next image'}
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>

                        {/* Pagination Indicator dots at bottom of viewing box */}
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2 bg-[#FCFBF9]/80 backdrop-blur-md px-4 py-2.5 rounded-full border border-forest/10">
                            {productImages.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (idx !== activeImgIndex) {
                                            setDirection(idx > activeImgIndex ? 1 : -1);
                                            setActiveImgIndex(idx);
                                        }
                                    }}
                                    className={`h-1.5 rounded-full transition-all duration-300 ${idx === activeImgIndex ? 'w-5 bg-forest' : 'w-1.5 bg-forest/30 hover:bg-forest'}`}
                                    aria-label={lang === 'pt' ? `Ir para imagem ${idx + 1}` : `Go to image ${idx + 1}`}
                                />
                            ))}
                        </div>
                        
                        {/* Interactive Luxury Thumbnails Strip in Viewer */}
                        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-35 hidden lg:flex gap-2 p-1.5 bg-[#FCFBF9]/90 backdrop-blur-xl rounded-xl border border-forest/10 max-w-[85%] overflow-x-auto no-scrollbar shadow-sm">
                            {productImages.map((imgUrl, idx) => (
                                <button
                                    key={idx}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (idx !== activeImgIndex) {
                                            setDirection(idx > activeImgIndex ? 1 : -1);
                                            setActiveImgIndex(idx);
                                        }
                                    }}
                                    className={`relative w-10 h-10 rounded-lg overflow-hidden border transition-all shrink-0 ${
                                        idx === activeImgIndex 
                                            ? 'border-forest scale-95 shadow-md' 
                                            : 'border-transparent opacity-60 hover:opacity-100'
                                    }`}
                                    aria-label={lang === 'pt' ? `Ver miniatura ${idx + 1}` : `View thumbnail ${idx + 1}`}
                                >
                                    <img 
                                        src={imgUrl} 
                                        alt="" 
                                        loading="lazy"
                                        decoding="async"
                                        style={{ imageRendering: 'crisp-edges', filter: 'none', opacity: 1 }}
                                        className="w-full h-full object-cover antialiased filter-none opacity-100" 
                                    />
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* b) Área de Informação (Details / Sidebar and custom features) */}
            <div className="w-full lg:w-[38%] h-auto lg:h-full bg-[#FCFBF9] flex flex-col px-5 py-6 lg:py-8 text-forest relative box-border lg:overflow-hidden">
                {isCheckingOut ? (
                    <div data-lenis-prevent className="flex-1 flex flex-col lg:h-full bg-[#FCFBF9] text-forest select-text p-1 animate-fadeIn lg:overflow-y-auto overflow-y-visible max-h-full h-auto scrollbar-thin scrollbar-thumb-forest/10">
                        {/* Header with Back button */}
                        <div className="flex justify-between items-center border-b border-forest/10 pb-4 mb-4">
                            <button 
                                onClick={() => {
                                    if (paymentCompleted) {
                                        setIsCheckingOut(false);
                                        setPaymentCompleted(false);
                                        setMultibancoRef(null);
                                    } else {
                                        setIsCheckingOut(false);
                                    }
                                }}
                                className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] font-bold text-forest/50 hover:text-forest transition-colors cursor-pointer"
                            >
                                <ChevronLeft size={16} />
                                {paymentCompleted ? t('btn.back_collection') : (lang === 'pt' ? 'Voltar' : 'Back')}
                            </button>
                            <div className="flex items-center gap-2">
                                <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-forest/30">
                                    {paymentCompleted ? (lang === 'pt' ? 'Pedido Concluído' : 'Order Completed') : (lang === 'pt' ? 'Checkout Seguro' : 'Secure Checkout')}
                                </span>
                                <button 
                                    onClick={handleToggle}
                                    className="p-1.5 rounded-full bg-forest/5 text-forest hover:bg-forest hover:text-cream transition-all border border-forest/10 shadow-sm cursor-pointer ml-1"
                                    title="Fechar"
                                    aria-label={lang === 'pt' ? 'Fechar' : 'Close'}
                                >
                                    <X size={12} />
                                </button>
                            </div>
                        </div>

                        {paymentCompleted ? (
                            /* Success / Completed screen */
                            <div className="flex flex-col items-center text-center py-8 space-y-6">
                                <div className="w-16 h-16 rounded-full bg-forest/5 flex items-center justify-center border border-forest/15">
                                    <LogoIcon className="h-10 w-10 text-forest" />
                                </div>
                                
                                <h4 className="font-serif italic text-2xl lg:text-3xl font-light text-forest">
                                    {t('payment.success_title')}
                                </h4>
                                
                                <p className="text-sm text-forest/70 font-sans font-light leading-relaxed max-w-sm">
                                    {lang === 'pt' ? (
                                        <>Agradecemos a sua encomenda, <strong>{checkoutForm.nome || 'Cliente'}</strong>. Enviámos um e-mail de confirmação para <strong>{checkoutForm.email}</strong> com os detalhes do envio.</>
                                    ) : (
                                        <>Thank you for your order, <strong>{checkoutForm.nome || 'Customer'}</strong>. We have sent a confirmation email to <strong>{checkoutForm.email}</strong> with the shipping details.</>
                                    )}
                                </p>

                                <div className="bg-forest/5 rounded-2xl p-5 border border-forest/10 w-full text-left space-y-3 font-sans text-xs">
                                    <div className="flex justify-between border-b border-forest/5 pb-1.5">
                                        <span className="text-forest/40 uppercase tracking-wider text-[9px]">{lang === 'pt' ? 'ID Pedido' : 'Order ID'}</span>
                                        <span className="font-semibold text-forest">{orderId}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-forest/5 pb-1.5">
                                        <span className="text-forest/40 uppercase tracking-wider text-[9px]">{lang === 'pt' ? 'Artigo' : 'Item'}</span>
                                        <span className="font-semibold text-forest">{product.name}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-forest/5 pb-1.5">
                                        <span className="text-forest/40 uppercase tracking-wider text-[9px]">{lang === 'pt' ? 'Configuração' : 'Configuration'}</span>
                                        <span className="font-semibold text-forest text-right">
                                            {(isCoaster && !isClassicCoasters) ? '' : `${translateColor(selections.cor, lang)} `}{isMiniPouches && `| ${lang === 'pt' ? 'Fio: ' : 'Yarn: '}${translateColor(selections.corFio, lang)} `}{hasSize && `| ${translateSize(selections.tamanho, lang)}`} {hasQuantity && `| ${translateQuantity(selections.quantidade, lang)}`}
                                        </span>
                                    </div>
                                    <div className="flex justify-between border-b border-forest/5 pb-1.5">
                                        <span className="text-forest/40 uppercase tracking-wider text-[9px]">{lang === 'pt' ? 'Método Pagamento' : 'Payment Method'}</span>
                                        <span className="font-semibold text-forest uppercase">
                                            {paymentMethod === 'mbway' ? 'MB WAY' : paymentMethod === 'multibanco' ? (lang === 'pt' ? 'Referência Multibanco' : 'Multibanco Reference') : (lang === 'pt' ? 'Cartão de Crédito' : 'Credit Card')}
                                        </span>
                                    </div>
                                    <div className="flex justify-between pt-1 font-bold">
                                        <span className="text-[#A68244] uppercase tracking-wider text-[10px]">
                                            {paymentMethod === 'multibanco' 
                                                ? (lang === 'pt' ? 'Total a Pagar' : 'Total to Pay')
                                                : (lang === 'pt' ? 'Total Pago' : 'Total Paid')}
                                        </span>
                                        <span className="text-base font-serif text-forest">{currentPrice}</span>
                                    </div>
                                </div>

                                {paymentMethod === 'multibanco' && multibancoRef && (
                                    <div className="bg-amber-50/40 rounded-xl p-4 border border-[#C5A059]/30 text-left space-y-2 w-full font-sans animate-fadeIn">
                                        <span className="text-[9px] uppercase tracking-wider text-[#A68244] font-mono font-bold block mb-1">
                                            {lang === 'pt' ? 'DADOS PARA PAGAMENTO MULTIBANCO' : 'MULTIBANCO PAYMENT DETAILS'}
                                        </span>
                                        <div className="space-y-1.5 text-xs text-forest">
                                            <div className="flex justify-between border-b border-forest/5 pb-1">
                                                <span className="text-forest/40 text-[9px] uppercase tracking-wider">{lang === 'pt' ? 'Entidade' : 'Entity'}</span>
                                                <span className="font-mono font-bold">{multibancoRef.entidade}</span>
                                            </div>
                                            <div className="flex justify-between border-b border-forest/5 pb-1">
                                                <span className="text-forest/40 text-[9px] uppercase tracking-wider">{lang === 'pt' ? 'Referência' : 'Reference'}</span>
                                                <span className="font-mono font-bold">{multibancoRef.referencia}</span>
                                            </div>
                                            <div className="flex justify-between pb-1">
                                                <span className="text-forest/40 text-[9px] uppercase tracking-wider">{lang === 'pt' ? 'Montante' : 'Amount'}</span>
                                                <span className="font-mono font-bold">{currentPrice}</span>
                                            </div>
                                        </div>
                                        <p className="text-[10px] text-forest/50 leading-relaxed text-center pt-1">
                                            {lang === 'pt' 
                                                ? 'Efetue o pagamento através do seu Homebanking ou numa caixa ATM. Receberá um e-mail assim que o pagamento for confirmado.'
                                                : 'Make the payment via your Homebanking or at an ATM. You will receive an email as soon as the payment is confirmed.'}
                                        </p>
                                        {!isLiveMode && (
                                            <button
                                                onClick={async () => {
                                                    try {
                                                        setIsPaying(true);
                                                        const res = await fetch(`${API_BASE_URL}/api/payment/webhook`, {
                                                            method: 'POST',
                                                            headers: { 'Content-Type': 'application/json' },
                                                            body: JSON.stringify({
                                                                orderId,
                                                                event: 'payment_intent.succeeded'
                                                            })
                                                        });
                                                        const statusData = await res.json();
                                                        if (statusData.status === 'paid') {
                                                            setIsPaying(false);
                                                            if (statusData.emailLinks) {
                                                                setSandboxEmails(statusData.emailLinks);
                                                            }
                                                        }
                                                    } catch (err: any) {
                                                        setIsPaying(false);
                                                        console.error("Erro ao simular webhook:", err);
                                                    }
                                                }}
                                                className="mt-2 w-full py-2 bg-forest text-cream font-mono text-[9px] tracking-wider rounded-lg font-bold uppercase cursor-pointer hover:bg-forest/95 transition-all text-center"
                                            >
                                                {isPaying ? 'A Processar...' : (lang === 'pt' ? 'Confirmar e Processar Pagamento' : 'Confirm & Process Payment')}
                                            </button>
                                        )}
                                    </div>
                                )}

                                {(() => {
                                    const estimate = getShippingEstimate(product, lang);
                                    return (
                                        <div className={`rounded-xl p-3.5 border text-left text-[11px] leading-relaxed font-sans ${
                                            estimate.inStock 
                                                ? 'bg-emerald-50/40 border-emerald-500/20 text-emerald-950' 
                                                : 'bg-amber-50/50 border-[#C5A059]/20 text-forest/80'
                                        }`}>
                                            <p className={`font-semibold mb-1 flex items-center gap-1.5 ${
                                                estimate.inStock ? 'text-emerald-700' : 'text-[#A68244]'
                                            }`}>
                                                <span className="text-xs">{estimate.inStock ? '✓' : '★'}</span>
                                                {estimate.title}
                                            </p>
                                            <p>{estimate.desc}</p>
                                        </div>
                                    );
                                })()}

                                <div className="bg-[#FCF8F2] rounded-xl p-5 border border-[#C5A059]/35 text-center space-y-3.5 w-full font-sans shadow-sm">
                                    <div className="flex justify-center gap-1.5 text-[#C5A059] text-sm">
                                        <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                                    </div>
                                    <p className="font-serif italic text-[13px] text-forest font-light leading-relaxed max-w-sm mx-auto">
                                        {lang === 'pt' 
                                            ? 'O seu apoio significa o mundo para o nosso atelier. Partilhe a sua experiência e deixe-nos uma breve crítica de 5 estrelas no Google!' 
                                            : 'Your support means the world to our atelier. Share your experience and leave us a quick 5-star review on Google!'}
                                    </p>
                                    <a
                                        href="https://g.page/r/Cdo7JGP_Xpc3EBM/review"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-block px-6 py-2.5 bg-[#243119] text-[#F5F2ED] rounded-full text-[10px] tracking-widest uppercase font-bold hover:bg-[#1a2412] active:bg-[#131b0d] transition-all shadow-sm"
                                    >
                                        {lang === 'pt' ? 'Deixar Crítica de 5 Estrelas no Google' : 'Leave 5-Star Review on Google'}
                                    </a>
                                </div>

                                {sandboxEmails && (
                                    <div className="w-full bg-[#243119]/5 rounded-2xl p-4 border border-[#243119]/10 text-left space-y-3 font-sans">
                                        <p className="text-[10px] uppercase tracking-wider text-[#A68244] font-bold">{t('sandbox.email_sim')}</p>
                                        <p className="text-[11px] text-forest/70 leading-relaxed">{t('sandbox.email_desc')}</p>
                                        <div className="flex flex-col gap-2 pt-1">
                                            <div className="grid grid-cols-2 gap-2">
                                                <a 
                                                    href={sandboxEmails.customerEmailUrl} 
                                                    target="_blank" 
                                                    rel="noreferrer"
                                                    className="block text-center rounded-lg py-2 bg-white border border-[#243119]/15 text-[10px] uppercase tracking-wider font-semibold text-forest hover:bg-[#243119] hover:text-white hover:border-transparent transition-all"
                                                >
                                                    {t('sandbox.view_client')}
                                                </a>
                                                <a 
                                                    href={sandboxEmails.adminEmailUrl} 
                                                    target="_blank" 
                                                    rel="noreferrer"
                                                    className="block text-center rounded-lg py-2 bg-white border border-[#243119]/15 text-[10px] uppercase tracking-wider font-semibold text-forest hover:bg-[#243119] hover:text-white hover:border-transparent transition-all"
                                                >
                                                    {t('sandbox.view_admin')}
                                                </a>
                                            </div>
                                            {sandboxEmails.shippedEmailUrl ? (
                                                <a 
                                                    href={sandboxEmails.shippedEmailUrl} 
                                                    target="_blank" 
                                                    rel="noreferrer"
                                                    className="block text-center rounded-lg py-2 bg-amber-500/10 border border-amber-500/30 text-[10px] uppercase tracking-wider font-bold text-[#A68244] hover:bg-amber-500 hover:text-white hover:border-transparent transition-all"
                                                >
                                                    {t('sandbox.view_shipped')}
                                                </a>
                                            ) : (
                                                <button 
                                                    onClick={handleShipOrder}
                                                    disabled={isShipping}
                                                    className="block w-full text-center rounded-lg py-2 bg-[#243119] text-white text-[10px] uppercase tracking-wider font-bold hover:bg-[#1a2412] disabled:opacity-50 transition-all cursor-pointer"
                                                >
                                                    {isShipping ? (lang === 'pt' ? 'A ENVIAR...' : 'SHIPPING...') : t('sandbox.ship_order')}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <button
                                    onClick={() => {
                                        setIsCheckingOut(false);
                                        setPaymentCompleted(false);
                                        setMultibancoRef(null);
                                        handleToggle(); // Close modal using existing trigger
                                    }}
                                    className="w-full rounded-full py-2 px-4 sm:py-2.5 sm:px-6 md:py-3 md:px-8 text-center font-bold bg-[#C5A059] text-[#343E2C] hover:bg-[#d5b069] text-[9px] sm:text-[10px] uppercase tracking-widest cursor-pointer shadow-md transition-all font-sans"
                                >
                                    {t('payment.btn_home')}
                                </button>
                            </div>
                        ) : (
                            /* Checkout Form and Gateway selection */
                            <div className="space-y-6 pb-12 lg:pb-6 text-left flex-grow flex flex-col justify-between">
                                <div className="space-y-6">
                                    {/* Product Summary Mini Card */}
                                    <div className="bg-forest/5 rounded-2xl p-4 border border-forest/5 flex justify-between items-center gap-4">
                                        <div className="flex items-center gap-3">
                                            <img 
                                                src={productImages[0]} 
                                                alt="" 
                                                loading="lazy"
                                                decoding="async"
                                                style={{ imageRendering: 'crisp-edges' }}
                                                className="w-12 h-12 rounded-lg object-cover border border-forest/5 antialiased" 
                                            />
                                            <div>
                                                <span className="font-serif font-light text-sm text-forest block">{product.name}</span>
                                                <span className="text-[10px] text-forest/50 uppercase tracking-wider">
                                                    {(!isCoaster || isClassicCoasters) && `${translateColor(selections.cor, lang)} `}{isMiniPouches && `| ${lang === 'pt' ? 'Fio: ' : 'Yarn: '}${translateColor(selections.corFio, lang)} `}{hasSize && `| ${translateSize(selections.tamanho, lang)}`}
                                                </span>
                                            </div>
                                        </div>
                                        <span className="font-serif text-base font-semibold text-forest">{currentPrice}</span>
                                    </div>

                                    {/* Shipping Details form */}
                                    <div className="space-y-3">
                                        <h5 className="text-[9px] uppercase tracking-[0.25em] font-bold text-forest/45">
                                            {lang === 'pt' ? '1. DADOS DE ENVIO & CONTATO' : '1. SHIPPING & CONTACT DETAILS'}
                                        </h5>
                                        
                                        <div className="space-y-2">
                                            <input 
                                                type="text" 
                                                placeholder={lang === 'pt' ? "Nome Completo" : "Full Name"} 
                                                required
                                                value={checkoutForm.nome}
                                                onChange={(e) => setCheckoutForm(prev => ({ ...prev, nome: e.target.value }))}
                                                className="w-full bg-white rounded-xl px-4 py-2.5 text-xs text-forest placeholder-forest/30 border border-forest/10 focus:border-[#C5A059] focus:outline-none transition-all font-sans"
                                            />
                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="flex flex-col gap-1">
                                                    <input 
                                                        type="email" 
                                                        placeholder={lang === 'pt' ? "E-mail" : "Email Address"} 
                                                        required
                                                        value={checkoutForm.email}
                                                        onChange={(e) => setCheckoutForm(prev => ({ ...prev, email: e.target.value }))}
                                                        className={`w-full bg-white rounded-xl px-4 py-2.5 text-xs text-forest placeholder-forest/30 border focus:outline-none transition-all font-sans ${
                                                            checkoutForm.email && !isValidEmail(checkoutForm.email)
                                                                ? 'border-red-300 focus:border-red-400' 
                                                                : 'border-forest/10 focus:border-[#C5A059]'
                                                        }`}
                                                    />
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <input 
                                                        type="tel" 
                                                        placeholder={lang === 'pt' ? "Telemóvel" : "Phone Number"} 
                                                        required
                                                        value={checkoutForm.telefone}
                                                        onChange={(e) => setCheckoutForm(prev => ({ ...prev, telefone: e.target.value.replace(/[^0-9+]/g, '') }))}
                                                        className="w-full bg-white rounded-xl px-4 py-2.5 text-xs text-forest placeholder-forest/30 border border-forest/10 focus:border-[#C5A059] focus:outline-none transition-all font-sans"
                                                    />
                                                </div>
                                            </div>

                                            {/* NIF Optional Field */}
                                            <div className="mt-2">
                                                <input 
                                                    type="text" 
                                                    placeholder={lang === 'pt' ? "NIF (Opcional - Para Fatura/Recibo)" : "NIF (Optional - For Receipt)"} 
                                                    maxLength={9}
                                                    value={checkoutForm.nif}
                                                    onChange={(e) => setCheckoutForm(prev => ({ ...prev, nif: e.target.value.replace(/\D/g, '') }))}
                                                    className="w-full bg-white rounded-xl px-4 py-2.5 text-xs text-forest placeholder-forest/30 border border-forest/10 focus:border-[#C5A059] focus:outline-none transition-all font-sans"
                                                />
                                            </div>

                                            {/* Real-time Email Spelling Check & Format Validation Suggestions */}
                                            {checkoutForm.email && (
                                                <div className="space-y-1">
                                                    {!isValidEmail(checkoutForm.email) && (
                                                        <div className="text-[10px] text-red-500 font-sans flex items-center gap-1 pl-1">
                                                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500"></span>
                                                            {lang === 'pt' 
                                                                ? 'Por favor introduza um e-mail válido (ex: nome@dominio.com).' 
                                                                : 'Please enter a valid email address (e.g. name@domain.com).'}
                                                        </div>
                                                    )}
                                                    {suggestCorrectEmail(checkoutForm.email) && (
                                                        <div className="text-[11px] text-amber-800 bg-amber-50/50 border border-amber-200/40 rounded-xl p-3 flex items-center justify-between gap-2 font-sans mt-1">
                                                            <div className="flex items-start gap-1.5">
                                                                <span className="text-amber-500 text-xs mt-0.5">💡</span>
                                                                <span>
                                                                    {lang === 'pt' ? 'Quis dizer ' : 'Did you mean '}
                                                                    <strong 
                                                                        className="underline cursor-pointer text-amber-950 font-semibold"
                                                                        onClick={() => setCheckoutForm(prev => ({ ...prev, email: suggestCorrectEmail(checkoutForm.email)! }))}
                                                                    >
                                                                        {suggestCorrectEmail(checkoutForm.email)}
                                                                    </strong>?
                                                                </span>
                                                            </div>
                                                            <button 
                                                                type="button"
                                                                onClick={() => setCheckoutForm(prev => ({ ...prev, email: suggestCorrectEmail(checkoutForm.email)! }))}
                                                                className="text-[10px] font-bold text-[#C5A059] hover:text-[#A68244] uppercase tracking-wider whitespace-nowrap bg-white/80 hover:bg-white border border-forest/5 rounded-lg px-2 py-1 transition-all"
                                                            >
                                                                {lang === 'pt' ? 'Corrigir' : 'Correct'}
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            <input 
                                                type="text" 
                                                placeholder={lang === 'pt' ? "Morada de Envio" : "Shipping Address"} 
                                                required
                                                value={checkoutForm.morada}
                                                onChange={(e) => setCheckoutForm(prev => ({ ...prev, morada: e.target.value }))}
                                                className="w-full bg-white rounded-xl px-4 py-2.5 text-xs text-forest placeholder-forest/30 border border-forest/10 focus:border-[#C5A059] focus:outline-none transition-all font-sans"
                                            />
                                            <div className="grid grid-cols-2 gap-2">
                                                <input 
                                                    type="text" 
                                                    placeholder={lang === 'pt' ? "Código Postal" : "Postal Code"} 
                                                    required
                                                    maxLength={8}
                                                    value={checkoutForm.codigoPostal}
                                                    onChange={(e) => setCheckoutForm(prev => ({ ...prev, codigoPostal: formatPostalCodePT(e.target.value) }))}
                                                    className="w-full bg-white rounded-xl px-4 py-2.5 text-xs text-forest placeholder-forest/30 border border-forest/10 focus:border-[#C5A059] focus:outline-none transition-all font-sans"
                                                />
                                                <input 
                                                    type="text" 
                                                    placeholder={lang === 'pt' ? "Cidade" : "City"} 
                                                    required
                                                    value={checkoutForm.cidade}
                                                    onChange={(e) => setCheckoutForm(prev => ({ ...prev, cidade: e.target.value }))}
                                                    className="w-full bg-white rounded-xl px-4 py-2.5 text-xs text-forest placeholder-forest/30 border border-forest/10 focus:border-[#C5A059] focus:outline-none transition-all font-sans"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Payment Gateway Selection */}
                                    <div className="space-y-3">
                                        <h5 className="text-[9px] uppercase tracking-[0.25em] font-bold text-forest/45">
                                            {lang === 'pt' ? '2. MÉTODO DE PAGAMENTO' : '2. PAYMENT METHOD'}
                                        </h5>

                                        <div className={`grid ${canUseWallet ? 'grid-cols-4' : 'grid-cols-3'} gap-2`}>
                                            {/* MBWAY */}
                                            <button
                                                type="button"
                                                onClick={() => setPaymentMethod('mbway')}
                                                className={`flex flex-col items-center justify-center py-2.5 rounded-xl border transition-all cursor-pointer ${
                                                    paymentMethod === 'mbway' 
                                                        ? 'bg-[#343E2C] text-[#C5A059] border-[#C5A059]' 
                                                        : 'bg-white text-forest/65 border-forest/10 hover:bg-forest/5'
                                                }`}
                                            >
                                                <span className="text-[10px] font-extrabold tracking-wider uppercase font-sans">MB WAY</span>
                                            </button>
                                            
                                            {/* Multibanco */}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setPaymentMethod('multibanco');
                                                }}
                                                className={`flex flex-col items-center justify-center py-2.5 rounded-xl border transition-all cursor-pointer ${
                                                    paymentMethod === 'multibanco' 
                                                        ? 'bg-[#343E2C] text-[#C5A059] border-[#C5A059]' 
                                                        : 'bg-white text-forest/65 border-forest/10 hover:bg-forest/5'
                                                }`}
                                            >
                                                <span className="text-[10px] font-extrabold tracking-wider uppercase font-sans">MB</span>
                                            </button>

                                            {/* Cartão de Crédito */}
                                            <button
                                                type="button"
                                                onClick={() => setPaymentMethod('card')}
                                                className={`flex flex-col items-center justify-center py-2.5 rounded-xl border transition-all cursor-pointer ${
                                                    paymentMethod === 'card' 
                                                        ? 'bg-[#343E2C] text-[#C5A059] border-[#C5A059]' 
                                                        : 'bg-white text-forest/65 border-forest/10 hover:bg-forest/5'
                                                }`}
                                            >
                                                <span className="text-[10px] font-extrabold tracking-wider uppercase font-sans">{lang === 'pt' ? 'CARTÃO' : 'CARD'}</span>
                                            </button>

                                            {/* Carteiras Digitais (Apple Pay / Google Pay) */}
                                            {canUseWallet && (
                                                <button
                                                    type="button"
                                                    onClick={() => setPaymentMethod('wallet')}
                                                    className={`flex flex-col items-center justify-center py-2.5 rounded-xl border transition-all cursor-pointer ${
                                                        paymentMethod === 'wallet' 
                                                            ? 'bg-[#343E2C] text-[#C5A059] border-[#C5A059]' 
                                                            : 'bg-white text-forest/65 border-forest/10 hover:bg-forest/5'
                                                    }`}
                                                >
                                                    <span className="text-[10px] font-extrabold tracking-wider uppercase font-sans">PAY</span>
                                                </button>
                                            )}
                                        </div>

                                        {/* Conditional Payment Method Input Panels */}
                                        <div className="mt-4 p-4 bg-white border border-forest/10 rounded-2xl min-h-[120px] flex flex-col justify-center">
                                            {paymentMethod === 'mbway' && (
                                                <div className="space-y-3 animate-fadeIn">
                                                    <span className="text-[9px] uppercase tracking-wider text-forest/40 font-mono">{lang === 'pt' ? 'Telemóvel Associado ao MB WAY' : 'Phone Associated with MB WAY'}</span>
                                                    <input 
                                                        type="tel" 
                                                        placeholder="9xx xxx xxx" 
                                                        required
                                                        value={checkoutForm.mbwayPhone}
                                                        onChange={(e) => setCheckoutForm(prev => ({ ...prev, mbwayPhone: e.target.value }))}
                                                        className="w-full bg-[#FCFBF9] rounded-xl px-4 py-2.5 text-xs text-forest placeholder-forest/30 border border-forest/10 focus:border-[#C5A059] focus:outline-none transition-all font-sans"
                                                    />
                                                    <p className="text-[10px] text-forest/50 font-sans leading-relaxed">
                                                        {lang === 'pt' ? (
                                                            <>Irá receber uma notificação na aplicação MB WAY para autorizar o pagamento no valor de <strong>{currentPrice}</strong>.</>
                                                        ) : (
                                                            <>You will receive a notification in the MB WAY app to authorize the payment of <strong>{currentPrice}</strong>.</>
                                                        )}
                                                    </p>
                                                </div>
                                            )}

                                            {paymentMethod === 'multibanco' && !multibancoRef && (
                                                <div className="space-y-2 animate-fadeIn text-center py-4">
                                                    <p className="text-[11px] text-forest/70 font-sans leading-relaxed">
                                                        {lang === 'pt' ? (
                                                            <>Será gerada uma referência Multibanco oficial para efetuar o pagamento após clicar em <strong>Gerar Referência Multibanco</strong>.</>
                                                        ) : (
                                                            <>An official Multibanco reference will be generated for your payment after you click <strong>Generate Multibanco Reference</strong>.</>
                                                        )}
                                                    </p>
                                                </div>
                                            )}

                                            {paymentMethod === 'multibanco' && multibancoRef && (
                                                <div className="space-y-3 animate-fadeIn">
                                                    <span className="text-[9px] uppercase tracking-wider text-[#A68244] font-mono font-bold block mb-1">{lang === 'pt' ? 'DADOS DE PAGAMENTO (ENTIDADE & REFERÊNCIA)' : 'PAYMENT DETAILS (ENTITY & REFERENCE)'}</span>
                                                    
                                                    <div className="space-y-1.5 font-sans text-xs bg-forest/5 p-3 rounded-xl border border-forest/5">
                                                        <div className="flex justify-between items-center border-b border-forest/5 pb-1">
                                                            <span className="text-forest/40 text-[9px] uppercase tracking-wider">{lang === 'pt' ? 'Entidade' : 'Entity'}</span>
                                                            <span className="font-mono font-bold text-forest">{multibancoRef.entidade}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center border-b border-forest/5 pb-1">
                                                            <span className="text-forest/40 text-[9px] uppercase tracking-wider">{lang === 'pt' ? 'Referência' : 'Reference'}</span>
                                                            <span className="font-mono font-bold text-forest">{multibancoRef.referencia}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center pb-1">
                                                            <span className="text-forest/40 text-[9px] uppercase tracking-wider">{lang === 'pt' ? 'Montante' : 'Amount'}</span>
                                                            <span className="font-mono font-bold text-forest">{currentPrice}</span>
                                                        </div>
                                                    </div>
                                                    <p className="text-[10px] text-forest/50 font-sans leading-relaxed">
                                                        {lang === 'pt' ? (
                                                            <>Efetue o pagamento num terminal Multibanco ou através do seu Homebanking usando a opção <i>"Pagamento de Serviços"</i>.</>
                                                        ) : (
                                                            <>Make the payment at any Multibanco ATM or via your Homebanking using the <i>"Payment of Services"</i> option.</>
                                                        )}
                                                    </p>
                                                </div>
                                            )}

                                            {paymentMethod === 'card' && (
                                                <div className="space-y-3 animate-fadeIn">
                                                    <span className="text-[9px] uppercase tracking-wider text-forest/40 font-mono">{lang === 'pt' ? 'Detalhes do Cartão' : 'Card Details'}</span>
                                                    <input 
                                                        type="text" 
                                                        placeholder={lang === 'pt' ? "Nome no Cartão" : "Cardholder Name"} 
                                                        required
                                                        value={checkoutForm.cardName}
                                                        onChange={(e) => setCheckoutForm(prev => ({ ...prev, cardName: e.target.value }))}
                                                        className="w-full bg-[#FCFBF9] rounded-xl px-4 py-2 text-xs text-forest placeholder-forest/30 border border-forest/10 focus:border-[#C5A059] focus:outline-none transition-all font-sans"
                                                    />
                                                    <input 
                                                        type="text" 
                                                        placeholder={lang === 'pt' ? "Número do Cartão" : "Card Number"} 
                                                        maxLength={19}
                                                        required
                                                        value={checkoutForm.cardNumber}
                                                        onChange={(e) => setCheckoutForm(prev => {
                                                            const clean = e.target.value.replace(/\D/g, '');
                                                            const formatted = clean.match(/.{1,4}/g)?.join(' ') || clean;
                                                            return { ...prev, cardNumber: formatted.substring(0, 19) };
                                                        })}
                                                        className="w-full bg-[#FCFBF9] rounded-xl px-4 py-2 text-xs text-forest placeholder-forest/30 border border-forest/10 focus:border-[#C5A059] focus:outline-none transition-all font-sans"
                                                    />
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <input 
                                                            type="text" 
                                                            placeholder="MM/YY" 
                                                            maxLength={5}
                                                            required
                                                            value={checkoutForm.cardExpiry}
                                                            onChange={(e) => setCheckoutForm(prev => {
                                                                const clean = e.target.value.replace(/\D/g, '');
                                                                let formatted = clean;
                                                                if (clean.length > 2) {
                                                                    formatted = `${clean.substring(0,2)}/${clean.substring(2,4)}`;
                                                                }
                                                                return { ...prev, cardExpiry: formatted };
                                                            })}
                                                            className="w-full bg-[#FCFBF9] rounded-xl px-4 py-2 text-xs text-forest placeholder-forest/30 border border-forest/10 focus:border-[#C5A059] focus:outline-none transition-all font-sans"
                                                        />
                                                        <input 
                                                            type="text" 
                                                            placeholder="CVV" 
                                                            maxLength={3}
                                                            required
                                                            value={checkoutForm.cardCvv}
                                                            onChange={(e) => setCheckoutForm(prev => ({ ...prev, cardCvv: e.target.value.replace(/\D/g, '') }))}
                                                            className="w-full bg-[#FCFBF9] rounded-xl px-4 py-2 text-xs text-forest placeholder-forest/30 border border-forest/10 focus:border-[#C5A059] focus:outline-none transition-all font-sans"
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            {paymentMethod === 'wallet' && (
                                                <div className="space-y-3 animate-fadeIn text-center py-2 flex flex-col items-center justify-center">
                                                    <span className="text-[9px] uppercase tracking-wider text-[#C5A059] font-mono font-bold">
                                                        {lang === 'pt' ? 'PAGAMENTO EXPRESSO COM CARTEIRA DIGITAL' : 'EXPRESS DIGITAL WALLET PAYMENT'}
                                                    </span>
                                                    
                                                    <div className="w-full max-w-[320px] min-h-[44px] mt-2 flex justify-center">
                                                        <div id="payment-request-button" className="w-full"></div>
                                                    </div>
                                                    
                                                    {!canUseWallet && (
                                                        <p className="text-[10px] text-red-500/80 font-sans leading-relaxed mt-2">
                                                            {lang === 'pt' ? (
                                                                'O Apple Pay ou Google Pay não está disponível no seu navegador atual. Por favor, use outro método de pagamento ou ative o Apple Pay/Google Pay.'
                                                            ) : (
                                                                'Apple Pay or Google Pay is not available on your current browser. Please use another payment method or enable Apple Pay/Google Pay.'
                                                            )}
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Complete Payment Button */}
                                <div className="pt-4">
                                    {checkoutError && (
                                        <div className="p-3 bg-red-50 border border-red-200/50 rounded-xl text-left text-[11px] text-red-900 leading-relaxed font-sans mb-3 flex flex-col gap-1 animate-fadeIn">
                                            <div className="flex justify-between items-center">
                                                <span className="font-semibold uppercase tracking-wide text-[9px] text-red-700">{lang === 'pt' ? 'Erro ou Falha de Pagamento' : 'Payment Error or Failure'}</span>
                                                <button onClick={() => setCheckoutError(null)} className="text-red-400 hover:text-red-700 font-bold px-1 text-xs">✕</button>
                                            </div>
                                            <p>{checkoutError}</p>
                                        </div>
                                    )}

                                    {paymentMethod !== 'wallet' ? (
                                        <motion.button
                                            disabled={isPaying || !checkoutForm.nome || !checkoutForm.email || !isValidEmail(checkoutForm.email) || !checkoutForm.morada || (paymentMethod === 'mbway' && !checkoutForm.mbwayPhone) || (paymentMethod === 'card' && (!checkoutForm.cardNumber || !checkoutForm.cardExpiry || !checkoutForm.cardCvv))}
                                            onClick={async () => {
                                            setIsPaying(true);
                                            setCheckoutError(null);
                                            setSandboxEmails(null);

                                            // If Multibanco ref is already active, clicking simulates the manual user payment webhook confirmation
                                            if (paymentMethod === 'multibanco' && multibancoRef) {
                                                try {
                                                    const res = await fetch(`${API_BASE_URL}/api/payment/webhook`, {
                                                        method: 'POST',
                                                        headers: { 'Content-Type': 'application/json' },
                                                        body: JSON.stringify({
                                                            orderId,
                                                            event: 'payment_intent.succeeded'
                                                        })
                                                    });
                                                    const statusData = await res.json();
                                                    if (statusData.status === 'paid') {
                                                        setIsPaying(false);
                                                        setPaymentCompleted(true);
                                                        if (statusData.emailLinks) {
                                                            setSandboxEmails(statusData.emailLinks);
                                                        }
                                                    } else {
                                                        throw new Error(lang === 'pt' ? "Erro ao simular webhook de pagamento." : "Error simulating payment webhook.");
                                                    }
                                                } catch (err: any) {
                                                    setIsPaying(false);
                                                    setCheckoutError(err.message || (lang === 'pt' ? 'Erro ao simular o recebimento do webhook.' : 'Error simulating webhook receipt.'));
                                                }
                                                return;
                                            }

                                            let amountInCents = 0;
                                             try {
                                                 const rawPriceNum = typeof rawPrice === 'number' ? rawPrice * (hasQuantity ? (parseInt(selections.quantidade) || 1) : 1) : 50;
                                                 amountInCents = Math.round(rawPriceNum * 100);
                                             } catch (e) {
                                                 amountInCents = 5000;
                                             }

                                            if (paymentMethod === 'card') {
                                                try {
                                                    // Parse Card expiry (MM/YY)
                                                    const expiryParts = checkoutForm.cardExpiry.split('/');
                                                    const expMonth = parseInt(expiryParts[0]?.trim());
                                                    const expYear = parseInt(expiryParts[1]?.trim());

                                                    if (isNaN(expMonth) || expMonth < 1 || expMonth > 12 || isNaN(expYear)) {
                                                        throw new Error(lang === 'pt' ? 'Data de validade do cartão inválida. Use o formato MM/YY.' : 'Invalid card expiry date. Use MM/YY format.');
                                                    }

                                                    // Calculate price in cents
                                                    const rawPriceNum = typeof rawPrice === 'number' ? rawPrice * (hasQuantity ? (parseInt(selections.quantidade) || 1) : 1) : 50; // default 50€ fallback
                                                    amountInCents = Math.round(rawPriceNum * 100);
                                                } catch (stripeErr: any) {
                                                    setIsPaying(false);
                                                    setCheckoutError(stripeErr.message || (lang === 'pt' ? 'Erro ao validar os detalhes do cartão.' : 'Error validating card details.'));
                                                    return;
                                                }
                                            }

                                            try {
                                                const response = await fetch(`${API_BASE_URL}/api/payment/create-intent`, {
                                                    method: 'POST',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({
                                                        product: {
                                                            id: product.id,
                                                            name: product.name,
                                                            price: currentPrice
                                                        },
                                                        selections,
                                                        checkoutForm,
                                                        paymentMethod,
                                                        amountInCents
                                                    })
                                                });

                                                const data = await response.json();

                                                if (!response.ok || data.error) {
                                                    throw new Error(data.error || (lang === 'pt' ? 'Erro ao conectar com a gateway de pagamentos.' : 'Error connecting to the payment gateway.'));
                                                }

                                                setOrderId(data.orderId);

                                                if (data.status === 'paid') {
                                                    setIsPaying(false);
                                                    setPaymentCompleted(true);
                                                    if (data.emailLinks) {
                                                        setSandboxEmails(data.emailLinks);
                                                    }
                                                } else if (data.status === 'failed') {
                                                    throw new Error(translateBackendError(data.errorMessage, lang) || (lang === 'pt' ? 'Transação recusada pela gateway.' : 'Transaction declined by the gateway.'));
                                                } else if (data.stripeClientSecret) {
                                                    // Handle 3D Secure / SCA action required
                                                    console.log("[STRIPE] Payment requires SCA action. Launching verification screen...");
                                                    const stripePubKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "";
                                                    const stripeObj = await loadStripe(stripePubKey);
                                                    if (!stripeObj) {
                                                        throw new Error('Stripe failed to load for SCA confirmation.');
                                                    }

                                                    const confirmResult = await stripeObj.confirmCardPayment(data.stripeClientSecret);
                                                    if (confirmResult.error) {
                                                        throw new Error(confirmResult.error.message);
                                                    }

                                                    if (confirmResult.paymentIntent && confirmResult.paymentIntent.status === 'succeeded') {
                                                        console.log("[STRIPE] 3D Secure Verification Success! Confirming order...");
                                                        // Inform server that payment is succeeded using the webhook simulation endpoint
                                                        const confirmRes = await fetch(`${API_BASE_URL}/api/payment/webhook`, {
                                                            method: 'POST',
                                                            headers: { 'Content-Type': 'application/json' },
                                                            body: JSON.stringify({
                                                                orderId: data.orderId,
                                                                event: 'payment_intent.succeeded'
                                                            })
                                                        });
                                                        const confirmData = await confirmRes.json();
                                                        if (confirmData.status === 'paid') {
                                                            setIsPaying(false);
                                                            setPaymentCompleted(true);
                                                            if (confirmData.emailLinks) {
                                                                setSandboxEmails(confirmData.emailLinks);
                                                            }
                                                        } else {
                                                            throw new Error(lang === 'pt' ? "Erro ao finalizar a encomenda após autenticação." : "Error finalizing order after authentication.");
                                                        }
                                                    } else {
                                                        throw new Error(lang === 'pt' ? 'A autenticação do cartão falhou ou foi cancelada.' : 'Card authentication failed or was cancelled.');
                                                    }
                                                } else {
                                                    // Pending payment
                                                    if (paymentMethod === 'multibanco') {
                                                        setMultibancoRef(data.multibancoRef);
                                                        setIsPaying(false);
                                                        setPaymentCompleted(true);
                                                    } else if (paymentMethod === 'mbway') {
                                                        // Poll status
                                                        let attempts = 0;
                                                        const intervalId = setInterval(async () => {
                                                            attempts++;
                                                            try {
                                                                const statusRes = await fetch(`${API_BASE_URL}/api/payment/status/${data.orderId}`);
                                                                if (!statusRes.ok) return;
                                                                const statusData = await statusRes.json();

                                                                if (statusData.status === 'paid') {
                                                                    clearInterval(intervalId);
                                                                    setIsPaying(false);
                                                                    setPaymentCompleted(true);
                                                                    if (statusData.emailLinks) {
                                                                        setSandboxEmails(statusData.emailLinks);
                                                                    }
                                                                } else if (statusData.status === 'failed') {
                                                                    clearInterval(intervalId);
                                                                    setIsPaying(false);
                                                                    setCheckoutError(translateBackendError(statusData.errorMessage, lang) || (lang === 'pt' ? 'Transação MB WAY recusada pelo utilizador.' : 'MB WAY transaction declined by the user.'));
                                                                }
                                                            } catch (pollErr) {
                                                                console.error("Erro ao consultar status:", pollErr);
                                                            }

                                                            if (attempts > 20) {
                                                                clearInterval(intervalId);
                                                                setIsPaying(false);
                                                                setCheckoutError(lang === 'pt' ? 'O tempo limite de aprovação MB WAY expirou (Simulação de Exceção/Timeout).' : 'MB WAY approval timeout expired (Exception/Timeout simulation).');
                                                            }
                                                        }, 3000);
                                                    }
                                                }
                                            } catch (err: any) {
                                                setIsPaying(false);
                                                setCheckoutError(err.message || (lang === 'pt' ? 'Ocorreu um erro ao processar o seu pagamento.' : 'An error occurred while processing your payment.'));
                                            }
                                        }}
                                        whileHover={{ scale: 1.01 }}
                                        whileTap={{ scale: 0.99 }}
                                        className="w-full rounded-full py-2.5 px-4 sm:py-3.5 sm:px-6 md:py-4 md:px-8 text-center font-bold bg-[#343E2C] text-[#C5A059] hover:bg-[#2c3525] active:scale-95 text-[9px] sm:text-[10px] md:text-[11px] uppercase tracking-widest cursor-pointer shadow-lg disabled:opacity-40 disabled:cursor-not-allowed border border-[#C5A059]/10 flex items-center justify-center gap-2 transition-all duration-300 font-sans"
                                    >
                                        {isPaying ? (
                                            <>
                                                <span className="animate-spin rounded-full h-3.5 w-3.5 border border-[#C5A059] border-t-transparent" />
                                                {paymentMethod === 'mbway' 
                                                    ? (lang === 'pt' ? 'A AGUARDAR AUTORIZAÇÃO MB WAY...' : 'AWAITING MB WAY AUTHORIZATION...') 
                                                    : (lang === 'pt' ? 'CONECTANDO GATEWAY...' : 'CONNECTING GATEWAY...')}
                                            </>
                                        ) : paymentMethod === 'multibanco' ? (
                                            multibancoRef 
                                                ? (lang === 'pt' ? 'SIMULAR PAGAMENTO WEBHOOK' : 'SIMULATE WEBHOOK PAYMENT') 
                                                : (lang === 'pt' ? 'GERAR REFERÊNCIA MULTIBANCO' : 'GENERATE MULTIBANCO REFERENCE')
                                        ) : (
                                            lang === 'pt' ? 'EFETUAR ENCOMENDA' : 'PLACE ORDER'
                                        )}
                                        </motion.button>
                                    ) : (
                                        <div className="w-full text-center py-4 px-4 bg-[#C5A059]/5 border border-[#C5A059]/20 rounded-2xl font-sans animate-fadeIn">
                                            <p className="text-[10px] uppercase tracking-wider text-[#C5A059] font-bold">
                                                {lang === 'pt' ? 'Clique no botão oficial acima para concluir o pagamento' : 'Click the official button above to complete payment'}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div data-lenis-prevent className="flex-1 overflow-y-visible lg:overflow-y-auto space-y-5 pr-1 select-text pb-32 lg:pb-4 scrollbar-thin scrollbar-thumb-forest/10 scrollbar-track-transparent">
                        
                        {/* Title & Navigation/Close Controls */}
                        <div className="flex justify-between items-start gap-4">
                            <div>
                                <span className="text-[9px] uppercase tracking-[0.4em] text-[#C5A059] block mb-1 font-sans font-semibold">EDIÇÃO EXCLUSIVA M★BRAVO</span>
                                <h3 className="text-3xl lg:text-3.5xl font-serif font-light text-forest leading-tight tracking-[0.05em] mb-1">{product.name}</h3>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0 z-30">
                                {onPrevProduct && onNextProduct && (
                                    <div className="flex items-center bg-forest/5 rounded-full p-1 border border-forest/10 shadow-sm backdrop-blur-sm">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onPrevProduct();
                                            }}
                                            className="p-1.5 rounded-full hover:bg-forest hover:text-cream transition-all bg-transparent text-forest cursor-pointer"
                                            title="Produto Anterior"
                                        >
                                            <ChevronLeft size={14} />
                                        </button>
                                        <span className="text-[8px] uppercase tracking-widest font-black text-forest/45 px-1.5 pointer-events-none select-none">PEÇA</span>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onNextProduct();
                                            }}
                                            className="p-1.5 rounded-full hover:bg-forest hover:text-cream transition-all bg-transparent text-forest cursor-pointer"
                                            title="Próximo Produto"
                                        >
                                            <ChevronRight size={14} />
                                        </button>
                                    </div>
                                )}
                                <button 
                                    onClick={handleToggle}
                                    className="p-2.5 rounded-full bg-forest/5 text-forest hover:bg-forest hover:text-cream transition-all border border-forest/10 shadow-sm cursor-pointer"
                                    title="Fechar"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Descrição em Layout Editorial Expandido e Fluido */}
                        {product.description && (
                            <p className="text-[13px] text-forest/75 leading-relaxed tracking-wide font-light font-sans whitespace-pre-line max-w-prose lg:max-w-[90%] w-full mb-6">
                                {product.description}
                            </p>
                        )}

                        {/* Detalhes do Produto */}
                        {product.details && (
                            <div className="mb-6 text-left max-w-prose lg:max-w-[90%] w-full">
                                <h5 className="text-[9px] uppercase tracking-[0.25em] font-bold text-forest/45 flex items-center gap-1.5 mb-3">
                                    <span className="text-[#C5A059] text-xs">●</span> {t('product.details_title')}
                                </h5>
                                <ul className="space-y-2 pl-0.5">
                                    {product.details.split('\n').map((line: string, index: number) => {
                                        const cleaned = line.replace(/^[•\-\s]+/, '').trim();
                                        return (
                                            <li key={index} className="flex items-start gap-2 text-[12px] text-forest/75 leading-relaxed font-light font-sans">
                                                <span className="text-[#C5A059] mt-0.5 shrink-0 select-none">•</span>
                                                <span>{cleaned}</span>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        )}

                        {/* Customization Selection Panels */}
                        <div className="space-y-6">
                            {/* Container Comum para Seletores (Cores, Tamanho, Quantidade) com recuo explícito */}
                            <div id="selection-selectors-group" className="space-y-6 text-left w-full">
                                {/* Cores */}
                                {(!isCoaster || isClassicCoasters) && (
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <h5 className="text-[9px] uppercase tracking-[0.25em] font-bold text-forest/45 flex items-center gap-1.5">
                                                <span className="text-[#C5A059] text-xs">●</span> {t('product.color')}
                                            </h5>
                                            <span className="text-[9px] font-extrabold text-[#A68244] bg-[#FDF9F3] px-3 py-0.5 rounded-full border border-[#C5A059]/10">
                                                {translateColor(selections.cor, lang)}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap gap-3">
                                            {colors.map(opt => {
                                                const isActive = selections.cor === opt.name;
                                                return (
                                                    <button 
                                                        key={opt.name}
                                                        onClick={() => setSelections(prev => ({ ...prev, cor: opt.name }))}
                                                        className={`w-8 h-8 rounded-full border transition-all p-0.5 cursor-pointer ${
                                                            isActive 
                                                                ? 'border-[#D4A33B] scale-110 shadow-md shadow-[#D4A33B]/10' 
                                                                : 'border-[#D4A33B]/20 hover:scale-110 hover:border-[#D4A33B]'
                                                        }`}
                                                        title={translateColor(opt.name, lang)}
                                                    >
                                                        <div 
                                                            className="w-full h-full rounded-full border border-forest/5" 
                                                            style={opt.bg ? { background: opt.bg } : { backgroundColor: opt.hex }}
                                                        />
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Cor do Fio (Mini Pouches Only) */}
                                {isMiniPouches && (
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <h5 className="text-[9px] uppercase tracking-[0.25em] font-bold text-forest/45 flex items-center gap-1.5">
                                                <span className="text-[#C5A059] text-xs">●</span> {t('product.yarn_color')}
                                            </h5>
                                            <span className="text-[9px] font-extrabold text-[#A68244] bg-[#FDF9F3] px-3 py-0.5 rounded-full border border-[#C5A059]/10">
                                                {translateColor(selections.corFio, lang)}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {yarnColors.map(opt => (
                                                <button 
                                                    key={opt.name}
                                                    onClick={() => setSelections(prev => ({ ...prev, corFio: opt.name }))}
                                                    className={`w-8 h-8 rounded-full border-2 transition-all p-0.5 cursor-pointer ${
                                                        selections.corFio === opt.name 
                                                            ? 'border-forest scale-110 shadow-md shadow-forest/10'
                                                            : 'border-transparent hover:scale-110'
                                                    }`}
                                                    title={translateColor(opt.name, lang)}
                                                >
                                                    <div 
                                                        className="w-full h-full rounded-full border border-forest/5" 
                                                        style={{ backgroundColor: opt.hex }} 
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Tamanho */}
                                {hasSize && (
                                    <div className="space-y-2">
                                        <h5 className="text-[9px] uppercase tracking-[0.25em] font-bold text-forest/45 flex items-center gap-1.5">
                                            <span className="text-[#C5A059] text-xs">●</span> {t('product.size')}
                                        </h5>
                                        <div className="flex flex-wrap gap-1.5">
                                            {sizes.map(opt => (
                                                <button 
                                                    key={opt}
                                                    onClick={() => setSelections(prev => ({ ...prev, tamanho: opt }))}
                                                    className={`rounded-full px-4 py-1.5 border border-forest/20 transition-all duration-300 text-xs font-bold cursor-pointer ${
                                                        selections.tamanho === opt 
                                                            ? 'bg-forest text-cream border-forest shadow-sm scale-105' 
                                                            : 'bg-white text-forest hover:bg-forest/5'
                                                    }`}
                                                >
                                                    {translateSize(opt, lang)}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Quantidade */}
                                {hasQuantity && (
                                    <div className="space-y-2">
                                        <h5 className="text-[9px] uppercase tracking-[0.25em] font-bold text-forest/45 flex items-center gap-1.5">
                                            <span className="text-[#C5A059] text-xs">●</span> {t('product.quantity')}
                                        </h5>
                                        <div className="flex flex-wrap gap-1.5">
                                            {quantities.map(opt => (
                                                <button 
                                                    key={opt}
                                                    onClick={() => setSelections(prev => ({ ...prev, quantidade: opt }))}
                                                    className={`rounded-full px-4 py-1.5 border border-forest/20 transition-all duration-300 text-xs font-bold cursor-pointer ${
                                                        selections.quantidade === opt 
                                                            ? 'bg-forest text-cream border-forest shadow-sm scale-105' 
                                                            : 'bg-white text-forest hover:bg-forest/5'
                                                    }`}
                                                >
                                                    {translateQuantity(opt, lang)}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Secção de Material & Composição (Estrutura de Cartões Minimalistas) */}
                            <div className="space-y-2 text-left">
                                <h5 className="text-[9px] uppercase tracking-[0.25em] font-bold text-forest/45 flex items-center gap-1.5">
                                    <span className="text-[#C5A059] text-xs">●</span> {t('product.material_label')}
                                </h5>
                                <div className="flex flex-col gap-2 w-full pt-1">
                                    {parseMaterials(materialText).map((item, idx) => (
                                        <div key={idx} className="bg-neutral-100/50 rounded-xl p-3 border border-forest/5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] text-left select-text">
                                            {item.title ? (
                                                <div className="space-y-0.5">
                                                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#A68244] block">
                                                        {item.title}
                                                    </span>
                                                    <p className="text-[12px] text-forest/80 leading-relaxed font-light font-sans">
                                                        {item.description}
                                                    </p>
                                                </div>
                                            ) : (
                                                <p className="text-[12px] text-forest/80 leading-relaxed font-light font-sans">
                                                    {item.description}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Secção de Manutenção e Cuidados (Com Ícones e Legendas) */}
                            <div className="space-y-3 text-left">
                                <h5 className="text-[9px] uppercase tracking-[0.25em] font-bold text-forest/45 flex items-center gap-1.5">
                                    <span className="text-[#C5A059] text-xs">●</span> {t('product.care_header')}
                                </h5>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-2 pt-1 select-none">
                                    <div className="flex flex-col items-center text-center">
                                        <div className="w-10 h-10 rounded-full bg-forest/5 flex items-center justify-center text-forest/70 border border-forest/5 hover:bg-forest/10 transition-colors">
                                            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M3 9h18c0 0-1.5 8-2 10s-1.5 2-3 2H8c-1.5 0-2.5-2-3-2S3 9 3 9z" />
                                                <path d="M3 12c1.8-1.5 3.8 1.5 5.6 0s3.8-1.5 5.6 0 3.8 1.5 5.6 0" />
                                                <path d="M12 3v7M9.5 4.5v5.5M14.5 3.5v6.5M7 6v4c0 1 1 2 2 2h4.5" />
                                            </svg>
                                        </div>
                                        <span className="text-[9px] tracking-tight leading-tight mt-1 text-forest/70 font-light font-sans max-w-[100px] sm:max-w-[65px]">
                                            {t('product.care.handwash')}
                                        </span>
                                    </div>
                                    <div className="flex flex-col items-center text-center">
                                        <div className="w-10 h-10 rounded-full bg-forest/5 flex items-center justify-center text-forest/70 border border-forest/5 hover:bg-forest/10 transition-colors">
                                            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                                <rect x="4" y="4" width="16" height="16" rx="3" />
                                                <line x1="8" y1="12" x2="16" y2="12" />
                                            </svg>
                                        </div>
                                        <span className="text-[9px] tracking-tight leading-tight mt-1 text-forest/70 font-light font-sans max-w-[100px] sm:max-w-[65px]">
                                            {t('product.care.dryflat')}
                                        </span>
                                    </div>
                                    <div className="flex flex-col items-center text-center">
                                        <div className="w-10 h-10 rounded-full bg-forest/5 flex items-center justify-center text-forest/70 border border-forest/5 hover:bg-forest/10 transition-colors">
                                            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                                <rect x="4" y="4" width="16" height="16" rx="3" />
                                                <circle cx="12" cy="12" r="5" />
                                                <line x1="6" y1="6" x2="18" y2="18" />
                                                <line x1="18" y1="6" x2="6" y2="18" />
                                            </svg>
                                        </div>
                                        <span className="text-[9px] tracking-tight leading-tight mt-1 text-forest/70 font-light font-sans max-w-[100px] sm:max-w-[65px]">
                                            {t('product.care.notumble')}
                                        </span>
                                    </div>
                                    <div className="flex flex-col items-center text-center">
                                        <div className="w-10 h-10 rounded-full bg-forest/5 flex items-center justify-center text-forest/70 border border-forest/5 hover:bg-forest/10 transition-colors">
                                            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M5 8c2 0 3 4 5 4s3-4 5-4 3 4 5 4M4 14c2 0 3-4 5-4s3 4 5 4 3-4 5-4" />
                                                <line x1="6" y1="6" x2="18" y2="18" />
                                                <line x1="18" y1="6" x2="6" y2="18" />
                                            </svg>
                                        </div>
                                        <span className="text-[9px] tracking-tight leading-tight mt-1 text-forest/70 font-light font-sans max-w-[100px] sm:max-w-[65px]">
                                            {t('product.care.nowring')}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="text-center font-sans tracking-wide py-4">
                                <p className="text-[10px] text-[#A68244]/80 italic font-medium">{finalNote}</p>
                            </div>

                            {/* B & C) TABLET & MOBILE RECAP BOX: Rendered statically in the scroll flow to present configuration status */}
                            <div className="lg:hidden block pb-4">
                                <div id="checkout-box-mobile" className="bg-forest/5 rounded-2xl p-5 border border-forest/10 shadow-sm relative overflow-hidden text-forest animate-fadeIn">
                                    <div className="flex justify-between items-center mb-3 pb-2.5 border-b border-forest/10">
                                        <h4 className="text-[10px] uppercase tracking-[0.25em] font-extrabold text-[#A68244]">{t('product.selected_config')}</h4>
                                        <span className="text-lg font-serif text-forest font-semibold tracking-tight">{currentPrice}</span>
                                    </div>

                                    <div className="space-y-1.5 text-[11px] uppercase tracking-wider text-forest/80 font-normal">
                                        {(!isCoaster || isClassicCoasters) && (
                                            <div className="flex justify-between items-center border-b border-forest/5 pb-1">
                                                <span className="text-forest/40 text-[9px] tracking-[0.2em]">{t('product.color')}</span>
                                                <span className="text-forest font-semibold">{translateColor(selections.cor, lang) || (lang === 'pt' ? 'Verde Musgo' : 'Moss Green')}</span>
                                            </div>
                                        )}
                                        {isMiniPouches && (
                                            <div className="flex justify-between items-center border-b border-forest/5 pb-1">
                                                <span className="text-forest/40 text-[9px] tracking-[0.2em]">{t('product.yarn_color')}</span>
                                                <span className="text-forest font-semibold">{translateColor(selections.corFio, lang) || (lang === 'pt' ? 'Branco Creme' : 'Cream White')}</span>
                                            </div>
                                        )}
                                        {hasSize && (
                                            <div className="flex justify-between items-center border-b border-forest/5 pb-1">
                                                <span className="text-forest/40 text-[9px] tracking-[0.2em]">{t('product.size')}</span>
                                                <span className="text-forest font-semibold">{translateSize(selections.tamanho, lang)}</span>
                                            </div>
                                        )}
                                        {hasQuantity && (
                                            <div className="flex justify-between items-center border-b border-forest/5 pb-1">
                                                <span className="text-forest/40 text-[9px] tracking-[0.2em]">{t('product.quantity')}</span>
                                                <span className="text-forest font-semibold">{translateQuantity(selections.quantidade, lang)}</span>
                                            </div>
                                        )}
                                        {product.dimensions && (
                                            <div className="flex justify-between items-center border-b border-forest/5 pb-1">
                                                <span className="text-forest/40 text-[9px] tracking-[0.2em]">{t('product.dimensions')}</span>
                                                <span className="text-forest font-semibold">{product.dimensions}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* A) DESKTOP FIXED FOOTER CHECKOUT BOX: Always anchored at the base of the sidebar, content scrolls beautifully behind it */}
                {!isCheckingOut && (
                    <div className="hidden lg:block shrink-0 mt-2">
                        <div id="checkout-box-desktop" className="bg-[#343E2C] rounded-2xl p-5 border border-white/10 shadow-lg relative overflow-hidden text-[#FCFBF9] animate-fadeIn">
                            <div className="flex justify-between items-center mb-3 pb-2.5 border-b border-white/10">
                                <h4 className="text-[11px] uppercase tracking-[0.25em] font-semibold bg-gradient-to-b from-[#F5E0B5] to-[#D4AF37] bg-clip-text text-transparent">{t('product.secure_checkout')}</h4>
                                <span className="text-2xl md:text-3xl font-serif text-[#FCFBF9] font-semibold tracking-tight">{currentPrice}</span>
                            </div>

                            <div className="space-y-1.5 mb-3.5 text-[11px] uppercase tracking-wider text-white/90 font-normal">
                                        {(!isCoaster || isClassicCoasters) && (
                                            <div className="flex justify-between items-center border-b border-white/5 pb-1">
                                                <span className="text-white/40 text-[9px] tracking-[0.2em]">{t('product.color')}</span>
                                                <span className="text-[#FCFBF9] font-semibold">{translateColor(selections.cor, lang) || (lang === 'pt' ? 'Verde Musgo' : 'Moss Green')}</span>
                                            </div>
                                        )}
                                        {isMiniPouches && (
                                            <div className="flex justify-between items-center border-b border-white/5 pb-1">
                                                <span className="text-white/40 text-[9px] tracking-[0.2em]">{t('product.yarn_color')}</span>
                                                <span className="text-[#FCFBF9] font-semibold">{translateColor(selections.corFio, lang) || (lang === 'pt' ? 'Branco Creme' : 'Cream White')}</span>
                                            </div>
                                        )}
                                        {hasSize && (
                                    <div className="flex justify-between items-center border-b border-white/5 pb-1">
                                        <span className="text-white/40 text-[9px] tracking-[0.2em]">{t('product.size')}</span>
                                        <span className="text-[#FCFBF9] font-semibold">{translateSize(selections.tamanho, lang)}</span>
                                    </div>
                                )}
                                {hasQuantity && (
                                    <div className="flex justify-between items-center border-b border-white/5 pb-1">
                                        <span className="text-white/40 text-[9px] tracking-[0.2em]">{t('product.quantity')}</span>
                                        <span className="text-[#FCFBF9] font-semibold">{translateQuantity(selections.quantidade, lang)}</span>
                                    </div>
                                )}
                                {product.dimensions && (
                                    <div className="flex justify-between items-center border-b border-white/5 pb-1">
                                        <span className="text-white/40 text-[9px] tracking-[0.2em]">{t('product.dimensions')}</span>
                                        <span className="text-[#FCFBF9] font-semibold">{product.dimensions}</span>
                                    </div>
                                )}
                            </div>
                            
                            <div className="space-y-2">
                                <motion.button 
                                    onClick={() => {
                                        const rand = Math.floor(100000 + Math.random() * 900000);
                                        setOrderId(`MB-${rand}`);
                                        setIsCheckingOut(true);
                                    }}
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.99 }}
                                    className="w-full rounded-full py-2.5 px-4 sm:py-3.5 sm:px-6 md:py-4 md:px-8 text-center font-bold bg-[#C5A059] text-[#343E2C] hover:bg-[#d5b069] active:scale-95 text-[9px] sm:text-[10px] md:text-[11px] uppercase tracking-widest cursor-pointer shadow-[0_4px_15px_rgba(197,160,89,0.3)] border border-[#C5A059]/10 block transition-all duration-300 font-sans"
                                >
                                    {t('product.instant_buy')}
                                </motion.button>
                                
                                <motion.a 
                                    href={whatsappUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.99 }}
                                    className="w-full rounded-full py-2 px-4 sm:py-2.5 sm:px-6 md:py-3 md:px-8 text-center font-bold bg-transparent text-[#FCFBF9] hover:bg-white/5 active:scale-95 text-[8px] sm:text-[9px] md:text-[10px] uppercase tracking-widest cursor-pointer border border-[#C5A059]/30 block transition-all duration-300 font-sans"
                                >
                                    {t('product.customize_design')}
                                </motion.a>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Sticky Mobile/Tablet Checkout Footer Bar */}
            {!isCheckingOut && (
                <div 
                    className="lg:hidden sticky bottom-0 left-0 right-0 z-[60] bg-[#FCFBF9]/95 backdrop-blur-md border-t border-forest/10 px-6 py-4 flex flex-col gap-3 shadow-[0_-12px_45px_rgba(31,42,24,0.08)] w-full shrink-0"
                    style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
                >
                    <div className="flex items-center justify-between w-full">
                        <div className="flex flex-col text-left">
                            <span className="text-[8px] uppercase tracking-[0.2em] text-[#A68244] font-bold font-sans">{t('product.total_amount')}</span>
                            <span className="text-xl sm:text-2xl font-serif text-forest font-semibold tracking-tight">{currentPrice}</span>
                        </div>
                        <motion.button 
                            onClick={() => {
                                const rand = Math.floor(100000 + Math.random() * 900000);
                                setOrderId(`MB-${rand}`);
                                setIsCheckingOut(true);
                            }}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            className="flex-1 max-w-[190px] xs:max-w-[210px] sm:max-w-[240px] rounded-full py-2 px-3 sm:py-3 sm:px-6 md:py-3.5 md:px-8 text-center font-bold bg-[#C5A059] text-[#343E2C] hover:bg-[#d5b069] text-[9px] sm:text-[10px] md:text-[11px] uppercase tracking-widest cursor-pointer shadow-[0_4px_15px_rgba(197,160,89,0.35)] border border-[#C5A059]/10 block font-sans"
                        >
                            {t('product.instant_buy')}
                        </motion.button>
                    </div>
                    <motion.a 
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        className="w-full rounded-full py-2 px-3 sm:py-2.5 sm:px-6 md:py-3 md:px-8 text-center font-medium bg-transparent text-forest hover:bg-forest/5 text-[8px] sm:text-[9px] uppercase tracking-widest cursor-pointer border border-[#C5A059]/30 block font-sans"
                    >
                        {t('product.customize_whatsapp')}
                    </motion.a>
                </div>
            )}
        </div>
        </>
    );
};

const ProductCard = React.memo(ProductCardComponent, (prev, next) => (
    prev.product.id === next.product.id &&
    prev.isFocused === next.isFocused &&
    prev.isSubdued === next.isSubdued &&
    prev.i === next.i
));

const CarouselItem: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div className="flex-none w-[78%] xs:w-[70%] sm:w-[46%] md:w-[45%] lg:w-[31.5%] xl:w-[31.5%] px-3 snap-center md:snap-start">
            <div className="w-full h-full">
                {children}
            </div>
        </div>
    );
};

const CollectionSection = () => {
    const containerRef = useRef(null);
    const { lang, t } = useLanguage();
    const [isMobileOrTablet, setIsMobileOrTablet] = useState(false);

    useEffect(() => {
        const checkDevice = () => {
            const isTouch = window.matchMedia("(pointer: coarse)").matches || ('ontouchstart' in window);
            setIsMobileOrTablet(window.innerWidth < 1536 || isTouch);
        };
        checkDevice();
        window.addEventListener('resize', checkDevice);
        return () => window.removeEventListener('resize', checkDevice);
    }, []);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    });

    const smoothProgress = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    const xTrack = useTransform(smoothProgress, [0, 1], ["-25%", "25%"]);
    const yTrack = useTransform(smoothProgress, [0, 1], ["-35%", "25%"]);
    const opacityTrack = useTransform(smoothProgress, [0, 0.2, 0.8, 1], [0, 0.04, 0.04, 0]);

    const translatedCategoriesList = SHOP_CATEGORIES.map(cat => translateCategory(cat, lang));

    return (
        <section ref={containerRef} id="collection" data-background="light" className="pt-10 xs:pt-12 sm:pt-16 lg:pt-20 xl:pt-24 pb-10 xs:pb-12 sm:pb-16 lg:pb-24 xl:pb-28 bg-[#F6F1E5] min-h-[80vh] relative overflow-hidden px-6 md:px-8 lg:px-16">

            <motion.div 
                style={{ x: xTrack, y: yTrack, opacity: opacityTrack, fontFamily: "'Cormorant Garamond', serif" }}
                className="absolute inset-0 pointer-events-none text-forest text-[26vw] md:text-[35vw] leading-none italic font-light whitespace-nowrap text-center flex items-center justify-center select-none z-0"
            >
                M★Bravo
            </motion.div>

            <div className="w-full max-w-7xl mx-auto mb-8 xs:mb-12 sm:mb-20 md:mb-24 text-center relative z-10">
                 {/* Halo radial suave atrás do título */}
                 <div 
                     className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none -z-10 rounded-full"
                     style={{
                         width: '700px',
                         height: '300px',
                         background: 'radial-gradient(circle, rgba(255,248,220,0.18) 0%, rgba(255,248,220,0.08) 35%, transparent 70%)'
                     }}
                 />
                 <motion.span 
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    className="text-[10px] uppercase tracking-[0.45em] font-bold text-forest/35 block font-sans mb-4"
                 >
                    {t('collection.tag')}
                 </motion.span>
                 <motion.h2 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className="text-3xl md:text-4xl lg:text-5xl font-light tracking-[0.1em] xs:tracking-[0.15em] sm:tracking-[0.2em] uppercase leading-tight text-center font-serif"
                  >
                        <span 
                            className="inline-flex items-center gap-1 justify-center"
                            style={{
                                color: '#162C1E', // Very dark forest/almost black green for debossed look
                                textShadow: '0.5px 0.5px 0px rgba(197, 160, 89, 0.4), -0.5px -0.5px 0px rgba(0, 0, 0, 0.2)', // debossed subtle depth and golden reflection
                            }}
                        >
                            M
                            <span 
                                className="inline-block select-none mx-1"
                                style={{
                                    background: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.75) 0%, rgba(255,255,255,0.15) 35%, transparent 70%), linear-gradient(to bottom, #F7E7A8 0%, #D9B45B 50%, #B8862F 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    WebkitTextStroke: '0px transparent', // override gold stroke on the star
                                    textShadow: 'none', // override shadow on the star
                                } as React.CSSProperties}
                              >
                                ★
                             </span>
                            BRAVO
                        </span>
                 </motion.h2>
                 
                 <motion.p
                     initial={{ opacity: 0, y: 10 }}
                     whileInView={{ opacity: 1, y: 0 }}
                     transition={{ duration: 1, delay: 0.2 }}
                     className="text-forest/60 text-lg md:text-xl font-serif font-light italic mt-6"
                 >
                     {t('collection.subtitle')}
                 </motion.p>
            </div>

            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 lg:gap-24">
                    {translatedCategoriesList.map((cat, i) => (
                        <motion.div 
                            key={cat.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="group relative aspect-[4/3] rounded-[12px] md:rounded-[16px] overflow-hidden bg-forest/5 cursor-pointer max-w-2xl mx-auto w-full shadow-md hover:shadow-xl transition-all duration-500"
                            style={{ 
                                willChange: 'transform',
                                WebkitBackfaceVisibility: 'hidden',
                                backfaceVisibility: 'hidden',
                                transform: 'translateZ(0)'
                            }}
                            onClick={() => navigateTo(getCategoryUrl(cat))}
                        >
                            <img 
                                src={cat.img} 
                                alt={cat.name} 
                                loading={i < 2 ? "eager" : "lazy"}
                                fetchPriority={i < 2 ? "high" : "auto"}
                                decoding="async"
                                style={{ 
                                    imageRendering: 'crisp-edges',
                                    WebkitBackfaceVisibility: 'hidden',
                                    backfaceVisibility: 'hidden',
                                    transform: 'translateZ(0)'
                                }}
                                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700 ease-out antialiased"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-forest/85 via-forest/15 to-transparent flex flex-col justify-end p-4 xs:p-5 sm:p-6 md:p-8 lg:p-10 xl:p-12 transition-all duration-500">
                                <h3 className="font-serif text-cream mb-1.5 uppercase tracking-wide leading-tight" style={{ fontSize: 'clamp(14px, 1.6vw + 6px, 22px)' }}>{cat.name}</h3>
                                {isMobileOrTablet ? (
                                    <motion.p 
                                        initial={{ opacity: 0, y: 12 }}
                                        whileInView={{ opacity: 0.65, y: 0 }}
                                        viewport={{ once: true, margin: "-10px" }}
                                        transition={{ duration: 0.8, delay: i * 0.15 + 0.25, ease: "easeOut" }}
                                        className="text-cream font-light mb-1 sm:mb-3 max-w-sm"
                                        style={{ fontSize: 'clamp(9px, 0.8vw + 6px, 13px)' }}
                                    >
                                        {cat.items}
                                    </motion.p>
                                ) : (
                                    <p className="text-cream/60 font-light mb-1 sm:mb-3 max-w-sm opacity-0 group-hover:opacity-100 transition-all duration-500 transform md:translate-y-3 md:group-hover:translate-y-0" style={{ fontSize: 'clamp(10px, 0.8vw + 6px, 14px)' }}>
                                        {cat.items}
                                    </p>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

const ContactSection = () => {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    });
    const { lang, t } = useLanguage();

    const smoothProgress = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    const xTrack = useTransform(smoothProgress, [0, 1], ["-10%", "10%"]);
    const yTrack = useTransform(smoothProgress, [0, 1], ["-20%", "20%"]);
    const opacityTrack = useTransform(smoothProgress, [0, 0.2, 0.8, 1], [0, 0.02, 0.02, 0]);

    const whatsappMessage = lang === 'pt' 
        ? "Olá! Vi o site da M★BRAVO e gostaria de saber mais sobre as suas peças."
        : "Hello! I saw the M★BRAVO website and would like to know more about your pieces.";

    return (
        <section ref={containerRef} id="contacto" data-background="dark" className="py-[clamp(3rem,8vw,9rem)] bg-forest relative overflow-hidden px-6 md:px-8 lg:px-16">
             {/* Large Script Background */}
             <motion.div 
                style={{ x: xTrack, y: yTrack, opacity: opacityTrack, fontFamily: "'Cormorant Garamond', serif" }}
                className="absolute inset-0 pointer-events-none text-cream text-[35vw] leading-none italic font-light whitespace-nowrap text-center flex items-center justify-center select-none z-0"
             >
                 M★Bravo
             </motion.div>

             <div className="w-full max-w-4xl mx-auto text-center relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif text-cream mb-[clamp(1.5rem,4vw,3rem)] leading-tight">{t('contact.title_1')} <br /><span className="italic">{t('contact.title_2')}</span></h2>
                    <p className="text-cream/50 text-lg md:text-xl lg:text-2xl font-light mb-[clamp(2rem,5vw,4rem)] leading-relaxed max-w-2xl mx-auto">
                        {t('contact.subtitle')}
                    </p>
                    
                    <div className="flex flex-col items-center gap-[clamp(1rem,3vw,3rem)]">
                        <a 
                            href="mailto:handmade.mbravo@gmail.com?subject=Pedido de Informações - M★BRAVO"
                            className="group flex items-center gap-[clamp(0.5rem,1.5vw,1rem)] text-[clamp(0.9rem,4vw,2.25rem)] font-serif text-cream hover:text-brand-green-light transition-all border-b border-cream/20 pb-[clamp(0.5rem,1.2vw,1rem)] break-all"
                        >
                            <Mail className="w-[clamp(1.25rem,4vw,2rem)] h-[clamp(1.25rem,4vw,2rem)] opacity-40 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                            handmade.mbravo@gmail.com
                        </a>

                        <a 
                            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappMessage)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-center gap-[clamp(0.5rem,1.5vw,1rem)] text-[clamp(0.9rem,4vw,2.25rem)] font-serif text-cream hover:text-brand-green-light transition-all border-b border-cream/20 pb-[clamp(0.5rem,1.2vw,1rem)] break-all"
                        >
                            <MessageCircle className="w-[clamp(1.25rem,4vw,2rem)] h-[clamp(1.25rem,4vw,2rem)] opacity-40 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                            {t('contact.chat_whatsapp')}
                        </a>
                    </div>
                </motion.div>

                <div className="mt-[clamp(3rem,8vw,12rem)] flex flex-wrap justify-center gap-[clamp(1rem,4vw,4rem)]">
                    <a href="https://instagram.com/mbravobycarolina/" target="_blank" rel="noopener noreferrer" className="text-[10px] uppercase tracking-[0.4em] text-cream/40 hover:text-cream transition-colors">
                        Instagram
                    </a>
                    <a href={MAILTO_LINK} className="text-[10px] uppercase tracking-[0.4em] text-cream/40 hover:text-cream transition-colors">
                        E-mail
                    </a>
                    <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappMessage)}`} target="_blank" rel="noopener noreferrer" className="text-[10px] uppercase tracking-[0.4em] text-cream/40 hover:text-cream transition-colors">
                        WhatsApp
                    </a>
                </div>
             </div>
        </section>
    );
};



const Footer = ({ onOpenLegal, onOpenAdmin }: { onOpenLegal: (type: 'envios' | 'privacidade' | 'termos') => void, onOpenAdmin?: () => void }) => {
    const { t } = useLanguage();
    return (
        <footer className="bg-forest text-cream py-[clamp(2.5rem,6vw,4rem)] px-4 border-t border-cream/5">
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row justify-between items-center gap-10 lg:gap-16">
                <div className="flex flex-col items-center lg:items-start gap-4">
                    <Logo light className="opacity-50 h-[clamp(5rem,10vw,9rem)]" />
                    {/* Minimalist Soft-Gold Payment Seals */}
                    <div className="flex items-center gap-4 text-[#C5A059]/40 mt-1" title="Métodos de Pagamento Seguros">
                        {/* MBWAY */}
                        <svg width="42" height="26" viewBox="0 0 42 26" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-5 w-auto transition-opacity hover:opacity-100" stroke="currentColor" strokeWidth="1.2">
                            <rect x="1" y="1" width="40" height="24" rx="5" />
                            <text x="50%" y="58%" textAnchor="middle" fontSize="7.5" fontWeight="900" fontFamily="sans-serif" fill="currentColor" letterSpacing="0.05em">MB WAY</text>
                        </svg>
                        {/* MULTIBANCO */}
                        <svg width="42" height="26" viewBox="0 0 42 26" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-5 w-auto transition-opacity hover:opacity-100" stroke="currentColor" strokeWidth="1.2">
                            <rect x="1" y="1" width="40" height="24" rx="5" />
                            <path d="M10 8H32M10 13H32M10 18H22" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                            <text x="27" y="20" fontSize="6.5" fontWeight="900" fontFamily="sans-serif" fill="currentColor">MB</text>
                        </svg>
                        {/* VISA */}
                        <svg width="42" height="26" viewBox="0 0 42 26" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-5 w-auto transition-opacity hover:opacity-100" stroke="currentColor" strokeWidth="1.2">
                            <rect x="1" y="1" width="40" height="24" rx="5" />
                            <text x="50%" y="60%" textAnchor="middle" fontSize="8" fontStyle="italic" fontWeight="900" fontFamily="sans-serif" fill="currentColor" letterSpacing="0.05em">VISA</text>
                        </svg>
                    </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-6 sm:gap-12 text-[10px] uppercase tracking-[0.2em] font-medium text-cream/65 text-center lg:text-left items-center">
                    <button onClick={() => onOpenLegal('envios')} className="hover:text-cream transition-colors cursor-pointer text-center lg:text-left uppercase tracking-[0.2em]">{t('footer.legal_shipping')}</button>
                    <button onClick={() => onOpenLegal('privacidade')} className="hover:text-cream transition-colors cursor-pointer text-center lg:text-left uppercase tracking-[0.2em]">{t('footer.legal_privacy')}</button>
                    <button onClick={() => onOpenLegal('termos')} className="hover:text-cream transition-colors cursor-pointer text-center lg:text-left uppercase tracking-[0.2em]">{t('footer.legal_terms')}</button>
                </div>

                <div className="text-[9px] uppercase tracking-[0.2em] text-cream/70 text-center lg:text-right flex flex-col gap-1 items-center lg:items-end">
                    <div className="text-cream/50 text-[8px] tracking-[0.3em] uppercase mb-1">{t('footer.support')}</div>
                    <a href={MAILTO_LINK} className="hover:text-cream transition-colors font-mono">{CONTACT_EMAIL}</a>
                    <a href="tel:+351912828182" className="hover:text-cream transition-colors font-mono">+351 912 828 182</a>
                    <div className="text-cream/45 mt-2 whitespace-pre-line text-center lg:text-right">
                        <span 
                            onClick={onOpenAdmin}
                            className="cursor-pointer transition-colors hover:text-cream/80 select-none active:opacity-80"
                            title="M★BRAVO Atelier"
                        >
                            {t('footer.made_in').split('\n')[0]}
                        </span>
                        {t('footer.made_in').includes('\n') && (
                            <>
                                <br />
                                {t('footer.made_in').split('\n')[1]}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </footer>
    );
};

const MemoryContinuesSection = ({ onDiscoverEssence }: { onDiscoverEssence: () => void }) => {
    const { t } = useLanguage();
    return (
        <section id="memoria" data-background="dark" className="py-24 md:py-32 bg-forest text-cream relative overflow-hidden select-none border-b border-forest/5 px-6 md:px-8 lg:px-16">
            <div className="w-full max-w-3xl mx-auto relative z-10 text-center">
                
                {/* Header Badge */}
                <div className="space-y-4 mb-10 md:mb-12">
                    <span className="text-[10px] uppercase tracking-[0.45em] font-semibold text-cream/65 block font-sans">
                        {t('memory.tag')}
                    </span>
                    <div className="h-[1px] w-12 bg-cream/20 mx-auto" />
                </div>

                {/* Centered spacious elements */}
                <div className="space-y-12 md:space-y-16">
                    {/* Title & Subtitle */}
                    <div className="space-y-6">
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif text-cream tracking-tight leading-tight font-light max-w-2xl mx-auto">
                            {t('memory.title')}
                        </h2>
                        
                        <p className="text-cream/80 font-serif italic text-lg md:text-xl lg:text-2xl leading-relaxed font-light max-w-2xl mx-auto">
                            {t('memory.subtitle')}
                        </p>
                    </div>

                    {/* Mbravo Born & Description */}
                    <div className="space-y-6 max-w-2xl mx-auto">
                        <p className="text-[#C5A059] font-serif italic text-lg md:text-xl lg:text-2xl font-normal tracking-wide leading-relaxed">
                            {t('memory.mbravo_born')}
                        </p>
                        
                        <p className="text-cream/70 text-sm md:text-base leading-relaxed font-sans font-light whitespace-pre-line">
                            {t('memory.desc')}
                        </p>
                    </div>

                    {/* Final Quote */}
                    <div className="pt-8 border-t border-cream/10 max-w-xl mx-auto">
                        <p className="font-serif italic text-sm md:text-base font-light leading-relaxed text-cream/90">
                            {t('memory.quote')}
                        </p>
                    </div>

                    {/* Subtle Centered CTA Pill Button with premium golden glow and micro-rotating/gliding gold star */}
                    <div className="pt-4 flex justify-center">
                        <button
                            onClick={onDiscoverEssence}
                            className="group relative inline-flex items-center gap-2.5 px-4 py-2 xs:px-5 xs:py-2.5 sm:px-6 sm:py-3 md:px-8 md:py-3.5 border-[0.5px] border-[#C5A059]/30 hover:border-[#C5A059] rounded-full text-cream text-[8px] sm:text-[10px] md:text-[11px] uppercase tracking-[0.3em] font-light transition-all duration-700 cursor-pointer bg-transparent overflow-hidden hover:scale-[1.01] active:scale-[0.98] hover:shadow-[0_0_25px_rgba(197,160,89,0.15)]"
                        >
                            {/* Premium internal delicate golden glow/shimmer sweep effect */}
                            <span className="absolute inset-0 bg-gradient-to-r from-[#C5A059]/0 via-[#C5A059]/12 to-[#C5A059]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 rounded-full blur-[2px]" />
                            <span className="absolute inset-0 bg-[#C5A059]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-full" />
                            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-[#C5A059]/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
                            
                            <span className="relative z-10">{t('btn.discover_philosophy')}</span>
                            <svg 
                                viewBox="0 0 24 24" 
                                className="relative z-10 w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-[17px] md:h-[17px] text-[#C5A059] fill-[#C5A059]/25 stroke-[#C5A059] stroke-[0.8] transition-all duration-700 ease-out group-hover:rotate-[150deg] group-hover:translate-x-2.5"
                            >
                                <path d="M12 1.5l2.9 6.2 6.6 1-4.8 4.9 1.1 6.9-5.8-3.2-5.8 3.2 1.1-6.9-4.8-4.9 6.6-1z" />
                            </svg>
                        </button>
                    </div>

                </div>
            </div>
        </section>
    );
};

const InstagramSection = () => {
    const { t } = useLanguage();
    const beholdId = import.meta.env.VITE_BEHOLD_WIDGET_ID || "";
    
    useEffect(() => {
        if (beholdId) {
            const existingScript = document.querySelector('script[src="https://w.behold.so/widget.js"]');
            if (!existingScript) {
                const script = document.createElement('script');
                script.src = "https://w.behold.so/widget.js";
                script.type = "module";
                document.body.appendChild(script);
            }
        }
    }, [beholdId]);


    
    const posts = [
        {
            id: 1,
            img: 'https://i.ibb.co/mCmVm2rL/mockup-coosters-luxury-1.png',
            alt: 'Daisy Coasters M★BRAVO',
            likes: '48',
            comments: '3',
            className: "col-span-1 md:col-span-1 lg:col-span-2 aspect-[4/5] rotate-[1.5deg] mt-1 sm:mt-2 lg:-mt-4"
        },
        {
            id: 2,
            img: 'https://i.ibb.co/NnCJyRTF/African-Flower-Pouch-10-1.png',
            alt: 'African Flower Pouch M★BRAVO',
            likes: '64',
            comments: '8',
            className: "col-span-1 md:col-span-1 lg:col-span-1 aspect-[1/1] rotate-[-2deg] -mt-3 sm:-mt-5 lg:mt-6 lg:translate-x-2"
        },
        {
            id: 3,
            img: 'https://i.ibb.co/zWNCP5Nx/Stella-Cushion-7-1.png',
            alt: 'Stella Cushion M★BRAVO',
            likes: '72',
            comments: '5',
            className: "col-span-1 md:col-span-1 lg:col-span-2 aspect-[3/4] rotate-[1deg] mt-4 sm:mt-6 lg:-mt-10 lg:-ml-2"
        },
        {
            id: 4,
            img: 'https://i.ibb.co/wNdC8NNG/Granny-square-sling-bag-20.png',
            alt: 'Granny Square Sling Bag M★BRAVO',
            likes: '59',
            comments: '6',
            className: "col-span-1 md:col-span-1 lg:col-span-1 aspect-[1/1] rotate-[-3deg] -mt-2 sm:-mt-4 lg:mt-4 lg:-ml-6"
        },
        {
            id: 5,
            img: 'https://i.ibb.co/kVZvr34t/Sunflower-coasters-5.png',
            alt: 'Sunflower Coasters M★BRAVO',
            likes: '41',
            comments: '2',
            className: "col-span-1 md:col-span-1 lg:col-span-1 aspect-[4/3] rotate-[2.5deg] mt-3 sm:mt-5 lg:mt-10 lg:-ml-4"
        },
        {
            id: 6,
            img: 'https://i.ibb.co/VY1dx3nt/Mini-shell-Pouch.png',
            alt: 'Mini Shell Pouch M★BRAVO',
            likes: '53',
            comments: '4',
            className: "col-span-1 md:col-span-1 lg:col-span-2 aspect-[4/5] rotate-[-1.5deg] -mt-4 sm:-mt-6 lg:-mt-6 lg:-ml-2"
        }
    ];

    return (
        <section id="instagram-feed" className="py-6 sm:py-10 md:py-12 px-6 md:px-8 lg:px-16 bg-[#F6F1E5] border-t border-forest/5 relative overflow-hidden">
            <div className="w-full max-w-7xl mx-auto relative z-10">
                <div className="text-center space-y-4 mb-8 sm:mb-12">
                    <span className="text-[10px] uppercase tracking-[0.45em] font-semibold text-forest/35 block font-sans">
                        {t('instagram.feed.title')}
                    </span>
                    <a 
                        href="https://instagram.com/mbravobycarolina/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-block text-lg md:text-xl lg:text-2xl font-serif text-[#C5A059] hover:text-[#B38E47] transition-colors duration-300 font-light select-none tracking-tight"
                    >
                        {t('instagram.feed.handle')}
                    </a>
                </div>

                {beholdId ? (
                    /* Dynamic Behold.so Feed */
                    <div className="w-full">
                        <div data-behold-id={beholdId}></div>
                    </div>
                ) : (
                    /* Elegant Fallback Grid - Asymmetrical studio moodboard grid responsive on all devices */
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-9 gap-4 sm:gap-6 lg:gap-6 items-start">
                        {posts.map((post, idx) => (
                            <motion.a
                                key={post.id}
                                href="https://instagram.com/mbravobycarolina/"
                                target="_blank"
                                rel="noopener noreferrer"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 1.2, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
                                className={`${post.className} group block relative bg-white p-2.5 pb-8 sm:pb-10 border border-forest/10 rounded-sm shadow-md hover:shadow-xl transition-all duration-500 ease-out`}
                            >
                                <div className="w-full h-full overflow-hidden relative aspect-square bg-forest/5 rounded-sm">
                                    <img 
                                        src={post.img} 
                                        alt={post.alt}
                                        loading="lazy"
                                        decoding="async"
                                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                        style={{ imageRendering: 'crisp-edges' }}
                                    />
                                    {/* Overlay on Hover */}
                                    <div className="absolute inset-0 bg-forest/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-2 text-cream z-10 p-2 text-center">
                                        <div className="flex items-center gap-1.5 text-sm font-sans font-medium">
                                            <Heart size={16} fill="currentColor" className="text-cream" />
                                            <span>{post.likes}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs font-sans font-medium opacity-90 mt-1">
                                            <Instagram size={14} className="text-cream" />
                                            <span className="text-[9px] uppercase tracking-wider font-semibold">{t('instagram.feed.view_profile')}</span>
                                        </div>
                                    </div>
                                </div>
                                {/* Editorial specimen-like tag label underneath in the white area */}
                                <div className="mt-3.5 text-left flex items-center justify-between border-t border-forest/5 pt-2 select-none pointer-events-none">
                                    <span className="font-mono text-[8px] text-forest/45 tracking-widest uppercase">M★B_SPEC_0{post.id}</span>
                                    <span className="font-serif italic text-[10px] text-forest/60">{post.alt.split(' ')[0]}</span>
                                </div>
                            </motion.a>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

const EssenceHero = ({ onBackToHome }: { onBackToHome: () => void }) => {
    const { t } = useLanguage();
    const containerRef = useRef<HTMLDivElement>(null);
    
    // We use scrollYProgress bound to the component viewport itself for gentle parallax decorative items
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"]
    });
    
    // Parallax values for floating background crochet needle and loop
    const needleY = useTransform(scrollYProgress, [0, 1], [0, -100]);
    const loopY = useTransform(scrollYProgress, [0, 1], [0, 120]);
    const loopRotate = useTransform(scrollYProgress, [0, 1], [0, 45]);

    // Automatic continuous animation progress (0 to 1 loop) for perfectly synchronized seamless flow
    const animProgress = useMotionValue(0);

    useEffect(() => {
        const controls = animate(animProgress, 1, {
            duration: 8, // slow, luxury brand tempo
            ease: "easeInOut",
            repeat: Infinity,
            repeatType: "loop"
        });
        return () => controls.stop();
    }, [animProgress]);

    // Animated thread weaving along photo path: coordinates & rotations synchronized on animProgress
    const threadX = useTransform(animProgress, [0, 0.2, 0.4, 0.6, 0.8], [-50, 140, 330, 215, 60], { clamp: true });
    const threadY = useTransform(animProgress, [0, 0.2, 0.4, 0.6, 0.8], [60, 30, 110, 220, 320], { clamp: true });
    const threadRotate = useTransform(animProgress, [0, 0.2, 0.4, 0.6, 0.8], [-15, 10, 35, 120, 180], { clamp: true });

    // Thread path length (drawing dynamically as automatic animation progresses)
    const backPathLength = useTransform(animProgress, [0, 0.4], [0, 1], { clamp: true });
    const backPathLengthAccent = useTransform(animProgress, [0.05, 0.45], [0, 1], { clamp: true });

    const frontPathLength = useTransform(animProgress, [0.4, 0.8], [0, 1], { clamp: true });
    const frontPathLengthAccent = useTransform(animProgress, [0.45, 0.85], [0, 1], { clamp: true });

    // Opacity transitions for needle to weave UNDER and then OVER cleanly
    const needleOpacityBack = useTransform(animProgress, [0, 0.38, 0.4], [1, 1, 0], { clamp: true });
    const needleOpacityFront = useTransform(animProgress, [0.39, 0.41, 0.8, 0.9], [0, 1, 1, 0], { clamp: true });

    // Thread paths fade out smoothly at the end of cycle for a seamless, continuous loop
    const pathOpacity = useTransform(animProgress, [0, 0.85, 0.95, 1.0], [1, 1, 0, 0], { clamp: true });

    return (
        <section 
            ref={containerRef}
            data-background="dark" 
            className="relative bg-forest pt-20 xs:pt-24 sm:pt-28 pb-10 sm:pb-14 px-6 md:px-8 lg:px-16 overflow-hidden border-b border-forest/5 select-none text-cream"
        >
            {/* Soft, giant, organic vector curves in the background mimicking elegant flowing wool threads */}
            <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
                <svg className="w-full h-full opacity-40" viewBox="0 0 1440 800" fill="none" preserveAspectRatio="none">
                    <path d="M -100,200 C 300,50 600,650 1000,150 C 1200,50 1400,550 1600,200" stroke="#C5A059" strokeWidth="0.75" strokeLinecap="round" fill="none" opacity="0.1" />
                    <path d="M 200,700 C 400,300 700,600 1100,200 C 1300,100 1500,500 1700,300" stroke="#C5A059" strokeWidth="0.5" strokeLinecap="round" fill="none" opacity="0.08" />
                    <path d="M -50,400 C 300,600 850,200 1200,450 C 1400,550 1500,250 1600,350" stroke="#C5A059" strokeWidth="1.2" strokeLinecap="round" strokeDasharray="3 6" fill="none" opacity="0.08" />
                </svg>
            </div>

            {/* Shared Gradient, Filters & Masks for high-end 3D realism and performance */}
            <svg className="absolute w-0 h-0 overflow-hidden pointer-events-none" aria-hidden="true" style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}>
                <defs>
                    <linearGradient id="needle-gold-matte" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#FFF1D6" />
                        <stop offset="35%" stopColor="#D5B26F" />
                        <stop offset="70%" stopColor="#A8813C" />
                        <stop offset="100%" stopColor="#73541A" />
                    </linearGradient>
                    <filter id="needle-shadow" x="-50%" y="-50%" width="200%" height="200%">
                        <feDropShadow dx="2" dy="4" stdDeviation="3" floodColor="#1C2E24" floodOpacity="0.25" />
                    </filter>
                    <clipPath id="yarn-mask" clipPathUnits="objectBoundingBox">
                        <path d="M 0.22, 0.08 C 0.42, -0.04, 0.72, -0.01, 0.88, 0.12 C 1.02, 0.25, 1.03, 0.52, 0.94, 0.74 C 0.86, 0.92, 0.64, 1.01, 0.42, 0.98 C 0.20, 0.96, 0.04, 0.80, 0.01, 0.58 C -0.02, 0.38, 0.04, 0.18, 0.22, 0.08 Z" />
                    </clipPath>
                </defs>
            </svg>

            {/* Parallax Floating Crochet Needle removed per user request to streamline layout */}

            {/* Elegant Background organic line representing the thread (Fio) with movement */}
            <div className="absolute inset-0 pointer-events-none z-0">
                <svg className="w-full h-full opacity-[0.12]" viewBox="0 0 1440 600" fill="none" preserveAspectRatio="none">
                    <motion.path 
                        d="M -100 150 C 300 80, 600 350, 1000 200 C 1200 120, 1350 400, 1600 300" 
                        stroke="#C5A059" 
                        strokeWidth="1.5" 
                        strokeLinecap="round" 
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 4, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}
                    />
                    <motion.path 
                        d="M -100 180 C 250 110, 550 320, 950 250 C 1150 170, 1300 380, 1600 320" 
                        stroke="#C5A059" 
                        strokeWidth="0.75" 
                        strokeLinecap="round" 
                        initial={{ y: 0 }}
                        animate={{ y: [-15, 15, -15] }}
                        transition={{ duration: 15, ease: "easeInOut", repeat: Infinity }}
                    />
                </svg>
            </div>

            <div className="relative z-10 max-w-6xl mx-auto flex flex-col space-y-8">
                {/* Back Link positioned elegantly at the top left - custom ultra-fine brand needle arrow */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="self-start relative z-20"
                >
                    <button 
                        onClick={onBackToHome}
                        className="group inline-flex items-center gap-2 px-5 py-2 border-[0.5px] border-cream/30 hover:border-[#C5A059] text-cream/80 hover:text-cream rounded-full text-[9px] uppercase tracking-[0.35em] font-light transition-all duration-500 cursor-pointer bg-transparent hover:bg-[#C5A059]/5 hover:scale-[1.01] active:scale-[0.98]"
                    >
                        <ArrowLeft size={10} className="stroke-[1.2] group-hover:-translate-x-1 transition-transform duration-500 text-[#C5A059]" />
                        <span>{t('nav.home')}</span>
                    </button>
                </motion.div>
 
                {/* Main Content Layout: Grid for PC / Tablet, Flex/Column for Mobile */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center">
                    {/* Left Column: Copy & Text */}
                    <div className="md:col-span-7 text-center md:text-left space-y-4 md:space-y-6">
                        <motion.span 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.6 }}
                            transition={{ duration: 1.2, delay: 0.2 }}
                            className="text-[9px] uppercase tracking-[0.6em] font-bold text-[#C5A059] block font-sans"
                        >
                            {t('nav.philosophy')}
                        </motion.span>
                        
                        <motion.h1 
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                            className="text-[clamp(1.5rem,4vw,3.25rem)] font-serif text-[#FCFBF9] leading-tight font-light tracking-tight select-text"
                        >
                            {t('brand.slogan')}
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 0.8, y: 0 }}
                            transition={{ duration: 1.2, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
                            className="text-[clamp(0.95rem,2vw,1.35rem)] font-serif italic text-[#D4C3A3] font-light max-w-xl mx-auto md:mx-0 leading-relaxed"
                        >
                            "{t('manifesto.quote')}"
                        </motion.p>
                    </div>

                    {/* Right Column: Branded Cosy Crochet Image integrated with organic mask and woven thread */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1.4, delay: 0.4 }}
                        className="md:col-span-5 flex justify-center relative"
                    >
                        {/* Interactive container for mask & 3D weaving thread */}
                        <div className="relative group/heroimg max-w-xs sm:max-w-sm md:max-w-full w-full aspect-[4/3]">
                            
                            {/* Animated Golden Thread (Fio) winding BEHIND the image with beautiful 3D drop shadow */}
                            <svg className="absolute inset-0 pointer-events-none z-0 overflow-visible" viewBox="0 0 400 300" fill="none" style={{ filter: 'drop-shadow(2px 3px 4px rgba(28,46,36,0.15))' }}>
                                <motion.path 
                                    d="M -50,60 C 100,-10 250,40 330,110" 
                                    stroke="#C5A059" 
                                    strokeWidth="1.8" 
                                    strokeLinecap="round" 
                                    style={{ pathLength: backPathLength, opacity: pathOpacity }}
                                />
                                <motion.path 
                                    d="M -50,65 C 100,-5 250,45 330,115" 
                                    stroke="#C5A059" 
                                    strokeWidth="0.6" 
                                    strokeOpacity="0.4"
                                    strokeLinecap="round" 
                                    style={{ pathLength: backPathLengthAccent, opacity: pathOpacity }}
                                />
                                
                                {/* 3D crochet needle leading the thread - active in the behind-layer stitch phase */}
                                <motion.g 
                                    style={{ x: threadX, y: threadY, rotate: threadRotate, opacity: needleOpacityBack }}
                                    className="overflow-visible"
                                >
                                    <g filter="url(#needle-shadow)">
                                        <path 
                                            d="M -8,0 L -3,0 C -2,-2.5 2,-2.5 4,0 L 55,0 C 58,0 60,-0.5 62,-1.2 C 64,-2 65.5,-1 66,1 C 66.5,2.5 65,3.8 63,3 C 61.5,2.4 61,1.2 60,1 L 59,1 C 57.5,1 57,0 55,0" 
                                            stroke="url(#needle-gold-matte)" 
                                            strokeWidth="1.5" 
                                            strokeLinecap="round" 
                                            fill="none" 
                                        />
                                    </g>
                                </motion.g>
                            </svg>

                            {/* Outer wrapper applying a gorgeous 3D soft diffused drop-shadow that follows the organic clipped mask shape */}
                            <div className="w-full h-full relative z-10" style={{ filter: 'drop-shadow(0px 22px 40px rgba(36,49,21,0.16))' }}>
                                {/* Masked Image Container */}
                                <div 
                                    className="w-full h-full relative bg-[#FCFBF9]"
                                    style={{ clipPath: 'url(#yarn-mask)' }}
                                >
                                    {/* Signature Poncho brand image */}
                                    <img 
                                        src="https://i.ibb.co/3907byLt/IMG-2738-2.jpg" 
                                        alt="Signature Granny Poncho" 
                                        loading="eager"
                                        fetchPriority="high"
                                        className="w-full h-full object-cover group-hover/heroimg:scale-105 transition-transform duration-700 ease-out"
                                    />
                                </div>
                            </div>

                            {/* Animated Golden Thread (Fio) winding IN FRONT OF the image with deep 3D physical drop shadow */}
                            <svg className="absolute inset-0 pointer-events-none z-20 overflow-visible" viewBox="0 0 400 300" fill="none" style={{ filter: 'drop-shadow(2px 4px 6px rgba(28,46,36,0.22))' }}>
                                <motion.path 
                                    d="M 330,110 C 370,145 340,210 230,230 C 130,250 100,210 60,320" 
                                    stroke="#C5A059" 
                                    strokeWidth="1.8" 
                                    strokeLinecap="round" 
                                    style={{ pathLength: frontPathLength, opacity: pathOpacity }}
                                />
                                <motion.path 
                                    d="M 330,115 C 370,150 340,215 230,235 C 130,255 100,215 60,325" 
                                    stroke="#C5A059" 
                                    strokeWidth="0.6" 
                                    strokeOpacity="0.4"
                                    strokeLinecap="round" 
                                    style={{ pathLength: frontPathLengthAccent, opacity: pathOpacity }}
                                />
                                
                                {/* 3D crochet needle leading the thread - active in the front-layer stitch phase */}
                                <motion.g 
                                    style={{ x: threadX, y: threadY, rotate: threadRotate, opacity: needleOpacityFront }}
                                    className="overflow-visible"
                                >
                                    <g filter="url(#needle-shadow)">
                                        <path 
                                            d="M -8,0 L -3,0 C -2,-2.5 2,-2.5 4,0 L 55,0 C 58,0 60,-0.5 62,-1.2 C 64,-2 65.5,-1 66,1 C 66.5,2.5 65,3.8 63,3 C 61.5,2.4 61,1.2 60,1 L 59,1 C 57.5,1 57,0 55,0" 
                                            stroke="url(#needle-gold-matte)" 
                                            strokeWidth="1.5" 
                                            strokeLinecap="round" 
                                            fill="none" 
                                        />
                                    </g>
                                </motion.g>
                            </svg>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

const TestimonialsSection = () => {
    const { lang, t } = useLanguage();
    const [apiTestimonials, setApiTestimonials] = useState<any[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);

    // Default translated testimonials
    const defaultTestimonials = [
        {
            name: t('testimonial.1.name'),
            text: t('testimonial.1.text'),
            product: t('testimonial.1.product'),
            rating: 5
        },
        {
            name: t('testimonial.2.name'),
            text: t('testimonial.2.text'),
            product: t('testimonial.2.product'),
            rating: 5
        },
        {
            name: t('testimonial.3.name'),
            text: t('testimonial.3.text'),
            product: t('testimonial.3.product'),
            rating: 5
        },
        {
            name: t('testimonial.4.name'),
            text: t('testimonial.4.text'),
            product: t('testimonial.4.product'),
            rating: 5
        },
        {
            name: t('testimonial.5.name'),
            text: t('testimonial.5.text'),
            product: t('testimonial.5.product'),
            rating: 5
        }
    ];

    // Fetch persistent reviews globally from live back-end database
    useEffect(() => {
        fetch(`${API_BASE_URL}/api/testimonials`)
            .then(res => {
                if (!res.ok) {
                    throw new Error(`Server responded with status ${res.status}`);
                }
                return res.json();
            })
            .then(data => {
                if (Array.isArray(data)) {
                    setApiTestimonials(data);
                }
            })
            .catch(err => {
                console.warn('[TESTIMONIALS FETCH ERROR] Fallback to default local testimonials.', err);
            });
    }, []);

    const allTestimonials = [...defaultTestimonials, ...apiTestimonials];

    const nextTestimonial = () => {
        setActiveIndex((prev) => (prev + 1) % allTestimonials.length);
    };

    const prevTestimonial = () => {
        setActiveIndex((prev) => (prev - 1 + allTestimonials.length) % allTestimonials.length);
    };

    return (
        <section id="testimonials" data-background="light" className="py-6 sm:py-8 md:py-10 bg-[#F6F1E5] relative overflow-hidden select-none border-t border-b border-forest/5">
            
            <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Header */}
                <div className="text-center mb-5 sm:mb-6">
                    <h2 className="text-[clamp(1.25rem,3.5vw,1.85rem)] font-serif text-forest tracking-tight leading-tight font-light mb-1.5">
                        {t('testimonials.title')}
                    </h2>
                    <p className="text-forest/60 font-serif italic text-xs sm:text-[13px] max-w-xl mx-auto mb-3">
                        {t('testimonials.subtitle')}
                    </p>
                    <a
                        href={`${API_BASE_URL}/api/write-review`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-1.5 border border-forest/15 hover:border-[#C5A059] text-forest/75 hover:text-forest text-[9px] uppercase tracking-widest font-semibold rounded-full bg-cream/30 hover:bg-cream/70 transition-all duration-300 shadow-sm cursor-pointer"
                    >
                        <MessageCircle size={11} />
                        {t('testimonials.write_button')}
                    </a>
                </div>

                {/* Poetic single testimonial layout - minimalist, centered and floating */}
                <div className="relative max-w-lg sm:max-w-xl mx-auto px-4 py-0.5">
                    <div className="relative min-h-[145px] sm:min-h-[155px] flex items-center justify-center">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeIndex}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.4, ease: "easeInOut" }}
                                className="w-full bg-transparent relative flex flex-col items-center justify-center text-center py-2"
                            >
                                {/* Stars & Google credibility icon aligned perfectly together */}
                                <div className="flex items-center gap-2 justify-center mb-2">
                                    <div className="flex items-center gap-0.5">
                                        {[...Array(allTestimonials[activeIndex]?.rating || 5)].map((_, i) => (
                                            <svg key={i} className="w-3 h-3 text-[#C5A059]" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                        ))}
                                    </div>
                                    <span className="w-px h-2.5 bg-[#C5A059]/30 block self-center" />
                                    <span className="text-[#C5A059] opacity-95 transition-opacity duration-300" title="Google Verified Review">
                                        <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                                        </svg>
                                    </span>
                                </div>

                                {/* Tight, delicate, and compact 1px gold border around ONLY the comment text */}
                                <div className="border border-[#C5A059]/20 rounded-xl px-4 py-1.5 w-[90%] md:w-full max-w-sm sm:max-w-md md:max-w-xl min-h-[44px] sm:min-h-[48px] flex items-center justify-center mx-auto bg-transparent relative shadow-[0_1px_6px_rgba(197,160,89,0.01)]">
                                    <blockquote className="text-forest/85 text-xs sm:text-[13px] font-serif italic leading-relaxed select-text line-clamp-2 text-center px-1">
                                        "{allTestimonials[activeIndex]?.text}"
                                    </blockquote>
                                </div>

                                {/* Author info */}
                                <div className="mt-2.5 flex flex-col items-center justify-center">
                                    <cite className="not-italic text-[8px] sm:text-[9px] font-semibold uppercase tracking-[0.2em] text-forest font-sans">
                                        {allTestimonials[activeIndex]?.name}
                                    </cite>
                                    {allTestimonials[activeIndex]?.product && (
                                        <span className="text-[7.5px] uppercase tracking-[0.15em] text-[#C5A059] block font-mono mt-0.5">
                                            {allTestimonials[activeIndex]?.product}
                                        </span>
                                    )}
                                </div>
                            </motion.div>
                        </AnimatePresence>

                        {/* Navigation Arrows for large screens */}
                        <div className="absolute top-1/2 -translate-y-1/2 -left-12 hidden md:block">
                            <button
                                onClick={prevTestimonial}
                                className="w-8 h-8 border border-forest/10 rounded-full flex items-center justify-center text-forest/55 hover:text-forest hover:border-forest hover:bg-forest/5 transition-all cursor-pointer"
                                aria-label="Previous testimonial"
                            >
                                <ChevronLeft size={14} />
                            </button>
                        </div>
                        <div className="absolute top-1/2 -translate-y-1/2 -right-12 hidden md:block">
                            <button
                                onClick={nextTestimonial}
                                className="w-8 h-8 border border-forest/10 rounded-full flex items-center justify-center text-forest/55 hover:text-forest hover:border-forest hover:bg-forest/5 transition-all cursor-pointer"
                                aria-label="Next testimonial"
                            >
                                <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>

                    {/* Navigation controls & Dots under the card */}
                    <div className="flex items-center justify-center gap-6 mt-2.5">
                        <button
                            onClick={prevTestimonial}
                            className="md:hidden w-8 h-8 border border-forest/10 rounded-full flex items-center justify-center text-forest/55 hover:text-forest hover:border-forest hover:bg-forest/5 transition-all cursor-pointer"
                            aria-label="Previous testimonial"
                        >
                            <ChevronLeft size={12} />
                        </button>

                        <div className="flex items-center gap-1.5">
                            {allTestimonials.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setActiveIndex(i)}
                                    className={`h-1 rounded-full transition-all duration-300 ${i === activeIndex ? 'w-4 bg-[#C5A059]' : 'w-1.5 bg-forest/15 hover:bg-forest/30'}`}
                                    aria-label={`Go to testimonial ${i + 1}`}
                                />
                            ))}
                        </div>

                        <button
                            onClick={nextTestimonial}
                            className="md:hidden w-8 h-8 border border-forest/10 rounded-full flex items-center justify-center text-forest/55 hover:text-forest hover:border-forest hover:bg-forest/5 transition-all cursor-pointer"
                            aria-label="Next testimonial"
                        >
                            <ChevronRight size={12} />
                        </button>
                    </div>
                </div>
            </div>

        </section>
    );
};

// ==========================================
// --- ROBUST ROUTER HELPERS & PAGES ---
// ==========================================

// --- Slugify Helper ---
export function slugify(text: string): string {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
}

// --- Collection Scroll Calibration Helper ---
export function getCollectionScrollTarget(element: HTMLElement): number {
    const sectionTop = element.getBoundingClientRect().top + window.scrollY;
    const firstCard = element.querySelector('.grid > div');
    const grid = element.querySelector('.grid');
    
    // Fallback card offsets from sectionTop if firstCard is not rendered or has bad layout
    const isMobile = window.innerWidth < 640;
    const isTabletVertical = window.innerWidth >= 640 && window.innerWidth < 1024 && window.innerHeight > window.innerWidth;
    
    // For already working versions (Mobile and Tablet Vertical), keep them exactly as they are!
    if (isMobile) {
        let cardTop = sectionTop + 180;
        if (firstCard) {
            const rect = firstCard.getBoundingClientRect();
            const dynamicTop = rect.top + window.scrollY;
            if (dynamicTop > sectionTop && dynamicTop < sectionTop + 600) {
                cardTop = dynamicTop;
            }
        }
        return cardTop - 85;
    }
    
    if (isTabletVertical) {
        let cardTop = sectionTop + 250;
        if (firstCard) {
            const rect = firstCard.getBoundingClientRect();
            const dynamicTop = rect.top + window.scrollY;
            if (dynamicTop > sectionTop && dynamicTop < sectionTop + 600) {
                cardTop = dynamicTop;
            }
        }
        return cardTop - 95;
    }
    
    // For Tablet Horizontal and PC:
    // We want to center the 2x2 grid containing the 4 cards vertically in the viewport.
    if (grid) {
        const rect = grid.getBoundingClientRect();
        const gridTop = rect.top + window.scrollY;
        let gridHeight = rect.height;
        
        // Robust fallback if height is 0 or very small (e.g., during layout mount transition)
        if (gridHeight < 150) {
            const isPC = window.innerWidth >= 1024;
            const containerWidth = Math.min(1280, window.innerWidth) - (isPC ? 64 : 48);
            const cardWidth = containerWidth / 2;
            const cardHeight = cardWidth * 0.75; // aspect-[4/3]
            const gap = isPC ? 96 : 64; // gap-24 vs gap-16
            gridHeight = (cardHeight * 2) + gap;
        }
        
        const viewportHeight = window.innerHeight;
        const navbarHeight = window.innerWidth < 1024 ? 95 : 110;
        
        // Target scroll top to align center of grid with center of the remaining visible area below the navbar.
        // On PC and Tablet Horizontal, this perfectly centers the 4 categories on the screen as requested.
        const targetScrollTop = gridTop + (gridHeight / 2) - (viewportHeight + navbarHeight) / 2;
        
        return Math.max(0, targetScrollTop);
    }
    
    // Fallback if no grid is found
    const navbarHeight = window.innerWidth < 1024 ? 95 : 110;
    return sectionTop + 320 - navbarHeight;
}

// --- Navigation Helpers ---
export function navigateTo(path: string) {
    window.history.pushState(null, '', path);
    const event = new CustomEvent('mbravo-navigate', { detail: path });
    window.dispatchEvent(event);
}

export function getProductUrl(product: any): string {
    return `/produtos/${slugify(product.name)}`;
}

export function getCategoryUrl(category: any): string {
    return `/colecoes/${category.id}`;
}

export function findCategoryBySlugOrId(slugOrId: string) {
    if (!slugOrId) return null;
    const clean = slugOrId.toLowerCase();
    return SHOP_CATEGORIES.find(cat => cat.id.toLowerCase() === clean || slugify(cat.name) === clean);
}

export function findProductBySlugOrId(slugOrId: string) {
    if (!slugOrId) return null;
    const clean = slugOrId.toLowerCase();
    for (const cat of SHOP_CATEGORIES) {
        for (const prod of cat.products) {
            if (prod.id.toLowerCase() === clean || slugify(prod.name) === clean) {
                return { product: prod, category: cat };
            }
        }
    }
    return null;
}

// --- Category Page Component ---
const CategoryPage = ({ pathname }: { pathname: string }) => {
    const { lang, t } = useLanguage();
    const categoryId = pathname.split('/colecoes/')[1]?.split('#')[0];
    const category = findCategoryBySlugOrId(categoryId);

    if (!category) {
        return (
            <div className="max-w-4xl mx-auto px-6 text-center py-24 text-forest min-h-[60vh] flex flex-col items-center justify-center gap-4">
                <h2 className="text-2xl font-serif">{lang === 'pt' ? 'Coleção não encontrada' : 'Collection not found'}</h2>
                <button onClick={() => navigateTo('/')} className="px-6 py-2.5 bg-forest text-cream rounded-full uppercase tracking-widest text-[10px] font-bold cursor-pointer transition-all hover:bg-[#1C2713]">
                    {lang === 'pt' ? 'Voltar ao Início' : 'Back to Home'}
                </button>
            </div>
        );
    }

    const translatedCategory = translateCategory(category, lang);

    return (
        <div className="w-full max-w-7xl mx-auto px-6 md:px-8 lg:px-16 text-forest">
            {/* Breadcrumbs */}
            <div className="text-[10px] uppercase tracking-[0.3em] text-forest/40 mb-10 font-sans flex items-center gap-2">
                <span className="cursor-pointer hover:text-forest transition-colors" onClick={() => navigateTo('/')}>M★BRAVO</span>
                <span>/</span>
                <span className="cursor-pointer hover:text-forest transition-colors" onClick={() => navigateTo('/#collection')}>{t('nav.collection')}</span>
                <span>/</span>
                <span className="text-forest/80 font-semibold">{translatedCategory.name}</span>
            </div>

            {/* Category Hero Header */}
            <div className="relative rounded-[12px] md:rounded-[16px] overflow-hidden aspect-[16/10] md:aspect-[21/9] mb-16 shadow-lg bg-forest/5 flex items-end">
                <img 
                    src={translatedCategory.img} 
                    alt={translatedCategory.name} 
                    width={1200}
                    height={600}
                    loading="eager"
                    fetchPriority="high"
                    decoding="async"
                    className="absolute inset-0 w-full h-full object-cover brightness-[0.7] grayscale-[0.1]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-forest/85 via-forest/10 to-transparent pointer-events-none" />
                <div className="relative z-10 p-8 sm:p-12 md:p-16 text-cream max-w-2xl text-left">
                    <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.45em] font-bold text-[#C5A059] block mb-3 font-sans">
                        {t('collection.tag')}
                    </span>
                    <h1 className="font-light tracking-wide font-serif mb-4 uppercase" style={{ fontSize: 'clamp(22px, 4.5vw + 8px, 56px)' }}>{translatedCategory.name}</h1>
                    <p className="text-cream/80 font-serif italic font-light leading-relaxed" style={{ fontSize: 'clamp(11px, 1vw + 8px, 18px)' }}>
                        {translatedCategory.items} — {t('collection.subtitle')}
                    </p>
                </div>
            </div>

            {/* Products Grid */}
            <div className="mb-20">
                <div className="flex items-center justify-between border-b border-forest/10 pb-6 mb-12">
                    <h2 className="font-serif italic text-xl sm:text-2xl font-light">
                        {translatedCategory.products.length} {translatedCategory.products.length === 1 ? (lang === 'pt' ? 'Produto' : 'Product') : (lang === 'pt' ? 'Produtos' : 'Products')}
                    </h2>
                    <button onClick={() => navigateTo('/#collection')} className="text-[10px] uppercase tracking-[0.3em] font-bold text-forest/50 hover:text-forest flex items-center gap-2 transition-colors cursor-pointer">
                        <ChevronLeft size={14} /> {lang === 'pt' ? 'Voltar à Coleção' : 'Back to Collection'}
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8 sm:gap-10 lg:gap-12">
                    {translatedCategory.products.map((product, i) => (
                        <div key={product.id} className="h-full">
                            <ProductCard 
                                product={product} 
                                i={i} 
                                isFocused={false}
                                isSubdued={false}
                                onFocus={() => navigateTo(getProductUrl(product))}
                            />
                        </div>
                    ))}
                </div>

                {/* Back to Collection at the bottom of the page */}
                <div className="mt-16 flex justify-center border-t border-forest/10 pt-10">
                    <button 
                        onClick={() => navigateTo('/#collection')} 
                        className="text-[10px] uppercase tracking-[0.3em] font-bold text-forest/50 hover:text-forest flex items-center gap-2 transition-colors cursor-pointer"
                    >
                        <ChevronLeft size={14} /> {lang === 'pt' ? 'Voltar à Coleção' : 'Back to Collection'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Product Detail Page Component ---
const ProductDetailPage = ({ pathname }: { pathname: string }) => {
    const { lang, t } = useLanguage();
    const productPath = pathname.split('/produtos/')[1]?.split('#')[0];
    const match = findProductBySlugOrId(productPath);

    if (!match) {
        return (
            <div className="max-w-4xl mx-auto px-6 text-center py-24 text-forest min-h-[60vh] flex flex-col items-center justify-center gap-4">
                <h2 className="text-2xl font-serif">{lang === 'pt' ? 'Peça não encontrada' : 'Product not found'}</h2>
                <button onClick={() => navigateTo('/')} className="px-6 py-2.5 bg-forest text-cream rounded-full uppercase tracking-widest text-[10px] font-bold cursor-pointer transition-all hover:bg-[#1C2713]">
                    {lang === 'pt' ? 'Voltar ao Início' : 'Back to Home'}
                </button>
            </div>
        );
    }

    const { product, category } = match;
    const translatedCategory = translateCategory(category, lang);
    const productTranslated = translateProduct(product, lang);
    const productImages = productTranslated.images || [productTranslated.img];

    const [activeImgIndex, setActiveImgIndex] = useState(0);
    const currentImg = productImages[activeImgIndex];

    const n = productTranslated.name.toLowerCase();
    const isVestuario = n.includes('bikini') || n.includes('top') || n.includes('cardigan') || n.includes('poncho') || n.includes('belt') || n.includes('bandana') || n.includes('headband');
    const isBag = n.includes('bag') || n.includes('pouch') || n.includes('booksleeve') || n.includes('clutch');
    const isHomeSet = n.includes('coasters') || n.includes('placemats');
    const isCoaster = n.includes('coasters');
    const hasSize = isVestuario && 
                    !n.includes('dragonfly bandana') && 
                    !n.includes('classic bandana') && 
                    !n.includes('dragonfly headband');
    const hasQuantity = isHomeSet;
    const rawPrice = getApprovedPrice(productTranslated.name);
    const isAfricanFlowerPouch = productTranslated.name.toLowerCase().includes('african flower pouch');
    const isMiniPouches = productTranslated.name.toLowerCase().includes('mini pouches');
    const isClassicCoasters = productTranslated.name.toLowerCase().includes('classic coasters');
    const isDualColor = isAfricanFlowerPouch || 
                        productTranslated.name.toLowerCase().includes('marea bikini set') ||
                        productTranslated.name.toLowerCase().includes('coral bikini top') ||
                        productTranslated.name.toLowerCase().includes('signature granny poncho') ||
                        productTranslated.name.toLowerCase().includes('cardigan') ||
                        isClassicCoasters;
    const initialColor = isDualColor 
        ? 'Azul Água & Branco' 
        : 'Verde Musgo';
    const defaultSize = productTranslated.sizes ? productTranslated.sizes[0] : 'M';

    const [selections, setSelections] = useState({
        tamanho: defaultSize,
        cor: initialColor,
        corFio: isMiniPouches ? 'Branco Creme' : '',
        quantidade: productTranslated.name.toLowerCase().includes('coasters') ? '4und.' : '2und.',
        fecho: '',
        forro: '',
        detalhe: ''
    });

    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'mbway' | 'multibanco' | 'card' | 'wallet'>('mbway');
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
    const [isPaying, setIsPaying] = useState(false);
    const [paymentCompleted, setPaymentCompleted] = useState(false);
    const [multibancoRef, setMultibancoRef] = useState<{ entidade: string, referencia: string } | null>(null);
    const [orderId, setOrderId] = useState('');
    const [checkoutError, setCheckoutError] = useState<string | null>(null);
    const [sandboxEmails, setSandboxEmails] = useState<{ customerEmailUrl: string, adminEmailUrl: string, shippedEmailUrl?: string } | null>(null);
    const [isShipping, setIsShipping] = useState(false);
    const [canUseWallet, setCanUseWallet] = useState(false);
    const prButtonRef = useRef<any>(null);

    const [openAccordion, setOpenAccordion] = useState<'details' | 'care' | 'shipping' | null>('details');

    // Reset page states when product selection shifts
    useEffect(() => {
        setSelections({
            tamanho: productTranslated.sizes ? productTranslated.sizes[0] : 'M',
            cor: initialColor,
            corFio: isMiniPouches ? 'Branco Creme' : '',
            quantidade: productTranslated.name.toLowerCase().includes('coasters') ? '4und.' : '2und.',
            fecho: '',
            forro: '',
            detalhe: ''
        });
        setIsCheckingOut(false);
        setPaymentCompleted(false);
        setMultibancoRef(null);
        setCheckoutError(null);
        setSandboxEmails(null);
        setActiveImgIndex(0);
        setCheckoutForm({
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
    }, [product.id, lang]);

    const handleShipOrder = async () => {
        if (!orderId) return;
        setIsShipping(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/payment/ship-order`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId, trackingCode: "DA" + Math.floor(100000000 + Math.random() * 900000000) + "PT" })
            });
            const data = await res.json();
            if (data.success && data.shippedEmailUrl) {
                setSandboxEmails(prev => prev ? { ...prev, shippedEmailUrl: data.shippedEmailUrl } : null);
            }
        } catch (err) {
            console.error("Error shipping order simulation:", err);
        } finally {
            setIsShipping(false);
        }
    };

    const selectedSize = hasSize ? selections.tamanho : 'Não aplicável';
    const selectedColor = (isCoaster && !isClassicCoasters) ? 'Padrão' : selections.cor;
    const quantity = hasQuantity ? selections.quantidade : '1';

    const qtyMultiplier = hasQuantity ? (parseInt(selections.quantidade) || 1) : 1;
    const calculatedPriceNum = typeof rawPrice === 'number' ? rawPrice * qtyMultiplier : 50;
    const totalPrice = `${calculatedPriceNum}`;
    const amountInCents = Math.round(calculatedPriceNum * 100);

    const calculatePriceText = () => {
        const price = getApprovedPrice(productTranslated.name);
        if (typeof price === 'string') {
            return price;
        }
        const total = price * qtyMultiplier;
        return `${total}€`;
    };
    const currentPrice = calculatePriceText();

    // Pinterest Tag & Rich Pins Integration (Isolated in Frontend)
    useEffect(() => {
        // Remove existing JSON-LD script if any to prevent duplicates when switching products
        const existingScript = document.getElementById('pinterest-json-ld');
        if (existingScript) {
            existingScript.remove();
        }

        const script = document.createElement('script');
        script.id = 'pinterest-json-ld';
        script.type = 'application/ld+json';
        script.innerHTML = JSON.stringify({
            "@context": "https://schema.org/",
            "@type": "Product",
            "name": productTranslated.name,
            "image": productImages.map(img => img.startsWith('http') ? img : `${window.location.origin}${img}`),
            "description": productTranslated.description || productTranslated.detail || `${productTranslated.name} - Handmade With Love by M★BRAVO.`,
            "sku": product.id,
            "offers": {
                "@type": "Offer",
                "url": `${window.location.origin}${pathname}`,
                "priceCurrency": "EUR",
                "price": calculatedPriceNum.toFixed(2),
                "availability": "https://schema.org/InStock",
                "itemCondition": "https://schema.org/NewCondition"
            }
        });
        document.head.appendChild(script);

        // Fire PageVisit event with precise product metadata
        if (typeof (window as any).pintrk === 'function') {
            (window as any).pintrk('track', 'pagevisit', {
                line_items: [{
                    product_id: product.id,
                    product_name: productTranslated.name,
                    product_category: translatedCategory.name,
                    product_price: calculatedPriceNum,
                    product_quantity: 1
                }]
            });
        }

        return () => {
            const scriptToRemove = document.getElementById('pinterest-json-ld');
            if (scriptToRemove) {
                scriptToRemove.remove();
            }
        };
    }, [product.id, lang, calculatedPriceNum, pathname]);

    // Track purchase completion event on Pinterest (Isolated in Frontend)
    useEffect(() => {
        if (paymentCompleted) {
            if (typeof (window as any).pintrk === 'function') {
                (window as any).pintrk('track', 'checkout', {
                    value: calculatedPriceNum,
                    currency: 'EUR',
                    line_items: [{
                        product_id: product.id,
                        product_name: productTranslated.name,
                        product_category: translatedCategory.name,
                        product_price: calculatedPriceNum,
                        product_quantity: qtyMultiplier
                    }]
                });
            }
        }
    }, [paymentCompleted, product.id, calculatedPriceNum, qtyMultiplier]);

    const isLiveMode = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY?.startsWith('pk_live') || false;

    // Direct Webhook Wallet Effect
    useEffect(() => {
        let active = true;
        if (!isCheckingOut) return;

        const initStripeWallet = async () => {
            const stripePubKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "";
            if (!stripePubKey) return;

            try {
                const stripe = await loadStripe(stripePubKey);
                if (!stripe || !active) return;

                const paymentRequest = stripe.paymentRequest({
                    country: 'PT',
                    currency: 'eur',
                    total: {
                        label: `M.BRAVO - ${productTranslated.name.substring(0, 25)}`,
                        amount: amountInCents,
                    },
                    requestPayerName: true,
                    requestPayerEmail: true,
                    requestPayerPhone: true,
                    requestShipping: false,
                });

                const result = await paymentRequest.canMakePayment();
                if (result && active) {
                    setCanUseWallet(true);

                    if (paymentMethod === 'wallet') {
                        setTimeout(() => {
                            if (!active) return;
                            const container = document.getElementById('payment-request-button-page');
                            if (container) {
                                container.innerHTML = '';
                                const elements = stripe.elements();
                                const prButton = elements.create('paymentRequestButton', {
                                    paymentRequest,
                                    style: {
                                        paymentRequestButton: {
                                            theme: 'dark',
                                            height: '44px',
                                        },
                                    },
                                });
                                prButton.mount('#payment-request-button-page');
                                prButtonRef.current = prButton;
                            }
                        }, 150);
                    }
                } else {
                    setCanUseWallet(false);
                }

                paymentRequest.on('paymentmethod', async (ev) => {
                    const buyerName = ev.payerName || checkoutForm.nome || "Cliente Carteira Digital";
                    const buyerEmail = ev.payerEmail || checkoutForm.email || "encomendas@mbravobycarolina.com";
                    const buyerPhone = ev.payerPhone || checkoutForm.telefone || "";

                    setCheckoutForm(prev => ({
                        ...prev,
                        nome: buyerName,
                        email: buyerEmail,
                        telefone: buyerPhone
                    }));

                    setIsPaying(true);
                    setCheckoutError(null);

                    try {
                        const response = await fetch(`${API_BASE_URL}/api/payment/create-intent`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                product: {
                                    id: productTranslated.id,
                                    name: productTranslated.name,
                                    price: currentPrice
                                },
                                selections,
                                checkoutForm: {
                                    ...checkoutForm,
                                    nome: buyerName,
                                    email: buyerEmail,
                                    telefone: buyerPhone,
                                },
                                paymentMethod: 'wallet',
                                amountInCents
                            })
                        });

                        const data = await response.json();
                        if (!response.ok || data.error) {
                            throw new Error(data.error || "Falha ao processar com o servidor.");
                        }

                        setOrderId(data.orderId);

                        const { paymentIntent, error: confirmError } = await stripe.confirmCardPayment(
                            data.stripeClientSecret,
                            { payment_method: ev.paymentMethod.id },
                            { handleActions: false }
                        );

                        if (confirmError) {
                            ev.complete('fail');
                            throw new Error(confirmError.message);
                        }

                        if (paymentIntent && paymentIntent.status === 'succeeded') {
                            ev.complete('success');
                            const confirmRes = await fetch(`${API_BASE_URL}/api/payment/webhook`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    orderId: data.orderId,
                                    event: 'payment_intent.succeeded'
                                })
                            });

                            const confirmData = await confirmRes.json();
                            setIsPaying(false);
                            setPaymentCompleted(true);
                            if (confirmData.emailLinks) {
                                setSandboxEmails(confirmData.emailLinks);
                            }
                        } else {
                            ev.complete('fail');
                            throw new Error("Transação incompleta.");
                        }
                    } catch (err: any) {
                        setCheckoutError(err.message || "Erro no processamento da carteira digital.");
                        setIsPaying(false);
                    }
                });
            } catch (err) {
                console.error(err);
            }
        };

        initStripeWallet();

        return () => {
            active = false;
            if (prButtonRef.current) {
                try {
                    prButtonRef.current.unmount();
                } catch (e) {}
            }
        };
    }, [isCheckingOut, paymentMethod, amountInCents, lang]);

    const sizes = productTranslated.sizes || (productTranslated.name.toLowerCase().includes('marea bikini') || productTranslated.name.toLowerCase().includes('coral bikini top')
        ? ['XS', 'S', 'M', 'L'] 
        : ['S', 'M', 'L']);
    const quantities = isCoaster
        ? ['1und.', '2und.', '4und.', '6und.', '8und.']
        : ['2und.', '4und.', '6und.', '8und.'];

    const colors = isDualColor ? [
        { name: 'Azul Água & Branco', bg: 'linear-gradient(45deg, #A6BCAE 50%, #FFFFFF 50%)' },
        { name: 'Amarelo & Branco', bg: 'linear-gradient(45deg, #F4D03F 50%, #FFFFFF 50%)' },
        { name: 'Rosa & Branco', bg: 'linear-gradient(45deg, #FADADD 50%, #FFFFFF 50%)' },
        { name: 'Verde & Branco', bg: 'linear-gradient(45deg, #243119 50%, #FFFFFF 50%)' },
        { name: 'Vermelho & Branco', bg: 'linear-gradient(45deg, #C0392B 50%, #FFFFFF 50%)' }
    ] : isMiniPouches ? [
        { name: 'Verde Musgo', hex: '#2E3B26' },
        { name: 'Azul Noite', hex: '#1C2D37' },
        { name: 'Amarelo Baunilha', hex: '#F2E3A9' },
        { name: 'Terracota', hex: '#A85B40' },
        { name: 'Branco Creme', hex: '#F5F2ED' },
        { name: 'Rosa Quartzo Subtil', hex: '#EADAD6' }
    ] : [
        { name: 'Verde Musgo', hex: '#243119' },
        { name: 'Hortelã-Pimenta', hex: '#789D8A' },
        { name: 'Petróleo', hex: '#005F6B' },
        { name: 'Azul Glaciar', hex: '#A2C2D1' },
        { name: 'Sorvete Limão', hex: '#F4D03F' },
        { name: 'Creme', hex: '#FDFBF7' },
        { name: 'Bege Claro', hex: '#E1D5C9' },
        { name: 'Rosa Ternura', hex: '#FADADD' },
        { name: 'Castanho', hex: '#5D4037' },
        { name: 'Branco', hex: '#FFFFFF' }
    ];

    const yarnColors = isMiniPouches ? [
        { name: 'Verde Musgo', hex: '#2E3B26' },
        { name: 'Azul Noite', hex: '#1C2D37' },
        { name: 'Amarelo Baunilha', hex: '#F2E3A9' },
        { name: 'Terracota', hex: '#A85B40' },
        { name: 'Branco Creme', hex: '#F5F2ED' },
        { name: 'Rosa Quartzo Subtil', hex: '#EADAD6' }
    ] : [
        { name: 'Algodão Cru', hex: '#EFECE6' },
        { name: 'Cacau Escuro', hex: '#4A3728' },
        { name: 'Oliva Suave', hex: '#556B2F' }
    ];

    const isSafran = isVestuario || productTranslated.id.startsWith('v') || productTranslated.id.startsWith('p');
    
    const materialText = productTranslated.material || (lang === 'pt' 
        ? (isSafran 
            ? "Produzido em 100% Algodão Egípcio Safran. Um fio nobre, fino e delicado, com um brilho suave e toque refrescante. Garante conforto térmico e elegância no caimento."
            : "Produzido em 100% Algodão. Um fio de fibra grossa e penteada que confere estrutura e alta resistência. Ideal para suportar o uso diário mantendo a forma original.")
        : (isSafran
            ? "Produced in 100% Safran Egyptian Cotton. A noble, fine, and delicate yarn with a subtle sheen and refreshing touch. Guarantees thermal comfort and elegant drape."
            : "Produced in 100% Cotton. A thick, combed fiber yarn that provides structure and high durability. Ideal for daily use while maintaining its original shape."));

    const careText = productTranslated.care || (lang === 'pt'
        ? (isSafran
            ? "Lavar em ciclo delicado ou à mão (30ºC). Não usar amaciador e não deixar de molho. Secar à sombra e sempre na horizontal para evitar que a peça estique."
            : "Lavável à máquina (40ºC). Não usar lixívia. Secar na horizontal para manter a estrutura da peça.")
        : (isSafran
            ? "Wash on delicate cycle or by hand (30ºC). Do not use softener and do not soak. Dry in shade and always flat to prevent stretching."
            : "Machine washable (40ºC). Do not bleach. Dry flat to maintain the structure of the piece."));

    const messageText = lang === 'pt'
        ? `Olá Carolina! Quero encomendar uma peça M★BRAVO.\n\nProduto: ${productTranslated.name}\nTamanho: ${selectedSize}\n${(isCoaster && !isClassicCoasters) ? '' : (isMiniPouches ? `Cor do Saquinho: ${selectedColor}\nCor do Fio: ${selections.corFio}\n` : `Cor: ${selectedColor}\n`)}Quantidade: ${quantity}\n\nValor Total: ${currentPrice}\n\nFico a aguardar os detalhes para combinarmos o envio e o pagamento. Obrigada!`
        : `Hello Carolina! I would like to order an M★BRAVO piece.\n\nProduct: ${productTranslated.name}\nSize: ${translateSize(selectedSize, lang)}\n${(isCoaster && !isClassicCoasters) ? '' : (isMiniPouches ? `Pouch Color: ${selectedColor}\nYarn Color: ${translateColor(selections.corFio, lang)}\n` : `Color: ${translateColor(selectedColor, lang)}\n`)}Quantity: ${translateQuantity(quantity, lang)}\n\nTotal Price: ${currentPrice}\n\nI look forward to details on shipping and payment. Thank you!`;

    const whatsappUrl = `https://wa.me/351912828182?text=${encodeURIComponent(messageText)}`;

    return (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-16 text-forest">
            {/* Breadcrumbs */}
            <div className="text-[10px] uppercase tracking-[0.3em] text-forest/40 mb-8 font-sans flex flex-wrap items-center gap-2 px-2 sm:px-0">
                <span className="cursor-pointer hover:text-forest transition-colors" onClick={() => navigateTo('/')}>M★BRAVO</span>
                <span>/</span>
                <span className="cursor-pointer hover:text-forest transition-colors" onClick={() => navigateTo('/#collection')}>{t('nav.collection')}</span>
                <span>/</span>
                <span className="cursor-pointer hover:text-forest transition-colors" onClick={() => navigateTo(getCategoryUrl(category))}>{translatedCategory.name}</span>
                <span>/</span>
                <span className="text-forest/80 font-semibold">{productTranslated.name}</span>
            </div>

            {/* Main Side-by-Side E-Commerce Product Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 mb-20">
                
                {/* LEFT COLUMN: Premium High-Performance Interactive Image Gallery */}
                <div className="lg:col-span-7 flex flex-col gap-4">
                    {/* Main Active Picture Frame */}
                    <div className="relative aspect-[4/5] bg-[#F5F2ED] rounded-2xl overflow-hidden border border-forest/5 shadow-sm group">
                        <img 
                            src={currentImg} 
                            alt={productTranslated.name} 
                            loading="eager"
                            fetchPriority="high"
                            decoding="sync"
                            className="w-full h-full object-cover transition-transform duration-500 hover:scale-[1.02] cursor-zoom-in"
                            onClick={() => {
                                window.dispatchEvent(new CustomEvent('mbravo-zoom-image', { detail: currentImg }));
                            }}
                        />
                        {/* Custom Elegant Zoom Button */}
                        <button 
                            onClick={() => {
                                window.dispatchEvent(new CustomEvent('mbravo-zoom-image', { detail: currentImg }));
                            }}
                            className="absolute top-4 right-4 z-10 p-3 rounded-full bg-[#FCFBF9]/80 text-forest hover:bg-forest hover:text-cream backdrop-blur-md shadow-md border border-forest/10 cursor-pointer flex items-center justify-center transition-all duration-300"
                            title={lang === 'pt' ? 'Ampliar Imagem' : 'Zoom Image'}
                        >
                            <Maximize2 size={15} />
                        </button>
                        
                        {/* Mobile Swipe / Arrow navigation */}
                        {productImages.length > 1 && (
                            <>
                                <button
                                    onClick={() => {
                                        setActiveImgIndex((prev) => (prev === 0 ? productImages.length - 1 : prev - 1));
                                    }}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/70 text-forest hover:bg-forest hover:text-cream transition-all border border-forest/5 flex items-center justify-center shadow"
                                >
                                    <ChevronLeft size={18} />
                                </button>
                                <button
                                    onClick={() => {
                                        setActiveImgIndex((prev) => (prev === productImages.length - 1 ? 0 : prev + 1));
                                    }}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/70 text-forest hover:bg-forest hover:text-cream transition-all border border-forest/5 flex items-center justify-center shadow"
                                >
                                    <ChevronRight size={18} />
                                </button>
                            </>
                        )}
                    </div>

                    {/* Proportional Thumbnail Swatches Strip */}
                    {productImages.length > 1 && (
                        <div className="flex gap-2.5 overflow-x-auto no-scrollbar py-1">
                            {productImages.map((imgUrl, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveImgIndex(idx)}
                                    className={`relative w-20 h-24 rounded-lg overflow-hidden border transition-all shrink-0 ${
                                        idx === activeImgIndex 
                                            ? 'border-forest ring-1 ring-forest/20' 
                                            : 'border-transparent opacity-60 hover:opacity-100'
                                    }`}
                                >
                                    <img 
                                        src={imgUrl} 
                                        alt="" 
                                        loading="lazy"
                                        decoding="async"
                                        className="w-full h-full object-cover" 
                                    />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* RIGHT COLUMN: Highly Responsive Interactive E-Commerce Operations & Checkout Sidebar */}
                <div className="lg:col-span-5 flex flex-col justify-between">
                    <div className="space-y-6">
                        {/* Product Header */}
                        <div>
                            <span className="text-[9px] uppercase tracking-[0.35em] text-[#C5A059] font-bold block mb-1">
                                {lang === 'pt' ? 'EDIÇÃO EXCLUSIVA M★BRAVO' : 'EDIÇÃO EXCLUSIVA M★BRAVO'}
                            </span>
                            <h1 className="font-serif italic text-3xl sm:text-4xl lg:text-4.5xl font-light text-forest tracking-wide leading-tight mb-2">
                                {productTranslated.name}
                            </h1>
                            <p className="text-forest/50 text-[9px] uppercase tracking-[0.3em] font-semibold font-sans mb-4">
                                HANDMADE WITH LOVE
                            </p>
                            <div className="flex items-baseline gap-3">
                                <span className="font-serif text-2xl lg:text-3xl text-forest font-normal">{currentPrice}</span>
                                {(() => {
                                    const estimate = getShippingEstimate(productTranslated, lang);
                                    return (
                                        <span className={`text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded border ${
                                            estimate.inStock 
                                                ? 'text-emerald-700 bg-emerald-50 border-emerald-100' 
                                                : 'text-amber-700 bg-amber-50 border-amber-100'
                                        }`}>
                                            {estimate.inStock 
                                                ? (lang === 'pt' ? 'Disponível' : 'Available')
                                                : (lang === 'pt' ? 'Por Encomenda' : 'Made to Order')
                                            }
                                        </span>
                                    );
                                })()}
                            </div>
                        </div>

                        {/* Interactive Selections Flow */}
                        {!isCheckingOut && (
                            <div className="space-y-5">
                                {/* Size Customizer */}
                                {hasSize && (
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center text-[10px] uppercase tracking-wider text-forest/55">
                                            <span>{lang === 'pt' ? 'Tamanho' : 'Size'}</span>
                                            <span className="font-bold text-forest">{translateSize(selections.tamanho, lang)}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            {sizes.map((size) => (
                                                <button
                                                    key={size}
                                                    onClick={() => setSelections(prev => ({ ...prev, tamanho: size }))}
                                                    className={`h-9 px-4 rounded-full border text-xs font-medium tracking-wide transition-all ${
                                                        selections.tamanho === size 
                                                            ? 'bg-forest text-cream border-forest shadow-sm' 
                                                            : 'bg-[#FCFBF9] text-forest/70 border-forest/10 hover:border-forest/30'
                                                    }`}
                                                >
                                                    {size}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Color Swatch Customizer */}
                                {(!isCoaster || isClassicCoasters) && (
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center text-[10px] uppercase tracking-wider text-forest/55">
                                            <span>{lang === 'pt' ? 'Cor Principal' : 'Main Color'}</span>
                                            <span className="font-bold text-forest">{translateColor(selections.cor, lang)}</span>
                                        </div>
                                        <div className="flex flex-wrap gap-2.5">
                                            {colors.map((c) => (
                                                <button
                                                    key={c.name}
                                                    onClick={() => setSelections(prev => ({ ...prev, cor: c.name }))}
                                                    className={`relative w-8 h-8 rounded-full border transition-all ${
                                                        selections.cor === c.name 
                                                            ? 'ring-2 ring-forest scale-105 border-white' 
                                                            : 'border-forest/15 hover:scale-105'
                                                    }`}
                                                    title={translateColor(c.name, lang)}
                                                    style={{ background: (c as any).bg || (c as any).hex }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Yarn Color Swatch (for mini pouches only) */}
                                {isMiniPouches && (
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center text-[10px] uppercase tracking-wider text-forest/55">
                                            <span>{lang === 'pt' ? 'Cor do Fio' : 'Yarn Color'}</span>
                                            <span className="font-bold text-forest">{translateColor(selections.corFio, lang)}</span>
                                        </div>
                                        <div className="flex flex-wrap gap-2.5">
                                            {yarnColors.map((c) => (
                                                <button
                                                    key={c.name}
                                                    onClick={() => setSelections(prev => ({ ...prev, corFio: c.name }))}
                                                    className={`relative w-8 h-8 rounded-full border transition-all ${
                                                        selections.corFio === c.name 
                                                            ? 'ring-2 ring-forest scale-105 border-white' 
                                                            : 'border-forest/15 hover:scale-105'
                                                    }`}
                                                    title={translateColor(c.name, lang)}
                                                    style={{ background: (c as any).bg || (c as any).hex }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Quantity Swatch (for coasters sets only) */}
                                {hasQuantity && (
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center text-[10px] uppercase tracking-wider text-forest/55">
                                            <span>{lang === 'pt' ? 'Conjunto de Unidades' : 'Units Set'}</span>
                                            <span className="font-bold text-forest">{translateQuantity(selections.quantidade, lang)}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            {quantities.map((qty) => (
                                                <button
                                                    key={qty}
                                                    onClick={() => setSelections(prev => ({ ...prev, quantidade: qty }))}
                                                    className={`h-9 px-4 rounded-full border text-xs font-medium tracking-wide transition-all ${
                                                        selections.quantidade === qty 
                                                            ? 'bg-forest text-cream border-forest shadow-sm' 
                                                            : 'bg-[#FCFBF9] text-forest/70 border-forest/10 hover:border-forest/30'
                                                    }`}
                                                >
                                                    {translateQuantity(qty, lang)}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Direct Checkout Form / Gateways Block */}
                        {isCheckingOut && (
                            <div className="bg-[#FCFBF9] border border-forest/10 rounded-2xl p-5 space-y-5 animate-fadeIn">
                                {/* Success screen */}
                                {paymentCompleted ? (
                                    <div className="flex flex-col items-center text-center py-6 space-y-6">
                                        <div className="w-14 h-14 rounded-full bg-forest/5 flex items-center justify-center border border-forest/15">
                                            <LogoIcon className="h-8 w-8 text-forest" />
                                        </div>
                                        
                                        <h4 className="font-serif italic text-2xl font-light text-forest">
                                            {t('payment.success_title')}
                                        </h4>
                                        
                                        <p className="text-xs text-forest/70 font-sans font-light leading-relaxed max-w-sm">
                                            {lang === 'pt' ? (
                                                <>Agradecemos a sua encomenda, <strong>{checkoutForm.nome || 'Cliente'}</strong>. Enviámos um e-mail de confirmação para <strong>{checkoutForm.email}</strong> com os detalhes do envio.</>
                                            ) : (
                                                <>Thank you for your order, <strong>{checkoutForm.nome || 'Customer'}</strong>. We have sent a confirmation email to <strong>{checkoutForm.email}</strong> with the shipping details.</>
                                            )}
                                        </p>

                                        <div className="bg-forest/5 rounded-2xl p-4 border border-forest/10 w-full text-left space-y-2.5 font-sans text-[11px]">
                                            <div className="flex justify-between border-b border-forest/5 pb-1">
                                                <span className="text-forest/40 uppercase tracking-wider text-[9px]">{lang === 'pt' ? 'ID Pedido' : 'Order ID'}</span>
                                                <span className="font-semibold text-forest">{orderId}</span>
                                            </div>
                                            <div className="flex justify-between border-b border-forest/5 pb-1">
                                                <span className="text-forest/40 uppercase tracking-wider text-[9px]">{lang === 'pt' ? 'Artigo' : 'Item'}</span>
                                                <span className="font-semibold text-forest">{productTranslated.name}</span>
                                            </div>
                                            <div className="flex justify-between border-b border-forest/5 pb-1">
                                                <span className="text-forest/40 uppercase tracking-wider text-[9px]">{lang === 'pt' ? 'Configuração' : 'Configuration'}</span>
                                                <span className="font-semibold text-forest text-right">
                                                    {(!isCoaster || isClassicCoasters) && `${translateColor(selections.cor, lang)} `}{isMiniPouches && `| ${lang === 'pt' ? 'Fio: ' : 'Yarn: '}${translateColor(selections.corFio, lang)} `}{hasSize && `| ${translateSize(selections.tamanho, lang)}`} {hasQuantity && `| ${translateQuantity(selections.quantidade, lang)}`}
                                                </span>
                                            </div>
                                            <div className="flex justify-between border-b border-forest/5 pb-1">
                                                <span className="text-forest/40 uppercase tracking-wider text-[9px]">{lang === 'pt' ? 'Método Pagamento' : 'Payment Method'}</span>
                                                <span className="font-semibold text-forest uppercase">
                                                    {paymentMethod === 'mbway' ? 'MB WAY' : paymentMethod === 'multibanco' ? (lang === 'pt' ? 'Referência Multibanco' : 'Multibanco Reference') : (lang === 'pt' ? 'Cartão de Crédito' : 'Credit Card')}
                                                </span>
                                            </div>
                                            <div className="flex justify-between pt-1 font-bold">
                                                <span className="text-[#A68244] uppercase tracking-wider text-[9px]">
                                                    {paymentMethod === 'multibanco' 
                                                        ? (lang === 'pt' ? 'Total a Pagar' : 'Total to Pay')
                                                        : (lang === 'pt' ? 'Total Pago' : 'Total Paid')}
                                                </span>
                                                <span className="text-sm font-serif text-forest">{currentPrice}</span>
                                            </div>
                                        </div>

                                        {paymentMethod === 'multibanco' && multibancoRef && (
                                            <div className="bg-amber-50/40 rounded-xl p-4 border border-[#C5A059]/30 text-left space-y-2 w-full font-sans animate-fadeIn">
                                                <span className="text-[9px] uppercase tracking-wider text-[#A68244] font-mono font-bold block mb-1">
                                                    {lang === 'pt' ? 'DADOS PARA PAGAMENTO MULTIBANCO' : 'MULTIBANCO PAYMENT DETAILS'}
                                                </span>
                                                <div className="space-y-1.5 text-xs text-forest">
                                                    <div className="flex justify-between border-b border-forest/5 pb-1">
                                                        <span className="text-forest/40 text-[9px] uppercase tracking-wider">{lang === 'pt' ? 'Entidade' : 'Entity'}</span>
                                                        <span className="font-mono font-bold">{multibancoRef.entidade}</span>
                                                    </div>
                                                    <div className="flex justify-between border-b border-forest/5 pb-1">
                                                        <span className="text-forest/40 text-[9px] uppercase tracking-wider">{lang === 'pt' ? 'Referência' : 'Reference'}</span>
                                                        <span className="font-mono font-bold">{multibancoRef.referencia}</span>
                                                    </div>
                                                    <div className="flex justify-between pb-1">
                                                        <span className="text-forest/40 text-[9px] uppercase tracking-wider">{lang === 'pt' ? 'Montante' : 'Amount'}</span>
                                                        <span className="font-mono font-bold">{currentPrice}</span>
                                                    </div>
                                                </div>
                                                <p className="text-[10px] text-forest/50 leading-relaxed text-center pt-1">
                                                    {lang === 'pt' 
                                                        ? 'Efetue o pagamento através do seu Homebanking ou numa caixa ATM. Receberá um e-mail assim que o pagamento for confirmado.'
                                                        : 'Make the payment via your Homebanking or at an ATM. You will receive an email as soon as the payment is confirmed.'}
                                                </p>
                                                {!isLiveMode && (
                                                    <button
                                                        onClick={async () => {
                                                            try {
                                                                setIsPaying(true);
                                                                const res = await fetch(`${API_BASE_URL}/api/payment/webhook`, {
                                                                    method: 'POST',
                                                                    headers: { 'Content-Type': 'application/json' },
                                                                    body: JSON.stringify({
                                                                        orderId,
                                                                        event: 'payment_intent.succeeded'
                                                                    })
                                                                });
                                                                const statusData = await res.json();
                                                                if (statusData.status === 'paid') {
                                                                    setIsPaying(false);
                                                                    if (statusData.emailLinks) {
                                                                        setSandboxEmails(statusData.emailLinks);
                                                                    }
                                                                }
                                                            } catch (err: any) {
                                                                setIsPaying(false);
                                                                console.error("Erro ao simular webhook:", err);
                                                            }
                                                        }}
                                                        className="mt-2 w-full py-2 bg-forest text-cream font-mono text-[9px] tracking-wider rounded-lg font-bold uppercase cursor-pointer hover:bg-forest/95 transition-all text-center border-none focus:outline-none"
                                                    >
                                                        {isPaying ? 'A Processar...' : (lang === 'pt' ? 'Confirmar e Processar Pagamento' : 'Confirm & Process Payment')}
                                                    </button>
                                                )}
                                            </div>
                                        )}

                                        {(() => {
                                            const estimate = getShippingEstimate(productTranslated, lang);
                                            return (
                                                <div className={`rounded-xl p-3.5 border text-left text-[11px] leading-relaxed font-sans ${
                                                    estimate.inStock 
                                                        ? 'bg-emerald-50/40 border-emerald-500/20 text-emerald-950' 
                                                        : 'bg-amber-50/50 border-[#C5A059]/20 text-forest/80'
                                                }`}>
                                                    <p className={`font-semibold mb-1 flex items-center gap-1.5 ${
                                                        estimate.inStock ? 'text-emerald-700' : 'text-[#A68244]'
                                                    }`}>
                                                        <span className="text-xs">{estimate.inStock ? '✓' : '★'}</span>
                                                        {estimate.title}
                                                    </p>
                                                    <p>{estimate.desc}</p>
                                                </div>
                                            );
                                        })()}

                                        {sandboxEmails && (
                                            <div className="w-full bg-[#243119]/5 rounded-2xl p-4 border border-[#243119]/10 text-left space-y-3 font-sans">
                                                <p className="text-[10px] uppercase tracking-wider text-[#A68244] font-bold">{t('sandbox.email_sim')}</p>
                                                <p className="text-[11px] text-forest/70 leading-relaxed">{t('sandbox.email_desc')}</p>
                                                <div className="flex flex-col gap-2 pt-1">
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <a 
                                                            href={sandboxEmails.customerEmailUrl} 
                                                            target="_blank" 
                                                            rel="noreferrer"
                                                            className="block text-center rounded-lg py-2 bg-white border border-[#243119]/15 text-[10px] uppercase tracking-wider font-semibold text-forest hover:bg-[#243119] hover:text-white hover:border-transparent transition-all"
                                                        >
                                                            {t('sandbox.view_client')}
                                                        </a>
                                                        <a 
                                                            href={sandboxEmails.adminEmailUrl} 
                                                            target="_blank" 
                                                            rel="noreferrer"
                                                            className="block text-center rounded-lg py-2 bg-white border border-[#243119]/15 text-[10px] uppercase tracking-wider font-semibold text-forest hover:bg-[#243119] hover:text-white hover:border-transparent transition-all"
                                                        >
                                                            {t('sandbox.view_admin')}
                                                        </a>
                                                    </div>
                                                    {sandboxEmails.shippedEmailUrl ? (
                                                        <a 
                                                            href={sandboxEmails.shippedEmailUrl} 
                                                            target="_blank" 
                                                            rel="noreferrer"
                                                            className="block text-center rounded-lg py-2 bg-amber-500/10 border border-amber-500/30 text-[10px] uppercase tracking-wider font-bold text-[#A68244] hover:bg-amber-500 hover:text-white hover:border-transparent transition-all"
                                                        >
                                                            {t('sandbox.view_shipped')}
                                                        </a>
                                                    ) : (
                                                        <button 
                                                            onClick={handleShipOrder}
                                                            disabled={isShipping}
                                                            className="block w-full text-center rounded-lg py-2 bg-[#243119] text-white text-[10px] uppercase tracking-wider font-bold hover:bg-[#1a2412] disabled:opacity-50 transition-all cursor-pointer border-none"
                                                        >
                                                            {isShipping ? (lang === 'pt' ? 'A ENVIAR...' : 'SHIPPING...') : t('sandbox.ship_order')}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        <button
                                            onClick={() => {
                                                setIsCheckingOut(false);
                                                setPaymentCompleted(false);
                                                setMultibancoRef(null);
                                            }}
                                            className="w-full rounded-full py-2.5 px-4 text-center font-bold bg-[#C5A059] text-[#343E2C] hover:bg-[#d5b069] text-[10px] uppercase tracking-widest cursor-pointer shadow-md transition-all font-sans border-none focus:outline-none"
                                        >
                                            {lang === 'pt' ? 'Comprar Outra Peça' : 'Buy Another Piece'}
                                        </button>
                                    </div>
                                ) : (
                                    /* Form Fields and Gateways selection */
                                    <div className="space-y-5">
                                        <div className="flex justify-between items-center border-b border-forest/10 pb-3 mb-2">
                                            <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-forest/70">
                                                {lang === 'pt' ? 'Dados de Faturação & Envio' : 'Billing & Shipping Details'}
                                            </span>
                                            <button 
                                                onClick={() => setIsCheckingOut(false)}
                                                className="text-forest/40 hover:text-forest text-[10px] uppercase tracking-widest font-bold"
                                            >
                                                {lang === 'pt' ? 'Cancelar' : 'Cancel'}
                                            </button>
                                        </div>

                                        {/* Inputs */}
                                        <div className="space-y-2.5">
                                            <input 
                                                type="text" 
                                                placeholder={lang === 'pt' ? "Nome Completo" : "Full Name"} 
                                                required
                                                value={checkoutForm.nome}
                                                onChange={(e) => setCheckoutForm(prev => ({ ...prev, nome: e.target.value }))}
                                                className="w-full bg-white rounded-xl px-4 py-2.5 text-xs text-forest placeholder-forest/30 border border-forest/10 focus:border-[#C5A059] focus:outline-none transition-all font-sans"
                                            />
                                            <div className="grid grid-cols-2 gap-2">
                                                <input 
                                                    type="email" 
                                                    placeholder={lang === 'pt' ? "E-mail" : "Email Address"} 
                                                    required
                                                    value={checkoutForm.email}
                                                    onChange={(e) => setCheckoutForm(prev => ({ ...prev, email: e.target.value }))}
                                                    className={`w-full bg-white rounded-xl px-4 py-2.5 text-xs text-forest placeholder-forest/30 border focus:outline-none transition-all font-sans ${
                                                        checkoutForm.email && !isValidEmail(checkoutForm.email)
                                                            ? 'border-red-300 focus:border-red-400' 
                                                            : 'border-forest/10 focus:border-[#C5A059]'
                                                    }`}
                                                />
                                                <input 
                                                    type="tel" 
                                                    placeholder={lang === 'pt' ? "Telemóvel" : "Phone Number"} 
                                                    required
                                                    value={checkoutForm.telefone}
                                                    onChange={(e) => setCheckoutForm(prev => ({ ...prev, telefone: e.target.value }))}
                                                    className="w-full bg-white rounded-xl px-4 py-2.5 text-xs text-forest placeholder-forest/30 border border-forest/10 focus:border-[#C5A059] focus:outline-none transition-all font-sans"
                                                />
                                            </div>

                                            {checkoutForm.email && !isValidEmail(checkoutForm.email) && (
                                                <div className="text-[10px] text-red-500 font-sans flex items-center gap-1 pl-1">
                                                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500"></span>
                                                    {lang === 'pt' 
                                                        ? 'Por favor introduza um e-mail válido.' 
                                                        : 'Please enter a valid email address.'}
                                                </div>
                                            )}

                                            {checkoutForm.email && suggestCorrectEmail(checkoutForm.email) && (
                                                <div className="text-[11px] text-amber-800 bg-amber-50/50 border border-amber-200/40 rounded-xl p-3 flex items-center justify-between gap-2 font-sans mt-1">
                                                    <div className="flex items-start gap-1.5 text-left">
                                                        <span className="text-amber-500 text-xs">💡</span>
                                                        <span>
                                                            {lang === 'pt' ? 'Quis dizer ' : 'Did you mean '}
                                                            <strong 
                                                                className="underline cursor-pointer text-amber-950 font-semibold"
                                                                onClick={() => setCheckoutForm(prev => ({ ...prev, email: suggestCorrectEmail(checkoutForm.email)! }))}
                                                            >
                                                                {suggestCorrectEmail(checkoutForm.email)}
                                                            </strong>?
                                                        </span>
                                                    </div>
                                                    <button 
                                                        type="button"
                                                        onClick={() => setCheckoutForm(prev => ({ ...prev, email: suggestCorrectEmail(checkoutForm.email)! }))}
                                                        className="text-[10px] font-bold text-[#C5A059] hover:text-[#A68244] uppercase tracking-wider whitespace-nowrap bg-white border border-forest/5 rounded-lg px-2 py-1 transition-all"
                                                    >
                                                        {lang === 'pt' ? 'Corrigir' : 'Correct'}
                                                    </button>
                                                </div>
                                            )}

                                            <input 
                                                type="text" 
                                                placeholder={lang === 'pt' ? "Morada de Envio" : "Shipping Address"} 
                                                required
                                                value={checkoutForm.morada}
                                                onChange={(e) => setCheckoutForm(prev => ({ ...prev, morada: e.target.value }))}
                                                className="w-full bg-white rounded-xl px-4 py-2.5 text-xs text-forest placeholder-forest/30 border border-forest/10 focus:border-[#C5A059] focus:outline-none transition-all font-sans"
                                            />
                                            <div className="grid grid-cols-2 gap-2">
                                                <input 
                                                    type="text" 
                                                    placeholder={lang === 'pt' ? "Código Postal" : "Postal Code"} 
                                                    required
                                                    value={checkoutForm.codigoPostal}
                                                    onChange={(e) => setCheckoutForm(prev => ({ ...prev, codigoPostal: e.target.value }))}
                                                    className="w-full bg-white rounded-xl px-4 py-2.5 text-xs text-forest placeholder-forest/30 border border-forest/10 focus:border-[#C5A059] focus:outline-none transition-all font-sans"
                                                />
                                                <input 
                                                    type="text" 
                                                    placeholder={lang === 'pt' ? "Cidade" : "City"} 
                                                    required
                                                    value={checkoutForm.cidade}
                                                    onChange={(e) => setCheckoutForm(prev => ({ ...prev, cidade: e.target.value }))}
                                                    className="w-full bg-white rounded-xl px-4 py-2.5 text-xs text-forest placeholder-forest/30 border border-forest/10 focus:border-[#C5A059] focus:outline-none transition-all font-sans"
                                                />
                                            </div>
                                            <input 
                                                type="text" 
                                                placeholder={lang === 'pt' ? "NIF (Opcional)" : "NIF (Optional)"} 
                                                maxLength={9}
                                                value={checkoutForm.nif}
                                                onChange={(e) => setCheckoutForm(prev => ({ ...prev, nif: e.target.value.replace(/\D/g, '') }))}
                                                className="w-full bg-white rounded-xl px-4 py-2.5 text-xs text-forest placeholder-forest/30 border border-forest/10 focus:border-[#C5A059] focus:outline-none transition-all font-sans"
                                            />
                                        </div>

                                        {/* Gateway selection */}
                                        <div className="space-y-2">
                                            <span className="text-[9px] uppercase tracking-wider text-forest/40 font-mono block">
                                                {lang === 'pt' ? 'MÉTODO DE PAGAMENTO' : 'PAYMENT METHOD'}
                                            </span>
                                            <div className={`grid ${canUseWallet ? 'grid-cols-4' : 'grid-cols-3'} gap-2`}>
                                                <button
                                                    type="button"
                                                    onClick={() => setPaymentMethod('mbway')}
                                                    className={`flex flex-col items-center justify-center py-2.5 rounded-xl border transition-all cursor-pointer border-solid ${
                                                        paymentMethod === 'mbway' 
                                                            ? 'bg-[#343E2C] text-[#C5A059] border-[#C5A059]' 
                                                            : 'bg-white text-forest/65 border-forest/10 hover:bg-forest/5'
                                                    }`}
                                                >
                                                    <span className="text-[10px] font-extrabold tracking-wider font-sans">MB WAY</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setPaymentMethod('multibanco')}
                                                    className={`flex flex-col items-center justify-center py-2.5 rounded-xl border transition-all cursor-pointer border-solid ${
                                                        paymentMethod === 'multibanco' 
                                                            ? 'bg-[#343E2C] text-[#C5A059] border-[#C5A059]' 
                                                            : 'bg-white text-forest/65 border-forest/10 hover:bg-forest/5'
                                                    }`}
                                                >
                                                    <span className="text-[10px] font-extrabold tracking-wider font-sans">MB</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setPaymentMethod('card')}
                                                    className={`flex flex-col items-center justify-center py-2.5 rounded-xl border transition-all cursor-pointer border-solid ${
                                                        paymentMethod === 'card' 
                                                            ? 'bg-[#343E2C] text-[#C5A059] border-[#C5A059]' 
                                                            : 'bg-white text-forest/65 border-forest/10 hover:bg-forest/5'
                                                    }`}
                                                >
                                                    <span className="text-[10px] font-extrabold tracking-wider font-sans">{lang === 'pt' ? 'CARTÃO' : 'CARD'}</span>
                                                </button>
                                                {canUseWallet && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setPaymentMethod('wallet')}
                                                        className={`flex flex-col items-center justify-center py-2.5 rounded-xl border transition-all cursor-pointer border-solid ${
                                                            paymentMethod === 'wallet' 
                                                                ? 'bg-[#343E2C] text-[#C5A059] border-[#C5A059]' 
                                                                : 'bg-white text-forest/65 border-forest/10 hover:bg-forest/5'
                                                        }`}
                                                    >
                                                        <span className="text-[10px] font-extrabold tracking-wider font-sans">PAY</span>
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Gateway sub panels */}
                                        <div className="p-4 bg-white border border-forest/10 rounded-2xl min-h-[110px] flex flex-col justify-center">
                                            {paymentMethod === 'mbway' && (
                                                <div className="space-y-2.5 animate-fadeIn">
                                                    <span className="text-[9px] uppercase tracking-wider text-forest/40 font-mono block">{lang === 'pt' ? 'Telemóvel Associado ao MB WAY' : 'Phone Associated with MB WAY'}</span>
                                                    <input 
                                                        type="tel" 
                                                        placeholder="9xx xxx xxx" 
                                                        maxLength={9}
                                                        required
                                                        value={checkoutForm.mbwayPhone}
                                                        onChange={(e) => setCheckoutForm(prev => ({ ...prev, mbwayPhone: e.target.value.replace(/\D/g, '') }))}
                                                        className="w-full bg-[#FCFBF9] rounded-xl px-4 py-2.5 text-xs text-forest placeholder-forest/30 border border-forest/10 focus:border-[#C5A059] focus:outline-none transition-all font-sans"
                                                    />
                                                    <p className="text-[10px] text-forest/50 font-sans leading-relaxed">
                                                        {lang === 'pt' ? (
                                                            <>Irá receber uma notificação na aplicação MB WAY para autorizar o pagamento no valor de <strong>{currentPrice}</strong>.</>
                                                        ) : (
                                                            <>You will receive a notification in the MB WAY app to authorize the payment of <strong>{currentPrice}</strong>.</>
                                                        )}
                                                    </p>
                                                </div>
                                            )}

                                            {paymentMethod === 'multibanco' && (
                                                <div className="space-y-1.5 animate-fadeIn text-center">
                                                    <p className="text-[10px] text-forest/70 font-sans leading-relaxed">
                                                        {lang === 'pt' ? (
                                                            <>Será gerada uma referência oficial para pagamento do valor de <strong>{currentPrice}</strong> em qualquer Caixa Multibanco ou Homebanking.</>
                                                        ) : (
                                                            <>An official reference will be generated for payment of <strong>{currentPrice}</strong> in any Multibanco ATM or Homebanking.</>
                                                        )}
                                                    </p>
                                                </div>
                                            )}

                                            {paymentMethod === 'card' && (
                                                <div className="space-y-2.5 animate-fadeIn">
                                                    <span className="text-[9px] uppercase tracking-wider text-forest/40 font-mono block">{lang === 'pt' ? 'DETALHES DO CARTÃO DE CRÉDITO' : 'CREDIT CARD DETAILS'}</span>
                                                    <input 
                                                        type="text" 
                                                        placeholder={lang === 'pt' ? "Nome no Cartão" : "Name on Card"} 
                                                        required
                                                        value={checkoutForm.cardName}
                                                        onChange={(e) => setCheckoutForm(prev => ({ ...prev, cardName: e.target.value }))}
                                                        className="w-full bg-[#FCFBF9] rounded-xl px-4 py-2 text-xs text-forest placeholder-forest/30 border border-forest/10 focus:border-[#C5A059] focus:outline-none transition-all font-sans"
                                                    />
                                                    <input 
                                                        type="text" 
                                                        placeholder="Card Number" 
                                                        maxLength={19}
                                                        required
                                                        value={checkoutForm.cardNumber}
                                                        onChange={(e) => setCheckoutForm(prev => {
                                                            const clean = e.target.value.replace(/\D/g, '');
                                                            const parts = clean.match(/.{1,4}/g) || [];
                                                            return { ...prev, cardNumber: parts.join(' ') };
                                                        })}
                                                        className="w-full bg-[#FCFBF9] rounded-xl px-4 py-2 text-xs text-forest placeholder-forest/30 border border-forest/10 focus:border-[#C5A059] focus:outline-none transition-all font-sans font-mono"
                                                    />
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <input 
                                                            type="text" 
                                                            placeholder="MM/YY" 
                                                            maxLength={5}
                                                            required
                                                            value={checkoutForm.cardExpiry}
                                                            onChange={(e) => setCheckoutForm(prev => {
                                                                const clean = e.target.value.replace(/\D/g, '');
                                                                let formatted = clean;
                                                                if (clean.length > 2) {
                                                                    formatted = `${clean.substring(0,2)}/${clean.substring(2,4)}`;
                                                                }
                                                                return { ...prev, cardExpiry: formatted };
                                                            })}
                                                            className="w-full bg-[#FCFBF9] rounded-xl px-4 py-2 text-xs text-forest placeholder-forest/30 border border-forest/10 focus:border-[#C5A059] focus:outline-none transition-all font-sans"
                                                        />
                                                        <input 
                                                            type="text" 
                                                            placeholder="CVV" 
                                                            maxLength={3}
                                                            required
                                                            value={checkoutForm.cardCvv}
                                                            onChange={(e) => setCheckoutForm(prev => ({ ...prev, cardCvv: e.target.value.replace(/\D/g, '') }))}
                                                            className="w-full bg-[#FCFBF9] rounded-xl px-4 py-2 text-xs text-forest placeholder-forest/30 border border-forest/10 focus:border-[#C5A059] focus:outline-none transition-all font-sans font-mono"
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            {paymentMethod === 'wallet' && (
                                                <div className="space-y-3 animate-fadeIn text-center py-2 flex flex-col items-center justify-center">
                                                    <span className="text-[9px] uppercase tracking-wider text-[#C5A059] font-mono font-bold block">
                                                        {lang === 'pt' ? 'PAGAMENTO EXPRESSO COM CARTEIRA DIGITAL' : 'EXPRESS DIGITAL WALLET PAYMENT'}
                                                    </span>
                                                    <div className="w-full max-w-[320px] min-h-[44px] mt-2 flex justify-center">
                                                        <div id="payment-request-button-page" className="w-full"></div>
                                                    </div>
                                                    {!canUseWallet && (
                                                        <p className="text-[10px] text-red-500/80 font-sans leading-relaxed mt-2">
                                                            {lang === 'pt' ? 'Carteira digital indisponível no navegador.' : 'Digital wallet unavailable in this browser.'}
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {checkoutError && (
                                            <div className="p-3 bg-red-50 border border-red-200/50 rounded-xl text-left text-[11px] text-red-900 leading-relaxed font-sans flex flex-col gap-1 animate-fadeIn">
                                                <div className="flex justify-between items-center">
                                                    <span className="font-semibold uppercase tracking-wide text-[9px] text-red-700">{lang === 'pt' ? 'Erro ou Falha de Pagamento' : 'Payment Error or Failure'}</span>
                                                    <button onClick={() => setCheckoutError(null)} className="text-red-400 hover:text-red-700 font-bold px-1 text-xs border-none bg-transparent">✕</button>
                                                </div>
                                                <p>{checkoutError}</p>
                                            </div>
                                        )}

                                        {/* Submit Action */}
                                        {paymentMethod !== 'wallet' && (
                                            <button
                                                disabled={isPaying || !checkoutForm.nome || !checkoutForm.email || !isValidEmail(checkoutForm.email) || !checkoutForm.morada || (paymentMethod === 'mbway' && !checkoutForm.mbwayPhone) || (paymentMethod === 'card' && (!checkoutForm.cardNumber || !checkoutForm.cardExpiry || !checkoutForm.cardCvv))}
                                                onClick={async () => {
                                                    setIsPaying(true);
                                                    setCheckoutError(null);
                                                    setSandboxEmails(null);

                                                    if (paymentMethod === 'multibanco' && multibancoRef) {
                                                        try {
                                                            const res = await fetch(`${API_BASE_URL}/api/payment/webhook`, {
                                                                method: 'POST',
                                                                headers: { 'Content-Type': 'application/json' },
                                                                body: JSON.stringify({
                                                                    orderId,
                                                                    event: 'payment_intent.succeeded'
                                                                })
                                                            });
                                                            const statusData = await res.json();
                                                            if (statusData.status === 'paid') {
                                                                setIsPaying(false);
                                                                setPaymentCompleted(true);
                                                                if (statusData.emailLinks) {
                                                                    setSandboxEmails(statusData.emailLinks);
                                                                }
                                                            } else {
                                                                throw new Error(lang === 'pt' ? "Erro ao simular webhook de pagamento." : "Error simulating payment webhook.");
                                                            }
                                                        } catch (err: any) {
                                                            setIsPaying(false);
                                                            setCheckoutError(err.message || (lang === 'pt' ? 'Erro ao simular webhook.' : 'Error simulating webhook.'));
                                                        }
                                                        return;
                                                    }

                                                    if (paymentMethod === 'card') {
                                                        try {
                                                            const expiryParts = checkoutForm.cardExpiry.split('/');
                                                            const expMonth = parseInt(expiryParts[0]?.trim());
                                                            const expYear = parseInt(expiryParts[1]?.trim());
                                                            if (isNaN(expMonth) || expMonth < 1 || expMonth > 12 || isNaN(expYear)) {
                                                                throw new Error(lang === 'pt' ? 'Data de validade do cartão inválida. Use o formato MM/YY.' : 'Invalid card expiry date. Use MM/YY format.');
                                                            }
                                                        } catch (stripeErr: any) {
                                                            setIsPaying(false);
                                                            setCheckoutError(stripeErr.message || (lang === 'pt' ? 'Erro ao validar os detalhes do cartão.' : 'Error validating card details.'));
                                                            return;
                                                        }
                                                    }

                                                    try {
                                                        const response = await fetch(`${API_BASE_URL}/api/payment/create-intent`, {
                                                            method: 'POST',
                                                            headers: { 'Content-Type': 'application/json' },
                                                            body: JSON.stringify({
                                                                product: {
                                                                    id: productTranslated.id,
                                                                    name: productTranslated.name,
                                                                    price: currentPrice
                                                                },
                                                                selections,
                                                                checkoutForm,
                                                                paymentMethod,
                                                                amountInCents
                                                            })
                                                        });

                                                        const data = await response.json();
                                                        if (!response.ok || data.error) {
                                                            throw new Error(data.error || (lang === 'pt' ? 'Erro ao conectar com a gateway de pagamentos.' : 'Error connecting to the payment gateway.'));
                                                        }

                                                        setOrderId(data.orderId);

                                                        if (data.status === 'paid') {
                                                            setIsPaying(false);
                                                            setPaymentCompleted(true);
                                                            if (data.emailLinks) {
                                                                setSandboxEmails(data.emailLinks);
                                                            }
                                                        } else if (data.status === 'failed') {
                                                            throw new Error(translateBackendError(data.errorMessage, lang) || (lang === 'pt' ? 'Transação recusada pela gateway.' : 'Transaction declined by the gateway.'));
                                                        } else if (data.stripeClientSecret) {
                                                            // Card 3D Secure Verification Simulator
                                                            const stripePubKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "";
                                                            const stripeObj = await loadStripe(stripePubKey);
                                                            if (!stripeObj) {
                                                                throw new Error('Stripe failed to load.');
                                                            }

                                                            const confirmResult = await stripeObj.confirmCardPayment(data.stripeClientSecret);
                                                            if (confirmResult.error) {
                                                                throw new Error(confirmResult.error.message);
                                                            }

                                                            if (confirmResult.paymentIntent && confirmResult.paymentIntent.status === 'succeeded') {
                                                                const confirmRes = await fetch(`${API_BASE_URL}/api/payment/webhook`, {
                                                                    method: 'POST',
                                                                    headers: { 'Content-Type': 'application/json' },
                                                                    body: JSON.stringify({
                                                                        orderId: data.orderId,
                                                                        event: 'payment_intent.succeeded'
                                                                    })
                                                                });
                                                                const confirmData = await confirmRes.json();
                                                                if (confirmData.status === 'paid') {
                                                                    setIsPaying(false);
                                                                    setPaymentCompleted(true);
                                                                    if (confirmData.emailLinks) {
                                                                        setSandboxEmails(confirmData.emailLinks);
                                                                    }
                                                                } else {
                                                                    throw new Error("Erro ao finalizar encomenda.");
                                                                }
                                                            } else {
                                                                throw new Error("SCA failed.");
                                                            }
                                                        } else {
                                                            if (paymentMethod === 'multibanco') {
                                                                setMultibancoRef(data.multibancoRef);
                                                                setIsPaying(false);
                                                                setPaymentCompleted(true);
                                                            } else if (paymentMethod === 'mbway') {
                                                                // Poll Status
                                                                let attempts = 0;
                                                                const intervalId = setInterval(async () => {
                                                                    attempts++;
                                                                    try {
                                                                        const statusRes = await fetch(`${API_BASE_URL}/api/payment/status/${data.orderId}`);
                                                                        if (!statusRes.ok) return;
                                                                        const statusData = await statusRes.json();

                                                                        if (statusData.status === 'paid') {
                                                                            clearInterval(intervalId);
                                                                            setIsPaying(false);
                                                                            setPaymentCompleted(true);
                                                                            if (statusData.emailLinks) {
                                                                                setSandboxEmails(statusData.emailLinks);
                                                                            }
                                                                        } else if (statusData.status === 'failed') {
                                                                            clearInterval(intervalId);
                                                                            setIsPaying(false);
                                                                            setCheckoutError(translateBackendError(statusData.errorMessage, lang) || (lang === 'pt' ? 'Transação MB WAY recusada pelo utilizador.' : 'MB WAY transaction declined by the user.'));
                                                                        }
                                                                    } catch (pollErr) {
                                                                        console.error("Erro ao consultar status:", pollErr);
                                                                    }

                                                                    if (attempts > 20) {
                                                                        clearInterval(intervalId);
                                                                        setIsPaying(false);
                                                                        setCheckoutError(lang === 'pt' ? 'O tempo limite de aprovação MB WAY expirou.' : 'MB WAY approval timeout expired.');
                                                                    }
                                                                }, 3000);
                                                            }
                                                        }
                                                    } catch (err: any) {
                                                        setIsPaying(false);
                                                        setCheckoutError(err.message || "Erro no pagamento.");
                                                    }
                                                }}
                                                className="w-full rounded-full py-3.5 px-6 text-center font-bold bg-[#343E2C] text-[#C5A059] hover:bg-[#2c3525] text-xs uppercase tracking-widest cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed border border-[#C5A059]/10 transition-all focus:outline-none"
                                            >
                                                {isPaying ? (
                                                    <span className="flex items-center justify-center gap-2">
                                                        <span className="animate-spin rounded-full h-3 w-3 border border-[#C5A059] border-t-transparent" />
                                                        {lang === 'pt' ? 'A PROCESSAR...' : 'PROCESSING...'}
                                                    </span>
                                                ) : (
                                                    paymentMethod === 'mbway' 
                                                        ? (lang === 'pt' ? `Pagar ${currentPrice} via MB WAY` : `Pay ${currentPrice} via MB WAY`)
                                                        : paymentMethod === 'multibanco'
                                                            ? (lang === 'pt' ? 'Gerar Referência Multibanco' : 'Generate Multibanco Reference')
                                                            : (lang === 'pt' ? `Pagar ${currentPrice} com Cartão` : `Pay ${currentPrice} with Card`)
                                                )}
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Standalone CTAs Row (Pre-checkout) */}
                        {!isCheckingOut && (
                            <div className="flex flex-col gap-3 pt-2">
                                {/* Buy Direct Simulator button */}
                                <button
                                    onClick={() => setIsCheckingOut(true)}
                                    className="w-full rounded-full py-4 px-6 text-center text-xs uppercase tracking-widest font-bold bg-[#343E2C] text-[#C5A059] hover:bg-[#22291d] transition-all cursor-pointer border border-[#C5A059]/10 shadow-lg shadow-forest/10 focus:outline-none"
                                >
                                    {lang === 'pt' ? 'Comprar Agora' : 'Buy Now'}
                                </button>
                                
                                {/* WhatsApp Button */}
                                <a
                                    href={whatsappUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full rounded-full py-4 px-6 text-center text-xs uppercase tracking-widest font-bold bg-white text-forest hover:bg-forest hover:text-cream transition-all border border-forest/15 shadow-sm flex items-center justify-center gap-2.5 focus:outline-none"
                                >
                                    <MessageCircle size={15} className="text-emerald-600 shrink-0" />
                                    <span>{lang === 'pt' ? 'Encomendar via WhatsApp' : 'Order via WhatsApp'}</span>
                                </a>

                                {/* Discreet production/delivery estimate note */}
                                {(() => {
                                    const estimate = getShippingEstimate(productTranslated, lang);
                                    return (
                                        <p className="text-[10px] text-center text-forest/55 font-sans tracking-wide italic mt-1 leading-relaxed px-4">
                                            {estimate.inStock 
                                                ? (lang === 'pt' ? '✓ Peça em stock: Envio em 24h/48h úteis.' : '✓ Item in stock: Ships in 24h/48h business hours.')
                                                : (lang === 'pt' 
                                                    ? `★ Peça por encomenda: Envio estimado em ${productTranslated.craftingTime || 10} dias úteis (produção artesanal).` 
                                                    : `★ Made to order: Estimated shipping in ${productTranslated.craftingTime || 10} business days (artisanal crafting).`)
                                            }
                                        </p>
                                    );
                                })()}
                            </div>
                        )}
                        
                        {/* Security Guarantees badges block */}
                        <div className="grid grid-cols-3 gap-2.5 text-center py-4 text-[9px] uppercase tracking-widest text-forest/70">
                            <div className="flex flex-col items-center gap-1 font-semibold">
                                <span className="text-xs">🔒</span>
                                <span>{lang === 'pt' ? 'PAGAMENTO SEGURO' : 'SECURE PAYMENT'}</span>
                            </div>
                            <div className="flex flex-col items-center gap-1 border-x border-forest/15 font-semibold">
                                <span className="text-xs">🧶</span>
                                <span>{lang === 'pt' ? '100% ARTESANAL' : '100% HANDMADE'}</span>
                            </div>
                            <div className="flex flex-col items-center gap-1 font-semibold">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 30" className="w-5 h-3.5 rounded-sm overflow-hidden border border-forest/10 shadow-sm" aria-hidden="true">
                                    <rect width="18" height="30" fill="#046A38" />
                                    <rect x="18" width="27" height="30" fill="#DA291C" />
                                    <circle cx="18" cy="15" r="6" fill="#FFCD00" />
                                    <path d="M18 11.5 v7 M14.5 15 h7 M15.5 12.5 l5 5 M15.5 17.5 l5 -5" stroke="#FFCD00" strokeWidth="0.5" />
                                    <rect x="16" y="12" width="4" height="6" fill="#FFFFFF" rx="0.5" />
                                    <rect x="16.5" y="12.5" width="3" height="5" fill="#DA291C" rx="0.5" />
                                    <rect x="17" y="13.5" width="2" height="3" fill="#002F6C" />
                                </svg>
                                <span>{lang === 'pt' ? 'MADE IN PORTUGAL' : 'MADE IN PORTUGAL'}</span>
                            </div>
                        </div>

                        <hr className="border-forest/10" />

                        {/* Zara / Sezane Style Accordion Sections */}
                        <div className="space-y-1 font-sans text-xs">
                            {/* Section 1: Descrição */}
                            <div className="border-b border-forest/10 py-3">
                                <button
                                    onClick={() => setOpenAccordion(openAccordion === 'details' ? null : 'details')}
                                    className="w-full flex justify-between items-center text-left text-[11px] font-bold uppercase tracking-wider text-forest focus:outline-none"
                                >
                                    <span>{lang === 'pt' ? 'Detalhes da Peça' : 'Product Details'}</span>
                                    <span>{openAccordion === 'details' ? '−' : '+'}</span>
                                </button>
                                {openAccordion === 'details' && (
                                    <div className="pt-2.5 text-forest/75 leading-relaxed space-y-2 animate-fadeIn text-justify">
                                        <p className="whitespace-pre-line">{productTranslated.description || productTranslated.desc}</p>
                                        {productTranslated.details && (
                                            <div className="mt-3 pl-3 border-l border-forest/10 space-y-1 text-[11px]">
                                                {productTranslated.details.split('\n').map((line: string, idx: number) => (
                                                    <p key={idx} className="flex items-start gap-1">
                                                        <span>•</span>
                                                        <span>{line.trim().replace(/^[•\-\*]\s*/, '')}</span>
                                                    </p>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Section 2: Material & Cuidados */}
                            <div className="border-b border-forest/10 py-3">
                                <button
                                    onClick={() => setOpenAccordion(openAccordion === 'care' ? null : 'care')}
                                    className="w-full flex justify-between items-center text-left text-[11px] font-bold uppercase tracking-wider text-forest focus:outline-none"
                                >
                                    <span>{lang === 'pt' ? 'Composição & Lavagem' : 'Composition & Care'}</span>
                                    <span>{openAccordion === 'care' ? '−' : '+'}</span>
                                </button>
                                {openAccordion === 'care' && (
                                    <div className="pt-2.5 text-forest/75 leading-relaxed space-y-2.5 animate-fadeIn text-justify">
                                        <p className="whitespace-pre-line"><strong>{lang === 'pt' ? 'Matéria-Prima:' : 'Materials:'}</strong>{"\n"}{materialText}</p>
                                        <p className="whitespace-pre-line"><strong>{lang === 'pt' ? 'Conselhos de Lavagem:' : 'Washing Tips:'}</strong>{"\n"}{careText}</p>
                                    </div>
                                )}
                            </div>

                            {/* Section 3: Envio & Devoluções */}
                            <div className="border-b border-forest/10 py-3">
                                <button
                                    onClick={() => setOpenAccordion(openAccordion === 'shipping' ? null : 'shipping')}
                                    className="w-full flex justify-between items-center text-left text-[11px] font-bold uppercase tracking-wider text-forest focus:outline-none"
                                >
                                    <span>{lang === 'pt' ? 'Envio & Trocas' : 'Shipping & Returns'}</span>
                                    <span>{openAccordion === 'shipping' ? '−' : '+'}</span>
                                </button>
                                {openAccordion === 'shipping' && (
                                    <div className="pt-2.5 text-forest/75 leading-relaxed space-y-1.5 animate-fadeIn text-justify">
                                        <p>
                                            {lang === 'pt' 
                                                ? 'Envios para Portugal (Continental e Ilhas) e toda a Europa através de CTT Expresso Registado, com código de rastreamento enviado por e-mail. O processamento das peças em stock é imediato. Nos casos excecionais em que o cliente solicite uma personalização exclusiva à medida, o prazo será acordado no momento e, por se tratar de um artigo único personalizado, não haverá lugar a trocas ou devoluções, salvo defeito de fabrico.' 
                                                : 'Shipping to Portugal (Mainland and Islands) and all of Europe via Registered CTT Express, with tracking code sent by email. Processing of stock pieces is immediate. In exceptional cases where the customer requests an exclusive custom-made design, the deadline will be agreed upon at the time and, because it is a unique personalized item, there will be no exchange or refund, except in case of manufacturing defect.'
                                            }
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>

            </div>

            {/* Suggestion / Relacionados Box */}
            <div className="border-t border-forest/10 pt-16 mb-24 px-2 sm:px-0 text-left">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
                    <div className="space-y-1">
                        <span className="text-[9px] uppercase tracking-[0.35em] text-forest/35 block font-sans font-bold">
                            {lang === 'pt' ? 'A Coleção Continua' : 'The Collection Continues'}
                        </span>
                        <h3 className="font-serif text-2xl lg:text-3xl font-light text-forest">
                            {lang === 'pt' ? `Outras Peças de ${translatedCategory.name}` : `Other Pieces of ${translatedCategory.name}`}
                        </h3>
                    </div>
                    <button 
                        onClick={() => navigateTo(getCategoryUrl(category))} 
                        className="text-[10px] uppercase tracking-[0.25em] font-bold text-[#C5A059] hover:text-[#b08b47] flex items-center gap-2 transition-colors cursor-pointer border-none bg-transparent"
                    >
                        {lang === 'pt' ? 'Ver Tudo' : 'View All'} <ArrowRight size={14} />
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {translatedCategory.products
                        .filter(p => p.id !== product.id)
                        .slice(0, 3)
                        .map((otherProd, i) => (
                            <ProductCard 
                                key={otherProd.id}
                                product={otherProd} 
                                i={i} 
                                isFocused={false}
                                isSubdued={false}
                                onFocus={() => navigateTo(getProductUrl(otherProd))}
                            />
                        ))
                    }
                </div>
            </div>
        </div>
    );
};

// --- Dedicated Admin Page ---
const AdminPage = () => {
    return (
        <div className="w-full min-h-[85vh] flex items-center justify-center p-0 md:p-6 lg:p-12">
            <React.Suspense fallback={
                <div className="flex flex-col items-center justify-center p-12 text-forest min-h-[50vh]">
                    <Sparkles className="animate-spin text-[#C5A059] w-8 h-8 mb-4" />
                    <p className="font-serif italic text-sm tracking-wide">A carregar painel...</p>
                </div>
            }>
                <AdminDashboardModal onClose={() => navigateTo('/')} shopCategories={SHOP_CATEGORIES} />
            </React.Suspense>
        </div>
    );
};

// --- Main App ---

export default function App() {
  const [loading, setLoading] = useState(true);
  const [activeLegal, setActiveLegal] = useState<'envios' | 'privacidade' | 'termos' | null>(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [currentPage, setCurrentPage] = useState<'home' | 'essence'>('home');
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const { t } = useLanguage();
  const [pathname, setPathname] = useState(window.location.pathname);
  const [catalogVersion, setCatalogVersion] = useState(0);

  // Dynamic catalog loader & seed trigger
  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/catalog`);
        const data = await response.json();
        if (data.success) {
          if (data.empty) {
            // Seed the server with our initial categories array
            await fetch(`${API_BASE_URL}/api/admin/catalog/seed`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ categories: SHOP_CATEGORIES })
            });
          } else if (data.categories && data.categories.length > 0) {
            // Override global SHOP_CATEGORIES array to sync dynamically
            SHOP_CATEGORIES.length = 0;
            SHOP_CATEGORIES.push(...data.categories);
            setCatalogVersion(v => v + 1);
          }
        }
      } catch (err) {
        console.error("[CATALOG LOAD ERROR] Failed to fetch active catalog:", err);
      }
    };
    fetchCatalog();

    const handleCatalogUpdate = () => {
      setCatalogVersion(v => v + 1);
    };
    window.addEventListener('catalog-updated', handleCatalogUpdate);
    return () => {
      window.removeEventListener('catalog-updated', handleCatalogUpdate);
    };
  }, []);

  // Robust client-side custom router event and browser history state listeners
  useEffect(() => {
    const handlePopState = () => {
      setPathname(window.location.pathname);
    };
    const handleCustomNav = (e: Event) => {
      const newPath = (e as CustomEvent).detail;
      setPathname(newPath);
      
      // Handle anchor-scrolling (e.g. #sobre) or reset page scroll
      if (newPath.includes('#')) {
        const hash = newPath.split('#')[1];
        let attempts = 0;
        const scrollToElement = () => {
          let element = document.getElementById(hash);
          if (!element && hash === 'colecao') {
            element = document.getElementById('collection');
          }
          if (element) {
            const grid = element.querySelector('.grid');
            const isReady = (hash !== 'collection' && hash !== 'colecao') || !grid || grid.getBoundingClientRect().height > 200;
            
            if (isReady) {
              setTimeout(() => {
                if (hash === 'collection' || hash === 'colecao') {
                  const targetScrollTop = getCollectionScrollTarget(element);
                  (window as any).lenis?.scrollTo(targetScrollTop, { duration: 1.2 });
                } else {
                  (window as any).lenis?.scrollTo(element, { duration: 1.2 });
                }
              }, 150);
            } else if (attempts < 25) {
              attempts++;
              setTimeout(scrollToElement, 100);
            }
          } else if (attempts < 25) {
            attempts++;
            setTimeout(scrollToElement, 100);
          }
        };
        scrollToElement();
      } else {
        window.scrollTo({ top: 0, behavior: 'auto' });
        (window as any).lenis?.scrollTo(0, { immediate: true });
      }
    };
    
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('mbravo-navigate', handleCustomNav);
    
    // Clean scroll position reset on initial page load
    window.scrollTo({ top: 0, behavior: 'auto' });
    if ((window as any).lenis) {
      (window as any).lenis.scrollTo(0, { immediate: true });
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('mbravo-navigate', handleCustomNav);
    };
  }, []);

  // Listen for product image zoom events globally to bypass any sub-layout transforms
  useEffect(() => {
    const handleZoom = (e: Event) => {
      setZoomedImage((e as CustomEvent).detail);
    };
    window.addEventListener('mbravo-zoom-image', handleZoom as any);
    return () => {
      window.removeEventListener('mbravo-zoom-image', handleZoom as any);
    };
  }, []);

  // Manage body scroll and Lenis scrolling when zoomedImage is open
  useEffect(() => {
    if (zoomedImage) {
      document.body.style.overflow = 'hidden';
      (window as any).lenis?.stop();
    } else {
      document.body.style.overflow = '';
      (window as any).lenis?.start();
    }
    return () => {
      document.body.style.overflow = '';
      (window as any).lenis?.start();
    };
  }, [zoomedImage]);

  // Smooth scroll logic for standard browser behavior using Lenis
  useEffect(() => {
    window.scrollTo(0, 0);

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      gestureOrientation: 'vertical',
      smoothWheel: true,
      syncTouch: false,
      touchMultiplier: 1.5,
    });

    (window as any).lenis = lenis;

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }

    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      (window as any).lenis = undefined;
    };
  }, []);

  // Close any active legal modals if the mobile menu opens
  useEffect(() => {
    const handleMobileMenuOpen = () => {
      setActiveLegal(null);
    };
    window.addEventListener('mbravo-mobile-menu-open', handleMobileMenuOpen);
    return () => {
      window.removeEventListener('mbravo-mobile-menu-open', handleMobileMenuOpen);
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-cream text-forest select-none">
      <AnimatePresence>
        {loading && (
          <LoadingScreen key="loading" onComplete={() => setLoading(false)} />
        )}
      </AnimatePresence>

      <main className="flex flex-col">
        <Navbar currentPage={pathname === '/essencia' || pathname === '/essence' ? 'essence' : 'home'} setCurrentPage={(p) => navigateTo(p === 'essence' ? '/essencia' : '/')} pathname={pathname} isAppLoading={loading} />
            
            <AnimatePresence mode="wait">
              {pathname === '/essencia' || pathname === '/essence' ? (
                <motion.div 
                  key="essence"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8 }}
                  className="relative bg-[#FCFBF9]"
                >
                  <EssenceHero onBackToHome={() => {
                    navigateTo('/');
                  }} />
                  
                  <div className="relative overflow-hidden">
                    <MadeWithTimeSection />
                    <KnotSection />
                  </div>
                  
                  {/* Interlude at bottom of Essence to invite them back to Collection */}
                  <div data-background="light" className="py-24 bg-[#FCFBF9] text-center relative border-t border-forest/10">
                    <div className="max-w-2xl mx-auto px-6 space-y-8">
                      <span className="text-[10px] uppercase tracking-[0.45em] font-semibold text-forest/35 block font-sans">
                        {t('nav.exclusive')}
                      </span>
                      <h2 className="text-[clamp(1.5rem,5vw,3rem)] font-serif text-forest tracking-tight font-light">
                        {t('brand.slogan')}
                      </h2>
                      <div className="pt-4">
                        <button
                          onClick={() => {
                            navigateTo('/#collection');
                          }}
                          className="group inline-flex items-center gap-2.5 px-5 py-2.5 sm:px-7 sm:py-3 md:px-8 md:py-3.5 bg-forest text-cream hover:bg-[#1C2713] rounded-full text-[9px] sm:text-[10px] uppercase tracking-[0.22em] sm:tracking-[0.3em] font-semibold transition-all duration-700 cursor-pointer hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow-md"
                        >
                          {t('btn.back_collection')}
                          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : pathname.startsWith('/colecoes/') ? (
                // DEDICATED CATEGORY PAGE ROUTE
                <motion.div
                  key={`category-${pathname}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8 }}
                  className="relative bg-[#F6F1E5] min-h-screen pt-28 pb-16"
                  data-background="light"
                >
                  <CategoryPage pathname={pathname} />
                </motion.div>
              ) : pathname.startsWith('/produtos/') ? (
                // DEDICATED PRODUCT DETAIL ROUTE
                <motion.div
                  key={`product-${pathname}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8 }}
                  className="relative bg-[#FCFBF9] min-h-screen pt-28 pb-16"
                  data-background="light"
                >
                  <ProductDetailPage pathname={pathname} />
                </motion.div>
              ) : pathname === '/admin' ? (
                // DEDICATED ADMIN ROUTE
                <motion.div
                  key="admin-page"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8 }}
                  className="relative bg-[#FCFBF9] min-h-screen pt-28 pb-16"
                  data-background="light"
                >
                  <AdminPage />
                </motion.div>
              ) : (
                // HOMEPAGE ROUTE (path is '/' or anything else)
                <motion.div 
                  key="home"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8 }}
                  className="relative"
                >
                  <Hero />
                  <FioCondutor />
                  
                  <div className="relative overflow-hidden">
                    <StorySection />
                    <CollectionSection />
                  </div>
                  
                  {/* Visual Interlude */}
                  <div data-background="dark" className="h-[60vh] md:h-[100vh] bg-forest relative overflow-hidden flex items-center justify-center">
                    <motion.div 
                        initial={{ scale: 1.5, opacity: 0 }}
                        whileInView={{ scale: 1.15, opacity: 1 }}
                        transition={{ duration: 2.5, ease: "easeOut" }}
                        className="absolute inset-0"
                    >
                        <img 
                            src="https://i.ibb.co/xqh0LJ7g/Firefly-Gemini-Flash-Imagem-com-ambiente-cosy-tema-handmade-crochet-usar-o-logo-em-business-card.png" 
                            alt="Brand visual" 
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover brightness-[0.4] grayscale-[0.5]"
                        />
                    </motion.div>
                    <div className="relative z-10 text-center px-6 max-w-4xl mx-auto flex flex-col items-center gap-6 md:gap-8">
                        <h2 className="text-cream font-serif italic text-[clamp(1.75rem,6.5vw,4.5rem)] leading-tight">
                            {t('interlude.quote')}
                        </h2>
                        <span className="text-[#C5A059]/80 font-serif italic text-[clamp(1.125rem,2.5vw,1.5rem)] tracking-wide font-light select-none block max-w-xl mx-auto">
                            {t('interlude.sub')}
                        </span>
                    </div>
                  </div>

                  <div className="relative overflow-hidden">
                    <TestimonialsSection />
                  </div>

                  <MemoryContinuesSection onDiscoverEssence={() => {
                    navigateTo('/essencia');
                  }} />

                  <InstagramSection />
                  <ContactSection />
                </motion.div>
              )}
            </AnimatePresence>
            
            <Footer onOpenLegal={(type) => setActiveLegal(type)} onOpenAdmin={() => navigateTo('/admin')} />

            <AnimatePresence>
                {activeLegal && (
                    <React.Suspense fallback={null}>
                        <LegalModal type={activeLegal} onClose={() => setActiveLegal(null)} />
                    </React.Suspense>
                )}
                {showAdmin && (
                    <React.Suspense fallback={
                        <div className="fixed inset-0 bg-[#FCFBF9] z-[120] flex flex-col items-center justify-center p-6 text-forest">
                            <Sparkles className="animate-spin text-[#C5A059] w-8 h-8 mb-4" />
                            <p className="font-serif italic text-sm tracking-wide">A carregar painel...</p>
                        </div>
                    }>
                        <AdminDashboardModal onClose={() => setShowAdmin(false)} shopCategories={SHOP_CATEGORIES} />
                    </React.Suspense>
                )}
                {zoomedImage && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        onClick={() => setZoomedImage(null)}
                        className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-black/95 p-4 sm:p-6 lg:p-12 cursor-zoom-out select-none backdrop-blur-md"
                    >
                        {/* Floating Close Button */}
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                setZoomedImage(null);
                            }}
                            className="absolute top-6 right-6 z-[10010] p-4 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all border border-white/10 hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center shadow-2xl"
                            title="Fechar Zoom"
                        >
                            <X size={24} />
                        </button>

                        {/* Interactive Large Image with scale transition */}
                        <div className="relative w-full h-full max-w-5xl max-h-[85vh] flex items-center justify-center">
                            <motion.img 
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.95, opacity: 0 }}
                                transition={{ duration: 0.25, ease: "easeOut" }}
                                src={zoomedImage} 
                                alt="Zoom"
                                loading="lazy"
                                decoding="async"
                                className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl pointer-events-none"
                            />
                        </div>

                        {/* Informative minimal note */}
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 text-white/50 text-[10px] uppercase tracking-widest font-sans font-light text-center w-full px-4">
                            Toca em qualquer lado para fechar
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
      </main>
    </div>
  );
}
