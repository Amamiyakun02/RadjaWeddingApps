import React from 'react';
import { Link } from 'react-router-dom';
import { Crown, Phone, Mail, MapPin, MessageCircle } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-300 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-8 border-b border-white/10">
          
          {/* Brand Col */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-maroon-900 flex items-center justify-center text-amber-200">
                <Crown className="w-4 h-4" />
              </div>
              <span className="font-serif text-lg font-bold text-white">
                Radja Wedding
              </span>
            </div>
            <p className="text-[13px] text-slate-400 leading-relaxed">
              Salon & bridal di Jakarta Selatan. Sewa rias, busana adat & modern, aksesoris, dan pelaminan.
            </p>
            <div className="pt-1">
              <a
                href="https://wa.me/6281234567890?text=Halo%20Radja%20Wedding,%20saya%20ingin%20tanya%20jadwal"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-white/20 text-[13px] text-slate-200 hover:bg-white/10 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp studio
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">
              Layanan
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/katalog" className="hover:text-slate-100 transition-colors">
                  Katalog Busana & Tata Rias
                </Link>
              </li>
              <li>
                <Link to="/kustom-paket" className="hover:text-slate-100 transition-colors">
                  Kustom Ala Carte (Rakit Sendiri)
                </Link>
              </li>
              <li>
                <Link to="/cek-jadwal" className="hover:text-slate-100 transition-colors">
                  Kalender Ketersediaan Tanggal
                </Link>
              </li>
              <li>
                <Link to="/galeri" className="hover:text-slate-100 transition-colors">
                  Galeri Momen Pengantin
                </Link>
              </li>
              <li>
                <Link to="/testimoni" className="hover:text-slate-100 transition-colors">
                  Ulasan & Testimoni Klien
                </Link>
              </li>
            </ul>
          </div>

          {/* Business Info */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">
              Kategori
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/katalog?category_slug=busana" className="hover:text-slate-100 transition-colors">
                  Busana Adat Sunda Siger & Jawa
                </Link>
              </li>
              <li>
                <Link to="/katalog?category_slug=busana" className="hover:text-slate-100 transition-colors">
                  Gaun Pengantin Modern Bridal
                </Link>
              </li>
              <li>
                <Link to="/katalog?category_slug=rias" className="hover:text-slate-100 transition-colors">
                  Tata Rias Pengantin & MUA Flawless
                </Link>
              </li>
              <li>
                <Link to="/katalog?category_slug=aksesoris" className="hover:text-slate-100 transition-colors">
                  Aksesoris, Siger, & Tiara Swarovski
                </Link>
              </li>
              <li>
                <Link to="/katalog?category_slug=dekorasi" className="hover:text-slate-100 transition-colors">
                  Dekorasi Pelaminan & Properti Event
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">
              Studio
            </h4>
            <ul className="space-y-2.5 text-[13px] text-slate-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                <span>Jl. Radja Mahligai No. 88, Jakarta Selatan</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-slate-500 shrink-0" />
                <span>+62 812-3456-7890 (jam studio 09.00–19.00)</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-slate-500 shrink-0" />
                <span>kontak@salonradja.com</span>
              </li>
              <li className="pt-1">
                <Link
                  to="/admin/login"
                  className="text-xs text-slate-500 hover:text-slate-200"
                >
                  Masuk staf / admin
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <p>© 2026 Radja Wedding · salonradja.com</p>
          <p>Senin–Sabtu, 09.00–19.00 WIB</p>
        </div>

      </div>
    </footer>
  );
}
