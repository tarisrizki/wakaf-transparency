# Wakaf Transparency System

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
- Riwayat transaksi lengkap
- Admin panel — input transaksi baru
- Blockchain audit trail — setiap transaksi punya hash unik
- Verifikasi integritas chain — deteksi manipulasi otomatis

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