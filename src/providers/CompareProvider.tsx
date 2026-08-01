'use client';

import { createContext, useContext, useReducer, useEffect, useCallback, type ReactNode } from 'react';

const COMPARE_KEY = 'energyv1-compare';
const MAX_COMPARE = 4;

interface CompareState {
  items: string[];
}

type CompareAction =
  | { type: 'TOGGLE_ITEM'; productId: string }
  | { type: 'REMOVE_ITEM'; productId: string }
  | { type: 'CLEAR_ALL' };

interface CompareContextType {
  items: string[];
  isComparing: (productId: string) => boolean;
  toggleItem: (productSlug: string) => void;
  removeItem: (productSlug: string) => void;
  clearAll: () => void;
}

function compareReducer(state: CompareState, action: CompareAction): CompareState {
  switch (action.type) {
    case 'TOGGLE_ITEM':
      if (state.items.includes(action.productId)) {
        return { items: state.items.filter((id) => id !== action.productId) };
      }
      if (state.items.length >= MAX_COMPARE) return state;
      return { items: [...state.items, action.productId] };
    case 'REMOVE_ITEM':
      return { items: state.items.filter((id) => id !== action.productId) };
    case 'CLEAR_ALL':
      return { items: [] };
    default:
      return state;
  }
}

function loadCompare(): CompareState {
  if (typeof window === 'undefined') return { items: [] };
  try {
    const data = localStorage.getItem(COMPARE_KEY);
    return data ? JSON.parse(data) : { items: [] };
  } catch {
    return { items: [] };
  }
}

const CompareContext = createContext<CompareContextType | null>(null);

export function CompareProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(compareReducer, null, loadCompare);

  useEffect(() => {
    localStorage.setItem(COMPARE_KEY, JSON.stringify(state));
  }, [state]);

  const isComparing = useCallback(
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
    <CompareContext.Provider
      value={{ items: state.items, isComparing, toggleItem, removeItem, clearAll }}
    >
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare(): CompareContextType {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error('useCompare must be used within CompareProvider');
  return ctx;
}
