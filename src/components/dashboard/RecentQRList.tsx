'use client';

import { QRCode } from '@/types';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatNumber, formatRelativeTime } from '@/lib/utils';
import { ExternalLink, Copy, MoreHorizontal, BarChart3, Eye, EyeOff, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface RecentQRListProps {
  qrcodes: QRCode[];
}

const statusConfig = {
  active: { variant: 'success' as const, label: 'Actif' },
  paused: { variant: 'warning' as const, label: 'En pause' },
  deleted: { variant: 'danger' as const, label: 'Supprimé' },
};

export function RecentQRList({ qrcodes }: RecentQRListProps) {
  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-text-primary font-semibold">Mes QR Codes</h3>
          <p className="text-text-secondary text-xs mt-0.5">5 plus récents</p>
        </div>
        <Link href="/qrcodes">
          <Button variant="ghost" size="sm">
            Voir tout →
          </Button>
        </Link>
      </div>

      <div className="space-y-2">
        {qrcodes.map((qr) => {
          const status = statusConfig[qr.status];
          return (
            <div
              key={qr.id}
              className="flex items-center gap-4 p-3 rounded-lg border border-border hover:bg-surface-elevated transition-colors group"
            >
              <div
                className="w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center"
                style={{ backgroundColor: qr.colorBg, border: '1px solid #2A2A36' }}
              >
                <div className="w-6 h-6 opacity-80" style={{ backgroundColor: qr.colorFg, clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' }} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-text-primary text-sm font-medium truncate">{qr.name}</span>
                  <Badge variant={status.variant}>{status.label}</Badge>
                </div>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-text-muted text-xs font-mono">zuri.qr/{qr.shortCode}</span>
                  <span className="text-text-muted text-xs">{formatNumber(qr.scanCount)} scans</span>
                </div>
              </div>

              <div className="hidden sm:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-1.5 rounded-md hover:bg-surface-elevated text-text-secondary hover:text-text-primary transition-colors" title="Copier l'URL">
                  <Copy size={14} />
                </button>
                <Link href={`/qrcodes/${qr.id}`}>
                  <button className="p-1.5 rounded-md hover:bg-surface-elevated text-text-secondary hover:text-text-primary transition-colors" title="Voir les stats">
                    <BarChart3 size={14} />
                  </button>
                </Link>
                <button className="p-1.5 rounded-md hover:bg-surface-elevated text-text-secondary hover:text-text-primary transition-colors" title="Ouvrir">
                  <ExternalLink size={14} />
                </button>
              </div>

              <div className="text-text-muted text-xs font-mono hidden md:block">
                {formatRelativeTime(qr.createdAt)}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
