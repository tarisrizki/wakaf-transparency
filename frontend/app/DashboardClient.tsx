'use client';

import { useEffect, useState } from 'react';
import { donationsApi, Donation, Summary, DonationFilters } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { ShieldCheck, ShieldAlert } from 'lucide-react';
import { useRouter } from 'next/navigation';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { io } from 'socket.io-client';

import SummaryCards from '@/components/dashboard/SummaryCards';
import DashboardCharts from '@/components/dashboard/DashboardCharts';
import FilterBar from '@/components/dashboard/FilterBar';
import TransactionTable from '@/components/dashboard/TransactionTable';

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
  const [summary, setSummary] = useState<Summary | null>(initialSummary);
  const [donations, setDonations] = useState<Donation[]>(initialDonations);
  const [verify] = useState<{ valid: boolean } | null>(initialVerify);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
    const socketUrl = apiUrl.replace(/\/api$/, '');
    const socket = io(socketUrl);
    
    socket.on('donation_created', (newDonation: Donation) => {
      setDonations((prev) => [newDonation, ...prev]);
      donationsApi.getSummary().then(res => setSummary(res.data)).catch(console.error);
    });

    return () => {
      socket.disconnect();
    };
  }, []);
  
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
      const filters: DonationFilters = {};
      if (search) filters.search = search;
      if (filterType !== 'all') filters.type = filterType;
      if (startDate) filters.startDate = startDate;
      if (endDate) filters.endDate = endDate;
      
      const res = await donationsApi.getAll(filters);
      setDonations(res.data);
      setCurrentPage(1);
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
      setCurrentPage(1);
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

    if (summary) {
      doc.setFontSize(11);
      doc.setTextColor(20);
      doc.text("Ringkasan Keuangan", 14, 32);
      doc.setFontSize(10);
      doc.text(`Total Dana Masuk: ${formatRupiah(summary.totalIn)}`, 14, 38);
      doc.text(`Total Dana Keluar: ${formatRupiah(summary.totalOut)}`, 14, 44);
      doc.text(`Saldo Tersedia: ${formatRupiah(summary.balance)}`, 14, 50);
    }

    const tableData = donations.map((d) => [
      new Date(d.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' }),
      d.donorName,
      d.category || '-',
      d.type === 'in' ? 'Masuk' : 'Keluar',
      formatRupiah(Number(d.amount)),
    ]);

    autoTable(doc, {
      startY: summary ? 58 : 28,
      head: [['Tanggal', 'Pihak / Donatur', 'Kategori', 'Jenis', 'Jumlah']],
      body: tableData,
      theme: 'grid',
      styles: { fontSize: 9 },
      headStyles: { fillColor: [22, 163, 74] },
    });

    doc.save("Laporan_Wakaf.pdf");
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
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

      <SummaryCards summary={summary} formatRupiah={formatRupiah} itemVariant={item} />
      <DashboardCharts summary={summary} initialDonations={initialDonations} formatRupiah={formatRupiah} itemVariant={item} />

      <motion.div variants={item}>
        <Card className="shadow-sm">
          <div className="p-6">
            <FilterBar 
              donationsLength={donations.length}
              search={search}
              setSearch={setSearch}
              filterType={filterType}
              setFilterType={setFilterType}
              startDate={startDate}
              setStartDate={setStartDate}
              endDate={endDate}
              setEndDate={setEndDate}
              applyFilter={applyFilter}
              resetFilter={resetFilter}
              isLoading={isLoading}
              exportToExcel={exportToExcel}
              exportToPDF={exportToPDF}
            />
            <TransactionTable 
              paginatedDonations={paginatedDonations}
              donationsLength={donations.length}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              itemsPerPage={itemsPerPage}
              totalPages={totalPages}
              formatRupiah={formatRupiah}
              router={router}
            />
          </div>
        </Card>
      </motion.div>
    </motion.main>
  );
}