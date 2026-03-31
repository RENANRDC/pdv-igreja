"use client"

import { useState } from "react"
import { criarPedido } from "../../services/pedidos"
import { QRCodeCanvas } from "qrcode.react"
import Link from "next/link"

type Item = {
  nome: string
  preco: number
  barracaId: string
  quantidade: number
}

type FormaPagamento = "pix" | "dinheiro" | "cartao"

export default function Home() {
  const [nome, setNome] = useState("")
  const [mensagem, setMensagem] = useState("")
  const [itens, setItens] = useState<Item[]>([])
  const [ultimoItem, setUltimoItem] = useState<string | null>(null)

  const [confirmando, setConfirmando] = useState(false)
  const [formaPagamento, setFormaPagamento] =
    useState<FormaPagamento>("pix")

  const [valorRecebido, setValorRecebido] = useState("")

  const [qrUrl, setQrUrl] = useState<string | null>(null)
  const [codigoPedido, setCodigoPedido] = useState<string | null>(null)

  // 🔥 NOVO: ERRO MODAL
  const [erro, setErro] = useState<string | null>(null)

  function adicionarItem(produto: Omit<Item, "quantidade">) {
    setItens((prev) => {
      const existe = prev.find((i) => i.nome === produto.nome)

      if (existe) {
        return prev.map((i) =>
          i.nome === produto.nome
            ? { ...i, quantidade: i.quantidade + 1 }
            : i
        )
      }

      return [...prev, { ...produto, quantidade: 1 }]
    })

    setUltimoItem(produto.nome)
    setTimeout(() => setUltimoItem(null), 200)
  }

  function removerItem(nome: string) {
    setItens((prev) =>
      prev
        .map((i) =>
          i.nome === nome
            ? { ...i, quantidade: i.quantidade - 1 }
            : i
        )
        .filter((i) => i.quantidade > 0)
    )
  }

  function limparCarrinho() {
    setItens([])
  }

  const total = itens.reduce(
    (acc, item) => acc + item.preco * item.quantidade,
    0
  )

  const troco =
    formaPagamento === "dinheiro"
      ? Math.max(0, parseFloat(valorRecebido || "0") - total)
      : 0

  function handlePedido() {
    if (!nome) {
      setErro("Digite o nome do cliente")
      return
    }

    if (itens.length === 0) {
      setErro("Adicione pelo menos 1 item")
      return
    }

    setConfirmando(true)
  }

  async function handleConfirmarPagamento() {
    try {
      const res = await criarPedido(nome, itens, formaPagamento)

      const url = `${window.location.origin}/pedidos/${res.id}`

      setQrUrl(url)
      setCodigoPedido(res.codigo)

      setMensagem(`Pedido ${res.codigo} criado!`)
      setNome("")
      setItens([])
      setConfirmando(false)
      setValorRecebido("")

    } catch (err) {
      console.error(err)
      setErro("Erro ao criar pedido")
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-2xl font-bold mb-4">PDV</h1>

      <Link
        href="/pedidos/controle"
        className="inline-block mb-4 bg-gray-700 px-3 py-2 rounded text-sm"
      >
        📋 Ver pedidos
      </Link>

      <input
        placeholder="Nome do cliente"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        className="w-full p-3 rounded-lg bg-gray-800 mb-4"
      />

      <div className="grid grid-cols-2 gap-3 mb-4">
        <button
          onClick={() =>
            adicionarItem({ nome: "Pizza", preco: 20, barracaId: "pizza" })
          }
          className={`p-4 rounded-xl text-lg font-bold transition ${
            ultimoItem === "Pizza" ? "bg-orange-400 scale-105" : "bg-orange-500"
          }`}
        >
          🍕 Pizza
          <br />R$20
        </button>

        <button
          onClick={() =>
            adicionarItem({ nome: "Coca", preco: 5, barracaId: "bebida" })
          }
          className={`p-4 rounded-xl text-lg font-bold transition ${
            ultimoItem === "Coca" ? "bg-blue-400 scale-105" : "bg-blue-500"
          }`}
        >
          🥤 Coca
          <br />R$5
        </button>
      </div>

      <div className="bg-gray-800 p-3 rounded-lg mb-4">
        <h3 className="font-bold mb-2">Carrinho</h3>

        {itens.length === 0 ? (
          <p className="text-gray-400">Nenhum item</p>
        ) : (
          itens.map((item, i) => (
            <div key={i} className="flex justify-between mb-2">
              <span>{item.nome} x{item.quantidade}</span>
              <div className="flex gap-2">
                <button onClick={() => removerItem(item.nome)} className="bg-red-500 px-3 py-1 rounded">-</button>
                <button onClick={() => adicionarItem(item)} className="bg-green-500 px-3 py-1 rounded">+</button>
              </div>
            </div>
          ))
        )}
      </div>

      <p className="text-green-400">{mensagem}</p>

      <div className="h-32"></div>

      <div className="fixed bottom-0 left-0 w-full bg-gray-800 p-4">
        <div className="flex justify-between text-lg font-bold mb-2">
          <span>Total</span>
          <span>R$ {total.toFixed(2)}</span>
        </div>

        <button
          onClick={handlePedido}
          disabled={!itens.length}
          className="w-full p-4 rounded-xl bg-green-600 font-bold"
        >
          Finalizar Pedido
        </button>

        <button
          onClick={limparCarrinho}
          className="w-full mt-2 p-2 bg-red-500 rounded"
        >
          Limpar
        </button>
      </div>

      {/* MODAL CONFIRMAÇÃO */}
      {confirmando && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white text-gray-900 w-full max-w-sm rounded-2xl p-6">

            <h2 className="text-xl font-bold mb-4 text-center">
              Confirmar pagamento
            </h2>

            <div className="mb-4 text-center">
              <p>Total</p>
              <p className="text-3xl font-bold text-green-600">
                R$ {total.toFixed(2)}
              </p>
            </div>

            <div className="mb-4 grid grid-cols-3 gap-2">
              {(["pix", "dinheiro", "cartao"] as FormaPagamento[]).map((forma) => (
                <button
                  key={forma}
                  onClick={() => setFormaPagamento(forma)}
                  className={`p-3 rounded ${
                    formaPagamento === forma ? "bg-green-600 text-white" : "bg-gray-200"
                  }`}
                >
                  {forma}
                </button>
              ))}
            </div>

            {formaPagamento === "dinheiro" && (
              <div className="mb-4">
                <input
                  type="number"
                  placeholder="Valor recebido"
                  value={valorRecebido}
                  onChange={(e) => setValorRecebido(e.target.value)}
                  className="w-full p-3 rounded border"
                />
                <p className="mt-2 font-bold">
                  Troco: R$ {troco.toFixed(2)}
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => setConfirmando(false)}
                className="flex-1 bg-gray-300 p-3 rounded"
              >
                Cancelar
              </button>

              <button
                onClick={handleConfirmarPagamento}
                className="flex-1 bg-green-600 text-white p-3 rounded"
              >
                Confirmar
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL ERRO */}
      {erro && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white text-black p-6 rounded-2xl w-full max-w-sm text-center">

            <div className="text-4xl mb-2">⚠️</div>

            <h2 className="text-lg font-bold mb-2">Atenção</h2>

            <p className="text-gray-600 mb-4">{erro}</p>

            <button
              onClick={() => setErro(null)}
              className="w-full bg-green-600 text-white p-3 rounded-xl font-bold"
            >
              OK
            </button>

          </div>
        </div>
      )}

      {/* MODAL QR */}
      {qrUrl && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">

          <div className="bg-white text-black p-8 rounded-2xl text-center shadow-2xl">

            <h2 className="text-lg text-gray-500 mb-2">
              Pedido realizado com sucesso
            </h2>

            <h1 className="text-6xl font-bold mb-4">
              {codigoPedido}
            </h1>

            <div className="mb-4 flex justify-center">
              <QRCodeCanvas value={qrUrl} size={220} />
            </div>

            <p className="text-sm text-gray-600 mb-4">
              Escaneie para acompanhar o pedido
            </p>

            <button
              onClick={() => {
                setQrUrl(null)
                setCodigoPedido(null)
              }}
              className="w-full bg-green-600 hover:bg-green-500 text-white p-3 rounded-xl font-bold transition"
            >
              Novo Pedido
            </button>

          </div>

        </div>
      )}
    </div>
  )
}