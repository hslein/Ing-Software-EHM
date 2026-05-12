<script setup lang="ts">
import type { Brand } from '../composables/useVehicles';

defineProps<{
  brands: Brand[];
  selectedBrandName: string;
}>();

defineEmits<{
  select: [brand: Brand];
}>();
</script>

<template>
  <section class="brands-grid" aria-label="Popular brands">
    <button
      v-for="brand in brands"
      :key="brand.id || brand.name"
      type="button"
      class="brand-card"
      :class="{ active: selectedBrandName === brand.name }"
      :aria-pressed="selectedBrandName === brand.name"
      @click="$emit('select', brand)"
    >
      <img :src="brand.image" :alt="brand.name" class="brand-image" />
      <span class="brand-name">{{ brand.name }}</span>
      <span class="brand-count">{{ brand.vehicles?.length || 0 }} vehicles</span>
    </button>
  </section>
</template>

<style scoped>
.brands-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 20px;
}

.brand-card {
  background: white;
  border: 2px solid transparent;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 0;
  text-align: left;
  font: inherit;
}

.brand-card:hover,
.brand-card.active {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.brand-card.active {
  border-color: #2980b9;
}

.brand-image {
  width: 100%;
  height: 120px;
  object-fit: cover;
}

.brand-name {
  display: block;
  padding: 12px 12px 0;
  font-size: 16px;
  font-weight: 700;
  color: #333;
}

.brand-count {
  display: block;
  padding: 4px 12px 12px;
  font-size: 12px;
  color: #666;
}

@media (max-width: 768px) {
  .brands-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 15px;
  }
}
</style>
