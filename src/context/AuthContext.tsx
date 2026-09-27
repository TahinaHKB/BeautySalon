import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User as FirebaseUser, 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut as fbSignOut 
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../firebase/config';

export interface UserProfile {
  userId: string;
  email: string;
  displayName: string;
  photoURL?: string;
  phone?: string;
  role?: 'client' | 'admin';
  createdAt?: string;
}

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: UserProfile | null;
  isAuthReady: boolean;
  isAdmin: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithDemoAccount: (asAdmin?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  updateCustomerPhone: (phone: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_EMAIL = 'tahinaAndriantsoa2004@gmail.com';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  // Sync profile document to Firestore
  const syncUserProfile = async (user: FirebaseUser) => {
    const userDocRef = doc(db, 'users', user.uid);
    try {
      const snap = await getDoc(userDocRef);
      if (!snap.exists()) {
        const newProfile: UserProfile = {
          userId: user.uid,
          email: user.email || '',
          displayName: user.displayName || 'Cliente Un Moment pour Soi',
          photoURL: user.photoURL || '',
          phone: user.phoneNumber || '',
          role: user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase() ? 'admin' : 'client',
          createdAt: new Date().toISOString()
        };
        await setDoc(userDocRef, {
          userId: newProfile.userId,
          email: newProfile.email,
          displayName: newProfile.displayName,
          phone: newProfile.phone || '',
          createdAt: newProfile.createdAt
        });
        setUserProfile(newProfile);
      } else {
        const data = snap.data();
        setUserProfile({
          userId: user.uid,
          email: data.email || user.email || '',
          displayName: data.displayName || user.displayName || 'Cliente',
          photoURL: user.photoURL || '',
          phone: data.phone || '',
          role: (data.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase() || user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) ? 'admin' : 'client',
          createdAt: data.createdAt
        });
      }
    } catch (err) {
      console.warn('Note on user sync:', err);
      // Fallback profile from auth object
      setUserProfile({
        userId: user.uid,
        email: user.email || '',
        displayName: user.displayName || 'Cliente',
        photoURL: user.photoURL || '',
        role: user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase() ? 'admin' : 'client'
      });
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await syncUserProfile(user);
      } else {
        // Check if demo user was logged in
        const storedDemo = localStorage.getItem('demo_user_salon');
        if (storedDemo) {
          try {
            const parsed = JSON.parse(storedDemo) as UserProfile;
            setUserProfile(parsed);
          } catch {
            setUserProfile(null);
          }
        } else {
          setUserProfile(null);
        }
      }
      setIsAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    try {
      localStorage.removeItem('demo_user_salon');
      const result = await signInWithPopup(auth, provider);
      await syncUserProfile(result.user);
    } catch (error: any) {
      console.error('Google Sign-in failed:', error);
      // If popup blocked or failed in sandboxed iframe, provide helpful toast & fallback
      if (error?.code === 'auth/popup-blocked' || error?.code === 'auth/cancelled-popup-request') {
        throw new Error("La fenêtre de connexion a été bloquée par le navigateur. Vous pouvez également utiliser le mode 'Connexion Rapide Démo' pour tester l'application.");
      }
      throw error;
    }
  };

  const loginWithDemoAccount = async (asAdmin: boolean = false) => {
    // Allows instant client or admin testing
    const demoId = asAdmin ? 'admin-tahina' : 'client-demo-' + Math.random().toString(36).substring(2, 7);
    const demoProfile: UserProfile = {
      userId: demoId,
      email: asAdmin ? ADMIN_EMAIL : 'camille.client@unmomentpoursoi.fr',
      displayName: asAdmin ? 'Tahina (Admin Institut)' : 'Camille Roussel',
      photoURL: asAdmin ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80' : 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
      phone: '06 12 34 56 78',
      role: asAdmin ? 'admin' : 'client',
      createdAt: new Date().toISOString()
    };
    localStorage.setItem('demo_user_salon', JSON.stringify(demoProfile));
    setUserProfile(demoProfile);
  };

  const logout = async () => {
    localStorage.removeItem('demo_user_salon');
    setUserProfile(null);
    if (auth.currentUser) {
      await fbSignOut(auth);
    }
  };

  const updateCustomerPhone = async (phone: string) => {
    if (!effectiveUserId) return;
    if (currentUser) {
      const userRef = doc(db, 'users', currentUser.uid);
      try {
        await setDoc(userRef, { phone, updatedAt: new Date().toISOString() }, { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${currentUser.uid}`);
      }
    }
    if (userProfile) {
      const updated = { ...userProfile, phone };
      setUserProfile(updated);
      if (!currentUser) {
        localStorage.setItem('demo_user_salon', JSON.stringify(updated));
      }
    }
  };

  const effectiveUserId = currentUser?.uid || userProfile?.userId;
  const isAdmin = (userProfile?.role === 'admin') || 
                  (currentUser?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) || 
                  (userProfile?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase());

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        isAuthReady,
        isAdmin,
        loginWithGoogle,
        loginWithDemoAccount,
        logout,
        updateCustomerPhone
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
