import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../store';
import { LayoutDashboard, Calendar, Home, Users, CreditCard, BarChart3, Settings, LogOut, Plus, Edit2, Trash2, X, Save } from 'lucide-react';
import { formatCurrency, getStatusColor, getStatusLabel } from '../utils/helpers';
import { Room } from '../types';

export default function AdminRooms() {
  const { currentUser, rooms, addRoom, updateRoom, deleteRoom, logout } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [showForm, setShowForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [form, setForm] = useState({ name: '', number: '', type: 'Standard', description: '', capacity: 2, beds: 1, ratePerNight: 0, size: 25, floor: 1, amenities: '' });

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
    if (editingRoom) {
      updateRoom(editingRoom.id, { ...form, amenities: form.amenities.split(',').map(a => a.trim()).filter(Boolean) });
    } else {
      addRoom({ ...form, amenities: form.amenities.split(',').map(a => a.trim()).filter(Boolean), images: ['https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800'] });
    }
    setShowForm(false);
    setEditingRoom(null);
    setForm({ name: '', number: '', type: 'Standard', description: '', capacity: 2, beds: 1, ratePerNight: 0, size: 25, floor: 1, amenities: '' });
  };

  const handleEdit = (room: Room) => {
    setEditingRoom(room);
    setForm({ name: room.name, number: room.number, type: room.type, description: room.description, capacity: room.capacity, beds: room.beds, ratePerNight: room.ratePerNight, size: room.size, floor: room.floor, amenities: room.amenities.join(', ') });
    setShowForm(true);
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
            <h1 className="font-serif text-3xl text-primary-800 mb-1">Room Management</h1>
            <p className="text-primary-500">{rooms.length} rooms total</p>
          </div>
          <button onClick={() => { setShowForm(true); setEditingRoom(null); setForm({ name: '', number: '', type: 'Standard', description: '', capacity: 2, beds: 1, ratePerNight: 0, size: 25, floor: 1, amenities: '' }); }} className="btn-primary flex items-center gap-2"><Plus size={18} /> Add Room</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map(room => (
            <div key={room.id} className="bg-white rounded-xl overflow-hidden shadow-sm">
              <div className="aspect-[16/10] overflow-hidden">
                <img src={room.images[0] || 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400'} alt={room.name} className="w-full h-full object-cover" />
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-primary-800">{room.name}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(room.status)}`}>{getStatusLabel(room.status)}</span>
                </div>
                <p className="text-xs text-primary-500 mb-3">Room #{room.number} · {room.type} · {room.capacity} guests · {room.beds} bed{room.beds > 1 ? 's' : ''}</p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-accent-600">{formatCurrency(room.ratePerNight)}<span className="text-xs text-primary-400 font-normal">/night</span></span>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(room)} className="p-2 text-primary-500 hover:text-accent-600 hover:bg-accent-50 rounded-lg transition-colors"><Edit2 size={16} /></button>
                    <button onClick={() => { if (confirm('Delete this room?')) deleteRoom(room.id); }} className="p-2 text-primary-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                  </div>
                </div>
                {/* Status toggle */}
                <div className="mt-3 pt-3 border-t border-primary-100">
                  <select value={room.status} onChange={e => updateRoom(room.id, { status: e.target.value as any })} className="text-xs border border-primary-200 rounded px-2 py-1 w-full">
                    <option value="available">Available</option>
                    <option value="reserved">Reserved</option>
                    <option value="occupied">Occupied</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="unavailable">Unavailable</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto animate-fade-in-up">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-serif text-xl text-primary-800">{editingRoom ? 'Edit Room' : 'Add New Room'}</h3>
              <button onClick={() => setShowForm(false)} className="text-primary-400 hover:text-primary-600"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-primary-500 uppercase mb-1 block">Room Name</label>
                  <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-3 py-2 text-sm border border-primary-200 rounded-lg" />
                </div>
                <div>
                  <label className="text-xs font-medium text-primary-500 uppercase mb-1 block">Room Number</label>
                  <input type="text" value={form.number} onChange={e => setForm({...form, number: e.target.value})} className="w-full px-3 py-2 text-sm border border-primary-200 rounded-lg" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-medium text-primary-500 uppercase mb-1 block">Type</label>
                  <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="w-full px-3 py-2 text-sm border border-primary-200 rounded-lg">
                    <option>Standard</option><option>Deluxe</option><option>Suite</option><option>Penthouse</option><option>Family</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-primary-500 uppercase mb-1 block">Capacity</label>
                  <input type="number" value={form.capacity} onChange={e => setForm({...form, capacity: Number(e.target.value)})} className="w-full px-3 py-2 text-sm border border-primary-200 rounded-lg" />
                </div>
                <div>
                  <label className="text-xs font-medium text-primary-500 uppercase mb-1 block">Beds</label>
                  <input type="number" value={form.beds} onChange={e => setForm({...form, beds: Number(e.target.value)})} className="w-full px-3 py-2 text-sm border border-primary-200 rounded-lg" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-medium text-primary-500 uppercase mb-1 block">Rate/Night (₱)</label>
                  <input type="number" value={form.ratePerNight} onChange={e => setForm({...form, ratePerNight: Number(e.target.value)})} className="w-full px-3 py-2 text-sm border border-primary-200 rounded-lg" />
                </div>
                <div>
                  <label className="text-xs font-medium text-primary-500 uppercase mb-1 block">Size (m²)</label>
                  <input type="number" value={form.size} onChange={e => setForm({...form, size: Number(e.target.value)})} className="w-full px-3 py-2 text-sm border border-primary-200 rounded-lg" />
                </div>
                <div>
                  <label className="text-xs font-medium text-primary-500 uppercase mb-1 block">Floor</label>
                  <input type="number" value={form.floor} onChange={e => setForm({...form, floor: Number(e.target.value)})} className="w-full px-3 py-2 text-sm border border-primary-200 rounded-lg" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-primary-500 uppercase mb-1 block">Description</label>
                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full px-3 py-2 text-sm border border-primary-200 rounded-lg resize-none h-20" />
              </div>
              <div>
                <label className="text-xs font-medium text-primary-500 uppercase mb-1 block">Amenities (comma-separated)</label>
                <input type="text" value={form.amenities} onChange={e => setForm({...form, amenities: e.target.value})} placeholder="WiFi, Air Conditioning, TV..." className="w-full px-3 py-2 text-sm border border-primary-200 rounded-lg" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleSave} className="btn-primary flex-1 flex items-center justify-center gap-2"><Save size={16} /> {editingRoom ? 'Update' : 'Create'} Room</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
