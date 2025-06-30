import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { OrderItem } from '../../types';

interface CartState {
  items: OrderItem[];
}

const loadState = (): CartState => {
  try {
    const serializedState = localStorage.getItem('cart');
    if (serializedState === null) {
      return { items: [] };
    }
    return JSON.parse(serializedState);
  } catch (err) {
    return { items: [] };
  }
};

const saveState = (state: CartState) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem('cart', serializedState);
  } catch {
    // ignore write errors
  }
};

const initialState: CartState = loadState();

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<OrderItem>) => {
      const newItem = action.payload;
      let existingItem;

      if (newItem.product_id) {
        // It's a store product
        existingItem = state.items.find(
          (item) => item.product_id === newItem.product_id && item.size === newItem.size
        );
      } else {
        // It's a custom t-shirt
        existingItem = state.items.find(
          (item) =>
            !item.product_id && // Ensure it's also a custom item
            item.size === newItem.size &&
            item.player_name === newItem.player_name &&
            item.shirt_type_id === newItem.shirt_type_id
        );
      }

      if (existingItem) {
        existingItem.quantity += newItem.quantity;
      } else {
        state.items.push(newItem);
      }
      saveState(state);
    },
    removeFromCart: (state, action: PayloadAction<number>) => {
      state.items.splice(action.payload, 1);
      saveState(state);
    },
    clearCart: (state) => {
      state.items = [];
      saveState(state);
    },
  },
});

export const { addToCart, removeFromCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer; 