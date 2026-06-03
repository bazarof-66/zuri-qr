'use client';

import { QRGenerator } from '@/components/qr/QRGenerator';
import { Button } from '@/components/ui/Button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

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

      <QRGenerator />
    </div>
  );
}
