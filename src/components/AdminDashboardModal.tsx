import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Search, Lock, Unlock, User, Mail, Phone, MapPin, 
  CreditCard, Clock, Truck, FileText, CheckCircle, AlertCircle, 
  ExternalLink, Eye, RefreshCw, Sliders, Calendar, DollarSign, 
  Package, ChevronRight, AlertTriangle, ShieldCheck
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

interface AdminDashboardModalProps {
  onClose: () => void;
}

export default function AdminDashboardModal({ onClose }: AdminDashboardModalProps) {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Dashboard states
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending_payment' | 'paid' | 'shipped' | 'failed'>('all');
  
  // Action states
  const [trackingInputs, setTrackingInputs] = useState<{ [orderId: string]: string }>({});
  const [actionLoading, setActionLoading] = useState<{ [orderId: string]: boolean }>({});
  const [actionSuccess, setActionSuccess] = useState<{ [orderId: string]: string }>({});

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
      } else {
        setLoginError(data.error || 'Palavra-passe incorreta. Tente novamente.');
      }
    } catch (err) {
      setLoginError('Erro de conexão ao servidor administrativo.');
    } finally {
      setIsLoggingIn(false);
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
      } else {
        setOrdersError(data.error || 'Erro ao carregar as encomendas.');
      }
    } catch (err) {
      setOrdersError('Não foi possível conectar ao servidor para obter encomendas.');
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('mbravo_admin_password');
    setIsAuthenticated(false);
    setPassword('');
    setOrders([]);
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
  const totalRevenue = orders
    .filter(o => o.status === 'paid' || o.status === 'shipped')
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

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-forest/80 backdrop-blur-sm select-text">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-6xl h-[85vh] bg-[#FCFBF9] text-forest rounded-[24px] shadow-2xl border border-[#C5A059]/10 flex flex-col overflow-hidden"
      >
        {/* HEADER RAIL */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-forest/5 bg-white/50">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-[#C5A059] animate-pulse" />
            <h3 className="font-serif text-lg tracking-wider font-medium text-forest uppercase flex items-center gap-2">
              M★BRAVO <span className="text-[#C5A059] font-sans text-xs font-semibold tracking-widest bg-[#FCF8F2] border border-[#C5A059]/20 px-2.5 py-0.5 rounded-full">ATELIER ADMIN</span>
            </h3>
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated && (
              <button 
                onClick={handleLogout}
                className="text-xs uppercase tracking-widest text-red-700 hover:text-red-900 bg-red-50 hover:bg-red-100/55 px-3 py-1.5 rounded-full transition-all font-semibold"
              >
                Sair
              </button>
            )}
            <button 
              onClick={onClose}
              className="p-1.5 hover:bg-forest/5 rounded-full transition-all cursor-pointer text-forest/60 hover:text-forest"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* CONTAINER CONTENT */}
        <div className="flex-1 overflow-y-auto">
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
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-white border border-forest/5 p-5 rounded-[16px] shadow-sm space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-forest/35">Total Encomendas</div>
                  <div className="text-2xl font-serif font-medium text-forest flex items-center gap-2">
                    <Package className="w-4 h-4 text-[#C5A059]" />
                    {totalOrders}
                  </div>
                </div>

                <div className="bg-white border border-forest/5 p-5 rounded-[16px] shadow-sm space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-forest/35">Faturação Coletada</div>
                  <div className="text-2xl font-serif font-medium text-forest flex items-center gap-1.5">
                    <span className="text-[#BACAA5] font-sans text-lg">€</span>
                    {totalRevenue.toFixed(2)}
                  </div>
                </div>

                <div className="bg-white border border-forest/5 p-5 rounded-[16px] shadow-sm space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-forest/35">Aguardam Pagamento</div>
                  <div className="text-2xl font-serif font-medium text-amber-600 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {pendingOrders}
                  </div>
                </div>

                <div className="bg-white border border-forest/5 p-5 rounded-[16px] shadow-sm space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-forest/35">Pagas / No Atelier</div>
                  <div className="text-2xl font-serif font-medium text-green-700 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    {paidOrders}
                  </div>
                </div>

                <div className="bg-[#243119] text-cream p-5 rounded-[16px] shadow-sm space-y-1 col-span-2 md:col-span-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-cream/40">Expedidas CTT</div>
                  <div className="text-2xl font-serif font-medium text-[#C5A059] flex items-center gap-2">
                    <Truck className="w-4 h-4" />
                    {shippedOrders}
                  </div>
                </div>
              </div>

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
                    Todas ({totalOrders})
                  </button>
                  <button 
                    onClick={() => setStatusFilter('pending_payment')}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${statusFilter === 'pending_payment' ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-800 border border-amber-200/20 hover:bg-amber-100/50'}`}
                  >
                    Pendentes ({pendingOrders})
                  </button>
                  <button 
                    onClick={() => setStatusFilter('paid')}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${statusFilter === 'paid' ? 'bg-green-700 text-white' : 'bg-green-50 text-green-800 border border-green-200/20 hover:bg-green-100/50'}`}
                  >
                    Pagas ({paidOrders})
                  </button>
                  <button 
                    onClick={() => setStatusFilter('shipped')}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${statusFilter === 'shipped' ? 'bg-[#C5A059] text-[#243119]' : 'bg-amber-50/50 text-[#A68244] border border-[#C5A059]/10 hover:bg-amber-100/30'}`}
                  >
                    Expedidas ({shippedOrders})
                  </button>
                  <button 
                    onClick={() => setStatusFilter('failed')}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${statusFilter === 'failed' ? 'bg-red-700 text-white' : 'bg-red-50 text-red-800 border border-red-200/20 hover:bg-red-100/50'}`}
                  >
                    Canceladas
                  </button>
                  <button 
                    onClick={() => fetchOrders()}
                    title="Atualizar dados"
                    className="p-2 hover:bg-forest/5 rounded-lg transition-all text-forest/60 ml-2"
                  >
                    <RefreshCw className={`w-4 h-4 ${loadingOrders ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

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
                                Pendente Pagamento
                              </span>
                            )}
                            {order.status === 'paid' && (
                              <span className="text-[9px] uppercase font-bold tracking-wider text-green-800 bg-green-50 border border-green-200/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                <CheckCircle className="w-3 h-3 shrink-0" />
                                Pago / Em Produção
                              </span>
                            )}
                            {order.status === 'shipped' && (
                              <span className="text-[9px] uppercase font-bold tracking-wider text-[#243119] bg-[#E6ECDF] border border-[#BACAA5] px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                <Truck className="w-3 h-3 shrink-0 text-[#C5A059]" />
                                Enviado (CTT)
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
              
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
