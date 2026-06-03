'use client';

import { useState } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, isFirebaseReady } from '@/lib/firebase';
import { Auth } from 'firebase/auth';

const _auth = auth as Auth;
const _db = db!;
import { useRouter } from 'next/navigation';
import { Zap, Eye, EyeOff, Mail, Lock, User, Loader2 } from 'lucide-react';
import Link from 'next/link';

export function AuthScreen() {
  const router = useRouter();
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const translateError = (code: string) => {
    const map: Record<string, string> = {
      'auth/user-not-found': 'Aucun compte trouvé avec cet email',
      'auth/wrong-password': 'Mot de passe incorrect',
      'auth/invalid-credential': 'Email ou mot de passe incorrect',
      'auth/email-already-in-use': 'Cet email est déjà utilisé',
      'auth/weak-password': 'Le mot de passe doit faire au moins 6 caractères',
      'auth/invalid-email': 'Email invalide',
      'auth/too-many-requests': 'Trop de tentatives. Réessaie plus tard.',
      'auth/popup-closed-by-user': 'Connexion annulée',
    };
    return map[code] || 'Une erreur est survenue';
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(_auth, email, password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(translateError(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
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
      router.push('/dashboard');
    } catch (err: any) {
      setError(translateError(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
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
      setError(translateError(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Entre ton email d\'abord');
      return;
    }
    try {
      await sendPasswordResetEmail(_auth, email);
      setError('Email de réinitialisation envoyé ✓');
    } catch (err: any) {
      setError(translateError(err.code));
    }
  };

  if (!isFirebaseReady) {
    return (
      <div className="min-h-screen bg-deep flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-secondary/10 border border-secondary/20 flex items-center justify-center">
            <Zap size={32} className="text-secondary" />
          </div>
          <h2 className="text-lg font-bold text-text-primary mb-2">Configuration Firebase requise</h2>
          <p className="text-text-secondary text-sm mb-4">
            Copie le fichier <code className="text-primary font-mono text-xs">.env.local.example</code> vers <code className="text-primary font-mono text-xs">.env.local</code> et remplis les clés Firebase.
          </p>
          <pre className="text-left bg-surface border border-border rounded-lg p-4 text-xs font-mono text-text-secondary">
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

  return (
    <div className="min-h-screen bg-deep flex relative">
      <Link href="/" className="absolute top-4 left-4 z-20 flex items-center gap-1.5 text-sm text-text-muted hover:text-text-secondary transition-colors">
        ← Retour à l&apos;accueil
      </Link>
      <div className="hidden lg:flex w-[45%] bg-surface border-r border-border flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `
            linear-gradient(rgba(217,255,0,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(217,255,0,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }} />
        <div className="relative z-10 text-center">
          <div className="w-24 h-24 mx-auto mb-6 flex items-center justify-center" style={{ background: 'rgba(217,255,0,0.1)', border: '1px solid rgba(217,255,0,0.2)' }}>
            <Zap size={48} style={{ color: '#D9FF00' }} />
          </div>
          <h2 className="text-2xl font-bold text-text-primary mb-2">ZURI QR</h2>
          <p className="text-text-secondary text-sm max-w-xs mx-auto">
            QR Codes dynamiques, intelligents et trackés en temps réel
          </p>
          <div className="mt-8 flex flex-col gap-2 text-left">
            {['QR codes modifiables sans les recréer', 'Analytics en temps réel', 'Brand-Match IA (PRO)'].map((f) => (
              <div key={f} className="flex items-center gap-2 text-sm text-text-secondary">
                <span className="w-1.5 h-1.5 bg-primary flex-shrink-0" style={{ background: '#D9FF00' }} />
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8 lg:hidden">
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-primary flex items-center justify-center">
              <Zap size={24} className="text-deep" />
            </div>
            <h1 className="text-xl font-bold text-text-primary">ZURI QR</h1>
          </div>

          <div className="flex mb-6 bg-surface rounded-lg p-1 border border-border">
            <button
              onClick={() => { setTab('login'); setError(''); }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                tab === 'login' ? 'bg-primary text-deep' : 'text-text-secondary'
              }`}
            >
              Connexion
            </button>
            <button
              onClick={() => { setTab('register'); setError(''); }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                tab === 'register' ? 'bg-primary text-deep' : 'text-text-secondary'
              }`}
            >
              Inscription
            </button>
          </div>

          <form onSubmit={tab === 'login' ? handleLogin : handleRegister} className="space-y-4">
            {tab === 'register' && (
              <div>
                <label className="block text-sm text-text-secondary mb-1.5">Nom complet</label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Koné"
                    className="w-full h-11 pl-9 pr-3 rounded-lg bg-deep border border-border text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm text-text-secondary mb-1.5">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@exemple.com"
                  required
                  className="w-full h-11 pl-9 pr-3 rounded-lg bg-deep border border-border text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-text-secondary mb-1.5">Mot de passe</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full h-11 pl-9 pr-10 rounded-lg bg-deep border border-border text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {tab === 'register' && (
              <div>
                <label className="block text-sm text-text-secondary mb-1.5">Confirmer le mot de passe</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="w-full h-11 pl-9 pr-3 rounded-lg bg-deep border border-border text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>
            )}

            {tab === 'login' && (
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-xs text-text-muted hover:text-primary transition-colors"
              >
                Mot de passe oublié ?
              </button>
            )}

            {error && (
              <div className={`p-3 rounded-lg border text-sm font-mono ${
                error.includes('✓') || error.includes('envoyé')
                  ? 'bg-primary/10 border-primary/20 text-primary'
                  : 'bg-danger/10 border-danger/20 text-danger'
              }`}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-lg bg-primary text-deep font-semibold text-sm hover:bg-primary-hover transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {tab === 'login' ? 'Se connecter' : 'Créer mon compte'}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-text-muted">ou</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <button
            onClick={handleGoogle}
            disabled={loading}
            className="w-full h-11 rounded-lg border border-border text-text-secondary text-sm font-medium hover:bg-surface-elevated transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continuer avec Google
          </button>
        </div>
      </div>
    </div>
  );
}
