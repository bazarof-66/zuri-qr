'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import QRCodeStyling, { DotType, CornerSquareType, CornerDotType } from 'qr-code-styling';
import { collection, addDoc, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/hooks/useAuth';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Upload, Download, Image, FileText, Palette, QrCode, Loader2 } from 'lucide-react';

const dotTypes: { value: DotType; label: string }[] = [
  { value: 'square', label: 'Carré' },
  { value: 'rounded', label: 'Arrondi' },
  { value: 'dots', label: 'Points' },
  { value: 'extra-rounded', label: 'Extra arrondi' },
];

const cornerTypes: { value: CornerSquareType; label: string }[] = [
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

interface QRGeneratorProps {
  onSave?: (data: { name: string; url: string; shortCode: string }) => void;
}

export function QRGenerator({ onSave }: QRGeneratorProps) {
  const { user } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  const qrRef = useRef<QRCodeStyling | null>(null);

  const [url, setUrl] = useState('');
  const [name, setName] = useState('');
  const [fgColor, setFgColor] = useState('#22C55E');
  const [bgColor, setBgColor] = useState('#FFFFFF');
  const [dotType, setDotType] = useState<DotType>('rounded');
  const [cornerType, setCornerType] = useState<CornerSquareType>('extra-rounded');
  const [logoFile, setLogoFile] = useState<string | null>(null);
  const [shortCode] = useState(generateShortCode());
  const redirectDomain = process.env.NEXT_PUBLIC_FIREBASE_REDIRECT_DOMAIN || 'https://zuri-qr.vercel.app';
  const qrDataUrl = url ? `${redirectDomain}/r/${shortCode}` : '';
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedQrId, setSavedQrId] = useState<string | null>(null);

  const generateQR = useCallback(() => {
    if (!url) return;
    const qr = new QRCodeStyling({
      width: 220,
      height: 220,
      data: qrDataUrl,
      dotsOptions: {
        color: fgColor,
        type: dotType,
      },
      cornersSquareOptions: {
        type: cornerType,
        color: fgColor,
      },
      cornersDotOptions: {
        type: 'dot',
        color: fgColor,
      },
      backgroundOptions: {
        color: bgColor,
      },
      image: logoFile || undefined,
      imageOptions: {
        crossOrigin: 'anonymous',
        margin: 6,
        imageSize: 0.3,
        hideBackgroundDots: true,
      },
      qrOptions: {
        errorCorrectionLevel: 'H',
      },
    });
    qrRef.current = qr;
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
      qr.append(containerRef.current);
    }
  }, [url, fgColor, bgColor, dotType, cornerType, logoFile]);

  useEffect(() => {
    if (url) generateQR();
  }, [url, fgColor, bgColor, dotType, cornerType, logoFile, generateQR]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setLogoFile(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleExportPNG = () => {
    qrRef.current?.download({ name: name || 'zuri-qr', extension: 'png' });
  };

  const handleExportJPG = async () => {
    const canvas = containerRef.current?.querySelector('canvas');
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `${name || 'zuri-qr'}.jpg`;
    link.href = canvas.toDataURL('image/jpeg', 0.95);
    link.click();
  };

  const handleExportPDF = async () => {
    const canvas = containerRef.current?.querySelector('canvas');
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
      setSavedQrId(qrRef.id);
      setSaved(true);
      onSave?.({ name: name || 'QR Code', url, shortCode });
    } catch (err) {
      console.error('[ZURI] Erreur création QR:', err);
    } finally {
      setSaving(false);
    }
  };

  const host = new URL(qrDataUrl).host;
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
            {previewUrl && <Badge variant="success">zuri.qr/{shortCode}</Badge>}
          </div>
          <div className="flex items-center justify-center py-6 px-4">
            {url ? (
              <div className="p-3 rounded-xl bg-deep border border-border shadow-lg shadow-primary/5">
                <div ref={containerRef} className="flex items-center justify-center [&>div]:flex [&>div]:items-center [&>div]:justify-center" />
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
