<template>
  <nav class="navbar">
    <div class="navbar-container">
      <div class="navbar-logo">
        <a href="#" @click.prevent="goHome">Concesionario EHM</a>
      </div>
      <ul class="nav-menu">
        <li class="nav-item">
          <a href="#" class="nav-link" @click.prevent="goHome">Home</a>
        </li>
        <li class="nav-item">
          <a href="/inventory" class="nav-link">Inventory</a>
        </li>
        <li class="nav-item">
          <a href="#" class="nav-link" @click.prevent="goAbout">About Us</a>
        </li>

        <li class="nav-item nav-brand-control">
          <label for="brand" class="nav-label">Brand</label>
          <select id="brand" class="brand-select">
            <option value="mazda">Mazda</option>
            <option value="toyota">Toyota</option>
            <option value="audi">Audi</option>
            <option value="ford">Ford</option>
            <option value="volkswagen">Volkswagen</option>
          </select>
        </li>

        <li class="nav-item">
          <a v-if="!isAuthenticated" href="/login" class="nav-link nav-link-btn">Sign In</a>
          <button
            v-else
            type="button"
            class="nav-link nav-link-btn nav-button"
            @click="handleLogout"
          >
            Logout
          </button>
        </li>
      </ul>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useAuth } from '../composables/useAuth';

defineOptions({
  name: 'NavBar',
});

const emit = defineEmits<{
  'go-about': [];
  'go-home': [];
}>();

const router = useRouter();
const { isAuthenticated, logout } = useAuth();

const goHome = () => {
  emit('go-home');
};

const goAbout = () => {
  emit('go-about');
};

const handleLogout = async () => {
  await logout();
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
  background: linear-gradient(135deg, #ff6f7a, #ffa36b);
  box-shadow: 0 10px 22px rgba(255, 102, 102, 0.44);
  color: white;
}

.nav-label {
  color: #dfe7ff;
  margin-right: 0.4rem;
  font-size: 0.86rem;
  font-weight: 700;
  text-transform: uppercase;
}

.brand-select {
  background-color: rgba(255, 255, 255, 0.9);
  color: #1d2747;
  border: 1px solid rgba(255, 255, 255, 0.45);
  border-radius: 999px;
  padding: 0.34rem 0.65rem;
  font-size: 0.88rem;
  font-weight: 600;
  outline: none;
  transition: box-shadow 0.2s ease, border-color 0.2s ease;
}

.brand-select:focus {
  border-color: #ff9c7f;
  box-shadow: 0 0 0 3px rgba(255, 156, 127, 0.24);
}

.nav-brand-control {
  background-color: rgba(255, 255, 255, 0.08);
  border-radius: 999px;
  padding: 0.3rem 0.45rem;
}

.nav-button {
  border: 0;
  cursor: pointer;
  font-family: inherit;
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
