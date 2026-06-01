<script setup lang="ts">
import { useI18n } from '../i18n';

defineProps<{
  image: string;
  mission: string;
  vision: string;
}>();

const { t } = useI18n();
</script>

<template>
  <section class="mission-vision-section">
    <div class="mission-vision-container">
      <div class="mission-vision-image">
        <img :src="image" :alt="t('mission.imageAlt')" />
      </div>
      <div class="mission-vision-content">
        <div class="mission">
          <h3>{{ t('mission.title') }}</h3>
          <p>{{ mission }}</p>
        </div>
        <div class="vision">
          <h3>{{ t('vision.title') }}</h3>
          <p>{{ vision }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.mission-vision-section {
  padding: 4rem 2rem;
  background: linear-gradient(135deg, #f8f9ff 0%, #e8f2ff 100%);
  margin: 2rem 0;
}

.mission-vision-container {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  align-items: center;
}

.mission-vision-image img {
  width: 100%;
  height: 400px;
  object-fit: cover;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(42, 53, 89, 0.15);
}

.mission-vision-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.mission,
.vision {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 8px 25px rgba(42, 53, 89, 0.1);
  border: 1px solid #e7ebff;
}

.mission h3,
.vision h3 {
  color: #30406a;
  font-size: 1.5rem;
  margin-bottom: 1rem;
  font-weight: 700;
}

.mission p,
.vision p {
  color: #666;
  line-height: 1.7;
  font-size: 1.1rem;
}

@media (max-width: 768px) {
  .mission-vision-section {
    padding: 2rem 1rem;
  }

  .mission-vision-container {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .mission-vision-image img {
    height: 250px;
  }

  .mission,
  .vision {
    padding: 1.5rem;
  }

  .mission h3,
  .vision h3 {
    font-size: 1.3rem;
  }

  .mission p,
  .vision p {
    font-size: 1rem;
  }
}
</style>
