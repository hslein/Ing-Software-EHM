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
  min-height: 62vh;
  padding: 120px 20px 96px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background:
    linear-gradient(rgba(10, 13, 20, 0.72), rgba(10, 13, 20, 0.9)),
    url('https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=2000&q=80');
  background-position: center;
  background-size: cover;
  color: white;
}

.hero h1 {
  font-size: clamp(34px, 6vw, 58px);
  margin-bottom: 18px;
  font-weight: 300;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.hero-subtitle {
  max-width: 680px;
  margin: 0 auto;
  color: #d7e4ef;
  font-size: 18px;
  font-weight: 300;
  line-height: 1.7;
}

@media (max-width: 768px) {
  .hero {
    min-height: 56vh;
    padding: 96px 18px 72px;
  }

  .hero h1 {
    letter-spacing: 0.08em;
  }
}
</style>
