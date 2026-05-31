import { ref } from 'vue';
import { useAuth } from './useAuth';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api';

export interface AdminSummary {
  totalUsers: number;
  totalBrands: number;
  totalVehicles: number;
  totalViews: number;
  totalFavorites: number;
  totalComparisons: number;
  totalCreditSimulations: number;
  topBrand: string | null;
  topVehicle: string | null;
}

export interface BrandPopularity {
  brandKey: number;
  brandName: string;
  totalViews: number;
  totalComparisons: number;
  totalFavorites: number;
  totalCreditSimulations: number;
  popularityScore: string | number;
}

export interface VehiclePopularity {
  vehicleKey: number;
  brandKey: number | null;
  model: string;
  brandName: string | null;
  type: string | null;
  price: string | number | null;
  totalViews: number;
  totalComparisons: number;
  totalFavorites: number;
  totalCreditSimulations: number;
  popularityScore: string | number;
}

export interface InteractionsOverTime {
  date: string;
  totalViews: number;
  totalFavorites: number;
  totalComparisons: number;
  totalCreditSimulations: number;
}

export interface VehicleTypePreference {
  type: string;
  totalViews: number;
  totalComparisons: number;
  totalFavorites: number;
  totalCreditSimulations: number;
  popularityScore: string | number;
}

export interface CreditSimulationStats {
  totalSimulations: number;
  averageVehiclePrice: string | number;
  averageDownPayment: string | number;
  averageFinancedAmount: string | number;
  averageMonthlyPayment: string | number;
  byBrand: Array<{
    brandName: string;
    totalSimulations: number;
    averageFinancedAmount: string | number;
  }>;
  byVehicle: Array<{
    model: string;
    brandName: string | null;
    totalSimulations: number;
    averageMonthlyPayment: string | number;
  }>;
}

export interface UserActivity {
  userKey: number;
  name: string | null;
  email: string | null;
  totalViews: number;
  totalFavorites: number;
  totalComparisons: number;
  totalCreditSimulations: number;
  lastInteractionDate: string | null;
}

export interface WarehouseStatus {
  lastRunAt: string | null;
  lastStatus: 'success' | 'error' | 'never_run';
  lastProcessedEvents: number;
  lastError: string | null;
}

export interface DashboardData {
  summary: AdminSummary;
  brandPopularity: BrandPopularity[];
  vehiclePopularity: VehiclePopularity[];
  creditSimulations: CreditSimulationStats;
  interactionsOverTime: InteractionsOverTime[];
  vehicleTypePreferences: VehicleTypePreference[];
  userActivity: UserActivity[];
  warehouseStatus: WarehouseStatus;
}

export interface InteractionFilters {
  brandKey?: number | null;
  vehicleKey?: number | null;
}

export const useAdminDashboard = () => {
  const { getIdToken } = useAuth();
  const loading = ref(false);
  const refreshingWarehouse = ref(false);
  const error = ref<string | null>(null);

  const authHeaders = async () => {
    const token = await getIdToken();
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  };

  const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
    const headers = await authHeaders();
    const response = await fetch(`${apiBaseUrl}${path}`, {
      ...init,
      headers: {
        ...headers,
        ...(init?.headers ?? {}),
      },
    });

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status} ${response.statusText}`);
    }

    return (await response.json()) as T;
  };

  const loadDashboard = async (): Promise<DashboardData | null> => {
    loading.value = true;
    error.value = null;

    try {
      const [
        summary,
        brandPopularity,
        vehiclePopularity,
        creditSimulations,
        interactionsOverTime,
        vehicleTypePreferences,
        userActivity,
        warehouseStatus,
      ] = await Promise.all([
        request<AdminSummary>('/admin/stats/summary'),
        request<BrandPopularity[]>('/admin/stats/brand-popularity'),
        request<VehiclePopularity[]>('/admin/stats/vehicle-popularity'),
        request<CreditSimulationStats>('/admin/stats/credit-simulations'),
        request<InteractionsOverTime[]>('/admin/stats/interactions-over-time'),
        request<VehicleTypePreference[]>('/admin/stats/vehicle-type-preferences'),
        request<UserActivity[]>('/admin/stats/user-activity'),
        request<WarehouseStatus>('/admin/warehouse/status'),
      ]);

      return {
        summary,
        brandPopularity,
        vehiclePopularity,
        creditSimulations,
        interactionsOverTime,
        vehicleTypePreferences,
        userActivity,
        warehouseStatus,
      };
    } catch (err: any) {
      error.value = err.message ?? 'Failed to load dashboard data';
      return null;
    } finally {
      loading.value = false;
    }
  };

  const loadInteractionsOverTime = async (filters: InteractionFilters = {}) => {
    const params = new URLSearchParams();

    if (filters.brandKey) {
      params.set('brandKey', String(filters.brandKey));
    }

    if (filters.vehicleKey) {
      params.set('vehicleKey', String(filters.vehicleKey));
    }

    const query = params.toString();
    return request<InteractionsOverTime[]>(
      `/admin/stats/interactions-over-time${query ? `?${query}` : ''}`,
    );
  };

  const runWarehouseEtl = async () => {
    refreshingWarehouse.value = true;
    error.value = null;

    try {
      return await request('/admin/warehouse/run-etl', { method: 'POST' });
    } catch (err: any) {
      error.value = err.message ?? 'Failed to run warehouse refresh';
      throw err;
    } finally {
      refreshingWarehouse.value = false;
    }
  };

  return {
    loadDashboard,
    loadInteractionsOverTime,
    runWarehouseEtl,
    loading,
    refreshingWarehouse,
    error,
  };
};
