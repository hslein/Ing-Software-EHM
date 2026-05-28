<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import BrandMenu from '../components/BrandMenu.vue';
import BrandSwitcher from '../components/BrandSwitcher.vue';
import HeroSection from '../components/HeroSection.vue';
import VehicleCompareModal from '../components/VehicleCompareModal.vue';
import VehicleGrid from '../components/VehicleGrid.vue';
import VehicleModal from '../components/VehicleModal.vue';
import { useAuth } from '../composables/useAuth';
import { useVehicles } from '../composables/useVehicles';
import type { Brand, Vehicle } from '../composables/useVehicles';

const { currentUser } = useAuth();
const { brands, error, fetchBrands, fetchVehiclesByBrand, loading, toggleFavorite, vehicles } =
  useVehicles();
const route = useRoute();
const router = useRouter();

const selectedBrand = ref<Brand | null>(null);
const showBrandVehicles = ref(false);
const showModal = ref(false);
const showCompareModal = ref(false);
const selectedVehicle = ref<Vehicle | null>(null);
const selectedCompareVehicles = ref<Vehicle[]>([]);
const loadingVehicles = ref(false);
let vehicleRequestId = 0;

const vehiclesByBrand = computed(() => vehicles.value);
const selectedCompareIds = computed(() =>
  selectedCompareVehicles.value.map((vehicle) => vehicle.id ?? vehicle.model)
);

const routeBrandId = computed(() => {
  const brandId = route.query.brandId;
  return typeof brandId === 'string' ? brandId : '';
});

const loadVehiclesForBrand = async (brand: Brand) => {
  if (!brand.id) {
    console.error(`Brand ${brand.name} does not have an id.`);
    return;
  }

  const requestId = ++vehicleRequestId;
  loadingVehicles.value = true;

  try {
    await fetchVehiclesByBrand(brand.id);
  } finally {
    if (requestId === vehicleRequestId) {
      loadingVehicles.value = false;
    }
  }
};

const setSelectedBrand = async (brand: Brand) => {
  if (selectedBrand.value?.id === brand.id && vehicles.value.length > 0) {
    return;
  }

  selectedBrand.value = brand;
  showBrandVehicles.value = true;
  clearCompareVehicles();
  await loadVehiclesForBrand(brand);
};

const syncSelectedBrandFromRoute = async () => {
  if (brands.value.length === 0) {
    return;
  }

  const brand = brands.value.find((item) => item.id === routeBrandId.value) ?? brands.value[0];

  await setSelectedBrand(brand);

  if (brand.id && routeBrandId.value !== brand.id) {
    await router.replace({
      query: {
        ...route.query,
        brandId: brand.id,
      },
    });
  }
};

onMounted(async () => {
  await fetchBrands();

  if (brands.value.length > 0) {
    await syncSelectedBrandFromRoute();
  } else {
    console.error("No brands found in Firestore. Check collection name 'brands'.");
  }
});

watch(routeBrandId, () => {
  void syncSelectedBrandFromRoute();
});

const selectBrand = async (brand: Brand) => {
  if (!brand.id) {
    await setSelectedBrand(brand);
    return;
  }

  if (routeBrandId.value === brand.id) {
    await setSelectedBrand(brand);
    return;
  }

  await router.push({
    query: {
      ...route.query,
      brandId: brand.id,
    },
  });
};

const showVehicleDetail = (vehicle: Vehicle) => {
  selectedVehicle.value = vehicle;
  showModal.value = true;
};

const toggleCompareVehicle = (vehicle: Vehicle) => {
  const compareId = vehicle.id ?? vehicle.model;
  const existingIndex = selectedCompareVehicles.value.findIndex(
    (selected) => (selected.id ?? selected.model) === compareId
  );

  if (existingIndex >= 0) {
    selectedCompareVehicles.value.splice(existingIndex, 1);
    if (selectedCompareVehicles.value.length < 2) {
      showCompareModal.value = false;
    }
    return;
  }

  const vehicleWithBrand = {
    ...vehicle,
    brand: vehicle.brand || selectedBrand.value?.name || 'Unknown brand',
  };

  if (selectedCompareVehicles.value.length >= 2) {
    selectedCompareVehicles.value = [selectedCompareVehicles.value[1], vehicleWithBrand];
  } else {
    selectedCompareVehicles.value.push(vehicleWithBrand);
  }

  if (selectedCompareVehicles.value.length === 2) {
    showCompareModal.value = true;
  }
};

const removeCompareVehicle = (vehicle: Vehicle) => {
  const compareId = vehicle.id ?? vehicle.model;
  selectedCompareVehicles.value = selectedCompareVehicles.value.filter(
    (selected) => (selected.id ?? selected.model) !== compareId
  );

  if (selectedCompareVehicles.value.length < 2) {
    showCompareModal.value = false;
  }
};

const clearCompareVehicles = () => {
  selectedCompareVehicles.value = [];
  showCompareModal.value = false;
};

const runBrandAction = (action: string, vehicle: Vehicle) => {
  if (action === 'Ver detalle') {
    showVehicleDetail(vehicle);
    return;
  }

  window.alert(`${action} - ${selectedBrand.value?.name} ${vehicle.model}`);
};

const toggleVehicleFavorite = async (vehicle: Vehicle) => {
  try {
    await toggleFavorite(vehicle);
  } catch (err: any) {
    window.alert(err.message || 'No se pudo actualizar el favorito.');
  }
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
  <main class="home-page">
    <div class="content">
      <HeroSection />

      <section class="info-section">
        <div class="info-header">
          <p class="eyebrow">Sobre nuestro concesionario</p>
          <h2>Conoce por que elegir EHM</h2>
          <p class="info-description">
            Cada vehiculo pasa por una inspeccion detallada y nuestro equipo esta listo para
            acompaniarte en todo el proceso de compra.
          </p>
        </div>

        <div class="info-cards">
          <article class="info-card">
            <img
              src="https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=900&q=80"
              alt="Concesionario familiar y confiable"
              class="info-image"
            />
            <div class="info-content">
              <h3>Concesionario familiar y confiable</h3>
              <p>
                EHM tiene anos de experiencia, vehiculos revisados, asesoria honesta y un servicio
                cercano para cada cliente.
              </p>
            </div>
          </article>

          <article class="info-card">
            <img
              src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=80"
              alt="Flota completa y marcas premium"
              class="info-image"
            />
            <div class="info-content">
              <h3>Flota completa y marcas premium</h3>
              <p>
                Encuentra SUVs, pickups, deportivos y sedanes de marcas confiables para comprar con
                seguridad.
              </p>
            </div>
          </article>

          <article class="info-card">
            <img
              src="https://images.unsplash.com/photo-1519999482648-25049ddd37b1?auto=format&fit=crop&w=900&q=80"
              alt="Financiacion y prueba de manejo"
              class="info-image"
            />
            <div class="info-content">
              <h3>Financiacion y prueba de manejo</h3>
              <p>
                Te apoyamos con opciones flexibles y agendamos tu test drive para que decidas con
                tranquilidad.
              </p>
            </div>
          </article>
        </div>
      </section>

      <p v-if="loading && !brands.length" class="status-message">Loading brands...</p>
      <p v-else-if="error" class="status-message error">{{ error }}</p>

      <BrandSwitcher
        v-if="brands.length"
        :brands="brands"
        :selected-brand-name="selectedBrand?.name ?? ''"
        @select="selectBrand"
      />

      <section v-if="showBrandVehicles && selectedBrand" class="vehicles-section">
        <div class="section-header">
          <div class="section-title">
            <h2>{{ selectedBrand.name }} Vehicles</h2>
            <span v-if="loadingVehicles" class="inline-loader" aria-live="polite">
              <span class="loader-dot"></span>
              Loading vehicles...
            </span>
          </div>
          <div v-if="selectedCompareVehicles.length" class="compare-actions">
            <span>{{ selectedCompareVehicles.length }}/2 selected</span>
            <button
              class="compare-open-btn"
              type="button"
              :disabled="selectedCompareVehicles.length < 2"
              @click="showCompareModal = true"
            >
              Compare
            </button>
            <button class="compare-clear-btn" type="button" @click="clearCompareVehicles">
              Clear
            </button>
          </div>
          <BrandMenu
            v-if="currentUser"
            :brand="selectedBrand"
            @view-inventory="viewInventory"
            @schedule-test-drive="scheduleTestDrive"
            @request-financing="requestFinancing"
          />
        </div>

        <div v-if="loadingVehicles" class="vehicles-loader" aria-live="polite">
          <div class="loader-spinner" aria-hidden="true"></div>
          <span>Loading {{ selectedBrand.name }} vehicles...</span>
        </div>

        <VehicleGrid
          v-else
          :brand-name="selectedBrand.name"
          :selected-compare-ids="selectedCompareIds"
          :vehicles="vehiclesByBrand"
          @select-vehicle="showVehicleDetail"
          @quote-vehicle="runBrandAction('Cotizar', $event)"
          @toggle-compare="toggleCompareVehicle"
          @toggle-favorite="toggleVehicleFavorite"
        />
      </section>
    </div>

    <VehicleModal
      v-if="showModal"
      :brand-name="selectedBrand?.name ?? ''"
      :vehicle="selectedVehicle"
      @close="closeModal"
      @quote="runBrandAction('Cotizar', $event)"
      @test-drive="runBrandAction('Test Drive', $event)"
    />

    <VehicleCompareModal
      v-if="showCompareModal"
      :vehicles="selectedCompareVehicles"
      @close="showCompareModal = false"
      @remove="removeCompareVehicle"
    />
  </main>
</template>

<style scoped>
.home-page {
  min-height: 100vh;
}

.content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.info-section {
  background: white;
  border-radius: 16px;
  padding: 30px 25px;
  margin-bottom: 40px;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.05);
}

.info-header {
  max-width: 760px;
  margin: 0 auto 30px;
  text-align: center;
}

.eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: #2980b9;
  font-size: 12px;
  margin-bottom: 10px;
}

.info-header h2 {
  margin: 0;
  font-size: 28px;
  color: #2c3e50;
}

.info-description {
  margin: 15px auto 0;
  max-width: 620px;
  color: #666;
  font-size: 15px;
  line-height: 1.7;
}

.info-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
}

.info-card {
  overflow: hidden;
  border-radius: 14px;
  background: #f9fafb;
  display: flex;
  flex-direction: column;
  min-height: 100%;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.05);
}

.info-image {
  width: 100%;
  height: 180px;
  object-fit: cover;
}

.info-content {
  padding: 18px;
}

.info-content h3 {
  margin: 0 0 10px;
  font-size: 18px;
  color: #2c3e50;
}

.info-content p {
  margin: 0;
  color: #606f7b;
  line-height: 1.7;
}

.status-message {
  margin-bottom: 24px;
  color: #2c3e50;
  font-weight: 600;
}

.status-message.error {
  color: #c0392b;
}

.vehicles-section {
  margin-bottom: 40px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 20px;
}

.section-header h2 {
  font-size: 24px;
  color: #333;
  margin: 0;
}

.section-title {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.inline-loader {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #606f7b;
  font-size: 13px;
  font-weight: 700;
}

.loader-dot {
  width: 8px;
  height: 8px;
  background: #2980b9;
  border-radius: 50%;
  animation: pulse 0.9s ease-in-out infinite;
}

.vehicles-loader {
  min-height: 260px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: white;
  border-radius: 8px;
  color: #2c3e50;
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.loader-spinner {
  width: 28px;
  height: 28px;
  border: 3px solid #d7e4ef;
  border-top-color: #2980b9;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 0.35;
    transform: scale(0.85);
  }

  50% {
    opacity: 1;
    transform: scale(1.15);
  }
}

.compare-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: auto;
}

.compare-actions span {
  color: #2c3e50;
  font-size: 13px;
  font-weight: 700;
}

.compare-open-btn,
.compare-clear-btn {
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 700;
  padding: 8px 12px;
}

.compare-open-btn {
  background: #2980b9;
  border: 1px solid #2980b9;
  color: white;
}

.compare-open-btn:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.compare-clear-btn {
  background: white;
  border: 1px solid #d7e4ef;
  color: #2c3e50;
}

@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .compare-actions {
    margin-left: 0;
    flex-wrap: wrap;
  }
}
</style>
