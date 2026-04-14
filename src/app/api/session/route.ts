import { NextResponse } from "next/server"
import { adminAuth } from "@/lib/firebase-admin"
import { checkRateLimit } from "@/lib/rateLimit"
import { getClientIp } from "@/lib/getIp"

export async function POST(req: Request) {
  const ip = getClientIp(req)

  const rate = checkRateLimit(ip, "login")

  if (!rate.success) {
    return NextResponse.json(
      { error: "Muitas tentativas" },
      { status: 429 }
    )
  }

  const authHeader = req.headers.get("authorization")

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Token não enviado" }, { status: 401 })
  }

  const idToken = authHeader.split("Bearer ")[1]

  try {
    await adminAuth.verifyIdToken(idToken)

    // 🔥 10 HORAS
    const expiresIn = 60 * 60 * 10 * 1000

    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn,
    })

    const response = NextResponse.json({ success: true })

response.cookies.set("session", sessionCookie, {
  httpOnly: true,
  secure: true,
  sameSite: "none",
  path: "/",
  maxAge: 60 * 60 * 10,
})

    return response

  } catch (error) {
    console.error(error)

    return NextResponse.json(
      { error: "Token inválido" },
      { status: 401 }
    )
  }
}