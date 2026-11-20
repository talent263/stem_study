import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
  User as FirebaseUser,
  getRedirectResult,
  signInWithPopup,
  signInWithRedirect,
  signOut as fbSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase/config.ts';
import type { Role, UserProfile } from '../types/index.ts';
import { createAuditLog } from '../services/auditService.ts';
import { useToast } from './ToastContext.tsx';

export const getGoogleSignInErrorMessage = (error: unknown) => {
  const code = (error as { code?: string } | null)?.code;
  switch (code) {
    case 'auth/unauthorized-domain':
      {
        const hostname = typeof window === 'undefined' ? 'this site' : window.location.hostname;
        return `Firebase rejected "${hostname}". Add that hostname under Authentication → Settings → Authorized domains in project gen-lang-client-0294847969.`;
      }
    case 'auth/operation-not-allowed':
      return 'Google sign-in is disabled for this Firebase project. Enable Google in Firebase Authentication → Sign-in method.';
    case 'auth/network-request-failed':
      return 'Could not reach Google sign-in. Check your connection and try again.';
    case 'auth/popup-closed-by-user':
      return 'The Google sign-in window was closed before you finished.';
    default:
      return error instanceof Error ? error.message : 'Please try again.';
  }
};

interface AuthContextType {
  user: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  selectedLoginRole: Role | null;
  signInWithGoogle: (role: Role) => Promise<void>;
  signOut: () => Promise<void>;
  clearSelectedLoginRole: () => void;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SELECTED_LOGIN_ROLE_KEY = 'stem-study:selected-login-role';

function readSelectedLoginRole(): Role | null {
  if (typeof window === 'undefined') return null;
  const stored = window.sessionStorage.getItem(SELECTED_LOGIN_ROLE_KEY);
  return stored === 'STUDENT' || stored === 'TUTOR' || stored === 'ADMIN' ? stored : null;
}

function isRole(value: unknown): value is Role {
  return value === 'STUDENT' || value === 'TUTOR' || value === 'ADMIN';
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { error: showError } = useToast();
  const showErrorRef = useRef(showError);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLoginRole, setSelectedLoginRole] = useState<Role | null>(readSelectedLoginRole);

  const clearSelectedLoginRole = useCallback(() => {
    window.sessionStorage.removeItem(SELECTED_LOGIN_ROLE_KEY);
    setSelectedLoginRole(null);
  }, []);

  useEffect(() => {
    showErrorRef.current = showError;
  }, [showError]);

  useEffect(() => {
    getRedirectResult(auth).catch((err) => {
      console.error('Google redirect sign-in failed:', err);
      showErrorRef.current('Google sign-in failed', getGoogleSignInErrorMessage(err));
    });

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        const isAdminEmail = fbUser.email?.toLowerCase() === 'talentnechaz@gmail.com';
        const fallbackProfile: UserProfile = {
          id: fbUser.uid,
          name: fbUser.displayName || 'STEM Scholar',
          email: fbUser.email || '',
          role: isAdminEmail ? 'ADMIN' : 'STUDENT',
          institution: 'University of Zimbabwe',
          department: 'Software Engineering',
          avatarUrl: fbUser.photoURL || '',
          isDemo: false,
        };

        try {
          const userDocRef = doc(db, 'users', fbUser.uid);
          const snap = await getDoc(userDocRef);
          const adminDocRef = doc(db, 'admins', fbUser.uid);
          const adminSnap = await getDoc(adminDocRef);
          const isProvisionedAdmin = isAdminEmail || adminSnap.exists();

          let role: Role = isProvisionedAdmin ? 'ADMIN' : 'STUDENT';
          let institution = 'University of Zimbabwe';
          let department = 'Software Engineering';

          if (snap.exists()) {
            const data = snap.data();
            role = isProvisionedAdmin
              ? 'ADMIN'
              : data.role === 'TUTOR'
                ? 'TUTOR'
                : 'STUDENT';
            institution = data.institution || institution;
            department = data.department || department;
            if (isProvisionedAdmin && data.role !== 'ADMIN') {
              await setDoc(userDocRef, { role: 'ADMIN', updatedAt: new Date().toISOString() }, { merge: true });
            }
          } else {
            // Create user document in Firestore
            await setDoc(userDocRef, {
              id: fbUser.uid,
              name: fbUser.displayName || 'STEM Scholar',
              email: fbUser.email || '',
              role,
              institution,
              department,
              avatarUrl: fbUser.photoURL || '',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            });
          }

          // Repair the admin marker for accounts that were created before the
          // rules accepted Firebase's normalized lowercase email claim.
          if (isAdminEmail && !adminSnap.exists()) {
            await setDoc(adminDocRef, {
              userId: fbUser.uid,
              email: fbUser.email || '',
              grantedAt: new Date().toISOString(),
            });
          }

          const profile: UserProfile = {
            id: fbUser.uid,
            name: fbUser.displayName || 'STEM Scholar',
            email: fbUser.email || '',
            role,
            institution,
            department,
            avatarUrl: fbUser.photoURL || '',
            isDemo: false,
          };
          setUser(profile);

          // Audit logging must not turn successful authentication into a failed profile load.
          try {
            await createAuditLog({
              userId: profile.id,
              userName: profile.name,
              userRole: profile.role,
              action: 'AUTH_LOGIN',
              target: 'Platform Access',
              metadata: `Signed in via Google OAuth (${profile.email})`,
            });
          } catch (auditError) {
            console.warn('Could not record Google sign-in audit log:', auditError);
          }
        } catch (err) {
          console.error('Error fetching/creating user profile:', err);
          setUser(fallbackProfile);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async (role: Role) => {
    window.sessionStorage.setItem(SELECTED_LOGIN_ROLE_KEY, role);
    setSelectedLoginRole(role);
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      const code = (err as { code?: string } | null)?.code;
      if (code === 'auth/popup-blocked' || code === 'auth/operation-not-supported-in-this-environment') {
        try {
          await signInWithRedirect(auth, googleProvider);
          return;
        } catch (redirectError) {
          setLoading(false);
          throw redirectError;
        }
      }
      setLoading(false);
      console.error('Google Sign-In failed:', err);
      throw err;
    }
  };

  const signOut = async () => {
    if (user) {
      try {
        await createAuditLog({
          userId: user.id,
          userName: user.name,
          userRole: user.role,
          action: 'AUTH_LOGOUT',
          target: 'Platform Session',
          metadata: 'Signed out of STEM STUDY session',
        });
      } catch (auditError) {
        console.warn('Could not record sign-out audit log:', auditError);
      }
    }

    if (firebaseUser) {
      await fbSignOut(auth);
    }
    clearSelectedLoginRole();
    setUser(null);
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    if (updates.role && updates.role !== user.role && user.role !== 'ADMIN') {
      throw new Error('Only an administrator can change account roles.');
    }
    const updated = { ...user, ...updates };
    setUser(updated);

    if (!user.isDemo && firebaseUser) {
      const userDocRef = doc(db, 'users', user.id);
      await setDoc(
        userDocRef,
        {
          ...updates,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    }

    await createAuditLog({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'ADMIN_UPDATE_ROLE',
      target: user.name,
      metadata: `Updated profile details: ${JSON.stringify(updates)}`,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        loading,
        selectedLoginRole,
        signInWithGoogle,
        signOut,
        clearSelectedLoginRole,
        updateProfile,
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
