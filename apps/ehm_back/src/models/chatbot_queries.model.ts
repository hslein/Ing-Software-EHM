export interface ChatbotQuery {
  id?: string;
  userId?: string;
  query?: string;
  response?: string;
  vehicleId?: string;
  createdAt?: Date;
  syncedToWarehouse?: boolean;
}