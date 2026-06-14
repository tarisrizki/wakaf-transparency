import { donationsApi } from '@/lib/api';
import DashboardClient from './DashboardClient';
import { Card, CardContent } from '@/components/ui/card';
import { ShieldAlert } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  try {
    const [summaryRes, donationsRes, verifyRes] = await Promise.all([
      donationsApi.getSummary(),
      donationsApi.getAll(),
      donationsApi.getVerify(),
    ]);

    return (
      <DashboardClient 
        initialSummary={summaryRes.data} 
        initialDonations={donationsRes.data} 
        initialVerify={verifyRes.data} 
      />
    );
  } catch (error) {
    return (
      <main className="flex-1 flex items-center justify-center p-6">
        <Card className="max-w-md w-full border-destructive/50 bg-destructive/10">
          <CardContent className="pt-6 flex flex-col items-center text-center space-y-4">
            <ShieldAlert className="h-12 w-12 text-destructive" />
            <p className="text-destructive font-medium">
              Gagal koneksi ke server: {String(error)}
            </p>
          </CardContent>
        </Card>
      </main>
    );
  }
}
