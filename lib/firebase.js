// lib/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCgDN0QI_xnEXuXcXjmMaHt2S5BMTROBC4",
  authDomain: "campus-marketplace-fc941.firebaseapp.com",
  projectId: "campus-marketplace-fc941",
  storageBucket: "campus-marketplace-fc941.appspot.com",
  messagingSenderId: "740122551231",
  appId: "1:740122551231:web:122885d0c6780ff45ff70a",
  measurementId: "G-GENGY1YZWB"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
