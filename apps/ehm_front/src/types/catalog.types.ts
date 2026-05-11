export type VehicleType = 'suv' | 'sedan' | 'deportivo' | 'pickup';

export type Vehicle = {
  id: string;
  model: string;
  type: VehicleType;
  image: string;
  description: string;
};

export type Brand = {
  name: string;
  image: string;
  vehicles: Vehicle[];
};

export type Highlight = {
  title: string;
  description: string;
  image: string;
};

export type MissionVision = {
  image: string;
  mission: string;
  vision: string;
};
