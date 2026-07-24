'use client';

import { createContext, useContext, useReducer, useEffect, useCallback, type ReactNode } from 'react';
import type { CartItem, CartState, CartAction, CartContextType } from '@/types/cart';

const CART_KEY = 'energyv1-cart';

const initialState: CartState = {
  items: [],
  lastAddedId: null,
};

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.find((i) => i.productId === action.product.productId);
      if (existing) {
        const newQty = existing.quantity + (action.quantity ?? 1);
        return {
          ...state,
          items: state.items.map((i) =>
            i.productId === action.product.productId ? { ...i, quantity: newQty } : i
          ),
          lastAddedId: action.product.productId,
        };
      }
      return {
        ...state,
        items: [...state.items, { ...action.product, quantity: action.quantity ?? 1 }],
        lastAddedId: action.product.productId,
      };
    }
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter((i) => i.productId !== action.productId),
      };
    case 'UPDATE_QUANTITY': {
      if (action.quantity <= 0) {
        return { ...state, items: state.items.filter((i) => i.productId !== action.productId) };
      }
      return {
        ...state,
        items: state.items.map((i) =>
          i.productId === action.productId
            ? { ...i, quantity: action.quantity }
            : i
        ),
      };
    }
    case 'CLEAR_CART':
      return initialState;
    default:
      return state;
  }
}

function loadCart(): CartState {
  if (typeof window === 'undefined') return initialState;
  try {
    const data = localStorage.getItem(CART_KEY);
    return data ? JSON.parse(data) : initialState;
  } catch {
    return initialState;
  }
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, null, loadCart);

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(state));
  }, [state]);

  const itemCount = state.items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = state.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const totalWeight = state.items.reduce((sum, i) => sum + i.weight * i.quantity, 0);

  const addItem = useCallback((product: Omit<CartItem, 'quantity'>, quantity = 1) => {
    dispatch({ type: 'ADD_ITEM', product, quantity });
  }, []);

  const removeItem = useCallback((productId: string) => {
    dispatch({ type: 'REMOVE_ITEM', productId });
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', productId, quantity });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR_CART' });
  }, []);

  const getQuantity = useCallback(
    (productId: string) => state.items.find((i) => i.productId === productId)?.quantity ?? 0,
    [state.items]
  );

  const clearLastAdded = useCallback(() => {
    dispatch({ type: 'ADD_ITEM', product: { productId: '', slug: '', name: '', brandName: '', image: '', price: 0, maxQuantity: 0, weight: 0 } });
    // hack: reset lastAddedId by re-adding a dummy item, then immediately removing it
    // Better approach: add a CLEAR_LAST_ADDED action
    state.lastAddedId = null;
  }, [state]);

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        itemCount,
        subtotal,
        totalWeight,
        lastAddedId: state.lastAddedId,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        getQuantity,
        clearLastAdded,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextType {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
