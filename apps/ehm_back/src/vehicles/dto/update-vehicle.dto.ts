export class UpdateVehicleDto {
  model?: string;
  type?: 'suv' | 'sedan' | 'deportivo' | 'pickup';
  image?: string;
  description?: string;
  brandId?: string;
  price?: number;
  year?: number;
  mileage?: number;
}
