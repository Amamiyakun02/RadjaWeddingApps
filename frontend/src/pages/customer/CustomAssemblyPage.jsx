import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, Trash2, Plus, Minus, Calendar, 
  MapPin, Sparkles, AlertCircle, ArrowRight, 
  Crown, CheckCircle, ShieldCheck, ChevronDown, ChevronUp 
} from 'lucide-react';
import { useBooking } from '../../context/BookingContext';
import { api } from '../../services/api';
import { formatIDR } from '../../utils/formatters';

export default function CustomAssemblyPage({ onOpenKirana }) {
  const { 
    selectedBundles, 
    customItems, 
    eventType,
    setEventType,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    locationAddress,
    setLocationAddress,
    notes,
    setNotes,
    daysCount,
    bundlesTotal,
    customItemsTotal,
    grandTotal,
    minimumDp,
    totalItemCount,
    removeBundle,
    updateItemQuantity,
    removeCustomItem,
    clearCart,
    addCustomItem
  } = useBooking();

  const [availableProducts, setAvailableProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCat, setSelectedCat] = useState('all');
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [availabilityStatus, setAvailabilityStatus] = useState(null);
  const [conflictDetails, setConflictDetails] = useState([]);
  const [mobileSummaryExpanded, setMobileSummaryExpanded] = useState(false);

  const configSectionRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const [cats, prods] = await Promise.all([
          api.getCategories(),
          api.getProducts(),
        ]);
        setCategories(cats);
        setAvailableProducts(prods);
      } catch (err) {
        console.error('Error loading products for builder:', err);
      }
    };
    fetchCatalog();
  }, []);

  const handleValidateSchedule = async () => {
    if (!startDate || !endDate) {
      alert('Silakan tentukan tanggal mulai dan tanggal akhir acara terlebih dahulu.');
      return;
    }
    setCheckingAvailability(true);
    setAvailabilityStatus(null);
    setConflictDetails([]);

    try {
      const bundleIds = selectedBundles.map(b => b.id);
      const prodIds = customItems.map(i => i.id);
      
      const res = await api.checkAvailability({
        start_date: startDate,
        end_date: endDate,
        bundle_ids: bundleIds,
        product_ids: prodIds
      });

      if (res.is_available) {
        setAvailabilityStatus('available');
      } else {
        setAvailabilityStatus('conflict');
        setConflictDetails(res.conflicts || []);
      }
    } catch (err) {
      alert(err.message || 'Gagal memvalidasi ketersediaan jadwal');
    } finally {
      setCheckingAvailability(false);
    }
  };

  const handleProceedToCheckout = () => {
    if (selectedBundles.length === 0 && customItems.length === 0) {
      alert('Pilih minimal satu item atau paket untuk melanjutkan reservasi.');
      return;
    }
    if (!startDate || !endDate) {
      configSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
      alert('Silakan tentukan tanggal acara terlebih dahulu.');
      return;
    }
    if (!locationAddress.trim()) {
      configSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
      alert('Silakan isi lokasi acara terlebih dahulu.');
      return;
    }
    navigate('/booking');
  };

  const filteredCatalogForDrawer = availableProducts.filter(p => {
    if (selectedCat !== 'all' && p.category?.slug !== selectedCat) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8">
      
      {/* Header & Breadcrumb */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-maroon-100 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-maroon-50 text-maroon-900 text-xs font-bold uppercase mb-2 border border-maroon-200">
            <Sparkles className="w-3.5 h-3.5 text-maroon-700" />
            Ala Carte Assembly Builder
          </div>
          <h1 className="font-serif text-2xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
            Kustom Paket Pernikahan Mandiri
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Rakit dan sesuaikan busana pengantin, rias MUA, aksesoris, dan dekorasi pelaminan sesuai selera dan anggaran Anda.
          </p>
        </div>

        {(selectedBundles.length > 0 || customItems.length > 0) && (
          <button
            onClick={clearCart}
            className="text-xs font-semibold text-rose-600 hover:text-rose-700 underline flex items-center gap-1.5 self-start md:self-auto py-1"
          >
            <Trash2 className="w-4 h-4" />
            Kosongkan Rakitan
          </button>
        )}
      </div>

      {/* Mobile Visual Stepper Guide */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 p-3 bg-white rounded-2xl border border-slate-200 shadow-2xs text-center text-xs">
        <div className="p-2 rounded-xl bg-maroon-50 text-maroon-900 font-bold border border-maroon-200">
          <span className="block text-[10px] uppercase text-maroon-600">Langkah 1</span>
          <span>1. Pilih Item</span>
        </div>
        <div className="p-2 rounded-xl bg-slate-50 text-slate-700 font-semibold border border-slate-200">
          <span className="block text-[10px] uppercase text-slate-400">Langkah 2</span>
          <span>2. Set Tanggal</span>
        </div>
        <div className="p-2 rounded-xl bg-slate-50 text-slate-700 font-semibold border border-slate-200">
          <span className="block text-[10px] uppercase text-slate-400">Langkah 3</span>
          <span>3. Booking DP</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        
        {/* LEFT COLUMN: Selected Items & Category Picker */}
        <div className="lg:col-span-7 space-y-6 sm:space-y-8">
          
          {/* Selected Bundles List */}
          {selectedBundles.length > 0 && (
            <div className="bg-white p-4 sm:p-6 rounded-3xl border border-maroon-200 shadow-sm space-y-4 animate-fadeIn">
              <h2 className="font-serif font-bold text-base sm:text-lg text-slate-900 flex items-center gap-2">
                <Crown className="w-5 h-5 text-maroon-700" />
                Master Bundle Terpilih ({selectedBundles.length})
              </h2>
              
              <div className="space-y-3">
                {selectedBundles.map(b => (
                  <div key={b.id} className="p-3.5 sm:p-4 rounded-2xl bg-maroon-50/50 border border-maroon-200 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 overflow-hidden">
                      {b.image_url && (
                        <img src={b.image_url} alt={b.bundle_name} className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl object-cover shrink-0" />
                      )}
                      <div className="truncate">
                        <h4 className="font-semibold text-xs sm:text-sm text-slate-900 truncate">{b.bundle_name}</h4>
                        <p className="text-xs font-bold text-maroon-800">{formatIDR(b.package_price)}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeBundle(b.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 transition-colors shrink-0"
                      title="Hapus Paket"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Selected Custom Ala Carte Items */}
          <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-serif font-bold text-base sm:text-lg text-slate-900 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-maroon-700" />
                Item Rakitan Satuan ({customItems.length})
              </h2>
              {daysCount > 1 && (
                <span className="text-[11px] sm:text-xs font-semibold text-maroon-800 bg-maroon-50 px-2.5 py-1 rounded-lg border border-maroon-200">
                  Durasi: {daysCount} Hari
                </span>
              )}
            </div>

            {customItems.length === 0 ? (
              <div className="p-6 sm:p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-2">
                <p className="text-xs sm:text-sm font-semibold text-slate-700">Belum ada item satuan yang dipilih</p>
                <p className="text-[11px] text-slate-500">Pilih komponen di bawah untuk menambahkan ke rakitan paket Anda.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {customItems.map(item => (
                  <div key={item.id} className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200 flex items-center justify-between gap-3 shadow-xs">
                    <div className="flex items-center gap-3 overflow-hidden">
                      {item.image_url && (
                        <img src={item.image_url} alt={item.name} className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl object-cover shrink-0" />
                      )}
                      <div className="truncate">
                        <h4 className="font-semibold text-xs sm:text-sm text-slate-900 truncate">{item.name}</h4>
                        <p className="text-xs font-bold text-maroon-800">
                          {formatIDR(item.price_per_day)} <span className="text-[10px] font-normal text-slate-400">/ hari</span>
                        </p>
                        {daysCount > 1 && (
                          <p className="text-[10px] text-slate-500 font-medium">
                            Subtotal {daysCount} hari: {formatIDR(item.price_per_day * item.quantity * daysCount)}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                      <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
                        <button
                          onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                          className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg bg-white hover:bg-slate-200 text-slate-700 transition-colors shadow-2xs"
                          aria-label="Kurangi kuantitas"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-6 text-center text-xs font-bold text-slate-800">{item.quantity}</span>
                        <button
                          onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                          className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg bg-white hover:bg-slate-200 text-slate-700 transition-colors shadow-2xs"
                          aria-label="Tambah kuantitas"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeCustomItem(item.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                        aria-label="Hapus item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Component Catalog Picker */}
          <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-base sm:text-lg text-slate-900">
                Pilih Tambahan Item dari Koleksi
              </h3>
              <Link to="/katalog" className="text-xs text-maroon-700 font-bold hover:underline">
                Lihat Semua &rarr;
              </Link>
            </div>
            
            {/* Category pills with smooth horizontal scroll */}
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
              <button
                onClick={() => setSelectedCat('all')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors shrink-0 ${
                  selectedCat === 'all' 
                    ? 'bg-maroon-800 text-white shadow-xs' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Semua
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCat(cat.slug)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors shrink-0 ${
                    selectedCat === cat.slug 
                      ? 'bg-maroon-800 text-white shadow-xs' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Micro Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
              {filteredCatalogForDrawer.map(prod => (
                <div key={prod.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-2 hover:bg-maroon-50/40 transition-colors">
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    {prod.image_url && (
                      <img src={prod.image_url} alt={prod.name} className="w-12 h-12 rounded-xl object-cover shrink-0" />
                    )}
                    <div className="truncate">
                      <p className="font-semibold text-xs text-slate-900 truncate">{prod.name}</p>
                      <p className="text-[11px] font-bold text-maroon-800">{formatIDR(prod.price_per_day)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => addCustomItem(prod, 1)}
                    className="p-2.5 rounded-xl bg-maroon-700 hover:bg-maroon-800 active:scale-95 text-white text-xs font-bold shadow-xs shrink-0 flex items-center gap-1"
                    title="Tambah ke rakitan"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Pilih</span>
                  </button>
                </div>
              ))}
            </div>

          </div>

        </div>

        {/* RIGHT COLUMN: Sticky Reservation & Budget Calculator */}
        <div ref={configSectionRef} className="lg:col-span-5 sticky top-24 space-y-6">
          
          <div className="bg-white p-5 sm:p-8 rounded-3xl border border-maroon-200 shadow-xl space-y-5">
            <h3 className="font-serif font-bold text-lg sm:text-xl text-slate-900 border-b border-slate-100 pb-3">
              Konfigurasi Jadwal & Biaya
            </h3>

            {/* Event Form Inputs */}
            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Jenis Acara
                </label>
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-maroon-600 text-xs font-medium bg-white"
                >
                  <option value="wedding">Pernikahan & Resepsi (Wedding)</option>
                  <option value="engagement">Lamaran / Tunangan (Engagement)</option>
                  <option value="akad_nikah">Akad Nikah Intimate</option>
                  <option value="aqiqah">Tasyakuran Aqiqah</option>
                  <option value="wisuda">Wisuda / Event Formal</option>
                  <option value="corporate">Acara Korporat / Gathering</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Tanggal Mulai
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      setAvailabilityStatus(null);
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-maroon-600 text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Tanggal Selesai
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => {
                      setEndDate(e.target.value);
                      setAvailabilityStatus(null);
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-maroon-600 text-xs font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Lokasi / Alamat Acara
                </label>
                <textarea
                  rows={2}
                  value={locationAddress}
                  onChange={(e) => setLocationAddress(e.target.value)}
                  placeholder="Gedung / Hotel / Alamat Lengkap Kediaman..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-maroon-600 text-xs"
                />
              </div>
            </div>

            {/* Availability validator button & feedback */}
            <div className="pt-1">
              <button
                type="button"
                onClick={handleValidateSchedule}
                disabled={checkingAvailability || !startDate || !endDate}
                className="w-full py-2.5 rounded-xl border border-maroon-300 bg-maroon-50 hover:bg-maroon-100 text-maroon-900 text-xs font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                <Calendar className="w-4 h-4 text-maroon-700" />
                {checkingAvailability ? 'Memvalidasi Jadwal...' : 'Cek Ketersediaan Tanggal'}
              </button>

              {availabilityStatus === 'available' && (
                <div className="mt-2 p-3 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fadeIn">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Semua item rakitan tersedia pada tanggal tersebut!</span>
                </div>
              )}

              {availabilityStatus === 'conflict' && (
                <div className="mt-2 p-3 bg-rose-50 text-rose-800 border border-rose-300 rounded-xl text-xs font-semibold space-y-1 animate-fadeIn">
                  <div className="flex items-center gap-1.5 font-bold">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>Ada bentrok jadwal item:</span>
                  </div>
                  <ul className="list-disc pl-5 text-[11px]">
                    {conflictDetails.map((c, i) => (
                      <li key={i}>{c.product_name} ({c.blocked_date})</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Price Calculations */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
              {selectedBundles.length > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal Master Bundles:</span>
                  <span className="font-semibold">{formatIDR(bundlesTotal)}</span>
                </div>
              )}
              {customItems.length > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal Item Ala Carte ({daysCount} hari):</span>
                  <span className="font-semibold">{formatIDR(customItemsTotal)}</span>
                </div>
              )}
              <hr className="border-slate-200 my-1" />
              <div className="flex justify-between text-slate-900 font-bold text-sm">
                <span>Total Estimasi Biaya:</span>
                <span className="font-serif text-lg text-slate-950">{formatIDR(grandTotal)}</span>
              </div>
              <div className="flex justify-between text-maroon-900 font-bold text-xs bg-maroon-50 p-2.5 rounded-xl border border-maroon-200">
                <span>Down Payment (DP) 30%:</span>
                <span className="font-serif text-sm text-maroon-800">{formatIDR(minimumDp)}</span>
              </div>
            </div>

            {/* Checkout Action */}
            <button
              onClick={handleProceedToCheckout}
              disabled={grandTotal === 0}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-maroon-800 via-maroon-700 to-maroon-900 hover:from-maroon-900 hover:to-maroon-800 active:scale-98 text-white font-bold text-sm shadow-xl shadow-maroon-900/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>Lanjut ke Formulir Booking</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <p className="text-[11px] text-slate-500 text-center flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Jadwal terproteksi sistem & bebas bentrok.
            </p>

          </div>

        </div>

      </div>

      {/* Mobile Sticky Quick Summary & CTA Floating Bar */}
      {(grandTotal > 0 || totalItemCount > 0) && (
        <div className="lg:hidden fixed bottom-16 inset-x-0 z-30 px-3 pb-2 animate-slideUp">
          <div className="bg-slate-950/95 backdrop-blur-md text-white p-3.5 rounded-2xl border border-maroon-500/40 shadow-2xl flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] text-slate-400 font-medium">
                {totalItemCount} Item Terpilih • DP 30%
              </p>
              <p className="font-serif text-sm font-bold text-amber-300">
                {formatIDR(grandTotal)}
              </p>
            </div>

            <button
              onClick={handleProceedToCheckout}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-maroon-700 to-amber-600 hover:from-maroon-800 hover:to-amber-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-maroon-900/40 active:scale-95 transition-transform shrink-0"
            >
              <span>Booking</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
