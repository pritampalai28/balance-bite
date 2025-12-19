
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDPVgGva81_YfLk2guF8dvL-Sb2XeGuK6M",
    authDomain: "balance-bite-cb8e9.firebaseapp.com",
    projectId: "balance-bite-cb8e9",
    storageBucket: "balance-bite-cb8e9.firebasestorage.app",
    messagingSenderId: "51983132666",
    appId: "1:51983132666:web:b37c982d666f1a89d62643",
    measurementId: "G-YG4Y6BZDSW"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
