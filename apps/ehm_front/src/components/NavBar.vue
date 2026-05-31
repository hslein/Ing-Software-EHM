<template>
  <nav class="navbar">
    <div class="navbar-container">
      <div class="navbar-logo">
        <a href="/" @click.prevent="goHome">{{ t('nav.logo') }}</a>
      </div>
      <ul class="nav-menu">
        <li class="nav-item">
          <a href="/" class="nav-link" @click.prevent="goHome">{{ t('nav.home') }}</a>
        </li>
        <li v-if="isAuthenticated" class="nav-item">
          <a href="/inventory" class="nav-link">{{ t('nav.inventory') }}</a>
        </li>
        <li v-if="isAuthenticated" class="nav-item">
          <a
            href="#"
            class="nav-link nav-link-accent"
            @click.prevent="openScheduleModal"
          >
            {{ t('nav.scheduleAppointment') }}
          </a>
        </li>
        <li class="nav-item">
          <a href="/about" class="nav-link">{{ t('nav.about') }}</a>
        </li>
        <li class="nav-item">
          <a href="/contact" class="nav-link">{{ t('nav.contact') }}</a>
        </li>
        <li class="nav-item">
          <LanguageSwitcher />
        </li>
        <li class="nav-item">
          <a
            href="#"
            class="nav-link nav-link-btn"
            @click.prevent="handleAuthClick"
          >
            {{ isAuthenticated ? t('nav.logOut') : t('nav.signIn') }}
          </a>
        </li>
      </ul>
    </div>

    <ScheduleAppointmentModal />
  </nav>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import LanguageSwitcher from './LanguageSwitcher.vue';
import ScheduleAppointmentModal from './ScheduleAppointmentModal.vue';
import { useAuth } from '../composables/useAuth';
import { useAppointments } from '../composables/useAppointments';
import { useI18n } from '../i18n';

const router = useRouter();
const { t } = useI18n();
const { isAuthenticated, logout } = useAuth();
const { openScheduleModal } = useAppointments();

const goHome = () => {
  router.push('/');
};

const handleAuthClick = async () => {
  if (isAuthenticated.value) {
    try {
      await logout();
      router.push('/');
    } catch (err) {
      console.error('Logout failed:', err);
    }
    return;
  }
  router.push('/login');
};
</script>

<style scoped>
.navbar {
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
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

.navbar-logo a {
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  text-decoration: none;
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
  color: #ecf0f1;
  font-weight: 600;
  font-size: 0.95rem;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: color 0.2s ease, background-color 0.2s ease;
}

.nav-link:hover {
  color: #3498db;
  background-color: rgba(255, 255, 255, 0.05);
}

.nav-link-btn {
  background: linear-gradient(135deg, #2980b9 0%, #2c3e50 100%);
  padding: 0.5rem 1rem;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  color: white;
}

.nav-link-btn:hover {
  background: linear-gradient(135deg, #34495e 0%, #2c3e50 100%);
  color: white;
}

.nav-link-accent {
  background: rgba(52, 152, 219, 0.15);
  border: 1px solid rgba(52, 152, 219, 0.4);
}

.nav-link-accent:hover {
  background: rgba(52, 152, 219, 0.25);
  color: #3498db;
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
