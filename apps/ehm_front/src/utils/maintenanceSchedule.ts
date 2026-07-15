const MAINTENANCE_INTERVAL_KM = 2500;

export interface MaintenanceVisit {
  targetMileage: number;
  kilometersRemaining: number;
  estimatedDate?: string;
}

const parsePurchaseDate = (purchaseDate?: string): Date | null => {
  if (!purchaseDate) return null;
  const date = new Date(purchaseDate);
  return Number.isFinite(date.getTime()) ? date : null;
};

const formatDate = (date: Date): string => {
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const getUpcomingMaintenanceVisits = (
  currentMileage: number,
  purchaseDate?: string,
  count = 5,
): MaintenanceVisit[] => {
  if (!Number.isFinite(currentMileage) || currentMileage < 0) {
    return [];
  }

  const firstTarget = Math.ceil((currentMileage + 1) / MAINTENANCE_INTERVAL_KM) * MAINTENANCE_INTERVAL_KM;
  const purchase = parsePurchaseDate(purchaseDate);

  let averageKmPerDay: number | null = null;
  if (purchase) {
    const daysSincePurchase = Math.max(1, (Date.now() - purchase.getTime()) / (1000 * 60 * 60 * 24));
    if (daysSincePurchase > 0) {
      averageKmPerDay = currentMileage / daysSincePurchase;
    }
  }

  return Array.from({ length: count }, (_, index) => {
    const targetMileage = firstTarget + index * MAINTENANCE_INTERVAL_KM;
    const kilometersRemaining = Math.max(targetMileage - currentMileage, 0);
    const estimatedDate =
      averageKmPerDay && averageKmPerDay > 0
        ? formatDate(new Date(Date.now() + (kilometersRemaining / averageKmPerDay) * 24 * 60 * 60 * 1000))
        : undefined;

    return {
      targetMileage,
      kilometersRemaining,
      estimatedDate,
    };
  });
};
