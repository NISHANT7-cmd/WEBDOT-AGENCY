import { initializeApp } from "firebase/app";
import { initializeFirestore } from "firebase/firestore";

// Config sourced directly from our provisioned applet configuration
const firebaseConfig = {
  apiKey: "AIzaSyDAyubgdUSv1LB7bPoLyp1_SF8lMdhokpw",
  authDomain: "gen-lang-client-0924323899.firebaseapp.com",
  projectId: "gen-lang-client-0924323899",
  storageBucket: "gen-lang-client-0924323899.firebasestorage.app",
  messagingSenderId: "905605910102",
  appId: "1:905605910102:web:d9f0afcbffed5682ff75f7"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firestore targeting our custom database ID with experimentalForceLongPolling enabled
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, "ai-studio-webdotagency-be7610f7-4b4d-40fb-95db-239c2619d8da");

