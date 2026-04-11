"use client"

import { useEffect, useState } from "react"

type VendaMode = "balcao" | "mesa" | null

export function clearVendaMode() {
  try {
    sessionStorage.removeItem("modo_venda")
  } catch {}
}

export function useVendaMode() {
  const [vendaMode, setVendaMode] = useState<VendaMode>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("modo_venda")

      if (saved === "balcao" || saved === "mesa") {
        setVendaMode(saved)
      }
    } catch {}

    setIsLoaded(true)
  }, [])

  const setVendaModeSafe = (mode: VendaMode) => {
    setVendaMode(mode)

    try {
      if (mode) {
        sessionStorage.setItem("modo_venda", mode)
      } else {
        sessionStorage.removeItem("modo_venda")
      }
    } catch {}
  }

  return {
    vendaMode,
    setVendaMode: setVendaModeSafe,
    isLoaded,
  }
}