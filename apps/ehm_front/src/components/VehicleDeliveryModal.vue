<script setup lang="ts">
import { ref, computed } from 'vue';

const isOpen = ref(false);

// Control principal: Inmediata (No) o Configurar (Sí)
const wantsCustom = ref('no'); 

// Parámetros de valor y motor
const vehiclePriceCOP = ref(150000000); 
const engineType = ref('combustion'); 

// --- Opciones de Personalización Sencillas ---
const bodyMaterial = ref('standard_paint');  // Pintura
const interiorTrim = ref('standard_seats');  // Habitáculo
const wheelType = ref('standard_wheels');     // Rines
const lightSystem = ref('standard_lights');   // Luces
const glassType = ref('standard_glass');      // Vidrios

// Formateo de moneda
const formatCOP = (val: number) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP', minimumFractionDigits: 0
  }).format(val);
};

// Lógica de cálculo de tiempo original
const totalWeeksWait = computed(() => {
  // Base por precio (Logística inicial)
  let baseWeeks = 3; 
  if (vehiclePriceCOP.value >= 180000000 && vehiclePriceCOP.value < 500000000) baseWeeks = 6;
  else if (vehiclePriceCOP.value >= 500000000) baseWeeks = 12;

  // Recargo por tecnología eléctrica
  if (engineType.value === 'electric') baseWeeks += 2; 

  if (wantsCustom.value === 'no') return baseWeeks;

  // Suma de personalización simple
  let customWeeks = 0;
  
  // 1. Pintura
  if (bodyMaterial.value === 'special_paint') customWeeks += 4; 
  if (bodyMaterial.value === 'exclusive_paint') customWeeks += 8; 

  // 2. Interior
  if (interiorTrim.value === 'custom_interior') customWeeks += 5; 
  if (interiorTrim.value === 'performance_interior') customWeeks += 9; 

  // 3. Rines
  if (wheelType.value === 'premium_wheels') customWeeks += 3; 
  if (wheelType.value === 'forged_wheels') customWeeks += 6; 

  // 4. Luces
  if (lightSystem.value === 'matrix_lights') customWeeks += 2; 
  if (lightSystem.value === 'laser_lights') customWeeks += 4; 

  // 5. Vidrios
  if (glassType.value === 'privacy_glass') customWeeks += 1; 
  if (glassType.value === 'armor_glass') customWeeks += 5; 

  return baseWeeks + customWeeks;
});

const openModal = () => { isOpen.value = true; };
const closeModal = () => { isOpen.value = false; };

defineExpose({ openModal });
</script>

<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="closeModal">
    <div class="modal-card">
      <div class="modal-header">
        <h3>EHM CONCIERGE &middot; PLANIFICACIÓN DE ENTREGA</h3>
        <button class="close-btn" @click="closeModal">&times;</button>
      </div>

      <div class="modal-body">
        <p class="intro-text">
          Configure las variables de su vehículo para proyectar el tiempo de importación y alistamiento final.
        </p>

        <div class="input-group">
          <div class="label-row">
            <label class="section-label">Precio estimado (COP)</label>
            <span class="price-display">{{ formatCOP(vehiclePriceCOP) }}</span>
          </div>
          <div class="slider-container">
            <input type="range" min="80000000" max="1500000000" step="10000000" v-model.number="vehiclePriceCOP" class="premium-slider" />
            <div class="slider-legends"><span>80M</span><span>500M</span><span>1.500M</span></div>
          </div>
        </div>

        <div class="input-group">
          <label class="section-label">Tecnología de Motorización</label>
          <div class="toggle-selector">
            <label :class="{ active: engineType === 'combustion' }">
              <input type="radio" value="combustion" v-model="engineType" />
              <span>Combustión (Gasolina)</span>
            </label>
            <label :class="{ active: engineType === 'electric' }">
              <input type="radio" value="electric" v-model="engineType" />
              <span>100% Eléctrico / Híbrido</span>
            </label>
          </div>
        </div>
        
        <div class="input-group">
          <label class="section-label">¿Desea personalizar el vehículo de fábrica?</label>
          <div class="toggle-selector-main">
            <label :class="{ active: wantsCustom === 'no' }">
              <input type="radio" value="no" v-model="wantsCustom" />
              <span>No (Entrega Inmediata)</span>
            </label>
            <label :class="{ active: wantsCustom === 'si' }">
              <input type="radio" value="si" v-model="wantsCustom" />
              <span>Sí (Configurar)</span>
            </label>
          </div>
        </div>

        <div v-if="wantsCustom === 'si'" class="customization-section">
          
          <div class="input-group-simple">
            <label>Color y Pintura</label>
            <select v-model="bodyMaterial" class="premium-select">
              <option value="standard_paint">Color de serie (+0 sem)</option>
              <option value="special_paint">Pintura Mate / Satinada (+4 sem)</option>
              <option value="exclusive_paint">Color de edición limitada (+8 sem)</option>
            </select>
          </div>

          <div class="input-group-simple">
            <label>Interior y Confort</label>
            <select v-model="interiorTrim" class="premium-select">
              <option value="standard_seats">Configuración original (+0 sem)</option>
              <option value="custom_interior">Cuero Premium Nappa (+5 sem)</option>
              <option value="performance_interior">Detalles en Fibra de Carbono (+9 sem)</option>
            </select>
          </div>

          <div class="input-group-simple">
            <label>Diseño de Rines</label>
            <select v-model="wheelType" class="premium-select">
              <option value="standard_wheels">Rines de aleación estándar (+0 sem)</option>
              <option value="premium_wheels">Rines de diseño deportivo (+3 sem)</option>
              <option value="forged_wheels">Rines forjados ultra-ligeros (+6 sem)</option>
            </select>
          </div>

          <div class="input-group-simple">
            <label>Sistema de Luces</label>
            <select v-model="lightSystem" class="premium-select">
              <option value="standard_lights">Ópticas LED de serie (+0 sem)</option>
              <option value="matrix_lights">Faros Matrix Inteligentes (+2 sem)</option>
              <option value="laser_lights">Iluminación Láser High-Beam (+4 sem)</option>
            </select>
          </div>

          <div class="input-group-simple/full">
            <label>Tipo de Vidrios</label>
            <select v-model="glassType" class="premium-select">
              <option value="standard_glass">Cristales de serie (+0 sem)</option>
              <option value="privacy_glass">Vidrios con oscurecido de privacidad (+1 sem)</option>
              <option value="armor_glass">Vidrios con Blindaje Certificado (+5 sem)</option>
            </select>
          </div>

        </div>

        <div class="results-panel">
          <div class="result-row highlight">
            <span>Plazo total estimado:</span>
            <strong>{{ totalWeeksWait }} semanas</strong>
          </div>
          <div class="divider-line"></div>
          <div class="result-row font-serif-row">
            <span>Importación:</span>
            <span class="text-value">{{ vehiclePriceCOP < 500000000 ? 'Ruta Logística Regular' : 'Envío Protegido VIP' }}</span>
          </div>
          <div class="result-row font-serif-row">
            <span>Prioridad:</span>
            <span class="text-status" :class="{ 'fast-track': wantsCustom === 'no' }">
              {{ wantsCustom === 'no' ? 'Despacho Inmediato de Stock' : 'Cupo Reservado en Fábrica' }}
            </span>
          </div>
        </div>
      </div>
      
      <div class="modal-footer">
        <button class="action-btn" @click="closeModal">AVANZAR CON LA RESERVA</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Fondo de desenfoque de ambiente boutique */
.modal-overlay {
  position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
  background: rgba(8, 13, 24, 0.45); backdrop-filter: blur(8px);
  display: flex; justify-content: center; align-items: center; z-index: 11000; padding: 16px;
}

/* Caja de diseño minimalista con bordes milimétricos */
.modal-card {
  background: #ffffff; border-radius: 12px; width: 100%; max-width: 420px;
  max-height: 94vh; box-shadow: 0 30px 60px rgba(15, 23, 42, 0.15); overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #0f172a; border: 1px solid #e2e8f0;
  display: flex; flex-direction: column;
}

.modal-header {
  background: #ffffff; color: #0f172a; padding: 16px 24px;
  display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f1f5f9;
  flex-shrink: 0;
}
.modal-header h3 { margin: 0; font-size: 0.8rem; font-weight: 700; letter-spacing: 1.2px; color: #1e293b; }
.close-btn { background: none; border: none; color: #94a3b8; font-size: 1.3rem; cursor: pointer; transition: color 0.2s; }
.close-btn:hover { color: #0f172a; }

.modal-body { padding: 16px 24px; overflow-y: auto; flex: 1; }
.intro-text { font-size: 0.78rem; color: #64748b; margin-bottom: 16px; line-height: 1.4; }

.input-group { margin-bottom: 14px; display: flex; flex-direction: column; }

/* Etiquetas premium con tracking ejecutivo */
.section-label { 
  font-size: 0.65rem; font-weight: 700; margin-bottom: 6px; display: block; 
  color: #64748b; text-transform: uppercase; letter-spacing: 0.8px; 
}

.input-group-simple { display: flex; flex-direction: column; }
.input-group-simple label, .input-group-simple\/full label { font-size: 0.74rem; font-weight: 600; margin-bottom: 4px; color: #334155; }

.label-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px; }
.price-display { font-size: 0.82rem; font-weight: 700; color: #ffffff; background: #090d16; padding: 2px 8px; border-radius: 5px; font-variant-numeric: tabular-nums; }

/* Ajuste del Deslizador */
.slider-container { padding: 0 2px; }
.premium-slider { -webkit-appearance: none; width: 100%; height: 3px; background: #e2e8f0; border-radius: 2px; outline: none; margin: 6px 0 4px 0; }
.premium-slider::-webkit-slider-thumb { -webkit-appearance: none; width: 12px; height: 12px; border-radius: 50%; background: #090d16; cursor: pointer; transition: transform 0.1s; }
.premium-slider::-webkit-slider-thumb:hover { transform: scale(1.2); }
.slider-legends { display: flex; justify-content: space-between; font-size: 0.65rem; color: #94a3b8; font-weight: 600; }

/* Selectores de Radio tipo Botones de lujo */
.toggle-selector, .toggle-selector-main { display: flex; gap: 6px; }
.toggle-selector label, .toggle-selector-main label {
  flex: 1; padding: 8px; border: 1px solid #e2e8f0; border-radius: 6px; text-align: center;
  font-size: 0.76rem; font-weight: 500; cursor: pointer; transition: all 0.2s ease; background: #ffffff; color: #334155;
}
.toggle-selector input, .toggle-selector-main input { display: none; }
.toggle-selector label.active, .toggle-selector-main label.active { background: #090d16; color: #ffffff; border-color: #090d16; font-weight: 600; }
.toggle-selector label:not(.active):hover, .toggle-selector-main label:not(.active):hover { background: #f8fafc; border-color: #cbd5e1; }

/* Menús desplegables integrados estéticamente */
.premium-select { 
  padding: 8px 10px; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 0.78rem; 
  color: #0f172a; background-color: #ffffff; outline: none; transition: border 0.2s;
}
.premium-select:focus { border-color: #94a3b8; }

/* Contenedor de personalización organizado en rejilla sutil */
.customization-section { 
  background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; 
  padding: 12px; margin-bottom: 16px; display: grid; grid-template-columns: 1fr 1fr; gap: 10px;
}
.input-group-simple\/full { grid-column: span 2; display: flex; flex-direction: column; }

/* Panel de Resultados de alta gama */
.results-panel { background: #f8fafc; border-top: 1px dashed #cbd5e1; padding: 12px 0 0 0; margin-top: 16px; }
.result-row { display: flex; justify-content: space-between; font-size: 0.78rem; margin: 4px 0; align-items: center; color: #475569; }
.result-row.highlight { font-size: 0.78rem; font-weight: 700; color: #0f172a; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.3px; }
.result-row.highlight strong { color: #090d16; font-size: 1.15rem; font-weight: 700; border-bottom: 2px solid #b45309; font-variant-numeric: tabular-nums; }
.text-value { color: #0f172a; font-weight: 600; }
.text-status { color: #b45309; font-weight: 700; font-size: 0.7rem; letter-spacing: 0.3px; }
.text-status.fast-track { color: #16a34a; }

.divider-line { border-top: 1px solid #e2e8f0; margin: 6px 0; }
.modal-footer { padding: 4px 24px 16px 24px; flex-shrink: 0; }

/* Botón de acción maestro */
.action-btn { 
  background: #090d16; color: #ffffff; border: none; padding: 12px; border-radius: 6px; 
  cursor: pointer; font-weight: 700; width: 100%; font-size: 0.76rem; letter-spacing: 1px; transition: background 0.2s; 
}
.action-btn:hover { background: #1e293b; }
</style>