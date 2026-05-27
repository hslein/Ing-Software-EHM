export interface Favorite {
  id?: string;
  userId?: string;
  vehicleId?: string;
  createdAt?: Date;
  syncedToWarehouse?: boolean;
}