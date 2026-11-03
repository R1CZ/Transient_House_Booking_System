import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../store';
import { LayoutDashboard, Calendar, Home, Users, CreditCard, BarChart3, Settings, LogOut, TrendingUp, TrendingDown, ArrowUpRight, BedDouble, CheckCircle, Clock, XCircle, DollarSign } from 'lucide-react';
import { formatCurrency, getStatusColor, getStatusLabel, formatDate } from '../utils/helpers';

export default function AdminDashboard() {
  const { currentUser, rooms, bookings, payments, users, logout, settings } = useStore();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/bookings', icon: Calendar, label: 'Bookings' },
    { path: '/admin/rooms', icon: Home, label: 'Rooms' },
    { path: '/admin/customers', icon: Users, label: 'Customers' },
    { path: '/admin/payments', icon: CreditCard, label: 'Payments' },
    { path: '/admin/reports', icon: BarChart3, label: 'Reports' },
    { path: '/admin/settings', icon: Settings, label: 'Settings' },
  ];

  // Stats
  const totalRevenue = payments.filter(p => p.status === 'successful').reduce((sum, p) => sum + p.amount, 0);
  const activeBookings = bookings.filter(b => ['confirmed', 'checked_in', 'awaiting_payment'].includes(b.status)).length;
  const availableRooms = rooms.filter(r => r.status === 'available').length;
  const todayCheckIns = bookings.filter(b => b.checkIn === new Date().toISOString().split('T')[0] && b.status === 'confirmed').length;
  const todayCheckOuts = bookings.filter(b => b.checkOut === new Date().toISOString().split('T')[0] && b.status === 'checked_in').length;
  const pendingPayments = payments.filter(p => p.status === 'pending').length;

  const recentBookings = [...bookings].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

  return (
    <div className="min-h-screen bg-primary-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-primary-100 fixed h-full flex flex-col z-30">
        <div className="p-6 border-b border-primary-100">
          <Link to="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent-600 flex items-center justify-center">
              <span className="text-white text-sm font-bold">S</span>
            </div>
            <div>
              <span className="font-serif text-lg font-semibold text-primary-800 block leading-tight">Serene Stays</span>
              <span className="text-xs text-primary-400">Admin Panel</span>
            </div>
          </Link>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(item => (
            <Link key={item.path} to={item.path} className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all ${location.pathname === item.path ? 'bg-accent-50 text-accent-700 font-medium' : 'text-primary-600 hover:bg-primary-50 hover:text-primary-800'}`}>
              <item.icon size={18} /> {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-primary-100">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-8 h-8 rounded-full bg-accent-100 flex items-center justify-center">
              <span className="text-xs font-medium text-accent-700">{currentUser?.firstName?.[0]}{currentUser?.lastName?.[0]}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-primary-800 truncate">{currentUser?.firstName} {currentUser?.lastName}</p>
              <p className="text-xs text-primary-400 truncate">{currentUser?.role.replace('_', ' ')}</p>
            </div>
          </div>
          <button onClick={() => { logout(); navigate('/'); }} className="flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg w-full transition-colors">
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        <div className="mb-8">
          <h1 className="font-serif text-3xl text-primary-800 mb-1">Dashboard</h1>
          <p className="text-primary-500">Welcome back, {currentUser?.firstName}. Here's what's happening today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Total Revenue', value: formatCurrency(totalRevenue), icon: DollarSign, change: '+12%', up: true, color: 'bg-emerald-50 text-emerald-600' },
            { label: 'Active Bookings', value: activeBookings, icon: Calendar, change: '+3', up: true, color: 'bg-blue-50 text-blue-600' },
            { label: 'Available Rooms', value: `${availableRooms}/${rooms.length}`, icon: BedDouble, change: '', up: true, color: 'bg-violet-50 text-violet-600' },
            { label: 'Pending Payments', value: pendingPayments, icon: Clock, change: '-2', up: false, color: 'bg-amber-50 text-amber-600' },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                  <stat.icon size={20} />
                </div>
                {stat.change && (
                  <span className={`flex items-center gap-1 text-xs font-medium ${stat.up ? 'text-emerald-600' : 'text-red-500'}`}>
                    {stat.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />} {stat.change}
                  </span>
                )}
              </div>
              <p className="text-2xl font-semibold text-primary-800">{stat.value}</p>
              <p className="text-sm text-primary-500">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Today's Activity & Room Status */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Today */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="font-medium text-primary-800 mb-4">Today's Activity</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <ArrowUpRight size={18} className="text-blue-600" />
                  <span className="text-sm text-blue-700">Check-ins</span>
                </div>
                <span className="text-lg font-semibold text-blue-700">{todayCheckIns}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <ArrowUpRight size={18} className="text-amber-600 rotate-90" />
                  <span className="text-sm text-amber-700">Check-outs</span>
                </div>
                <span className="text-lg font-semibold text-amber-700">{todayCheckOuts}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle size={18} className="text-emerald-600" />
                  <span className="text-sm text-emerald-700">New Bookings</span>
                </div>
                <span className="text-lg font-semibold text-emerald-700">{bookings.filter(b => b.createdAt.startsWith(new Date().toISOString().split('T')[0])).length}</span>
              </div>
            </div>
          </div>

          {/* Room Status */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="font-medium text-primary-800 mb-4">Room Status</h3>
            <div className="space-y-3">
              {[
                { status: 'available', label: 'Available', color: 'bg-emerald-500' },
                { status: 'reserved', label: 'Reserved', color: 'bg-amber-500' },
                { status: 'occupied', label: 'Occupied', color: 'bg-blue-500' },
                { status: 'maintenance', label: 'Maintenance', color: 'bg-red-500' },
              ].map(item => {
                const count = rooms.filter(r => r.status === item.status).length;
                const percent = rooms.length > 0 ? (count / rooms.length) * 100 : 0;
                return (
                  <div key={item.status}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-primary-600">{item.label}</span>
                      <span className="text-primary-800 font-medium">{count}</span>
                    </div>
                    <div className="h-2 bg-primary-100 rounded-full overflow-hidden">
                      <div className={`h-full ${item.color} rounded-full transition-all`} style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="font-medium text-primary-800 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Link to="/admin/bookings" className="flex items-center gap-3 p-3 rounded-lg hover:bg-primary-50 transition-colors">
                <Calendar size={18} className="text-accent-500" />
                <span className="text-sm text-primary-700">Manage Bookings</span>
              </Link>
              <Link to="/admin/rooms" className="flex items-center gap-3 p-3 rounded-lg hover:bg-primary-50 transition-colors">
                <Home size={18} className="text-accent-500" />
                <span className="text-sm text-primary-700">Manage Rooms</span>
              </Link>
              <Link to="/admin/customers" className="flex items-center gap-3 p-3 rounded-lg hover:bg-primary-50 transition-colors">
                <Users size={18} className="text-accent-500" />
                <span className="text-sm text-primary-700">View Customers</span>
              </Link>
              <Link to="/admin/reports" className="flex items-center gap-3 p-3 rounded-lg hover:bg-primary-50 transition-colors">
                <BarChart3 size={18} className="text-accent-500" />
                <span className="text-sm text-primary-700">Generate Reports</span>
              </Link>
              <Link to="/admin/settings" className="flex items-center gap-3 p-3 rounded-lg hover:bg-primary-50 transition-colors">
                <Settings size={18} className="text-accent-500" />
                <span className="text-sm text-primary-700">System Settings</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-primary-100 flex items-center justify-between">
            <h3 className="font-medium text-primary-800">Recent Bookings</h3>
            <Link to="/admin/bookings" className="text-sm text-accent-600 hover:text-accent-700">View All →</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-primary-100">
                  <th className="text-left text-xs font-medium text-primary-500 uppercase px-6 py-3">Reference</th>
                  <th className="text-left text-xs font-medium text-primary-500 uppercase px-6 py-3">Guest</th>
                  <th className="text-left text-xs font-medium text-primary-500 uppercase px-6 py-3">Room</th>
                  <th className="text-left text-xs font-medium text-primary-500 uppercase px-6 py-3">Dates</th>
                  <th className="text-left text-xs font-medium text-primary-500 uppercase px-6 py-3">Amount</th>
                  <th className="text-left text-xs font-medium text-primary-500 uppercase px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map(booking => {
                  const room = rooms.find(r => r.id === booking.roomId);
                  const customer = users.find(u => u.id === booking.customerId);
                  return (
                    <tr key={booking.id} className="border-b border-primary-50 hover:bg-primary-50/50">
                      <td className="px-6 py-4 text-sm font-mono text-primary-700">{booking.referenceCode}</td>
                      <td className="px-6 py-4 text-sm text-primary-800">{customer ? `${customer.firstName} ${customer.lastName}` : 'Unknown'}</td>
                      <td className="px-6 py-4 text-sm text-primary-600">{room?.name || 'Unknown'}</td>
                      <td className="px-6 py-4 text-sm text-primary-500">{formatDate(booking.checkIn, 'MMM dd')} - {formatDate(booking.checkOut, 'MMM dd')}</td>
                      <td className="px-6 py-4 text-sm font-medium text-primary-800">{formatCurrency(booking.totalAmount)}</td>
                      <td className="px-6 py-4"><span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(booking.status)}`}>{getStatusLabel(booking.status)}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
