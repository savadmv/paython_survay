// Firebase configuration and initialization
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

// TODO: Replace with your Firebase project configuration
const firebaseConfig = {
    apiKey: "AIzaSyCTk_FMmsKPRiRgeWSDCwNcx70eZGHMRck",
    authDomain: "coabjobs.firebaseapp.com",
    projectId: "coabjobs",
    storageBucket: "coabjobs.firebasestorage.app",
    messagingSenderId: "267217381347",
    appId: "1:267217381347:web:8ef641fb3a74aa317522d6",
    measurementId: "G-H1NLV3TXY9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);

// Export the app instance if needed
export { app };