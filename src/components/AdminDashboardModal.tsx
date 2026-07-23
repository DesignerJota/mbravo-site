import React, { useState, useEffect } from 'react';
import { X, Package, User, ShoppingBag, Truck, Save, Plus, Search, RefreshCw, Key } from 'lucide-react';

interface Order {
  orderId: string;
  productName: string;
  price: string;
  selections: {
    cor: string;
    tamanho?: string;
    quantidade?: string;
  };
  customer: {
    nome: string;
    email: string;
    telefone: string;
    morada: string;
    codigoPostal: string;
    cidade: string;
    nif?: string;
  };
  paymentMethod: string;
  status: string;
  priority: string;
  createdAt: string;
  trackingCode?: string;
  shippedEmailUrl?: string;
  emailLinks?: {
    customerEmailUrl?: string;
    adminEmailUrl?: string;
  };
}

interface CustomerProfile {
  email: string;
  name?: string;
  phone?: string;
  instagram?: string;
  birthday?: string;
  instagramNotes?: string;
  customNotes?: string;
}

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({ isOpen, onClose }) => {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // CRM State
  const [customerProfile, setCustomerProfile] = useState<CustomerProfile | null>(null);
  const [isSavingCrm, setIsSavingCrm] = useState(false);
  const [crmSuccessMsg, setCrmSuccessMsg] = useState('');

  // Shipping Tracking Code State
  const [trackingInput, setTrackingInput] = useState('');
  const [isShipping, setIsShipping] = useState(false);

  // New Manual Order State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newOrder, setNewOrder] = useState({
    productName: '',
    price: '',
    cor: 'Única',
    tamanho: 'M',
    quantidade: '1',
    nome: '',
    email: '',
    telefone: '',
    morada: '',
    codigoPostal: '',
    cidade: '',
    nif: '',
    paymentMethod: 'manual',
    status: 'paid'
  });

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const data = await res.json();
      if (data.success) {
        setIsAuthenticated(true);
        fetchOrders(password);
      } else {
        setAuthError(data.error || 'Palavra-passe incorreta');
      }
    } catch (err) {
      setAuthError('Erro ao ligar ao servidor');
    }
  };

  const fetchOrders = async (pwd: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/orders', {
        headers: { 'x-admin-password': pwd }
      });
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error('Erro ao carregar encomendas', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCustomerProfile = async (email: string) => {
    if (!email) return;
    setCrmSuccessMsg('');
    try {
      const res = await fetch(`/api/admin/customers/${encodeURIComponent(email)}`, {
        headers: { 'x-admin-password': password }
      });
      const data = await res.json();
      if (data.success) {
        setCustomerProfile(data.profile);
      }
    } catch (err) {
      console.error('Erro ao carregar CRM do cliente', err);
    }
  };

  const handleSaveCrm = async () => {
    if (!customerProfile || !customerProfile.email) return;
    setIsSavingCrm(true);
    setCrmSuccessMsg('');
    try {
      const res = await fetch(`/api/admin/customers/${encodeURIComponent(customerProfile.email)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': password
        },
        body: JSON.stringify(customerProfile)
      });
      const data = await res.json();
      if (data.success) {
        setCustomerProfile(data.profile);
        setCrmSuccessMsg('Perfil guardado com sucesso!');
        setTimeout(() => setCrmSuccessMsg(''), 3000);
      }
    } catch (err) {
      alert('Erro ao guardar perfil CRM.');
    } finally {
      setIsSavingCrm(false);
    }
  };

  const handleSelectOrder = (order: Order) => {
    setSelectedOrder(order);
    setTrackingInput(order.trackingCode || '');
    if (order.customer?.email) {
      loadCustomerProfile(order.customer.email);
    }
  };

  const handleShipOrder = async () => {
    if (!selectedOrder || !trackingInput.trim()) {
      alert('Por favor, introduza um código de rastreio.');
      return;
    }
    setIsShipping(true);
    try {
      const res = await fetch('/api/payment/ship-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: selectedOrder.orderId,
          trackingCode: trackingInput.trim()
        })
      });
      const data = await res.json();
      if (data.success) {
        alert('E-mail de envio gerado e enviado ao cliente!');
        fetchOrders(password);
        setSelectedOrder(prev => prev ? { ...prev, trackingCode: trackingInput, status: 'shipped' } : null);
      } else {
        alert(data.error || 'Erro ao registar envio.');
      }
    } catch (err) {
      alert('Erro de comunicação com o servidor.');
    } finally {
      setIsShipping(false);
    }
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': password
        },
        body: JSON.stringify({
          productName: newOrder.productName,
          price: newOrder.price,
          selections: {
            cor: newOrder.cor,
            tamanho: newOrder.tamanho,
            quantidade: newOrder.quantidade
          },
          customer: {
            nome: newOrder.nome,
            email: newOrder.email,
            telefone: newOrder.telefone,
            morada: newOrder.morada,
            codigoPostal: newOrder.codigoPostal,
            cidade: newOrder.cidade,
            nif: newOrder.nif
          },
          paymentMethod: newOrder.paymentMethod,
          status: newOrder.status
        })
      });
      const data = await res.json();
      if (data.success) {
        setShowCreateModal(false);
        fetchOrders(password);
        alert('Venda manual criada com sucesso!');
      } else {
        alert(data.error || 'Erro ao criar venda.');
      }
    } catch (err) {
      alert('Erro ao ligar ao servidor.');
    }
  };

  const filteredOrders = orders.filter(o =>
    o.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.customer.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.productName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#FCFBF9] text-[#243119] w-full max-w-5xl rounded-lg shadow-2xl border border-[#243119]/10 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Top Bar */}
        <div className="bg-[#243119] text-[#F5F2ED] px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-[#C5A059]" />
            <h2 className="font-serif font-bold text-lg tracking-wider uppercase">Painel de Gestão M★BRAVO</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        {!isAuthenticated ? (
          <div className="p-8 max-w-md mx-auto w-full text-center">
            <Key className="w-12 h-12 text-[#C5A059] mx-auto mb-4" />
            <h3 className="font-serif text-xl font-bold mb-2">Acesso Reservado</h3>
            <p className="text-sm text-[#243119]/70 mb-6">Introduza a palavra-passe do Atelier M★BRAVO</p>
            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Palavra-passe"
                className="w-full px-4 py-3 border border-[#243119]/20 rounded focus:outline-none focus:border-[#C5A059] bg-white text-center text-lg"
                autoFocus
              />
              {authError && <p className="text-red-600 text-xs font-semibold">{authError}</p>}
              <button
                type="submit"
                className="w-full bg-[#243119] text-[#F5F2ED] py-3 rounded font-sans font-bold text-xs uppercase tracking-widest hover:bg-[#A68244] transition-colors"
              >
                Entrar
              </button>
            </form>
          </div>
        ) : (
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Orders List Sidebar */}
            <div className="w-full md:w-1/3 border-r border-[#243119]/10 p-4 flex flex-col bg-white">
              <div className="flex justify-between items-center mb-3">
                <div className="relative flex-1 mr-2">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#243119]/40" />
                  <input
                    type="text"
                    placeholder="Pesquisar..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs border border-[#243119]/20 rounded focus:outline-none focus:border-[#C5A059]"
                  />
                </div>
                <button
                  onClick={() => fetchOrders(password)}
                  title="Atualizar"
                  className="p-2 border border-[#243119]/20 rounded hover:bg-[#F5F2ED]"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>

              <button
                onClick={() => setShowCreateModal(true)}
                className="w-full mb-3 bg-[#E2EAD9] text-[#243119] border border-[#BACAA5] py-2 rounded text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 hover:bg-[#BACAA5] transition-colors"
              >
                <Plus className="w-4 h-4" /> Nova Venda Manual
              </button>

              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {filteredOrders.length === 0 ? (
                  <p className="text-xs text-center text-[#243119]/50 py-8">Nenhuma encomenda encontrada.</p>
                ) : (
                  filteredOrders.map(order => (
                    <div
                      key={order.orderId}
                      onClick={() => handleSelectOrder(order)}
                      className={`p-3 rounded border text-left cursor-pointer transition-all ${
                        selectedOrder?.orderId === order.orderId
                          ? 'border-[#C5A059] bg-[#FCF8F2] shadow-sm'
                          : 'border-[#243119]/10 hover:border-[#243119]/30 bg-white'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-mono text-xs font-bold">{order.orderId}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                          order.status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="text-xs font-semibold truncate">{order.customer.nome}</div>
                      <div className="text-[11px] text-[#243119]/60 truncate">{order.productName}</div>
                      <div className="text-[10px] text-[#A68244] font-bold mt-1">{order.price}</div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Order Detail & CRM Area */}
            <div className="w-full md:w-2/3 p-6 overflow-y-auto bg-[#FCFBF9]">
              {selectedOrder ? (
                <div className="space-y-6">
                  {/* Order Main Header */}
                  <div className="flex justify-between items-start border-b border-[#243119]/10 pb-4">
                    <div>
                      <h3 className="font-serif text-xl font-bold">{selectedOrder.productName}</h3>
                      <p className="text-xs font-mono text-[#243119]/60">ID: {selectedOrder.orderId} &bull; {new Date(selectedOrder.createdAt).toLocaleString('pt-PT')}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-[#A68244]">{selectedOrder.price}</div>
                      <span className="text-xs uppercase font-bold text-[#243119]/70">{selectedOrder.paymentMethod}</span>
                    </div>
                  </div>

                  {/* Shipping Form / Tracking */}
                  <div className="bg-white p-4 rounded border border-[#243119]/10 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#A68244] flex items-center gap-1.5">
                      <Truck className="w-4 h-4" /> Expedição CTT
                    </h4>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Código de Rastreio (ex: DA123456789PT)"
                        value={trackingInput}
                        onChange={e => setTrackingInput(e.target.value)}
                        className="flex-1 px-3 py-1.5 text-xs border border-[#243119]/20 rounded focus:outline-none focus:border-[#C5A059]"
                      />
                      <button
                        onClick={handleShipOrder}
                        disabled={isShipping}
                        className="bg-[#243119] text-[#F5F2ED] px-4 py-1.5 rounded text-xs font-bold uppercase tracking-wider hover:bg-[#A68244] transition-colors disabled:opacity-50"
                      >
                        {isShipping ? 'A enviar...' : 'Marcar Enviado'}
                      </button>
                    </div>
                    {selectedOrder.shippedEmailUrl && (
                      <p className="text-[11px] text-emerald-700">
                        E-mail de envio disponível em: <a href={selectedOrder.shippedEmailUrl} target="_blank" rel="noreferrer" className="underline">{selectedOrder.shippedEmailUrl}</a>
                      </p>
                    )}
                  </div>

                  {/* Customer CRM Profile Section */}
                  <div className="bg-white p-4 rounded border border-[#243119]/10 space-y-4">
                    <div className="flex justify-between items-center border-b border-[#243119]/10 pb-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#243119] flex items-center gap-1.5">
                        <User className="w-4 h-4 text-[#C5A059]" /> Perfil CRM do Cliente
                      </h4>
                      {crmSuccessMsg && <span className="text-xs text-emerald-600 font-bold">{crmSuccessMsg}</span>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-[#243119]/60 mb-1">Nome</label>
                        <input
                          type="text"
                          value={customerProfile?.name || selectedOrder.customer.nome}
                          onChange={e => setCustomerProfile(p => ({ ...p!, email: selectedOrder.customer.email, name: e.target.value }))}
                          className="w-full px-2 py-1 border border-[#243119]/20 rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-[#243119]/60 mb-1">Instagram (@utilizador)</label>
                        <input
                          type="text"
                          value={customerProfile?.instagram || ''}
                          onChange={e => setCustomerProfile(p => ({ ...p!, email: selectedOrder.customer.email, instagram: e.target.value }))}
                          placeholder="@exemplo"
                          className="w-full px-2 py-1 border border-[#243119]/20 rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-[#243119]/60 mb-1">Aniversário</label>
                        <input
                          type="text"
                          value={customerProfile?.birthday || ''}
                          onChange={e => setCustomerProfile(p => ({ ...p!, email: selectedOrder.customer.email, birthday: e.target.value }))}
                          placeholder="DD/MM/AAAA"
                          className="w-full px-2 py-1 border border-[#243119]/20 rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-[#243119]/60 mb-1">Telefone</label>
                        <input
                          type="text"
                          value={customerProfile?.phone || selectedOrder.customer.telefone}
                          onChange={e => setCustomerProfile(p => ({ ...p!, email: selectedOrder.customer.email, phone: e.target.value }))}
                          className="w-full px-2 py-1 border border-[#243119]/20 rounded"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-[#243119]/60 mb-1">Notas do Instagram / Preferências</label>
                      <textarea
                        rows={2}
                        value={customerProfile?.instagramNotes || ''}
                        onChange={e => setCustomerProfile(p => ({ ...p!, email: selectedOrder.customer.email, instagramNotes: e.target.value }))}
                        placeholder="Histórico de mensagens no Instagram, preferências de cor, etc."
                        className="w-full px-2 py-1 border border-[#243119]/20 rounded text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-[#243119]/60 mb-1">Notas Internas do Atelier</label>
                      <textarea
                        rows={2}
                        value={customerProfile?.customNotes || ''}
                        onChange={e => setCustomerProfile(p => ({ ...p!, email: selectedOrder.customer.email, customNotes: e.target.value }))}
                        placeholder="Ajustes de medidas, historial de compras presenciais, observações..."
                        className="w-full px-2 py-1 border border-[#243119]/20 rounded text-xs"
                      />
                    </div>

                    <button
                      onClick={handleSaveCrm}
                      disabled={isSavingCrm}
                      className="bg-[#243119] text-[#F5F2ED] px-4 py-1.5 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 hover:bg-[#A68244] transition-colors"
                    >
                      <Save className="w-3.5 h-3.5" /> {isSavingCrm ? 'A guardar...' : 'Guardar Perfil CRM'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-[#243119]/40 py-12">
                  <ShoppingBag className="w-12 h-12 mb-2 stroke-1" />
                  <p className="text-sm">Selecione uma encomenda na lista à esquerda.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal para Criar Venda Manual */}
      {showCreateModal && (
        <div className="fixed inset-0 z-60 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-[#FCFBF9] text-[#243119] w-full max-w-lg rounded-lg p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-serif font-bold text-base">Criar Venda Manual</h3>
              <button onClick={() => setShowCreateModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreateOrder} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Nome da Peça / Produto *</label>
                <input
                  type="text"
                  required
                  value={newOrder.productName}
                  onChange={e => setNewOrder({ ...newOrder, productName: e.target.value })}
                  placeholder="ex: Colete M★BRAVO Edição Limitada"
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold mb-1">Preço (€) *</label>
                  <input
                    type="text"
                    required
                    value={newOrder.price}
                    onChange={e => setNewOrder({ ...newOrder, price: e.target.value })}
                    placeholder="35.00"
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Tamanho</label>
                  <input
                    type="text"
                    value={newOrder.tamanho}
                    onChange={e => setNewOrder({ ...newOrder, tamanho: e.target.value })}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold mb-1">Nome do Cliente *</label>
                  <input
                    type="text"
                    required
                    value={newOrder.nome}
                    onChange={e => setNewOrder({ ...newOrder, nome: e.target.value })}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">E-mail do Cliente</label>
                  <input
                    type="email"
                    value={newOrder.email}
                    onChange={e => setNewOrder({ ...newOrder, email: e.target.value })}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold mb-1">Telefone</label>
                <input
                  type="text"
                  value={newOrder.telefone}
                  onChange={e => setNewOrder({ ...newOrder, telefone: e.target.value })}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">Morada de Entrega</label>
                <input
                  type="text"
                  value={newOrder.morada}
                  onChange={e => setNewOrder({ ...newOrder, morada: e.target.value })}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border rounded font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#243119] text-white rounded font-bold"
                >
                  Registar Venda
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
