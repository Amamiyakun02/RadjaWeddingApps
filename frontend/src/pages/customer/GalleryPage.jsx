import React, { useState, useEffect } from 'react';
import { Eye, X, Crown, Sparkles, Filter } from 'lucide-react';
import { api } from '../../services/api';

export default function GalleryPage() {
  const [galleries, setGalleries] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [gRes, cRes] = await Promise.all([
          api.getGalleries(),
          api.getCategories()
        ]);
        setGalleries(gRes);
        setCategories(cRes);
      } catch (err) {
        console.error('Error fetching gallery data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filtered = galleries.filter(g => {
    if (activeCategory !== 'all' && g.category_id !== activeCategory) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 sm:space-y-10">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2 sm:space-y-3">
        <span className="px-3.5 py-1 rounded-full bg-maroon-50 text-maroon-900 text-[10px] sm:text-xs font-bold uppercase tracking-wider border border-maroon-200">
          Portofolio Nyata
        </span>
        <h1 className="font-serif text-2xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
          Galeri Dokumentasi Momen Pengantin
        </h1>
        <p className="text-xs sm:text-sm text-slate-600">
          Inspirasi tata rias pengantin, gaun kebaya adat, dan pelaminan eksklusif dari ratusan pengantin Radja Wedding.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex justify-start sm:justify-center gap-2 overflow-x-auto pb-2 no-scrollbar px-1">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 active:scale-95 ${
            activeCategory === 'all'
              ? 'bg-maroon-800 text-white shadow-md'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Semua Momen
        </button>
        {categories.map(c => (
          <button
            key={c.id}
            onClick={() => setActiveCategory(c.id)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 active:scale-95 ${
              activeCategory === c.id
                ? 'bg-maroon-800 text-white shadow-md'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="text-center py-16 text-xs text-slate-500 font-semibold">Memuat galeri foto...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white p-8 sm:p-12 rounded-3xl text-center border border-slate-200 max-w-md mx-auto">
          <p className="text-xs text-slate-500">Belum ada foto dalam kategori ini.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filtered.map(g => (
            <div
              key={g.id}
              onClick={() => setSelectedImage(g.cover_url)}
              className="group relative rounded-3xl overflow-hidden cursor-pointer h-72 sm:h-96 bg-slate-900 border border-slate-200/80 shadow-2xs hover:shadow-xl transition-all"
            >
              <img
                src={g.cover_url}
                alt={g.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1C040A] via-[#1C040A]/30 to-transparent opacity-85 group-hover:opacity-95 transition-opacity flex flex-col justify-end p-4 sm:p-6 text-white">
                <span className="text-[10px] sm:text-[11px] font-bold text-amber-300 uppercase tracking-wider mb-1">
                  {g.event_type || 'Wedding Documentation'}
                </span>
                <h3 className="font-serif font-bold text-base sm:text-lg text-white">{g.title}</h3>
                <p className="text-xs text-slate-300 line-clamp-2 mt-0.5">{g.description}</p>
                <div className="mt-2.5 flex items-center gap-1.5 text-xs font-semibold text-amber-200">
                  <Eye className="w-3.5 h-3.5" /> Klik untuk memperbesar foto
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fadeIn"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-10 right-0 p-2 text-white/80 hover:text-white"
              aria-label="Tutup"
            >
              <X className="w-6 h-6" />
            </button>
            <img src={selectedImage} alt="Fullscreen" className="max-w-full max-h-[85vh] rounded-3xl object-contain shadow-2xl" />
          </div>
        </div>
      )}

    </div>
  );
}
