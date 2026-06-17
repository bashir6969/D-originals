import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

export const firebaseConfig = {
  apiKey: "AIzaSyDo9bvP0vFfhf3AW3VUs6O0QsAshGz1Eo",
  authDomain: "d-originals-dcea4.firebaseapp.com",
  projectId: "d-originals-dcea4",
  storageBucket: "d-originals-dcea4.firebasestorage.app",
  messagingSenderId: "648644075897",
  appId: "1:648644075897:web:65fd59fbe65b25c759cfa8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
