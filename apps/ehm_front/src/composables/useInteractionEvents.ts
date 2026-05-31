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

const postEvent = async (path: string, payload: Record<string, unknown>) => {
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

export const useInteractionEvents = () => {
  const trackVehicleView = (vehicleId: string) =>
    postEvent('/events/vehicle-views', { vehicleId });

  const trackVehicleComparison = (firstVehicleId: string, secondVehicleId: string) =>
    postEvent('/events/vehicle-comparisons', { firstVehicleId, secondVehicleId });

  const trackCreditSimulation = (event: CreditSimulationEvent) =>
    postEvent('/events/credit-simulations', event);

  return {
    trackVehicleView,
    trackVehicleComparison,
    trackCreditSimulation,
  };
};
