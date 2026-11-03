import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { Search, Calendar, Users, MapPin, Star, Shield, Wifi, Waves, ChevronRight, Menu, X, LogOut, User } from 'lucide-react';

export default function Landing() {
  const [mobileMenu, setMobileMenu] = useState(false);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(2);
  const { isAuthenticated, currentUser, logout } = useStore();
  const navigate = useNavigate();

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (checkIn) params.set('checkIn', checkIn);
    if (checkOut) params.set('checkOut', checkOut);
    if (guests) params.set('guests', guests.toString());
    navigate(`/rooms?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-primary-50">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent-600 flex items-center justify-center">
              <span className="text-white text-sm font-bold">S</span>
            </div>
            <span className="font-serif text-xl font-semibold text-primary-800">Serene Stays</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-8">
            <Link to="/rooms" className="text-sm text-primary-600 hover:text-accent-600 transition-colors">Rooms</Link>
            <a href="#amenities" className="text-sm text-primary-600 hover:text-accent-600 transition-colors">Amenities</a>
            <a href="#about" className="text-sm text-primary-600 hover:text-accent-600 transition-colors">About</a>
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <Link to={currentUser?.role === 'super_admin' || currentUser?.role === 'admin' ? '/admin' : '/dashboard'} className="text-sm text-accent-600 font-medium hover:text-accent-700 transition-colors flex items-center gap-1">
                  <User size={16} /> Dashboard
                </Link>
                <button onClick={logout} className="text-sm text-primary-500 hover:text-red-500 transition-colors flex items-center gap-1">
                  <LogOut size={16} /> Logout
                </button>
              </div>
            ) : (
              <Link to="/auth" className="btn-primary text-sm">Sign In</Link>
            )}
          </div>

          <button className="md:hidden" onClick={() => setMobileMenu(!mobileMenu)}>
            {mobileMenu ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenu && (
          <div className="md:hidden bg-white border-t border-primary-100 px-6 py-4 animate-fade-in">
            <div className="flex flex-col gap-4">
              <Link to="/rooms" className="text-primary-600" onClick={() => setMobileMenu(false)}>Rooms</Link>
              <a href="#amenities" className="text-primary-600" onClick={() => setMobileMenu(false)}>Amenities</a>
              <a href="#about" className="text-primary-600" onClick={() => setMobileMenu(false)}>About</a>
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard" className="text-accent-600 font-medium" onClick={() => setMobileMenu(false)}>Dashboard</Link>
                  <button onClick={() => { logout(); setMobileMenu(false); }} className="text-left text-red-500">Logout</button>
                </>
              ) : (
                <Link to="/auth" className="btn-primary text-center text-sm" onClick={() => setMobileMenu(false)}>Sign In</Link>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20">
        <div className="absolute inset-0 overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600&q=80" 
            alt="Serene Stays" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary-900/70 via-primary-900/40 to-transparent"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-6 py-20 w-full">
          <div className="max-w-2xl">
            <p className="text-accent-300 text-sm font-medium tracking-wider uppercase mb-4 animate-fade-in-up">Welcome to Serene Stays</p>
            <h1 className="font-serif text-5xl md:text-7xl text-white font-semibold leading-tight mb-6 animate-fade-in-up stagger-1">
              Your Peaceful<br />Escape Awaits
            </h1>
            <p className="text-lg text-white/80 mb-10 max-w-lg animate-fade-in-up stagger-2">
              Discover tranquil comfort in our carefully curated rooms. Where modern luxury meets natural serenity.
            </p>
            
            {/* Search Bar */}
            <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-6 shadow-2xl animate-fade-in-up stagger-3">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-primary-500 uppercase tracking-wider">Check In</label>
                  <input 
                    type="date" 
                    value={checkIn} 
                    onChange={e => setCheckIn(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full border-0 border-b border-primary-200 pb-2 text-sm text-primary-800 bg-transparent focus:border-accent-500 focus:ring-0"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-primary-500 uppercase tracking-wider">Check Out</label>
                  <input 
                    type="date" 
                    value={checkOut} 
                    onChange={e => setCheckOut(e.target.value)}
                    min={checkIn || new Date().toISOString().split('T')[0]}
                    className="w-full border-0 border-b border-primary-200 pb-2 text-sm text-primary-800 bg-transparent focus:border-accent-500 focus:ring-0"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-primary-500 uppercase tracking-wider">Guests</label>
                  <select 
                    value={guests} 
                    onChange={e => setGuests(Number(e.target.value))}
                    className="w-full border-0 border-b border-primary-200 pb-2 text-sm text-primary-800 bg-transparent focus:border-accent-500 focus:ring-0"
                  >
                    {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} Guest{n > 1 ? 's' : ''}</option>)}
                  </select>
                </div>
                <div className="flex items-end">
                  <button onClick={handleSearch} className="btn-primary w-full flex items-center justify-center gap-2">
                    <Search size={18} /> Search
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '6+', label: 'Premium Rooms' },
              { value: '4.9', label: 'Guest Rating' },
              { value: '500+', label: 'Happy Guests' },
              { value: '24/7', label: 'Support' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="font-serif text-3xl md:text-4xl font-semibold text-accent-600 mb-1">{stat.value}</div>
                <div className="text-sm text-primary-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Rooms */}
      <section className="py-20 bg-primary-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-accent-500 text-sm font-medium tracking-wider uppercase mb-3">Our Rooms</p>
            <h2 className="font-serif text-4xl md:text-5xl text-primary-800 font-semibold">Curated Comfort</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'Ocean Breeze Suite', type: 'Suite', price: 4500, img: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=600' },
              { name: 'Sunset Penthouse', type: 'Penthouse', price: 8500, img: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600' },
              { name: 'Garden View Deluxe', type: 'Deluxe', price: 3200, img: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600' },
            ].map((room, i) => (
              <Link to="/rooms" key={i} className="group card-hover">
                <div className="relative overflow-hidden rounded-2xl aspect-[4/3] mb-4">
                  <img src={room.img} alt={room.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-4 left-4">
                    <span className="bg-white/90 backdrop-blur-sm text-xs font-medium px-3 py-1 rounded-full text-primary-700">{room.type}</span>
                  </div>
                </div>
                <h3 className="font-serif text-xl text-primary-800 mb-1">{room.name}</h3>
                <p className="text-primary-500 text-sm">From <span className="text-accent-600 font-semibold">₱{room.price.toLocaleString()}</span> / night</p>
              </Link>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link to="/rooms" className="btn-secondary inline-flex items-center gap-2">
              View All Rooms <ChevronRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Amenities */}
      <section id="amenities" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-accent-500 text-sm font-medium tracking-wider uppercase mb-3">Amenities</p>
            <h2 className="font-serif text-4xl md:text-5xl text-primary-800 font-semibold">Everything You Need</h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Wifi, label: 'High-Speed WiFi' },
              { icon: Waves, label: 'Swimming Pool' },
              { icon: Shield, label: '24/7 Security' },
              { icon: MapPin, label: 'Prime Location' },
              { icon: Star, label: 'Room Service' },
              { icon: Calendar, label: 'Flexible Booking' },
              { icon: Users, label: 'Family Friendly' },
              { icon: Search, label: 'Concierge' },
            ].map((item, i) => (
              <div key={i} className="text-center p-6 rounded-xl bg-primary-50 hover:bg-accent-50 transition-colors">
                <item.icon className="mx-auto mb-3 text-accent-500" size={28} />
                <p className="text-sm font-medium text-primary-700">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-20 bg-primary-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-accent-500 text-sm font-medium tracking-wider uppercase mb-3">About Us</p>
              <h2 className="font-serif text-4xl text-primary-800 font-semibold mb-6">A Haven of Tranquility</h2>
              <p className="text-primary-600 leading-relaxed mb-4">
                Nestled along the pristine coastline, Serene Stays offers an unparalleled blend of modern comfort and natural beauty. Our transient house is designed for travelers who seek peace without compromising on luxury.
              </p>
              <p className="text-primary-600 leading-relaxed mb-6">
                Each room is thoughtfully appointed with premium amenities, and our dedicated staff ensures every moment of your stay is exceptional.
              </p>
              <Link to="/rooms" className="btn-primary inline-flex items-center gap-2">
                Explore Our Rooms <ChevronRight size={18} />
              </Link>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&q=80" 
                alt="About" 
                className="rounded-2xl shadow-xl"
              />
              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl p-4 shadow-lg">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {[1,2,3].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full bg-accent-200 border-2 border-white"></div>
                    ))}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-primary-800">500+ Guests</p>
                    <p className="text-xs text-primary-500">trusted our hospitality</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-accent-500 flex items-center justify-center">
                  <span className="text-white text-sm font-bold">S</span>
                </div>
                <span className="font-serif text-xl font-semibold">Serene Stays</span>
              </div>
              <p className="text-primary-300 text-sm leading-relaxed">Your peaceful escape in paradise. Modern comfort meets natural serenity.</p>
            </div>
            <div>
              <h4 className="font-medium mb-4">Quick Links</h4>
              <div className="space-y-2">
                <Link to="/rooms" className="block text-sm text-primary-300 hover:text-white transition-colors">Rooms</Link>
                <a href="#amenities" className="block text-sm text-primary-300 hover:text-white transition-colors">Amenities</a>
                <a href="#about" className="block text-sm text-primary-300 hover:text-white transition-colors">About</a>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-4">Contact</h4>
              <div className="space-y-2 text-sm text-primary-300">
                <p>123 Coastal Road, Boracay</p>
                <p>+63 917 123 4567</p>
                <p>reservations@serenestays.ph</p>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-4">Check-in/out</h4>
              <div className="space-y-2 text-sm text-primary-300">
                <p>Check-in: 2:00 PM</p>
                <p>Check-out: 12:00 PM</p>
              </div>
            </div>
          </div>
          <div className="border-t border-primary-700 mt-10 pt-6 text-center text-sm text-primary-400">
            © {new Date().getFullYear()} Serene Stays. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
