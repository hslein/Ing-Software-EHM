export interface CreditSimulation {
  id?: string;
  userId: string;
  vehicleId: string;
  vehiclePrice: number;
  downPayment: number;
  amountFinanced: number;
  termMonths: number;
  interestRate: number;
  estimatedMonthlyPayment: number;
  simulatedAt?: unknown;
  syncedToWarehouse?: boolean;
  syncedAt?: unknown;
}