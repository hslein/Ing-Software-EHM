export interface VehicleComparison {
  id?: string;
  userId: string;
  vehicleIds: string[];
  comparedAt?: unknown;
  syncedToWarehouse?: boolean;
  syncedAt?: unknown;
}