export interface Vehicle {
  id?: string;
  model: string;
  brandId: string;
  type: 'suv' | 'sedan' | 'deportivo' | 'pickup';
  image: string;
  description: string;
  price?: number;
  year?: number;
  mileage?: number;
  fuelType?: string;
  transmission?: string;
  seats?: number;
  engine?: string;
  isFavorite?: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
}
