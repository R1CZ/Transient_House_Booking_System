import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../store';
import { LayoutDashboard, Calendar, Home, Users, CreditCard, BarChart3, Settings, LogOut, Save, Check } from 'lucide-react';

export default function AdminSettings() {
  const { settings, updateSettings, logout } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({ ...settings });

  const navItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/bookings', icon: Calendar, label: 'Bookings' },
    { path: '/admin/rooms', icon: Home, label: 'Rooms' },
    { path: '/admin/customers', icon: Users, label: 'Customers' },
    { path: '/admin/payments', icon: CreditCard, label: 'Payments' },
    { path: '/admin/reports', icon: BarChart3, label: 'Reports' },
    { path: '/admin/settings', icon: Settings, label: 'Settings' },
  ];

  const handleSave = () => {
    updateSettings(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
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
            <h1 className="font-serif text-3xl text-primary-800 mb-1">System Settings</h1>
            <p className="text-primary-500">Configure property and booking policies</p>
          </div>
          <button onClick={handleSave} className="btn-primary flex items-center gap-2">
            {saved ? <><Check size={16} /> Saved!</> : <><Save size={16} /> Save Changes</>}
          </button>
        </div>

        {saved && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6 text-sm text-emerald-600 flex items-center gap-2 animate-fade-in">
            <Check size={16} /> Settings saved successfully
          </div>
        )}

        <div className="space-y-6">
          {/* Property Info */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="font-medium text-primary-800 mb-4 pb-3 border-b border-primary-100">Property Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-primary-500 uppercase tracking-wider mb-1 block">Property Name</label>
                <input type="text" value={form.propertyName} onChange={e => setForm({...form, propertyName: e.target.value})} className="w-full px-4 py-2.5 text-sm border border-primary-200 rounded-lg" />
              </div>
              <div>
                <label className="text-xs font-medium text-primary-500 uppercase tracking-wider mb-1 block">Email</label>
                <input type="email" value={form.propertyEmail} onChange={e => setForm({...form, propertyEmail: e.target.value})} className="w-full px-4 py-2.5 text-sm border border-primary-200 rounded-lg" />
              </div>
              <div>
                <label className="text-xs font-medium text-primary-500 uppercase tracking-wider mb-1 block">Phone</label>
                <input type="tel" value={form.propertyPhone} onChange={e => setForm({...form, propertyPhone: e.target.value})} className="w-full px-4 py-2.5 text-sm border border-primary-200 rounded-lg" />
              </div>
              <div>
                <label className="text-xs font-medium text-primary-500 uppercase tracking-wider mb-1 block">Address</label>
                <input type="text" value={form.propertyAddress} onChange={e => setForm({...form, propertyAddress: e.target.value})} className="w-full px-4 py-2.5 text-sm border border-primary-200 rounded-lg" />
              </div>
            </div>
          </div>

          {/* Booking Policies */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="font-medium text-primary-800 mb-4 pb-3 border-b border-primary-100">Booking Policies</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-medium text-primary-500 uppercase tracking-wider mb-1 block">Check-in Time</label>
                <input type="time" value={form.checkInTime} onChange={e => setForm({...form, checkInTime: e.target.value})} className="w-full px-4 py-2.5 text-sm border border-primary-200 rounded-lg" />
              </div>
              <div>
                <label className="text-xs font-medium text-primary-500 uppercase tracking-wider mb-1 block">Check-out Time</label>
                <input type="time" value={form.checkOutTime} onChange={e => setForm({...form, checkOutTime: e.target.value})} className="w-full px-4 py-2.5 text-sm border border-primary-200 rounded-lg" />
              </div>
              <div>
                <label className="text-xs font-medium text-primary-500 uppercase tracking-wider mb-1 block">Max Guests/Room</label>
                <input type="number" value={form.maxGuestsPerRoom} onChange={e => setForm({...form, maxGuestsPerRoom: Number(e.target.value)})} className="w-full px-4 py-2.5 text-sm border border-primary-200 rounded-lg" />
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="font-medium text-primary-800 mb-4 pb-3 border-b border-primary-100">Pricing & Fees</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-medium text-primary-500 uppercase tracking-wider mb-1 block">Currency</label>
                <select value={form.currency} onChange={e => setForm({...form, currency: e.target.value})} className="w-full px-4 py-2.5 text-sm border border-primary-200 rounded-lg">
                  <option value="PHP">PHP (₱)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-primary-500 uppercase tracking-wider mb-1 block">Tax Rate (%)</label>
                <input type="number" value={form.taxRate} onChange={e => setForm({...form, taxRate: Number(e.target.value)})} className="w-full px-4 py-2.5 text-sm border border-primary-200 rounded-lg" />
              </div>
              <div>
                <label className="text-xs font-medium text-primary-500 uppercase tracking-wider mb-1 block">Deposit (%)</label>
                <input type="number" value={form.depositPercent} onChange={e => setForm({...form, depositPercent: Number(e.target.value)})} className="w-full px-4 py-2.5 text-sm border border-primary-200 rounded-lg" />
              </div>
              <div>
                <label className="text-xs font-medium text-primary-500 uppercase tracking-wider mb-1 block">Additional Guest Rate</label>
                <input type="number" value={form.additionalGuestRate} onChange={e => setForm({...form, additionalGuestRate: Number(e.target.value)})} className="w-full px-4 py-2.5 text-sm border border-primary-200 rounded-lg" />
              </div>
            </div>
          </div>

          {/* Cancellation */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="font-medium text-primary-800 mb-4 pb-3 border-b border-primary-100">Cancellation Policy</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-primary-500 uppercase tracking-wider mb-1 block">Free Cancellation (days before)</label>
                <input type="number" value={form.cancellationDays} onChange={e => setForm({...form, cancellationDays: Number(e.target.value)})} className="w-full px-4 py-2.5 text-sm border border-primary-200 rounded-lg" />
              </div>
              <div>
                <label className="text-xs font-medium text-primary-500 uppercase tracking-wider mb-1 block">Cancellation Fee (%)</label>
                <input type="number" value={form.cancellationFeePercent} onChange={e => setForm({...form, cancellationFeePercent: Number(e.target.value)})} className="w-full px-4 py-2.5 text-sm border border-primary-200 rounded-lg" />
              </div>
            </div>
          </div>

          {/* Integration Status */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="font-medium text-primary-800 mb-4 pb-3 border-b border-primary-100">Integration Status</h3>
            <div className="space-y-3">
              {[
                { name: 'Payment Gateway (PayMongo)', status: 'sandbox', desc: 'Configure PAYMONGO_SECRET_KEY in .env' },
                { name: 'Email Service (SMTP)', status: 'not_configured', desc: 'Configure SMTP settings in .env' },
                { name: 'Cloudflare Turnstile', status: 'not_configured', desc: 'Configure TURNSTILE_SECRET_KEY in .env' },
                { name: 'SMS Notifications', status: 'not_configured', desc: 'Optional - configure SMS provider in .env' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-primary-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-primary-800">{item.name}</p>
                    <p className="text-xs text-primary-500">{item.desc}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${item.status === 'sandbox' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'}`}>
                    {item.status === 'sandbox' ? 'Sandbox' : 'Not Configured'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
