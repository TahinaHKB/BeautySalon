import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User as FirebaseUser, 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile,
  signOut as fbSignOut 
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, onSnapshot, DocumentSnapshot } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../firebase/config';
import { UserProfile, UserRole } from '../types/salon';

export const OWNER_ADMIN_EMAILS = [
  'tahinaandriantsoa2004@gmail.com'
];

export function isOwnerAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return OWNER_ADMIN_EMAILS.includes(email.toLowerCase().trim());
}

export function isUserAdminEmail(email?: string | null): boolean {
  return isOwnerAdminEmail(email);
}

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: UserProfile | null;
  isAuthReady: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isPractitioner: boolean;
  userRole: UserRole;
  isEmailVerified: boolean;
  loginWithEmailPassword: (email: string, pass: string) => Promise<void>;
  registerWithEmailPassword: (email: string, pass: string, displayName: string, phone?: string) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  reloadUserStatus: () => Promise<boolean>;
  sendPasswordReset: (email: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  quickLoginAsPractitioner: (practitionerId: 'emilie' | 'chloe' | 'sarah' | 'tahina') => Promise<void>;
  logout: () => Promise<void>;
  updateCustomerPhone: (phone: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  // Sync profile document to Firestore
  const syncUserProfile = async (user: FirebaseUser, extraFields?: { displayName?: string; phone?: string; forceRole?: UserRole }) => {
    const userDocRef = doc(db, 'users', user.uid);
    const isOwner = isOwnerAdminEmail(user.email);
    
    try {
      const snap = await getDoc(userDocRef);
      if (!snap.exists()) {
        const initialRole: UserRole = isOwner ? 'admin' : (extraFields?.forceRole || 'client');
        const isStaff = initialRole === 'admin' || initialRole === 'practitioner';
        const newProfile: UserProfile = {
          userId: user.uid,
          email: user.email || '',
          displayName: extraFields?.displayName || user.displayName || 'Cliente Un Moment pour Soi',
          photoURL: user.photoURL || '',
          phone: extraFields?.phone || user.phoneNumber || '',
          role: initialRole,
          admin: isStaff,
          isAdmin: isStaff,
          isPractitioner: initialRole === 'practitioner',
          emailVerified: user.emailVerified,
          createdAt: new Date().toISOString()
        };
        await setDoc(userDocRef, {
          userId: newProfile.userId,
          email: newProfile.email,
          displayName: newProfile.displayName,
          phone: newProfile.phone || '',
          admin: isStaff,
          isAdmin: isStaff,
          role: initialRole,
          isPractitioner: initialRole === 'practitioner',
          emailVerified: user.emailVerified,
          createdAt: newProfile.createdAt
        });
        setUserProfile(newProfile);
      } else {
        const data = snap.data();
        let role: UserRole = 'client';
        if (isOwner) role = 'admin';
        else if (data.role === 'practitioner' || data.isPractitioner === true) role = 'practitioner';
        else if (data.role === 'admin' || data.admin === true || data.isAdmin === true) role = 'admin';

        const isStaff = role === 'admin' || role === 'practitioner';
        const updatedProfile: UserProfile = {
          userId: user.uid,
          email: data.email || user.email || '',
          displayName: data.displayName || user.displayName || 'Cliente',
          photoURL: user.photoURL || '',
          phone: data.phone || extraFields?.phone || '',
          role,
          admin: isStaff,
          isAdmin: isStaff,
          isPractitioner: role === 'practitioner',
          specialties: Array.isArray(data.specialties) ? data.specialties : [],
          bio: data.bio || '',
          experience: data.experience || '',
          emailVerified: user.emailVerified || data.emailVerified === true,
          createdAt: data.createdAt
        };

        // If email was just verified in Auth, sync to doc
        if (user.emailVerified && !data.emailVerified) {
          await updateDoc(userDocRef, { emailVerified: true, updatedAt: new Date().toISOString() });
        }

        setUserProfile(updatedProfile);
      }
    } catch (err) {
      console.warn('Note on user sync:', err);
      const isStaff = isOwner;
      setUserProfile({
        userId: user.uid,
        email: user.email || '',
        displayName: extraFields?.displayName || user.displayName || 'Cliente',
        photoURL: user.photoURL || '',
        phone: extraFields?.phone || '',
        admin: isStaff,
        isAdmin: isStaff,
        role: isOwner ? 'admin' : 'client',
        emailVerified: user.emailVerified
      });
    }
  };

  useEffect(() => {
    let docUnsub: (() => void) | null = null;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (docUnsub) {
        docUnsub();
        docUnsub = null;
      }

      if (user) {
        await syncUserProfile(user);

        // Live sync of user profile (e.g. if promoted to admin in Admin Dashboard)
        try {
          docUnsub = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
            if (docSnap.exists()) {
              const data = docSnap.data();
              const isOwner = isOwnerAdminEmail(user.email);
              let role: UserRole = 'client';
              if (isOwner) role = 'admin';
              else if (data.role === 'practitioner' || data.isPractitioner === true) role = 'practitioner';
              else if (data.role === 'admin' || data.admin === true || data.isAdmin === true) role = 'admin';

              const isStaff = role === 'admin' || role === 'practitioner';
              setUserProfile(prev => prev ? {
                ...prev,
                role,
                admin: isStaff,
                isAdmin: isStaff,
                isPractitioner: role === 'practitioner',
                displayName: data.displayName || prev.displayName,
                phone: data.phone || prev.phone,
                emailVerified: Boolean(user.emailVerified || data.emailVerified)
              } : null);
            }
          });
        } catch (e) {
          console.warn('Doc listener notice:', e);
        }
      } else {
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

    return () => {
      unsubscribe();
      if (docUnsub) docUnsub();
    };
  }, []);

  const loginWithEmailPassword = async (email: string, pass: string) => {
    localStorage.removeItem('demo_user_salon');
    const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
    await syncUserProfile(cred.user);
  };

  const registerWithEmailPassword = async (email: string, pass: string, displayName: string, phone?: string) => {
    localStorage.removeItem('demo_user_salon');
    const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
    if (displayName) {
      await updateProfile(cred.user, { displayName: displayName.trim() });
    }
    // Send email verification
    try {
      await sendEmailVerification(cred.user);
    } catch (err) {
      console.warn("sendEmailVerification warning:", err);
    }
    // Newly created accounts are strictly non-admin clients
    await syncUserProfile(cred.user, { displayName, phone, forceRole: 'client' });
  };

  const resendVerificationEmail = async () => {
    if (!auth.currentUser) throw new Error("Aucun utilisateur connecté.");
    await sendEmailVerification(auth.currentUser);
  };

  const reloadUserStatus = async (): Promise<boolean> => {
    if (auth.currentUser) {
      await auth.currentUser.reload();
      const verified = auth.currentUser.emailVerified;
      if (verified && userProfile) {
        setUserProfile((prev) => prev ? ({ ...prev, emailVerified: true }) : null);
        try {
          const userDocRef = doc(db, 'users', auth.currentUser.uid);
          await updateDoc(userDocRef, { emailVerified: true, updatedAt: new Date().toISOString() });
        } catch (e) {
          console.warn("Could not sync emailVerified to doc:", e);
        }
      }
      return verified;
    }
    return false;
  };

  const sendPasswordReset = async (email: string) => {
    await sendPasswordResetEmail(auth, email.trim());
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    try {
      localStorage.removeItem('demo_user_salon');
      const result = await signInWithPopup(auth, provider);
      await syncUserProfile(result.user);
    } catch (error: any) {
      console.warn('Google Sign-in notice:', error?.message || error);
      throw error;
    }
  };

  const quickLoginAsPractitioner = async (practitionerId: 'emilie' | 'chloe' | 'sarah' | 'tahina') => {
    const practitioners = {
      emilie: {
        id: 'admin-emilie',
        name: 'Émilie Dupont (Gérante & Fondatrice)',
        email: 'emilie@unmomentpoursoi-institut.fr',
        phone: '01 69 88 02 45',
        role: 'admin' as const
      },
      chloe: {
        id: 'admin-chloe',
        name: 'Chloé Martin (Massothérapeute)',
        email: 'chloe@unmomentpoursoi-institut.fr',
        phone: '01 69 88 02 45',
        role: 'admin' as const
      },
      sarah: {
        id: 'admin-sarah',
        name: 'Sarah Benali (Regard & Onglerie)',
        email: 'sarah@unmomentpoursoi-institut.fr',
        phone: '01 69 88 02 45',
        role: 'admin' as const
      },
      tahina: {
        id: 'admin-tahina',
        name: 'Tahina (Admin Général)',
        email: 'tahinaAndriantsoa2004@gmail.com',
        phone: '06 12 34 56 78',
        role: 'admin' as const
      }
    };

    const target = practitioners[practitionerId];
    const demoProfile: UserProfile = {
      userId: target.id,
      email: target.email,
      displayName: target.name,
      phone: target.phone,
      role: 'admin',
      isAdmin: true,
      emailVerified: true,
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
    if (currentUser) {
      const userRef = doc(db, 'users', currentUser.uid);
      try {
        await updateDoc(userRef, { phone, updatedAt: new Date().toISOString() });
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

  const isEmailVerified = Boolean(
    currentUser?.emailVerified || 
    userProfile?.emailVerified ||
    userProfile?.admin ||
    userProfile?.isAdmin // admin bypass
  );

  const userRole: UserRole = userProfile?.role || (isOwnerAdminEmail(currentUser?.email) ? 'admin' : 'client');
  const isSuperAdmin = userRole === 'admin' || isOwnerAdminEmail(currentUser?.email) || isOwnerAdminEmail(userProfile?.email);
  const isPractitioner = userRole === 'practitioner' || userProfile?.isPractitioner === true;
  const isAdmin = isSuperAdmin || isPractitioner || userProfile?.admin === true || userProfile?.isAdmin === true;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        isAuthReady,
        isAdmin,
        isSuperAdmin,
        isPractitioner,
        userRole,
        isEmailVerified,
        loginWithEmailPassword,
        registerWithEmailPassword,
        resendVerificationEmail,
        reloadUserStatus,
        sendPasswordReset,
        loginWithGoogle,
        quickLoginAsPractitioner,
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
