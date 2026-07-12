<template>
  <div class="lang-switcher" role="group" :aria-label="t('lang.label')">
    <button
      type="button"
      class="lang-btn"
      :class="{ active: locale === 'es' }"
      :aria-pressed="locale === 'es'"
      :aria-label="t('lang.switchToSpanish')"
      :title="t('lang.switchToSpanish')"
      @click="setLocale('es')"
    >
      <img class="flag" :src="spainFlag" :alt="t('lang.es')" width="18" height="18" />
      <span class="lang-code">ES</span>
    </button>
    <button
      type="button"
      class="lang-btn"
      :class="{ active: locale === 'en' }"
      :aria-pressed="locale === 'en'"
      :aria-label="t('lang.switchToEnglish')"
      :title="t('lang.switchToEnglish')"
      @click="setLocale('en')"
    >
      <img class="flag" :src="usaFlag" :alt="t('lang.en')" width="18" height="18" />
      <span class="lang-code">EN</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import spainFlag from '../assets/spain.png';
import usaFlag from '../assets/usa.png';
import { useI18n } from '../i18n';

const { locale, setLocale, t } = useI18n();
</script>

<style scoped>
.lang-switcher {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.2rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.lang-btn {
  align-items: center;
  border: none;
  background: transparent;
  color: #bdc3c7;
  display: inline-flex;
  font-size: 0.78rem;
  font-weight: 700;
  gap: 0.35rem;
  letter-spacing: 0.02em;
  padding: 0.35rem 0.65rem;
  border-radius: 999px;
  cursor: pointer;
  transition: color 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease;
}

.lang-btn:hover {
  color: #ecf0f1;
}

.lang-btn.active {
  color: #fff;
  background: linear-gradient(135deg, var(--ehm-accent) 0%, var(--ehm-black-3) 100%);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
}

.lang-btn .flag {
  aspect-ratio: 1;
  border-radius: 50%;
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.35);
  display: block;
  flex: 0 0 18px;
  height: 18px;
  max-height: 18px;
  max-width: 18px;
  object-fit: cover;
  width: 18px;
}

.lang-code {
  line-height: 1;
}
</style>
