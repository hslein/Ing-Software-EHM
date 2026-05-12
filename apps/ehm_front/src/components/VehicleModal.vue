<script setup lang="ts">
import type { Vehicle } from '../composables/useVehicles';

defineProps<{
  brandName: string;
  vehicle: Vehicle | null;
}>();

defineEmits<{
  close: [];
  vehicleAction: [action: string, vehicle: Vehicle];
}>();

const toTitleCase = (value: string) => {
  return value.charAt(0).toUpperCase() + value.slice(1);
};
</script>

<template>
  <div v-if="vehicle" class="modal" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <button type="button" class="close-btn" aria-label="Close vehicle details" @click="$emit('close')">
        &times;
      </button>
      <img :src="vehicle.image" :alt="`${brandName} ${vehicle.model}`" />
      <h2>{{ brandName }} {{ vehicle.model }}</h2>
      <p class="type">Type: {{ toTitleCase(vehicle.type) }}</p>
      <p class="description">{{ vehicle.description }}</p>
      <div v-if="vehicle.year" class="detail-row">
        <span>Year:</span>
        <strong>{{ vehicle.year }}</strong>
      </div>
      <div v-if="vehicle.price" class="detail-row">
        <span>Price:</span>
        <strong>${{ vehicle.price.toLocaleString() }}</strong>
      </div>
      <div v-if="vehicle.mileage !== undefined" class="detail-row">
        <span>Mileage:</span>
        <strong>{{ vehicle.mileage?.toLocaleString() }} km</strong>
      </div>
      <div class="modal-actions">
        <button type="button" class="btn-primary" @click="$emit('vehicleAction', 'Cotizar', vehicle)">
          Request Quote
        </button>
        <button type="button" class="btn-secondary" @click="$emit('vehicleAction', 'Test Drive', vehicle)">
          Schedule Test Drive
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  padding: 30px;
  max-width: 500px;
  width: 90%;
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

.modal-content img {
  width: 100%;
  height: 250px;
  object-fit: cover;
  border-radius: 4px;
  margin-bottom: 20px;
}

.modal-content h2 {
  margin: 0 0 10px 0;
  color: #333;
}

.type {
  margin: 0 0 10px 0;
  font-size: 12px;
  color: #2980b9;
  font-weight: 600;
}

.description {
  margin: 0 0 15px 0;
  font-size: 14px;
  color: #666;
  line-height: 1.5;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}

.detail-row span {
  color: #666;
}

.detail-row strong {
  color: #333;
}

.modal-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.btn-primary {
  background: linear-gradient(135deg, #2980b9 0%, #2c3e50 100%);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  font-size: 12px;
  transition: transform 0.2s;
  flex: 1;
}

.btn-primary:hover {
  transform: scale(1.05);
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
}

.btn-secondary {
  background: white;
  color: #2980b9;
  border: 2px solid #2980b9;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  font-size: 12px;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: #2980b9;
  color: white;
}
</style>
