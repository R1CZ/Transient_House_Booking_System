import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../store';
import { LayoutDashboard, Calendar, Home, Users, CreditCard, BarChart3, Settings, LogOut, Search, Eye, X, UserCheck, UserX } from 'lucide-react';
import { formatDate, formatCurrency } from '../utils/helpers';

export default function AdminCustomers() {
  const { users, bookings, payments, updateProfile, logout } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);

  const navItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/bookings', icon: Calendar, label: 'Bookings' },
    { path: '/admin/rooms', icon: Home, label: 'Rooms' },
    { path: '/admin/customers', icon: Users, label: 'Customers' },
    { path: '/admin/payments', icon: CreditCard, label: 'Payments' },
    { path: '/admin/reports', icon: BarChart3, label: 'Reports' },
    { path: '/admin/settings', icon: Settings, label: 'Settings' },
  ];

  const customers = users.filter(u => u.role === 'booking_staff' || (!['super_admin', 'admin', 'manager'].includes(u.role)));
  const filtered = customers.filter(c => {
    if (!search) return true;
    const q = search.toLowerCase();
    return `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) || c.email.toLowerCase().includes(q);
  });

  const selected = users.find(u => u.id === selectedCustomer);
  const customerBookings = selected ? bookings.filter(b => b.customerId === selected.id) : [];
  const customerPayments = selected ? payments.filter(p => p.customerId === selected.id) : [];
  const totalSpent = customerPayments.filter(p => p.status === 'successful').reduce((sum, p) => sum + p.amount, 0);

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
          <h1 className="font-serif text-3xl text-primary-800 mb-1">Customers</h1>
          <p className="text-primary-500">{filtered.length} registered customers</p>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-400" />
            <input type="text" placeholder="Search customers..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 text-sm border border-primary-200 rounded-lg" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-primary-100">
                <th className="text-left text-xs font-medium text-primary-500 uppercase px-6 py-3">Customer</th>
                <th className="text-left text-xs font-medium text-primary-500 uppercase px-6 py-3">Email</th>
                <th className="text-left text-xs font-medium text-primary-500 uppercase px-6 py-3">Phone</th>
                <th className="text-left text-xs font-medium text-primary-500 uppercase px-6 py-3">Bookings</th>
                <th className="text-left text-xs font-medium text-primary-500 uppercase px-6 py-3">Status</th>
                <th className="text-left text-xs font-medium text-primary-500 uppercase px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(customer => {
                const bookingCount = bookings.filter(b => b.customerId === customer.id).length;
                return (
                  <tr key={customer.id} className="border-b border-primary-50 hover:bg-primary-50/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-accent-100 flex items-center justify-center">
                          <span className="text-xs font-medium text-accent-700">{customer.firstName[0]}{customer.lastName[0]}</span>
                        </div>
                        <span className="text-sm font-medium text-primary-800">{customer.firstName} {customer.lastName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-primary-600">{customer.email}</td>
                    <td className="px-6 py-4 text-sm text-primary-600">{customer.phone}</td>
                    <td className="px-6 py-4 text-sm text-primary-800 font-medium">{bookingCount}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${customer.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {customer.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button onClick={() => setSelectedCustomer(customer.id)} className="text-accent-600 hover:text-accent-700"><Eye size={16} /></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="p-12 text-center text-primary-500">No customers found</div>}
        </div>
      </main>

      {/* Customer Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto animate-fade-in-up">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-serif text-xl text-primary-800">Customer Details</h3>
              <button onClick={() => setSelectedCustomer(null)} className="text-primary-400 hover:text-primary-600"><X size={20} /></button>
            </div>
            <div className="flex items-center gap-4 mb-6 p-4 bg-primary-50 rounded-xl">
              <div className="w-14 h-14 rounded-full bg-accent-200 flex items-center justify-center">
                <span className="text-lg font-medium text-accent-700">{selected.firstName[0]}{selected.lastName[0]}</span>
              </div>
              <div>
                <h4 className="font-medium text-primary-800">{selected.firstName} {selected.lastName}</h4>
                <p className="text-sm text-primary-500">{selected.email}</p>
                <p className="text-sm text-primary-500">{selected.phone}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-3 bg-primary-50 rounded-lg">
                <p className="text-lg font-semibold text-primary-800">{customerBookings.length}</p>
                <p className="text-xs text-primary-500">Bookings</p>
              </div>
              <div className="text-center p-3 bg-primary-50 rounded-lg">
                <p className="text-lg font-semibold text-accent-600">{formatCurrency(totalSpent)}</p>
                <p className="text-xs text-primary-500">Total Spent</p>
              </div>
              <div className="text-center p-3 bg-primary-50 rounded-lg">
                <p className="text-lg font-semibold text-primary-800">{formatDate(selected.createdAt, 'MMM yyyy')}</p>
                <p className="text-xs text-primary-500">Member Since</p>
              </div>
            </div>
            {customerBookings.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-primary-700 mb-2">Recent Bookings</h4>
                <div className="space-y-2">
                  {customerBookings.slice(0, 5).map(b => (
                    <div key={b.id} className="flex justify-between items-center p-2 bg-primary-50 rounded-lg text-sm">
                      <span className="font-mono text-xs text-primary-600">{b.referenceCode}</span>
                      <span className="text-primary-800">{formatCurrency(b.totalAmount)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="mt-6 pt-4 border-t border-primary-100 flex gap-2">
              <button onClick={() => { updateProfile({ isActive: !selected.isActive }); setSelectedCustomer(null); }} className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm ${selected.isActive ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}>
                {selected.isActive ? <><UserX size={14} /> Deactivate</> : <><UserCheck size={14} /> Activate</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
