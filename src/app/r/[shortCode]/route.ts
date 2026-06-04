import { NextRequest, NextResponse } from 'next/server';
import { getServerDb } from '@/lib/firebase-server';
import { doc, getDoc, collection, addDoc, updateDoc, increment } from 'firebase/firestore';

function detectDevice(ua: string): string {
  if (/iPhone|iPad|iPod/i.test(ua)) return 'ios';
  if (/Android/i.test(ua)) return 'android';
  if (/Windows|Mac|Linux|CrOS/i.test(ua)) return 'desktop';
  return 'unknown';
}

function detectBrowser(ua: string): string {
  if (/Chrome/i.test(ua) && !/Edg/i.test(ua) && !/OPR/i.test(ua)) return 'Chrome';
  if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) return 'Safari';
  if (/Firefox/i.test(ua)) return 'Firefox';
  if (/Edg/i.test(ua)) return 'Edge';
  if (/OPR/i.test(ua)) return 'Opera';
  return 'Other';
}

function detectOS(ua: string): string {
  if (/Windows/i.test(ua)) return 'Windows';
  if (/Mac OS/i.test(ua) && !/iPhone|iPad|iPod/i.test(ua)) return 'macOS';
  if (/Linux/i.test(ua) && !/Android/i.test(ua)) return 'Linux';
  if (/Android/i.test(ua)) return 'Android';
  if (/iPhone|iPad|iPod/i.test(ua)) return 'iOS';
  return 'Other';
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shortCode: string }> }
) {
  const { shortCode } = await params;

  try {
    const db = getServerDb();
    const redirectSnap = await getDoc(doc(db, 'redirects', shortCode));

    if (!redirectSnap.exists()) {
      return NextResponse.redirect(new URL('/', request.url), 302);
    }

    const data = redirectSnap.data();
    const targetUrl = data.targetUrl as string;
    const qrId = data.qrId as string;

    // ⚡ REDIRIGE VERS LA CIBLE IMMÉDIATEMENT
    const response = NextResponse.redirect(new URL(targetUrl), 302);
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    // Track analytics en arrière-plan (ne bloque pas la redirection)
    if (qrId) {
      const ua = request.headers.get('user-agent') || '';
      const device = detectDevice(ua);
      const browser = detectBrowser(ua);
      const os = detectOS(ua);
      const country = request.headers.get('x-vercel-ip-country') ||
                      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                      'unknown';
      const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                 request.headers.get('x-real-ip') ||
                 'unknown';
      const referer = request.headers.get('referer') || '';

      addDoc(collection(db, 'qrcodes', qrId, 'analytics'), {
        deviceType: device,
        browserName: browser,
        osName: os,
        country,
        ip,
        referer,
        userAgent: ua,
        scannedAt: new Date().toISOString(),
      }).catch(() => {});

      updateDoc(doc(db, 'qrcodes', qrId), {
        totalScans: increment(1),
        lastScannedAt: new Date().toISOString(),
      }).catch(() => {});
    }

    return response;
  } catch (err) {
    console.error('[ZURI] Erreur redirect:', err);
    return NextResponse.redirect(new URL('/', request.url), 302);
  }
}
