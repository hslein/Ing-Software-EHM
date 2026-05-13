<script setup lang="ts">
import type { Vehicle } from '../composables/useVehicles';

defineProps<{
  vehicles: Vehicle[];
}>();

defineEmits<{
  close: [];
  remove: [vehicle: Vehicle];
}>();

const formatVehicleType = (value?: string) => {
  if (!value) {
    return 'Vehicle';
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
};

const formatPrice = (price?: number) => {
  if (!price) {
    return 'Not available';
  }

  return `$${price.toLocaleString()}`;
};

const formatMileage = (mileage?: number) => {
  if (mileage === undefined) {
    return 'Not available';
  }

  return `${mileage.toLocaleString()} km`;
};
</script>

<template>
  <div class="modal" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <button class="close-btn" type="button" @click="$emit('close')">&times;</button>

      <div class="modal-header">
        <p class="eyebrow">Vehicle comparison</p>
        <h2>Compare your selected vehicles</h2>
      </div>

      <div class="compare-grid">
        <article v-for="vehicle in vehicles" :key="vehicle.id ?? vehicle.model" class="compare-card">
          <img :src="vehicle.image" :alt="`${vehicle.brand} ${vehicle.model}`" />
          <div class="compare-card-header">
            <div>
              <p class="brand-name">{{ vehicle.brand }}</p>
              <h3>{{ vehicle.model }}</h3>
            </div>
            <button class="remove-btn" type="button" @click="$emit('remove', vehicle)">
              Remove
            </button>
          </div>
          <p class="description">{{ vehicle.description }}</p>

          <dl class="detail-list">
            <div>
              <dt>Type</dt>
              <dd>{{ formatVehicleType(vehicle.type) }}</dd>
            </div>
            <div>
              <dt>Year</dt>
              <dd>{{ vehicle.year ?? 'Not available' }}</dd>
            </div>
            <div>
              <dt>Price</dt>
              <dd>{{ formatPrice(vehicle.price) }}</dd>
            </div>
            <div>
              <dt>Mileage</dt>
              <dd>{{ formatMileage(vehicle.mileage) }}</dd>
            </div>
          </dl>
        </article>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  padding: 28px;
  max-width: 980px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
}

.close-btn {
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  font-size: 28px;
  cursor: pointer;
  color: #666;
}

.modal-header {
  padding-right: 40px;
  margin-bottom: 22px;
}

.eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #2980b9;
  font-size: 12px;
  font-weight: 700;
  margin: 0 0 8px;
}

.modal-header h2 {
  margin: 0;
  color: #2c3e50;
  font-size: 24px;
}

.compare-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
}

.compare-card {
  border: 1px solid #e5edf3;
  border-radius: 8px;
  overflow: hidden;
  background: #fbfcfd;
}

.compare-card img {
  width: 100%;
  height: 220px;
  object-fit: cover;
  background: #eef3f7;
}

.compare-card-header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 18px 18px 0;
}

.brand-name {
  margin: 0 0 4px;
  color: #2980b9;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
}

.compare-card h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 20px;
}

.remove-btn {
  align-self: flex-start;
  background: white;
  color: #c0392b;
  border: 1px solid #f0c4bd;
  border-radius: 4px;
  padding: 7px 10px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 700;
}

.remove-btn:hover {
  background: #fff4f2;
}

.description {
  margin: 12px 18px 18px;
  color: #606f7b;
  font-size: 13px;
  line-height: 1.5;
}

.detail-list {
  margin: 0;
  padding: 0 18px 18px;
}

.detail-list div {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 10px 0;
  border-top: 1px solid #e8eef3;
}

.detail-list dt {
  color: #667783;
  font-size: 13px;
}

.detail-list dd {
  margin: 0;
  color: #2c3e50;
  font-size: 13px;
  font-weight: 700;
  text-align: right;
}

@media (max-width: 760px) {
  .modal-content {
    padding: 22px;
  }

  .compare-grid {
    grid-template-columns: 1fr;
  }
}
</style>
