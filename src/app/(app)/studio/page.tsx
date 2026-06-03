'use client';

import dynamic from 'next/dynamic';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { Button } from '@/components/ui/Button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const QRGenerator = dynamic(() => import('@/components/qr/QRGenerator').then(m => m.QRGenerator), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3" />
      <p className="text-text-muted text-sm font-mono">Chargement du studio...</p>
    </div>
  ),
});

export default function StudioPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm">
            <ArrowLeft size={16} />
          </Button>
        </Link>
        <div>
          <h2 className="text-xl font-bold text-text-primary">Studio QR Code</h2>
          <p className="text-text-secondary text-sm">Crée et personnalise ton QR code en temps réel</p>
        </div>
      </div>

      <ErrorBoundary>
        <QRGenerator />
      </ErrorBoundary>
    </div>
  );
}
