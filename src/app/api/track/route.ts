import { NextRequest, NextResponse } from 'next/server';
import { getServerDb } from '@/lib/firebase-server';
import { collection, addDoc, updateDoc, doc, increment, serverTimestamp } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { qrId, shortCode } = body;
    if (!qrId && !shortCode) {
      return NextResponse.json({ ok: false, error: 'qrId requis' }, { status: 400 });
    }

    const db = getServerDb();
    const ua = request.headers.get('user-agent') || '';

    const scanData = {
      deviceType: /iPhone|iPad|iPod/i.test(ua) ? 'ios' : /Android/i.test(ua) ? 'android' : /Windows|Mac|Linux/i.test(ua) ? 'desktop' : 'unknown',
      browserName: /Chrome/i.test(ua) && !/Edg/i.test(ua) ? 'Chrome' : /Safari/i.test(ua) ? 'Safari' : /Firefox/i.test(ua) ? 'Firefox' : 'Other',
      osName: /Windows/i.test(ua) ? 'Windows' : /Mac OS/i.test(ua) ? 'macOS' : /Linux/i.test(ua) ? 'Linux' : /Android/i.test(ua) ? 'Android' : /iPhone|iPad|iPod/i.test(ua) ? 'iOS' : 'Other',
      country: request.headers.get('x-vercel-ip-country') || 'unknown',
      scannedAt: serverTimestamp(),
      userAgent: ua,
      ...body,
    };

    await addDoc(collection(db, 'qrcodes', qrId, 'analytics'), scanData);
    await updateDoc(doc(db, 'qrcodes', qrId), {
      totalScans: increment(1),
      lastScannedAt: serverTimestamp(),
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[ZURI TRACK] Erreur:', err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
