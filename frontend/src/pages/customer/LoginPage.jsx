import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Crown, Mail, Lock, Sparkles, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { loginCustomer } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/';

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await loginCustomer(email, password);
      navigate(redirectPath);
    } catch (err) {
      setError(err.message || 'Login gagal. Periksa email & kata sandi Anda.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoCustomer = () => {
    setEmail('amamiya@wedding.com');
    setPassword('customer123');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 bg-[#FAF2F4]">
      <div className="bg-white w-full max-w-md p-8 sm:p-10 rounded-3xl border border-maroon-200 shadow-xl space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-maroon-900 to-maroon-700 flex items-center justify-center text-amber-200 mx-auto shadow-md shadow-maroon-900/20">
            <Crown className="w-6 h-6" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-slate-900">
            Masuk ke Akun Pengantin
          </h1>
          <p className="text-xs text-slate-500">
            Akses riwayat pesanan dan unggah bukti transfer DP Anda.
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Quick Demo Customer Selector */}
        <div className="p-3.5 bg-maroon-50 rounded-2xl border border-maroon-200 text-center space-y-2">
          <p className="text-[11px] font-bold text-maroon-900">Coba Akun Demo Pengantin:</p>
          <button
            type="button"
            onClick={handleQuickDemoCustomer}
            className="w-full py-2 px-3 rounded-xl bg-white hover:bg-maroon-100 text-maroon-900 text-xs font-semibold border border-maroon-300 shadow-2xs transition-colors flex items-center justify-center gap-2"
          >
            <span>💍 Masuk Cepat sebagai Pengantin Demo</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">
              Alamat Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-maroon-600"
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
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-maroon-600"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-maroon-800 via-maroon-700 to-maroon-900 hover:from-maroon-900 hover:to-maroon-800 text-white font-bold text-sm shadow-md shadow-maroon-900/20 transition-all flex items-center justify-center gap-2"
          >
            {loading ? 'Memvalidasi...' : 'Masuk Sekarang'}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500">
          Belum memiliki akun?{' '}
          <Link to="/register" className="font-bold text-maroon-700 hover:underline">
            Daftar Gratis di Sini
          </Link>
        </p>

      </div>
    </div>
  );
}
