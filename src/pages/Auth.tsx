import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useStore } from '../store';
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowLeft } from 'lucide-react';

export default function Auth() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login, register } = useStore();
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    const result = login(email, password);
    setLoading(false);
    
    if (result.success) {
      const redirect = searchParams.get('redirect');
      if (redirect) {
        navigate(redirect);
      } else {
        const user = useStore.getState().currentUser;
        navigate(user?.role === 'super_admin' || user?.role === 'admin' ? '/admin' : '/dashboard');
      }
    } else {
      setError(result.error || 'Login failed');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return; }
    
    setLoading(true);
    const result = register({ email, password, firstName, lastName, phone });
    setLoading(false);
    
    if (result.success) {
      setSuccess('Account created successfully! Please sign in.');
      setMode('login');
    } else {
      setError(result.error || 'Registration failed');
    }
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('Password reset link sent to your email. (Demo: use original password)');
  };

  return (
    <div className="min-h-screen bg-primary-50 flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80" alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/80 to-accent-900/60" />
        <div className="relative z-10 flex flex-col justify-center px-16">
          <Link to="/" className="flex items-center gap-2 mb-12">
            <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur flex items-center justify-center">
              <span className="text-white text-lg font-bold">S</span>
            </div>
            <span className="font-serif text-2xl text-white font-semibold">Serene Stays</span>
          </Link>
          <h2 className="font-serif text-4xl text-white font-semibold mb-4 leading-tight">Your Journey to<br />Tranquility Begins</h2>
          <p className="text-white/70 text-lg max-w-md">Join our community of travelers who have discovered the perfect blend of comfort and serenity.</p>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <Link to="/" className="inline-flex items-center gap-2 text-primary-500 hover:text-accent-600 mb-8 transition-colors">
            <ArrowLeft size={18} /> <span className="text-sm">Back to home</span>
          </Link>

          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <h1 className="font-serif text-2xl text-primary-800 mb-2">
              {mode === 'login' ? 'Welcome Back' : mode === 'register' ? 'Create Account' : 'Reset Password'}
            </h1>
            <p className="text-sm text-primary-500 mb-8">
              {mode === 'login' ? 'Sign in to manage your bookings' : mode === 'register' ? 'Start your serene journey with us' : 'We\'ll send you a reset link'}
            </p>

            {error && <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-sm text-red-600">{error}</div>}
            {success && <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 mb-4 text-sm text-emerald-600">{success}</div>}

            {mode === 'login' && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-400" />
                  <input type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} required className="w-full pl-10 pr-4 py-3 text-sm border border-primary-200 rounded-lg" />
                </div>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-400" />
                  <input type={showPassword ? 'text' : 'password'} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full pl-10 pr-10 py-3 text-sm border border-primary-200 rounded-lg" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-400 hover:text-primary-600">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm text-primary-600">
                    <input type="checkbox" className="rounded border-primary-300 text-accent-600" /> Remember me
                  </label>
                  <button type="button" onClick={() => setMode('forgot')} className="text-sm text-accent-600 hover:text-accent-700">Forgot password?</button>
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-70">
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
                <p className="text-center text-sm text-primary-500">
                  Don't have an account? <button type="button" onClick={() => setMode('register')} className="text-accent-600 font-medium hover:text-accent-700">Sign up</button>
                </p>
                <div className="pt-4 border-t border-primary-100">
                  <p className="text-xs text-primary-400 text-center mb-2">Demo accounts:</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button type="button" onClick={() => { setEmail('admin@serenestays.ph'); setPassword('Admin@123!'); }} className="p-2 bg-primary-50 rounded-lg text-primary-600 hover:bg-primary-100 transition-colors">Admin Login</button>
                    <button type="button" onClick={() => { setEmail('customer@example.com'); setPassword('Customer@123!'); }} className="p-2 bg-primary-50 rounded-lg text-primary-600 hover:bg-primary-100 transition-colors">Customer Login</button>
                  </div>
                </div>
              </form>
            )}

            {mode === 'register' && (
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-400" />
                    <input type="text" placeholder="First name" value={firstName} onChange={e => setFirstName(e.target.value)} required className="w-full pl-10 pr-4 py-3 text-sm border border-primary-200 rounded-lg" />
                  </div>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-400" />
                    <input type="text" placeholder="Last name" value={lastName} onChange={e => setLastName(e.target.value)} required className="w-full pl-10 pr-4 py-3 text-sm border border-primary-200 rounded-lg" />
                  </div>
                </div>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-400" />
                  <input type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} required className="w-full pl-10 pr-4 py-3 text-sm border border-primary-200 rounded-lg" />
                </div>
                <div className="relative">
                  <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-400" />
                  <input type="tel" placeholder="Phone number" value={phone} onChange={e => setPhone(e.target.value)} required className="w-full pl-10 pr-4 py-3 text-sm border border-primary-200 rounded-lg" />
                </div>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-400" />
                  <input type={showPassword ? 'text' : 'password'} placeholder="Password (min 8 chars)" value={password} onChange={e => setPassword(e.target.value)} required className="w-full pl-10 pr-10 py-3 text-sm border border-primary-200 rounded-lg" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-400">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-400" />
                  <input type="password" placeholder="Confirm password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="w-full pl-10 pr-4 py-3 text-sm border border-primary-200 rounded-lg" />
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-70">
                  {loading ? 'Creating account...' : 'Create Account'}
                </button>
                <p className="text-center text-sm text-primary-500">
                  Already have an account? <button type="button" onClick={() => setMode('login')} className="text-accent-600 font-medium hover:text-accent-700">Sign in</button>
                </p>
              </form>
            )}

            {mode === 'forgot' && (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-400" />
                  <input type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} required className="w-full pl-10 pr-4 py-3 text-sm border border-primary-200 rounded-lg" />
                </div>
                <button type="submit" className="btn-primary w-full">Send Reset Link</button>
                <p className="text-center text-sm text-primary-500">
                  Remember your password? <button type="button" onClick={() => setMode('login')} className="text-accent-600 font-medium hover:text-accent-700">Sign in</button>
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
