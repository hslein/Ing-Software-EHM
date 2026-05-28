export interface VehicleView {
  id?: string;
  userId: string;
  vehicleId: string;
  brandId?: string;
  viewedAt?: unknown;
  syncedToWarehouse?: boolean;
  syncedAt?: unknown;
}