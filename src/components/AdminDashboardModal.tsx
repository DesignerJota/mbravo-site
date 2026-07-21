import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Search, Lock, Unlock, User, Mail, Phone, MapPin, 
  CreditCard, Clock, Truck, FileText, CheckCircle, AlertCircle, 
  ExternalLink, Eye, RefreshCw, Sliders, Calendar, DollarSign, 
  Package, ChevronRight, AlertTriangle, ShieldCheck, Plus,
  Download, ClipboardList, Trash, Edit, Save, Check, EyeOff, Layers, Settings,
  BarChart3, Percent, TrendingUp, ArrowUpRight, Instagram
} from 'lucide-react';
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

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
    productName: '',
    price: '',
    cor: '',
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
    priority: 'NORMAL'
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

  // CMS Physical Inventory states
  const [inventory, setInventory] = useState<any[]>([]);
  const [loadingInventory, setLoadingInventory] = useState(false);
  const [inventoryError, setInventoryError] = useState<string | null>(null);
  const [isSavingInventory, setIsSavingInventory] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<any | null>(null);

  // Analytics simulation toggle state
  const [showSimulatedData, setShowSimulatedData] = useState<boolean>(true);

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
          phone: data.profile.phone || '',
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

  const handleCreateManualOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualForm.productName || !manualForm.customerNome) {
      alert("Nome do Produto e Nome do Cliente são obrigatórios.");
      return;
    }

    setIsCreatingManual(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/orders/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': password
        },
        body: JSON.stringify({
          productName: manualForm.productName,
          price: parseFloat(manualForm.price) || 0,
          selections: {
            cor: manualForm.cor || 'Padrão',
            tamanho: manualForm.tamanho || 'Único',
            quantidade: manualForm.quantidade || '1'
          },
          customer: {
            nome: manualForm.customerNome,
            email: manualForm.customerEmail,
            telefone: manualForm.customerTelefone,
            morada: manualForm.customerMorada,
            codigoPostal: manualForm.customerCodigoPostal,
            cidade: manualForm.customerCidade,
            nif: manualForm.customerNif
          },
          paymentMethod: manualForm.paymentMethod,
          status: manualForm.status,
          priority: manualForm.priority,
          createdAt: new Date().toISOString()
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        alert("Encomenda manual registada com sucesso na base de dados!");
        setManualForm({
          productName: '',
          price: '',
          cor: '',
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
          priority: 'NORMAL'
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
      const cor = selections.cor || "Padrao";
      const tamanho = selections.tamanho || "Unico";
      const quantidade = selections.quantidade || "1";
      const itemDetails = `Cor: ${cor}, Tam: ${tamanho}, Qtd: ${quantidade}`;
      
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
        o.customer?.telefone || "",
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

  // Helper to parse price string like "50.00€" or "50€" to number
  const parsePrice = (priceStr: string): number => {
    if (!priceStr) return 0;
    const clean = priceStr.replace(/[^0-9,.]/g, '').replace(',', '.');
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-4 bg-forest/80 backdrop-blur-sm select-text">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-6xl h-full md:h-[85vh] bg-[#FCFBF9] text-forest rounded-none md:rounded-[24px] shadow-2xl border border-[#C5A059]/10 flex flex-col overflow-hidden"
      >
        {/* HEADER RAIL */}
        <div className="flex items-center justify-between px-4 sm:px-8 py-4 sm:py-5 border-b border-forest/5 bg-white/50">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-[#C5A059] animate-pulse" />
            <h3 className="font-serif text-sm sm:text-lg tracking-wider font-medium text-forest uppercase flex items-center gap-2">
              M★BRAVO <span className="text-[#C5A059] font-sans text-[10px] sm:text-xs font-semibold tracking-widest bg-[#FCF8F2] border border-[#C5A059]/20 px-2 sm:px-2.5 py-0.5 rounded-full">ATELIER ADMIN</span>
            </h3>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            {isAuthenticated && (
              <button 
                onClick={handleLogout}
                className="text-[10px] sm:text-xs uppercase tracking-widest text-red-700 hover:text-red-900 bg-red-50 hover:bg-red-100/55 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full transition-all font-semibold"
              >
                Sair
              </button>
            )}
            <button 
              onClick={onClose}
              className="p-1 sm:p-1.5 hover:bg-forest/5 rounded-full transition-all cursor-pointer text-forest/60 hover:text-forest"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* CONTAINER CONTENT */}
        <div data-lenis-prevent className="flex-1 overflow-y-auto">
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
                  M★BRAVO &bull; Confeccionado com Tempo e Afeto
                </div>
              </div>
            </div>
          ) : (
            /* ADMIN DASHBOARD */
            <div className="p-8 space-y-8 font-sans">
              
              {/* STATS HIGHLIGHT PANEL */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="bg-white border border-forest/5 p-4 rounded-[16px] shadow-sm space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-forest/35">Total Encomendas</div>
                  <div className="text-xl font-serif font-medium text-forest flex items-center gap-1.5">
                    <Package className="w-4 h-4 text-[#C5A059] shrink-0" />
                    <span>{totalOrders}</span>
                  </div>
                </div>

                <div className="bg-white border border-forest/5 p-4 rounded-[16px] shadow-sm space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-forest/35">Total Faturado</div>
                  <div className="text-xl font-serif font-medium text-forest flex items-center gap-1">
                    <span className="text-[#BACAA5] font-sans text-base">€</span>
                    <span>{totalRevenue.toFixed(2)}</span>
                  </div>
                </div>

                <div className="bg-white border border-forest/5 p-4 rounded-[16px] shadow-sm space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-forest/35">Aguardar Liquidação</div>
                  <div className="text-xl font-serif font-medium text-amber-600 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 shrink-0" />
                    <span>{pendingOrders}</span>
                  </div>
                </div>

                <div className="bg-white border border-forest/5 p-4 rounded-[16px] shadow-sm space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-forest/35">No Atelier</div>
                  <div className="text-xl font-serif font-medium text-green-700 flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    <span>{paidOrders}</span>
                  </div>
                </div>

                <div className="bg-white border border-forest/5 p-4 rounded-[16px] shadow-sm space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#A68244]">A Caminho</div>
                  <div className="text-xl font-serif font-medium text-amber-700 flex items-center gap-1.5">
                    <Truck className="w-4 h-4 shrink-0" />
                    <span>{shippedOrders}</span>
                  </div>
                </div>

                <div className="bg-[#243119] text-cream p-4 rounded-[16px] shadow-sm space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-cream/40">Entregues</div>
                  <div className="text-xl font-serif font-medium text-[#C5A059] flex items-center gap-1.5">
                    <Check className="w-4 h-4 shrink-0" />
                    <span>{deliveredOrders}</span>
                  </div>
                </div>
              </div>

              {/* TAB SWITCHER & ACTION BAR */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-forest/10 pb-2 gap-4">
                <div className="flex flex-wrap items-center gap-1.5 bg-cream/35 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setActiveTab('analytics')}
                    className={`px-3.5 py-2 rounded-lg font-semibold text-xs tracking-wider transition-all uppercase flex items-center gap-2 cursor-pointer ${
                      activeTab === 'analytics'
                        ? 'bg-[#243119] text-cream shadow-sm font-bold'
                        : 'text-forest/60 hover:text-forest hover:bg-cream/50'
                    }`}
                  >
                    <BarChart3 className="w-3.5 h-3.5" /> Painel de Vendas
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('orders')}
                    className={`px-3.5 py-2 rounded-lg font-semibold text-xs tracking-wider transition-all uppercase flex items-center gap-2 cursor-pointer ${
                      activeTab === 'orders'
                        ? 'bg-[#243119] text-cream shadow-sm font-bold'
                        : 'text-forest/60 hover:text-forest hover:bg-cream/50'
                    }`}
                  >
                    <Package className="w-3.5 h-3.5" /> Encomendas
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('catalog')}
                    className={`px-3.5 py-2 rounded-lg font-semibold text-xs tracking-wider transition-all uppercase flex items-center gap-2 cursor-pointer ${
                      activeTab === 'catalog'
                        ? 'bg-[#243119] text-cream shadow-sm font-bold'
                        : 'text-forest/60 hover:text-forest hover:bg-cream/50'
                    }`}
                  >
                    <Sliders className="w-3.5 h-3.5" /> CMS Catálogo
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('inventory')}
                    className={`px-3.5 py-2 rounded-lg font-semibold text-xs tracking-wider transition-all uppercase flex items-center gap-2 cursor-pointer ${
                      activeTab === 'inventory'
                        ? 'bg-[#243119] text-cream shadow-sm font-bold'
                        : 'text-forest/60 hover:text-forest hover:bg-cream/50'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" /> Inventário
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('logs')}
                    className={`px-3.5 py-2 rounded-lg font-semibold text-xs tracking-wider transition-all uppercase flex items-center gap-2 cursor-pointer ${
                      activeTab === 'logs'
                        ? 'bg-[#243119] text-cream shadow-sm font-bold'
                        : 'text-forest/60 hover:text-forest hover:bg-cream/50'
                    }`}
                  >
                    <ClipboardList className="w-3.5 h-3.5" /> Auditoria
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  {activeTab === 'orders' && (
                    <button
                      type="button"
                      onClick={exportToCSV}
                      className="px-4 py-2.5 rounded-xl text-xs tracking-wider font-bold transition-all bg-[#C5A059] hover:bg-[#a68244] text-white flex items-center gap-2 shadow-sm uppercase cursor-pointer"
                    >
                      <Download className="w-4 h-4" /> Exportar Contabilidade (CSV)
                    </button>
                  )}
                  {activeTab === 'catalog' && (
                    <button
                      type="button"
                      onClick={() => fetchCatalog()}
                      className="px-4 py-2.5 rounded-xl text-xs tracking-wider font-bold transition-all bg-[#BACAA5] hover:bg-[#a3b38e] text-[#243119] flex items-center gap-2 shadow-sm uppercase cursor-pointer"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${loadingCatalog ? 'animate-spin' : ''}`} /> Sincronizar Catálogo
                    </button>
                  )}
                  {activeTab === 'inventory' && (
                    <button
                      type="button"
                      onClick={() => fetchInventory()}
                      className="px-4 py-2.5 rounded-xl text-xs tracking-wider font-bold transition-all bg-[#BACAA5] hover:bg-[#a3b38e] text-[#243119] flex items-center gap-2 shadow-sm uppercase cursor-pointer"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${loadingInventory ? 'animate-spin' : ''}`} /> Sincronizar Stock
                    </button>
                  )}
                  {activeTab === 'logs' && (
                    <button
                      type="button"
                      onClick={() => fetchLogs()}
                      className="px-4 py-2.5 rounded-xl text-xs tracking-wider font-bold transition-all bg-[#BACAA5] hover:bg-[#a3b38e] text-[#243119] flex items-center gap-2 shadow-sm uppercase cursor-pointer"
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
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  <button 
                    onClick={() => setStatusFilter('all')}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-all ${statusFilter === 'all' ? 'bg-[#243119] text-cream' : 'bg-cream/40 text-forest/60 hover:bg-cream/70'}`}
                  >
                    Todas <span className={`ml-1 text-[10px] font-mono ${statusFilter === 'all' ? 'text-cream/70' : 'text-forest/40'}`}>{totalOrders}</span>
                  </button>
                  <button 
                    onClick={() => setStatusFilter('pending_payment')}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${statusFilter === 'pending_payment' ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-800 border border-amber-200/20 hover:bg-amber-100/50'}`}
                  >
                    Aguardar Liquidação <span className={`ml-1 text-[10px] font-mono ${statusFilter === 'pending_payment' ? 'text-white/70' : 'text-amber-800/40'}`}>{pendingOrders}</span>
                  </button>
                  <button 
                    onClick={() => setStatusFilter('paid')}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${statusFilter === 'paid' ? 'bg-green-700 text-white' : 'bg-green-50 text-green-800 border border-green-200/20 hover:bg-green-100/50'}`}
                  >
                    No Atelier <span className={`ml-1 text-[10px] font-mono ${statusFilter === 'paid' ? 'text-white/70' : 'text-green-800/40'}`}>{paidOrders}</span>
                  </button>
                  <button 
                    onClick={() => setStatusFilter('shipped')}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${statusFilter === 'shipped' ? 'bg-[#C5A059] text-[#243119]' : 'bg-amber-50/50 text-[#A68244] border border-[#C5A059]/10 hover:bg-amber-100/30'}`}
                  >
                    A Caminho <span className={`ml-1 text-[10px] font-mono ${statusFilter === 'shipped' ? 'text-[#243119]/70' : 'text-[#A68244]/50'}`}>{shippedOrders}</span>
                  </button>
                  <button 
                    onClick={() => setStatusFilter('delivered')}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${statusFilter === 'delivered' ? 'bg-[#243119] text-cream' : 'bg-green-50 text-green-800 border border-green-200/20 hover:bg-green-100/50'}`}
                  >
                    Entregues <span className={`ml-1 text-[10px] font-mono ${statusFilter === 'delivered' ? 'text-cream/70' : 'text-green-800/40'}`}>{deliveredOrders}</span>
                  </button>
                  <button 
                    onClick={() => setStatusFilter('failed')}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${statusFilter === 'failed' ? 'bg-red-700 text-white' : 'bg-red-50 text-red-800 border border-red-200/20 hover:bg-red-100/50'}`}
                  >
                    Canceladas <span className={`ml-1 text-[10px] font-mono ${statusFilter === 'failed' ? 'text-white/70' : 'text-red-800/40'}`}>{orders.filter(o => o.status === 'failed').length}</span>
                  </button>
                  <button 
                    onClick={() => fetchOrders()}
                    title="Atualizar dados"
                    className="p-2 hover:bg-forest/5 rounded-lg transition-all text-forest/60 ml-2"
                  >
                    <RefreshCw className={`w-4 h-4 ${loadingOrders ? 'animate-spin' : ''}`} />
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowManualForm(!showManualForm)}
                    className="px-3 py-1.5 rounded-lg font-medium transition-all bg-[#BACAA5] text-[#243119] hover:bg-[#a3b38e] flex items-center gap-1.5 font-sans text-xs cursor-pointer"
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
                    {/* Product Name */}
                    <div className="space-y-1">
                      <label className="font-bold uppercase tracking-wider text-[10px] text-forest/50">Nome do Produto *</label>
                      <input 
                        type="text" 
                        placeholder="Ex: Daisy Coasters (Set de 4)" 
                        value={manualForm.productName}
                        onChange={(e) => setManualForm(prev => ({ ...prev, productName: e.target.value }))}
                        className="w-full bg-white border border-forest/15 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#C5A059]"
                        required
                      />
                    </div>

                    {/* Price */}
                    <div className="space-y-1">
                      <label className="font-bold uppercase tracking-wider text-[10px] text-forest/50">Preço (€) *</label>
                      <input 
                        type="number" 
                        step="0.01" 
                        placeholder="Ex: 24.00" 
                        value={manualForm.price}
                        onChange={(e) => setManualForm(prev => ({ ...prev, price: e.target.value }))}
                        className="w-full bg-white border border-forest/15 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#C5A059]"
                        required
                      />
                    </div>

                    {/* Selections Quantity, Color, Size */}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="space-y-1">
                        <label className="font-bold uppercase tracking-wider text-[10px] text-forest/50">Cor</label>
                        <input 
                          type="text" 
                          placeholder="Cru" 
                          value={manualForm.cor}
                          onChange={(e) => setManualForm(prev => ({ ...prev, cor: e.target.value }))}
                          className="w-full bg-white border border-forest/15 rounded-xl px-3 py-2.5 focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold uppercase tracking-wider text-[10px] text-forest/50">Tam.</label>
                        <input 
                          type="text" 
                          placeholder="Único" 
                          value={manualForm.tamanho}
                          onChange={(e) => setManualForm(prev => ({ ...prev, tamanho: e.target.value }))}
                          className="w-full bg-white border border-forest/15 rounded-xl px-3 py-2.5 focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold uppercase tracking-wider text-[10px] text-forest/50">Qtd.</label>
                        <input 
                          type="text" 
                          placeholder="1" 
                          value={manualForm.quantidade}
                          onChange={(e) => setManualForm(prev => ({ ...prev, quantidade: e.target.value }))}
                          className="w-full bg-white border border-forest/15 rounded-xl px-3 py-2.5 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

                    {/* Customer Phone */}
                    <div className="space-y-1">
                      <label className="font-bold uppercase tracking-wider text-[10px] text-forest/50">Telefone do Cliente</label>
                      <input 
                        type="text" 
                        placeholder="Ex: 912345678" 
                        value={manualForm.customerTelefone}
                        onChange={(e) => setManualForm(prev => ({ ...prev, customerTelefone: e.target.value }))}
                        className="w-full bg-white border border-forest/15 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#C5A059]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                        value={manualForm.customerCodigoPostal}
                        onChange={(e) => setManualForm(prev => ({ ...prev, customerCodigoPostal: e.target.value }))}
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

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* NIF */}
                    <div className="space-y-1">
                      <label className="font-bold uppercase tracking-wider text-[10px] text-forest/50">NIF (Opcional)</label>
                      <input 
                        type="text" 
                        placeholder="Ex: 123456789" 
                        value={manualForm.customerNif}
                        onChange={(e) => setManualForm(prev => ({ ...prev, customerNif: e.target.value }))}
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
                                  <a href={`tel:${order.customer?.telefone}`} className="hover:underline text-forest/80 font-mono">{order.customer?.telefone}</a>
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
                                    className="text-[10px] font-semibold text-[#C5A059] hover:text-[#9e7d3e] flex items-center gap-1.5 transition-all cursor-pointer bg-[#FCF8F2] hover:bg-[#F7EFE3] px-2.5 py-1.5 rounded-lg border border-[#C5A059]/15 shadow-[0_1px_2px_rgba(197,160,89,0.05)] font-serif italic"
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
                                <div className="flex justify-between">
                                  <span className="text-forest/40">Tamanho:</span>
                                  <span className="font-semibold">{order.selections?.tamanho || 'Manual/Sob Medida'}</span>
                                </div>
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
                                      className="w-full bg-[#FCFBF9] border border-forest/10 focus:border-[#C5A059] focus:outline-none rounded-lg px-3 py-2 text-xs font-mono uppercase"
                                    />
                                  </div>
                                  <button
                                    onClick={() => handleDispatchTracking(order.orderId)}
                                    disabled={isUpdating || !trInput}
                                    className="w-full py-2 bg-[#243119] hover:bg-[#1a2412] text-cream rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-40"
                                  >
                                    <Truck className="w-3.5 h-3.5" />
                                    Expedir & Enviar E-mail
                                  </button>
                                </div>
                              )}

                              {order.status === 'shipped' && (
                                <div className="space-y-3">
                                  <div className="bg-[#E6ECDF]/30 border border-[#BACAA5]/40 rounded-xl p-3 text-xs space-y-2">
                                    <div className="flex items-center gap-1 text-[#243119] font-medium font-sans">
                                      <ShieldCheck className="w-4 h-4 text-[#C5A059] shrink-0" />
                                      <span>Rastreio CTT Ativo</span>
                                    </div>
                                    <div className="font-mono font-bold text-[#243119] text-center bg-white border border-forest/5 rounded px-2 py-1.5">
                                      {order.trackingCode}
                                    </div>
                                    <a 
                                      href={`https://www.ctt.pt/feapl_2/app/open/objectSearch/objectSearch.jspx?lang=def&objects=${order.trackingCode}`}
                                      target="_blank" 
                                      rel="noreferrer"
                                      className="text-[10px] uppercase tracking-wider text-[#C5A059] hover:text-[#A68244] font-bold flex items-center justify-center gap-1 mt-1 hover:underline"
                                    >
                                      Acompanhar nos CTT
                                      <ExternalLink className="w-3 h-3" />
                                    </a>
                                  </div>
                                  <button
                                    onClick={() => handleUpdateStatus(order.orderId, 'delivered')}
                                    disabled={isUpdating}
                                    className="w-full py-2 bg-green-800 hover:bg-green-900 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-40"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                    Confirmar Entrega (Entregue)
                                  </button>
                                </div>
                              )}

                              {order.status === 'delivered' && (
                                <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-xs space-y-2">
                                  <div className="flex items-center gap-1 text-green-800 font-medium font-sans">
                                    <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
                                    <span>Encomenda Entregue com Sucesso</span>
                                  </div>
                                  {order.trackingCode && (
                                    <div className="text-[11px] text-forest/70">
                                      Código de rastreio usado: <span className="font-mono font-bold">{order.trackingCode}</span>
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
                                      className="py-1.5 bg-green-700 hover:bg-green-800 text-white rounded-lg text-[9px] uppercase font-bold tracking-wider transition-all cursor-pointer text-center"
                                    >
                                      Simular Pago
                                    </button>
                                    <button
                                      onClick={() => handleSimulateWebhook(order.orderId, 'simulate_failure')}
                                      disabled={isUpdating}
                                      className="py-1.5 bg-red-700 hover:bg-red-800 text-white rounded-lg text-[9px] uppercase font-bold tracking-wider transition-all cursor-pointer text-center"
                                    >
                                      Simular Falha
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Email Previews Hub */}
                            <div className="pt-3 border-t border-forest/5 space-y-1.5">
                              <span className="text-[9px] font-bold text-forest/35 uppercase tracking-wider block">Auditoria Sandbox de E-mails</span>
                              <div className="grid grid-cols-2 gap-1.5 text-[9px]">
                                {order.emailLinks?.customerEmailUrl && (
                                  <a 
                                    href={order.emailLinks.customerEmailUrl} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="p-1.5 bg-[#FCF8F2] border border-[#C5A059]/10 text-[#243119] rounded-lg hover:bg-[#F3EFE9] flex items-center justify-center gap-1 hover:underline font-medium"
                                  >
                                    <Eye className="w-3 h-3 text-[#C5A059]" />
                                    Ver Recibo
                                  </a>
                                )}
                                {order.emailLinks?.adminEmailUrl && (
                                  <a 
                                    href={order.emailLinks.adminEmailUrl} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="p-1.5 bg-[#FCF8F2] border border-[#C5A059]/10 text-[#243119] rounded-lg hover:bg-[#F3EFE9] flex items-center justify-center gap-1 hover:underline font-medium"
                                  >
                                    <Eye className="w-3 h-3 text-[#C5A059]" />
                                    Notif. Atelier
                                  </a>
                                )}
                                {order.shippedEmailUrl && (
                                  <a 
                                    href={order.shippedEmailUrl} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="p-1.5 bg-[#E6ECDF] border border-[#BACAA5]/30 text-[#243119] rounded-lg hover:bg-[#DCE4D4] flex items-center justify-center gap-1 hover:underline font-medium col-span-2"
                                  >
                                    <Eye className="w-3 h-3 text-green-700" />
                                    Ver E-mail CTT Enviado
                                  </a>
                                )}
                                {order.multibancoRef && !order.emailLinks?.customerEmailUrl && (
                                  <a 
                                    href={`/emails/multibanco-instruction-${order.orderId}.html`} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="p-1.5 bg-amber-50 border border-amber-200/20 text-amber-800 rounded-lg hover:bg-amber-100/50 flex items-center justify-center gap-1 hover:underline font-medium col-span-2"
                                  >
                                    <Eye className="w-3 h-3 text-amber-600" />
                                    Ver Instruções Multibanco
                                  </a>
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
                          alert("Catálogo do Atelier guardado e publicado com sucesso!");
                          setCatalog(data.categories || []);
                          window.dispatchEvent(new CustomEvent('catalog-updated'));
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
                  <div className="lg:col-span-1 bg-white border border-forest/5 p-4 rounded-[16px] shadow-sm space-y-2 h-fit">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-forest/35 block mb-2">Coleções Ativas</span>
                    {catalog.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedCategoryId(cat.id)}
                        className={`w-full text-left px-3.5 py-3 rounded-xl transition-all flex items-center justify-between text-xs font-medium cursor-pointer ${
                          selectedCategoryId === cat.id
                            ? 'bg-cream/70 border border-forest/15 text-[#243119] font-bold shadow-sm'
                            : 'text-forest/60 hover:bg-cream/20 hover:text-forest'
                        }`}
                      >
                        <span className="truncate">{cat.name}</span>
                        <span className="bg-forest/5 px-2 py-0.5 rounded-full text-[10px] font-bold text-forest/50">
                          {cat.products ? cat.products.length : 0}
                        </span>
                      </button>
                    ))}
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
                                        <span key={idx} className="bg-cream/40 border border-forest/5 px-1.5 py-0.5 rounded text-[8px] font-medium text-forest/60">
                                          {col}
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
                <div className="fixed inset-0 bg-[#243119]/40 backdrop-blur-sm flex items-center justify-center z-[110] p-4">
                  <div data-lenis-prevent className="bg-white border border-forest/10 rounded-[24px] max-w-lg w-full p-6 shadow-2xl text-left space-y-4 max-h-[90vh] overflow-y-auto">
                    <div className="flex items-center justify-between border-b border-forest/5 pb-3">
                      <h5 className="font-serif text-base font-bold text-forest">
                        {editingProduct.isNew ? 'Adicionar Nova Peça Única' : `Editar Peça: ${editingProduct.product.name}`}
                      </h5>
                      <button
                        type="button"
                        onClick={() => setEditingProduct(null)}
                        className="text-forest/40 hover:text-forest cursor-pointer"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <form
                      onSubmit={(e) => {
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

                        const finalProd = {
                          ...prodForm,
                          availableColors: parsedColors
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
                          <label className="font-bold text-forest/70 block">Peças em Stock (Estoque)</label>
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
                          <label className="font-bold text-forest/70 block">Tempo de Confeção (dias)</label>
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

                      <div className="space-y-1">
                        <label className="font-bold text-forest/70 block">
                          Cores Disponíveis (separadas por vírgula, ex: Natural, Rosa Pálido, Verde Musgo)
                        </label>
                        <input
                          type="text"
                          value={
                            Array.isArray(editingProduct.product.availableColors)
                              ? editingProduct.product.availableColors.join(', ')
                              : editingProduct.product.availableColors || ''
                          }
                          onChange={(e) => setEditingProduct({
                            ...editingProduct,
                            product: { ...editingProduct.product, availableColors: e.target.value }
                          })}
                          className="w-full bg-cream/20 border border-forest/10 focus:border-[#C5A059] focus:outline-none rounded-xl px-3 py-2"
                          placeholder="Natural, Rosa Pálido, Verde Musgo"
                        />
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
                          Ocultar este produto no catálogo público temporariamente
                        </label>
                      </div>

                      <div className="flex gap-3 pt-3 border-t border-forest/5">
                        <button
                          type="button"
                          onClick={() => setEditingProduct(null)}
                          className="flex-1 py-2.5 bg-cream hover:bg-cream/70 text-forest rounded-xl font-bold uppercase transition-all cursor-pointer text-center"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="flex-1 py-2.5 bg-[#243119] hover:bg-[#1a2412] text-cream rounded-xl font-bold uppercase transition-all cursor-pointer text-center shadow-md"
                        >
                          Confirmar Peça
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

            // Determine what data to display based on showSimulatedData
            const useSimulated = showSimulatedData && !hasRealPaid;

            // Counts & Values
            const totalOrdersCount = useSimulated ? 183 : orders.length;
            const successOrdersCount = useSimulated ? 152 : successOrdersList.length;
            const pendingOrdersCount = useSimulated ? 18 : pendingOrdersList.length;
            const failedOrdersCount = useSimulated ? 13 : failedOrdersList.length;
            const paidOrdersCount = useSimulated ? 5 : paidOrdersList.length;
            const shippedOrdersCount = useSimulated ? 12 : shippedOrdersList.length;
            const deliveredOrdersCount = useSimulated ? 135 : deliveredOrdersList.length;

            const successRevenue = useSimulated 
              ? 19340 
              : successOrdersList.reduce((sum, o) => sum + parsePrice(o.price), 0);
              
            const pendingRevenue = useSimulated 
              ? 1680 
              : pendingOrdersList.reduce((sum, o) => sum + parsePrice(o.price), 0);

            const conversionRate = totalOrdersCount > 0 
              ? Math.round((successOrdersCount / totalOrdersCount) * 100) 
              : 0;

            const avgOrderValue = successOrdersCount > 0
              ? Math.round(successRevenue / successOrdersCount)
              : 0;

            // Group sales by product
            let topProducts: { name: string; count: number; revenue: number }[] = [];
            
            if (useSimulated) {
              topProducts = [
                { name: 'Alma Cardigan', count: 48, revenue: 6240 },
                { name: 'Marea Bikini', count: 35, revenue: 3150 },
                { name: 'African Flower Pouch', count: 29, revenue: 1160 },
                { name: 'Coral Bikini Top', count: 22, revenue: 1540 },
                { name: 'Classic Coasters (Set de 4)', count: 18, revenue: 630 }
              ];
            } else {
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

              topProducts = Object.entries(productSales)
                .map(([name, data]) => ({ name, ...data }))
                .sort((a, b) => b.count - a.count);
            }

            // Active crafting workload: sum of crafting times of active 'paid' orders
            let totalActiveCraftingDays = 0;
            if (useSimulated) {
              totalActiveCraftingDays = 42; // Simulation workload
            } else {
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
            }

            // Monthly Trend Chart Data
            const monthsPT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
            const currentMonthIndex = new Date().getMonth();
            
            let activeChartData: { month: string; revenue: number; ordersCount: number }[] = [];
            
            if (useSimulated) {
              const simulatedData = [
                { month: 'Jan', revenue: 1250, ordersCount: 10 },
                { month: 'Fev', revenue: 1480, ordersCount: 12 },
                { month: 'Mar', revenue: 1320, ordersCount: 11 },
                { month: 'Abr', revenue: 1980, ordersCount: 15 },
                { month: 'Mai', revenue: 2450, ordersCount: 19 },
                { month: 'Jun', revenue: 2210, ordersCount: 17 },
                { month: 'Jul', revenue: 2890, ordersCount: 22 },
                { month: 'Ago', revenue: 2600, ordersCount: 20 },
                { month: 'Set', revenue: 3100, ordersCount: 24 },
                { month: 'Out', revenue: 3450, ordersCount: 27 },
                { month: 'Nov', revenue: 3800, ordersCount: 30 },
                { month: 'Dez', revenue: 4950, ordersCount: 38 },
              ];
              activeChartData = simulatedData.slice(0, currentMonthIndex + 1);
            } else {
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
              activeChartData = monthlyRealData.slice(0, currentMonthIndex + 1);
            }

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
                {/* SUBHEADER WITH TOGGLE */}
                <div className="bg-white border border-forest/5 p-5 rounded-[16px] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="font-serif text-sm font-medium text-forest">Painel de Gestão e Análise de Vendas</h4>
                  </div>
                  
                  {/* SIMULATION TOGGLE */}
                  {!hasRealPaid && (
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-medium text-forest/60">Modo de Visualização:</span>
                      <button
                        type="button"
                        onClick={() => setShowSimulatedData(!showSimulatedData)}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wider uppercase transition-all flex items-center gap-1.5 cursor-pointer border ${
                          showSimulatedData 
                            ? 'bg-[#BACAA5]/20 text-emerald-800 border-emerald-600/20' 
                            : 'bg-cream text-forest/70 border-forest/10'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${showSimulatedData ? 'bg-emerald-600 animate-pulse' : 'bg-forest/40'}`}></span>
                        {showSimulatedData ? 'Dados de Demonstração Ativos' : 'Apenas Dados Reais'}
                      </button>
                    </div>
                  )}
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
                      <span>Peças a produzir: {useSimulated ? 5 : paidOrdersList.length}</span>
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
          {activeTab === 'inventory' && (
            <div className="space-y-6">
              <div className="bg-white border border-forest/5 p-5 rounded-[16px] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="font-serif text-sm font-medium text-forest">Gestão de Stock</h4>
                </div>
                <div className="flex gap-2">
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
                            {inventory.map((item) => {
                              const isLow = item.quantity < item.minSafety;
                              return (
                                <tr key={item.id} className={`transition-colors ${isLow ? 'bg-amber-50/20 hover:bg-amber-50/45' : 'hover:bg-cream/10'}`}>
                                  <td className="px-6 py-4">
                                    <div className="font-semibold text-forest flex items-center gap-2">
                                      {isLow && <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />}
                                      {item.name}
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
                            })}
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
                <div className="fixed inset-0 bg-[#243119]/40 backdrop-blur-sm flex items-center justify-center z-[110] p-4">
                  <div data-lenis-prevent className="bg-white border border-forest/10 rounded-[24px] max-w-sm w-full p-6 shadow-2xl text-left space-y-4">
                    <div className="flex items-center justify-between border-b border-forest/5 pb-3">
                      <h5 className="font-serif text-base font-bold text-forest">
                        {editingMaterial.isNew ? 'Nova Matéria-Prima' : `Editar: ${editingMaterial.material.name}`}
                      </h5>
                      <button
                        type="button"
                        onClick={() => setEditingMaterial(null)}
                        className="text-forest/40 hover:text-forest cursor-pointer"
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

                      <div className="flex gap-3 pt-3 border-t border-forest/5">
                        <button
                          type="button"
                          onClick={() => setEditingMaterial(null)}
                          className="flex-1 py-2.5 bg-cream hover:bg-cream/70 text-forest rounded-xl font-bold uppercase transition-all cursor-pointer text-center"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="flex-1 py-2.5 bg-[#243119] hover:bg-[#1a2412] text-cream rounded-xl font-bold uppercase transition-all cursor-pointer text-center shadow-md"
                        >
                          Confirmar
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}
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
            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-left">
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
                          value={crmFields.phone}
                          onChange={(e) => setCrmFields(prev => ({ ...prev, phone: e.target.value }))}
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
                          placeholder="carolina_mbravo"
                          value={crmFields.instagram}
                          onChange={(e) => setCrmFields(prev => ({ ...prev, instagram: e.target.value }))}
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
              <div className="px-6 py-4 border-t border-forest/5 bg-[#FCFBF9] flex gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedCustomerEmail(null)}
                  className="flex-1 py-2.5 bg-white border border-forest/10 hover:bg-forest/5 text-forest/70 hover:text-forest rounded-xl font-bold uppercase tracking-wider text-xs transition-colors cursor-pointer"
                >
                  Fechar
                </button>
                <button
                  type="button"
                  disabled={isSavingCustomerProfile}
                  onClick={handleSaveCustomerProfile}
                  className="flex-1 py-2.5 bg-[#243119] hover:bg-[#1a2412] text-cream rounded-xl font-bold uppercase tracking-wider text-xs transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
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
    </div>
  );
}
