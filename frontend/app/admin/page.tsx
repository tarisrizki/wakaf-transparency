'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { donationsApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function AdminPage() {
  const [form, setForm] = useState({
    donorName: '', amount: '', type: 'in', description: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const [isAuth, setIsAuth] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      window.location.href = '/login';
    } else {
      setIsAuth(true);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    router.push('/login');
  };

  const handleSubmit = async () => {
    if (!form.donorName || !form.amount) {
      setMessage({ text: 'Nama dan jumlah wajib diisi', ok: false });
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      await donationsApi.create({
        donorName: form.donorName,
        amount: Number(form.amount),
        type: form.type as 'in' | 'out',
        description: form.description,
      });
      setMessage({ text: '✅ Transaksi berhasil dicatat ke blockchain!', ok: true });
      setForm({ donorName: '', amount: '', type: 'in', description: '' });
    } catch {
      setMessage({ text: '❌ Gagal menyimpan transaksi.', ok: false });
    }
    setLoading(false);
  };

  if (!isAuth) return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-400">Memeriksa autentikasi...</p>
    </main>
  );

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-lg mx-auto">
        <div className="flex justify-between items-center mb-6">
          <a href="/" className="text-sm text-blue-600 hover:underline">
            ← Dashboard
          </a>
          <button
            onClick={handleLogout}
            className="text-sm text-red-500 hover:underline"
          >
            Logout
          </button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Tambah Transaksi Baru</CardTitle>
            <p className="text-sm text-gray-500">
              Setiap transaksi otomatis dicatat ke blockchain
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label>Nama Donatur / Pihak</Label>
              <Input
                value={form.donorName}
                onChange={(e) => setForm({ ...form, donorName: e.target.value })}
                placeholder="Contoh: Budi Santoso"
              />
            </div>
            <div className="space-y-1">
              <Label>Jumlah (Rupiah)</Label>
              <Input
                type="number"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="500000"
              />
            </div>
            <div className="space-y-1">
              <Label>Jenis Transaksi</Label>
              <select
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm bg-white"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                <option value="in">Dana Masuk (Donasi/Wakaf)</option>
                <option value="out">Dana Keluar (Penyaluran)</option>
              </select>
            </div>
            <div className="space-y-1">
              <Label>Keterangan</Label>
              <Input
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Contoh: Donasi pembangunan masjid"
              />
            </div>
            {message && (
              <p className={`text-sm p-3 rounded-md ${
                message.ok ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
              }`}>
                {message.text}
              </p>
            )}
            <Button onClick={handleSubmit} disabled={loading} className="w-full">
              {loading ? 'Menyimpan ke blockchain...' : 'Simpan Transaksi'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}