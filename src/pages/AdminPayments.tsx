import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../store';
import { LayoutDashboard, Calendar, Home, Users, CreditCard, BarChart3, Settings, LogOut, Search, DollarSign, CheckCircle, Clock, XCircle, RotateCcw } from 'lucide-react';
import { formatCurrency, formatDate, getStatusColor, getStatusLabel, formatRelative } from '../utils/helpers';

export default function AdminPayments() {
  const { payments, bookings, rooms, users, updatePaymentStatus, logout } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const navItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/bookings', icon: Calendar, label: 'Bookings' },
    { path: '/admin/rooms', icon: Home, label: 'Rooms' },
    { path: '/admin/customers', icon: Users, label: 'Customers' },
    { path: '/admin/payments', icon: CreditCard, label: 'Payments' },
    { path: '/admin/reports', icon: BarChart3, label: 'Reports' },
    { path: '/admin/settings', icon: Settings, label: 'Settings' },
  ];

  const totalRevenue = payments.filter(p => p.status === 'successful').reduce((s, p) => s + p.amount, 0);
  const pendingAmount = payments.filter(p => p.status === 'pending').reduce((s, p) => s + p.amount, 0);
  const refundedAmount = payments.filter(p => p.status === 'refunded').reduce((s, p) => s + p.amount, 0);

  const filtered = payments.filter(p => {
    if (statusFilter && p.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const booking = bookings.find(b => b.id === p.bookingId);
      return p.reference.toLowerCase().includes(q) || (booking && booking.referenceCode.toLowerCase().includes(q));
    }
    return true;
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="min-h-screen bg-primary-50 flex">
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

      <main className="flex-1 ml-64 p-8">
        <div className="mb-8">
          <h1 className="font-serif text-3xl text-primary-800 mb-1">Payments</h1>
          <p className="text-primary-500">Manage and monitor all transactions</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Revenue', value: formatCurrency(totalRevenue), icon: DollarSign, color: 'bg-emerald-50 text-emerald-600' },
            { label: 'Pending', value: formatCurrency(pendingAmount), icon: Clock, color: 'bg-amber-50 text-amber-600' },
            { label: 'Refunded', value: formatCurrency(refundedAmount), icon: RotateCcw, color: 'bg-purple-50 text-purple-600' },
            { label: 'Transactions', value: payments.length, icon: CreditCard, color: 'bg-blue-50 text-blue-600' },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-xl p-5 shadow-sm">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${stat.color}`}><stat.icon size={20} /></div>
              <p className="text-xl font-semibold text-primary-800">{stat.value}</p>
              <p className="text-xs text-primary-500">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-4 shadow-sm mb-6 flex flex-wrap gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-400" />
            <input type="text" placeholder="Search by reference..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 text-sm border border-primary-200 rounded-lg" />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-4 py-2 text-sm border border-primary-200 rounded-lg">
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="successful">Successful</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-primary-100">
                <th className="text-left text-xs font-medium text-primary-500 uppercase px-6 py-3">Reference</th>
                <th className="text-left text-xs font-medium text-primary-500 uppercase px-6 py-3">Booking</th>
                <th className="text-left text-xs font-medium text-primary-500 uppercase px-6 py-3">Customer</th>
                <th className="text-left text-xs font-medium text-primary-500 uppercase px-6 py-3">Amount</th>
                <th className="text-left text-xs font-medium text-primary-500 uppercase px-6 py-3">Method</th>
                <th className="text-left text-xs font-medium text-primary-500 uppercase px-6 py-3">Status</th>
                <th className="text-left text-xs font-medium text-primary-500 uppercase px-6 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(payment => {
                const booking = bookings.find(b => b.id === payment.bookingId);
                const customer = users.find(u => u.id === payment.customerId);
                return (
                  <tr key={payment.id} className="border-b border-primary-50 hover:bg-primary-50/50">
                    <td className="px-6 py-4 text-sm font-mono text-primary-700">{payment.reference}</td>
                    <td className="px-6 py-4 text-sm font-mono text-primary-600">{booking?.referenceCode || '-'}</td>
                    <td className="px-6 py-4 text-sm text-primary-800">{customer ? `${customer.firstName} ${customer.lastName}` : 'Unknown'}</td>
                    <td className="px-6 py-4 text-sm font-medium text-primary-800">{formatCurrency(payment.amount)}</td>
                    <td className="px-6 py-4 text-sm text-primary-600">{payment.method}</td>
                    <td className="px-6 py-4"><span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(payment.status)}`}>{getStatusLabel(payment.status)}</span></td>
                    <td className="px-6 py-4 text-sm text-primary-500">{formatRelative(payment.createdAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="p-12 text-center text-primary-500">No payments found</div>}
        </div>
      </main>
    </div>
  );
}
