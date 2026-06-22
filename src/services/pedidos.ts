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
  categoriaId?: string
  categoriaNome?: string
  observacao?: string
}

type FormaPagamento = "pix" | "dinheiro" | "cartao"

function gerarCodigo(): string {
  return Math.floor(1000 + Math.random() * 9000).toString()
}

export async function criarPedido(
  nome: string,
  itens: Item[],
  formaPagamento: string,
  caixa: string
)
 {
  console.log("=== INICIO criarPedido ===")
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

  console.log("VALIDANDO:", item.nome)

  const produtosRef = collection(db, "produtos")

  const q = query(
    produtosRef,
    where("nome", "==", item.nome)
  )

console.log("BUSCANDO:", item.nome)

const snapshot = await getDocs(q)

console.log("ENCONTROU:", item.nome)

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

console.log("ATUALIZANDO ESTOQUE:", item.nome)

await updateDoc(
  doc(db, "produtos", produtoDoc.id),
  {
    estoque: estoqueAtual - item.quantidade
  }
)

console.log("ESTOQUE ATUALIZADO:", item.nome)
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

  caixa,

  createdAt: Timestamp.now(),
}
  console.log("CRIANDO PEDIDO FIRESTORE")
  const docRef = await addDoc(collection(db, "pedidos"), pedido)
  console.log("PEDIDO CRIADO:", docRef.id)
  
  return {
    id: docRef.id,
    codigo,
  }
}