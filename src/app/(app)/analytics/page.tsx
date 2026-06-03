'use client';

import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatNumber, formatRelativeTime } from '@/lib/utils';
import { useAllAnalytics } from '@/lib/hooks/useQRCodes';
import { useAuth } from '@/lib/hooks/useAuth';
import { useState, useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { format, parseISO, subDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ScanLine, Smartphone, Globe, Activity } from 'lucide-react';

export default function AnalyticsPage() {
  const { user } = useAuth();
  const { scans, loading, qrcodes } = useAllAnalytics();

  const today = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    return scans.filter((s) => {
      const d = new Date(s.scannedAt);
      return d >= start;
    }).length;
  }, [scans]);

  const totalScans = useMemo(
    () => qrcodes.reduce((a, qr) => a + (qr.totalScans ?? 0), 0),
    [qrcodes]
  );

  const mostScanned = useMemo(() => {
    if (qrcodes.length === 0) return null;
    return qrcodes.reduce((a, b) => ((a.totalScans ?? 0) > (b.totalScans ?? 0) ? a : b));
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

  const deviceData = useMemo(() => {
    const counts: Record<string, number> = {};
    scans.forEach((s) => {
      const dt = s.deviceType || 'unknown';
      counts[dt] = (counts[dt] ?? 0) + 1;
    });
    const total = scans.length || 1;
    const colors: Record<string, string> = {
      ios: '#22C55E', android: '#EAB308', desktop: '#6366F1', unknown: '#6B7280',
    };
    const labels: Record<string, string> = {
      ios: 'iOS', android: 'Android', desktop: 'Desktop', unknown: 'Inconnu',
    };
    return Object.entries(counts).map(([key, value]) => ({
      name: labels[key] ?? key,
      value: Math.round((value / total) * 100),
      color: colors[key] ?? '#6B7280',
    }));
  }, [scans]);

  const countryData = useMemo(() => {
    const counts: Record<string, number> = {};
    scans.forEach((s) => {
      const c = s.country || 'unknown';
      counts[c] = (counts[c] ?? 0) + 1;
    });
    return Object.entries(counts)
      .map(([country, scans]) => ({ country, scans }))
      .sort((a, b) => b.scans - a.scans)
      .slice(0, 6);
  }, [scans]);

  const recentScans = useMemo(() => scans.slice(0, 20), [scans]);

  const growth = useMemo(() => {
    const now = new Date();
    const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const thisMonth = scans.filter((s) => new Date(s.scannedAt) >= startMonth).length;
    const lastMonth = scans.filter((s) => {
      const d = new Date(s.scannedAt);
      return d >= startLastMonth && d < startMonth;
    }).length;
    if (lastMonth === 0) return { value: '+100%', isPositive: true };
    const pct = Math.round(((thisMonth - lastMonth) / lastMonth) * 100);
    return { value: `${pct >= 0 ? '+' : ''}${pct}%`, isPositive: pct >= 0 };
  }, [scans]);

  if (!user) {
    return (
      <div className="flex items-center justify-center py-20 text-text-muted text-sm">
        Connecte-toi pour voir les analytics
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-text-primary">Analytics</h2>
        <p className="text-text-secondary text-sm">
          Terminal de données — {format(new Date(), 'dd MMMM yyyy', { locale: fr })}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <p className="text-text-muted text-xs mb-1">Total scans</p>
          <p className="text-2xl font-bold font-mono text-primary">{formatNumber(totalScans)}</p>
        </Card>
        <Card>
          <p className="text-text-muted text-xs mb-1">Scans aujourd&apos;hui</p>
          <p className="text-2xl font-bold font-mono text-text-primary">{formatNumber(today)}</p>
        </Card>
        <Card>
          <p className="text-text-muted text-xs mb-1">QR le plus scanné</p>
          <p className="text-lg font-bold text-text-primary truncate">{mostScanned?.name ?? '—'}</p>
          <p className="text-xs font-mono text-primary">{formatNumber(mostScanned?.totalScans ?? 0)} scans</p>
        </Card>
        <Card>
          <p className="text-text-muted text-xs mb-1">Croissance vs mois préc.</p>
          <p className={`text-2xl font-bold font-mono ${growth.isPositive ? 'text-primary' : 'text-danger'}`}>
            {growth.value}
          </p>
        </Card>
      </div>

      <Card>
        <h3 className="text-text-primary font-semibold mb-4">Évolution des scans (7 jours)</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailyScans}>
              <defs>
                <linearGradient id="analyticsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22C55E" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#22C55E" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A2A36" vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={(d) => format(parseISO(d), 'dd MMM', { locale: fr })}
                tick={{ fill: '#6B7280', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} width={40} />
              <Tooltip
                contentStyle={{ background: '#1A1A22', border: '1px solid #2A2A36', borderRadius: 8 }}
                labelFormatter={(d) => format(parseISO(d as string), 'EEEE dd MMM', { locale: fr })}
              />
              <Area type="monotone" dataKey="count" stroke="#22C55E" strokeWidth={2} fill="url(#analyticsGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-text-primary font-semibold mb-4">Origine des scans</h3>
          <div className="space-y-3">
            {countryData.length === 0 && (
              <p className="text-text-muted text-sm text-center py-4">Aucun scan pour le moment</p>
            )}
            {countryData.map((c) => {
              const max = countryData[0]?.scans ?? 1;
              const pct = Math.round((c.scans / max) * 100);
              return (
                <div key={c.country}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-text-secondary">{c.country}</span>
                    <span className="font-mono text-text-primary">{formatNumber(c.scans)}</span>
                  </div>
                  <div className="h-2 rounded-full bg-deep overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <h3 className="text-text-primary font-semibold mb-4">Types d&apos;appareils</h3>
          {deviceData.length === 0 ? (
            <p className="text-text-muted text-sm text-center py-4">Aucun scan pour le moment</p>
          ) : (
            <>
              <div className="flex items-center justify-center h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={deviceData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {deviceData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-6">
                {deviceData.map((d) => (
                  <div key={d.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                    <span className="text-xs text-text-secondary">{d.name} {d.value}%</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>
      </div>

      <Card>
        <h3 className="text-text-primary font-semibold mb-4 flex items-center gap-2">
          <Activity size={16} className="text-primary" />
          Activité en temps réel
        </h3>
        <div className="space-y-1">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          {!loading && recentScans.length === 0 && (
            <p className="text-text-muted text-sm text-center py-4 font-mono">
              En attente du premier scan...
            </p>
          )}
          {recentScans.map((scan, i) => (
            <div
              key={`${scan.id}-${i}`}
              className="flex items-center gap-3 px-3 py-2 rounded-lg font-mono text-xs hover:bg-surface-elevated transition-colors"
            >
              <span className="text-primary w-16 flex-shrink-0">
                {scan.scannedAt ? format(parseISO(scan.scannedAt), 'HH:mm:ss') : '—'}
              </span>
              <span className="text-text-muted">|</span>
              <span className="text-secondary">{scan.country}</span>
              <span className="text-text-muted">|</span>
              <Badge variant={scan.deviceType === 'ios' ? 'info' : scan.deviceType === 'android' ? 'warning' : 'neutral'}>
                {scan.deviceType}
              </Badge>
              <span className="text-text-muted">{scan.browserName}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
