import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { 
  Search, Filter, Crown, Sparkles, Calendar, 
  ShoppingBag, Check, X, Info, Tag, ArrowUpDown, ChevronRight
} from 'lucide-react';
import { api } from '../../services/api';
import { useBooking } from '../../context/BookingContext';
import { formatIDR } from '../../utils/formatters';

export default function CatalogPage({ onOpenKirana }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [bundles, setBundles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [activeTab, setActiveTab] = useState(searchParams.get('category_slug') || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Selected Detail Modal
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedBundle, setSelectedBundle] = useState(null);
  const [checkDateStart, setCheckDateStart] = useState('');
  const [checkDateEnd, setCheckDateEnd] = useState('');
  const [availabilityResult, setAvailabilityResult] = useState(null);
  const [checkingAvail, setCheckingAvail] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const { addCustomItem, addBundle } = useBooking();
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [catsRes, prodsRes, bundlesRes] = await Promise.all([
          api.getCategories(),
          api.getProducts(),
          api.getBundles(),
        ]);
        setCategories(catsRes);
        setProducts(prodsRes);
        setBundles(bundlesRes);
      } catch (err) {
        console.error('Error fetching catalog:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  // Filter Products
  let filteredProducts = products.filter((p) => {
    if (activeTab !== 'all' && activeTab !== 'bundles') {
      if (p.category?.slug !== activeTab) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchDesc = (p.description || '').toLowerCase().includes(q);
      if (!matchName && !matchDesc) return false;
    }
    if (selectedTheme) {
      const theme = p.attributes?.theme || '';
      if (!theme.toLowerCase().includes(selectedTheme.toLowerCase())) return false;
    }
    return true;
  });

  // Sort Products
  if (sortBy === 'price_asc') {
    filteredProducts.sort((a, b) => a.price_per_day - b.price_per_day);
  } else if (sortBy === 'price_desc') {
    filteredProducts.sort((a, b) => b.price_per_day - a.price_per_day);
  }

  // Filter Bundles
  let filteredBundles = bundles.filter((b) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return b.bundle_name.toLowerCase().includes(q) || (b.description || '').toLowerCase().includes(q);
    }
    return true;
  });

  const handleCheckItemAvailability = async (productId) => {
    if (!checkDateStart || !checkDateEnd) {
      alert('Silakan pilih rentang tanggal mulai dan akhir.');
      return;
    }
    setCheckingAvail(true);
    try {
      const res = await api.checkAvailability({
        start_date: checkDateStart,
        end_date: checkDateEnd,
        product_ids: [productId]
      });
      setAvailabilityResult(res);
    } catch (err) {
      alert(err.message || 'Gagal mengecek ketersediaan');
    } finally {
      setCheckingAvail(false);
    }
  };

  const themesList = [
    { label: 'Semua Tema', value: '' },
    { label: 'Sunda Siger', value: 'Sunda' },
    { label: 'Jawa Solo/Jogja', value: 'Jawa' },
    { label: 'Modern Bridal', value: 'Bridal' },
    { label: 'Minang Padang', value: 'Minang' },
    { label: 'Rustic Floral', value: 'Rustic' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8">
      
      {/* Toast - mobile responsive position */}
      {toastMsg && (
        <div className="fixed top-20 sm:top-24 inset-x-4 sm:inset-x-auto sm:right-6 z-50 bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center justify-center sm:justify-start gap-2 animate-fadeIn font-semibold text-xs sm:text-sm">
          <Check className="w-4 h-4 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-[#24060D] via-[#350913] to-[#1F040A] text-white p-6 sm:p-12 border border-maroon-800/80 overflow-hidden shadow-xl">
        <div className="relative z-10 max-w-2xl space-y-2 sm:space-y-3">
          <span className="px-3 py-1 rounded-full bg-maroon-700/80 text-amber-200 text-[10px] sm:text-xs font-bold uppercase tracking-wider border border-maroon-500/40">
            Katalog Lengkap Radja Wedding
          </span>
          <h1 className="font-serif text-2xl sm:text-4xl font-extrabold text-white leading-tight">
            Koleksi Busana, Tata Rias & Properti Event
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Seluruh item dan paket dirawat dengan standar higienis tinggi, siap menghiasi hari istimewa Anda.
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4">
          
          {/* Search Box */}
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari kebaya, siger, rias MUA..."
              className="w-full pl-11 pr-4 py-2.5 sm:py-3 rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-maroon-600 text-xs sm:text-sm"
            />
          </div>

          {/* Theme Selector */}
          <div className="grid grid-cols-2 md:grid-cols-6 md:col-span-6 gap-2 sm:gap-4">
            <div className="col-span-1 md:col-span-3">
              <select
                value={selectedTheme}
                onChange={(e) => setSelectedTheme(e.target.value)}
                className="w-full px-3 py-2.5 sm:py-3 rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-maroon-600 text-xs sm:text-sm bg-white"
              >
                {themesList.map((t, idx) => (
                  <option key={idx} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div className="col-span-1 md:col-span-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2.5 sm:py-3 rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-maroon-600 text-xs sm:text-sm bg-white"
              >
                <option value="newest">Terbaru</option>
                <option value="price_asc">Harga: Rendah-Tinggi</option>
                <option value="price_desc">Harga: Tinggi-Rendah</option>
              </select>
            </div>
          </div>

        </div>

        {/* Category Pills (Horizontal Scroll on Mobile) */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar border-t border-slate-100 pt-3">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
              activeTab === 'all'
                ? 'bg-maroon-800 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Semua Item
          </button>
          
          <button
            onClick={() => setActiveTab('bundles')}
            className={`px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all shrink-0 ${
              activeTab === 'bundles'
                ? 'bg-maroon-800 text-white shadow-md shadow-maroon-800/20'
                : 'bg-maroon-50 text-maroon-900 border border-maroon-200 hover:bg-maroon-100'
            }`}
          >
            <Crown className="w-3.5 h-3.5 text-amber-500" />
            Master Bundles ({bundles.length})
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.slug)}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
                activeTab === cat.slug
                  ? 'bg-maroon-800 text-white shadow-md shadow-maroon-800/20'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* 1. MASTER BUNDLES SECTION */}
      {(activeTab === 'all' || activeTab === 'bundles') && filteredBundles.length > 0 && (
        <div className="space-y-4 sm:space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-lg sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-maroon-700" />
              Paket Master Bundles (Hemat & Lengkap)
            </h2>
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500">
              {filteredBundles.length} Paket
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8">
            {filteredBundles.map((bundle) => (
              <div
                key={bundle.id}
                className="bg-white rounded-3xl overflow-hidden border border-slate-200 hover:border-maroon-300 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="relative h-48 sm:h-60 overflow-hidden">
                    <img
                      src={bundle.image_url || "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80"}
                      alt={bundle.bundle_name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-[#24060D]/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-bold text-amber-200 border border-maroon-500/40">
                      DP 30%: {formatIDR(Math.round(bundle.package_price * 0.3))}
                    </div>
                  </div>

                  <div className="p-4 sm:p-6 space-y-2 sm:space-y-3">
                    <h3 className="font-serif font-bold text-base sm:text-xl text-slate-900 group-hover:text-maroon-700 transition-colors">
                      {bundle.bundle_name}
                    </h3>
                    <p className="text-xs text-slate-600 line-clamp-2 sm:line-clamp-3 leading-relaxed">
                      {bundle.description}
                    </p>
                  </div>
                </div>

                <div className="p-4 sm:p-6 pt-0 space-y-3 sm:space-y-4">
                  <div className="border-t border-slate-100 pt-3 sm:pt-4 flex items-baseline justify-between">
                    <span className="text-[11px] sm:text-xs text-slate-500">Harga Paket:</span>
                    <span className="font-serif text-xl sm:text-2xl font-bold text-maroon-800">
                      {formatIDR(bundle.package_price)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setSelectedBundle(bundle)}
                      className="py-2.5 px-3 rounded-2xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold text-center transition-colors"
                    >
                      Detail Rincian
                    </button>
                    <button
                      onClick={() => {
                        addBundle(bundle);
                        triggerToast(`Paket "${bundle.bundle_name}" berhasil dipilih!`);
                      }}
                      className="py-2.5 px-3 rounded-2xl bg-maroon-700 hover:bg-maroon-800 active:scale-95 text-white text-xs font-bold text-center shadow-md shadow-maroon-800/20 transition-all flex items-center justify-center gap-1"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      Pilih Paket
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. PRODUCTS / ALA CARTE GRID */}
      {activeTab !== 'bundles' && (
        <div className="space-y-4 sm:space-y-6 pt-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-lg sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 text-maroon-700" />
              Item Sewa Satuan (Koleksi Ala Carte)
            </h2>
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500">
              {filteredProducts.length} Item
            </span>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="bg-white p-8 sm:p-12 rounded-3xl text-center border border-slate-200 space-y-3">
              <Info className="w-8 h-8 text-slate-400 mx-auto" />
              <h3 className="font-serif font-bold text-base sm:text-lg text-slate-800">Tidak ada item yang sesuai</h3>
              <p className="text-xs text-slate-500">Coba ubah kata kunci pencarian atau filter kategori Anda.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              {filteredProducts.map((prod) => (
                <div
                  key={prod.id}
                  className="bg-white rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200 hover:border-maroon-300 shadow-xs hover:shadow-xl transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div 
                      className="relative h-36 sm:h-56 overflow-hidden cursor-pointer bg-slate-100"
                      onClick={() => {
                        setSelectedProduct(prod);
                        setAvailabilityResult(null);
                      }}
                    >
                      <img
                        src={prod.image_url || "https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&w=800&q=80"}
                        alt={prod.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {prod.category && (
                        <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-md px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold text-slate-900 border border-slate-200">
                          {prod.category.name}
                        </div>
                      )}
                    </div>

                    <div className="p-3 sm:p-5 space-y-1 sm:space-y-2">
                      <h3 
                        onClick={() => {
                          setSelectedProduct(prod);
                          setAvailabilityResult(null);
                        }}
                        className="font-serif font-bold text-xs sm:text-base text-slate-900 group-hover:text-maroon-700 transition-colors line-clamp-2 cursor-pointer leading-tight"
                      >
                        {prod.name}
                      </h3>

                      {prod.attributes?.theme && (
                        <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-maroon-50 text-maroon-800 border border-maroon-200">
                          Tema: {prod.attributes.theme}
                        </span>
                      )}

                      <p className="hidden sm:block text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {prod.description}
                      </p>
                    </div>
                  </div>

                  <div className="p-3 sm:p-5 pt-0 space-y-2 sm:space-y-3">
                    <div className="border-t border-slate-100 pt-2 sm:pt-3 flex flex-col sm:flex-row sm:items-baseline justify-between gap-0.5">
                      <span className="text-[10px] sm:text-[11px] text-slate-400">Harga Sewa:</span>
                      <span className="font-serif text-xs sm:text-lg font-bold text-maroon-800">
                        {formatIDR(prod.price_per_day)}<span className="text-[9px] sm:text-xs font-normal text-slate-500">/hari</span>
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2">
                      <button
                        onClick={() => {
                          setSelectedProduct(prod);
                          setAvailabilityResult(null);
                        }}
                        className="py-1.5 sm:py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-[11px] sm:text-xs font-semibold text-center transition-colors"
                      >
                        Detail
                      </button>
                      <button
                        onClick={() => {
                          addCustomItem(prod, 1);
                          triggerToast(`"${prod.name}" masuk ke paket kustom!`);
                        }}
                        className="py-1.5 sm:py-2 rounded-xl bg-maroon-800 hover:bg-maroon-900 active:scale-95 text-white text-[11px] sm:text-xs font-bold text-center transition-colors flex items-center justify-center gap-1 shadow-xs"
                      >
                        <ShoppingBag className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        + Rakit
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* DETAIL MODAL: PRODUCT (Bottom sheet on mobile) */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
          <div className="bg-white w-full sm:max-w-2xl rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl border border-slate-200 max-h-[92vh] flex flex-col justify-between animate-slideUp">
            
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-maroon-100 text-maroon-900">
                  {selectedProduct.category?.name || 'Item Katalog'}
                </span>
                <span className="text-xs text-slate-500 font-medium">Stok Fisik: {selectedProduct.stock_unit} Unit</span>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                aria-label="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <img
                  src={selectedProduct.image_url || "https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&w=800&q=80"}
                  alt={selectedProduct.name}
                  className="w-full h-48 sm:h-64 rounded-2xl object-cover shadow-sm"
                />
                <div className="space-y-2 sm:space-y-3">
                  <h3 className="font-serif font-bold text-xl sm:text-2xl text-slate-900 leading-snug">
                    {selectedProduct.name}
                  </h3>
                  <p className="font-serif text-xl sm:text-2xl font-bold text-maroon-800">
                    {formatIDR(selectedProduct.price_per_day)} <span className="text-xs font-normal text-slate-500">/ hari sewa</span>
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {selectedProduct.description}
                  </p>

                  {selectedProduct.attributes && (
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 space-y-1 text-xs">
                      <p className="font-bold text-slate-800 mb-1">Spesifikasi & Detail:</p>
                      {Object.entries(selectedProduct.attributes).map(([k, v]) => (
                        <div key={k} className="flex justify-between">
                          <span className="text-slate-500 capitalize">{k.replace('_', ' ')}:</span>
                          <span className="font-semibold text-slate-800">{String(v)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Real-time date availability checker */}
              <div className="p-4 rounded-2xl bg-maroon-50/60 border border-maroon-200 space-y-3">
                <p className="text-xs font-bold text-maroon-900 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-maroon-700" />
                  Cek Ketersediaan Tanggal Acara Anda:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="date"
                    value={checkDateStart}
                    onChange={(e) => setCheckDateStart(e.target.value)}
                    className="px-3 py-2 text-xs rounded-xl border border-maroon-300 bg-white"
                  />
                  <input
                    type="date"
                    value={checkDateEnd}
                    onChange={(e) => setCheckDateEnd(e.target.value)}
                    className="px-3 py-2 text-xs rounded-xl border border-maroon-300 bg-white"
                  />
                  <button
                    onClick={() => handleCheckItemAvailability(selectedProduct.id)}
                    disabled={checkingAvail}
                    className="px-4 py-2 bg-maroon-700 hover:bg-maroon-800 text-white rounded-xl text-xs font-bold transition-colors"
                  >
                    {checkingAvail ? 'Mengecek...' : 'Cek Jadwal'}
                  </button>
                </div>

                {availabilityResult && (
                  <div className={`p-3 rounded-xl text-xs font-semibold ${
                    availabilityResult.is_available 
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                      : 'bg-rose-100 text-rose-800 border border-rose-300'
                  }`}>
                    {availabilityResult.is_available 
                      ? '✓ Tersedia! Item ini bebas reservasi pada tanggal yang Anda pilih.'
                      : '✕ Maaf, item ini sudah terisi jadwal sewa pada tanggal tersebut. Silakan pilih tanggal lain.'
                    }
                  </div>
                )}
              </div>

            </div>

            <div className="p-4 sm:p-5 border-t border-slate-100 flex items-center justify-end gap-2 sm:gap-3 bg-slate-50 pb-safe">
              <button
                onClick={() => setSelectedProduct(null)}
                className="px-4 sm:px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold"
              >
                Tutup
              </button>
              <button
                onClick={() => {
                  addCustomItem(selectedProduct, 1);
                  setSelectedProduct(null);
                  triggerToast(`"${selectedProduct.name}" berhasil ditambahkan ke keranjang!`);
                }}
                className="px-5 sm:px-6 py-2.5 rounded-xl bg-maroon-700 hover:bg-maroon-800 active:scale-95 text-white text-xs font-bold shadow-md shadow-maroon-800/20 flex items-center gap-1.5"
              >
                <ShoppingBag className="w-4 h-4" />
                Tambahkan ke Rakitan
              </button>
            </div>

          </div>
        </div>
      )}

      {/* DETAIL MODAL: BUNDLE (Bottom sheet on mobile) */}
      {selectedBundle && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
          <div className="bg-white w-full sm:max-w-2xl rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl border border-slate-200 max-h-[92vh] flex flex-col justify-between animate-slideUp">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-maroon-100 text-maroon-900">
                Detail Master Bundle
              </span>
              <button onClick={() => setSelectedBundle(null)} className="p-1.5 rounded-full text-slate-400 hover:text-slate-700" aria-label="Tutup">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
              <img
                src={selectedBundle.image_url || "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80"}
                alt={selectedBundle.bundle_name}
                className="w-full h-44 sm:h-56 rounded-2xl object-cover"
              />
              <h3 className="font-serif font-bold text-xl sm:text-2xl text-slate-900">{selectedBundle.bundle_name}</h3>
              <p className="font-serif text-xl sm:text-2xl font-bold text-maroon-800">{formatIDR(selectedBundle.package_price)}</p>
              <p className="text-xs text-slate-600 leading-relaxed">{selectedBundle.description}</p>
              
              {selectedBundle.items && selectedBundle.items.length > 0 && (
                <div className="space-y-2 pt-2">
                  <p className="text-xs font-bold text-slate-800">Komponen Termasuk dalam Paket:</p>
                  <ul className="space-y-1 text-xs text-slate-600">
                    {selectedBundle.items.map((it, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{it.quantity}x {it.product?.name || 'Item Terkait'}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="p-4 sm:p-5 border-t border-slate-100 flex items-center justify-end gap-2 sm:gap-3 bg-slate-50 pb-safe">
              <button onClick={() => setSelectedBundle(null)} className="px-4 sm:px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold">
                Tutup
              </button>
              <button
                onClick={() => {
                  addBundle(selectedBundle);
                  setSelectedBundle(null);
                  triggerToast(`Paket "${selectedBundle.bundle_name}" berhasil dipilih!`);
                }}
                className="px-5 sm:px-6 py-2.5 rounded-xl bg-maroon-700 hover:bg-maroon-800 active:scale-95 text-white text-xs font-bold shadow-md shadow-maroon-800/20"
              >
                Pilih Master Bundle Ini
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
