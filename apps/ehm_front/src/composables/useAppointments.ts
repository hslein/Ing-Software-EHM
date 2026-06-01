import { ref, computed } from 'vue';
import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  runTransaction,
  serverTimestamp,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './useAuth';
import { generateAvailableSlots, type TimeSlot } from '../utils/appointmentSlots';

export interface AppointmentForm {
  slotId: string;
  marca: string;
  modelo: string;
  motivo: string;
}

export interface Appointment extends AppointmentForm {
  id?: string;
  userId: string;
  userEmail: string;
  scheduledAt: Date;
  createdAt?: Date;
}

const bookedSlotIds = ref<Set<string>>(new Set());
const loading = ref(false);
const error = ref<string | null>(null);
const showScheduleModal = ref(false);

let unsubscribeBooked: Unsubscribe | null = null;

export const useAppointments = () => {
  const { currentUser } = useAuth();

  const subscribeToBookedSlots = () => {
    if (unsubscribeBooked) return;

    unsubscribeBooked = onSnapshot(
      collection(db, 'bookedSlots'),
      (snapshot) => {
        bookedSlotIds.value = new Set(snapshot.docs.map((d) => d.id));
      },
      (err) => {
        console.error('Failed to subscribe to booked slots:', err);
        error.value = err.message;
      }
    );
  };

  const unsubscribeFromBookedSlots = () => {
    if (unsubscribeBooked) {
      unsubscribeBooked();
      unsubscribeBooked = null;
    }
  };

  const fetchBookedSlotIds = async () => {
    loading.value = true;
    error.value = null;
    try {
      const snapshot = await getDocs(collection(db, 'bookedSlots'));
      bookedSlotIds.value = new Set(snapshot.docs.map((d) => d.id));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      error.value = message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const getAvailableSlots = (locale = 'es-CO'): TimeSlot[] => {
    return generateAvailableSlots(14, locale).filter(
      (slot) => !bookedSlotIds.value.has(slot.id)
    );
  };

  const openScheduleModal = () => {
    showScheduleModal.value = true;
    subscribeToBookedSlots();
  };

  const closeScheduleModal = () => {
    showScheduleModal.value = false;
  };

  const bookAppointment = async (form: AppointmentForm): Promise<void> => {
    const user = currentUser.value;
    if (!user) {
      throw new Error('AUTH_REQUIRED');
    }

    loading.value = true;
    error.value = null;

    try {
      await runTransaction(db, async (transaction) => {
        const slotRef = doc(db, 'bookedSlots', form.slotId);
        const slotDoc = await transaction.get(slotRef);

        if (slotDoc.exists()) {
          throw new Error('SLOT_TAKEN');
        }

        const appointmentRef = doc(collection(db, 'appointments'));
        const scheduledAt = parseSlotId(form.slotId);

        transaction.set(slotRef, {
          userId: user.uid,
          appointmentId: appointmentRef.id,
          bookedAt: serverTimestamp(),
        });

        transaction.set(appointmentRef, {
          userId: user.uid,
          userEmail: user.email ?? '',
          slotId: form.slotId,
          marca: form.marca.trim(),
          modelo: form.modelo.trim(),
          motivo: form.motivo.trim(),
          scheduledAt,
          createdAt: serverTimestamp(),
        });
      });

      bookedSlotIds.value = new Set([...bookedSlotIds.value, form.slotId]);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      error.value = message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    bookedSlotIds: computed(() => bookedSlotIds.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    showScheduleModal: computed(() => showScheduleModal.value),
    subscribeToBookedSlots,
    unsubscribeFromBookedSlots,
    fetchBookedSlotIds,
    getAvailableSlots,
    openScheduleModal,
    closeScheduleModal,
    bookAppointment,
  };
};

function parseSlotId(slotId: string): Date {
  const [datePart, timePart] = slotId.split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hour] = timePart.split(':').map(Number);
  return new Date(year, month - 1, day, hour, 0, 0);
}
