import { ref, computed } from 'vue';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../config/firebase';

export type VehicleType = 'suv' | 'sedan' | 'deportivo' | 'pickup';

export interface Vehicle {
  id?: string;
  model: string;
  type: VehicleType;
  image: string;
  description: string;
  brand: string;
  price?: number;
  year?: number;
  mileage?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Brand {
  id?: string;
  name: string;
  image: string;
  vehicles?: Vehicle[];
  createdAt?: Date;
  updatedAt?: Date;
}

const vehicles = ref<Vehicle[]>([]);
const brands = ref<Brand[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

export const useVehicles = () => {
  // Fetch all vehicles
  const fetchVehicles = async () => {
    loading.value = true;
    error.value = null;
    try {
      const q = query(collection(db, 'vehicles'));
      const querySnapshot = await getDocs(q);
      vehicles.value = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as Vehicle));
    } catch (err: any) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  };

  // Fetch vehicles by brand
  const fetchVehiclesByBrand = async (brandName: string) => {
    loading.value = true;
    error.value = null;
    try {
      const q = query(collection(db, 'vehicles'), where('brand', '==', brandName));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as Vehicle));
    } catch (err: any) {
      error.value = err.message;
      return [];
    } finally {
      loading.value = false;
    }
  };

  // Fetch brands with their vehicles
  const fetchBrands = async () => {
    loading.value = true;
    error.value = null;
    try {
      const brandsQuery = query(collection(db, 'brands'));
      const brandsSnapshot = await getDocs(brandsQuery);

      const brandsList = await Promise.all(
        brandsSnapshot.docs.map(async (doc) => {
          const brandData = doc.data() as Brand;
          const vehiclesQuery = query(
            collection(db, 'vehicles'),
            where('brand', '==', brandData.name)
          );
          const vehiclesSnapshot = await getDocs(vehiclesQuery);

          return {
            id: doc.id,
            ...brandData,
            vehicles: vehiclesSnapshot.docs.map((vDoc) => ({
              id: vDoc.id,
              ...vDoc.data(),
            })) as Vehicle[],
          };
        })
      );

      brands.value = brandsList;
      return brandsList;
    } catch (err: any) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Subscribe to real-time vehicle updates
  const subscribeToVehicles = (callback?: (vehicles: Vehicle[]) => void) => {
    try {
      const q = query(collection(db, 'vehicles'));
      return onSnapshot(q, (querySnapshot) => {
        vehicles.value = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        } as Vehicle));
        if (callback && typeof callback === 'function') {
          callback(vehicles.value);
        }
      });
    } catch (err: any) {
      error.value = err.message;
      return () => {}; // Return no-op unsubscribe function
    }
  };

  // Add a new vehicle
  const addVehicle = async (vehicle: Vehicle) => {
    error.value = null;
    try {
      const docRef = await addDoc(collection(db, 'vehicles'), {
        ...vehicle,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      return docRef.id;
    } catch (err: any) {
      error.value = err.message;
      throw err;
    }
  };

  // Update a vehicle
  const updateVehicle = async (id: string, vehicle: Partial<Vehicle>) => {
    error.value = null;
    try {
      const vehicleRef = doc(db, 'vehicles', id);
      await updateDoc(vehicleRef, {
        ...vehicle,
        updatedAt: new Date(),
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
      await deleteDoc(doc(db, 'vehicles', id));
    } catch (err: any) {
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
    fetchVehiclesByBrand,
    fetchBrands,
    subscribeToVehicles,
    addVehicle,
    updateVehicle,
    deleteVehicle,
  };
};
