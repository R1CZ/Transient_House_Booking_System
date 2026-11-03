import { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useStore } from '../store';
import { Search, SlidersHorizontal, Users, Maximize, BedDouble, ArrowLeft, X, Check } from 'lucide-react';
import { formatCurrency, getRoomTypeColor } from '../utils/helpers';

export default function Rooms() {
  const [searchParams] = useSearchParams();
  const { rooms, getAvailableRooms, checkAvailability } = useStore();
  const [checkIn, setCheckIn] = useState(searchParams.get('checkIn') || '');
  const [checkOut, setCheckOut] = useState(searchParams.get('checkOut') || '');
  const [guests, setGuests] = useState(Number(searchParams.get('guests')) || 2);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [sortBy, setSortBy] = useState('name');
  const [showFilters, setShowFilters] = useState(false);

  const filteredRooms = useMemo(() => {
    let result = rooms.filter(r => r.status !== 'unavailable');
    
    if (checkIn && checkOut) {
      result = getAvailableRooms(checkIn, checkOut, guests);
    }
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(r => r.name.toLowerCase().includes(q) || r.type.toLowerCase().includes(q) || r.description.toLowerCase().includes(q));
    }
    
    if (typeFilter) {
      result = result.filter(r => r.type === typeFilter);
    }
    
    result = result.filter(r => r.ratePerNight >= priceRange[0] && r.ratePerNight <= priceRange[1]);
    
    if (sortBy === 'price_asc') result.sort((a, b) => a.ratePerNight - b.ratePerNight);
    else if (sortBy === 'price_desc') result.sort((a, b) => b.ratePerNight - a.ratePerNight);
    else if (sortBy === 'capacity') result.sort((a, b) => b.capacity - a.capacity);
    else result.sort((a, b) => a.name.localeCompare(b.name));
    
    return result;
  }, [rooms, checkIn, checkOut, guests, searchQuery, typeFilter, priceRange, sortBy, getAvailableRooms]);

  const roomTypes = [...new Set(rooms.map(r => r.type))];

  return (
    <div className="min-h-screen bg-primary-50">
      {/* Header */}
      <div className="bg-white border-b border-primary-100">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Link to="/" className="text-primary-500 hover:text-accent-600 transition-colors">
                <ArrowLeft size={20} />
              </Link>
              <div>
                <h1 className="font-serif text-3xl text-primary-800">Our Rooms</h1>
                <p className="text-sm text-primary-500 mt-1">{filteredRooms.length} rooms available</p>
              </div>
            </div>
            <button onClick={() => setShowFilters(!showFilters)} className="md:hidden btn-secondary flex items-center gap-2 text-sm">
              <SlidersHorizontal size={16} /> Filters
            </button>
          </div>

          {/* Search & Filters */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-400" />
              <input 
                type="text" 
                placeholder="Search rooms..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-primary-200 rounded-lg bg-primary-50 focus:bg-white"
              />
            </div>
            <input type="date" value={checkIn} onChange={e => setCheckIn(e.target.value)} min={new Date().toISOString().split('T')[0]} className="px-4 py-2.5 text-sm border border-primary-200 rounded-lg bg-primary-50 focus:bg-white" />
            <input type="date" value={checkOut} onChange={e => setCheckOut(e.target.value)} min={checkIn || new Date().toISOString().split('T')[0]} className="px-4 py-2.5 text-sm border border-primary-200 rounded-lg bg-primary-50 focus:bg-white" />
            <select value={guests} onChange={e => setGuests(Number(e.target.value))} className="px-4 py-2.5 text-sm border border-primary-200 rounded-lg bg-primary-50 focus:bg-white">
              {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} Guest{n > 1 ? 's' : ''}</option>)}
            </select>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="px-4 py-2.5 text-sm border border-primary-200 rounded-lg bg-primary-50 focus:bg-white">
              <option value="name">Sort by Name</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="capacity">Capacity</option>
            </select>
          </div>

          {/* Extended Filters */}
          <div className={`${showFilters ? 'block' : 'hidden'} md:block mt-4 pt-4 border-t border-primary-100`}>
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-primary-500 uppercase">Type:</span>
                <button onClick={() => setTypeFilter('')} className={`text-xs px-3 py-1 rounded-full transition-colors ${!typeFilter ? 'bg-accent-600 text-white' : 'bg-primary-100 text-primary-600 hover:bg-primary-200'}`}>All</button>
                {roomTypes.map(type => (
                  <button key={type} onClick={() => setTypeFilter(type)} className={`text-xs px-3 py-1 rounded-full transition-colors ${typeFilter === type ? 'bg-accent-600 text-white' : 'bg-primary-100 text-primary-600 hover:bg-primary-200'}`}>{type}</button>
                ))}
              </div>
              {(checkIn || checkOut || searchQuery || typeFilter) && (
                <button onClick={() => { setCheckIn(''); setCheckOut(''); setSearchQuery(''); setTypeFilter(''); }} className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1">
                  <X size={12} /> Clear filters
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Room Grid */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        {filteredRooms.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-primary-500 text-lg">No rooms match your criteria</p>
            <p className="text-primary-400 text-sm mt-2">Try adjusting your filters or dates</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredRooms.map((room, i) => {
              const isAvail = checkIn && checkOut ? checkAvailability(room.id, checkIn, checkOut) : true;
              return (
                <Link to={`/rooms/${room.id}${checkIn && checkOut ? `?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}` : ''}`} key={room.id} className="group card-hover bg-white rounded-2xl overflow-hidden shadow-sm" style={{ animationDelay: `${i * 0.1}s` }}>
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img src={room.images[0]} alt={room.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-4 left-4 flex gap-2">
                      <span className={`text-xs font-medium px-3 py-1 rounded-full ${getRoomTypeColor(room.type)}`}>{room.type}</span>
                      {isAvail ? (
                        <span className="text-xs font-medium px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 flex items-center gap-1"><Check size={12} /> Available</span>
                      ) : (
                        <span className="text-xs font-medium px-3 py-1 rounded-full bg-red-100 text-red-700">Booked</span>
                      )}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-serif text-xl text-primary-800 mb-2">{room.name}</h3>
                    <p className="text-sm text-primary-500 line-clamp-2 mb-4">{room.description}</p>
                    <div className="flex items-center gap-4 text-xs text-primary-500 mb-4">
                      <span className="flex items-center gap-1"><Users size={14} /> {room.capacity}</span>
                      <span className="flex items-center gap-1"><BedDouble size={14} /> {room.beds} Bed{room.beds > 1 ? 's' : ''}</span>
                      <span className="flex items-center gap-1"><Maximize size={14} /> {room.size}m²</span>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-primary-100">
                      <div>
                        <span className="text-2xl font-semibold text-accent-600">{formatCurrency(room.ratePerNight)}</span>
                        <span className="text-xs text-primary-400"> / night</span>
                      </div>
                      <span className="text-sm text-accent-600 font-medium group-hover:underline">View Details →</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
