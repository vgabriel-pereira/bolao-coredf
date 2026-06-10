import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCirMQdB1OUgd81Q3A5-yFb62OKVSABqto",
  authDomain: "bolao-coredf.firebaseapp.com",
  projectId: "bolao-coredf",
  storageBucket: "bolao-coredf.firebasestorage.app",
  messagingSenderId: "423789115331",
  appId: "1:423789115331:web:8d0a65d0c1d0f669aeef76",
  measurementId: "G-MVR15H9SND"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);