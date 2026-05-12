<script setup lang="ts">
import type { Brand } from '../composables/useVehicles';

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
  <div class="action-buttons" aria-label="Brand actions">
    <button type="button" class="btn-secondary" @click="$emit('viewInventory')">
      View Inventory
    </button>
    <button type="button" class="btn-secondary" @click="$emit('scheduleTestDrive')">
      Schedule Test Drive
    </button>
    <button type="button" class="btn-secondary" @click="$emit('requestFinancing')">
      Request Financing
    </button>
  </div>
</template>

<style scoped>
.action-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.btn-secondary {
  background: white;
  color: #2980b9;
  border: 2px solid #2980b9;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  font-size: 12px;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: #2980b9;
  color: white;
}

@media (max-width: 768px) {
  .action-buttons {
    width: 100%;
    flex-direction: column;
  }
}
</style>
