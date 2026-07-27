export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  enabled: boolean;
  role: Role;
  createdAt: string;
}

export interface Role {
  id: number;
  name: string;
}

export interface Category {
  id: number;
  name: string;
  description: string;
  active: boolean;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  active: boolean;
  imagePath?: string;
  category: Category;
}

export interface RestaurantTable {
  id: number;
  tableNumber: number;
  capacity: number;
  status: TableStatus;
}

export enum TableStatus {
  AVAILABLE = 'AVAILABLE',
  OCCUPIED = 'OCCUPIED',
  RESERVED = 'RESERVED',
}

export interface Order {
  id: number;
  restaurantTable: RestaurantTable;
  user: User;
  status: OrderStatus;
  createdAt: string;
  total: number;
}

export enum OrderStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  READY = 'READY',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  PAID = 'PAID',
}

export interface OrderDetail {
  id: number;
  order: Order;
  product: Product;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface KitchenTicketItem {
  productName: string;
  quantity: number;
}

export interface KitchenTicket {
  orderId: number;
  tableNumber: number;
  waiterName: string;
  status: OrderStatus;
  createdAt: string;
  total: number;
  items: KitchenTicketItem[];
}

export interface Payment {
  id: number;
  order: Order;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  paidAt: string;
}

export enum PaymentMethod {
  EFFECTIVE = 'EFFECTIVE',
  CARD = 'CARD',
  NEQUI = 'NEQUI',
  DAVIPLATA = 'DAVIPLATA',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
}

export interface DashboardStats {
  salesToday: number;
  salesThisMonth: number;
  totalRevenue: number;
  activeOrders: number;
  occupiedTables: number;
  topProducts: Array<{ id: number; name: string; totalSold: number }>;
  topCategories: Array<{ id: number; name: string; totalSold: number }>;
}
