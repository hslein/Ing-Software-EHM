export interface Favorite {
  id?: string;
  userId: string;
  vehicleId: string;
  createdAt?: unknown;
  syncedToWarehouse?: boolean;
  syncedAt?: unknown;
}