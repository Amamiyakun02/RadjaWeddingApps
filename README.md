# 👑 Radja Wedding Management System

Aplikasi web komprehensif untuk penyedia jasa persewaan rias pengantin (**Make Up Artist / MUA**), busana adat & modern, aksesoris premium, serta dekorasi pelaminan (**Radja Wedding** - *salonradja.com*).

Dibangun berdasarkan spesifikasi **Software Requirements Specification (SRS v1.0 & v1.5)** dengan arsitektur **FastAPI Backend + React Frontend (Vite & TailwindCSS)**.

---

## 🌟 Fitur Utama

### 1. Modul Customer (Frontend Publik)
- **Hero & Landing Page Mewah:** Showcase busana adat Nusantara (Sunda Siger, Jawa Solo/Jogja, Minang) & Modern Bridal.
- **Katalog & Multi-Filter:** Pencarian item berdasarkan kategori, tema pernikahan, rentang harga, dan ketersediaan stok fisik.
- **Kustom Paket (Ala Carte Assembly Builder):** Memungkinkan calon pengantin merakit paket mandiri (rias + busana pria/wanita + aksesoris + dekorasi) dengan kalkulasi harga dan Down Payment (DP 30%) otomatis.
- **Master Bundles:** Pilihan paket hemat komprehensif siap pakai (Paket Ratu Kencana, Royal Elegance, Melati Suci, Grand Mahligai).
- **Kalender Ketersediaan Real-Time:** Pengecekan konflik jadwal tanggal acara per item fisik untuk mencegah **double booking**.
- **Asisten AI "Kirana" (Wedding Consultant):** Konsultasi interaktif rekomendasi busana dan rias MUA berbasis RAG catalog context (Didukung Gemini API & fallback engine).
- **Portal Pemesanan & Pembayaran Manual:** Alur reservasi lengkap dengan petunjuk transfer Bank BCA/Mandiri dan Scan QRIS, serta unggah bukti transfer langsung.
- **Unduh Invoice & Kwitansi Resmi:** Format invoice HTML/PDF siap cetak dengan rincian biaya, DP, dan sisa tagihan.
- **Galeri Portofolio & Ulasan Klien:** Lightbox foto momen nyata dan formulir testimoni bintang 5.

### 2. Modul Admin Panel (Dashboard & Operasional)
- **Executive Dashboard:** Ringkasan KPI (Kas Masuk Terverifikasi, Booking Menunggu Konfirmasi, Item Sedang Disewa, Testimoni Pending).
- **Manajemen Produk & Stok Fisik (CRUD):** Tambah/edit busana, riasan MUA, stok unit, harga sewa per hari, dan spesifikasi tema/ukuran.
- **Manajemen Paket Bundles (CRUD):** Merakit paket bundling dengan menghubungkan multi-item produk.
- **Manajemen Reservasi & Booking:** Perubahan status transaksi (`pending` ➔ `confirmed` ➔ `dp_paid` ➔ `fully_paid` ➔ `completed` / `cancelled`) dan input catatan internal admin.
- **Verifikasi Pembayaran Manual:** Pratinjau foto struk/transfer dan tombol 1-klik validasi yang otomatis memperbarui status pesanan menjadi `dp_paid`.
- **Schedule Matrix & Blokir Jadwal:** Matriks kalender ketersediaan item dan fitur blokir tanggal manual untuk **pencucian busana (laundry) / perawatan**.
- **Admin AI Executive Assistant (MCP Tool Calling):** Menjalankan analitik pemasukan dan mutasi database (ubah status booking, buat produk baru) melalui perintah bahasa alami (*Natural Language Query*).
- **Moderasi Testimoni & Galeri:** Persetujuan ulasan klien dan publikasi foto portofolio.

---

## ⚙️ Konfigurasi Default (.env)

File konfigurasi backend `.env` sudah disediakan secara default pada direktori `backend/.env`:

```env
APP_NAME="Radja Wedding Management"
APP_ENV="development"
PORT=8000
DATABASE_URL="sqlite:///./radja_wedding.db"
SECRET_KEY="radja-wedding-super-secret-key-signature-2026-production-ready"
ADMIN_DEFAULT_EMAIL="admin@radja.com"
ADMIN_DEFAULT_PASSWORD="admin123"
GEMINI_API_KEY="" # Opsional - Sistem AI otomatis menggunakan fallback RAG Catalog jika kosong
WA_GATEWAY_MOCK=true
DEFAULT_TEST_OTP="123456"
```

---

## 🚀 Cara Menjalankan Aplikasi

### 1. Menjalankan Backend (FastAPI)

Buka terminal pada folder `backend/`:
```bash
cd backend
python -m uvicorn app.main:app --reload --port 8000
```
- API Docs (Swagger UI): [http://localhost:8000/docs](http://localhost:8000/docs)
- Health Check: [http://localhost:8000/api/v1/health](http://localhost:8000/api/v1/health)

### 2. Menjalankan Frontend (React + Vite)

Buka terminal pada folder `frontend/`:
```bash
cd frontend
npm run dev
```
- Customer Web Portal: [http://localhost:5173](http://localhost:5173)
- Admin Panel: [http://localhost:5173/admin/login](http://localhost:5173/admin/login)

---

## 📂 Struktur Direktori Proyek

```
Radja Wedding/
├── backend/
│   ├── app/
│   │   ├── api/v1/          # Modular Endpoints (Auth, Public, Customer, Admin, AI)
│   │   ├── core/            # Config, Security, JWT Token
│   │   ├── db/              # SQLAlchemy Database Engine & Master Data Seeder
│   │   ├── models/          # Relational Models (Products, Bundles, Bookings, Payments, etc.)
│   │   ├── schemas/         # Pydantic Validation Schemas
│   │   ├── services/        # Availability Engine, AI Tool Calling, HTML/PDF Invoices
│   │   └── main.py          # FastAPI Application
│   ├── uploads/             # Media storage (struk pembayaran & gambar)
│   ├── .env                 # Environment variables default
│   ├── requirements.txt     # Python dependencies
│   └── test_api.py          # Automated integration test suite
│
└── frontend/
    ├── src/
    │   ├── components/      # Navbar, Footer, KiranaChatModal, AdminSidebar
    │   ├── context/         # AuthContext & BookingContext (Ala Carte Cart)
    │   ├── pages/
    │   │   ├── customer/    # Landing, Catalog, CustomAssembly, Availability, Checkout, History
    │   │   └── admin/       # Dashboard, Products, Bundles, Bookings, Payments, Matrix, AI Assistant
    │   ├── services/        # Centralized Fetch API Client
    │   ├── utils/           # IDR & Date Formatters, Status Badges
    │   ├── App.jsx          # Router & Layouts
    │   └── index.css        # Luxury gold wedding design tokens
    └── package.json
```
