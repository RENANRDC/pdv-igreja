import { NextResponse } from "next/server"
import { adminAuth } from "@/lib/firebase-admin"
import { checkRateLimit } from "@/lib/rateLimit"
import { getClientIp } from "@/lib/getIp"

export async function POST(req: Request) {
  const ip = getClientIp(req)

  const rate = checkRateLimit(ip, "login")

  if (!rate.success) {
    return NextResponse.json(
      { error: "Muitas tentativas, tente novamente mais tarde" },
      { status: 429 }
    )
  }

  const authHeader = req.headers.get("authorization")

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Token não enviado" }, { status: 401 })
  }

  const token = authHeader.split("Bearer ")[1]

  try {
    await adminAuth.verifyIdToken(token)

    const response = NextResponse.json({ success: true })

    response.cookies.set("session", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24,
    })

    return response
  } catch {
    return NextResponse.json({ error: "Token inválido" }, { status: 401 })
  }
}