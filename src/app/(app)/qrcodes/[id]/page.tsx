'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { doc, getDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/hooks/useAuth';
import { useAnalytics } from '@/lib/hooks/useQRCodes';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useParams, useRouter } from 'next/navigation';
import { formatNumber, formatDate } from '@/lib/utils';
import { drawQRCanvas } from '@/lib/qr-draw';
import { ArrowLeft, ExternalLink, Trash2, Pause, Play, QrCode, Copy, Download, ScanLine } from 'lucide-react';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function QRCodeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const id = params.id as string;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [qr, setQr] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [targetUrl, setTargetUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { scans } = useAnalytics(id);

  useEffect(() => {
    if (!user || !db || !id) return;
    getDoc(doc(db, 'qrcodes', id)).then((snap) => {
      if (snap.exists()) {
        const data: any = { id: snap.id, ...snap.data() };
        setQr(data);
        setTargetUrl(data.targetUrl ?? '');
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id, user]);

  useEffect(() => {
    if (!qr || !canvasRef.current) return;
    (async () => {
      try {
        const { create } = await import('qrcode');
        const canvas = canvasRef.current;
        if (!canvas) return;
        const redirectDomain = process.env.NEXT_PUBLIC_FIREBASE_REDIRECT_DOMAIN || 'https://zuri-qr.vercel.app';
        const qrDataUrl = `${redirectDomain}/r/${qr.shortCode}`;
        const result = create(qrDataUrl, { errorCorrectionLevel: 'H' });
        const mod = result.modules as { data: Uint8Array; size: number };
        const fg = qr.design?.colorFg || '#22C55E';
        const bg = qr.design?.colorBg || '#FFFFFF';
        const dotType = qr.design?.dotType || 'rounded';
        const cornerType = qr.design?.cornerType || 'extra-rounded';
        drawQRCanvas(canvas, 200, mod, fg, bg, dotType, cornerType);
      } catch (e) {
        console.error('[ZURI] QR draw error:', e);
      }
    })();
  }, [qr]);

  const handleUpdate = async () => {
    if (!db || !id) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'qrcodes', id), {
        targetUrl,
        updatedAt: serverTimestamp(),
      });
      if (qr?.shortCode && user) {
        await updateDoc(doc(db, 'redirects', qr.shortCode), { targetUrl });
      }
      alert('QR code mis à jour ✓');
    } catch (err) {
      console.error('[ZURI] Erreur update:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!db || !id) return;
    const newStatus = qr.status === 'active' ? 'paused' : 'active';
    try {
      await updateDoc(doc(db, 'qrcodes', id), { status: newStatus, updatedAt: serverTimestamp() });
      setQr((prev: any) => ({ ...prev, status: newStatus }));
      if (qr?.shortCode) {
        await updateDoc(doc(db, 'redirects', qr.shortCode), { status: newStatus });
      }
    } catch (err) {
      console.error('[ZURI] Erreur status:', err);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Supprimer ce QR code ? Cette action est irréversible.')) return;
    if (!db || !id) return;
    setDeleting(true);
    try {
      await updateDoc(doc(db, 'qrcodes', id), { status: 'deleted', updatedAt: serverTimestamp() });
      if (qr?.shortCode) {
        await updateDoc(doc(db, 'redirects', qr.shortCode), { status: 'deleted' });
      }
      router.push('/qrcodes');
    } catch (err) {
      console.error('[ZURI] Erreur delete:', err);
    } finally {
      setDeleting(false);
    }
  };

  const handleCopyLink = () => {
    const domain = process.env.NEXT_PUBLIC_FIREBASE_REDIRECT_DOMAIN || 'https://zuri-qr.vercel.app';
    navigator.clipboard.writeText(`${domain}/r/${qr?.shortCode}`);
  };

  const handleExport = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `${qr?.name || 'zuri-qr'}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!qr) {
    return (
      <div className="text-center py-20">
        <QrCode size={40} className="mx-auto mb-3 text-text-muted" />
        <p className="text-text-muted">QR code introuvable</p>
        <Link href="/qrcodes">
          <Button variant="ghost" size="sm" className="mt-4">← Retour</Button>
        </Link>
      </div>
    );
  }

  const statusLabel = qr.status === 'active' ? 'Actif' : qr.status === 'paused' ? 'En pause' : 'Supprimé';
  const statusVariant = qr.status === 'active' ? 'success' as const : qr.status === 'paused' ? 'warning' as const : 'danger' as const;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/qrcodes">
          <Button variant="ghost" size="sm"><ArrowLeft size={16} /></Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-text-primary">{qr.name}</h2>
            <Badge variant={statusVariant}>{statusLabel}</Badge>
          </div>
          <p className="text-text-secondary text-sm font-mono">
            Créé le {qr.createdAt?.toDate ? format(qr.createdAt.toDate(), 'dd MMM yyyy', { locale: fr }) : '—'}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <Card className="flex flex-col items-center py-6">
            <canvas ref={canvasRef} width={200} height={200} className="rounded-xl" />
            <div className="flex gap-2 mt-4">
              <button onClick={handleCopyLink} className="p-2 rounded-lg border border-border hover:bg-surface-elevated transition-colors" title="Copier le lien">
                <Copy size={16} className="text-text-secondary" />
              </button>
              <button onClick={handleExport} className="p-2 rounded-lg border border-border hover:bg-surface-elevated transition-colors" title="Télécharger">
                <Download size={16} className="text-text-secondary" />
              </button>
              <a href={qr.targetUrl} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg border border-border hover:bg-surface-elevated transition-colors" title="Ouvrir">
                <ExternalLink size={16} className="text-text-secondary" />
              </a>
            </div>
          </Card>

          <div className="grid grid-cols-2 gap-3">
            <Card className="text-center py-4">
              <p className="text-xs text-text-muted mb-1">Scans</p>
              <p className="text-2xl font-bold font-mono text-primary">{formatNumber(qr.totalScans ?? 0)}</p>
            </Card>
            <Card className="text-center py-4">
              <p className="text-xs text-text-muted mb-1">Code court</p>
              <p className="text-sm font-mono text-text-primary truncate">/{qr.shortCode}</p>
            </Card>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <Card>
            <h3 className="text-text-primary font-semibold mb-4">Configuration</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-text-secondary mb-1.5">URL de destination</label>
                <input
                  type="url"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg bg-deep border border-border text-text-primary text-sm focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleUpdate} loading={saving} disabled={saving}>
                  Sauvegarder
                </Button>
                <Button
                  variant={qr.status === 'active' ? 'ghost' : 'primary'}
                  onClick={handleToggleStatus}
                  className="gap-1.5"
                >
                  {qr.status === 'active' ? <><Pause size={16} /> Mettre en pause</> : <><Play size={16} /> Activer</>}
                </Button>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-text-primary font-semibold flex items-center gap-2">
                <ScanLine size={16} className="text-primary" />
                Derniers scans
              </h3>
              <Link href="/analytics">
                <Button variant="ghost" size="sm">Voir tout</Button>
              </Link>
            </div>
            <div className="space-y-1">
              {scans.length === 0 && (
                <p className="text-text-muted text-sm text-center py-4 font-mono">Aucun scan pour le moment</p>
              )}
              {scans.slice(0, 10).map((s, i) => (
                <div key={`${s.id}-${i}`} className="flex items-center gap-3 px-3 py-2 rounded-lg font-mono text-xs hover:bg-surface-elevated transition-colors">
                  <span className="text-primary w-16 flex-shrink-0">{s.scannedAt ? format(parseISO(s.scannedAt), 'HH:mm:ss') : '—'}</span>
                  <span className="text-text-muted">|</span>
                  <span className="text-secondary">{s.country}</span>
                  <span className="text-text-muted">|</span>
                  <Badge variant={s.deviceType === 'ios' ? 'info' : s.deviceType === 'android' ? 'warning' : 'neutral'}>{s.deviceType}</Badge>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="text-text-primary font-semibold mb-4 text-danger flex items-center gap-2">
              <Trash2 size={16} />
              Zone dangereuse
            </h3>
            <p className="text-text-secondary text-xs mb-3">Supprimer ce QR code désactivera la redirection et les analytics.</p>
            <Button variant="ghost" onClick={handleDelete} loading={deleting} disabled={deleting} className="text-danger border-danger/30 hover:bg-danger/10">
              <Trash2 size={16} /> Supprimer ce QR code
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
