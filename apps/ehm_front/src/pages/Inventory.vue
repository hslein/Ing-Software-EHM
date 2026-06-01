<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import BrandSwitcher from '../components/BrandSwitcher.vue';
import VehicleCompareModal from '../components/VehicleCompareModal.vue';
import VehicleGrid from '../components/VehicleGrid.vue';
import VehicleModal from '../components/VehicleModal.vue';
import { useAuth } from '../composables/useAuth';
import { useInteractionEvents } from '../composables/useInteractionEvents';
import { useVehicles } from '../composables/useVehicles';
import type { Brand, Vehicle } from '../composables/useVehicles';
import { useI18n } from '../i18n';

const route = useRoute();
const router = useRouter();
const { currentUser, loading: authLoading } = useAuth();
const { t } = useI18n();
const { trackVehicleComparison, trackVehicleView } = useInteractionEvents();
const { brands, error, fetchBrands, fetchVehiclesByBrand, loading, toggleFavorite, vehicles } =
  useVehicles();

const selectedBrand = ref<Brand | null>(null);
const selectedVehicle = ref<Vehicle | null>(null);
const selectedCompareVehicles = ref<Vehicle[]>([]);
const showVehicleModal = ref(false);
const showCompareModal = ref(false);
const loadingVehicles = ref(false);
let vehicleRequestId = 0;

const routeBrandId = computed(() => {
  const brandId = route.query.brandId;
  return typeof brandId === 'string' ? brandId : '';
});

const selectedCompareIds = computed(() =>
  selectedCompareVehicles.value.map((vehicle) => vehicle.id ?? vehicle.model)
);

const pageLoading = computed(() => authLoading.value || loading.value || loadingVehicles.value);

const loadVehiclesForBrand = async (brand: Brand) => {
  if (!brand.id) {
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
  clearCompareVehicles();
  await loadVehiclesForBrand(brand);
};

const syncSelectedBrandFromRoute = async () => {
  if (!currentUser.value || brands.value.length === 0) {
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

const loadInventory = async () => {
  if (authLoading.value || !currentUser.value) {
    return;
  }

  await fetchBrands();
  await syncSelectedBrandFromRoute();
};

const selectBrand = async (brand: Brand) => {
  if (!brand.id) {
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

const showVehicleDetail = async (vehicle: Vehicle) => {
  selectedVehicle.value = vehicle;
  showVehicleModal.value = true;

  if (vehicle.id) {
    await trackVehicleView(vehicle.id).catch((err) => {
      console.error('Failed to track vehicle view:', err);
    });
  }
};

const quoteVehicle = (vehicle: Vehicle) => {
  if (!vehicle.id) {
    return;
  }

  void router.push({
    path: '/credit',
    query: {
      vehicleId: vehicle.id,
      price: vehicle.price?.toString() ?? '',
      model: vehicle.model,
      brand: selectedBrand.value?.name ?? vehicle.brand ?? '',
    },
  });
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
    brand: vehicle.brand || selectedBrand.value?.name || '',
  };

  if (selectedCompareVehicles.value.length >= 2) {
    selectedCompareVehicles.value = [selectedCompareVehicles.value[1], vehicleWithBrand];
  } else {
    selectedCompareVehicles.value.push(vehicleWithBrand);
  }

  if (selectedCompareVehicles.value.length === 2) {
    showCompareModal.value = true;
    const [firstVehicle, secondVehicle] = selectedCompareVehicles.value;
    if (firstVehicle.id && secondVehicle.id) {
      void trackVehicleComparison(firstVehicle.id, secondVehicle.id).catch((err) => {
        console.error('Failed to track vehicle comparison:', err);
      });
    }
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

const toggleVehicleFavorite = async (vehicle: Vehicle) => {
  try {
    await toggleFavorite(vehicle);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : t('alert.favoriteFailed');
    window.alert(message);
  }
};

const closeVehicleModal = () => {
  showVehicleModal.value = false;
  selectedVehicle.value = null;
};

const goToLogin = () => {
  router.push('/login');
};

onMounted(loadInventory);

watch(currentUser, () => {
  void loadInventory();
});

watch(routeBrandId, () => {
  void syncSelectedBrandFromRoute();
});
</script>

<template>
  <main class="inventory-page">
    <section class="inventory-header">
      <p class="eyebrow">{{ t('nav.inventory') }}</p>
      <h1>{{ selectedBrand ? t('vehicles.title', { brand: selectedBrand.name }) : t('nav.inventory') }}</h1>
      <p v-if="selectedBrand" class="header-copy">
        {{ t('alert.inventory', { brand: selectedBrand.name }) }}
      </p>
    </section>

    <section v-if="!authLoading && !currentUser" class="auth-panel">
      <h2>{{ t('appointment.authRequired') }}</h2>
      <button class="primary-action" type="button" @click="goToLogin">
        {{ t('nav.signIn') }}
      </button>
    </section>

    <template v-else>
      <p v-if="pageLoading && !brands.length" class="status-message">
        {{ t('vehicles.loadingBrands') }}
      </p>
      <p v-else-if="error" class="status-message error">{{ error }}</p>

      <BrandSwitcher
        v-if="brands.length"
        :brands="brands"
        :selected-brand-name="selectedBrand?.name ?? ''"
        @select="selectBrand"
      />

      <section v-if="selectedBrand" class="vehicles-section">
        <div class="section-header">
          <div class="section-title">
            <h2>{{ t('vehicles.title', { brand: selectedBrand.name }) }}</h2>
            <span v-if="loadingVehicles" class="inline-loader" aria-live="polite">
              <span class="loader-dot"></span>
              {{ t('vehicles.loadingVehicles') }}
            </span>
          </div>
          <div v-if="selectedCompareVehicles.length" class="compare-actions">
            <span>{{ t('vehicles.selected', { count: selectedCompareVehicles.length }) }}</span>
            <button
              class="compare-open-btn"
              type="button"
              :disabled="selectedCompareVehicles.length < 2"
              @click="showCompareModal = true"
            >
              {{ t('vehicles.compare') }}
            </button>
            <button class="compare-clear-btn" type="button" @click="clearCompareVehicles">
              {{ t('vehicles.clear') }}
            </button>
          </div>
        </div>

        <div v-if="loadingVehicles" class="vehicles-loader" aria-live="polite">
          <div class="loader-spinner" aria-hidden="true"></div>
          <span>{{ t('vehicles.loadingBrandVehicles', { brand: selectedBrand.name }) }}</span>
        </div>

        <VehicleGrid
          v-else
          :brand-name="selectedBrand.name"
          :selected-compare-ids="selectedCompareIds"
          :vehicles="vehicles"
          @select-vehicle="showVehicleDetail"
          @quote-vehicle="quoteVehicle"
          @toggle-compare="toggleCompareVehicle"
          @toggle-favorite="toggleVehicleFavorite"
        />
      </section>
    </template>

    <VehicleModal
      v-if="showVehicleModal"
      :brand-name="selectedBrand?.name ?? ''"
      :vehicle="selectedVehicle"
      @close="closeVehicleModal"
      @quote="quoteVehicle"
      @test-drive="showVehicleModal = false"
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
.inventory-page {
  max-width: 1200px;
  min-height: 100vh;
  margin: 0 auto;
  padding: 32px 20px 48px;
}

.inventory-header {
  margin-bottom: 24px;
}

.eyebrow {
  color: #2980b9;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.14em;
  margin: 0 0 8px;
  text-transform: uppercase;
}

.inventory-header h1 {
  color: #2c3e50;
  font-size: 32px;
  margin: 0;
}

.header-copy {
  color: #606f7b;
  font-weight: 600;
  margin: 10px 0 0;
}

.auth-panel {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 28px;
}

.auth-panel h2 {
  color: #2c3e50;
  font-size: 20px;
  margin: 0 0 16px;
}

.primary-action {
  background: linear-gradient(135deg, #2980b9 0%, #2c3e50 100%);
  border: 0;
  border-radius: 4px;
  color: white;
  cursor: pointer;
  font-weight: 700;
  padding: 10px 16px;
}

.status-message {
  color: #2c3e50;
  font-weight: 700;
  margin: 0 0 24px;
}

.status-message.error {
  color: #c0392b;
}

.vehicles-section {
  margin-top: 22px;
}

.section-header {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  justify-content: space-between;
  margin-bottom: 20px;
}

.section-title {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.section-title h2 {
  color: #333;
  font-size: 24px;
  margin: 0;
}

.inline-loader {
  align-items: center;
  color: #606f7b;
  display: inline-flex;
  font-size: 13px;
  font-weight: 700;
  gap: 8px;
}

.loader-dot {
  animation: pulse 0.9s ease-in-out infinite;
  background: #2980b9;
  border-radius: 50%;
  height: 8px;
  width: 8px;
}

.vehicles-loader {
  align-items: center;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  color: #2c3e50;
  display: flex;
  font-weight: 700;
  gap: 12px;
  justify-content: center;
  min-height: 260px;
}

.loader-spinner {
  animation: spin 0.8s linear infinite;
  border: 3px solid #d7e4ef;
  border-radius: 50%;
  border-top-color: #2980b9;
  height: 28px;
  width: 28px;
}

.compare-actions {
  align-items: center;
  display: flex;
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

@media (max-width: 768px) {
  .inventory-header h1 {
    font-size: 26px;
  }

  .section-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .compare-actions {
    flex-wrap: wrap;
    margin-left: 0;
  }
}
</style>
