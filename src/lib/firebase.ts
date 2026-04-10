import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDG4i0E_sIG9gdQaA9uLs8xfRa3nRwYZKw",
  authDomain: "sumo-guard.firebaseapp.com",
  projectId: "sumo-guard",
  storageBucket: "sumo-guard.firebasestorage.app",
  messagingSenderId: "184935123550",
  appId: "1:184935123550:web:ae6b573dff15f54779c2cf",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
