import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, ShoppingBag, ArrowRight, 
  Star, ChevronRight
} from 'lucide-react';
import { api } from '../../services/api';
import { useBooking } from '../../context/BookingContext';
import { formatIDR } from '../../utils/formatters';

export default function LandingPage({ onOpenKirana }) {
  const [categories, setCategories] = useState([]);
  const [bundles, setBundles] = useState([]);
  const [featuredTestimonials, setFeaturedTestimonials] = useState([]);
  const [galleries, setGalleries] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [activeFaq, setActiveFaq] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const { addBundle } = useBooking();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catsRes, bundlesRes, testiRes, galRes, faqsRes] = await Promise.all([
          api.getCategories(),
          api.getBundles(),
          api.getTestimonials(true),
          api.getGalleries(),
          api.getFaqs(),
        ]);
        setCategories(catsRes);
        setBundles(bundlesRes);
        setFeaturedTestimonials(testiRes);
        setGalleries(galRes);
        setFaqs(faqsRes);
      } catch (err) {
        console.error('Error fetching landing data:', err);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-14 sm:space-y-24 pb-12 sm:pb-20">
      
      {/* 1. HERO SECTION */}
      <section className="bg-white pt-8 sm:pt-14 pb-12 sm:pb-16 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-4 sm:space-y-5 text-left">
              <p className="text-[13px] font-medium text-slate-500">
                Salon & bridal — melayani akad, resepsi, dan lamaran di Jabodetabek
              </p>
              
              <h1 className="font-serif text-3xl sm:text-5xl font-bold text-slate-900 leading-[1.15] tracking-tight">
                Sewa busana, rias, dan pelaminan untuk hari-H.
              </h1>
              
              <p className="text-sm sm:text-base text-slate-600 max-w-xl leading-relaxed">
                Radja Wedding menyewakan kebaya Sunda, Jawa, Minang, gaun bridal, jasa MUA,
                dan dekorasi pelaminan. Pilih paket jadi atau rakit sendiri, lalu kunci tanggal Anda.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <Link
                  to="/katalog"
                  className="px-6 py-3 rounded-lg text-sm font-semibold text-white bg-maroon-900 hover:bg-maroon-800 transition-colors inline-flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Lihat katalog
                </Link>

                <button
                  onClick={onOpenKirana}
                  className="px-5 py-3 rounded-lg text-sm font-medium text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 transition-colors inline-flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-maroon-700" />
                  Konsultasi paket
                </button>
              </div>

              {/* Info praktis */}
              <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-slate-200 max-w-lg">
                <div>
                  <p className="text-[13px] font-semibold text-slate-900">Fitting di studio</p>
                  <p className="text-xs text-slate-500">Maks. 1–2 minggu sebelum acara</p>
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-slate-900">DP 30%</p>
                  <p className="text-xs text-slate-500">Transfer / QRIS, verifikasi admin</p>
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-slate-900">Home service MUA</p>
                  <p className="text-xs text-slate-500">Bisa datang ke lokasi acara</p>
                </div>
              </div>

            </div>

            {/* Right Visual Composition */}
            <div className="lg:col-span-5 relative mt-4 sm:mt-0">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="relative rounded-xl overflow-hidden border border-slate-200">
                  <img
                    src="https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&w=900&q=80"
                    alt="Pengantin dengan kebaya Sunda"
                    className="w-full h-72 sm:h-[440px] object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-white/95 border-t border-slate-200 p-4 text-left">
                    <p className="text-[13px] font-semibold text-slate-900">Kebaya Sunda Siger — koleksi studio</p>
                    <p className="text-xs text-slate-500">Stok fisik terbatas, cek tanggal sebelum booking</p>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. CATEGORIES OVERVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-6 sm:mb-8">
          <h2 className="font-serif text-xl sm:text-3xl font-bold text-slate-900">
            Pilih sesuai kebutuhan: rias, busana, aksesoris, dekorasi
          </h2>
          <p className="text-slate-600 text-sm mt-1.5">
            Semua barang fisik — stok per item terbatas. Bisa sewa satuan atau gabung jadi paket.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/katalog?category_slug=${cat.slug}`}
              className="group p-4 rounded-xl bg-white border border-slate-200 hover:border-slate-400 transition-colors text-left"
            >
              <h3 className="font-semibold text-sm text-slate-900 group-hover:text-maroon-800">
                {cat.name}
              </h3>
              <p className="hidden sm:block text-xs text-slate-500 mt-1 line-clamp-2">
                {cat.description}
              </p>
              <span className="mt-2 text-xs font-medium text-slate-600 flex items-center gap-1">
                Lihat <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. FEATURED MASTER BUNDLES */}
      <section className="bg-slate-50 py-10 sm:py-14 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-6">
            <div>
              <h2 className="font-serif text-xl sm:text-3xl font-bold text-slate-900">
                Paket yang paling sering dipesan
              </h2>
              <p className="text-slate-600 text-sm mt-1">
                Isinya sudah termasuk rias + busana + aksesoris. Harga pasti, tidak ada biaya tersembunyi.
              </p>
            </div>
            <Link
              to="/katalog"
              className="mt-2 text-sm font-medium text-slate-700 hover:text-maroon-800 inline-flex items-center gap-1"
            >
              Semua paket <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {bundles.slice(0, 4).map((b) => (
              <div
                key={b.id}
                className="bg-white rounded-xl overflow-hidden border border-slate-200 flex flex-col"
              >
                <div>
                  <div className="relative h-44 overflow-hidden bg-slate-100">
                    <img
                      src={b.image_url || "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80"}
                      alt={b.bundle_name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="p-4 space-y-2">
                    <h3 className="font-semibold text-[15px] text-slate-900 leading-snug">
                      {b.bundle_name}
                    </h3>
                    <p className="text-[13px] text-slate-600 line-clamp-2 leading-relaxed">
                      {b.description}
                    </p>
                  </div>
                </div>

                <div className="p-4 pt-0 mt-auto space-y-3">
                  <div className="border-t border-slate-100 pt-3 flex items-baseline justify-between">
                    <span className="text-xs text-slate-500">Mulai dari</span>
                    <span className="font-semibold text-base text-slate-900">
                      {formatIDR(b.package_price)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">DP {formatIDR(Math.round(b.package_price * 0.3))} untuk kunci tanggal</p>

                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      to={`/katalog`}
                      className="py-2 px-2.5 rounded-lg border border-slate-300 text-slate-700 text-[13px] text-center"
                    >
                      Detail
                    </Link>
                    <button
                      onClick={() => addBundle(b)}
                      className="py-2 px-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[13px] font-medium text-center flex items-center justify-center gap-1"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      Pilih
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 4. HOW IT WORKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-6">
          <h2 className="font-serif text-xl sm:text-3xl font-bold text-slate-900">
            Cara pesan
          </h2>
          <p className="text-slate-600 text-sm mt-1">
            Empat langkah. Kalau tanggal bentrok, sistem akan menolak sebelum Anda bayar.
          </p>
        </div>

        <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            {
              step: '1',
              title: 'Pilih paket atau rakit sendiri',
              desc: 'Ambil paket jadi, atau pilih satuan: kebaya, beskap, rias, aksesoris, dekorasi.'
            },
            {
              step: '2',
              title: 'Cek tanggal',
              desc: 'Masukkan tanggal acara. Stok yang sudah dibooking tanggal itu tidak bisa dipilih.'
            },
            {
              step: '3',
              title: 'Isi lokasi & bayar DP',
              desc: 'DP 30% via transfer/QRIS, lalu unggah bukti di halaman Riwayat.'
            },
            {
              step: '4',
              title: 'Verifikasi & fitting',
              desc: 'Admin verifikasi 1–2 jam, tanggal terkunci, fitting H-14 s/d H-7.'
            }
          ].map((item, idx) => (
            <li key={idx} className="p-4 rounded-xl bg-white border border-slate-200">
              <p className="text-xs font-semibold text-slate-400">Langkah {item.step}</p>
              <h3 className="font-semibold text-[15px] text-slate-900 mt-1">{item.title}</h3>
              <p className="text-[13px] text-slate-600 leading-relaxed mt-1">{item.desc}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* 5. PORTFOLIO GALLERY */}
      <section className="bg-slate-900 text-white py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-6">
            <div>
              <h2 className="font-serif text-xl sm:text-3xl font-bold">
                Hasil kerja di klien
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                Foto asli dari studio dan lokasi acara. Klik untuk memperbesar.
              </p>
            </div>
            <Link
              to="/galeri"
              className="mt-2 text-sm font-medium text-slate-200 hover:text-white inline-flex items-center gap-1"
            >
              Semua galeri <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {galleries.slice(0, 3).map((g) => (
              <div
                key={g.id}
                onClick={() => setSelectedImage(g.cover_url)}
                className="group relative rounded-xl overflow-hidden cursor-pointer h-64 bg-slate-800 border border-white/10"
              >
                <img
                  src={g.cover_url}
                  alt={g.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 bg-black/70 p-4">
                  <p className="text-xs text-slate-300">{g.event_type || 'Dokumentasi'}</p>
                  <h3 className="font-semibold text-[15px] text-white mt-0.5">{g.title}</h3>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img src={selectedImage} alt="Preview" className="max-w-full max-h-[85vh] rounded-3xl object-contain shadow-2xl" />
            <p className="text-center text-slate-400 text-xs mt-3">Klik di mana saja untuk menutup</p>
          </div>
        </div>
      )}

      {/* 6. TESTIMONIALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-6">
          <h2 className="font-serif text-xl sm:text-3xl font-bold text-slate-900">
            Cerita dari pengantin
          </h2>
          <p className="text-slate-600 text-sm mt-1">
            Ulasan hanya dari booking yang sudah selesai dan lolos moderasi admin.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {featuredTestimonials.map((t) => (
            <figure
              key={t.id}
              className="p-5 rounded-xl bg-white border border-slate-200 flex flex-col"
            >
              <div className="flex items-center gap-1 text-amber-500 mb-2" aria-label={`${t.rating} dari 5`}>
                {[...Array(t.rating || 5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <blockquote className="text-slate-700 text-sm leading-relaxed">
                “{t.content}”
              </blockquote>

              <figcaption className="pt-4 mt-4 border-t border-slate-100 flex items-center gap-3">
                {t.photo_url ? (
                  <img src={t.photo_url} alt={t.customer_name} className="w-9 h-9 rounded-full object-cover" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-slate-200 text-slate-700 font-semibold flex items-center justify-center text-sm">
                    {t.customer_name.charAt(0)}
                  </div>
                )}
                <div>
                  <p className="font-medium text-sm text-slate-900">{t.customer_name}</p>
                  <p className="text-xs text-slate-500">{t.event_name || 'Terverifikasi'}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* 7. FAQ ACCORDION */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="mb-4">
          <h2 className="font-serif text-xl font-bold text-slate-900">
            Pertanyaan yang sering masuk
          </h2>
        </div>

        <div className="divide-y divide-slate-200 border-y border-slate-200">
          {faqs.map((faq, idx) => (
            <div key={idx}>
              <button
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full py-4 text-left font-medium text-[15px] text-slate-900 flex items-center justify-between gap-3"
              >
                <span>{faq.question}</span>
                <ChevronRight className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${activeFaq === idx ? 'rotate-90' : ''}`} />
              </button>
              {activeFaq === idx && (
                <div className="pb-4 text-sm text-slate-600 leading-relaxed">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 8. BOTTOM CTA BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-xl bg-maroon-900 text-white p-6 sm:p-10">
          <div className="max-w-2xl space-y-3">
            <h2 className="font-serif text-xl sm:text-3xl font-bold">
              Tanggal cantik cepat penuh. Cek dulu sebelum DP.
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Masukkan tanggal dan item pilihan di halaman Cek Jadwal — gratis, tanpa harus booking dulu.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
              <Link
                to="/cek-jadwal"
                className="text-center px-5 py-2.5 rounded-lg bg-white text-slate-900 font-semibold text-sm"
              >
                Cek tanggal
              </Link>
              <a
                href="https://wa.me/6281234567890"
                target="_blank"
                rel="noreferrer"
                className="text-center px-5 py-2.5 rounded-lg border border-white/30 text-white text-sm"
              >
                WhatsApp studio
              </a>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
