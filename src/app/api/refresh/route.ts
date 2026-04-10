import { NextResponse } from "next/server"
import { adminAuth } from "@/lib/firebase-admin"
import { checkRateLimit } from "@/lib/rateLimit"
import { getClientIp } from "@/lib/getIp"

export async function POST(req: Request) {
  const ip = getClientIp(req)

  const rate = checkRateLimit(ip, "default")

  if (!rate.success) {
    return NextResponse.json(
      { error: "Muitas tentativas, tente novamente mais tarde" },
      { status: 429 }
    )
  }

  try {
    const authHeader = req.headers.get("authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Token não enviado" }, { status: 401 })
    }

    const idToken = authHeader.split("Bearer ")[1]

    await adminAuth.verifyIdToken(idToken)

    const expiresIn = 60 * 60 * 24 * 5 * 1000

    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn,
    })

    const response = NextResponse.json({ success: true })

    response.cookies.set("session", sessionCookie, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
      maxAge: expiresIn / 1000,
    })

    return response

  } catch (error) {
    console.error("Refresh error:", error)

    return NextResponse.json(
      { error: "Erro ao renovar sessão" },
      { status: 401 }
    )
  }
}