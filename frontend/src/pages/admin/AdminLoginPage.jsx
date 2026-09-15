import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown, Lock, Mail, Shield, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginAdmin } = useAuth();
  const navigate = useNavigate();

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await loginAdmin(email, password);
      navigate('/admin');
    } catch (err) {
      setError(err.message || 'Kredensial Admin tidak valid.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoOwner = () => {
    setEmail('admin@radja.com');
    setPassword('admin123');
  };

  const handleQuickDemoStaff = () => {
    setEmail('staf@radja.com');
    setPassword('staf123');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FAF0F2] via-[#FAF7F8] to-[#FCFAF9] flex items-center justify-center px-4 py-16 text-slate-800">
      <div className="bg-white w-full max-w-md p-8 sm:p-10 rounded-3xl border border-maroon-100 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-maroon-900 to-maroon-700 flex items-center justify-center text-amber-200 font-bold mx-auto shadow-lg shadow-maroon-900/20">
            <Crown className="w-7 h-7" />
          </div>
          <h1 className="font-serif text-2xl font-extrabold text-slate-900 tracking-wide">
            Portal Masuk Administrator
          </h1>
          <p className="text-xs text-slate-500">
            Sistem Manajemen & Kontrol Operasional Radja Wedding
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Quick Demo Credentials */}
        <div className="p-3.5 bg-[#FAF2F4] rounded-2xl border border-maroon-200/70 space-y-2">
          <p className="text-[11px] font-bold text-maroon-900 text-center">Akses Demo Cepat:</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleQuickDemoOwner}
              className="py-2 px-2.5 rounded-xl bg-white hover:bg-maroon-50 text-maroon-900 text-xs font-bold border border-maroon-200 transition-colors shadow-2xs"
            >
              👑 Owner (Penuh)
            </button>
            <button
              type="button"
              onClick={handleQuickDemoStaff}
              className="py-2 px-2.5 rounded-xl bg-white hover:bg-maroon-50 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors shadow-2xs"
            >
              📋 Kasir / Staf
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleAdminLogin} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">
              Email Administrator
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@radja.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-maroon-600 font-medium"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">
              Kata Sandi
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-maroon-600 font-medium"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-maroon-800 via-maroon-700 to-maroon-900 hover:from-maroon-900 hover:to-maroon-800 text-white font-bold text-sm shadow-lg shadow-maroon-900/20 transition-all flex items-center justify-center gap-2 active:scale-98"
          >
            {loading ? 'Memvalidasi...' : 'Masuk ke Dashboard'}
          </button>
        </form>

      </div>
    </div>
  );
}
