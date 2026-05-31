<template>
  <div v-if="showScheduleModal" class="modal-overlay" @click.self="handleClose">
    <div class="modal-box" role="dialog" aria-labelledby="schedule-title">
      <button type="button" class="close-btn" @click="handleClose" aria-label="Close">
        ×
      </button>

      <h2 id="schedule-title">{{ t('appointment.title') }}</h2>
      <p class="modal-subtitle">{{ t('appointment.subtitle') }}</p>

      <div v-if="successMessage" class="success-message">
        {{ successMessage }}
      </div>

      <form v-else @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="slot">{{ t('appointment.slot') }}</label>
          <select
            id="slot"
            v-model="form.slotId"
            required
            :disabled="loading || availableSlots.length === 0"
          >
            <option value="" disabled>
              {{
                availableSlots.length === 0
                  ? t('appointment.noSlots')
                  : t('appointment.selectSlot')
              }}
            </option>
            <option v-for="slot in availableSlots" :key="slot.id" :value="slot.id">
              {{ slot.label }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label for="marca">{{ t('appointment.brand') }}</label>
          <input
            id="marca"
            v-model="form.marca"
            type="text"
            :placeholder="t('appointment.brandPlaceholder')"
            required
            :disabled="loading"
          />
        </div>

        <div class="form-group">
          <label for="modelo">{{ t('appointment.model') }}</label>
          <input
            id="modelo"
            v-model="form.modelo"
            type="text"
            :placeholder="t('appointment.modelPlaceholder')"
            required
            :disabled="loading"
          />
        </div>

        <div class="form-group">
          <label for="motivo">{{ t('appointment.reason') }}</label>
          <textarea
            id="motivo"
            v-model="form.motivo"
            rows="4"
            :placeholder="t('appointment.reasonPlaceholder')"
            required
            :disabled="loading"
          />
        </div>

        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <div class="modal-actions">
          <button type="button" class="btn-cancel" :disabled="loading" @click="handleClose">
            {{ t('appointment.cancel') }}
          </button>
          <button
            type="submit"
            class="btn-submit"
            :disabled="loading || availableSlots.length === 0"
          >
            {{ loading ? t('appointment.submitting') : t('appointment.submit') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAppointments } from '../composables/useAppointments';
import { useI18n } from '../i18n';

const router = useRouter();
const { t, locale } = useI18n();
const {
  showScheduleModal,
  loading,
  closeScheduleModal,
  getAvailableSlots,
  bookAppointment,
  subscribeToBookedSlots,
  unsubscribeFromBookedSlots,
} = useAppointments();

const form = ref({
  slotId: '',
  marca: '',
  modelo: '',
  motivo: '',
});

const errorMessage = ref<string | null>(null);
const successMessage = ref<string | null>(null);

const slotLocale = computed(() => (locale.value === 'en' ? 'en-US' : 'es-CO'));

const availableSlots = computed(() => getAvailableSlots(slotLocale.value));

const resetForm = () => {
  form.value = { slotId: '', marca: '', modelo: '', motivo: '' };
  errorMessage.value = null;
  successMessage.value = null;
};

watch(showScheduleModal, (open) => {
  if (open) {
    resetForm();
    subscribeToBookedSlots();
  }
});

onUnmounted(() => {
  unsubscribeFromBookedSlots();
});

const handleClose = () => {
  closeScheduleModal();
  resetForm();
};

const handleSubmit = async () => {
  errorMessage.value = null;

  try {
    await bookAppointment(form.value);
    successMessage.value = t('appointment.success');

    setTimeout(() => {
      handleClose();
      router.push('/');
    }, 1800);
  } catch (err: unknown) {
    const code = err instanceof Error ? err.message : '';
    if (code === 'SLOT_TAKEN') {
      errorMessage.value = t('appointment.slotTaken');
      form.value.slotId = '';
    } else if (code === 'AUTH_REQUIRED') {
      errorMessage.value = t('appointment.authRequired');
    } else {
      errorMessage.value = t('appointment.error');
    }
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-box {
  background: white;
  border-radius: 10px;
  padding: 2rem;
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.2);
}

.close-btn {
  position: absolute;
  top: 12px;
  right: 16px;
  background: none;
  border: none;
  font-size: 1.75rem;
  line-height: 1;
  cursor: pointer;
  color: #666;
}

.close-btn:hover {
  color: #333;
}

h2 {
  margin: 0 0 0.5rem;
  color: #2c3e50;
  font-size: 1.4rem;
}

.modal-subtitle {
  margin: 0 0 1.5rem;
  color: #666;
  font-size: 0.9rem;
}

.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.35rem;
  color: #333;
  font-weight: 600;
  font-size: 0.875rem;
}

input,
select,
textarea {
  width: 100%;
  padding: 0.65rem 0.75rem;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 0.9rem;
  font-family: inherit;
  box-sizing: border-box;
  transition: border-color 0.2s;
}

input:focus,
select:focus,
textarea:focus {
  outline: none;
  border-color: #2980b9;
  box-shadow: 0 0 0 3px rgba(41, 128, 185, 0.15);
}

input:disabled,
select:disabled,
textarea:disabled {
  background: #f4f6f8;
  cursor: not-allowed;
}

textarea {
  resize: vertical;
  min-height: 90px;
}

.modal-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 1.25rem;
}

.btn-cancel,
.btn-submit {
  flex: 1;
  padding: 0.65rem 1rem;
  border-radius: 5px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, opacity 0.2s;
}

.btn-cancel {
  background: white;
  color: #666;
  border: 1px solid #ddd;
}

.btn-cancel:hover:not(:disabled) {
  background: #f4f6f8;
}

.btn-submit {
  background: linear-gradient(135deg, #2980b9 0%, #2c3e50 100%);
  color: white;
  border: none;
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-1px);
}

.btn-submit:disabled,
.btn-cancel:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  background: #fee;
  color: #c33;
  padding: 0.65rem 0.75rem;
  border-radius: 5px;
  font-size: 0.875rem;
  border-left: 4px solid #c33;
  margin-top: 0.5rem;
}

.success-message {
  background: #e8f8ef;
  color: #1e7e34;
  padding: 1rem;
  border-radius: 5px;
  font-size: 1rem;
  font-weight: 600;
  text-align: center;
  border-left: 4px solid #28a745;
}
</style>
