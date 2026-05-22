import { ref } from 'vue';
import { useAuth } from './useAuth';

export type UserSummary = {
  uid: string;
  email: string | null;
  role: 'admin' | 'user';
  createdAt?: unknown;
};

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api';

export const useUsers = () => {
  const { getIdToken } = useAuth();
  const loading = ref(false);
  const error = ref<string | null>(null);

  const authHeaders = async () => {
    const token = await getIdToken();
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  };

  const listUsers = async (): Promise<UserSummary[]> => {
    loading.value = true;
    error.value = null;
    try {
      const headers = await authHeaders();
      const res = await fetch(`${apiBaseUrl}/users`, {
        method: 'GET',
        headers,
      });
      if (!res.ok) {
        throw new Error(`Failed to fetch users: ${res.status} ${res.statusText}`);
      }
      return (await res.json()) as UserSummary[];
    } catch (err: any) {
      error.value = err.message;
      return [];
    } finally {
      loading.value = false;
    }
  };

  const updateUserRole = async (uid: string, role: 'admin' | 'user') => {
    loading.value = true;
    error.value = null;
    try {
      const headers = await authHeaders();
      const res = await fetch(`${apiBaseUrl}/users/${encodeURIComponent(uid)}/role`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ role }),
      });
      if (!res.ok) {
        throw new Error(`Failed to update role: ${res.status} ${res.statusText}`);
      }
      return (await res.json()) as UserSummary;
    } catch (err: any) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteUser = async (uid: string) => {
    loading.value = true;
    error.value = null;
    try {
      const headers = await authHeaders();
      const res = await fetch(`${apiBaseUrl}/users/${encodeURIComponent(uid)}`, {
        method: 'DELETE',
        headers,
      });
      if (!res.ok) {
        throw new Error(`Failed to delete user: ${res.status} ${res.statusText}`);
      }
      return true;
    } catch (err: any) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return { listUsers, updateUserRole, deleteUser, loading, error };
};

export default useUsers;
