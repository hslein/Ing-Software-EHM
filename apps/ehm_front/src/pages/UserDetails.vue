<template>
  <div class="user-details-container">
    <div class="card">
      <h2>User Details</h2>

      <form @submit.prevent="handleSubmit">
        <div class="field readonly-field">
          <label>Email</label>
          <div class="readonly-value">{{ userEmail }}</div>
        </div>

        <div class="field">
          <label for="name">Full name</label>
          <input id="name" v-model="form.name" type="text" placeholder="Your full name" />
        </div>

        <div class="field">
          <label for="birthdate">Birthdate</label>
          <input id="birthdate" v-model="form.birthdate" type="date" />
        </div>

        <div class="field">
          <label for="more">More details</label>
          <textarea id="more" v-model="form.more" rows="4" placeholder="Any additional info"></textarea>
        </div>

        <div class="actions">
          <button type="submit" :disabled="saving">{{ saving ? 'Saving...' : 'Save' }}</button>
        </div>

        <div v-if="error" class="error">{{ error }}</div>
        <div v-if="success" class="success">Saved successfully.</div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, onMounted } from 'vue';
import { useAuth } from '../composables/useAuth';
import { useUserDetails } from '../composables/useUserDetails';

const { currentUser, loading } = useAuth();
const { loadDetails, saveDetails } = useUserDetails();
const userEmail = computed(() => currentUser.value?.email ?? '');

const form = reactive({ name: '', birthdate: '', more: '' });
const saving = ref(false);
const error = ref<string | null>(null);
const success = ref(false);

const populate = async () => {
  if (!currentUser.value) return;
  try {
    const data = await loadDetails(currentUser.value.uid);
    if (data) {
      form.name = data.name ?? '';
      form.birthdate = data.birthdate ?? '';
      form.more = data.more ?? '';
    }
  } catch (err) {
    error.value = 'Failed to load details';
    console.error(err);
  }
};

onMounted(async () => {
  // wait until auth has initialized
  if (loading.value) {
    const un = setInterval(() => {
      if (!loading.value) {
        clearInterval(un);
        populate();
      }
    }, 100);
  } else {
    await populate();
  }
});

const handleSubmit = async () => {
  error.value = null;
  success.value = false;
  if (!currentUser.value) {
    error.value = 'You must be logged in';
    return;
  }
  saving.value = true;
  try {
    await saveDetails(currentUser.value.uid, {
      name: form.name || null,
      birthdate: form.birthdate || null,
      more: form.more || null,
    });
    success.value = true;
  } catch (err) {
    error.value = 'Failed to save details';
    console.error(err);
  } finally {
    saving.value = false;
  }
};
</script>

<style scoped>
.user-details-container { display:flex; justify-content:center; padding:40px; }
.card { width:100%; max-width:640px; background:white; padding:24px; border-radius:8px; box-shadow:0 8px 20px rgba(0,0,0,0.08); }
.field { margin-bottom:12px; }
label { display:block; margin-bottom:6px; font-weight:600; }
input, textarea { width:100%; padding:8px 10px; border:1px solid #ddd; border-radius:6px; }
.actions { margin-top:12px; }
button { padding:10px 14px; background:linear-gradient(135deg,#667eea,#764ba2); color:white; border:0; border-radius:6px; cursor:pointer; }
.readonly-field { margin-bottom:16px; }
.readonly-value { padding:8px 10px; border:1px solid #ddd; border-radius:6px; background:#f7f9fc; color:#333; min-height:40px; display:flex; align-items:center; }
.error { margin-top:10px; color:#c33; }
.success { margin-top:10px; color:#2a9d8f; }
</style>
