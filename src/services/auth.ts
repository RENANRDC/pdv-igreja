import { getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth"
import { app } from "./firebase"

const auth = getAuth(app)

// 🔐 login
export async function login(email: string, senha: string) {
  return signInWithEmailAndPassword(auth, email, senha)
}

// 🚪 logout (vamos usar depois)
export async function logout() {
  return signOut(auth)
}