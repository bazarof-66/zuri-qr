import { NextRequest, NextResponse } from 'next/server';

const FIREBASE_API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

async function getRedirectDoc(shortCode: string) {
  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/redirects/${shortCode}?key=${FIREBASE_API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  if (!data.fields) return null;
  const fields = data.fields;
  return {
    targetUrl: fields.targetUrl?.stringValue || '',
    qrId: fields.qrId?.stringValue || '',
    status: fields.status?.stringValue || '',
  };
}

async function writeAnalytics(qrId: string, data: {
  deviceType: string; browserName: string; osName: string;
  country: string; ip: string; referer: string; userAgent: string; scannedAt: string;
}) {
  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/qrcodes/${qrId}/analytics?key=${FIREBASE_API_KEY}`;
  const fields: Record<string, any> = {};
  for (const [k, v] of Object.entries(data)) {
    fields[k] = { stringValue: v };
  }
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields }),
  }).catch(() => {});
}

async function incrementScans(qrId: string) {
  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/qrcodes/${qrId}:commit?key=${FIREBASE_API_KEY}`;
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      writes: [{
        transform: {
          document: `projects/${PROJECT_ID}/databases/(default)/documents/qrcodes/${qrId}`,
          fieldTransforms: [
            { fieldPath: 'totalScans', increment: { integerValue: '1' } },
            { fieldPath: 'lastScannedAt', setToServerValue: 'REQUEST_TIME' },
          ],
        },
      }],
    }),
  }).catch(() => {});
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shortCode: string }> }
) {
  const { shortCode } = await params;

  if (!FIREBASE_API_KEY || !PROJECT_ID) {
    return NextResponse.json({ error: 'Firebase non configuré' }, { status: 500 });
  }

  const doc = await getRedirectDoc(shortCode);
  if (!doc || doc.status === 'deleted') {
    return NextResponse.redirect(new URL('/', request.url), 302);
  }

  const targetUrl = doc.targetUrl.startsWith('http') ? doc.targetUrl : `https://${doc.targetUrl}`;
  const qrId = doc.qrId;

  const response = NextResponse.redirect(new URL(targetUrl), 302);
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');

  if (qrId) {
    const ua = request.headers.get('user-agent') || '';
    const device = /iPhone|iPad|iPod/i.test(ua) ? 'ios' : /Android/i.test(ua) ? 'android' : /Windows|Mac|Linux|CrOS/i.test(ua) ? 'desktop' : 'unknown';
    const country = request.headers.get('x-vercel-ip-country') || 'unknown';

    writeAnalytics(qrId, {
      deviceType: device, browserName: '', osName: '',
      country, ip: '', referer: request.headers.get('referer') || '',
      userAgent: ua, scannedAt: new Date().toISOString(),
    });
    incrementScans(qrId);
  }

  return response;
}
