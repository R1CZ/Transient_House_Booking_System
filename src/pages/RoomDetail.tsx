import { useState } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { ArrowLeft, Users, BedDouble, Maximize, Wifi, Wind, Tv, Coffee, Shield, Check, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { formatCurrency, getRoomTypeColor } from '../utils/helpers';

export default function RoomDetail() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { rooms, checkAvailability, isAuthenticated } = useStore();
  const room = rooms.find(r => r.id === id);
  const [currentImage, setCurrentImage] = useState(0);
  const [checkIn, setCheckIn] = useState(searchParams.get('checkIn') || '');
  const [checkOut, setCheckOut] = useState(searchParams.get('checkOut') || '');
  const [guests, setGuests] = useState(Number(searchParams.get('guests')) || 2);

  if (!room) return (
    <div className="min-h-screen flex items-center justify-center bg-primary-50">
      <div className="text-center">
        <h2 className="font-serif text-2xl text-primary-800 mb-4">Room Not Found</h2>
        <Link to="/rooms" className="btn-primary">Back to Rooms</Link>
      </div>
    </div>
  );

  const isAvailable = checkIn && checkOut ? checkAvailability(room.id, checkIn, checkOut) : true;
  const nights = checkIn && checkOut ? Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000*60*60*24)) : 0;
  const total = nights * room.ratePerNight;

  const handleBook = () => {
    if (!isAuthenticated) {
      navigate(`/auth?redirect=/booking/${room.id}?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`);
      return;
    }
    if (!checkIn || !checkOut) return;
    navigate(`/booking/${room.id}?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`);
  };

  const amenityIcons: Record<string, any> = {
    'Free WiFi': Wifi, 'Air Conditioning': Wind, 'Smart TV': Tv, 'Mini Bar': Coffee, 'Safe': Shield,
  };

  return (
    <div className="min-h-screen bg-primary-50">
      {/* Header */}
      <div className="bg-white border-b border-primary-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/rooms" className="flex items-center gap-2 text-primary-600 hover:text-accent-600 transition-colors">
            <ArrowLeft size={20} /> <span className="text-sm">Back to Rooms</span>
          </Link>
          <span className={`text-xs font-medium px-3 py-1 rounded-full ${getRoomTypeColor(room.type)}`}>{room.type}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-10">
          {/* Left - Images & Details */}
          <div className="lg:col-span-2">
            {/* Image Gallery */}
            <div className="relative rounded-2xl overflow-hidden aspect-[16/10] mb-4">
              <img src={room.images[currentImage]} alt={room.name} className="w-full h-full object-cover" />
              {room.images.length > 1 && (
                <>
                  <button onClick={() => setCurrentImage(i => i === 0 ? room.images.length - 1 : i - 1)} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur rounded-full flex items-center justify-center hover:bg-white transition-colors">
                    <ChevronLeft size={20} />
                  </button>
                  <button onClick={() => setCurrentImage(i => i === room.images.length - 1 ? 0 : i + 1)} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur rounded-full flex items-center justify-center hover:bg-white transition-colors">
                    <ChevronRight size={20} />
                  </button>
                </>
              )}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {room.images.map((_, i) => (
                  <button key={i} onClick={() => setCurrentImage(i)} className={`w-2 h-2 rounded-full transition-all ${i === currentImage ? 'bg-white w-6' : 'bg-white/50'}`} />
                ))}
              </div>
            </div>
            
            {/* Thumbnails */}
            <div className="flex gap-3 mb-8">
              {room.images.map((img, i) => (
                <button key={i} onClick={() => setCurrentImage(i)} className={`w-20 h-14 rounded-lg overflow-hidden border-2 transition-all ${i === currentImage ? 'border-accent-500' : 'border-transparent opacity-70 hover:opacity-100'}`}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            {/* Room Info */}
            <div className="bg-white rounded-2xl p-8 mb-6">
              <h1 className="font-serif text-3xl text-primary-800 mb-2">{room.name}</h1>
              <p className="text-primary-500 mb-6">Room #{room.number} · Floor {room.floor}</p>
              
              <div className="flex flex-wrap gap-6 mb-8 pb-8 border-b border-primary-100">
                <div className="flex items-center gap-2 text-primary-600">
                  <Users size={18} className="text-accent-500" /> <span className="text-sm">Up to {room.capacity} guests</span>
                </div>
                <div className="flex items-center gap-2 text-primary-600">
                  <BedDouble size={18} className="text-accent-500" /> <span className="text-sm">{room.beds} Bed{room.beds > 1 ? 's' : ''}</span>
                </div>
                <div className="flex items-center gap-2 text-primary-600">
                  <Maximize size={18} className="text-accent-500" /> <span className="text-sm">{room.size} m²</span>
                </div>
              </div>

              <h3 className="font-medium text-primary-800 mb-3">About this room</h3>
              <p className="text-primary-600 leading-relaxed mb-8">{room.description}</p>

              <h3 className="font-medium text-primary-800 mb-4">Amenities</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {room.amenities.map((amenity, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-primary-600">
                    <Check size={14} className="text-accent-500" /> {amenity}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right - Booking Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-24">
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-3xl font-semibold text-primary-800">{formatCurrency(room.ratePerNight)}</span>
                <span className="text-sm text-primary-500">/ night</span>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-xs font-medium text-primary-500 uppercase tracking-wider mb-1 block">Check In</label>
                  <div className="relative">
                    <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-400" />
                    <input type="date" value={checkIn} onChange={e => setCheckIn(e.target.value)} min={new Date().toISOString().split('T')[0]} className="w-full pl-9 pr-4 py-2.5 text-sm border border-primary-200 rounded-lg" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-primary-500 uppercase tracking-wider mb-1 block">Check Out</label>
                  <div className="relative">
                    <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-400" />
                    <input type="date" value={checkOut} onChange={e => setCheckOut(e.target.value)} min={checkIn || new Date().toISOString().split('T')[0]} className="w-full pl-9 pr-4 py-2.5 text-sm border border-primary-200 rounded-lg" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-primary-500 uppercase tracking-wider mb-1 block">Guests</label>
                  <select value={guests} onChange={e => setGuests(Number(e.target.value))} className="w-full px-4 py-2.5 text-sm border border-primary-200 rounded-lg">
                    {Array.from({ length: room.capacity }, (_, i) => i + 1).map(n => (
                      <option key={n} value={n}>{n} Guest{n > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>
              </div>

              {nights > 0 && (
                <div className="border-t border-primary-100 pt-4 mb-6 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-primary-600">{formatCurrency(room.ratePerNight)} × {nights} nights</span>
                    <span className="text-primary-800">{formatCurrency(total)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-primary-600">Service fee</span>
                    <span className="text-primary-800">{formatCurrency(500)}</span>
                  </div>
                  <div className="flex justify-between font-semibold pt-2 border-t border-primary-100">
                    <span className="text-primary-800">Total</span>
                    <span className="text-accent-600">{formatCurrency(total + 500)}</span>
                  </div>
                </div>
              )}

              {isAvailable ? (
                <button onClick={handleBook} disabled={!checkIn || !checkOut} className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed">
                  {isAuthenticated ? 'Reserve Now' : 'Sign In to Book'}
                </button>
              ) : (
                <div className="text-center py-3 bg-red-50 rounded-lg">
                  <p className="text-sm text-red-600 font-medium">Not available for selected dates</p>
                </div>
              )}

              <p className="text-xs text-primary-400 text-center mt-4">You won't be charged yet</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
