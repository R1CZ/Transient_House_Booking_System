import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../store';
import { LayoutDashboard, Calendar, Home, Users, CreditCard, BarChart3, Settings, LogOut, Download, TrendingUp } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/helpers';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

export default function AdminReports() {
  const { bookings, payments, rooms, users, logout } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [dateRange, setDateRange] = useState('month');

  const navItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/bookings', icon: Calendar, label: 'Bookings' },
    { path: '/admin/rooms', icon: Home, label: 'Rooms' },
    { path: '/admin/customers', icon: Users, label: 'Customers' },
    { path: '/admin/payments', icon: CreditCard, label: 'Payments' },
    { path: '/admin/reports', icon: BarChart3, label: 'Reports' },
    { path: '/admin/settings', icon: Settings, label: 'Settings' },
  ];

  // Revenue data
  const totalRevenue = payments.filter(p => p.status === 'successful').reduce((s, p) => s + p.amount, 0);
  const totalBookings = bookings.length;
  const avgBookingValue = totalBookings > 0 ? totalRevenue / bookings.filter(b => b.status === 'confirmed' || b.status === 'checked_out').length : 0;
  const occupancyRate = rooms.length > 0 ? Math.round((rooms.filter(r => r.status === 'occupied' || r.status === 'reserved').length / rooms.length) * 100) : 0;

  // Chart data
  const monthlyData = [
    { name: 'Jan', bookings: 12, revenue: 45000 },
    { name: 'Feb', bookings: 18, revenue: 72000 },
    { name: 'Mar', bookings: 15, revenue: 58000 },
    { name: 'Apr', bookings: 22, revenue: 89000 },
    { name: 'May', bookings: 28, revenue: 112000 },
    { name: 'Jun', bookings: 35, revenue: 140000 },
    { name: 'Jul', bookings: 42, revenue: 168000 },
    { name: 'Aug', bookings: 38, revenue: 152000 },
    { name: 'Sep', bookings: 25, revenue: 100000 },
    { name: 'Oct', bookings: 20, revenue: 80000 },
    { name: 'Nov', bookings: bookings.length, revenue: totalRevenue },
    { name: 'Dec', bookings: 0, revenue: 0 },
  ];

  const roomTypeData = [
    { name: 'Standard', value: rooms.filter(r => r.type === 'Standard').length, color: '#94a3b8' },
    { name: 'Deluxe', value: rooms.filter(r => r.type === 'Deluxe').length, color: '#7dd3fc' },
    { name: 'Suite', value: rooms.filter(r => r.type === 'Suite').length, color: '#c4b5fd' },
    { name: 'Penthouse', value: rooms.filter(r => r.type === 'Penthouse').length, color: '#fbbf24' },
    { name: 'Family', value: rooms.filter(r => r.type === 'Family').length, color: '#fca5a5' },
  ].filter(d => d.value > 0);

  const bookingStatusData = [
    { name: 'Confirmed', value: bookings.filter(b => b.status === 'confirmed').length, color: '#10b981' },
    { name: 'Pending', value: bookings.filter(b => b.status === 'pending' || b.status === 'awaiting_payment').length, color: '#f59e0b' },
    { name: 'Checked In', value: bookings.filter(b => b.status === 'checked_in').length, color: '#3b82f6' },
    { name: 'Completed', value: bookings.filter(b => b.status === 'checked_out').length, color: '#6b7280' },
    { name: 'Cancelled', value: bookings.filter(b => b.status === 'cancelled').length, color: '#ef4444' },
  ].filter(d => d.value > 0);

  const exportCSV = () => {
    const headers = 'Reference,Guest,Room,Check-in,Check-out,Amount,Status\n';
    const rows = bookings.map(b => {
      const customer = users.find(u => u.id === b.customerId);
      const room = rooms.find(r => r.id === b.roomId);
      return `${b.referenceCode},${customer?.firstName || ''} ${customer?.lastName || ''},${room?.name || ''},${b.checkIn},${b.checkOut},${b.totalAmount},${b.status}`;
    }).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bookings-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-3xl text-primary-800 mb-1">Reports & Analytics</h1>
            <p className="text-primary-500">Business performance insights</p>
          </div>
          <button onClick={exportCSV} className="btn-secondary flex items-center gap-2"><Download size={16} /> Export CSV</button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Revenue', value: formatCurrency(totalRevenue), icon: TrendingUp, color: 'text-emerald-600 bg-emerald-50' },
            { label: 'Total Bookings', value: totalBookings, icon: Calendar, color: 'text-blue-600 bg-blue-50' },
            { label: 'Avg. Booking Value', value: formatCurrency(avgBookingValue), icon: CreditCard, color: 'text-violet-600 bg-violet-50' },
            { label: 'Occupancy Rate', value: `${occupancyRate}%`, icon: Home, color: 'text-amber-600 bg-amber-50' },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-xl p-5 shadow-sm">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${stat.color}`}><stat.icon size={20} /></div>
              <p className="text-xl font-semibold text-primary-800">{stat.value}</p>
              <p className="text-xs text-primary-500">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="font-medium text-primary-800 mb-4">Monthly Revenue</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0ede6" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#9a8b6e" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#9a8b6e" />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2ddd2' }} />
                  <Bar dataKey="revenue" fill="#5a877b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="font-medium text-primary-800 mb-4">Monthly Bookings</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0ede6" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#9a8b6e" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#9a8b6e" />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2ddd2' }} />
                  <Line type="monotone" dataKey="bookings" stroke="#5a877b" strokeWidth={2} dot={{ fill: '#5a877b' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="font-medium text-primary-800 mb-4">Room Types Distribution</h3>
            <div className="h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={roomTypeData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {roomTypeData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="font-medium text-primary-800 mb-4">Booking Status</h3>
            <div className="h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={bookingStatusData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {bookingStatusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
