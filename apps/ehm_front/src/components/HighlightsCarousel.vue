<script setup lang="ts">
import { ref } from 'vue';
import type { Highlight } from '../types/catalog.types';

defineProps<{
  highlights: Highlight[];
}>();

const highlightsSection = ref<HTMLElement>();

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
  <div class="highlights-container">
    <button class="carousel-arrow left" @click="scrollLeft" aria-label="Previous highlights">
      &lt;
    </button>
    <section ref="highlightsSection" class="highlights-section" aria-label="Beneficios del concesionario">
      <article v-for="item in highlights" :key="item.title" class="highlight-card">
        <div class="highlight-image-container">
          <img :src="item.image" :alt="item.title" class="highlight-image" />
        </div>
        <div class="highlight-content">
          <h3>{{ item.title }}</h3>
          <p>{{ item.description }}</p>
        </div>
      </article>
    </section>
    <button class="carousel-arrow right" @click="scrollRight" aria-label="Next highlights">
      &gt;
    </button>
  </div>
</template>

<style scoped>
.highlights-section {
  display: flex;
  flex-direction: row;
  gap: 1rem;
  margin-bottom: 1.4rem;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  padding: 0 2rem;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.highlights-section::-webkit-scrollbar {
  display: none;
}

.highlights-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  max-width: 1200px;
  margin: 0 auto;
}

.carousel-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid #e7ebff;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 18px;
  font-weight: bold;
  color: #30406a;
  box-shadow: 0 4px 12px rgba(24, 38, 76, 0.15);
  transition: all 0.2s ease;
  z-index: 10;
}

.carousel-arrow:hover {
  background: #ffffff;
  box-shadow: 0 6px 16px rgba(24, 38, 76, 0.2);
  transform: translateY(-50%) scale(1.1);
}

.carousel-arrow.left {
  left: -60px;
}

.carousel-arrow.right {
  right: -60px;
}

.highlight-card {
  overflow: hidden;
  border-radius: 18px;
  background: #fff;
  border: 1px solid #e7ebff;
  box-shadow: 0 12px 26px rgba(24, 38, 76, 0.12);
  min-height: 50vh;
  width: 500px;
  flex-shrink: 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  scroll-snap-align: start;
}

.highlight-image {
  width: 80%;
  height: auto;
  object-fit: cover;
}

.highlight-image-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.highlight-content {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.highlight-content h3 {
  color: #1f2a4a;
  font-size: clamp(1.5rem, 3vw, 2.2rem);
}

.highlight-content p {
  margin-top: 0.75rem;
  color: #576285;
  line-height: 1.6;
  font-size: 1.05rem;
}

@media (max-width: 768px) {
  .highlight-card {
    min-height: 86vh;
    grid-template-columns: 1fr;
  }

  .highlight-image {
    height: 48vh;
  }

  .highlight-content {
    padding: 1.2rem 1rem 1.4rem;
  }
}
</style>
