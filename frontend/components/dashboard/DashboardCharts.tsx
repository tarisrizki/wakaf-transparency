import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  PieChart, Pie, Cell, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  ResponsiveContainer, Legend,
} from 'recharts';
import { Summary, Donation } from '@/lib/api';
import { motion } from 'framer-motion';

export default function DashboardCharts({
  summary,
  initialDonations,
  formatRupiah,
  itemVariant
}: {
  summary: Summary | null,
  initialDonations: Donation[],
  formatRupiah: (n: number) => string,
  itemVariant: any
}) {
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

  return (
    <motion.div variants={itemVariant} className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
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
  );
}
