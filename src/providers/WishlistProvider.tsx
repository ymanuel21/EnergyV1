'use client';

import { createContext, useContext, useReducer, useEffect, useCallback, type ReactNode } from 'react';

const WISHLIST_KEY = 'energyv1-wishlist';

interface WishlistState {
  items: string[];
}

type WishlistAction =
  | { type: 'TOGGLE_ITEM'; productId: string }
  | { type: 'REMOVE_ITEM'; productId: string }
  | { type: 'CLEAR_ALL' };

interface WishlistContextType {
  items: string[];
  isInWishlist: (productId: string) => boolean;
  toggleItem: (productId: string) => void;
  removeItem: (productId: string) => void;
  clearAll: () => void;
}

function wishlistReducer(state: WishlistState, action: WishlistAction): WishlistState {
  switch (action.type) {
    case 'TOGGLE_ITEM':
      return state.items.includes(action.productId)
        ? { items: state.items.filter((id) => id !== action.productId) }
        : { items: [...state.items, action.productId] };
    case 'REMOVE_ITEM':
      return { items: state.items.filter((id) => id !== action.productId) };
    case 'CLEAR_ALL':
      return { items: [] };
    default:
      return state;
  }
}

function loadWishlist(): WishlistState {
  if (typeof window === 'undefined') return { items: [] };
  try {
    const data = localStorage.getItem(WISHLIST_KEY);
    return data ? JSON.parse(data) : { items: [] };
  } catch {
    return { items: [] };
  }
}

const WishlistContext = createContext<WishlistContextType | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(wishlistReducer, null, loadWishlist);

  useEffect(() => {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(state));
  }, [state]);

  const isInWishlist = useCallback(
    (productId: string) => state.items.includes(productId),
    [state.items]
  );

  const toggleItem = useCallback((productId: string) => {
    dispatch({ type: 'TOGGLE_ITEM', productId });
  }, []);

  const removeItem = useCallback((productId: string) => {
    dispatch({ type: 'REMOVE_ITEM', productId });
  }, []);

  const clearAll = useCallback(() => {
    dispatch({ type: 'CLEAR_ALL' });
  }, []);

  return (
    <WishlistContext.Provider
      value={{ items: state.items, isInWishlist, toggleItem, removeItem, clearAll }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist(): WishlistContextType {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
}
