import React, { useState, useEffect } from 'react';
import { 
  Crown, Plus, Edit2, Trash2, Check, X, 
  ShoppingBag, Sparkles, Layers, AlertCircle 
} from 'lucide-react';
import { api } from '../../services/api';
import { formatIDR } from '../../utils/formatters';

export default function AdminBundles() {
  const [bundles, setBundles] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create / Edit Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBundle, setEditingBundle] = useState(null);
  const [formData, setFormData] = useState({
    bundle_name: '',
    description: '',
    package_price: 1500000,
    dp_percentage: 30,
    image_url: '',
    is_active: true,
    items: [] // array of { product_id, quantity }
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [bundlesRes, prodsRes] = await Promise.all([
        api.getBundles(),
        api.getProducts()
      ]);
      setBundles(bundlesRes);
      setProducts(prodsRes);
    } catch (err) {
      console.error('Error fetching bundles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const openCreateModal = () => {
    setEditingBundle(null);
    setFormData({
      bundle_name: '',
      description: '',
      package_price: 3500000,
      dp_percentage: 30,
      image_url: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80',
      is_active: true,
      items: []
    });
    setModalOpen(true);
  };

  const openEditModal = (b) => {
    setEditingBundle(b);
    setFormData({
      bundle_name: b.bundle_name,
      description: b.description || '',
      package_price: b.package_price,
      dp_percentage: b.dp_percentage || 30,
      image_url: b.image_url || '',
      is_active: b.is_active,
      items: b.items?.map(it => ({ product_id: it.product_id, quantity: it.quantity })) || []
    });
    setModalOpen(true);
  };

  const handleToggleProductInBundle = (prodId) => {
    const exists = formData.items.find(i => i.product_id === prodId);
    if (exists) {
      setFormData({
        ...formData,
        items: formData.items.filter(i => i.product_id !== prodId)
      });
    } else {
      setFormData({
        ...formData,
        items: [...formData.items, { product_id: prodId, quantity: 1 }]
      });
    }
  };

  const handleQuantityChange = (prodId, qty) => {
    setFormData({
      ...formData,
      items: formData.items.map(i => i.product_id === prodId ? { ...i, quantity: Math.max(1, qty) } : i)
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus paket bundle ini?')) return;
    try {
      await api.deleteBundle(id);
      fetchAll();
    } catch (err) {
      alert(err.message || 'Gagal menghapus paket');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (formData.items.length === 0) {
      alert('Paket bundle harus memiliki minimal 1 item komponen');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        bundle_name: formData.bundle_name,
        description: formData.description,
        package_price: Number(formData.package_price),
        dp_percentage: Number(formData.dp_percentage),
        image_url: formData.image_url,
        is_active: formData.is_active,
        items: formData.items
      };

      if (editingBundle) {
        await api.updateBundle(editingBundle.id, payload);
      } else {
        await api.createBundle(payload);
      }

      setModalOpen(false);
      fetchAll();
    } catch (err) {
      alert(err.message || 'Gagal menyimpan paket bundle');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-10 space-y-6 sm:space-y-8 max-w-7xl mx-auto text-slate-800">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-maroon-100 pb-5 sm:pb-6">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-slate-900">
            Master Bundles & Paket Komprehensif
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Kombinasikan busana, riasan MUA, dan dekorasi menjadi paket hemat terpadu.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="self-start md:self-auto px-4 sm:px-5 py-2.5 rounded-2xl bg-gradient-to-r from-maroon-800 via-maroon-700 to-maroon-900 hover:from-maroon-900 hover:to-maroon-800 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-maroon-900/20 active:scale-95 transition-transform"
        >
          <Plus className="w-4 h-4" />
          Rakit Paket Bundle Baru
        </button>
      </div>

      {/* Grid of Bundles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {bundles.map(b => (
          <div
            key={b.id}
            className="bg-white rounded-3xl border border-maroon-100 p-4 sm:p-6 space-y-4 flex flex-col justify-between shadow-xs hover:shadow-md transition-all"
          >
            <div className="space-y-3">
              <div className="relative h-44 sm:h-48 rounded-2xl overflow-hidden bg-slate-100">
                <img
                  src={b.image_url || "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80"}
                  alt={b.bundle_name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3 bg-maroon-800/90 backdrop-blur-xs text-amber-200 font-bold text-[10px] px-2.5 py-1 rounded-full border border-maroon-600/50">
                  {b.items?.length || 0} Komponen Item
                </div>
              </div>

              <div>
                <h3 className="font-serif font-bold text-base sm:text-lg text-slate-900">{b.bundle_name}</h3>
                <p className="text-xs text-slate-500 line-clamp-2 mt-1">{b.description}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
                <p className="text-[10px] font-bold text-maroon-800 uppercase">Item yang Terikat:</p>
                <ul className="text-[11px] text-slate-600 space-y-0.5 max-h-24 overflow-y-auto">
                  {b.items?.map((it, i) => (
                    <li key={i} className="truncate">• {it.quantity}x {it.product?.name || 'Item'}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-3 sm:pt-4 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400">Harga Bundle:</span>
                <p className="font-serif font-bold text-base sm:text-lg text-maroon-800">{formatIDR(b.package_price)}</p>
              </div>

              <div className="flex gap-1.5">
                <button
                  onClick={() => openEditModal(b)}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-maroon-50 text-slate-700 hover:text-maroon-800 border border-slate-200 transition-colors shadow-2xs"
                  title="Edit"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(b.id)}
                  className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors shadow-2xs"
                  title="Hapus"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* MODAL: CREATE / EDIT BUNDLE (Mobile bottom sheet) */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
          <div className="bg-white w-full sm:max-w-2xl rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl border border-slate-200 max-h-[92vh] flex flex-col justify-between animate-slideUp">
            <div className="p-4 sm:p-5 border-b border-maroon-100 flex items-center justify-between bg-[#FAF2F4]">
              <h3 className="font-serif font-bold text-base sm:text-lg text-maroon-950">
                {editingBundle ? 'Edit Paket Bundle' : 'Rakit Paket Bundle Baru'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-700" aria-label="Tutup">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-4 sm:p-6 overflow-y-auto space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Nama Paket Bundle</label>
                <input
                  type="text"
                  value={formData.bundle_name}
                  onChange={(e) => setFormData({ ...formData, bundle_name: e.target.value })}
                  placeholder="Contoh: Paket Ratu Kencana Sunda/Jawa"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:ring-2 focus:ring-maroon-600"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Harga Paket Total (Rp)</label>
                  <input
                    type="number"
                    value={formData.package_price}
                    onChange={(e) => setFormData({ ...formData, package_price: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-bold focus:bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">URL Foto Cover</label>
                  <input
                    type="text"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Deskripsi Paket</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white"
                />
              </div>

              {/* Product Selection List */}
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <label className="block font-bold text-maroon-800 uppercase">
                  Pilih Item Komponen Fisik yang Diikat dalam Bundle ({formData.items.length} dipilih)
                </label>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                  {products.map(p => {
                    const item = formData.items.find(i => i.product_id === p.id);
                    const isSelected = !!item;

                    return (
                      <div
                        key={p.id}
                        className={`p-2.5 rounded-2xl border flex items-center justify-between gap-2 ${
                          isSelected ? 'border-maroon-600 bg-maroon-50/70 shadow-2xs' : 'border-slate-200 bg-slate-50'
                        }`}
                      >
                        <div
                          onClick={() => handleToggleProductInBundle(p.id)}
                          className="flex items-center gap-2 cursor-pointer overflow-hidden flex-1"
                        >
                          <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                            isSelected ? 'bg-maroon-700 border-maroon-700 text-white' : 'border-slate-300 bg-white'
                          }`}>
                            {isSelected && <Check className="w-3 h-3 font-bold" />}
                          </div>
                          <span className="truncate text-slate-800 text-[11px] font-medium">{p.name}</span>
                        </div>

                        {isSelected && (
                          <div className="flex items-center gap-1 shrink-0">
                            <span className="text-[10px] text-slate-500">Qty:</span>
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => handleQuantityChange(p.id, Number(e.target.value))}
                              className="w-12 px-1.5 py-0.5 rounded-lg bg-white border border-slate-300 text-center text-slate-900 text-xs font-bold"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
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
                  {submitting ? 'Menyimpan...' : 'Simpan Bundle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
