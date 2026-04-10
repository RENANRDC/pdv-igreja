import { NextRequest, NextResponse } from "next/server"
import { adminAuth, adminDb } from "@/lib/firebase-admin"
import { checkRateLimit } from "@/lib/rateLimit"
import { getClientIp } from "@/lib/getIp"

type Role = "admin" | "user"

type Body =
  | { action: "create"; username: string; password: string; role: Role }
  | { action: "update"; username: string; newUsername?: string; newPassword?: string; role?: Role }
  | { action: "delete"; username: string }

function toEmail(username: string) {
  return `${username}@pdv.local`
}

function json<T>(data: T, status = 200) {
  return NextResponse.json(data, { status })
}

async function validateAdmin(request: NextRequest) {
  try {
    const token = request.cookies.get("session")?.value

    if (!token) {
      return { error: "Não autenticado", status: 401 }
    }

    const decoded = await adminAuth.verifyIdToken(token)
    const uid = decoded.uid

    const userDoc = await adminDb.collection("users").doc(uid).get()

    if (!userDoc.exists) {
      return { error: "Usuário não encontrado", status: 404 }
    }

    const userData = userDoc.data()

    if (userData?.role !== "admin") {
      return { error: "Acesso negado", status: 403 }
    }

    return { uid }

  } catch (error) {
    console.error("Auth error:", error)
    return { error: "Token inválido", status: 401 }
  }
}

/* ================= GET ================= */

export async function GET(request: NextRequest) {
  const ip = getClientIp(request)

  const rate = checkRateLimit(ip, "admin")

  if (!rate.success) {
    return json({ error: "Muitas tentativas, tente novamente mais tarde" }, 429)
  }

  const auth = await validateAdmin(request)

  if ("error" in auth) {
    return json({ error: auth.error }, auth.status)
  }

  try {
    const snapshot = await adminDb.collection("users").get()

    const users = snapshot.docs.map(doc => ({
      id: doc.id,
      username: doc.data().username as string,
      role: doc.data().role as Role,
    }))

    return json({ users })

  } catch (error) {
    console.error(error)
    return json({ error: "Erro ao listar usuários" }, 500)
  }
}

/* ================= POST ================= */

export async function POST(request: NextRequest) {
  const ip = getClientIp(request)

  const rate = checkRateLimit(ip, "admin")

  if (!rate.success) {
    return json({ error: "Muitas tentativas, tente novamente mais tarde" }, 429)
  }

  const auth = await validateAdmin(request)

  if ("error" in auth) {
    return json({ error: auth.error }, auth.status)
  }

  try {
    const body: Body = await request.json()

    if (body.action === "create") {
      const { username, password, role } = body

      if (!username || !password) {
        return json({ error: "Dados inválidos" }, 400)
      }

      const email = toEmail(username)

      const userRecord = await adminAuth.createUser({
        email,
        password,
      })

      await adminDb.collection("users").doc(userRecord.uid).set({
        username,
        role,
      })

      return json({ success: true })
    }

    if (body.action === "update") {
      const { username, newUsername, newPassword, role } = body

      const email = toEmail(username)
      const user = await adminAuth.getUserByEmail(email)

      const updates: {
        email?: string
        password?: string
      } = {}

      if (newUsername && newUsername !== username) {
        updates.email = toEmail(newUsername)
      }

      if (newPassword) {
        updates.password = newPassword
      }

      if (Object.keys(updates).length > 0) {
        await adminAuth.updateUser(user.uid, updates)
      }

      if (newUsername || role) {
        await adminDb.collection("users").doc(user.uid).update({
          ...(newUsername && { username: newUsername }),
          ...(role && { role }),
        })
      }

      return json({ success: true })
    }

    if (body.action === "delete") {
      const { username } = body

      const email = toEmail(username)
      const user = await adminAuth.getUserByEmail(email)

      await adminAuth.deleteUser(user.uid)
      await adminDb.collection("users").doc(user.uid).delete()

      return json({ success: true })
    }

    return json({ error: "Ação inválida" }, 400)

  } catch (error) {
    console.error(error)

    return json(
      {
        error: error instanceof Error ? error.message : "Erro interno",
      },
      500
    )
  }
}