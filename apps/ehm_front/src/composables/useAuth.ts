import { ref, computed } from 'vue';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onIdTokenChanged,
  browserLocalPersistence,
  setPersistence,
  User,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';

type UserRole = 'admin' | 'customer';

const currentUser = ref<User | null>(null);
const currentUserRole = ref<UserRole | null>(null);
const loading = ref(true);
const roleLoading = ref(false);
const error = ref<string | null>(null);
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api';
const authPersistenceReady = setPersistence(auth, browserLocalPersistence);

const ensureUserDocument = async (user: User) => {
  if (!user) return;
  const userRef = doc(db, 'users', user.uid);
  const userSnapshot = await getDoc(userRef);

  const newUserData = {
    uid: user.uid,
    email: user.email ?? null,
    displayName: user.displayName ?? null,
    birthdate: null,
    role: 'customer',
    createdAt: null,
    lastLoginAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  if (!userSnapshot.exists()) {
    await setDoc(userRef, {
      ...newUserData,
      createdAt: serverTimestamp(),
    });
  } else {
    await setDoc(
      userRef,
      {
        uid: user.uid,
        email: user.email ?? null,
        lastLoginAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
  }
};

const loadCurrentUserRole = async (user: User) => {
  roleLoading.value = true;
  try {
    const token = await user.getIdToken();
    const res = await fetch(`${apiBaseUrl}/users/me`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to load user role: ${res.status} ${res.statusText}`);
    }

    const details = (await res.json()) as { role?: UserRole } | null;
    currentUserRole.value = details?.role ?? 'customer';
  } catch (err) {
    currentUserRole.value = 'customer';
    console.error('Failed to load current user role:', err);
  } finally {
    roleLoading.value = false;
  }
};

// Keep Vue state in sync with Firebase Auth.
onIdTokenChanged(auth, async (user) => {
  currentUser.value = user;
  currentUserRole.value = null;

  try {
    if (user) {
      await ensureUserDocument(user);
      await loadCurrentUserRole(user);
    }
  } catch (err) {
    currentUserRole.value = user ? 'customer' : null;
    console.error('Failed to sync authenticated user:', err);
  } finally {
    loading.value = false;
  }
});

const getIdToken = async () => {
  if (!currentUser.value) {
    throw new Error('User is not authenticated');
  }
  return await currentUser.value.getIdToken();
};

export const useAuth = () => {
  const isAuthenticated = computed(() => currentUser.value !== null);
  const isAdmin = computed(() => currentUserRole.value === 'admin');
  const isUser = computed(() => currentUserRole.value === 'customer');

  const register = async (email: string, password: string) => {
    error.value = null;
    try {
      await authPersistenceReady;
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await ensureUserDocument(userCredential.user);
      return userCredential.user;
    } catch (err: any) {
      error.value = err.message;
      throw err;
    }
  };

  const login = async (email: string, password: string) => {
    error.value = null;
    try {
      await authPersistenceReady;
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await ensureUserDocument(userCredential.user);
      return userCredential.user;
    } catch (err: any) {
      error.value = err.message;
      throw err;
    }
  };

  const logout = async () => {
    error.value = null;
    try {
      await signOut(auth);
    } catch (err: any) {
      error.value = err.message;
      throw err;
    }
  };

  return {
    currentUser,
    currentUserRole,
    isAuthenticated,
    isAdmin,
    isUser,
    loading,
    roleLoading,
    error,
    register,
    login,
    logout,
    getIdToken,
  };
};
