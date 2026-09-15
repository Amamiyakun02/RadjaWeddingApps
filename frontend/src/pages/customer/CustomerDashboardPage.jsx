import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, CreditCard, Upload, FileText, Star, 
  CheckCircle, AlertCircle, Clock, X, Eye, 
  ArrowRight, ShieldCheck, Download, Copy, Check
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { formatIDR, formatDate, getStatusBadge, generateGoogleCalendarUrl } from '../../utils/formatters';

export default function CustomerDashboardPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [uploadModalBooking, setUploadModalBooking] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentType, setPaymentType] = useState('dp');
  const [paymentMethod, setPaymentMethod] = useState('transfer_bank');
  const [proofFile, setProofFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Review Modal
  const [reviewModalBooking, setReviewModalBooking] = useState(null);
  const [rating, setRating] = useState(5);
  const [reviewContent, setReviewContent] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Invoice Modal
  const [invoiceBookingId, setInvoiceBookingId] = useState(null);

  const [toastMsg, setToastMsg] = useState('');
  const [copiedBank, setCopiedBank] = useState('');

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await api.getCustomerBookings();
      setBookings(res);
    } catch (err) {
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  const handleCopy = (text, bankKey) => {
    navigator.clipboard.writeText(text);
    setCopiedBank(bankKey);
    setTimeout(() => setCopiedBank(''), 2000);
  };

  const handleUploadPayment = async (e) => {
    e.preventDefault();
    if (!uploadModalBooking) return;
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('amount', paymentAmount);
      formData.append('type', paymentType);
      formData.append('method', paymentMethod);
      if (proofFile) {
        formData.append('proof_file', proofFile);
      }

      await api.uploadPaymentProof(uploadModalBooking.id, formData);
      triggerToast('Bukti pembayaran berhasil diunggah! Menunggu verifikasi admin.');
      setUploadModalBooking(null);
      setProofFile(null);
      fetchBookings();
    } catch (err) {
      alert(err.message || 'Gagal mengunggah bukti transfer.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewModalBooking || !reviewContent.trim()) return;
    setSubmittingReview(true);

    try {
      await api.submitTestimonial({
        booking_id: reviewModalBooking.id,
        customer_name: user.name,
        rating: rating,
        content: reviewContent,
        event_name: reviewModalBooking.event_type
      });
      triggerToast('Terima kasih! Ulasan Anda telah terkirim dan akan ditampilkan setelah disetujui.');
      setReviewModalBooking(null);
      setReviewContent('');
    } catch (err) {
      alert(err.message || 'Gagal mengirim ulasan.');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8">
      
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-20 sm:top-24 inset-x-4 sm:inset-x-auto sm:right-6 z-50 bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center justify-center sm:justify-start gap-2 animate-fadeIn font-semibold text-xs sm:text-sm">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-maroon-100 pb-6">
        <div>
          <span className="px-3 py-1 rounded-full bg-maroon-50 text-maroon-900 text-[10px] sm:text-xs font-bold uppercase tracking-wider border border-maroon-200">
            Portal Pelanggan
          </span>
          <h1 className="font-serif text-2xl sm:text-4xl font-extrabold text-slate-900 mt-1.5 leading-tight">
            Riwayat Pemesanan & Pembayaran
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Pantau status pesanan, unggah bukti pembayaran transfer/QRIS, dan cetak invoice resmi Anda.
          </p>
        </div>

        <Link
          to="/kustom-paket"
          className="self-start sm:self-auto px-5 py-2.5 sm:px-6 sm:py-3 rounded-2xl bg-maroon-700 hover:bg-maroon-800 active:scale-95 text-white text-xs font-bold shadow-md shadow-maroon-700/20 flex items-center gap-2"
        >
          <span>+ Buat Reservasi Baru</span>
        </Link>
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="text-center py-16 space-y-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 border-4 border-maroon-700 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-500 font-semibold">Memuat riwayat pemesanan Anda...</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-white p-8 sm:p-12 rounded-3xl text-center border border-slate-200 shadow-sm space-y-4 max-w-xl mx-auto">
          <Calendar className="w-10 h-10 sm:w-12 sm:h-12 text-maroon-600 mx-auto" />
          <h3 className="font-serif font-bold text-lg sm:text-xl text-slate-800">Belum Ada Riwayat Pemesanan</h3>
          <p className="text-xs text-slate-500">
            Anda belum melakukan reservasi busana atau rias wedding. Jelajahi katalog kami sekarang!
          </p>
          <Link
            to="/katalog"
            className="inline-block px-6 py-3 rounded-2xl bg-maroon-700 hover:bg-maroon-800 text-white text-xs font-bold shadow-md"
          >
            Buka Katalog & Paket
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {bookings.map((booking) => {
            const verifiedPaymentsSum = booking.payments
              ? booking.payments.filter(p => p.status === 'verified').reduce((sum, p) => sum + p.amount, 0)
              : 0;
            const remainingBalance = Math.max(0, booking.total_price - verifiedPaymentsSum);

            return (
              <div
                key={booking.id}
                className="bg-white rounded-3xl border border-slate-200 hover:border-maroon-300 shadow-xs hover:shadow-md transition-all overflow-hidden"
              >
                {/* Booking Header Card */}
                <div className="p-4 sm:p-6 bg-slate-50/80 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                      <span className="font-serif font-bold text-base sm:text-lg text-slate-900">
                        {booking.booking_code}
                      </span>
                      {getStatusBadge(booking.status)}
                    </div>
                    <p className="text-[11px] sm:text-xs text-slate-500">
                      Dipesan: {formatDate(booking.created_at)} • Acara: <strong className="capitalize text-slate-700">{booking.event_type}</strong>
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-2 sm:pt-0">
                    <a
                      href={generateGoogleCalendarUrl(booking)}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl sm:rounded-2xl bg-white border border-maroon-200 hover:bg-maroon-50 text-maroon-800 text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors"
                      title="Tambahkan acara ini ke Google Calendar"
                    >
                      <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-maroon-700" />
                      + Google Calendar
                    </a>
                    <a
                      href={`http://localhost:8000/api/v1/calendar/booking/${booking.id}.ics`}
                      download={`radja_wedding_${booking.booking_code}.ics`}
                      className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl sm:rounded-2xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-2xs"
                      title="Unduh file kalender .ics"
                    >
                      <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-500" />
                      .ICS
                    </a>
                    <button
                      onClick={() => setInvoiceBookingId(booking.id)}
                      className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl sm:rounded-2xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-2xs"
                    >
                      <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-maroon-700" />
                      Invoice
                    </button>
                    {booking.status === 'completed' && (
                      <button
                        onClick={() => setReviewModalBooking(booking)}
                        className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl sm:rounded-2xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs"
                      >
                        <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-white" />
                        Beri Ulasan
                      </button>
                    )}
                  </div>
                </div>

                {/* Booking Details Grid */}
                <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
                  
                  {/* Left: Schedule & Items */}
                  <div className="lg:col-span-7 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 text-xs bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                      <div>
                        <span className="text-slate-400 font-medium">Jadwal Tanggal Acara:</span>
                        <p className="font-bold text-slate-800 mt-0.5">
                          {formatDate(booking.start_date)} s/d {formatDate(booking.end_date)}
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-400 font-medium">Alamat & Lokasi:</span>
                        <p className="font-bold text-slate-800 mt-0.5 truncate">
                          {booking.location_address}
                        </p>
                      </div>
                    </div>

                    {/* Selected items breakdown */}
                    <div className="space-y-1.5">
                      <p className="text-xs font-bold text-slate-700 uppercase">Rincian Paket & Item:</p>
                      <div className="space-y-1 text-xs text-slate-600">
                        {booking.selected_bundles?.map(b => (
                          <div key={b.id} className="flex justify-between py-1 border-b border-slate-100">
                            <span className="font-semibold text-slate-800 truncate mr-2">[Bundle] {b.name}</span>
                            <span className="font-bold text-maroon-800 shrink-0">{formatIDR(b.price_snapshot)}</span>
                          </div>
                        ))}
                        {booking.custom_items?.map(i => (
                          <div key={i.id} className="flex justify-between py-1 border-b border-slate-100">
                            <span className="truncate mr-2">{i.quantity}x {i.name}</span>
                            <span className="font-bold text-maroon-800 shrink-0">{formatIDR(i.price_snapshot * i.quantity)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {booking.notes && (
                      <div className="p-3 bg-amber-50/60 rounded-2xl border border-amber-200/70 text-xs text-amber-900">
                        <strong>Catatan Anda:</strong> {booking.notes}
                      </div>
                    )}
                  </div>

                  {/* Right: Payment Overview & Upload Button */}
                  <div className="lg:col-span-5 bg-[#FAF2F4] p-4 sm:p-5 rounded-3xl border border-maroon-200 space-y-4 flex flex-col justify-between">
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between text-slate-600">
                        <span>Total Kontrak Sewa:</span>
                        <span className="font-serif font-bold text-sm text-slate-900">{formatIDR(booking.total_price)}</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Minimum DP (30%):</span>
                        <span className="font-bold text-maroon-800">{formatIDR(booking.dp_amount)}</span>
                      </div>
                      <div className="flex justify-between text-emerald-700 font-semibold">
                        <span>Pembayaran Terverifikasi:</span>
                        <span>{formatIDR(verifiedPaymentsSum)}</span>
                      </div>
                      <hr className="border-maroon-200 my-1" />
                      <div className="flex justify-between font-bold text-slate-900 text-sm">
                        <span>Sisa Tagihan:</span>
                        <span className="text-rose-700">{formatIDR(remainingBalance)}</span>
                      </div>
                    </div>

                    {/* Quick Bank Accounts for Transfer with Copy Button */}
                    {remainingBalance > 0 && (
                      <div className="p-3 bg-white rounded-2xl border border-maroon-200/80 space-y-2 text-xs">
                        <p className="text-[10px] font-bold text-slate-500 uppercase">Rekening Transfer Resmi:</p>
                        <div className="flex items-center justify-between p-1.5 rounded-xl bg-slate-50 border border-slate-200">
                          <div>
                            <span className="font-semibold text-slate-800">BCA 8820-1234-9988</span>
                            <p className="text-[10px] text-slate-400">a.n Radja Wedding</p>
                          </div>
                          <button
                            onClick={() => handleCopy('882012349988', 'bca')}
                            className="p-1.5 rounded-lg bg-white hover:bg-slate-200 text-maroon-800 font-semibold text-[10px] flex items-center gap-1 border border-slate-200"
                          >
                            {copiedBank === 'bca' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedBank === 'bca' ? 'Tersalin' : 'Salin'}</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Payment Upload Action */}
                    {booking.status !== 'completed' && booking.status !== 'cancelled' && (
                      <button
                        onClick={() => {
                          setUploadModalBooking(booking);
                          setPaymentAmount(remainingBalance > 0 ? (booking.status === 'pending' ? booking.dp_amount : remainingBalance) : 0);
                          setPaymentType(booking.status === 'pending' ? 'dp' : 'pelunasan');
                        }}
                        className="w-full py-3 rounded-2xl bg-maroon-700 hover:bg-maroon-800 active:scale-98 text-white font-bold text-xs shadow-md shadow-maroon-700/20 flex items-center justify-center gap-2 transition-all"
                      >
                        <Upload className="w-4 h-4" />
                        Unggah Bukti Transfer / DP
                      </button>
                    )}
                  </div>

                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: UPLOAD PAYMENT PROOF (Mobile bottom sheet) */}
      {uploadModalBooking && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
          <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl border border-slate-200 animate-slideUp max-h-[92vh] flex flex-col justify-between">
            <div className="p-4 sm:p-5 bg-gradient-to-r from-maroon-900 to-maroon-800 text-white flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-base sm:text-lg text-amber-200">Unggah Bukti Pembayaran</h3>
                <p className="text-[11px] text-slate-300">Kode: {uploadModalBooking.booking_code}</p>
              </div>
              <button
                onClick={() => setUploadModalBooking(null)}
                className="p-1.5 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadPayment} className="p-4 sm:p-6 space-y-3.5 text-xs overflow-y-auto">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Jenis Pembayaran
                </label>
                <select
                  value={paymentType}
                  onChange={(e) => setPaymentType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white"
                >
                  <option value="dp">Down Payment (DP 30%)</option>
                  <option value="pelunasan">Pelunasan Sisa Tagihan</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Metode Pembayaran
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white"
                >
                  <option value="transfer_bank">Transfer Bank (BCA / Mandiri)</option>
                  <option value="qris">Scan QRIS Instant</option>
                  <option value="cash">Tunai di Salon</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Nominal yang Ditransfer (Rp)
                </label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Foto Bukti Transfer (Struk / Screenshot m-Banking)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setProofFile(e.target.files[0])}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-slate-50"
                />
              </div>

              <div className="p-3 bg-maroon-50 border border-maroon-200 rounded-xl text-maroon-900 text-[11px] leading-relaxed">
                ℹ️ Setelah diunggah, admin akan memvalidasi bukti Anda dalam 1-2 jam dan status booking akan otomatis terupdate.
              </div>

              <div className="pt-2 flex justify-end gap-2 pb-safe">
                <button
                  type="button"
                  onClick={() => setUploadModalBooking(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={uploading || paymentAmount <= 0}
                  className="px-5 py-2.5 rounded-xl bg-maroon-700 hover:bg-maroon-800 text-white font-bold shadow-md shadow-maroon-700/20 disabled:opacity-50"
                >
                  {uploading ? 'Mengunggah...' : 'Kirim Bukti'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: PRINTABLE INVOICE VIEW */}
      {invoiceBookingId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-4xl h-[90vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <span className="font-serif font-bold text-amber-300 text-xs sm:text-sm">Preview Invoice Resmi</span>
              <button onClick={() => setInvoiceBookingId(null)} className="p-1 rounded-full hover:bg-white/10" aria-label="Tutup">
                <X className="w-5 h-5" />
              </button>
            </div>
            <iframe
              src={`http://localhost:8000/api/v1/customer/bookings/${invoiceBookingId}/invoice`}
              className="w-full flex-1 border-0"
              title="Invoice"
            />
            <div className="p-3 bg-slate-100 flex justify-end">
              <button
                onClick={() => setInvoiceBookingId(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 text-white text-xs font-semibold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: SUBMIT TESTIMONIAL */}
      {reviewModalBooking && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
          <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl p-5 sm:p-6 space-y-4 animate-slideUp">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-serif font-bold text-base sm:text-lg text-slate-900">Beri Ulasan Pelayanan</h3>
              <button onClick={() => setReviewModalBooking(null)} className="p-1 rounded-full text-slate-400" aria-label="Tutup">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Rating Kepuasan (Bintang)
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 touch-manipulation"
                    >
                      <Star className={`w-7 h-7 sm:w-6 sm:h-6 ${star <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Cerita & Pengalaman Anda
                </label>
                <textarea
                  rows={4}
                  value={reviewContent}
                  onChange={(e) => setReviewContent(e.target.value)}
                  placeholder="Bagikan kesan Anda mengenai busana, hasil rias MUA, dan kenyamanan layanan..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-maroon-600 text-xs sm:text-sm"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 pb-safe">
                <button
                  type="button"
                  onClick={() => setReviewModalBooking(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-5 py-2.5 rounded-xl bg-maroon-700 hover:bg-maroon-800 text-white font-bold shadow-md shadow-maroon-700/20"
                >
                  {submittingReview ? 'Mengirim...' : 'Kirim Ulasan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
