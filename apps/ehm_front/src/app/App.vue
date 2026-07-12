<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { RouterView, useRoute, useRouter } from 'vue-router';
import Actions from '../components/Actions.vue';
import DealerFooter from '../components/DealerFooter.vue';
import NavBar from '../components/NavBar.vue';
import FuelSavingsModal from '../components/FuelSavingsModal.vue';
import ScheduleAppointmentModal from '../components/ScheduleAppointmentModal.vue';
import { useI18n } from '../i18n';
import VehicleDeliveryModal from '../components/VehicleDeliveryModal.vue'; // 1. Nueva importación

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const routeLoading = ref(false);
let removeBeforeGuard: (() => void) | null = null;
let removeAfterHook: (() => void) | null = null;

// Controlar si se muestra el diseño común (Navbar, Footer, etc.) basado en la ruta
const showChrome = computed(() => route.meta.hideChrome !== true);

// Referencias de Vue para conectarse directamente con los modales
const savingsModalRef = ref<InstanceType<typeof FuelSavingsModal> | null>(null);
const deliveryModalRef = ref<InstanceType<typeof VehicleDeliveryModal> | null>(null); // 2. Nueva referencia

// Función que ejecuta el método expuesto 'openModal' dentro del simulador de gastos
const triggerSavingsModal = () => {
  if (savingsModalRef.value) {
    savingsModalRef.value.openModal();
  }
};

// 3. Nueva función para ejecutar el método 'openModal' dentro del simulador de entrega
const triggerDeliveryModal = () => {
  if (deliveryModalRef.value) {
    deliveryModalRef.value.openModal();
  }
};

// Rutas e interacciones del proyecto
const goHome = () => { router.push('/'); };
const goAbout = () => { router.push('/about'); };
const openCredit = () => { router.push('/credit'); };

onMounted(() => {
  removeBeforeGuard = router.beforeEach((to, from) => {
    if (to.fullPath !== from.fullPath) {
      routeLoading.value = true;
    }
  });

  removeAfterHook = router.afterEach(() => {
    window.setTimeout(() => {
      routeLoading.value = false;
    }, 220);
  });
});

onUnmounted(() => {
  removeBeforeGuard?.();
  removeAfterHook?.();
});
</script>

<template>
  <div class="app">
    <NavBar v-if="showChrome" @go-about="goAbout" @go-home="goHome" />

    <Transition name="page-loader-fade">
      <div v-if="routeLoading" class="page-route-loader" aria-live="polite" :aria-label="t('common.loadingPage')">
        <div class="route-loader-mark" aria-hidden="true"></div>
      </div>
    </Transition>

    <RouterView />

    <DealerFooter v-if="showChrome" />
    
    <Actions 
      v-if="showChrome" 
      @open-credit="openCredit" 
      @open-savings="triggerSavingsModal" 
      @open-delivery="triggerDeliveryModal" 
    />

    <Teleport to="body">
      <FuelSavingsModal ref="savingsModalRef" />
      <VehicleDeliveryModal ref="deliveryModalRef" />
      <ScheduleAppointmentModal />
    </Teleport>
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  background-color: #ecf0f1;
  position: relative;
}

.page-route-loader {
  position: fixed;
  inset: 0;
  z-index: 250;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(10, 13, 20, 0.72);
  backdrop-filter: blur(3px);
}

.route-loader-mark {
  width: 58px;
  height: 58px;
  border: 3px solid rgba(255, 255, 255, 0.2);
  border-top-color: var(--ehm-accent);
  border-radius: 50%;
  animation: route-spin 0.8s linear infinite;
  box-shadow: 0 0 28px rgba(255, 142, 113, 0.28);
}

.page-loader-fade-enter-active,
.page-loader-fade-leave-active {
  transition: opacity 0.18s ease;
}

.page-loader-fade-enter-from,
.page-loader-fade-leave-to {
  opacity: 0;
}

@keyframes route-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
