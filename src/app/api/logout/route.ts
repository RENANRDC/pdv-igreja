import { NextResponse } from "next/server"

export async function POST() {
  const response = NextResponse.json({ success: true })

  // 🔥 remove cookie de sessão
  response.cookies.set("session", "", {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  })

  return response
}