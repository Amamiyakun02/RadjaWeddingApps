import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, Plus, Edit2, Trash2, Search, 
  Check, X, Crown, Sparkles, Filter 
} from 'lucide-react';
import { api } from '../../services/api';
import { formatIDR } from '../../utils/formatters';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');

  // Create / Edit Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    description: '',
    price_per_day: 100000,
    dp_percentage: 30,
    stock_unit: 1,
    image_url: '',
    is_active: true,
    theme: '',
    size: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchCatalog = async () => {
    setLoading(true);
    try {
      const [prods, cats] = await Promise.all([
        api.getProducts(),
        api.getCategories()
      ]);
      setProducts(prods);
      setCategories(cats);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      category_id: categories[0]?.id || '',
      description: '',
      price_per_day: 500000,
      dp_percentage: 30,
      stock_unit: 1,
      image_url: 'https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&w=800&q=80',
      is_active: true,
      theme: 'Universal',
      size: 'All Size'
    });
    setModalOpen(true);
  };

  const openEditModal = (prod) => {
    setEditingProduct(prod);
    setFormData({
      name: prod.name,
      category_id: prod.category_id || '',
      description: prod.description || '',
      price_per_day: prod.price_per_day,
      dp_percentage: prod.dp_percentage || 30,
      stock_unit: prod.stock_unit || 1,
      image_url: prod.image_url || '',
      is_active: prod.is_active,
      theme: prod.attributes?.theme || '',
      size: prod.attributes?.size || ''
    });
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus produk ini dari katalog?')) return;
    try {
      await api.deleteProduct(id);
      fetchCatalog();
    } catch (err) {
      alert(err.message || 'Gagal menghapus produk');
    }
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        name: formData.name,
        category_id: formData.category_id || null,
        description: formData.description,
        price_per_day: Number(formData.price_per_day),
        dp_percentage: Number(formData.dp_percentage),
        stock_unit: Number(formData.stock_unit),
        image_url: formData.image_url,
        is_active: formData.is_active,
        attributes: {
          theme: formData.theme,
          size: formData.size
        }
      };

      if (editingProduct) {
        await api.updateProduct(editingProduct.id, payload);
      } else {
        await api.createProduct(payload);
      }

      setModalOpen(false);
      fetchCatalog();
    } catch (err) {
      alert(err.message || 'Gagal menyimpan produk');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = products.filter(p => {
    if (selectedCat !== 'all' && p.category_id !== selectedCat) return false;
    if (search.trim() && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-10 space-y-6 sm:space-y-8 max-w-7xl mx-auto text-slate-800">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-maroon-100 pb-5 sm:pb-6">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-slate-900">
            Manajemen Produk & Item Katalog Fisik
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Kelola inventaris busana gaun, jasa tata rias MUA, aksesoris, dan dekorasi pelaminan.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="self-start md:self-auto px-4 sm:px-5 py-2.5 rounded-2xl bg-gradient-to-r from-maroon-800 via-maroon-700 to-maroon-900 hover:from-maroon-900 hover:to-maroon-800 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-maroon-900/20 active:scale-95 transition-transform"
        >
          <Plus className="w-4 h-4" />
          Tambah Item Baru
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-maroon-100 shadow-xs">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama busana / item..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:ring-2 focus:ring-maroon-600 focus:bg-white transition-all"
          />
        </div>

        <select
          value={selectedCat}
          onChange={(e) => setSelectedCat(e.target.value)}
          className="w-full sm:w-64 px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-maroon-600 focus:bg-white transition-all"
        >
          <option value="all">Semua Kategori</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Product Table with Horizontal Scroll container */}
      <div className="bg-white rounded-3xl border border-maroon-100 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 min-w-[650px]">
            <thead className="bg-[#FAF2F4] text-maroon-950 uppercase text-[10px] tracking-wider border-b border-maroon-200/80 font-bold">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">Item</th>
                <th className="py-3.5 px-4 sm:px-6">Kategori</th>
                <th className="py-3.5 px-4 sm:px-6">Harga Sewa / Hari</th>
                <th className="py-3.5 px-4 sm:px-6">Stok Fisik</th>
                <th className="py-3.5 px-4 sm:px-6">Status</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">Memuat katalog produk...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">Tidak ada produk ditemukan.</td>
                </tr>
              ) : (
                filtered.map(p => (
                  <tr key={p.id} className="hover:bg-maroon-50/30 transition-colors">
                    <td className="py-3.5 px-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        {p.image_url ? (
                          <img src={p.image_url} alt={p.name} className="w-10 h-10 rounded-xl object-cover shrink-0 border border-maroon-100" />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-maroon-50 text-maroon-700 flex items-center justify-center shrink-0 border border-maroon-200">
                            <ShoppingBag className="w-4 h-4" />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-slate-900 truncate max-w-[200px]">{p.name}</p>
                          {p.attributes?.theme && (
                            <span className="text-[10px] text-maroon-700 font-semibold">{p.attributes.theme}</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-slate-500 font-medium">
                      {p.category?.name || '-'}
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 font-serif font-bold text-maroon-800 text-sm">
                      {formatIDR(p.price_per_day)}
                    </td>
                    <td className="py-3.5 px-4 sm:px-6">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {p.stock_unit} Unit
                      </span>
                    </td>
                    <td className="py-3.5 px-4 sm:px-6">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        p.is_active ? 'bg-emerald-50 text-emerald-700 border border-emerald-300' : 'bg-slate-100 text-slate-400'
                      }`}>
                        {p.is_active ? 'AKTIF' : 'NONAKTIF'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-right space-x-1.5">
                      <button
                        onClick={() => openEditModal(p)}
                        className="p-1.5 rounded-xl bg-slate-100 hover:bg-maroon-50 text-slate-700 hover:text-maroon-800 border border-slate-200 transition-colors shadow-2xs"
                        title="Edit Produk"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors shadow-2xs"
                        title="Hapus Produk"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT MODAL (Mobile bottom sheet) */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
          <div className="bg-white w-full sm:max-w-xl rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl border border-slate-200 max-h-[92vh] flex flex-col justify-between animate-slideUp">
            
            <div className="p-4 sm:p-5 border-b border-maroon-100 flex items-center justify-between bg-[#FAF2F4]">
              <h3 className="font-serif font-bold text-base sm:text-lg text-maroon-900">
                {editingProduct ? 'Edit Item Produk' : 'Tambah Item Baru'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700"
                aria-label="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-4 sm:p-6 space-y-3.5 text-xs overflow-y-auto">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Nama Item</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-semibold focus:bg-white focus:ring-2 focus:ring-maroon-600"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Kategori</label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-medium focus:bg-white"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Harga Sewa / Hari (Rp)</label>
                  <input
                    type="number"
                    value={formData.price_per_day}
                    onChange={(e) => setFormData({ ...formData, price_per_day: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-bold focus:bg-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Stok Fisik Tersedia</label>
                  <input
                    type="number"
                    value={formData.stock_unit}
                    onChange={(e) => setFormData({ ...formData, stock_unit: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-bold focus:bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Tema (Adat/Modern)</label>
                  <input
                    type="text"
                    value={formData.theme}
                    onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                    placeholder="Contoh: Sunda / Jawa / Bridal"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">URL Foto Produk</label>
                <input
                  type="text"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Deskripsi Lengkap</label>
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
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 sm:px-6 py-2 rounded-xl bg-maroon-700 hover:bg-maroon-800 text-white font-bold shadow-md shadow-maroon-700/20"
                >
                  {submitting ? 'Menyimpan...' : 'Simpan Produk'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
