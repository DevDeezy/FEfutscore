import jwt_decode from 'jwt-decode';

export interface User {
  id: number;
  email: string;
  role: 'user' | 'admin';
  created_at: string;
  token: string;
}

export interface OrderItem {
  product_type: 'tshirt' | 'shoes';
  image_front: string;
  image_back?: string; // Only for t-shirts
  size: 'S' | 'M' | 'L' | 'XL' | '39' | '40' | '41' | '42';
  player_name?: string; // Make playerName optional
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