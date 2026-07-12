<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Calculator, Heart, X } from 'lucide-vue-next';
import BrandSwitcher from '../components/BrandSwitcher.vue';
import VehicleCompareModal from '../components/VehicleCompareModal.vue';
import VehicleGrid from '../components/VehicleGrid.vue';
import VehicleModal from '../components/VehicleModal.vue';
import { useAuth } from '../composables/useAuth';
import { useInteractionEvents } from '../composables/useInteractionEvents';
import type { CreditSimulation } from '../composables/useInteractionEvents';
import { useVehicles } from '../composables/useVehicles';
import type { Brand, Vehicle } from '../composables/useVehicles';
import { useI18n } from '../i18n';

const route = useRoute();
const router = useRouter();
const { currentUser, loading: authLoading } = useAuth();
const { t } = useI18n();
const { fetchCreditSimulations, trackVehicleComparison, trackVehicleView } = useInteractionEvents();
const {
  brands,
  error,
  fetchBrands,
  fetchFavoriteVehicles,
  fetchPopularBrands,
  fetchVehiclesByBrand,
  loading,
  toggleFavorite,
  vehicles,
} = useVehicles();

const selectedBrand = ref<Brand | null>(null);
const selectedVehicle = ref<Vehicle | null>(null);
const selectedCompareVehicles = ref<Vehicle[]>([]);
const popularBrands = ref<Brand[]>([]);
const favoriteVehicles = ref<Vehicle[]>([]);
const creditSimulations = ref<CreditSimulation[]>([]);
const showVehicleModal = ref(false);
const showCompareModal = ref(false);
const showFavoritesModal = ref(false);
const showCreditSimulationsModal = ref(false);
const loadingVehicles = ref(false);
const loadingPopularBrands = ref(false);
const loadingFavorites = ref(false);
const loadingCreditSimulations = ref(false);
const brandSkeletons = Array.from({ length: 10 }, (_, index) => index);
let vehicleRequestId = 0;

const routeBrandId = computed(() => {
  const brandId = route.query.brandId;
  return typeof brandId === 'string' ? brandId : '';
});

const selectedCompareIds = computed(() =>
  selectedCompareVehicles.value.map((vehicle) => vehicle.id ?? vehicle.model)
);

const pageLoading = computed(
  () => authLoading.value || loading.value || loadingPopularBrands.value || loadingVehicles.value
);
const selectedBrandId = computed(() => selectedBrand.value?.id ?? '');

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
  await loadVehiclesForBrand(brand);
};

const syncSelectedBrandFromRoute = async () => {
  if (!currentUser.value || brands.value.length === 0) {
    return;
  }

  const brand =
    brands.value.find((item) => item.id === routeBrandId.value) ??
    popularBrands.value[0] ??
    brands.value[0];
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
  loadingPopularBrands.value = true;

  try {
    popularBrands.value = await fetchPopularBrands(10);
  } catch (err) {
    console.error('Failed to load popular brands:', err);
    popularBrands.value = [];
  } finally {
    loadingPopularBrands.value = false;
  }

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

const selectBrandById = async (event: Event) => {
  const brandId = (event.target as HTMLSelectElement).value;
  const brand = brands.value.find((item) => item.id === brandId);

  if (brand) {
    await selectBrand(brand);
  }
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
    if (showFavoritesModal.value) {
      favoriteVehicles.value = await fetchFavoriteVehicles();
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : t('alert.favoriteFailed');
    window.alert(message);
  }
};

const openFavoritesModal = async () => {
  showFavoritesModal.value = true;
  loadingFavorites.value = true;

  try {
    favoriteVehicles.value = await fetchFavoriteVehicles();
  } catch (err) {
    console.error('Failed to load favorites:', err);
    favoriteVehicles.value = [];
  } finally {
    loadingFavorites.value = false;
  }
};

const openCreditSimulationsModal = async () => {
  showCreditSimulationsModal.value = true;
  loadingCreditSimulations.value = true;

  try {
    creditSimulations.value = await fetchCreditSimulations();
  } catch (err) {
    console.error('Failed to load credit simulations:', err);
    creditSimulations.value = [];
  } finally {
    loadingCreditSimulations.value = false;
  }
};

const closeVehicleModal = () => {
  showVehicleModal.value = false;
  selectedVehicle.value = null;
};

const goToLogin = () => {
  router.push('/login');
};

const brandNameForVehicle = (vehicle: Vehicle | CreditSimulation['vehicle']) => {
  if (!vehicle) {
    return '';
  }

  if ('brand' in vehicle && vehicle.brand) {
    return vehicle.brand;
  }

  return brands.value.find((brand) => brand.id === vehicle.brandId)?.name ?? '';
};

const formatPrice = (value?: number | null) => {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return t('common.notAvailable');
  }

  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(value);
};

const formatDate = (value: unknown) => {
  if (!value) {
    return t('common.notAvailable');
  }

  if (typeof value === 'string') {
    return new Date(value).toLocaleDateString('es-CO');
  }

  if (typeof value === 'object') {
    const timestamp = value as { seconds?: number; _seconds?: number };
    const seconds = timestamp.seconds ?? timestamp._seconds;
    if (typeof seconds === 'number') {
      return new Date(seconds * 1000).toLocaleDateString('es-CO');
    }
  }

  return t('common.notAvailable');
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
      <p class="eyebrow">{{ t('inventory.eyebrow') }}</p>
      <h1>{{ t('inventory.title') }}</h1>
    </section>

    <section v-if="!authLoading && !currentUser" class="auth-panel">
      <h2>{{ t('appointment.authRequired') }}</h2>
      <button class="primary-action" type="button" @click="goToLogin">
        {{ t('nav.signIn') }}
      </button>
    </section>

    <template v-else>
      <section v-if="pageLoading && !popularBrands.length" class="inventory-brand-loading" aria-live="polite">
        <p class="status-message">{{ t('inventory.loadingPopularBrands') }}</p>
        <div class="brand-skeleton-grid">
          <article v-for="item in brandSkeletons" :key="item" class="brand-skeleton-card">
            <div class="brand-skeleton-image"></div>
            <div class="brand-skeleton-line"></div>
          </article>
        </div>
      </section>
      <p v-else-if="error" class="status-message error">{{ error }}</p>

      <div v-else class="inventory-layout">
        <aside class="inventory-sidebar" :aria-label="t('inventory.shortcuts')">
          <button class="sidebar-row" type="button" @click="openFavoritesModal">
            <span class="sidebar-icon">
              <Heart :size="18" />
            </span>
            <span>{{ t('inventory.myFavorites') }}</span>
          </button>
          <button class="sidebar-row" type="button" @click="openCreditSimulationsModal">
            <span class="sidebar-icon">
              <Calculator :size="18" />
            </span>
            <span>{{ t('inventory.myCreditSimulations') }}</span>
          </button>
        </aside>

        <div class="inventory-main">

          <BrandSwitcher v-if="popularBrands.length" :brands="popularBrands"
            :selected-brand-name="selectedBrand?.name ?? ''" @select="selectBrand" />

          <section v-if="brands.length" class="brand-selector-panel">
            <label for="inventory-brand-select">{{ t('inventory.allBrands') }}</label>
            <select id="inventory-brand-select" :value="selectedBrandId" @change="selectBrandById">
              <option v-for="brand in brands" :key="brand.id ?? brand.name" :value="brand.id">
                {{ brand.name }}
              </option>
            </select>
          </section>

          <section v-if="selectedBrand" class="vehicles-section">
            <div class="section-header">
              <div class="section-title">
                <p v-if="selectedBrand">
                  {{ t('inventory.selectedBrandCopy', { brand: selectedBrand.name }) }}
                </p>
                <span v-if="loadingVehicles" class="inline-loader" aria-live="polite">
                  <span class="loader-dot"></span>
                  {{ t('vehicles.loadingVehicles') }}
                </span>
              </div>
              <div v-if="selectedCompareVehicles.length" class="compare-actions">
                <span>{{ t('vehicles.selected', { count: selectedCompareVehicles.length }) }}</span>
                <button class="compare-open-btn" type="button" :disabled="selectedCompareVehicles.length < 2"
                  @click="showCompareModal = true">
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

            <VehicleGrid v-else :brand-name="selectedBrand.name" :selected-compare-ids="selectedCompareIds"
              :vehicles="vehicles" @select-vehicle="showVehicleDetail" @quote-vehicle="quoteVehicle"
              @toggle-compare="toggleCompareVehicle" @toggle-favorite="toggleVehicleFavorite" />
          </section>
        </div>
      </div>
    </template>

    <div v-if="showFavoritesModal" class="inventory-modal-backdrop" @click.self="showFavoritesModal = false">
      <section class="inventory-modal" aria-modal="true" role="dialog">
        <header class="inventory-modal-header">
          <div>
            <p class="eyebrow">{{ t('nav.inventory') }}</p>
            <h2>{{ t('inventory.myFavorites') }}</h2>
          </div>
          <button class="modal-close-btn" type="button" aria-label="Close" @click="showFavoritesModal = false">
            <X :size="20" />
          </button>
        </header>

        <div v-if="loadingFavorites" class="vehicles-loader modal-loader" aria-live="polite">
          <div class="loader-spinner" aria-hidden="true"></div>
          <span>{{ t('inventory.loadingFavorites') }}</span>
        </div>

        <p v-else-if="favoriteVehicles.length === 0" class="modal-empty">{{ t('inventory.noFavorites') }}</p>

        <div v-else class="modal-card-grid">
          <article v-for="vehicle in favoriteVehicles" :key="vehicle.id ?? vehicle.model" class="mini-vehicle-card">
            <img :src="vehicle.image" :alt="vehicle.model" />
            <div class="mini-card-body">
              <p class="mini-card-kicker">{{ brandNameForVehicle(vehicle) || t('nav.inventory') }}</p>
              <h3>{{ vehicle.model }}</h3>
              <p>{{ formatPrice(vehicle.price) }}</p>
              <div class="mini-card-actions">
                <button type="button" @click="showVehicleDetail(vehicle)">{{ t('inventory.details') }}</button>
                <button type="button" @click="quoteVehicle(vehicle)">{{ t('inventory.quote') }}</button>
              </div>
            </div>
          </article>
        </div>
      </section>
    </div>

    <div v-if="showCreditSimulationsModal" class="inventory-modal-backdrop"
      @click.self="showCreditSimulationsModal = false">
      <section class="inventory-modal" aria-modal="true" role="dialog">
        <header class="inventory-modal-header">
          <div>
            <p class="eyebrow">{{ t('actions.credit') }}</p>
            <h2>{{ t('inventory.myCreditSimulations') }}</h2>
          </div>
          <button class="modal-close-btn" type="button" aria-label="Close" @click="showCreditSimulationsModal = false">
            <X :size="20" />
          </button>
        </header>

        <div v-if="loadingCreditSimulations" class="vehicles-loader modal-loader" aria-live="polite">
          <div class="loader-spinner" aria-hidden="true"></div>
          <span>{{ t('inventory.loadingSimulations') }}</span>
        </div>

        <p v-else-if="creditSimulations.length === 0" class="modal-empty">
          {{ t('inventory.noSimulations') }}
        </p>

        <div v-else class="modal-card-grid">
          <article v-for="simulation in creditSimulations"
            :key="simulation.id ?? `${simulation.vehicleId}-${simulation.termMonths}`" class="simulation-card">
            <img v-if="simulation.vehicle?.image" :src="simulation.vehicle.image" :alt="simulation.vehicle.model" />
            <div class="simulation-body">
              <p class="mini-card-kicker">{{ formatDate(simulation.simulatedAt) }}</p>
              <h3>
                {{ brandNameForVehicle(simulation.vehicle) }}
                {{ simulation.vehicle?.model ?? 'Vehicle' }}
              </h3>
              <dl>
                <div>
                  <dt>{{ t('inventory.monthly') }}</dt>
                  <dd>{{ formatPrice(simulation.estimatedMonthlyPayment) }}</dd>
                </div>
                <div>
                  <dt>{{ t('inventory.financed') }}</dt>
                  <dd>{{ formatPrice(simulation.amountFinanced) }}</dd>
                </div>
                <div>
                  <dt>{{ t('inventory.term') }}</dt>
                  <dd>{{ t('inventory.months', { count: simulation.termMonths }) }}</dd>
                </div>
              </dl>
            </div>
          </article>
        </div>
      </section>
    </div>

    <VehicleModal v-if="showVehicleModal" :brand-name="selectedBrand?.name ?? ''" :vehicle="selectedVehicle"
      @close="closeVehicleModal" @quote="quoteVehicle" @test-drive="showVehicleModal = false" />

    <VehicleCompareModal v-if="showCompareModal" :vehicles="selectedCompareVehicles" @close="showCompareModal = false"
      @remove="removeCompareVehicle" />
  </main>
</template>

<style scoped>
.inventory-page {
  width: 100%;
  min-height: 100vh;
  padding: 0 24px 48px;
}

.inventory-header {
  display: flex;
  min-height: 44vh;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 0 -24px 32px;
  padding: 96px 24px 78px;
  background:
    linear-gradient(rgba(10, 13, 20, 0.72), rgba(10, 13, 20, 0.92)),
    url('https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=2000&q=80');
  background-position: center;
  background-size: cover;
  text-align: center;
}

.eyebrow {
  color: var(--ehm-accent);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.14em;
  margin: 0 0 8px;
  text-transform: uppercase;
}

.inventory-header h1 {
  color: #fff;
  font-size: clamp(34px, 5vw, 56px);
  font-weight: 300;
  letter-spacing: 0.14em;
  margin: 0;
  text-transform: uppercase;
}

.header-copy {
  max-width: 760px;
  color: var(--ehm-muted);
  font-size: 17px;
  font-weight: 400;
  line-height: 1.7;
  margin: 18px auto 0;
}

.auth-panel {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 28px;
}

.auth-panel h2 {
  color: var(--ehm-black);
  font-size: 20px;
  margin: 0 0 16px;
}

.primary-action {
  background: linear-gradient(135deg, var(--ehm-accent) 0%, var(--ehm-black-3) 100%);
  border: 0;
  border-radius: 4px;
  color: white;
  cursor: pointer;
  font-weight: 700;
  padding: 10px 16px;
}

.status-message {
  color: var(--ehm-black);
  font-weight: 700;
  margin: 0 0 24px;
}

.status-message.error {
  color: #c0392b;
}

.inventory-brand-loading {
  display: grid;
  gap: 18px;
}

.brand-skeleton-grid {
  display: grid;
  gap: 18px;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
}

.brand-skeleton-card {
  position: relative;
  min-height: 214px;
  overflow: hidden;
  border-radius: 8px;
  border: 1px solid rgba(10, 13, 20, 0.12);
  background:
    linear-gradient(135deg, rgba(255, 142, 113, 0.12) 0%, rgba(255, 142, 113, 0) 34%),
    linear-gradient(135deg, var(--ehm-black) 0%, var(--ehm-black-3) 100%);
  box-shadow: 0 18px 42px rgba(10, 13, 20, 0.16);
  padding: 14px;
}

.brand-skeleton-card::after {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.12), transparent);
  content: '';
  transform: translateX(-100%);
  animation: skeleton-shimmer 1.2s ease-in-out infinite;
}

.brand-skeleton-image {
  height: 138px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.78);
}

.brand-skeleton-line {
  width: 68%;
  height: 16px;
  margin-top: 18px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.24);
}

.inventory-layout {
  align-items: stretch;
  display: grid;
  gap: 28px;
  grid-template-columns: 230px minmax(0, 1fr);
}

.inventory-sidebar {
  position: sticky;
  top: 86px;
  display: grid;
  align-content: start;
  gap: 12px;
  min-height: calc(100vh - 116px);
  border: 1px solid rgba(44, 62, 80, 0.12);
  border-radius: 8px;
  background:
    linear-gradient(135deg, rgba(255, 142, 113, 0.14) 0%, rgba(255, 142, 113, 0) 34%),
    linear-gradient(135deg, var(--ehm-black) 0%, var(--ehm-black-3) 100%);
  box-shadow: 0 18px 42px rgba(44, 62, 80, 0.2);
  padding: 14px;
}

.sidebar-row {
  align-items: center;
  display: grid;
  grid-template-columns: 38px 1fr;
  gap: 10px;
  min-height: 52px;
  border: 1px solid rgba(255, 255, 255, 0.24);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  cursor: pointer;
  font: inherit;
  font-size: 13px;
  font-weight: 800;
  line-height: 1.25;
  padding: 8px 10px;
  text-align: left;
  transition: background-color 0.2s, border-color 0.2s, transform 0.2s;
}

.sidebar-row:hover {
  background: rgba(255, 255, 255, 0.16);
  border-color: #ff8e71;
  transform: translateY(-2px);
}

.sidebar-icon {
  align-items: center;
  display: flex;
  height: 38px;
  justify-content: center;
  border-radius: 50%;
  background: #fff;
  color: var(--ehm-accent);
}

.inventory-main {
  min-width: 0;
}

.brand-selector-panel {
  align-items: center;
  display: grid;
  gap: 10px;
  grid-template-columns: max-content minmax(220px, 360px);
  margin-bottom: 18px;
}

.brand-selector-panel label {
  color: var(--ehm-black);
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.brand-selector-panel select {
  width: 100%;
  border: 1px solid #d7e4ef;
  border-radius: 6px;
  background: #fff;
  color: var(--ehm-black);
  font: inherit;
  font-weight: 700;
  min-height: 42px;
  padding: 8px 12px;
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
  justify-content: center;
  text-align: center;
  width: 100%;
}

.section-title h2 {
  color: var(--ehm-black);
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
  background: var(--ehm-accent);
  border-radius: 50%;
  height: 8px;
  width: 8px;
}

.vehicles-loader {
  align-items: center;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  color: var(--ehm-black);
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
  border-top-color: var(--ehm-accent);
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
  color: var(--ehm-black);
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
  background: var(--ehm-black);
  border: 1px solid var(--ehm-black);
  color: white;
}

.compare-open-btn:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.compare-clear-btn {
  background: white;
  border: 1px solid #d7e4ef;
  color: var(--ehm-black);
}

.inventory-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 80;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(10, 25, 47, 0.58);
  padding: 24px;
}

.inventory-modal {
  width: min(980px, 100%);
  max-height: min(82vh, 760px);
  overflow: auto;
  border-radius: 8px;
  background: #f9fafb;
  box-shadow: 0 26px 70px rgba(0, 0, 0, 0.32);
  padding: 24px;
}

.inventory-modal-header {
  align-items: center;
  display: flex;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 20px;
}

.inventory-modal-header h2 {
  color: var(--ehm-black);
  font-size: 24px;
  margin: 0;
}

.modal-close-btn {
  align-items: center;
  display: flex;
  height: 40px;
  justify-content: center;
  width: 40px;
  border: 1px solid #d7e4ef;
  border-radius: 50%;
  background: #fff;
  color: var(--ehm-black);
  cursor: pointer;
}

.modal-loader {
  min-height: 220px;
}

.modal-empty {
  border: 1px solid #d7e4ef;
  border-radius: 8px;
  background: #fff;
  color: #606f7b;
  font-weight: 700;
  margin: 0;
  padding: 24px;
  text-align: center;
}

.modal-card-grid {
  display: grid;
  gap: 18px;
  grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
}

.mini-vehicle-card,
.simulation-card {
  overflow: hidden;
  border: 1px solid rgba(44, 62, 80, 0.12);
  border-radius: 8px;
  background:
    linear-gradient(135deg, rgba(255, 142, 113, 0.16) 0%, rgba(255, 142, 113, 0) 30%),
    linear-gradient(135deg, var(--ehm-black) 0%, var(--ehm-black-3) 100%);
  color: #fff;
  box-shadow: 0 14px 32px rgba(44, 62, 80, 0.18);
}

.mini-vehicle-card img,
.simulation-card img {
  width: 100%;
  height: 150px;
  object-fit: contain;
  border-bottom: 1px solid rgba(255, 255, 255, 0.32);
  background:
    radial-gradient(circle at 50% 30%, rgba(255, 255, 255, 0.96), rgba(236, 240, 241, 0.84) 45%, rgba(215, 228, 239, 0.95) 100%);
  padding: 14px;
}

.mini-card-body,
.simulation-body {
  padding: 16px;
}

.mini-card-kicker {
  color: #d7e4ef;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.08em;
  margin: 0 0 6px;
  text-transform: uppercase;
}

.mini-card-body h3,
.simulation-body h3 {
  color: #fff;
  font-size: 19px;
  line-height: 1.2;
  margin: 0 0 8px;
}

.mini-card-body p {
  color: #ffb19d;
  font-weight: 800;
  margin: 0;
}

.mini-card-actions {
  display: flex;
  gap: 10px;
  margin-top: 16px;
}

.mini-card-actions button {
  flex: 1;
  min-height: 36px;
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 4px;
  background: transparent;
  color: #fff;
  cursor: pointer;
  font-weight: 700;
}

.mini-card-actions button:hover {
  background: #ff8e71;
  border-color: #ff8e71;
}

.simulation-body dl {
  display: grid;
  gap: 10px;
  margin: 14px 0 0;
}

.simulation-body dl div {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  border-top: 1px solid rgba(215, 228, 239, 0.22);
  padding-top: 10px;
}

.simulation-body dt {
  color: #d7e4ef;
  font-size: 12px;
  font-weight: 700;
}

.simulation-body dd {
  color: #fff;
  font-size: 12px;
  font-weight: 800;
  margin: 0;
  text-align: right;
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

  .inventory-layout {
    grid-template-columns: 1fr;
  }

  .inventory-sidebar {
    position: static;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    min-height: auto;
  }

  .sidebar-row {
    grid-template-columns: 34px 1fr;
    font-size: 12px;
  }

  .brand-selector-panel {
    align-items: stretch;
    grid-template-columns: 1fr;
  }

  .section-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .compare-actions {
    flex-wrap: wrap;
    margin-left: 0;
  }

  .inventory-modal-backdrop {
    align-items: stretch;
    padding: 12px;
  }

  .inventory-modal {
    max-height: 100%;
    padding: 18px;
  }
}

@keyframes skeleton-shimmer {
  100% {
    transform: translateX(100%);
  }
}
</style>
