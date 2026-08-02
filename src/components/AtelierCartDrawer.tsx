import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Minus, Trash2, ArrowRight, MapPin, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { SHIPPING_ZONES } from '../types';
import { useLanguage } from '../translations';

export const AtelierCartDrawer: React.FC = () => {
  const { lang } = useLanguage();
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    setIsCheckoutOpen,
    removeFromCart,
    updateQuantity,
    selectedShippingZone,
    setSelectedShippingZone,
    subtotal,
    shippingFee,
    totalPrice,
    totalItemCount,
    maxLeadTimeDays,
    isFreeShipping,
    amountNeededForFreeShipping
  } = useCart();

  if (!isCartOpen || typeof window === 'undefined') return null;

  const isPt = lang === 'pt';

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[9990] flex items-end md:items-stretch md:justify-end overflow-hidden">
        {/* Translucent Backdrop - Clean editorial overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={() => setIsCartOpen(false)}
          className="fixed inset-0 bg-forest/25 backdrop-blur-[2px] cursor-pointer"
        />

        {/* Floating Atelier Bottom Sheet on Mobile & Tablet / Slender Drawer on Desktop */}
        <motion.div
          data-lenis-prevent
          initial={{ y: '100%', opacity: 0.5 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 32, stiffness: 350 }}
          className="relative w-full md:w-[420px] bg-[#FCFBF9] text-forest h-[92dvh] max-h-[92dvh] landscape:h-[95dvh] landscape:max-h-[95dvh] md:h-[100dvh] md:max-h-[100dvh] rounded-t-[28px] md:rounded-none shadow-2xl flex flex-col z-10 border-t md:border-t-0 md:border-l border-forest/10 overflow-hidden"
        >
          {/* 1. FIXED HEADER */}
          <div className="px-5 py-4 landscape:py-1.5 border-b border-forest/10 flex flex-col shrink-0 bg-[#FCFBF9] sticky top-0 z-20">
            {/* Mobile Drag Indicator Handle */}
            <div className="md:hidden landscape:hidden w-12 h-1 bg-forest/20 rounded-full mx-auto mb-2.5 shrink-0" />

            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-[#C5A059]" />
                <div>
                  <span className="text-[8.5px] uppercase tracking-[0.35em] text-[#C5A059] font-semibold block font-sans">
                    M★BRAVO ATELIER
                  </span>
                  <h3 className="text-base font-serif font-light text-forest tracking-tight flex items-center gap-2">
                    {isPt ? 'A sua Encomenda' : 'Your Order'}
                    {totalItemCount > 0 && (
                      <span className="text-[10px] font-sans font-normal text-forest/50">
                        ({totalItemCount} {totalItemCount === 1 ? (isPt ? 'peça' : 'piece') : (isPt ? 'peças' : 'pieces')})
                      </span>
                    )}
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 landscape:p-1 rounded-full hover:bg-forest/5 text-forest/50 hover:text-forest transition-colors cursor-pointer shrink-0 z-30"
                title={isPt ? 'Fechar' : 'Close'}
              >
                <X size={20} className="landscape:w-4 landscape:h-4" />
              </button>
            </div>
          </div>

          {/* 2. MIDDLE SCROLLABLE CONTENT (Zero Double Scrollbars, smooth scrolling) */}
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-5 py-3.5 landscape:py-2 touch-pan-y space-y-4 landscape:space-y-2">
            {cart.length === 0 ? (
              <div className="py-20 text-center space-y-4 flex flex-col items-center justify-center">
                <span className="text-[9px] uppercase tracking-[0.35em] text-[#C5A059] font-medium block font-sans">
                  {isPt ? 'O SEU ATELIER ESTÁ VAZIO' : 'YOUR SELECTION IS EMPTY'}
                </span>
                <p className="text-xs font-serif font-light text-forest/70 max-w-xs leading-relaxed">
                  {isPt
                    ? 'Ainda não adicionou nenhuma peça artesanal à sua seleção.'
                    : 'You have not added any handcrafted piece to your selection yet.'}
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 bg-forest text-cream rounded-full text-[9px] uppercase tracking-[0.25em] font-medium hover:bg-[#1C2713] transition-colors shadow-xs cursor-pointer"
                >
                  <span>{isPt ? 'Voltar à Coleção' : 'Explore Collection'}</span>
                  <ArrowRight size={12} />
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Refined Brand Free Shipping Banner */}
                <div className="p-3 rounded-xl bg-forest/5 border border-forest/10 space-y-1 text-xs font-sans">
                  {isFreeShipping ? (
                    <div className="flex items-center gap-2 text-[#987834]">
                      <Sparkles size={14} className="shrink-0 text-[#C5A059]" />
                      <span className="text-[10px] font-semibold leading-snug">
                        {isPt
                          ? 'Oferta de Envio & Packaging M★BRAVO aplicada'
                          : 'M★BRAVO Courtesy Shipping & Packaging applied'}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-forest/80">
                      <Sparkles size={14} className="shrink-0 text-[#C5A059]" />
                      <span className="text-[10px] leading-snug font-sans">
                        {isPt ? (
                          <>
                            Faltam <strong className="font-semibold text-forest">{amountNeededForFreeShipping.toFixed(2)}€</strong> para <span className="text-[#C5A059] font-semibold">Envio & Packaging Cortesia M★BRAVO</span>.
                          </>
                        ) : (
                          <>
                            Add <strong className="font-semibold text-forest">{amountNeededForFreeShipping.toFixed(2)}€</strong> more for <span className="text-[#C5A059] font-semibold">M★BRAVO Courtesy Shipping & Packaging</span>.
                          </>
                        )}
                      </span>
                    </div>
                  )}
                </div>

                {/* Floating Items List */}
                <div className="divide-y divide-forest/10">
                  {cart.map((item) => (
                    <div key={item.cartItemId} className="py-3.5 flex gap-3.5 items-start">
                      <img
                        src={item.img}
                        alt={item.productName}
                        className="w-16 h-20 object-cover rounded-md border border-forest/10 shrink-0 bg-[#F6F1E5]"
                      />

                      <div className="flex-1 flex flex-col justify-between min-h-[80px] py-0.5">
                        <div>
                          <div className="flex justify-between items-start gap-2">
                            <h4 className="text-xs font-serif font-medium text-forest leading-snug">
                              {item.productName}
                            </h4>
                            <button
                              onClick={() => removeFromCart(item.cartItemId)}
                              className="text-forest/30 hover:text-red-700 p-0.5 transition-colors cursor-pointer"
                              title={isPt ? 'Remover' : 'Remove'}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>

                          {/* Selections subtle text badges */}
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {item.selections?.cor && (
                              <span className="text-[9px] font-sans text-forest/60">
                                {item.selections.cor}
                              </span>
                            )}
                            {item.selections?.tamanho && (
                              <span className="text-[9px] font-sans text-forest/60">
                                • {isPt ? 'Tam:' : 'Size:'} {item.selections.tamanho}
                              </span>
                            )}
                            {item.selections?.quantidade && (
                              <span className="text-[9px] font-sans text-forest/60">
                                • {item.selections.quantidade}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Price & Delicate Stepper */}
                        <div className="flex items-center justify-between pt-1.5">
                          <div className="flex items-center gap-1.5 border border-forest/15 rounded-full px-2 py-0.5 bg-white">
                            <button
                              onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                              className="text-forest/50 hover:text-forest p-0.5 transition-colors cursor-pointer"
                            >
                              <Minus size={10} />
                            </button>
                            <span className="text-[11px] font-sans font-medium text-forest min-w-[14px] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                              className="text-forest/50 hover:text-forest p-0.5 transition-colors cursor-pointer"
                            >
                              <Plus size={10} />
                            </button>
                          </div>

                          <span className="text-xs font-serif font-semibold text-forest">
                            {(item.unitPrice * item.quantity).toFixed(2)}€
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 3. FIXED FOOTER AT BOTTOM (Thumb-accessible on mobile & sticky) */}
          {cart.length > 0 && (
            <div className="p-4 sm:p-5 landscape:p-2.5 border-t border-forest/10 bg-[#FCFBF9]/95 backdrop-blur-md space-y-2.5 landscape:space-y-1.5 shrink-0 sticky bottom-0 z-20">
              {/* Marketing Shipping Balloon/Badge */}
              <div className="bg-[#FAF7F2] border border-[#C5A059]/25 rounded-xl p-2.5 flex items-center gap-2 text-forest text-[10px] font-sans">
                <span className="text-[#C5A059] text-xs shrink-0">✨</span>
                <p className="leading-tight font-medium text-forest/80">
                  {isPt 
                    ? 'Portes fixos para a sua encomenda — Adicione mais peças sem custos adicionais de envio!'
                    : 'Flat shipping rate — Add more items without additional shipping fees!'}
                </p>
              </div>

              {/* Minimalist Discrete Single-Line Region Selector */}
              <div className="flex items-center justify-between py-0.5 text-xs font-sans">
                <div className="flex items-center gap-1.5 text-forest/60">
                  <MapPin size={12} className="text-[#C5A059]" />
                  <span className="text-[9px] uppercase tracking-[0.2em] font-semibold text-forest/60">
                    {isPt ? 'Região de Envio' : 'Shipping Region'}
                  </span>
                </div>

                <select
                  value={selectedShippingZone.id}
                  onChange={(e) => {
                    const zone = SHIPPING_ZONES.find((z) => z.id === e.target.value);
                    if (zone) setSelectedShippingZone(zone);
                  }}
                  className="bg-transparent border-b border-forest/20 rounded-none text-xs font-serif font-normal text-forest px-1 py-0.5 focus:outline-none focus:border-forest cursor-pointer"
                >
                  {SHIPPING_ZONES.map((zone) => (
                    <option key={zone.id} value={zone.id}>
                      {zone.name[isPt ? 'pt' : 'en']} ({isFreeShipping && zone.id === 'PT' ? 'Cortesia' : `+${zone.price.toFixed(2)}€`})
                    </option>
                  ))}
                </select>
              </div>

              {/* Official Timelines Distinction: Production vs Shipping */}
              <div className="space-y-1 text-[10px] text-forest/75 font-sans border-y border-forest/5 py-2">
                <div className="flex justify-between items-center">
                  <span className="text-forest/60">{isPt ? 'Produção Manual:' : 'Handcrafted Production:'}</span>
                  <span className="font-serif font-medium text-forest">
                    {maxLeadTimeDays === 0
                      ? (isPt ? 'Disponível em Atelier' : 'Available in Atelier')
                      : (isPt ? `${maxLeadTimeDays} ${maxLeadTimeDays === 1 ? 'dia útil' : 'dias úteis'}` : `${maxLeadTimeDays} ${maxLeadTimeDays === 1 ? 'business day' : 'business days'}`)
                    }
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-forest/60">{isPt ? 'Envio Expresso (CTT):' : 'Express Shipping (CTT):'}</span>
                  <span className="font-serif font-medium text-forest">
                    {maxLeadTimeDays === 0
                      ? (isPt ? '1 a 3 dias úteis' : '1 to 3 business days')
                      : (isPt ? '1 a 3 dias úteis (após produção)' : '1 to 3 business days (post-production)')
                    }
                  </span>
                </div>
              </div>

              {/* Financial Totals */}
              <div className="space-y-1 font-sans text-xs">
                <div className="flex justify-between text-forest/60">
                  <span>Subtotal</span>
                  <span className="font-serif font-medium text-forest">{subtotal.toFixed(2)}€</span>
                </div>

                <div className="flex justify-between text-forest/60">
                  <span>{isPt ? 'Envio' : 'Shipping'}</span>
                  <span className="font-serif font-medium text-forest">
                    {shippingFee === 0 ? (
                      <span className="text-[#987834] uppercase text-[9px] tracking-wider font-semibold">
                        {isPt ? 'Cortesia' : 'Courtesy'}
                      </span>
                    ) : (
                      `${shippingFee.toFixed(2)}€`
                    )}
                  </span>
                </div>

                <div className="pt-1.5 border-t border-forest/10 flex justify-between items-baseline">
                  <span className="text-xs font-serif font-medium text-forest uppercase tracking-wider">
                    Total Final
                  </span>
                  <span className="text-base font-serif font-bold text-forest">
                    {totalPrice.toFixed(2)}€
                  </span>
                </div>
              </div>

              {/* Proportional Action Button */}
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  setIsCheckoutOpen(true);
                }}
                className="w-full py-4 px-6 bg-forest hover:bg-[#1C2713] text-cream rounded-full text-[10.5px] uppercase tracking-[0.25em] font-semibold transition-all shadow-md flex items-center justify-center gap-2.5 cursor-pointer active:scale-[0.99] group"
              >
                <span>{isPt ? 'Concluir Encomenda' : 'Complete Order'}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059]" />
                <span className="font-serif">{totalPrice.toFixed(2)}€</span>
                <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </button>

              {/* Simplified Micro-text */}
              <div className="text-[8.5px] text-forest/40 text-center font-sans tracking-wide">
                {isPt ? 'Impostos e taxas incluídos.' : 'Taxes and fees included.'}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
};
