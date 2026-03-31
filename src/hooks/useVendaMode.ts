"use client"

import { useEffect, useState } from "react";

type VendaMode = "balcao" | "avulso";

const STORAGE_KEY = "modo_venda";

export function useVendaMode() {
  const [vendaMode, setVendaMode] = useState<VendaMode>("balcao");
  const [loadingVendaMode, setLoadingVendaMode] = useState<boolean>(true);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved === "avulso") {
      setVendaMode("avulso");
    } else {
      setVendaMode("balcao");
    }

    setLoadingVendaMode(false);
  }, []);

  useEffect(() => {
    if (!loadingVendaMode) {
      localStorage.setItem(STORAGE_KEY, vendaMode);
    }
  }, [vendaMode, loadingVendaMode]);

  return {
    vendaMode,
    setVendaMode,
    loadingVendaMode,
  };
}