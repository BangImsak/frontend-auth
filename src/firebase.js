// src/firebase.js
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// ✅ ใส่ config ของโปรเจกต์คุณจาก Firebase console
const firebaseConfig = {
  apiKey: "AIzaSyDUxIUd2qhG0rXYKgt7FN-0-CIiIEsr5Pw",
  authDomain: "randomen-ba298.firebaseapp.com",
  databaseURL: "https://randomen-ba298-default-rtdb.firebaseio.com",
  projectId: "randomen-ba298",
  storageBucket: "randomen-ba298.firebasestorage.app",
  messagingSenderId: "858627255345",
  appId: "1:858627255345:web:c50fb307d8b4e8a6bbf910",
  measurementId: "G-40S0GR0E0E"
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app); // <--- แก้เป็น database แล้ว