'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Lock, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!password) {
      toast.error('Masukkan password terlebih dahulu');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/donations/admin-login`,
        { password },
      );
      document.cookie = `admin_token=${res.data.token}; path=/; max-age=86400`;
      toast.success('Login berhasil');
      window.location.href = '/admin';
    } catch {
      toast.error('Password salah. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex-1 flex items-center justify-center p-6 min-h-screen">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background -z-10" />
      <div className="w-full max-w-md">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center bg-primary text-primary-foreground p-3 rounded-2xl shadow-lg mb-6 shadow-primary/20">
              <Lock className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Akses Admin</h1>
            <p className="text-sm text-muted-foreground mt-2">Masuk untuk mengelola data WakafChain</p>
          </div>
          
          <Card className="border-border/50 shadow-xl shadow-black/5 bg-background/80 backdrop-blur-xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Autentikasi Diperlukan</CardTitle>
              <CardDescription>Hanya pengelola yang memiliki akses untuk mengubah data blockchain.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="password">Kata Sandi (Password)</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  placeholder="••••••••"
                  className="h-12 bg-background/50 focus-visible:ring-primary"
                  disabled={loading}
                />
              </div>
              
              <Button onClick={handleLogin} disabled={loading} className="w-full h-12 text-base font-semibold shadow-md">
                {loading ? 'Memverifikasi...' : 'Masuk ke Dashboard'}
              </Button>
            </CardContent>
          </Card>

          <div className="mt-8 text-center">
            <Link href="/" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali ke Halaman Utama
            </Link>
          </div>
        </motion.div>
      </div>
    </main>
  );
}