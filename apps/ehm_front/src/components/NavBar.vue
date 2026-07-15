<template>
  <nav class="navbar">
    <div class="navbar-container">
      <div class="navbar-logo">
        <RouterLink to="/" class="logo-link" @click="goHome">{{ t('nav.logo') }}</RouterLink>
      </div>
      <ul class="nav-menu">
        <li class="nav-item">
          <RouterLink to="/" class="nav-link" @click="goHome">{{ t('nav.home') }}</RouterLink>
        </li>
        <li class="nav-item">
          <RouterLink to="/inventory" class="nav-link">{{ t('nav.inventory') }}</RouterLink>
        </li>
        <li v-if="isAuthenticated" class="nav-item">
          <RouterLink to="/my-vehicles" class="nav-link">{{ t('nav.myVehicles') }}</RouterLink>
        </li>
        <li v-if="!isAdmin" class="nav-item">
          <RouterLink to="/about" class="nav-link" @click="goAbout">{{ t('nav.about') }}</RouterLink>
        </li>

        <li class="nav-item">
          <LanguageSwitcher />
        </li>

        <li class="nav-item">
          <RouterLink v-if="!isAuthenticated" to="/login" class="nav-link nav-link-btn">
            {{ t('nav.signIn') }}
          </RouterLink>
          <div v-else class="nav-actions">
            <RouterLink v-if="isAdmin" to="/admin/dashboard" class="nav-link">
              {{ t('nav.dashboard') }}
            </RouterLink>
            <RouterLink v-if="isAdmin" to="/users" class="nav-link">{{ t('nav.users') }}</RouterLink>
            <RouterLink to="/user-details" class="nav-icon-button" :aria-label="t('nav.profile')" :title="t('nav.profile')">
              <UserRound :size="18" aria-hidden="true" />
              <span>{{ t('nav.profile') }}</span>
            </RouterLink>
            <button
              type="button"
              class="nav-icon-button"
              @click="handleLogout"
              :aria-label="t('nav.logOut')"
              :title="t('nav.logOut')"
            >
              <LogOut :size="18" aria-hidden="true" />
              <span>{{ t('nav.logOut') }}</span>
            </button>
          </div>
        </li>
      </ul>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { RouterLink, useRouter } from 'vue-router';
import { LogOut, UserRound } from 'lucide-vue-next';
import { useAuth } from '../composables/useAuth';
import { useI18n } from '../i18n';
import LanguageSwitcher from './LanguageSwitcher.vue';

defineOptions({
  name: 'NavBar',
});

const emit = defineEmits<{
  'go-about': [];
  'go-home': [];
}>();

const router = useRouter();
const { isAuthenticated, isAdmin, logout } = useAuth();
const { t } = useI18n();

const goHome = () => {
  emit('go-home');
};

const goAbout = () => {
  emit('go-about');
};

const handleLogout = async () => {
  try {
    await logout();
  } finally {
    await router.replace('/');
  }
};

</script>

<style scoped>
.navbar {
  background: linear-gradient(135deg, var(--ehm-black) 0%, var(--ehm-black-3) 100%);
  border-bottom: 1px solid var(--ehm-line);
  padding: 1rem 0;
  position: sticky;
  top: 0;
  z-index: 120;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.navbar-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.logo-link {
  color: white;
  cursor: pointer;
  font-size: 1.5rem;
  font-weight: 700;
  text-decoration: none;
  text-shadow: 0 2px 10px rgba(255, 125, 102, 0.45);
}

.nav-menu {
  display: flex;
  list-style: none;
  gap: 2rem;
  align-items: center;
  margin: 0;
  padding: 0;
}

.nav-item {
  display: flex;
  align-items: center;
}

.nav-link {
  border-radius: 8px;
  color: #ecf0f1;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 600;
  padding: 0.35rem 0.55rem;
  text-decoration: none;
  transition: color 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease;
}

.nav-link:hover {
  color: var(--ehm-accent);
  background-color: rgba(255, 255, 255, 0.05);
}

.nav-link-btn {
  background: linear-gradient(135deg, var(--ehm-accent) 0%, var(--ehm-black-3) 100%);
  padding: 0.5rem 1rem;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  color: white;
}

.nav-link-btn:hover {
  background: linear-gradient(135deg, var(--ehm-accent-strong), #ffa36b);
  box-shadow: 0 10px 22px rgba(255, 102, 102, 0.44);
  color: white;
}

.nav-button {
  border: 0;
  cursor: pointer;
  font-family: inherit;
}

.nav-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.nav-icon-button {
  display: inline-flex;
  align-items: center;
  gap: 0;
  min-height: 36px;
  border: 0;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  cursor: pointer;
  font-family: inherit;
  font-size: 0.9rem;
  font-weight: 700;
  padding: 0.45rem 0.7rem;
  text-decoration: none;
  transition: background-color 0.2s ease, box-shadow 0.2s ease, gap 0.2s ease, transform 0.2s ease;
}

.nav-icon-button span {
  display: inline-block;
  max-width: 0;
  opacity: 0;
  overflow: hidden;
  white-space: nowrap;
  transition: max-width 0.24s ease, opacity 0.18s ease;
}

.nav-icon-button:hover,
.nav-icon-button:focus-visible {
  background: linear-gradient(135deg, #ff6f7a, #ffa36b);
  box-shadow: 0 10px 22px rgba(255, 102, 102, 0.32);
  gap: 0.4rem;
  transform: translateY(-1px);
}

.nav-icon-button:hover span,
.nav-icon-button:focus-visible span {
  max-width: 90px;
  opacity: 1;
}

@media (max-width: 980px) {
  .navbar-container {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.8rem;
  }

  .nav-menu {
    flex-wrap: wrap;
    gap: 0.7rem;
  }
}
</style>
