import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Sparkles, Crown, Calendar, ShoppingBag, 
  User as UserIcon, LogOut, Menu, X, Layers,
  PhoneCall, ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useBooking } from '../context/BookingContext';

export default function Navbar({ onOpenKirana }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const { user, role, logout } = useAuth();
  const { totalItemCount } = useBooking();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
    setUserDropdownOpen(false);
  };

  const navLinks = [
    { name: 'Beranda', path: '/' },
    { name: 'Katalog', path: '/katalog' },
    { name: 'Rakit Paket', path: '/kustom-paket' },
    { name: 'Cek Jadwal', path: '/cek-jadwal' },
    { name: 'Galeri', path: '/galeri' },
    { name: 'Testimoni', path: '/testimoni' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-maroon-100 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-lg bg-maroon-900 flex items-center justify-center">
              <Crown className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <span className="font-serif text-xl font-bold tracking-tight text-slate-900 block leading-tight">
                Radja Wedding
              </span>
              <span className="text-[11px] font-medium text-slate-500 block">
                Salon & Bridal — Jakarta Selatan
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                  isActive(link.path)
                    ? 'text-maroon-800 bg-maroon-50 font-bold border border-maroon-200/60 shadow-2xs'
                    : 'text-slate-600 hover:text-maroon-700 hover:bg-slate-50'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Right Action Icons & Auth */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Kirana AI Button */}
            <button
              onClick={onOpenKirana}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-[13px] font-medium text-slate-700 border border-slate-200 hover:border-maroon-300 hover:text-maroon-800 transition-colors"
              title="Konsultasi paket"
            >
              <Sparkles className="w-4 h-4 text-maroon-700" />
              <span>Tanya Kirana</span>
            </button>

            {/* Custom Assembly Cart Bag */}
            <Link
              to="/kustom-paket"
              className="relative p-2.5 rounded-full text-slate-700 hover:text-maroon-700 hover:bg-maroon-50 transition-colors"
              title="Keranjang Rakitan Paket"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItemCount > 0 && (
                <span className="absolute top-1 right-1 w-5 h-5 bg-maroon-700 text-white text-[11px] font-bold rounded-full flex items-center justify-center shadow">
                  {totalItemCount}
                </span>
              )}
            </Link>

            {/* User Dropdown / Login */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 hover:border-maroon-300 bg-slate-50 hover:bg-white text-sm font-medium text-slate-700 transition-all"
                >
                  <div className="w-7 h-7 rounded-full bg-maroon-100 text-maroon-800 flex items-center justify-center font-bold text-xs">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="max-w-[120px] truncate">{user.name}</span>
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-fadeIn">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs text-slate-400">Masuk sebagai:</p>
                      <p className="text-sm font-semibold text-slate-800 truncate">{user.name}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    </div>
                    <Link
                      to="/riwayat"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-maroon-50 hover:text-maroon-800"
                    >
                      <Calendar className="w-4 h-4 text-slate-400" />
                      Riwayat Pemesanan
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50"
                    >
                      <LogOut className="w-4 h-4" />
                      Keluar
                    </button>
                  </div>
                )}
              </div>
            ) : role === 'owner' || role === 'staff' ? (
              <Link
                to="/admin"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-sm"
              >
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                Admin Panel
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:text-maroon-700 transition-colors"
                >
                  Masuk
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-maroon-900 hover:bg-maroon-800 transition-colors"
                >
                  Daftar
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={onOpenKirana}
              className="p-2 rounded-lg text-maroon-700 bg-maroon-50 border border-maroon-200"
              title="Tanya AI Kirana"
            >
              <Sparkles className="w-5 h-5" />
            </button>
            <Link
              to="/kustom-paket"
              className="relative p-2 rounded-lg text-slate-700"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItemCount > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-maroon-700 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {totalItemCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-700 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Navigation with backdrop */}
      {mobileMenuOpen && (
        <>
          <div 
            className="fixed inset-0 top-20 bg-black/40 backdrop-blur-xs z-30 lg:hidden animate-fadeIn"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="lg:hidden fixed top-20 left-0 right-0 z-40 bg-white border-b border-maroon-100 px-5 pt-3 pb-8 space-y-2 shadow-2xl animate-slideDown max-h-[calc(100vh-5rem)] overflow-y-auto">
            {user && (
              <div className="p-3 bg-maroon-50/70 rounded-2xl border border-maroon-200/60 mb-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-maroon-700 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                  <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                </div>
              </div>
            )}

            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                  isActive(link.path)
                    ? 'text-maroon-900 bg-maroon-50 font-bold border border-maroon-200 shadow-2xs'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>{link.name}</span>
                {isActive(link.path) && (
                  <span className="w-2 h-2 rounded-full bg-maroon-700"></span>
                )}
              </Link>
            ))}

            <div className="pt-4 border-t border-slate-100 space-y-2">
              {user ? (
                <>
                  <Link
                    to="/riwayat"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-3 rounded-2xl text-slate-800 bg-slate-50 hover:bg-maroon-50 font-semibold text-sm transition-colors"
                  >
                    <Calendar className="w-4 h-4 text-maroon-700" />
                    Riwayat & Status Reservasi
                  </Link>

                  {(role === 'owner' || role === 'staff') && (
                    <Link
                      to="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-3 rounded-2xl text-amber-300 bg-slate-950 font-bold text-sm"
                    >
                      <ShieldCheck className="w-4 h-4 text-amber-400" />
                      Masuk ke Admin Panel
                    </Link>
                  )}

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-3 rounded-2xl text-rose-600 hover:bg-rose-50 font-semibold text-sm transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Keluar dari Akun
                  </button>
                </>
              ) : (
                <div className="space-y-2 pt-2">
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full text-center py-3 rounded-2xl border border-slate-300 font-bold text-sm text-slate-800 hover:bg-slate-50 transition-colors"
                    >
                      Masuk
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full text-center py-3 rounded-2xl bg-gradient-to-r from-maroon-800 to-maroon-700 text-white font-bold text-sm shadow-md shadow-maroon-700/20"
                    >
                      Daftar Akun
                    </Link>
                  </div>
                  <Link
                    to="/admin/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-center py-2 text-xs text-slate-500 hover:text-maroon-700 font-medium"
                  >
                    Login sebagai Admin / Staf &rarr;
                  </Link>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </header>
  );
}
