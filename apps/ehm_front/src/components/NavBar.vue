<template>
  <nav class="navbar">
    <div class="navbar-container">
      <div class="navbar-logo">
        <a href="/" @click.prevent="goHome">Concesionario EHM</a>
      </div>
      <ul class="nav-menu">
        <li class="nav-item">
          <a href="/" class="nav-link" @click.prevent="goHome">Home</a>
        </li>
        <li class="nav-item">
          <a href="/inventory" class="nav-link">Inventory</a>
        </li>
        <li class="nav-item">
          <a href="/about" class="nav-link">About Us</a>
        </li>
        <li class="nav-item">
          <a href="/contact" class="nav-link">Contact</a>
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
          <a href="/login" class="nav-link nav-link-btn">Sign In</a>
        </li>
      </ul>
    </div>
  </nav>
</template>

<script>
export default {
  name: 'NavBar',
  emits: ['go-home'],
  methods: {
    goHome() {
      this.$emit('go-home');
    },
  },
};
</script>

<style scoped>
.navbar {
  background: linear-gradient(
    135deg,
    rgba(26, 35, 59, 0.92),
    rgba(32, 45, 78, 0.86)
  );
  backdrop-filter: blur(8px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  padding: 0.95rem 0;
  position: sticky;
  top: 0;
  z-index: 120;
  box-shadow: 0 10px 30px rgba(20, 30, 56, 0.22);
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
  font-size: 1.45rem;
  font-weight: 800;
  letter-spacing: 0.01em;
  color: #fff;
  text-decoration: none;
  text-shadow: 0 2px 10px rgba(255, 125, 102, 0.45);
}

.nav-menu {
  display: flex;
  list-style: none;
  gap: 1.15rem;
  align-items: center;
  margin: 0;
  padding: 0;
}

.nav-item {
  display: flex;
  align-items: center;
}

.nav-link {
  color: #e7ecff;
  font-weight: 600;
  font-size: 0.95rem;
  text-decoration: none;
  padding: 0.35rem 0.55rem;
  border-radius: 8px;
  transition: color 0.2s ease, background-color 0.2s ease, transform 0.2s ease;
}

.nav-link:hover {
  color: #ffd8d2;
  background-color: rgba(255, 255, 255, 0.08);
  transform: translateY(-1px);
}

.nav-link-btn {
  background: linear-gradient(135deg, #ff5f6d, #ff9258);
  padding: 0.5rem 0.95rem;
  border-radius: 999px;
  box-shadow: 0 8px 18px rgba(255, 102, 102, 0.35);
  color: #fff;
}

.nav-link-btn:hover {
  background: linear-gradient(135deg, #ff6f7a, #ffa36b);
  color: #fff;
  box-shadow: 0 10px 22px rgba(255, 102, 102, 0.44);
}

.nav-label {
  color: #dfe7ff;
  margin-right: 0.4rem;
  font-size: 0.86rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
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
