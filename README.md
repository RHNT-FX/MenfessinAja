<div align="center">

# 💬 Menfessin Aja
**Hyperlocal Campus Community, C2C Marketplace & Lost and Found Platform**

[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Vue.js](https://img.shields.io/badge/Vue.js-3.5-4FC08D?style=for-the-badge&logo=vuedotjs&logoColor=white)](https://vuejs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Hono](https://img.shields.io/badge/Hono.js-4.6-E36002?style=for-the-badge&logo=hono&logoColor=white)](https://hono.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/Supabase_PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://supabase.com/)
[![Midtrans](https://img.shields.io/badge/Midtrans_QRIS-002B49?style=for-the-badge&logo=cashapp&logoColor=white)](https://midtrans.com/)
[![Cloudflare Turnstile](https://img.shields.io/badge/Cloudflare_Turnstile-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)](https://www.cloudflare.com/)

<p align="center">
  Disusun & Dikembangkan oleh:<br>
  <b>Muhammad Rayhant Al Munawar</b><br>
  <b>NIM: 11241059</b>
</p>

[📌 Desain Figma](https://www.figma.com/design/uwSek0zjHuelJrbXUqpmgl/Untitled?node-id=0-1&m=dev&t=FJs5Xu6yQ1uWd1qr-1) • [📺 Video Demo Progres (YouTube)](https://www.youtube.com/watch?v=OjuVE2ToeIY) • [📄 Dokumen SRS & SDD](./)

---

</div>

## 📖 Tentang Proyek

**Menfessin Aja** adalah platform web komunitas terpadu berskala *hyperlocal* yang dirancang khusus bagi lingkungan civitas akademika kampus. Sistem ini mengintegrasikan tiga modul utama dalam satu ekosistem:
1. **Linimasa Menfess Anonim**: Pengiriman aspirasi/curhat secara anonim dengan proteksi data pribadi otomatis (Regex doxxing masker NIM `1124xxxx` dan nomor telepon) serta moderasi teks bertenaga Kecerdasan Buatan (AI NLP Juan Router).
2. **Katalog Marketplace C2C**: Etalase jual beli fisik antar civitas kampus dengan kompresi gambar sisi klien (*client-side WebP* < 100 KB), Computer Vision AI untuk pencegahan barang terlarang, dan pengalihan transaksi fisik secara langsung ke WhatsApp penjual.
3. **Pusat Informasi Lost and Found**: Sistem pelaporan kehilangan dan penemuan barang kampus terpusat dengan badge status (*Hilang*, *Ditemukan*, dan *Resolved*).
4. **Monetisasi Mikro (Midtrans Snap QRIS)**: Pembelian slot postingan tersemat (*Superchat Pinned Post*) dan promosi etalase (*Boost Listing*) melalui QRIS dinamis dan notifikasi webhook bertanda tangan SHA512.

Pengembangan sistem ini mengacu 100% pada dokumen **Software Requirements Specification (SRS)** dan **Software Design Document (SDD)** menggunakan metode **Agile Scrum** bertahap (0% – 100%).

---

## 📺 Video Laporan Progres Pengembangan

Dokumentasi video progres implementasi bertahap:

| Milestone / Sprint | Cakupan | Tautan Video |
| :--- | :--- | :--- |
| **Sprint 0 & 1 (30%)** | Pondasi Monorepo, Database PostgreSQL Supabase, Desain Figma 1:1, Auth JWT, dan Cloudflare Turnstile | [▶️ Tonton di YouTube (Sprint 0 & 1 Progress)](https://www.youtube.com/watch?v=OjuVE2ToeIY) |
| *Sprint 2 (50%)* | *Regex Masking 100%, Juan Router AI NLP Moderation & Feed Interaktif* | *Segera hadir* |
| *Sprint 3 (70%)* | *Marketplace C2C, WebP Compressor, Vision AI & Lost and Found* | *Segera hadir* |
| *Sprint 4 (85%)* | *Monetisasi, Midtrans Dynamic QRIS & Webhook Handler* | *Segera hadir* |
| *Sprint 5 (95%)* | *Dasbor Moderasi Admin, Flagged Queue & User Ban* | *Segera hadir* |
| *Sprint 6 (100%)* | *Uji NFR, Final Polish Figma & Rilis Sistem* | *Segera hadir* |

---

## 🚀 Roadmap Agile Scrum (0% – 100%)

- [x] **Sprint 0 (0% – 15%): Inisialisasi Proyek, Monorepo & Skema Basis Data**
  - [x] Inisialisasi Monorepo NPM Workspaces (`packages/shared`, `apps/server`, `apps/web`).
  - [x] Migrasi Skema PostgreSQL Supabase ([001_initial_schema.sql](./supabase/migrations/001_initial_schema.sql)) sesuai SDD Halaman 16 ERD (`users`, `posts`, `comments`, `transactions`, `moderation_logs`).
  - [x] Penerapan indexing performa query linimasa untuk memenuhi **NFR-001** (< 2 detik).
  - [x] Setup Frontend Vue 3 + Tailwind CSS sesuai palet desain Figma (warm off-white `#FAF9F6`, Cobalt Blue `#2563EB`, rounded-2xl cards).
  - [x] Setup Backend Node.js + Hono.js dengan arsitektur modular router-controller-service (**NFR-005**).

- [x] **Sprint 1 (15% – 30%): Sistem Autentikasi Pengguna & Keamanan Anti-Bot**
  - [x] Registrasi & Login pengguna dengan hashing Bcrypt (salt rounds 10).
  - [x] Sesi terenkripsi JSON Web Token (JWT HS256) berdurasi 7 hari.
  - [x] Integrasi widget dan verifikasi Cloudflare Turnstile (*human-challenge*) untuk mencegah spam dan bot (SRS FR-002 & SDD 4.2).
  - [x] Middleware proteksi endpoint `requireAuth` dan `requireAdmin` (Role-Based Access Control).
  - [x] Vue Router Navigation Guards untuk proteksi rute `/admin` dan guest-only (`/login`, `/register`).
  - [x] 6/6 Automated Test Suites (Vitest) passed 100% dengan respons panggil live endpoint server hanya **3 ms**.

- [ ] **Sprint 2 (30% – 50%): Core Menfess Feed, Regex Sanitizer & AI NLP Moderation**
  - [ ] Regex Sanitizer lokal 100% akurat menyamarkan format NIM kampus (`1124xxxx` ➔ `1124****`) dan nomor telepon seluler (**NFR-002**).
  - [ ] Pipeline pemfilteran AI NLP Juan Router untuk deteksi ujaran kebencian dan konten toksik (`approved` vs `flagged`).
  - [ ] Linimasa feed interaktif, infinite scroll, category pills, sistem upvote, dan utas komentar.

- [ ] **Sprint 3 (50% – 70%): C2C Marketplace & Modul Lost and Found**
  - [ ] Kompresi foto sisi klien ke format WebP (< 100 KB dalam waktu < 3 detik) sebelum upload (**SRS 1.3.3 & NFR-001**).
  - [ ] Supabase Object Storage bucket integration.
  - [ ] Computer Vision AI scanning (Juan Router) untuk barang terlarang.
  - [ ] Direct WhatsApp click-to-chat dengan pre-filled message template.
  - [ ] Pelaporan Lost & Found dengan lokasi kejadian dan aksi "Tandai Selesai" (*Resolve*).

- [ ] **Sprint 4 (70% – 85%): Monetisasi & Gerbang Pembayaran Midtrans QRIS**
  - [ ] Pembelian slot *Superchat Pinned Post* & *Boost Listing*.
  - [ ] Pop-up modal kode QRIS dinamis (Midtrans Snap).
  - [ ] Webhook handler `/api/webhook/midtrans` dengan validasi cryptographic SHA512 signature key.
  - [ ] Auto-aktivasi status promosi saat status pembayaran `settlement`.

- [ ] **Sprint 5 (85% – 95%): Dasbor Moderasi Admin, Audit Log & User Ban**
  - [ ] Antrean review postingan *flagged* beserta visualisasi persentase skor kecurigaan AI.
  - [ ] Aksi cepat moderasi (Setujui / Tolak).
  - [ ] Catatan audit trail permanen di tabel `moderation_logs` (tidak dapat dihapus sepihak sesuai **SRS 2.5**).
  - [ ] Fitur pemblokiran pengguna (*User Ban*) dan pencabutan sesi token JWT aktif.
  - [ ] Rekap audit log riwayat transaksi pembayaran.

- [ ] **Sprint 6 (95% – 100%): Pengujian NFR, Penyelarasan Figma 1:1, & Finalisasi**
  - [ ] Verifikasi seluruh batasan Non-Functional Requirements (**NFR-001 s/d NFR-005**).
  - [ ] Penyelarasan presisi antarmuka Mobile-First lintas perangkat.
  - [ ] Release Notes & Dokumentasi akhir siap pakai.

---

## 🛠️ Arsitektur & Teknologi

```
MenfessinAja/
├── apps/
│   ├── web/                    # Frontend Vue 3 + Tailwind CSS + Pinia + Vite
│   │   ├── src/
│   │   │   ├── components/     # AppNavbar, CategoryNav, Card components
│   │   │   ├── views/          # Timeline, Marketplace, LostFound, Login, Register, Admin
│   │   │   ├── stores/         # Pinia Auth & Session Store
│   │   │   └── utils/          # apiFetch client utility
│   │
│   └── server/                 # Backend Node.js + Hono.js (Clean Architecture)
│       ├── src/
│       │   ├── routes/         # auth, posts, transactions, admin, health
│       │   ├── controllers/    # Request/Response handlers
│       │   ├── services/       # AuthService, TurnstileService
│       │   ├── repositories/   # UserRepository (Supabase & fallback adapter)
│       │   ├── middlewares/    # requireAuth, requireAdmin, errorHandler
│       │   └── config/         # env.ts, supabase.ts
│
├── packages/
│   └── shared/                 # Shared TypeScript Types & Zod Schemas
│
└── supabase/
    └── migrations/             # DDL PostgreSQL Schema sesuai ERD SDD
```

| Lapisan Sistem | Teknologi / Framework | Fungsi Utama |
| :--- | :--- | :--- |
| **Frontend UI** | Vue.js 3, Vite, Tailwind CSS, Lucide Icons | Antarmuka pengguna responsif (Mobile-First) sesuai Figma |
| **State & Routing** | Pinia, Vue Router 4 | Manajemen sesi reaktif & Navigation Guards |
| **Backend API** | Node.js (v20+), Hono.js, TypeScript | Peladen REST API modular, cepat, & ramah serverless |
| **Keamanan / Anti-Bot**| Cloudflare Turnstile, Bcrypt, JWT | Validasi human-check, enkripsi password & proteksi rute |
| **Basis Data Relasional**| PostgreSQL (Supabase) | Penyimpanan 5 entitas relasional & log audit permanen |
| **Media Storage** | Supabase Storage Bucket | Penampung berkas foto produk & bukti temuan (WebP < 100 KB) |
| **Payment Gateway** | Midtrans Core / Snap API | Pembangkitan kode QRIS dinamis & Webhook SHA512 |
| **Kecerdasan Buatan** | Juan Router Gateway API | LLM NLP pemfilter teks & Computer Vision deteksi gambar |

---

## ⚙️ Panduan Instalasi & Menjalankan Lokal

### 1. Kloning Repositori
```bash
git clone https://github.com/RHNT-FX/MenfessinAja.git
cd MenfessinAja
```

### 2. Instalasi Dependensi Monorepo
```bash
npm install
```

### 3. Konfigurasi Environment Variable
Salin berkas `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```
*(Untuk pengujian lokal tahap awal, sistem sudah dilengkapi nilai konfigurasi bawaan dan mode adapter otomatis).*

### 4. Build Modul Shared
```bash
npm run build:shared
```

### 5. Menjalankan Aplikasi
Buka 2 terminal terpisah atau gunakan workspace runner:

**Terminal 1 (Backend API Hono):**
```bash
npm run dev:server
```
*Server aktif pada:* `http://localhost:3000`

**Terminal 2 (Frontend Vue 3 Vite):**
```bash
npm run dev:web
```
*Aplikasi web aktif pada:* `http://localhost:5173`

---

## 🧪 Pengujian Otomatis (Automated Testing)

Menjalankan test suite integrasi menggunakan **Vitest**:
```bash
npm run test
```

Uji langsung endpoint server menggunakan **cURL**:
```bash
# 1. Pengecekan Kesehatan API
curl http://localhost:3000/api/health

# 2. Login Akun Member
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@menfessinaja.ac.id","password":"password123","turnstile_token":"demo-turnstile-token"}'

# 3. Uji Proteksi Token JWT (Ganti dengan token yang didapat)
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer <TOKEN_JWT>"
```

### Akun Demo Bawaan:
- **Member / Mahasiswa**: `student@menfessinaja.ac.id` | Kata Sandi: `password123`
- **Administrator**: `admin@menfessinaja.ac.id` | Kata Sandi: `password123`

---

## 📜 Lisensi & Atribusi

Proyek ini dikembangkan oleh **Muhammad Rayhant Al Munawar (NIM: 11241059)** untuk memenuhi tugas dan implementasi rekayasa perangkat lunak sistem informasi kampus berdasarkan spesifikasi dokumen SRS dan SDD (Versi 1.0).
