import React, { useState, useEffect } from 'react';
import { 
  CalendarRange, Plus, Trash2, Calendar, 
  Check, X, AlertTriangle, ShieldCheck, ArrowRight, 
  Lock, Unlock, Sparkles, Copy, ExternalLink, Download, Smartphone, Globe
} from 'lucide-react';
import { api } from '../../services/api';
import { formatDate } from '../../utils/formatters';

export default function AdminScheduleMatrix() {
  const today = new Date().toISOString().split('T')[0];
  const nextMonth = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(nextMonth);
  const [matrixData, setMatrixData] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Manual Lock Date Modal
  const [lockModalOpen, setLockModalOpen] = useState(false);
  const [lockProdId, setLockProdId] = useState('');
  const [lockDate, setLockDate] = useState(today);
  const [lockReason, setLockReason] = useState('laundry');
  const [submitting, setSubmitting] = useState(false);

  // Google Calendar Sync Modal
  const [syncModalOpen, setSyncModalOpen] = useState(false);
  const [syncInfo, setSyncInfo] = useState(null);
  const [copiedFeed, setCopiedFeed] = useState(false);

  // Cell Details Modal
  const [selectedCellEvent, setSelectedCellEvent] = useState(null);

  const fetchMatrix = async () => {
    setLoading(true);
    try {
      const [matrixRes, prodsRes] = await Promise.all([
        api.getScheduleMatrix(startDate, endDate),
        api.getProducts()
      ]);
      setMatrixData(matrixRes.matrix || []);
      setProducts(prodsRes);
      if (prodsRes.length > 0 && !lockProdId) {
        setLockProdId(prodsRes[0].id);
      }
    } catch (err) {
      console.error('Error fetching schedule matrix:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSyncInfo = async () => {
    try {
      const info = await api.getCalendarSyncInfo();
      setSyncInfo(info);
    } catch (err) {
      console.error('Error fetching sync info:', err);
    }
  };

  useEffect(() => {
    fetchMatrix();
  }, [startDate, endDate]);

  useEffect(() => {
    fetchSyncInfo();
  }, []);

  const handleCreateLock = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.blockScheduleDate(lockProdId, lockDate, lockReason);
      setLockModalOpen(false);
      fetchMatrix();
    } catch (err) {
      alert(err.message || 'Gagal mengunci jadwal');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteLock = async (blockId) => {
    if (!window.confirm('Buka kembali kunci tanggal ini agar dapat disewa oleh customer?')) return;
    try {
      await api.deleteScheduleBlock(blockId);
      fetchMatrix();
    } catch (err) {
      alert(err.message || 'Gagal membuka kunci jadwal');
    }
  };

  const handleCopyFeed = (url) => {
    navigator.clipboard.writeText(url);
    setCopiedFeed(true);
    setTimeout(() => setCopiedFeed(false), 2500);
  };

  // Generate date list between startDate and endDate
  const getDateList = () => {
    const list = [];
    const current = new Date(startDate);
    const end = new Date(endDate);
    while (current <= end) {
      list.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }
    return list;
  };

  const dateList = getDateList();

  return (
    <div className="p-4 sm:p-6 lg:p-10 space-y-6 sm:space-y-8 max-w-7xl mx-auto text-slate-800">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-maroon-100 pb-5 sm:pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-maroon-50 text-maroon-800 border border-maroon-200 uppercase tracking-wider">
              Real-time Availability Engine
            </span>
            <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Google Calendar Sync Ready
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Matriks Ketersediaan & Kunci Tanggal
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Pantau jadwal barang fisik secara real-time, kunci tanggal maintenance, dan sinkronkan dua arah dengan Google Calendar.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setSyncModalOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-white hover:bg-maroon-50 text-maroon-900 border border-maroon-200 font-bold text-xs flex items-center gap-2 shadow-2xs transition-all active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-maroon-700" />
            <span>Sinkronkan Google Calendar</span>
          </button>

          <button
            onClick={() => setLockModalOpen(true)}
            className="px-4 sm:px-5 py-2.5 rounded-2xl bg-gradient-to-r from-maroon-800 via-maroon-700 to-maroon-900 hover:from-maroon-900 hover:to-maroon-800 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-maroon-900/20 active:scale-95 transition-transform"
          >
            <Lock className="w-4 h-4 text-amber-300" />
            <span>Kunci Tanggal (Tutup)</span>
          </button>
        </div>
      </div>

      {/* Date Range Controls & Legend */}
      <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-maroon-100 shadow-xs text-xs">
        <span className="text-maroon-900 font-bold uppercase">Rentang Tanggal:</span>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="flex-1 sm:flex-none px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-medium focus:bg-white focus:ring-2 focus:ring-maroon-600"
          />
          <span className="text-slate-400">s/d</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="flex-1 sm:flex-none px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-medium focus:bg-white focus:ring-2 focus:ring-maroon-600"
          />
        </div>

        <div className="sm:ml-auto flex flex-wrap items-center gap-3 text-[11px] pt-2 sm:pt-0 font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-maroon-700"></span>
            <span className="text-slate-700 font-semibold">Dipesan Klien (Booked)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-amber-500"></span>
            <span className="text-slate-700 font-semibold">Tutup (Laundry / Servis)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-slate-100 border border-slate-300"></span>
            <span className="text-slate-500">Tersedia (Bisa Dipesan)</span>
          </div>
        </div>
      </div>

      {/* Swipe guide hint for mobile */}
      <div className="lg:hidden text-[11px] text-slate-500 flex items-center gap-1.5 bg-white p-2.5 rounded-xl border border-maroon-100 shadow-2xs">
        <span>👉</span>
        <span>Geser tabel ke samping untuk melihat seluruh tanggal matriks</span>
      </div>

      {/* Matrix Table */}
      <div className="bg-white rounded-3xl border border-maroon-100 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#FAF2F4] text-maroon-950 uppercase text-[10px] tracking-wider border-b border-maroon-200 sticky top-0 font-bold z-20">
              <tr>
                <th className="py-3.5 px-4 sm:px-5 min-w-[180px] sm:min-w-[220px] w-[180px] sm:w-[220px] bg-[#FAF2F4] sticky left-0 z-20 border-r border-maroon-200 shadow-xs">
                  Item Fisik
                </th>
                {dateList.map(d => {
                  const dayNum = new Date(d).getDate();
                  const monthShort = new Date(d).toLocaleString('id-ID', { month: 'short' });
                  return (
                    <th key={d} className="py-3 px-2 sm:px-3 text-center border-r border-maroon-100 min-w-[55px] sm:min-w-[65px]">
                      <div className="font-bold text-slate-900">{dayNum}</div>
                      <div className="text-[9px] text-slate-500 lowercase">{monthShort}</div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {matrixData.map(row => (
                <tr key={row.product_id} className="hover:bg-maroon-50/20 transition-colors">
                  <td className="py-3 px-3 sm:px-5 font-semibold text-slate-900 bg-white sticky left-0 z-10 border-r border-maroon-100 truncate min-w-[180px] sm:min-w-[220px] w-[180px] sm:w-[220px] max-w-[180px] sm:max-w-[220px] shadow-xs">
                    <p className="truncate text-xs font-bold text-slate-900">{row.product_name}</p>
                    <span className="text-[9px] sm:text-[10px] text-maroon-700 font-normal">{row.category}</span>
                  </td>

                  {dateList.map(d => {
                    const blockInfo = row.blocked_dates?.[d];
                    if (!blockInfo) {
                      return (
                        <td key={d} className="p-1.5 text-center border-r border-slate-100">
                          <span className="inline-block w-full py-1 text-[10px] text-slate-300">-</span>
                        </td>
                      );
                    }

                    const isBooking = blockInfo.reason === 'booking';

                    return (
                      <td key={d} className="p-1 text-center border-r border-slate-100">
                        <div
                          onClick={() => {
                            if (isBooking) {
                              setSelectedCellEvent({
                                productName: row.product_name,
                                date: d,
                                bookingCode: blockInfo.booking_code,
                                bookingId: blockInfo.booking_id,
                                reason: blockInfo.reason
                              });
                            }
                          }}
                          className={`p-1 rounded-xl text-[9px] sm:text-[10px] font-bold truncate flex flex-col items-center justify-center cursor-pointer transition-transform hover:scale-105 ${
                            isBooking 
                              ? 'bg-maroon-100 text-maroon-900 border border-maroon-300 shadow-2xs hover:bg-maroon-200' 
                              : 'bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs'
                          }`}
                          title={isBooking ? `Klik untuk detail & Google Calendar` : `Tutup Jadwal: ${blockInfo.reason}`}
                        >
                          <span>{isBooking ? 'Booked' : 'Tutup'}</span>
                          {!isBooking && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteLock(blockInfo.block_id);
                              }}
                              className="text-[8px] text-rose-700 hover:underline mt-0.5 font-bold flex items-center gap-0.5"
                              title="Buka Kunci Tanggal"
                            >
                              <Unlock className="w-2.5 h-2.5" /> Buka
                            </button>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: GOOGLE CALENDAR SYNCHRONIZATION */}
      {syncModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
          <div className="bg-white w-full sm:max-w-2xl rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl border border-slate-200 max-h-[92vh] flex flex-col justify-between animate-slideUp">
            
            {/* Header */}
            <div className="p-4 sm:p-6 border-b border-maroon-100 flex items-center justify-between bg-gradient-to-r from-maroon-900 via-maroon-800 to-maroon-900 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
                  <CalendarRange className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base sm:text-lg text-white">Sinkronisasi Google Calendar</h3>
                  <p className="text-xs text-amber-200">Hubungkan jadwal Radja Wedding langsung ke HP & PC Anda</p>
                </div>
              </div>
              <button
                onClick={() => setSyncModalOpen(false)}
                className="p-1.5 text-white/80 hover:text-white"
                aria-label="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-xs">
              
              {/* Subscription Feed Link Box */}
              <div className="p-4 bg-maroon-50 rounded-2xl border border-maroon-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-maroon-900 uppercase text-[11px] flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-maroon-700" />
                    URL Live Calendar Feed (.ICS / WebCal)
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                    Auto-Sync Active
                  </span>
                </div>
                
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Gunakan tautan resmi di bawah ini untuk menambahkan kalender Radja Wedding ke Google Calendar Anda. Setiap ada pesanan baru, jadwal otomatis diperbarui di kalender ponsel Anda tanpa perlu input manual.
                </p>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={syncInfo?.feed_url || "http://localhost:8000/api/v1/calendar/feed.ics"}
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-white border border-maroon-300 font-mono text-slate-800 text-xs truncate select-all"
                  />
                  <button
                    onClick={() => handleCopyFeed(syncInfo?.feed_url || "http://localhost:8000/api/v1/calendar/feed.ics")}
                    className="px-4 py-2.5 rounded-xl bg-maroon-800 hover:bg-maroon-900 text-white font-bold flex items-center gap-1.5 shrink-0 shadow-xs active:scale-95 transition-all"
                  >
                    {copiedFeed ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedFeed ? "Tersalin!" : "Salin URL"}</span>
                  </button>
                </div>

                <div className="pt-1 flex flex-wrap gap-2">
                  <a
                    href={syncInfo?.google_calendar_subscribe_url || `https://calendar.google.com/calendar/r/settings/addbyurl?cid=${encodeURIComponent("http://localhost:8000/api/v1/calendar/feed.ics")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 font-bold flex items-center gap-1.5 text-xs transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                    Buka Pengaturan Google Calendar Web
                  </a>

                  <a
                    href="http://localhost:8000/api/v1/calendar/feed.ics"
                    download="radja_wedding_schedule.ics"
                    className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 font-bold flex items-center gap-1.5 text-xs transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-maroon-700" />
                    Unduh File Backup (.ics)
                  </a>
                </div>
              </div>

              {/* Instructions Guides */}
              <div className="space-y-3">
                <h4 className="font-serif font-bold text-sm text-slate-900">
                  Panduan Menghubungkan ke Perangkat Anda
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  
                  {/* Step 1: Google Calendar Android / PC */}
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-maroon-800 font-bold text-xs">
                      <Globe className="w-4 h-4" />
                      <span>Google Calendar PC</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      1. Buka <strong>calendar.google.com</strong>.<br/>
                      2. Klik <strong>(+)</strong> di samping "Kalender lain".<br/>
                      3. Pilih <strong>"Dari URL"</strong> lalu tempel URL Feed di atas.
                    </p>
                  </div>

                  {/* Step 2: iPhone / iOS Calendar */}
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-maroon-800 font-bold text-xs">
                      <Smartphone className="w-4 h-4" />
                      <span>iPhone / iPad (iOS)</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      1. Buka <strong>Settings &rarr; Calendar</strong>.<br/>
                      2. Pilih <strong>Accounts &rarr; Add Subscribed Calendar</strong>.<br/>
                      3. Tempel URL Feed lalu Simpan.
                    </p>
                  </div>

                  {/* Step 3: Android Smartphone */}
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-maroon-800 font-bold text-xs">
                      <Smartphone className="w-4 h-4" />
                      <span>HP Android</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Setelah ditambahkan via browser Google Calendar PC, buka aplikasi Google Calendar di HP lalu centang kalender <strong>Radja Wedding</strong>.
                    </p>
                  </div>

                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="p-4 sm:p-5 border-t border-slate-100 flex justify-end pb-safe bg-slate-50">
              <button
                type="button"
                onClick={() => setSyncModalOpen(false)}
                className="px-6 py-2.5 rounded-xl bg-maroon-800 hover:bg-maroon-900 text-white font-bold text-xs"
              >
                Selesai
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 2: EVENT DETAILS & 1-CLICK GCAL ACTION */}
      {selectedCellEvent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn" onClick={() => setSelectedCellEvent(null)}>
          <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-slate-200 p-6 space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-maroon-700 uppercase">Detail Reservasi Jadwal</span>
                <h3 className="font-serif font-bold text-base text-slate-900">{selectedCellEvent.productName}</h3>
              </div>
              <button onClick={() => setSelectedCellEvent(null)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-400">Kode Booking:</span>
                <span className="font-bold text-slate-900 font-mono">{selectedCellEvent.bookingCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Tanggal:</span>
                <span className="font-bold text-slate-900">{formatDate(selectedCellEvent.date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Status:</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-maroon-100 text-maroon-900 border border-maroon-300">
                  Terkunci (Dipesan)
                </span>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <a
                href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`💍 Pernikahan Klien (${selectedCellEvent.bookingCode}) - Radja Wedding`)}&dates=${selectedCellEvent.date.replace(/-/g, '')}/${selectedCellEvent.date.replace(/-/g, '')}&details=${encodeURIComponent(`Kode: ${selectedCellEvent.bookingCode}\nItem: ${selectedCellEvent.productName}\nRadja Wedding Salon`)}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-maroon-800 to-maroon-900 hover:from-maroon-900 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-maroon-900/20"
              >
                <Calendar className="w-4 h-4 text-amber-300" />
                <span>Buka / Tambah ke Google Calendar</span>
              </a>

              <a
                href={`http://localhost:8000/api/v1/calendar/booking/${selectedCellEvent.bookingId}.ics`}
                download={`booking_${selectedCellEvent.bookingCode}.ics`}
                className="w-full py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 border border-slate-200"
              >
                <Download className="w-3.5 h-3.5 text-maroon-700" />
                <span>Unduh File Acara (.ics)</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: MANUAL LOCK DATE (Mobile bottom sheet) */}
      {lockModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
          <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl border border-slate-200 animate-slideUp">
            <div className="p-4 sm:p-5 border-b border-maroon-100 flex items-center justify-between bg-[#FAF2F4]">
              <div>
                <h3 className="font-serif font-bold text-base sm:text-lg text-maroon-950">Kunci Tanggal Barang</h3>
                <p className="text-[11px] text-slate-500">Barang tidak akan bisa dipesan customer di tanggal ini.</p>
              </div>
              <button onClick={() => setLockModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-700" aria-label="Tutup">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLock} className="p-4 sm:p-6 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Pilih Item Fisik</label>
                <select
                  value={lockProdId}
                  onChange={(e) => setLockProdId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Tanggal yang Ingin Dikunci</label>
                <input
                  type="date"
                  value={lockDate}
                  onChange={(e) => setLockDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-bold focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Alasan Penutupan Tanggal</label>
                <select
                  value={lockReason}
                  onChange={(e) => setLockReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-medium focus:bg-white"
                >
                  <option value="laundry">Pencucian Gaun / Laundry Khusus (Dry Clean)</option>
                  <option value="maintenance">Perbaikan / Jahit Payet / Perawatan</option>
                  <option value="photoshoot">Pemotretan Portofolio Internal Salon</option>
                  <option value="reserved_vip">Khusus Reservasi Offline / Klien VIP</option>
                  <option value="off_day">Libur Operasional Tim</option>
                </select>
              </div>

              <div className="p-4 sm:p-5 border-t border-slate-100 flex justify-end gap-2 pb-safe bg-slate-50">
                <button
                  type="button"
                  onClick={() => setLockModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 sm:px-6 py-2.5 rounded-xl bg-maroon-700 hover:bg-maroon-800 text-white font-bold shadow-md shadow-maroon-700/20"
                >
                  {submitting ? 'Menyimpan...' : 'Kunci Tanggal Ini'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
