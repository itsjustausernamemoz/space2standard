export interface Profile {
  id: string;
  role: 'admin' | 'customer';
  full_name: string | null;
  email: string | null;
  phone: string | null;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  category: string | null;      // deprecated string version
  category_id: string | null;
  category_rel?: Category;      // nested object from Supabase Join
  description: string | null;
  dimensions: string | null;
  materials: string | null;
  price: number;
  discount_type: 'percent' | 'fixed' | null;
  discount_value: number | null;
  discounted_price: number | null;
  stock_quantity: number;
  is_published: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  images?: ProductImage[];
}

export interface ProductImage {
  id: string;
  product_id: string;
  storage_url: string;
  is_primary: boolean;
  sort_order: number;
}

export interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  delivery_address: string | null;
  special_notes: string | null;
  status: OrderStatus;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

export type OrderStatus =
  | 'new'
  | 'contacted'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name_snapshot: string;
  unit_price_snapshot: number;
  quantity: number;
  discount_applied: number;
}

export interface Document {
  id: string;
  order_id: string | null;
  type: 'invoice' | 'quotation';
  line_items: LineItem[];
  subtotal: number;
  discount_total: number;
  vat_rate: number;
  vat_amount: number;
  grand_total: number;
  created_at: string;
  pdf_url: string | null;
}

export interface LineItem {
  product_name: string;
  quantity: number;
  unit_price: number;
  discount: number;
  total: number;
}

export interface StockLog {
  id: string;
  product_id: string;
  change_amount: number;
  reason: string;
  admin_note: string | null;
  recorded_at: string;
}

export interface Settings {
  key: string;
  value: string;
}

export interface SalesSummary {
  total_revenue: number;
  orders_this_month: number;
  avg_order_value: number;
  top_product: string;
}
