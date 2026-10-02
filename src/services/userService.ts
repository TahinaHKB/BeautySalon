import { 
  collection, 
  doc, 
  getDocs, 
  setDoc,
  updateDoc, 
  onSnapshot, 
  query, 
  where,
  orderBy, 
  Unsubscribe 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, auth } from '../firebase/config';
import { UserProfile, UserRole } from '../types/salon';

const LOCAL_USERS_KEY = 'salon_un_moment_pour_soi_all_users';
const LOCAL_PRACTITIONERS_KEY = 'salon_un_moment_pour_soi_practitioners';

function getLocalUsers(): UserProfile[] {
  try {
    const raw = localStorage.getItem(LOCAL_USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalUsers(users: UserProfile[]) {
  try {
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
  } catch (e) {
    console.warn('Notice saving local users:', e);
  }
}

function getLocalPractitioners(): UserProfile[] {
  try {
    const raw = localStorage.getItem(LOCAL_PRACTITIONERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalPractitioners(users: UserProfile[]) {
  try {
    localStorage.setItem(LOCAL_PRACTITIONERS_KEY, JSON.stringify(users));
  } catch (e) {
    console.warn('Notice saving local practitioners:', e);
  }
}

export const UserService = {
  /**
   * Real-time subscription to all registered users (for Admin Dashboard)
   */
  subscribeAllUsers(
    onUpdate: (users: UserProfile[]) => void,
    onError?: (err: any) => void
  ): Unsubscribe {
    try {
      const usersRef = collection(db, 'users');
      const unsubscribe = onSnapshot(
        usersRef,
        (snapshot) => {
          const list: UserProfile[] = [];
          snapshot.forEach((d) => {
            const data = d.data();
            const rawRole = data.role;
            let role: UserRole = 'client';
            if (rawRole === 'admin') role = 'admin';
            else if (rawRole === 'practitioner' || data.isPractitioner === true) role = 'practitioner';
            else if (data.admin === true || data.isAdmin === true) role = 'admin';

            const isStaff = role === 'admin' || role === 'practitioner';

            list.push({
              userId: d.id,
              email: data.email || '',
              displayName: data.displayName || 'Compte',
              photoURL: data.photoURL || '',
              phone: data.phone || '',
              role,
              admin: isStaff,
              isAdmin: isStaff,
              isPractitioner: role === 'practitioner',
              specialties: Array.isArray(data.specialties) ? data.specialties : [],
              bio: data.bio || '',
              experience: data.experience || '',
              emailVerified: Boolean(data.emailVerified),
              createdAt: data.createdAt || new Date().toISOString(),
              updatedAt: data.updatedAt
            });
          });

          // Sort by creation date descending
          list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

          saveLocalUsers(list);
          onUpdate(list);
        },
        (error) => {
          console.warn('Users listener fallback to local:', error);
          if (onError) onError(error);
          onUpdate(getLocalUsers());
        }
      );

      return unsubscribe;
    } catch (e) {
      console.warn('Error subscribing users:', e);
      onUpdate(getLocalUsers());
      return () => {};
    }
  },

  /**
   * Real-time subscription to promoted practitioners (available for public and bookings)
   */
  subscribePractitioners(
    onUpdate: (practitioners: UserProfile[]) => void,
    onError?: (err: any) => void
  ): Unsubscribe {
    try {
      const q = query(collection(db, 'users'), where('role', '==', 'practitioner'));
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const list: UserProfile[] = [];
          snapshot.forEach((d) => {
            const data = d.data();
            list.push({
              userId: d.id,
              email: data.email || '',
              displayName: data.displayName || data.email?.split('@')[0] || 'Praticienne',
              photoURL: data.photoURL || '',
              phone: data.phone || '',
              role: 'practitioner',
              admin: true,
              isAdmin: true,
              isPractitioner: true,
              specialties: Array.isArray(data.specialties) ? data.specialties : ['Soins Visage', 'Massages & Bien-être'],
              bio: data.bio || "Praticienne diplômée de l'institut, à votre écoute pour un moment de bien-être sur-mesure.",
              experience: data.experience || 'Praticienne certifiée',
              emailVerified: Boolean(data.emailVerified),
              createdAt: data.createdAt,
              updatedAt: data.updatedAt
            });
          });

          list.sort((a, b) => (a.displayName || '').localeCompare(b.displayName || ''));
          saveLocalPractitioners(list);
          onUpdate(list);
        },
        (error) => {
          console.warn('Practitioners listener notice:', error);
          if (onError) onError(error);
          onUpdate(getLocalPractitioners());
        }
      );

      return unsubscribe;
    } catch (e) {
      console.warn('Error subscribing practitioners:', e);
      onUpdate(getLocalPractitioners());
      return () => {};
    }
  },

  /**
   * Set user role in Firestore ('client' | 'practitioner' | 'admin')
   */
  async setUserRole(userId: string, newRole: UserRole): Promise<void> {
    const now = new Date().toISOString();
    const isStaff = newRole === 'admin' || newRole === 'practitioner';
    const payload = {
      role: newRole,
      admin: isStaff,
      isAdmin: isStaff,
      isPractitioner: newRole === 'practitioner',
      updatedAt: now
    };

    try {
      const userRef = doc(db, 'users', userId);
      await setDoc(userRef, payload, { merge: true });
    } catch (err) {
      console.warn('Notice saving user role to Firestore:', err);
      handleFirestoreError(err, OperationType.UPDATE, `users/${userId}`);
    }

    // Update local users cache
    const current = getLocalUsers();
    const updated: UserProfile[] = current.map(u => u.userId === userId ? { ...u, ...payload } : u);
    saveLocalUsers(updated);

    // Update local practitioners cache
    const practitioners = updated.filter(u => u.role === 'practitioner');
    saveLocalPractitioners(practitioners);
  },

  /**
   * Backward-compatible alias
   */
  async setAdminStatus(userId: string, makeAdmin: boolean): Promise<void> {
    return this.setUserRole(userId, makeAdmin ? 'admin' : 'client');
  }
};
