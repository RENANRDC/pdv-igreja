import { collection, addDoc, Timestamp } from "firebase/firestore"
import { db } from "./firebase"

type Item = {
  nome: string
  preco: number
  barracaId: string
  quantidade: number
}

type FormaPagamento = "pix" | "dinheiro" | "cartao"

function gerarCodigo(): string {
  return Math.floor(1000 + Math.random() * 9000).toString()
}

export async function criarPedido(
  nome: string,
  itens: Item[],
  formaPagamento: FormaPagamento = "pix" // 👈 evita erro em chamadas antigas
) {
  if (!nome || !itens.length) {
    throw new Error("Dados inválidos")
  }

  const codigo = gerarCodigo()

  const total = itens.reduce(
    (acc, item) => acc + item.preco * item.quantidade,
    0
  )

  const pedido = {
    nomeCliente: nome,
    codigo,
    status: "pendente",
    barracaId: "geral",
    itens,
    total,

    // 🔥 NOVO
    pago: true,
    formaPagamento,

    createdAt: Timestamp.now(),
  }

  const docRef = await addDoc(collection(db, "pedidos"), pedido)

  return {
    id: docRef.id,
    codigo,
  }
}