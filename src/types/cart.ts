export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  brandName: string;
  image: string;
  price: number;
  quantity: number;
  maxQuantity: number;
  weight: number;
}

export interface CartState {
  items: CartItem[];
  lastAddedId: string | null;
}

export type CartAction =
  | { type: 'ADD_ITEM'; product: Omit<CartItem, 'quantity'>; quantity?: number }
  | { type: 'REMOVE_ITEM'; productId: string }
  | { type: 'UPDATE_QUANTITY'; productId: string; quantity: number }
  | { type: 'CLEAR_CART' };

export interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  totalWeight: number;
  lastAddedId: string | null;
  addItem: (product: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getQuantity: (productId: string) => number;
  clearLastAdded: () => void;
}
