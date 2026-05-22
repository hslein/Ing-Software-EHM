import { ref, computed } from 'vue';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onIdTokenChanged,
  User,
} from 'firebase/auth';
import { auth } from '../config/firebase';

const currentUser = ref<User | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);

// Keep Vue state in sync with Firebase Auth.
onIdTokenChanged(auth, async (user) => {
  currentUser.value = user;
  loading.value = false;
});

const getIdToken = async () => {
  if (!currentUser.value) {
    throw new Error('User is not authenticated');
  }
  return await currentUser.value.getIdToken();
};

export const useAuth = () => {
  const isAuthenticated = computed(() => currentUser.value !== null);

  const register = async (email: string, password: string) => {
    error.value = null;
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (err: any) {
      error.value = err.message;
      throw err;
    }
  };

  const login = async (email: string, password: string) => {
    error.value = null;
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
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
    isAuthenticated,
    loading,
    error,
    register,
    login,
    logout,
    getIdToken,
  };
};
