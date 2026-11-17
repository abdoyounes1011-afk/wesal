import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  sendPasswordResetEmail,
  signInWithPopup,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../services/firebase';
import { UserProfile } from '../types';
import { handleFirestoreError, OperationType } from '../services/firestoreError';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isGuest: boolean;
  signInWithEmail: (e: string, p: string) => Promise<void>;
  signUpWithEmail: (e: string, p: string, name?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (e: string) => Promise<void>;
  continueAsGuest: () => void;
  authError: string | null;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const clearAuthError = () => setAuthError(null);

  // Sync profile from Firestore
  const fetchOrInitProfile = async (user: User) => {
    try {
      const userRef = doc(db, 'users', user.uid);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        setUserProfile(snap.data() as UserProfile);
      } else {
        const newProfile: UserProfile = {
          userId: user.uid,
          email: user.email || '',
          displayName: user.displayName || 'قارئ القرآن',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await setDoc(userRef, newProfile);
        setUserProfile(newProfile);
      }
    } catch (err) {
      console.warn('Profile fetch or create notice:', err);
      // Fallback local profile if offline
      setUserProfile({
        userId: user.uid,
        email: user.email || '',
        displayName: user.displayName || 'قارئ القرآن',
      });
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        setIsGuest(false);
        await fetchOrInitProfile(user);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const translateAuthError = (err: any): string => {
    const code = err?.code || '';
    switch (code) {
      case 'auth/invalid-email':
        return 'صيغة البريد الإلكتروني غير صحيحة.';
      case 'auth/user-disabled':
        return 'تم تعطيل هذا الحساب مؤقتاً.';
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'البريد الإلكتروني أو كلمة المرور غير صحيحة.';
      case 'auth/email-already-in-use':
        return 'هذا البريد الإلكتروني مسجل بالفعل. يمكنك تسجيل الدخول بدلاً من ذلك.';
      case 'auth/weak-password':
        return 'كلمة المرور ضعيفة. يرجى اختيار كلمة مرور لا تقل عن 6 أحرف.';
      case 'auth/popup-closed-by-user':
      case 'auth/cancelled-popup-request':
        return 'تم إغلاق نافذة تسجيل الدخول قبل إتمام العملية.';
      case 'auth/popup-blocked':
        return 'قام المتصفح بحظر نافذة تسجيل الدخول عبر Google. يرجى السماح بالنوافذ المنبثقة (Pop-ups) والمحاولة مرة أخرى.';
      case 'auth/unauthorized-domain': {
        const host = typeof window !== 'undefined' ? window.location.hostname : '';
        return `النطاق الحالي (${host}) غير مصرح به في إعدادات Firebase Auth. أضف هذا النطاق في Firebase Console ضمن Authentication ← Settings ← Authorized domains، أو استخدم البريد الإلكتروني وكلمة المرور.`;
      }
      case 'auth/operation-not-allowed':
        return 'طريقة تسجيل الدخول هذه غير مفعلة في إعدادات مشروع Firebase.';
      case 'auth/network-request-failed':
        return 'تعذر الاتصال بالشبكة. يرجى التأكد من اتصالك بالإنترنت.';
      default:
        return err?.message || 'حدث خطأ أثناء المصادقة، يرجى المحاولة مرة أخرى.';
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    setAuthError(null);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), pass);
    } catch (err: any) {
      const msg = translateAuthError(err);
      setAuthError(msg);
      throw new Error(msg);
    }
  };

  const signUpWithEmail = async (email: string, pass: string, name?: string) => {
    setAuthError(null);
    try {
      const res = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      if (name && res.user) {
        await updateProfile(res.user, { displayName: name });
      }
      if (res.user) {
        await fetchOrInitProfile(res.user);
      }
    } catch (err: any) {
      const msg = translateAuthError(err);
      setAuthError(msg);
      throw new Error(msg);
    }
  };

  const signInWithGoogle = async () => {
    setAuthError(null);
    try {
      const res = await signInWithPopup(auth, googleProvider);
      if (res.user) {
        await fetchOrInitProfile(res.user);
      }
    } catch (err: any) {
      const msg = translateAuthError(err);
      setAuthError(msg);
      throw new Error(msg);
    }
  };

  const signOut = async () => {
    setAuthError(null);
    try {
      await fbSignOut(auth);
      setIsGuest(false);
      setUserProfile(null);
    } catch (err: any) {
      const msg = translateAuthError(err);
      setAuthError(msg);
      throw new Error(msg);
    }
  };

  const resetPassword = async (email: string) => {
    setAuthError(null);
    try {
      await sendPasswordResetEmail(auth, email.trim());
    } catch (err: any) {
      const msg = translateAuthError(err);
      setAuthError(msg);
      throw new Error(msg);
    }
  };

  const continueAsGuest = () => {
    setIsGuest(true);
    setUserProfile({
      userId: 'guest_user',
      email: 'guest@athar.app',
      displayName: 'قارئ ضيف',
    });
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        loading,
        isGuest,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        signOut,
        resetPassword,
        continueAsGuest,
        authError,
        clearAuthError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
