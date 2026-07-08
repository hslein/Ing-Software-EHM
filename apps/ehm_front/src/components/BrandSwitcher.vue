<script setup lang="ts">
import { ref } from 'vue';
import type { Brand } from '../composables/useVehicles';
import { useI18n } from '../i18n';

defineProps<{
  brands: Brand[];
  selectedBrandName: string;
}>();

defineEmits<{
  select: [brand: Brand];
}>();

const brandsSection = ref<HTMLElement>();
const { t } = useI18n();

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
  <section class="brands-section" :aria-label="t('brands.ariaLabel')">
    <h2>{{ t('brands.title') }}</h2>
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
  color: #2c3e50;
}

.scroll-container {
  position: relative;
}

.brands-grid {
  display: flex;
  gap: 24px;
  overflow-x: auto;
  padding: 24px 4px;
  scroll-behavior: smooth;
}

.brands-grid::-webkit-scrollbar {
  height: 8px;
}

.brands-grid::-webkit-scrollbar-track {
  background: #d7e4ef;
  border-radius: 10px;
}

.brands-grid::-webkit-scrollbar-thumb {
  background: #2980b9;
  border-radius: 10px;
}

.brand-card {
  flex: 0 0 220px;
  position: relative;
  display: grid;
  grid-template-rows: 150px auto;
  background:
    linear-gradient(135deg, rgba(255, 142, 113, 0.14) 0%, rgba(255, 142, 113, 0) 32%),
    linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  border: 1px solid rgba(44, 62, 80, 0.12);
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
  box-shadow: 0 18px 42px rgba(44, 62, 80, 0.2);
  padding: 12px;
  text-align: left;
  font: inherit;
  color: #fff;
}

.brand-card::before {
  position: absolute;
  inset: 0 0 auto;
  height: 4px;
  background: linear-gradient(90deg, #2980b9, #ff8e71);
  content: '';
}

.brand-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 22px 50px rgba(44, 62, 80, 0.32);
}

.brand-card.active {
  border-color: #ff8e71;
  box-shadow: 0 22px 50px rgba(44, 62, 80, 0.32), 0 0 0 3px rgba(255, 142, 113, 0.18);
}

.brand-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 6px;
  background:
    radial-gradient(circle at 50% 30%, rgba(255, 255, 255, 0.96), rgba(236, 240, 241, 0.84) 45%, rgba(215, 228, 239, 0.95) 100%);
  padding: 18px;
  filter: drop-shadow(0 14px 12px rgba(44, 62, 80, 0.18));
}

.brand-name {
  display: block;
  padding: 14px 2px 2px;
  font-size: 17px;
  color: #fff;
  font-weight: 800;
  line-height: 1.2;
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
    flex: 0 0 176px;
    grid-template-rows: 118px auto;
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
