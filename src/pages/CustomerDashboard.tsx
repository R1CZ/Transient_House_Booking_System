import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { Home, Calendar, CreditCard, User, Settings, LogOut, Clock, CheckCircle, XCircle, AlertCircle, ChevronRight, Download, X } from 'lucide-react';
import { formatDate, formatCurrency, getStatusColor, getStatusLabel, formatRelative } from '../utils/helpers';

export default function CustomerDashboard() {
  const { currentUser, bookings, rooms, payments, logout, cancelBooking } = useStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('bookings');
  const [showCancelModal, setShowCancelModal] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [showProfile, setShowProfile] = useState(false);

  const myBookings = bookings.filter(b => b.customerId === currentUser?.id).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const myPayments = payments.filter(p => p.customerId === currentUser?.id);

  const stats = {
    total: myBookings.length,
    confirmed: myBookings.filter(b => b.status === 'confirmed').length,
    pending: myBookings.filter(b => ['pending', 'awaiting_payment'].includes(b.status)).length,
    completed: myBookings.filter(b => b.status === 'checked_out').length,
  };

  const handleCancel = (id: string) => {
    if (!cancelReason) return;
    cancelBooking(id, cancelReason);
    setShowCancelModal(null);
    setCancelReason('');
  };

  const navItems = [
    { id: 'bookings', icon: Calendar, label: 'My Bookings' },
    { id: 'payments', icon: CreditCard, label: 'Payments' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="min-h-screen bg-primary-50">
      {/* Top Bar */}
      <nav className="bg-white border-b border-primary-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent-600 flex items-center justify-center">
              <span className="text-white text-sm font-bold">S</span>
            </div>
            <span className="font-serif text-lg font-semibold text-primary-800">Serene Stays</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-primary-600 hidden sm:block">Hello, {currentUser?.firstName}</span>
            <button onClick={() => { logout(); navigate('/'); }} className="text-primary-500 hover:text-red-500 transition-colors">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="font-serif text-3xl text-primary-800 mb-1">My Dashboard</h1>
          <p className="text-primary-500">Manage your bookings and account</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Bookings', value: stats.total, icon: Calendar, color: 'text-accent-600 bg-accent-50' },
            { label: 'Confirmed', value: stats.confirmed, icon: CheckCircle, color: 'text-emerald-600 bg-emerald-50' },
            { label: 'Pending', value: stats.pending, icon: Clock, color: 'text-amber-600 bg-amber-50' },
            { label: 'Completed', value: stats.completed, icon: Home, color: 'text-blue-600 bg-blue-50' },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-xl p-5 shadow-sm">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${stat.color}`}>
                <stat.icon size={20} />
              </div>
              <p className="text-2xl font-semibold text-primary-800">{stat.value}</p>
              <p className="text-xs text-primary-500">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white rounded-xl p-1 shadow-sm w-fit">
          {navItems.map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === item.id ? 'bg-accent-600 text-white' : 'text-primary-500 hover:text-primary-700'}`}>
              <item.icon size={16} /> <span className="hidden sm:inline">{item.label}</span>
            </button>
          ))}
        </div>

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="space-y-4">
            {myBookings.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center">
                <Calendar size={48} className="mx-auto text-primary-300 mb-4" />
                <h3 className="font-serif text-xl text-primary-800 mb-2">No bookings yet</h3>
                <p className="text-primary-500 text-sm mb-6">Start exploring our rooms and make your first reservation</p>
                <Link to="/rooms" className="btn-primary">Browse Rooms</Link>
              </div>
            ) : (
              myBookings.map(booking => {
                const room = rooms.find(r => r.id === booking.roomId);
                return (
                  <div key={booking.id} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex gap-4">
                        {room && <img src={room.images[0]} alt={room.name} className="w-20 h-20 rounded-lg object-cover" />}
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-primary-800">{room?.name || 'Unknown Room'}</h3>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(booking.status)}`}>{getStatusLabel(booking.status)}</span>
                          </div>
                          <p className="text-xs text-primary-500 font-mono mb-2">{booking.referenceCode}</p>
                          <div className="flex flex-wrap gap-4 text-xs text-primary-500">
                            <span>📅 {formatDate(booking.checkIn)} → {formatDate(booking.checkOut)}</span>
                            <span>👥 {booking.guests} guest{booking.guests > 1 ? 's' : ''}</span>
                            <span>🌙 {booking.nights} night{booking.nights > 1 ? 's' : ''}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-semibold text-accent-600">{formatCurrency(booking.totalAmount)}</span>
                        {['awaiting_payment', 'pending'].includes(booking.status) && (
                          <button className="btn-primary text-xs py-2">Pay Now</button>
                        )}
                        {['pending', 'awaiting_payment', 'confirmed'].includes(booking.status) && (
                          <button onClick={() => setShowCancelModal(booking.id)} className="text-xs text-red-500 hover:text-red-600 px-3 py-2 border border-red-200 rounded-lg hover:bg-red-50">Cancel</button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Payments Tab */}
        {activeTab === 'payments' && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-primary-100">
                    <th className="text-left text-xs font-medium text-primary-500 uppercase px-6 py-4">Reference</th>
                    <th className="text-left text-xs font-medium text-primary-500 uppercase px-6 py-4">Amount</th>
                    <th className="text-left text-xs font-medium text-primary-500 uppercase px-6 py-4">Method</th>
                    <th className="text-left text-xs font-medium text-primary-500 uppercase px-6 py-4">Status</th>
                    <th className="text-left text-xs font-medium text-primary-500 uppercase px-6 py-4">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {myPayments.map(payment => (
                    <tr key={payment.id} className="border-b border-primary-50 hover:bg-primary-50/50">
                      <td className="px-6 py-4 text-sm font-mono text-primary-700">{payment.reference}</td>
                      <td className="px-6 py-4 text-sm font-medium text-primary-800">{formatCurrency(payment.amount)}</td>
                      <td className="px-6 py-4 text-sm text-primary-600">{payment.method}</td>
                      <td className="px-6 py-4"><span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(payment.status)}`}>{getStatusLabel(payment.status)}</span></td>
                      <td className="px-6 py-4 text-sm text-primary-500">{formatRelative(payment.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {myPayments.length === 0 && (
              <div className="p-12 text-center text-primary-500">No payment records</div>
            )}
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-xl p-8 shadow-sm max-w-2xl">
            <h3 className="font-serif text-xl text-primary-800 mb-6">Personal Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-primary-500 uppercase tracking-wider mb-1 block">First Name</label>
                <input type="text" value={currentUser?.firstName || ''} readOnly className="w-full px-4 py-2.5 text-sm border border-primary-200 rounded-lg bg-primary-50" />
              </div>
              <div>
                <label className="text-xs font-medium text-primary-500 uppercase tracking-wider mb-1 block">Last Name</label>
                <input type="text" value={currentUser?.lastName || ''} readOnly className="w-full px-4 py-2.5 text-sm border border-primary-200 rounded-lg bg-primary-50" />
              </div>
              <div>
                <label className="text-xs font-medium text-primary-500 uppercase tracking-wider mb-1 block">Email</label>
                <input type="email" value={currentUser?.email || ''} readOnly className="w-full px-4 py-2.5 text-sm border border-primary-200 rounded-lg bg-primary-50" />
              </div>
              <div>
                <label className="text-xs font-medium text-primary-500 uppercase tracking-wider mb-1 block">Phone</label>
                <input type="tel" value={currentUser?.phone || ''} readOnly className="w-full px-4 py-2.5 text-sm border border-primary-200 rounded-lg bg-primary-50" />
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-primary-100">
              <p className="text-xs text-primary-400">Member since {formatDate(currentUser?.createdAt || '')}</p>
            </div>
          </div>
        )}
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full animate-fade-in-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-xl text-primary-800">Cancel Booking</h3>
              <button onClick={() => setShowCancelModal(null)} className="text-primary-400 hover:text-primary-600"><X size={20} /></button>
            </div>
            <p className="text-sm text-primary-500 mb-4">Please provide a reason for cancellation:</p>
            <textarea value={cancelReason} onChange={e => setCancelReason(e.target.value)} placeholder="Reason for cancellation..." className="w-full px-4 py-3 text-sm border border-primary-200 rounded-lg resize-none h-24 mb-4" />
            <div className="flex gap-3">
              <button onClick={() => setShowCancelModal(null)} className="btn-secondary flex-1">Keep Booking</button>
              <button onClick={() => handleCancel(showCancelModal)} className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 flex-1">Confirm Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
