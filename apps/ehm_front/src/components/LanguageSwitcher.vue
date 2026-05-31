<template>
  <div class="lang-switcher" role="group" :aria-label="t('lang.label')">
    <button
      type="button"
      class="lang-btn"
      :class="{ active: locale === 'es' }"
      :aria-pressed="locale === 'es'"
      @click="setLocale('es')"
    >
      {{ t('lang.es') }}
    </button>
    <span class="lang-divider" aria-hidden="true">|</span>
    <button
      type="button"
      class="lang-btn"
      :class="{ active: locale === 'en' }"
      :aria-pressed="locale === 'en'"
      @click="setLocale('en')"
    >
      {{ t('lang.en') }}
    </button>
  </div>
</template>

<script setup lang="ts">
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
  border: none;
  background: transparent;
  color: #bdc3c7;
  font-size: 0.78rem;
  font-weight: 700;
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
  background: linear-gradient(135deg, #2980b9 0%, #2c3e50 100%);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
}

.lang-divider {
  color: rgba(255, 255, 255, 0.25);
  font-size: 0.75rem;
  user-select: none;
}
</style>
