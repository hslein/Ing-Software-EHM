export interface VehicleComparison {
  id?: string;

  userId: string;

  firstVehicleId: string;
  secondVehicleId: string;

  comparedAt?: unknown;

  syncedToWarehouse?: boolean;
  syncedAt?: unknown;
}