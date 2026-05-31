<template>
  <section class="hero">
    <h1>{{ t('hero.title') }}</h1>
    <p class="hero-subtitle">{{ t('hero.subtitle') }}</p>
  </section>
</template>

<script setup lang="ts">
import { useI18n } from '../i18n';

const { t } = useI18n();
</script>

<style scoped>
.hero {
  text-align: center;
  padding: 40px 20px;
  margin-bottom: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  border-radius: 8px;
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  color: white;
}

.hero h1 {
  font-size: 32px;
  margin-bottom: 10px;
  font-weight: 700;
}

.hero-subtitle {
  font-size: 16px;
  opacity: 0.9;
}
</style>
