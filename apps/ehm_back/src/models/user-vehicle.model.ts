export interface UserVehicle {
  id?: string;
  userId: string;
  brand: string;
  model: string;
  year: number;
  mileage: number;
  purchaseDate: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}
