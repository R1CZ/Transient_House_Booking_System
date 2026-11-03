import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Room, User, Booking, Payment, SystemSettings, BookingStatus, RoomStatus, PaymentStatus } from '../types';
import { seedRooms, seedAdmin, seedCustomer, seedBookings, seedPayments, defaultSettings } from '../data/seed';
import { v4 as uuidv4 } from 'uuid';

interface AppState {
  // Data
  rooms: Room[];
  users: User[];
  bookings: Booking[];
  payments: Payment[];
  settings: SystemSettings;
  
  // Auth
  currentUser: User | null;
  isAuthenticated: boolean;
  
  // Actions
  login: (email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  register: (data: Partial<User>) => { success: boolean; error?: string };
  updateProfile: (data: Partial<User>) => void;
  changePassword: (oldPassword: string, newPassword: string) => { success: boolean; error?: string };
  
  // Room actions
  addRoom: (room: Partial<Room>) => void;
  updateRoom: (id: string, data: Partial<Room>) => void;
  deleteRoom: (id: string) => void;
  
  // Booking actions
  createBooking: (booking: Partial<Booking>) => { success: boolean; booking?: Booking; error?: string };
  updateBookingStatus: (id: string, status: BookingStatus) => void;
  cancelBooking: (id: string, reason: string) => void;
  checkIn: (id: string) => void;
  checkOut: (id: string) => void;
  
  // Payment actions
  createPayment: (payment: Partial<Payment>) => Payment;
  updatePaymentStatus: (id: string, status: PaymentStatus) => void;
  processPayment: (bookingId: string, method: string) => { success: boolean; payment?: Payment; error?: string };
  
  // Availability
  checkAvailability: (roomId: string, checkIn: string, checkOut: string) => boolean;
  getAvailableRooms: (checkIn: string, checkOut: string, guests: number) => Room[];
  
  // Settings
  updateSettings: (data: Partial<SystemSettings>) => void;
}

const generateRefCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'SRN-';
  for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
};

const calculateNights = (checkIn: string, checkOut: string) => {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      rooms: seedRooms,
      users: [seedAdmin, seedCustomer],
      bookings: seedBookings,
      payments: seedPayments,
      settings: defaultSettings,
      currentUser: null,
      isAuthenticated: false,

      login: (email, password) => {
        const user = get().users.find(u => u.email === email && u.password === password);
        if (!user) return { success: false, error: 'Invalid email or password' };
        if (!user.isActive) return { success: false, error: 'Account is deactivated' };
        if (!user.isVerified) return { success: false, error: 'Email not verified' };
        set({ currentUser: user, isAuthenticated: true });
        return { success: true };
      },

      logout: () => set({ currentUser: null, isAuthenticated: false }),

      register: (data) => {
        const existing = get().users.find(u => u.email === data.email);
        if (existing) return { success: false, error: 'Email already registered' };
        const newUser: User = {
          id: uuidv4(),
          email: data.email || '',
          password: data.password || '',
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          phone: data.phone || '',
          role: 'booking_staff',
          isVerified: true,
          isActive: true,
          createdAt: new Date().toISOString(),
        };
        set(state => ({ users: [...state.users, newUser] }));
        return { success: true };
      },

      updateProfile: (data) => {
        set(state => ({
          users: state.users.map(u => u.id === state.currentUser?.id ? { ...u, ...data } : u),
          currentUser: state.currentUser ? { ...state.currentUser, ...data } : null,
        }));
      },

      changePassword: (oldPassword, newPassword) => {
        const user = get().currentUser;
        if (!user || user.password !== oldPassword) return { success: false, error: 'Current password is incorrect' };
        set(state => ({
          users: state.users.map(u => u.id === user.id ? { ...u, password: newPassword } : u),
          currentUser: user ? { ...user, password: newPassword } : null,
        }));
        return { success: true };
      },

      addRoom: (room) => {
        const newRoom: Room = {
          id: uuidv4(),
          name: room.name || '',
          number: room.number || '',
          type: room.type || 'Standard',
          description: room.description || '',
          images: room.images || [],
          amenities: room.amenities || [],
          capacity: room.capacity || 2,
          beds: room.beds || 1,
          ratePerNight: room.ratePerNight || 0,
          status: 'available',
          size: room.size || 25,
          floor: room.floor || 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set(state => ({ rooms: [...state.rooms, newRoom] }));
      },

      updateRoom: (id, data) => {
        set(state => ({
          rooms: state.rooms.map(r => r.id === id ? { ...r, ...data, updatedAt: new Date().toISOString() } : r),
        }));
      },

      deleteRoom: (id) => {
        const hasActiveBookings = get().bookings.some(b => b.roomId === id && ['confirmed', 'checked_in', 'awaiting_payment'].includes(b.status));
        if (hasActiveBookings) return;
        set(state => ({ rooms: state.rooms.filter(r => r.id !== id) }));
      },

      createBooking: (bookingData) => {
        const { rooms, bookings, settings } = get();
        const room = rooms.find(r => r.id === bookingData.roomId);
        if (!room) return { success: false, error: 'Room not found' };
        if (room.status === 'maintenance' || room.status === 'unavailable') return { success: false, error: 'Room is not available' };
        
        const checkIn = bookingData.checkIn || '';
        const checkOut = bookingData.checkOut || '';
        const nights = calculateNights(checkIn, checkOut);
        if (nights <= 0) return { success: false, error: 'Invalid dates' };
        
        // Check availability
        const isAvailable = get().checkAvailability(bookingData.roomId!, checkIn, checkOut);
        if (!isAvailable) return { success: false, error: 'Room is not available for selected dates' };
        
        const guests = bookingData.guests || 1;
        if (guests > room.capacity) return { success: false, error: `Maximum capacity is ${room.capacity} guests` };
        
        const ratePerNight = room.ratePerNight;
        const subtotal = ratePerNight * nights;
        const additionalGuests = Math.max(0, guests - room.capacity);
        const additionalCharge = additionalGuests * settings.additionalGuestRate * nights;
        const taxes = Math.round((subtotal + additionalCharge) * (settings.taxRate / 100));
        const fees = 500;
        const discount = bookingData.discount || 0;
        const totalAmount = subtotal + additionalCharge + taxes + fees - discount;
        
        const newBooking: Booking = {
          id: uuidv4(),
          referenceCode: generateRefCode(),
          customerId: bookingData.customerId || get().currentUser?.id || '',
          roomId: bookingData.roomId || '',
          checkIn,
          checkOut,
          guests,
          status: 'awaiting_payment',
          ratePerNight,
          nights,
          subtotal,
          taxes,
          fees,
          discount,
          totalAmount,
          paidAmount: 0,
          specialRequests: bookingData.specialRequests || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        set(state => ({ bookings: [...state.bookings, newBooking] }));
        return { success: true, booking: newBooking };
      },

      updateBookingStatus: (id, status) => {
        set(state => ({
          bookings: state.bookings.map(b => b.id === id ? { ...b, status, updatedAt: new Date().toISOString() } : b),
        }));
      },

      cancelBooking: (id, reason) => {
        set(state => ({
          bookings: state.bookings.map(b => b.id === id ? { ...b, status: 'cancelled' as BookingStatus, cancelledAt: new Date().toISOString(), cancellationReason: reason, updatedAt: new Date().toISOString() } : b),
        }));
        // Update room status
        const booking = get().bookings.find(b => b.id === id);
        if (booking) {
          set(state => ({
            rooms: state.rooms.map(r => r.id === booking.roomId ? { ...r, status: 'available' as RoomStatus } : r),
          }));
        }
      },

      checkIn: (id) => {
        const booking = get().bookings.find(b => b.id === id);
        if (!booking) return;
        set(state => ({
          bookings: state.bookings.map(b => b.id === id ? { ...b, status: 'checked_in' as BookingStatus, checkedInAt: new Date().toISOString(), updatedAt: new Date().toISOString() } : b),
          rooms: state.rooms.map(r => r.id === booking.roomId ? { ...r, status: 'occupied' as RoomStatus } : r),
        }));
      },

      checkOut: (id) => {
        const booking = get().bookings.find(b => b.id === id);
        if (!booking) return;
        set(state => ({
          bookings: state.bookings.map(b => b.id === id ? { ...b, status: 'checked_out' as BookingStatus, checkedOutAt: new Date().toISOString(), updatedAt: new Date().toISOString() } : b),
          rooms: state.rooms.map(r => r.id === booking.roomId ? { ...r, status: 'available' as RoomStatus } : r),
        }));
      },

      createPayment: (paymentData) => {
        const newPayment: Payment = {
          id: uuidv4(),
          bookingId: paymentData.bookingId || '',
          customerId: paymentData.customerId || '',
          amount: paymentData.amount || 0,
          status: 'pending',
          method: paymentData.method || '',
          reference: `PAY-${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set(state => ({ payments: [...state.payments, newPayment] }));
        return newPayment;
      },

      updatePaymentStatus: (id, status) => {
        set(state => ({
          payments: state.payments.map(p => p.id === id ? { ...p, status, updatedAt: new Date().toISOString() } : p),
        }));
      },

      processPayment: (bookingId, method) => {
        const booking = get().bookings.find(b => b.id === bookingId);
        if (!booking) return { success: false, error: 'Booking not found' };
        
        const payment = get().createPayment({
          bookingId,
          customerId: booking.customerId,
          amount: booking.totalAmount,
          method,
        });
        
        // Simulate payment processing (in production, this would call the payment gateway)
        setTimeout(() => {
          set(state => ({
            payments: state.payments.map(p => p.id === payment.id ? { ...p, status: 'successful' as PaymentStatus, gatewayReference: `GW-${Date.now()}`, updatedAt: new Date().toISOString() } : p),
            bookings: state.bookings.map(b => b.id === bookingId ? { ...b, status: 'confirmed' as BookingStatus, paidAmount: b.totalAmount, updatedAt: new Date().toISOString() } : b),
          }));
        }, 2000);
        
        return { success: true, payment };
      },

      checkAvailability: (roomId, checkIn, checkOut) => {
        const { bookings, rooms } = get();
        const room = rooms.find(r => r.id === roomId);
        if (!room || room.status === 'maintenance' || room.status === 'unavailable') return false;
        
        const conflictingBookings = bookings.filter(b => {
          if (b.roomId !== roomId) return false;
          if (['cancelled', 'rejected', 'expired', 'checked_out'].includes(b.status)) return false;
          return (checkIn < b.checkOut && checkOut > b.checkIn);
        });
        
        return conflictingBookings.length === 0;
      },

      getAvailableRooms: (checkIn, checkOut, guests) => {
        const { rooms } = get();
        return rooms.filter(room => {
          if (room.status === 'maintenance' || room.status === 'unavailable') return false;
          if (room.capacity < guests) return false;
          return get().checkAvailability(room.id, checkIn, checkOut);
        });
      },

      updateSettings: (data) => {
        set(state => ({ settings: { ...state.settings, ...data } }));
      },
    }),
    {
      name: 'serene-stays-storage',
    }
  )
);
