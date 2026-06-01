<script setup lang="ts">
import { ref, computed, watch } from 'vue';

const isOpen = ref(false);

// Variables reactivas
const vehicleUsage = ref('urbano');
const monthlyKm = ref(2000);
const engineConfig = ref('turbo');
const coveragePlan = ref('premium');
const insuranceSliderIndex = ref(1);

const planIndices = ['basico', 'premium', 'platinum'];

watch(coveragePlan, (newPlan) => {
  insuranceSliderIndex.value = planIndices.indexOf(newPlan);
});

watch(insuranceSliderIndex, (newIndex) => {
  coveragePlan.value = planIndices[newIndex];
});

watch(vehicleUsage, (newUsage) => {
  if (newUsage === 'urbano') monthlyKm.value = 1200;
  else if (newUsage === 'trabajo_uni') monthlyKm.value = 800;
  else if (newUsage === 'viajes') monthlyKm.value = 3500;
});

const openModal = () => { isOpen.value = true; };
const closeModal = () => { isOpen.value = false; };

const currentCoveragePriceMonth = computed(() => {
  if (coveragePlan.value === 'basico') return 180000;
  if (coveragePlan.value === 'platinum') return 980000;
  return 450000;
});

const currentCoverageName = computed(() => {
  if (coveragePlan.value === 'basico') return 'Esencial';
  if (coveragePlan.value === 'platinum') return 'Platinum VIP Shield';
  return 'EHM Care Premium';
});

const currentSoatPrice = computed(() => {
  if (engineConfig.value === 'electrico') return 412000;
  if (engineConfig.value === 'competicion') return 815000;
  return 671000;
});

const totalOperatingCostMonth = computed(() => {
  let costPerKm = 2688;
  if (engineConfig.value === 'competicion') costPerKm = 4150; 
  else if (engineConfig.value === 'electrico') costPerKm = 950;  
  
  return (costPerKm * monthlyKm.value) + currentCoveragePriceMonth.value;
});

const totalOperatingCostWeek = computed(() => Math.round(totalOperatingCostMonth.value / 4.33));
const totalOperatingCostYear = computed(() => totalOperatingCostMonth.value * 12);

const formatCOP = (val: number) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(val);
};

defineExpose({ openModal });
</script>

<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="closeModal">
    <div class="modal-card">
      <div class="modal-header">
        <h3>EHM PROYECCIONES &middot; GASTO OPERATIVO</h3>
        <button class="close-btn" @click="closeModal">&times;</button>
      </div>

      <div class="modal-body">
        
        <div class="input-group">
          <label class="section-label">Uso Proyectado</label>
          <div class="grid-two-columns">
            <button class="selector-btn" :class="{ active: vehicleUsage === 'urbano' }" @click="vehicleUsage = 'urbano'">
              Urbano Diario
            </button>
            <button class="selector-btn" :class="{ active: vehicleUsage === 'trabajo_uni' }" @click="vehicleUsage = 'trabajo_uni'">
              Rutina Ejecutiva
            </button>
            <button class="selector-btn span-two" :class="{ active: vehicleUsage === 'viajes' }" @click="vehicleUsage = 'viajes'">
              Largas Distancias / Viajes
            </button>
          </div>
        </div>

        <div class="input-group">
          <div class="slider-label-row">
            <label class="section-label">Recorrido Estimado</label>
            <div class="value-box">{{ monthlyKm.toLocaleString('es-CO') }} km</div>
          </div>
          <div class="slider-container">
            <input type="range" min="500" max="5000" step="100" v-model.number="monthlyKm" class="premium-slider" />
            <div class="slider-ticks">
              <span>500 km</span>
              <span>5.000 km</span>
            </div>
          </div>
        </div>

        <div class="input-group">
          <label class="section-label">Ingeniería de Motor</label>
          <div class="grid-two-columns">
            <button class="selector-btn" :class="{ active: engineConfig === 'turbo' }" @click="engineConfig = 'turbo'">
              V6 / V8 Turbo
            </button>
            <button class="selector-btn" :class="{ active: engineConfig === 'competicion' }" @click="engineConfig = 'competicion'">
              Competición
            </button>
            <button class="selector-btn span-two" :class="{ active: engineConfig === 'electrico' }" @click="engineConfig = 'electrico'">
              100% Eléctrico / Híbrido
            </button>
          </div>
        </div>

        <div class="input-group">
          <label class="section-label">Plan de Respaldo</label>
          <div class="grid-three-columns">
            <button class="selector-btn text-xs" :class="{ active: coveragePlan === 'basico' }" @click="coveragePlan = 'basico'">
              Básico
            </button>
            <button class="selector-btn text-xs" :class="{ active: coveragePlan === 'premium' }" @click="coveragePlan = 'premium'">
              Care Premium
            </button>
            <button class="selector-btn text-xs" :class="{ active: coveragePlan === 'platinum' }" @click="coveragePlan = 'platinum'">
              Platinum VIP
            </button>
          </div>
        </div>

        <div class="highlight-slider-box">
          <div class="slider-label-row">
            <div class="insurance-info-left">
              <label class="section-label no-margin font-medium text-slate">Presupuesto de Cobertura</label>
              <span class="insurance-subtext">{{ currentCoverageName }}</span>
            </div>
            <div class="value-box insurance-value">{{ formatCOP(currentCoveragePriceMonth) }}<span class="per-month">/mes</span></div>
          </div>
          
          <div class="slider-container">
            <input type="range" min="0" max="2" step="1" v-model.number="insuranceSliderIndex" class="premium-slider" />
            <div class="slider-ticks font-serif">
              <span :class="{ 'tick-active': coveragePlan === 'basico' }">Básico</span>
              <span :class="{ 'tick-active': coveragePlan === 'premium' }">Premium</span>
              <span :class="{ 'tick-active': coveragePlan === 'platinum' }">Platinum</span>
            </div>
          </div>
          
          <div class="soat-legal-row">
            <span>SOAT Obligatorio (Tasa Anual Legal):</span>
            <strong>{{ formatCOP(currentSoatPrice) }} COP</strong>
          </div>
        </div>

        <div class="results-panel">
          <span class="panel-title">ESTIMACIÓN TOTAL DE INVERSIÓN OPERATIVA</span>
          
          <div class="result-row line-item">
            <span>Proyección Semanal</span>
            <span class="value-text">{{ formatCOP(totalOperatingCostWeek) }} COP</span>
          </div>

          <div class="result-row line-item">
            <span>Proyección Mensual</span>
            <span class="value-text font-semibold">{{ formatCOP(totalOperatingCostMonth) }} COP</span>
          </div>

          <div class="result-row highlight-year">
            <span>Inversión Total Anual</span>
            <strong>{{ formatCOP(totalOperatingCostYear) }} COP</strong>
          </div>
        </div>
      </div>
      
      <div class="modal-footer">
        <button class="action-btn" @click="closeModal">AGENDAR TEST DRIVE DISPONIBLE</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Transfondo sutil, emulando una galería de arte o boutique */
.modal-overlay {
  position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
  background: rgba(8, 13, 24, 0.45); backdrop-filter: blur(8px);
  display: flex; justify-content: center; align-items: center; z-index: 11000; padding: 16px;
}

/* Caja del modal con líneas ultra-delgadas y limpias */
.modal-card {
  background: #ffffff; border-radius: 12px; width: 100%; max-width: 410px;
  max-height: 92vh; box-shadow: 0 30px 60px rgba(15, 23, 42, 0.15); overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #0f172a; border: 1px solid #e2e8f0;
  display: flex; flex-direction: column;
}

.modal-header {
  background: #ffffff; color: #0f172a; padding: 16px 24px;
  display: flex; align-items: center; justify-content: space-between;
  border-bottom: 1px solid #f1f5f9; flex-shrink: 0;
}

.modal-header h3 { margin: 0; font-size: 0.8rem; font-weight: 700; letter-spacing: 1.2px; color: #1e293b; }
.close-btn { background: none; border: none; color: #94a3b8; font-size: 1.3rem; cursor: pointer; transition: color 0.2s; }
.close-btn:hover { color: #0f172a; }

.modal-body { padding: 16px 24px; overflow-y: auto; flex: 1; }
.input-group { margin-bottom: 14px; }

/* Tipografía de etiquetas sofisticadas (Tracking elegante) */
.section-label { 
  font-size: 0.65rem; font-weight: 700; margin-bottom: 6px; display: block; 
  color: #64748b; text-transform: uppercase; letter-spacing: 0.8px; 
}

/* Grillas limpias que reducen espacio vertical */
.grid-two-columns { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
.grid-three-columns { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px; }
.span-two { grid-column: span 2; }

/* Botones con estilo sutil, sobrio y esquinas pulidas */
.selector-btn { 
  width: 100%; padding: 8px 10px; border-radius: 6px; font-weight: 500; 
  font-size: 0.76rem; cursor: pointer; text-align: center; transition: all 0.2s ease;
  letter-spacing: 0.1px;
}
.text-xs { font-size: 0.72rem; }

.selector-btn.active { background: #090d16; color: #ffffff; border: 1px solid #090d16; font-weight: 600; }
.selector-btn:not(.active) { background: #ffffff; color: #334155; border: 1px solid #e2e8f0; }
.selector-btn:not(.active):hover { background: #f8fafc; border-color: #cbd5e1; }

.slider-label-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
.value-box { padding: 2px 8px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 5px; font-weight: 700; font-size: 0.78rem; color: #0f172a; font-variant-numeric: tabular-nums; }

/* Deslizadores Premium Minimalistas */
.slider-container { padding: 0 2px; }
.premium-slider { -webkit-appearance: none; width: 100%; height: 3px; background: #e2e8f0; border-radius: 2px; outline: none; margin: 6px 0 4px 0; }
.premium-slider::-webkit-slider-thumb { -webkit-appearance: none; width: 12px; height: 12px; border-radius: 50%; background: #0f172a; cursor: pointer; transition: transform 0.1s; }
.premium-slider::-webkit-slider-thumb:hover { transform: scale(1.2); }

.slider-ticks { display: flex; justify-content: space-between; font-size: 0.65rem; color: #94a3b8; font-weight: 500; letter-spacing: 0.2px; }
.tick-active { color: #090d16; font-weight: 600; }

/* Tarjeta Destacada de Coberturas */
.highlight-slider-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; margin-top: 14px; }
.insurance-info-left { display: flex; flex-direction: column; }
.font-medium { font-weight: 600; }
.text-slate { color: #334155 !important; }
.insurance-subtext { font-size: 0.74rem; color: #0f172a; font-weight: 600; margin-top: 1px; }

.value-box.insurance-value { background: #090d16; color: #ffffff; border-color: #090d16; font-size: 0.8rem; }
.per-month { font-size: 0.6rem; color: #94a3b8; font-weight: 400; margin-left: 2px; }

.soat-legal-row { display: flex; justify-content: space-between; margin-top: 10px; padding-top: 8px; border-top: 1px dashed #e2e8f0; font-size: 0.72rem; color: #64748b; }
.soat-legal-row strong { color: #0f172a; font-variant-numeric: tabular-nums; }

/* Bloque de Resultados Finales */
.results-panel { background: #f8fafc; border-top: 1px dashed #cbd5e1; padding: 12px 0 0 0; margin-top: 14px; display: flex; flex-direction: column; gap: 4px; }
.panel-title { font-size: 0.6rem; font-weight: 700; color: #94a3b8; letter-spacing: 1px; padding-bottom: 4px; }
.line-item { display: flex; justify-content: space-between; align-items: center; font-size: 0.78rem; color: #475569; }
.value-text { color: #0f172a; font-variant-numeric: tabular-nums; }
.font-semibold { font-weight: 600; }

/* Resaltado Ejecutivo Final con toques dorados */
.highlight-year { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #e2e8f0; padding-top: 6px; margin-top: 2px; }
.highlight-year span { font-size: 0.78rem; font-weight: 700; color: #0f172a; text-transform: uppercase; letter-spacing: 0.3px; }
.highlight-year strong { color: #090d16; font-size: 1.15rem; font-weight: 700; border-bottom: 2px solid #b45309; font-variant-numeric: tabular-nums; white-space: nowrap; }

.modal-footer { padding: 4px 24px 16px 24px; flex-shrink: 0; }
.action-btn { background: #090d16; color: #ffffff; border: none; padding: 12px; border-radius: 6px; width: 100%; cursor: pointer; font-weight: 700; font-size: 0.76rem; letter-spacing: 1px; transition: background 0.2s; }
.action-btn:hover { background: #1e293b; }
</style>