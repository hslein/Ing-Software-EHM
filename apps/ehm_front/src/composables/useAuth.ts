import { ref, computed } from 'vue';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onIdTokenChanged,
  User,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';

const currentUser = ref<User | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);

const ensureUserDocument = async (user: User) => {
  if (!user) return;
  const userRef = doc(db, 'users', user.uid);
  const userSnapshot = await getDoc(userRef);

  const userData = {
    uid: user.uid,
    email: user.email ?? null,
    displayName: user.displayName ?? null,
    lastLoginAt: serverTimestamp(),
  };

  if (!userSnapshot.exists()) {
    await setDoc(userRef, {
      ...userData,
      createdAt: serverTimestamp(),
    });
  } else {
    await setDoc(userRef, userData, { merge: true });
  }
};

// Keep Vue state in sync with Firebase Auth.
onIdTokenChanged(auth, async (user) => {
  currentUser.value = user;
  loading.value = false;
  if (user) {
    try {
      await ensureUserDocument(user);
    } catch (err) {
      console.error('Failed to ensure user Firestore document:', err);
    }
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

  const register = async (email: string, password: string) => {
    error.value = null;
    try {
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
    isAuthenticated,
    loading,
    error,
    register,
    login,
    logout,
    getIdToken,
  };
};
