import { NextRequest } from "next/server"

type Req = NextRequest | Request

export function getClientIp(req: Req): string {
  const forwarded = req.headers.get("x-forwarded-for")

  if (forwarded) {
    return forwarded.split(",")[0].trim()
  }

  return req.headers.get("x-real-ip") || "unknown"
}