import { auth } from '../config/firebase';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api';

interface CreditSimulationEvent {
  vehicleId: string;
  vehiclePrice: number;
  downPayment: number;
  amountFinanced: number;
  termMonths: number;
  interestRate: number;
  estimatedMonthlyPayment: number;
}

export interface CreditSimulation extends CreditSimulationEvent {
  id?: string;
  userId?: string;
  simulatedAt?: unknown;
  vehicle?: {
    id?: string;
    model: string;
    brandId?: string;
    brand?: string;
    image: string;
    description?: string;
    price?: number;
    year?: number | string;
    type?: string;
  } | null;
}

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

const postEvent = async (path: string, payload: object) => {
  const headers = await getAuthHeaders();
  const response = await fetch(`${apiBaseUrl}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || response.statusText);
  }

  return response.json();
};

const getEvent = async <T>(path: string) => {
  const headers = await getAuthHeaders();
  const response = await fetch(`${apiBaseUrl}${path}`, {
    headers,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || response.statusText);
  }

  return (await response.json()) as T;
};

export const useInteractionEvents = () => {
  const trackVehicleView = (vehicleId: string) =>
    postEvent('/events/vehicle-views', { vehicleId });

  const trackVehicleComparison = (firstVehicleId: string, secondVehicleId: string) =>
    postEvent('/events/vehicle-comparisons', { firstVehicleId, secondVehicleId });

  const trackCreditSimulation = (event: CreditSimulationEvent) =>
    postEvent('/events/credit-simulations', event);

  const fetchCreditSimulations = () =>
    getEvent<CreditSimulation[]>('/events/credit-simulations');

  return {
    trackVehicleView,
    trackVehicleComparison,
    trackCreditSimulation,
    fetchCreditSimulations,
  };
};
