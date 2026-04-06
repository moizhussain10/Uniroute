import { initializeApp } from "firebase/app";
import { getAuth,onAuthStateChanged,signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword} from "firebase/auth";
import {getFirestore } from "firebase/firestore"
const firebaseConfig = {
  apiKey: "AIzaSyC8mHEmgcNhzriK42nbPXnHJyAOjBAVc8M",
  authDomain: "aptech-b61e8.firebaseapp.com",
  projectId: "aptech-b61e8",
  storageBucket: "aptech-b61e8.firebasestorage.app",
  messagingSenderId: "751979593003",
  appId: "1:751979593003:web:7f7db9978c7edfba1c196e",
  measurementId: "G-7BF1M3128N"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export {
    auth,
    createUserWithEmailAndPassword ,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut,
    db
}