"use client"

import { useState, useEffect } from "react"
import { criarPedido } from "@/services/pedidos"
import { QRCodeCanvas } from "qrcode.react"
import Link from "next/link"
import { useVendaMode } from "@/hooks/useVendaMode"
import { useCategorias } from "@/hooks/useCategorias"
import { useProdutos } from "@/hooks/useProdutos"
import BackButton from "@/components/ui/BackButton"
import {
  Receipt,
  Smartphone,
  RefreshCw,
  ClipboardList,
  Printer,
  Send
} from "lucide-react"
import PageContainer from "@/components/ui/PageContainer"
type Item = {
  nome: string
  preco: number
  barracaId: string
  quantidade: number
}

type FormaPagamento = "pix" | "dinheiro" | "cartao"
import { db } from "@/services/firebase"

import { doc, onSnapshot } from "firebase/firestore"
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
const [erroWhats, setErroWhats] = useState(false)

  function formatarReal(valor: string) {
  const numero = valor.replace(/\D/g, "")
  return (Number(numero) / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  })
}

function parseReal(valor: string) {
  return Number(valor.replace(/\D/g, "")) / 100
}

  const [qrUrl, setQrUrl] = useState<string | null>(null)
  const [codigoPedido, setCodigoPedido] = useState<string | null>(null)

  const [erro, setErro] = useState<string | null>(null)

  const [whatsNumero, setWhatsNumero] = useState("")

  const [trocoPedido, setTrocoPedido] = useState(0)
  const [valorRecebidoPedido, setValorRecebidoPedido] = useState(0)

  const compacto = itens.length > 5

const { categorias } = useCategorias()
const { produtos } = useProdutos()

const [categoriaSelecionada, setCategoriaSelecionada] = useState<string | null>(null)

const produtosFiltrados = categoriaSelecionada
  ? produtos.filter(
      (p) => p.categoriaId === categoriaSelecionada && p.ativo
    )
  : []


const { vendaMode, setVendaMode, isLoaded } = useVendaMode()
const [printerIp, setPrinterIp] = useState("")

useEffect(() => {
  const ref = doc(db, "config", "printer")

  const unsub = onSnapshot(ref, (snap) => {
    const valor = snap.exists()
      ? snap.data().url || ""
      : ""

    setPrinterIp(valor)
  })

  return () => unsub()
}, [])

if (!isLoaded) return null

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
    ? Math.max(0, parseReal(valorRecebido) - total)
    : 0

  function handlePedido() {
if (!nome.trim()) {
  setErro("nome")
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
    const valor = parseReal(valorRecebido)

    if (valor <= 0) {
      setErro("Digite o valor recebido")
      return
    }
  }

  try {
    const res = await criarPedido(nome, itens, formaPagamento)

    const url = `${window.location.origin}/client/${res.id}`

    setNomePedido(nome)
    setItensPedido(itens)

    const valorRecebidoNum = parseReal(valorRecebido)
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
    setCategoriaSelecionada(null)

  } catch (err) {
    console.error(err)
    setErro("Erro ao criar pedido")
  }
}

    function handleWhatsApp() {
      if (!codigoPedido || !qrUrl) return

if (!whatsNumero.trim()) {
  setErroWhats(true)
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
<PageContainer>

  {/* HEADER PADRÃO */}
<div className="flex items-center justify-between mb-6">

  <div className="flex items-center gap-3">
    <img src="/logo.png" className="h-10 w-10" />
    <div>
      <h1 className="text-base font-bold">
        Central Gourmet
      </h1>
      <p className="text-xs text-gray-400">
        PDV
      </p>
    </div>
  </div>

  <BackButton href="/" />

</div>

<div className="flex items-center justify-between mb-4">

  {/* ESQUERDA → NAVEGAÇÃO */}
  <Link
    href="/pedidos/controle"
    className="flex items-center gap-2 px-4 h-10 rounded-xl bg-gray-800 hover:bg-gray-700 text-sm font-semibold"
  >
    <ClipboardList size={16} />
    Pedidos
  </Link>

  {/* DIREITA → MODO */}
<div className="flex items-center">

<button
  onClick={() => setVendaMode(null)}
  className={`flex items-center gap-2 px-4 h-10 rounded-xl text-white font-semibold transition ${
    vendaMode === "balcao"
      ? "bg-blue-600 hover:bg-blue-700"
      : vendaMode === "mesa"
      ? "bg-green-600 hover:bg-green-700"
      : "bg-gray-700 hover:bg-gray-600"
  }`}
>
  {!vendaMode && <RefreshCw size={16} />}

  {vendaMode === "balcao" && (
    <>
      <Receipt size={16} />
      Balcão
    </>
  )}

  {vendaMode === "mesa" && (
    <>
      <Smartphone size={16} />
      Mesa
    </>
  )}
</button>

</div>

</div>

    <input
      placeholder={erro === "nome" ? "Digite o nome do cliente" : "Nome do cliente"}
      value={nome}
onChange={(e) => {
  setNome(e.target.value)
}}

onFocus={() => {
  if (erro === "nome") setErro(null)
}}
      className={`w-full p-3 rounded-lg mb-4 outline-none transition ${
        erro === "nome"
          ? "bg-red-900 border border-red-500 placeholder-red-300"
          : "bg-gray-800 border border-transparent focus:border-green-500"
      }`}
    />

  {/* 🔥 LAYOUT RESPONSIVO */}
  <div className="flex flex-col lg:grid lg:grid-cols-3 gap-4">

{/* PRODUTOS */}
<div className="lg:col-span-2 flex flex-col">

  {/* CATEGORIAS */}
  <div className="flex gap-2 mb-3 overflow-x-auto pb-1">

    {categorias.filter(c => c.ativo).length === 0 && (
      <p className="text-gray-400">Nenhuma categoria cadastrada</p>
    )}

    {categorias
      .filter((c) => c.ativo)
      .map((cat) => (
        <button
          key={cat.id}
          onClick={() => setCategoriaSelecionada(cat.id)}
          className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap border transition ${
            categoriaSelecionada === cat.id
              ? "bg-green-600 border-green-500 text-white"
              : "bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700"
          }`}
        >
          {cat.nome}
        </button>
      ))}
  </div>

  {/* PRODUTOS */}
  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[60vh] overflow-y-auto pr-1">

    {produtosFiltrados.length === 0 && (
      <div className="col-span-full text-center text-gray-400 py-10">
        Nenhum produto nessa categoria
      </div>
    )}

    {produtosFiltrados.map((prod) => (
      <button
        key={prod.id}
        onClick={() =>
          adicionarItem({
            nome: prod.nome,
            preco: prod.preco,
            barracaId: prod.categoriaId,
          })
        }
        className={`p-4 rounded-xl text-left border transition-all ${
          ultimoItem === prod.nome
            ? "bg-green-500 border-green-400"
            : "bg-gray-800 border-gray-700 hover:bg-gray-700"
        }`}
      >
        <div className="font-semibold text-white text-sm leading-tight">
          {prod.nome}
        </div>

        <div className="text-green-400 font-bold mt-2 text-sm">
          R$ {prod.preco.toFixed(2)}
        </div>
      </button>
    ))}

  </div>

</div>

    {/* CARRINHO */}
    <div className="bg-gray-800 p-3 rounded-lg mb-4 lg:mb-0 flex flex-col lg:sticky lg:top-4 h-fit">

      <h3 className="font-bold mb-2">Carrinho</h3>

      <div className="flex-1 overflow-y-auto max-h-80 lg:max-h-none">

        {itens.length === 0 ? (
          <p className="text-gray-400">Nenhum item</p>
        ) : (
          itens.map((item, i) => (
            <div
              key={i}
              className={`flex items-center justify-between rounded-xl mb-2 ${
                compacto ? "bg-gray-700 px-3 py-2" : "bg-gray-700 p-3"
              }`}
            >

              {/* ESQUERDA */}
              <div>
                <p className="font-semibold text-white">
                  {item.nome}
                </p>

                {!compacto && (
                  <>
                    <p className="text-sm text-gray-400">
                      {item.quantidade} x R$ {item.preco.toFixed(2)}
                    </p>

                    <p className="text-sm text-gray-300 font-bold">
                      R$ {(item.preco * item.quantidade).toFixed(2)}
                    </p>
                  </>
                )}

                {compacto && (
                  <p className="text-xs text-gray-400">
                    {item.quantidade}x • R$ {(item.preco * item.quantidade).toFixed(2)}
                  </p>
                )}
              </div>

              {/* DIREITA */}
              <div className={`flex items-center bg-gray-800 overflow-hidden ${
                compacto ? "rounded-lg" : "rounded-xl"
              }`}>

                <button
                  onClick={() => removerItem(item.nome)}
                  disabled={item.quantidade === 1}
                  className={`flex items-center justify-center bg-red-600 hover:bg-red-700 active:scale-95 transition font-bold disabled:opacity-40 ${
                    compacto ? "w-9 h-9" : "w-11 h-11"
                  }`}
                >
                  −
                </button>

                <div className={`flex items-center justify-center font-bold ${
                  compacto ? "w-9 h-9 text-base" : "w-11 h-11 text-lg"
                }`}>
                  {item.quantidade}
                </div>

                <button
                  onClick={() => adicionarItem(item)}
                  className={`flex items-center justify-center bg-green-600 hover:bg-green-700 active:scale-95 transition font-bold ${
                    compacto ? "w-9 h-9" : "w-11 h-11"
                  }`}
                >
                  +
                </button>

              </div>

            </div>
          ))
        )}

      </div>

      {/* TOTAL (desktop) */}
      <div className="hidden lg:block mt-4">
        <div className="flex justify-between text-lg font-bold mb-2">
          <span>Total</span>
          <span>R$ {total.toFixed(2)}</span>
        </div>

        <button
          onClick={handlePedido}
          disabled={!itens.length}
          className="w-full h-14 rounded-xl bg-green-600 hover:bg-green-700 transition font-bold text-lg disabled:opacity-50"
        >
          Finalizar Pedido
        </button>

        <button
          onClick={limparCarrinho}
          className="w-full h-12 mt-2 rounded-xl bg-red-600 hover:bg-red-700 transition font-semibold"
        >
          Limpar Carrinho
        </button>
      </div>

    </div>

  </div>

  {/* MOBILE (continua igual) */}
  <p className="text-green-400">{mensagem}</p>
  {erro && (
    <p className="text-red-400 font-bold mt-2">
      {/* erro tratado direto no input */}
    </p>
  )}

  <div className="h-32"></div>

  <div className="fixed bottom-0 left-0 w-full bg-gray-800 p-4 lg:hidden">
    <div className="flex justify-between text-lg font-bold mb-2">
      <span>Total</span>
      <span>R$ {total.toFixed(2)}</span>
    </div>

    <button
      onClick={handlePedido}
      disabled={!itens.length}
      className="w-full h-14 rounded-xl bg-green-600 hover:bg-green-700 transition font-bold text-lg disabled:opacity-50"
    >
      Finalizar Pedido
    </button>

    <button
      onClick={limparCarrinho}
      className="w-full h-12 mt-2 rounded-xl bg-red-600 hover:bg-red-700 transition font-semibold"
    >
      Limpar Carrinho
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
                type="text"
                placeholder="R$ 0,00"
                value={valorRecebido}
                onChange={(e) => setValorRecebido(formatarReal(e.target.value))}
                className="w-full p-3 rounded border text-lg font-semibold"
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
<div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 pointer-events-auto">

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

{/* IMPRIMIR (só balcão) */}
{vendaMode === "balcao" && (
<button
  disabled={!printerIp}
  onTouchStart={async () => {
    try {
      console.log("CLICK IMPRIMIR")
      console.log("IP:", printerIp)

      if (!printerIp) {
        alert("Carregando impressora...")
        return
      }

      await fetch(`${printerIp}/print`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          codigo: codigoPedido,
          nome: nomePedido,
          itens: itensPedido,
          total: itensPedido
            .reduce((acc, i) => acc + i.preco * i.quantidade, 0)
            .toFixed(2),
          pagamento: formaPagamento.toUpperCase(),
          valorPago: valorRecebidoPedido,
          troco: trocoPedido,
          link: qrUrl,
        }),
      })

    } catch (err) {
      console.error("Erro ao imprimir:", err)
    }
  }}
  className={`w-full p-3 rounded-xl font-bold flex items-center justify-center gap-2 ${
    !printerIp
      ? "bg-gray-400 cursor-not-allowed"
      : "bg-blue-600 text-white"
  }`}
>
  <Printer size={18} />
  {printerIp ? "Imprimir" : "Carregando impressora..."}
</button>
)}

{/* WHATSAPP (todos os modos) */}
<>
<input
  placeholder={
    erroWhats
      ? "Digite o número do WhatsApp"
      : "Número WhatsApp (ex: 44999999999)"
  }
  value={whatsNumero}
  onChange={(e) => {
    setWhatsNumero(e.target.value)
    if (erroWhats) setErroWhats(false)
  }}
  className={`w-full p-3 border rounded ${
    erroWhats ? "border-red-500 bg-red-100" : ""
  }`}
/>

<button
  onClick={handleWhatsApp}
  className="w-full bg-green-600 text-white p-3 rounded-xl font-bold flex items-center justify-center gap-2"
>
  <Send size={18} />
  Enviar via WhatsApp
</button>
</>
              

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
        </div>

      )}

      {isLoaded && !vendaMode && (
  <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
    <div className="bg-white text-black p-6 rounded-2xl w-full max-w-sm text-center">

      <h2 className="text-xl font-bold mb-4">
        Tipo de atendimento
      </h2>

      <div className="flex flex-col gap-3">

<button
  onClick={() => setVendaMode("balcao")}
  className="bg-blue-600 text-white p-4 rounded-xl font-bold flex items-center justify-center gap-2"
>
  <Receipt size={18} />
  Balcão
</button>

<button
  onClick={() => setVendaMode("mesa")}
  className="bg-green-600 text-white p-4 rounded-xl font-bold flex items-center justify-center gap-2"
>
  <Smartphone size={18} />
  Mesa
</button>
      </div>

    </div>
  </div>
)}

</PageContainer>
  )
}