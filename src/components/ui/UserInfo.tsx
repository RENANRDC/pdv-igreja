"use client"

import { getCachedUser } from "@/hooks/useAdminGuard"
import { formatarCaixa } from "@/utils/caixa"

export default function UserInfo() {
  const user = getCachedUser()

  if (!user) return null

  return (
    <p className="text-xs text-blue-400">
      {user.username} • {formatarCaixa(user.caixa)}
    </p>
  )
}