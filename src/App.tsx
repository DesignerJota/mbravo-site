import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useVelocity } from 'motion/react';
import { Menu, X, Instagram, Facebook, ArrowRight, ChevronLeft, ChevronRight, Share2, Mail, MessageCircle, Sparkles, Layers, Ban, AlertCircle, Feather, Palette, Heart } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { 
  useLanguage, 
  translateProduct, 
  translateCategory, 
  translateColor, 
  translateSize, 
  translateQuantity,
  translateBackendError
} from './translations';

// Hero background images for automatic rotation
const HERO_BACKGROUNDS = [
  "https://i.ibb.co/KppF2KLq/Background.png",
  "https://i.ibb.co/Z6z6D2W9/Background04.png",
  "https://i.ibb.co/JjKC14LX/Backgrounde03.png",
  "https://i.ibb.co/nK7Y2Rc/Background06.png"
];

// --- Constants & Types ---
const NAV_LINKS = [
  { name: 'História', href: '#sobre' },
  { name: 'Catálogo', href: '#collection' },
  { name: 'Contactos', href: '#contacto' },
];

const CONTACT_EMAIL = "handmade.mbravo@gmail.com";
const EMAIL_SUBJECT = "Pedido de Informações - M★BRAVO";
const MAILTO_LINK = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(EMAIL_SUBJECT)}`;

const WHATSAPP_NUMBER = '351912828182';

// --- Pricing & Customization Logic ---
const BASE_PRICES: { [key: string]: number | string } = {
    'alma cardigan': 95,
    'm★bravo cardigan': 95,
    'geometric poncho': 75,
    'cozy mesh poncho': 75,
    'signature granny poncho': 75,
    'mini alma cardigan': 55,
    'granny square bag': 55,
    'granny square sling bag': 55,
    'marea bikini set': 45,
    'luxury clutch': 35,
    'coral bikini top': 25,
    'crystalline top': 25,
    'african flower pouch': 25,
    'mini pouches': 15,
    'mini shell pouch': 18,
    'airpods case': 12,
    'booksleeve': 25,
    'stella cushion': 20,
    'dragonfly bandana': 22,
    'classic bandana': 20,
    'scarf hip bandana': 22,
    'dragonfly headband': 12,
    'placemats': 12,
    'bookmarks': 8,
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
    for (const key in BASE_PRICES) {
        const cleanKey = key.replace(/\s+/g, '');
        if (n === cleanKey || n.includes(cleanKey)) {
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

const SHOP_CATEGORIES = [
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
        care: "- Lavagem delicada\n- Secar ao ar"
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
        care: "- Lavagem delicada\n- Secar ao ar"
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
        care: "- Lavagem delicada\n- Secar ao ar"
      },
      { 
        id: 'h1_classic', 
        name: 'Classic Coasters', 
        price: calculateProductRange('Classic Coasters'), 
        img: 'https://i.ibb.co/7JxTP2xq/Blue-coasters-7.png',
        images: [
          'https://i.ibb.co/7JxTP2xq/Blue-coasters-7.png',
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
        care: "- Lavagem delicada\n- Secar ao ar"
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
        care: "- Limpeza delicada à mão\n- Secar ao ar em superfície plana\n- Evitar torcer a peça"
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
        care: "- Lavagem delicada à mão\n- Secar ao ar\n- Evitar máquina de secar",
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
        care: "- Lavagem delicada à mão\n- Secar ao ar em superfície plana"
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
        care: "- Lavagem delicada à mão\n- Secar ao ar em superfície plana"
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
        care: "- Lavagem delicada à mão\n- Secar ao ar horizontalmente\n- Não utilizar máquina de secar"
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
        care: "- Lavagem delicada\n- Secar ao ar"
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
        care: "- Lavagem delicada à mão\n- Secar ao ar\n- Evitar máquina de secar"
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
        care: "- Lavagem delicada à mão com sabão neutro\n- Secar ao ar em superfície plana\n- Evitar máquina de secar"
      },
      { 
        id: 'alma_cardigan', 
        name: 'Alma Cardigan', 
        price: calculateProductRange('Alma Cardigan'), 
        img: 'https://i.ibb.co/Xk8DF1Y7/Alma-Cardigan.jpg',
        images: [
          'https://i.ibb.co/Xk8DF1Y7/Alma-Cardigan.jpg',
          'https://i.ibb.co/JFSPgpMd/image-1.jpg',
          'https://i.ibb.co/tMphf1D6/image.jpg',
          'https://i.ibb.co/gZwFn5mk/image-3-2.jpg'
        ],
        description: "Cardigan em crochet feito à mão com granny squares clássicos e um design cozy e intemporal. Uma peça confortável e delicada, perfeita para dias frescos de verão, outono ou para criar um look mais acolhedor e effortless. Disponível em várias combinações de cores e materiais.",
        material: "- Opção 1: 100% algodão (Leve, respirável e ideal para dias mais amenos ou meia-estação)\n- Opção 2: 50% algodão / 50% lã (Mais quente, macio e aconchegante, ideal para dias mais frios)",
        care: "- Lavagem delicada à mão\n- Secar ao ar em superfície plana\n- Evitar torcer a peça",
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
        care: "- Lavagem delicada à mão\n- Secar ao ar em superfície plana\n- Evitar máquina de secar",
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
        care: "- Lavagem delicada\n- Secar ao ar"
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
        care: "- Lavagem delicada\n- Secar ao ar"
      },
      { 
        id: 'h3', 
        name: 'Dragonfly Headband', 
        price: calculateProductRange('Dragonfly Headband'), 
        img: 'https://i.ibb.co/yckQG5rv/Dragonfly-Headband.png',
        images: [
          'https://i.ibb.co/yckQG5rv/Dragonfly-Headband.png',
          'https://i.ibb.co/zWwqkHxZ/Dragonfly-Headband-Costas.png'
        ],
        description: "Headband em crochet com delicado padrão de libelinhas, feita à mão para um toque leve e especial no dia a dia. Confortável, versátil e perfeita para complementar qualquer look com um detalhe handmade e cozy. Disponível em várias cores.",
        material: "- Material: 100% algodão",
        care: "- Lavagem delicada à mão\n- Secar ao ar\n- Evitar máquina de secar"
      },
      { 
        id: 'v3c', 
        name: 'Scarf Hip Bandana', 
        price: calculateProductRange('Scarf Hip Bandana'), 
        img: 'https://i.ibb.co/FqKX8F3t/Scarf-Hip-Bandana-12.png',
        images: [
          'https://i.ibb.co/FqKX8F3t/Scarf-Hip-Bandana-12.png',
          'https://i.ibb.co/TBp4xHWs/Scarf-Hip-Bandana-10.png',
          'https://i.ibb.co/dsXdhvSg/Scarf-Hip-Bandana-13.png',
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
  useEffect(() => {
    const timer = setTimeout(onComplete, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-[100] bg-forest flex flex-col items-center justify-center overflow-hidden"
      exit={{ y: '-100%', transition: { duration: 1.2, ease: [0.76, 0, 0.24, 1] } }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      >
        <Logo light className="h-32 md:h-48" />
      </motion.div>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 1 }}
        className="mt-12 text-cream/30 font-serif italic tracking-[0.15em] sm:tracking-[0.3em] text-[10px] sm:text-xs uppercase text-center px-6 max-w-[90vw] sm:max-w-none leading-relaxed"
      >
        {t('loading.slogan')}
      </motion.p>
      
      <motion.div 
        animate={{ scale: [1, 1.2, 1], opacity: [0.05, 0.15, 0.05] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute w-[800px] h-[800px] border border-cream rounded-full pointer-events-none"
      />
    </motion.div>
  );
};

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isDarkBg, setIsDarkBg] = useState(true);
    const { lang: activeLang, t } = useLanguage();
    const lang = activeLang.toUpperCase() as 'PT' | 'EN';

    const handleLanguageChange = (newLang: 'PT' | 'EN') => {
        localStorage.setItem('mbravo_lang', newLang);
        window.dispatchEvent(new CustomEvent('mbravo-lang-change', { detail: newLang }));
    };

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };

        const sections = document.querySelectorAll('section, [data-background]');
        const observerOptions = {
            root: null,
            rootMargin: '0px 0px -95% 0px', // Target the top portion of the screen
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
        window.addEventListener('scroll', handleScroll);
        
        return () => {
            observer.disconnect();
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    // Totally transparent with contrast-based dynamic text color as requested
    const navBg = 'bg-transparent';
    const textColor = isDarkBg ? 'text-cream' : 'text-forest';

  return (
    <nav className={`fixed top-0 left-0 w-full z-[100] transition-all duration-1000 ${isScrolled ? 'py-4' : 'py-8'} ${navBg}`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        {/* Logo with entry animation and Smart Invert */}
        <motion.a 
            href="#" 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative"
        >
          <Logo light={isDarkBg} className="h-10 md:h-12" />
        </motion.a>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6 lg:gap-10">
          {NAV_LINKS.map((link, i) => {
            const displayName = link.name === 'História' 
              ? t('nav.story') 
              : link.name === 'Catálogo' 
                ? t('nav.collection') 
                : t('nav.contacts');
            const isHighlight = link.name === 'Contactos';
            return (
              <motion.a
                key={link.name}
                href={link.href}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + (i * 0.1), duration: 0.8 }}
                className={`text-[10px] uppercase tracking-[0.4em] font-bold transition-all duration-1000 relative group ${textColor} ${
                  isHighlight 
                    ? `px-6 py-2 border rounded-full ${
                        isDarkBg 
                          ? 'border-cream/30 hover:bg-cream hover:text-forest' 
                          : 'border-forest/30 hover:bg-forest hover:text-cream'
                      }` 
                    : 'hover:opacity-60'
                }`}
              >
                {displayName}
                {!isHighlight && (
                  <div className={`absolute -bottom-1 left-0 w-0 h-[1px] ${isDarkBg ? 'bg-cream' : 'bg-forest'} group-hover:w-full transition-all duration-1000 opacity-40`} />
                )}
              </motion.a>
            );
          })}

          {/* Elegant Minimalist Language Selector */}
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + (NAV_LINKS.length * 0.1), duration: 0.8 }}
            className={`flex items-center text-[10px] uppercase tracking-[0.2em] font-medium transition-all duration-1000 pl-4 lg:pl-6 border-l ${isDarkBg ? 'border-cream/20' : 'border-forest/20'} ${textColor}`}
          >
            <button 
              onClick={() => handleLanguageChange('PT')} 
              className={`transition-all duration-500 cursor-pointer hover:text-[#C5A059] ${lang === 'PT' ? 'font-bold opacity-100' : 'opacity-40 hover:opacity-80'}`}
            >
              PT
            </button>
            <span className={`mx-2 lg:mx-3 ${isDarkBg ? 'text-cream/20' : 'text-forest/20'}`}>|</span>
            <button 
              onClick={() => handleLanguageChange('EN')} 
              className={`transition-all duration-500 cursor-pointer hover:text-[#C5A059] ${lang === 'EN' ? 'font-bold opacity-100' : 'opacity-40 hover:opacity-80'}`}
            >
              EN
            </button>
          </motion.div>
        </div>

        {/* Mobile Toggle */}
        <motion.button 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`md:hidden transition-colors duration-1000 ${textColor}`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </motion.button>
      </div>

      {/* Mobile Menu Overlay - Refined with Forest theme */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(20px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            className="fixed inset-0 z-[60] bg-forest/95 flex flex-col items-center justify-center gap-12"
          >
             <button 
                className="absolute top-8 right-6 text-cream"
                onClick={() => setMobileMenuOpen(false)}
             >
                <X size={32} />
             </button>
             {NAV_LINKS.map((link, i) => {
              const displayName = link.name === 'História' 
                ? t('nav.story') 
                : link.name === 'Catálogo' 
                  ? t('nav.collection') 
                  : t('nav.contacts');
              return (
                <motion.a
                  key={link.name}
                  href={link.href}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-5xl font-serif text-cream hover:text-brand-green-light hover:italic transition-all duration-500"
                >
                  {displayName}
                </motion.a>
              );
             })}

            {/* Mobile Language Selector */}
            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: NAV_LINKS.length * 0.05 + 0.1 }}
                className="mt-6 flex items-center text-sm uppercase tracking-[0.3em] font-medium text-cream"
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

                <div className="mt-12 flex gap-10">
                    <a href="https://www.instagram.com/mbravo.handmade/" target="_blank" rel="noopener noreferrer">
                        <Instagram className="text-cream/30 hover:text-cream transition-colors" size={24} />
                    </a>
                    <a href={MAILTO_LINK}>
                        <Mail className="text-cream/30 hover:text-cream transition-colors" size={24} />
                    </a>
                </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const FioCondutor = () => {
    const { scrollY } = useScroll();

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
    // Drops to 0.1/0.08 near dense elements (images, details, grids) and stays visible (0.4/0.45) in negative spaces
    const rawThreadOpacity = useTransform(
        scrollY,
        [0, 200, 450, 750, 1100, 1450, 1850, 2200, 2550, 2900, 3200],
        [0, 0.35, 0.45, 0.12, 0.08, 0.15, 0.42, 0.35, 0.12, 0.08, 0]
    );
    const threadOpacity = useSpring(rawThreadOpacity, { stiffness: 60, damping: 22, mass: 0.8 });

    // Map scrollY [0, 3200] to vertical position of the star [40, 2900]
    const rawStarY = useTransform(scrollY, [0, 3200], [40, 2900], { clamp: true });
    
    // Smooth the star's movement with a spring to simulate realistic gravity and inertia
    const starY = useSpring(rawStarY, { stiffness: 85, damping: 24, mass: 0.4 });
    
    // 2. Mobile wiggles vs Desktop wiggles:
    // Centered around 160. Desktop goes up to 240, down to 80. Mobile stays within 145-175 for non-intrusive flow.
    const desktopPath = "M 160 40 C 160 180, 240 280, 220 380 C 200 480, 80 580, 100 700 C 120 820, 240 920, 210 1040 C 180 1160, 80 1260, 110 1380 C 140 1500, 240 1620, 220 1740 C 200 1860, 80 1960, 100 2080 C 120 2200, 240 2320, 210 2440 C 180 2560, 80 2680, 120 2800 C 140 2880, 170 2940, 160 3000";
    const mobilePath  = "M 160 40 C 160 180, 175 280, 170 380 C 165 480, 145 580, 150 700 C 155 820, 175 920, 170 1040 C 165 1160, 145 1260, 150 1380 C 155 1500, 175 1620, 170 1740 C 165 1860, 145 1960, 150 2080 C 155 2200, 175 2320, 170 2440 C 165 2560, 145 2680, 152 2800 C 156 2880, 162 2940, 160 3000";

    const pathD = isMobile ? mobilePath : desktopPath;

    // Track horizontal alignment perfectly
    const desktopStarXRange = [160, 185, 220, 150, 100, 165, 210, 145, 110, 170, 220, 150, 100, 165, 210, 145, 120, 160];
    const mobileStarXRange  = [160, 168, 175, 162, 145, 152, 170, 158, 148, 164, 175, 162, 145, 152, 170, 158, 150, 160];
    const starXRange = isMobile ? mobileStarXRange : desktopStarXRange;

    // Map horizontal coordinate based on path curves
    const starX = useTransform(
        starY,
        [40,  200, 380, 540, 700, 870, 1040, 1210, 1380, 1560, 1740, 1910, 2080, 2260, 2440, 2620, 2800, 3000],
        starXRange
    );

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
        <div className="absolute top-[75vh] left-1/2 -translate-x-1/2 w-80 h-[3000px] pointer-events-none select-none z-[5] overflow-visible">
            <motion.div 
                style={{ opacity: threadOpacity }}
                transition={{ duration: 0.5 }}
                className="relative w-full h-full flex flex-col items-center justify-start overflow-visible"
            >
                <svg 
                    viewBox="0 0 320 3000" 
                    fill="none" 
                    className="select-none pointer-events-none overflow-visible w-full h-full"
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
                            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
                            <stop offset="85%" stopColor="#FFFFFF" stopOpacity="0.55" />
                            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
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

                    {/* 3. Soft warm sunlight catching the thread, breathing gently */}
                    <motion.path 
                        d={pathD}
                        stroke="url(#warmSunlight)" 
                        strokeWidth={glowStrokeWidth} 
                        strokeLinecap="round"
                        filter="url(#subtleThreadGlow)"
                    />

                    {/* 4. Ultra-thin glowing specular highlight catching natural afternoon glare */}
                    <motion.path 
                        d={pathD}
                        stroke="url(#specularGradient)" 
                        strokeWidth={specularStrokeWidth} 
                        strokeLinecap="round"
                    />

                    {/* Star Group centered exactly around its bottom indent (0, 0), and positioned dynamically with spring-driven scroll tracking */}
                    <motion.g 
                        style={{ 
                            x: starX, 
                            y: starY,
                            opacity: starOpacity
                        }}
                    >
                        {/* Elegant background halo glow that increases size and visible light during scroll activity */}
                        <motion.circle
                            r="16"
                            fill="rgba(197, 160, 89, 0.28)"
                            filter="url(#subtleThreadGlow)"
                            style={{
                                scale: starGlowScale,
                                opacity: starActivity
                            }}
                        />

                        {/* Official M★Bravo Star shape, solid gold - centered such that its bottom indent is at (0, 0) */}
                        <motion.path 
                            d="M0 -23 L4.3 -13.3 L14.7 -12.3 L7.3 -5.3 L9 4.7 L0 0 L-9 4.7 L-7.3 -5.3 L-14.7 -12.3 L-4.3 -13.3 Z" 
                            fill="#C5A059"
                            animate={{
                                scale: [1, 1.05, 1],
                            }}
                            transition={{
                                duration: 4,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        />

                        {/* Elegant Serif "M" inside the star to correspond 100% to the official brand star */}
                        <text 
                            x="0" 
                            y="-6.5" 
                            textAnchor="middle" 
                            fill="#243119" 
                            style={{ fontSize: '7px', fontFamily: "'Cormorant Garamond', serif", fontWeight: 'bold' }}
                        >
                            M
                        </text>
                    </motion.g>
                </svg>
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
    const [isFirstImageLoaded, setIsFirstImageLoaded] = useState(false);
    const { t } = useLanguage();

    useEffect(() => {
        // Preload the first background image to ensure zero-lag flicker-free loading
        const img = new Image();
        img.src = HERO_BACKGROUNDS[0];
        img.onload = () => {
            setIsFirstImageLoaded(true);
        };

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
            {/* Estado 0: Empty dark container with solid brand tone #1F2A18 if background image is not loaded yet */}
            {!isFirstImageLoaded ? (
                <section 
                    data-background="dark" 
                    className="relative z-20 min-h-[100dvh] lg:h-screen w-full pt-28 pb-20 md:pt-24 lg:py-0 flex flex-col items-center justify-center overflow-hidden bg-[#1F2A18]" 
                    style={{ background: '#1F2A18' }} 
                    id="hero-loader-placeholder"
                />
            ) : (
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
                            {HERO_BACKGROUNDS.map((bgUrl, index) => (
                                <motion.div 
                                    key={bgUrl}
                                    style={{ y: bgY, scale: bgScale, backgroundImage: `url(${bgUrl})` }}
                                    initial={{ opacity: 0 }}
                                    animate={{ 
                                        opacity: bgIndex === index ? 0.93 : 0,
                                    }}
                                    transition={{ duration: 2.2, ease: "easeInOut" }}
                                    className="absolute inset-0 bg-cover bg-center brightness-[0.46] contrast-[1.40] saturate-[1.05]"
                                />
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
                                className="h-[9.5rem] sm:h-[9.5rem] md:h-[11.8rem] lg:h-[14.4rem] xl:h-[17.5rem] mb-[5px] sm:mb-[7px] md:mb-[9.5px] lg:mb-[11.5px] -mt-3 md:-mt-5 origin-center select-none"
                            >
                                <Logo light className="h-full" />
                            </motion.div>
         
                            {/* Estado 2: Headline: "Cada ponto guarda uma memória." - Refined to a luxury editorial masterwork with staggered word reveal starting exactly at t = 1.5s */}
                            <h1
                                style={{ 
                                    fontFamily: "'Cormorant Garamond', serif",
                                    textShadow: "0 15px 40px rgba(18, 26, 13, 0.95), 0 4px 12px rgba(18, 26, 13, 0.7)",
                                    letterSpacing: "-0.015em"
                                }}
                                className="italic text-2xl sm:text-3xl md:text-4xl lg:text-[2.85rem] leading-tight font-normal text-[#FFFDF9] mb-4 md:mb-5 antialiased selection:bg-[#C5A059]/30 flex flex-wrap justify-center gap-x-[0.25em] md:gap-x-[0.28em] max-w-2xl"
                            >
                                {titleWords.map((word, i) => (
                                    <motion.span
                                        key={i}
                                        initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
                                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                                        transition={{
                                            delay: 1.5 + i * 0.25,
                                            duration: 1.5,
                                            ease: [0.25, 1, 0.5, 1]
                                        }}
                                        className="inline-block text-[#FFFDF9]"
                                    >
                                        {word}
                                    </motion.span>
                                ))}
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
                <span className="text-[9px] uppercase tracking-[0.4em] text-cream/20 [writing-mode:vertical-rl] rotate-180">ESTAB. 2025</span>
            </div>
            <div className="absolute bottom-12 right-12 hidden lg:block z-20 pointer-events-none select-none">
                <span className="text-[9px] uppercase tracking-[0.4em] text-cream/20 [writing-mode:vertical-rl]">BRAVO ARTESANATO</span>
            </div>
                </section>
            )}
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
        <section ref={containerRef} id="sobre" data-background="light" className="pt-24 pb-24 px-6 landscape:pt-24 landscape:pb-20 md:pt-24 md:portrait:px-12 lg:pt-32 lg:pb-32 xl:pt-36 xl:pb-36 relative z-10 overflow-hidden select-none" style={{ backgroundColor: '#FCFBF9' }}>
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
                    <div className="w-full aspect-[4/5] max-h-[50vh] sm:max-h-[60vh] lg:max-h-none overflow-hidden rounded-[2rem] md:rounded-[2.5rem] shadow-2xl relative bg-forest/5">
                        <AnimatePresence mode="wait">
                            <motion.img 
                                key={currentImg}
                                src={storyImages[currentImg]} 
                                alt="Crochet craft hands and label process by M★Bravo" 
                                initial={{ opacity: 0, scale: 1.05, filter: "contrast(0.92) brightness(1.04)" }}
                                animate={{ opacity: 0.95, scale: 1, filter: "contrast(1.02) brightness(1.0)" }}
                                exit={{ opacity: 0, scale: 0.97 }}
                                transition={{ duration: 1.8, ease: "easeInOut" }}
                                className="w-full h-full object-cover select-none"
                            />
                        </AnimatePresence>
                        
                        {/* Organic cotton/linen thread tactile overlay on top of images for workshop feel */}
                        <div 
                            className="absolute inset-0 pointer-events-none z-10 opacity-[0.14] mix-blend-multiply rounded-[2rem] md:rounded-[2.5rem]"
                            style={{
                                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='paperNoise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.05' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='0.8 0 0 0 0 0 0.8 0 0 0 0 0 0.8 0 0 0 0 0 0.5 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23paperNoise)'/%3E%3C/svg%3E")`
                            }}
                        />
                        <div className="absolute inset-0 ring-1 ring-inset ring-forest/10 rounded-[2rem] md:rounded-[2.5rem] z-20" />
                        
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

                    {/* Luxurious Rotating Brand Badge */}
                    <div className="absolute -bottom-10 -right-4 md:-bottom-12 md:-right-12 w-36 h-36 md:w-44 md:h-44 lg:w-48 lg:h-48 hidden sm:flex md:portrait:hidden lg:flex items-center justify-center bg-forest rounded-full p-1 border-4 border-cream shadow-[0_25px_60px_rgba(36,49,25,0.25)] z-20 overflow-hidden group">
                        <motion.div 
                            animate={{ rotate: 360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            className="w-full h-full relative flex items-center justify-center"
                        >
                            <svg viewBox="0 0 100 100" className="w-full h-full">
                                <path
                                    id="circlePathBadge"
                                    d="M 50, 50 m -36, 0 a 36,36 0 1, 1 72,0 a 36,36 0 1, 1 -72,0"
                                    fill="none"
                                />
                                <text style={{ fontSize: '9px', lineHeight: '13.5px' }} className="font-bold uppercase tracking-[0.14em] fill-cream">
                                    <textPath href="#circlePathBadge" startOffset="0%" style={{ fontSize: '9px', lineHeight: '13.5px' }}>
                                        M★BRAVO ★ HANDMADE ★ EST. 2025 ★
                                    </textPath>
                                </text>
                            </svg>
                        </motion.div>
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <svg viewBox="0 0 120 120" className="w-16 h-16 md:w-20 md:h-20">
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
                        <h2 className="text-3xl xs:text-4xl sm:text-5xl md:text-5xl lg:text-forest lg:text-7xl font-serif text-forest tracking-tight leading-tight md:leading-[1.05] font-light">
                            {t('story.title.part1')} <br />
                            <span className="italic font-normal text-[#C5A059]">{t('story.title.part2')}</span>
                        </h2>
                    </div>
                    
                    <div className="space-y-8">
                        <p className="text-forest font-serif italic text-xl md:text-2xl leading-relaxed font-light text-forest/90">
                            {t('story.subtitle')} <br />
                            <span className="text-base sm:text-lg font-sans not-italic text-forest/70 block mt-3 font-light leading-relaxed">
                                {t('story.subtitle2')}
                            </span>
                        </p>
                        
                        <p className="text-forest font-serif italic text-xl md:text-2xl leading-relaxed font-light text-forest/95">
                            {t('story.p1')}
                        </p>
                        
                        <p className="text-forest/70 text-[15px] md:text-lg leading-relaxed font-sans font-light max-w-2xl">
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
                                <span className="text-forest lg:text-forest font-serif text-[16px] md:text-xl font-light tracking-wide">
                                    {mantra}
                                </span>
                            </motion.div>
                        ))}
                    </div>

                    {/* Elegant, Non-Commercial CTA */}
                    <div className="pt-8 md:pt-10 flex flex-col sm:flex-row md:portrait:flex-col lg:flex-row items-center sm:items-center md:portrait:items-center lg:items-start gap-8 md:portrait:gap-8 md:portrait:w-full md:portrait:justify-center">
                        <a 
                            href="#collection" 
                            className="group relative inline-flex items-center gap-6 pl-10 pr-16 py-5 bg-forest text-cream rounded-full overflow-hidden transition-all duration-500 hover:pr-20 shrink-0"
                        >
                            <span className="relative z-10 text-[10px] uppercase tracking-[0.3em] font-semibold whitespace-nowrap">
                                {t('story.cta')}
                            </span>
                            <div className="absolute right-4 w-10 h-10 bg-[#C5A059] text-forest rounded-full flex items-center justify-center transition-all duration-500 group-hover:right-6">
                                <ArrowRight size={16} />
                            </div>
                        </a>

                        {/* Fluid Brand Badge shown only in md:portrait and xs/sm mobile views, below the text flow smoothly */}
                        <div className="flex sm:hidden md:portrait:flex lg:hidden items-center justify-center relative w-36 h-36 md:w-40 md:h-40 bg-forest rounded-full p-1 border-4 border-cream shadow-[0_25px_60px_rgba(36,49,25,0.25)] overflow-hidden group shrink-0">
                            <motion.div 
                                animate={{ rotate: 360 }}
                                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                className="w-full h-full relative flex items-center justify-center"
                            >
                                <svg viewBox="0 0 100 100" className="w-full h-full">
                                    <path
                                        id="circlePathBadgeFluid"
                                        d="M 50, 50 m -36, 0 a 36,36 0 1, 1 72,0 a 36,36 0 1, 1 -72,0"
                                        fill="none"
                                    />
                                    <text style={{ fontSize: '9px', lineHeight: '13.5px' }} className="font-bold uppercase tracking-[0.14em] fill-cream">
                                        <textPath href="#circlePathBadgeFluid" startOffset="0%" style={{ fontSize: '9px', lineHeight: '13.5px' }}>
                                            M★BRAVO ★ HANDMADE ★ EST. 2025 ★
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
                </motion.div>
            </div>
        </section>
    );
};

const MadeWithTimeSection = () => {
    const { t } = useLanguage();
    return (
        <section id="manifesto" data-background="light" className="pt-24 pb-20 px-4 landscape:py-16 md:portrait:py-24 lg:py-32 xl:py-36 bg-[#FCFBF9] relative overflow-hidden select-none border-t border-forest/5">
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header: Large Asymmetrical Editorial Typography */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-baseline mb-24 md:mb-32 border-b border-forest/10 pb-16">
                    <div className="lg:col-span-7">
                        <span className="text-[10px] uppercase tracking-[0.45em] font-semibold text-forest/35 block mb-4 font-sans">
                            {t('manifesto.choice')}
                        </span>
                        <h2 className="text-3xl sm:text-5xl md:text-5xl lg:text-6xl font-serif text-forest tracking-tight leading-tight lg:leading-[1.1] font-light">
                            {t('manifesto.title')} <br />
                            <span className="italic font-normal text-[#C5A059]">{t('manifesto.subtitle')}</span>
                        </h2>
                    </div>
                    <div className="lg:col-span-5 lg:pl-12">
                        <p className="text-forest/70 text-lg md:text-xl font-light leading-relaxed font-serif italic border-l border-[#C5A059]/40 pl-6 py-2">
                            "{t('manifesto.quote')}"
                        </p>
                    </div>
                </div>

                {/* Main Content Grid: Balanced 12-column layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-12 items-start">
                    
                    {/* Left Column: The 4 editorial pillars (spans 7 columns) */}
                    <div className="lg:col-span-7">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 lg:gap-x-12 lg:gap-y-16">
                            
                            {/* Pillar 1 - O Ritmo */}
                            <motion.div 
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                                className="space-y-4 text-left group"
                            >
                                <div className="flex items-center justify-between border-b border-forest/10 pb-3">
                                    <div className="flex items-center gap-2">
                                        <Feather size={14} className="text-[#C5A059] opacity-80" />
                                        <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-forest/40">{t('manifesto.pillar1.num')}</span>
                                    </div>
                                    <span className="font-serif italic text-lg text-[#C5A059]/50 group-hover:text-[#C5A059] transition-colors duration-500 font-light select-none">I</span>
                                </div>
                                <h3 className="text-xl font-serif text-forest tracking-wide group-hover:text-[#C5A059] transition-colors duration-300 font-light leading-snug">
                                    {t('manifesto.pillar1.title')}
                                </h3>
                                <div className="space-y-4 font-sans text-forest/65 text-sm font-light leading-relaxed">
                                    <p>{t('manifesto.pillar1.p1')}</p>
                                    <p>{t('manifesto.pillar1.p2')}</p>
                                    <p>{t('manifesto.pillar1.p3')}</p>
                                </div>
                            </motion.div>

                            {/* Pillar 2 - A Presença */}
                            <motion.div 
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 1.2, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                                className="space-y-4 text-left group lg:translate-y-12"
                            >
                                <div className="flex items-center justify-between border-b border-forest/10 pb-3">
                                    <div className="flex items-center gap-2">
                                        <Sparkles size={14} className="text-[#C5A059] opacity-80" />
                                        <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-forest/40">{t('manifesto.pillar2.num')}</span>
                                    </div>
                                    <span className="font-serif italic text-lg text-[#C5A059]/50 group-hover:text-[#C5A059] transition-colors duration-500 font-light select-none">II</span>
                                </div>
                                <h3 className="text-xl font-serif text-forest tracking-wide group-hover:text-[#C5A059] transition-colors duration-300 font-light leading-snug">
                                    {t('manifesto.pillar2.title')}
                                </h3>
                                <div className="space-y-4 font-sans text-forest/65 text-sm font-light leading-relaxed">
                                    <p>{t('manifesto.pillar2.p1')}</p>
                                    <p>{t('manifesto.pillar2.p2')}</p>
                                    <p>{t('manifesto.pillar2.p3')}</p>
                                </div>
                            </motion.div>

                            {/* Pillar 3 - A Matéria */}
                            <motion.div 
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 1.2, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                                className="space-y-4 text-left group lg:-mt-12"
                            >
                                <div className="flex items-center justify-between border-b border-forest/10 pb-3">
                                    <div className="flex items-center gap-2">
                                        <Palette size={14} className="text-[#C5A059] opacity-80" />
                                        <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-forest/40">{t('manifesto.pillar3.num')}</span>
                                    </div>
                                    <span className="font-serif italic text-lg text-[#C5A059]/50 group-hover:text-[#C5A059] transition-colors duration-500 font-light select-none">III</span>
                                </div>
                                <h3 className="text-xl font-serif text-forest tracking-wide group-hover:text-[#C5A059] transition-colors duration-300 font-light leading-snug">
                                    {t('manifesto.pillar3.title')}
                                </h3>
                                <div className="space-y-4 font-sans text-forest/65 text-sm font-light leading-relaxed">
                                    <p>{t('manifesto.pillar3.p1')}</p>
                                    <p>{t('manifesto.pillar3.p2')}</p>
                                    <p>{t('manifesto.pillar3.p3')}</p>
                                </div>
                            </motion.div>

                            {/* Pillar 4 - O Afeto */}
                            <motion.div 
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                                className="space-y-4 text-left group lg:translate-y-12"
                            >
                                <div className="flex items-center justify-between border-b border-forest/10 pb-3">
                                    <div className="flex items-center gap-2">
                                        <Heart size={14} className="text-[#C5A059] opacity-80" />
                                        <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-forest/40">{t('manifesto.pillar4.num')}</span>
                                    </div>
                                    <span className="font-serif italic text-lg text-[#C5A059]/50 group-hover:text-[#C5A059] transition-colors duration-500 font-light select-none">IV</span>
                                </div>
                                <h3 className="text-xl font-serif text-forest tracking-wide group-hover:text-[#C5A059] transition-colors duration-300 font-light leading-snug">
                                    {t('manifesto.pillar4.title')}
                                </h3>
                                <div className="space-y-4 font-sans text-forest/65 text-sm font-light leading-relaxed">
                                    <p>{t('manifesto.pillar4.p1')}</p>
                                    <p>{t('manifesto.pillar4.p2')}</p>
                                    <p>{t('manifesto.pillar4.p3')}</p>
                                </div>
                            </motion.div>

                        </div>
                    </div>

                    {/* Right Column: The Refined Image (spans 5 columns) - Elegantly proportioned to balance the text column */}
                    <div className="lg:col-span-5 space-y-8 lg:sticky lg:top-36 md:portrait:max-w-md md:portrait:mx-auto md:portrait:w-full">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.98, y: 20 }}
                            whileInView={{ opacity: 1, scale: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
                            className="w-full aspect-[4/5] max-h-[50vh] sm:max-h-[60vh] md:portrait:max-h-[450px] lg:max-h-none relative rounded-[2rem] overflow-hidden shadow-[0_24px_50px_rgba(31,42,24,0.06)] group border border-forest/5"
                        >
                            <img 
                                src="https://i.ibb.co/j9LHyxq6/Firefly-Gemini-Flash-Imagem-com-ambiente-cosy-tema-handmade-crochet-usar-o-logo-em-label-de-cartao.png" 
                                alt="Destaque de textura de lã e rótulo M★Bravo" 
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
                            <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
                                <p className="text-cream font-serif italic text-base font-light leading-snug drop-shadow-sm max-w-[200px]">
                                    "{t('manifesto.imageQuote')}"
                                </p>
                                <span className="font-mono text-[8px] tracking-[0.3em] text-cream/70 uppercase">M★B</span>
                            </div>
                        </motion.div>
                        
                        {/* Under-image captioning */}
                        <div className="flex justify-between items-center px-4 py-2 border-t border-forest/10 font-sans text-forest/40 select-none">
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
            className="pt-24 pb-20 px-4 landscape:py-16 md:portrait:py-24 lg:py-32 xl:py-36 relative overflow-hidden" 
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

            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="max-w-3xl mb-16 md:mb-20 lg:mb-24">
                    <motion.span 
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-[10px] uppercase tracking-[0.4em] font-bold text-cream/30 mb-4 block"
                    >
                        {t('feeling.badge')}
                    </motion.span>
                    <motion.h2 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1 }}
                        className="text-3xl sm:text-5xl md:text-6xl lg:text-8xl font-serif text-cream leading-tight mb-8 md:mb-10"
                    >
                        {t('feeling.title.part1')} <br />
                        <span className="italic font-normal text-brand-green-light">{t('feeling.title.part2')}</span>
                    </motion.h2>
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className="text-cream/80 text-base sm:text-lg md:text-xl lg:text-2xl font-light leading-relaxed animate-fadeIn"
                    >
                        {t('feeling.p1')}
                        <br /><br />
                        {t('feeling.p2')}
                        <br /><br />
                        {t('feeling.p3')}
                    </motion.p>
                </div>

                {/* Minimalist Details Gallery */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 lg:gap-12">
                    {/* Main Focus Detail */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.98 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.5 }}
                        className="col-span-1 md:col-span-1 lg:col-span-7 w-full aspect-[4/5] max-h-[50vh] sm:max-h-[60vh] lg:max-h-none overflow-hidden rounded-3xl md:rounded-[3rem] relative group shadow-2xl max-w-2xl mx-auto md:max-w-none"
                    >
                        <img 
                            src="https://i.ibb.co/F4Z4Fp4Z/LOGOTIPOo.jpg" 
                            alt="Textura de malha" 
                            className="w-full h-full object-cover brightness-95 hover:scale-105 transition-all duration-[1.5s] ease-out"
                        />
                        <div className="absolute inset-x-0 bottom-0 p-8 md:p-12 bg-gradient-to-t from-forest/90 via-forest/40 to-transparent">
                            <span className="text-[10px] uppercase tracking-[0.4em] text-cream/50 mb-1 md:mb-2 block">{t('feeling.label')}</span>
                            <p className="text-cream text-lg md:text-2xl font-serif italic">{t('feeling.caption')}</p>
                        </div>
                    </motion.div>

                    {/* Secondary Details */}
                    <div className="col-span-1 md:col-span-1 lg:col-span-5 flex flex-col gap-6 md:gap-14 lg:gap-16 justify-center max-w-2xl mx-auto md:max-w-none w-full">
                        <motion.div 
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.2, delay: 0.3 }}
                            className="w-full aspect-[4/5] max-h-[50vh] sm:max-h-[60vh] lg:max-h-none overflow-hidden rounded-3xl md:rounded-[3rem] transition-all duration-1000 shadow-xl relative group"
                        >
                            <img 
                                src="https://i.ibb.co/d0Rn6jC7/MOOD-01.png" 
                                alt="Mãos da artesã" 
                                className="w-full h-full object-cover brightness-95 hover:scale-105 transition-all duration-[1.5s] ease-out"
                            />
                        </motion.div>
                        <motion.div 
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.2, delay: 0.5 }}
                            className="w-full aspect-[4/5] max-h-[50vh] sm:max-h-[60vh] lg:max-h-none overflow-hidden rounded-3xl md:rounded-[3rem] transition-all duration-1000 shadow-xl relative group"
                        >
                            <img 
                                src="https://i.ibb.co/PKJgWZM/emotional-thank-you-card-1.png" 
                                alt="Detalhe de material" 
                                className="w-full h-full object-cover brightness-95 hover:scale-105 transition-all duration-[1.5s] ease-out"
                            />
                        </motion.div>
                    </div>
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

const ProductCard: React.FC<ProductCardProps> = ({ product: rawProduct, i, isFocused, isSubdued, onFocus, onPrevProduct, onNextProduct }) => {
    const { lang, t } = useLanguage();
    const product = translateProduct(rawProduct, lang);
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
    const cardRef = useRef<HTMLDivElement>(null);
    const [activeImgIndex, setActiveImgIndex] = useState(0);
    const [direction, setDirection] = useState(0);

    // New Direct Checkout Gateway States
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'mbway' | 'multibanco' | 'card'>('mbway');
    const [checkoutForm, setCheckoutForm] = useState({
        nome: '',
        email: '',
        telefone: '',
        morada: '',
        codigoPostal: '',
        cidade: '',
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
    const [sandboxEmails, setSandboxEmails] = useState<{ customerEmailUrl: string, adminEmailUrl: string } | null>(null);
    const isLiveMode = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY?.startsWith('pk_live') || false;

    const productImages = product.images || [product.img];

    useEffect(() => {
        setActiveImgIndex(0);
        setDirection(0);
    }, [product.id, isFocused]);

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

    const rawPrice = getApprovedPrice(product.name);
    const totalPrice = typeof rawPrice === 'number' 
        ? `${rawPrice * (hasQuantity ? (parseInt(selections.quantidade) || 1) : 1)}`
        : 'Sob Consulta';
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

    const [isZoomed, setIsZoomed] = useState(false);

    if (!isFocused) {
        return (
            <motion.div 
                ref={cardRef}
                layoutId={`product-card-${product.id}`}
                className="group relative flex flex-col h-full bg-white rounded-[16px] shadow-[0_4px_22px_-10px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_45px_-12px_rgba(36,49,25,0.14)] hover:-translate-y-1.5 transition-all duration-500 overflow-hidden"
            >
                <div className="flex flex-col h-full">
                    {/* Image Container with Fixed Aspect Ratio */}
                    <div 
                        className="relative overflow-hidden aspect-[4/5] cursor-pointer"
                        onClick={handleToggle}
                        style={{ borderTopLeftRadius: '16px', borderTopRightRadius: '16px' }}
                    >
                        <div className="relative w-full h-full overflow-hidden bg-white">
                            <motion.img 
                                layoutId={`product-img-${product.id}`}
                                src={productImages[0]} 
                                alt={product.name} 
                                loading="eager"
                                decoding="sync"
                                style={{ imageRendering: 'crisp-edges', filter: 'none', opacity: 1 }}
                                className="w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-700 ease-out antialiased filter-none opacity-100"
                            />
                        </div>
                        <div className="absolute top-4 left-4 z-10 pointer-events-none">
                            <span className="bg-forest/85 backdrop-blur-md text-white text-[8px] uppercase tracking-widest px-3 py-1.5 rounded-full font-bold">
                                M★BRAVO
                            </span>
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-6 flex flex-col justify-between flex-grow bg-white">
                        <div>
                            <h3 className="text-lg font-serif font-normal tracking-wide text-forest mb-1">{product.name}</h3>
                            <p className="text-forest/40 text-[9px] uppercase tracking-[0.3em] font-semibold mb-4 font-sans">HANDMADE EXCLUSIVE</p>
                        </div>
                        <div className="flex justify-between items-end">
                            <span className="text-sm font-sans font-semibold tracking-wider text-forest/70">{product.price}</span>
                            <button 
                                onClick={handleToggle}
                                className="p-2 rounded-full bg-forest text-cream hover:bg-forest/90 transition-all shadow-lg shadow-forest/10 hover:scale-105 active:scale-95 duration-200"
                            >
                                <ArrowRight size={15} />
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
        <div className="w-full h-[100dvh] md:max-w-3xl md:h-[90vh] lg:max-w-6xl lg:h-[88vh] bg-[#FCFBF9] rounded-none md:rounded-[2rem] lg:rounded-[2.5rem] flex flex-col lg:flex-row shadow-2xl relative overflow-y-auto lg:overflow-hidden text-forest select-none">
            {/* a) Área de Visualização */}
            <div 
                className="w-full lg:w-[62%] h-[52vh] md:h-[56vh] lg:h-full shrink-0 border-b lg:border-b-0 lg:border-r border-forest/10 p-1 sm:p-2 lg:p-4 flex flex-col items-center justify-center overflow-hidden bg-[#F5F2ED] relative transition-colors duration-500"
                style={{ touchAction: 'none' }}
            >
                {/* Floating label in top-left corner */}
                <div className="absolute top-6 left-6 z-20 pointer-events-none hidden lg:block">
                    <span className="bg-forest/5 backdrop-blur-md text-forest/70 text-[8px] uppercase tracking-[0.25em] px-3.5 py-1.5 rounded-full border border-forest/10 font-medium">
                        Clique para aproximar a foto
                    </span>
                </div>

                {/* High-End Floating Close Button for Mobile/Tablet */}
                <button 
                    onClick={handleToggle}
                    className="fixed top-4 right-4 z-[150] lg:hidden p-3 rounded-full bg-forest text-cream backdrop-blur-md transition-all border border-forest/10 cursor-pointer flex items-center justify-center shadow-lg"
                    title="Fechar Detalhes"
                >
                    <X size={18} />
                </button>

                {/* Main Proportional Visual Frame with layoutId */}
                <div className="relative w-full h-full max-w-full max-h-[82vh] flex items-center justify-center">
                    <AnimatePresence initial={false} custom={direction} mode="popLayout">
                        <motion.img 
                            key={activeImgIndex}
                            layoutId={activeImgIndex === 0 ? `product-img-${product.id}` : undefined}
                            src={currentImg} 
                            alt={`${product.name} - Imagem ${activeImgIndex + 1}`} 
                            loading="eager"
                            decoding="sync"
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
                                setIsZoomed(true);
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
                                >
                                    <img 
                                        src={imgUrl} 
                                        alt="" 
                                        loading="eager"
                                        decoding="sync"
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
            <div className="w-full lg:w-[38%] h-auto lg:h-full bg-[#FCFBF9] flex flex-col pl-5 pr-5 py-6 lg:py-8 text-forest relative box-border">
                {isCheckingOut ? (
                    <div className="flex-1 flex flex-col h-full bg-[#FCFBF9] text-forest select-text p-1 animate-fadeIn overflow-y-auto max-h-full">
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
                            <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-forest/30">
                                {paymentCompleted ? (lang === 'pt' ? 'Pedido Concluído' : 'Order Completed') : (lang === 'pt' ? 'Checkout Seguro' : 'Secure Checkout')}
                            </span>
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
                                                        const res = await fetch('/api/payment/webhook', {
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
                                                {isPaying ? 'A Processar...' : (lang === 'pt' ? 'Simular Pagamento (Sandbox Webhook)' : 'Simulate Payment (Sandbox Webhook)')}
                                            </button>
                                        )}
                                    </div>
                                )}

                                <div className="bg-amber-50/50 rounded-xl p-3.5 border border-[#C5A059]/20 text-left text-[11px] text-forest/80 leading-relaxed font-sans">
                                    <p className="font-semibold text-[#A68244] mb-1">{t('payment.prod_note_title')}</p>
                                    <p>{t('payment.prod_note_desc')}</p>
                                </div>

                                {sandboxEmails && (
                                    <div className="w-full bg-[#243119]/5 rounded-2xl p-4 border border-[#243119]/10 text-left space-y-3 font-sans">
                                        <p className="text-[10px] uppercase tracking-wider text-[#A68244] font-bold">{t('sandbox.email_sim')}</p>
                                        <p className="text-[11px] text-forest/70 leading-relaxed">{t('sandbox.email_desc')}</p>
                                        <div className="grid grid-cols-2 gap-2 pt-1">
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
                                    </div>
                                )}

                                <button
                                    onClick={() => {
                                        setIsCheckingOut(false);
                                        setPaymentCompleted(false);
                                        setMultibancoRef(null);
                                        handleToggle(); // Close modal using existing trigger
                                    }}
                                    className="w-full rounded-full py-3 text-center font-bold bg-[#C5A059] text-[#343E2C] hover:bg-[#d5b069] text-[10px] uppercase tracking-widest cursor-pointer shadow-md transition-all font-sans"
                                >
                                    {t('payment.btn_home')}
                                </button>
                            </div>
                        ) : (
                            /* Checkout Form and Gateway selection */
                            <div className="space-y-6 pb-20 lg:pb-6 text-left flex-grow flex flex-col justify-between">
                                <div className="space-y-6">
                                    {/* Product Summary Mini Card */}
                                    <div className="bg-forest/5 rounded-2xl p-4 border border-forest/5 flex justify-between items-center gap-4">
                                        <div className="flex items-center gap-3">
                                            <img 
                                                src={productImages[0]} 
                                                alt="" 
                                                loading="eager"
                                                decoding="sync"
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
                                                <input 
                                                    type="email" 
                                                    placeholder={lang === 'pt' ? "E-mail" : "Email Address"} 
                                                    required
                                                    value={checkoutForm.email}
                                                    onChange={(e) => setCheckoutForm(prev => ({ ...prev, email: e.target.value }))}
                                                    className="w-full bg-white rounded-xl px-4 py-2.5 text-xs text-forest placeholder-forest/30 border border-forest/10 focus:border-[#C5A059] focus:outline-none transition-all font-sans"
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
                                        </div>
                                    </div>

                                    {/* Payment Gateway Selection */}
                                    <div className="space-y-3">
                                        <h5 className="text-[9px] uppercase tracking-[0.25em] font-bold text-forest/45">
                                            {lang === 'pt' ? '2. MÉTODO DE PAGAMENTO' : '2. PAYMENT METHOD'}
                                        </h5>

                                        <div className="grid grid-cols-3 gap-2">
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

                                    <motion.button
                                        disabled={isPaying || !checkoutForm.nome || !checkoutForm.email || !checkoutForm.morada || (paymentMethod === 'mbway' && !checkoutForm.mbwayPhone) || (paymentMethod === 'card' && (!checkoutForm.cardNumber || !checkoutForm.cardExpiry || !checkoutForm.cardCvv))}
                                        onClick={async () => {
                                            setIsPaying(true);
                                            setCheckoutError(null);
                                            setSandboxEmails(null);

                                            // If Multibanco ref is already active, clicking simulates the manual user payment webhook confirmation
                                            if (paymentMethod === 'multibanco' && multibancoRef) {
                                                try {
                                                    const res = await fetch('/api/payment/webhook', {
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
                                                const response = await fetch('/api/payment/create-intent', {
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
                                                        const confirmRes = await fetch('/api/payment/webhook', {
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
                                                                const statusRes = await fetch(`/api/payment/status/${data.orderId}`);
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
                                        className="w-full rounded-full py-4 text-center font-bold bg-[#343E2C] text-[#C5A059] hover:bg-[#2c3525] active:scale-95 text-[11px] uppercase tracking-widest cursor-pointer shadow-lg disabled:opacity-40 disabled:cursor-not-allowed border border-[#C5A059]/10 flex items-center justify-center gap-2 transition-all duration-300 font-sans"
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
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-visible lg:overflow-y-auto space-y-5 pr-1 select-text pb-32 lg:pb-4 scrollbar-thin scrollbar-thumb-forest/10 scrollbar-track-transparent">
                        
                        {/* Title & Navigation/Close Controls */}
                        <div className="flex justify-between items-start gap-4">
                            <div>
                                <span className="text-[9px] uppercase tracking-[0.4em] text-[#C5A059] block mb-1 font-sans font-semibold">EXCLUSIVO M★BRAVO</span>
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
                                    className="w-full rounded-full py-3.5 text-center font-bold bg-[#C5A059] text-[#343E2C] hover:bg-[#d5b069] active:scale-95 text-[11px] uppercase tracking-widest cursor-pointer shadow-[0_4px_15px_rgba(197,160,89,0.3)] border border-[#C5A059]/10 block transition-all duration-300"
                                >
                                    {t('product.instant_buy')}
                                </motion.button>
                                
                                <motion.a 
                                    href={whatsappUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.99 }}
                                    className="w-full rounded-full py-3 text-center font-bold bg-transparent text-[#FCFBF9] hover:bg-white/5 active:scale-95 text-[10px] uppercase tracking-widest cursor-pointer border border-[#C5A059]/30 block transition-all duration-300"
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
                            className="flex-1 max-w-[190px] xs:max-w-[210px] sm:max-w-[240px] rounded-full py-3.5 text-center font-bold bg-[#C5A059] text-[#343E2C] hover:bg-[#d5b069] text-[10px] sm:text-[11px] uppercase tracking-widest cursor-pointer shadow-[0_4px_15px_rgba(197,160,89,0.35)] border border-[#C5A059]/10 block font-sans"
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
                        className="w-full rounded-full py-2.5 text-center font-medium bg-transparent text-forest hover:bg-forest/5 text-[9px] uppercase tracking-widest cursor-pointer border border-[#C5A059]/30 block font-sans"
                    >
                        {t('product.customize_whatsapp')}
                    </motion.a>
                </div>
            )}
        </div>

        {/* HIGH-END INTERACTIVE REAL FULL-SCREEN ZOOM MODAL */}
        <AnimatePresence>
            {isZoomed && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    onClick={() => setIsZoomed(false)}
                    className="fixed inset-0 z-[1000] flex flex-col items-center justify-center bg-black/95 p-4 sm:p-6 lg:p-12 cursor-zoom-out select-none backdrop-blur-md"
                >
                    {/* Floating Close Button */}
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsZoomed(false);
                        }}
                        className="absolute top-6 right-6 z-[1010] p-4 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all border border-white/10 hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center shadow-2xl"
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
                            src={currentImg} 
                            alt={`${product.name} Zoom`}
                            className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl pointer-events-none"
                        />
                    </div>

                    {/* Informative minimal note */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 text-white/50 text-[10px] uppercase tracking-widest font-sans font-light">
                        Toca em qualquer lado para fechar
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
        </>
    );
};

const CarouselItem: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div className="flex-none w-full md:w-1/2 lg:w-[calc(100%/3)] px-4 snap-center md:snap-start">
            <div className="w-full h-full">
                {children}
            </div>
        </div>
    );
};

const CollectionSection = () => {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [focusedProductId, setFocusedProductId] = useState<string | null>(null);
    const containerRef = useRef(null);
    const carouselRef = useRef<HTMLDivElement>(null);
    const { lang, t } = useLanguage();

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
    const activeCategory = translatedCategoriesList.find(c => c.id === selectedCategory);

    const handlePrevProduct = () => {
        if (!activeCategory || !focusedProductId) return;
        const index = activeCategory.products.findIndex(p => p.id === focusedProductId);
        if (index !== -1) {
            const prevIndex = index === 0 ? activeCategory.products.length - 1 : index - 1;
            setFocusedProductId(activeCategory.products[prevIndex].id);
        }
    };

    const handleNextProduct = () => {
        if (!activeCategory || !focusedProductId) return;
        const index = activeCategory.products.findIndex(p => p.id === focusedProductId);
        if (index !== -1) {
            const nextIndex = index === activeCategory.products.length - 1 ? 0 : index + 1;
            setFocusedProductId(activeCategory.products[nextIndex].id);
        }
    };

    // Reset focused product when changing category
    useEffect(() => {
        setFocusedProductId(null);
    }, [selectedCategory]);

    // Lock body scroll when a product focus modal is open
    useEffect(() => {
        if (focusedProductId) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [focusedProductId]);

    return (
        <section ref={containerRef} id="collection" data-background="light" className="pt-24 pb-20 px-4 landscape:py-16 md:portrait:py-24 lg:py-32 xl:py-36 bg-[#FCFBF9] min-h-screen relative overflow-hidden">

            <motion.div 
                style={{ x: xTrack, y: yTrack, opacity: opacityTrack, fontFamily: "'Cormorant Garamond', serif" }}
                className="absolute inset-0 pointer-events-none text-forest text-[26vw] md:text-[35vw] leading-none italic font-light whitespace-nowrap text-center flex items-center justify-center select-none z-0"
            >
                M★Bravo
            </motion.div>

            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 sm:mb-24 md:mb-32 text-center relative z-10">
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
                    className="text-xs tracking-[0.3em] text-gray-400 uppercase font-light mb-4 block"
                 >
                    {t('collection.tag')}
                 </motion.span>
                 <motion.h2 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl font-light tracking-[0.2em] uppercase leading-tight text-center"
                    style={{ fontFamily: "'Cormorant Garamond', serif" }}
                  >
                    {selectedCategory ? activeCategory?.name : (
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
                    )}
                 </motion.h2>
                 
                 {!selectedCategory && (
                     <motion.p
                         initial={{ opacity: 0, y: 10 }}
                         whileInView={{ opacity: 1, y: 0 }}
                         transition={{ duration: 1, delay: 0.2 }}
                         className="text-forest/60 text-lg md:text-xl font-serif font-light italic mt-6"
                     >
                         {t('collection.subtitle')}
                     </motion.p>
                 )}

                 {selectedCategory && (
                    <motion.button 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        onClick={() => setSelectedCategory(null)}
                        className="mt-12 group flex items-center gap-4 mx-auto text-[10px] uppercase tracking-[0.4em] font-bold text-forest/40 hover:text-forest transition-colors"
                    >
                        <ChevronLeft size={16} className="group-hover:-translate-x-2 transition-transform" />
                        {t('btn.back_collection')}
                    </motion.button>
                 )}
            </div>

            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <AnimatePresence mode="wait">
                    {!selectedCategory ? (
                        <motion.div 
                            key="overview"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2, ease: "linear" }}
                            className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 lg:gap-24"
                        >
                            {translatedCategoriesList.map((cat, i) => (
                                <motion.div 
                                    key={cat.id}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className="group relative aspect-[4/3] rounded-[3rem] overflow-hidden bg-forest/5 cursor-pointer max-w-2xl mx-auto w-full"
                                    style={{ willChange: 'transform' }}
                                    onClick={() => setSelectedCategory(cat.id)}
                                >
                                    <img 
                                        src={cat.img} 
                                        alt={cat.name} 
                                        loading="eager"
                                        decoding="sync"
                                        style={{ imageRendering: 'crisp-edges' }}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out antialiased"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-forest/90 via-forest/20 to-transparent flex flex-col justify-end p-6 sm:p-8 md:p-12 translate-y-0 md:translate-y-6 md:group-hover:translate-y-0 transition-transform duration-700">
                                        <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-serif text-cream mb-2 sm:mb-4">{cat.name}</h3>
                                        <p className="text-cream/60 text-xs sm:text-sm font-light mb-6 sm:mb-10 max-w-sm opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-700">{cat.items}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="detail"
                            layout
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2, ease: "linear" }}
                            className="relative"
                        >
                            {/* Carousel Container - ALWAYS rendered to keep scroll and heights */}
                            <div className={`transition-all duration-500 ${focusedProductId ? "opacity-30 pointer-events-none scale-[0.98] blur-[2px]" : "opacity-100"}`}>
                                <div className="relative group/carousel px-4">
                                    {/* Horizontal Product Carousel - High-End eCommerce Layout */}
                                    <div 
                                        ref={carouselRef}
                                        className="relative w-full overflow-x-auto pb-12 pt-4 snap-x snap-mandatory no-scrollbar flex scroll-smooth"
                                    >
                                        {activeCategory?.products.map((product, i) => (
                                            <CarouselItem key={product.id}>
                                                <ProductCard 
                                                    product={product} 
                                                    i={i} 
                                                    isFocused={false}
                                                    isSubdued={focusedProductId !== null && focusedProductId !== product.id}
                                                    onFocus={setFocusedProductId}
                                                />
                                            </CarouselItem>
                                        ))}
                                    </div>

                                    {/* Minimalist Navigation Controls */}
                                    <div className="hidden md:flex absolute top-1/2 -left-4 -right-4 -translate-y-1/2 items-center justify-between pointer-events-none px-4">
                                        <button 
                                            onClick={() => carouselRef.current?.scrollBy({ left: -carouselRef.current.offsetWidth, behavior: 'smooth' })}
                                            className="w-12 h-12 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg pointer-events-auto hover:bg-forest hover:text-cream transition-all -translate-x-2"
                                        >
                                            <ChevronLeft size={24} />
                                        </button>
                                        <button 
                                            onClick={() => carouselRef.current?.scrollBy({ left: carouselRef.current.offsetWidth, behavior: 'smooth' })}
                                            className="w-12 h-12 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg pointer-events-auto hover:bg-forest hover:text-cream transition-all translate-x-2"
                                        >
                                            <ChevronRight size={24} />
                                        </button>
                                    </div>

                                    {/* Discrete Pagination Dots */}
                                    <div className="flex justify-center gap-2 mt-4">
                                        {activeCategory?.products.map((_, idx) => (
                                            <div 
                                                key={idx}
                                                className="h-1 rounded-full bg-forest/20 w-8"
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Focused Product Modal */}
                            <AnimatePresence>
                                {focusedProductId && (
                                    <motion.div 
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="fixed inset-0 z-[120] flex items-center justify-center p-0 md:p-6 lg:p-12 bg-forest/60 backdrop-blur-lg overflow-hidden h-[100dvh]"
                                    >
                                        {/* Clickable Backdrop inside */}
                                        <div 
                                            className="fixed inset-0 -z-10 cursor-pointer h-[100dvh]" 
                                            onClick={() => setFocusedProductId(null)} 
                                        />
                                        
                                        <div className="relative w-full h-[100dvh] md:h-auto max-w-6xl z-10 flex items-center justify-center">
                                            <ProductCard 
                                                product={activeCategory?.products.find(p => p.id === focusedProductId)} 
                                                i={0} 
                                                isFocused={true}
                                                isSubdued={false}
                                                onFocus={setFocusedProductId}
                                                onPrevProduct={handlePrevProduct}
                                                onNextProduct={handleNextProduct}
                                            />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    )}
                </AnimatePresence>
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
        <section ref={containerRef} id="contacto" data-background="dark" className="pt-24 pb-20 px-4 landscape:py-16 md:portrait:py-24 lg:py-32 xl:py-36 bg-forest relative overflow-hidden">
             {/* Large Script Background */}
             <motion.div 
                style={{ x: xTrack, y: yTrack, opacity: opacityTrack, fontFamily: "'Cormorant Garamond', serif" }}
                className="absolute inset-0 pointer-events-none text-cream text-[35vw] leading-none italic font-light whitespace-nowrap text-center flex items-center justify-center select-none z-0"
             >
                 M★Bravo
             </motion.div>

             <div className="w-full max-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-serif text-cream mb-14 md:mb-16 leading-tight">{t('contact.title_1')} <br /><span className="italic">{t('contact.title_2')}</span></h2>
                    <p className="text-cream/50 text-xl font-light mb-20 md:mb-24 leading-relaxed">
                        {t('contact.subtitle')}
                    </p>
                    
                    <div className="flex flex-col items-center gap-6 sm:gap-10 md:gap-12">
                        <a 
                            href={MAILTO_LINK}
                            className="group flex items-center gap-3 md:gap-4 text-[15px] max-[350px]:text-[13px] xs:text-xl sm:text-2xl md:text-4xl font-serif text-cream hover:text-brand-green-light transition-all border-b border-cream/20 pb-3 md:pb-4 break-all sm:break-normal"
                        >
                            <Mail size={20} className="sm:w-6 sm:h-6 md:w-8 md:h-8 opacity-40 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                            {CONTACT_EMAIL}
                        </a>

                        <a 
                            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappMessage)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-center gap-3 md:gap-4 text-[15px] max-[350px]:text-[11px] xs:text-xl sm:text-2xl md:text-4xl font-serif text-cream hover:text-brand-green-light transition-all border-b border-cream/20 pb-3 md:pb-4 break-all sm:break-normal"
                        >
                            <MessageCircle size={20} className="sm:w-6 sm:h-6 md:w-8 md:h-8 opacity-40 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                            {t('contact.chat_whatsapp')}
                        </a>
                    </div>
                </motion.div>

                <div className="mt-20 sm:mt-32 md:mt-48 flex flex-wrap justify-center gap-6 sm:gap-14 md:gap-16 lg:gap-20">
                    <a href="https://www.instagram.com/mbravo.handmade/" target="_blank" rel="noopener noreferrer" className="text-[10px] uppercase tracking-[0.4em] text-cream/40 hover:text-cream transition-colors">
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

interface LegalModalProps {
    type: 'envios' | 'privacidade' | 'termos';
    onClose: () => void;
}

const LegalModal = ({ type, onClose }: LegalModalProps) => {
    const { lang } = useLanguage();
    
    useEffect(() => {
        // Prevent body scroll when modal is open
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = '';
        };
    }, []);

    const ptContent = {
        envios: {
            title: "Política de Envios e Devoluções",
            body: (
                <div className="space-y-8 text-forest">
                    <div>
                        <h3 className="text-xs uppercase tracking-[0.3em] font-semibold text-[#C5A059] mb-4 font-sans">
                            Envios e Prazos de Entrega
                        </h3>
                        <p className="font-serif italic text-base text-forest/95 mb-6 leading-relaxed">
                            Na M★BRAVO, cada peça é meticulosamente desenvolvida à mão, respeitando o tempo do artesanato de luxo.
                        </p>
                        <ul className="space-y-4 text-forest/75 text-sm font-sans font-light">
                            <li className="flex flex-col gap-1">
                                <strong className="font-medium text-forest text-xs uppercase tracking-wider">Prazo de Produção</strong>
                                <span>O tempo estimado para a confeção e preparação de cada peça varia entre 4 a 7 dias úteis após a confirmação do pagamento.</span>
                            </li>
                            <li className="flex flex-col gap-1">
                                <strong className="font-medium text-forest text-xs uppercase tracking-wider">Método de Envio</strong>
                                <span>Todos os envios são realizados através de transportadora registada. Assim que a sua encomenda for expedida, receberá um e-mail com o respetivo código de rastreamento (tracking number) para acompanhar a entrega.</span>
                            </li>
                            <li className="flex flex-col gap-1">
                                <strong className="font-medium text-forest text-xs uppercase tracking-wider">Custos de Envio</strong>
                                <span>Os custos de transporte são calculados de forma automática no momento do checkout, variando consoante o destino e a distância da entrega.</span>
                            </li>
                        </ul>
                    </div>

                    <div className="pt-6 border-t border-forest/10">
                        <h3 className="text-xs uppercase tracking-[0.3em] font-semibold text-[#C5A059] mb-4 font-sans">
                            Política de Devoluções
                        </h3>
                        <p className="text-forest/75 text-sm font-sans font-light leading-relaxed mb-4">
                            Por se tratarem de artigos de design autoral, confecionados artesanalmente sob encomenda, a M★BRAVO apenas aceita devoluções ou trocas em caso de defeito de fabrico comprovado.
                        </p>
                        <p className="text-forest/75 text-sm font-sans font-light leading-relaxed mb-4">
                            Se detetar algum defeito na sua peça, deverá contactar-nos no prazo máximo de 14 dias após a receção, através do e-mail <a href={`mailto:${CONTACT_EMAIL}`} className="underline hover:text-forest transition-colors font-medium font-mono">{CONTACT_EMAIL}</a>, enviando fotografias detalhadas do problema.
                        </p>
                        <p className="text-forest/75 text-sm font-sans font-light leading-relaxed">
                            Após a validação da nossa equipa, procederemos à recolha do artigo e ao respetivo reembolso ou substituição da peça, sem qualquer custo adicional para o cliente.
                        </p>
                    </div>
                </div>
            )
        },
        privacidade: {
            title: "Política de Privacidade",
            body: (
                <div className="space-y-8 text-forest">
                    <p className="font-serif italic text-base text-forest/95 leading-relaxed">
                        A M★BRAVO está empenhada em proteger a privacidade e os dados pessoais dos seus clientes. Em conformidade com o Regulamento Geral sobre a Proteção de Dados (RGPD), informamos:
                    </p>
                    <ul className="space-y-6 text-forest/75 text-sm font-sans font-light">
                        <li className="flex flex-col gap-1.5">
                            <strong className="font-medium text-forest text-xs uppercase tracking-wider">Recolha de Dados</strong>
                            <span>Os dados recolhidos no nosso website (nome, e-mail, telefone, morada de envio e dados de faturação) destinam-se única e exclusivamente ao processamento das suas encomendas, comunicação sobre o estado do envio e suporte ao cliente.</span>
                        </li>
                        <li className="flex flex-col gap-1.5">
                            <strong className="font-medium text-forest text-xs uppercase tracking-wider">Segurança e Terceiros</strong>
                            <span>Os seus dados de pagamento são processados de forma encriptada e segura através de plataformas parceiras certificadas (como Stripe). A M★BRAVO não armazena os seus dados bancários ou de cartões de crédito. Os seus dados de morada serão partilhados estritamente com a empresa transportadora para efeitos de entrega.</span>
                        </li>
                        <li className="flex flex-col gap-1.5">
                            <strong className="font-medium text-forest text-xs uppercase tracking-wider">Direitos do Utilizador</strong>
                            <span>O cliente tem o direito de aceder, retificar ou solicitar a eliminação definitiva dos seus dados pessoais a qualquer momento. Para exercer estes direitos, basta enviar um pedido para <a href={`mailto:${CONTACT_EMAIL}`} className="underline hover:text-forest transition-colors font-medium font-mono">{CONTACT_EMAIL}</a>.</span>
                        </li>
                    </ul>
                </div>
            )
        },
        termos: {
            title: "Termos e Condições de Serviço",
            body: (
                <div className="space-y-8 text-forest">
                    <p className="font-serif italic text-base text-forest/95 leading-relaxed">
                        Ao navegar e efetuar compras no website M★BRAVO, o utilizador aceita cumprir os seguintes termos:
                    </p>
                    <ul className="space-y-6 text-forest/75 text-sm font-sans font-light">
                        <li className="flex flex-col gap-1.5">
                            <strong className="font-medium text-forest text-xs uppercase tracking-wider">Propriedade Intelectual</strong>
                            <span>Todos os designs, imagens, fotografias de catálogo, logótipos e textos presentes neste website são propriedade exclusiva da M★BRAVO, sendo estritamente proibida a sua reprodução ou utilização sem autorização prévia.</span>
                        </li>
                        <li className="flex flex-col gap-1.5">
                            <strong className="font-medium text-forest text-xs uppercase tracking-wider">Produtos e Preços</strong>
                            <span>Sendo peças feitas à mão, podem ocorrer variações mínimas de textura ou tonalidade em comparação com as fotos apresentadas, o que confere exclusividade a cada artigo. Os preços estão indicados em Euros (€) e a M★BRAVO reserva-se o direito de os alterar sem aviso prévio, garantindo-se sempre a aplicação do preço indicado no momento da compra.</span>
                        </li>
                        <li className="flex flex-col gap-1.5">
                            <strong className="font-medium text-forest text-xs uppercase tracking-wider">Suporte e Resolução de Litígios</strong>
                            <span>Para qualquer dúvida, reclamação ou assistência, o cliente dispõe dos seguintes canais oficiais:</span>
                            <div className="mt-2 pl-4 border-l border-forest/10 space-y-1 text-xs">
                                <div><strong className="font-medium">E-mail:</strong> <a href={`mailto:${CONTACT_EMAIL}`} className="underline hover:text-forest transition-colors font-mono">{CONTACT_EMAIL}</a></div>
                                <div><strong className="font-medium">Telefone/WhatsApp:</strong> <a href="tel:+351912828182" className="underline hover:text-forest transition-colors font-mono">+351 912 828 182</a> <span className="text-forest/50 font-light italic">(Chamada para a rede móvel nacional)</span></div>
                            </div>
                        </li>
                    </ul>
                </div>
            )
        }
    };

    const enContent = {
        envios: {
            title: "Shipping & Returns Policy",
            body: (
                <div className="space-y-8 text-forest">
                    <div>
                        <h3 className="text-xs uppercase tracking-[0.3em] font-semibold text-[#C5A059] mb-4 font-sans">
                            Shipping and Delivery Times
                        </h3>
                        <p className="font-serif italic text-base text-forest/95 mb-6 leading-relaxed">
                            At M★BRAVO, each piece is meticulously handcrafted, respecting the pace of luxury craftsmanship.
                        </p>
                        <ul className="space-y-4 text-forest/75 text-sm font-sans font-light">
                            <li className="flex flex-col gap-1">
                                <strong className="font-medium text-forest text-xs uppercase tracking-wider">Production Time</strong>
                                <span>The estimated time for crafting and preparing each piece varies between 4 to 7 business days after payment confirmation.</span>
                            </li>
                            <li className="flex flex-col gap-1">
                                <strong className="font-medium text-forest text-xs uppercase tracking-wider">Shipping Method</strong>
                                <span>All shipments are carried out via registered courier. Once your order is dispatched, you will receive an email with the tracking number to monitor your delivery.</span>
                            </li>
                            <li className="flex flex-col gap-1">
                                <strong className="font-medium text-forest text-xs uppercase tracking-wider">Shipping Costs</strong>
                                <span>Shipping costs are automatically calculated at checkout, varying based on the destination and delivery distance.</span>
                            </li>
                        </ul>
                    </div>

                    <div className="pt-6 border-t border-forest/10">
                        <h3 className="text-xs uppercase tracking-[0.3em] font-semibold text-[#C5A059] mb-4 font-sans">
                            Returns Policy
                        </h3>
                        <p className="text-forest/75 text-sm font-sans font-light leading-relaxed mb-4">
                            Because these are signature pieces custom made-to-order, M★BRAVO only accepts returns or exchanges in the event of a proven manufacturing defect.
                        </p>
                        <p className="text-forest/75 text-sm font-sans font-light leading-relaxed mb-4">
                            If you detect any defect in your piece, you must contact us within a maximum of 14 days of receipt at <a href={`mailto:${CONTACT_EMAIL}`} className="underline hover:text-forest transition-colors font-medium font-mono">{CONTACT_EMAIL}</a>, sending detailed photographs of the issue.
                        </p>
                        <p className="text-forest/75 text-sm font-sans font-light leading-relaxed">
                            After validation by our team, we will collect the item and proceed with the refund or replacement of the piece at no additional cost to the client.
                        </p>
                    </div>
                </div>
            )
        },
        privacidade: {
            title: "Privacy Policy",
            body: (
                <div className="space-y-8 text-forest">
                    <p className="font-serif italic text-base text-forest/95 leading-relaxed">
                        M★BRAVO is committed to protecting the privacy and personal data of its clients. In accordance with the General Data Protection Regulation (GDPR), we inform:
                    </p>
                    <ul className="space-y-6 text-forest/75 text-sm font-sans font-light">
                        <li className="flex flex-col gap-1.5">
                            <strong className="font-medium text-forest text-xs uppercase tracking-wider">Data Collection</strong>
                            <span>The data collected on our website (name, email, telephone, shipping address, and billing data) is used solely and exclusively to process your orders, communicate about shipment status, and provide customer support.</span>
                        </li>
                        <li className="flex flex-col gap-1.5">
                            <strong className="font-medium text-forest text-xs uppercase tracking-wider">Security and Third Parties</strong>
                            <span>Your payment data is processed securely and encrypted through certified partner platforms (such as Stripe). M★BRAVO does not store your banking or credit card details. Your address details will be shared strictly with the shipping carrier for delivery purposes.</span>
                        </li>
                        <li className="flex flex-col gap-1.5">
                            <strong className="font-medium text-forest text-xs uppercase tracking-wider">User Rights</strong>
                            <span>Clients have the right to access, rectify, or request the permanent deletion of their personal data at any time. To exercise these rights, simply send a request to <a href={`mailto:${CONTACT_EMAIL}`} className="underline hover:text-forest transition-colors font-medium font-mono">{CONTACT_EMAIL}</a>.</span>
                        </li>
                    </ul>
                </div>
            )
        },
        termos: {
            title: "Terms and Conditions of Service",
            body: (
                <div className="space-y-8 text-forest">
                    <p className="font-serif italic text-base text-forest/95 leading-relaxed">
                        By browsing and purchasing on the M★BRAVO website, the user agrees to comply with the following terms:
                    </p>
                    <ul className="space-y-6 text-forest/75 text-sm font-sans font-light">
                        <li className="flex flex-col gap-1.5">
                            <strong className="font-medium text-forest text-xs uppercase tracking-wider">Intellectual Property</strong>
                            <span>All designs, images, catalog photographs, logos, and text present on this website are the exclusive property of M★BRAVO, and their reproduction or use without prior authorization is strictly prohibited.</span>
                        </li>
                        <li className="flex flex-col gap-1.5">
                            <strong className="font-medium text-forest text-xs uppercase tracking-wider">Products and Prices</strong>
                            <span>Being handmade pieces, minimal variations in texture or tone may occur compared to the photos shown, which guarantees the exclusivity of each item. Prices are shown in Euros (€) and M★BRAVO reserves the right to change them without prior notice, always guaranteeing the application of the price indicated at the time of purchase.</span>
                        </li>
                        <li className="flex flex-col gap-1.5">
                            <strong className="font-medium text-forest text-xs uppercase tracking-wider">Support and Dispute Resolution</strong>
                            <span>For any questions, claims, or assistance, the customer has the following official channels:</span>
                            <div className="mt-2 pl-4 border-l border-forest/10 space-y-1 text-xs">
                                <div><strong className="font-medium">E-mail:</strong> <a href={`mailto:${CONTACT_EMAIL}`} className="underline hover:text-forest transition-colors font-mono">{CONTACT_EMAIL}</a></div>
                                <div><strong className="font-medium">Phone/WhatsApp:</strong> <a href="tel:+351912828182" className="underline hover:text-forest transition-colors font-mono">+351 912 828 182</a> <span className="text-forest/50 font-light italic">(Call to national mobile network)</span></div>
                            </div>
                        </li>
                    </ul>
                </div>
            )
        }
    };

    const content = lang === 'pt' ? ptContent : enContent;
    const current = content[type];

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-forest/40 backdrop-blur-md z-[9999] flex items-center justify-center p-4 md:p-6"
            onClick={onClose}
        >
            <motion.div 
                initial={{ opacity: 0, y: 30, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 30, scale: 0.98 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="max-w-2xl w-full bg-[#FCFBF9] text-forest rounded-[2rem] overflow-hidden shadow-[0_24px_50px_rgba(31,42,24,0.15)] flex flex-col max-h-[85vh] border border-forest/10"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-6 md:px-8 py-5 border-b border-forest/10 flex justify-between items-center bg-[#FCFBF9]">
                    <h2 className="text-sm md:text-base font-serif uppercase tracking-[0.2em] font-medium text-forest">
                        {current.title}
                    </h2>
                    <button 
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-forest/5 hover:bg-forest/10 flex items-center justify-center transition-colors text-forest/70 hover:text-forest cursor-pointer"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 md:px-10 py-6 md:py-8 overflow-y-auto scrollbar-thin scrollbar-thumb-forest/10">
                    {current.body}
                </div>

                {/* Footer */}
                <div className="px-6 md:px-8 py-4 border-t border-forest/5 bg-forest/[0.02] flex justify-between items-center text-[10px] text-forest/40">
                    <span className="font-mono">M★BRAVO ATELIER</span>
                    <button 
                        onClick={onClose}
                        className="uppercase tracking-[0.15em] font-medium text-forest/65 hover:text-forest transition-colors cursor-pointer"
                    >
                        {lang === 'pt' ? 'Fechar' : 'Close'}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

const Footer = ({ onOpenLegal }: { onOpenLegal: (type: 'envios' | 'privacidade' | 'termos') => void }) => {
    const { t } = useLanguage();
    return (
        <footer className="bg-forest text-cream py-12 px-4 border-t border-cream/5">
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-16">
                <div className="flex flex-col items-center md:items-start gap-4">
                    <Logo light className="opacity-50 h-28 md:h-48" />
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
                
                <div className="flex flex-col sm:flex-row gap-6 sm:gap-12 text-[10px] uppercase tracking-[0.2em] font-medium text-cream/30 text-center sm:text-left">
                    <button onClick={() => onOpenLegal('envios')} className="hover:text-cream transition-colors cursor-pointer text-left uppercase tracking-[0.2em]">{t('footer.legal_shipping')}</button>
                    <button onClick={() => onOpenLegal('privacidade')} className="hover:text-cream transition-colors cursor-pointer text-left uppercase tracking-[0.2em]">{t('footer.legal_privacy')}</button>
                    <button onClick={() => onOpenLegal('termos')} className="hover:text-cream transition-colors cursor-pointer text-left uppercase tracking-[0.2em]">{t('footer.legal_terms')}</button>
                </div>

                <div className="text-[9px] uppercase tracking-[0.2em] text-cream/45 text-center md:text-right flex flex-col gap-1 md:items-end">
                    <div className="text-cream/30 text-[8px] tracking-[0.3em] uppercase mb-1">{t('footer.support')}</div>
                    <a href={MAILTO_LINK} className="hover:text-cream transition-colors font-mono">{CONTACT_EMAIL}</a>
                    <a href="tel:+351912828182" className="hover:text-cream transition-colors font-mono">+351 912 828 182</a>
                    <div className="text-cream/20 mt-2 whitespace-pre-line">
                        {t('footer.made_in')}
                    </div>
                </div>
            </div>
        </footer>
    );
};

const MemoryContinuesSection = () => {
    const { t } = useLanguage();
    return (
        <section id="memoria" data-background="light" className="pt-24 pb-20 px-4 landscape:py-16 md:portrait:py-24 lg:py-32 xl:py-36 bg-[#FCFBF9] relative overflow-hidden select-none border-b border-forest/5">
            <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                    className="space-y-10 sm:space-y-16 md:space-y-24"
                >
                    {/* Section label */}
                    <div className="space-y-6">
                        <span className="text-[10px] uppercase tracking-[0.45em] font-semibold text-forest/35 block font-sans">
                            {t('memory.tag')}
                        </span>
                        <div className="h-[1px] w-12 bg-forest/10 mx-auto" />
                    </div>

                    {/* Main text and body with elegant layout */}
                    <div className="space-y-10 lg:space-y-14">
                        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif text-forest tracking-tight leading-tight font-light col-span-2">
                            {t('memory.title')}
                        </h2>
                        
                        <p className="text-forest/70 font-serif italic text-lg sm:text-xl md:text-2xl leading-relaxed max-w-2xl mx-auto font-light">
                            {t('memory.subtitle')}
                        </p>
                    </div>

                    <div className="space-y-8 max-w-xl mx-auto">
                        <p className="text-[#C5A059] font-serif italic text-xl md:text-2xl font-normal tracking-wide">
                            {t('memory.mbravo_born')}
                        </p>
                        
                        <p className="text-forest/65 text-sm sm:text-base md:text-lg leading-relaxed font-sans font-light">
                            {t('memory.desc')}
                        </p>
                    </div>

                    <div className="pt-12 md:pt-16 border-t border-forest/10 max-w-md mx-auto">
                        <p className="text-forest font-serif italic text-lg md:text-xl font-light leading-relaxed text-forest/80">
                            {t('memory.quote')}
                        </p>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

// --- Main App ---

export default function App() {
  const [loading, setLoading] = useState(true);
  const [activeLegal, setActiveLegal] = useState<'envios' | 'privacidade' | 'termos' | null>(null);
  const { t } = useLanguage();

  // Smooth scroll logic for standard browser behavior
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="relative min-h-screen bg-cream text-forest select-none overflow-x-hidden">
      
      <AnimatePresence mode="wait">
        {loading ? (
          <LoadingScreen key="loading" onComplete={() => setLoading(false)} />
        ) : (
          <motion.main
            key="main"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
            className="flex flex-col"
          >
            <Navbar />
            
            {/* Smooth Parallax Scroll Content */}
            <div className="relative">
                <Hero />
                
                {/* Scroll-linked Organic Fio Condutor (Golden Embroidery thread crossing sections) */}
                <FioCondutor />
 
                <div className="relative overflow-hidden">
                    <StorySection />
                    <MadeWithTimeSection />
                    <KnotSection />
                </div>
                <CollectionSection />
                
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
                            className="w-full h-full object-cover brightness-[0.4] grayscale-[0.5]"
                        />
                    </motion.div>
                    <div className="relative z-10 text-center px-6 max-w-4xl mx-auto flex flex-col items-center gap-6 md:gap-8">
                        <h2 className="text-cream font-serif italic text-3xl sm:text-5xl md:text-6xl lg:text-7xl leading-tight">
                            {t('interlude.quote')}
                        </h2>
                        <span className="text-[#C5A059]/80 font-serif italic text-lg md:text-2xl tracking-wide font-light select-none block max-w-xl mx-auto">
                            {t('interlude.sub')}
                        </span>
                    </div>
                </div>

                <MemoryContinuesSection />

                <ContactSection />
            </div>
            
            <Footer onOpenLegal={(type) => setActiveLegal(type)} />

            <AnimatePresence>
                {activeLegal && (
                    <LegalModal type={activeLegal} onClose={() => setActiveLegal(null)} />
                )}
            </AnimatePresence>
          </motion.main>
        )}
      </AnimatePresence>
    </div>
  );
}
