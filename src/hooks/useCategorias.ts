import { useEffect, useState } from "react"
import { db } from "@/services/firebase"
import { collection, onSnapshot } from "firebase/firestore"

type Categoria = {
  id: string
  nome: string
  ativo: boolean
}

export function useCategorias() {
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "categorias"), (snapshot) => {
      const lista: Categoria[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Categoria, "id">),
      }))

      setCategorias(lista)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  return { categorias, loading }
}