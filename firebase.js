import firebase from 'firebase/app';
import 'firebase/firestore';

// Replace with your Firebase project credentials
const firebaseConfig = {
  apiKey: "AIzaSyB-X13tASmrnWFyccdCJR2p3yoaR9V1hkQ",
  authDomain: "healthassist-35d5f.firebaseapp.com",
  projectId: "healthassist-35d5f",
  storageBucket: "healthassist-35d5f.firebasestorage.app",
  messagingSenderId: "963446004409",
  appId: "1:963446004409:web:07f3f65a47183653f09968"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
} else {
  firebase.app(); // If already initialized
}

const firestore = firebase.firestore();
export { firestore };
