import { ref, computed } from 'vue';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onIdTokenChanged,
  User,
} from 'firebase/auth';
import { auth } from '../config/firebase';

const AUTH_TOKEN_KEY = 'firebaseIdToken';
const currentUser = ref<User | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);

// Keep Vue state and localStorage in sync with Firebase Auth.
onIdTokenChanged(auth, async (user) => {
  currentUser.value = user;
  if (user) {
    const token = await user.getIdToken();
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  }
  loading.value = false;
});

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
  };
};
