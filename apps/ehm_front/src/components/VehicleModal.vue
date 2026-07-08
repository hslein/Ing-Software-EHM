<script setup lang="ts">
import type { Vehicle } from '../composables/useVehicles';
import { useI18n } from '../i18n';

defineProps<{
  brandName: string;
  vehicle: Vehicle | null;
}>();

defineEmits<{
  close: [];
  quote: [vehicle: Vehicle];
  testDrive: [vehicle: Vehicle];
}>();

const { t } = useI18n();

const hasValue = (value?: number | string | null) => {
  return value !== undefined && value !== null && String(value).trim() !== '';
};

const toTitleCase = (value?: string) => {
  if (!hasValue(value)) {
    return '';
  }

  const text = String(value);
  return text.charAt(0).toUpperCase() + text.slice(1);
};

const formatPrice = (price?: number) => {
  if (!hasValue(price)) {
    return '';
  }

  return `$${Number(price).toLocaleString()} COP`;
};

const formatMeta = (vehicle: Vehicle) => {
  return [vehicle.year, vehicle.fuelType, toTitleCase(vehicle.type)].filter(hasValue).join(' | ');
};

const getVehicleSpecs = (vehicle: Vehicle) =>
  [
    { label: 'Motor', value: vehicle.engine },
    { label: 'Potencia', value: vehicle.horsepower },
    { label: 'Torque', value: vehicle.torque },
    { label: 'Vel. max', value: vehicle.topSpeed },
    { label: '0-100', value: vehicle.acceleration },
    { label: 'Capacidad', value: vehicle.capacity },
    { label: 'Asientos', value: vehicle.seats },
    { label: 'Kilometraje', value: hasValue(vehicle.mileage) ? `${vehicle.mileage} km` : '' },
  ].filter((spec) => hasValue(spec.value));
</script>

<template>
  <div v-if="vehicle" class="modal" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <button
        class="close-btn"
        type="button"
        :aria-label="t('common.close')"
        @click="$emit('close')"
      >
        &times;
      </button>

      <section class="vehicle-detail-card">
        <div class="vehicle-media">
          <img :src="vehicle.image" :alt="`${brandName} ${vehicle.model}`" />
          <p class="image-note">*Imagen de referencia</p>
        </div>

        <div class="vehicle-content">
          <div class="vehicle-heading">
            <p v-if="brandName" class="brand-name">{{ brandName }}</p>
            <h2>{{ vehicle.model }}</h2>
            <p v-if="formatMeta(vehicle)" class="vehicle-meta">{{ formatMeta(vehicle) }}</p>
          </div>

          <p class="description">{{ vehicle.description }}</p>

          <dl v-if="getVehicleSpecs(vehicle).length" class="spec-grid">
            <div v-for="spec in getVehicleSpecs(vehicle)" :key="spec.label" class="spec-item">
              <dt>{{ spec.label }}</dt>
              <dd>{{ spec.value }}</dd>
            </div>
          </dl>

          <div class="price-block">
            <p class="price-kicker">Desde</p>
            <p class="price-value">{{ formatPrice(vehicle.price) || 'Consultar precio' }}</p>
            <p v-if="vehicle.price" class="price-note">*Precio sugerido al publico</p>
          </div>

          <hr class="detail-divider" />

          <div class="modal-actions">
            <button class="btn-primary" type="button" @click="$emit('quote', vehicle)">
              {{ t('modal.requestQuote') }}
            </button>
            <button class="btn-secondary" type="button" @click="$emit('testDrive', vehicle)">
              {{ t('modal.scheduleTestDrive') }}
            </button>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.modal {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.68);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 24px;
}

.modal-content {
  width: min(960px, 100%);
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  border-radius: 8px;
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  color: #fff;
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.34);
}

.close-btn {
  position: absolute;
  top: 14px;
  right: 14px;
  z-index: 2;
  width: 36px;
  height: 36px;
  background: rgba(255, 255, 255, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 50%;
  color: #fff;
  cursor: pointer;
  font-size: 24px;
  line-height: 1;
}

.vehicle-detail-card {
  display: grid;
  grid-template-columns: minmax(280px, 1fr) minmax(320px, 0.9fr);
  gap: 24px;
  min-height: 560px;
  padding: 24px;
}

.vehicle-media {
  position: relative;
  min-height: 420px;
  overflow: hidden;
  border-radius: 8px;
  background: linear-gradient(180deg, rgba(236, 240, 241, 0.98) 0%, rgba(215, 228, 239, 0.94) 100%);
}

.vehicle-media img {
  width: 100%;
  height: 100%;
  min-height: 420px;
  object-fit: contain;
  padding: 28px;
}

.image-note {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  margin: 0;
  background: #2980b9;
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  padding: 6px 10px;
  text-align: center;
}

.vehicle-content {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 20px;
  padding: 24px 6px 4px;
}

.brand-name {
  margin: 0 0 8px;
  color: #d7e4ef;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.vehicle-heading h2 {
  margin: 0;
  color: #fff;
  font-size: 34px;
  font-weight: 700;
  line-height: 1.1;
}

.vehicle-meta {
  margin: 10px 0 0;
  color: #ecf0f1;
  font-size: 13px;
  font-weight: 700;
}

.description {
  margin: 0;
  color: #f5f7fa;
  font-size: 14px;
  line-height: 1.6;
}

.spec-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin: 0;
}

.spec-item {
  min-width: 0;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.08);
  padding: 9px 10px;
}

.spec-item dt {
  margin: 0 0 4px;
  color: #d7e4ef;
  font-size: 10px;
  font-weight: 800;
  line-height: 1.2;
  text-transform: uppercase;
}

.spec-item dd {
  margin: 0;
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  line-height: 1.3;
  overflow-wrap: anywhere;
}

.price-block p {
  margin: 0;
}

.price-kicker,
.price-note {
  color: #d7e4ef;
  font-size: 10px;
  line-height: 1.4;
}

.price-value {
  color: #fff;
  font-size: 24px;
  font-weight: 800;
  line-height: 1.3;
}

.detail-divider {
  width: 100%;
  height: 0;
  margin: 0;
  border: 0;
  border-top: 1px solid rgba(215, 228, 239, 0.35);
}

.modal-actions {
  display: flex;
  gap: 12px;
}

.btn-primary,
.btn-secondary {
  min-height: 42px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 700;
  font-size: 13px;
  padding: 10px 16px;
  transition: background-color 0.2s, border-color 0.2s, color 0.2s, transform 0.2s;
}

.btn-primary {
  flex: 1;
  background: #2980b9;
  border: 1px solid #2980b9;
  color: white;
}

.btn-primary:hover {
  background: #ff8e71;
  border-color: #ff8e71;
  transform: translateY(-1px);
}

.btn-secondary {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.75);
  color: #fff;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: #ff8e71;
  color: #ffb19d;
}

@media (max-width: 780px) {
  .modal {
    align-items: flex-start;
    padding: 16px;
  }

  .vehicle-detail-card {
    grid-template-columns: 1fr;
    min-height: 0;
    padding: 18px;
  }

  .vehicle-media,
  .vehicle-media img {
    min-height: 280px;
  }

  .vehicle-content {
    padding: 0;
  }

  .vehicle-heading h2 {
    font-size: 28px;
  }

  .spec-grid {
    grid-template-columns: 1fr;
  }

  .modal-actions {
    flex-direction: column;
  }
}
</style>
