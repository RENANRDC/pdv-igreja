import {
  collection,
  addDoc,
  Timestamp,
  getDocs,
  query,
  where,
  updateDoc,
  doc
} from "firebase/firestore"
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
  formaPagamento: FormaPagamento = "pix"
) {
  if (!nome || !itens.length) {
    throw new Error("Dados inválidos")
  }

  const codigo = gerarCodigo()

  const total = itens.reduce(
    (acc, item) => acc + item.preco * item.quantidade,
    0
  )

let precisaPreparo = false

  // 🔥 VALIDA E DESCONTA ESTOQUE

for (const item of itens) {

  const produtosRef = collection(db, "produtos")

  const q = query(
    produtosRef,
    where("nome", "==", item.nome)
  )

  const snapshot = await getDocs(q)

  if (snapshot.empty) {
    throw new Error(`Produto não encontrado: ${item.nome}`)
  }

  const produtoDoc = snapshot.docs[0]

  const produto = produtoDoc.data()
  if (produto.precisaPreparo === true) {
  precisaPreparo = true
}

  const estoqueAtual = produto.estoque ?? 0

  if (estoqueAtual < item.quantidade) {
    throw new Error(
      `${item.nome} sem estoque suficiente`
    )
  }

  await updateDoc(
    doc(db, "produtos", produtoDoc.id),
    {
      estoque: estoqueAtual - item.quantidade
    }
  )
}

const pedido = {
  nomeCliente: nome,
  codigo,

  status: precisaPreparo
    ? "pendente"
    : "finalizado",

  precisaPreparo,

  total: total,

  barracaId: "geral",
  itens,

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