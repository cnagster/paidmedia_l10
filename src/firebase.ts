import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDkgwkOO73iOWFaB3Hg9d4OkoDpfxQh7Cs",
  authDomain: "paidmedial10.firebaseapp.com",
  projectId: "paidmedial10",
  storageBucket: "paidmedial10.firebasestorage.app",
  messagingSenderId: "307320923995",
  appId: "1:307320923995:web:0a5ee0f12a3ca58ee2dc7e",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
