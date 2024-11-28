// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // Import getAuth
import { getFirestore } from "firebase/firestore"; // Import getFirestore

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCGaG-eRvDIKgVUwyonRrnTepOdDqKryS4",
  authDomain: "docs-clone-f6279.firebaseapp.com",
  projectId: "docs-clone-f6279",
  storageBucket: "docs-clone-f6279.firebasestorage.app",
  messagingSenderId: "1054620465108",
  appId: "1:1054620465108:web:f9de80925ca16ac0c18841"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app); // Use the imported getAuth function
export const db = getFirestore(app); // Use the imported getFirestore function
