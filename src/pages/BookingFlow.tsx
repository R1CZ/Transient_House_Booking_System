import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useStore } from '../store';
import { ArrowLeft, Check, CreditCard, Loader2, Calendar, Users, Home } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/helpers';

export default function BookingFlow() {
  const { roomId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { rooms, currentUser, createBooking, processPayment, checkAvailability, settings } = useStore();
  const room = rooms.find(r => r.id === roomId);
  
  const checkIn = searchParams.get('checkIn') || '';
  const checkOut = searchParams.get('checkOut') || '';
  const guests = Number(searchParams.get('guests')) || 2;
  
  const [step, setStep] = useState(1);
  const [specialRequests, setSpecialRequests] = useState('');
  const [agreedToPolicy, setAgreedToPolicy] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('gcash');
  const [processing, setProcessing] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [bookingRef, setBookingRef] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!room) navigate('/rooms');
    if (!currentUser) navigate('/auth');
    if (checkIn && checkOut && room && !checkAvailability(room.id, checkIn, checkOut)) {
      setError('Room is no longer available for selected dates');
    }
  }, []);

  if (!room) return null;

  const nights = Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000*60*60*24));
  const subtotal = room.ratePerNight * nights;
  const taxes = Math.round(subtotal * (settings.taxRate / 100));
  const fees = 500;
  const total = subtotal + taxes + fees;

  const handleSubmitBooking = () => {
    if (!agreedToPolicy) { setError('Please accept the booking policies'); return; }
    setStep(3);
  };

  const handlePayment = async () => {
    setProcessing(true);
    setError('');
    
    const result = createBooking({
      customerId: currentUser!.id,
      roomId: room.id,
      checkIn,
      checkOut,
      guests,
      specialRequests,
    });
    
    if (!result.success) {
      setError(result.error || 'Failed to create booking');
      setProcessing(false);
      return;
    }

    // Process payment
    const paymentResult = processPayment(result.booking!.id, paymentMethod);
    if (!paymentResult.success) {
      setError(paymentResult.error || 'Payment failed');
      setProcessing(false);
      return;
    }

    // Simulate processing time
    setTimeout(() => {
      setBookingRef(result.booking!.referenceCode);
      setBookingComplete(true);
      setProcessing(false);
    }, 3000);
  };

  if (bookingComplete) {
    return (
      <div className="min-h-screen bg-primary-50 flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center animate-fade-in-up">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check size={40} className="text-emerald-600" />
          </div>
          <h1 className="font-serif text-3xl text-primary-800 mb-3">Booking Confirmed!</h1>
          <p className="text-primary-500 mb-6">Your reservation has been confirmed and payment is being processed.</p>
          
          <div className="bg-white rounded-2xl p-6 text-left mb-6 shadow-sm">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-primary-500">Reference</span>
                <span className="font-mono font-medium text-accent-600">{bookingRef}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-primary-500">Room</span>
                <span className="text-primary-800">{room.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-primary-500">Check-in</span>
                <span className="text-primary-800">{formatDate(checkIn)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-primary-500">Check-out</span>
                <span className="text-primary-800">{formatDate(checkOut)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-primary-500">Guests</span>
                <span className="text-primary-800">{guests}</span>
              </div>
              <div className="flex justify-between text-sm pt-3 border-t border-primary-100">
                <span className="font-medium text-primary-700">Total</span>
                <span className="font-semibold text-accent-600">{formatCurrency(total)}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Link to="/dashboard" className="btn-primary flex-1">View My Bookings</Link>
            <Link to="/" className="btn-secondary flex-1">Go Home</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-50">
      {/* Header */}
      <div className="bg-white border-b border-primary-100">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <button onClick={() => step > 1 ? setStep(step - 1) : navigate(-1)} className="text-primary-500 hover:text-accent-600">
            <ArrowLeft size={20} />
          </button>
          <h1 className="font-serif text-xl text-primary-800">Complete Your Booking</h1>
        </div>
      </div>

      {/* Progress */}
      <div className="max-w-4xl mx-auto px-6 py-6">
        <div className="flex items-center gap-4 mb-10">
          {['Review', 'Details', 'Payment'].map((label, i) => (
            <div key={i} className="flex items-center gap-2 flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step > i + 1 ? 'bg-accent-600 text-white' : step === i + 1 ? 'bg-accent-100 text-accent-700 ring-2 ring-accent-300' : 'bg-primary-100 text-primary-400'}`}>
                {step > i + 1 ? <Check size={16} /> : i + 1}
              </div>
              <span className={`text-sm hidden sm:block ${step === i + 1 ? 'text-accent-700 font-medium' : 'text-primary-400'}`}>{label}</span>
              {i < 2 && <div className={`flex-1 h-0.5 ${step > i + 1 ? 'bg-accent-400' : 'bg-primary-200'}`} />}
            </div>
          ))}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-sm text-red-600">{error}</div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {step === 1 && (
              <div className="bg-white rounded-2xl p-8 animate-fade-in">
                <h2 className="font-serif text-2xl text-primary-800 mb-6">Review Your Stay</h2>
                
                <div className="flex gap-4 mb-8 pb-6 border-b border-primary-100">
                  <img src={room.images[0]} alt={room.name} className="w-24 h-24 rounded-xl object-cover" />
                  <div>
                    <h3 className="font-medium text-primary-800">{room.name}</h3>
                    <p className="text-sm text-primary-500">{room.type} · Room #{room.number}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="text-center p-4 bg-primary-50 rounded-xl">
                    <Calendar size={20} className="mx-auto text-accent-500 mb-2" />
                    <p className="text-xs text-primary-500">Check-in</p>
                    <p className="text-sm font-medium text-primary-800">{formatDate(checkIn, 'MMM dd')}</p>
                  </div>
                  <div className="text-center p-4 bg-primary-50 rounded-xl">
                    <Calendar size={20} className="mx-auto text-accent-500 mb-2" />
                    <p className="text-xs text-primary-500">Check-out</p>
                    <p className="text-sm font-medium text-primary-800">{formatDate(checkOut, 'MMM dd')}</p>
                  </div>
                  <div className="text-center p-4 bg-primary-50 rounded-xl">
                    <Users size={20} className="mx-auto text-accent-500 mb-2" />
                    <p className="text-xs text-primary-500">Guests</p>
                    <p className="text-sm font-medium text-primary-800">{guests} Guest{guests > 1 ? 's' : ''}</p>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="text-sm font-medium text-primary-700 mb-2 block">Special Requests (optional)</label>
                  <textarea value={specialRequests} onChange={e => setSpecialRequests(e.target.value)} placeholder="Any special requirements..." className="w-full px-4 py-3 text-sm border border-primary-200 rounded-lg resize-none h-24" />
                </div>

                <div className="bg-primary-50 rounded-xl p-4 mb-6">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" checked={agreedToPolicy} onChange={e => setAgreedToPolicy(e.target.checked)} className="mt-1 w-4 h-4 rounded border-primary-300 text-accent-600" />
                    <span className="text-sm text-primary-600">I agree to the booking policies, cancellation terms, and house rules. I understand that cancellations within {settings.cancellationDays} days of check-in may incur a {settings.cancellationFeePercent}% fee.</span>
                  </label>
                </div>

                <button onClick={handleSubmitBooking} className="btn-primary w-full">Continue to Details</button>
              </div>
            )}

            {step === 2 && (
              <div className="bg-white rounded-2xl p-8 animate-fade-in">
                <h2 className="font-serif text-2xl text-primary-800 mb-6">Guest Information</h2>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="text-xs font-medium text-primary-500 uppercase tracking-wider mb-1 block">First Name</label>
                    <input type="text" value={currentUser?.firstName || ''} readOnly className="w-full px-4 py-2.5 text-sm border border-primary-200 rounded-lg bg-primary-50" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-primary-500 uppercase tracking-wider mb-1 block">Last Name</label>
                    <input type="text" value={currentUser?.lastName || ''} readOnly className="w-full px-4 py-2.5 text-sm border border-primary-200 rounded-lg bg-primary-50" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="text-xs font-medium text-primary-500 uppercase tracking-wider mb-1 block">Email</label>
                    <input type="email" value={currentUser?.email || ''} readOnly className="w-full px-4 py-2.5 text-sm border border-primary-200 rounded-lg bg-primary-50" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-primary-500 uppercase tracking-wider mb-1 block">Phone</label>
                    <input type="tel" value={currentUser?.phone || ''} readOnly className="w-full px-4 py-2.5 text-sm border border-primary-200 rounded-lg bg-primary-50" />
                  </div>
                </div>

                <div className="bg-accent-50 rounded-xl p-4 mb-6">
                  <p className="text-sm text-accent-700">✓ Your information is verified and secure. We'll send booking confirmation to your email.</p>
                </div>

                <button onClick={() => setStep(3)} className="btn-primary w-full">Proceed to Payment</button>
              </div>
            )}

            {step === 3 && (
              <div className="bg-white rounded-2xl p-8 animate-fade-in">
                <h2 className="font-serif text-2xl text-primary-800 mb-6">Payment</h2>
                
                <div className="space-y-3 mb-8">
                  {[
                    { id: 'gcash', name: 'GCash', desc: 'Pay with GCash wallet' },
                    { id: 'maya', name: 'Maya', desc: 'Pay with Maya (PayMaya)' },
                    { id: 'card', name: 'Credit/Debit Card', desc: 'Visa, Mastercard, JCB' },
                    { id: 'bank', name: 'Bank Transfer', desc: 'Direct bank transfer' },
                  ].map(method => (
                    <label key={method.id} className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === method.id ? 'border-accent-400 bg-accent-50' : 'border-primary-100 hover:border-primary-200'}`}>
                      <input type="radio" name="payment" value={method.id} checked={paymentMethod === method.id} onChange={e => setPaymentMethod(e.target.value)} className="text-accent-600" />
                      <div>
                        <p className="font-medium text-primary-800 text-sm">{method.name}</p>
                        <p className="text-xs text-primary-500">{method.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>

                <button onClick={handlePayment} disabled={processing} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-70">
                  {processing ? (
                    <><Loader2 size={18} className="animate-spin" /> Processing Payment...</>
                  ) : (
                    <><CreditCard size={18} /> Pay {formatCurrency(total)}</>
                  )}
                </button>

                <p className="text-xs text-primary-400 text-center mt-4">🔒 Secured with 256-bit SSL encryption</p>
              </div>
            )}
          </div>

          {/* Sidebar - Price Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-24">
              <h3 className="font-medium text-primary-800 mb-4">Price Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-primary-500">{formatCurrency(room.ratePerNight)} × {nights} nights</span>
                  <span className="text-primary-800">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-primary-500">Taxes ({settings.taxRate}%)</span>
                  <span className="text-primary-800">{formatCurrency(taxes)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-primary-500">Service fee</span>
                  <span className="text-primary-800">{formatCurrency(fees)}</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-primary-100 font-semibold">
                  <span className="text-primary-800">Total</span>
                  <span className="text-accent-600">{formatCurrency(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
