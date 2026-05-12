<script setup lang="ts">
import { ref } from 'vue';
import type { Vehicle } from '../composables/useVehicles';

defineProps<{
  brandName: string;
  vehicles: Vehicle[];
}>();

defineEmits<{
  selectVehicle: [vehicle: Vehicle];
  vehicleAction: [action: string, vehicle: Vehicle];
}>();

const highlightsSection = ref<HTMLElement>();

const toTitleCase = (value: string) => {
  return value.charAt(0).toUpperCase() + value.slice(1);
};

const scrollLeft = () => {
  const el = highlightsSection.value;
  if (!el) return;

  if (el.scrollLeft === 0) {
    el.scrollTo({ left: el.scrollWidth, behavior: 'smooth' });
    return;
  }

  el.scrollBy({ left: -520, behavior: 'smooth' });
};

const scrollRight = () => {
  const el = highlightsSection.value;
  if (!el) return;

  if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 1) {
    el.scrollTo({ left: 0, behavior: 'smooth' });
    return;
  }

  el.scrollBy({ left: 520, behavior: 'smooth' });
};
</script>

<template>
  <div class="scroll-container">
    <button type="button" class="scroll-btn left-btn" aria-label="Previous vehicles" @click="scrollLeft">
      &lt;
    </button>

    <section ref="highlightsSection" class="vehicles-grid" aria-label="Vehicles">
      <article v-for="vehicle in vehicles" :key="vehicle.id || vehicle.model" class="vehicle-card">
        <img :src="vehicle.image" :alt="`${brandName} ${vehicle.model}`" class="vehicle-image" />
        <div class="vehicle-info">
          <h3>{{ brandName }} {{ vehicle.model }}</h3>
          <p class="type">{{ toTitleCase(vehicle.type) }}</p>
          <p class="description">{{ vehicle.description }}</p>
          <div class="vehicle-actions">
            <button type="button" class="btn-primary" @click="$emit('selectVehicle', vehicle)">
              View Details
            </button>
            <button type="button" class="btn-secondary" @click="$emit('vehicleAction', 'Cotizar', vehicle)">
              Quote
            </button>
          </div>
        </div>
      </article>
    </section>

    <button type="button" class="scroll-btn right-btn" aria-label="Next vehicles" @click="scrollRight">
      &gt;
    </button>
  </div>
</template>

<style scoped>
.scroll-container {
  position: relative;
  margin-bottom: 20px;
}

.vehicles-grid {
  display: flex;
  gap: 20px;
  overflow-x: auto;
  padding: 20px 0;
  scroll-behavior: smooth;
}

.vehicles-grid::-webkit-scrollbar {
  height: 8px;
}

.vehicles-grid::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.vehicles-grid::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 10px;
}

.vehicle-card {
  flex: 0 0 300px;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.vehicle-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.vehicle-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.vehicle-info {
  padding: 15px;
}

.vehicle-info h3 {
  margin: 0 0 5px 0;
  font-size: 16px;
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
  font-size: 12px;
  color: #666;
  line-height: 1.4;
}

.vehicle-actions {
  display: flex;
  gap: 10px;
}

.scroll-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
  z-index: 10;
}

.scroll-btn:hover {
  background-color: rgba(0, 0, 0, 0.7);
}

.left-btn {
  left: -50px;
}

.right-btn {
  right: -50px;
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

@media (max-width: 768px) {
  .vehicle-card {
    flex: 0 0 250px;
  }

  .scroll-btn {
    width: 30px;
    height: 30px;
    font-size: 16px;
  }

  .left-btn {
    left: -8px;
  }

  .right-btn {
    right: -8px;
  }
}
</style>
