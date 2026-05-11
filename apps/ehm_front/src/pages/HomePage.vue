<script setup lang="ts">
import { ref } from 'vue';
import BrandMenu from '../components/BrandMenu.vue';
import BrandSwitcher from '../components/BrandSwitcher.vue';
import HeroSection from '../components/HeroSection.vue';
import HighlightsCarousel from '../components/HighlightsCarousel.vue';
import MissionVisionSection from '../components/MissionVisionSection.vue';
import VehicleGrid from '../components/VehicleGrid.vue';
import VehicleModal from '../components/VehicleModal.vue';
import {
  getBrandsQuery,
  getHighlightsQuery,
  getMissionVisionQuery,
} from '../queries/catalog.queries';
import type { Brand, Vehicle } from '../types/catalog.types';

const brands = getBrandsQuery();
const highlights = getHighlightsQuery();
const missionVision = getMissionVisionQuery();

const selectedBrand = ref<Brand>(brands[0]);
const showBrandVehicles = ref(false);
const showModal = ref(false);
const selectedVehicle = ref<Vehicle | null>(null);

const selectBrand = (brand: Brand) => {
  selectedBrand.value = brand;
  showBrandVehicles.value = true;
};

const showVehicleDetail = (vehicle: Vehicle) => {
  selectedVehicle.value = vehicle;
  showModal.value = true;
};

const viewInventory = () => {
  window.alert(`Inventario de ${selectedBrand.value.name}`);
};

const scheduleTestDrive = () => {
  window.alert(`Test drive para ${selectedBrand.value.name}`);
};

const requestFinancing = () => {
  window.alert(`Financiacion de ${selectedBrand.value.name}`);
};

const closeModal = () => {
  showModal.value = false;
  selectedVehicle.value = null;
};

const goToHomeMenu = () => {
  showBrandVehicles.value = false;
  selectedVehicle.value = null;
  showModal.value = false;
};

defineExpose({
  goToHomeMenu,
});
</script>

<template>
  <main class="catalog-page">
    <HeroSection />
    <BrandSwitcher
      :brands="brands"
      :selected-brand-name="selectedBrand.name"
      @select="selectBrand"
    />
    <HighlightsCarousel v-if="!showBrandVehicles" :highlights="highlights" />
    <VehicleGrid
      v-if="showBrandVehicles"
      :brand-name="selectedBrand.name"
      :vehicles="selectedBrand.vehicles"
      @select-vehicle="showVehicleDetail"
    />
    <BrandMenu
      v-if="showBrandVehicles"
      :brand="selectedBrand"
      @view-inventory="viewInventory"
      @schedule-test-drive="scheduleTestDrive"
      @request-financing="requestFinancing"
    />
  </main>

  <VehicleModal
    v-if="showModal"
    :brand-name="selectedBrand.name"
    :vehicle="selectedVehicle"
    @close="closeModal"
  />
  <MissionVisionSection
    v-if="!showBrandVehicles"
    :image="missionVision.image"
    :mission="missionVision.mission"
    :vision="missionVision.vision"
  />
</template>

<style scoped>
.catalog-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2.5rem 2rem 3.5rem;
}

@media (max-width: 768px) {
  .catalog-page {
    padding: 1.6rem 1rem 2.5rem;
  }
}
</style>
