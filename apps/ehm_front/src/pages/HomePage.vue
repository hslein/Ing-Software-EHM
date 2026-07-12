<script setup lang="ts">
import { ref } from 'vue';
import HeroSection from '../components/HeroSection.vue';
import { useI18n } from '../i18n';

const { t } = useI18n();

const whyChooseSection = ref<HTMLElement>();

const whyChooseCards = [
  {
    image:
      'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=900&q=80',
    titleKey: 'whyChoose.card1.title',
    descKey: 'whyChoose.card1.desc',
  },
  {
    image:
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=80',
    titleKey: 'whyChoose.card2.title',
    descKey: 'whyChoose.card2.desc',
  },
  {
    image:
      'https://images.unsplash.com/photo-1519999482648-25049ddd37b1?auto=format&fit=crop&w=900&q=80',
    titleKey: 'whyChoose.card3.title',
    descKey: 'whyChoose.card3.desc',
  },
];

const legalParagraphs = ['legal.pricing', 'legal.warranty'];

const scrollWhyChoose = (direction: 'left' | 'right') => {
  const el = whyChooseSection.value;
  if (!el) return;

  const amount = direction === 'left' ? -el.clientWidth : el.clientWidth;
  el.scrollBy({ left: amount, behavior: 'smooth' });
};
</script>

<template>
  <main class="home-page">
    <div class="content">
      <HeroSection />

      <section class="why-section">
        <div class="section-container">
          <div class="section-header">
            <p class="eyebrow">{{ t('whyChoose.eyebrow') }}</p>
            <h2>{{ t('whyChoose.title') }}</h2>
            <p class="section-description">
              {{ t('whyChoose.description') }}
            </p>
          </div>

          <div class="carousel-shell">
            <button
              class="carousel-btn carousel-btn-left"
              type="button"
              :aria-label="t('common.previous')"
              @click="scrollWhyChoose('left')"
            >
              &lt;
            </button>

            <div ref="whyChooseSection" class="why-carousel">
              <article v-for="(card, index) in whyChooseCards" :key="card.titleKey" class="why-card">
                <img :src="card.image" :alt="t(card.titleKey)" class="why-image" />
                <div class="why-content">
                  <p class="why-number">{{ index + 1 }}</p>
                  <h3>{{ t(card.titleKey) }}</h3>
                  <p>{{ t(card.descKey) }}</p>
                </div>
              </article>
            </div>

            <button
              class="carousel-btn carousel-btn-right"
              type="button"
              :aria-label="t('common.next')"
              @click="scrollWhyChoose('right')"
            >
              &gt;
            </button>
          </div>
        </div>
      </section>

      <section class="home-stats-band">
        <div class="home-stat">
          <strong>5k+</strong>
          <span>Clientes satisfechos</span>
        </div>
        <div class="home-stat">
          <strong>12</strong>
          <span>Marcas aliadas</span>
        </div>
        <div class="home-stat">
          <strong>100%</strong>
          <span>Acompanamiento EHM</span>
        </div>
      </section>

      <section class="legal-section" aria-labelledby="legal-title">
        <div class="section-container">
          <div class="section-header legal-header">
            <p class="eyebrow">{{ t('legal.eyebrow') }}</p>
            <h2 id="legal-title">{{ t('legal.title') }}</h2>
          </div>

          <div class="legal-card">
            <p v-for="item in legalParagraphs" :key="item">{{ t(item) }}</p>
          </div>
        </div>
      </section>
    </div>
  </main>
</template>

<style scoped>
.home-page {
  min-height: 100vh;
  width: 100%;
}

.content {
  width: 100%;
  padding: 0;
}

.why-section,
.legal-section {
  width: 100%;
  padding: 86px 20px;
}

.why-section {
  background: #fff;
}

.legal-section {
  background: #f9fafb;
}

.section-container {
  max-width: 1200px;
  margin: 0 auto;
}

.section-header {
  max-width: 760px;
  margin: 0 auto 44px;
  text-align: center;
}

.eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: var(--ehm-accent);
  font-size: 12px;
  margin-bottom: 10px;
}

.section-header h2 {
  margin: 0;
  font-size: 34px;
  font-weight: 300;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ehm-black);
}

.section-description {
  margin: 15px auto 0;
  max-width: 620px;
  color: #666;
  font-size: 15px;
  line-height: 1.7;
}

.carousel-shell {
  position: relative;
}

.why-carousel {
  display: flex;
  gap: 28px;
  overflow-x: auto;
  padding: 8px 4px 22px;
  scroll-behavior: smooth;
  scroll-snap-type: x mandatory;
  scrollbar-width: thin;
  scrollbar-color: var(--ehm-accent) #e5e7eb;
}

.why-carousel::-webkit-scrollbar {
  height: 8px;
}

.why-carousel::-webkit-scrollbar-track {
  background: #d7e4ef;
  border-radius: 10px;
}

.why-carousel::-webkit-scrollbar-thumb {
  background: var(--ehm-accent);
  border-radius: 10px;
}

.why-card {
  flex: 0 0 100%;
  overflow: hidden;
  display: grid;
  grid-template-columns: minmax(320px, 0.95fr) minmax(0, 1fr);
  min-height: 440px;
  border-radius: 0;
  background: white;
  border: 1px solid rgba(44, 62, 80, 0.1);
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.12);
  scroll-snap-align: start;
}

.why-image {
  width: 100%;
  height: 100%;
  min-height: 440px;
  object-fit: cover;
  border-left: 8px solid #ff8e71;
}

.why-content {
  align-self: center;
  padding: 56px;
}

.why-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 46px;
  height: 46px;
  margin: 0 0 26px;
  background: #ff8e71;
  color: #fff;
  font-size: 20px;
  font-weight: 800;
}

.why-content h3 {
  margin: 0 0 20px;
  font-size: 30px;
  font-weight: 400;
  line-height: 1.2;
  color: var(--ehm-black);
}

.why-content p {
  margin: 0;
  color: #606f7b;
  font-size: 16px;
  line-height: 1.8;
}

.carousel-btn {
  position: absolute;
  top: 50%;
  z-index: 2;
  display: flex;
  width: 40px;
  height: 40px;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 50%;
  background: rgba(10, 13, 20, 0.82);
  color: white;
  cursor: pointer;
  font-size: 18px;
  transform: translateY(-50%);
  transition: background-color 0.2s, transform 0.2s;
}

.carousel-btn:hover {
  background: var(--ehm-accent);
  transform: translateY(-50%) scale(1.05);
}

.carousel-btn-left {
  left: -20px;
}

.carousel-btn-right {
  right: -20px;
}

.home-stats-band {
  display: flex;
  justify-content: center;
  gap: clamp(40px, 9vw, 120px);
  width: 100%;
  padding: 70px 20px;
  background: var(--ehm-black);
  color: white;
  text-align: center;
}

.home-stat strong {
  display: block;
  color: #ff8e71;
  font-size: 42px;
  font-weight: 200;
  line-height: 1;
}

.home-stat span {
  display: block;
  margin-top: 12px;
  color: #8892b0;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.legal-header {
  margin-bottom: 20px;
}

.legal-card {
  max-width: 920px;
  margin: 0 auto;
  color: #596875;
  font-size: 13px;
  line-height: 1.8;
}

.legal-card p {
  margin: 0;
}

.legal-card p + p {
  margin-top: 16px;
}

@media (max-width: 768px) {
  .content {
    padding: 0;
  }

  .why-section,
  .legal-section {
    padding: 58px 14px;
  }

  .section-header h2 {
    font-size: 26px;
  }

  .why-card {
    grid-template-columns: 1fr;
    min-height: 0;
  }

  .why-image {
    height: 230px;
    min-height: 230px;
    border-left: 0;
    border-top: 6px solid #ff8e71;
  }

  .why-content {
    padding: 26px;
  }

  .why-content h3 {
    font-size: 23px;
  }

  .carousel-btn {
    width: 34px;
    height: 34px;
  }

  .carousel-btn-left {
    left: -8px;
  }

  .carousel-btn-right {
    right: -8px;
  }

  .home-stats-band {
    flex-direction: column;
    gap: 34px;
  }
}
</style>
