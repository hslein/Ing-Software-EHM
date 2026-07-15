export interface Vehicle {
  id?: string;
  model: string;
  brandId: string;
  type: 'suv' | 'sedan' | 'deportivo' | 'pickup';
  image: string;
  description: string;
  brand?: string;
  price?: number;
  year?: number;
  mileage?: number;
  fuelType?: string;
  transmission?: string;
  seats?: number;
  engine?: string;
  engineType?: string;
  displacement?: string;
  valveCount?: number;
  drivetrain?: string;
  fuelConsumption?: string;
  wheelSize?: string;
  versions?: string[];
  isFavorite?: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
}
