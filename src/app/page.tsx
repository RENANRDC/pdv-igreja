"use client"

import { useState } from "react"
import { criarPedido } from "../services/pedidos"
import { QRCodeCanvas } from "qrcode.react"

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

  // 🔥 NOVO
  const [qrUrl, setQrUrl] = useState<string | null>(null)
  const [codigoPedido, setCodigoPedido] = useState<string | null>(null)

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

  function handlePedido() {
    if (!nome) {
      alert("Digite o nome")
      return
    }

    if (itens.length === 0) {
      alert("Adicione pelo menos 1 item")
      return
    }

    setConfirmando(true)
  }

  async function handleConfirmarPagamento() {
    try {
      const res = await criarPedido(nome, itens, formaPagamento)

      const url = `${window.location.origin}/pedido/${res.id}`

      setQrUrl(url)
      setCodigoPedido(res.codigo)

      setMensagem(`Pedido ${res.codigo} criado!`)
      setNome("")
      setItens([])
      setConfirmando(false)

    } catch (err) {
      console.error(err)
      alert("Erro ao criar pedido")
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-2xl font-bold mb-4">PDV</h1>

      {/* Nome */}
      <input
        placeholder="Nome do cliente"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        className="w-full p-3 rounded-lg bg-gray-800 mb-4"
      />

      {/* Produtos */}
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

      {/* Carrinho */}
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

      {/* Footer */}
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
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          
          <div className="bg-white text-gray-900 w-full max-w-sm rounded-2xl shadow-2xl p-6 animate-in fade-in zoom-in-95">

            {/* Header */}
            <div className="text-center mb-5">
              <div className="text-4xl mb-2">💰</div>
              <h2 className="text-xl font-bold">Confirmar pagamento</h2>
              <p className="text-sm text-gray-500">
                Confirme antes de enviar para a cozinha
              </p>
            </div>

            {/* Total destaque */}
            <div className="bg-gray-100 rounded-xl p-4 mb-5 text-center">
              <p className="text-sm text-gray-500">Total do pedido</p>
              <p className="text-3xl font-bold text-green-600">
                R$ {total.toFixed(2)}
              </p>
            </div>

            {/* Forma de pagamento */}
            <div className="mb-5">
              <label className="text-sm text-gray-600 mb-1 block">
                Forma de pagamento
              </label>

              <div className="grid grid-cols-3 gap-2">
                {(["pix", "dinheiro", "cartao"] as FormaPagamento[]).map((forma) => (
                  <button
                    key={forma}
                    onClick={() => setFormaPagamento(forma)}
                    className={`p-3 rounded-xl border font-semibold transition ${
                      formaPagamento === forma
                        ? "bg-green-600 text-white border-green-600"
                        : "bg-white"
                    }`}
                  >
                    {forma === "pix" && "Pix"}
                    {forma === "dinheiro" && "Dinheiro"}
                    {forma === "cartao" && "Cartão"}
                  </button>
                ))}
              </div>
            </div>

            {/* Botões */}
            <div className="flex gap-3">
              
              <button
                onClick={() => setConfirmando(false)}
                className="flex-1 py-3 rounded-xl bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition"
              >
                Cancelar
              </button>

              <button
                onClick={handleConfirmarPagamento}
                className="flex-1 py-3 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 active:scale-95 transition"
              >
                Confirmar
              </button>

            </div>

          </div>
        </div>
      )}

      {/* 🔥 MODAL QR FINAL */}
      {qrUrl && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">

          <div className="bg-white text-black p-6 rounded-2xl w-full max-w-sm text-center">

            <h2 className="text-xl font-bold mb-2">Pedido criado!</h2>

            <div className="text-6xl font-bold mb-4 tracking-widest">
              {codigoPedido}
            </div>

          <div className="flex justify-center mb-4">
            <QRCodeCanvas value={qrUrl} size={220} />
          </div>

            <p className="text-sm text-gray-600 mb-4">
              Cliente pode acompanhar pelo QR
            </p>

            <button
              onClick={() => {
                setQrUrl(null)
                setCodigoPedido(null)
              }}
              className="w-full bg-green-600 text-white p-3 rounded-xl font-bold"
            >
              Novo Pedido
            </button>

          </div>
        </div>
      )}
    </div>
  )
}