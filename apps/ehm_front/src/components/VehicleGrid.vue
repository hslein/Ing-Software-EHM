<script setup lang="ts">
import type { Vehicle } from '../types/catalog.types';

defineProps<{
  brandName: string;
  vehicles: Vehicle[];
}>();

defineEmits<{
  selectVehicle: [vehicle: Vehicle];
}>();

const toTitleCase = (value: string) => {
  return value.charAt(0).toUpperCase() + value.slice(1);
};
</script>

<template>
  <section class="catalog-grid">
    <button
      v-for="vehicle in vehicles"
      :key="vehicle.id"
      class="car-card"
      type="button"
      :aria-label="`Seleccionar ${brandName} ${vehicle.model}`"
      @click="$emit('selectVehicle', vehicle)"
    >
      <div class="image-wrapper">
        <img :src="vehicle.image" :alt="`${brandName} ${vehicle.model}`" class="car-image" />
      </div>
      <div class="car-content">
        <h2>{{ brandName }}</h2>
        <p>{{ vehicle.model }}</p>
        <span class="car-tag">{{ toTitleCase(vehicle.type) }}</span>
      </div>
    </button>
  </section>
</template>

<style scoped>
.catalog-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap: 1.3rem;
}

.car-card {
  text-align: left;
  width: 100%;
  font: inherit;
  color: inherit;
  cursor: pointer;
  background: linear-gradient(180deg, #ffffff 0%, #f8faff 100%);
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid #e7ebff;
  box-shadow: 0 12px 30px rgba(24, 38, 76, 0.12);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.car-card:hover {
  transform: translateY(-7px);
  box-shadow: 0 16px 38px rgba(24, 38, 76, 0.2);
}

.car-card:focus-visible {
  outline: 3px solid #ff8b54;
  outline-offset: 2px;
}

.image-wrapper {
  overflow: hidden;
}

.car-image {
  width: 100%;
  height: 170px;
  object-fit: cover;
  transition: transform 0.35s ease;
}

.car-card:hover .car-image {
  transform: scale(1.06);
}

.car-content {
  padding: 1rem 1rem 1.1rem;
}

.car-content h2 {
  font-size: 1.1rem;
  color: #1f2a4a;
}

.car-content p {
  color: #566086;
  margin-top: 0.35rem;
}

.car-tag {
  display: inline-block;
  margin-top: 0.75rem;
  font-size: 0.8rem;
  font-weight: 700;
  color: #0e7a4b;
  background-color: #d9f7e8;
  padding: 0.3rem 0.6rem;
  border-radius: 999px;
}
</style>
