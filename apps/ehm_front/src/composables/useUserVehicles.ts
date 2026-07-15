import { ref, computed } from 'vue';
import { auth } from '../config/firebase';

export interface UserVehicle {
  id?: string;
  userId: string;
  brand: string;
  model: string;
  year: number;
  mileage: number;
  purchaseDate: string;
  createdAt?: string;
}

export interface CreateUserVehiclePayload {
  brand: string;
  model: string;
  year: number;
  mileage: number;
  purchaseDate: string;
}

const userVehicles = ref<UserVehicle[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api';

const authFetch = async (path: string, options: RequestInit = {}) => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User is not authenticated');
  }

  const token = await user.getIdToken();
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers ?? {}),
    },
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(text || response.statusText);
  }

  return text ? JSON.parse(text) : null;
};

export const useUserVehicles = () => {
  const fetchMyVehicles = async () => {
    loading.value = true;
    error.value = null;

    try {
      const result = (await authFetch('/my-vehicles')) as UserVehicle[];
      userVehicles.value = result;
      return result;
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Failed to load vehicles';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const registerVehicle = async (payload: CreateUserVehiclePayload) => {
    loading.value = true;
    error.value = null;

    try {
      const created = (await authFetch('/my-vehicles', {
        method: 'POST',
        body: JSON.stringify(payload),
      })) as UserVehicle;

      userVehicles.value = [...userVehicles.value, created];
      return created;
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Failed to register vehicle';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteVehicle = async (id: string) => {
    error.value = null;

    try {
      await authFetch(`/my-vehicles/${encodeURIComponent(id)}`, { method: 'DELETE' });
      userVehicles.value = userVehicles.value.filter((vehicle) => vehicle.id !== id);
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Failed to delete vehicle';
      throw err;
    }
  };

  return {
    userVehicles: computed(() => userVehicles.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    fetchMyVehicles,
    registerVehicle,
    deleteVehicle,
  };
};
