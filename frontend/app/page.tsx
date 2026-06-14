'use client';

import { useEffect, useState } from 'react';
import { donationsApi, Donation, Summary } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function Dashboard() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [verify, setVerify] = useState<{ valid: boolean } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryRes, donationsRes, verifyRes] = await Promise.all([
          donationsApi.getSummary(),
          donationsApi.getAll(),
          donationsApi.getVerify(),
        ]);
        setSummary(summaryRes.data);
        setDonations(donationsRes.data);
        setVerify(verifyRes.data);
      } catch (err) {
        console.error('API Error:', err);
        setError('Gagal koneksi ke server: ' + String(err));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatRupiah = (n: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(n);

  if (loading)
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400">Memuat data...</p>
      </main>
    );

  if (error)
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-red-500 text-sm max-w-md text-center">{error}</p>
      </main>
    );

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Transparansi Dana Wakaf</h1>
          <p className="text-gray-500 mt-1">
            Semua transaksi tercatat di blockchain — tidak bisa dimanipulasi
          </p>
          {verify && (
            <Badge className={`mt-2 ${verify.valid ? 'bg-green-500' : 'bg-red-500'}`}>
              {verify.valid
                ? '🔒 Blockchain Valid — Tidak Ada Manipulasi'
                : '⚠️ Blockchain Rusak — Ada Manipulasi'}
            </Badge>
          )}
        </div>

        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-green-600 text-sm">Total Dana Masuk</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-green-700">{formatRupiah(summary.totalIn)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-red-600 text-sm">Total Dana Keluar</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-red-700">{formatRupiah(summary.totalOut)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-blue-600 text-sm">Saldo Tersedia</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-blue-700">{formatRupiah(summary.balance)}</p>
              </CardContent>
            </Card>
          </div>
        )}

        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-lg">Riwayat Transaksi ({donations.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-gray-400 text-xs uppercase">
                    <th className="text-left py-2">Tanggal</th>
                    <th className="text-left py-2">Nama</th>
                    <th className="text-left py-2">Keterangan</th>
                    <th className="text-left py-2">Jenis</th>
                    <th className="text-right py-2">Jumlah</th>
                  </tr>
                </thead>
                <tbody>
                  {donations.map((d) => (
                    <tr key={d.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 text-gray-500 text-xs">
                        {new Date(d.createdAt).toLocaleDateString('id-ID')}
                      </td>
                      <td className="py-3 font-medium">{d.donorName}</td>
                      <td className="py-3 text-gray-500">{d.description}</td>
                      <td className="py-3">
                        <Badge
                          variant={d.type === 'in' ? 'default' : 'destructive'}
                          className="text-xs"
                        >
                          {d.type === 'in' ? '↑ Masuk' : '↓ Keluar'}
                        </Badge>
                      </td>
                      <td
                        className={`py-3 text-right font-semibold ${
                          d.type === 'in' ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {d.type === 'in' ? '+' : '-'}
                        {formatRupiah(Number(d.amount))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4 text-sm">
          <a href="/admin" className="text-blue-600 hover:underline">
            → Admin Panel
          </a>
          <a href="/audit" className="text-blue-600 hover:underline">
            → Audit Blockchain
          </a>
        </div>
      </div>
    </main>
  );
}