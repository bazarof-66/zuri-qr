'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/hooks/useAuth';
import { QRCode } from '@/types';

interface ScanRecord {
  id: string;
  deviceType: string;
  browserName: string;
  osName: string;
  country: string;
  scannedAt: string;
}

function mapQRDoc(id: string, data: any): QRCode {
  const ts = (d: any) => d?.toDate?.()?.toISOString?.() ?? d ?? '';
  return {
    id,
    ownerId: data.ownerId ?? '',
    name: data.name ?? 'QR Code',
    type: data.type ?? 'dynamic',
    destinationUrl: data.targetUrl ?? '',
    targetUrl: data.targetUrl ?? '',
    shortCode: data.shortCode ?? '',
    colorFg: data.design?.colorFg ?? '#22C55E',
    colorBg: data.design?.colorBg ?? '#FFFFFF',
    status: data.status ?? 'active',
    scanCount: data.totalScans ?? 0,
    totalScans: data.totalScans ?? 0,
    lastScannedAt: ts(data.lastScannedAt),
    createdAt: ts(data.createdAt),
    updatedAt: ts(data.updatedAt),
  };
}

export function useQRCodes() {
  const { user } = useAuth();
  const [qrcodes, setQrcodes] = useState<QRCode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !db) {
      setQrcodes([]);
      setLoading(false);
      return;
    }
    const q = query(
      collection(db, 'qrcodes'),
      where('ownerId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => mapQRDoc(d.id, d.data()));
      setQrcodes(list);
      setLoading(false);
    }, (err) => {
      console.error('[ZURI] Erreur snapshot QR:', err);
      setLoading(false);
    });
    return unsub;
  }, [user]);

  return { qrcodes, loading };
}

export function useActiveQRCodes() {
  const { user } = useAuth();
  const [qrcodes, setQrcodes] = useState<QRCode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !db) {
      setQrcodes([]);
      setLoading(false);
      return;
    }
    const q = query(
      collection(db, 'qrcodes'),
      where('ownerId', '==', user.uid),
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => mapQRDoc(d.id, d.data()));
      setQrcodes(list);
      setLoading(false);
    }, (err) => {
      console.error('[ZURI] Erreur snapshot QR actifs:', err);
      setLoading(false);
    });
    return unsub;
  }, [user]);

  return { qrcodes, loading };
}

export function useAnalytics(qrId: string | null) {
  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!qrId || !db) {
      setScans([]);
      setLoading(false);
      return;
    }
    const q = query(
      collection(db, 'qrcodes', qrId, 'analytics'),
      orderBy('scannedAt', 'desc')
    );
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          deviceType: data.deviceType ?? 'unknown',
          browserName: data.browserName ?? 'Other',
          osName: data.osName ?? 'Other',
          country: data.country ?? 'unknown',
          scannedAt: data.scannedAt?.toDate?.()?.toISOString?.() ?? '',
        };
      });
      setScans(list);
      setLoading(false);
    }, (err) => {
      console.error('[ZURI] Erreur snapshot analytics:', err);
      setLoading(false);
    });
    return unsub;
  }, [qrId]);

  return { scans, loading };
}

export function useAllAnalytics() {
  const { user } = useAuth();
  const { qrcodes } = useQRCodes();
  const [allScans, setAllScans] = useState<ScanRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !db || qrcodes.length === 0) {
      if (!user) setAllScans([]);
      setLoading(false);
      return;
    }

    const unsubs: (() => void)[] = [];
    let isMounted = true;

    qrcodes.forEach((qr) => {
      const q = query(
        collection(db!, 'qrcodes', qr.id, 'analytics'),
        orderBy('scannedAt', 'desc')
      );
      const unsub = onSnapshot(q, (snap) => {
        if (!isMounted) return;
        const list = snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            deviceType: data.deviceType ?? 'unknown',
            browserName: data.browserName ?? 'Other',
            osName: data.osName ?? 'Other',
            country: data.country ?? 'unknown',
            scannedAt: data.scannedAt?.toDate?.()?.toISOString?.() ?? '',
          };
        });
        setAllScans((prev) => {
          const other = prev.filter((s) => !list.find((l) => l.id === s.id));
          return [...list, ...other].sort((a, b) => b.scannedAt.localeCompare(a.scannedAt));
        });
        setLoading(false);
      });
      unsubs.push(unsub);
    });

    return () => {
      isMounted = false;
      unsubs.forEach((u) => u());
    };
  }, [user, qrcodes.length]);

  return { scans: allScans, loading, qrcodes };
}
