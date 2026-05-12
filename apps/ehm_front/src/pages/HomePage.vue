<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import BrandMenu from '../components/BrandMenu.vue';
import BrandSwitcher from '../components/BrandSwitcher.vue';
import HeroSection from '../components/HeroSection.vue';
import VehicleGrid from '../components/VehicleGrid.vue';
import VehicleModal from '../components/VehicleModal.vue';
import { useAuth } from '../composables/useAuth';
import { useVehicles } from '../composables/useVehicles';
import type { Brand, Vehicle } from '../composables/useVehicles';

const { currentUser } = useAuth();
const { brands, fetchBrands } = useVehicles();

const selectedBrand = ref<Brand | null>(null);
const showModal = ref(false);
const selectedVehicle = ref<Vehicle | null>(null);

const vehiclesByBrand = computed(() => selectedBrand.value?.vehicles || []);

onMounted(async () => {
  await fetchBrands();

  if (brands.value.length > 0) {
    selectedBrand.value = brands.value[0];
    return;
  }

  console.error("No brands found in Firestore. Check collection name 'brands'.");
});

const selectBrand = (brand: Brand) => {
  selectedBrand.value = brand;
};

const showVehicleDetail = (vehicle: Vehicle) => {
  selectedVehicle.value = vehicle;
  showModal.value = true;
};

const runVehicleAction = (action: string, vehicle: Vehicle) => {
  if (action === 'Ver detalle') {
    showVehicleDetail(vehicle);
    return;
  }

  window.alert(`${action} - ${selectedBrand.value?.name} ${vehicle.model}`);
};

const viewInventory = () => {
  window.alert(`Inventario de ${selectedBrand.value?.name}`);
};

const scheduleTestDrive = () => {
  window.alert(`Test drive para ${selectedBrand.value?.name}`);
};

const requestFinancing = () => {
  window.alert(`Financiacion de ${selectedBrand.value?.name}`);
};

const closeModal = () => {
  showModal.value = false;
  selectedVehicle.value = null;
};

</script>

<template>
  <div class="page-shell">
    <main class="catalog-page">
      <HeroSection />

      <section class="brands-section">
        <h2>Popular Brands</h2>
        <BrandSwitcher
          v-if="brands.length > 0 && selectedBrand"
          :brands="brands"
          :selected-brand-name="selectedBrand.name"
          @select="selectBrand"
        />
        <p v-else class="empty-state">Loading brands...</p>
      </section>

      <section v-if="selectedBrand" class="vehicles-section">
        <div class="section-header">
          <h2>{{ selectedBrand.name }} Vehicles</h2>
          <BrandMenu
            v-if="currentUser"
            :brand="selectedBrand"
            @view-inventory="viewInventory"
            @schedule-test-drive="scheduleTestDrive"
            @request-financing="requestFinancing"
          />
        </div>

        <VehicleGrid
          :brand-name="selectedBrand.name"
          :vehicles="vehiclesByBrand"
          @select-vehicle="showVehicleDetail"
          @vehicle-action="runVehicleAction"
        />
      </section>
    </main>

    <VehicleModal
      v-if="showModal"
      :brand-name="selectedBrand?.name || ''"
      :vehicle="selectedVehicle"
      @close="closeModal"
      @vehicle-action="runVehicleAction"
    />

  </div>
</template>

<style scoped>
.page-shell {
  min-height: 100vh;
  background-color: #ecf0f1;
  display: flex;
  flex-direction: column;
}

.catalog-page {
  width: min(1200px, calc(100% - 40px));
  margin: 0 auto;
  padding: 20px 0;
  flex: 1;
}

.brands-section,
.vehicles-section {
  margin-bottom: 40px;
}

.brands-section h2,
.section-header h2 {
  font-size: 24px;
  margin: 0 0 20px;
  color: #333;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 15px;
  margin-bottom: 20px;
}

.empty-state {
  background: white;
  border-radius: 8px;
  color: #666;
  padding: 20px;
}

@media (max-width: 768px) {
  .catalog-page {
    width: min(100% - 24px, 1200px);
  }

  .section-header {
    flex-direction: column;
  }
}
</style>
