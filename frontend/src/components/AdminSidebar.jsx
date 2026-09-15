import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, ShoppingBag, Layers, CalendarCheck, 
  CreditCard, CalendarRange, Image, MessageSquare, 
  Sparkles, LogOut, ArrowLeft, Crown, Shield, Menu, X 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AdminSidebar() {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { admin, logout, isOwner } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navItems = [
    { name: 'Dashboard Overview', path: '/admin', icon: LayoutDashboard },
    { name: 'Katalog & Item Fisik', path: '/admin/produk', icon: ShoppingBag },
    { name: 'Paket Bundles Resmi', path: '/admin/paket', icon: Layers },
    { name: 'Manajemen Booking', path: '/admin/booking', icon: CalendarCheck },
    { name: 'Verifikasi Pembayaran', path: '/admin/pembayaran', icon: CreditCard },
    { name: 'Kalender & Kunci Jadwal', path: '/admin/kalender', icon: CalendarRange },
    { name: 'Galeri Portofolio', path: '/admin/galeri', icon: Image },
    { name: 'Moderasi Testimoni', path: '/admin/testimoni', icon: MessageSquare },
    { name: 'Admin AI Assistant (MCP)', path: '/admin/ai-assistant', icon: Sparkles, badge: 'Enterprise AI' },
  ];

  const isActive = (path) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  const currentNav = navItems.find(item => isActive(item.path)) || navItems[0];

  const renderNavContent = () => (
    <>
      <div>
        {/* Brand Header */}
        <div className="p-5 sm:p-6 border-b border-maroon-100 flex items-center justify-between bg-gradient-to-r from-maroon-900 via-maroon-800 to-maroon-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shadow-md">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <span className="font-serif text-lg font-extrabold tracking-wide block text-white">
                RADJA <span className="text-amber-300">ADMIN</span>
              </span>
              <span className="text-[10px] text-amber-200/90 font-bold tracking-wider uppercase block">
                {isOwner ? 'Executive Owner' : 'Operasional Staf'}
              </span>
            </div>
          </div>

          {/* Close button for mobile drawer */}
          <button
            onClick={() => setMobileDrawerOpen(false)}
            className="lg:hidden p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10"
            aria-label="Tutup Menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Admin info badge */}
        <div className="px-5 sm:px-6 py-3 bg-[#FAF2F4] border-b border-maroon-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-maroon-800 text-amber-200 flex items-center justify-center text-xs font-bold shadow-xs">
            {admin?.full_name?.charAt(0) || 'A'}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-slate-900 truncate">{admin?.full_name || 'Admin Radja'}</p>
            <p className="text-[10px] text-slate-500 truncate">{admin?.email || 'admin@radja.com'}</p>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="p-3 sm:p-4 space-y-1.5 overflow-y-auto max-h-[calc(100vh-280px)]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileDrawerOpen(false)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm transition-all ${
                  active
                    ? 'bg-maroon-50 text-maroon-900 border border-maroon-200 font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-maroon-900 hover:bg-maroon-50/50 font-medium'
                }`}
              >
                <div className="flex items-center gap-3 truncate">
                  <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-maroon-700' : 'text-slate-400'}`} />
                  <span className="truncate">{item.name}</span>
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.5 rounded-full text-[8px] font-bold bg-amber-100 text-amber-900 border border-amber-300 shrink-0">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-maroon-100 space-y-2 bg-white">
        <Link
          to="/"
          className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-maroon-900 hover:bg-maroon-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-maroon-700" />
          Lihat Tampilan Web Publik
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-700 hover:bg-rose-50 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Keluar dari Admin Panel
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* 1. Mobile Top Header Bar */}
      <div className="lg:hidden sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-maroon-100 px-4 h-16 flex items-center justify-between shrink-0 shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileDrawerOpen(true)}
            className="p-2 rounded-xl bg-maroon-50 text-maroon-900 hover:bg-maroon-100 border border-maroon-200 focus:outline-none"
            aria-label="Buka Menu Admin"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-maroon-800 text-amber-300 flex items-center justify-center font-bold text-xs">
              <Crown className="w-4 h-4" />
            </div>
            <div>
              <span className="font-serif text-sm font-bold text-slate-900 block leading-tight">
                RADJA <span className="text-maroon-800">ADMIN</span>
              </span>
              <span className="text-[9px] text-slate-500 block truncate max-w-[150px]">
                {currentNav.name}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/ai-assistant"
            className="p-2 rounded-xl bg-maroon-50 text-maroon-800 border border-maroon-200 text-xs"
            title="MCP Assistant"
          >
            <Sparkles className="w-4 h-4 text-maroon-700" />
          </Link>
          <div className="w-7 h-7 rounded-full bg-maroon-800 text-amber-200 flex items-center justify-center text-xs font-bold">
            {admin?.full_name?.charAt(0) || 'A'}
          </div>
        </div>
      </div>

      {/* 2. Mobile Drawer Overlay */}
      {mobileDrawerOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-xs animate-fadeIn"
            onClick={() => setMobileDrawerOpen(false)}
          />
          <aside className="lg:hidden fixed inset-y-0 left-0 z-50 w-72 max-w-[80vw] bg-white text-slate-700 flex flex-col justify-between border-r border-maroon-100 shadow-2xl animate-slideRight">
            {renderNavContent()}
          </aside>
        </>
      )}

      {/* 3. Desktop Fixed Sidebar */}
      <aside className="hidden lg:flex w-72 bg-white text-slate-700 min-h-screen flex-col justify-between border-r border-maroon-100 shrink-0 sticky top-0 h-screen shadow-xs">
        {renderNavContent()}
      </aside>
    </>
  );
}
