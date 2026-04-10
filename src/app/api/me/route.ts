import { NextResponse } from "next/server"
import { adminAuth, adminDb } from "@/lib/firebase-admin"

export async function GET(request: Request) {
  try {
    const cookie = request.headers.get("cookie")
    const token = cookie?.match(/session=([^;]+)/)?.[1]

    if (!token) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const decoded = await adminAuth.verifyIdToken(token)

    const userDoc = await adminDb.collection("users").doc(decoded.uid).get()

    if (!userDoc.exists) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    const userData = userDoc.data()

    return NextResponse.json({
      role: userData?.role || "user",
      username: userData?.username || null,
    })

  } catch {
    return NextResponse.json({ error: "Erro ao validar usuário" }, { status: 401 })
  }
}