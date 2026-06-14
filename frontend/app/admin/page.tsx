'use client';

import { useState } from 'react';
import { donationsApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from 'framer-motion';
import { LogOut, PlusCircle, Link as LinkIcon } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminPage() {
  const [form, setForm] = useState({
    donorName: '', amount: '', type: 'in', description: '',
  });
  const [loading, setLoading] = useState(false);

  const handleLogout = () => {
    document.cookie = 'admin_token=; path=/; max-age=0';
    window.location.href = '/login';
  };

  const handleSubmit = async () => {
    if (!form.donorName || !form.amount) {
      toast.error('Gagal Menyimpan', { description: 'Nama dan jumlah wajib diisi.' });
      return;
    }
    setLoading(true);
    try {
      await donationsApi.create({
        donorName: form.donorName,
        amount: Number(form.amount),
        type: form.type as 'in' | 'out',
        description: form.description,
      });
      toast.success('Transaksi Berhasil!', {
        description: 'Telah dicatat secara permanen di blockchain.'
      });
      setForm({ donorName: '', amount: '', type: 'in', description: '' });
    } catch {
      toast.error('Terjadi Kesalahan', { description: 'Gagal menyimpan transaksi ke blockchain.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex-1 p-6 md:p-12">
      <div className="max-w-3xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-end mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Admin Control Panel</h1>
            <p className="text-muted-foreground mt-1">Kelola pencatatan data transaksi wakaf</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout} className="text-muted-foreground hover:text-destructive">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-primary/10 shadow-xl overflow-hidden">
            <CardHeader className="bg-primary/5 border-b border-primary/10 pb-6">
              <div className="flex items-center gap-4">
                <div className="bg-primary p-2.5 rounded-xl text-primary-foreground shadow-sm">
                  <PlusCircle className="w-6 h-6" />
                </div>
                <div>
                  <CardTitle className="text-xl">Tambah Transaksi Baru</CardTitle>
                  <CardDescription className="flex items-center gap-1.5 mt-1.5">
                    <LinkIcon className="w-3.5 h-3.5" /> Setiap entri langsung diamankan oleh Smart Contract
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-8 pb-8 px-6 md:px-8 bg-background/50">
              <div className="space-y-3">
                <Label htmlFor="donorName" className="text-sm font-semibold text-foreground/80">Nama Donatur / Pihak <span className="text-destructive">*</span></Label>
                <Input
                  id="donorName"
                  value={form.donorName}
                  onChange={(e) => setForm({ ...form, donorName: e.target.value })}
                  placeholder="Contoh: Hamba Allah / PT Sejahtera"
                  className="h-12 bg-background"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="amount" className="text-sm font-semibold text-foreground/80">Jumlah (Rupiah) <span className="text-destructive">*</span></Label>
                  <div className="relative">
                    <span className="absolute left-4 top-3.5 text-muted-foreground font-medium text-sm">Rp</span>
                    <Input
                      id="amount"
                      type="number"
                      value={form.amount}
                      onChange={(e) => setForm({ ...form, amount: e.target.value })}
                      placeholder="1000000"
                      className="h-12 pl-12 bg-background font-mono text-sm"
                    />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-foreground/80">Jenis Transaksi <span className="text-destructive">*</span></Label>
                  <Select
                    value={form.type}
                    onValueChange={(val) => setForm({ ...form, type: val as string })}
                  >
                    <SelectTrigger className="h-12 bg-background">
                      <SelectValue placeholder="Pilih Jenis" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="in">Wakaf Masuk (Penerimaan)</SelectItem>
                      <SelectItem value="out">Wakaf Keluar (Penyaluran)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="description" className="text-sm font-semibold text-foreground/80">Keterangan / Peruntukan</Label>
                <Input
                  id="description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Contoh: Pembangunan atap masjid"
                  className="h-12 bg-background"
                />
              </div>

              <div className="pt-6">
                <Button 
                  onClick={handleSubmit} 
                  disabled={loading} 
                  className="w-full h-12 text-base font-semibold shadow-md hover:shadow-lg hover:scale-[1.01] transition-all"
                >
                  {loading ? 'Sedang Memproses Block...' : 'Rekam Transaksi ke Blockchain'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </main>
  );
}