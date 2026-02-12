import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBewgO7KcrjggZMQmvmepfgdRxW16P6qTI",
  authDomain: "norea-psms-storage.firebaseapp.com",
  projectId: "norea-psms-storage",
  storageBucket: "norea-psms-storage.firebasestorage.app",
  messagingSenderId: "1052438087580",
  appId: "1:1052438087580:web:8db87c758fab1297452a59",
  measurementId: "G-BZ8SD34MDJ"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);