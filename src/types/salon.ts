export type ServiceCategory = 
  | 'visage'
  | 'massages'
  | 'regard'
  | 'epilation'
  | 'ongles'
  | 'rituels';

export interface SalonService {
  id: string;
  title: string;
  subtitle: string;
  category: ServiceCategory;
  categoryName: string;
  durationMinutes: number;
  price: number;
  originalPrice?: number;
  description: string;
  benefits: string[];
  protocol: string[];
  recommendedFor: string;
  badge?: string;
  image: string;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Practitioner {
  id: string;
  name: string;
  role: string;
  experience: string;
  specialties: string[];
  avatar: string;
  bio: string;
  email?: string;
}

export interface Booking {
  id: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  serviceId: string;
  serviceTitle: string;
  serviceCategory: string;
  durationMinutes: number;
  price: number;
  date: string; // YYYY-MM-DD
  timeSlot: string; // HH:mm
  practitioner: string;
  notes?: string;
  status: 'confirmed' | 'cancelled' | 'completed';
  cancellationReason?: string;
  paymentStatus?: 'paid' | 'refunded' | 'pending' | 'on_site';
  paymentMethod?: string;
  paymentTransactionId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SalonReview {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  serviceTitle?: string;
  createdAt: string;
}

export interface SalonInfo {
  name: string;
  tagline: string;
  address: string;
  postalCode: string;
  city: string;
  region: string;
  country: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  googleMapsUrl: string;
  phone: string;
  email: string;
  hours: {
    days: string;
    hours: string;
    note?: string;
  }[];
  amenities: string[];
}

export type UserRole = 'client' | 'practitioner' | 'admin';

export interface UserProfile {
  userId: string;
  email: string;
  displayName: string;
  photoURL?: string;
  phone?: string;
  role?: UserRole;
  admin?: boolean;
  isAdmin?: boolean;
  isPractitioner?: boolean;
  specialties?: string[];
  bio?: string;
  experience?: string;
  emailVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
