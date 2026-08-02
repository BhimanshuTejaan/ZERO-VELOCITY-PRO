import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCNwynSR3VRE3pL4CgD3M4FOzcXLVu7dtY",
  authDomain: "zero-velocity-captions.firebaseapp.com",
  projectId: "zero-velocity-captions",
  storageBucket: "zero-velocity-captions.firebasestorage.app",
  messagingSenderId: "300602651964",
  appId: "1:300602651964:web:1b7553933902da3029da39",
  measurementId: "G-2T4ZNYPL8F"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();