import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  onSnapshot, 
  query, 
  orderBy,
  Unsubscribe 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, auth } from '../firebase/config';
import { SalonService } from '../types/salon';

const LOCAL_SERVICES_KEY = 'salon_un_moment_pour_soi_firestore_services';

const CATEGORY_NAMES_FALLBACK: Record<string, string> = {
  visage: 'Soins Visage',
  massages: 'Massages & Corps',
  corps: 'Massages & Corps',
  regard: 'Cils & Regard',
  ongles: 'Onglerie & Spa',
  epilation: 'Épilations',
  rituels: 'Rituels Signature'
};

function getLocalServices(): SalonService[] {
  try {
    // Clear obsolete legacy key containing old default offers
    localStorage.removeItem('salon_un_moment_pour_soi_services');
    const raw = localStorage.getItem(LOCAL_SERVICES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalServices(services: SalonService[]) {
  try {
    localStorage.setItem(LOCAL_SERVICES_KEY, JSON.stringify(services));
  } catch (e) {
    console.warn('Notice saving local services:', e);
  }
}

export const ServiceManager = {
  /**
   * Listen to active services in real-time from Firestore exclusively
   */
  subscribeServices(
    onUpdate: (services: SalonService[]) => void,
    includeInactive: boolean = false
  ): Unsubscribe {
    try {
      const servicesRef = collection(db, 'services');
      const unsubscribe = onSnapshot(
        servicesRef,
        (snapshot) => {
          if (snapshot.empty) {
            saveLocalServices([]);
            onUpdate([]);
            return;
          }

          const list: SalonService[] = [];
          snapshot.forEach((d) => {
            const data = d.data();
            const cat = data.category || 'visage';
            const catName = data.categoryName || CATEGORY_NAMES_FALLBACK[cat] || 'Soins';
            
            let benefits: string[] = [];
            if (Array.isArray(data.benefits)) {
              benefits = data.benefits.filter(Boolean);
            } else if (typeof data.benefits === 'string' && data.benefits.trim()) {
              benefits = data.benefits.split(',').map((b: string) => b.trim()).filter(Boolean);
            }

            let protocol: string[] = [];
            if (Array.isArray(data.protocol)) {
              protocol = data.protocol.filter(Boolean);
            } else if (typeof data.protocol === 'string' && data.protocol.trim()) {
              protocol = data.protocol.split(',').map((p: string) => p.trim()).filter(Boolean);
            }

            list.push({
              id: d.id,
              title: data.title || data.name || 'Soin',
              subtitle: data.subtitle || '',
              category: cat,
              categoryName: catName,
              durationMinutes: Number(data.durationMinutes) || 60,
              price: Number(data.price) || 0,
              originalPrice: data.originalPrice ? Number(data.originalPrice) : undefined,
              description: data.description || data.desc || '',
              benefits,
              protocol,
              recommendedFor: data.recommendedFor || '',
              badge: data.badge || '',
              image: data.image || 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
              active: data.active !== false,
              createdAt: data.createdAt,
              updatedAt: data.updatedAt
            });
          });

          saveLocalServices(list);
          const filtered = includeInactive ? list : list.filter(s => s.active !== false);
          onUpdate(filtered);
        },
        (error) => {
          console.warn('Services snapshot listener notice:', error);
          const local = getLocalServices();
          onUpdate(includeInactive ? local : local.filter(s => s.active !== false));
        }
      );

      return unsubscribe;
    } catch (e) {
      const local = getLocalServices();
      onUpdate(includeInactive ? local : local.filter(s => s.active !== false));
      return () => {};
    }
  },

  /**
   * Helper to refresh services
   */
  async getServicesOnce(): Promise<SalonService[]> {
    try {
      const snap = await getDocs(collection(db, 'services'));
      const list: SalonService[] = [];
      snap.forEach((d) => {
        const data = d.data();
        list.push({
          id: d.id,
          title: data.title || data.name || 'Soin',
          subtitle: data.subtitle || '',
          category: data.category || 'visage',
          categoryName: data.categoryName || 'Soins',
          durationMinutes: Number(data.durationMinutes) || 60,
          price: Number(data.price) || 0,
          originalPrice: data.originalPrice ? Number(data.originalPrice) : undefined,
          description: data.description || '',
          benefits: Array.isArray(data.benefits) ? data.benefits : [],
          protocol: Array.isArray(data.protocol) ? data.protocol : [],
          recommendedFor: data.recommendedFor || '',
          badge: data.badge || '',
          image: data.image || 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
          active: data.active !== false,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt
        });
      });
      return list;
    } catch {
      return getLocalServices();
    }
  },

  /**
   * Create a new service (Admin only)
   */
  async createService(serviceData: Omit<SalonService, 'id' | 'createdAt' | 'updatedAt'>): Promise<SalonService> {
    const id = 'svc_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6);
    const now = new Date().toISOString();

    const newService: SalonService = {
      ...serviceData,
      id,
      active: serviceData.active !== false,
      createdAt: now,
      updatedAt: now,
    };

    if (auth.currentUser) {
      try {
        const ref = doc(db, 'services', id);
        await setDoc(ref, {
          title: newService.title,
          subtitle: newService.subtitle || '',
          category: newService.category,
          categoryName: newService.categoryName,
          durationMinutes: Number(newService.durationMinutes),
          price: Number(newService.price),
          originalPrice: newService.originalPrice ? Number(newService.originalPrice) : null,
          description: newService.description,
          benefits: newService.benefits || [],
          protocol: newService.protocol || [],
          recommendedFor: newService.recommendedFor || '',
          badge: newService.badge || '',
          image: newService.image,
          active: newService.active,
          createdAt: newService.createdAt,
          updatedAt: newService.updatedAt
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `services/${id}`);
      }
    }

    const current = getLocalServices();
    saveLocalServices([newService, ...current]);
    return newService;
  },

  /**
   * Update an existing service (Admin only)
   */
  async updateService(serviceId: string, updates: Partial<SalonService>): Promise<void> {
    const now = new Date().toISOString();

    if (auth.currentUser) {
      try {
        const ref = doc(db, 'services', serviceId);
        const payload: Record<string, any> = { updatedAt: now };
        if (updates.title !== undefined) payload.title = updates.title;
        if (updates.subtitle !== undefined) payload.subtitle = updates.subtitle;
        if (updates.category !== undefined) payload.category = updates.category;
        if (updates.categoryName !== undefined) payload.categoryName = updates.categoryName;
        if (updates.durationMinutes !== undefined) payload.durationMinutes = Number(updates.durationMinutes);
        if (updates.price !== undefined) payload.price = Number(updates.price);
        if (updates.originalPrice !== undefined) payload.originalPrice = updates.originalPrice ? Number(updates.originalPrice) : null;
        if (updates.description !== undefined) payload.description = updates.description;
        if (updates.benefits !== undefined) payload.benefits = updates.benefits;
        if (updates.protocol !== undefined) payload.protocol = updates.protocol;
        if (updates.recommendedFor !== undefined) payload.recommendedFor = updates.recommendedFor;
        if (updates.badge !== undefined) payload.badge = updates.badge;
        if (updates.image !== undefined) payload.image = updates.image;
        if (updates.active !== undefined) payload.active = updates.active;

        await updateDoc(ref, payload);
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `services/${serviceId}`);
      }
    }

    const current = getLocalServices();
    const updated = current.map(s => s.id === serviceId ? { ...s, ...updates, updatedAt: now } : s);
    saveLocalServices(updated);
  },

  /**
   * Delete a service (Admin only)
   */
  async deleteService(serviceId: string): Promise<void> {
    if (auth.currentUser) {
      try {
        const ref = doc(db, 'services', serviceId);
        await deleteDoc(ref);
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `services/${serviceId}`);
      }
    }

    const current = getLocalServices();
    saveLocalServices(current.filter(s => s.id !== serviceId));
  }
};
