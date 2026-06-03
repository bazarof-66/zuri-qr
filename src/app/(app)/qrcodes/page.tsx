'use client';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Search, Plus, QrCode } from 'lucide-react';
import Link from 'next/link';
import { useQRCodes } from '@/lib/hooks/useQRCodes';
import { formatDate, formatNumber } from '@/lib/utils';
import { useState } from 'react';

const statusConfig: Record<string, { variant: 'success' | 'warning' | 'danger'; label: string }> = {
  active: { variant: 'success', label: 'Actif' },
  paused: { variant: 'warning', label: 'En pause' },
  deleted: { variant: 'danger', label: 'Supprimé' },
};

export default function QRCodesPage() {
  const { qrcodes, loading } = useQRCodes();
  const [search, setSearch] = useState('');

  const filtered = qrcodes.filter((qr) =>
    qr.name.toLowerCase().includes(search.toLowerCase()) ||
    qr.shortCode.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-text-primary">Mes QR Codes</h2>
          <p className="text-text-secondary text-sm">Gère tous tes QR codes</p>
        </div>
        <Link href="/studio">
          <Button size="sm" className="gap-1.5">
            <Plus size={16} />
            Nouveau QR
          </Button>
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un QR code..."
            className="w-full h-10 pl-9 pr-3 rounded-lg bg-surface border border-border text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>

      <Card className="overflow-hidden !p-0">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <QrCode size={40} className="mx-auto mb-3 text-text-muted" />
            <p className="text-text-muted text-sm">
              {search ? 'Aucun QR code trouvé' : 'Aucun QR code créé'}
            </p>
            {!search && (
              <Link href="/studio">
                <Button size="sm" className="mt-4 gap-1.5">
                  <Plus size={16} />
                  Créer mon premier QR
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs text-text-muted font-medium uppercase tracking-wider px-5 py-3">Nom</th>
                  <th className="text-left text-xs text-text-muted font-medium uppercase tracking-wider px-5 py-3">URL courte</th>
                  <th className="text-left text-xs text-text-muted font-medium uppercase tracking-wider px-5 py-3">Status</th>
                  <th className="text-right text-xs text-text-muted font-medium uppercase tracking-wider px-5 py-3">Scans</th>
                  <th className="text-left text-xs text-text-muted font-medium uppercase tracking-wider px-5 py-3">Créé le</th>
                  <th className="w-20 px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((qr) => {
                  const status = statusConfig[qr.status];
                  return (
                    <tr key={qr.id} className="border-b border-border last:border-0 hover:bg-surface-elevated/50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <QrCode size={16} className="text-primary" />
                          </div>
                          <span className="text-text-primary text-sm font-medium">{qr.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-text-secondary text-sm font-mono">zuri.qr/{qr.shortCode}</span>
                      </td>
                      <td className="px-5 py-4">
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className="text-text-primary text-sm font-mono">{formatNumber(qr.totalScans)}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-text-secondary text-sm">{formatDate(qr.createdAt)}</span>
                      </td>
                      <td className="px-5 py-4">
                        <Link href={`/qrcodes/${qr.id}`}>
                          <Button variant="ghost" size="sm">Gérer</Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
