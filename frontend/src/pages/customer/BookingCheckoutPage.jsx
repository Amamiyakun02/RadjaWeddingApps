import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ShieldCheck, CreditCard, Calendar, MapPin, 
  ShoppingBag, CheckCircle, AlertCircle, ArrowLeft, 
  Crown, QrCode, FileText, Check, Copy, Download
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../../context/AuthContext';
import { useBooking } from '../../context/BookingContext';
import { api } from '../../services/api';
import { formatIDR, formatDate, generateGoogleCalendarUrl } from '../../utils/formatters';

export default function BookingCheckoutPage() {
  const { user } = useAuth();
  const { 
    selectedBundles, 
    customItems, 
    eventType,
    startDate,
    endDate,
    locationAddress,
    notes,
    setNotes,
    daysCount,
    bundlesTotal,
    customItemsTotal,
    grandTotal,
    minimumDp,
    clearCart
  } = useBooking();

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successBooking, setSuccessBooking] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('bca');
  const [copiedKey, setCopiedKey] = useState('');

  const navigate = useNavigate();

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(''), 2000);
  };

  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login?redirect=/booking');
      return;
    }

    if (selectedBundles.length === 0 && customItems.length === 0) {
      setErrorMsg('Keranjang reservasi Anda masih kosong.');
      return;
    }

    if (!startDate || !endDate || !locationAddress.trim()) {
      setErrorMsg('Mohon lengkapi tanggal dan lokasi acara.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      const payload = {
        event_type: eventType,
        location_address: locationAddress,
        start_date: startDate,
        end_date: endDate,
        notes: notes,
        selected_bundles: selectedBundles.map(b => ({ bundle_id: b.id })),
        custom_items: customItems.map(i => ({ product_id: i.id, quantity: i.quantity }))
      };

      const res = await api.createBooking(payload);
      setSuccessBooking(res);
      clearCart();

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

    } catch (err) {
      setErrorMsg(err.message || 'Terjadi kesalahan saat memproses booking.');
    } finally {
      setSubmitting(false);
    }
  };

  if (successBooking) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10 sm:py-16 text-center space-y-6 sm:space-y-8 animate-fadeIn">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
          <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10" />
        </div>
        
        <div className="space-y-2 sm:space-y-3">
          <h1 className="font-serif text-2xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
            Pemesanan Berhasil Diajukan!
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm max-w-md mx-auto">
            Nomor referensi pesanan Anda adalah <strong className="text-maroon-800 font-mono text-base">{successBooking.booking_code}</strong>.
          </p>
        </div>

        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-md text-left space-y-4">
          <h3 className="font-serif font-bold text-base sm:text-lg text-slate-900 border-b border-slate-100 pb-3">
            Instruksi Pembayaran Down Payment (DP)
          </h3>
          <div className="text-xs text-slate-600 space-y-3">
            <p>1. Silakan transfer nominal minimum DP sebesar <strong className="text-maroon-800 text-sm">{formatIDR(successBooking.dp_amount)}</strong> ke salah satu rekening resmi berikut:</p>
            
            <div className="space-y-2">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-800">🏦 Bank Central Asia (BCA)</p>
                  <p className="font-mono text-slate-900 font-bold text-sm">8820-1234-9988</p>
                  <p className="text-[10px] text-slate-400">a.n Radja Wedding</p>
                </div>
                <button
                  onClick={() => handleCopy('882012349988', 'bca')}
                  className="px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-100 text-slate-700 flex items-center gap-1"
                >
                  {copiedKey === 'bca' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'bca' ? 'Tersalin' : 'Salin'}</span>
                </button>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-800">🏦 Bank Mandiri</p>
                  <p className="font-mono text-slate-900 font-bold text-sm">137-00-9876-5432</p>
                  <p className="text-[10px] text-slate-400">a.n Radja Wedding</p>
                </div>
                <button
                  onClick={() => handleCopy('1370098765432', 'mandiri')}
                  className="px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-100 text-slate-700 flex items-center gap-1"
                >
                  {copiedKey === 'mandiri' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'mandiri' ? 'Tersalin' : 'Salin'}</span>
                </button>
              </div>
            </div>

            <p>2. Setelah transfer, buka menu <strong>Riwayat Pemesanan</strong> untuk mengunggah foto bukti pembayaran.</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          <a
            href={generateGoogleCalendarUrl(successBooking)}
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto px-5 sm:px-6 py-3.5 rounded-2xl bg-white border border-maroon-300 hover:bg-maroon-50 text-maroon-800 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            <Calendar className="w-4 h-4 text-maroon-700" />
            + Tambah ke Google Calendar
          </a>
          <a
            href={`http://localhost:8000/api/v1/calendar/booking/${successBooking.id}.ics`}
            download={`radja_wedding_${successBooking.booking_code}.ics`}
            className="w-full sm:w-auto px-4 py-3.5 rounded-2xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-sm"
          >
            <Download className="w-4 h-4 text-slate-500" />
            Unduh Kalender (.ICS)
          </a>
          <Link
            to="/riwayat"
            className="w-full sm:w-auto px-6 sm:px-8 py-3.5 rounded-2xl bg-maroon-700 hover:bg-maroon-800 text-white font-bold text-xs sm:text-sm shadow-md active:scale-98"
          >
            Buka Riwayat & Unggah Bukti Bayar
          </Link>
          <Link
            to="/"
            className="w-full sm:w-auto px-5 sm:px-6 py-3.5 rounded-2xl border border-slate-300 text-slate-700 font-semibold text-xs sm:text-sm hover:bg-slate-50"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 sm:space-y-8">
      
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <Link to="/kustom-paket" className="hover:text-maroon-700 flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Rakitan
        </Link>
        <span>/</span>
        <span className="text-slate-900">Formulir Checkout Reservasi</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        
        {/* LEFT: Checkout Form & Payment Instruction */}
        <div className="lg:col-span-7 space-y-6 sm:space-y-8">
          
          <div className="bg-white p-4 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5">
            <h2 className="font-serif font-bold text-xl sm:text-2xl text-slate-900 border-b border-slate-100 pb-3">
              Konfirmasi Data Pemesan
            </h2>

            {!user ? (
              <div className="p-4 bg-maroon-50 rounded-2xl border border-maroon-200 text-xs text-maroon-900 flex items-center justify-between">
                <span>Anda belum masuk. Silakan login agar riwayat tersimpan di akun Anda.</span>
                <Link to="/login?redirect=/booking" className="font-bold underline text-maroon-950 ml-2 shrink-0">
                  Masuk
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <p className="text-slate-400 font-medium">Nama Pemesan</p>
                  <p className="font-bold text-sm text-slate-900 mt-0.5">{user.name}</p>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <p className="text-slate-400 font-medium">Email Terdaftar</p>
                  <p className="font-bold text-sm text-slate-900 mt-0.5 truncate">{user.email}</p>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 sm:col-span-2">
                  <p className="text-slate-400 font-medium">Nomor WhatsApp</p>
                  <p className="font-bold text-sm text-slate-900 mt-0.5">{user.whatsapp || 'Belum diatur'}</p>
                </div>
              </div>
            )}

            <div className="space-y-3 pt-2">
              <h3 className="font-serif font-bold text-base sm:text-lg text-slate-900">
                Pilihan Rekening Pembayaran Manual
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedPaymentMethod('bca')}
                  className={`p-3.5 sm:p-4 rounded-2xl border text-left transition-all ${
                    selectedPaymentMethod === 'bca' 
                      ? 'border-maroon-600 bg-maroon-50/70 shadow-2xs' 
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <p className="font-bold text-xs text-slate-900">Bank BCA</p>
                  <p className="text-[11px] text-slate-500 mt-0.5 font-mono">8820-1234-9988</p>
                  <p className="text-[10px] text-maroon-700 font-semibold mt-0.5">a.n Radja Wedding</p>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedPaymentMethod('mandiri')}
                  className={`p-3.5 sm:p-4 rounded-2xl border text-left transition-all ${
                    selectedPaymentMethod === 'mandiri' 
                      ? 'border-maroon-600 bg-maroon-50/70 shadow-2xs' 
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <p className="font-bold text-xs text-slate-900">Bank Mandiri</p>
                  <p className="text-[11px] text-slate-500 mt-0.5 font-mono">137-00-9876-5432</p>
                  <p className="text-[10px] text-maroon-700 font-semibold mt-0.5">a.n Radja Wedding</p>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedPaymentMethod('qris')}
                  className={`p-3.5 sm:p-4 rounded-2xl border text-left transition-all ${
                    selectedPaymentMethod === 'qris' 
                      ? 'border-maroon-600 bg-maroon-50/70 shadow-2xs' 
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <p className="font-bold text-xs text-slate-900">Scan QRIS Instant</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Semua E-Wallet</p>
                  <p className="text-[10px] text-maroon-700 font-semibold mt-0.5">BCA / Gopay / OVO</p>
                </button>
              </div>

              {selectedPaymentMethod === 'qris' && (
                <div className="p-4 bg-slate-900 text-white rounded-2xl flex items-center gap-3 sm:gap-4 animate-fadeIn">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white p-1.5 rounded-xl shrink-0 flex items-center justify-center">
                    <QrCode className="w-10 h-10 sm:w-12 sm:h-12 text-slate-900" />
                  </div>
                  <div className="text-xs space-y-0.5 sm:space-y-1">
                    <p className="font-bold text-amber-300">QRIS Radja Wedding Salon</p>
                    <p className="text-slate-300 text-[11px]">NMID: ID1020304050607</p>
                    <p className="text-slate-400 text-[10px]">Dapat di-scan via BCA, Mandiri, BRI, GoPay, ShopeePay, OVO, & DANA.</p>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Catatan Tambahan untuk Stylist / MUA
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Misal: Warna jilbab senada gaun pengantin wanita, request jam tiba MUA pukul 05:00 WIB..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-maroon-600 text-xs"
              />
            </div>

          </div>

        </div>

        {/* RIGHT: Order Summary */}
        <div className="lg:col-span-5 sticky top-24 space-y-6">
          
          <div className="bg-white p-5 sm:p-8 rounded-3xl border border-maroon-200 shadow-xl space-y-5">
            <h3 className="font-serif font-bold text-lg sm:text-xl text-slate-900 border-b border-slate-100 pb-3">
              Ringkasan Reservasi
            </h3>

            <div className="space-y-2 text-xs text-slate-600 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-500">Jenis Acara:</span>
                <span className="font-bold text-slate-800 capitalize">{eventType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tanggal Acara:</span>
                <span className="font-bold text-slate-800">{formatDate(startDate)} s/d {formatDate(endDate)} ({daysCount} Hari)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Lokasi:</span>
                <span className="font-bold text-slate-800 truncate max-w-[180px]">{locationAddress || '-'}</span>
              </div>
            </div>

            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 text-xs">
              {selectedBundles.map(b => (
                <div key={b.id} className="flex justify-between items-center py-1.5 border-b border-slate-100">
                  <span className="font-semibold text-slate-800 truncate mr-2">[Bundle] {b.bundle_name}</span>
                  <span className="font-bold text-maroon-800 shrink-0">{formatIDR(b.package_price)}</span>
                </div>
              ))}
              {customItems.map(i => (
                <div key={i.id} className="flex justify-between items-center py-1.5 border-b border-slate-100">
                  <span className="font-semibold text-slate-800 truncate mr-2">{i.quantity}x {i.name}</span>
                  <span className="font-bold text-maroon-800 shrink-0">{formatIDR(i.price_per_day * i.quantity * daysCount)}</span>
                </div>
              ))}
            </div>

            <div className="space-y-2 text-xs border-t border-slate-200 pt-3">
              <div className="flex justify-between font-bold text-sm text-slate-900">
                <span>Total Nilai Sewa:</span>
                <span className="font-serif text-lg text-slate-950">{formatIDR(grandTotal)}</span>
              </div>
              <div className="flex justify-between font-bold text-xs text-maroon-900 bg-maroon-50 p-2.5 rounded-xl border border-maroon-200">
                <span>Wajib Down Payment (DP 30%):</span>
                <span className="font-serif text-sm text-maroon-800">{formatIDR(minimumDp)}</span>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 text-rose-800 border border-rose-200 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              onClick={handleSubmitBooking}
              disabled={submitting}
              className="w-full py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-maroon-800 via-maroon-700 to-maroon-900 hover:from-maroon-900 hover:to-maroon-800 active:scale-98 text-white font-bold text-xs sm:text-sm shadow-xl shadow-maroon-900/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? 'Memproses Reservasi...' : 'Kirim Pengajuan Booking & Kunci Jadwal'}
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}
