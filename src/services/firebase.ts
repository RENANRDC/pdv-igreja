import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyCGgBjr8tUlIOFcpPsD1TsM_ugzd0XYQmw",
  authDomain: "pdv-igreja.firebaseapp.com",
  projectId: "pdv-igreja",
  storageBucket: "pdv-igreja.firebasestorage.app",
  messagingSenderId: "646260445148",
  appId: "1:646260445148:web:d80cafbf619039bba6c919"
}

// 👇 EXPORTA O APP
export const app = initializeApp(firebaseConfig)

// 👇 continua igual
export const db = getFirestore(app)