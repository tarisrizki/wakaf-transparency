'use client';

import { useEffect, useState } from 'react';
import { donationsApi, Block } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Link as LinkIcon, ShieldAlert, ShieldCheck, Database } from 'lucide-react';
import Link from 'next/link';

export default function AuditPage() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [verify, setVerify] = useState<{ valid: boolean; brokenAt?: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      donationsApi.getAudit().then((r) => setBlocks(r.data)),
      donationsApi.getVerify().then((r) => setVerify(r.data)),
    ]).finally(() => setLoading(false));
  }, []);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const item = {
    hidden: { opacity: 0, x: -10 },
    show: { opacity: 1, x: 0 }
  };

  if (loading) return (
    <main className="flex-1 flex items-center justify-center p-6">
      <div className="flex flex-col items-center gap-4 text-muted-foreground">
        <Database className="w-8 h-8 animate-pulse text-primary" />
        <p className="font-medium">Mensinkronisasi dengan jaringan Blockchain...</p>
      </div>
    </main>
  );

  return (
    <main className="flex-1 p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Blockchain Audit Trail</h1>
              <p className="text-muted-foreground mt-1 text-sm">Menampilkan raw data dari ledger terdistribusi. Hash blok terhubung dengan hash blok sebelumnya menggunakan SHA-256 kriptografi.</p>
            </div>
          </div>
          
          {verify && (
            <Card className={`mt-6 border shadow-sm ${verify.valid ? 'border-primary/20 bg-primary/5' : 'border-destructive/20 bg-destructive/5'}`}>
              <CardContent className="p-4 flex items-center gap-3">
                {verify.valid ? (
                  <ShieldCheck className="w-6 h-6 text-primary" />
                ) : (
                  <ShieldAlert className="w-6 h-6 text-destructive" />
                )}
                <div>
                  <h3 className={`font-semibold ${verify.valid ? 'text-primary' : 'text-destructive'}`}>
                    {verify.valid ? 'Verifikasi Kriptografis Berhasil' : 'Peringatan: Integritas Data Rusak'}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {verify.valid 
                      ? 'Semua blok valid dan tidak ada manipulasi data yang terdeteksi dalam jaringan.'
                      : `Sistem mendeteksi adanya manipulasi atau inkonsistensi hash dimulai dari blok #${verify.brokenAt}.`
                    }
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>

        <motion.div 
          className="space-y-4 relative"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {/* Vertical connecting line */}
          <div className="absolute left-[23px] top-6 bottom-6 w-0.5 bg-border/60 z-0 hidden md:block"></div>

          {blocks.map((block, i) => (
            <motion.div key={block.id} variants={item} className="relative z-10">
              <Card className={`font-mono text-xs overflow-hidden shadow-sm transition-all hover:shadow-md ${i === 0 ? 'border-primary/30 ring-1 ring-primary/20' : 'border-border'}`}>
                <CardHeader className="py-3 px-5 bg-muted/40 border-b flex flex-row items-center justify-between space-y-0">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${i === 0 ? 'bg-primary animate-pulse' : 'bg-muted-foreground/30'}`}></div>
                    <CardTitle className="text-sm font-bold text-foreground">
                      Block #{block.blockIndex}
                    </CardTitle>
                  </div>
                  <Badge variant="outline" className="text-[10px] font-semibold bg-background">{block.action}</Badge>
                </CardHeader>
                <CardContent className="p-5 grid grid-cols-1 md:grid-cols-[100px_1fr] gap-x-4 gap-y-3 text-muted-foreground">
                  <div className="font-semibold text-foreground/70">Hash</div>
                  <div className="break-all text-primary font-bold">{block.hash}</div>
                  
                  <div className="font-semibold text-foreground/70">Prev Hash</div>
                  <div className="break-all">{block.previousHash}</div>
                  
                  <div className="font-semibold text-foreground/70">Actor</div>
                  <div>{block.actor}</div>
                  
                  <div className="font-semibold text-foreground/70">Timestamp</div>
                  <div>{new Date(block.createdAt).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'long' })}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}

          {blocks.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Database className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>Belum ada data block yang terekam di jaringan.</p>
            </div>
          )}
        </motion.div>
      </div>
    </main>
  );
}