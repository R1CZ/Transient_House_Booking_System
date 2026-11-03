import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store';
import Landing from './pages/Landing';
import Rooms from './pages/Rooms';
import RoomDetail from './pages/RoomDetail';
import BookingFlow from './pages/BookingFlow';
import Auth from './pages/Auth';
import CustomerDashboard from './pages/CustomerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminBookings from './pages/AdminBookings';
import AdminRooms from './pages/AdminRooms';
import AdminCustomers from './pages/AdminCustomers';
import AdminPayments from './pages/AdminPayments';
import AdminReports from './pages/AdminReports';
import AdminSettings from './pages/AdminSettings';

function ProtectedRoute({ children, admin = false }: { children: React.ReactNode; admin?: boolean }) {
  const { isAuthenticated, currentUser } = useStore();
  if (!isAuthenticated || !currentUser) return <Navigate to="/auth" replace />;
  if (admin && !['super_admin', 'admin', 'manager', 'booking_staff', 'front_desk', 'finance'].includes(currentUser.role)) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/rooms" element={<Rooms />} />
        <Route path="/rooms/:id" element={<RoomDetail />} />
        <Route path="/booking/:roomId" element={<BookingFlow />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/dashboard" element={<ProtectedRoute><CustomerDashboard /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute admin><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/bookings" element={<ProtectedRoute admin><AdminBookings /></ProtectedRoute>} />
        <Route path="/admin/rooms" element={<ProtectedRoute admin><AdminRooms /></ProtectedRoute>} />
        <Route path="/admin/customers" element={<ProtectedRoute admin><AdminCustomers /></ProtectedRoute>} />
        <Route path="/admin/payments" element={<ProtectedRoute admin><AdminPayments /></ProtectedRoute>} />
        <Route path="/admin/reports" element={<ProtectedRoute admin><AdminReports /></ProtectedRoute>} />
        <Route path="/admin/settings" element={<ProtectedRoute admin><AdminSettings /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}
