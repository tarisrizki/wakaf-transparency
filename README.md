# Wakaf Transparency System

[![Deploy to Vercel](https://img.shields.io/badge/Vercel-Deployment_Status-000000?style=for-the-badge&logo=vercel)](https://wakaf-transparency.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)

Sistem transparansi pengelolaan dana wakaf berbasis blockchain.

Live Demo: https://wakaf-transparency.vercel.app

## Tech Stack

- Frontend: Next.js 16, Tailwind CSS, shadcn/ui → Vercel
- Backend: NestJS, TypeORM, TypeScript → Railway
- Database: PostgreSQL (Supabase)
- Blockchain: Custom SHA-256 Chain (tanpa token/crypto)

## Fitur

- Dashboard publik — transparansi dana real-time
- Ringkasan keuangan (masuk, keluar, saldo)
- Riwayat transaksi lengkap dengan filter, pencarian & pagination
- Kategori transaksi untuk mempermudah pelacakan (Zakat, Sedekah, Operasional, dll)
- Export PDF/Excel untuk laporan keuangan yang bisa diunduh
- UI/UX Modern: Dark Mode, Skeleton Loading, dan Toast Notifications
- Admin panel — input transaksi baru
- Blockchain audit trail — setiap transaksi punya hash unik
- Verifikasi integritas chain — deteksi manipulasi otomatis
- Multi-user Role (SuperAdmin, Admin) — kontrol akses berbeda
- Realtime Notifications via WebSocket — pembaruan dashboard otomatis

## Screenshots

*(Tambahkan gambar screenshot aplikasi di bawah ini)*
- **Dashboard Publik**: `![Dashboard](/docs/dashboard.png)`
- **Admin Panel**: `![Admin Panel](/docs/admin.png)`
- **Blockchain Audit**: `![Audit Trail](/docs/audit.png)`

## Demo Video

🔗 **[Tonton Video Demo (30-60 detik) di sini](https://youtube.com/...)**

*Saran untuk rekaman:*
1. (0-10s) Tunjukkan Public Dashboard & UI/UX.
2. (10-30s) Login sebagai Admin, tambahkan data transaksi baru.
3. (30-45s) Tunjukkan notifikasi realtime dan perubahan saldo di dashboard.
4. (45-60s) Tunjukkan halaman verifikasi blockchain (Audit Trail) untuk membuktikan data tidak bisa dimanipulasi.

## API Endpoints

- GET  /api/donations         → Semua transaksi
- GET  /api/donations/summary → Ringkasan keuangan
- GET  /api/donations/audit   → Blockchain audit trail
- GET  /api/donations/verify  → Verifikasi integritas chain
- POST /api/donations         → Tambah transaksi baru

## Kenapa Blockchain?

Setiap transaksi di-hash menggunakan SHA-256 dan dirantai ke block sebelumnya.
Jika ada yang mencoba mengubah data, hash tidak cocok dan manipulasi langsung terdeteksi.

## Author

Taris Rizki — https://github.com/tarisrizki