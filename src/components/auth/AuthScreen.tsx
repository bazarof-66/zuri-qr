'use client';

import { useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, isFirebaseReady } from '@/lib/firebase';
import { Auth } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { Zap, Eye, EyeOff, Mail, Lock, User, Loader2, AlertCircle, ExternalLink } from 'lucide-react';
import Link from 'next/link';

const _auth = auth as Auth;
const _db = db!;

export function AuthScreen() {
  const router = useRouter();
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [errorType, setErrorType] = useState<'auth' | 'google' | 'success'>('auth');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!_auth) return;
    getRedirectResult(_auth).then(async (cred) => {
      if (!cred) return;
      setLoading(true);
      setError('✓ Connexion réussie, redirection...');
      setErrorType('success');
      try {
        const uid = cred.user.uid;
        const { getDoc } = await import('firebase/firestore');
        const snap = await getDoc(doc(_db, 'users', uid));
        if (!snap.exists()) {
          await setDoc(doc(_db, 'users', uid), {
            email: cred.user.email,
            displayName: cred.user.displayName,
            plan: 'free',
            qrCount: 0,
            maxQRCodes: 5,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }
        // Redirection réussie après 500ms pour afficher le message
        setTimeout(() => router.push('/dashboard'), 500);
      } catch (e) {
        console.error('[ZURI] Redirect result error:', e);
        setError('Erreur lors de la connexion après redirection.');
        setErrorType('auth');
        setLoading(false);
      }
    }).catch((err) => {
      console.error('[ZURI] Redirect result:', err);
    });
  }, [router]);

  const translateError = (code: string) => {
    const map: Record<string, string> = {
      'auth/user-not-found': 'Aucun compte trouvé avec cet email',
      'auth/wrong-password': 'Mot de passe incorrect',
      'auth/invalid-credential': 'Email ou mot de passe incorrect',
      'auth/email-already-in-use': 'Cet email est déjà utilisé',
      'auth/weak-password': 'Le mot de passe doit faire au moins 6 caractères',
      'auth/invalid-email': 'Email invalide',
      'auth/too-many-requests': 'Trop de tentatives. Réessayez plus tard.',
      'auth/popup-closed-by-user': 'Connexion annulée',
      'auth/popup-blocked': 'Le popup a été bloqué. Utilisation de la redirection automatique...',
      'auth/operation-not-allowed': 'La connexion Google n\'est pas activée',
      'auth/unauthorized-domain': 'Domaine non autorisé',
      'auth/account-exists-with-different-credential': 'Cet email est déjà lié à un autre mode de connexion',
      'auth/cancelled-popup-request': 'Connexion annulée',
    };
    return map[code] || `Erreur: ${code}`;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setErrorType('auth');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(_auth, email, password);
      setError('✓ Connexion réussie, redirection...');
      setErrorType('success');
      setTimeout(() => router.push('/dashboard'), 500);
    } catch (err: any) {
      setError(translateError(err.code));
      setErrorType('auth');
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setErrorType('auth');
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(_auth, email, password);
      const uid = cred.user.uid;
      await setDoc(doc(_db, 'users', uid), {
        email,
        displayName: name || email.split('@')[0],
        plan: 'free',
        qrCount: 0,
        maxQRCodes: 5,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setError('✓ Compte créé et connecté, redirection...');
      setErrorType('success');
      setTimeout(() => router.push('/dashboard'), 500);
    } catch (err: any) {
      setError(translateError(err.code));
      setErrorType('auth');
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const cred = await signInWithPopup(_auth, provider);
      const uid = cred.user.uid;
      const { getDoc } = await import('firebase/firestore');
      const snap = await getDoc(doc(_db, 'users', uid));
      if (!snap.exists()) {
        await setDoc(doc(_db, 'users', uid), {
          email: cred.user.email,
          displayName: cred.user.displayName,
          plan: 'free',
          qrCount: 0,
          maxQRCodes: 5,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
      router.push('/dashboard');
    } catch (err: any) {
      // Gestion des erreurs spécifiques Google
      if (err.code === 'auth/operation-not-allowed') {
        setError(
          '🔴 Google Sign-In n\'est pas activé\n\n' +
          'Solution: Firebase Console → Authentication → Sign-in method → Google → Activer'
        );
        setErrorType('google');
        setLoading(false);
        return;
      }
      if (err.code === 'auth/unauthorized-domain') {
        setError(
          '🔴 Domaine non autorisé: ' + window.location.hostname + '\n\n' +
          'Solution: Firebase Console → Authentication → Settings → Authorized domains → Ajouter ce domaine'
        );
        setErrorType('google');
        setLoading(false);
        return;
      }
      if (err.code === 'auth/popup-blocked') {
        try {
          setError('📲 Popup bloqué, passage à la redirection...');
          setErrorType('google');
          const provider = new GoogleAuthProvider();
          provider.setCustomParameters({ prompt: 'select_account' });
          await signInWithRedirect(_auth, provider);
          return;
        } catch (redirectErr: any) {
          setError(translateError(redirectErr.code));
          setErrorType('auth');
          setLoading(false);
          return;
        }
      }
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Connexion annulée');
        setErrorType('auth');
        setLoading(false);
        return;
      }
      if (err.code === 'auth/account-exists-with-different-credential') {
        setError(
          'Cet email est déjà lié à un autre mode de connexion.\n\n' +
          'Connectez-vous avec le mode utilisé lors de l\'inscription.'
        );
        setErrorType('auth');
        setLoading(false);
        return;
      }
      // Autres erreurs
      setError(translateError(err.code));
      setErrorType('auth');
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Entrez votre email d\'abord');
      setErrorType('auth');
      return;
    }
    try {
      await sendPasswordResetEmail(_auth, email);
      setError('✓ Email de réinitialisation envoyé à ' + email);
      setErrorType('success');
    } catch (err: any) {
      setError(translateError(err.code));
      setErrorType('auth');
    }
  };

  if (!isFirebaseReady) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#0A0A0A', color: '#E5E2E1' }}>
        <div className="text-center" style={{ maxWidth: 400 }}>
          <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>
            <Zap size={32} style={{ color: '#22C55E' }} />
          </div>
          <h2 className="text-lg font-bold mb-2" style={{ fontFamily: "'Hanken Grotesk', sans-serif" }}>Configuration Firebase requise</h2>
          <p className="text-sm mb-4" style={{ color: '#A1A1A1' }}>
            Copiez le fichier <code style={{ color: '#22C55E', fontFamily: 'monospace' }}>.env.local.example</code> vers <code style={{ color: '#22C55E', fontFamily: 'monospace' }}>.env.local</code> et remplissez les clés Firebase.
          </p>
          <pre className="text-left p-4 text-xs font-mono" style={{ background: '#161616', border: '1px solid #262626', color: '#A1A1A1' }}>
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
          </pre>
        </div>
      </div>
    );
  }

  const s = {
    bg: '#0A0A0A',
    surface: '#161616',
    border: '#262626',
    text: '#E5E2E1',
    textSec: '#A1A1A1',
    textMuted: '#8F9378',
    primary: '#22C55E',
  };

  return (
    <div className="min-h-screen" style={{ background: s.bg, color: s.text }}>
      <Link href="/" className="inline-flex items-center gap-1.5 text-xs" style={{ color: s.textMuted, position: 'absolute', top: 16, left: 16, zIndex: 20 }}>
        ← Retour à l&apos;accueil
      </Link>

      <div className="flex min-h-screen">
        {/* Left panel - desktop */}
        <div className="hidden lg:flex w-[45%] flex-col items-center justify-center p-12 relative overflow-hidden" style={{ background: s.surface, borderRight: `1px solid ${s.border}` }}>
          <div className="absolute inset-0" style={{
            opacity: 0.05,
            backgroundImage: `
              linear-gradient(rgba(34,197,94,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(34,197,94,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }} />
          <div className="relative z-10 text-center">
            <div className="w-24 h-24 mx-auto mb-6 flex items-center justify-center" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>
              <Zap size={48} style={{ color: s.primary }} />
            </div>
            <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: "'Hanken Grotesk', sans-serif" }}>ZURI QR</h2>
            <p className="text-sm" style={{ color: s.textSec, maxWidth: 280, margin: '0 auto' }}>
              QR Codes dynamiques, intelligents et trackés en temps réel
            </p>
            <div className="mt-8 flex flex-col gap-3 text-left mx-auto" style={{ maxWidth: 260 }}>
              {[
                'QR codes modifiables sans les recréer',
                'Analytics en temps réel',
                'Brand-Match IA (PRO)',
              ].map((f) => (
                <div key={f} className="flex items-center gap-2.5 text-sm" style={{ color: s.textSec }}>
                  <span style={{ width: 6, height: 6, background: s.primary, flexShrink: 0 }} />
                  {f}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right panel - form */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full" style={{ maxWidth: 380 }}>
            {/* Mobile logo */}
            <div className="text-center mb-8 lg:hidden">
              <div className="w-12 h-12 mx-auto mb-3 flex items-center justify-center" style={{ background: s.primary }}>
                <Zap size={24} style={{ color: s.bg }} />
              </div>
              <h1 className="text-xl font-bold" style={{ fontFamily: "'Hanken Grotesk', sans-serif" }}>ZURI QR</h1>
            </div>

            {/* Tab switcher */}
            <div className="flex mb-6 p-0.5" style={{ background: s.surface, border: `1px solid ${s.border}` }}>
              {(['login', 'register'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => { setTab(t); setError(''); }}
                  className={`flex-1 py-2.5 text-sm font-medium transition-all ${
                    tab === t ? 'font-semibold' : ''
                  }`}
                  style={{
                    background: tab === t ? s.primary : 'transparent',
                    color: tab === t ? s.bg : s.textSec,
                  }}
                >
                  {t === 'login' ? 'Connexion' : 'Inscription'}
                </button>
              ))}
            </div>

            {/* Error display */}
            {error && (
              <div className="mb-4 p-4 text-sm rounded-lg" style={{
                background: errorType === 'success'
                  ? 'rgba(34,197,94,0.15)'
                  : errorType === 'google'
                    ? 'rgba(234,179,8,0.15)'
                    : 'rgba(255,107,107,0.15)',
                border: `1px solid ${
                  errorType === 'success'
                    ? 'rgba(34,197,94,0.3)'
                    : errorType === 'google'
                      ? 'rgba(234,179,8,0.3)'
                      : 'rgba(255,107,107,0.3)'
                }`,
                color: errorType === 'success' ? '#22C55E' : errorType === 'google' ? '#EAB308' : '#FF6B6B',
              }}>
                <div className="flex items-start gap-3">
                  <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
                  <span style={{ whiteSpace: 'pre-line', lineHeight: '1.5' }}>{error}</span>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={tab === 'login' ? handleLogin : handleRegister} className="space-y-4">
              {tab === 'register' && (
                <div>
                  <label className="block text-xs mb-1.5" style={{ color: s.textSec }}>Nom complet</label>
                  <div className="relative">
                    <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: s.textMuted }} />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Alex Koné"
                      className="w-full h-11 pl-9 pr-3 text-sm outline-none transition-colors"
                      style={{
                        background: s.bg,
                        border: `1px solid ${s.border}`,
                        color: s.text,
                      }}
                      onFocus={e => e.target.style.borderColor = s.primary}
                      onBlur={e => e.target.style.borderColor = s.border}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs mb-1.5" style={{ color: s.textSec }}>Email</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: s.textMuted }} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@exemple.com"
                    required
                    className="w-full h-11 pl-9 pr-3 text-sm outline-none transition-colors"
                    style={{
                      background: s.bg,
                      border: `1px solid ${s.border}`,
                      color: s.text,
                    }}
                    onFocus={e => e.target.style.borderColor = s.primary}
                    onBlur={e => e.target.style.borderColor = s.border}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs mb-1.5" style={{ color: s.textSec }}>Mot de passe</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: s.textMuted }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="w-full h-11 pl-9 pr-10 text-sm outline-none transition-colors"
                    style={{
                      background: s.bg,
                      border: `1px solid ${s.border}`,
                      color: s.text,
                    }}
                    onFocus={e => e.target.style.borderColor = s.primary}
                    onBlur={e => e.target.style.borderColor = s.border}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: s.textMuted }}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {tab === 'register' && (
                <div>
                  <label className="block text-xs mb-1.5" style={{ color: s.textSec }}>Confirmer le mot de passe</label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: s.textMuted }} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={6}
                      className="w-full h-11 pl-9 pr-3 text-sm outline-none transition-colors"
                      style={{
                        background: s.bg,
                        border: `1px solid ${s.border}`,
                        color: s.text,
                      }}
                      onFocus={e => e.target.style.borderColor = s.primary}
                      onBlur={e => e.target.style.borderColor = s.border}
                    />
                  </div>
                </div>
              )}

              {tab === 'login' && (
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-xs transition-colors"
                  style={{ color: s.textMuted }}
                  onMouseOver={e => e.currentTarget.style.color = s.primary}
                  onMouseOut={e => e.currentTarget.style.color = s.textMuted}
                >
                  Mot de passe oublié ?
                </button>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 text-sm font-semibold flex items-center justify-center gap-2 transition-opacity disabled:opacity-50"
                style={{ background: s.primary, color: s.bg, border: 'none' }}
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                {tab === 'login' ? 'Se connecter' : 'Créer mon compte'}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div style={{ flex: 1, height: 1, background: s.border }} />
              <span className="text-xs" style={{ color: s.textMuted }}>ou</span>
              <div style={{ flex: 1, height: 1, background: s.border }} />
            </div>

            {/* Google button */}
            <button
              onClick={handleGoogle}
              disabled={loading}
              className="w-full h-11 text-sm font-medium flex items-center justify-center gap-2.5 transition-all disabled:opacity-50"
              style={{
                background: 'transparent',
                border: `1px solid ${s.border}`,
                color: s.textSec,
              }}
              onMouseOver={e => { 
                if (!loading) {
                  e.currentTarget.style.background = s.surface; 
                  e.currentTarget.style.borderColor = s.primary;
                }
              }}
              onMouseOut={e => { 
                e.currentTarget.style.background = 'transparent'; 
                e.currentTarget.style.borderColor = s.border;
              }}
            >
              {loading && error && error.includes('Popup bloqué') ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Redirection...
                </>
              ) : loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Connexion...
                </>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continuer avec Google
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
