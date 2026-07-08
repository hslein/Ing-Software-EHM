<script setup lang="ts">
import { computed, ref } from 'vue';
import type { Vehicle } from '../composables/useVehicles';
import { useI18n } from '../i18n';

const props = defineProps<{
  vehicles: Vehicle[];
}>();

defineEmits<{
  close: [];
  remove: [vehicle: Vehicle];
}>();

const { t } = useI18n();
const showCreditComparison = ref(false);
const downPaymentPercent = ref(30);
const months = ref(48);
const interestRate = 0.0105;

const comparedCredits = computed(() =>
  props.vehicles.map((vehicle) => {
    const price = vehicle.price ?? 0;
    const downPayment = Math.round(price * (downPaymentPercent.value / 100));
    const financedAmount = Math.max(price - downPayment, 0);
    const monthlyPayment = calculateMonthlyPayment(financedAmount, months.value);

    return {
      vehicle,
      downPayment,
      financedAmount,
      monthlyPayment,
    };
  }),
);

const formatVehicleType = (value?: string) => {
  if (!value) {
    return t('vehicles.defaultType');
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
};

const calculateMonthlyPayment = (amount: number, termMonths: number) => {
  if (amount <= 0) {
    return 0;
  }

  return Math.round(
    (amount * interestRate) / (1 - Math.pow(1 + interestRate, -termMonths)),
  );
};

const formatPrice = (price?: number) => {
  if (price === undefined || price === null) {
    return t('common.notAvailable');
  }

  return `$${price.toLocaleString()}`;
};

const formatMileage = (mileage?: number | string) => {
  if (mileage === undefined || mileage === null || String(mileage).trim() === '') {
    return t('common.notAvailable');
  }

  const numericMileage = Number(mileage);
  return Number.isFinite(numericMileage)
    ? `${numericMileage.toLocaleString()} km`
    : `${mileage} km`;
};
</script>

<template>
  <div class="modal" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <button
        class="close-btn"
        type="button"
        :aria-label="t('common.close')"
        @click="$emit('close')"
      >
        &times;
      </button>

      <div class="modal-header">
        <p class="eyebrow">{{ t('modal.comparisonEyebrow') }}</p>
        <h2>{{ t('modal.comparisonTitle') }}</h2>
      </div>

      <div class="compare-grid">
        <article v-for="vehicle in vehicles" :key="vehicle.id ?? vehicle.model" class="compare-card">
          <div class="compare-media">
            <img :src="vehicle.image" :alt="`${vehicle.brand} ${vehicle.model}`" />
          </div>
          <div class="compare-card-header">
            <div>
              <p class="brand-name">{{ vehicle.brand }}</p>
              <h3>{{ vehicle.model }}</h3>
            </div>
            <button class="remove-btn" type="button" @click="$emit('remove', vehicle)">
              {{ t('modal.remove') }}
            </button>
          </div>
          <p class="description">{{ vehicle.description }}</p>

          <dl class="detail-list">
            <div>
              <dt>{{ t('modal.type').replace(':', '') }}</dt>
              <dd>{{ formatVehicleType(vehicle.type) }}</dd>
            </div>
            <div>
              <dt>{{ t('modal.price').replace(':', '') }}</dt>
              <dd>{{ formatPrice(vehicle.price) }}</dd>
            </div>
            <div>
              <dt>{{ t('modal.mileage').replace(':', '') }}</dt>
              <dd>{{ formatMileage(vehicle.mileage) }}</dd>
            </div>
          </dl>
        </article>
      </div>

      <div class="credit-toggle-row">
        <button class="credit-toggle" type="button" @click="showCreditComparison = !showCreditComparison">
          {{ showCreditComparison ? t('modal.hideCreditComparison') : t('modal.compareCredits') }}
        </button>
      </div>

      <section v-if="showCreditComparison" class="credit-comparison">
        <div class="credit-header">
          <div>
            <p class="eyebrow">{{ t('modal.creditEyebrow') }}</p>
            <h3>{{ t('modal.creditTitle') }}</h3>
          </div>
          <p>{{ t('modal.creditRateNote') }}</p>
        </div>

        <div class="credit-controls">
          <label class="range-control">
            <span>
              {{ t('modal.downPayment') }}
              <strong>{{ downPaymentPercent }}%</strong>
            </span>
            <input v-model.number="downPaymentPercent" type="range" min="20" max="90" step="5" />
            <small>{{ t('modal.downPaymentRange') }}</small>
          </label>

          <label class="range-control">
            <span>
              {{ t('modal.months') }}
              <strong>{{ months }}</strong>
            </span>
            <input v-model.number="months" type="range" min="12" max="72" step="12" />
            <small>{{ t('modal.monthsRange') }}</small>
          </label>
        </div>

        <div class="credit-results">
          <article
            v-for="credit in comparedCredits"
            :key="`credit-${credit.vehicle.id ?? credit.vehicle.model}`"
            class="credit-card"
          >
            <p class="brand-name">{{ credit.vehicle.brand }}</p>
            <h4>{{ credit.vehicle.model }}</h4>
            <dl>
              <div>
                <dt>{{ t('modal.downPaymentAmount') }}</dt>
                <dd>{{ formatPrice(credit.downPayment) }}</dd>
              </div>
              <div>
                <dt>{{ t('modal.financedAmount') }}</dt>
                <dd>{{ formatPrice(credit.financedAmount) }}</dd>
              </div>
              <div class="monthly-row">
                <dt>{{ t('modal.monthlyPayment') }}</dt>
                <dd>{{ formatPrice(credit.monthlyPayment) }}</dd>
              </div>
            </dl>
          </article>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.modal {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.68);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 1000;
}

.modal-content {
  background:
    linear-gradient(135deg, rgba(255, 142, 113, 0.08) 0%, rgba(255, 142, 113, 0) 26%),
    #ecf0f1;
  border-radius: 8px;
  padding: 28px;
  max-width: 980px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 24px 70px rgba(44, 62, 80, 0.34);
}

.close-btn {
  position: absolute;
  top: 15px;
  right: 15px;
  background: #2c3e50;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 50%;
  font-size: 28px;
  cursor: pointer;
  color: #fff;
}

.modal-header {
  padding-right: 40px;
  margin-bottom: 22px;
}

.eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #2980b9;
  font-size: 12px;
  font-weight: 700;
  margin: 0 0 8px;
}

.modal-header h2 {
  margin: 0;
  color: #2c3e50;
  font-size: 26px;
}

.credit-toggle-row {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.credit-toggle {
  background: #2c3e50;
  color: #fff;
  border: 1px solid #2c3e50;
  border-radius: 4px;
  padding: 11px 14px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 800;
  text-transform: uppercase;
}

.credit-toggle:hover {
  background: #ff8e71;
  border-color: #ff8e71;
}

.compare-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
}

.compare-card {
  position: relative;
  border: 1px solid rgba(44, 62, 80, 0.12);
  border-radius: 8px;
  overflow: hidden;
  background:
    linear-gradient(135deg, rgba(255, 142, 113, 0.14) 0%, rgba(255, 142, 113, 0) 32%),
    linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  color: #fff;
  box-shadow: 0 18px 42px rgba(44, 62, 80, 0.2);
}

.compare-card::before {
  position: absolute;
  inset: 0 0 auto;
  height: 4px;
  background: linear-gradient(90deg, #2980b9, #ff8e71);
  content: '';
}

.compare-media {
  margin: 16px 16px 0;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 6px;
  background:
    radial-gradient(circle at 50% 30%, rgba(255, 255, 255, 0.96), rgba(236, 240, 241, 0.84) 45%, rgba(215, 228, 239, 0.95) 100%);
}

.compare-card img {
  width: 100%;
  height: 220px;
  object-fit: contain;
  padding: 22px;
  filter: drop-shadow(0 14px 12px rgba(44, 62, 80, 0.18));
}

.compare-card-header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 18px 18px 0;
}

.brand-name {
  margin: 0 0 4px;
  color: #d7e4ef;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
}

.compare-card h3 {
  margin: 0;
  color: #fff;
  font-size: 20px;
}

.remove-btn {
  align-self: flex-start;
  background: rgba(255, 255, 255, 0.94);
  color: #2c3e50;
  border: 1px solid rgba(44, 62, 80, 0.18);
  border-radius: 4px;
  padding: 7px 10px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 700;
}

.remove-btn:hover {
  background: #ff8e71;
  border-color: #ff8e71;
  color: #fff;
}

.description {
  margin: 12px 18px 18px;
  color: rgba(245, 247, 250, 0.92);
  font-size: 13px;
  line-height: 1.5;
}

.detail-list {
  margin: 0;
  padding: 0 18px 18px;
}

.detail-list div {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 10px 0;
  border-top: 1px solid rgba(215, 228, 239, 0.35);
}

.detail-list dt {
  color: #d7e4ef;
  font-size: 13px;
}

.detail-list dd {
  margin: 0;
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  text-align: right;
}

.credit-comparison {
  margin-top: 24px;
  border: 1px solid rgba(44, 62, 80, 0.12);
  border-radius: 8px;
  background: #fff;
  padding: 22px;
  box-shadow: 0 14px 32px rgba(44, 62, 80, 0.12);
}

.credit-header {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  align-items: flex-start;
  margin-bottom: 18px;
}

.credit-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 20px;
}

.credit-header > p {
  max-width: 280px;
  margin: 0;
  color: #667783;
  font-size: 12px;
  line-height: 1.5;
  text-align: right;
}

.credit-controls {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
  margin-bottom: 18px;
}

.range-control {
  display: grid;
  gap: 10px;
  background: #fff;
  border: 1px solid #d7e4ef;
  border-radius: 8px;
  padding: 16px;
}

.range-control span {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  color: #566774;
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
}

.range-control strong {
  color: #2c3e50;
}

.range-control input {
  width: 100%;
  accent-color: #2980b9;
}

.range-control small {
  color: #7d8d99;
  font-size: 11px;
}

.credit-results {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.credit-card {
  background:
    linear-gradient(135deg, rgba(255, 142, 113, 0.1) 0%, rgba(255, 142, 113, 0) 30%),
    #f8fafc;
  border: 1px solid #d7e4ef;
  border-radius: 8px;
  padding: 18px;
}

.credit-card h4 {
  margin: 0 0 14px;
  color: #2c3e50;
  font-size: 18px;
}

.credit-card dl {
  margin: 0;
}

.credit-card dl div {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 10px 0;
  border-top: 1px solid #edf2f6;
}

.credit-card dt {
  color: #667783;
  font-size: 13px;
}

.credit-card dd {
  margin: 0;
  color: #2c3e50;
  font-size: 13px;
  font-weight: 800;
  text-align: right;
}

.credit-card .monthly-row dd {
  color: #ff8e71;
  font-size: 16px;
}

@media (max-width: 760px) {
  .modal-content {
    padding: 22px;
  }

  .compare-grid,
  .credit-controls,
  .credit-results {
    grid-template-columns: 1fr;
  }

  .credit-header {
    display: block;
  }

  .credit-header > p {
    max-width: none;
    margin-top: 10px;
    text-align: left;
  }
}
</style>
