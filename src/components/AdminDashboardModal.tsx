import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Search, Lock, Unlock, User, Mail, Phone, MapPin, 
  CreditCard, Clock, Truck, FileText, CheckCircle, AlertCircle, 
  ExternalLink, Eye, RefreshCw, Sliders, Calendar, DollarSign, 
  Package, ChevronRight, AlertTriangle, ShieldCheck, Plus,
  Download, ClipboardList, Trash, Trash2, Ban, Edit, Save, Check, EyeOff, Layers, Settings,
  BarChart3, Percent, TrendingUp, ArrowUpRight, Instagram,
  Tag, Scissors, Disc, Box
} from 'lucide-react';
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// Strict email validation checking standard format
function isValidEmail(email: string): boolean {
  if (!email) return false;
  const trimmed = email.trim();
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(trimmed);
}

// Portuguese Postal Code Auto-Masking (XXXX-XXX)
function formatPostalCodePT(val: string): string {
  if (!val) return '';
  const digits = val.replace(/\D/g, '').slice(0, 7);
  if (digits.length <= 4) return digits;
  return `${digits.slice(0, 4)}-${digits.slice(4)}`;
}

// Phone spacing mask for human readability (+351 917 827 458)
function formatPhoneReadable(phone?: string): string {
  if (!phone) return '';
  const trimmed = phone.trim();
  if (!trimmed) return '';

  const hasPlus = trimmed.startsWith('+');
  const digits = trimmed.replace(/\D/g, '');
  if (!digits) return trimmed;

  if (digits.startsWith('351') && digits.length === 12) {
    return `+351 ${digits.slice(3, 6)} ${digits.slice(6, 9)} ${digits.slice(9)}`;
  } else if (digits.length === 9) {
    return `+351 ${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
  } else if (digits.startsWith('351') && digits.length > 9) {
    const rest = digits.slice(3);
    if (rest.length === 9) {
      return `+351 ${rest.slice(0, 3)} ${rest.slice(3, 6)} ${rest.slice(6)}`;
    }
    return `+351 ${rest}`;
  } else if (hasPlus) {
    if (digits.length <= 10) {
      return `+${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
    }
    return `+${digits}`;
  } else if (digits.length === 10) {
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
  }

  return trimmed;
}

// Map of exact yarn swatch colors from Encomenda #18241 (Armazém das Manualidades PDF)
const YARN_COLOR_MAP: Record<string, { bg: string; border?: string }> = {
  // DROPS Safran
  'rm_safran_18_natural': { bg: '#F5EBE0', border: '#D8C3A5' },
  'rm_safran_17_branco': { bg: '#FAF8F5', border: '#E2DDD5' },
  'rm_safran_68_cafe': { bg: '#5C3A21' },
  'rm_safran_01_rosa_deserto': { bg: '#F4B3BA', border: '#E39DA5' },
  'rm_safran_78_verde_floresta': { bg: '#416335' },
  'rm_safran_60_verde_musgo': { bg: '#7B7E50' },
  'rm_safran_73_azul_cobalto': { bg: '#1152B3' },
  'rm_safran_50_menta': { bg: '#B0C8BF', border: '#92B0A6' },
  'rm_safran_19_vermelho': { bg: '#E22634' },
  'rm_safran_76_azul_po': { bg: '#B8D8EB', border: '#9DC1D8' },

  // DROPS Paris
  'rm_paris_16_branco': { bg: '#FFFFFF', border: '#DCD6CD' },
  'rm_paris_17_natural': { bg: '#F3EBE1', border: '#DDD2C3' },
  'rm_paris_43_verde': { bg: '#536D43' },
  'rm_paris_25_verde_musgo': { bg: '#828453' },
  'rm_paris_48_petroleo': { bg: '#496E8E' },
  'rm_paris_76_azul_ternura': { bg: '#B0D0E4', border: '#92B7CF' },
  'rm_paris_57_rosa_clarissimo': { bg: '#F8C3CD', border: '#E7AAB6' },
  'rm_paris_35_baunilha': { bg: '#F8C53A', border: '#D9AA2B' },
  'rm_paris_19_amarelo_claro': { bg: '#F3E2B8', border: '#DBC796' },
  'rm_paris_44_castanho': { bg: '#542C13' },
  'rm_paris_12_vermelho': { bg: '#DE1A27' },
  'rm_paris_15_preto': { bg: '#1C1C1C' },

  // Accessories & Packaging
  'rm_fecho_correr': { bg: '#C5A059' },
  'rm_botao_madeira': { bg: '#B38053' },
  'rm_forro_tecido': { bg: '#EAE4D9', border: '#D0C8B8' },
  'rm_caixa_embalamento': { bg: '#D4C5B0', border: '#BDB09B' },
  'rm_etiqueta_couro': { bg: '#946342' }
};

function getYarnSwatchColor(id?: string, name?: string) {
  if (id && YARN_COLOR_MAP[id]) {
    return YARN_COLOR_MAP[id];
  }
  const norm = `${id || ''} ${name || ''}`.toLowerCase();
  if (norm.includes('18') || (norm.includes('natural') && !norm.includes('paris'))) return { bg: '#F5EBE0', border: '#D8C3A5' };
  if (norm.includes('17') && norm.includes('paris')) return { bg: '#F3EBE1', border: '#DDD2C3' };
  if (norm.includes('17') || norm.includes('safran branco')) return { bg: '#FAF8F5', border: '#E2DDD5' };
  if (norm.includes('16') || norm.includes('paris branco') || (norm.includes('branco') && !norm.includes('safran'))) return { bg: '#FFFFFF', border: '#DCD6CD' };
  if (norm.includes('68') || norm.includes('café') || norm.includes('cafe')) return { bg: '#5C3A21' };
  if (norm.includes('01') || norm.includes('deserto')) return { bg: '#F4B3BA', border: '#E39DA5' };
  if (norm.includes('78') || norm.includes('floresta')) return { bg: '#416335' };
  if (norm.includes('60') || norm.includes('safran verde musgo')) return { bg: '#7B7E50' };
  if (norm.includes('73') || norm.includes('cobalto')) return { bg: '#1152B3' };
  if (norm.includes('50') || norm.includes('menta')) return { bg: '#B0C8BF', border: '#92B0A6' };
  if (norm.includes('43') || norm.includes('paris verde')) return { bg: '#536D43' };
  if (norm.includes('25') || norm.includes('musgo')) return { bg: '#828453' };
  if (norm.includes('48') || norm.includes('petróleo') || norm.includes('petroleo')) return { bg: '#496E8E' };
  if (norm.includes('azul pó') || norm.includes('azul po') || norm.includes('safran 76')) return { bg: '#B8D8EB', border: '#9DC1D8' };
  if (norm.includes('76') || norm.includes('ternura')) return { bg: '#B0D0E4', border: '#92B7CF' };
  if (norm.includes('57') || norm.includes('claríssimo') || norm.includes('clarissimo')) return { bg: '#F8C3CD', border: '#E7AAB6' };
  if (norm.includes('35') || norm.includes('baunilha')) return { bg: '#F8C53A', border: '#D9AA2B' };
  if (norm.includes('19') && (norm.includes('amarelo') || norm.includes('paris'))) return { bg: '#F3E2B8', border: '#DBC796' };
  if (norm.includes('19') && (norm.includes('vermelho') || norm.includes('safran'))) return { bg: '#E22634' };
  if (norm.includes('44') || norm.includes('castanho')) return { bg: '#542C13' };
  if (norm.includes('12') || norm.includes('vermelho')) return { bg: '#DE1A27' };
  if (norm.includes('15') || norm.includes('preto')) return { bg: '#1C1C1C' };
  
  return { bg: '#C5A059' };
}

function isAccessoryItem(id?: string, name?: string): boolean {
  const norm = `${id || ''} ${name || ''}`.toLowerCase();
  if (norm.includes('safran') || norm.includes('paris')) return false;
  return (
    id === 'rm_fecho_correr' || id === 'rm_botao_madeira' ||
    id === 'rm_forro_tecido' || id === 'rm_caixa_embalamento' || id === 'rm_etiqueta_couro' ||
    norm.includes('fecho') || norm.includes('zipper') ||
    norm.includes('botão') || norm.includes('botao') ||
    norm.includes('forro') || norm.includes('tecido') ||
    norm.includes('caixa') || norm.includes('embalagem') || norm.includes('embalamento') ||
    norm.includes('etiqueta') || norm.includes('couro')
  );
}

function getAccessoryIconConfig(id?: string, name?: string) {
  const norm = `${id || ''} ${name || ''}`.toLowerCase();
  if (norm.includes('etiqueta') || norm.includes('couro') || id === 'rm_etiqueta_couro') {
    return {
      icon: Tag,
      bg: 'bg-[#946342]/15',
      border: 'border-[#946342]/35',
      text: 'text-[#946342]'
    };
  }
  if (norm.includes('caixa') || norm.includes('embalag') || id === 'rm_caixa_embalamento') {
    return {
      icon: Package,
      bg: 'bg-[#D4C5B0]/30',
      border: 'border-[#BDB09B]/50',
      text: 'text-[#7A6E5D]'
    };
  }
  if (norm.includes('fecho') || norm.includes('zipper') || id === 'rm_fecho_correr') {
    return {
      icon: Scissors,
      bg: 'bg-[#C5A059]/20',
      border: 'border-[#C5A059]/40',
      text: 'text-[#243119]'
    };
  }
  if (norm.includes('botão') || norm.includes('botao') || norm.includes('madeira') || id === 'rm_botao_madeira') {
    return {
      icon: Disc,
      bg: 'bg-[#B38053]/20',
      border: 'border-[#B38053]/40',
      text: 'text-[#8B5A2B]'
    };
  }
  if (norm.includes('forro') || norm.includes('tecido') || id === 'rm_forro_tecido') {
    return {
      icon: Layers,
      bg: 'bg-[#EAE4D9]',
      border: 'border-[#D0C8B8]',
      text: 'text-[#635848]'
    };
  }
  return {
    icon: Box,
    bg: 'bg-forest/10',
    border: 'border-forest/20',
    text: 'text-forest/70'
  };
}

function YarnSwatch({ id, name, size = 'w-7 h-7' }: { id?: string; name?: string; size?: string }) {
  const norm = `${id || ''} ${name || ''}`.toLowerCase();
  const isButton = id === 'rm_botao_madeira' || norm.includes('botão de madeira') || norm.includes('botao de madeira') || (norm.includes('botão') && norm.includes('madeira')) || (norm.includes('botao') && norm.includes('madeira'));

  const radiusClass = size.includes('rounded-') ? '' : 'rounded-lg';

  if (isButton) {
    return (
      <span
        className={`${size} ${radiusClass} shrink-0 inline-flex items-center justify-center align-middle shadow-2xs border border-[#C5A059]/30 bg-[#FAF7F2] p-0.5 overflow-hidden`}
        title={name || 'Botão de Madeira M★BRAVO'}
      >
        <img
          src="https://i.ibb.co/gL2FL6LW/Botao-M-BRAVO-3.png"
          alt={name || 'Botão de Madeira M★BRAVO'}
          className="w-full h-full object-contain rounded-md"
          referrerPolicy="no-referrer"
        />
      </span>
    );
  }

  if (isAccessoryItem(id, name)) {
    const config = getAccessoryIconConfig(id, name);
    const IconComp = config.icon;
    return (
      <span
        className={`${size} ${radiusClass} shrink-0 inline-flex items-center justify-center align-middle shadow-2xs border ${config.bg} ${config.border} ${config.text}`}
        title={name || id}
      >
        <IconComp className="w-[55%] h-[55%]" />
      </span>
    );
  }

  const swatch = getYarnSwatchColor(id, name);
  return (
    <span
      className={`${size} ${radiusClass} shrink-0 inline-block align-middle shadow-2xs relative overflow-hidden border`}
      style={{
        backgroundColor: swatch.bg,
        borderColor: swatch.border || 'rgba(0,0,0,0.12)',
        backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(0,0,0,0.04) 100%)'
      }}
      title={name || id}
    >
      <span className="absolute inset-0 opacity-5 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:3px_3px] pointer-events-none" />
    </span>
  );
}

interface AdminDashboardModalProps {
  onClose: () => void;
  shopCategories?: any[];
}

export default function AdminDashboardModal({ onClose, shopCategories = [] }: AdminDashboardModalProps) {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Dashboard states
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending_payment' | 'paid' | 'shipped' | 'delivered' | 'failed'>('all');
  
  // Action states
  const [trackingInputs, setTrackingInputs] = useState<{ [orderId: string]: string }>({});
  const [actionLoading, setActionLoading] = useState<{ [orderId: string]: boolean }>({});
  const [actionSuccess, setActionSuccess] = useState<{ [orderId: string]: string }>({});

  // Manual Order states
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualForm, setManualForm] = useState({
    selectedProductId: '',
    productName: '',
    price: '',
    corType: 'single' as 'single' | 'bicolor' | 'fixed',
    cor: '',
    corPrincipal: '',
    corDetalhe: '',
    tamanho: '',
    quantidade: '1',
    customerNome: '',
    customerEmail: '',
    customerTelefone: '',
    customerMorada: '',
    customerCodigoPostal: '',
    customerCidade: '',
    customerNif: '',
    paymentMethod: 'card',
    status: 'paid',
    priority: 'NORMAL',
    accessories: {
      fecho: false,
      fechoQty: 1,
      forro: false,
      forroMeters: 0.25,
      etiqueta: true,
      etiquetaQty: 1,
      caixa: true,
      caixaQty: 1,
      sacoEnvelope: true,
      sacoEnvelopeQty: 1,
      botao: false,
      botaoQty: 1
    }
  });
  const [isCreatingManual, setIsCreatingManual] = useState(false);

  // Audit Logs states
  const [activeTab, setActiveTab] = useState<'orders' | 'logs' | 'catalog' | 'inventory' | 'analytics'>('analytics');
  const [logs, setLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [logsError, setLogsError] = useState<string | null>(null);
  const [logSearchQuery, setLogSearchQuery] = useState('');

  // CMS Catalog states
  const [catalog, setCatalog] = useState<any[]>([]);
  const [loadingCatalog, setLoadingCatalog] = useState(false);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('home');
  const [isSavingCatalog, setIsSavingCatalog] = useState(false);
  const [saveNotification, setSaveNotification] = useState<string | null>(null);

  const triggerNotification = (msg: string) => {
    setSaveNotification(msg);
    setTimeout(() => {
      setSaveNotification(null);
    }, 4500);
  };

  // CMS Physical Inventory states
  const [inventory, setInventory] = useState<any[]>([]);
  const [loadingInventory, setLoadingInventory] = useState(false);
  const [inventoryError, setInventoryError] = useState<string | null>(null);
  const [isSavingInventory, setIsSavingInventory] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<any | null>(null);
  const [inventorySubTab, setInventorySubTab] = useState<'safran' | 'paris' | 'accessories' | 'all'>('safran');

  // CRM states
  const [selectedCustomerEmail, setSelectedCustomerEmail] = useState<string | null>(null);
  const [customerProfile, setCustomerProfile] = useState<any | null>(null);
  const [loadingCustomerProfile, setLoadingCustomerProfile] = useState(false);
  const [customerProfileError, setCustomerProfileError] = useState<string | null>(null);
  const [isSavingCustomerProfile, setIsSavingCustomerProfile] = useState(false);

  // Editable fields inside the CRM drawer
  const [crmFields, setCrmFields] = useState({
    name: '',
    phone: '',
    instagram: '',
    birthday: '',
    instagramNotes: '',
    customNotes: ''
  });

  // Email Preview Modal State
  const [emailPreviewModal, setEmailPreviewModal] = useState<{
    isOpen: boolean;
    title: string;
    html: string;
    loading: boolean;
  } | null>(null);

  const handleOpenEmailPreview = async (orderId: string, type: 'shipped' | 'customer' | 'admin' | 'multibanco') => {
    setEmailPreviewModal({
      isOpen: true,
      title: 'A carregar e-mail...',
      html: '',
      loading: true
    });

    try {
      const activePass = password || localStorage.getItem('mbravo_admin_password') || '';
      const res = await fetch(`${API_BASE_URL}/api/admin/orders/${orderId}/email-preview?type=${type}`, {
        headers: {
          'x-admin-password': activePass,
          'Authorization': activePass
        }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setEmailPreviewModal({
          isOpen: true,
          title: data.title,
          html: data.html,
          loading: false
        });
      } else {
        setEmailPreviewModal({
          isOpen: true,
          title: 'Erro ao obter e-mail',
          html: `<div style="padding:40px; font-family:sans-serif; text-align:center; color:#900; background:#fff;">${data.error || 'Erro ao obter pré-visualização do e-mail.'}</div>`,
          loading: false
        });
      }
    } catch (err) {
      setEmailPreviewModal({
        isOpen: true,
        title: 'Erro de Ligação',
        html: `<div style="padding:40px; font-family:sans-serif; text-align:center; color:#900; background:#fff;">Não foi possível ligar ao servidor para obter o e-mail.</div>`,
        loading: false
      });
    }
  };

  const fetchCustomerProfile = async (email: string) => {
    setLoadingCustomerProfile(true);
    setCustomerProfileError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/customers/${encodeURIComponent(email)}`, {
        headers: {
          'x-admin-password': password || 'CarolinaM26',
          'Authorization': password || 'CarolinaM26',
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setCustomerProfile(data.profile);
        setCrmFields({
          name: data.profile.name || '',
          phone: formatPhoneReadable(data.profile.phone || ''),
          instagram: data.profile.instagram || '',
          birthday: data.profile.birthday || '',
          instagramNotes: data.profile.instagramNotes || '',
          customNotes: data.profile.customNotes || ''
        });
      } else {
        setCustomerProfileError(data.error || 'Erro ao carregar dados do cliente.');
      }
    } catch (err) {
      console.error(err);
      setCustomerProfileError('Erro de ligação ao servidor.');
    } finally {
      setLoadingCustomerProfile(false);
    }
  };

  const handleOpenCustomerProfile = (email: string) => {
    if (!email) return;
    setSelectedCustomerEmail(email);
    fetchCustomerProfile(email);
  };

  const handleSaveCustomerProfile = async () => {
    if (!selectedCustomerEmail) return;
    setIsSavingCustomerProfile(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/customers/${encodeURIComponent(selectedCustomerEmail)}`, {
        method: 'POST',
        headers: {
          'x-admin-password': password || 'CarolinaM26',
          'Authorization': password || 'CarolinaM26',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(crmFields)
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setCustomerProfile(prev => prev ? { ...prev, ...data.profile } : data.profile);
        alert('Ficha de cliente gravada com sucesso!');
        fetchOrders();
      } else {
        alert(data.error || 'Erro ao gravar os dados do cliente.');
      }
    } catch (err) {
      console.error(err);
      alert('Erro de ligação ao servidor ao gravar ficha.');
    } finally {
      setIsSavingCustomerProfile(false);
    }
  };

  const DEFAULT_PALETTE = [
    'Branco', 'Natural', 'Baunilha', 'Amarelo Claro', 'Verde Musgo',
    'Verde Floresta', 'Azul Cobalto', 'Azul Pó', 'Rosa do Deserto',
    'Rosa Claríssimo', 'Vermelho', 'Preto', 'Castanho', 'Café', 'Petróleo', 'Menta'
  ];

  const allCatalogProducts = React.useMemo(() => {
    const list: any[] = [];
    const source = (catalog && catalog.length > 0) ? catalog : shopCategories;
    if (Array.isArray(source)) {
      source.forEach((cat: any) => {
        if (Array.isArray(cat.products)) {
          cat.products.forEach((prod: any) => {
            list.push(prod);
          });
        }
      });
    }
    return list;
  }, [catalog, shopCategories]);

  const selectedProductObj = React.useMemo(() => {
    if (!manualForm.selectedProductId || manualForm.selectedProductId === 'custom') return null;
    return allCatalogProducts.find(
      p => String(p.id) === manualForm.selectedProductId || p.name === manualForm.productName
    );
  }, [allCatalogProducts, manualForm.selectedProductId, manualForm.productName]);

  const activeAvailableColors = React.useMemo(() => {
    if (!selectedProductObj) return DEFAULT_PALETTE;
    let list: string[] = [];
    if (Array.isArray(selectedProductObj.availableColors)) {
      list = selectedProductObj.availableColors;
    } else if (typeof selectedProductObj.availableColors === 'string' && selectedProductObj.availableColors.trim()) {
      list = selectedProductObj.availableColors.split(',').map((s: string) => s.trim()).filter(Boolean);
    }
    return list.length > 0 ? list : DEFAULT_PALETTE;
  }, [selectedProductObj]);

  const safranYarns = React.useMemo(() => {
    const list = (inventory || []).filter((item: any) => 
      item && item.id && (item.id.toLowerCase().includes('safran') || item.name.toLowerCase().includes('safran'))
    );
    if (list.length > 0) return list;
    return [
      { id: "rm_safran_18_natural", name: "DROPS Safran 18 (Natural)", quantity: 10, unit: "novelos" },
      { id: "rm_safran_17_branco", name: "DROPS Safran 17 (Branco)", quantity: 8, unit: "novelos" },
      { id: "rm_safran_68_cafe", name: "DROPS Safran 68 (Café)", quantity: 5, unit: "novelos" },
      { id: "rm_safran_01_rosa_deserto", name: "DROPS Safran 01 (Rosa do Deserto)", quantity: 3, unit: "novelos" },
      { id: "rm_safran_78_verde_floresta", name: "DROPS Safran 78 (Verde Floresta)", quantity: 3, unit: "novelos" },
      { id: "rm_safran_60_verde_musgo", name: "DROPS Safran 60 (Verde Musgo)", quantity: 3, unit: "novelos" },
      { id: "rm_safran_73_azul_cobalto", name: "DROPS Safran 73 (Azul Cobalto)", quantity: 3, unit: "novelos" },
      { id: "rm_safran_50_menta", name: "DROPS Safran 50 (Menta)", quantity: 3, unit: "novelos" },
      { id: "rm_safran_19_vermelho", name: "DROPS Safran 19 (Vermelho)", quantity: 1, unit: "novelos" },
      { id: "rm_safran_76_azul_po", name: "DROPS Safran 76 (Azul Pó)", quantity: 5, unit: "novelos" }
    ];
  }, [inventory]);

  const parisYarns = React.useMemo(() => {
    const list = (inventory || []).filter((item: any) => 
      item && item.id && (item.id.toLowerCase().includes('paris') || item.name.toLowerCase().includes('paris'))
    );
    if (list.length > 0) return list;
    return [
      { id: "rm_paris_16_branco", name: "DROPS Paris 16 (Branco)", quantity: 10, unit: "novelos" },
      { id: "rm_paris_17_natural", name: "DROPS Paris 17 (Natural)", quantity: 5, unit: "novelos" },
      { id: "rm_paris_43_verde", name: "DROPS Paris 43 (Verde)", quantity: 5, unit: "novelos" },
      { id: "rm_paris_25_verde_musgo", name: "DROPS Paris 25 (Verde Musgo)", quantity: 5, unit: "novelos" },
      { id: "rm_paris_48_petroleo", name: "DROPS Paris 48 (Petróleo)", quantity: 5, unit: "novelos" },
      { id: "rm_paris_76_azul_ternura", name: "DROPS Paris 76 (Azul Ternura)", quantity: 5, unit: "novelos" },
      { id: "rm_paris_57_rosa_clarissimo", name: "DROPS Paris 57 (Rosa Claríssimo)", quantity: 5, unit: "novelos" },
      { id: "rm_paris_35_baunilha", name: "DROPS Paris 35 (Baunilha)", quantity: 5, unit: "novelos" },
      { id: "rm_paris_19_amarelo_claro", name: "DROPS Paris 19 (Amarelo Claro)", quantity: 5, unit: "novelos" },
      { id: "rm_paris_44_castanho", name: "DROPS Paris 44 (Castanho)", quantity: 5, unit: "novelos" },
      { id: "rm_paris_12_vermelho", name: "DROPS Paris 12 (Vermelho)", quantity: 5, unit: "novelos" },
      { id: "rm_paris_15_preto", name: "DROPS Paris 15 (Preto)", quantity: 3, unit: "novelos" }
    ];
  }, [inventory]);

  const otherProductColors = React.useMemo(() => {
    const safranNames = safranYarns.map((i: any) => (i.name || '').toLowerCase());
    const parisNames = parisYarns.map((i: any) => (i.name || '').toLowerCase());
    return activeAvailableColors.filter(c => {
      const cLow = c.toLowerCase();
      return !safranNames.some(sn => sn.includes(cLow) || cLow.includes(sn)) &&
             !parisNames.some(pn => pn.includes(cLow) || cLow.includes(pn));
    });
  }, [activeAvailableColors, safranYarns, parisYarns]);

  const handleSelectProduct = (productIdOrName: string) => {
    if (!productIdOrName) {
      setManualForm(prev => ({
        ...prev,
        selectedProductId: '',
        productName: '',
        price: '',
        corType: 'single',
        cor: '',
        corPrincipal: '',
        corDetalhe: ''
      }));
      return;
    }

    if (productIdOrName === 'custom') {
      setManualForm(prev => ({
        ...prev,
        selectedProductId: 'custom',
        productName: '',
        price: '',
        corType: 'single',
        cor: '',
        corPrincipal: '',
        corDetalhe: ''
      }));
      return;
    }

    const prod = allCatalogProducts.find(p => String(p.id) === productIdOrName || p.name === productIdOrName);
    if (!prod) return;

    let rawPrice = '';
    if (typeof prod.price === 'number') {
      rawPrice = prod.price.toFixed(2);
    } else if (typeof prod.price === 'string') {
      const clean = prod.price.replace(/[^0-9.,]/g, '').replace(',', '.');
      const parsed = parseFloat(clean);
      rawPrice = !isNaN(parsed) ? parsed.toFixed(2) : prod.price;
    }

    const nameLower = prod.name.toLowerCase();
    const isAfricanFlowerPouch = nameLower.includes('african flower pouch');
    const isMiniPouches = nameLower.includes('mini pouches') || nameLower.includes('mini pouch');
    const isClassicCoasters = nameLower.includes('classic coasters');
    const isCoaster = nameLower.includes('coasters') || nameLower.includes('placemats');

    const isDualColor = isAfricanFlowerPouch || 
                        nameLower.includes('marea bikini set') ||
                        nameLower.includes('signature granny poncho') ||
                        nameLower.includes('cardigan') ||
                        isMiniPouches ||
                        isClassicCoasters;

    const rawColorType = (prod as any).colorType || (prod as any).corType;
    const computedColorType: 'single' | 'bicolor' | 'fixed' = 
      rawColorType === 'bicolor' ? 'bicolor'
      : (rawColorType === 'single' ? 'single'
      : (rawColorType === 'fixed' ? 'fixed'
      : (isDualColor ? 'bicolor' : (isCoaster && !isClassicCoasters ? 'fixed' : 'single'))));

    let rawColorsList: string[] = [];
    if (Array.isArray(prod.availableColors)) {
      rawColorsList = prod.availableColors;
    } else if (typeof prod.availableColors === 'string' && prod.availableColors.trim()) {
      rawColorsList = prod.availableColors.split(',').map((s: string) => s.trim()).filter(Boolean);
    }
    if (rawColorsList.length === 0) {
      rawColorsList = DEFAULT_PALETTE;
    }

    let defaultPrim = rawColorsList[0] || 'Natural';
    let defaultDet = rawColorsList[1] || rawColorsList[0] || 'Branco';
    let initialCor = '';

    if (computedColorType === 'bicolor') {
      initialCor = `${defaultPrim} & ${defaultDet}`;
    } else if (computedColorType === 'single') {
      initialCor = defaultPrim;
      defaultPrim = '';
      defaultDet = '';
    } else {
      initialCor = 'Padrão';
      defaultPrim = '';
      defaultDet = '';
    }

    const isMiniShellPouch = nameLower.includes('mini shell pouch');

    setManualForm(prev => ({
      ...prev,
      selectedProductId: String(prod.id || prod.name),
      productName: prod.name,
      price: rawPrice,
      corType: computedColorType,
      cor: initialCor,
      corPrincipal: defaultPrim,
      corDetalhe: defaultDet,
      accessories: {
        fecho: prod.accessories?.fecho ?? (isAfricanFlowerPouch || isMiniPouches),
        fechoQty: prod.accessories?.fechoQty ?? 1,
        forro: prod.accessories?.forro ?? isAfricanFlowerPouch,
        forroMeters: prod.accessories?.forroMeters ?? prod.accessories?.forroConsumo ?? 0.25,
        etiqueta: prod.accessories?.etiqueta ?? true,
        etiquetaQty: prod.accessories?.etiquetaQty ?? 1,
        caixa: prod.accessories?.caixa ?? true,
        caixaQty: prod.accessories?.caixaQty ?? 1,
        sacoEnvelope: prod.accessories?.sacoEnvelope ?? prod.accessories?.saco ?? true,
        sacoEnvelopeQty: prod.accessories?.sacoEnvelopeQty ?? prod.accessories?.sacoQty ?? 1,
        botao: prod.accessories?.botao ?? isMiniShellPouch,
        botaoQty: prod.accessories?.botaoQty ?? 1
      }
    }));
  };

  const handleCreateManualOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const cleanProdName = manualForm.productName.trim();
    const cleanCustomerNome = manualForm.customerNome.trim();
    const cleanCustomerEmail = manualForm.customerEmail.trim();

    if (!cleanProdName || !cleanCustomerNome) {
      alert("Nome do Produto e Nome do Cliente são obrigatórios.");
      return;
    }

    if (cleanCustomerEmail && !isValidEmail(cleanCustomerEmail)) {
      alert("Por favor introduza um e-mail válido no formato utilizador@dominio.com.");
      return;
    }

    const priceVal = parseFloat(String(manualForm.price).replace(/[^0-9.,]/g, '').replace(',', '.')) || 0;
    const qtdVal = manualForm.quantidade.replace(/\D/g, '') || '1';

    let finalCor = manualForm.cor.trim();
    if (manualForm.corType === 'bicolor' && manualForm.corPrincipal) {
      finalCor = manualForm.corDetalhe 
        ? `${manualForm.corPrincipal} & ${manualForm.corDetalhe}` 
        : manualForm.corPrincipal;
    }
    if (!finalCor) finalCor = 'Padrão';

    setIsCreatingManual(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/orders/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': password
        },
        body: JSON.stringify({
          productName: cleanProdName,
          price: priceVal,
          selections: {
            cor: finalCor,
            corPrincipal: manualForm.corType === 'bicolor' ? manualForm.corPrincipal : undefined,
            corDetalhe: manualForm.corType === 'bicolor' ? manualForm.corDetalhe : undefined,
            tamanho: manualForm.tamanho.trim(),
            quantidade: qtdVal,
            accessories: manualForm.accessories
          },
          customer: {
            nome: cleanCustomerNome,
            email: cleanCustomerEmail,
            telefone: manualForm.customerTelefone.replace(/[^0-9+]/g, ''),
            morada: manualForm.customerMorada.trim(),
            codigoPostal: formatPostalCodePT(manualForm.customerCodigoPostal),
            cidade: manualForm.customerCidade.trim(),
            nif: manualForm.customerNif.replace(/\D/g, '')
          },
          paymentMethod: manualForm.paymentMethod,
          status: manualForm.status,
          priority: manualForm.priority,
          createdAt: new Date().toISOString()
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        alert("Encomenda manual registada com sucesso! O inventário de matérias-primas foi atualizado automaticamente.");
        setManualForm({
          selectedProductId: '',
          productName: '',
          price: '',
          corType: 'single',
          cor: '',
          corPrincipal: '',
          corDetalhe: '',
          tamanho: '',
          quantidade: '1',
          customerNome: '',
          customerEmail: '',
          customerTelefone: '',
          customerMorada: '',
          customerCodigoPostal: '',
          customerCidade: '',
          customerNif: '',
          paymentMethod: 'card',
          status: 'paid',
          priority: 'NORMAL',
          accessories: {
            fecho: false,
            forro: false,
            etiqueta: true,
            caixa: true,
            botao: false
          }
        });
        setShowManualForm(false);
        fetchOrders();
      } else {
        alert(data.error || "Erro ao registar encomenda.");
      }
    } catch (err) {
      alert("Erro de rede/ligação ao servidor.");
    } finally {
      setIsCreatingManual(false);
    }
  };

  // Check saved session on mount
  useEffect(() => {
    const savedPass = localStorage.getItem('mbravo_admin_password');
    if (savedPass) {
      handleAutoLogin(savedPass);
    }
  }, []);

  const handleAutoLogin = async (savedPass: string) => {
    setLoadingOrders(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/orders`, {
        headers: { 'x-admin-password': savedPass }
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
        setPassword(savedPass);
        setIsAuthenticated(true);
        // Also load logs, catalog and inventory
        fetchLogs(savedPass);
        fetchCatalog(savedPass);
        fetchInventory(savedPass);
      } else {
        localStorage.removeItem('mbravo_admin_password');
      }
    } catch (err) {
      console.error("Auto login failed", err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    setIsLoggingIn(true);
    setLoginError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      
      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem('mbravo_admin_password', password);
        setIsAuthenticated(true);
        fetchOrders(password);
        fetchCatalog(password);
        fetchInventory(password);
      } else {
        setLoginError(data.error || 'Palavra-passe incorreta. Tente novamente.');
      }
    } catch (err) {
      setLoginError('Erro de conexão ao servidor administrativo.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const fetchLogs = async (activePass = password) => {
    setLoadingLogs(true);
    setLogsError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/logs`, {
        headers: { 'x-admin-password': activePass }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setLogs(data.logs || []);
      } else {
        setLogsError(data.error || 'Erro ao carregar o histórico de logs.');
      }
    } catch (err) {
      setLogsError('Erro de ligação ao carregar os logs.');
    } finally {
      setLoadingLogs(false);
    }
  };

  const fetchCatalog = async (activePass = password) => {
    setLoadingCatalog(true);
    setCatalogError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/catalog`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          if (data.empty) {
            // Seed the server's catalog with static SHOP_CATEGORIES
            const seedRes = await fetch(`${API_BASE_URL}/api/admin/catalog/seed`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-admin-password': activePass
              },
              body: JSON.stringify({ categories: shopCategories })
            });
            const seedData = await seedRes.json();
            setCatalog(seedData.categories || []);
          } else {
            setCatalog(data.categories || []);
          }
        }
      } else {
        setCatalogError("Não foi possível obter o catálogo.");
      }
    } catch (err) {
      setCatalogError("Erro ao carregar catálogo.");
    } finally {
      setLoadingCatalog(false);
    }
  };

  const fetchInventory = async (activePass = password) => {
    setLoadingInventory(true);
    setInventoryError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/inventory`, {
        headers: { 'x-admin-password': activePass }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setInventory(data.inventory || []);
        }
      } else {
        setInventoryError("Não foi possível carregar o inventário de matérias-primas.");
      }
    } catch (err) {
      setInventoryError("Erro ao carregar inventário.");
    } finally {
      setLoadingInventory(false);
    }
  };

  const fetchOrders = async (activePass = password) => {
    setLoadingOrders(true);
    setOrdersError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/orders`, {
        headers: { 'x-admin-password': activePass }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setOrders(data.orders || []);
        fetchLogs(activePass);
        fetchCatalog(activePass);
        fetchInventory(activePass);
      } else {
        setOrdersError(data.error || 'Erro ao carregar as encomendas.');
      }
    } catch (err) {
      setOrdersError('Não foi possível conectar ao servidor para obter encomendas.');
    } finally {
      setLoadingOrders(false);
    }
  };

  const exportToCSV = () => {
    if (filteredOrders.length === 0) {
      alert("Não existem encomendas correspondentes aos filtros atuais para exportar.");
      return;
    }

    // European Excel standard uses semicolons and a UTF-8 BOM
    const headers = [
      "ID da Encomenda",
      "Data",
      "Cliente",
      "E-mail",
      "Telefone",
      "NIF",
      "Produto",
      "Detalhes do Item",
      "Subtotal",
      "Descontos",
      "Portes",
      "Total",
      "Metodo de Pagamento",
      "Estado",
      "Codigo Rastreio CTT"
    ];

    const rows = filteredOrders.map(o => {
      const selections = o.selections || {};
      const cor = selections.cor || "Padrão";
      const hasSize = selections.hasSize !== false && Boolean(selections.tamanho) && !['n/a', 'na', 'único', 'unico', 'padrão', 'padrao', ''].includes(String(selections.tamanho).toLowerCase().trim());
      const quantidade = selections.quantidade || "1";
      const itemDetails = `Cor: ${cor}${hasSize ? `, Tam: ${selections.tamanho}` : ''}, Qtd: ${quantidade}`;
      
      const priceVal = parsePrice(String(o.price));
      const formattedSubtotal = priceVal.toFixed(2).replace('.', ',');
      const formattedTotal = priceVal.toFixed(2).replace('.', ',');
      const formattedDesconto = "0,00";
      const formattedPortes = "0,00";

      let translatedStatus = o.status;
      if (o.status === 'paid') translatedStatus = "No Atelier";
      else if (o.status === 'pending_payment') translatedStatus = "Aguardar Liquidação";
      else if (o.status === 'shipped') translatedStatus = "A Caminho";
      else if (o.status === 'delivered') translatedStatus = "Entregue";
      else if (o.status === 'failed') translatedStatus = "Cancelada";

      let translatedMethod = o.paymentMethod;
      if (o.paymentMethod === 'card') translatedMethod = "Cartao de Credito";
      else if (o.paymentMethod === 'multibanco') translatedMethod = "Multibanco";
      else if (o.paymentMethod === 'mbway') translatedMethod = "MB WAY";
      else if (o.paymentMethod === 'wallet') translatedMethod = "Digital Wallet";
      else if (o.paymentMethod === 'manual') translatedMethod = "Manual / Direta";

      return [
        o.orderId || "",
        o.createdAt ? new Date(o.createdAt).toLocaleString('pt-PT') : "",
        o.customer?.nome || "",
        o.customer?.email || "",
        formatPhoneReadable(o.customer?.telefone || ""),
        o.customer?.nif || "",
        o.productName || "",
        itemDetails,
        `${formattedSubtotal} EUR`,
        `${formattedDesconto} EUR`,
        `${formattedPortes} EUR`,
        `${formattedTotal} EUR`,
        translatedMethod,
        translatedStatus,
        o.trackingCode || ""
      ];
    });

    const csvContent = [
      headers.join(";"),
      ...rows.map(r => r.map(val => `"${String(val).replace(/"/g, '""')}"`).join(";"))
    ].join("\r\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `mbravo_contabilidade_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleLogout = () => {
    localStorage.removeItem('mbravo_admin_password');
    setIsAuthenticated(false);
    setPassword('');
    setOrders([]);
    setLogs([]);
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    setActionLoading(prev => ({ ...prev, [orderId]: true }));
    setActionSuccess(prev => ({ ...prev, [orderId]: '' }));
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/orders/update`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-admin-password': password
        },
        body: JSON.stringify({ orderId, status: newStatus })
      });
      
      const data = await res.json();
      if (res.ok && data.success) {
        setActionSuccess(prev => ({ ...prev, [orderId]: `Estado atualizado para ${newStatus.toUpperCase()}!` }));
        fetchOrders();
      } else {
        alert(data.error || 'Erro ao atualizar estado.');
      }
    } catch (err) {
      alert('Erro de conexão ao atualizar estado.');
    } finally {
      setActionLoading(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!window.confirm(`Tem a certeza que deseja eliminar permanentemente a encomenda ${orderId}? Esta ação removerá o registo da base de dados e atualizará os totais do painel.`)) {
      return;
    }

    setActionLoading(prev => ({ ...prev, [orderId]: true }));
    setActionSuccess(prev => ({ ...prev, [orderId]: '' }));
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/orders/delete`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-admin-password': password
        },
        body: JSON.stringify({ orderId })
      });
      
      const data = await res.json();
      if (res.ok && data.success) {
        setActionSuccess(prev => ({ ...prev, [orderId]: 'Encomenda eliminada com sucesso.' }));
        fetchOrders();
      } else {
        alert(data.error || 'Erro ao eliminar encomenda.');
      }
    } catch (err) {
      alert('Erro de conexão ao eliminar encomenda.');
    } finally {
      setActionLoading(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const handleSimulateWebhook = async (orderId: string, action: 'simulate_payment' | 'simulate_failure') => {
    setActionLoading(prev => ({ ...prev, [orderId]: true }));
    setActionSuccess(prev => ({ ...prev, [orderId]: '' }));
    try {
      const res = await fetch(`${API_BASE_URL}/api/payment/simulate-action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, action })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setActionSuccess(prev => ({ 
          ...prev, 
          [orderId]: action === 'simulate_payment' 
            ? 'Pagamento simulado com sucesso! E-mails de Recibo/Notificação gerados.' 
            : 'Cancelamento simulado com sucesso.' 
        }));
        fetchOrders();
      } else {
        alert('Erro ao simular webhook.');
      }
    } catch (err) {
      alert('Erro de conexão na simulação.');
    } finally {
      setActionLoading(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const handleDispatchTracking = async (orderId: string) => {
    const code = trackingInputs[orderId]?.trim();
    if (!code) {
      alert('Por favor, introduza um código de rastreio CTT válido.');
      return;
    }

    setActionLoading(prev => ({ ...prev, [orderId]: true }));
    setActionSuccess(prev => ({ ...prev, [orderId]: '' }));

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/orders/update`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-admin-password': password
        },
        body: JSON.stringify({ orderId, status: 'shipped', trackingCode: code })
      });
      
      const data = await res.json();
      if (res.ok && data.success) {
        setActionSuccess(prev => ({ ...prev, [orderId]: 'Encomenda expedida e e-mail enviado ao cliente!' }));
        // Clean input
        setTrackingInputs(prev => {
          const next = { ...prev };
          delete next[orderId];
          return next;
        });
        fetchOrders();
      } else {
        alert(data.error || 'Erro ao processar expedição.');
      }
    } catch (err) {
      alert('Erro de conexão ao enviar dados dos CTT.');
    } finally {
      setActionLoading(prev => ({ ...prev, [orderId]: false }));
    }
  };

  // Helper to parse price string or number (e.g. "50.00€", "50€", or 16) to number
  const parsePrice = (priceVal: any): number => {
    if (priceVal === null || priceVal === undefined || priceVal === '') return 0;
    if (typeof priceVal === 'number') return isNaN(priceVal) ? 0 : priceVal;
    const clean = String(priceVal).replace(/[^0-9,.]/g, '').replace(',', '.');
    return parseFloat(clean) || 0;
  };

  // Stats selectors
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === 'pending_payment').length;
  const paidOrders = orders.filter(o => o.status === 'paid').length;
  const shippedOrders = orders.filter(o => o.status === 'shipped').length;
  const deliveredOrders = orders.filter(o => o.status === 'delivered').length;
  const totalRevenue = orders
    .filter(o => o.status === 'paid' || o.status === 'shipped' || o.status === 'delivered')
    .reduce((sum, o) => sum + parsePrice(o.price), 0);

  // Filter & Search logic
  const filteredOrders = orders.filter(order => {
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    const customerName = order.customer?.nome || '';
    const customerEmail = order.customer?.email || '';
    const customerNif = order.customer?.nif || '';
    const productName = order.productName || '';
    const orderId = order.orderId || '';

    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      customerName.toLowerCase().includes(query) ||
      customerEmail.toLowerCase().includes(query) ||
      customerNif.toLowerCase().includes(query) ||
      productName.toLowerCase().includes(query) ||
      orderId.toLowerCase().includes(query);

    return matchesStatus && matchesSearch;
  });

  const filteredLogs = logs.filter(log => {
    if (!logSearchQuery) return true;
    const q = logSearchQuery.toLowerCase();
    return (
      (log.id || '').toLowerCase().includes(q) ||
      (log.description || '').toLowerCase().includes(q) ||
      (log.orderId || '').toLowerCase().includes(q) ||
      (log.event || '').toLowerCase().includes(q) ||
      (log.user || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-4 bg-forest/80 backdrop-blur-sm select-text w-full max-w-full overflow-hidden">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-full md:max-w-6xl h-full md:h-[85vh] bg-[#FCFBF9] text-forest rounded-none md:rounded-[24px] shadow-2xl border-0 md:border border-[#C5A059]/10 flex flex-col overflow-hidden"
      >
        {/* HEADER RAIL */}
        <div className="flex items-center justify-between px-3.5 sm:px-8 py-3.5 sm:py-5 border-b border-forest/5 bg-white/50 shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-2.5 h-2.5 rounded-full bg-[#C5A059] animate-pulse shrink-0" />
            <h3 className="font-serif text-xs sm:text-lg tracking-wider font-medium text-forest uppercase flex items-center gap-1.5 sm:gap-2 truncate">
              M★BRAVO <span className="text-[#C5A059] font-sans text-[9px] sm:text-xs font-semibold tracking-widest bg-[#FCF8F2] border border-[#C5A059]/20 px-2 sm:px-2.5 py-0.5 rounded-full shrink-0">ADMIN</span>
            </h3>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            {isAuthenticated && (
              <button 
                onClick={handleLogout}
                className="text-[9px] sm:text-xs uppercase tracking-widest text-red-700 hover:text-red-900 bg-red-50 hover:bg-red-100/55 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full transition-all font-semibold"
              >
                Sair
              </button>
            )}
            <button 
              onClick={onClose}
              className="p-1 sm:p-1.5 hover:bg-forest/5 rounded-full transition-all cursor-pointer text-forest/60 hover:text-forest"
              aria-label="Fechar Painel de Administração"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* CONTAINER CONTENT */}
        <div data-lenis-prevent className="flex-1 overflow-y-auto overflow-x-hidden w-full max-w-full min-h-0">
          {!isAuthenticated ? (
            /* LOGIN PANEL */
            <div className="h-full flex items-center justify-center p-6">
              <div className="w-full max-w-md bg-white border border-forest/5 p-8 rounded-[20px] shadow-[0_10px_35px_-10px_rgba(36,49,25,0.08)] space-y-6">
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-[#FCF8F2] border border-[#C5A059]/20 rounded-full flex items-center justify-center mx-auto text-[#C5A059]">
                    <Lock className="w-5 h-5" />
                  </div>
                  <h4 className="font-serif text-xl font-medium tracking-tight">Acesso Reservado</h4>
                  <p className="text-xs text-forest/50 font-sans">Introduza a palavra-passe do atelier para gerir as encomendas.</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-forest/40">Palavra-passe:</label>
                    <input 
                      type="password" 
                      placeholder="Introduza a chave de acesso..."
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-cream/30 border border-forest/10 focus:border-[#C5A059] focus:outline-none rounded-xl px-4 py-3 text-sm transition-all"
                      required
                    />
                  </div>

                  {loginError && (
                    <div className="bg-red-50 text-red-800 border border-red-200/40 rounded-xl p-3 text-xs flex items-start gap-2 font-sans">
                      <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                      <span>{loginError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoggingIn}
                    className="w-full py-3 bg-[#243119] hover:bg-[#1a2412] text-cream rounded-xl text-xs uppercase font-bold tracking-widest shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isLoggingIn ? (
                      <>
                        <span className="animate-spin rounded-full h-3 w-3 border border-cream border-t-transparent" />
                        Autenticando...
                      </>
                    ) : (
                      <>
                        <Unlock className="w-3.5 h-3.5" />
                        Aceder ao Painel
                      </>
                    )}
                  </button>
                </form>

                <div className="text-[9px] text-center text-forest/30 font-serif italic border-t border-forest/5 pt-4">
                  M★BRAVO &bull; Criado Artesanalmente com Tempo e Afeto
                </div>
              </div>
            </div>
          ) : (
            /* ADMIN DASHBOARD */
            <div className="p-3 sm:p-6 lg:p-8 space-y-4 sm:space-y-8 font-sans relative w-full max-w-full overflow-x-hidden">
              
              {/* TOAST NOTIFICATION BANNER */}
              {saveNotification && (
                <div className="fixed top-4 right-4 sm:top-6 sm:right-6 z-[250] bg-[#243119] text-cream px-4 py-3 rounded-2xl shadow-2xl border border-[#C5A059]/40 flex items-center gap-3 animate-slide-down max-w-[90vw]">
                  <CheckCircle className="w-5 h-5 text-[#C5A059] shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="font-serif font-bold text-xs text-cream truncate">{saveNotification}</p>
                    <p className="text-[9px] sm:text-[10px] text-cream/70 truncate">Sincronizado na Railway</p>
                  </div>
                  <button onClick={() => setSaveNotification(null)} className="ml-1 text-cream/50 hover:text-cream cursor-pointer p-1 shrink-0">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
              
              {/* STATS HIGHLIGHT PANEL */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-4 w-full max-w-full">
                <div className="bg-white border border-forest/5 p-2.5 sm:p-4 rounded-[12px] sm:rounded-[16px] shadow-sm space-y-1 min-w-0 w-full">
                  <div className="text-[8.5px] sm:text-[10px] font-bold uppercase tracking-wider text-forest/35 truncate">Total Encomendas</div>
                  <div className="text-base sm:text-xl font-serif font-medium text-forest flex items-center gap-1 sm:gap-1.5 truncate">
                    <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#C5A059] shrink-0" />
                    <span>{totalOrders}</span>
                  </div>
                </div>

                <div className="bg-white border border-forest/5 p-2.5 sm:p-4 rounded-[12px] sm:rounded-[16px] shadow-sm space-y-1 min-w-0 w-full">
                  <div className="text-[8.5px] sm:text-[10px] font-bold uppercase tracking-wider text-forest/35 truncate">Total Faturado</div>
                  <div className="text-base sm:text-xl font-serif font-medium text-forest flex items-center gap-1 truncate">
                    <span className="text-[#BACAA5] font-sans text-xs sm:text-base">€</span>
                    <span>{totalRevenue.toFixed(2)}</span>
                  </div>
                </div>

                <div className="bg-white border border-forest/5 p-2.5 sm:p-4 rounded-[12px] sm:rounded-[16px] shadow-sm space-y-1 min-w-0 w-full">
                  <div className="text-[8.5px] sm:text-[10px] font-bold uppercase tracking-wider text-forest/35 truncate">Liquidação</div>
                  <div className="text-base sm:text-xl font-serif font-medium text-amber-600 flex items-center gap-1 sm:gap-1.5 truncate">
                    <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                    <span>{pendingOrders}</span>
                  </div>
                </div>

                <div className="bg-white border border-forest/5 p-2.5 sm:p-4 rounded-[12px] sm:rounded-[16px] shadow-sm space-y-1 min-w-0 w-full">
                  <div className="text-[8.5px] sm:text-[10px] font-bold uppercase tracking-wider text-forest/35 truncate">No Atelier</div>
                  <div className="text-base sm:text-xl font-serif font-medium text-green-700 flex items-center gap-1 sm:gap-1.5 truncate">
                    <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                    <span>{paidOrders}</span>
                  </div>
                </div>

                <div className="bg-white border border-forest/5 p-2.5 sm:p-4 rounded-[12px] sm:rounded-[16px] shadow-sm space-y-1 min-w-0 w-full">
                  <div className="text-[8.5px] sm:text-[10px] font-bold uppercase tracking-wider text-[#A68244] truncate">A Caminho</div>
                  <div className="text-base sm:text-xl font-serif font-medium text-amber-700 flex items-center gap-1 sm:gap-1.5 truncate">
                    <Truck className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                    <span>{shippedOrders}</span>
                  </div>
                </div>

                <div className="bg-[#243119] text-cream p-2.5 sm:p-4 rounded-[12px] sm:rounded-[16px] shadow-sm space-y-1 min-w-0 w-full">
                  <div className="text-[8.5px] sm:text-[10px] font-bold uppercase tracking-wider text-cream/40 truncate">Entregues</div>
                  <div className="text-base sm:text-xl font-serif font-medium text-[#C5A059] flex items-center gap-1 sm:gap-1.5 truncate">
                    <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                    <span>{deliveredOrders}</span>
                  </div>
                </div>
              </div>

              {/* TAB SWITCHER & ACTION BAR */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-forest/10 pb-2 gap-2.5 sm:gap-4 w-full max-w-full overflow-hidden">
                <div className="flex items-center gap-1 sm:gap-1.5 bg-cream/35 p-1 rounded-xl overflow-x-auto whitespace-nowrap w-full max-w-full no-scrollbar touch-pan-x shrink-0">
                  <button
                    type="button"
                    onClick={() => setActiveTab('analytics')}
                    className={`px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg font-semibold text-[10px] sm:text-xs tracking-wider transition-all uppercase flex items-center gap-1.5 sm:gap-2 cursor-pointer shrink-0 whitespace-nowrap ${
                      activeTab === 'analytics'
                        ? 'bg-[#243119] text-cream shadow-sm font-bold'
                        : 'text-forest/60 hover:text-forest hover:bg-cream/50'
                    }`}
                  >
                    <BarChart3 className="w-3.5 h-3.5 shrink-0" /> Painel de Vendas
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('orders')}
                    className={`px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg font-semibold text-[10px] sm:text-xs tracking-wider transition-all uppercase flex items-center gap-1.5 sm:gap-2 cursor-pointer shrink-0 whitespace-nowrap ${
                      activeTab === 'orders'
                        ? 'bg-[#243119] text-cream shadow-sm font-bold'
                        : 'text-forest/60 hover:text-forest hover:bg-cream/50'
                    }`}
                  >
                    <Package className="w-3.5 h-3.5 shrink-0" /> Encomendas
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('catalog')}
                    className={`px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg font-semibold text-[10px] sm:text-xs tracking-wider transition-all uppercase flex items-center gap-1.5 sm:gap-2 cursor-pointer shrink-0 whitespace-nowrap ${
                      activeTab === 'catalog'
                        ? 'bg-[#243119] text-cream shadow-sm font-bold'
                        : 'text-forest/60 hover:text-forest hover:bg-cream/50'
                    }`}
                  >
                    <Sliders className="w-3.5 h-3.5 shrink-0" /> CMS Catálogo
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('inventory')}
                    className={`px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg font-semibold text-[10px] sm:text-xs tracking-wider transition-all uppercase flex items-center gap-1.5 sm:gap-2 cursor-pointer shrink-0 whitespace-nowrap ${
                      activeTab === 'inventory'
                        ? 'bg-[#243119] text-cream shadow-sm font-bold'
                        : 'text-forest/60 hover:text-forest hover:bg-cream/50'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5 shrink-0" /> Inventário
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('logs')}
                    className={`px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg font-semibold text-[10px] sm:text-xs tracking-wider transition-all uppercase flex items-center gap-1.5 sm:gap-2 cursor-pointer shrink-0 whitespace-nowrap ${
                      activeTab === 'logs'
                        ? 'bg-[#243119] text-cream shadow-sm font-bold'
                        : 'text-forest/60 hover:text-forest hover:bg-cream/50'
                    }`}
                  >
                    <ClipboardList className="w-3.5 h-3.5 shrink-0" /> Auditoria
                  </button>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                  {activeTab === 'orders' && (
                    <button
                      type="button"
                      onClick={exportToCSV}
                      className="w-full sm:w-auto justify-center px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-[11px] sm:text-xs tracking-wider font-bold transition-all bg-[#C5A059] hover:bg-[#a68244] text-white flex items-center gap-2 shadow-sm uppercase cursor-pointer"
                    >
                      <Download className="w-4 h-4" /> Exportar Contabilidade (CSV)
                    </button>
                  )}
                  {activeTab === 'catalog' && (
                    <button
                      type="button"
                      onClick={() => fetchCatalog()}
                      className="w-full sm:w-auto justify-center px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-[11px] sm:text-xs tracking-wider font-bold transition-all bg-[#BACAA5] hover:bg-[#a3b38e] text-[#243119] flex items-center gap-2 shadow-sm uppercase cursor-pointer"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${loadingCatalog ? 'animate-spin' : ''}`} /> Sincronizar Catálogo
                    </button>
                  )}
                  {activeTab === 'inventory' && (
                    <button
                      type="button"
                      onClick={() => fetchInventory()}
                      className="w-full sm:w-auto justify-center px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-[11px] sm:text-xs tracking-wider font-bold transition-all bg-[#BACAA5] hover:bg-[#a3b38e] text-[#243119] flex items-center gap-2 shadow-sm uppercase cursor-pointer"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${loadingInventory ? 'animate-spin' : ''}`} /> Sincronizar Stock
                    </button>
                  )}
                  {activeTab === 'logs' && (
                    <button
                      type="button"
                      onClick={() => fetchLogs()}
                      className="w-full sm:w-auto justify-center px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-[11px] sm:text-xs tracking-wider font-bold transition-all bg-[#BACAA5] hover:bg-[#a3b38e] text-[#243119] flex items-center gap-2 shadow-sm uppercase cursor-pointer"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${loadingLogs ? 'animate-spin' : ''}`} /> Sincronizar Logs
                    </button>
                  )}
                </div>
              </div>

              {activeTab === 'orders' && (
                <>
                  {/* SEARCH AND FILTERS */}
                  <div className="bg-white border border-forest/5 p-5 rounded-[16px] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Search Bar */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3.5 top-3 w-4 h-4 text-forest/35" />
                  <input 
                    type="text" 
                    placeholder="Pesquisar por Cliente, E-mail, NIF, Produto ou ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-cream/20 border border-forest/10 focus:border-[#C5A059] focus:outline-none rounded-xl pl-10 pr-4 py-2.5 text-xs transition-all"
                  />
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-1.5 text-xs overflow-x-auto max-w-full no-scrollbar shrink-0 py-0.5">
                  <button 
                    onClick={() => setStatusFilter('all')}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-all shrink-0 whitespace-nowrap ${statusFilter === 'all' ? 'bg-[#243119] text-cream' : 'bg-cream/40 text-forest/60 hover:bg-cream/70'}`}
                  >
                    Todas <span className={`ml-1 text-[10px] font-mono ${statusFilter === 'all' ? 'text-cream/70' : 'text-forest/40'}`}>{totalOrders}</span>
                  </button>
                  <button 
                    onClick={() => setStatusFilter('pending_payment')}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 shrink-0 whitespace-nowrap ${statusFilter === 'pending_payment' ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-800 border border-amber-200/20 hover:bg-amber-100/50'}`}
                  >
                    Aguardar Liquidação <span className={`ml-1 text-[10px] font-mono ${statusFilter === 'pending_payment' ? 'text-white/70' : 'text-amber-800/40'}`}>{pendingOrders}</span>
                  </button>
                  <button 
                    onClick={() => setStatusFilter('paid')}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 shrink-0 whitespace-nowrap ${statusFilter === 'paid' ? 'bg-green-700 text-white' : 'bg-green-50 text-green-800 border border-green-200/20 hover:bg-green-100/50'}`}
                  >
                    No Atelier <span className={`ml-1 text-[10px] font-mono ${statusFilter === 'paid' ? 'text-white/70' : 'text-green-800/40'}`}>{paidOrders}</span>
                  </button>
                  <button 
                    onClick={() => setStatusFilter('shipped')}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 shrink-0 whitespace-nowrap ${statusFilter === 'shipped' ? 'bg-[#C5A059] text-[#243119]' : 'bg-amber-50/50 text-[#A68244] border border-[#C5A059]/10 hover:bg-amber-100/30'}`}
                  >
                    A Caminho <span className={`ml-1 text-[10px] font-mono ${statusFilter === 'shipped' ? 'text-[#243119]/70' : 'text-[#A68244]/50'}`}>{shippedOrders}</span>
                  </button>
                  <button 
                    onClick={() => setStatusFilter('delivered')}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 shrink-0 whitespace-nowrap ${statusFilter === 'delivered' ? 'bg-[#243119] text-cream' : 'bg-green-50 text-green-800 border border-green-200/20 hover:bg-green-100/50'}`}
                  >
                    Entregues <span className={`ml-1 text-[10px] font-mono ${statusFilter === 'delivered' ? 'text-cream/70' : 'text-green-800/40'}`}>{deliveredOrders}</span>
                  </button>
                  <button 
                    onClick={() => setStatusFilter('failed')}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 shrink-0 whitespace-nowrap ${statusFilter === 'failed' ? 'bg-red-700 text-white' : 'bg-red-50 text-red-800 border border-red-200/20 hover:bg-red-100/50'}`}
                  >
                    Canceladas <span className={`ml-1 text-[10px] font-mono ${statusFilter === 'failed' ? 'text-white/70' : 'text-red-800/40'}`}>{orders.filter(o => o.status === 'failed').length}</span>
                  </button>
                  <button 
                    onClick={() => fetchOrders()}
                    title="Atualizar dados"
                    className="p-2 hover:bg-forest/5 rounded-lg transition-all text-forest/60 ml-1 shrink-0"
                  >
                    <RefreshCw className={`w-4 h-4 ${loadingOrders ? 'animate-spin' : ''}`} />
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowManualForm(!showManualForm)}
                    className="px-3 py-1.5 rounded-lg font-medium transition-all bg-[#BACAA5] text-[#243119] hover:bg-[#a3b38e] flex items-center gap-1.5 font-sans text-xs cursor-pointer shrink-0 whitespace-nowrap"
                  >
                    <Plus className="w-3.5 h-3.5" /> Registar Venda
                  </button>
                </div>
              </div>

              {/* MANUAL ORDER FORM CONTAINER */}
              {showManualForm && (
                <form onSubmit={handleCreateManualOrder} className="bg-cream/45 border border-[#C5A059]/30 rounded-[20px] p-6 space-y-4 animate-fade-in text-xs text-forest">
                  <div className="flex items-center justify-between border-b border-[#C5A059]/10 pb-3">
                    <h4 className="font-serif text-sm font-medium text-forest flex items-center gap-2">
                      <Package className="w-4 h-4 text-[#C5A059]" />
                      Registar Encomenda Manual (Recuperação ou Venda Direta)
                    </h4>
                    <button 
                      type="button" 
                      onClick={() => setShowManualForm(false)}
                      className="p-1.5 hover:bg-forest/5 rounded-full text-forest/40 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Dynamic Product Selection Dropdown */}
                    <div className="space-y-1">
                      <label className="font-bold uppercase tracking-wider text-[10px] text-forest/50">Selecione o Produto do Catálogo *</label>
                      <select 
                        value={manualForm.selectedProductId}
                        onChange={(e) => handleSelectProduct(e.target.value)}
                        className="w-full bg-white border border-forest/15 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#C5A059] font-medium"
                        required
                      >
                        <option value="">-- Escolher Peça do Catálogo --</option>
                        {allCatalogProducts.map((prod: any) => (
                          <option key={prod.id || prod.name} value={prod.id || prod.name}>
                            {prod.name} ({typeof prod.price === 'number' ? `${prod.price.toFixed(2)}€` : prod.price})
                          </option>
                        ))}
                        <option value="custom">-- Outro / Personalizado (Inserir Manualmente) --</option>
                      </select>
                      
                      {manualForm.selectedProductId === 'custom' && (
                        <input 
                          type="text" 
                          placeholder="Nome da peça personalizada" 
                          value={manualForm.productName}
                          onChange={(e) => setManualForm(prev => ({ ...prev, productName: e.target.value }))}
                          className="w-full bg-white border border-forest/15 rounded-xl px-3 py-2 mt-1 focus:outline-none focus:border-[#C5A059]"
                          required
                        />
                      )}
                    </div>

                    {/* Price */}
                    <div className="space-y-1">
                      <label className="font-bold uppercase tracking-wider text-[10px] text-forest/50">Preço Total (€) *</label>
                      <input 
                        type="text" 
                        placeholder="Ex: 24.00" 
                        value={manualForm.price}
                        onChange={(e) => setManualForm(prev => ({ ...prev, price: e.target.value.replace(/[^0-9.,]/g, '') }))}
                        className="w-full bg-white border border-forest/15 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#C5A059] font-medium"
                        required
                      />
                    </div>

                    {/* Dynamic Color Selections & Qtd */}
                    <div className="space-y-1">
                      <label className="font-bold uppercase tracking-wider text-[10px] text-forest/50">Cor & Variação *</label>
                      
                      {manualForm.corType === 'bicolor' ? (
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="text-[9px] uppercase tracking-wider text-forest/40 block mb-0.5 font-bold">
                              {selectedProductObj && selectedProductObj.name.toLowerCase().includes('african flower pouch') ? 'Cor da Base' : 'Cor Principal'}
                            </span>
                            <select
                              value={manualForm.corPrincipal}
                              onChange={(e) => setManualForm(prev => ({ ...prev, corPrincipal: e.target.value }))}
                              className="w-full bg-white border border-forest/15 rounded-xl px-2.5 py-2 focus:outline-none focus:border-[#C5A059] text-xs font-medium"
                            >
                              <optgroup label="DROPS Safran (100% Algodão Egípcio · 50g/160m · Agulha 3mm)">
                                {safranYarns.map((item: any) => (
                                  <option key={`p_saf_${item.id}`} value={item.name}>
                                    {item.name} ({item.quantity} {item.unit || 'novelos'})
                                  </option>
                                ))}
                              </optgroup>
                              <optgroup label="DROPS Paris (100% Algodão Reciclado · 50g/75m · Agulha 5mm)">
                                {parisYarns.map((item: any) => (
                                  <option key={`p_par_${item.id}`} value={item.name}>
                                    {item.name} ({item.quantity} {item.unit || 'novelos'})
                                  </option>
                                ))}
                              </optgroup>
                              {otherProductColors.length > 0 && (
                                <optgroup label="Outras Cores / Variações">
                                  {otherProductColors.map(c => (
                                    <option key={`p_oth_${c}`} value={c}>{c}</option>
                                  ))}
                                </optgroup>
                              )}
                            </select>
                          </div>
                          <div>
                            <span className="text-[9px] uppercase tracking-wider text-forest/40 block mb-0.5 font-bold">
                              {selectedProductObj && selectedProductObj.name.toLowerCase().includes('african flower pouch') ? 'Cor do Detalhe' : 'Cor do Cordão/Detalhe'}
                            </span>
                            <select
                              value={manualForm.corDetalhe}
                              onChange={(e) => setManualForm(prev => ({ ...prev, corDetalhe: e.target.value }))}
                              className="w-full bg-white border border-forest/15 rounded-xl px-2.5 py-2 focus:outline-none focus:border-[#C5A059] text-xs font-medium"
                            >
                              <optgroup label="DROPS Safran (100% Algodão Egípcio · 50g/160m · Agulha 3mm)">
                                {safranYarns.map((item: any) => (
                                  <option key={`d_saf_${item.id}`} value={item.name}>
                                    {item.name} ({item.quantity} {item.unit || 'novelos'})
                                  </option>
                                ))}
                              </optgroup>
                              <optgroup label="DROPS Paris (100% Algodão Reciclado · 50g/75m · Agulha 5mm)">
                                {parisYarns.map((item: any) => (
                                  <option key={`d_par_${item.id}`} value={item.name}>
                                    {item.name} ({item.quantity} {item.unit || 'novelos'})
                                  </option>
                                ))}
                              </optgroup>
                              {otherProductColors.length > 0 && (
                                <optgroup label="Outras Cores / Variações">
                                  {otherProductColors.map(c => (
                                    <option key={`d_oth_${c}`} value={c}>{c}</option>
                                  ))}
                                </optgroup>
                              )}
                            </select>
                          </div>
                        </div>
                      ) : manualForm.corType === 'single' ? (
                        <select
                          value={manualForm.cor}
                          onChange={(e) => setManualForm(prev => ({ ...prev, cor: e.target.value }))}
                          className="w-full bg-white border border-forest/15 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#C5A059] text-xs font-medium"
                        >
                          <optgroup label="DROPS Safran (100% Algodão Egípcio · 50g/160m · Agulha 3mm)">
                            {safranYarns.map((item: any) => (
                              <option key={`s_saf_${item.id}`} value={item.name}>
                                {item.name} ({item.quantity} {item.unit || 'novelos'})
                              </option>
                            ))}
                          </optgroup>
                          <optgroup label="DROPS Paris (100% Algodão Reciclado · 50g/75m · Agulha 5mm)">
                            {parisYarns.map((item: any) => (
                              <option key={`s_par_${item.id}`} value={item.name}>
                                {item.name} ({item.quantity} {item.unit || 'novelos'})
                              </option>
                            ))}
                          </optgroup>
                          {otherProductColors.length > 0 && (
                            <optgroup label="Outras Cores / Variações">
                              {otherProductColors.map(c => (
                                <option key={`s_oth_${c}`} value={c}>{c}</option>
                              ))}
                            </optgroup>
                          )}
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={manualForm.cor || 'Padrão'}
                          onChange={(e) => setManualForm(prev => ({ ...prev, cor: e.target.value }))}
                          className="w-full bg-white border border-forest/15 rounded-xl px-3 py-2.5 focus:outline-none text-xs"
                        />
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Size & Quantity */}
                    <div className="grid grid-cols-2 gap-2 md:col-span-1">
                      <div className="space-y-1">
                        <label className="font-bold uppercase tracking-wider text-[10px] text-forest/50">Tamanho</label>
                        <input 
                          type="text" 
                          placeholder="Único" 
                          value={manualForm.tamanho}
                          onChange={(e) => setManualForm(prev => ({ ...prev, tamanho: e.target.value }))}
                          className="w-full bg-white border border-forest/15 rounded-xl px-3 py-2.5 focus:outline-none text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold uppercase tracking-wider text-[10px] text-forest/50">Qtd.</label>
                        <input 
                          type="text" 
                          placeholder="1" 
                          value={manualForm.quantidade}
                          onChange={(e) => setManualForm(prev => ({ ...prev, quantidade: e.target.value.replace(/\D/g, '') }))}
                          className="w-full bg-white border border-forest/15 rounded-xl px-3 py-2.5 focus:outline-none font-bold text-center text-xs"
                        />
                      </div>
                    </div>

                    {/* Customer Name */}
                    <div className="space-y-1">
                      <label className="font-bold uppercase tracking-wider text-[10px] text-forest/50">Nome do Cliente *</label>
                      <input 
                        type="text" 
                        placeholder="Ex: Maria Santos" 
                        value={manualForm.customerNome}
                        onChange={(e) => setManualForm(prev => ({ ...prev, customerNome: e.target.value }))}
                        className="w-full bg-white border border-forest/15 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#C5A059]"
                        required
                      />
                    </div>

                    {/* Customer Email */}
                    <div className="space-y-1">
                      <label className="font-bold uppercase tracking-wider text-[10px] text-forest/50">E-mail do Cliente</label>
                      <input 
                        type="email" 
                        placeholder="cliente@email.com" 
                        value={manualForm.customerEmail}
                        onChange={(e) => setManualForm(prev => ({ ...prev, customerEmail: e.target.value }))}
                        className="w-full bg-white border border-forest/15 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#C5A059]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Customer Phone */}
                    <div className="space-y-1">
                      <label className="font-bold uppercase tracking-wider text-[10px] text-forest/50">Telefone do Cliente</label>
                      <input 
                        type="text" 
                        placeholder="Ex: 912345678" 
                        value={manualForm.customerTelefone}
                        onChange={(e) => setManualForm(prev => ({ ...prev, customerTelefone: e.target.value.replace(/[^0-9+]/g, '') }))}
                        className="w-full bg-white border border-forest/15 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#C5A059]"
                      />
                    </div>
                    {/* Address */}
                    <div className="space-y-1 md:col-span-2">
                      <label className="font-bold uppercase tracking-wider text-[10px] text-forest/50">Morada de Envio</label>
                      <input 
                        type="text" 
                        placeholder="Ex: Rua Direita, 123 2º Esq" 
                        value={manualForm.customerMorada}
                        onChange={(e) => setManualForm(prev => ({ ...prev, customerMorada: e.target.value }))}
                        className="w-full bg-white border border-forest/15 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#C5A059]"
                      />
                    </div>

                    {/* Cod Postal */}
                    <div className="space-y-1">
                      <label className="font-bold uppercase tracking-wider text-[10px] text-forest/50">Código Postal</label>
                      <input 
                        type="text" 
                        placeholder="Ex: 1000-123" 
                        maxLength={8}
                        value={manualForm.customerCodigoPostal}
                        onChange={(e) => setManualForm(prev => ({ ...prev, customerCodigoPostal: formatPostalCodePT(e.target.value) }))}
                        className="w-full bg-white border border-forest/15 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#C5A059]"
                      />
                    </div>

                    {/* Cidade */}
                    <div className="space-y-1">
                      <label className="font-bold uppercase tracking-wider text-[10px] text-forest/50">Cidade</label>
                      <input 
                        type="text" 
                        placeholder="Ex: Lisboa" 
                        value={manualForm.customerCidade}
                        onChange={(e) => setManualForm(prev => ({ ...prev, customerCidade: e.target.value }))}
                        className="w-full bg-white border border-forest/15 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#C5A059]"
                      />
                    </div>
                  </div>

                  {/* Acessórios & Embalamento Checklist */}
                  <div className="bg-white/80 border border-[#C5A059]/25 rounded-2xl p-4 space-y-2.5 text-left shadow-xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-forest/60 flex items-center gap-1.5 font-sans">
                      <Layers className="w-3.5 h-3.5 text-[#C5A059]" />
                      Acessórios & Embalamento
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs pt-1">
                      {/* 1. Etiqueta Couro */}
                      <div className={`p-2.5 rounded-xl border flex flex-col justify-between h-full min-w-0 transition-all ${manualForm.accessories?.etiqueta ? 'bg-[#FCFBF9] border-[#C5A059]/50 shadow-2xs' : 'bg-white border-forest/10 opacity-70'}`}>
                        <label className="flex items-center gap-2 cursor-pointer select-none font-medium text-forest min-w-0 w-full">
                          <input
                            type="checkbox"
                            checked={manualForm.accessories?.etiqueta ?? true}
                            onChange={(e) => setManualForm(prev => ({
                              ...prev,
                              accessories: { ...prev.accessories, etiqueta: e.target.checked }
                            }))}
                            className="rounded text-[#C5A059] focus:ring-[#C5A059] w-4 h-4 shrink-0"
                          />
                          <span className="text-xs sm:text-sm font-semibold truncate leading-tight min-w-0">Etiqueta Couro</span>
                        </label>
                        {(manualForm.accessories?.etiqueta ?? true) && (
                          <div className="flex items-center justify-between gap-1.5 pt-2 mt-2 border-t border-forest/10 text-xs w-full min-w-0">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-forest/50 shrink-0">Qtd:</span>
                            <div className="flex items-center gap-1 min-w-0 shrink-0">
                              <input
                                type="number"
                                min="1"
                                step="1"
                                value={manualForm.accessories?.etiquetaQty ?? 1}
                                onChange={(e) => setManualForm(prev => ({
                                  ...prev,
                                  accessories: { ...prev.accessories, etiquetaQty: Math.max(1, parseInt(e.target.value) || 1) }
                                }))}
                                className="w-14 sm:w-16 bg-white border border-forest/20 rounded-lg px-1.5 py-0.5 text-center font-bold text-forest text-xs focus:outline-none focus:border-[#C5A059] min-w-0"
                              />
                              <span className="text-[10px] text-forest/60 shrink-0">unid.</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* 2. Caixa Premium */}
                      <div className={`p-2.5 rounded-xl border flex flex-col justify-between h-full min-w-0 transition-all ${manualForm.accessories?.caixa ? 'bg-[#FCFBF9] border-[#C5A059]/50 shadow-2xs' : 'bg-white border-forest/10 opacity-70'}`}>
                        <label className="flex items-center gap-2 cursor-pointer select-none font-medium text-forest min-w-0 w-full">
                          <input
                            type="checkbox"
                            checked={manualForm.accessories?.caixa ?? true}
                            onChange={(e) => setManualForm(prev => ({
                              ...prev,
                              accessories: { ...prev.accessories, caixa: e.target.checked }
                            }))}
                            className="rounded text-[#C5A059] focus:ring-[#C5A059] w-4 h-4 shrink-0"
                          />
                          <span className="text-xs sm:text-sm font-semibold truncate leading-tight min-w-0">Caixa Premium</span>
                        </label>
                        {(manualForm.accessories?.caixa ?? true) && (
                          <div className="flex items-center justify-between gap-1.5 pt-2 mt-2 border-t border-forest/10 text-xs w-full min-w-0">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-forest/50 shrink-0">Qtd:</span>
                            <div className="flex items-center gap-1 min-w-0 shrink-0">
                              <input
                                type="number"
                                min="1"
                                step="1"
                                value={manualForm.accessories?.caixaQty ?? 1}
                                onChange={(e) => setManualForm(prev => ({
                                  ...prev,
                                  accessories: { ...prev.accessories, caixaQty: Math.max(1, parseInt(e.target.value) || 1) }
                                }))}
                                className="w-14 sm:w-16 bg-white border border-forest/20 rounded-lg px-1.5 py-0.5 text-center font-bold text-forest text-xs focus:outline-none focus:border-[#C5A059] min-w-0"
                              />
                              <span className="text-[10px] text-forest/60 shrink-0">unid.</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* 3. Saco Envelope */}
                      <div className={`p-2.5 rounded-xl border flex flex-col justify-between h-full min-w-0 transition-all ${manualForm.accessories?.sacoEnvelope ? 'bg-[#FCFBF9] border-[#C5A059]/50 shadow-2xs' : 'bg-white border-forest/10 opacity-70'}`}>
                        <label className="flex items-center gap-2 cursor-pointer select-none font-medium text-forest min-w-0 w-full">
                          <input
                            type="checkbox"
                            checked={manualForm.accessories?.sacoEnvelope ?? true}
                            onChange={(e) => setManualForm(prev => ({
                              ...prev,
                              accessories: { ...prev.accessories, sacoEnvelope: e.target.checked }
                            }))}
                            className="rounded text-[#C5A059] focus:ring-[#C5A059] w-4 h-4 shrink-0"
                          />
                          <span className="text-xs sm:text-sm font-semibold truncate leading-tight min-w-0">Saco Envelope</span>
                        </label>
                        {(manualForm.accessories?.sacoEnvelope ?? true) && (
                          <div className="flex items-center justify-between gap-1.5 pt-2 mt-2 border-t border-forest/10 text-xs w-full min-w-0">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-forest/50 shrink-0">Qtd:</span>
                            <div className="flex items-center gap-1 min-w-0 shrink-0">
                              <input
                                type="number"
                                min="1"
                                step="1"
                                value={manualForm.accessories?.sacoEnvelopeQty ?? 1}
                                onChange={(e) => setManualForm(prev => ({
                                  ...prev,
                                  accessories: { ...prev.accessories, sacoEnvelopeQty: Math.max(1, parseInt(e.target.value) || 1) }
                                }))}
                                className="w-14 sm:w-16 bg-white border border-forest/20 rounded-lg px-1.5 py-0.5 text-center font-bold text-forest text-xs focus:outline-none focus:border-[#C5A059] min-w-0"
                              />
                              <span className="text-[10px] text-forest/60 shrink-0">unid.</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* 4. Fecho Correr */}
                      <div className={`p-2.5 rounded-xl border flex flex-col justify-between h-full min-w-0 transition-all ${manualForm.accessories?.fecho ? 'bg-[#FCFBF9] border-[#C5A059]/50 shadow-2xs' : 'bg-white border-forest/10 opacity-70'}`}>
                        <label className="flex items-center gap-2 cursor-pointer select-none font-medium text-forest min-w-0 w-full">
                          <input
                            type="checkbox"
                            checked={manualForm.accessories?.fecho ?? false}
                            onChange={(e) => setManualForm(prev => ({
                              ...prev,
                              accessories: { ...prev.accessories, fecho: e.target.checked }
                            }))}
                            className="rounded text-[#C5A059] focus:ring-[#C5A059] w-4 h-4 shrink-0"
                          />
                          <span className="text-xs sm:text-sm font-semibold truncate leading-tight min-w-0">Fecho Correr</span>
                        </label>
                        {Boolean(manualForm.accessories?.fecho) && (
                          <div className="flex items-center justify-between gap-1.5 pt-2 mt-2 border-t border-forest/10 text-xs w-full min-w-0">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-forest/50 shrink-0">Qtd:</span>
                            <div className="flex items-center gap-1 min-w-0 shrink-0">
                              <input
                                type="number"
                                min="1"
                                step="1"
                                value={manualForm.accessories?.fechoQty ?? 1}
                                onChange={(e) => setManualForm(prev => ({
                                  ...prev,
                                  accessories: { ...prev.accessories, fechoQty: Math.max(1, parseInt(e.target.value) || 1) }
                                }))}
                                className="w-14 sm:w-16 bg-white border border-forest/20 rounded-lg px-1.5 py-0.5 text-center font-bold text-forest text-xs focus:outline-none focus:border-[#C5A059] min-w-0"
                              />
                              <span className="text-[10px] text-forest/60 shrink-0">unid.</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* 5. Forro Algodão */}
                      <div className={`p-2.5 rounded-xl border flex flex-col justify-between h-full min-w-0 transition-all ${manualForm.accessories?.forro ? 'bg-[#FCFBF9] border-[#C5A059]/50 shadow-2xs' : 'bg-white border-forest/10 opacity-70'}`}>
                        <label className="flex items-center gap-2 cursor-pointer select-none font-medium text-forest min-w-0 w-full">
                          <input
                            type="checkbox"
                            checked={manualForm.accessories?.forro ?? false}
                            onChange={(e) => setManualForm(prev => ({
                              ...prev,
                              accessories: { ...prev.accessories, forro: e.target.checked }
                            }))}
                            className="rounded text-[#C5A059] focus:ring-[#C5A059] w-4 h-4 shrink-0"
                          />
                          <span className="text-xs sm:text-sm font-semibold truncate leading-tight min-w-0">Forro Algodão</span>
                        </label>
                        {Boolean(manualForm.accessories?.forro) && (
                          <div className="flex items-center justify-between gap-1.5 pt-2 mt-2 border-t border-forest/10 text-xs w-full min-w-0">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-forest/50 shrink-0">Consumo:</span>
                            <div className="flex items-center gap-1 min-w-0 shrink-0">
                              <input
                                type="number"
                                min="0.01"
                                step="0.05"
                                value={manualForm.accessories?.forroMeters ?? 0.25}
                                onChange={(e) => setManualForm(prev => ({
                                  ...prev,
                                  accessories: { ...prev.accessories, forroMeters: Math.max(0.01, parseFloat(e.target.value) || 0.25) }
                                }))}
                                className="w-14 sm:w-16 bg-white border border-forest/20 rounded-lg px-1.5 py-0.5 text-center font-bold text-forest text-xs focus:outline-none focus:border-[#C5A059] min-w-0"
                              />
                              <span className="text-[10px] text-forest/60 shrink-0">metros</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* 6. Botão Madeira */}
                      <div className={`p-2.5 rounded-xl border flex flex-col justify-between h-full min-w-0 transition-all ${manualForm.accessories?.botao ? 'bg-[#FCFBF9] border-[#C5A059]/50 shadow-2xs' : 'bg-white border-forest/10 opacity-70'}`}>
                        <label className="flex items-center gap-2 cursor-pointer select-none font-medium text-forest min-w-0 w-full">
                          <input
                            type="checkbox"
                            checked={manualForm.accessories?.botao ?? false}
                            onChange={(e) => setManualForm(prev => ({
                              ...prev,
                              accessories: { ...prev.accessories, botao: e.target.checked }
                            }))}
                            className="rounded text-[#C5A059] focus:ring-[#C5A059] w-4 h-4 shrink-0"
                          />
                          <span className="text-xs sm:text-sm font-semibold truncate leading-tight min-w-0">Botão Madeira</span>
                        </label>
                        {Boolean(manualForm.accessories?.botao) && (
                          <div className="flex items-center justify-between gap-1.5 pt-2 mt-2 border-t border-forest/10 text-xs w-full min-w-0">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-forest/50 shrink-0">Qtd:</span>
                            <div className="flex items-center gap-1 min-w-0 shrink-0">
                              <input
                                type="number"
                                min="1"
                                step="1"
                                value={manualForm.accessories?.botaoQty ?? 1}
                                onChange={(e) => setManualForm(prev => ({
                                  ...prev,
                                  accessories: { ...prev.accessories, botaoQty: Math.max(1, parseInt(e.target.value) || 1) }
                                }))}
                                className="w-14 sm:w-16 bg-white border border-forest/20 rounded-lg px-1.5 py-0.5 text-center font-bold text-forest text-xs focus:outline-none focus:border-[#C5A059] min-w-0"
                              />
                              <span className="text-[10px] text-forest/60 shrink-0">unid.</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* NIF */}
                    <div className="space-y-1">
                      <label className="font-bold uppercase tracking-wider text-[10px] text-forest/50">NIF (Opcional)</label>
                      <input 
                        type="text" 
                        placeholder="Ex: 123456789" 
                        maxLength={9}
                        value={manualForm.customerNif}
                        onChange={(e) => setManualForm(prev => ({ ...prev, customerNif: e.target.value.replace(/\D/g, '') }))}
                        className="w-full bg-white border border-forest/15 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#C5A059]"
                      />
                    </div>

                    {/* Payment Method */}
                    <div className="space-y-1">
                      <label className="font-bold uppercase tracking-wider text-[10px] text-forest/50">Método de Pagamento</label>
                      <select 
                        value={manualForm.paymentMethod}
                        onChange={(e) => setManualForm(prev => ({ ...prev, paymentMethod: e.target.value }))}
                        className="w-full bg-white border border-forest/15 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#C5A059]"
                      >
                        <option value="card">Cartão de Crédito</option>
                        <option value="mbway">MB WAY</option>
                        <option value="multibanco">Multibanco</option>
                        <option value="manual">Dinheiro / Transferência</option>
                      </select>
                    </div>

                    {/* Status */}
                    <div className="space-y-1">
                      <label className="font-bold uppercase tracking-wider text-[10px] text-forest/50">Estado da Encomenda</label>
                      <select 
                        value={manualForm.status}
                        onChange={(e) => setManualForm(prev => ({ ...prev, status: e.target.value }))}
                        className="w-full bg-white border border-forest/15 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#C5A059]"
                      >
                        <option value="paid">Paga (No Atelier)</option>
                        <option value="pending_payment">Aguardando Pagamento</option>
                        <option value="shipped">Expedida (CTT)</option>
                      </select>
                    </div>

                    {/* Priority */}
                    <div className="space-y-1">
                      <label className="font-bold uppercase tracking-wider text-[10px] text-forest/50">Prioridade</label>
                      <select 
                        value={manualForm.priority}
                        onChange={(e) => setManualForm(prev => ({ ...prev, priority: e.target.value }))}
                        className="w-full bg-white border border-forest/15 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#C5A059]"
                      >
                        <option value="NORMAL">NORMAL</option>
                        <option value="ALTA (Atelier Urgente)">URGENTE (Atelier)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button 
                      type="button" 
                      onClick={() => setShowManualForm(false)}
                      className="px-4 py-2 bg-cream hover:bg-cream/70 text-forest rounded-xl font-medium cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit" 
                      disabled={isCreatingManual}
                      className="px-5 py-2 bg-[#243119] hover:bg-[#1a2412] text-cream rounded-xl font-medium flex items-center gap-2 cursor-pointer"
                    >
                      {isCreatingManual ? (
                        <>
                          <span className="animate-spin rounded-full h-3 w-3 border border-cream border-t-transparent" />
                          Gravando...
                        </>
                      ) : (
                        "Gravar e Adicionar Encomenda"
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* ORDERS LIST CONTAINER */}
              {loadingOrders && orders.length === 0 ? (
                <div className="py-20 text-center space-y-3">
                  <span className="animate-spin inline-block rounded-full h-8 w-8 border-2 border-[#C5A059] border-t-transparent" />
                  <p className="text-sm text-forest/50">Carregando a base de dados do atelier...</p>
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="bg-white border border-forest/5 py-16 rounded-[20px] text-center space-y-2">
                  <div className="text-4xl">📦</div>
                  <h5 className="font-serif text-base font-medium">Nenhuma encomenda encontrada</h5>
                  <p className="text-xs text-forest/40 max-w-sm mx-auto">Não há registros que correspondam aos filtros de pesquisa atuais.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredOrders.map((order) => {
                    const isUpdating = actionLoading[order.orderId];
                    const successMsg = actionSuccess[order.orderId];
                    const trInput = trackingInputs[order.orderId] || '';

                    return (
                      <div 
                        key={order.orderId}
                        className="bg-white border border-forest/5 rounded-[20px] shadow-[0_4px_16px_-4px_rgba(36,49,25,0.02)] overflow-hidden transition-all hover:shadow-[0_8px_30px_-6px_rgba(36,49,25,0.06)]"
                      >
                        {/* Header Row */}
                        <div className="px-6 py-4 bg-[#FCFBF9] border-b border-forest/5 flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono uppercase bg-forest/5 text-forest/70 px-2.5 py-1 rounded-md font-bold tracking-wider">
                              ID: {order.orderId}
                            </span>
                            <span className="text-[10px] text-forest/40 font-medium">
                              Criada em: {new Date(order.createdAt).toLocaleString('pt-PT')}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Priority Badge */}
                            {order.priority === 'ALTA (Atelier Urgente)' ? (
                              <span className="text-[9px] uppercase font-bold tracking-wider text-red-700 bg-red-50 border border-red-200/30 px-2.5 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                                <AlertTriangle className="w-3 h-3 shrink-0" />
                                Urgente
                              </span>
                            ) : (
                              <span className="text-[9px] uppercase font-medium tracking-wider text-forest/40 bg-forest/5 px-2.5 py-0.5 rounded-full">
                                Normal
                              </span>
                            )}

                            {/* Status Badge */}
                            {order.status === 'pending_payment' && (
                              <span className="text-[9px] uppercase font-bold tracking-wider text-amber-700 bg-amber-50 border border-amber-200/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                <Clock className="w-3 h-3 shrink-0" />
                                Aguardar Liquidação
                              </span>
                            )}
                            {order.status === 'paid' && (
                              <span className="text-[9px] uppercase font-bold tracking-wider text-green-800 bg-green-50 border border-green-200/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                <CheckCircle className="w-3 h-3 shrink-0" />
                                No Atelier
                              </span>
                            )}
                            {order.status === 'shipped' && (
                              <span className="text-[9px] uppercase font-bold tracking-wider text-amber-950 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                <Truck className="w-3 h-3 shrink-0 text-amber-600" />
                                A Caminho
                              </span>
                            )}
                            {order.status === 'delivered' && (
                              <span className="text-[9px] uppercase font-bold tracking-wider text-emerald-900 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                <Check className="w-3 h-3 shrink-0 text-emerald-600" />
                                Entregue
                              </span>
                            )}
                            {order.status === 'failed' && (
                              <span className="text-[9px] uppercase font-bold tracking-wider text-red-700 bg-red-50 border border-red-100 px-2.5 py-0.5 rounded-full">
                                Cancelada
                              </span>
                            )}

                            {/* Order Management Actions */}
                            <div className="flex items-center gap-1.5 ml-2 pl-2 border-l border-forest/10">
                              {order.status !== 'failed' && (
                                <button
                                  type="button"
                                  onClick={() => handleUpdateStatus(order.orderId, 'failed')}
                                  disabled={isUpdating}
                                  title="Cancelar Encomenda"
                                  className="px-2.5 py-1 text-amber-900 hover:text-amber-950 bg-amber-50 hover:bg-amber-100 rounded-[6px] transition-all cursor-pointer border border-amber-200/60 flex items-center gap-1 text-[10px] font-medium tracking-wide shadow-2xs"
                                >
                                  <Ban className="w-3 h-3 text-amber-700 shrink-0" />
                                  <span>Cancelar</span>
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleDeleteOrder(order.orderId)}
                                disabled={isUpdating}
                                title="Eliminar Encomenda do Sistema"
                                className="px-2.5 py-1 text-red-700 hover:text-red-900 bg-red-50 hover:bg-red-100 rounded-[6px] transition-all cursor-pointer border border-red-200/60 flex items-center gap-1 text-[10px] font-medium tracking-wide shadow-2xs"
                              >
                                <Trash2 className="w-3 h-3 text-red-600 shrink-0" />
                                <span>Eliminar</span>
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Order Body Grid */}
                        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
                          {/* Col 1: Customer Details (5 Cols) */}
                          <div className="lg:col-span-5 space-y-4">
                            <div className="space-y-1">
                              <span className="text-[9px] font-bold text-forest/35 uppercase tracking-wider block">Dados de Entrega</span>
                              <div className="font-medium text-sm text-forest">{order.customer?.nome}</div>
                              <div className="text-xs text-forest/75 space-y-0.5">
                                <div className="flex items-center gap-1.5">
                                  <Mail className="w-3.5 h-3.5 text-forest/35" />
                                  <a href={`mailto:${order.customer?.email}`} className="hover:underline text-forest/80 font-mono">{order.customer?.email}</a>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Phone className="w-3.5 h-3.5 text-forest/35" />
                                  <a href={`tel:${order.customer?.telefone}`} className="hover:underline text-forest/80 font-mono">{formatPhoneReadable(order.customer?.telefone)}</a>
                                </div>
                                <div className="flex items-start gap-1.5 pt-1">
                                  <MapPin className="w-3.5 h-3.5 text-forest/35 mt-0.5 shrink-0" />
                                  <span>
                                    {order.customer?.morada}<br />
                                    {order.customer?.codigoPostal}, {order.customer?.cidade}
                                  </span>
                                </div>
                              </div>
                              {order.customer?.email && (
                                <div className="pt-2">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenCustomerProfile(order.customer.email)}
                                    className="text-[10px] font-medium text-[#C5A059] hover:text-[#9e7d3e] flex items-center gap-1.5 transition-all cursor-pointer bg-[#FCF8F2] hover:bg-[#F7EFE3] px-2.5 py-1 rounded-[6px] border border-[#C5A059]/20 shadow-2xs font-serif italic"
                                  >
                                    <User className="w-3 h-3 text-[#C5A059]" /> Ver Ficha de Cliente
                                  </button>
                                </div>
                              )}
                            </div>

                            <div className="pt-2 border-t border-forest/5 flex items-center justify-between">
                              <div>
                                <span className="text-[9px] font-bold text-forest/35 uppercase tracking-wider block">NIF Contribuinte</span>
                                <span className="text-xs font-mono font-bold text-forest">
                                  {order.customer?.nif ? order.customer.nif : 'Consumidor Final (Sem NIF)'}
                                </span>
                              </div>
                              <div className="text-right">
                                <span className="text-[9px] font-bold text-forest/35 uppercase tracking-wider block">Método de Pagamento</span>
                                <span className="text-xs font-semibold text-forest uppercase">
                                  {order.paymentMethod === 'mbway' ? 'MB WAY' : order.paymentMethod === 'multibanco' ? 'Multibanco' : 'Cartão'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Col 2: Product & Selections (4 Cols) */}
                          <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-forest/5 lg:pl-6 space-y-4">
                            <div className="space-y-2">
                              <span className="text-[9px] font-bold text-forest/35 uppercase tracking-wider block">Peça Selecionada</span>
                              <div className="font-serif text-base font-medium text-forest">{order.productName}</div>
                              
                              <div className="bg-[#FCF8F2]/60 border border-[#C5A059]/10 rounded-xl p-3.5 space-y-1.5 text-xs text-forest/85">
                                <div className="flex justify-between">
                                  <span className="text-forest/40">Cor:</span>
                                  <span className="font-semibold">{order.selections?.cor}</span>
                                </div>
                                 {(order.selections?.hasSize !== false && Boolean(order.selections?.tamanho) && !['n/a', 'na', 'único', 'unico', 'padrão', 'padrao', ''].includes(String(order.selections.tamanho).toLowerCase().trim())) && (
                                   <div className="flex justify-between">
                                     <span className="text-forest/40">Tamanho:</span>
                                     <span className="font-semibold">{order.selections.tamanho}</span>
                                   </div>
                                 )}
                                <div className="flex justify-between">
                                  <span className="text-forest/40">Quantidade:</span>
                                  <span className="font-semibold">{order.selections?.quantidade || '1'}</span>
                                </div>
                                <div className="pt-1.5 border-t border-[#C5A059]/10 flex justify-between font-serif text-sm">
                                  <span className="text-[#C5A059] italic">Preço total:</span>
                                  <span className="font-bold text-forest">{order.price}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Col 3: Actions & Sandbox Email Hub (3 Cols) */}
                          <div className="lg:col-span-3 border-t lg:border-t-0 lg:border-l border-forest/5 lg:pl-6 space-y-4 flex flex-col justify-between">
                            
                            {/* Tracking Panel & Email Triggers */}
                            <div className="space-y-3">
                              <span className="text-[9px] font-bold text-forest/35 uppercase tracking-wider block">Estado & Código Rastreio CTT</span>
                              
                              {order.status === 'paid' && (
                                <div className="space-y-2">
                                  <div className="relative">
                                    <input 
                                      type="text" 
                                      placeholder="Ex: DA123456789PT"
                                      value={trInput}
                                      onChange={(e) => setTrackingInputs(prev => ({ ...prev, [order.orderId]: e.target.value.toUpperCase() }))}
                                      className="w-full bg-[#FCFBF9] border border-forest/10 focus:border-[#C5A059] focus:outline-none rounded-[6px] px-3 py-1.5 text-xs font-mono uppercase"
                                    />
                                  </div>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                    <button
                                      onClick={() => handleDispatchTracking(order.orderId)}
                                      disabled={isUpdating || !trInput}
                                      className="w-full px-2.5 py-1.5 bg-[#243119] hover:bg-[#1a2412] text-cream rounded-[6px] text-[10px] font-medium tracking-wide shadow-2xs transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-40"
                                    >
                                      <Truck className="w-3.5 h-3.5 text-[#C5A059]" />
                                      Expedir CTT
                                    </button>
                                    <button
                                      onClick={() => {
                                        if (window.confirm(`Deseja marcar a encomenda ${order.orderId} como 'Entregue em Mão / Concluída' sem gerar código CTT ou disparar e-mail de envio?`)) {
                                          handleUpdateStatus(order.orderId, 'delivered');
                                        }
                                      }}
                                      disabled={isUpdating}
                                      className="w-full px-2.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-[6px] text-[10px] font-medium tracking-wide shadow-2xs transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-40"
                                      title="Para levantamentos no atelier ou entregas presenciais"
                                    >
                                      <CheckCircle className="w-3.5 h-3.5" />
                                      Entrega em Mão
                                    </button>
                                  </div>
                                </div>
                              )}

                              {order.status === 'shipped' && (
                                <div className="space-y-2.5">
                                  <div className="bg-[#E6ECDF]/30 border border-[#BACAA5]/40 rounded-xl p-2.5 text-xs space-y-2">
                                    <div className="flex items-center gap-1 text-[#243119] font-medium font-sans">
                                      <ShieldCheck className="w-4 h-4 text-[#C5A059] shrink-0" />
                                      <span>Rastreio CTT Ativo</span>
                                    </div>
                                    <div className="font-mono font-bold text-[#243119] text-center bg-white border border-forest/5 rounded px-2 py-1">
                                      {order.trackingCode}
                                    </div>
                                    <a 
                                      href={`https://www.ctt.pt/feapl_2/app/open/objectSearch/objectSearch.jspx?lang=def&objects=${order.trackingCode}`}
                                      target="_blank" 
                                      rel="noreferrer"
                                      className="px-2 py-1 bg-white hover:bg-[#FCF8F2] border border-[#C5A059]/30 text-[#C5A059] hover:text-[#A68244] rounded-[6px] text-[10px] font-medium tracking-wide flex items-center justify-center gap-1 transition-all shadow-2xs"
                                    >
                                      Acompanhar nos CTT
                                      <ExternalLink className="w-3 h-3" />
                                    </a>
                                  </div>
                                  <button
                                    onClick={() => handleUpdateStatus(order.orderId, 'delivered')}
                                    disabled={isUpdating}
                                    className="w-full px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-[6px] text-[10px] font-medium tracking-wide shadow-2xs transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-40"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                    Confirmar Entrega
                                  </button>
                                </div>
                              )}

                              {order.status === 'delivered' && (
                                <div className="bg-green-50 border border-green-200/50 rounded-xl p-3 text-xs space-y-2">
                                  <div className="flex items-center gap-1 text-green-800 font-medium font-sans">
                                    <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
                                    <span>Encomenda Entregue / Concluída</span>
                                  </div>
                                  {order.trackingCode ? (
                                    <div className="text-[11px] text-forest/70">
                                      Código de rastreio usado: <span className="font-mono font-bold">{order.trackingCode}</span>
                                    </div>
                                  ) : (
                                    <div className="text-[11px] text-forest/70 font-medium">
                                      Modalidade: <span className="font-bold">Entrega em Mão / Concluída</span>
                                    </div>
                                  )}
                                  <p className="text-[10px] text-forest/50">Esta encomenda está concluída e arquivada.</p>
                                </div>
                              )}

                              {order.status === 'pending_payment' && (
                                <div className="space-y-2">
                                  <div className="text-[10px] text-amber-800 bg-amber-50 border border-amber-200/20 p-2.5 rounded-lg flex items-start gap-1.5">
                                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                                    <span>Aguardando transferência ou pagamento multibanco.</span>
                                  </div>
                                  <div className="grid grid-cols-2 gap-1.5">
                                    <button
                                      onClick={() => handleSimulateWebhook(order.orderId, 'simulate_payment')}
                                      disabled={isUpdating}
                                      className="px-2 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-[6px] text-[10px] font-medium tracking-wide transition-all cursor-pointer text-center flex items-center justify-center gap-1 shadow-2xs"
                                    >
                                      Simular Pago
                                    </button>
                                    <button
                                      onClick={() => handleSimulateWebhook(order.orderId, 'simulate_failure')}
                                      disabled={isUpdating}
                                      className="px-2 py-1.5 bg-red-700 hover:bg-red-800 text-white rounded-[6px] text-[10px] font-medium tracking-wide transition-all cursor-pointer text-center flex items-center justify-center gap-1 shadow-2xs"
                                    >
                                      Simular Falha
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Email Previews Hub */}
                            <div className="pt-3 border-t border-forest/5 space-y-1.5">
                              <span className="text-[9px] font-bold text-forest/35 uppercase tracking-wider block">Comprovativos de E-mail</span>
                              <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                                {/* Ver Recibo / Confirmação Cliente */}
                                <button
                                  type="button"
                                  onClick={() => handleOpenEmailPreview(order.orderId, 'customer')}
                                  className="px-2.5 py-1.5 bg-[#FCF8F2] border border-[#C5A059]/20 text-[#243119] rounded-[6px] hover:bg-[#F3EFE9] flex items-center justify-center gap-1.5 font-medium cursor-pointer transition-all shadow-2xs"
                                >
                                  <Eye className="w-3 h-3 text-[#C5A059]" />
                                  Ver Recibo
                                </button>

                                {/* Notificação do Atelier */}
                                <button
                                  type="button"
                                  onClick={() => handleOpenEmailPreview(order.orderId, 'admin')}
                                  className="px-2.5 py-1.5 bg-[#FCF8F2] border border-[#C5A059]/20 text-[#243119] rounded-[6px] hover:bg-[#F3EFE9] flex items-center justify-center gap-1.5 font-medium cursor-pointer transition-all shadow-2xs"
                                >
                                  <Eye className="w-3 h-3 text-[#C5A059]" />
                                  Notif. Atelier
                                </button>

                                {/* Ver E-mail CTT Enviado */}
                                <button
                                  type="button"
                                  onClick={() => handleOpenEmailPreview(order.orderId, 'shipped')}
                                  className="px-2.5 py-1.5 bg-[#E6ECDF] border border-[#BACAA5]/40 text-[#243119] rounded-[6px] hover:bg-[#DCE4D4] flex items-center justify-center gap-1.5 font-medium col-span-2 cursor-pointer transition-all shadow-2xs"
                                >
                                  <Eye className="w-3 h-3 text-green-700" />
                                  Ver E-mail CTT Enviado
                                </button>

                                {/* Instruções Multibanco */}
                                {order.multibancoRef && (
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEmailPreview(order.orderId, 'multibanco')}
                                    className="px-2.5 py-1.5 bg-amber-50 border border-amber-200/40 text-amber-900 rounded-[6px] hover:bg-amber-100/60 flex items-center justify-center gap-1.5 font-medium col-span-2 cursor-pointer transition-all shadow-2xs"
                                  >
                                    <Eye className="w-3 h-3 text-amber-600" />
                                    Ver Instruções Multibanco
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Status messages */}
                            {successMsg && (
                              <div className="bg-green-50 text-green-800 border border-green-200/30 rounded-lg p-2 text-[10px] text-center font-medium animate-fade-in mt-2">
                                {successMsg}
                              </div>
                            )}

                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {activeTab === 'logs' && (
            /* AUDIT LOGS VIEW */
            <div className="space-y-6">
              <div className="bg-white border border-forest/5 p-5 rounded-[16px] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="font-serif text-sm font-medium text-forest">Auditoria</h4>
                </div>
                
                {/* Log Search box */}
                <div className="relative w-full max-w-xs">
                  <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-forest/35" />
                  <input 
                    type="text" 
                    placeholder="Pesquisar logs por ID, conteúdo ou encomenda..."
                    value={logSearchQuery}
                    onChange={(e) => setLogSearchQuery(e.target.value)}
                    className="w-full bg-cream/20 border border-forest/10 focus:border-[#C5A059] focus:outline-none rounded-xl pl-8 pr-3 py-2 text-xs transition-all"
                  />
                </div>
              </div>

              {loadingLogs && logs.length === 0 ? (
                <div className="py-20 text-center space-y-3">
                  <span className="animate-spin inline-block rounded-full h-8 w-8 border-2 border-[#C5A059] border-t-transparent" />
                  <p className="text-sm text-forest/50">Carregando histórico de auditoria...</p>
                </div>
              ) : filteredLogs.length === 0 ? (
                <div className="bg-white border border-forest/5 py-16 rounded-[20px] text-center">
                  <p className="text-xs text-forest/50">Sem registos de atividade de momento.</p>
                </div>
              ) : (
                <div className="bg-white border border-forest/5 rounded-[20px] overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-cream/10 border-b border-forest/5 text-forest/50 font-bold uppercase tracking-wider text-[10px]">
                          <th className="px-6 py-4">ID / Hora</th>
                          <th className="px-6 py-4">Utilizador</th>
                          <th className="px-6 py-4">Ação / Evento</th>
                          <th className="px-6 py-4">Descrição</th>
                          <th className="px-6 py-4 text-right">ID Encomenda</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-forest/5">
                        {filteredLogs.map((log) => {
                          let badgeColor = "bg-amber-50 text-amber-800 border-amber-200/30";
                          let label = "Alteração";
                          
                          if (log.event === 'state_change') {
                            badgeColor = "bg-blue-50 text-blue-800 border-blue-200/20";
                            label = "Estado Encomenda";
                          } else if (log.event === 'manual_order_creation') {
                            badgeColor = "bg-green-50 text-green-800 border-green-200/20";
                            label = "Registo Manual";
                          } else if (log.event === 'ctt_label_generation') {
                            badgeColor = "bg-[#FCF8F2] text-[#A68244] border-[#C5A059]/20";
                            label = "Etiqueta CTT";
                          }

                          return (
                            <tr key={log.id} className="hover:bg-cream/5 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap font-mono space-y-1">
                                <div className="font-bold text-forest/80 text-[11px]">{log.id}</div>
                                <div className="text-[10px] text-forest/40">
                                  {new Date(log.timestamp).toLocaleString('pt-PT')}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap font-sans font-medium text-forest/70">
                                {log.user || 'Carolina (Atelier)'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-block px-2.5 py-1 text-[10px] font-semibold rounded-full border ${badgeColor}`}>
                                  {label}
                                </span>
                              </td>
                              <td className="px-6 py-4 font-sans text-forest/80 max-w-md">
                                <div className="font-medium leading-relaxed">{log.description}</div>
                                {log.details && Object.keys(log.details).length > 0 && (
                                  <div className="mt-1.5 p-2 bg-[#FCFBF9] border border-forest/5 rounded-lg text-[10px] font-mono text-forest/60 space-y-0.5">
                                    {Object.entries(log.details).map(([k, v]) => (
                                      <div key={k}>
                                        <span className="font-bold text-forest/40 uppercase">{k}:</span> {String(v)}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right font-mono text-forest/60 font-medium">
                                {log.orderId ? (
                                  <span className="bg-forest/5 px-2 py-1 rounded-md text-[10px] font-bold">
                                    {log.orderId}
                                  </span>
                                ) : (
                                  "-"
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* CMS CATÁLOGO VIEW (FASE 2) */}
          {activeTab === 'catalog' && (
            <div className="space-y-6">
              <div className="bg-white border border-forest/5 p-5 rounded-[16px] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="font-serif text-sm font-medium text-forest">CMS do Catálogo de Produtos</h4>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const newProd = {
                        id: `p-${Date.now()}`,
                        name: 'Nova Peça em Crochet',
                        price: '25€',
                        img: 'https://i.ibb.co/L8N8b9p/african-flower-pouch.jpg',
                        description: 'Peça feita à mão com amor e afeto.',
                        material: 'Fio 100% Algodão',
                        care: 'Lavar à mão com água fria',
                        dimensions: '15 x 15 cm',
                        hidden: false,
                        availableColors: ['Natural', 'Rosa Pálido', 'Verde Musgo']
                      };
                      setEditingProduct({ isNew: true, product: newProd, categoryId: selectedCategoryId });
                    }}
                    className="px-4 py-2 bg-[#243119] hover:bg-[#1a2412] text-cream rounded-xl text-xs font-bold tracking-wider uppercase flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Adicionar Produto
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      setIsSavingCatalog(true);
                      try {
                        const res = await fetch(`${API_BASE_URL}/api/admin/catalog/save`, {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            'x-admin-password': password
                          },
                          body: JSON.stringify({ categories: catalog })
                        });
                        const data = await res.json();
                        if (res.ok && data.success) {
                          setCatalog(data.categories || []);
                          window.dispatchEvent(new CustomEvent('catalog-updated'));
                          triggerNotification("Catálogo do Atelier guardado e publicado com sucesso!");
                        } else {
                          alert(data.error || "Erro ao guardar catálogo.");
                        }
                      } catch (err) {
                        alert("Erro de rede ao guardar catálogo.");
                      } finally {
                        setIsSavingCatalog(false);
                      }
                    }}
                    disabled={isSavingCatalog}
                    className="px-4 py-2 bg-[#C5A059] hover:bg-[#a68244] text-white rounded-xl text-xs font-bold tracking-wider uppercase flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Save className="w-3.5 h-3.5" /> Guardar Alterações
                  </button>
                </div>
              </div>

              {catalogError && (
                <div className="bg-red-50 text-red-800 border border-red-100 rounded-xl p-4 text-xs">
                  {catalogError}
                </div>
              )}

              {loadingCatalog ? (
                <div className="text-center py-12 text-forest/40 text-xs flex flex-col items-center gap-2">
                  <RefreshCw className="animate-spin w-6 h-6 text-[#C5A059]" />
                  A carregar catálogo do Atelier...
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {/* Category selector column */}
                  <div className="lg:col-span-1 bg-white border border-forest/5 p-3 sm:p-4 rounded-[16px] shadow-sm space-y-2 h-fit">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-forest/35 block mb-1 lg:mb-2">Coleções Ativas</span>
                    <div className="flex lg:flex-col overflow-x-auto lg:overflow-visible gap-2 no-scrollbar pb-1 lg:pb-0">
                      {catalog.map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setSelectedCategoryId(cat.id)}
                          className={`shrink-0 lg:w-full text-left px-3.5 py-2.5 sm:py-3 rounded-xl transition-all flex items-center justify-between gap-3 text-xs font-medium cursor-pointer ${
                            selectedCategoryId === cat.id
                              ? 'bg-cream/70 border border-forest/15 text-[#243119] font-bold shadow-sm'
                              : 'text-forest/60 hover:bg-cream/20 hover:text-forest'
                          }`}
                        >
                          <span className="truncate">{cat.name}</span>
                          <span className="bg-forest/5 px-2 py-0.5 rounded-full text-[10px] font-bold text-forest/50 shrink-0">
                            {cat.products ? cat.products.length : 0}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Products Grid column */}
                  <div className="lg:col-span-3 space-y-4">
                    {catalog.filter(cat => cat.id === selectedCategoryId).map((currentCat) => (
                      <div key={currentCat.id} className="space-y-4">
                        <div className="flex items-center justify-between bg-cream/15 p-4 rounded-xl border border-forest/5">
                          <div>
                            <h5 className="font-serif text-sm font-bold text-forest">{currentCat.name}</h5>
                            <p className="text-[11px] text-forest/40 italic">{currentCat.items || 'Sem descrição'}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const newName = prompt("Alterar nome da coleção:", currentCat.name);
                              const newItems = prompt("Alterar resumo/peças (ex: Coasters, Cushions):", currentCat.items);
                              if (newName !== null) {
                                const updated = catalog.map(c => {
                                  if (c.id === currentCat.id) {
                                    return { ...c, name: newName, items: newItems || c.items };
                                  }
                                  return c;
                                });
                                setCatalog(updated);
                              }
                            }}
                            className="text-[10px] font-bold text-[#C5A059] hover:underline uppercase tracking-wider cursor-pointer"
                          >
                            Editar Coleção
                          </button>
                        </div>

                        {(!currentCat.products || currentCat.products.length === 0) ? (
                          <div className="bg-white border border-dashed border-forest/15 rounded-xl p-8 text-center text-xs text-forest/40">
                            Nenhum produto nesta coleção. Clique em "Adicionar Produto" para começar!
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {currentCat.products.map((prod: any) => (
                              <div
                                key={prod.id}
                                className={`bg-white border p-4 rounded-[16px] shadow-sm flex gap-4 transition-all ${
                                  prod.hidden ? 'opacity-65 border-dashed border-forest/10 bg-gray-50/50' : 'border-forest/5'
                                }`}
                              >
                                <img
                                  src={prod.img}
                                  alt={prod.name}
                                  referrerPolicy="no-referrer"
                                  loading="lazy"
                                  decoding="async"
                                  className="w-16 h-16 rounded-xl object-cover border border-forest/5 bg-cream/20 shrink-0"
                                />
                                <div className="flex-1 min-w-0 space-y-1 text-left">
                                  <div className="flex items-start justify-between gap-2">
                                    <h6 className="font-serif text-xs font-semibold text-forest truncate">{prod.name}</h6>
                                    <span className="font-mono text-xs font-bold text-[#C5A059]">{prod.price}</span>
                                  </div>
                                  <p className="text-[10px] text-forest/40 line-clamp-1 italic">{prod.description}</p>

                                  {/* Finished product stock & crafting time badges */}
                                  <div className="flex gap-1.5 pt-1 flex-wrap">
                                    <span className={`px-2.5 py-0.5 rounded-full text-[8.5px] font-semibold uppercase tracking-wider border ${
                                      prod.stock > 0 
                                        ? 'bg-emerald-50/50 text-emerald-800 border-emerald-500/15' 
                                        : 'bg-amber-50/50 text-amber-800 border-amber-500/15'
                                    }`}>
                                      {prod.stock > 0 ? `${prod.stock} em Stock` : `Por Encomenda (${prod.craftingTime || 10} dias)`}
                                    </span>
                                  </div>
                                  
                                  {/* Yarn colors display */}
                                  <div className="flex flex-wrap gap-1 pt-1">
                                    {prod.availableColors && Array.isArray(prod.availableColors) ? (
                                      prod.availableColors.map((col: string, idx: number) => (
                                        <span key={idx} className="bg-white/80 border border-forest/10 px-1.5 py-0.5 rounded text-[9px] font-medium text-forest/70 flex items-center gap-1 shadow-2xs">
                                          <YarnSwatch name={col} size="w-3.5 h-3.5 rounded-sm" />
                                          <span>{col}</span>
                                        </span>
                                      ))
                                    ) : (
                                      <span className="text-[8px] text-forest/30 italic">Sem cores específicas</span>
                                    )}
                                  </div>

                                  {/* Interactive admin actions */}
                                  <div className="flex items-center justify-between border-t border-forest/5 pt-2.5 mt-2 text-[10px]">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const updatedCatalog = catalog.map(c => {
                                          if (c.id === currentCat.id) {
                                            return {
                                              ...c,
                                              products: c.products.map((p: any) => {
                                                if (p.id === prod.id) {
                                                  return { ...p, hidden: !p.hidden };
                                                }
                                                return p;
                                              })
                                            };
                                          }
                                          return c;
                                        });
                                        setCatalog(updatedCatalog);
                                      }}
                                      className={`font-semibold flex items-center gap-1 cursor-pointer hover:underline ${
                                        prod.hidden ? 'text-green-700' : 'text-amber-600'
                                      }`}
                                    >
                                      {prod.hidden ? (
                                        <>
                                          <Check className="w-3 h-3" /> Reativar
                                        </>
                                      ) : (
                                        <>
                                          <EyeOff className="w-3 h-3" /> Ocultar Temporariamente
                                        </>
                                      )}
                                    </button>

                                    <div className="flex items-center gap-2">
                                      <button
                                        type="button"
                                        onClick={() => setEditingProduct({ isNew: false, product: prod, categoryId: currentCat.id })}
                                        className="text-forest/60 hover:text-forest font-bold flex items-center gap-0.5 cursor-pointer hover:underline"
                                      >
                                        <Edit className="w-2.5 h-2.5" /> Editar
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          if (confirm(`Tem a certeza que deseja eliminar ${prod.name} permanentemente do catálogo?`)) {
                                            const updatedCatalog = catalog.map(c => {
                                              if (c.id === currentCat.id) {
                                                return {
                                                  ...c,
                                                  products: c.products.filter((p: any) => p.id !== prod.id)
                                                };
                                              }
                                              return c;
                                            });
                                            setCatalog(updatedCatalog);
                                          }
                                        }}
                                        className="text-red-600 hover:text-red-800 font-bold flex items-center gap-0.5 cursor-pointer hover:underline"
                                      >
                                        <Trash className="w-2.5 h-2.5" /> Eliminar
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* PRODUCT CREATION/EDITING FLOATING OVERLAY FORM */}
              {editingProduct && (
                <div className="fixed inset-0 bg-[#243119]/40 backdrop-blur-sm flex items-center justify-center z-[110] p-0 sm:p-4">
                  <div data-lenis-prevent className="bg-white border-0 sm:border border-forest/10 rounded-none sm:rounded-[24px] max-w-lg w-full h-full sm:h-auto max-h-screen sm:max-h-[90vh] p-4 sm:p-6 shadow-2xl text-left space-y-4 overflow-y-auto flex flex-col justify-between">
                    <div className="flex items-center justify-between border-b border-forest/5 pb-3 sticky top-0 bg-white z-20 shrink-0 pt-1">
                      <h5 className="font-serif text-sm sm:text-base font-bold text-forest pr-2 truncate">
                        {editingProduct.isNew ? 'Adicionar Nova Peça Única' : `Editar Peça: ${editingProduct.product.name}`}
                      </h5>
                      <button
                        type="button"
                        onClick={() => setEditingProduct(null)}
                        className="p-1 text-forest/40 hover:text-forest hover:bg-forest/5 rounded-full cursor-pointer transition-colors shrink-0"
                        aria-label="Fechar"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        const prodForm = editingProduct.product;
                        
                        // Parse availableColors if input is a string
                        let parsedColors = prodForm.availableColors;
                        if (typeof parsedColors === 'string') {
                          parsedColors = (parsedColors as string)
                            .split(',')
                            .map(c => c.trim())
                            .filter(Boolean);
                        }

                        // Sanitize colorConsumptions: convert commas (,) to dots (.) and parse as numeric float
                        const rawConsumptions = prodForm.colorConsumptions || {};
                        const sanitizedConsumptions: Record<string, number> = {};

                        for (const [cName, cVal] of Object.entries(rawConsumptions)) {
                          if (cVal !== undefined && cVal !== null && cVal !== '') {
                            const strVal = String(cVal).replace(',', '.').trim();
                            const numVal = parseFloat(strVal);
                            if (!isNaN(numVal) && numVal > 0) {
                              sanitizedConsumptions[cName] = numVal;
                            }
                          }
                        }

                        // Sanitize bicolorConsumptions if present
                        let sanitizedBicolor: { primary: number; secondary: number } | undefined = undefined;
                        if (prodForm.colorType === 'bicolor' || prodForm.bicolorConsumptions) {
                          const rawBicolor = prodForm.bicolorConsumptions || {};
                          const pVal = parseFloat(String(rawBicolor.primary ?? '0.8').replace(',', '.').trim()) || 0.8;
                          const sVal = parseFloat(String(rawBicolor.secondary ?? '0.4').replace(',', '.').trim()) || 0.4;
                          sanitizedBicolor = { primary: pVal, secondary: sVal };
                        }

                        // Sanitize singleConsumption if present
                        let sanitizedSingle: number | undefined = undefined;
                        if (prodForm.singleConsumption !== undefined && prodForm.singleConsumption !== null && prodForm.singleConsumption !== '') {
                          const strVal = String(prodForm.singleConsumption).replace(',', '.').trim();
                          const numVal = parseFloat(strVal);
                          if (!isNaN(numVal) && numVal > 0) {
                            sanitizedSingle = numVal;
                          }
                        }

                        const finalProd = {
                          ...prodForm,
                          colorType: prodForm.colorType || 'single',
                          availableColors: parsedColors,
                          colorConsumptions: sanitizedConsumptions,
                          bicolorConsumptions: sanitizedBicolor,
                          singleConsumption: sanitizedSingle !== undefined ? sanitizedSingle : prodForm.singleConsumption,
                          accessories: prodForm.accessories || {
                            etiqueta: true,
                            caixa: true,
                            fecho: false,
                            forro: false,
                            botao: false
                          }
                        };

                        const updatedCatalog = catalog.map(c => {
                          if (c.id === editingProduct.categoryId) {
                            let newProducts = [];
                            if (editingProduct.isNew) {
                              newProducts = [...c.products, finalProd];
                            } else {
                              newProducts = c.products.map((p: any) => p.id === finalProd.id ? finalProd : p);
                            }
                            return { ...c, products: newProducts };
                          }
                          return c;
                        });

                        setCatalog(updatedCatalog);
                        setEditingProduct(null);

                        // Auto-save catalog to backend server and display success toast notification
                        try {
                          const res = await fetch(`${API_BASE_URL}/api/admin/catalog/save`, {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                              'x-admin-password': password
                            },
                            body: JSON.stringify({ categories: updatedCatalog })
                          });
                          const data = await res.json();
                          if (res.ok && data.success) {
                            if (data.categories) setCatalog(data.categories);
                            window.dispatchEvent(new CustomEvent('catalog-updated'));
                            triggerNotification(`Produto "${finalProd.name}" guardado e publicado no catálogo com sucesso!`);
                          } else {
                            triggerNotification(`Produto "${finalProd.name}" guardado no rascunho.`);
                          }
                        } catch (err) {
                          triggerNotification(`Produto "${finalProd.name}" guardado no rascunho.`);
                        }
                      }}
                      className="space-y-4 text-xs text-left"
                    >
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="font-bold text-forest/70 block">Nome do Produto</label>
                          <input
                            type="text"
                            required
                            value={editingProduct.product.name}
                            onChange={(e) => setEditingProduct({
                              ...editingProduct,
                              product: { ...editingProduct.product, name: e.target.value }
                            })}
                            className="w-full bg-cream/20 border border-forest/10 focus:border-[#C5A059] focus:outline-none rounded-xl px-3 py-2"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="font-bold text-forest/70 block">Preço (ex: 28€)</label>
                          <input
                            type="text"
                            required
                            value={editingProduct.product.price}
                            onChange={(e) => setEditingProduct({
                              ...editingProduct,
                              product: { ...editingProduct.product, price: e.target.value }
                            })}
                            className="w-full bg-cream/20 border border-forest/10 focus:border-[#C5A059] focus:outline-none rounded-xl px-3 py-2"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-forest/70 block">URL da Foto</label>
                        <input
                          type="text"
                          required
                          value={editingProduct.product.img}
                          onChange={(e) => setEditingProduct({
                            ...editingProduct,
                            product: { ...editingProduct.product, img: e.target.value }
                          })}
                          className="w-full bg-cream/20 border border-forest/10 focus:border-[#C5A059] focus:outline-none rounded-xl px-3 py-2"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-forest/70 block">Descrição do Artigo</label>
                        <textarea
                          rows={3}
                          required
                          value={editingProduct.product.description}
                          onChange={(e) => setEditingProduct({
                            ...editingProduct,
                            product: { ...editingProduct.product, description: e.target.value }
                          })}
                          className="w-full bg-cream/20 border border-forest/10 focus:border-[#C5A059] focus:outline-none rounded-xl px-3 py-2 resize-none"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <label className="font-bold text-forest/70 block">Material</label>
                          <input
                            type="text"
                            value={editingProduct.product.material}
                            onChange={(e) => setEditingProduct({
                              ...editingProduct,
                              product: { ...editingProduct.product, material: e.target.value }
                            })}
                            className="w-full bg-cream/20 border border-forest/10 focus:border-[#C5A059] focus:outline-none rounded-xl px-2.5 py-2"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="font-bold text-forest/70 block">Cuidados</label>
                          <input
                            type="text"
                            value={editingProduct.product.care}
                            onChange={(e) => setEditingProduct({
                              ...editingProduct,
                              product: { ...editingProduct.product, care: e.target.value }
                            })}
                            className="w-full bg-cream/20 border border-forest/10 focus:border-[#C5A059] focus:outline-none rounded-xl px-2.5 py-2"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="font-bold text-forest/70 block">Dimensões</label>
                          <input
                            type="text"
                            value={editingProduct.product.dimensions || ''}
                            onChange={(e) => setEditingProduct({
                              ...editingProduct,
                              product: { ...editingProduct.product, dimensions: e.target.value }
                            })}
                            className="w-full bg-cream/20 border border-forest/10 focus:border-[#C5A059] focus:outline-none rounded-xl px-2.5 py-2"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="font-bold text-forest/70 block">Unidades em Stock</label>
                          <input
                            type="number"
                            min="0"
                            placeholder="0 (Produção sob Encomenda)"
                            value={editingProduct.product.stock !== undefined ? editingProduct.product.stock : ''}
                            onChange={(e) => setEditingProduct({
                              ...editingProduct,
                              product: { ...editingProduct.product, stock: e.target.value === '' ? '' : parseInt(e.target.value, 10) }
                            })}
                            className="w-full bg-cream/20 border border-forest/10 focus:border-[#C5A059] focus:outline-none rounded-xl px-2.5 py-2"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="font-bold text-forest/70 block">Prazo de Produção (dias)</label>
                          <input
                            type="number"
                            min="1"
                            placeholder="Ex: 7"
                            value={editingProduct.product.craftingTime !== undefined ? editingProduct.product.craftingTime : ''}
                            onChange={(e) => setEditingProduct({
                              ...editingProduct,
                              product: { ...editingProduct.product, craftingTime: e.target.value === '' ? '' : parseInt(e.target.value, 10) }
                            })}
                            className="w-full bg-cream/20 border border-forest/10 focus:border-[#C5A059] focus:outline-none rounded-xl px-2.5 py-2"
                          />
                        </div>
                      </div>

                      {/* SELETOR DE CONFIGURAÇÃO DE COR */}
                      {(() => {
                        const safranYarns = inventory.filter(i => 
                          (i.id || '').toLowerCase().startsWith('rm_safran_') || 
                          (i.id || '').toLowerCase().includes('safran') || 
                          (i.name || '').toLowerCase().includes('safran')
                        );

                        const parisYarns = inventory.filter(i => 
                          (i.id || '').toLowerCase().startsWith('rm_paris_') || 
                          (i.id || '').toLowerCase().includes('paris') || 
                          (i.name || '').toLowerCase().includes('paris')
                        );

                        const currentColors: string[] = Array.isArray(editingProduct.product.availableColors)
                          ? editingProduct.product.availableColors
                          : typeof editingProduct.product.availableColors === 'string' && editingProduct.product.availableColors.trim()
                          ? (editingProduct.product.availableColors as string).split(',').map(s => s.trim()).filter(Boolean)
                          : [];

                        const getShortColorName = (item: any) => {
                          const name = item.name || '';
                          if (name.startsWith('DROPS Safran ')) {
                            return name.replace('DROPS Safran ', '').replace('(', '- ').replace(')', '');
                          }
                          if (name.startsWith('DROPS Paris ')) {
                            return name.replace('DROPS Paris ', '').replace('(', '- ').replace(')', '');
                          }
                          return name;
                        };

                        const toggleColor = (colorName: string) => {
                          let updated: string[];
                          const exists = currentColors.some(c => c.toLowerCase() === colorName.toLowerCase());
                          if (exists) {
                            updated = currentColors.filter(c => c.toLowerCase() !== colorName.toLowerCase());
                          } else {
                            updated = [...currentColors, colorName];
                          }
                          setEditingProduct({
                            ...editingProduct,
                            product: { ...editingProduct.product, availableColors: updated }
                          });
                        };

                        const isColorSelected = (colorName: string) => {
                          return currentColors.some(c => c.toLowerCase() === colorName.toLowerCase() || c.toLowerCase().includes(colorName.toLowerCase()));
                        };

                        return (
                          <div className="space-y-3 bg-cream/20 p-4 rounded-2xl border border-forest/10 text-left">
                            {/* SELETOR DE CONFIGURAÇÃO DE COR */}
                            <div className="space-y-1.5 pb-2.5 border-b border-forest/10">
                              <label className="font-serif text-xs font-bold text-forest block">
                                Tipo de Configuração de Cor da Peça
                              </label>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                <button
                                  type="button"
                                  onClick={() => setEditingProduct({
                                    ...editingProduct,
                                    product: { ...editingProduct.product, colorType: 'single' }
                                  })}
                                  className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                                    (!editingProduct.product.colorType || editingProduct.product.colorType === 'single')
                                      ? 'bg-[#243119] text-cream border-[#243119] shadow-sm'
                                      : 'bg-white text-forest/70 border-forest/15 hover:border-[#C5A059]'
                                  }`}
                                >
                                  <div className="text-[11px] font-bold flex items-center gap-1.5">
                                    <span className="w-2.5 h-2.5 rounded-full bg-[#C5A059] inline-block shrink-0"></span>
                                    Cor Única
                                  </div>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => setEditingProduct({
                                    ...editingProduct,
                                    product: {
                                      ...editingProduct.product,
                                      colorType: 'bicolor',
                                      bicolorConsumptions: editingProduct.product.bicolorConsumptions || { primary: '0.8', secondary: '0.4' }
                                    }
                                  })}
                                  className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                                    editingProduct.product.colorType === 'bicolor'
                                      ? 'bg-[#243119] text-cream border-[#243119] shadow-sm'
                                      : 'bg-white text-forest/70 border-forest/15 hover:border-[#C5A059]'
                                  }`}
                                >
                                  <div className="text-[11px] font-bold flex items-center gap-1.5">
                                    <span className="flex items-center -space-x-1 shrink-0">
                                      <span className="w-2.5 h-2.5 rounded-full bg-[#C5A059]"></span>
                                      <span className="w-2.5 h-2.5 rounded-full bg-[#243119] border border-white/40"></span>
                                    </span>
                                    Peça Bicolor
                                  </div>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => setEditingProduct({
                                    ...editingProduct,
                                    product: { ...editingProduct.product, colorType: 'fixed' }
                                  })}
                                  className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                                    editingProduct.product.colorType === 'fixed'
                                      ? 'bg-[#243119] text-cream border-[#243119] shadow-sm'
                                      : 'bg-white text-forest/70 border-forest/15 hover:border-[#C5A059]'
                                  }`}
                                >
                                  <div className="text-[11px] font-bold flex items-center gap-1.5">
                                    <Layers className="w-3 h-3 text-[#C5A059] shrink-0" />
                                    Cor Padrão
                                  </div>
                                </button>
                              </div>
                            </div>

                            {/* CAMPO DE CONSUMO PARA COR ÚNICA */}
                            {(!editingProduct.product.colorType || editingProduct.product.colorType === 'single') && (
                              <div className="p-3 bg-amber-50/50 border border-amber-200/70 rounded-xl space-y-1.5">
                                <div className="flex items-center justify-between">
                                  <span className="font-serif text-[11px] font-bold text-amber-900 flex items-center gap-1">
                                    <Sliders className="w-3.5 h-3.5 text-[#C5A059]" />
                                    Consumo por Peça (nov)
                                  </span>
                                  <span className="text-[9px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-mono font-bold">
                                    1 Cor por Peça
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <input
                                    type="text"
                                    inputMode="decimal"
                                    placeholder="1.0"
                                    value={
                                      editingProduct.product.singleConsumption !== undefined
                                        ? editingProduct.product.singleConsumption
                                        : (Object.values(editingProduct.product.colorConsumptions || {})[0] ?? '1.0')
                                    }
                                    onChange={(e) => {
                                      const rawVal = e.target.value;
                                      const updatedConsumptions: Record<string, string> = {};
                                      (editingProduct.product.availableColors || []).forEach((cName: string) => {
                                        updatedConsumptions[cName] = rawVal;
                                      });
                                      setEditingProduct({
                                        ...editingProduct,
                                        product: {
                                          ...editingProduct.product,
                                          singleConsumption: rawVal,
                                          colorConsumptions: updatedConsumptions
                                        }
                                      });
                                    }}
                                    className="w-full bg-white border border-forest/20 focus:border-[#C5A059] focus:outline-none rounded-lg px-2.5 py-1 text-xs text-forest font-mono font-bold text-right"
                                  />
                                  <span className="text-[10px] text-forest/70 font-mono font-bold">nov</span>
                                </div>
                              </div>
                            )}

                            {/* CAMPOS DE CONSUMO PARA BICOLOR */}
                            {editingProduct.product.colorType === 'bicolor' && (
                              <div className="p-3 bg-amber-50/50 border border-amber-200/70 rounded-xl space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="font-serif text-[11px] font-bold text-amber-900 flex items-center gap-1">
                                    <Sliders className="w-3.5 h-3.5 text-[#C5A059]" />
                                    Consumos (Bicolor)
                                  </span>
                                  <span className="text-[9px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-mono font-bold">
                                    2 Cores por Peça
                                  </span>
                                </div>
                                <div className="grid grid-cols-2 gap-2.5">
                                  <div>
                                    <label className="text-[10px] font-bold text-forest/80 block mb-1">
                                      Cor Principal (nov)
                                    </label>
                                    <div className="flex items-center gap-1">
                                      <input
                                        type="text"
                                        inputMode="decimal"
                                        placeholder="0.8"
                                        value={editingProduct.product.bicolorConsumptions?.primary !== undefined ? editingProduct.product.bicolorConsumptions.primary : '0.8'}
                                        onChange={(e) => {
                                          const rawVal = e.target.value;
                                          setEditingProduct({
                                            ...editingProduct,
                                            product: {
                                              ...editingProduct.product,
                                              bicolorConsumptions: {
                                                ...(editingProduct.product.bicolorConsumptions || { primary: '0.8', secondary: '0.4' }),
                                                primary: rawVal
                                              }
                                            }
                                          });
                                        }}
                                        className="w-full bg-white border border-forest/20 focus:border-[#C5A059] focus:outline-none rounded-lg px-2 py-1 text-xs text-forest font-mono font-bold text-right"
                                      />
                                      <span className="text-[9px] text-forest/60 font-mono">nov</span>
                                    </div>
                                  </div>
                                  <div>
                                    <label className="text-[10px] font-bold text-forest/80 block mb-1">
                                      Cor do Detalhe (nov)
                                    </label>
                                    <div className="flex items-center gap-1">
                                      <input
                                        type="text"
                                        inputMode="decimal"
                                        placeholder="0.4"
                                        value={editingProduct.product.bicolorConsumptions?.secondary !== undefined ? editingProduct.product.bicolorConsumptions.secondary : '0.4'}
                                        onChange={(e) => {
                                          const rawVal = e.target.value;
                                          setEditingProduct({
                                            ...editingProduct,
                                            product: {
                                              ...editingProduct.product,
                                              bicolorConsumptions: {
                                                ...(editingProduct.product.bicolorConsumptions || { primary: '0.8', secondary: '0.4' }),
                                                secondary: rawVal
                                              }
                                            }
                                          });
                                        }}
                                        className="w-full bg-white border border-forest/20 focus:border-[#C5A059] focus:outline-none rounded-lg px-2 py-1 text-xs text-forest font-mono font-bold text-right"
                                      />
                                      <span className="text-[9px] text-forest/60 font-mono">nov</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div>
                                <label className="font-serif text-xs font-bold text-forest block">
                                  Matérias-Primas e Paleta
                                </label>
                              </div>
                              <div className="flex gap-1.5 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const allStockColors = [
                                      ...safranYarns.map(i => getShortColorName(i)),
                                      ...parisYarns.map(i => getShortColorName(i))
                                    ];
                                    setEditingProduct({
                                      ...editingProduct,
                                      product: { ...editingProduct.product, availableColors: Array.from(new Set(allStockColors)) }
                                    });
                                  }}
                                  className="text-[10px] font-semibold text-[#243119] bg-white border border-forest/10 hover:bg-cream px-2 py-1 rounded-lg cursor-pointer transition-colors"
                                >
                                  Selecionar Todas
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingProduct({
                                      ...editingProduct,
                                      product: { ...editingProduct.product, availableColors: [] }
                                    });
                                  }}
                                  className="text-[10px] font-semibold text-red-700 bg-white border border-red-200 hover:bg-red-50 px-2 py-1 rounded-lg cursor-pointer transition-colors"
                                >
                                  Limpar
                                </button>
                              </div>
                            </div>

                            {/* DROPS Safran Colors */}
                            {safranYarns.length > 0 && (
                              <div className="space-y-1.5">
                                <div className="flex items-center gap-1.5">
                                  <span className="w-2 h-2 rounded-full bg-[#C5A059]"></span>
                                  <span className="text-[10px] font-bold text-forest uppercase tracking-wider">
                                    DROPS Safran ({safranYarns.length} Cores)
                                  </span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1.5">
                                  {safranYarns.map(y => {
                                    const shortName = getShortColorName(y);
                                    const selected = isColorSelected(shortName) || isColorSelected(y.name);
                                    return (
                                      <button
                                        key={y.id}
                                        type="button"
                                        onClick={() => toggleColor(shortName)}
                                        className={`w-full px-2.5 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-medium border transition-all flex items-center justify-between gap-1.5 cursor-pointer min-h-[38px] ${
                                          selected
                                            ? 'bg-[#243119] text-cream border-[#243119] shadow-sm font-semibold'
                                            : 'bg-white text-forest/70 border-forest/15 hover:border-[#C5A059] hover:bg-cream/40'
                                        }`}
                                      >
                                        <div className="flex items-center gap-1.5 min-w-0 pr-1">
                                          <YarnSwatch id={y.id} name={y.name} size="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                                          <span className="truncate">{shortName}</span>
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0">
                                          <span className={`text-[9px] px-1 py-0.5 rounded font-mono ${selected ? 'bg-cream/20 text-cream' : 'bg-forest/5 text-forest/50'}`}>
                                            {y.quantity} nov
                                          </span>
                                          <span className="text-[10px] font-bold">{selected ? '✓' : '+'}</span>
                                        </div>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {/* DROPS Paris Colors */}
                            {parisYarns.length > 0 && (
                              <div className="space-y-1.5 pt-1">
                                <div className="flex items-center gap-1.5">
                                  <span className="w-2 h-2 rounded-full bg-[#243119]"></span>
                                  <span className="text-[10px] font-bold text-forest uppercase tracking-wider">
                                    DROPS Paris ({parisYarns.length} Cores)
                                  </span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1.5">
                                  {parisYarns.map(y => {
                                    const shortName = getShortColorName(y);
                                    const selected = isColorSelected(shortName) || isColorSelected(y.name);
                                    return (
                                      <button
                                        key={y.id}
                                        type="button"
                                        onClick={() => toggleColor(shortName)}
                                        className={`w-full px-2.5 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-medium border transition-all flex items-center justify-between gap-1.5 cursor-pointer min-h-[38px] ${
                                          selected
                                            ? 'bg-[#243119] text-cream border-[#243119] shadow-sm font-semibold'
                                            : 'bg-white text-forest/70 border-forest/15 hover:border-[#C5A059] hover:bg-cream/40'
                                        }`}
                                      >
                                        <div className="flex items-center gap-1.5 min-w-0 pr-1">
                                          <YarnSwatch id={y.id} name={y.name} size="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                                          <span className="truncate">{shortName}</span>
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0">
                                          <span className={`text-[9px] px-1 py-0.5 rounded font-mono ${selected ? 'bg-cream/20 text-cream' : 'bg-forest/5 text-forest/50'}`}>
                                            {y.quantity} nov
                                          </span>
                                          <span className="text-[10px] font-bold">{selected ? '✓' : '+'}</span>
                                        </div>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {/* Manual Text Fallback */}
                            <div className="pt-2 border-t border-forest/10 space-y-1">
                              <div className="text-[10px] text-forest/60 font-semibold">
                                <span>Cores Ativas ({currentColors.length}):</span>
                              </div>
                              <input
                                type="text"
                                value={currentColors.join(', ')}
                                onChange={(e) => setEditingProduct({
                                  ...editingProduct,
                                  product: { 
                                    ...editingProduct.product, 
                                    availableColors: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                                  }
                                })}
                                className="w-full bg-white border border-forest/15 focus:border-[#C5A059] focus:outline-none rounded-xl px-3 py-1.5 text-xs text-forest"
                                placeholder="Ex: 10 - Natural, 16 - Branco"
                              />
                            </div>

                            {/* Consumo por Cor (Apenas para Cor Padrão / Edição Fixa) */}
                            {editingProduct.product.colorType === 'fixed' && currentColors.length > 0 && (
                              <div className="pt-3 border-t border-forest/10 space-y-2">
                                <div>
                                  <label className="font-serif text-[11px] font-bold text-forest block">
                                    Consumo por Cor (nov)
                                  </label>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                                  {currentColors.map((colorName: string) => {
                                    const val = editingProduct.product.colorConsumptions?.[colorName];
                                    return (
                                      <div key={colorName} className="flex items-center justify-between bg-white border border-forest/15 rounded-xl p-2 shadow-2xs">
                                        <div className="flex items-center gap-1.5 min-w-0 pr-1">
                                          <YarnSwatch name={colorName} size="w-4 h-4 rounded-full shrink-0" />
                                          <span className="text-[10px] font-semibold text-forest truncate" title={colorName}>
                                            {colorName}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0">
                                          <input
                                            type="text"
                                            inputMode="decimal"
                                            placeholder="1.0"
                                            value={val !== undefined && val !== null ? val : ''}
                                            onChange={(e) => {
                                              const rawInput = e.target.value;
                                              const updatedConsumptions = { ...(editingProduct.product.colorConsumptions || {}) };
                                              if (rawInput.trim() === '') {
                                                delete updatedConsumptions[colorName];
                                              } else {
                                                updatedConsumptions[colorName] = rawInput;
                                              }
                                              setEditingProduct({
                                                ...editingProduct,
                                                product: {
                                                  ...editingProduct.product,
                                                  colorConsumptions: updatedConsumptions
                                                }
                                              });
                                            }}
                                            className="w-16 bg-cream/30 border border-forest/20 focus:border-[#C5A059] focus:outline-none rounded-lg px-2 py-1 text-[10px] text-forest font-mono text-right font-bold"
                                          />
                                          <span className="text-[9px] text-forest/60 font-mono">nov</span>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })()}

                      {/* Acessórios & Embalamento */}
                      <div className="bg-[#FCFBF9] border border-[#C5A059]/25 rounded-xl p-3.5 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <label className="font-bold text-forest/80 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                            <Layers className="w-3.5 h-3.5 text-[#C5A059]" />
                            Acessórios & Embalamento
                          </label>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs pt-1">
                          {/* 1. Etiqueta Couro */}
                          <div className={`p-2.5 rounded-xl border flex flex-col justify-between h-full min-w-0 transition-all ${editingProduct.product.accessories?.etiqueta ?? true ? 'bg-white border-[#C5A059]/50 shadow-2xs' : 'bg-white/60 border-forest/10 opacity-70'}`}>
                            <label className="flex items-center gap-2 cursor-pointer select-none font-medium text-forest min-w-0 w-full">
                              <input
                                type="checkbox"
                                checked={editingProduct.product.accessories?.etiqueta ?? true}
                                onChange={(e) => setEditingProduct({
                                  ...editingProduct,
                                  product: {
                                    ...editingProduct.product,
                                    accessories: { ...(editingProduct.product.accessories || {}), etiqueta: e.target.checked }
                                  }
                                })}
                                className="rounded text-[#C5A059] focus:ring-[#C5A059] w-4 h-4 shrink-0"
                              />
                              <span className="text-xs sm:text-sm font-semibold truncate leading-tight min-w-0">Etiqueta Couro</span>
                            </label>
                            {(editingProduct.product.accessories?.etiqueta ?? true) && (
                              <div className="flex items-center justify-between gap-1.5 pt-2 mt-2 border-t border-forest/10 text-xs w-full min-w-0">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-forest/50 shrink-0">Qtd:</span>
                                <div className="flex items-center gap-1 min-w-0 shrink-0">
                                  <input
                                    type="number"
                                    min="1"
                                    step="1"
                                    value={editingProduct.product.accessories?.etiquetaQty ?? 1}
                                    onChange={(e) => setEditingProduct({
                                      ...editingProduct,
                                      product: {
                                        ...editingProduct.product,
                                        accessories: { ...(editingProduct.product.accessories || {}), etiquetaQty: Math.max(1, parseInt(e.target.value) || 1) }
                                      }
                                    })}
                                    className="w-14 sm:w-16 bg-[#FCFBF9] border border-forest/20 rounded-lg px-1.5 py-0.5 text-center font-bold text-forest text-xs focus:outline-none focus:border-[#C5A059] min-w-0"
                                  />
                                  <span className="text-[10px] text-forest/60 shrink-0">unid.</span>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* 2. Caixa Premium */}
                          <div className={`p-2.5 rounded-xl border flex flex-col justify-between h-full min-w-0 transition-all ${editingProduct.product.accessories?.caixa ?? true ? 'bg-white border-[#C5A059]/50 shadow-2xs' : 'bg-white/60 border-forest/10 opacity-70'}`}>
                            <label className="flex items-center gap-2 cursor-pointer select-none font-medium text-forest min-w-0 w-full">
                              <input
                                type="checkbox"
                                checked={editingProduct.product.accessories?.caixa ?? true}
                                onChange={(e) => setEditingProduct({
                                  ...editingProduct,
                                  product: {
                                    ...editingProduct.product,
                                    accessories: { ...(editingProduct.product.accessories || {}), caixa: e.target.checked }
                                  }
                                })}
                                className="rounded text-[#C5A059] focus:ring-[#C5A059] w-4 h-4 shrink-0"
                              />
                              <span className="text-xs sm:text-sm font-semibold truncate leading-tight min-w-0">Caixa Premium</span>
                            </label>
                            {(editingProduct.product.accessories?.caixa ?? true) && (
                              <div className="flex items-center justify-between gap-1.5 pt-2 mt-2 border-t border-forest/10 text-xs w-full min-w-0">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-forest/50 shrink-0">Qtd:</span>
                                <div className="flex items-center gap-1 min-w-0 shrink-0">
                                  <input
                                    type="number"
                                    min="1"
                                    step="1"
                                    value={editingProduct.product.accessories?.caixaQty ?? 1}
                                    onChange={(e) => setEditingProduct({
                                      ...editingProduct,
                                      product: {
                                        ...editingProduct.product,
                                        accessories: { ...(editingProduct.product.accessories || {}), caixaQty: Math.max(1, parseInt(e.target.value) || 1) }
                                      }
                                    })}
                                    className="w-14 sm:w-16 bg-[#FCFBF9] border border-forest/20 rounded-lg px-1.5 py-0.5 text-center font-bold text-forest text-xs focus:outline-none focus:border-[#C5A059] min-w-0"
                                  />
                                  <span className="text-[10px] text-forest/60 shrink-0">unid.</span>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* 3. Saco Envelope */}
                          <div className={`p-2.5 rounded-xl border flex flex-col justify-between h-full min-w-0 transition-all ${(editingProduct.product.accessories?.sacoEnvelope ?? editingProduct.product.accessories?.saco ?? true) ? 'bg-white border-[#C5A059]/50 shadow-2xs' : 'bg-white/60 border-forest/10 opacity-70'}`}>
                            <label className="flex items-center gap-2 cursor-pointer select-none font-medium text-forest min-w-0 w-full">
                              <input
                                type="checkbox"
                                checked={editingProduct.product.accessories?.sacoEnvelope ?? editingProduct.product.accessories?.saco ?? true}
                                onChange={(e) => setEditingProduct({
                                  ...editingProduct,
                                  product: {
                                    ...editingProduct.product,
                                    accessories: { ...(editingProduct.product.accessories || {}), sacoEnvelope: e.target.checked, saco: e.target.checked }
                                  }
                                })}
                                className="rounded text-[#C5A059] focus:ring-[#C5A059] w-4 h-4 shrink-0"
                              />
                              <span className="text-xs sm:text-sm font-semibold truncate leading-tight min-w-0">Saco Envelope</span>
                            </label>
                            {(editingProduct.product.accessories?.sacoEnvelope ?? editingProduct.product.accessories?.saco ?? true) && (
                              <div className="flex items-center justify-between gap-1.5 pt-2 mt-2 border-t border-forest/10 text-xs w-full min-w-0">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-forest/50 shrink-0">Qtd:</span>
                                <div className="flex items-center gap-1 min-w-0 shrink-0">
                                  <input
                                    type="number"
                                    min="1"
                                    step="1"
                                    value={editingProduct.product.accessories?.sacoEnvelopeQty ?? editingProduct.product.accessories?.sacoQty ?? 1}
                                    onChange={(e) => setEditingProduct({
                                      ...editingProduct,
                                      product: {
                                        ...editingProduct.product,
                                        accessories: { ...(editingProduct.product.accessories || {}), sacoEnvelopeQty: Math.max(1, parseInt(e.target.value) || 1), sacoQty: Math.max(1, parseInt(e.target.value) || 1) }
                                      }
                                    })}
                                    className="w-14 sm:w-16 bg-[#FCFBF9] border border-forest/20 rounded-lg px-1.5 py-0.5 text-center font-bold text-forest text-xs focus:outline-none focus:border-[#C5A059] min-w-0"
                                  />
                                  <span className="text-[10px] text-forest/60 shrink-0">unid.</span>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* 4. Fecho Correr */}
                          <div className={`p-2.5 rounded-xl border flex flex-col justify-between h-full min-w-0 transition-all ${editingProduct.product.accessories?.fecho ? 'bg-white border-[#C5A059]/50 shadow-2xs' : 'bg-white/60 border-forest/10 opacity-70'}`}>
                            <label className="flex items-center gap-2 cursor-pointer select-none font-medium text-forest min-w-0 w-full">
                              <input
                                type="checkbox"
                                checked={editingProduct.product.accessories?.fecho ?? false}
                                onChange={(e) => setEditingProduct({
                                  ...editingProduct,
                                  product: {
                                    ...editingProduct.product,
                                    accessories: { ...(editingProduct.product.accessories || {}), fecho: e.target.checked }
                                  }
                                })}
                                className="rounded text-[#C5A059] focus:ring-[#C5A059] w-4 h-4 shrink-0"
                              />
                              <span className="text-xs sm:text-sm font-semibold truncate leading-tight min-w-0">Fecho Correr</span>
                            </label>
                            {Boolean(editingProduct.product.accessories?.fecho) && (
                              <div className="flex items-center justify-between gap-1.5 pt-2 mt-2 border-t border-forest/10 text-xs w-full min-w-0">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-forest/50 shrink-0">Qtd:</span>
                                <div className="flex items-center gap-1 min-w-0 shrink-0">
                                  <input
                                    type="number"
                                    min="1"
                                    step="1"
                                    value={editingProduct.product.accessories?.fechoQty ?? 1}
                                    onChange={(e) => setEditingProduct({
                                      ...editingProduct,
                                      product: {
                                        ...editingProduct.product,
                                        accessories: { ...(editingProduct.product.accessories || {}), fechoQty: Math.max(1, parseInt(e.target.value) || 1) }
                                      }
                                    })}
                                    className="w-14 sm:w-16 bg-[#FCFBF9] border border-forest/20 rounded-lg px-1.5 py-0.5 text-center font-bold text-forest text-xs focus:outline-none focus:border-[#C5A059] min-w-0"
                                  />
                                  <span className="text-[10px] text-forest/60 shrink-0">unid.</span>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* 5. Forro Algodão */}
                          <div className={`p-2.5 rounded-xl border flex flex-col justify-between h-full min-w-0 transition-all ${editingProduct.product.accessories?.forro ? 'bg-white border-[#C5A059]/50 shadow-2xs' : 'bg-white/60 border-forest/10 opacity-70'}`}>
                            <label className="flex items-center gap-2 cursor-pointer select-none font-medium text-forest min-w-0 w-full">
                              <input
                                type="checkbox"
                                checked={editingProduct.product.accessories?.forro ?? false}
                                onChange={(e) => setEditingProduct({
                                  ...editingProduct,
                                  product: {
                                    ...editingProduct.product,
                                    accessories: { ...(editingProduct.product.accessories || {}), forro: e.target.checked }
                                  }
                                })}
                                className="rounded text-[#C5A059] focus:ring-[#C5A059] w-4 h-4 shrink-0"
                              />
                              <span className="text-xs sm:text-sm font-semibold truncate leading-tight min-w-0">Forro Algodão</span>
                            </label>
                            {Boolean(editingProduct.product.accessories?.forro) && (
                              <div className="flex items-center justify-between gap-1.5 pt-2 mt-2 border-t border-forest/10 text-xs w-full min-w-0">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-forest/50 shrink-0">Consumo:</span>
                                <div className="flex items-center gap-1 min-w-0 shrink-0">
                                  <input
                                    type="number"
                                    min="0.01"
                                    step="0.05"
                                    value={editingProduct.product.accessories?.forroMeters ?? editingProduct.product.accessories?.forroConsumo ?? 0.25}
                                    onChange={(e) => setEditingProduct({
                                      ...editingProduct,
                                      product: {
                                        ...editingProduct.product,
                                        accessories: { ...(editingProduct.product.accessories || {}), forroMeters: Math.max(0.01, parseFloat(e.target.value) || 0.25) }
                                      }
                                    })}
                                    className="w-14 sm:w-16 bg-[#FCFBF9] border border-forest/20 rounded-lg px-1.5 py-0.5 text-center font-bold text-forest text-xs focus:outline-none focus:border-[#C5A059] min-w-0"
                                  />
                                  <span className="text-[10px] text-forest/60 shrink-0">metros</span>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* 6. Botão Madeira */}
                          <div className={`p-2.5 rounded-xl border flex flex-col justify-between h-full min-w-0 transition-all ${editingProduct.product.accessories?.botao ? 'bg-white border-[#C5A059]/50 shadow-2xs' : 'bg-white/60 border-forest/10 opacity-70'}`}>
                            <label className="flex items-center gap-2 cursor-pointer select-none font-medium text-forest min-w-0 w-full">
                              <input
                                type="checkbox"
                                checked={editingProduct.product.accessories?.botao ?? false}
                                onChange={(e) => setEditingProduct({
                                  ...editingProduct,
                                  product: {
                                    ...editingProduct.product,
                                    accessories: { ...(editingProduct.product.accessories || {}), botao: e.target.checked }
                                  }
                                })}
                                className="rounded text-[#C5A059] focus:ring-[#C5A059] w-4 h-4 shrink-0"
                              />
                              <span className="text-xs sm:text-sm font-semibold truncate leading-tight min-w-0">Botão Madeira</span>
                            </label>
                            {Boolean(editingProduct.product.accessories?.botao) && (
                              <div className="flex items-center justify-between gap-1.5 pt-2 mt-2 border-t border-forest/10 text-xs w-full min-w-0">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-forest/50 shrink-0">Qtd:</span>
                                <div className="flex items-center gap-1 min-w-0 shrink-0">
                                  <input
                                    type="number"
                                    min="1"
                                    step="1"
                                    value={editingProduct.product.accessories?.botaoQty ?? 1}
                                    onChange={(e) => setEditingProduct({
                                      ...editingProduct,
                                      product: {
                                        ...editingProduct.product,
                                        accessories: { ...(editingProduct.product.accessories || {}), botaoQty: Math.max(1, parseInt(e.target.value) || 1) }
                                      }
                                    })}
                                    className="w-14 sm:w-16 bg-[#FCFBF9] border border-forest/20 rounded-lg px-1.5 py-0.5 text-center font-bold text-forest text-xs focus:outline-none focus:border-[#C5A059] min-w-0"
                                  />
                                  <span className="text-[10px] text-forest/60 shrink-0">unid.</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2">
                        <input
                          type="checkbox"
                          id="hidden_check"
                          checked={editingProduct.product.hidden || false}
                          onChange={(e) => setEditingProduct({
                            ...editingProduct,
                            product: { ...editingProduct.product, hidden: e.target.checked }
                          })}
                          className="w-4 h-4 text-[#243119] focus:ring-forest border-forest/10 rounded"
                        />
                        <label htmlFor="hidden_check" className="font-bold text-forest/70 cursor-pointer">
                          Ocultar produto na loja
                        </label>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2.5 pt-3 border-t border-forest/10 sticky bottom-0 bg-white z-20 pb-1 mt-auto">
                        <button
                          type="button"
                          onClick={() => setEditingProduct(null)}
                          className="w-full sm:flex-1 py-3 sm:py-2.5 bg-cream hover:bg-cream/70 text-forest rounded-xl font-bold uppercase transition-all cursor-pointer text-center text-xs tracking-wider"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="w-full sm:flex-1 py-3 sm:py-2.5 bg-[#243119] hover:bg-[#1a2412] text-cream rounded-xl font-bold uppercase transition-all cursor-pointer text-center shadow-md text-xs tracking-wider"
                        >
                          Guardar Alterações
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SALES ANALYTICS & PERFORMANCE PANEL (FASE 4) */}
          {activeTab === 'analytics' && (() => {
            // Calculate real stats from orders
            const paidOrdersList = orders.filter(o => o.status === 'paid');
            const shippedOrdersList = orders.filter(o => o.status === 'shipped');
            const deliveredOrdersList = orders.filter(o => o.status === 'delivered');
            const pendingOrdersList = orders.filter(o => o.status === 'pending_payment');
            const failedOrdersList = orders.filter(o => o.status === 'failed');

            const successOrdersList = [...paidOrdersList, ...shippedOrdersList, ...deliveredOrdersList];
            const hasRealPaid = successOrdersList.length > 0;

            // Counts & Values
            const totalOrdersCount = orders.length;
            const successOrdersCount = successOrdersList.length;
            const pendingOrdersCount = pendingOrdersList.length;
            const failedOrdersCount = failedOrdersList.length;
            const paidOrdersCount = paidOrdersList.length;
            const shippedOrdersCount = shippedOrdersList.length;
            const deliveredOrdersCount = deliveredOrdersList.length;

            const successRevenue = successOrdersList.reduce((sum, o) => sum + parsePrice(o.price), 0);
            const pendingRevenue = pendingOrdersList.reduce((sum, o) => sum + parsePrice(o.price), 0);

            const conversionRate = totalOrdersCount > 0 
              ? Math.round((successOrdersCount / totalOrdersCount) * 100) 
              : 0;

            const avgOrderValue = successOrdersCount > 0
              ? Math.round(successRevenue / successOrdersCount)
              : 0;

            // Group sales by product
            const productSales: { [name: string]: { count: number; revenue: number } } = {};
            successOrdersList.forEach(o => {
              const name = o.productName || 'Peça Personalizada';
              const qty = parseInt(o.selections?.quantidade || "1") || 1;
              const priceVal = parsePrice(o.price);
              if (!productSales[name]) {
                productSales[name] = { count: 0, revenue: 0 };
              }
              productSales[name].count += qty;
              productSales[name].revenue += priceVal;
            });

            const topProducts = Object.entries(productSales)
              .map(([name, data]) => ({ name, ...data }))
              .sort((a, b) => b.count - a.count);

            // Active crafting workload: sum of crafting times of active 'paid' orders
            let totalActiveCraftingDays = 0;
            paidOrdersList.forEach(o => {
              const qty = parseInt(o.selections?.quantidade || "1") || 1;
              let itemCraftingTime = 10; // Default fallback
              if (catalog && catalog.length > 0) {
                for (const cat of catalog) {
                  if (cat.products) {
                    const match = cat.products.find((p: any) => p.name.toLowerCase() === o.productName?.toLowerCase());
                    if (match && match.craftingTime !== undefined && match.craftingTime !== null && match.craftingTime !== '') {
                      itemCraftingTime = parseInt(match.craftingTime, 10) || 10;
                    }
                  }
                }
              }
              totalActiveCraftingDays += itemCraftingTime * qty;
            });

            // Monthly Trend Chart Data
            const monthsPT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
            const currentMonthIndex = new Date().getMonth();
            
            const monthlyRealData = Array(12).fill(0).map((_, i) => ({
              month: monthsPT[i],
              revenue: 0,
              ordersCount: 0
            }));
            
            successOrdersList.forEach(o => {
              if (o.createdAt) {
                const date = new Date(o.createdAt);
                const mIndex = date.getMonth();
                if (date.getFullYear() === new Date().getFullYear()) {
                  monthlyRealData[mIndex].revenue += parsePrice(o.price);
                  monthlyRealData[mIndex].ordersCount += 1;
                }
              }
            });
            const activeChartData = monthlyRealData.slice(0, currentMonthIndex + 1);

            const maxRevenueInChart = Math.max(...activeChartData.map(d => d.revenue), 100);

            // Chart coordinates calculation for custom SVG Area Chart
            const chartHeight = 150;
            const chartWidth = 500;
            const paddingLeft = 45;
            const paddingRight = 15;
            const paddingBottom = 25;
            const paddingTop = 15;

            const graphWidth = chartWidth - paddingLeft - paddingRight;
            const graphHeight = chartHeight - paddingTop - paddingBottom;

            const points = activeChartData.map((d, index) => {
              const x = paddingLeft + (activeChartData.length > 1 ? (index / (activeChartData.length - 1)) * graphWidth : graphWidth / 2);
              const y = paddingTop + graphHeight - (d.revenue / maxRevenueInChart) * graphHeight;
              return { x, y, label: d.month, value: d.revenue };
            });

            const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
            const areaPath = points.length > 0 
              ? `${linePath} L ${points[points.length - 1].x} ${chartHeight - paddingBottom} L ${points[0].x} ${chartHeight - paddingBottom} Z`
              : '';

            // Smart Production recommendations
            const lowStockRawMaterials = inventory ? inventory.filter(m => m.quantity < m.minSafety) : [];
            const recommendations: string[] = [];

            if (lowStockRawMaterials.length > 0) {
              recommendations.push(
                `Rutura de Stock iminente em ${lowStockRawMaterials.length} matéria(s)-prima(s): ` +
                lowStockRawMaterials.slice(0, 2).map(m => m.name).join(', ') + 
                (lowStockRawMaterials.length > 2 ? ' e outros.' : '.') + 
                ' Considere reabastecer para não comprometer as encomendas.'
              );
            }

            // Find best sellers with zero catalog stock
            const zeroStockBestSellers = topProducts.filter(tp => {
              let isOutOfStock = false;
              if (catalog && catalog.length > 0) {
                for (const cat of catalog) {
                  if (cat.products) {
                    const match = cat.products.find((p: any) => p.name.toLowerCase() === tp.name.toLowerCase());
                    if (match && (match.stock === undefined || match.stock === null || match.stock <= 0)) {
                      isOutOfStock = true;
                      break;
                    }
                  }
                }
              }
              return isOutOfStock;
            });

            if (zeroStockBestSellers.length > 0) {
              recommendations.push(
                `Artigo com elevada procura está esgotado: "${zeroStockBestSellers[0].name}". Considere iniciar produção imediata ou ajustar o stock no CMS catálogo.`
              );
            }

            // Standard recommendations
            if (recommendations.length === 0) {
              recommendations.push("Excelente! Todas as matérias-primas e artigos de elevada procura encontram-se com níveis de stock saudáveis.");
              recommendations.push("Dica de Atelier: Continue a atualizar o stock das matérias-primas conforme recebe novos novelos para manter os dados corretos.");
            }

            return (
              <div className="space-y-6">
                {/* SUBHEADER WITH OPERATIONAL STATUS */}
                <div className="bg-white border border-forest/5 p-5 rounded-[16px] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="font-serif text-sm font-medium text-forest">Painel de Gestão e Análise de Vendas</h4>
                  </div>
                  
                  {/* REAL-TIME PERSISTENCE BADGE */}
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wider uppercase transition-all flex items-center gap-1.5 border bg-[#BACAA5]/20 text-emerald-800 border-emerald-600/20 shadow-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                      Sincronizado em tempo real
                    </span>
                  </div>
                </div>

                {/* BENTO GRID SUMMARY */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* METRIC 1: FATURAÇÃO GLOBAL */}
                  <div className="bg-white border border-forest/5 p-4.5 rounded-[16px] shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-forest/50">Faturação Global</span>
                      <div className="p-1.5 bg-emerald-50 text-emerald-700 rounded-lg">
                        <DollarSign className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="mt-2.5">
                      <h3 className="font-serif text-xl font-normal text-forest">{successRevenue.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}</h3>
                    </div>
                    <div className="mt-3.5 pt-2.5 border-t border-forest/5 flex justify-between text-[9px] text-forest/60">
                      <span>Pendente CTT: {pendingRevenue.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}</span>
                    </div>
                  </div>

                  {/* METRIC 2: CONVERSÃO DE ENCOMENDAS */}
                  <div className="bg-white border border-forest/5 p-4.5 rounded-[16px] shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-forest/50">Taxa de Conversão</span>
                      <div className="p-1.5 bg-sky-50 text-sky-700 rounded-lg">
                        <Percent className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="mt-2.5">
                      <h3 className="font-serif text-xl font-normal text-forest">{conversionRate}%</h3>
                    </div>
                    <div className="mt-3.5 pt-2.5 border-t border-forest/5 flex justify-between text-[9px] text-forest/60">
                      <span>Pagas: {successOrdersCount}</span>
                      <span>Falhadas: {failedOrdersCount}</span>
                    </div>
                  </div>

                  {/* METRIC 3: CARGA DE TRABALHO ESTIMADA */}
                  <div className="bg-white border border-forest/5 p-4.5 rounded-[16px] shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-forest/50">Carga de Produção</span>
                      <div className="p-1.5 bg-amber-50 text-amber-700 rounded-lg">
                        <Clock className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="mt-2.5">
                      <h3 className="font-serif text-xl font-normal text-forest">{totalActiveCraftingDays} dias</h3>
                    </div>
                    <div className="mt-3.5 pt-2.5 border-t border-forest/5 flex justify-between text-[9px] text-forest/60">
                      <span>Peças a produzir: {paidOrdersList.length}</span>
                    </div>
                  </div>

                  {/* METRIC 4: TICKET MÉDIO */}
                  <div className="bg-white border border-forest/5 p-4.5 rounded-[16px] shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-forest/50">Valor Médio Encomenda</span>
                      <div className="p-1.5 bg-purple-50 text-purple-700 rounded-lg">
                        <TrendingUp className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="mt-2.5">
                      <h3 className="font-serif text-xl font-normal text-forest">{avgOrderValue.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}</h3>
                    </div>
                    <div className="mt-3.5 pt-2.5 border-t border-forest/5 flex justify-between text-[9px] text-forest/60">
                      <span>Método top: MB WAY</span>
                    </div>
                  </div>
                </div>

                {/* MAIN ANALYTICS GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* COLUMN 1 & 2: REVENUE GRAPH & PIPELINE */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* CHART BOX */}
                    <div className="bg-white border border-forest/5 p-5 rounded-[20px] shadow-sm space-y-4">
                      <div className="flex items-center justify-between border-b border-forest/5 pb-3">
                        <div>
                          <h5 className="font-serif text-xs font-semibold text-forest">Faturação</h5>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[9px] font-bold tracking-wider text-forest/60 flex items-center gap-1 uppercase">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#243119]/80"></span> Faturação (€)
                          </span>
                        </div>
                      </div>

                      {activeChartData.length === 0 ? (
                        <div className="h-[150px] flex flex-col items-center justify-center text-center space-y-2 bg-cream/10 rounded-xl">
                          <BarChart3 className="w-8 h-8 text-forest/20" />
                          <p className="text-[10px] text-forest/50 font-medium">Sem dados históricos para desenhar o gráfico.</p>
                        </div>
                      ) : (
                        <div className="w-full flex justify-center">
                          <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-[180px] overflow-visible">
                            <defs>
                              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#243119" stopOpacity="0.25" />
                                <stop offset="100%" stopColor="#243119" stopOpacity="0.00" />
                              </linearGradient>
                            </defs>
                            
                            {/* Horizontal Grid lines */}
                            {Array(4).fill(0).map((_, i) => {
                              const y = paddingTop + (graphHeight / 3) * i;
                              const val = Math.round(maxRevenueInChart - (maxRevenueInChart / 3) * i);
                              return (
                                <g key={i}>
                                  <line 
                                    x1={paddingLeft} 
                                    y1={y} 
                                    x2={chartWidth - paddingRight} 
                                    y2={y} 
                                    stroke="#243119" 
                                    strokeOpacity="0.05" 
                                    strokeDasharray="3 3"
                                  />
                                  <text 
                                    x={paddingLeft - 8} 
                                    y={y + 3} 
                                    textAnchor="end" 
                                    className="font-sans text-[8px] fill-forest/40"
                                  >
                                    {val}€
                                  </text>
                                </g>
                              );
                            })}

                            {/* Area under line */}
                            <path d={areaPath} fill="url(#chartGradient)" />

                            {/* Line path */}
                            <path 
                              d={linePath} 
                              fill="none" 
                              stroke="#243119" 
                              strokeWidth="2" 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                            />

                            {/* Grid vertical dots & highlights */}
                            {points.map((p, i) => (
                              <g key={i}>
                                <circle 
                                  cx={p.x} 
                                  cy={p.y} 
                                  r="4" 
                                  fill="#C5A059" 
                                  stroke="white" 
                                  strokeWidth="1.5" 
                                  className="transition-all hover:scale-150 cursor-pointer"
                                />
                                <text 
                                  x={p.x} 
                                  y={chartHeight - 6} 
                                  textAnchor="middle" 
                                  className="font-sans text-[8px] fill-forest/65 font-medium"
                                >
                                  {p.label}
                                </text>
                                {/* Tooltip hover helper */}
                                <title>{`${p.label}: ${p.value}€`}</title>
                              </g>
                            ))}
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* PIPELINE CONTROL / CONVERSÃO */}
                    <div className="bg-white border border-forest/5 p-5 rounded-[20px] shadow-sm space-y-4">
                      <div>
                        <h5 className="font-serif text-xs font-semibold text-forest">Fluxo de Encomendas</h5>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-2">
                        {/* Passo 1 */}
                        <div className="bg-cream/10 border border-forest/5 p-3 rounded-xl flex flex-col justify-between space-y-1.5">
                          <div className="flex items-center justify-between text-forest/40 font-semibold text-[8px] uppercase tracking-wider">
                            <span>Passo 1</span>
                            <span>Pendentes</span>
                          </div>
                          <div>
                            <h4 className="font-serif text-base font-normal text-forest/75">{pendingOrdersCount} enc.</h4>
                          </div>
                        </div>

                        {/* Passo 2 */}
                        <div className="bg-amber-50/20 border border-amber-500/10 p-3 rounded-xl flex flex-col justify-between space-y-1.5">
                          <div className="flex items-center justify-between text-amber-800/60 font-semibold text-[8px] uppercase tracking-wider">
                            <span>Passo 2</span>
                            <span>No Atelier</span>
                          </div>
                          <div>
                            <h4 className="font-serif text-base font-normal text-amber-900">{paidOrdersCount} enc.</h4>
                          </div>
                        </div>

                        {/* Passo 3 */}
                        <div className="bg-blue-50/25 border border-blue-500/10 p-3 rounded-xl flex flex-col justify-between space-y-1.5">
                          <div className="flex items-center justify-between text-blue-800/60 font-semibold text-[8px] uppercase tracking-wider">
                            <span>Passo 3</span>
                            <span>A Caminho</span>
                          </div>
                          <div>
                            <h4 className="font-serif text-base font-normal text-blue-950">{shippedOrdersCount} enc.</h4>
                          </div>
                        </div>

                        {/* Passo 4 */}
                        <div className="bg-emerald-50/20 border border-emerald-500/10 p-3 rounded-xl flex flex-col justify-between space-y-1.5">
                          <div className="flex items-center justify-between text-emerald-800/60 font-semibold text-[8px] uppercase tracking-wider">
                            <span>Passo 4</span>
                            <span>Entregues</span>
                          </div>
                          <div>
                            <h4 className="font-serif text-base font-normal text-emerald-950">{deliveredOrdersCount} enc.</h4>
                          </div>
                        </div>

                        {/* Canceladas */}
                        <div className="bg-rose-50/20 border border-rose-500/10 p-3 rounded-xl flex flex-col justify-between space-y-1.5">
                          <div className="flex items-center justify-between text-rose-800/60 font-semibold text-[8px] uppercase tracking-wider">
                            <span>Canceladas</span>
                          </div>
                          <div>
                            <h4 className="font-serif text-base font-normal text-rose-950">{failedOrdersCount} enc.</h4>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* COLUMN 3: BEST SELLERS & RECOMMENDATIONS */}
                  <div className="space-y-6">
                    {/* BEST SELLERS */}
                    <div className="bg-white border border-forest/5 p-5 rounded-[20px] shadow-sm space-y-4">
                      <div>
                        <h5 className="font-serif text-xs font-semibold text-forest">Mais Vendidos</h5>
                      </div>

                      {topProducts.length === 0 ? (
                        <div className="py-8 flex flex-col items-center justify-center text-center space-y-1 bg-cream/10 rounded-xl">
                          <Package className="w-6 h-6 text-forest/20" />
                          <p className="text-[10px] text-forest/50 font-medium">Nenhum artigo vendido ainda.</p>
                        </div>
                      ) : (
                        <div className="space-y-3 pt-1">
                          {topProducts.slice(0, 5).map((item, idx) => {
                            // Find percentage based on highest seller count
                            const maxCount = topProducts[0]?.count || 1;
                            const percentage = Math.round((item.count / maxCount) * 100);
                            
                            return (
                              <div key={item.name} className="space-y-1 text-xs text-left">
                                <div className="flex items-center justify-between font-sans text-[10px]">
                                  <span className="font-medium text-forest truncate max-w-[140px]">{idx + 1}. {item.name}</span>
                                  <span className="font-bold text-forest/75 shrink-0">{item.count} un. ({item.revenue}€)</span>
                                </div>
                                <div className="w-full bg-cream/35 h-1.5 rounded-full overflow-hidden">
                                  <div 
                                    className="bg-[#243119] h-full rounded-full transition-all duration-500" 
                                    style={{ width: `${percentage}%` }}
                                  ></div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* SMART RECOMMENDATIONS */}
                    <div className="bg-white border border-forest/5 p-5 rounded-[20px] shadow-sm space-y-4">
                      <div className="flex items-center gap-1.5 text-[#C5A059]">
                        <Settings className="w-4 h-4 shrink-0" />
                        <h5 className="font-serif text-xs font-semibold text-[#A68244]">Alertas</h5>
                      </div>
                      
                      <div className="space-y-3.5 text-left text-[10px] leading-relaxed font-sans text-forest/80">
                        {recommendations.map((rec, i) => (
                          <div key={i} className="flex gap-2 p-2.5 rounded-xl border border-forest/5 bg-cream/15">
                            <span className="text-amber-600 shrink-0 text-xs">★</span>
                            <p>{rec}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* INTERNAL PHYSICAL INVENTORY VIEW (FASE 2) */}
          {activeTab === 'inventory' && (() => {
            // Exclude obsolete legacy cotton yarns (e.g. rm_fio_algodao, algodão cru, cacau escuro)
            const cleanInventory = inventory.filter(i => {
              const id = (i.id || '').toLowerCase();
              const name = (i.name || '').toLowerCase();
              return !id.includes('fio_algodao') && !name.includes('algodão cru') && !name.includes('cacau escuro');
            });

            const safranItems = cleanInventory.filter(i => (i.id || '').toLowerCase().includes('safran') || (i.name || '').toLowerCase().includes('safran'));
            const parisItems = cleanInventory.filter(i => (i.id || '').toLowerCase().includes('paris') || (i.name || '').toLowerCase().includes('paris'));
            const accessoryItems = cleanInventory.filter(i => 
              !(i.id || '').toLowerCase().includes('safran') && 
              !(i.name || '').toLowerCase().includes('safran') && 
              !(i.id || '').toLowerCase().includes('paris') && 
              !(i.name || '').toLowerCase().includes('paris')
            );

            const safranQty = safranItems.reduce((acc, i) => acc + (Number(i.quantity) || 0), 0);
            const parisQty = parisItems.reduce((acc, i) => acc + (Number(i.quantity) || 0), 0);
            const accessoryQty = accessoryItems.reduce((acc, i) => acc + (Number(i.quantity) || 0), 0);

            const displayedItems = 
              inventorySubTab === 'safran' ? safranItems :
              inventorySubTab === 'paris' ? parisItems :
              inventorySubTab === 'accessories' ? accessoryItems :
              cleanInventory;

            return (
              <div className="space-y-6 text-left">
                <div className="bg-white border border-forest/5 p-5 rounded-[16px] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="font-serif text-sm font-medium text-forest">Gestão de Stock de Matérias-Primas</h4>
                    <p className="text-[11px] text-forest/50 font-sans mt-0.5">
                      Lote Real Recebido — Encomenda #18241 (Armazém das Manualidades)
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => fetchInventory()}
                      disabled={loadingInventory}
                      className="px-3 py-2 bg-cream/60 hover:bg-cream text-forest rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                      title="Recarregar dados reais de stock do servidor"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${loadingInventory ? 'animate-spin text-[#C5A059]' : ''}`} />
                      Recarregar
                    </button>
                  <button
                    type="button"
                    onClick={() => {
                      const newId = `rm_${Date.now()}`;
                      const newMat = { id: newId, name: 'Nova Matéria-Prima', quantity: 10.0, unit: 'unidades', minSafety: 2.0 };
                      setEditingMaterial({ isNew: true, material: newMat });
                    }}
                    className="px-4 py-2 bg-[#243119] hover:bg-[#1a2412] text-cream rounded-xl text-xs font-bold tracking-wider uppercase flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Adicionar Matéria-Prima
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      setIsSavingInventory(true);
                      try {
                        const res = await fetch(`${API_BASE_URL}/api/admin/inventory/save`, {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            'x-admin-password': password
                          },
                          body: JSON.stringify({ inventory })
                        });
                        const data = await res.json();
                        if (res.ok && data.success) {
                          alert("Inventário físico de matérias-primas guardado com sucesso!");
                          setInventory(data.inventory || []);
                        } else {
                          alert(data.error || "Erro ao guardar inventário.");
                        }
                      } catch (err) {
                        alert("Erro de rede ao guardar inventário.");
                      } finally {
                        setIsSavingInventory(false);
                      }
                    }}
                    disabled={isSavingInventory}
                    className="px-4 py-2 bg-[#C5A059] hover:bg-[#a68244] text-white rounded-xl text-xs font-bold tracking-wider uppercase flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Save className="w-3.5 h-3.5" /> Guardar Alterações
                  </button>
                </div>
              </div>

              {/* INVENTORY SUB-TABS (DROPS Safran, DROPS Paris, Acessórios & Embalamento, Ver Tudo) */}
              <div className="flex items-center gap-2 bg-cream/20 p-2 rounded-[16px] border border-forest/5 overflow-x-auto max-w-full no-scrollbar shrink-0">
                <button
                  type="button"
                  onClick={() => setInventorySubTab('safran')}
                  className={`px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 whitespace-nowrap ${
                    inventorySubTab === 'safran'
                      ? 'bg-[#243119] text-cream shadow-md'
                      : 'bg-white text-forest/70 hover:bg-cream/60 hover:text-forest'
                  }`}
                >
                  <span>DROPS Safran</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold ${
                    inventorySubTab === 'safran' ? 'bg-[#C5A059] text-white' : 'bg-forest/10 text-forest'
                  }`}>
                    {safranItems.length} cores · {safranQty} nov.
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setInventorySubTab('paris')}
                  className={`px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 whitespace-nowrap ${
                    inventorySubTab === 'paris'
                      ? 'bg-[#243119] text-cream shadow-md'
                      : 'bg-white text-forest/70 hover:bg-cream/60 hover:text-forest'
                  }`}
                >
                  <span>DROPS Paris</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold ${
                    inventorySubTab === 'paris' ? 'bg-[#C5A059] text-white' : 'bg-forest/10 text-forest'
                  }`}>
                    {parisItems.length} cores · {parisQty} nov.
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setInventorySubTab('accessories')}
                  className={`px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 whitespace-nowrap ${
                    inventorySubTab === 'accessories'
                      ? 'bg-[#243119] text-cream shadow-md'
                      : 'bg-white text-forest/70 hover:bg-cream/60 hover:text-forest'
                  }`}
                >
                  <span>Acessórios & Embalamento</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold ${
                    inventorySubTab === 'accessories' ? 'bg-[#C5A059] text-white' : 'bg-forest/10 text-forest'
                  }`}>
                    {accessoryItems.length} itens · {accessoryQty} un.
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setInventorySubTab('all')}
                  className={`px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 whitespace-nowrap ${
                    inventorySubTab === 'all'
                      ? 'bg-[#243119] text-cream shadow-md'
                      : 'bg-white text-forest/70 hover:bg-cream/60 hover:text-forest'
                  }`}
                >
                  <span>Ver Tudo</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold ${
                    inventorySubTab === 'all' ? 'bg-[#C5A059] text-white' : 'bg-forest/10 text-forest'
                  }`}>
                    {inventory.length} matérias-primas
                  </span>
                </button>
              </div>

              {inventoryError && (
                <div className="bg-red-50 text-red-800 border border-red-100 rounded-xl p-4 text-xs">
                  {inventoryError}
                </div>
              )}

              {loadingInventory ? (
                <div className="text-center py-12 text-forest/40 text-xs flex flex-col items-center gap-2">
                  <RefreshCw className="animate-spin w-6 h-6 text-[#C5A059]" />
                  A carregar inventário de matérias-primas...
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Inventory List Column */}
                  <div className="lg:col-span-2 space-y-4">
                    <div className="bg-white border border-forest/5 rounded-[16px] shadow-sm overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-cream/45 text-forest/50 uppercase tracking-wider text-[9px] font-bold border-b border-forest/5">
                            <tr>
                              <th className="px-6 py-3.5">Matéria-Prima</th>
                              <th className="px-6 py-3.5 text-center">Stock Atual</th>
                              <th className="px-6 py-3.5 text-center">Stock Mínimo</th>
                              <th className="px-6 py-3.5 text-right">Ações</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-forest/5">
                            {displayedItems.length === 0 ? (
                              <tr>
                                <td colSpan={4} className="px-6 py-8 text-center text-forest/40 italic text-xs">
                                  Nenhuma matéria-prima encontrada neste separador.
                                </td>
                              </tr>
                            ) : (
                              displayedItems.map((item) => {
                                const isLow = item.quantity < item.minSafety;
                                const getDisplayTitleAndSub = (m: any) => {
                                  const name = m.name || '';
                                  if (name.startsWith('DROPS Safran ')) {
                                    const refColor = name.replace('DROPS Safran ', '').replace('(', '- ').replace(')', '');
                                    return {
                                      title: `Ref. ${refColor}`,
                                      sub: `${name} · ID: ${m.id}`
                                    };
                                  }
                                  if (name.startsWith('DROPS Paris ')) {
                                    const refColor = name.replace('DROPS Paris ', '').replace('(', '- ').replace(')', '');
                                    return {
                                      title: `Ref. ${refColor}`,
                                      sub: `${name} · ID: ${m.id}`
                                    };
                                  }
                                  return {
                                    title: name,
                                    sub: `ID: ${m.id}`
                                  };
                                };
                                const displayInfo = getDisplayTitleAndSub(item);

                                return (
                                  <tr key={item.id} className={`transition-colors ${isLow ? 'bg-amber-50/20 hover:bg-amber-50/45' : 'hover:bg-cream/10'}`}>
                                    <td className="px-6 py-3.5">
                                      <div className="flex items-center gap-3.5">
                                        <YarnSwatch id={item.id} name={item.name} size="w-12 h-12" />
                                        <div>
                                          <div className="font-semibold text-forest flex items-center gap-1.5">
                                            {isLow && <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
                                            <span className="font-sans text-xs font-bold text-forest">{displayInfo.title}</span>
                                          </div>
                                          <div className="text-[10px] text-forest/50 font-mono mt-0.5">
                                            {displayInfo.sub}
                                          </div>
                                        </div>
                                      </div>
                                    </td>
                                  <td className="px-6 py-4 text-center font-mono">
                                    <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                                      isLow ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'
                                    }`}>
                                      {item.quantity} {item.unit}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 text-center font-mono text-forest/60">
                                    {item.minSafety} {item.unit}
                                  </td>
                                  <td className="px-6 py-4 text-right space-x-3">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const qtyStr = prompt(`Reabastecer / Ajustar Stock de ${item.name}:`, String(item.quantity));
                                        if (qtyStr !== null) {
                                          const newQty = parseFloat(parseFloat(qtyStr).toFixed(2));
                                          if (!isNaN(newQty)) {
                                            const updated = inventory.map(m => m.id === item.id ? { ...m, quantity: newQty } : m);
                                            setInventory(updated);
                                          }
                                        }
                                      }}
                                      className="text-[11px] font-medium text-[#C5A059] hover:underline cursor-pointer"
                                    >
                                      Ajustar
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setEditingMaterial({ isNew: false, material: item })}
                                      className="text-[11px] font-medium text-forest/50 hover:text-forest hover:underline cursor-pointer"
                                    >
                                      Editar
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (confirm(`Pretende eliminar permanentemente a matéria-prima ${item.name}?`)) {
                                          setInventory(inventory.filter(m => m.id !== item.id));
                                        }
                                      }}
                                      className="text-[11px] font-medium text-red-600 hover:text-red-800 hover:underline cursor-pointer"
                                    >
                                      Eliminar
                                    </button>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* Deductions & Auto-abate logs panel */}
                  <div className="lg:col-span-1 space-y-4">
                    <div className="bg-white border border-forest/5 p-5 rounded-[16px] shadow-sm space-y-4 text-left">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-forest/35 block border-b border-forest/5 pb-2">Alertas de Stock</span>
                      
                      <div className="space-y-2">
                        {inventory.filter(m => m.quantity < m.minSafety).length === 0 ? (
                          <div className="bg-green-50/30 text-green-800 border border-green-100 p-3 rounded-xl flex items-center gap-2 text-[10px] font-medium">
                            <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                            Todas as matérias-primas têm stock acima do limite de segurança.
                          </div>
                        ) : (
                          inventory.filter(m => m.quantity < m.minSafety).map(item => (
                            <div key={item.id} className="bg-amber-50 text-amber-900 border border-amber-200/40 p-3 rounded-xl flex items-start gap-2 text-[10px] leading-relaxed">
                              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                              <div>
                                <strong>{item.name}</strong> está abaixo do limite! Restam apenas {item.quantity} {item.unit} (Segurança: {item.minSafety}).
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* MATERIAL CREATION/EDITING FLOATING OVERLAY FORM */}
              {editingMaterial && (
                <div className="fixed inset-0 bg-[#243119]/40 backdrop-blur-sm flex items-center justify-center z-[110] p-0 sm:p-4">
                  <div data-lenis-prevent className="bg-white border-0 sm:border border-forest/10 rounded-none sm:rounded-[24px] max-w-sm w-full h-full sm:h-auto max-h-screen sm:max-h-[90vh] p-4 sm:p-6 shadow-2xl text-left space-y-4 overflow-y-auto flex flex-col justify-between">
                    <div className="flex items-center justify-between border-b border-forest/5 pb-3 sticky top-0 bg-white z-20 shrink-0">
                      <h5 className="font-serif text-sm sm:text-base font-bold text-forest truncate pr-2">
                        {editingMaterial.isNew ? 'Nova Matéria-Prima' : `Editar: ${editingMaterial.material.name}`}
                      </h5>
                      <button
                        type="button"
                        onClick={() => setEditingMaterial(null)}
                        className="p-1 text-forest/40 hover:text-forest hover:bg-forest/5 rounded-full cursor-pointer transition-colors shrink-0"
                        aria-label="Fechar"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const updated = editingMaterial.isNew
                          ? [...inventory, editingMaterial.material]
                          : inventory.map(m => m.id === editingMaterial.material.id ? editingMaterial.material : m);
                        
                        setInventory(updated);
                        setEditingMaterial(null);
                      }}
                      className="space-y-4 text-xs text-left"
                    >
                      <div className="space-y-1">
                        <label className="font-bold text-forest/70 block">Identificador ID (ex: rm_feltro_azul)</label>
                        <input
                          type="text"
                          required
                          disabled={!editingMaterial.isNew}
                          value={editingMaterial.material.id}
                          onChange={(e) => setEditingMaterial({
                            ...editingMaterial,
                            material: { ...editingMaterial.material, id: e.target.value }
                          })}
                          className="w-full bg-cream/20 border border-forest/10 focus:border-[#C5A059] focus:outline-none rounded-xl px-3 py-2 disabled:opacity-50"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-forest/70 block">Nome Descritivo</label>
                        <input
                          type="text"
                          required
                          value={editingMaterial.material.name}
                          onChange={(e) => setEditingMaterial({
                            ...editingMaterial,
                            material: { ...editingMaterial.material, name: e.target.value }
                          })}
                          className="w-full bg-cream/20 border border-forest/10 focus:border-[#C5A059] focus:outline-none rounded-xl px-3 py-2"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1 col-span-2">
                          <label className="font-bold text-forest/70 block">Unidade (ex: novelos, metros)</label>
                          <input
                            type="text"
                            required
                            value={editingMaterial.material.unit}
                            onChange={(e) => setEditingMaterial({
                              ...editingMaterial,
                              material: { ...editingMaterial.material, unit: e.target.value }
                            })}
                            className="w-full bg-cream/20 border border-forest/10 focus:border-[#C5A059] focus:outline-none rounded-xl px-2.5 py-2"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="font-bold text-forest/70 block">Stock Inicial</label>
                          <input
                            type="number"
                            step="0.01"
                            required
                            value={editingMaterial.material.quantity}
                            onChange={(e) => setEditingMaterial({
                              ...editingMaterial,
                              material: { ...editingMaterial.material, quantity: parseFloat(e.target.value) || 0 }
                            })}
                            className="w-full bg-cream/20 border border-forest/10 focus:border-[#C5A059] focus:outline-none rounded-xl px-2.5 py-2"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-forest/70 block">Mínimo de Segurança (Emissão de Alerta)</label>
                        <input
                          type="number"
                          step="0.01"
                          required
                          value={editingMaterial.material.minSafety}
                          onChange={(e) => setEditingMaterial({
                            ...editingMaterial,
                            material: { ...editingMaterial.material, minSafety: parseFloat(e.target.value) || 0 }
                          })}
                          className="w-full bg-cream/20 border border-forest/10 focus:border-[#C5A059] focus:outline-none rounded-xl px-3 py-2"
                        />
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2.5 pt-3 border-t border-forest/10 sticky bottom-0 bg-white z-20 pb-1 mt-auto">
                        <button
                          type="button"
                          onClick={() => setEditingMaterial(null)}
                          className="w-full sm:flex-1 py-3 sm:py-2.5 bg-cream hover:bg-cream/70 text-forest rounded-xl font-bold uppercase transition-all cursor-pointer text-center text-xs tracking-wider"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="w-full sm:flex-1 py-3 sm:py-2.5 bg-[#243119] hover:bg-[#1a2412] text-cream rounded-xl font-bold uppercase transition-all cursor-pointer text-center shadow-md text-xs tracking-wider"
                        >
                          Guardar Alterações
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          );
        })()}
        </div>
      )}
    </div>
      </motion.div>

    {/* CRM CLIENT PROFILE SLIDING DRAWER */}
    <AnimatePresence>
      {selectedCustomerEmail && (
        <>
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.35 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedCustomerEmail(null)}
            className="fixed inset-0 bg-[#243119] z-[110]"
          />
          
          {/* Sliding Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 150 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-lg bg-[#FAF8F5] shadow-2xl z-[120] flex flex-col border-l border-forest/15 h-full overflow-hidden"
          >
            {/* Drawer Header */}
            <div className="px-6 py-5 border-b border-forest/5 bg-[#FCFBF9] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-[#C5A059]" />
                <div className="text-left">
                  <h3 className="font-serif text-base font-semibold text-forest">Ficha de Cliente Artesanal</h3>
                  <p className="text-[10px] text-forest/40">M★BRAVO CRM & Relacionamento</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCustomerEmail(null)}
                className="p-1.5 rounded-lg hover:bg-forest/5 text-forest/40 hover:text-forest transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body - Scrollable */}
            <div 
              className="flex-1 overflow-y-auto overscroll-contain touch-pan-y p-6 space-y-6 text-left min-h-0"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              {loadingCustomerProfile ? (
                <div className="py-20 flex flex-col items-center justify-center space-y-3">
                  <RefreshCw className="w-6 h-6 animate-spin text-[#C5A059]" />
                  <span className="text-xs text-forest/50">A carregar perfil de cliente...</span>
                </div>
              ) : customerProfileError ? (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center space-y-2">
                  <p className="text-xs text-red-800">{customerProfileError}</p>
                  <button
                    type="button"
                    onClick={() => fetchCustomerProfile(selectedCustomerEmail)}
                    className="text-xs font-bold text-red-950 hover:underline flex items-center gap-1 mx-auto"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Tentar Novamente
                  </button>
                </div>
              ) : customerProfile ? (
                <>
                  {/* CRM STATS / QUICK METRICS */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#FCF8F2] border border-[#C5A059]/10 rounded-xl p-3.5 text-left">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-forest/40 block">Total Encomendas</span>
                      <div className="font-serif text-lg text-forest mt-0.5">
                        {customerProfile.orders?.length || 0} { (customerProfile.orders?.length || 0) === 1 ? 'encomenda' : 'encomendas' }
                      </div>
                    </div>
                    <div className="bg-[#FCF8F2] border border-[#C5A059]/10 rounded-xl p-3.5 text-left">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-forest/40 block">Valor Acumulado</span>
                      <div className="font-serif text-lg text-forest mt-0.5">
                        {(() => {
                          const total = (customerProfile.orders || []).reduce((sum: number, ord: any) => {
                            const cleanVal = parseFloat(String(ord.price || "0").replace(/[^0-9.,]/g, "").replace(",", ".") || "0");
                            return sum + cleanVal;
                          }, 0);
                          return total.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' });
                        })()}
                      </div>
                    </div>
                  </div>

                  {/* PILAR 1: DADOS DE CONTACTO & NOTAS DE INSTAGRAM */}
                  <div className="bg-white border border-forest/5 rounded-2xl p-5 space-y-4 shadow-sm text-left">
                    <h4 className="font-serif text-xs font-bold text-forest border-b border-forest/5 pb-2 uppercase tracking-wide flex items-center gap-1.5">
                      <Instagram className="w-3.5 h-3.5 text-[#C5A059]" /> Pilar 1: Identidade & Redes Sociais
                    </h4>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="space-y-1">
                        <label className="font-bold text-forest/50 block">Nome do Cliente</label>
                        <input
                          type="text"
                          value={crmFields.name}
                          onChange={(e) => setCrmFields(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full bg-[#FCFBF9] border border-forest/10 focus:border-[#C5A059] focus:outline-none rounded-lg px-2.5 py-1.5 text-forest"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold text-forest/50 block">Telefone</label>
                        <input
                          type="text"
                          placeholder="+351 9xx xxx xxx"
                          value={crmFields.phone}
                          onChange={(e) => setCrmFields(prev => ({ ...prev, phone: e.target.value }))}
                          onBlur={(e) => setCrmFields(prev => ({ ...prev, phone: formatPhoneReadable(e.target.value) }))}
                          className="w-full bg-[#FCFBF9] border border-forest/10 focus:border-[#C5A059] focus:outline-none rounded-lg px-2.5 py-1.5 text-forest font-mono"
                        />
                      </div>
                    </div>

                    <div className="space-y-1 text-xs">
                      <label className="font-bold text-forest/50 block">E-mail de Contacto (Único)</label>
                      <input
                        type="text"
                        disabled
                        value={customerProfile.email}
                        className="w-full bg-forest/5 border border-forest/5 rounded-lg px-2.5 py-1.5 text-forest/50 font-mono select-all"
                      />
                    </div>

                    <div className="space-y-1 text-xs">
                      <label className="font-bold text-forest/50 block">Utilizador de Instagram</label>
                      <div className="flex rounded-lg overflow-hidden border border-forest/10 bg-[#FCFBF9]">
                        <span className="px-2.5 py-1.5 bg-forest/5 border-r border-forest/10 text-forest/55 font-medium">@</span>
                        <input
                          type="text"
                          placeholder="utilizador"
                          value={crmFields.instagram}
                          onChange={(e) => setCrmFields(prev => ({ ...prev, instagram: e.target.value.replace(/^@/, '') }))}
                          className="flex-1 bg-transparent focus:outline-none px-2.5 py-1.5 text-forest"
                        />
                      </div>
                    </div>

                    <div className="space-y-1 text-xs">
                      <label className="font-bold text-forest/50 block">Notas de Contacto e Instagram</label>
                      <textarea
                        rows={3}
                        placeholder="Ex: Falou por DM sobre casaco de linho. Prefere tons terra e botões de madeira..."
                        value={crmFields.instagramNotes}
                        onChange={(e) => setCrmFields(prev => ({ ...prev, instagramNotes: e.target.value }))}
                        className="w-full bg-[#FCFBF9] border border-forest/10 focus:border-[#C5A059] focus:outline-none rounded-lg px-2.5 py-1.5 text-forest"
                      />
                    </div>
                  </div>

                  {/* PILAR 3: ANIVERSÁRIO E DATAS ESPECIAIS */}
                  <div className="bg-white border border-forest/5 rounded-2xl p-5 space-y-4 shadow-sm text-left">
                    <h4 className="font-serif text-xs font-bold text-forest border-b border-forest/5 pb-2 uppercase tracking-wide flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#C5A059]" /> Pilar 3: Datas Especiais & Aniversário
                    </h4>

                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div className="space-y-1">
                        <label className="font-bold text-forest/50 block">Data de Aniversário</label>
                        <input
                          type="date"
                          value={crmFields.birthday}
                          onChange={(e) => setCrmFields(prev => ({ ...prev, birthday: e.target.value }))}
                          className="w-full bg-[#FCFBF9] border border-forest/10 focus:border-[#C5A059] focus:outline-none rounded-lg px-2.5 py-1.5 text-forest font-mono"
                        />
                      </div>

                      {/* Birthday Status */}
                      <div className="flex flex-col justify-end text-xs text-forest/70 bg-[#FCF8F2]/40 rounded-lg p-2 border border-[#C5A059]/5 text-left font-sans">
                        {crmFields.birthday ? (
                          (() => {
                            try {
                              const bDate = new Date(crmFields.birthday);
                              if (!isNaN(bDate.getTime())) {
                                const today = new Date();
                                const monthName = bDate.toLocaleString('pt-PT', { month: 'long' });
                                const bDay = bDate.getDate();
                                
                                // Check if birthday has passed this year
                                const nextBday = new Date(today.getFullYear(), bDate.getMonth(), bDay);
                                if (today.getTime() > nextBday.getTime()) {
                                  nextBday.setFullYear(today.getFullYear() + 1);
                                }
                                const diffDays = Math.ceil((nextBday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                                
                                return (
                                  <div className="space-y-0.5 text-left">
                                    <span className="text-[10px] font-semibold text-forest/40">Próximo aniversário:</span>
                                    <div className="font-serif font-medium text-forest/90">
                                      {bDay} de {monthName}
                                    </div>
                                    <div className="text-[9px] text-[#C5A059] italic">
                                      Faltam {diffDays} dias
                                    </div>
                                  </div>
                                );
                              }
                            } catch(e) {}
                            return <span className="text-forest/30 italic text-[10px]">Data introduzida inválida</span>;
                          })()
                        ) : (
                          <span className="text-forest/30 italic text-[10px] self-center my-auto">Sem aniversário definido</span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1 text-xs">
                      <label className="font-bold text-forest/50 block">Medidas de Costura / Notas Operacionais</label>
                      <textarea
                        rows={2.5}
                        placeholder="Ex: Altura da manga +2cm, tamanho M padrão mas com corte subido..."
                        value={crmFields.customNotes}
                        onChange={(e) => setCrmFields(prev => ({ ...prev, customNotes: e.target.value }))}
                        className="w-full bg-[#FCFBF9] border border-forest/10 focus:border-[#C5A059] focus:outline-none rounded-lg px-2.5 py-1.5 text-forest"
                      />
                    </div>
                  </div>

                  {/* PILAR 2: HISTÓRICO DE ENCOMENDAS (TIMELINE) */}
                  <div className="bg-white border border-forest/5 rounded-2xl p-5 space-y-4 shadow-sm text-left">
                    <h4 className="font-serif text-xs font-bold text-forest border-b border-forest/5 pb-2 uppercase tracking-wide flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5 text-[#C5A059]" /> Pilar 2: Histórico de Encomendas ({customerProfile.orders?.length || 0})
                    </h4>

                    {(!customerProfile.orders || customerProfile.orders.length === 0) ? (
                      <p className="text-xs text-forest/40 italic">Sem encomendas associadas a este e-mail.</p>
                    ) : (
                      <div className="space-y-3.5 max-h-60 overflow-y-auto pr-1">
                        {customerProfile.orders.map((ord: any) => (
                          <div key={ord.orderId} className="border-l-2 border-[#C5A059]/30 pl-3.5 space-y-1 text-xs relative text-left">
                            <div className="absolute w-2 h-2 rounded-full bg-[#C5A059] -left-[5px] top-1" />
                            <div className="flex items-center justify-between">
                              <span className="font-mono font-bold text-forest hover:underline cursor-pointer" onClick={() => {
                                setSelectedCustomerEmail(null);
                                setSearchQuery(ord.orderId);
                                setStatusFilter('all');
                                setActiveTab('orders');
                              }}>
                                ID: {ord.orderId}
                              </span>
                              <span className="text-[10px] text-forest/40">
                                {new Date(ord.createdAt).toLocaleDateString('pt-PT')}
                              </span>
                            </div>
                            <div className="font-serif text-forest/95">{ord.productName}</div>
                            <div className="text-[10px] text-forest/60 flex items-center gap-3">
                              <span>Cor: {ord.selections?.cor}</span>
                              <span>Tamanho: {ord.selections?.tamanho || 'M'}</span>
                              <span className="font-semibold text-forest/80 ml-auto">{ord.price}</span>
                            </div>
                            <div className="pt-0.5 flex justify-between items-center">
                              {/* Small status pill */}
                              <span className={`text-[8.5px] uppercase font-bold tracking-wider rounded-full px-2 py-0.5 ${
                                ord.status === 'paid' ? 'bg-green-50 text-green-800' :
                                ord.status === 'pending_payment' ? 'bg-amber-50 text-amber-800' :
                                ord.status === 'shipped' ? 'bg-amber-950/10 text-amber-950' :
                                ord.status === 'delivered' ? 'bg-emerald-50 text-emerald-800' :
                                'bg-red-50 text-red-800'
                              }`}>
                                {ord.status === 'paid' ? 'No Atelier' :
                                 ord.status === 'pending_payment' ? 'Aguardar Liquidação' :
                                 ord.status === 'shipped' ? 'A Caminho' :
                                 ord.status === 'delivered' ? 'Entregue' :
                                 'Cancelada'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              ) : null}
            </div>

            {/* Drawer Footer Actions */}
            {customerProfile && !loadingCustomerProfile && (
              <div className="p-4 sm:p-6 border-t border-forest/10 bg-[#FCFBF9] flex flex-col sm:flex-row gap-2.5 sticky bottom-0 z-20 shrink-0">
                <button
                  type="button"
                  onClick={() => setSelectedCustomerEmail(null)}
                  className="w-full sm:flex-1 py-3 sm:py-2.5 bg-white border border-forest/10 hover:bg-forest/5 text-forest/70 hover:text-forest rounded-xl font-bold uppercase tracking-wider text-xs transition-colors cursor-pointer"
                >
                  Fechar
                </button>
                <button
                  type="button"
                  disabled={isSavingCustomerProfile}
                  onClick={handleSaveCustomerProfile}
                  className="w-full sm:flex-1 py-3 sm:py-2.5 bg-[#243119] hover:bg-[#1a2412] text-cream rounded-xl font-bold uppercase tracking-wider text-xs transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
                >
                  {isSavingCustomerProfile ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> A Gravar...
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" /> Gravar Ficha
                    </>
                  )}
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>

    {/* EMAIL PREVIEW MODAL OVERLAY */}
    <AnimatePresence>
      {emailPreviewModal?.isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-fade-in">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="bg-[#FAF8F5] border border-[#C5A059]/30 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 sm:p-5 bg-[#243119] text-cream flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-[#C5A059]" />
                <h3 className="font-serif text-base sm:text-lg font-bold tracking-wide">
                  {emailPreviewModal.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEmailPreviewModal(null)}
                className="p-1.5 hover:bg-white/10 rounded-full transition-colors text-cream/70 hover:text-cream cursor-pointer"
                title="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Action Bar */}
            <div className="px-4 py-2.5 bg-[#FCF8F2] border-b border-[#C5A059]/15 flex items-center justify-between shrink-0 text-xs">
              <span className="text-forest/60 font-medium hidden sm:inline">Pré-visualização Fidedigna do Template HTML</span>
              <span className="text-forest/60 font-medium sm:hidden">Template HTML</span>
              <div className="flex items-center gap-2">
                {!emailPreviewModal.loading && emailPreviewModal.html && (
                  <button
                    type="button"
                    onClick={() => {
                      const blob = new Blob([emailPreviewModal.html], { type: 'text/html;charset=utf-8;' });
                      const url = URL.createObjectURL(blob);
                      window.open(url, '_blank');
                    }}
                    className="px-3 py-1.5 bg-white border border-[#C5A059]/30 hover:bg-[#F3EFE9] text-[#243119] rounded-lg font-bold uppercase tracking-wider text-[10px] flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <ExternalLink className="w-3 h-3 text-[#C5A059]" />
                    Abrir em Nova Aba
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setEmailPreviewModal(null)}
                  className="px-3 py-1.5 bg-[#243119] text-cream hover:bg-[#1a2412] rounded-lg font-bold uppercase tracking-wider text-[10px] transition-colors cursor-pointer"
                >
                  Fechar
                </button>
              </div>
            </div>

            {/* Modal Body / Iframe */}
            <div className="p-3 sm:p-5 flex-1 bg-[#F5F2ED] overflow-y-auto min-h-[380px] flex items-center justify-center">
              {emailPreviewModal.loading ? (
                <div className="flex flex-col items-center justify-center p-12 space-y-3">
                  <RefreshCw className="w-8 h-8 text-[#C5A059] animate-spin" />
                  <p className="text-xs font-bold uppercase tracking-widest text-[#243119]">A gerar modelo do e-mail...</p>
                </div>
              ) : (
                <iframe
                  srcDoc={emailPreviewModal.html}
                  title="Pré-visualização de E-mail"
                  className="w-full h-[65vh] border border-[#C5A059]/20 rounded-xl shadow-inner bg-white"
                />
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
    </div>
  );
}
