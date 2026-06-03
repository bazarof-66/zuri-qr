'use client';

import { QrCode, ScanLine, TrendingUp, MousePointerClick } from 'lucide-react';
import { StatsCard } from '@/components/ui/StatsCard';
import { ScanChart } from '@/components/dashboard/ScanChart';
import { RecentQRList } from '@/components/dashboard/RecentQRList';
import { PlanAlert } from '@/components/dashboard/PlanAlert';
import { useActiveQRCodes, useAllAnalytics } from '@/lib/hooks/useQRCodes';
import { useAuth } from '@/lib/hooks/useAuth';
import { formatPercentChange } from '@/lib/utils';
import { useMemo } from 'react';
import { subDays, format } from 'date-fns';

export default function DashboardPage() {
  const { profile } = useAuth();
  const { qrcodes, loading } = useActiveQRCodes();
  const { scans } = useAllAnalytics();

  const activeCount = qrcodes.length;
  const totalScans = qrcodes.reduce((acc, qr) => acc + (qr.totalScans ?? 0), 0);
  const planLimit = profile?.plan === 'pro' ? Infinity : 5;
  const planName = profile?.plan ?? 'free';

  const scansThisMonth = useMemo(() => {
    const now = new Date();
    const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return qrcodes.reduce((acc, qr) => acc + (qr.totalScans ?? 0), 0);
  }, [qrcodes]);

  const dailyScans = useMemo(() => {
    const days: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = subDays(new Date(), i);
      const key = format(d, 'yyyy-MM-dd');
      days[key] = 0;
    }
    scans.forEach((s) => {
      const d = format(new Date(s.scannedAt), 'yyyy-MM-dd');
      if (d in days) days[d]++;
    });
    return Object.entries(days).map(([date, count]) => ({ date, count }));
  }, [scans]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-text-primary">Dashboard</h2>
          <p className="text-text-secondary text-sm">Vue d&apos;ensemble de ton activité</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-text-secondary font-mono">Chargement...</p>
          </div>
        </div>
      ) : (
        <>
          {planName === 'free' && (
            <PlanAlert used={activeCount} total={planLimit} />
          )}

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              title="QR Codes actifs"
              value={activeCount}
              icon={<QrCode size={18} />}
              limit={planLimit}
              change={formatPercentChange(activeCount, Math.max(1, activeCount - 1))}
            />
            <StatsCard
              title="Total scans"
              value={totalScans}
              icon={<ScanLine size={18} />}
            />
            <StatsCard
              title="Scans (7 derniers jours)"
              value={scans.length}
              icon={<TrendingUp size={18} />}
            />
            <StatsCard
              title="Taux de scan moyen"
              value={totalScans > 0 ? Math.round(totalScans / Math.max(activeCount, 1)) : 0}
              suffix="/QR"
              icon={<MousePointerClick size={18} />}
            />
          </div>

          <ScanChart data={dailyScans} />

          <RecentQRList qrcodes={qrcodes.slice(0, 5)} />
        </>
      )}
    </div>
  );
}
