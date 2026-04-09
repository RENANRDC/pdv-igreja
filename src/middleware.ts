import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const role = request.cookies.get("role")?.value
  const { pathname } = request.nextUrl

  // 🔓 liberar assets (imagens, etc)
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.includes(".")
  ) {
    return NextResponse.next()
  }

  // 🔓 rotas públicas
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/client/")
  ) {
    return NextResponse.next()
  }

  // 🔒 não logado
  if (!role) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // 🔒 admin
  if (pathname.startsWith("/admin") && role !== "admin") {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/:path*"],
}