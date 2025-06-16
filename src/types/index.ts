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
  shirt_type_id?: number; // For t-shirts, references ShirtType
  shirt_type_name?: string; // For display purposes
}

export interface Order {
  id: number;
  user: any;
  items: OrderItem[];
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  created_at: string;
  price: number;
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

export interface PackItem {
  product_type: 'tshirt' | 'shoes';
  quantity: number;
  shirt_type?: 'Old' | 'New' | 'Icon'; // Only for t-shirts
}

export interface Pack {
  id: number;
  name: string;
  items: PackItem[];
  price: number;
  created_at?: string;
} 