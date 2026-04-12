"use client"

import { usePathname } from "next/navigation"
import Footer from "./Footer"

export default function FooterWrapper() {
  const pathname = usePathname()

  // rotas que NÃO devem ter footer
  const hiddenRoutes = [
    "/pdv",
    "/config-display",
    "/display",
    "/pedidos",
    "/admin/categorias",
    "/admin/credenciais",
    "/admin/financeiro",
    "/admin/produtos"
  ]

  const hideFooter = hiddenRoutes.some(route =>
    pathname.startsWith(route)
  )

  if (hideFooter) return null

  return <Footer />
}