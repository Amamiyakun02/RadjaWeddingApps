import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Home, 
  ShoppingBag, 
  Sparkles, 
  CalendarRange, 
  User, 
  Clock,
  Layers
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useBooking } from '../context/BookingContext';

export default function MobileBottomNav() {
  const { user } = useAuth();
  const { totalItemCount } = useBooking();
  const location = useLocation();

  // Don't show bottom nav on admin panel routes
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  const navItems = [
    {
      label: 'Beranda',
      to: '/',
      icon: Home,
      exact: true
    },
    {
      label: 'Katalog',
      to: '/katalog',
      icon: ShoppingBag
    },
    {
      label: 'Rakit Paket',
      to: '/kustom-paket',
      icon: Sparkles,
      highlight: true,
      badge: totalItemCount > 0 ? totalItemCount : null
    },
    {
      label: 'Cek Jadwal',
      to: '/cek-jadwal',
      icon: CalendarRange
    },
    {
      label: user ? 'Riwayat' : 'Akun',
      to: user ? '/riwayat' : '/login',
      icon: user ? Clock : User
    }
  ];

  const isCurrentActive = (item) => {
    if (item.exact) {
      return location.pathname === item.to;
    }
    return location.pathname.startsWith(item.to);
  };

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 lg:hidden glass-bottom-nav">
      <nav className="flex items-center justify-around px-2 pt-2 pb-safe">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isCurrentActive(item);

          if (item.highlight) {
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className="relative -top-3 flex flex-col items-center group focus:outline-none"
              >
                <div className={`w-13 h-13 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 ${
                  active
                    ? 'bg-gradient-to-tr from-maroon-900 via-maroon-700 to-amber-500 text-amber-200 scale-105 shadow-maroon-900/40 ring-2 ring-amber-400/40'
                    : 'bg-gradient-to-tr from-maroon-800 to-maroon-900 text-amber-100 shadow-maroon-900/30 hover:scale-105'
                }`}>
                  <Icon className="w-6 h-6 animate-pulse" />
                  {item.badge && (
                    <span className="absolute -top-1 -right-1 bg-amber-400 text-maroon-950 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-md border-2 border-white animate-bounce">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className={`text-[10px] mt-1 font-bold transition-colors ${
                  active ? 'text-maroon-800' : 'text-slate-600'
                }`}>
                  {item.label}
                </span>
              </NavLink>
            );
          }

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-200 ${
                active 
                  ? 'text-maroon-800 font-bold scale-105' 
                  : 'text-slate-500 hover:text-slate-800 font-medium'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${active ? 'scale-110 stroke-[2.5]' : 'stroke-[1.75]'}`} />
                {active && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-maroon-700 rounded-full" />
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight">
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
