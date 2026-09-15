import React, { useState, useEffect } from 'react';
import { 
  CalendarCheck, Search, Filter, Eye, Edit3, 
  CheckCircle, XCircle, Clock, FileText, X 
} from 'lucide-react';
import { api } from '../../services/api';
import { formatIDR, formatDate, getStatusBadge } from '../../utils/formatters';

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  // Detail & Status update modal
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminBookings(statusFilter);
      setBookings(res);
    } catch (err) {
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [statusFilter]);

  const handleOpenDetail = (b) => {
    setSelectedBooking(b);
    setNewStatus(b.status);
    setAdminNotes(b.admin_notes || '');
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedBooking) return;
    setUpdating(true);

    try {
      await api.updateBookingStatus(selectedBooking.id, newStatus, adminNotes);
      setSelectedBooking(null);
      fetchBookings();
    } catch (err) {
      alert(err.message || 'Gagal mengubah status booking');
    } finally {
      setUpdating(false);
    }
  };

  const filtered = bookings.filter(b => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchCode = b.booking_code.toLowerCase().includes(q);
      const matchName = (b.customer?.name || '').toLowerCase().includes(q);
      if (!matchCode && !matchName) return false;
    }
    return true;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-10 space-y-6 sm:space-y-8 max-w-7xl mx-auto text-slate-800">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-maroon-100 pb-5 sm:pb-6">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-slate-900">
            Manajemen Reservasi & Jadwal Acara
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Validasi pengajuan reservasi tanggal, atur status transaksi, dan input catatan internal.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-maroon-100 shadow-xs">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari kode booking / nama klien..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-maroon-600 transition-all"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full sm:w-64 px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-maroon-600 transition-all"
        >
          <option value="">Semua Status</option>
          <option value="pending">Menunggu Konfirmasi</option>
          <option value="confirmed">Dikonfirmasi</option>
          <option value="dp_paid">DP Diterima</option>
          <option value="fully_paid">Lunas</option>
          <option value="completed">Selesai</option>
          <option value="cancelled">Dibatalkan</option>
        </select>
      </div>

      {/* Bookings Table with Horizontal Scroll */}
      <div className="bg-white rounded-3xl border border-maroon-100 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 min-w-[650px]">
            <thead className="bg-[#FAF2F4] text-maroon-950 uppercase text-[10px] tracking-wider border-b border-maroon-200/80 font-bold">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">Kode Pesanan</th>
                <th className="py-3.5 px-4 sm:px-6">Klien & Kontak</th>
                <th className="py-3.5 px-4 sm:px-6">Tanggal Acara</th>
                <th className="py-3.5 px-4 sm:px-6">Total Nilai / DP</th>
                <th className="py-3.5 px-4 sm:px-6">Status Saat Ini</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">Memuat data booking...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">Tidak ada reservasi ditemukan.</td>
                </tr>
              ) : (
                filtered.map(b => (
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
                      <p className="text-sm">{formatIDR(b.total_price)}</p>
                      <p className="text-[10px] text-slate-500 font-normal font-sans">DP Min: {formatIDR(b.dp_amount)}</p>
                    </td>
                    <td className="py-3.5 px-4 sm:px-6">
                      {getStatusBadge(b.status)}
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-right">
                      <button
                        onClick={() => handleOpenDetail(b)}
                        className="px-3 py-1.5 rounded-xl bg-maroon-50 hover:bg-maroon-100 text-maroon-800 font-bold border border-maroon-200 inline-flex items-center gap-1 active:scale-95 transition-transform shadow-2xs"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        Kelola
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL & STATUS CHANGER MODAL (Mobile bottom sheet) */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
          <div className="bg-white w-full sm:max-w-2xl rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl border border-slate-200 max-h-[92vh] flex flex-col justify-between animate-slideUp">
            <div className="p-4 sm:p-5 border-b border-maroon-100 flex items-center justify-between bg-[#FAF2F4]">
              <div>
                <h3 className="font-serif font-bold text-base sm:text-lg text-maroon-950">Detail & Ubah Status Pesanan</h3>
                <p className="text-[11px] text-slate-500">Kode: <strong className="text-maroon-800 font-mono">{selectedBooking.booking_code}</strong></p>
              </div>
              <button onClick={() => setSelectedBooking(null)} className="p-1.5 text-slate-400 hover:text-slate-700" aria-label="Tutup">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateStatus} className="p-4 sm:p-6 overflow-y-auto space-y-3.5 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-slate-400 font-medium">Pemesan:</span>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">{selectedBooking.customer?.name}</p>
                  <p className="text-slate-500">{selectedBooking.customer?.email}</p>
                  <p className="text-slate-500">WA: {selectedBooking.customer?.whatsapp}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Jadwal & Lokasi:</span>
                  <p className="font-bold text-maroon-800 mt-0.5">{formatDate(selectedBooking.start_date)} s/d {formatDate(selectedBooking.end_date)}</p>
                  <p className="text-slate-600 truncate">{selectedBooking.location_address}</p>
                </div>
              </div>

              {/* Items Breakdown */}
              <div className="space-y-1 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <p className="font-bold text-slate-700 uppercase mb-1.5">Item Terdaftar:</p>
                {selectedBooking.selected_bundles?.map(b => (
                  <div key={b.id} className="flex justify-between text-slate-700 py-0.5 border-b border-slate-200/60">
                    <span className="font-medium truncate mr-2">[Bundle] {b.name}</span>
                    <span className="font-bold text-maroon-800 shrink-0">{formatIDR(b.price_snapshot)}</span>
                  </div>
                ))}
                {selectedBooking.custom_items?.map(i => (
                  <div key={i.id} className="flex justify-between text-slate-700 py-0.5 border-b border-slate-200/60">
                    <span className="truncate mr-2">{i.quantity}x {i.name}</span>
                    <span className="font-bold text-maroon-800 shrink-0">{formatIDR(i.price_snapshot * i.quantity)}</span>
                  </div>
                ))}
              </div>

              <div>
                <label className="block font-bold text-maroon-900 uppercase mb-1">
                  Ubah Status Booking
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-bold focus:bg-white focus:ring-2 focus:ring-maroon-600"
                >
                  <option value="pending">pending (Menunggu Konfirmasi)</option>
                  <option value="confirmed">confirmed (Dikonfirmasi Admin)</option>
                  <option value="dp_paid">dp_paid (DP 30% Telah Diterima)</option>
                  <option value="fully_paid">fully_paid (Lunas)</option>
                  <option value="completed">completed (Acara Selesai / Serah Terima Sukses)</option>
                  <option value="cancelled">cancelled (Dibatalkan / Jadwal Dibebaskan)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Catatan Internal Admin / Kasir
                </label>
                <textarea
                  rows={3}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Catatan tim lapangan, nomor fitting gaun, konfirmasi jadwal MUA..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:ring-2 focus:ring-maroon-600"
                />
              </div>

              <div className="p-4 sm:p-5 border-t border-slate-100 flex justify-end gap-2 pb-safe bg-slate-50">
                <button
                  type="button"
                  onClick={() => setSelectedBooking(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold"
                >
                  Tutup
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-5 sm:px-6 py-2.5 rounded-xl bg-maroon-700 hover:bg-maroon-800 text-white font-bold shadow-md shadow-maroon-700/20"
                >
                  {updating ? 'Menyimpan...' : 'Perbarui Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
