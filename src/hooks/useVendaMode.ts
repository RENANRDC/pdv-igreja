"use client"

import { useState } from "react";

type VendaMode = "balcao" | "Mesa";

export function useVendaMode() {
  const [vendaMode, setVendaMode] = useState<VendaMode>(() => {
    // ✅ Carrega do localStorage na INICIALIZAÇÃO (sem useEffect!)
    if (typeof window === "undefined") return "balcao";
    
    try {
      const saved = localStorage.getItem("modo_venda");
      return saved === "Mesa" ? "Mesa" : "balcao";
    } catch {
      return "balcao";
    }
  });

  // ✅ Wrapper que salva automaticamente no localStorage
  const setVendaModeSafe = (mode: VendaMode) => {
    setVendaMode(mode);
    try {
      localStorage.setItem("modo_venda", mode);
    } catch {
      // Silencia erros do localStorage
    }
  };

  return {
    vendaMode,
    setVendaMode: setVendaModeSafe,
    isLoaded: typeof window !== "undefined", // ✅ Sem estado extra!
  };
}