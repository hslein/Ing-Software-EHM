export class UpdateVehicleDto {
  model?: string;
  type?: 'suv' | 'sedan' | 'deportivo' | 'pickup';
  image?: string;
  description?: string;
  brandId?: string;
  price?: number;
  year?: number;
  mileage?: number;
  fuelType?: string;
  engine?: string;
  engineType?: string;
  displacement?: string;
  valveCount?: number;
  drivetrain?: string;
  fuelConsumption?: string;
  wheelSize?: string;
  versions?: string[];
}
