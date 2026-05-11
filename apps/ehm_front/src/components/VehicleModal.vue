<script setup lang="ts">
import type { Vehicle } from '../types/catalog.types';

defineProps<{
  brandName: string;
  vehicle: Vehicle | null;
}>();

defineEmits<{
  close: [];
}>();
</script>

<template>
  <div v-if="vehicle" class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <button class="modal-close" @click="$emit('close')">&times;</button>
      <div class="modal-body">
        <img :src="vehicle.image" :alt="`${brandName} ${vehicle.model}`" class="modal-image" />
        <h2>{{ brandName }} {{ vehicle.model }}</h2>
        <p>{{ vehicle.description }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 18px;
  padding: 2rem;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 14px 40px rgba(42, 53, 89, 0.3);
}

.modal-close {
  position: absolute;
  top: 10px;
  right: 15px;
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: #666;
}

.modal-body {
  text-align: center;
}

.modal-image {
  width: 100%;
  max-width: 300px;
  height: auto;
  border-radius: 10px;
  margin-bottom: 1rem;
}

.modal-body h2 {
  margin-bottom: 1rem;
  color: #30406a;
}

.modal-body p {
  color: #666;
  line-height: 1.6;
}
</style>
