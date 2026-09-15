import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, Heart, Crown, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';
import { formatDate } from '../../utils/formatters';

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTestimonials = async () => {
      setLoading(true);
      try {
        const res = await api.getTestimonials(false); // get all approved
        setTestimonials(res);
      } catch (err) {
        console.error('Error fetching testimonials:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTestimonials();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 sm:space-y-10">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2 sm:space-y-3">
        <span className="px-3.5 py-1 rounded-full bg-maroon-50 text-maroon-900 text-[10px] sm:text-xs font-bold uppercase tracking-wider border border-maroon-200">
          Ulasan Terverifikasi
        </span>
        <h1 className="font-serif text-2xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
          Pengalaman & Kesan Pengantin Kami
        </h1>
        <p className="text-xs sm:text-sm text-slate-600">
          Cerita kebahagiaan para klien yang telah menggunakan busana adat, modern bridal, dan tata rias MUA Radja Wedding.
        </p>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="text-center py-16 text-xs text-slate-500 font-semibold">Memuat testimoni...</div>
      ) : testimonials.length === 0 ? (
        <div className="bg-white p-8 sm:p-12 rounded-3xl text-center border border-slate-200 max-w-md mx-auto">
          <p className="text-xs text-slate-500">Belum ada testimoni yang disetujui.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="p-5 sm:p-8 rounded-3xl bg-white border border-maroon-100/80 shadow-2xs hover:shadow-xl transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-3 sm:mb-4">
                  {[...Array(t.rating || 5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-slate-700 text-xs sm:text-sm italic leading-relaxed">
                  "{t.content}"
                </p>
              </div>

              <div className="pt-4 sm:pt-6 mt-4 sm:mt-6 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5 sm:gap-3">
                  {t.photo_url ? (
                    <img src={t.photo_url} alt={t.customer_name} className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover border border-maroon-200" />
                  ) : (
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-maroon-100 text-maroon-800 font-bold flex items-center justify-center text-xs sm:text-sm">
                      {t.customer_name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h4 className="font-semibold text-xs sm:text-sm text-slate-900">{t.customer_name}</h4>
                    <p className="text-[11px] text-maroon-700 font-semibold">{t.event_name || 'Klien Terverifikasi'}</p>
                  </div>
                </div>

                <span className="text-[9px] sm:text-[10px] text-slate-400">{formatDate(t.created_at)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
