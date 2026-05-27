export interface VehicleView {
  id?: string;
  userId: string;
  vehicleId: string;
  brand?: string;
  viewedAt?: unknown;
  syncedToWarehouse?: boolean;
  syncedAt?: unknown;
}