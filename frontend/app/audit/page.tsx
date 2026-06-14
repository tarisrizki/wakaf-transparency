'use client';

import { useEffect, useState } from 'react';
import { donationsApi, Block } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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

  if (loading) return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-400">Memuat audit trail...</p>
    </main>
  );

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <a href="/" className="text-sm text-blue-600 hover:underline mb-4 block">← Kembali ke Dashboard</a>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Audit Trail Blockchain</h1>
          <p className="text-sm text-gray-500 mt-1">Setiap blok terhubung dengan hash blok sebelumnya</p>
          {verify && (
            <Badge className={`mt-2 ${verify.valid ? 'bg-green-500' : 'bg-red-500'}`}>
              {verify.valid
                ? '🔒 Semua blok valid — tidak ada manipulasi terdeteksi'
                : `⚠️ Manipulasi terdeteksi di blok #${verify.brokenAt}`}
            </Badge>
          )}
        </div>

        <div className="space-y-3">
          {blocks.map((block, i) => (
            <Card key={block.id} className={`font-mono text-xs ${i === 0 ? 'border-blue-200' : ''}`}>
              <CardHeader className="pb-1 pt-3 px-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold">
                    {i === 0 ? '🔵 ' : ''}Block #{block.blockIndex}
                  </CardTitle>
                  <Badge variant="outline" className="text-xs">{block.action}</Badge>
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-3 space-y-1 text-gray-500">
                <p><span className="text-gray-400">Hash:     </span>
                  <span className="text-green-600">{block.hash}</span></p>
                <p><span className="text-gray-400">Previous: </span>{block.previousHash}</p>
                <p><span className="text-gray-400">Actor:    </span>{block.actor}</p>
                <p><span className="text-gray-400">Time:     </span>
                  {new Date(block.createdAt).toLocaleString('id-ID')}</p>
              </CardContent>
            </Card>
          ))}

          {blocks.length === 0 && (
            <p className="text-center text-gray-400 py-8">Belum ada transaksi yang tercatat</p>
          )}
        </div>
      </div>
    </main>
  );
}