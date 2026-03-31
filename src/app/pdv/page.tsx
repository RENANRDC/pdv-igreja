"use client"

import { useState } from "react"
import { criarPedido } from "../../services/pedidos"
import { QRCodeCanvas } from "qrcode.react"
import Link from "next/link"
import { useVendaMode } from "../../hooks/useVendaMode"

type Item = {
  nome: string
  preco: number
  barracaId: string
  quantidade: number
}

type FormaPagamento = "pix" | "dinheiro" | "cartao"

export default function Home() {
  const [nome, setNome] = useState("")
  const [nomePedido, setNomePedido] = useState("") // 🔥 snapshot nome
  const [mensagem, setMensagem] = useState("")
  const [itens, setItens] = useState<Item[]>([])
  const [itensPedido, setItensPedido] = useState<Item[]>([]) // 🔥 snapshot itens
  const [ultimoItem, setUltimoItem] = useState<string | null>(null)

  const [confirmando, setConfirmando] = useState(false)
  const [formaPagamento, setFormaPagamento] =
    useState<FormaPagamento>("pix")

  const [valorRecebido, setValorRecebido] = useState("")

  const [qrUrl, setQrUrl] = useState<string | null>(null)
  const [codigoPedido, setCodigoPedido] = useState<string | null>(null)

  const [erro, setErro] = useState<string | null>(null)

  const [whatsNumero, setWhatsNumero] = useState("")

  const [trocoPedido, setTrocoPedido] = useState(0)
  const [valorRecebidoPedido, setValorRecebidoPedido] = useState(0)

// 🔥 TOPO DO COMPONENTE - ADICIONE ISSO
const { vendaMode, setVendaMode } = useVendaMode()

// ✅ Lê localStorage na inicialização do estado
const [mostrarModoModal, setMostrarModoModal] = useState(() => {
  if (typeof window === "undefined") return false
  return !localStorage.getItem("modo_venda")
})

// ✅ Remove o useEffect completamente!

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
    if (formaPagamento === "dinheiro") {
      const valor = parseFloat(valorRecebido || "0")

      if (valor <= 0) {
        setErro("Digite o valor recebido")
        return
      }
    }
    try {
      const res = await criarPedido(nome, itens, formaPagamento)

      const url = `${window.location.origin}/pedidos/${res.id}`

      // 🔥 salva snapshot antes de limpar
      setNomePedido(nome)
      setItensPedido(itens)

      const valorRecebidoNum = parseFloat(valorRecebido || "0")
      const trocoCalculado = Math.max(0, valorRecebidoNum - total)

      setTrocoPedido(trocoCalculado)
      setValorRecebidoPedido(valorRecebidoNum)

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

    function handleWhatsApp() {
      if (!codigoPedido || !qrUrl) return

      if (!whatsNumero) {
        alert("Digite o número do WhatsApp")
        return
      }

      const numero = whatsNumero.replace(/\D/g, "")

      const totalPedido = itensPedido
        .reduce((acc, i) => acc + i.preco * i.quantidade, 0)
        .toFixed(2)

      const itensTexto = itensPedido
        .map(
          (i) =>
            `• ${i.nome} x${i.quantidade} (R$ ${(i.preco * i.quantidade).toFixed(2)})`
        )
        .join("\n")

      let texto =
        `Pedido criado com sucesso!\n\n` +
        `Pedido: ${codigoPedido}\n` +
        `Cliente: ${nomePedido}\n\n` +
        `Itens:\n${itensTexto}\n\n`

// 🔥 PAGAMENTO
texto += `Pagamento: ${formaPagamento.toUpperCase()}\n`

if (formaPagamento === "dinheiro") {

  texto +=
    `Valor do pedido: R$ ${totalPedido}\n` +
    `Valor pago: R$ ${valorRecebidoPedido.toFixed(2)}\n` +
    `Troco: R$ ${trocoPedido.toFixed(2)}\n`

} else {
  texto += `Total: R$ ${totalPedido}\n`
}

      texto += `\nAcompanhar pedido:\n${qrUrl}`

      const textoEncoded = encodeURIComponent(texto)

      window.open(`https://wa.me/55${numero}?text=${textoEncoded}`, "_blank")
    }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">

<div className="flex items-center justify-between mb-4">

  {/* ESQUERDA */}
  <h1 className="text-xl font-bold">PDV</h1>

  {/* DIREITA */}
<div className="flex items-center gap-2">

  {/* MODO */}
  <div
    className={`flex items-center gap-1 text-sm font-semibold px-3 h-9 rounded-lg ${
      vendaMode === "balcao"
        ? "bg-blue-600"
        : "bg-green-600"
    }`}
  >
    <span>
      {vendaMode === "balcao" ? "🧾" : "📲"}
    </span>
    <span>
      {vendaMode === "balcao" ? "Balcão" : "Celular"}
    </span>
  </div>

  {/* TROCAR */}
  <button
    onClick={() => {
      localStorage.removeItem("modo_venda")
      setMostrarModoModal(true)
    }}
    className="flex items-center justify-center text-sm font-semibold px-3 h-9 rounded-lg bg-gray-700 hover:bg-gray-600 transition"
  >
    🔄 Trocar
  </button>

</div>
</div>

      <Link
        href="/pedidos/controle"
        className="inline-block mb-4 bg-gray-700 px-3 py-2 rounded text-sm"
      >
        📋 Ver pedidos
      </Link>

      <input
        placeholder="Nome do cliente"
        value={nome}
        onChange={(e) => {
          setNome(e.target.value)
          if (erro) setErro(null) // 🔥 LIMPA ERRO AUTOMATICAMENTE
        }}
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
{erro && (
  <p className="text-red-400 font-bold mt-2">
    {erro}
  </p>
)}
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
                disabled={
                  formaPagamento === "dinheiro" && !valorRecebido
                }
                className="flex-1 bg-green-600 text-white p-3 rounded disabled:opacity-50"
              >
                Confirmar
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL FINAL */}
      {/* MODAL FINAL */}
      {codigoPedido && (
<div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">

          <div className="bg-white text-black p-6 rounded-2xl w-full max-w-sm print:hidden">

            {/* HEADER */}
            <h2 className="text-center text-gray-500 mb-1">
              Pedido criado com sucesso
            </h2>

            <h1 className="text-5xl font-bold text-center mb-4">
              {codigoPedido}
            </h1>

            {/* CLIENTE */}
            <div className="mb-3 text-sm">
              <span className="text-gray-500">Cliente:</span>
              <p className="font-bold">{nomePedido}</p>
            </div>

            {/* ITENS */}
            <div className="bg-gray-100 p-3 rounded mb-3">
              {itensPedido.map((item, i) => (
                <div key={i} className="flex justify-between text-sm mb-1">
                  <span>{item.nome} x{item.quantidade}</span>
                  <span>R$ {(item.preco * item.quantidade).toFixed(2)}</span>
                </div>
              ))}
            </div>

            {/* TOTAL */}
            <div className="flex justify-between font-bold text-lg mb-2">
              <span>Total</span>
              <span>R$ {itensPedido
                .reduce((acc, i) => acc + i.preco * i.quantidade, 0)
                .toFixed(2)}
              </span>
            </div>

            {/* PAGAMENTO */}
            <div className="mb-3 text-sm">
              <p>
                <span className="text-gray-500">Pagamento:</span>{" "}
                <strong>{formaPagamento.toUpperCase()}</strong>
              </p>

              {formaPagamento === "dinheiro" ? (
                <>
                  <p>
                    <span className="text-gray-500">Valor do pedido:</span>{" "}
                    <strong>
                      R$ {itensPedido
                        .reduce((acc, i) => acc + i.preco * i.quantidade, 0)
                        .toFixed(2)}
                    </strong>
                  </p>

                  <p>
                    <span className="text-gray-500">Valor pago:</span>{" "}
                    <strong>R$ {valorRecebidoPedido.toFixed(2)}</strong>
                  </p>

                  <p>
                    <span className="text-gray-500">Troco:</span>{" "}
                    <strong>R$ {trocoPedido.toFixed(2)}</strong>
                  </p>
                </>
              ) : null}
            </div>

            {/* AÇÕES */}
            <div className="flex flex-col gap-2 mt-4">

              {/* BALCÃO */}
              {vendaMode === "balcao" && (
                <button
                  onClick={() => window.print()}
                  className="w-full bg-blue-600 text-white p-3 rounded-xl font-bold"
                >
                  🖨️ Imprimir
                </button>
              )}
        

              {/* Celular */}
              {vendaMode === "Celular" && (
                <>
                  <input
                    placeholder="Número WhatsApp (ex: 44999999999)"
                    value={whatsNumero}
                    onChange={(e) => setWhatsNumero(e.target.value)}
                    className="w-full p-3 border rounded"
                  />

                  <button
                    onClick={handleWhatsApp}
                    className="w-full bg-green-600 text-white p-3 rounded-xl font-bold"
                  >
                    📲 Enviar via WhatsApp
                  </button>
                </>
              )}

              <button
                onClick={() => {
                  setQrUrl(null)
                  setCodigoPedido(null)
                  setWhatsNumero("")
                }}
                className="w-full bg-gray-800 text-white p-3 rounded-xl font-bold"
              >
                Novo Pedido
              </button>

            </div>

          </div>

          {/* PRINT */}
          <div className="mx-auto w-72 text-xs text-black font-mono hidden print-area">
            <div className="text-center mb-2">
              <p className="font-bold">CENTRAL GOURMET</p>
              <p>------------------------------</p>
            </div>

            <p>Pedido: {codigoPedido}</p>
            <p>Cliente: {nomePedido}</p>

            <p>------------------------------</p>

            {itensPedido.map((item, i) => (
              <div key={i} className="flex justify-between">
                <span>{item.nome} x{item.quantidade}</span>
                <span>R$ {(item.preco * item.quantidade).toFixed(2)}</span>
              </div>
            ))}

            <p>------------------------------</p>

            <p>Total: R$ {itensPedido
              .reduce((acc, i) => acc + i.preco * i.quantidade, 0)
              .toFixed(2)}
            </p>

            <p>Pagamento: {formaPagamento.toUpperCase()}</p>

            {formaPagamento === "dinheiro" && (
              <>
                <p>Valor pedido: R$ {itensPedido
                  .reduce((acc, i) => acc + i.preco * i.quantidade, 0)
                  .toFixed(2)}
                </p>

                <p>Valor pago: R$ {valorRecebidoPedido.toFixed(2)}</p>
                <p>Troco: R$ {trocoPedido.toFixed(2)}</p>
              </>
            )}

            <p>------------------------------</p>

            <p className="text-center mt-2">Acompanhar pedido</p>

            <div className="flex justify-center mt-2">
              {qrUrl && <QRCodeCanvas value={qrUrl} size={100} />}
            </div>

            <p className="text-center mt-2">
              Obrigado pela preferência
            </p>

          </div>
<style jsx global>{`
  @media print {
    .print-area {
      display: block !important;
    }
  }
`}</style>
        </div>

      )}

      {mostrarModoModal && (
  <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
    <div className="bg-white text-black p-6 rounded-2xl w-full max-w-sm text-center">

      <h2 className="text-xl font-bold mb-4">
        Tipo de atendimento
      </h2>

      <div className="flex flex-col gap-3">

<button
  onClick={() => {
    setVendaMode("balcao")
    setMostrarModoModal(false) // 🔥 FECHA O MODAL
  }}
        className="bg-blue-600 text-white p-4 rounded-xl font-bold"
      >
        🧾 Balcão
      </button>

<button
  onClick={() => {
    setVendaMode("Celular")
    setMostrarModoModal(false) // 🔥 FECHA O MODAL
  }}
        className="bg-green-600 text-white p-4 rounded-xl font-bold"
      >
        📲 Celular
      </button>

      </div>

    </div>
  </div>
)}

    </div>
  )
}