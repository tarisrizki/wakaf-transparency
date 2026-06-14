import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Loader2, X, FileSpreadsheet, FileText } from 'lucide-react';
import { CardTitle, CardDescription } from '@/components/ui/card';

export default function FilterBar({
  donationsLength,
  search,
  setSearch,
  filterType,
  setFilterType,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  applyFilter,
  resetFilter,
  isLoading,
  exportToExcel,
  exportToPDF
}: {
  donationsLength: number,
  search: string,
  setSearch: (s: string) => void,
  filterType: string,
  setFilterType: (f: string) => void,
  startDate: string,
  setStartDate: (d: string) => void,
  endDate: string,
  setEndDate: (d: string) => void,
  applyFilter: () => void,
  resetFilter: () => void,
  isLoading: boolean,
  exportToExcel: () => void,
  exportToPDF: () => void
}) {
  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <CardTitle>Riwayat Transaksi Terbaru</CardTitle>
          <CardDescription>Menampilkan {donationsLength} transaksi yang tercatat di Blockchain.</CardDescription>
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
    </>
  );
}
