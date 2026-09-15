import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, Star, CheckCircle2, XCircle, 
  Sparkles, Filter, Heart 
} from 'lucide-react';
import { api } from '../../services/api';
import { formatDate } from '../../utils/formatters';

export default function AdminTestimonials() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchTestimonials = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminTestimonials(statusFilter);
      setTestimonials(res);
    } catch (err) {
      console.error('Error fetching testimonials:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, [statusFilter]);

  const handleModerate = async (id, status, isFeatured = null) => {
    try {
      await api.moderateTestimonial(id, status, isFeatured);
      fetchTestimonials();
    } catch (err) {
      alert(err.message || 'Gagal memoderasi testimoni');
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-10 space-y-6 sm:space-y-8 max-w-7xl mx-auto text-slate-800">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-maroon-100 pb-5 sm:pb-6">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-slate-900">
            Moderasi Testimoni & Ulasan Pelanggan
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Tinjau ulasan klien, setujui untuk tampil di website publik, dan tandai testimoni unggulan.
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
          <option value="">Semua Status Testimoni</option>
          <option value="pending">Menunggu Moderasi (Pending)</option>
          <option value="approved">Disetujui (Approved)</option>
          <option value="rejected">Ditolak (Rejected)</option>
        </select>
      </div>

      {/* Grid of Testimonials */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {testimonials.map(t => (
          <div
            key={t.id}
            className="bg-white rounded-3xl border border-maroon-100 p-4 sm:p-6 space-y-4 flex flex-col justify-between shadow-xs hover:shadow-md transition-all"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(t.rating || 5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-amber-400" />
                  ))}
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  t.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-300' :
                  t.status === 'rejected' ? 'bg-rose-50 text-rose-700 border border-rose-300' :
                  'bg-amber-50 text-amber-700 border border-amber-300'
                }`}>
                  {t.status.toUpperCase()}
                </span>
              </div>

              <p className="text-xs text-slate-700 italic leading-relaxed">
                "{t.content}"
              </p>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-slate-900 text-xs">{t.customer_name}</p>
                  <p className="text-[10px] text-maroon-700 font-semibold">{t.event_name || 'Klien Radja Wedding'}</p>
                </div>
                <span className="text-[10px] text-slate-400">{formatDate(t.created_at)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 sm:pt-4 border-t border-slate-100 space-y-2">
              <div className="flex gap-2">
                {t.status !== 'approved' && (
                  <button
                    onClick={() => handleModerate(t.id, 'approved', t.is_featured)}
                    className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1 active:scale-95 transition-transform shadow-2xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Setujui
                  </button>
                )}
                {t.status !== 'rejected' && (
                  <button
                    onClick={() => handleModerate(t.id, 'rejected', false)}
                    className="flex-1 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold border border-rose-200 text-xs flex items-center justify-center gap-1 active:scale-95 transition-transform"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    Tolak
                  </button>
                )}
              </div>

              {t.status === 'approved' && (
                <button
                  onClick={() => handleModerate(t.id, 'approved', !t.is_featured)}
                  className={`w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors active:scale-95 shadow-2xs ${
                    t.is_featured
                      ? 'bg-maroon-50 text-maroon-800 border border-maroon-200'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-maroon-700" />
                  {t.is_featured ? '⭐ Tampil di Beranda' : '+ Tampilkan di Beranda'}
                </button>
              )}
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
