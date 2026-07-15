<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../composables/useAuth';
import { useUserVehicles } from '../composables/useUserVehicles';
import { useI18n } from '../i18n';
import { getUpcomingMaintenanceVisits } from '../utils/maintenanceSchedule';

const router = useRouter();
const { isAuthenticated, loading: authLoading } = useAuth();
const { t } = useI18n();
const { userVehicles, loading, error, fetchMyVehicles, registerVehicle, deleteVehicle } = useUserVehicles();

const brand = ref('');
const model = ref('');
const year = ref(new Date().getFullYear());
const mileage = ref(0);
const purchaseDate = ref('');
const formError = ref<string | null>(null);
const submitting = ref(false);

const vehiclesWithMaintenance = computed(() =>
  userVehicles.value.map((vehicle) => ({
    vehicle,
    visits: getUpcomingMaintenanceVisits(vehicle.mileage, vehicle.purchaseDate, 5),
  })),
);

const resetForm = () => {
  brand.value = '';
  model.value = '';
  year.value = new Date().getFullYear();
  mileage.value = 0;
  purchaseDate.value = '';
  formError.value = null;
};

const loadPage = async () => {
  if (!isAuthenticated.value) {
    await router.replace('/login?redirect=/my-vehicles');
    return;
  }

  await fetchMyVehicles();
};

const handleSubmit = async () => {
  formError.value = null;

  if (!brand.value.trim() || !model.value.trim() || !purchaseDate.value) {
    formError.value = t('myVehicles.formRequired');
    return;
  }

  if (year.value < 1900 || year.value > new Date().getFullYear() + 1) {
    formError.value = t('myVehicles.invalidYear');
    return;
  }

  if (mileage.value < 0) {
    formError.value = t('myVehicles.invalidMileage');
    return;
  }

  submitting.value = true;
  try {
    await registerVehicle({
      brand: brand.value.trim(),
      model: model.value.trim(),
      year: year.value,
      mileage: mileage.value,
      purchaseDate: purchaseDate.value,
    });
    resetForm();
  } catch (err: unknown) {
    formError.value = err instanceof Error ? err.message : t('myVehicles.saveFailed');
  } finally {
    submitting.value = false;
  }
};

const handleDelete = async (id?: string) => {
  if (!id) {
    return;
  }

  await deleteVehicle(id);
};

onMounted(() => {
  if (!authLoading.value) {
    void loadPage();
  }
});

watch(authLoading, (isLoading) => {
  if (!isLoading) {
    void loadPage();
  }
});
</script>

<template>
  <main class="my-vehicles-page">
    <header class="page-header">
      <p class="eyebrow">{{ t('myVehicles.eyebrow') }}</p>
      <h1>{{ t('myVehicles.title') }}</h1>
      <p>{{ t('myVehicles.subtitle') }}</p>
    </header>

    <section class="register-panel">
      <h2>{{ t('myVehicles.registerTitle') }}</h2>
      <form class="register-form" @submit.prevent="handleSubmit">
        <label>
          {{ t('myVehicles.brand') }}
          <input v-model.trim="brand" type="text" required />
        </label>
        <label>
          {{ t('myVehicles.model') }}
          <input v-model.trim="model" type="text" required />
        </label>
        <label>
          {{ t('myVehicles.year') }}
          <input v-model.number="year" type="number" min="1900" required />
        </label>
        <label>
          {{ t('myVehicles.mileage') }}
          <input v-model.number="mileage" type="number" min="0" required />
        </label>
        <label>
          {{ t('myVehicles.purchaseDate') }}
          <input v-model="purchaseDate" type="date" required />
        </label>
        <button type="submit" class="primary-btn" :disabled="submitting">
          {{ submitting ? t('myVehicles.saving') : t('myVehicles.save') }}
        </button>
        <p v-if="formError" class="error">{{ formError }}</p>
      </form>
    </section>

    <section class="list-panel">
      <h2>{{ t('myVehicles.listTitle') }}</h2>
      <p v-if="loading" class="status">{{ t('myVehicles.loading') }}</p>
      <p v-else-if="error" class="error">{{ error }}</p>
      <p v-else-if="!vehiclesWithMaintenance.length" class="status">{{ t('myVehicles.empty') }}</p>

      <article v-for="item in vehiclesWithMaintenance" :key="item.vehicle.id" class="vehicle-card">
        <div class="vehicle-card-header">
          <div>
            <h3>{{ item.vehicle.brand }} {{ item.vehicle.model }}</h3>
            <p>
              {{ t('myVehicles.cardMeta', {
                year: item.vehicle.year,
                mileage: item.vehicle.mileage.toLocaleString(),
                purchaseDate: item.vehicle.purchaseDate,
              }) }}
            </p>
          </div>
          <button type="button" class="danger-btn" @click="handleDelete(item.vehicle.id)">
            {{ t('myVehicles.delete') }}
          </button>
        </div>

        <div class="maintenance-block">
          <h4>{{ t('myVehicles.maintenanceTitle') }}</h4>
          <ul>
            <li v-for="visit in item.visits" :key="visit.targetMileage">
              <template v-if="visit.estimatedDate">
                {{ t('myVehicles.maintenanceItemWithDate', {
                  target: visit.targetMileage.toLocaleString(),
                  remaining: visit.kilometersRemaining.toLocaleString(),
                  estimatedDate: visit.estimatedDate,
                }) }}
              </template>
              <template v-else>
                {{ t('myVehicles.maintenanceItem', {
                  target: visit.targetMileage.toLocaleString(),
                  remaining: visit.kilometersRemaining.toLocaleString(),
                }) }}
              </template>
            </li>
          </ul>
        </div>
      </article>
    </section>
  </main>
</template>

<style scoped>
.my-vehicles-page {
  max-width: 960px;
  margin: 0 auto;
  padding: 24px;
}

.page-header h1 {
  margin: 0 0 8px;
  color: var(--ehm-black);
}

.page-header p {
  color: #606f7b;
}

.eyebrow {
  color: var(--ehm-accent);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.register-panel,
.list-panel,
.vehicle-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-top: 24px;
  padding: 20px;
}

.register-form {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
}

label {
  display: grid;
  gap: 6px;
  font-size: 0.85rem;
  font-weight: 700;
  color: #334155;
}

input {
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font: inherit;
  padding: 0.55rem 0.7rem;
}

.primary-btn,
.danger-btn {
  border: 0;
  border-radius: 8px;
  cursor: pointer;
  font: inherit;
  font-weight: 700;
  padding: 0.6rem 0.9rem;
}

.primary-btn {
  background: var(--ehm-black);
  color: #fff;
}

.danger-btn {
  background: #fee2e2;
  color: #b91c1c;
}

.vehicle-card-header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.maintenance-block {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e2e8f0;
}

.maintenance-block ul {
  margin: 0;
  padding-left: 18px;
}

.status {
  color: #64748b;
}

.error {
  color: #b91c1c;
}
</style>
