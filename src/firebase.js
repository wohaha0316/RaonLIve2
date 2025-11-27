// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: 여기를 너의 firebase 설정값으로 교체해야 한다.
const firebaseConfig = {
  apiKey: "AIzaSyCcblW13a_BBOFB1HZpadF-Pzjdxx2j2QI",
  authDomain: "raonlive-3ebd3.firebaseapp.com",
  projectId: "raonlive-3ebd3",
  storageBucket: "raonlive-3ebd3.firebasestorage.app",
  messagingSenderId: "999387778426",
  appId: "1:999387778426:web:ddbb1edda38056572b1ac3",
  measurementId: "G-VNQCJC2VVL",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
