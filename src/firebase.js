import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDUxIUd2qhG0rXYKgt7FN-0-CIiIEsr5Pw",
  authDomain: "randomen-ba298.firebaseapp.com",
  databaseURL: "https://randomen-ba298-default-rtdb.firebaseio.com",
  projectId: "randomen-ba298",
  storageBucket: "randomen-ba298.appspot.com", // ✅ แก้ตรงนี้
  messagingSenderId: "858627255345",
  appId: "1:858627255345:web:c50fb307d8b4e8a6bbf910",
  measurementId: "G-40S0GR0E0E"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const database = getDatabase(app);



// -----------------------------------------------------------

// src/firebase.js
// import { initializeApp } from "firebase/app";
// import { getAuth } from "firebase/auth";
// import { getDatabase } from "firebase/database";

// const firebaseConfig = {
//   apiKey: "AIzaSyDUxIUd2qhG0rXYKgt7FN-0-CIiIEsr5Pw",
//   authDomain: "randomen-ba298.firebaseapp.com",
//   databaseURL: "https://randomen-ba298-default-rtdb.firebaseio.com",
//   projectId: "randomen-ba298",
//   storageBucket: "randomen-ba298.firebasestorage.app",
//   messagingSenderId: "858627255345",
//   appId: "1:858627255345:web:c50fb307d8b4e8a6bbf910",
//   measurementId: "G-40S0GR0E0E"
// };

// // init app
// const app = initializeApp(firebaseConfig);

// // ✅ สำคัญที่สุด (Firebase Auth)
// export const auth = getAuth(app);

// // (ถ้าใช้ realtime database)
// export const database = getDatabase(app);

// -------------------------------------------------------------

// import { initializeApp } from "firebase/app";
// import { getAuth } from "firebase/auth";
// import { getDatabase } from "firebase/database";

// const firebaseConfig = {
//   apiKey: "AIzaSyDUxIUd2qhG0rXYKgt7FN-0-CIiIEsr5Pw",
//   authDomain: "randomen-ba298.firebaseapp.com",
//   databaseURL: "https://randomen-ba298-default-rtdb.firebaseio.com",
//   projectId: "randomen-ba298",
//   storageBucket: "randomen-ba298.firebasestorage.app",
//   messagingSenderId: "858627255345",
//   appId: "1:858627255345:web:c50fb307d8b4e8a6bbf910",
//   measurementId: "G-40S0GR0E0E"
// };

// export const app = initializeApp(firebaseConfig);
// export const auth = getAuth(app);
// export const database = getDatabase(app);
