export type RoomStatus = 'available' | 'reserved' | 'occupied' | 'maintenance' | 'unavailable';
export type BookingStatus = 'pending' | 'awaiting_payment' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancellation_requested' | 'cancelled' | 'rejected' | 'expired';
export type PaymentStatus = 'pending' | 'processing' | 'successful' | 'failed' | 'refunded' | 'expired' | 'partial';
export type UserRole = 'super_admin' | 'admin' | 'manager' | 'booking_staff' | 'front_desk' | 'finance';

export interface Room {
  id: string;
  name: string;
  number: string;
  type: string;
  description: string;
  images: string[];
  amenities: string[];
  capacity: number;
  beds: number;
  ratePerNight: number;
  status: RoomStatus;
  size: number;
  floor: number;
  seasonalRates?: SeasonalRate[];
  createdAt: string;
  updatedAt: string;
}

export interface SeasonalRate {
  startDate: string;
  endDate: string;
  ratePerNight: number;
  label: string;
}

export interface User {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: UserRole;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

export interface Booking {
  id: string;
  referenceCode: string;
  customerId: string;
  roomId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  status: BookingStatus;
  ratePerNight: number;
  nights: number;
  subtotal: number;
  taxes: number;
  fees: number;
  discount: number;
  totalAmount: number;
  paidAmount: number;
  specialRequests: string;
  createdAt: string;
  updatedAt: string;
  checkedInAt?: string;
  checkedOutAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
}

export interface Payment {
  id: string;
  bookingId: string;
  customerId: string;
  amount: number;
  status: PaymentStatus;
  method: string;
  reference: string;
  gatewayReference?: string;
  createdAt: string;
  updatedAt: string;
  refundedAt?: string;
  refundAmount?: number;
}

export interface SystemSettings {
  propertyName: string;
  propertyAddress: string;
  propertyPhone: string;
  propertyEmail: string;
  checkInTime: string;
  checkOutTime: string;
  currency: string;
  taxRate: number;
  cancellationDays: number;
  cancellationFeePercent: number;
  depositPercent: number;
  maxGuestsPerRoom: number;
  additionalGuestRate: number;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  details: string;
  timestamp: string;
  ipAddress?: string;
}
