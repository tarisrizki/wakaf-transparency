<div align="center">

# ⛓️ WakafChain

### Sistem Transparansi Dana Wakaf Berbasis Blockchain

*Setiap transaksi tercatat permanen. Tidak ada yang bisa dimanipulasi.*

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-wakaf--transparency.vercel.app-22c55e?style=for-the-badge)](https://wakaf-transparency.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

</div>

---

## 💡 Mengapa WakafChain?

Lembaga wakaf, zakat, dan donasi di Indonesia menghadapi satu masalah yang sama — **ketidakpercayaan**. Donatur tidak bisa memastikan apakah dana benar-benar disalurkan dengan tepat. Laporan keuangan bisa dipalsukan, angka bisa diubah, dan tidak ada cara untuk membuktikannya.

WakafChain menjawab masalah ini dengan pendekatan sederhana namun kuat:

> **Setiap transaksi yang masuk akan di-hash menggunakan SHA-256 dan dirantai ke block sebelumnya. Jika ada satu karakter yang diubah di database, hash tidak akan cocok — dan manipulasi terdeteksi otomatis.**

Tidak ada token. Tidak ada cryptocurrency. Hanya sebuah **buku catatan digital yang tidak bisa dimanipulasi**.

---

## 🖥️ Screenshots

| Dashboard Publik | Audit Blockchain | Detail Transaksi |
|:---:|:---:|:---:|
| ![Dashboard](docs/dashboard.png) | ![Audit](docs/audit.png) | ![Detail](docs/detail.png) |

| Admin Panel | Dark Mode | Export Laporan |
|:---:|:---:|:---:|
| ![Admin](docs/admin.png) | ![Dark](docs/dark.png) | ![Export](docs/export.png) |

---

## ✨ Fitur Utama

### 🌐 Dashboard Publik
- Ringkasan keuangan real-time (total masuk, keluar, saldo)
- Visualisasi data dengan Pie Chart & Bar Chart
- Riwayat transaksi dengan **search**, **filter by type**, dan **filter tanggal**
- Pagination (10 transaksi per halaman)
- **Realtime update** via WebSocket — saldo dan tabel berubah otomatis tanpa refresh

### 🔐 Sistem Autentikasi
- Login dengan JWT (access token + refresh token)
- Role-based access control: **SuperAdmin** dan **Admin**
- Middleware protection — halaman admin tidak bisa diakses tanpa login

### 📊 Laporan & Export
- Export ke **PDF** (include ringkasan keuangan + tabel transaksi)
- Export ke **Excel** (format XLSX siap cetak)

### ⛓️ Blockchain Audit Trail
- Setiap transaksi menghasilkan block SHA-256 yang terhubung ke block sebelumnya
- Halaman **Audit** menampilkan seluruh rantai block
- Endpoint **Verify** mendeteksi apakah ada data yang dimanipulasi
- Halaman **Detail Transaksi** menampilkan hash block yang terkait, lengkap dengan tombol copy

### 🎨 UI/UX Modern
- **Dark Mode** dengan deteksi preferensi sistem
- **Skeleton Loading** saat data dimuat
- **Toast Notifications** (Sonner) untuk feedback aksi
- Animasi halus dengan **Framer Motion**
- Desain responsif (mobile-friendly)

---

## 🏗️ Arsitektur

```
┌─────────────────────────────────────────────────────────┐
│                    PENGGUNA / PUBLIK                     │
└──────────────────────────┬──────────────────────────────┘
                           │ HTTPS
┌──────────────────────────▼──────────────────────────────┐
│              Next.js 16 (Vercel)                         │
│  ┌─────────────┐  ┌──────────┐  ┌───────────────────┐   │
│  │  Dashboard  │  │  Audit   │  │  Admin (Protected) │   │
│  │   (SSR)     │  │  Trail   │  │  JWT + Role Guard  │   │
│  └─────────────┘  └──────────┘  └───────────────────┘   │
└──────────────────────────┬──────────────────────────────┘
                           │ REST API + WebSocket
┌──────────────────────────▼──────────────────────────────┐
│                NestJS API (Railway)                       │
│  ┌──────────────────┐    ┌────────────────────────────┐  │
│  │  Donations Module │    │   Blockchain Module        │  │
│  │  - CRUD + Filter  │    │   - SHA-256 Hashing        │  │
│  │  - PDF/Excel      │───▶│   - Chain Verification     │  │
│  │  - WebSocket GW   │    │   - Block Persistence      │  │
│  └──────────────────┘    └────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐    │
│  │  Auth Module (JWT + Roles + Sessions)            │    │
│  └──────────────────────────────────────────────────┘    │
└──────────────────────────┬──────────────────────────────┘
                           │ TypeORM
┌──────────────────────────▼──────────────────────────────┐
│              PostgreSQL (Supabase)                        │
│  ┌────────────┐  ┌────────────┐  ┌────────────────────┐  │
│  │  donations  │  │   blocks   │  │  users / sessions  │  │
│  └────────────┘  └────────────┘  └────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Cara Kerja Blockchain

```
Transaksi 1 (Donasi Rp500.000)
  ↓
Block #0
  ├── previousHash : "0000...0000" (genesis)
  ├── data         : { donorName, amount, type, ... }
  ├── timestamp    : "2026-06-12T07:57:33Z"
  └── hash         : SHA256(0 + prevHash + timestamp + data)
                     = "eecbb978..."
  ↓
Block #1 (Penyaluran Rp200.000)
  ├── previousHash : "eecbb978..." ← hash Block #0
  ├── data         : { ... }
  └── hash         : SHA256(1 + "eecbb978..." + timestamp + data)
                     = "11478f9e..."

❌ Jika seseorang mengubah data Block #0 di database:
   Hash Block #0 berubah → previousHash Block #1 tidak cocok
   → Sistem mendeteksi manipulasi → { valid: false, brokenAt: 1 }
```

---

## 🛠️ Tech Stack

| Layer | Teknologi |
|---|---|
| **Frontend** | Next.js 16, TypeScript, Tailwind CSS, shadcn/ui |
| **Animasi** | Framer Motion |
| **Charts** | Recharts |
| **Realtime** | Socket.IO Client |
| **Export** | jsPDF, jspdf-autotable, SheetJS (xlsx) |
| **Tema** | next-themes (dark/light/system) |
| **Backend** | NestJS, TypeScript, TypeORM |
| **Auth** | JWT, Passport.js, Role Guard |
| **WebSocket** | @nestjs/platform-socket.io |
| **Database** | PostgreSQL (Supabase) |
| **Hosting** | Vercel (frontend) + Railway (backend) |

---

## 📡 API Endpoints

```
# Public Endpoints
GET  /api/donations               → Daftar transaksi (support filter & search)
GET  /api/donations/:id           → Detail transaksi + data blockchain
GET  /api/donations/summary       → Ringkasan keuangan
GET  /api/donations/audit         → Seluruh rantai block
GET  /api/donations/verify        → Verifikasi integritas chain

# Protected (JWT Required — Role: admin / superadmin)
POST /api/donations               → Tambah transaksi baru

# Auth
POST /api/auth/email/login        → Login, mendapatkan JWT token
POST /api/auth/refresh            → Refresh access token
POST /api/auth/logout             → Logout & hapus session
```

---

## 🗂️ Struktur Monorepo

```
wakaf-transparency/
├── backend/                        ← NestJS API
│   └── src/
│       ├── auth/                   ← JWT, Passport, Session
│       ├── donations/
│       │   ├── donations.controller.ts
│       │   ├── donations.service.ts
│       │   ├── donations.gateway.ts    ← WebSocket
│       │   └── donations.service.spec.ts
│       └── blockchain/
│           ├── blockchain.service.ts
│           └── blockchain.service.spec.ts  ← Unit Tests
│
└── frontend/                       ← Next.js App
    ├── app/
    │   ├── page.tsx                ← Dashboard (SSR)
    │   ├── DashboardClient.tsx     ← Client component
    │   ├── audit/page.tsx
    │   ├── login/page.tsx
    │   ├── admin/page.tsx
    │   └── transaction/[id]/page.tsx
    ├── components/
    │   ├── dashboard/
    │   │   ├── SummaryCards.tsx
    │   │   ├── DashboardCharts.tsx
    │   │   ├── FilterBar.tsx
    │   │   └── TransactionTable.tsx
    │   ├── Navbar.tsx
    │   ├── Footer.tsx
    │   └── ThemeToggle.tsx
    ├── lib/api.ts
    └── middleware.ts               ← Route protection
```

---

## 🧪 Unit Tests

```bash
# Backend - Blockchain Service
cd backend && npm run test

# Test coverage:
# ✅ BlockchainService.addBlock     → genesis block, chain linking
# ✅ BlockchainService.verifyChain  → valid chain, tamper detection
# ✅ DonationsService.create        → save + blockchain record + WS notify
# ✅ DonationsService.findOne       → fetch by ID
# ✅ DonationsService.getSummary    → aggregate by type
```

---

## 🚀 Menjalankan Lokal

### Prerequisites
- Node.js 20+
- PostgreSQL (atau akun Supabase gratis)

### 1. Clone & Setup Backend

```bash
git clone https://github.com/tarisrizki/wakaf-transparency.git
cd wakaf-transparency/backend

cp env-example-relational .env
# Edit .env — isi DATABASE_*, AUTH_JWT_SECRET, ADMIN_PASSWORD

npm install
npm run migration:run
npm run start:dev
# API berjalan di http://localhost:3000
```

### 2. Setup Frontend

```bash
cd ../frontend

echo "NEXT_PUBLIC_API_URL=http://localhost:3000/api" > .env.local

npm install
npm run dev
# App berjalan di http://localhost:3001
```

### 3. Akun Demo

```
Email    : admin@wakaf.com
Password : (sesuai yang di-seed)
Role     : Admin
```

---

## 🌐 Deployment

| Service | Platform | URL |
|---|---|---|
| Frontend | Vercel | https://wakaf-transparency.vercel.app |
| Backend API | Railway | https://web-production-800b5.up.railway.app |
| Database | Supabase | PostgreSQL (Singapore region) |

---

## 👨‍💻 Author

**Taris Rizki**

[![GitHub](https://img.shields.io/badge/GitHub-tarisrizki-181717?style=flat-square&logo=github)](https://github.com/tarisrizki)

---

<div align="center">

*Dibangun sebagai portofolio — fokus pada transparansi dana sosial dan teknologi blockchain non-kripto.*

**"Blockchain paling bernilai bukan sebagai mata uang, tapi sebagai buku catatan yang tidak bisa dimanipulasi."**

</div>
