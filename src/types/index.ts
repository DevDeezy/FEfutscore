export interface User {
  id: number;
  email: string;
  role: 'user' | 'admin';
  created_at: string;
  token: string;
}

export interface OrderItem {
  productType: 'tshirt' | 'shoes';
  imageFront: string;
  imageBack?: string; // Only for t-shirts
  size: 'S' | 'M' | 'L' | 'XL' | '39' | '40' | '41' | '42';
  playerName?: string; // Make playerName optional
}

export interface Order {
  _id: string;
  user: string;
  items: OrderItem[];
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  created_at: string;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export interface OrderState {
  orders: Order[];
  currentOrder: Order | null;
  loading: boolean;
  error: string | null;
} 