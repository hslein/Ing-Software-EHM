import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBo2npvb0BXsk0EZVVgn-xQp3K7TgKyFdc",
  authDomain: "consecionario-ehm.firebaseapp.com",
  projectId: "consecionario-ehm",
  storageBucket: "consecionario-ehm.firebasestorage.app",
  messagingSenderId: "200852156702",
  appId: "1:200852156702:web:9762a9818385bfa3f0990f",
  measurementId: "G-6ZL2952QEM",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services (Live Connection)
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;