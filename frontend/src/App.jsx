import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

import { AuthProvider, useAuth } from './context/AuthContext';
import { BookingProvider } from './context/BookingContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import MobileBottomNav from './components/MobileBottomNav';
import KiranaChatModal from './components/KiranaChatModal';
import AdminSidebar from './components/AdminSidebar';

// Customer Pages
import LandingPage from './pages/customer/LandingPage';
import CatalogPage from './pages/customer/CatalogPage';
import CustomAssemblyPage from './pages/customer/CustomAssemblyPage';
import AvailabilityPage from './pages/customer/AvailabilityPage';
import BookingCheckoutPage from './pages/customer/BookingCheckoutPage';
import CustomerDashboardPage from './pages/customer/CustomerDashboardPage';
import GalleryPage from './pages/customer/GalleryPage';
import TestimonialsPage from './pages/customer/TestimonialsPage';
import LoginPage from './pages/customer/LoginPage';
import RegisterPage from './pages/customer/RegisterPage';

// Admin Pages
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminBundles from './pages/admin/AdminBundles';
import AdminBookings from './pages/admin/AdminBookings';
import AdminPayments from './pages/admin/AdminPayments';
import AdminScheduleMatrix from './pages/admin/AdminScheduleMatrix';
import AdminGallery from './pages/admin/AdminGallery';
import AdminTestimonials from './pages/admin/AdminTestimonials';
import AdminAIAssistant from './pages/admin/AdminAIAssistant';

function ProtectedAdminRoute({ children }) {
  const { role, loading } = useAuth();
  if (loading) return <div className="p-10 text-center text-slate-500">Memeriksa hak akses admin...</div>;
  if (role !== 'owner' && role !== 'staff') {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
}

function MainLayout() {
  const [kiranaOpen, setKiranaOpen] = useState(false);
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  if (isAdminRoute && location.pathname !== '/admin/login') {
    return (
      <ProtectedAdminRoute>
        <div className="flex flex-col lg:flex-row min-h-screen bg-[#FAF7F8] font-sans text-slate-800">
          <AdminSidebar />
          <main className="flex-1 overflow-y-auto bg-[#FAF7F8] min-w-0">
            <Routes>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/produk" element={<AdminProducts />} />
              <Route path="/admin/paket" element={<AdminBundles />} />
              <Route path="/admin/booking" element={<AdminBookings />} />
              <Route path="/admin/pembayaran" element={<AdminPayments />} />
              <Route path="/admin/kalender" element={<AdminScheduleMatrix />} />
              <Route path="/admin/galeri" element={<AdminGallery />} />
              <Route path="/admin/testimoni" element={<AdminTestimonials />} />
              <Route path="/admin/ai-assistant" element={<AdminAIAssistant />} />
            </Routes>
          </main>
        </div>
      </ProtectedAdminRoute>
    );
  }

  if (location.pathname === '/admin/login') {
    return <AdminLoginPage />;
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#FCFAF9]">
      <Navbar onOpenKirana={() => setKiranaOpen(true)} />
      
      {/* Main page content with padding bottom for mobile bottom nav bar */}
      <main className="flex-1 pb-20 lg:pb-0">
        <Routes>
          <Route path="/" element={<LandingPage onOpenKirana={() => setKiranaOpen(true)} />} />
          <Route path="/katalog" element={<CatalogPage onOpenKirana={() => setKiranaOpen(true)} />} />
          <Route path="/kustom-paket" element={<CustomAssemblyPage onOpenKirana={() => setKiranaOpen(true)} />} />
          <Route path="/cek-jadwal" element={<AvailabilityPage onOpenKirana={() => setKiranaOpen(true)} />} />
          <Route path="/booking" element={<BookingCheckoutPage />} />
          <Route path="/riwayat" element={<CustomerDashboardPage />} />
          <Route path="/galeri" element={<GalleryPage />} />
          <Route path="/testimoni" element={<TestimonialsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />

      {/* Floating Kirana AI trigger button - positioned cleanly above Mobile Bottom Nav */}
      <button
        onClick={() => setKiranaOpen(true)}
        className="fixed bottom-22 sm:bottom-6 right-4 sm:right-6 z-40 p-3.5 sm:p-4 rounded-full bg-gradient-to-tr from-maroon-900 via-maroon-700 to-amber-500 text-white shadow-2xl shadow-maroon-900/40 hover:scale-110 active:scale-95 transition-all flex items-center gap-2 group border border-maroon-500/50"
        title="Tanya AI Kirana"
      >
        <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-amber-200 animate-pulse" />
        <span className="hidden sm:inline max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out font-bold text-xs whitespace-nowrap text-amber-100">
          Tanya Kirana AI
        </span>
      </button>

      {/* Customer Mobile Bottom Navigation Bar */}
      <MobileBottomNav />

      {/* Kirana Chat Modal Drawer */}
      <KiranaChatModal
        isOpen={kiranaOpen}
        onClose={() => setKiranaOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BookingProvider>
        <MainLayout />
      </BookingProvider>
    </AuthProvider>
  );
}
