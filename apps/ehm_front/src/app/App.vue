<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import NavBar from '../components/NavBar.vue';
import { useAuth } from '../composables/useAuth';
import { useVehicles } from '../composables/useVehicles';
import { useI18n } from '../i18n';
import type { Vehicle, Brand } from '../composables/useVehicles';

const { t } = useI18n();

const router = useRouter();
const { currentUser } = useAuth();
const { brands, fetchBrands } = useVehicles();

const goToLogin = () => {
  router.push('/login');
};

const openChatbot = () => {
  window.alert(t('alert.chatbot'));
};

const selectedBrand = ref<Brand | null>(null);
const showBrandVehicles = ref(false);
const showModal = ref(false);
const selectedVehicle = ref<Vehicle | null>(null);

// Load brands and vehicles from Firestore on mount
onMounted(async () => {
  // 1. Wait for brands to download
  await fetchBrands();

  // 2. Check if we actually got brands back
  if (brands.value && brands.value.length > 0) {
    selectedBrand.value = brands.value[0];
    showBrandVehicles.value = true;
  } else {
    console.error("No brands found in Firestore. Check collection name 'brands'.");
  }
});

const selectBrand = (brand: Brand) => {
  selectedBrand.value = brand;
  showBrandVehicles.value = true;
};

const vehiclesByBrand = computed(() => selectedBrand.value?.vehicles || []);

const runBrandAction = (action: string, vehicle: Vehicle) => {
  if (action === 'Ver detalle') {
    selectedVehicle.value = vehicle;
    showModal.value = true;
  } else {
    window.alert(
      t('alert.action', {
        action,
        brand: selectedBrand.value?.name ?? '',
        model: vehicle.model,
      })
    );
  }
};

const viewInventory = () => {
  window.alert(t('alert.inventory', { brand: selectedBrand.value?.name ?? '' }));
};

const scheduleTestDrive = () => {
  window.alert(t('alert.testDrive', { brand: selectedBrand.value?.name ?? '' }));
};

const requestFinancing = () => {
  window.alert(t('alert.financing', { brand: selectedBrand.value?.name ?? '' }));
};

const infoSections = computed(() => [
  {
    title: t('info.card1.title'),
    description: t('info.card1.desc'),
    image:
      'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: t('info.card2.title'),
    description: t('info.card2.desc'),
    image:
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: t('info.card3.title'),
    description: t('info.card3.desc'),
    image:
      'https://images.unsplash.com/photo-1519999482648-25049ddd37b1?auto=format&fit=crop&w=900&q=80',
  },
]);

const toTitleCase = (value: string) => {
  return value.charAt(0).toUpperCase() + value.slice(1);
};

const closeModal = () => {
  showModal.value = false;
  selectedVehicle.value = null;
};

const highlightsSection = ref<HTMLElement>();

const scrollLeft = () => {
  const el = highlightsSection.value;
  if (el) {
    if (el.scrollLeft === 0) {
      el.scrollTo({ left: el.scrollWidth, behavior: 'smooth' });
    } else {
      el.scrollBy({ left: -520, behavior: 'smooth' });
    }
  }
};

const scrollRight = () => {
  const el = highlightsSection.value;
  if (el) {
    if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 1) {
      el.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      el.scrollBy({ left: 520, behavior: 'smooth' });
    }
  }
};

</script>

<template>
  <div class="app">
    <NavBar />

    <div class="content">
      <section class="hero">
        <h1>{{ t('hero.title') }}</h1>
        <p>{{ t('hero.subtitle') }}</p>
      </section>

      <section class="info-section">
        <div class="info-header">
          <p class="eyebrow">{{ t('info.eyebrow') }}</p>
          <h2>{{ t('info.title') }}</h2>
          <p class="info-description">
            {{ t('info.description') }}
          </p>
        </div>

        <div class="info-cards">
          <article v-for="section in infoSections" :key="section.title" class="info-card">
            <img :src="section.image" :alt="section.title" class="info-image" />
            <div class="info-content">
              <h3>{{ section.title }}</h3>
              <p>{{ section.description }}</p>
            </div>
          </article>
        </div>
      </section>

      <!-- Brands Grid -->
      <section class="brands-section">
        <h2>{{ t('brands.title') }}</h2>
        <div class="brands-grid">
          <div
            v-for="brand in brands"
            :key="brand.id"
            class="brand-card"
            @click="selectBrand(brand)"
          >
            <img :src="brand.image" :alt="brand.name" class="brand-image" />
            <h3>{{ brand.name }}</h3>
            <p>{{ t('brands.vehicles', { count: brand.vehicles?.length || 0 }) }}</p>
          </div>
        </div>
      </section>

      <!-- Selected Brand Vehicles -->
      <section v-if="showBrandVehicles && selectedBrand" class="vehicles-section">
        <div class="section-header">
          <h2>{{ t('vehicles.title', { brand: selectedBrand.name }) }}</h2>
          <div v-if="currentUser" class="action-buttons">
            <button @click="viewInventory" class="btn-secondary">{{ t('vehicles.viewInventory') }}</button>
            <button @click="scheduleTestDrive" class="btn-secondary">{{ t('vehicles.scheduleTestDrive') }}</button>
            <button @click="requestFinancing" class="btn-secondary">{{ t('vehicles.requestFinancing') }}</button>
          </div>
        </div>

        <div class="scroll-container">
          <button @click="scrollLeft" class="scroll-btn left-btn">‹</button>

          <div ref="highlightsSection" class="vehicles-grid">
            <div
              v-for="vehicle in vehiclesByBrand"
              :key="vehicle.id"
              class="vehicle-card"
            >
              <img :src="vehicle.image" :alt="vehicle.model" class="vehicle-image" />
              <div class="vehicle-info">
                <h3>{{ selectedBrand?.name }} {{ vehicle.model }}</h3>
                <p class="type">{{ toTitleCase(vehicle.type) }}</p>
                <p class="description">{{ vehicle.description }}</p>
                <div class="vehicle-actions">
                  <button @click="runBrandAction('Ver detalle', vehicle)" class="btn-primary">
                    {{ t('vehicles.viewDetails') }}
                  </button>
                  <button @click="runBrandAction('Cotizar', vehicle)" class="btn-secondary">
                    {{ t('vehicles.quote') }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <button @click="scrollRight" class="scroll-btn right-btn">›</button>
        </div>
      </section>

      <!-- Vehicle Detail Modal -->
      <div v-if="showModal && selectedVehicle" class="modal">
        <div class="modal-content">
          <button @click="closeModal" class="close-btn">×</button>
          <img :src="selectedVehicle.image" :alt="selectedVehicle.model" />
          <h2>{{ selectedBrand?.name }} {{ selectedVehicle.model }}</h2>
          <p class="type">{{ t('modal.type') }} {{ toTitleCase(selectedVehicle.type) }}</p>
          <p class="description">{{ selectedVehicle.description }}</p>
          <div v-if="selectedVehicle.year" class="detail-row">
            <span>{{ t('modal.year') }}</span>
            <strong>{{ selectedVehicle.year }}</strong>
          </div>
          <div v-if="selectedVehicle.price" class="detail-row">
            <span>{{ t('modal.price') }}</span>
            <strong>${{ selectedVehicle.price.toLocaleString() }}</strong>
          </div>
          <div v-if="selectedVehicle.mileage !== undefined" class="detail-row">
            <span>{{ t('modal.mileage') }}</span>
            <strong>{{ selectedVehicle.mileage?.toLocaleString() }} km</strong>
          </div>
          <div class="modal-actions">
            <button @click="runBrandAction('Cotizar', selectedVehicle)" class="btn-primary">
              {{ t('modal.requestQuote') }}
            </button>
            <button @click="runBrandAction('Test Drive', selectedVehicle)" class="btn-secondary">
              {{ t('modal.scheduleTestDrive') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <footer class="footer">
      <div class="footer-container">
        <div class="footer-section">
          <h3>{{ t('footer.dealership') }}</h3>
          <p>{{ t('footer.tagline') }}</p>
        </div>
        <div class="footer-section">
          <h4>{{ t('footer.contact') }}</h4>
          <p>{{ t('footer.address') }}</p>
          <p>{{ t('footer.phone') }}</p>
          <p>{{ t('footer.whatsapp') }}</p>
          <p>{{ t('footer.email') }}</p>
        </div>
        <div class="footer-section">
          <h4>{{ t('footer.hours') }}</h4>
          <p>{{ t('footer.weekdays') }}</p>
          <p>{{ t('footer.saturday') }}</p>
          <p>{{ t('footer.sunday') }}</p>
        </div>
        <div class="footer-section">
          <h4>{{ t('footer.quickLinks') }}</h4>
          <ul class="footer-links">
            <li><a href="/">{{ t('nav.home') }}</a></li>
            <li><a href="/inventory">{{ t('nav.inventory') }}</a></li>
            <li><a href="/about">{{ t('nav.about') }}</a></li>
            <li><a href="/contact">{{ t('nav.contact') }}</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <p>{{ t('footer.copyright') }}</p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  background-color: #ecf0f1;
  display: flex;
  flex-direction: column;
}

.content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.hero {
  text-align: center;
  padding: 40px 20px;
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  color: white;
  border-radius: 8px;
  margin-bottom: 40px;
}

.hero h1 {
  font-size: 32px;
  margin-bottom: 10px;
}

.hero p {
  font-size: 16px;
  opacity: 0.9;
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

.info-header .eyebrow {
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

.info-header .info-description {
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
  margin: 0 0 10px 0;
  font-size: 18px;
  color: #2c3e50;
}

.info-content p {
  margin: 0;
  color: #606f7b;
  line-height: 1.7;
}

.brands-section {
  margin-bottom: 40px;
}

.brands-section h2 {
  font-size: 24px;
  margin-bottom: 20px;
  color: #333;
}

.brands-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 20px;
}

.brand-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.brand-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.brand-image {
  width: 100%;
  height: 120px;
  object-fit: cover;
}

.brand-card h3 {
  padding: 12px;
  margin: 0;
  font-size: 16px;
  color: #333;
}

.brand-card p {
  padding: 0 12px 12px;
  margin: 0;
  font-size: 12px;
  color: #666;
}

.vehicles-section {
  margin-bottom: 40px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
}

.section-header h2 {
  font-size: 24px;
  color: #333;
  margin: 0;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.scroll-container {
  position: relative;
  margin-bottom: 20px;
}

.vehicles-grid {
  display: flex;
  gap: 20px;
  overflow-x: auto;
  padding: 20px 0;
  scroll-behavior: smooth;
}

.vehicles-grid::-webkit-scrollbar {
  height: 8px;
}

.vehicles-grid::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.vehicles-grid::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 10px;
}

.vehicle-card {
  flex: 0 0 300px;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.vehicle-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.vehicle-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.vehicle-info {
  padding: 15px;
}

.vehicle-info h3 {
  margin: 0 0 5px 0;
  font-size: 16px;
  color: #333;
}

.type {
  margin: 0 0 10px 0;
  font-size: 12px;
  color: #2980b9;
  font-weight: 600;
}

.description {
  margin: 0 0 15px 0;
  font-size: 12px;
  color: #666;
  line-height: 1.4;
}

.vehicle-actions {
  display: flex;
  gap: 10px;
}

.scroll-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
  z-index: 10;
}

.scroll-btn:hover {
  background-color: rgba(0, 0, 0, 0.7);
}

.left-btn {
  left: -50px;
}

.right-btn {
  right: -50px;
}

.btn-primary {
  background: linear-gradient(135deg, #2980b9 0%, #2c3e50 100%);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  font-size: 12px;
  transition: transform 0.2s;
  flex: 1;
}

.btn-primary:hover {
  transform: scale(1.05);
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
}

.btn-secondary {
  background: white;
  color: #2980b9;
  border: 2px solid #2980b9;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  font-size: 12px;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: #2980b9;
  color: white;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  padding: 30px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
}

.close-btn {
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  font-size: 28px;
  cursor: pointer;
  color: #666;
}

.modal-content img {
  width: 100%;
  height: 250px;
  object-fit: cover;
  border-radius: 4px;
  margin-bottom: 20px;
}

.modal-content h2 {
  margin: 0 0 10px 0;
  color: #333;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}

.detail-row span {
  color: #666;
}

.detail-row strong {
  color: #333;
}

.modal-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.footer {
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  color: white;
  padding: 40px 20px 20px;
  margin-top: 60px;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
  margin-bottom: 30px;
}

.footer-section h3,
.footer-section h4 {
  margin: 0 0 15px 0;
  color: #ecf0f1;
  font-size: 16px;
}

.footer-section p {
  margin: 8px 0;
  font-size: 14px;
  color: #bdc3c7;
  line-height: 1.6;
}

.footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-links li {
  margin: 8px 0;
}

.footer-links a {
  color: #bdc3c7;
  text-decoration: none;
  transition: color 0.2s;
}

.footer-links a:hover {
  color: #3498db;
}

.footer-bottom {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 20px;
  text-align: center;
  color: #95a5a6;
  font-size: 12px;
}

@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .action-buttons {
    width: 100%;
    flex-direction: column;
  }

  .brands-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 15px;
  }

  .vehicle-card {
    flex: 0 0 250px;
  }

  .scroll-btn {
    width: 30px;
    height: 30px;
    font-size: 16px;
  }

  .left-btn {
    left: -35px;
  }

  .right-btn {
    right: -35px;
  }

  .footer-container {
    grid-template-columns: 1fr;
    gap: 20px;
  }
}
</style>
