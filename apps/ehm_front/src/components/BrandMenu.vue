<script setup lang="ts">
import type { Brand } from '../types/catalog.types';

defineProps<{
  brand: Brand;
}>();

defineEmits<{
  viewInventory: [];
  scheduleTestDrive: [];
  requestFinancing: [];
}>();
</script>

<template>
  <section class="brand-menu" aria-live="polite">
    <div class="brand-menu-header">
      <h2>{{ brand.name }}</h2>
      <img :src="brand.image" :alt="brand.name" class="brand-logo" />
    </div>
    <p>Selecciona un vehiculo de {{ brand.name }} para ver su detalle rapido.</p>
    <div class="brand-menu-actions">
      <button type="button" @click="$emit('viewInventory')">Ver inventario</button>
      <button type="button" @click="$emit('scheduleTestDrive')">Agendar test drive</button>
      <button type="button" @click="$emit('requestFinancing')">Solicitar financiacion</button>
    </div>
  </section>
</template>

<style scoped>
.brand-menu {
  margin-top: 1.5rem;
  padding: 1.2rem;
  border-radius: 14px;
  border: 1px solid #dfe6ff;
  background: #ffffffde;
  box-shadow: 0 12px 30px rgba(24, 38, 76, 0.1);
}

.brand-menu-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.brand-logo {
  width: 120px;
  max-height: 42px;
  object-fit: contain;
}

.brand-menu-header h2 {
  color: #1f2a4a;
}

.brand-menu p {
  margin-top: 0.4rem;
  color: #576285;
}

.brand-menu-actions {
  margin-top: 1rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.7rem;
}

.brand-menu-actions button {
  border: none;
  border-radius: 999px;
  padding: 0.5rem 0.85rem;
  font-weight: 600;
  cursor: pointer;
  background: linear-gradient(135deg, #ff6f7a, #ff9b67);
  color: #fff;
}

.brand-menu-actions button:hover {
  filter: brightness(1.05);
}

.brand-menu-actions button:focus-visible {
  outline: 3px solid #ff8b54;
  outline-offset: 2px;
}
</style>
