export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'customer' | 'admin' | 'cleaner' | 'staff';
  adminRole?: 'Admin' | 'Operations Manager' | 'Customer Support';
  verified: boolean;
  loyaltyPoints?: number;
  badge?: 'Silver' | 'Gold' | 'Platinum';
}

export interface Booking {
  id: string;
  serviceId: string;
  serviceName: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'processing' | 'completed' | 'cancelled';
  totalAmount: number;
  address: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  estimatedTime?: string;
}
