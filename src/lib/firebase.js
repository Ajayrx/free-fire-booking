import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCxD4qWg4ZsUpHhOSLClnfZrgDIXTyX1eo",
  authDomain: "freefire-f043b.firebaseapp.com",
  projectId: "freefire-f043b",
  storageBucket: "freefire-f043b.firebasestorage.app",
  messagingSenderId: "935970443481",
  appId: "1:935970443481:web:fdcac546162cf059212ec8",
  measurementId: "G-EC8B8HT3XV"
};

// Initialize Firebase securely for Next.js to prevent multiple instances
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);
