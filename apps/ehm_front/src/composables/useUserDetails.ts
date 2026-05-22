import { useAuth } from './useAuth';

export type UserDetails = {
  name?: string | null;
  birthdate?: string | null; // ISO date string
  more?: string | null;
  updatedAt?: unknown;
  createdAt?: unknown;
};

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api';

export const useUserDetails = () => {
  const { getIdToken, currentUser } = useAuth();

  const getAuthToken = async () => {
    // ensure user is authenticated and get id token
    if (!currentUser.value) throw new Error('Not authenticated');
    return await getIdToken();
  };

  const loadDetails = async (uid: string): Promise<UserDetails | null> => {
    const token = await getAuthToken();
    const res = await fetch(`${apiBaseUrl}/users-details/${encodeURIComponent(uid)}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.status === 404) return null;
    if (!res.ok) {
      throw new Error(`Failed to load details: ${res.status} ${res.statusText}`);
    }
    return (await res.json()) as UserDetails;
  };

  const saveDetails = async (uid: string, data: Partial<UserDetails>) => {
    const token = await getAuthToken();
    const res = await fetch(`${apiBaseUrl}/users-details`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      throw new Error(`Failed to save details: ${res.status} ${res.statusText}`);
    }

    return (await res.json()) as UserDetails;
  };

  return { loadDetails, saveDetails };
};

export default useUserDetails;
