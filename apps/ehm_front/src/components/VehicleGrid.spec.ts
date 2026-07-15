// @vitest-environment jsdom
import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import VehicleGrid from './VehicleGrid.vue';

vi.mock('lucide-vue-next', () => ({
  Heart: { name: 'Heart', template: '<svg />' },
}));

vi.mock('../i18n', () => ({
  useI18n: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'common.notAvailable': 'N/A',
        'vehicles.emptyForBrand': 'No vehicles',
        'vehicles.selectedAction': 'Selected',
        'vehicles.compare': 'Compare',
        'vehicles.removeFavorite': 'Remove favorite',
        'vehicles.addFavorite': 'Add favorite',
        'vehicles.spec.displacement': 'Displacement',
        'vehicles.spec.engineType': 'Engine type',
        'vehicles.spec.valves': 'Valves',
        'vehicles.spec.fuel': 'Fuel type',
        'vehicles.spec.drivetrain': 'Drivetrain',
        'vehicles.spec.consumption': 'Average consumption',
        'vehicles.spec.wheels': 'Wheel size',
        'vehicles.spec.versions': 'Available versions',
        'vehicles.viewDetails': 'View Details',
        'vehicles.quote': 'Quote',
      };

      return translations[key] ?? key;
    },
  }),
}));

describe('VehicleGrid', () => {
  const vehicle = {
    id: 'veh-1',
    model: 'Model X',
    brand: 'Test Brand',
    type: 'sedan',
    image: 'https://example.com/vehicle.png',
    description: 'A great vehicle',
    price: 12000000,
    displacement: '2.0L',
    engineType: 'Hybrid',
    fuelType: 'Gasoline',
    drivetrain: 'AWD',
    fuelConsumption: '12 km/L',
    wheelSize: '18"',
    versions: ['Base'],
  };

  it('hides technical specs by default in the catalog card', () => {
    const wrapper = mount(VehicleGrid, {
      props: {
        brandName: 'Test Brand',
        selectedCompareIds: [],
        vehicles: [vehicle],
      },
    });

    expect(wrapper.find('.spec-grid').exists()).toBe(false);
  });

  it('shows technical specs when explicitly enabled', () => {
    const wrapper = mount(VehicleGrid, {
      props: {
        brandName: 'Test Brand',
        selectedCompareIds: [],
        vehicles: [vehicle],
        showSpecs: true,
      },
    });

    expect(wrapper.find('.spec-grid').exists()).toBe(true);
  });
});
