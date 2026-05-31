<script setup lang="ts">
import type { Brand } from '../composables/useVehicles';
import { useI18n } from '../i18n';

defineProps<{
  brand: Brand;
}>();

defineEmits<{
  viewInventory: [];
  scheduleTestDrive: [];
  requestFinancing: [];
}>();

const { t } = useI18n();
</script>

<template>
  <section class="brand-menu" :aria-label="t('brandMenu.ariaLabel', { brand: brand.name })">
    <div class="brand-menu-actions">
      <button type="button" @click="$emit('viewInventory')">
        {{ t('vehicles.viewInventory') }}
      </button>
      <button type="button" @click="$emit('scheduleTestDrive')">
        {{ t('vehicles.scheduleTestDrive') }}
      </button>
      <button type="button" @click="$emit('requestFinancing')">
        {{ t('vehicles.requestFinancing') }}
      </button>
    </div>
  </section>
</template>

<style scoped>
.brand-menu {
  padding: 0;
  background: transparent;
}

.brand-menu-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.brand-menu-actions button {
  background: white;
  color: #2980b9;
  border: 2px solid #2980b9;
  padding: 8px 16px;
  border-radius: 4px;
  font-weight: 600;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.brand-menu-actions button:hover {
  background: #2980b9;
  color: white;
}

.brand-menu-actions button:focus-visible {
  outline: 3px solid #ff8b54;
  outline-offset: 2px;
}

@media (max-width: 768px) {
  .brand-menu-actions {
    width: 100%;
    flex-direction: column;
  }
}
</style>
