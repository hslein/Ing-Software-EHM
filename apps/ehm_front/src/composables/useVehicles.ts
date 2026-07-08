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
  fuelType?: string;
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

const getAuthHeaders = async () => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User is not authenticated');
  }

  const token = await user.getIdToken();
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

const apiFetch = async (path: string, options: RequestInit = {}) => {
  const headers = await getAuthHeaders();
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers: { ...headers, ...(options.headers ?? {}) },
  });
  const text = await response.text();

  if (!response.ok) {
    throw new Error(text || response.statusText);
  }

  return text ? JSON.parse(text) : null;
};

export const useVehicles = () => {
  // Fetch all vehicles
  const fetchVehicles = async () => {
    loading.value = true;
    error.value = null;
    try {
      const result = (await apiFetch('/vehicles')) as Vehicle[];
      vehicles.value = result;
    } catch (err: any) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  };

  // Fetch vehicles by brand
  const fetchVehiclesByBrand = async (brandId: string) => {
    loading.value = true;
    error.value = null;
    try {
      const result = (await apiFetch(`/vehicles?brandId=${encodeURIComponent(brandId)}`)) as Vehicle[];
      vehicles.value = result;
      return result;
    } catch (err: any) {
      error.value = err.message;
      vehicles.value = [];
      return [];
    } finally {
      loading.value = false;
    }
  };

  const fetchVehicleById = async (vehicleId: string) => {
    error.value = null;
    const result = (await apiFetch(`/vehicles/${encodeURIComponent(vehicleId)}`)) as Vehicle;
    return result;
  };

  // Fetch brands with their vehicles
  const fetchBrands = async () => {
    loading.value = true;
    error.value = null;
    try {
      const result = (await apiFetch('/brands')) as Brand[];
      brands.value = result;
      return result;
    } catch (err: any) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Real-time subscriptions are not supported through the backend API yet.
  const subscribeToVehicles = (callback?: (vehicles: Vehicle[]) => void) => {
    console.warn('Real-time vehicle subscriptions are not supported by the backend API.');
    if (callback) callback(vehicles.value);
    return () => {};
  };

  // Add a new vehicle
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
    } catch (err: any) {
      error.value = err.message;
      throw err;
    }
  };

  // Update a vehicle
  const updateVehicle = async (id: string, vehicle: Partial<Vehicle>) => {
    error.value = null;
    try {
      await apiFetch(`/vehicles/${encodeURIComponent(id)}`, {
        method: 'PUT',
        body: JSON.stringify(vehicle),
      });
    } catch (err: any) {
      error.value = err.message;
      throw err;
    }
  };

  // Delete a vehicle
  const deleteVehicle = async (id: string) => {
    error.value = null;
    try {
      await apiFetch(`/vehicles/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
    } catch (err: any) {
      error.value = err.message;
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
    } catch (err: any) {
      setVehicleFavoriteState(vehicle.id, previousFavoriteState);
      error.value = err.message;
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
    fetchVehiclesByBrand,
    fetchBrands,
    subscribeToVehicles,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    toggleFavorite,
  };
};
