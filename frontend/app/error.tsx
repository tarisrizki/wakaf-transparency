'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { AlertOctagon, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Optionally log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="bg-destructive/10 p-6 rounded-full inline-block mb-6">
          <AlertOctagon className="h-16 w-16 text-destructive" />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">
          Terjadi Kesalahan
        </h1>
        <p className="text-lg text-muted-foreground max-w-md mx-auto mb-8">
          Sistem WakafChain mendeteksi kesalahan teknis saat memproses permintaan Anda. Silakan coba beberapa saat lagi.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Button onClick={reset} size="lg" className="shadow-sm">
            <RotateCcw className="mr-2 h-4 w-4" />
            Coba Lagi
          </Button>
          <Link href="/">
            <Button variant="outline" size="lg" className="shadow-sm">
              Kembali ke Beranda
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
