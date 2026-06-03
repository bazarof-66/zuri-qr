'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { onAuthStateChanged, signOut as firebaseSignOut, User } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, isFirebaseReady } from '@/lib/firebase';

interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  plan: 'free' | 'pro';
  qrCount: number;
  maxQRCodes: number;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseReady || !auth) {
      setLoading(false);
      return;
    }
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser && db) {
        try {
          const snap = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (snap.exists()) {
            const data = snap.data();
            setProfile({
              uid: firebaseUser.uid,
              email: data.email ?? firebaseUser.email,
              displayName: data.displayName ?? firebaseUser.displayName,
              plan: data.plan ?? 'free',
              qrCount: data.qrCount ?? 0,
              maxQRCodes: data.maxQRCodes ?? 5,
            });
          } else {
            await setDoc(doc(db, 'users', firebaseUser.uid), {
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              plan: 'free',
              qrCount: 0,
              maxQRCodes: 5,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
            setProfile({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              plan: 'free',
              qrCount: 0,
              maxQRCodes: 5,
            });
          }
        } catch {
          setProfile({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            plan: 'free',
            qrCount: 0,
            maxQRCodes: 5,
          });
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const signOut = async () => {
    if (!auth) return;
    await firebaseSignOut(auth);
    setUser(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    if (!user || !db || !auth) return;
    const snap = await getDoc(doc(db, 'users', user.uid));
    if (snap.exists()) {
      const data = snap.data();
      setProfile({
        uid: user.uid,
        email: data.email ?? user.email,
        displayName: data.displayName ?? user.displayName,
        plan: data.plan ?? 'free',
        qrCount: data.qrCount ?? 0,
        maxQRCodes: data.maxQRCodes ?? 5,
      });
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
