import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const token = request.cookies.get("session")?.value
  const { pathname } = request.nextUrl

  // 🔓 rotas públicas (AJUSTADO)
  const isPublic =
    pathname.startsWith("/login") ||
    pathname.startsWith("/client") || // 👈 mantém isso
    pathname.startsWith("/api/session")

  const isStatic =
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.includes(".")

  if (isPublic || isStatic) {
    return NextResponse.next()
  }

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/:path*"],
}