import React, { useState, useEffect } from 'react';
import { 
  CreditCard, CheckCircle2, XCircle, Eye, 
  Search, Filter, Clock, X, DollarSign 
} from 'lucide-react';
import { api } from '../../services/api';
import { formatIDR, formatDate } from '../../utils/formatters';

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedProofUrl, setSelectedProofUrl] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminPayments(statusFilter);
      setPayments(res);
    } catch (err) {
      console.error('Error fetching payments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [statusFilter]);

  const handleVerify = async (id, status) => {
    setActionLoadingId(id);
    try {
      await api.verifyPayment(id, status);
      fetchPayments();
    } catch (err) {
      alert(err.message || 'Gagal memverifikasi pembayaran');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-10 space-y-6 sm:space-y-8 max-w-7xl mx-auto text-slate-800">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-maroon-100 pb-5 sm:pb-6">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-slate-900">
            Verifikasi Pembayaran Manual & DP
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Validasi mutasi bank / QRIS dan bukti transfer yang diunggah oleh pelanggan.
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-4 bg-white p-3.5 sm:p-4 rounded-2xl border border-maroon-100 shadow-xs">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full sm:w-64 px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-maroon-600 transition-all"
        >
          <option value="">Semua Status Pembayaran</option>
          <option value="pending">Menunggu Verifikasi (Pending)</option>
          <option value="verified">Terverifikasi (Sah)</option>
          <option value="rejected">Ditolak</option>
        </select>
      </div>

      {/* Payments Table with Horizontal Scroll */}
      <div className="bg-white rounded-3xl border border-maroon-100 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 min-w-[650px]">
            <thead className="bg-[#FAF2F4] text-maroon-950 uppercase text-[10px] tracking-wider border-b border-maroon-200/80 font-bold">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">Tanggal Upload</th>
                <th className="py-3.5 px-4 sm:px-6">Jenis Pembayaran</th>
                <th className="py-3.5 px-4 sm:px-6">Metode</th>
                <th className="py-3.5 px-4 sm:px-6">Jumlah Transfer</th>
                <th className="py-3.5 px-4 sm:px-6">Bukti Foto</th>
                <th className="py-3.5 px-4 sm:px-6">Status</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Tindakan Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">Memuat data pembayaran...</td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">Tidak ada riwayat pembayaran.</td>
                </tr>
              ) : (
                payments.map(p => (
                  <tr key={p.id} className="hover:bg-maroon-50/30 transition-colors">
                    <td className="py-3.5 px-4 sm:px-6 font-medium text-slate-800">
                      {formatDate(p.created_at)}
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 font-bold uppercase text-slate-900">
                      {p.type === 'dp' ? 'Down Payment (DP)' : 'Pelunasan'}
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-slate-600 capitalize">
                      {p.method?.replace('_', ' ')}
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 font-serif font-bold text-maroon-800 text-sm">
                      {formatIDR(p.amount)}
                    </td>
                    <td className="py-3.5 px-4 sm:px-6">
                      {p.proof_url ? (
                        <button
                          onClick={() => setSelectedProofUrl(p.proof_url)}
                          className="px-2.5 py-1.5 rounded-xl bg-maroon-50 hover:bg-maroon-100 text-maroon-800 font-bold border border-maroon-200 inline-flex items-center gap-1 shadow-2xs"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Struk
                        </button>
                      ) : (
                        <span className="text-slate-400 italic">Tidak ada foto</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 sm:px-6">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        p.status === 'verified' ? 'bg-emerald-50 text-emerald-700 border border-emerald-300' :
                        p.status === 'rejected' ? 'bg-rose-50 text-rose-700 border border-rose-300' :
                        'bg-amber-50 text-amber-700 border border-amber-300'
                      }`}>
                        {p.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-right space-x-1.5">
                      {p.status === 'pending' ? (
                        <>
                          <button
                            onClick={() => handleVerify(p.id, 'verified')}
                            disabled={actionLoadingId === p.id}
                            className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold inline-flex items-center gap-1 shadow-2xs active:scale-95 transition-transform"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Sah
                          </button>
                          <button
                            onClick={() => handleVerify(p.id, 'rejected')}
                            disabled={actionLoadingId === p.id}
                            className="px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold border border-rose-200 inline-flex items-center gap-1 active:scale-95 transition-transform"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Tolak
                          </button>
                        </>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-medium">Selesai</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PROOF VIEWER MODAL */}
      {selectedProofUrl && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn" onClick={() => setSelectedProofUrl(null)}>
          <div className="relative max-w-lg max-h-[85vh] bg-white p-4 rounded-3xl border border-slate-200 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-3">
              <span className="font-bold text-maroon-900 text-xs">Struk / Bukti Transfer Klien</span>
              <button onClick={() => setSelectedProofUrl(null)} className="p-1 rounded-full text-slate-400 hover:text-slate-700" aria-label="Tutup">
                <X className="w-5 h-5" />
              </button>
            </div>
            <img src={selectedProofUrl} alt="Bukti Transfer" className="w-full max-h-[70vh] rounded-2xl object-contain bg-slate-100" />
          </div>
        </div>
      )}

    </div>
  );
}
