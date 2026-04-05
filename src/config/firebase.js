// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBJK7-Xzr9RH1_dmsBUGLjRfNYo8JsFY0U",
  authDomain: "crypto-hub-naim.firebaseapp.com",
  projectId: "crypto-hub-naim",
  storageBucket: "crypto-hub-naim.firebasestorage.app",
  messagingSenderId: "458259279705",
  appId: "1:458259279705:web:96c7fd952907acab4fe648",
  measurementId: "G-PYCGMQZRK5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and export it
export const auth = getAuth(app);

// Initialize Firestore and export it
export const db = getFirestore(app);

export default app;
