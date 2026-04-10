import { getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth"
import { app } from "./firebase"

export const auth = getAuth(app) // ✅ EXPORTADO

export async function login(email: string, senha: string) {
  return signInWithEmailAndPassword(auth, email, senha)
}

export async function logout() {
  return signOut(auth)
}