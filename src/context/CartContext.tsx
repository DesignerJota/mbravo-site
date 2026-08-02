import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, ShippingZone, SHIPPING_ZONES } from '../types';

interface CartContextType {
  cart: CartItem[];
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  addToCart: (item: Omit<CartItem, 'cartItemId'>) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  selectedShippingZone: ShippingZone;
  setSelectedShippingZone: (zone: ShippingZone) => void;
  subtotal: number;
  shippingFee: number;
  totalPrice: number;
  totalItemCount: number;
  maxLeadTimeDays: number;
  isFreeShipping: boolean;
  amountNeededForFreeShipping: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'mbravo_atelier_cart_v1';
const SHIPPING_STORAGE_KEY = 'mbravo_shipping_zone_v1';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [isCartOpenState, setIsCartOpenState] = useState(false);
  const [isCheckoutOpenState, setIsCheckoutOpenState] = useState(false);

  // Mutually Exclusive Modal Openers
  const setIsCartOpen = (open: boolean) => {
    if (open) {
      setIsCheckoutOpenState(false);
    }
    setIsCartOpenState(open);
  };

  const setIsCheckoutOpen = (open: boolean) => {
    if (open) {
      setIsCartOpenState(false);
    }
    setIsCheckoutOpenState(open);
  };

  // Body scroll locking mechanism
  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (isCartOpenState || isCheckoutOpenState) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    }
    return () => {
      if (typeof document !== 'undefined') {
        document.body.style.overflow = '';
      }
    };
  }, [isCartOpenState, isCheckoutOpenState]);

  const [selectedShippingZone, setSelectedShippingZoneState] = useState<ShippingZone>(() => {
    try {
      const savedId = localStorage.getItem(SHIPPING_STORAGE_KEY);
      const matched = SHIPPING_ZONES.find(z => z.id === savedId);
      return matched || SHIPPING_ZONES[0]; // Default Portugal (4.50€)
    } catch (e) {
      return SHIPPING_ZONES[0];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.warn('Failed to persist cart to localStorage', e);
    }
  }, [cart]);

  const setSelectedShippingZone = (zone: ShippingZone) => {
    setSelectedShippingZoneState(zone);
    try {
      localStorage.setItem(SHIPPING_STORAGE_KEY, zone.id);
    } catch (e) {}
  };

  const addToCart = (newItemData: Omit<CartItem, 'cartItemId'>) => {
    const cartItemId = `${newItemData.productId}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const newItem: CartItem = {
      ...newItemData,
      cartItemId
    };

    setCart(prev => {
      // Check if identical product with exact same selections already exists
      const existingIndex = prev.findIndex(item => 
        item.productId === newItem.productId &&
        JSON.stringify(item.selections) === JSON.stringify(newItem.selections)
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + newItem.quantity
        };
        return updated;
      }
      return [...prev, newItem];
    });

    // Auto open the slide-over drawer
    setIsCartOpen(true);
  };

  const removeFromCart = (cartItemId: string) => {
    setCart(prev => prev.filter(item => item.cartItemId !== cartItemId));
  };

  const updateQuantity = (cartItemId: string, newQty: number) => {
    if (newQty <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart(prev => prev.map(item => item.cartItemId === cartItemId ? { ...item, quantity: newQty } : item));
  };

  const clearCart = () => {
    setCart([]);
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  const FREE_SHIPPING_THRESHOLD = 100;
  const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const amountNeededForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  const shippingFee = cart.length > 0 ? (isFreeShipping ? 0 : selectedShippingZone.price) : 0;
  const totalPrice = subtotal + shippingFee;
  const totalItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Dynamic max lead time from admin/catalog settings for items in cart
  const maxLeadTimeDays = cart.length > 0 
    ? Math.max(...cart.map(item => item.leadTimeDays || 3))
    : 3;

  return (
    <CartContext.Provider
      value={{
        cart,
        isCartOpen: isCartOpenState,
        setIsCartOpen,
        isCheckoutOpen: isCheckoutOpenState,
        setIsCheckoutOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        selectedShippingZone,
        setSelectedShippingZone,
        subtotal,
        shippingFee,
        totalPrice,
        totalItemCount,
        maxLeadTimeDays,
        isFreeShipping,
        amountNeededForFreeShipping
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
