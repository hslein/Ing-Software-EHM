import type { App } from 'vue';
import { ref, computed, inject, type InjectionKey, type Ref } from 'vue';
import { messages, type Locale } from './messages';

const STORAGE_KEY = 'ehm-locale';

export interface I18nContext {
  locale: Ref<Locale>;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

export const i18nKey: InjectionKey<I18nContext> = Symbol('i18n');

function readStoredLocale(): Locale {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'es' || stored === 'en') return stored;
  const browser = navigator.language.toLowerCase();
  return browser.startsWith('es') ? 'es' : 'en';
}

function applyHtmlLang(locale: Locale) {
  document.documentElement.lang = locale;
}

function translate(
  locale: Locale,
  key: string,
  params?: Record<string, string | number>
): string {
  const dict = messages[locale];
  let text = dict[key] ?? messages.en[key] ?? key;
  if (params) {
    for (const [name, value] of Object.entries(params)) {
      text = text.replaceAll(`{${name}}`, String(value));
    }
  }
  return text;
}

export function createI18n() {
  const locale = ref<Locale>(readStoredLocale());
  applyHtmlLang(locale.value);

  const setLocale = (next: Locale) => {
    locale.value = next;
    localStorage.setItem(STORAGE_KEY, next);
    applyHtmlLang(next);
  };

  const t = (key: string, params?: Record<string, string | number>) =>
    translate(locale.value, key, params);

  return { locale, setLocale, t };
}

export function installI18n(app: App) {
  const i18n = createI18n();
  app.provide(i18nKey, i18n);
  app.config.globalProperties.$t = i18n.t;
  app.config.globalProperties.$locale = i18n.locale;
}

export function useI18n(): I18nContext {
  const ctx = inject(i18nKey);
  if (!ctx) {
    throw new Error('useI18n() must be used after installI18n() in main.ts');
  }
  return ctx;
}

export function useLocaleLabel(locale: Ref<Locale>) {
  return computed(() => (locale.value === 'es' ? 'ES' : 'EN'));
}
