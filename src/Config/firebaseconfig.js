import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, deleteDoc, addDoc, updateDoc, query, where, getDocs } from "firebase/firestore"; // Import `where` e `query` e `getDocs` do Firestore
import { getAuth, createUserWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD69VXZ7IZQhrphIZIfwbpR65JEmLZ9qIY",
  authDomain: "barbearia-c4b79.firebaseapp.com",
  projectId: "barbearia-c4b79",
  storageBucket: "barbearia-c4b79.appspot.com",
  messagingSenderId: "429216591820",
  appId: "1:429216591820:web:e821d10e9b2d42de0c3769"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getFirestore(app);
const auth = getAuth(app);

export { database, auth, collection, doc, deleteDoc, addDoc, updateDoc, query, where, getDocs, onAuthStateChanged }; // Export `where`, `query` e `getDocs`
