// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyChyA4nx932S6U-G4PO5ZGDeeido0uWLxw",
  authDomain: "inventory-app-43c3e.firebaseapp.com",
  projectId: "inventory-app-43c3e",
  storageBucket: "inventory-app-43c3e.firebasestorage.app",
  messagingSenderId: "228081988176",
  appId: "1:228081988176:web:c40baa987962d645191755",
  measurementId: "G-5B9S4TXVVH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getFirestore(app);