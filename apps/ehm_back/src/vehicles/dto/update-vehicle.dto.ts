export class UpdateVehicleDto {
  model?: string;
  type?: 'suv' | 'sedan' | 'deportivo' | 'pickup';
  image?: string;
  description?: string;
  brand?: string;
  price?: number;
  year?: number;
  mileage?: number;
}
