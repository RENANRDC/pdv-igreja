import {
  getAuth,
  createUserWithEmailAndPassword,
  updatePassword,
  updateEmail,
  EmailAuthProvider,
  reauthenticateWithCredential,
  UserCredential
} from "firebase/auth"

import {
  getFirestore,
  doc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs
} from "firebase/firestore"

import { app } from "./firebase"
import { usernameToEmail } from "@/utils/authHelpers"

const auth = getAuth(app)
const db = getFirestore(app)

/* =====================================================
   🔐 REAUTH (CONFIRMAR SENHA DO ADMIN)
===================================================== */
export async function reauthenticate(username: string, password: string): Promise<void> {
  if (!auth.currentUser || !auth.currentUser.email) {
    throw new Error("Usuário não autenticado")
  }

  const credential = EmailAuthProvider.credential(
    usernameToEmail(username),
    password
  )

  await reauthenticateWithCredential(auth.currentUser, credential)
}

/* =====================================================
   👤 CRIAR USUÁRIO
===================================================== */
export async function createUser(
  username: string,
  password: string,
  role: "admin" | "user"
): Promise<void> {
  const email = usernameToEmail(username)

  const userCredential: UserCredential =
    await createUserWithEmailAndPassword(auth, email, password)

  await setDoc(doc(db, "users", userCredential.user.uid), {
    username,
    role
  })
}

/* =====================================================
   🔎 BUSCAR USUÁRIO PELO USERNAME (ESSENCIAL)
===================================================== */
export async function getUserByUsername(username: string): Promise<{ uid: string; username: string; role: string } | null> {
  const q = query(collection(db, "users"), where("username", "==", username))

  const snapshot = await getDocs(q)

  if (snapshot.empty) return null

  const docSnap = snapshot.docs[0]

  return {
    uid: docSnap.id,
    ...(docSnap.data() as { username: string; role: string })
  }
}

/* =====================================================
   ✏️ ATUALIZAR USERNAME
===================================================== */
export async function updateUsername(uid: string, newUsername: string): Promise<void> {
  const email = usernameToEmail(newUsername)

  if (!auth.currentUser) throw new Error("Usuário não autenticado")

  // ⚠️ Só funciona se for o usuário logado
  await updateEmail(auth.currentUser, email)

  await updateDoc(doc(db, "users", uid), {
    username: newUsername
  })
}

/* =====================================================
   🔒 ATUALIZAR SENHA (APENAS USUÁRIO LOGADO)
===================================================== */
export async function updateUserPassword(newPassword: string): Promise<void> {
  if (!auth.currentUser) throw new Error("Usuário não autenticado")

  await updatePassword(auth.currentUser, newPassword)
}

/* =====================================================
   🛡 ATUALIZAR ROLE (ADMIN)
===================================================== */
export async function updateUserRole(uid: string, role: "admin" | "user"): Promise<void> {
  await updateDoc(doc(db, "users", uid), {
    role
  })
}