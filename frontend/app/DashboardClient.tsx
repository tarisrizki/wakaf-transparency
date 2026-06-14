'use client';

import { useEffect, useState } from 'react';
import { donationsApi, Donation, Summary } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
import { ShieldCheck, ShieldAlert, ArrowUpRight, ArrowDownRight, Wallet, Search, Filter, Loader2, X, Download, FileText, FileSpreadsheet } from 'lucide-react';
import { useRouter } from 'next/navigation';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
  const [donations, setDonations] = useState<Donation[]>(initialDonations);
  const [verify] = useState<{ valid: boolean } | null>(initialVerify);
  
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const applyFilter = async () => {
    setIsLoading(true);
    try {
      const filters: any = {};
      if (search) filters.search = search;
      if (filterType !== 'all') filters.type = filterType;
      if (startDate) filters.startDate = startDate;
      if (endDate) filters.endDate = endDate;
      
      const res = await donationsApi.getAll(filters);
      setDonations(res.data);
      setCurrentPage(1); // Reset page on new filter
    } catch (error) {
      console.error('Failed to apply filter', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetFilter = async () => {
    setSearch('');
    setFilterType('all');
    setStartDate('');
    setEndDate('');
    
    setIsLoading(true);
    try {
      const res = await donationsApi.getAll({});
      setDonations(res.data);
      setCurrentPage(1); // Reset page on reset
    } catch (error) {
      console.error('Failed to reset filter', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatRupiah = (n: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(n);

  const exportToExcel = () => {
    const data = donations.map((d) => ({
      'Tanggal': new Date(d.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }),
      'Pihak / Donatur': d.donorName,
      'Kategori': d.category || '-',
      'Keterangan': d.description || '-',
      'Jenis': d.type === 'in' ? 'Dana Masuk' : 'Dana Keluar',
      'Jumlah (Rp)': Number(d.amount),
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Laporan Transaksi");
    XLSX.writeFile(wb, "Laporan_Wakaf.xlsx");
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    doc.text("Laporan Transaksi Wakaf", 14, 15);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Dicetak pada: ${new Date().toLocaleString('id-ID')}`, 14, 22);

    const tableData = donations.map((d) => [
      new Date(d.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' }),
      d.donorName,
      d.category || '-',
      d.type === 'in' ? 'Masuk' : 'Keluar',
      formatRupiah(Number(d.amount)),
    ]);

    autoTable(doc, {
      startY: 28,
      head: [['Tanggal', 'Pihak / Donatur', 'Kategori', 'Jenis', 'Jumlah']],
      body: tableData,
      theme: 'grid',
      styles: { fontSize: 9 },
      headStyles: { fillColor: [22, 163, 74] }, // match primary color
    });

    doc.save("Laporan_Wakaf.pdf");
  };

  const pieData = summary
    ? [
        { name: 'Dana Masuk', value: summary.totalIn, color: 'hsl(158, 64%, 40%)' },
        { name: 'Dana Keluar', value: summary.totalOut, color: 'hsl(0, 84%, 60%)' },
      ]
    : [];

  const barData = initialDonations.reduce(
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

  const totalPages = Math.ceil(donations.length / itemsPerPage);
  const paginatedDonations = donations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle>Riwayat Transaksi Terbaru</CardTitle>
                <CardDescription>Menampilkan {donations.length} transaksi yang tercatat di Blockchain.</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={exportToExcel} size="sm" className="shadow-sm hover:text-primary transition-colors">
                  <FileSpreadsheet className="h-4 w-4 mr-2 text-green-600" />
                  Excel
                </Button>
                <Button variant="outline" onClick={exportToPDF} size="sm" className="shadow-sm hover:text-destructive transition-colors">
                  <FileText className="h-4 w-4 mr-2 text-red-500" />
                  PDF
                </Button>
              </div>
            </div>
            
            <div className="mt-6 bg-muted/10 rounded-xl border p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground mb-4">
                <Filter className="h-4 w-4" /> Filter & Pencarian
              </div>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-4 space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Cari Donatur</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Masukkan nama donatur..."
                      className="pl-9 bg-background shadow-sm"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && applyFilter()}
                    />
                  </div>
                </div>

                <div className="md:col-span-3 space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Jenis Transaksi</label>
                  <Select value={filterType} onValueChange={(val) => setFilterType(val || 'all')}>
                    <SelectTrigger className="w-full bg-background shadow-sm">
                      <SelectValue placeholder="Semua Jenis" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Jenis</SelectItem>
                      <SelectItem value="in">Dana Masuk</SelectItem>
                      <SelectItem value="out">Dana Keluar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="md:col-span-3 space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Rentang Tanggal</label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="date"
                      className="w-full bg-background text-sm shadow-sm"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                    <span className="text-muted-foreground text-xs">-</span>
                    <Input
                      type="date"
                      className="w-full bg-background text-sm shadow-sm"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>

                <div className="md:col-span-2 flex items-end gap-2">
                  <Button onClick={applyFilter} disabled={isLoading} className="w-full shadow-sm">
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Filter className="h-4 w-4 mr-2" />}
                    Cari
                  </Button>
                  {(search || filterType !== 'all' || startDate || endDate) && (
                    <Button variant="outline" onClick={resetFilter} disabled={isLoading} className="px-3 shadow-sm bg-background hover:bg-destructive hover:text-destructive-foreground transition-colors" title="Reset Filter">
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
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
                  {paginatedDonations.length > 0 ? paginatedDonations.map((d) => (
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
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  Menampilkan {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, donations.length)} dari {donations.length} transaksi
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    Sebelumnya
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    Selanjutnya
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.main>
  );
}