import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  DollarSign, CalendarCheck, Clock, ShoppingBag, 
  MessageSquare, Sparkles, ArrowRight, ShieldCheck, 
  CheckCircle, AlertCircle, Eye, User
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { formatIDR, formatDate, getStatusBadge } from '../../utils/formatters';

export default function AdminDashboard() {
  const { admin, isOwner } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const res = await api.getDashboardMetrics();
      setMetrics(res);
    } catch (err) {
      console.error('Error loading dashboard metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-10 space-y-6 sm:space-y-8 max-w-7xl mx-auto text-slate-800">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-maroon-100 pb-5 sm:pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-maroon-50 text-maroon-800 border border-maroon-200 uppercase tracking-wider">
              {isOwner ? 'Executive Dashboard' : 'Staf Dashboard'}
            </span>
            <span className="text-xs text-slate-500">Selamat datang, <strong className="text-slate-800">{admin?.full_name || 'Admin'}</strong></span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Ringkasan Operasional & Keuangan
          </h1>
        </div>

        {/* Action quick shortcut */}
        <div className="flex items-center gap-3">
          <Link
            to="/admin/ai-assistant"
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-maroon-800 via-maroon-700 to-maroon-900 hover:from-maroon-900 hover:to-maroon-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-maroon-900/20 active:scale-95 transition-transform"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            AI Executive Assistant (MCP)
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 text-xs">Memuat data metrik...</div>
      ) : metrics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          
          {/* Card 1: Total Revenue */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-maroon-100 shadow-xs space-y-2 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-semibold uppercase">Kas Masuk Terverifikasi</span>
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <p className="font-serif text-2xl sm:text-3xl font-bold text-emerald-700">
              {formatIDR(metrics.total_revenue)}
            </p>
            <p className="text-[11px] text-slate-500">
              Bulan berjalan: <strong className="text-slate-800">{formatIDR(metrics.monthly_revenue)}</strong>
            </p>
          </div>

          {/* Card 2: Pending Bookings */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-maroon-100 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-semibold uppercase">Booking Menunggu</span>
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <p className="font-serif text-3xl font-bold text-amber-700">
              {metrics.pending_bookings} <span className="text-xs font-normal text-slate-500">pesanan</span>
            </p>
            <Link to="/admin/booking?status=pending" className="text-[11px] text-maroon-700 font-bold hover:underline flex items-center gap-1">
              Validasi Pesanan &rarr;
            </Link>
          </div>

          {/* Card 3: Confirmed / Active Bookings */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-maroon-100 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-semibold uppercase">Booking Terkonfirmasi</span>
              <div className="w-10 h-10 rounded-2xl bg-maroon-50 text-maroon-800 flex items-center justify-center border border-maroon-200">
                <CalendarCheck className="w-5 h-5" />
              </div>
            </div>
            <p className="font-serif text-3xl font-bold text-maroon-800">
              {metrics.confirmed_bookings} <span className="text-xs font-normal text-slate-500">jadwal</span>
            </p>
            <Link to="/admin/kalender" className="text-[11px] text-maroon-700 font-bold hover:underline flex items-center gap-1">
              Buka Schedule Matrix &rarr;
            </Link>
          </div>

          {/* Card 4: Catalog & Reviews */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-maroon-100 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-semibold uppercase">Koleksi & Testimoni</span>
              <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center border border-purple-200">
                <MessageSquare className="w-5 h-5" />
              </div>
            </div>
            <p className="font-serif text-3xl font-bold text-purple-800">
              {metrics.total_products} <span className="text-xs font-normal text-slate-500">item aktif</span>
            </p>
            <p className="text-[11px] text-slate-500">
              Testimoni pending: <strong className="text-amber-700">{metrics.pending_testimonials}</strong>
            </p>
          </div>

        </div>
      )}

      {/* Quick Action Shortcuts */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <Link
          to="/admin/pembayaran"
          className="p-4 sm:p-5 rounded-2xl bg-white hover:bg-maroon-50/50 border border-maroon-100/90 shadow-2xs flex items-center justify-between transition-all group"
        >
          <div>
            <h4 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-maroon-800 transition-colors">
              Verifikasi Pembayaran Transfer
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">Cek struk & konfirmasi DP manual</p>
          </div>
          <ArrowRight className="w-4 h-4 text-maroon-600 group-hover:translate-x-1 transition-transform shrink-0 ml-2" />
        </Link>

        <Link
          to="/admin/kalender"
          className="p-4 sm:p-5 rounded-2xl bg-white hover:bg-maroon-50/50 border border-maroon-100/90 shadow-2xs flex items-center justify-between transition-all group"
        >
          <div>
            <h4 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-maroon-800 transition-colors">
              Kunci Jadwal Laundry / Maintenance
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">Tutup tanggal barang untuk pencucian & servis</p>
          </div>
          <ArrowRight className="w-4 h-4 text-maroon-600 group-hover:translate-x-1 transition-transform shrink-0 ml-2" />
        </Link>

        <Link
          to="/admin/produk"
          className="p-4 sm:p-5 rounded-2xl bg-white hover:bg-maroon-50/50 border border-maroon-100/90 shadow-2xs flex items-center justify-between transition-all group"
        >
          <div>
            <h4 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-maroon-800 transition-colors">
              Kelola Item & Stok Fisik
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">Tambah busana gaun atau properti baru</p>
          </div>
          <ArrowRight className="w-4 h-4 text-maroon-600 group-hover:translate-x-1 transition-transform shrink-0 ml-2" />
        </Link>
      </div>

      {/* Recent Bookings Table */}
      <div className="bg-white rounded-3xl border border-maroon-100 overflow-hidden shadow-xs">
        <div className="p-4 sm:p-6 border-b border-maroon-100 flex items-center justify-between bg-[#FAF2F4]/60">
          <div>
            <h3 className="font-serif font-bold text-base sm:text-lg text-slate-900">Aktivitas Pemesanan Terkini</h3>
            <p className="text-[11px] sm:text-xs text-slate-500">Daftar transaksi masuk dan jadwal acara terdekat.</p>
          </div>
          <Link to="/admin/booking" className="text-xs font-bold text-maroon-800 hover:underline">
            Lihat Semua &rarr;
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 min-w-[600px]">
            <thead className="bg-[#FAF2F4] text-maroon-950 uppercase text-[10px] tracking-wider border-b border-maroon-200/80">
              <tr>
                <th className="py-3.5 px-4 sm:px-6 font-bold">Kode Booking</th>
                <th className="py-3.5 px-4 sm:px-6 font-bold">Klien / Pemesan</th>
                <th className="py-3.5 px-4 sm:px-6 font-bold">Tanggal Acara</th>
                <th className="py-3.5 px-4 sm:px-6 font-bold">Total Nilai</th>
                <th className="py-3.5 px-4 sm:px-6 font-bold">Status</th>
                <th className="py-3.5 px-4 sm:px-6 font-bold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {metrics?.recent_bookings?.map((b) => (
                <tr key={b.id} className="hover:bg-maroon-50/30 transition-colors">
                  <td className="py-3.5 px-4 sm:px-6 font-mono font-bold text-slate-900">
                    {b.booking_code}
                  </td>
                  <td className="py-3.5 px-4 sm:px-6">
                    <p className="font-semibold text-slate-900">{b.customer?.name || 'Pelanggan'}</p>
                    <p className="text-[11px] text-slate-400">{b.customer?.whatsapp || '-'}</p>
                  </td>
                  <td className="py-3.5 px-4 sm:px-6">
                    <p className="font-medium text-slate-800">{formatDate(b.start_date)}</p>
                    <p className="text-[10px] text-slate-400 uppercase">{b.event_type}</p>
                  </td>
                  <td className="py-3.5 px-4 sm:px-6 font-serif font-bold text-maroon-800">
                    {formatIDR(b.total_price)}
                  </td>
                  <td className="py-3.5 px-4 sm:px-6">
                    {getStatusBadge(b.status)}
                  </td>
                  <td className="py-3.5 px-4 sm:px-6 text-right">
                    <Link
                      to={`/admin/booking`}
                      className="px-3 py-1.5 rounded-xl bg-maroon-50 hover:bg-maroon-100 text-maroon-800 font-bold border border-maroon-200/80 inline-flex items-center gap-1 shadow-2xs"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Detail
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
