'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { donationsApi, Donation, Block } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ExternalLink, ShieldCheck, Copy, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TransactionDetail() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [data, setData] = useState<{ donation: Donation; block: Block | null } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) return;
    donationsApi.getById(id)
      .then((res) => setData(res.data))
      .catch((err) => setError('Data tidak ditemukan atau terjadi kesalahan.'))
      .finally(() => setLoading(false));
  }, [id]);

  const copyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatRupiah = (n: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(n);

  if (loading) {
    return (
      <main className="flex-1 p-6 md:p-12 max-w-4xl mx-auto w-full space-y-6">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-64 w-full" />
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="flex-1 p-6 md:p-12 max-w-4xl mx-auto w-full space-y-6">
        <Button variant="ghost" onClick={() => router.back()} className="-ml-4 mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Kembali
        </Button>
        <Card className="border-destructive/50 bg-destructive/10">
          <CardContent className="pt-6">
            <p className="text-destructive font-medium text-center">{error || 'Data tidak ditemukan'}</p>
          </CardContent>
        </Card>
      </main>
    );
  }

  const { donation, block } = data;

  return (
    <motion.main 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex-1 p-6 md:p-12 max-w-4xl mx-auto w-full space-y-6"
    >
      <Button variant="ghost" onClick={() => router.back()} className="-ml-4 mb-2 text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Dashboard
      </Button>

      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Detail Transaksi</h1>
          <p className="text-muted-foreground mt-1 text-sm">ID: <span className="font-mono text-xs">{donation.id}</span></p>
        </div>
        <Badge variant="outline" className={`text-base py-1.5 px-4 ${donation.type === 'in' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-destructive/10 text-destructive border-destructive/20'}`}>
          {donation.type === 'in' ? 'Wakaf Masuk' : 'Wakaf Keluar'}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Informasi Dana</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Pihak / Donatur</p>
              <p className="font-semibold text-lg">{donation.donorName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Kategori Transaksi</p>
              <p className="font-medium capitalize">{donation.category || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Keterangan / Peruntukan</p>
              <p className="font-medium">{donation.description || '-'}</p>
            </div>
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">Jumlah (IDR)</p>
              <p className={`text-3xl font-bold ${donation.type === 'in' ? 'text-primary' : 'text-destructive'}`}>
                {donation.type === 'in' ? '+' : '-'}{formatRupiah(Number(donation.amount))}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-primary/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <ShieldCheck className="w-32 h-32" />
          </div>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" /> Validasi Blockchain
            </CardTitle>
            <CardDescription>Jejak audit permanen dari transaksi ini</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 relative z-10">
            {block ? (
              <>
                <div>
                  <p className="text-sm text-muted-foreground">Block Index</p>
                  <p className="font-mono bg-muted/50 w-fit px-2 py-0.5 rounded text-sm">#{block.blockIndex}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Timestamp Pencatatan</p>
                  <p className="font-medium">{new Date(block.createdAt).toLocaleString('id-ID')}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex justify-between items-center">
                    Block Hash
                    <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={() => copyHash(block.hash)}>
                      {copied ? <CheckCircle2 className="w-3 h-3 mr-1 text-primary" /> : <Copy className="w-3 h-3 mr-1" />}
                      {copied ? 'Tersalin' : 'Salin'}
                    </Button>
                  </p>
                  <div className="p-3 bg-muted rounded-md border font-mono text-xs break-all text-muted-foreground">
                    {block.hash}
                  </div>
                </div>
                <div className="pt-4 border-t mt-4">
                  <Button variant="outline" className="w-full" onClick={() => router.push('/audit')}>
                    Lihat Seluruh Rantai Block (Audit) <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="p-4 bg-destructive/10 rounded-md border border-destructive/20 text-destructive text-sm">
                <p className="font-medium">Block tidak ditemukan!</p>
                <p>Data ini mungkin belum ter-sinkronisasi atau rantai block mengalami masalah.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </motion.main>
  );
}
