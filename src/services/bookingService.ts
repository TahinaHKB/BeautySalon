import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  getDocs,
  Unsubscribe 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, auth } from '../firebase/config';
import { Booking } from '../types/salon';

const LOCAL_STORAGE_BOOKINGS_KEY = 'salon_un_moment_pour_soi_bookings';

function getLocalBookings(): Booking[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_BOOKINGS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalBookings(bookings: Booking[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_BOOKINGS_KEY, JSON.stringify(bookings));
  } catch (e) {
    console.error('Failed to save to localStorage', e);
  }
}

export const BookingService = {
  /**
   * Create a new booking
   */
  async createBooking(bookingData: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>): Promise<Booking> {
    const bookingId = 'bk_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6);
    const now = new Date().toISOString();

    const newBooking: Booking = {
      ...bookingData,
      id: bookingId,
      createdAt: now,
      updatedAt: now,
    };

    // If real Firebase Auth user is present, write directly to Firestore
    if (auth.currentUser) {
      try {
        const bookingRef = doc(db, 'bookings', bookingId);
        await setDoc(bookingRef, {
          userId: newBooking.userId,
          customerName: newBooking.customerName,
          customerEmail: newBooking.customerEmail || '',
          customerPhone: newBooking.customerPhone || '',
          serviceId: newBooking.serviceId,
          serviceTitle: newBooking.serviceTitle,
          serviceCategory: newBooking.serviceCategory,
          durationMinutes: newBooking.durationMinutes,
          price: newBooking.price,
          date: newBooking.date,
          timeSlot: newBooking.timeSlot,
          practitioner: newBooking.practitioner,
          notes: newBooking.notes || '',
          status: newBooking.status,
          paymentStatus: newBooking.paymentStatus,
          paymentMethod: newBooking.paymentMethod,
          paymentTransactionId: newBooking.paymentTransactionId,
          createdAt: newBooking.createdAt,
          updatedAt: newBooking.updatedAt,
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, `bookings/${bookingId}`);
      }
    }

    // Always mirror to local storage for instant offline availability & demo testing
    const existing = getLocalBookings();
    saveLocalBookings([newBooking, ...existing]);

    return newBooking;
  },

  /**
   * Listen to bookings for a user (real-time via Firestore when authenticated)
   */
  subscribeUserBookings(
    userId: string, 
    onUpdate: (bookings: Booking[]) => void,
    onError?: (err: Error) => void
  ): Unsubscribe {
    // If authenticated in Firebase, listen to Firestore query
    if (auth.currentUser && auth.currentUser.uid === userId) {
      const bookingsRef = collection(db, 'bookings');
      const q = query(
        bookingsRef,
        where('userId', '==', userId)
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const list: Booking[] = [];
          snapshot.forEach((d) => {
            const data = d.data();
            list.push({
              id: d.id,
              userId: data.userId,
              customerName: data.customerName,
              customerEmail: data.customerEmail,
              customerPhone: data.customerPhone,
              serviceId: data.serviceId,
              serviceTitle: data.serviceTitle,
              serviceCategory: data.serviceCategory,
              durationMinutes: data.durationMinutes,
              price: data.price,
              date: data.date,
              timeSlot: data.timeSlot,
              practitioner: data.practitioner,
              notes: data.notes,
              status: data.status,
              cancellationReason: data.cancellationReason,
              paymentStatus: data.paymentStatus,
              paymentMethod: data.paymentMethod,
              paymentTransactionId: data.paymentTransactionId,
              createdAt: data.createdAt,
              updatedAt: data.updatedAt,
            });
          });
          // Sort by date desc
          list.sort((a, b) => new Date(b.date + 'T' + b.timeSlot).getTime() - new Date(a.date + 'T' + a.timeSlot).getTime());
          onUpdate(list);
        },
        (error) => {
          console.error('Snapshot error for bookings:', error);
          if (onError) onError(error);
          handleFirestoreError(error, OperationType.GET, 'bookings');
        }
      );

      return unsubscribe;
    }

    // Fallback for demo accounts or non-Google user
    const emitLocal = () => {
      const local = getLocalBookings().filter(b => b.userId === userId);
      local.sort((a, b) => new Date(b.date + 'T' + b.timeSlot).getTime() - new Date(a.date + 'T' + a.timeSlot).getTime());
      onUpdate(local);
    };

    emitLocal();
    const interval = setInterval(emitLocal, 1500);
    return () => clearInterval(interval);
  },

  /**
   * Cancel an appointment
   */
  async cancelBooking(bookingId: string, reason: string): Promise<void> {
    const now = new Date().toISOString();

    if (auth.currentUser) {
      try {
        const bookingRef = doc(db, 'bookings', bookingId);
        await updateDoc(bookingRef, {
          status: 'cancelled',
          cancellationReason: reason.trim() || 'Annulé par le client',
          updatedAt: now
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `bookings/${bookingId}`);
      }
    }

    // Update local cache
    const current = getLocalBookings();
    const updated = current.map(b => {
      if (b.id === bookingId) {
        return {
          ...b,
          status: 'cancelled' as const,
          cancellationReason: reason.trim() || 'Annulé par le client',
          updatedAt: now,
          paymentStatus: 'refunded' as const // Salon policy: automatic refund/voucher
        };
      }
      return b;
    });
    saveLocalBookings(updated);
  },

  /**
   * Reschedule an appointment
   */
  async rescheduleBooking(bookingId: string, newDate: string, newTimeSlot: string, notes?: string): Promise<void> {
    const now = new Date().toISOString();

    if (auth.currentUser) {
      try {
        const bookingRef = doc(db, 'bookings', bookingId);
        const updatePayload: Record<string, any> = {
          date: newDate,
          timeSlot: newTimeSlot,
          updatedAt: now
        };
        if (notes !== undefined) {
          updatePayload.notes = notes;
        }
        await updateDoc(bookingRef, updatePayload);
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `bookings/${bookingId}`);
      }
    }

    const current = getLocalBookings();
    const updated = current.map(b => {
      if (b.id === bookingId) {
        return {
          ...b,
          date: newDate,
          timeSlot: newTimeSlot,
          notes: notes !== undefined ? notes : b.notes,
          updatedAt: now
        };
      }
      return b;
    });
    saveLocalBookings(updated);
  }
};
