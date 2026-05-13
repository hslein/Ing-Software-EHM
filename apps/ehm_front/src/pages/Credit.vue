<template>
  <div class="credit-page-container">
    <section class="hero-header">
      <span class="eyebrow">Soluciones Financieras EHM</span>
      <h1>EHM DIRECT CREDIT</h1>
      <p class="eyebrow">Calcula tu plan de financiación y adquiere tu próximo vehículo con nosotros.</p>
    </section>

    <div class="simulator-grid">
      <div class="config-panel">
        <h3 class="section-title">Personaliza tu inversión</h3>
        
        <div class="input-card">
          <label>Precio del Vehículo (COP)</label>
          <div class="price-input-wrapper">
            <span class="currency-symbol">$</span>
            <input 
              type="number" 
              v-model="carPrice" 
              class="main-price-input"
              placeholder="0"
            />
          </div>
          <p class="input-help">Ingresa el valor del vehículo que deseas en EHM.</p>
        </div>

        <div class="input-card">
          <div class="label-row">
            <label>Cuota Inicial</label>
            <span class="val">{{ formatPrice(downPayment) }}</span>
          </div>
          <input 
            type="range" 
            :min="carPrice * 0.2" 
            :max="carPrice * 0.9" 
            step="1000000" 
            v-model="downPayment" 
            class="slider" 
          />
          <div class="range-labels">
            <span>Mínimo sugerido (20%)</span>
            <span>Máximo (90%)</span>
          </div>
        </div>

        <div class="input-card">
          <label>Plazo de Financiación</label>
          <div class="months-selector">
            <button 
              v-for="m in [12, 24, 36, 48, 60, 72]" 
              :key="m" 
              :class="{ active: months === m }" 
              @click="months = m"
            >
              {{ m }} <small>meses</small>
            </button>
          </div>
        </div>
      </div>

      <div class="result-panel">
        <h3 class="section-title white">Análisis de Crédito EHM</h3>
        
        <div class="chart-container">
          <canvas id="creditChart" ref="chartCanvas"></canvas>
        </div>

        <div class="summary-details">
          <div class="row">
            <span class="dot capital"></span>
            <span>Financiación EHM</span>
            <span>{{ formatPrice(carPrice - downPayment) }}</span>
          </div>
          <div class="row">
            <span class="dot interest"></span>
            <span>Intereses estimados</span>
            <span>{{ formatPrice(totalInterest) }}</span>
          </div>
          
          <div class="divider"></div>
          
          <div class="main-result">
            <span class="label">Cuota Mensual EHM</span>
            <h2 class="amount">{{ formatPrice(monthlyPayment) }}*</h2>
          </div>
        </div>

        <button class="btn-primary" @click="contactExpert">
          Contactar con un asesor EHM
        </button>
        <p class="legal-text">
          *Esta simulación es una herramienta informativa de Concesionario EHM. 
          Sujeto a términos, condiciones y aprobación crediticia.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import Chart from 'chart.js/auto';

const carPrice = ref(110000000);
const downPayment = ref(33000000);
const months = ref(48);
const interestRate = 0.0105; // Tasa EHM simulada
const chartCanvas = ref(null);
let chartInstance = null;

const monthlyPayment = computed(() => {
  const p = carPrice.value - downPayment.value;
  const r = interestRate;
  const n = months.value;
  if (p <= 0) return 0;
  return Math.round((p * r) / (1 - Math.pow(1 + r, -n)));
});

const totalInterest = computed(() => {
  return (monthlyPayment.value * months.value) - (carPrice.value - downPayment.value);
});

const updateChart = () => {
  if (!chartCanvas.value) return;
  const ctx = chartCanvas.value.getContext('2d');
  
  const data = {
    labels: ['Capital EHM', 'Intereses'],
    datasets: [{
      data: [carPrice.value - downPayment.value, totalInterest.value],
      backgroundColor: ['#ffffff', '#ff8e71'],
      borderWidth: 0,
      hoverOffset: 12
    }]
  };

  if (chartInstance) {
    chartInstance.data = data;
    chartInstance.update();
  } else {
    chartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: data,
      options: {
        cutout: '75%',
        plugins: { 
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1a1a1a',
            padding: 12,
            titleFont: { size: 14 },
            bodyFont: { size: 13 }
          }
        },
        responsive: true,
        maintainAspectRatio: false
      }
    });
  }
};

watch([carPrice, downPayment, months], () => {
  updateChart();
});

onMounted(() => {
  updateChart();
});

const formatPrice = (v) => {
  return new Intl.NumberFormat('es-CO', { 
    style: 'currency', 
    currency: 'COP', 
    minimumFractionDigits: 0 
  }).format(v);
};

const contactExpert = () => {
  const msg = `Hola EHM! Usé el simulador web para un vehículo de ${formatPrice(carPrice.value)}. Mi inicial es ${formatPrice(downPayment.value)} a ${months.value} meses.`;
  window.open(`https://api.whatsapp.com/send?phone=573173250884&text=${encodeURIComponent(msg)}`, '_blank');
};
</script>

<style scoped>
.credit-page-container {
  padding: 120px 20px 60px;
  background: #fff;
  max-width: 1200px;
  margin: 0 auto;
}

.hero-header { text-align: center; margin-bottom: 70px; }
.hero-header h1 { 
  font-size: 42px; 
  font-weight: 300; 
  letter-spacing: 6px; 
  color: #0a192f;
}
.eyebrow { text-transform: uppercase; letter-spacing: 4px; font-size: 12px; color: #ff8e71; font-weight: bold; }
.subtitle { color: #555; font-size: 18px; max-width: 600px; margin: 15px auto; }

.simulator-grid { display: grid; grid-template-columns: 1fr 420px; gap: 50px; }

.section-title { 
  font-size: 16px; 
  text-transform: uppercase; 
  letter-spacing: 2px; 
  margin-bottom: 30px; 
  border-bottom: 1px solid #eee; 
  padding-bottom: 10px; 
  color: #333;
}
.section-title.white { color: #fff; border-color: #333; }

.input-card { margin-bottom: 40px; }
.input-card label { display: block; font-weight: bold; font-size: 13px; text-transform: uppercase; margin-bottom: 15px; color: #666; }

.price-input-wrapper { display: flex; align-items: center; border-bottom: 2px solid #0a192f; padding-bottom: 5px; }
.currency-symbol { font-size: 24px; font-weight: bold; margin-right: 10px; color: #0a192f; }
.main-price-input { border: none; font-size: 32px; font-weight: bold; width: 100%; outline: none; background: transparent; color: #0a192f; }
.input-help { font-size: 12px; color: #999; margin-top: 8px; }

.months-selector { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.months-selector button { padding: 15px; border: 1px solid #ddd; background: #fff; cursor: pointer; transition: 0.3s; font-weight: 600; }
.months-selector button.active { background: #0a192f; color: #fff; border-color: #0a192f; }

.slider { width: 100%; accent-color: #0a192f; }
.label-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.label-row .val { font-size: 20px; font-weight: bold; color: #0a192f; }
.range-labels { display: flex; justify-content: space-between; font-size: 11px; color: #999; }

/* Panel Derecho EHM */
.result-panel { 
  background: #0a192f; 
  color: #fff; 
  padding: 45px; 
  border-radius: 15px; 
  box-shadow: 0 20px 40px rgba(10, 25, 47, 0.2);
}

.chart-container { width: 220px; height: 220px; margin: 0 auto 35px; position: relative; }

.summary-details .row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; font-size: 14px; color: #e6f1ff; }
.dot { width: 12px; height: 12px; border-radius: 3px; margin-right: 12px; }
.dot.capital { background: #ffffff; }
.dot.interest { background: #ff8e71; }

.divider { height: 1px; background: rgba(255,255,255,0.1); margin: 30px 0; }
.main-result .label { font-size: 12px; text-transform: uppercase; color: #8892b0; letter-spacing: 1px; }
.main-result .amount { font-size: 36px; color: #ff8e71; margin-top: 8px; }

.btn-primary { 
  width: 100%; padding: 22px; background: #ff8e71; color: #fff; border: none; 
  text-transform: uppercase; font-weight: bold; margin-top: 35px; cursor: pointer; 
  border-radius: 5px; transition: 0.3s; letter-spacing: 1px;
}
.btn-primary:hover { background: #e57d61; transform: translateY(-2px); }
.legal-text { font-size: 10px; color: #8892b0; margin-top: 25px; line-height: 1.5; text-align: center; }

@media (max-width: 950px) { .simulator-grid { grid-template-columns: 1fr; } }
</style>