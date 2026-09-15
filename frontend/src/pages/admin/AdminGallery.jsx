import React, { useState, useEffect } from 'react';
import { Image, Plus, Trash2, X, Eye } from 'lucide-react';
import { api } from '../../services/api';

export default function AdminGallery() {
  const [galleries, setGalleries] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category_id: '',
    event_type: 'wedding',
    cover_url: 'https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&w=800&q=80',
    images: []
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchGalleries = async () => {
    setLoading(true);
    try {
      const [gals, cats] = await Promise.all([
        api.getGalleries(),
        api.getCategories()
      ]);
      setGalleries(gals);
      setCategories(cats);
    } catch (err) {
      console.error('Error fetching galleries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGalleries();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus album galeri ini?')) return;
    try {
      await api.deleteGallery(id);
      fetchGalleries();
    } catch (err) {
      alert(err.message || 'Gagal menghapus galeri');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.createGallery({
        title: formData.title,
        description: formData.description,
        category_id: formData.category_id || null,
        event_type: formData.event_type,
        cover_url: formData.cover_url,
        images: [{ media_url: formData.cover_url, media_type: 'image' }]
      });
      setModalOpen(false);
      fetchGalleries();
    } catch (err) {
      alert(err.message || 'Gagal membuat galeri');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-10 space-y-6 sm:space-y-8 max-w-7xl mx-auto text-slate-800">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-maroon-100 pb-5 sm:pb-6">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-slate-900">
            Galeri & Portofolio Dokumentasi
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Unggah dan kelola foto pernikahan untuk ditampilkan pada halaman publik pelanggan.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="self-start md:self-auto px-4 sm:px-5 py-2.5 rounded-2xl bg-gradient-to-r from-maroon-800 via-maroon-700 to-maroon-900 hover:from-maroon-900 hover:to-maroon-800 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-maroon-900/20 active:scale-95 transition-transform"
        >
          <Plus className="w-4 h-4" />
          Tambah Album Galeri
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {galleries.map(g => (
          <div key={g.id} className="bg-white rounded-3xl border border-maroon-100 overflow-hidden flex flex-col justify-between shadow-xs hover:shadow-md transition-all">
            <div className="relative h-48 sm:h-56 bg-slate-100">
              <img src={g.cover_url} alt={g.title} className="w-full h-full object-cover" />
              <button
                onClick={() => handleDelete(g.id)}
                className="absolute top-3 right-3 p-2 rounded-xl bg-white/90 hover:bg-rose-50 text-rose-700 shadow-sm transition-colors border border-rose-200"
                title="Hapus Galeri"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 sm:p-5 space-y-1.5">
              <span className="text-[10px] font-bold text-maroon-700 uppercase">{g.event_type}</span>
              <h3 className="font-serif font-bold text-base text-slate-900">{g.title}</h3>
              <p className="text-xs text-slate-500 line-clamp-2">{g.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE MODAL (Mobile bottom sheet) */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
          <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl border border-slate-200 animate-slideUp">
            <div className="p-4 sm:p-5 border-b border-maroon-100 flex items-center justify-between bg-[#FAF2F4]">
              <h3 className="font-serif font-bold text-base sm:text-lg text-maroon-950">Tambah Album Galeri</h3>
              <button onClick={() => setModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-700" aria-label="Tutup">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-4 sm:p-6 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Judul Album / Klien</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Contoh: Pernikahan Adat Sunda Siger - Rina & Dimas"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">URL Foto Sampul</label>
                <input
                  type="text"
                  value={formData.cover_url}
                  onChange={(e) => setFormData({ ...formData, cover_url: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Deskripsi Momen</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white"
                />
              </div>

              <div className="p-4 sm:p-5 border-t border-slate-100 flex justify-end gap-2 pb-safe bg-slate-50">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 sm:px-6 py-2.5 rounded-xl bg-maroon-700 hover:bg-maroon-800 text-white font-bold shadow-md shadow-maroon-700/20"
                >
                  {submitting ? 'Menyimpan...' : 'Simpan Album'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
