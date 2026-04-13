import { useEffect, useState } from "react"
import { collection, onSnapshot } from "firebase/firestore"
import { db } from "@/services/firebase"
import { cache } from "@/lib/cache"

type Item = {
  nome: string
  quantidade: number
  preco?: number
}

type Pedido = {
  id: string
  codigo?: string
  nomeCliente?: string
  total?: number
  valor?: number
  formaPagamento?: string
  status: "pendente" | "em_preparo" | "finalizado" | "fechado"
  itens?: Item[]
  createdAt?: { toDate: () => Date }
}

const key = "financeiro-pedidos"

export function usePedidos() {

  // ✅ INIT SEM EFFECT (resolve erro do React)
  const [pedidos, setPedidos] = useState<Pedido[]>(() => {
    if (typeof window === "undefined") return []

    const local = localStorage.getItem(key)
    if (local) return JSON.parse(local)

    if (cache[key]) return cache[key] as Pedido[]

    return []
  })

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "pedidos"), (snapshot) => {
      const lista: Pedido[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Pedido[]

      cache[key] = lista
      localStorage.setItem(key, JSON.stringify(lista))
      setPedidos(lista)
    })

    return () => unsubscribe()
  }, [])

  return { pedidos }
}