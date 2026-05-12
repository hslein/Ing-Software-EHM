<script setup lang="ts">
import type { Brand } from '../types/catalog.types';

defineProps<{
  brands: Brand[];
  selectedBrandName: string;
}>();

defineEmits<{
  select: [brand: Brand];
}>();
</script>

<template>
  <section class="brand-switcher" aria-label="Selector de marcas">
    <button
      v-for="brand in brands"
      :key="brand.name"
      type="button"
      class="brand-switcher-button"
      :class="{ active: selectedBrandName === brand.name }"
      :aria-pressed="selectedBrandName === brand.name"
      @click="$emit('select', brand)"
    >
      <img :src="brand.image" :alt="`Logo ${brand.name}`" class="brand-switcher-logo" />
      <span>{{ brand.name }}</span>
    </button>
  </section>
</template>

<style scoped>
.brand-switcher {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.brand-switcher-button {
  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
  gap: 0.7rem;
  min-width: 230px;
  min-height: 82px;
  border: 1px solid #dce3ff;
  border-radius: 18px;
  background: #ffffff;
  color: #30406a;
  font-weight: 700;
  font-size: 1.02rem;
  padding: 0.95rem 1.1rem;
  cursor: pointer;
  box-shadow: 0 10px 22px rgba(24, 38, 76, 0.1);
  transition: all 0.2s ease, box-shadow 0.2s ease;
}

.brand-switcher-button:hover {
  transform: translateY(-2px);
  border-color: #b8c7ff;
  box-shadow: 0 14px 28px rgba(24, 38, 76, 0.15);
}

.brand-switcher-button.active {
  border-color: transparent;
  background: linear-gradient(135deg, #ff6f7a, #ff9b67);
  color: #fff;
  box-shadow: 0 14px 30px rgba(241, 93, 84, 0.34);
}

.brand-switcher-logo {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  object-fit: cover;
  background: #fff;
  padding: 4px;
}

.brand-switcher-button span {
  letter-spacing: 0.01em;
}
</style>
