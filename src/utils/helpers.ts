import { format, formatDistanceToNow, parseISO, isToday, isTomorrow, differenceInDays } from 'date-fns';

export const formatDate = (dateStr: string, fmt = 'MMM dd, yyyy') => {
  try { return format(parseISO(dateStr), fmt); } catch { return dateStr; }
};

export const formatDateTime = (dateStr: string) => {
  try { return format(parseISO(dateStr), 'MMM dd, yyyy HH:mm'); } catch { return dateStr; }
};

export const formatRelative = (dateStr: string) => {
  try { return formatDistanceToNow(parseISO(dateStr), { addSuffix: true }); } catch { return dateStr; }
};

export const isDateToday = (dateStr: string) => {
  try { return isToday(parseISO(dateStr)); } catch { return false; }
};

export const isDateTomorrow = (dateStr: string) => {
  try { return isTomorrow(parseISO(dateStr)); } catch { return false; }
};

export const daysUntil = (dateStr: string) => {
  try { return differenceInDays(parseISO(dateStr), new Date()); } catch { return 0; }
};

export const formatCurrency = (amount: number, currency = 'PHP') => {
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency }).format(amount);
};

export const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    available: 'bg-emerald-100 text-emerald-700',
    reserved: 'bg-amber-100 text-amber-700',
    occupied: 'bg-blue-100 text-blue-700',
    maintenance: 'bg-red-100 text-red-700',
    unavailable: 'bg-gray-100 text-gray-500',
    pending: 'bg-yellow-100 text-yellow-700',
    awaiting_payment: 'bg-orange-100 text-orange-700',
    confirmed: 'bg-emerald-100 text-emerald-700',
    checked_in: 'bg-blue-100 text-blue-700',
    checked_out: 'bg-gray-100 text-gray-600',
    cancellation_requested: 'bg-purple-100 text-purple-700',
    cancelled: 'bg-red-100 text-red-700',
    rejected: 'bg-red-100 text-red-700',
    expired: 'bg-gray-100 text-gray-500',
    successful: 'bg-emerald-100 text-emerald-700',
    processing: 'bg-blue-100 text-blue-700',
    failed: 'bg-red-100 text-red-700',
    refunded: 'bg-purple-100 text-purple-700',
    partial: 'bg-amber-100 text-amber-700',
  };
  return colors[status] || 'bg-gray-100 text-gray-600';
};

export const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    available: 'Available',
    reserved: 'Reserved',
    occupied: 'Occupied',
    maintenance: 'Maintenance',
    unavailable: 'Unavailable',
    pending: 'Pending',
    awaiting_payment: 'Awaiting Payment',
    confirmed: 'Confirmed',
    checked_in: 'Checked In',
    checked_out: 'Checked Out',
    cancellation_requested: 'Cancellation Requested',
    cancelled: 'Cancelled',
    rejected: 'Rejected',
    expired: 'Expired',
    successful: 'Successful',
    processing: 'Processing',
    failed: 'Failed',
    refunded: 'Refunded',
    partial: 'Partial',
  };
  return labels[status] || status;
};

export const getRoomTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    Standard: 'bg-stone-100 text-stone-700',
    Deluxe: 'bg-sky-100 text-sky-700',
    Suite: 'bg-violet-100 text-violet-700',
    Penthouse: 'bg-amber-100 text-amber-800',
    Family: 'bg-rose-100 text-rose-700',
  };
  return colors[type] || 'bg-gray-100 text-gray-600';
};

export const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const validatePassword = (password: string) => {
  const errors: string[] = [];
  if (password.length < 8) errors.push('At least 8 characters');
  if (!/[A-Z]/.test(password)) errors.push('At least one uppercase letter');
  if (!/[a-z]/.test(password)) errors.push('At least one lowercase letter');
  if (!/[0-9]/.test(password)) errors.push('At least one number');
  return errors;
};

export const generateBookingRef = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'SRN-';
  for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
};

export const cn = (...classes: (string | boolean | undefined | null)[]) => {
  return classes.filter(Boolean).join(' ');
};
