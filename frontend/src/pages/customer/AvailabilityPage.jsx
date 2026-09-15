import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, CheckCircle, AlertCircle, 
  Search, ShieldCheck, Sparkles, ShoppingBag, ArrowRight 
} from 'lucide-react';
import { api } from '../../services/api';
import { formatIDR, formatDate } from '../../utils/formatters';
import { useBooking } from '../../context/BookingContext';

export default function AvailabilityPage({ onOpenKirana }) {
  const [products, setProducts] = useState([]);
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [checkResult, setCheckResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const { addCustomItem } = useBooking();

  useEffect(() => {
    const fetchProds = async () => {
      try {
        const res = await api.getProducts();
        setProducts(res);
      } catch (err) {
        console.error('Error fetching products:', err);
      }
    };
    fetchProds();
  }, []);

  const handleToggleSelect = (prodId) => {
    if (selectedProductIds.includes(prodId)) {
      setSelectedProductIds(selectedProductIds.filter(id => id !== prodId));
    } else {
      setSelectedProductIds([...selectedProductIds, prodId]);
    }
  };

  const handleCheck = async (e) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      alert('Pilih tanggal mulai dan tanggal akhir acara.');
      return;
    }
    if (selectedProductIds.length === 0) {
      alert('Pilih minimal satu item untuk dicek ketersediaannya.');
      return;
    }

    setLoading(true);
    setCheckResult(null);

    try {
      const res = await api.checkAvailability({
        start_date: startDate,
        end_date: endDate,
        product_ids: selectedProductIds
      });
      setCheckResult(res);
    } catch (err) {
      alert(err.message || 'Gagal memeriksa ketersediaan.');
    } finally {
      setLoading(false);
    }
  };

  const filtered = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (p.category?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 sm:space-y-10">
      
      {/* Header Banner */}
      <div className="text-center max-w-2xl mx-auto space-y-2 sm:space-y-3">
        <span className="px-3.5 py-1 rounded-full bg-maroon-50 text-maroon-900 text-[10px] sm:text-xs font-bold uppercase tracking-wider border border-maroon-200">
          Anti Bentrok Jadwal
        </span>
        <h1 className="font-serif text-2xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
          Cek Ketersediaan Tanggal Real-Time
        </h1>
        <p className="text-xs sm:text-sm text-slate-600">
          Sistem kami memantau pergerakan fisik setiap gaun, set rias MUA, dan properti pelaminan untuk memastikan tidak ada jadwal bentrok di hari sakral Anda.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        
        {/* LEFT: Item Selection Table */}
        <div className="lg:col-span-7 bg-white p-4 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 border-b border-slate-100 pb-3 sm:pb-4">
            <h2 className="font-serif font-bold text-base sm:text-xl text-slate-900">
              Pilih Item yang Ingin Dicek
            </h2>
            <span className="text-xs font-semibold text-maroon-800 bg-maroon-50 px-3 py-1 rounded-full border border-maroon-200 self-start sm:self-auto">
              {selectedProductIds.length} Item Terpilih
            </span>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nama busana / rias..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-maroon-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 max-h-[420px] overflow-y-auto pr-1">
            {filtered.map(p => {
              const isSelected = selectedProductIds.includes(p.id);
              return (
                <div
                  key={p.id}
                  onClick={() => handleToggleSelect(p.id)}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center gap-3 active:scale-98 ${
                    isSelected 
                      ? 'border-maroon-600 bg-maroon-50/80 shadow-2xs' 
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 ${
                    isSelected ? 'bg-maroon-700 border-maroon-700 text-white' : 'border-slate-300 bg-white'
                  }`}>
                    {isSelected && <CheckCircle className="w-3.5 h-3.5" />}
                  </div>
                  {p.image_url && (
                    <img src={p.image_url} alt={p.name} className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl object-cover shrink-0" />
                  )}
                  <div className="overflow-hidden">
                    <p className="font-semibold text-xs text-slate-900 truncate">{p.name}</p>
                    <p className="text-[11px] font-bold text-maroon-800">{formatIDR(p.price_per_day)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT: Date Picker & Results */}
        <div className="lg:col-span-5 sticky top-24 space-y-6">
          
          <form onSubmit={handleCheck} className="bg-white p-5 sm:p-8 rounded-3xl border border-maroon-200 shadow-xl space-y-5">
            <h3 className="font-serif font-bold text-lg sm:text-xl text-slate-900 border-b border-slate-100 pb-3">
              Tentukan Tanggal Acara
            </h3>

            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Tanggal Mulai Acara
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Tanggal Selesai Acara
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-maroon-800 via-maroon-700 to-maroon-900 hover:from-maroon-900 hover:to-maroon-800 active:scale-98 text-white font-bold text-xs shadow-lg shadow-maroon-900/20 transition-all flex items-center justify-center gap-2"
            >
              <CalendarIcon className="w-4 h-4" />
              {loading ? 'Memeriksa Jadwal...' : 'Cek Ketersediaan Sekarang'}
            </button>

            {/* Results Feedback */}
            {checkResult && (
              <div className="pt-2 animate-fadeIn space-y-3">
                {checkResult.is_available ? (
                  <div className="p-4 bg-emerald-50 text-emerald-900 border border-emerald-300 rounded-2xl text-xs space-y-2">
                    <div className="flex items-center gap-2 font-bold text-emerald-800 text-sm">
                      <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                      <span>Jadwal Tersedia Sepenuhnya!</span>
                    </div>
                    <p className="text-[11px] text-emerald-700 leading-relaxed">
                      Semua ({selectedProductIds.length}) item yang Anda pilih bebas reservasi pada tanggal {formatDate(startDate)} s/d {formatDate(endDate)}.
                    </p>
                  </div>
                ) : (
                  <div className="p-4 bg-rose-50 text-rose-900 border border-rose-300 rounded-2xl text-xs space-y-2">
                    <div className="flex items-center gap-2 font-bold text-rose-800 text-sm">
                      <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                      <span>Ditemukan Jadwal Terisi!</span>
                    </div>
                    <p className="text-[11px] text-rose-700">Item berikut sudah terikat reservasi lain:</p>
                    <ul className="list-disc pl-5 text-[11px] text-rose-800">
                      {checkResult.conflicts?.map((c, i) => (
                        <li key={i}><strong>{c.product_name}</strong> ({c.blocked_date})</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </form>

        </div>

      </div>

    </div>
  );
}
