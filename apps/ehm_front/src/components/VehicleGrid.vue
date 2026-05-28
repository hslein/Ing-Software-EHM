<script setup lang="ts">
import { ref } from 'vue';
import { Heart } from 'lucide-vue-next';
import type { Vehicle } from '../composables/useVehicles';

defineProps<{
  brandName: string;
  selectedCompareIds?: string[];
  vehicles: Vehicle[];
}>();

defineEmits<{
  selectVehicle: [vehicle: Vehicle];
  quoteVehicle: [vehicle: Vehicle];
  toggleCompare: [vehicle: Vehicle];
  toggleFavorite: [vehicle: Vehicle];
}>();

const highlightsSection = ref<HTMLElement>();

const formatVehicleType = (value?: string) => {
  if (!value) {
    return 'Vehicle';
  }

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
    <button v-if="vehicles.length > 0" class="scroll-btn left-btn" type="button" @click="scrollLeft">
      &lt;
    </button>

    <p v-if="vehicles.length === 0" class="empty-message">
      No vehicles found for {{ brandName }}.
    </p>

    <div v-else ref="highlightsSection" class="vehicles-grid">
      <article
        v-for="(vehicle, index) in vehicles"
        :key="vehicle.id ?? `${vehicle.model}-${index}`"
        class="vehicle-card"
      >
        <button
          class="favorite-toggle"
          :class="{ favorite: vehicle.isFavorite }"
          type="button"
          :aria-label="vehicle.isFavorite ? 'Remove from favorites' : 'Add to favorites'"
          :title="vehicle.isFavorite ? 'Remove from favorites' : 'Add to favorites'"
          @click.stop="$emit('toggleFavorite', vehicle)"
        >
          <Heart :size="20" :fill="vehicle.isFavorite ? 'currentColor' : 'none'" />
        </button>
        <img :src="vehicle.image" :alt="`${brandName} ${vehicle.model}`" class="vehicle-image" />
        <div class="vehicle-info">
          <h3>{{ brandName }} {{ vehicle.model }}</h3>
          <p class="type">{{ formatVehicleType(vehicle.type) }}</p>
          <p class="description">{{ vehicle.description }}</p>
          <button
            class="compare-toggle"
            :class="{ selected: selectedCompareIds?.includes(vehicle.id ?? vehicle.model) }"
            type="button"
            @click="$emit('toggleCompare', vehicle)"
          >
            {{ selectedCompareIds?.includes(vehicle.id ?? vehicle.model) ? 'Selected' : 'Compare' }}
          </button>
          <div class="vehicle-actions">
            <button class="btn-primary" type="button" @click="$emit('selectVehicle', vehicle)">
              View Details
            </button>
            <button class="btn-secondary" type="button" @click="$emit('quoteVehicle', vehicle)">
              Quote
            </button>
          </div>
        </div>
      </article>
    </div>

    <button v-if="vehicles.length > 0" class="scroll-btn right-btn" type="button" @click="scrollRight">
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

.empty-message {
  background: white;
  border-radius: 8px;
  color: #666;
  margin: 0;
  padding: 24px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.vehicle-card {
  flex: 0 0 300px;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
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

.favorite-toggle {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 2;
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(44, 62, 80, 0.18);
  border-radius: 50%;
  color: #2c3e50;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.14);
  transition: color 0.2s, transform 0.2s, border-color 0.2s;
}

.favorite-toggle:hover {
  transform: scale(1.08);
  border-color: #e74c3c;
  color: #e74c3c;
}

.favorite-toggle.favorite {
  color: #e21b2d;
  border-color: rgba(226, 27, 45, 0.45);
}

.vehicle-info {
  padding: 15px;
}

.vehicle-info h3 {
  margin: 0 0 5px;
  font-size: 16px;
  color: #333;
}

.type {
  margin: 0 0 10px;
  font-size: 12px;
  color: #2980b9;
  font-weight: 600;
}

.description {
  margin: 0 0 15px;
  font-size: 12px;
  color: #666;
  line-height: 1.4;
}

.vehicle-actions {
  display: flex;
  gap: 10px;
}

.compare-toggle {
  width: 100%;
  margin-bottom: 12px;
  background: #f3f7fb;
  color: #2c3e50;
  border: 1px solid #d7e4ef;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 700;
  font-size: 12px;
  transition: all 0.2s;
}

.compare-toggle:hover,
.compare-toggle.selected {
  background: #e8f4fc;
  border-color: #2980b9;
  color: #2980b9;
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
    left: -35px;
  }

  .right-btn {
    right: -35px;
  }
}
</style>
