'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { collection, addDoc, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/hooks/useAuth';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Upload, Download, Image, FileText, Palette, QrCode, Loader2, RefreshCw } from 'lucide-react';

type DotType = 'square' | 'rounded' | 'dots' | 'extra-rounded';
type CornerType = 'square' | 'extra-rounded' | 'dot';

const dotTypes: { value: DotType; label: string }[] = [
  { value: 'square', label: 'Carré' },
  { value: 'rounded', label: 'Arrondi' },
  { value: 'dots', label: 'Points' },
  { value: 'extra-rounded', label: 'Extra arrondi' },
];

const cornerTypes: { value: CornerType; label: string }[] = [
  { value: 'square', label: 'Standard' },
  { value: 'extra-rounded', label: 'Arrondi' },
  { value: 'dot', label: 'Point' },
];

const colors = [
  '#22C55E', '#EAB308', '#00D4FF', '#FF3366',
  '#A855F7', '#F97316', '#000000', '#FFFFFF',
];

function generateShortCode(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

type QRModules = { data: Uint8Array; size: number };

function drawRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, radius: number) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + size - radius, y);
  ctx.quadraticCurveTo(x + size, y, x + size, y + radius);
  ctx.lineTo(x + size, y + size - radius);
  ctx.quadraticCurveTo(x + size, y + size, x + size - radius, y + size);
  ctx.lineTo(x + radius, y + size);
  ctx.quadraticCurveTo(x, y + size, x, y + size - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  ctx.fill();
}

function drawQRCanvas(
  canvas: HTMLCanvasElement,
  mod: QRModules,
  fgColor: string,
  bgColor: string,
  dotType: DotType,
  cornerType: CornerType,
) {
  const size = canvas.width;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const count = mod.size;
  const cellSize = size / count;
  const radius = cellSize * 0.3;
  const dotRatio = 0.6;

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = fgColor;

  for (let row = 0; row < count; row++) {
    for (let col = 0; col < count; col++) {
      if (mod.data[row * count + col] !== 1) continue;

      const x = col * cellSize;
      const y = row * cellSize;
      const isFinder = (row < 7 && col < 7) ||
                       (row < 7 && col >= count - 7) ||
                       (row >= count - 7 && col < 7);

      if (isFinder) {
        if (row === 0 && col === 0) { drawFinderPattern(ctx, x, y, cellSize, fgColor, bgColor, cornerType); }
        else if (row === 0 && col >= count - 7) { drawFinderPattern(ctx, x, y, cellSize, fgColor, bgColor, cornerType); }
        else if (row >= count - 7 && col === 0) { drawFinderPattern(ctx, x, y, cellSize, fgColor, bgColor, cornerType); }
        else { ctx.fillRect(x, y, cellSize, cellSize); }
        continue;
      }

      const cx = x + cellSize / 2;

      switch (dotType) {
        case 'square':
          ctx.fillRect(x, y, cellSize, cellSize);
          break;
        case 'rounded':
          drawRoundedRect(ctx, x, y, cellSize, radius);
          break;
        case 'dots':
          ctx.beginPath();
          ctx.arc(cx, y + cellSize / 2, cellSize * dotRatio / 2, 0, Math.PI * 2);
          ctx.fill();
          break;
        case 'extra-rounded':
          drawRoundedRect(ctx, x + cellSize * 0.05, y + cellSize * 0.05, cellSize * 0.9, cellSize * 0.3);
          break;
      }
    }
  }
}

function drawFinderPattern(
  ctx: CanvasRenderingContext2D,
  startX: number, startY: number,
  cellSize: number,
  fgColor: string,
  bgColor: string,
  cornerType: CornerType,
) {
  const size = cellSize * 7;
  const outerR = size / 2;
  const innerR = cellSize * 3 / 2 + cellSize * 0.2;
  const centerR = cellSize * 0.8;

  ctx.fillStyle = bgColor;
  if (cornerType === 'square') {
    ctx.fillRect(startX, startY, size, size);
  } else {
    ctx.beginPath();
    ctx.arc(startX + outerR, startY + outerR, outerR, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = fgColor;
  if (cornerType === 'square') {
    ctx.fillRect(startX + cellSize, startY + cellSize, cellSize * 5, cellSize * 5);
  } else {
    ctx.beginPath();
    ctx.arc(startX + outerR, startY + outerR, innerR, 0, Math.PI * 2);
    ctx.fill();
  }

  const cx = startX + outerR;
  const cy = startY + outerR;
  if (cornerType === 'dot') {
    ctx.beginPath();
    ctx.arc(cx, cy, centerR, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.fillRect(startX + cellSize * 2.5, startY + cellSize * 2.5, cellSize * 2, cellSize * 2);
  }
}

interface QRGeneratorProps {
  onSave?: (data: { name: string; url: string; shortCode: string }) => void;
}

export function QRGenerator({ onSave }: QRGeneratorProps) {
  const { user } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [url, setUrl] = useState('');
  const [name, setName] = useState('');
  const [fgColor, setFgColor] = useState('#22C55E');
  const [bgColor, setBgColor] = useState('#FFFFFF');
  const [dotType, setDotType] = useState<DotType>('rounded');
  const [cornerType, setCornerType] = useState<CornerType>('extra-rounded');
  const [logoFile, setLogoFile] = useState<string | null>(null);
  const [shortCode] = useState(generateShortCode());
  const redirectDomain = process.env.NEXT_PUBLIC_FIREBASE_REDIRECT_DOMAIN || 'https://zuri-qr.vercel.app';
  const qrDataUrl = url ? `${redirectDomain}/r/${shortCode}` : '';
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [qrError, setQrError] = useState(false);

  const generateQR = useCallback(async () => {
    if (!url || !canvasRef.current) return;
    setQrError(false);
    try {
      const { create } = await import('qrcode');
      const canvas = canvasRef.current;
      canvas.width = 220;
      canvas.height = 220;
      const qrResult = create(qrDataUrl, { errorCorrectionLevel: 'H' });
      drawQRCanvas(canvas, qrResult.modules as QRModules, fgColor, bgColor, dotType, cornerType);

      if (logoFile) {
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const img = document.createElement('img');
        img.crossOrigin = 'anonymous';
        await new Promise<void>((resolve, reject) => {
          img.onload = () => {
            const logoSize = canvas.width * 0.3;
            const x = (canvas.width - logoSize) / 2;
            const y = (canvas.height - logoSize) / 2;
            ctx.save();
            ctx.beginPath();
            ctx.arc(canvas.width / 2, canvas.height / 2, logoSize / 2 + 4, 0, Math.PI * 2);
            ctx.fillStyle = bgColor;
            ctx.fill();
            ctx.beginPath();
            ctx.arc(canvas.width / 2, canvas.height / 2, logoSize / 2, 0, Math.PI * 2);
            ctx.clip();
            ctx.drawImage(img, x, y, logoSize, logoSize);
            ctx.restore();
            resolve();
          };
          img.onerror = reject;
          img.src = logoFile;
        });
      }
    } catch (e) {
      console.error('[ZURI] QR generation error:', e);
      setQrError(true);
    }
  }, [url, qrDataUrl, fgColor, bgColor, dotType, cornerType, logoFile]);

  useEffect(() => {
    if (url) generateQR();
  }, [url, fgColor, bgColor, dotType, cornerType, logoFile, qrDataUrl, generateQR]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setLogoFile(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleExportPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `${name || 'zuri-qr'}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleExportJPG = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `${name || 'zuri-qr'}.jpg`;
    link.href = canvas.toDataURL('image/jpeg', 0.95);
    link.click();
  };

  const handleExportPDF = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { default: jsPDF } = await import('jspdf');
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    const qrSize = Math.min(pdfWidth, pdfHeight) - margin * 2;
    const x = (pdfWidth - qrSize) / 2;
    const y = (pdfHeight - qrSize) / 2 - 20;
    pdf.addImage(imgData, 'PNG', x, y, qrSize, qrSize);
    if (name) {
      pdf.setFontSize(12);
      pdf.text(name, pdfWidth / 2, y + qrSize + 15, { align: 'center' });
    }
    pdf.save(`${name || 'zuri-qr'}.pdf`);
  };

  const handleSave = async () => {
    if (!url || !user) return;
    setSaving(true);
    try {
      const qrData = {
        ownerId: user.uid,
        targetUrl: url,
        name: name || 'QR Code',
        shortCode,
        status: 'active',
        totalScans: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        design: {
          colorFg: fgColor,
          colorBg: bgColor,
          dotType,
          cornerType,
          hasLogo: !!logoFile,
        },
      };
      const qrRef = await addDoc(collection(db!, 'qrcodes'), qrData);
      await setDoc(doc(db!, 'redirects', shortCode), {
        ownerId: user.uid,
        qrId: qrRef.id,
        targetUrl: url,
        status: 'active',
      });
      setSaved(true);
      onSave?.({ name: name || 'QR Code', url, shortCode });
    } catch (err) {
      console.error('[ZURI] Erreur création QR:', err);
    } finally {
      setSaving(false);
    }
  };

  const host = new URL(qrDataUrl || 'https://zuri.qr').host;
  const previewUrl = qrDataUrl ? `${host}/r/${shortCode}` : '';

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="space-y-5">
        <Card>
          <h3 className="text-text-primary font-semibold mb-4">Destination</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-text-secondary mb-1.5">URL de destination *</label>
              <input
                type="url"
                value={url}
                onChange={(e) => { setUrl(e.target.value); setSaved(false); }}
                placeholder="https://exemple.com"
                className="w-full h-10 px-3 rounded-lg bg-deep border border-border text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-1.5">Nom du QR code</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Mon QR code"
                className="w-full h-10 px-3 rounded-lg bg-deep border border-border text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Palette size={16} className="text-primary" />
            <h3 className="text-text-primary font-semibold">Couleurs</h3>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-text-secondary mb-1.5">Premier plan</label>
              <div className="flex gap-2 flex-wrap">
                {colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => setFgColor(c)}
                    className={`w-8 h-8 rounded-lg border-2 transition-all ${
                      fgColor === c ? 'border-text-primary scale-110' : 'border-border'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
                <input
                  type="color"
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="w-8 h-8 rounded-lg border border-border cursor-pointer"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-1.5">Arrière-plan</label>
              <div className="flex gap-2 flex-wrap">
                {['#FFFFFF', '#0F0F12', '#F8FAFC', '#1A1A22'].map((c) => (
                  <button
                    key={c}
                    onClick={() => setBgColor(c)}
                    className={`w-8 h-8 rounded-lg border-2 transition-all ${
                      bgColor === c ? 'border-text-primary scale-110' : 'border-border'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-8 h-8 rounded-lg border border-border cursor-pointer"
                />
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-text-primary font-semibold mb-4">Style des modules</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-text-secondary mb-2">Forme des points</label>
              <div className="flex gap-2 flex-wrap">
                {dotTypes.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setDotType(t.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      dotType === t.value
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border text-text-secondary hover:border-text-muted'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-2">Forme des coins</label>
              <div className="flex gap-2 flex-wrap">
                {cornerTypes.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setCornerType(t.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      cornerType === t.value
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border text-text-secondary hover:border-text-muted'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Upload size={16} className="text-primary" />
            <h3 className="text-text-primary font-semibold">Logo (fond transparent)</h3>
          </div>
          <label className="flex flex-col items-center justify-center h-28 rounded-lg border-2 border-dashed border-border bg-deep cursor-pointer hover:border-primary transition-colors">
            {logoFile ? (
              <div className="flex items-center gap-3">
                <img src={logoFile} alt="logo" className="w-12 h-12 object-contain" />
                <span className="text-sm text-text-secondary">Logo chargé ✓</span>
              </div>
            ) : (
              <div className="text-center">
                <Upload size={20} className="mx-auto mb-1 text-text-muted" />
                <span className="text-xs text-text-muted">Clique pour uploader un logo (PNG sans fond)</span>
              </div>
            )}
            <input type="file" accept="image/png,image/svg+xml" className="hidden" onChange={handleLogoUpload} />
          </label>
          {logoFile && (
            <button
              onClick={() => setLogoFile(null)}
              className="text-xs text-danger mt-2 hover:underline"
            >
              Supprimer le logo
            </button>
          )}
        </Card>
      </div>

      <div className="space-y-5 lg:sticky lg:top-24 self-start">
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between px-5 pt-4 pb-2 border-b border-border">
            <h3 className="text-text-primary font-semibold text-sm">Aperçu</h3>
            {previewUrl && <Badge variant="success">{previewUrl}</Badge>}
          </div>
          <div className="flex items-center justify-center py-6 px-4">
            {url && qrError ? (
              <div className="text-center py-4">
                <p className="text-danger text-xs mb-2">Erreur de génération</p>
                <button onClick={() => generateQR()} className="flex items-center gap-1 text-primary text-xs underline mx-auto">
                  <RefreshCw size={12} /> Réessayer
                </button>
              </div>
            ) : url ? (
              <div className="p-3 rounded-xl bg-deep border border-border shadow-lg shadow-primary/5">
                <canvas ref={canvasRef} width={220} height={220} className="block" />
              </div>
            ) : (
              <div className="text-center py-8">
                <QrCode size={40} className="mx-auto mb-2 text-text-muted" />
                <p className="text-text-muted text-xs">Entre une URL pour voir l&apos;aperçu</p>
              </div>
            )}
          </div>
        </Card>

        {url && (
          <Card>
            <h3 className="text-text-primary font-semibold mb-3">Export</h3>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={handleExportPNG}
                className="flex flex-col items-center gap-1 p-3 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-colors"
              >
                <Image size={18} className="text-primary" />
                <span className="text-xs text-text-secondary">PNG</span>
              </button>
              <button
                onClick={handleExportJPG}
                className="flex flex-col items-center gap-1 p-3 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-colors"
              >
                <Download size={18} className="text-secondary" />
                <span className="text-xs text-text-secondary">JPG</span>
              </button>
              <button
                onClick={handleExportPDF}
                className="flex flex-col items-center gap-1 p-3 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-colors"
              >
                <FileText size={18} className="text-text-secondary" />
                <span className="text-xs text-text-secondary">PDF</span>
              </button>
            </div>
          </Card>
        )}

        <Button
          onClick={handleSave}
          size="lg"
          className="w-full gap-2"
          disabled={!url || saving}
          loading={saving}
        >
          {saved ? (
            <span className="text-sm">✓ QR Code créé</span>
          ) : saving ? (
            <><Loader2 size={18} className="animate-spin" /> Création...</>
          ) : (
            <><QrCode size={18} /> Créer ce QR code</>
          )}
        </Button>
        {saved && (
          <p className="text-center text-xs text-text-muted">
            QR code enregistré dans Firestore ✓
          </p>
        )}
      </div>
    </div>
  );
}
