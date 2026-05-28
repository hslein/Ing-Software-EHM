<script setup lang="ts">
import { ref } from 'vue';
import type { Brand } from '../composables/useVehicles';

defineProps<{
  brands: Brand[];
  selectedBrandName: string;
}>();

defineEmits<{
  select: [brand: Brand];
}>();

const brandsSection = ref<HTMLElement>();

const scrollLeft = () => {
  const el = brandsSection.value;
  if (!el) return;

  if (el.scrollLeft === 0) {
    el.scrollTo({ left: el.scrollWidth, behavior: 'smooth' });
    return;
  }

  el.scrollBy({ left: -520, behavior: 'smooth' });
};

const scrollRight = () => {
  const el = brandsSection.value;
  if (!el) return;

  if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 1) {
    el.scrollTo({ left: 0, behavior: 'smooth' });
    return;
  }

  el.scrollBy({ left: 520, behavior: 'smooth' });
};
</script>

<template>
  <section class="brands-section" aria-label="Popular brands">
    <h2>Popular Brands</h2>
    <div class="scroll-container">
      <button v-if="brands.length > 0" class="scroll-btn left-btn" type="button" @click="scrollLeft">
        &lt;
      </button>

      <div ref="brandsSection" class="brands-grid">
        <button
          v-for="brand in brands"
          :key="brand.id ?? brand.name"
          type="button"
          class="brand-card"
          :class="{ active: selectedBrandName === brand.name }"
          :aria-pressed="selectedBrandName === brand.name"
          @click="$emit('select', brand)"
        >
          <img :src="brand.image" :alt="brand.name" class="brand-image" />
          <span class="brand-name">{{ brand.name }}</span>
        </button>
      </div>

      <button v-if="brands.length > 0" class="scroll-btn right-btn" type="button" @click="scrollRight">
        &gt;
      </button>
    </div>
  </section>
</template>

<style scoped>
.brands-section {
  margin-bottom: 40px;
}

.brands-section h2 {
  font-size: 24px;
  margin-bottom: 20px;
  color: #333;
}

.scroll-container {
  position: relative;
}

.brands-grid {
  display: flex;
  gap: 20px;
  overflow-x: auto;
  padding: 20px 0;
  scroll-behavior: smooth;
}

.brands-grid::-webkit-scrollbar {
  height: 8px;
}

.brands-grid::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.brands-grid::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 10px;
}

.brand-card {
  flex: 0 0 180px;
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

.brand-card:hover {
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
  padding: 12px;
  font-size: 16px;
  color: #333;
  font-weight: 700;
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

@media (max-width: 768px) {
  .brand-card {
    flex: 0 0 140px;
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
