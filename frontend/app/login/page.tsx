'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import axios from 'axios';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    if (!password) return;
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/donations/admin-login`,
        { password },
      );
      localStorage.setItem('admin_token', res.data.token);
      router.push('/admin');
    } catch {
      setError('Password salah. Coba lagi.');
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Admin Login</h1>
          <p className="text-sm text-gray-500 mt-1">
            Transparansi Dana Wakaf
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Masuk sebagai Admin</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label>Password Admin</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                placeholder="Masukkan password"
              />
            </div>
            {error && (
              <p className="text-sm text-red-500 bg-red-50 p-2 rounded">{error}</p>
            )}
            <Button onClick={handleLogin} disabled={loading} className="w-full">
              {loading ? 'Memverifikasi...' : 'Masuk'}
            </Button>
            
              href="/"
              className="block text-center text-sm text-blue-600 hover:underline"
            >
              ← Kembali ke Dashboard
            </a>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}