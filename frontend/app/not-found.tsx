'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShieldAlert, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="bg-destructive/10 p-6 rounded-full inline-block mb-6">
          <ShieldAlert className="h-16 w-16 text-destructive" />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">
          404 - Halaman Tidak Ditemukan
        </h1>
        <p className="text-lg text-muted-foreground max-w-md mx-auto mb-8">
          Maaf, halaman yang Anda tuju tidak ada dalam sistem WakafChain. Mungkin URL salah atau halaman telah dipindahkan.
        </p>
        <Link href="/">
          <Button size="lg" className="shadow-sm">
            <Home className="mr-2 h-4 w-4" />
            Kembali ke Dashboard
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}
