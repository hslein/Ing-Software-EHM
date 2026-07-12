<script setup lang="ts">
import { ref } from 'vue';
import { Heart } from 'lucide-vue-next';
import type { Vehicle } from '../composables/useVehicles';
import { useI18n } from '../i18n';

defineProps<{
  brandName: string;
  selectedCompareIds?: string[];
  vehicles: Vehicle[];
}>();

defineEmits<{
  selectVehicle: [vehicle: Vehicle];
  quoteVehicle: [vehicle: Vehicle];
  toggleCompare: [vehicle: Vehicle];
  toggleFavorite: [vehicle: Vehicle];
}>();

const highlightsSection = ref<HTMLElement>();
const { t } = useI18n();

const hasValue = (value?: number | string | null) => {
  return value !== undefined && value !== null && String(value).trim() !== '';
};

const formatVehicleType = (value?: string) => {
  if (!hasValue(value)) {
    return '';
  }

  return String(value).charAt(0).toUpperCase() + String(value).slice(1);
};

const formatVehiclePrice = (price?: number) => {
  if (!hasValue(price)) {
    return '';
  }

  return `$${Number(price).toLocaleString()} COP`;
};

const formatVehicleMeta = (vehicle: Vehicle) => {
  return [vehicle.year, vehicle.fuelType, formatVehicleType(vehicle.type)].filter(hasValue).join(' | ');
};

const scrollLeft = () => {
  const el = highlightsSection.value;
  if (!el) return;

  if (el.scrollLeft === 0) {
    el.scrollTo({ left: el.scrollWidth, behavior: 'smooth' });
    return;
  }

  el.scrollBy({ left: -520, behavior: 'smooth' });
};

const scrollRight = () => {
  const el = highlightsSection.value;
  if (!el) return;

  if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 1) {
    el.scrollTo({ left: 0, behavior: 'smooth' });
    return;
  }

  el.scrollBy({ left: 520, behavior: 'smooth' });
};
</script>

<template>
  <div class="scroll-container">
    <button v-if="vehicles.length > 0" class="scroll-btn left-btn" type="button" @click="scrollLeft">
      &lt;
    </button>

    <p v-if="vehicles.length === 0" class="empty-message">
      {{ t('vehicles.emptyForBrand', { brand: brandName }) }}
    </p>

    <div v-else ref="highlightsSection" class="vehicles-grid">
      <article
        v-for="(vehicle, index) in vehicles"
        :key="vehicle.id ?? `${vehicle.model}-${index}`"
        class="vehicle-card"
      >
        <div class="vehicle-media">
          <div class="vehicle-tools">
            <button
              class="compare-toggle"
              :class="{ selected: selectedCompareIds?.includes(vehicle.id ?? vehicle.model) }"
              type="button"
              @click="$emit('toggleCompare', vehicle)"
            >
              {{
                selectedCompareIds?.includes(vehicle.id ?? vehicle.model)
                  ? t('vehicles.selectedAction')
                  : t('vehicles.compare')
              }}
            </button>
            <button
              class="favorite-toggle"
              :class="{ favorite: vehicle.isFavorite }"
              type="button"
              :aria-label="vehicle.isFavorite ? t('vehicles.removeFavorite') : t('vehicles.addFavorite')"
              :title="vehicle.isFavorite ? t('vehicles.removeFavorite') : t('vehicles.addFavorite')"
              @click.stop="$emit('toggleFavorite', vehicle)"
            >
              <Heart :size="19" :fill="vehicle.isFavorite ? 'currentColor' : 'none'" />
            </button>
          </div>
          <img :src="vehicle.image" :alt="`${brandName} ${vehicle.model}`" class="vehicle-image" />
          <p class="image-note">*Imagen de referencia</p>
        </div>

        <div class="vehicle-info">
          <div class="vehicle-copy">
            <h3>{{ vehicle.model }}</h3>
            <p v-if="formatVehicleMeta(vehicle)" class="type">{{ formatVehicleMeta(vehicle) }}</p>
            <p class="description">{{ vehicle.description }}</p>
          </div>

          <div class="vehicle-commercial">
            <div class="vehicle-price">
              <p class="price-kicker">Desde</p>
              <p class="price-value">{{ formatVehiclePrice(vehicle.price) || 'Consultar precio' }}</p>
              <p v-if="vehicle.price" class="price-note">*Precio sugerido al publico</p>
            </div>

            <hr class="vehicle-divider" />

            <div class="vehicle-actions">
              <button class="btn-primary" type="button" @click="$emit('selectVehicle', vehicle)">
                {{ t('vehicles.viewDetails') }}
              </button>
              <button class="btn-secondary" type="button" @click="$emit('quoteVehicle', vehicle)">
                {{ t('vehicles.quote') }}
              </button>
            </div>
          </div>
        </div>
      </article>
    </div>

    <button v-if="vehicles.length > 0" class="scroll-btn right-btn" type="button" @click="scrollRight">
      &gt;
    </button>
  </div>
</template>

<style scoped>
.scroll-container {
  position: relative;
  margin-bottom: 20px;
}

.vehicles-grid {
  display: flex;
  gap: 24px;
  overflow-x: auto;
  padding: 24px 4px;
  scroll-behavior: smooth;
}

.vehicles-grid::-webkit-scrollbar {
  height: 8px;
}

.vehicles-grid::-webkit-scrollbar-track {
  background: #d7e4ef;
  border-radius: 10px;
}

.vehicles-grid::-webkit-scrollbar-thumb {
  background: var(--ehm-accent);
  border-radius: 10px;
}

.empty-message {
  background: white;
  border-radius: 8px;
  color: #666;
  margin: 0;
  padding: 24px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.vehicle-card {
  flex: 0 0 340px;
  display: grid;
  grid-template-rows: auto auto;
  min-height: 520px;
  overflow: hidden;
  position: relative;
  border-radius: 8px;
  border: 1px solid rgba(44, 62, 80, 0.12);
  background:
    linear-gradient(135deg, rgba(255, 142, 113, 0.18) 0%, rgba(255, 142, 113, 0) 26%),
    linear-gradient(135deg, var(--ehm-black) 0%, var(--ehm-black-3) 100%);
  color: #fff;
  padding: 16px;
  box-shadow: 0 18px 42px rgba(44, 62, 80, 0.22);
  transition: transform 0.2s, box-shadow 0.2s;
}

.vehicle-card::before {
  position: absolute;
  inset: 0 0 auto;
  height: 4px;
  background: linear-gradient(90deg, var(--ehm-black), var(--ehm-accent));
  content: '';
}

.vehicle-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 22px 50px rgba(44, 62, 80, 0.34);
}

.vehicle-media {
  position: relative;
  display: flex;
  min-height: 250px;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.4);
  background:
    radial-gradient(circle at 50% 30%, rgba(255, 255, 255, 0.95), rgba(236, 240, 241, 0.82) 42%, rgba(215, 228, 239, 0.95) 100%);
  box-shadow: inset 0 -18px 40px rgba(44, 62, 80, 0.1);
}

.vehicle-tools {
  position: absolute;
  top: 10px;
  left: 10px;
  right: 10px;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.vehicle-image {
  width: 100%;
  min-height: 250px;
  height: 100%;
  max-height: 300px;
  object-fit: contain;
  object-position: center;
  padding: 36px 10px 26px;
  filter: drop-shadow(0 18px 16px rgba(44, 62, 80, 0.2));
}

.image-note {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  margin: 0;
  background: var(--ehm-black);
  color: #fff;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.03em;
  line-height: 1.4;
  padding: 4px 8px;
  text-align: center;
}

.favorite-toggle {
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid rgba(44, 62, 80, 0.18);
  border-radius: 50%;
  color: var(--ehm-black);
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.14);
  transition: color 0.2s, transform 0.2s, border-color 0.2s;
}

.favorite-toggle:hover {
  transform: scale(1.08);
  background: #fff;
  border-color: #ff8e71;
  color: #ff8e71;
}

.favorite-toggle.favorite {
  color: #ff6f7a;
  border-color: rgba(255, 111, 122, 0.58);
}

.compare-toggle {
  background: rgba(255, 255, 255, 0.96);
  color: var(--ehm-black);
  border: 1px solid rgba(44, 62, 80, 0.18);
  padding: 8px 12px;
  border-radius: 999px;
  cursor: pointer;
  font-weight: 800;
  font-size: 11px;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.14);
  transition: background-color 0.2s, border-color 0.2s, color 0.2s;
}

.compare-toggle:hover,
.compare-toggle.selected {
  background: var(--ehm-black);
  border-color: var(--ehm-black);
  color: #fff;
}

.vehicle-info {
  display: flex;
  min-height: 0;
  flex-direction: column;
  justify-content: space-between;
  gap: 18px;
  padding: 14px 2px 2px;
}

.vehicle-info h3 {
  margin: 0 0 6px;
  color: #fff;
  font-size: 23px;
  font-weight: 700;
  line-height: 26px;
}

.type {
  margin: 0;
  color: #d7e4ef;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.08em;
  line-height: 1.35;
  text-transform: uppercase;
}

.description {
  display: -webkit-box;
  margin: 10px 0 0;
  min-height: 38px;
  max-height: 58px;
  color: rgba(245, 247, 250, 0.92);
  font-size: 13px;
  line-height: 1.45;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}

.vehicle-commercial {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.vehicle-price p {
  margin: 0;
}

.price-kicker,
.price-note {
  color: #d7e4ef;
  font-size: 9px;
  line-height: 1.35;
}

.price-value {
  color: #fff;
  font-size: 19px;
  font-weight: 800;
  line-height: 1.35;
}

.price-note {
  padding-bottom: 8px;
}

.vehicle-divider {
  width: 100%;
  height: 0;
  margin: 0;
  border: 0;
  border-top: 1px solid rgba(215, 228, 239, 0.35);
}

.vehicle-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
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
  min-width: 125px;
  max-height: 40px;
  background: rgba(255, 255, 255, 0.06);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.86);
  padding: 10px 18px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 700;
  font-size: 13px;
  line-height: 18px;
  transition: background-color 0.2s, border-color 0.2s, color 0.2s;
}

.btn-primary:hover {
  background: #ff8e71;
  border-color: #ff8e71;
  color: #fff;
}

.btn-secondary {
  background: transparent;
  color: #fff;
  border: 0;
  padding: 0 8px 0 0;
  cursor: pointer;
  font-weight: 700;
  font-size: 13px;
  line-height: 16px;
  text-decoration: underline;
  transition: color 0.2s;
}

.btn-secondary:hover {
  color: #ff8e71;
}

@media (max-width: 768px) {
  .vehicle-card {
    flex: 0 0 286px;
    min-height: 500px;
  }

  .vehicle-actions {
    align-items: stretch;
    flex-direction: column;
  }

  .btn-primary {
    width: 100%;
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
}
</style>
