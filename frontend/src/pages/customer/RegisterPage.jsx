import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Crown, Mail, Lock, User, Phone, MapPin, Sparkles, Check, AlertCircle, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function RegisterPage() {
  const [step, setStep] = useState(1); // 1: Form, 2: WhatsApp OTP
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    whatsapp: '',
    address: ''
  });
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { registerCustomer } = useAuth();
  const navigate = useNavigate();

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await registerCustomer(formData);
      setStep(2);
    } catch (err) {
      setError(err.message || 'Pendaftaran gagal.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerify = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      navigate('/');
    } catch (err) {
      setError(err.message || 'Kode OTP salah.');
    } finally {
      setLoading(false);
    }
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
            {step === 1 ? 'Daftar Akun Calon Pengantin' : 'Verifikasi OTP WhatsApp'}
          </h1>
          <p className="text-xs text-slate-500">
            {step === 1 
              ? 'Lengkapi data untuk kemudahan reservasi dan kustomisasi busana.'
              : `Masukkan kode 6 digit OTP yang dikirim ke nomor ${formData.whatsapp || 'WhatsApp Anda'}.`
            }
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Nama Lengkap / Mempelai
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Nisa & Rizky"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-maroon-600"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Alamat Email Aktif
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@anda.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-maroon-600"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Nomor WhatsApp Aktif
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="tel"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  placeholder="081234567890"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-maroon-600"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Alamat Domisili
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Kota / Alamat Kediaman"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-maroon-600"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Kata Sandi (Minimal 6 Karakter)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-maroon-600"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-maroon-800 via-maroon-700 to-maroon-900 hover:from-maroon-900 hover:to-maroon-800 text-white font-bold text-sm shadow-md shadow-maroon-900/20 transition-all flex items-center justify-center gap-2"
            >
              {loading ? 'Mendaftarkan...' : 'Lanjut ke Verifikasi'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleOtpVerify} className="space-y-4 text-xs">
            <div className="p-3.5 bg-emerald-50 text-emerald-900 rounded-2xl border border-emerald-200 text-center">
              <ShieldCheck className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
              <p className="font-semibold">Kode OTP Simulasi: <strong>123456</strong></p>
              <p className="text-[10px] text-emerald-700">Dalam mode simulasi, Anda dapat langsung memasukkan 123456.</p>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1 text-center">
                Kode OTP 6 Digit
              </label>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                className="w-full py-3 text-center text-xl font-mono tracking-widest rounded-xl border border-slate-300 focus:ring-2 focus:ring-maroon-600 font-bold"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-maroon-700 hover:bg-maroon-800 text-white font-bold text-sm shadow-md"
            >
              {loading ? 'Memvalidasi...' : 'Verifikasi & Selesai'}
            </button>
          </form>
        )}

        <p className="text-center text-xs text-slate-500">
          Sudah memiliki akun?{' '}
          <Link to="/login" className="font-bold text-maroon-700 hover:underline">
            Masuk di Sini
          </Link>
        </p>

      </div>
    </div>
  );
}
