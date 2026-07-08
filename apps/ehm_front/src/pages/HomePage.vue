<script setup lang="ts">
import HeroSection from '../components/HeroSection.vue';
import { useI18n } from '../i18n';

const { t } = useI18n();
</script>

<template>
  <main class="home-page">
    <div class="content">
      <HeroSection />

      <section class="info-section">
        <div class="info-header">
          <p class="eyebrow">{{ t('info.eyebrow') }}</p>
          <h2>{{ t('info.title') }}</h2>
          <p class="info-description">
            {{ t('info.description') }}
          </p>
        </div>

        <div class="info-cards">
          <article class="info-card">
            <img
              src="https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=900&q=80"
              :alt="t('info.card1.title')"
              class="info-image"
            />
            <div class="info-content">
              <h3>{{ t('info.card1.title') }}</h3>
              <p>{{ t('info.card1.desc') }}</p>
            </div>
          </article>

          <article class="info-card">
            <img
              src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=80"
              :alt="t('info.card2.title')"
              class="info-image"
            />
            <div class="info-content">
              <h3>{{ t('info.card2.title') }}</h3>
              <p>{{ t('info.card2.desc') }}</p>
            </div>
          </article>

          <article class="info-card">
            <img
              src="https://images.unsplash.com/photo-1519999482648-25049ddd37b1?auto=format&fit=crop&w=900&q=80"
              :alt="t('info.card3.title')"
              class="info-image"
            />
            <div class="info-content">
              <h3>{{ t('info.card3.title') }}</h3>
              <p>{{ t('info.card3.desc') }}</p>
            </div>
          </article>
        </div>
      </section>
    </div>
  </main>
</template>

<style scoped>
.home-page {
  min-height: 100vh;
}

.content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.info-section {
  background: white;
  border-radius: 16px;
  padding: 30px 25px;
  margin-bottom: 40px;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.05);
}

.info-header {
  max-width: 760px;
  margin: 0 auto 30px;
  text-align: center;
}

.eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: #2980b9;
  font-size: 12px;
  margin-bottom: 10px;
}

.info-header h2 {
  margin: 0;
  font-size: 28px;
  color: #2c3e50;
}

.info-description {
  margin: 15px auto 0;
  max-width: 620px;
  color: #666;
  font-size: 15px;
  line-height: 1.7;
}

.info-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
}

.info-card {
  overflow: hidden;
  border-radius: 14px;
  background: #f9fafb;
  display: flex;
  flex-direction: column;
  min-height: 100%;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.05);
}

.info-image {
  width: 100%;
  height: 180px;
  object-fit: cover;
}

.info-content {
  padding: 18px;
}

.info-content h3 {
  margin: 0 0 10px;
  font-size: 18px;
  color: #2c3e50;
}

.info-content p {
  margin: 0;
  color: #606f7b;
  line-height: 1.7;
}
</style>
