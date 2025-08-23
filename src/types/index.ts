import jwt_decode from 'jwt-decode';

export interface User {
  id: number;
  email: string;
  role: 'user' | 'admin';
  created_at: string;
  token: string;
  password_reset_required?: boolean;
  instagramName?: string;
  instagramNames?: string;
  userEmail?: string;
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
  id: string;
  sexo?: string;
  ano?: string;
  numero?: string;
  patch_images?: string[];
  anuncios?: boolean;
}

export interface Order {
  id: string;
  user_id: string;
  user?: { email: string; instagramName?: string };
  items: OrderItem[];
  total_price: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'CSV' | 'Em Processamento' | 'Para analizar' | 'Em pagamento' | 'A Orçamentar';
  created_at: string;
  address_nome: string;
  address_morada: string;
  address_cidade: string;
  address_distrito: string;
  address_pais: string;
  address_codigo_postal: string;
  address_telemovel: string;
  trackingText?: string;
  trackingImages?: string[];
  trackingVideos?: string[];
}

export interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationInfo;
}

export interface OrderState {
  orders: Order[];
  currentOrder: Order | null;
  loading: boolean;
  error: string | null;
  pagination?: PaginationInfo;
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
  cost_price?: number;
  created_at?: string;
}

export interface ProductType {
  id: number;
  name: string;
  base_type: string;
  parent_id?: number | null;
  children?: ProductType[];
  cost_price?: number;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  cost_price?: number;
  image_url: string;
  available_sizes: string[];
  productType: ProductType;
  product_type_id: number;
  sexo?: string;
  ano?: string;
  numero?: string;
} 