import { ref, computed } from 'vue';
import { auth } from '../config/firebase';

export type VehicleType = 'suv' | 'sedan' | 'deportivo' | 'pickup' | '';

export interface Vehicle {
  id?: string;
  model: string;
  brandId?: string;
  type: VehicleType;
  image: string;
  description: string;
  brand: string;
  price?: number;
  year?: number | string;
  mileage?: number | string;
  acceleration?: string;
  capacity?: string;
  engine?: string;
  engineType?: string;
  displacement?: string;
  valveCount?: number;
  fuelType?: string;
  drivetrain?: string;
  fuelConsumption?: string;
  wheelSize?: string;
  versions?: string[];
  horsepower?: string;
  seats?: string;
  topSpeed?: string;
  torque?: string;
  isFavorite?: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface Brand {
  id?: string;
  name: string;
  image: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

const vehicles = ref<Vehicle[]>([]);
const brands = ref<Brand[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api';

const buildHeaders = async (requireAuth: boolean) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    headers.Authorization = `Bearer ${token}`;
    return headers;
  }

  if (requireAuth) {
    throw new Error('User is not authenticated');
  }

  return headers;
};

const apiFetch = async (path: string, options: RequestInit = {}, requireAuth = true) => {
  const headers = await buildHeaders(requireAuth);
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers: { ...headers, ...(options.headers ?? {}) },
  });
  const text = await response.text();

  if (!response.ok) {
    throw new Error(`Request failed (${response.status}) ${path}: ${text || response.statusText}`);
  }

  try {
    return text ? JSON.parse(text) : null;
  } catch {
    throw new Error(`Invalid JSON response received from ${path}`);
  }
};

export const useVehicles = () => {
  const fetchVehicles = async () => {
    loading.value = true;
    error.value = null;
    try {
      const result = (await apiFetch('/vehicles', {}, false)) as Vehicle[];
      vehicles.value = result;
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Failed to load vehicles';
    } finally {
      loading.value = false;
    }
  };

  const fetchVehiclesByBrand = async (brandId: string) => {
    loading.value = true;
    error.value = null;
    try {
      const result = (await apiFetch(
        `/vehicles?brandId=${encodeURIComponent(brandId)}`,
        {},
        false,
      )) as Vehicle[];
      vehicles.value = result;
      return result;
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Failed to load vehicles';
      vehicles.value = [];
      return [];
    } finally {
      loading.value = false;
    }
  };

  const fetchVehicleById = async (vehicleId: string) => {
    error.value = null;
    return (await apiFetch(`/vehicles/${encodeURIComponent(vehicleId)}`, {}, false)) as Vehicle;
  };

  const fetchFavoriteVehicles = async () => {
    error.value = null;
    return (await apiFetch('/vehicles/favorites')) as Vehicle[];
  };

  const fetchBrands = async () => {
    loading.value = true;
    error.value = null;
    try {
      const result = (await apiFetch('/brands', {}, false)) as Brand[];
      brands.value = result;
      return result;
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Failed to load brands';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchPopularBrands = async (limit = 10) => {
    error.value = null;
    return (await apiFetch(
      `/brands/popular?limit=${encodeURIComponent(String(limit))}`,
      {},
      false,
    )) as Brand[];
  };

  const subscribeToVehicles = (callback?: (vehicles: Vehicle[]) => void) => {
    console.warn('Real-time vehicle subscriptions are not supported by the backend API.');
    if (callback) callback(vehicles.value);
    return () => {};
  };

  const addVehicle = async (vehicle: Vehicle) => {
    error.value = null;
    try {
      const payload = {
        model: vehicle.model,
        type: vehicle.type,
        image: vehicle.image,
        description: vehicle.description,
        brand: vehicle.brand,
        price: vehicle.price,
        year: vehicle.year,
        mileage: vehicle.mileage,
      };
      const result = (await apiFetch('/vehicles', {
        method: 'POST',
        body: JSON.stringify(payload),
      })) as { id: string };
      return result.id;
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Failed to add vehicle';
      throw err;
    }
  };

  const updateVehicle = async (id: string, vehicle: Partial<Vehicle>) => {
    error.value = null;
    try {
      await apiFetch(`/vehicles/${encodeURIComponent(id)}`, {
        method: 'PUT',
        body: JSON.stringify(vehicle),
      });
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Failed to update vehicle';
      throw err;
    }
  };

  const deleteVehicle = async (id: string) => {
    error.value = null;
    try {
      await apiFetch(`/vehicles/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Failed to delete vehicle';
      throw err;
    }
  };

  const setVehicleFavoriteState = (vehicleId: string, isFavorite: boolean) => {
    vehicles.value.forEach((vehicle) => {
      if (vehicle.id === vehicleId) {
        vehicle.isFavorite = isFavorite;
      }
    });

    vehicles.value = [...vehicles.value];
  };

  const toggleFavorite = async (vehicle: Vehicle) => {
    if (!vehicle.id) {
      throw new Error('Vehicle id is required');
    }

    const previousFavoriteState = Boolean(vehicle.isFavorite);
    const nextFavoriteState = !previousFavoriteState;
    setVehicleFavoriteState(vehicle.id, nextFavoriteState);
    error.value = null;

    try {
      const result = (await apiFetch(`/vehicles/${encodeURIComponent(vehicle.id)}/favorite`, {
        method: 'PUT',
        body: JSON.stringify({ favorite: nextFavoriteState }),
      })) as { vehicleId: string; isFavorite: boolean };
      setVehicleFavoriteState(result.vehicleId, result.isFavorite);
      return result;
    } catch (err: unknown) {
      setVehicleFavoriteState(vehicle.id, previousFavoriteState);
      error.value = err instanceof Error ? err.message : 'Failed to update favorite';
      throw err;
    }
  };

  return {
    vehicles: computed(() => vehicles.value),
    brands: computed(() => brands.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    fetchVehicles,
    fetchVehicleById,
    fetchFavoriteVehicles,
    fetchVehiclesByBrand,
    fetchBrands,
    fetchPopularBrands,
    subscribeToVehicles,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    toggleFavorite,
  };
};
