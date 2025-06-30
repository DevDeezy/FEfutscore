import jwt_decode from 'jwt-decode';

export interface User {
  id: number;
  email: string;
  role: 'user' | 'admin';
  created_at: string;
  token: string;
  password_reset_required?: boolean;
}

export interface OrderItem {
  product_id?: number;
  name?: string;
  price?: number;
  product_type: string;
  image_front?: string;
  image_back?: string;
  size: string;
  quantity: number;
  player_name?: string;
  shirt_type_id?: number;
  shirt_type_name?: string;
}

export interface Order {
  id: number;
  user: any;
  items: OrderItem[];
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  created_at: string;
  total_price: number;
}

export interface AuthState {
  user: User | null;
  token: string | null;
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
  shirt_type_id?: number; // For t-shirts, references ShirtType
  shirt_type_name?: string; // For display purposes
}

export interface Pack {
  id: number;
  name: string;
  items: PackItem[];
  price: number;
  created_at?: string;
}

export interface ProductType {
  id: number;
  name: string;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  image_url: string;
  available_sizes: string[];
  productType: ProductType;
  product_type_id: number;
} 