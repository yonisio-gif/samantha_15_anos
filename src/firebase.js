// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyC3ev6T69l4DNS237i1Nvb-0qsdR1GoLTY",
    authDomain: "xvs-samantha.firebaseapp.com",
    projectId: "xvs-samantha",
    storageBucket: "xvs-samantha.firebasestorage.app",
    messagingSenderId: "654564964007",
    appId: "1:654564964007:web:63d41bdc1575b393d58d82"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);