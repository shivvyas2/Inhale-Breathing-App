import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyAl1dBn-O4hhJwzhGzvCPZm-rn1ae9nNU8",
    authDomain: "calmpulse-bdadb.firebaseapp.com",
    projectId: "calmpulse-bdadb",
    storageBucket: "calmpulse-bdadb.firebasestorage.app",
    messagingSenderId: "366564636514",
    appId: "1:366564636514:web:b334aeb1e059ec1604de3b",
    measurementId: "G-DNBPEY3GR1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);