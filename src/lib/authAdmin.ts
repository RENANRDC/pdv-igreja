import { NextRequest } from "next/server"
import { getAuth } from "firebase-admin/auth"
import { adminDb } from "@/lib/firebase-admin"

export async function validateAdmin(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return { error: "Token não enviado", status: 401 }
    }

    const token = authHeader.split("Bearer ")[1]

    const decoded = await getAuth().verifyIdToken(token)

    const uid = decoded.uid

    // Busca no Firestore
    const userDoc = await adminDb.collection("users").doc(uid).get()

    if (!userDoc.exists) {
      return { error: "Usuário não encontrado", status: 404 }
    }

    const userData = userDoc.data()

    if (userData?.role !== "admin") {
      return { error: "Acesso negado", status: 403 }
    }

    return { uid, user: userData }

  } catch (error) {
    console.error("Auth error:", error)
    return { error: "Token inválido", status: 401 }
  }
}