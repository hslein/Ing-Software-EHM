<template>
  <div class="users-list-container">
    <div class="card">
      <div class="header-row">
        <h2>Users</h2>
        <button class="refresh-btn" @click="loadUsers" :disabled="loading">Refresh</button>
      </div>

      <div v-if="error" class="error">{{ error }}</div>
      <div v-if="loading" class="info">Loading users...</div>

      <table v-if="!loading && users.length" class="users-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Email</th>
            <th>Type</th>
            <th>Created At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.uid">
            <td>{{ user.uid }}</td>
            <td>{{ user.email ?? '—' }}</td>
            <td>{{ user.role }}</td>
            <td>{{ formatDate(user.createdAt) }}</td>
            <td class="actions-cell">
              <button
                class="role-btn"
                @click="toggleRole(user)"
                :disabled="savingUid === user.uid"
              >
                {{ user.role === 'admin' ? 'Make user' : 'Make admin' }}
              </button>
              <button
                class="delete-btn"
                @click="confirmDelete(user)"
                :disabled="savingUid === user.uid"
              >
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="!loading && users.length === 0" class="info">No users found.</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useUsers, type UserSummary } from '../composables/useUsers';

const users = ref<UserSummary[]>([]);
const savingUid = ref<string | null>(null);
const { listUsers, updateUserRole, deleteUser, loading, error } = useUsers();

const formatDate = (timestamp: unknown): string => {
  if (!timestamp) return '—';

  // Firestore Timestamp object
  if (
    typeof timestamp === 'object' &&
    timestamp !== null &&
    '_seconds' in timestamp
  ) {
    const seconds = (timestamp as { _seconds: number })._seconds;
    return new Date(seconds * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  // Unix timestamp number
  if (typeof timestamp === 'number') {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  // String or ISO date
  return new Date(timestamp as string).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const loadUsers = async () => {
  users.value = await listUsers();
};

onMounted(loadUsers);

const toggleRole = async (user: UserSummary) => {
  savingUid.value = user.uid;
  try {
    const nextRole = user.role === 'admin' ? 'user' : 'admin';
    const updated = await updateUserRole(user.uid, nextRole);
    users.value = users.value.map((item) => (item.uid === updated.uid ? updated : item));
  } catch (err) {
    console.error(err);
  } finally {
    savingUid.value = null;
  }
};

const confirmDelete = (user: UserSummary) => {
  if (confirm(`Are you sure you want to delete user ${user.email}?`)) {
    handleDelete(user.uid);
  }
};

const handleDelete = async (uid: string) => {
  savingUid.value = uid;
  try {
    await deleteUser(uid);
    users.value = users.value.filter((item) => item.uid !== uid);
  } catch (err) {
    console.error(err);
  } finally {
    savingUid.value = null;
  }
};
</script>

<style scoped>
.users-list-container { display:flex; justify-content:center; padding:40px; }
.card { width:100%; max-width:960px; background:white; padding:24px; border-radius:8px; box-shadow:0 8px 20px rgba(0,0,0,0.08); }
.header-row { display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; }
.users-table { width:100%; border-collapse:collapse; }
.users-table th,
.users-table td { padding:12px 16px; border-bottom:1px solid #e7ecf4; text-align:left; }
.users-table th { background:#f5f7fb; }
.actions-cell { display:flex; gap:8px; }
.role-btn { padding:8px 12px; border:none; border-radius:6px; color:white; cursor:pointer; background:#667eea; font-size:12px; white-space:nowrap; }
.delete-btn { padding:8px 12px; border:none; border-radius:6px; color:white; cursor:pointer; background:#dc3545; font-size:12px; white-space:nowrap; }
.role-btn:disabled,
.delete-btn:disabled { opacity:0.6; cursor:not-allowed; }
.error { color:#c33; margin-bottom:12px; }
.info { color:#333; margin-bottom:12px; }
.refresh-btn { padding:8px 12px; border:none; border-radius:6px; background:#2d8cff; color:white; cursor:pointer; }
</style>
