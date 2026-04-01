// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBN70UFRxR2hs1p9DpZULSlFzin6zdHlkQ",
  authDomain: "tutor-fe1c3.firebaseapp.com",
  projectId: "tutor-fe1c3",
  storageBucket: "tutor-fe1c3.firebasestorage.app",
  messagingSenderId: "706502814262",
  appId: "1:706502814262:web:c762a6692125b6e6c2c697"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
export default app;
