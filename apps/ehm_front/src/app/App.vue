<script setup lang="ts">
import { ref, computed } from 'vue';
import { RouterView, useRoute, useRouter } from 'vue-router';
import Actions from '../components/Actions.vue';
import DealerFooter from '../components/DealerFooter.vue';
import NavBar from '../components/NavBar.vue';
import FuelSavingsModal from '../components/FuelSavingsModal.vue';
import ScheduleAppointmentModal from '../components/ScheduleAppointmentModal.vue';
import VehicleDeliveryModal from '../components/VehicleDeliveryModal.vue'; // 1. Nueva importación

const route = useRoute();
const router = useRouter();

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
</script>

<template>
  <div class="app">
    <NavBar v-if="showChrome" @go-about="goAbout" @go-home="goHome" />

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
</style>
