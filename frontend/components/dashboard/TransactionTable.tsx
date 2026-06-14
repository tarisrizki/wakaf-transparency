import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Donation } from '@/lib/api';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

export default function TransactionTable({
  paginatedDonations,
  donationsLength,
  currentPage,
  setCurrentPage,
  itemsPerPage,
  totalPages,
  formatRupiah,
  router
}: {
  paginatedDonations: Donation[],
  donationsLength: number,
  currentPage: number,
  setCurrentPage: (updater: (prev: number) => number) => void,
  itemsPerPage: number,
  totalPages: number,
  formatRupiah: (n: number) => string,
  router: AppRouterInstance
}) {
  return (
    <>
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
      
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-muted-foreground">
            Menampilkan {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, donationsLength)} dari {donationsLength} transaksi
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
    </>
  );
}
