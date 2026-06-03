const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

const db = admin.firestore();

/**
 * Détecte le type d'appareil depuis le User-Agent
 */
function detectDevice(ua) {
  if (/iPhone|iPad|iPod/i.test(ua)) return 'ios';
  if (/Android/i.test(ua)) return 'android';
  if (/Windows|Mac|Linux|CrOS/i.test(ua)) return 'desktop';
  return 'unknown';
}

/**
 * Extrait le nom du navigateur
 */
function detectBrowser(ua) {
  if (/Edg/i.test(ua)) return 'Edge';
  if (/Chrome/i.test(ua) && !/Edg/i.test(ua)) return 'Chrome';
  if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) return 'Safari';
  if (/Firefox/i.test(ua)) return 'Firefox';
  return 'Unknown';
}

/**
 * Extrait le nom du système d'exploitation
 */
function detectOS(ua) {
  if (/Windows/i.test(ua)) return 'Windows';
  if (/Mac OS X/i.test(ua) && !/iPhone|iPad|iPod/i.test(ua)) return 'macOS';
  if (/Linux/i.test(ua) && !/Android/i.test(ua)) return 'Linux';
  if (/iPhone|iPad|iPod/i.test(ua)) return 'iOS';
  if (/Android/i.test(ua)) return 'Android';
  return 'Unknown';
}

/**
 * Cloud Function HTTP — Redirection dynamique de QR Code
 *
 * URL : https://zurilink.com/r/{shortCode}
 *
 * Comportement :
 * 1. Lecture du document dans la collection 'redirects' via le shortCode
 * 2. Enregistrement des télémétries (timestamp, appareil, pays, user-agent)
 *    dans la sous-collection 'analytics' du QR code concerné
 * 3. Incrémentation du compteur totalScans sur le document qrcodes
 * 4. Redirection HTTP 302 vers l'URL cible (targetUrl)
 * 5. Désactivation complète du cache navigateur
 */
exports.redirect = functions.https.onRequest(async (req, res) => {
  // Extraire le shortCode depuis le path : /r/{shortCode}
  const shortCode = req.path.replace(/\/r\//, '').split('?')[0].replace(/\/$/, '');

  if (!shortCode) {
    return res.redirect(302, 'https://zuriqr.com');
  }

  try {
    // 1. Lecture du document redirects/{shortCode}
    const redirectDoc = await db.collection('redirects').doc(shortCode).get();

    if (!redirectDoc.exists) {
      console.warn(`[ZURI REDIRECT] shortCode introuvable: ${shortCode}`);
      return res.status(404).send('QR Code introuvable ou inactif.');
    }

    const redirectData = redirectDoc.data();

    if (redirectData.status !== 'active') {
      console.warn(`[ZURI REDIRECT] QR inactif: ${shortCode}`);
      return res.status(404).send('QR Code désactivé.');
    }

    const { targetUrl, qrId, ownerId } = redirectData;

    // 2. Télémétries du scan
    const userAgent = req.headers['user-agent'] || '';
    const device = detectDevice(userAgent);
    const browser = detectBrowser(userAgent);
    const os = detectOS(userAgent);
    const country = req.headers['x-appengine-country']
      || req.headers['x-vercel-ip-country']
      || req.headers['x-forwarded-for']
      || 'unknown';
    const ip = req.headers['x-forwarded-for'] || req.ip || 'unknown';
    const referer = req.headers['referer'] || '';

    const scanData = {
      qrId,
      shortCode,
      deviceType: device,
      browserName: browser,
      osName: os,
      country,
      ipAddress: ip,
      userAgent,
      referer,
      scannedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    // 3. Écriture dans analytics/{qrId} (sous-collection de qrcodes)
    //    Document avec un ID auto-généré
    const writeResult = await db
      .collection('qrcodes')
      .doc(qrId)
      .collection('analytics')
      .add(scanData);

    // 4. Incrémentation du compteur totalScans atomique
    await db
      .collection('qrcodes')
      .doc(qrId)
      .update({
        totalScans: admin.firestore.FieldValue.increment(1),
        lastScannedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

    console.log(`[ZURI REDIRECT] Scan enregistré: ${shortCode} → ${targetUrl} (${country}, ${device})`);

    // 5. Redirection 302 SANS CACHE
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    res.redirect(302, targetUrl);

  } catch (err) {
    console.error('[ZURI REDIRECT] Erreur:', err);
    res.status(500).send('Erreur serveur lors de la redirection.');
  }
});
