<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-lang">
        <LanguageSwitcher
         />
      </div>
      <h1>{{ t('login.title') }}</h1>
      <p class="subtitle">{{ t('login.subtitle') }}</p>

      <div v-if="isLogin" class="form-section">
        <h2>{{ t('login.login') }}</h2>
        <form @submit.prevent="handleLogin">
          <div class="form-group">
            <label for="email">{{ t('login.email') }}</label>
            <input
              id="email"
              v-model="email"
              type="email"
              :placeholder="t('login.emailPlaceholder')"
              required
            />
          </div>

          <div class="form-group">
            <label for="password">{{ t('login.password') }}</label>
            <input
              id="password"
              v-model="password"
              type="password"
              :placeholder="t('login.passwordPlaceholder')"
              required
            />
          </div>

          <button type="submit" class="btn-submit" :disabled="loading">
            {{ loading ? t('login.loggingIn') : t('login.login') }}
          </button>

          <div v-if="error" class="error-message">
            {{ error }}
          </div>

          <p class="toggle-form">
            {{ t('login.noAccount') }}
            <button type="button" @click="toggleForm">{{ t('login.register') }}</button>
          </p>
        </form>
      </div>

      <div v-else class="form-section">
        <h2>{{ t('login.register') }}</h2>
        <form @submit.prevent="handleRegister">
          <div class="form-group">
            <label for="reg-email">{{ t('login.email') }}</label>
            <input
              id="reg-email"
              v-model="email"
              type="email"
              :placeholder="t('login.emailPlaceholder')"
              required
            />
          </div>

          <div class="form-group">
            <label for="reg-password">{{ t('login.password') }}</label>
            <input
              id="reg-password"
              v-model="password"
              type="password"
              :placeholder="t('login.passwordPlaceholder')"
              required
              minlength="6"
            />
          </div>

          <div class="form-group">
            <label for="confirm-password">{{ t('login.confirmPassword') }}</label>
            <input
              id="confirm-password"
              v-model="confirmPassword"
              type="password"
              :placeholder="t('login.passwordPlaceholder')"
              required
              minlength="6"
            />
          </div>

          <button type="submit" class="btn-submit" :disabled="loading">
            {{ loading ? t('login.registering') : t('login.register') }}
          </button>

          <div v-if="error" class="error-message">
            {{ error }}
          </div>

          <p class="toggle-form">
            {{ t('login.hasAccount') }}
            <button type="button" @click="toggleForm">{{ t('login.login') }}</button>
          </p>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from '../i18n';
import { useAuth } from '../composables/useAuth';
import LanguageSwitcher from '../components/LanguageSwitcher.vue';

const { t } = useI18n();
const router = useRouter();
const { login, register, loading } = useAuth();

const isLogin = ref(true);
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const error = ref<string | null>(null);

const toggleForm = () => {
  isLogin.value = !isLogin.value;
  error.value = null;
  email.value = '';
  password.value = '';
  confirmPassword.value = '';
};

const handleLogin = async () => {
  error.value = null;
  try {
    await login(email.value, password.value);
    router.push('/');
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : t('login.loginFailed');
  }
};

const handleRegister = async () => {
  error.value = null;

  if (password.value !== confirmPassword.value) {
    error.value = t('login.passwordMismatch');
    return;
  }

  if (password.value.length < 6) {
    error.value = t('login.passwordMin');
    return;
  }

  try {
    await register(email.value, password.value);
    router.push('/');
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : t('login.registerFailed');
  }
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, var(--ehm-black), var(--ehm-black-3));
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  padding: 24px;
}

.login-box {
  background: linear-gradient(180deg, rgba(10, 13, 20, 0.96), rgba(23, 28, 41, 0.98));
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.32);
  padding: 40px;
  width: 100%;
  max-width: 420px;
  position: relative;
}

.login-lang {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 0.5rem;
}

.login-lang :deep(.lang-switcher) {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
}

.login-lang :deep(.lang-btn) {
  color: #cfd8e7;
}

.login-lang :deep(.lang-btn.active) {
  color: #fff;
}

h1 {
  margin: 0 0 6px;
  color: #fff;
  text-align: center;
  font-size: 32px;
}

.subtitle {
  text-align: center;
  color: #b8c7da;
  margin: 0 0 28px;
  font-size: 14px;
}

.form-section {
  width: 100%;
}

h2 {
  color: var(--ehm-accent);
  margin-bottom: 22px;
  font-size: 22px;
}

.form-group {
  margin-bottom: 16px;
}

label {
  display: block;
  margin-bottom: 8px;
  color: #d7e4ef;
  font-weight: 600;
  font-size: 13px;
}

input {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.04);
  color: #eef2ff;
  font-size: 14px;
  transition: border-color 0.3s, background 0.3s;
  box-sizing: border-box;
}

input::placeholder {
  color: #9ca3af;
}

input:focus {
  outline: none;
  border-color: var(--ehm-accent);
  background: rgba(255, 255, 255, 0.06);
  box-shadow: 0 0 0 3px rgba(255, 142, 113, 0.15);
}

.btn-submit {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, var(--ehm-accent), var(--ehm-accent-strong));
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s, opacity 0.2s;
  margin-top: 18px;
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(255, 142, 113, 0.35);
}

.btn-submit:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.error-message {
  background-color: rgba(255, 97, 97, 0.12);
  color: #ffb3b3;
  padding: 12px 14px;
  border-radius: 10px;
  margin-top: 15px;
  font-size: 14px;
  border-left: 4px solid #ff6f7a;
}

.toggle-form {
  text-align: center;
  margin-top: 22px;
  color: #b8c7da;
  font-size: 14px;
}

.toggle-form button {
  background: none;
  border: none;
  color: var(--ehm-accent);
  cursor: pointer;
  font-weight: 700;
  text-decoration: none;
  transition: color 0.2s;
}

.toggle-form button:hover {
  color: var(--ehm-accent-strong);
  text-decoration: underline;
}
</style>
