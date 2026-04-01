import { useEffect, useState } from "react"
import { db } from "@/services/firebase"
import { collection, onSnapshot } from "firebase/firestore"

type Produto = {
  id: string
  nome: string
  preco: number
  categoriaId: string
  ativo: boolean
}

export function useProdutos() {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "produtos"), (snapshot) => {
      const lista: Produto[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Produto, "id">),
      }))

      setProdutos(lista)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  return { produtos, loading }
}