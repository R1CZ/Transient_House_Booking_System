import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../store';
import { LayoutDashboard, Calendar, Home, Users, CreditCard, BarChart3, Settings, LogOut, Search, Filter, Eye, CheckCircle, XCircle, LogIn, LogOut as LogOutIcon, X } from 'lucide-react';
import { formatCurrency, formatDate, getStatusColor, getStatusLabel, formatRelative } from '../utils/helpers';
import { BookingStatus } from '../types';

export default function AdminBookings() {
  const { currentUser, bookings, rooms, users, updateBookingStatus, checkIn, checkOut, logout } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<string | null>(null);

  const navItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/bookings', icon: Calendar, label: 'Bookings' },
    { path: '/admin/rooms', icon: Home, label: 'Rooms' },
    { path: '/admin/customers', icon: Users, label: 'Customers' },
    { path: '/admin/payments', icon: CreditCard, label: 'Payments' },
    { path: '/admin/reports', icon: BarChart3, label: 'Reports' },
    { path: '/admin/settings', icon: Settings, label: 'Settings' },
  ];

  const filteredBookings = bookings.filter(b => {
    if (statusFilter && b.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const customer = users.find(u => u.id === b.customerId);
      const room = rooms.find(r => r.id === b.roomId);
      return b.referenceCode.toLowerCase().includes(q) || 
        (customer && `${customer.firstName} ${customer.lastName}`.toLowerCase().includes(q)) ||
        (room && room.name.toLowerCase().includes(q));
    }
    return true;
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const selected = bookings.find(b => b.id === selectedBooking);
  const selectedRoom = selected ? rooms.find(r => r.id === selected.roomId) : null;
  const selectedCustomer = selected ? users.find(u => u.id === selected.customerId) : null;

  return (
    <div className="min-h-screen bg-primary-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-primary-100 fixed h-full flex flex-col z-30">
        <div className="p-6 border-b border-primary-100">
          <Link to="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent-600 flex items-center justify-center"><span className="text-white text-sm font-bold">S</span></div>
            <div><span className="font-serif text-lg font-semibold text-primary-800 block leading-tight">Serene Stays</span><span className="text-xs text-primary-400">Admin Panel</span></div>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(item => (
            <Link key={item.path} to={item.path} className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all ${location.pathname === item.path ? 'bg-accent-50 text-accent-700 font-medium' : 'text-primary-600 hover:bg-primary-50'}`}>
              <item.icon size={18} /> {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-primary-100">
          <button onClick={() => { logout(); navigate('/'); }} className="flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg w-full"><LogOut size={16} /> Sign Out</button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 ml-64 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-3xl text-primary-800 mb-1">Bookings</h1>
            <p className="text-primary-500">{filteredBookings.length} total reservations</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-4 shadow-sm mb-6 flex flex-wrap gap-4 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-400" />
            <input type="text" placeholder="Search by reference, guest, or room..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 text-sm border border-primary-200 rounded-lg" />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-4 py-2 text-sm border border-primary-200 rounded-lg">
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="awaiting_payment">Awaiting Payment</option>
            <option value="confirmed">Confirmed</option>
            <option value="checked_in">Checked In</option>
            <option value="checked_out">Checked Out</option>
            <option value="cancelled">Cancelled</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-primary-100">
                  <th className="text-left text-xs font-medium text-primary-500 uppercase px-6 py-3">Reference</th>
                  <th className="text-left text-xs font-medium text-primary-500 uppercase px-6 py-3">Guest</th>
                  <th className="text-left text-xs font-medium text-primary-500 uppercase px-6 py-3">Room</th>
                  <th className="text-left text-xs font-medium text-primary-500 uppercase px-6 py-3">Check-in</th>
                  <th className="text-left text-xs font-medium text-primary-500 uppercase px-6 py-3">Check-out</th>
                  <th className="text-left text-xs font-medium text-primary-500 uppercase px-6 py-3">Amount</th>
                  <th className="text-left text-xs font-medium text-primary-500 uppercase px-6 py-3">Status</th>
                  <th className="text-left text-xs font-medium text-primary-500 uppercase px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map(booking => {
                  const room = rooms.find(r => r.id === booking.roomId);
                  const customer = users.find(u => u.id === booking.customerId);
                  return (
                    <tr key={booking.id} className="border-b border-primary-50 hover:bg-primary-50/50">
                      <td className="px-6 py-4 text-sm font-mono text-primary-700">{booking.referenceCode}</td>
                      <td className="px-6 py-4 text-sm text-primary-800">{customer ? `${customer.firstName} ${customer.lastName}` : 'Unknown'}</td>
                      <td className="px-6 py-4 text-sm text-primary-600">{room?.name || 'Unknown'}</td>
                      <td className="px-6 py-4 text-sm text-primary-500">{formatDate(booking.checkIn, 'MMM dd, yyyy')}</td>
                      <td className="px-6 py-4 text-sm text-primary-500">{formatDate(booking.checkOut, 'MMM dd, yyyy')}</td>
                      <td className="px-6 py-4 text-sm font-medium text-primary-800">{formatCurrency(booking.totalAmount)}</td>
                      <td className="px-6 py-4"><span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(booking.status)}`}>{getStatusLabel(booking.status)}</span></td>
                      <td className="px-6 py-4">
                        <button onClick={() => setSelectedBooking(booking.id)} className="text-accent-600 hover:text-accent-700"><Eye size={16} /></button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filteredBookings.length === 0 && <div className="p-12 text-center text-primary-500">No bookings found</div>}
        </div>
      </main>

      {/* Booking Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto animate-fade-in-up">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-serif text-xl text-primary-800">Booking Details</h3>
              <button onClick={() => setSelectedBooking(null)} className="text-primary-400 hover:text-primary-600"><X size={20} /></button>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between p-3 bg-primary-50 rounded-lg">
                <span className="text-sm text-primary-500">Reference</span>
                <span className="text-sm font-mono font-medium text-primary-800">{selected.referenceCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-primary-500">Guest</span>
                <span className="text-sm text-primary-800">{selectedCustomer ? `${selectedCustomer.firstName} ${selectedCustomer.lastName}` : 'Unknown'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-primary-500">Room</span>
                <span className="text-sm text-primary-800">{selectedRoom?.name || 'Unknown'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-primary-500">Dates</span>
                <span className="text-sm text-primary-800">{formatDate(selected.checkIn)} → {formatDate(selected.checkOut)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-primary-500">Nights</span>
                <span className="text-sm text-primary-800">{selected.nights}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-primary-500">Guests</span>
                <span className="text-sm text-primary-800">{selected.guests}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-primary-500">Rate/Night</span>
                <span className="text-sm text-primary-800">{formatCurrency(selected.ratePerNight)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-primary-500">Subtotal</span>
                <span className="text-sm text-primary-800">{formatCurrency(selected.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-primary-500">Taxes</span>
                <span className="text-sm text-primary-800">{formatCurrency(selected.taxes)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-primary-500">Fees</span>
                <span className="text-sm text-primary-800">{formatCurrency(selected.fees)}</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-primary-100 font-semibold">
                <span className="text-primary-800">Total</span>
                <span className="text-accent-600">{formatCurrency(selected.totalAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-primary-500">Paid</span>
                <span className="text-sm font-medium text-emerald-600">{formatCurrency(selected.paidAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-primary-500">Status</span>
                <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(selected.status)}`}>{getStatusLabel(selected.status)}</span>
              </div>
              {selected.specialRequests && (
                <div className="p-3 bg-amber-50 rounded-lg">
                  <p className="text-xs text-amber-600 font-medium mb-1">Special Requests</p>
                  <p className="text-sm text-amber-700">{selected.specialRequests}</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="mt-6 pt-4 border-t border-primary-100 flex flex-wrap gap-2">
              {selected.status === 'pending' && (
                <>
                  <button onClick={() => { updateBookingStatus(selected.id, 'confirmed'); setSelectedBooking(null); }} className="bg-emerald-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-emerald-700 flex items-center gap-1"><CheckCircle size={14} /> Confirm</button>
                  <button onClick={() => { updateBookingStatus(selected.id, 'rejected'); setSelectedBooking(null); }} className="bg-red-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-red-700 flex items-center gap-1"><XCircle size={14} /> Reject</button>
                </>
              )}
              {selected.status === 'confirmed' && (
                <button onClick={() => { checkIn(selected.id); setSelectedBooking(null); }} className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700 flex items-center gap-1"><LogIn size={14} /> Check In</button>
              )}
              {selected.status === 'checked_in' && (
                <button onClick={() => { checkOut(selected.id); setSelectedBooking(null); }} className="bg-gray-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-gray-700 flex items-center gap-1"><LogOutIcon size={14} /> Check Out</button>
              )}
              {['pending', 'awaiting_payment', 'confirmed'].includes(selected.status) && (
                <button onClick={() => { updateBookingStatus(selected.id, 'cancelled'); setSelectedBooking(null); }} className="border border-red-300 text-red-600 px-3 py-2 rounded-lg text-sm hover:bg-red-50">Cancel Booking</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
