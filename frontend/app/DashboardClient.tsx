'use client';

import { useEffect, useState } from 'react';
import { donationsApi, Donation, Summary } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  PieChart, Pie, Cell, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  ResponsiveContainer, Legend,
} from 'recharts';
import { motion } from 'framer-motion';
import { ShieldCheck, ShieldAlert, ArrowUpRight, ArrowDownRight, Wallet } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DashboardClient({ 
  initialSummary, 
  initialDonations, 
  initialVerify 
}: { 
  initialSummary: Summary | null, 
  initialDonations: Donation[], 
  initialVerify: { valid: boolean } | null 
}) {
  const router = useRouter();
  const [summary] = useState<Summary | null>(initialSummary);
  const [donations] = useState<Donation[]>(initialDonations);
  const [verify] = useState<{ valid: boolean } | null>(initialVerify);
  // Removed loading state and useEffect since data is provided via props

  const formatRupiah = (n: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(n);

  const pieData = summary
    ? [
        { name: 'Dana Masuk', value: summary.totalIn, color: 'hsl(158, 64%, 40%)' },
        { name: 'Dana Keluar', value: summary.totalOut, color: 'hsl(0, 84%, 60%)' },
      ]
    : [];

  const barData = donations.reduce(
    (acc: { name: string; masuk: number; keluar: number }[], d) => {
      const date = new Date(d.createdAt).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
      });
      const existing = acc.find((i) => i.name === date);
      if (existing) {
        if (d.type === 'in') existing.masuk += Number(d.amount);
        else existing.keluar += Number(d.amount);
      } else {
        acc.push({
          name: date,
          masuk: d.type === 'in' ? Number(d.amount) : 0,
          keluar: d.type === 'out' ? Number(d.amount) : 0,
        });
      }
      return acc;
    },
    []
  );

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.main 
      className="flex-1 p-6 md:p-12 max-w-6xl mx-auto w-full"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Header */}
      <motion.div variants={item} className="mb-10 space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
          Transparansi Dana <span className="text-primary">Wakaf</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Setiap transaksi tercatat secara permanen di dalam jaringan Blockchain. Kami menjamin transparansi 100% dan integritas data yang tidak bisa dimanipulasi oleh siapapun.
        </p>
        {verify && (
          <div className="flex items-center gap-2 mt-4">
            <Badge variant="outline" className={`py-1.5 px-3 text-sm font-medium ${verify.valid ? 'bg-primary/10 text-primary border-primary/20' : 'bg-destructive/10 text-destructive border-destructive/20'}`}>
              {verify.valid ? (
                <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Blockchain Valid — Data Aman</span>
              ) : (
                <span className="flex items-center gap-2"><ShieldAlert className="h-4 w-4" /> Peringatan — Integritas Data Rusak</span>
              )}
            </Badge>
          </div>
        )}
      </motion.div>

      {/* Summary Cards */}
      {summary && (
        <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Dana Masuk</CardTitle>
              <ArrowUpRight className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {formatRupiah(summary.totalIn)}
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Penyaluran</CardTitle>
              <ArrowDownRight className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {formatRupiah(summary.totalOut)}
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm hover:shadow-md transition-shadow bg-primary text-primary-foreground border-none">
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium text-primary-foreground/80">Saldo Wakaf Tersedia</CardTitle>
              <Wallet className="h-4 w-4 text-primary-foreground/80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {formatRupiah(summary.balance)}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Charts */}
      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Distribusi Dana</CardTitle>
            <CardDescription>Perbandingan total pemasukan dan penyaluran wakaf</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={90}
                    dataKey="value"
                    paddingAngle={5}
                    stroke="none"
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v) => formatRupiah(Number(v))}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Aktivitas Transaksi</CardTitle>
            <CardDescription>Tren dana masuk dan keluar per hari</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                  <YAxis
                    tickFormatter={(v) => v >= 1000000 ? `${v / 1000000}jt` : v >= 1000 ? `${v / 1000}k` : String(v)}
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip 
                    formatter={(v) => formatRupiah(Number(v))}
                    cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend iconType="circle" />
                  <Bar dataKey="masuk" name="Masuk" fill="hsl(158, 64%, 40%)" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  <Bar dataKey="keluar" name="Keluar" fill="hsl(0, 84%, 60%)" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Transaction Table */}
      <motion.div variants={item}>
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Riwayat Transaksi Terbaru</CardTitle>
            <CardDescription>Menampilkan {donations.length} transaksi terakhir yang tercatat di Blockchain.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="w-[120px]">Tanggal</TableHead>
                    <TableHead>Pihak / Donatur</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Keterangan</TableHead>
                    <TableHead className="w-[120px]">Jenis</TableHead>
                    <TableHead className="text-right">Jumlah</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {donations.length > 0 ? donations.map((d) => (
                    <TableRow 
                      key={d.id} 
                      className="hover:bg-muted/30 cursor-pointer"
                      onClick={() => router.push(`/transaction/${d.id}`)}
                    >
                      <TableCell className="font-medium text-muted-foreground text-xs">
                        {new Date(d.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </TableCell>
                      <TableCell className="font-semibold">{d.donorName}</TableCell>
                      <TableCell className="capitalize text-muted-foreground">{d.category || '-'}</TableCell>
                      <TableCell className="text-muted-foreground">{d.description}</TableCell>
                      <TableCell>
                        <Badge
                          variant={d.type === 'in' ? 'default' : 'destructive'}
                          className={d.type === 'in' ? 'bg-primary/10 text-primary hover:bg-primary/20 shadow-none border-0' : 'bg-destructive/10 text-destructive hover:bg-destructive/20 shadow-none border-0'}
                        >
                          {d.type === 'in' ? '↑ Masuk' : '↓ Keluar'}
                        </Badge>
                      </TableCell>
                      <TableCell className={`text-right font-bold ${d.type === 'in' ? 'text-primary' : 'text-destructive'}`}>
                        {d.type === 'in' ? '+' : '-'}
                        {formatRupiah(Number(d.amount))}
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                        Belum ada transaksi yang tercatat.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.main>
  );
}