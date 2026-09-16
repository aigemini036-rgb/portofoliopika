import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  collection,
  onSnapshot,
  setDoc,
  deleteDoc,
  writeBatch
} from 'firebase/firestore';

export const firebaseConfig = {
  projectId: "gen-lang-client-0202270271",
  appId: "1:960976587885:web:ff462b2277a1da9574c364",
  apiKey: "AIzaSyBlkUILi0zpZBdX1uKAhBtyppRRZ7YFLPo",
  authDomain: "gen-lang-client-0202270271.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-arsenioportfolio-8bcc7c1c-ab01-4925-bf0a-e99e02140822",
  storageBucket: "gen-lang-client-0202270271.firebasestorage.app",
  messagingSenderId: "960976587885"
};

// Initialize Firebase with the explicit named Firestore database ID
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

export {
  doc,
  collection,
  onSnapshot,
  setDoc,
  deleteDoc,
  writeBatch
};
