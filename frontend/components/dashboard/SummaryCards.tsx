import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUpRight, ArrowDownRight, Wallet } from 'lucide-react';
import { Summary } from '@/lib/api';
import { motion } from 'framer-motion';

export default function SummaryCards({ 
  summary, 
  formatRupiah,
  itemVariant
}: { 
  summary: Summary | null, 
  formatRupiah: (n: number) => string,
  itemVariant: any
}) {
  if (!summary) return null;

  return (
    <motion.div variants={itemVariant} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
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
  );
}
