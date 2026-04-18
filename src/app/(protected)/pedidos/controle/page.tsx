"use client"

import { useEffect, useState } from "react"
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  addDoc
} from "firebase/firestore"
import { db } from "@/services/firebase"
import BackButton from "@/components/ui/BackButton"
import PageContainer from "@/components/ui/PageContainer"
import { Printer, Send } from "lucide-react"

type Item = {
  nome: string
  quantidade: number
  preco?: number
}

type Pedido = {
  id: string
  nomeCliente: string
  codigo: string
  status: "pendente" | "em_preparo" | "finalizado"
  total?: number
  valor?: number
  itens?: Item[]
  formaPagamento?: string
}

export default function ControlePedidos() {

  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [pedidoSelecionado, setPedidoSelecionado] = useState<Pedido | null>(null)
  const [aba, setAba] = useState<"pendente" | "em_preparo" | "finalizado">("pendente")

  const [whatsNumero, setWhatsNumero] = useState("")
  const [erroWhats, setErroWhats] = useState(false)
  const [imprimindo, setImprimindo] = useState(false)

  useEffect(() => {
    const q = query(
      collection(db, "pedidos"),
      orderBy("createdAt", "desc")
    )

    const unsub = onSnapshot(q, (snapshot) => {
      const lista = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Pedido[]

      setPedidos(lista)
    })

    return () => unsub()
  }, [])

  const pendentes = pedidos.filter(p => p.status === "pendente")
  const emPreparo = pedidos.filter(p => p.status === "em_preparo")
  const finalizados = pedidos.filter(p => p.status === "finalizado")

  const lista =
    aba === "pendente"
      ? pendentes
      : aba === "em_preparo"
      ? emPreparo
      : finalizados

  const getTotal = (pedido: Pedido) => {
    return (pedido.total ?? pedido.valor ?? 0)
  }

  const CardPedido = (pedido: Pedido) => (
    <div
      key={pedido.id}
      onClick={() => setPedidoSelecionado(pedido)}
      className="bg-gray-800 p-4 rounded-xl cursor-pointer h-[60px] flex items-center"
    >
      <div className="flex justify-between items-center w-full">
        <span className="font-bold">
          #{pedido.codigo} • {pedido.nomeCliente}
        </span>

        <span className="text-sm font-bold text-green-400">
          R${getTotal(pedido).toFixed(2)}
        </span>
      </div>
    </div>
  )

  async function handlePrint(pedido: Pedido) {
    try {
      setImprimindo(true)
      console.log("ENVIANDO PARA FILA DE IMPRESSÃO")

      const total = (pedido.itens || [])
        .reduce((acc, i) => acc + ((i.preco || 0) * i.quantidade), 0)

      const link = `${window.location.origin}/client/${pedido.id}`

      await addDoc(collection(db, "fila_impressao"), {
        codigo: pedido.codigo,
        nome: pedido.nomeCliente,
        itens: pedido.itens || [],
        total: total.toFixed(2),
        pagamento: pedido.formaPagamento?.toUpperCase() || "PIX",
        valorPago: total,
        troco: 0,
        link: link,
        status: "pendente",
        createdAt: Date.now()
      })

      console.log("ENVIADO COM SUCESSO")

      setTimeout(() => {
        setImprimindo(false)
        setPedidoSelecionado(null) // 🔥 FECHA MODAL
      }, 800)

    } catch (err) {
      console.error("Erro ao enviar para impressão:", err)
      setImprimindo(false)
    }
  }

  function handleWhats(pedido: Pedido) {
    if (!whatsNumero.trim()) {
      setErroWhats(true)
      return
    }

    const numero = whatsNumero.replace(/\D/g, "")

    const totalPedido = (pedido.itens || [])
      .reduce((acc, i) => acc + ((i.preco || 0) * i.quantidade), 0)
      .toFixed(2)

    const itensTexto = (pedido.itens || [])
      .map(
        (i) =>
          `• ${i.nome} x${i.quantidade} (R$ ${((i.preco || 0) * i.quantidade).toFixed(2)})`
      )
      .join("\n")

    const link = `${window.location.origin}/client/${pedido.id}`

    let texto =
      `Pedido criado com sucesso!\n\n` +
      `Pedido: ${pedido.codigo}\n` +
      `Cliente: ${pedido.nomeCliente}\n\n` +
      `Itens:\n${itensTexto}\n\n`

    texto += `Pagamento: ${pedido.formaPagamento?.toUpperCase() || "PIX"}\n`
    texto += `Total: R$ ${totalPedido}\n`
    texto += `\nAcompanhar pedido:\n${link}`

    const textoEncoded = encodeURIComponent(texto)

    window.open(`https://wa.me/55${numero}?text=${textoEncoded}`, "_blank")
  }

  return (
    <PageContainer>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <img src="/logo.png" className="h-10 w-10" />
          <div>
            <h1 className="text-base font-bold">
              Central Gourmet
            </h1>
            <p className="text-xs text-gray-400">
              Pedidos
            </p>
          </div>
        </div>

        <BackButton href="/pdv" />
      </div>

      <div className="flex gap-2 mb-4 lg:hidden">
        <button onClick={() => setAba("pendente")} className={`flex-1 p-2 rounded text-sm font-semibold ${aba === "pendente" ? "bg-yellow-500 text-black" : "bg-gray-800"}`}>
          Pendentes ({pendentes.length})
        </button>

        <button onClick={() => setAba("em_preparo")} className={`flex-1 p-2 rounded text-sm font-semibold ${aba === "em_preparo" ? "bg-blue-600" : "bg-gray-800"}`}>
          Preparo ({emPreparo.length})
        </button>

        <button onClick={() => setAba("finalizado")} className={`flex-1 p-2 rounded text-sm font-semibold ${aba === "finalizado" ? "bg-green-600" : "bg-gray-800"}`}>
          Prontos ({finalizados.length})
        </button>
      </div>

      <div className="space-y-3 lg:hidden">
        {lista.map(CardPedido)}
      </div>

      <div className="hidden lg:grid grid-cols-3 gap-4">

        <div className="bg-yellow-500/10 border border-yellow-500/30 p-3 rounded-xl">
          <h2 className="text-yellow-400 font-semibold mb-3">
            Pendentes ({pendentes.length})
          </h2>
          <div className="space-y-3 max-h-[75vh] overflow-y-auto pr-1">
            {pendentes.map(CardPedido)}
          </div>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/30 p-3 rounded-xl">
          <h2 className="text-blue-400 font-semibold mb-3">
            Em preparo ({emPreparo.length})
          </h2>
          <div className="space-y-3 max-h-[75vh] overflow-y-auto pr-1">
            {emPreparo.map(CardPedido)}
          </div>
        </div>

        <div className="bg-green-500/10 border border-green-500/30 p-3 rounded-xl">
          <h2 className="text-green-400 font-semibold mb-3">
            Prontos ({finalizados.length})
          </h2>
          <div className="space-y-3 max-h-[75vh] overflow-y-auto pr-1">
            {finalizados.map(CardPedido)}
          </div>
        </div>

      </div>

      {pedidoSelecionado && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">

          <div className="bg-gray-900 p-6 rounded-xl w-80">

            <h2 className="text-xl font-bold mb-3">
              Pedido #{pedidoSelecionado.codigo}
            </h2>

            <p className="text-sm text-gray-400 mb-3">
              {pedidoSelecionado.nomeCliente}
            </p>

            <div className="mb-4 space-y-1">
              {pedidoSelecionado.itens?.map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span>{item.nome}</span>
                  <span>x{item.quantidade}</span>
                </div>
              ))}
            </div>

            <div className="text-right mb-4">
              <span className="text-lg font-bold text-green-400">
                R${getTotal(pedidoSelecionado).toFixed(2)}
              </span>
            </div>

            <div className="flex flex-col gap-2 mt-4">

              <button
                onClick={() => handlePrint(pedidoSelecionado)}
                className="w-full p-3 rounded-xl font-bold flex items-center justify-center gap-2 bg-blue-600 text-white"
              >
                <Printer size={18} />
                {imprimindo ? "Enviando..." : "Imprimir"}
              </button>

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
                  onClick={() => handleWhats(pedidoSelecionado)}
                  className="w-full bg-green-600 text-white p-3 rounded-xl font-bold flex items-center justify-center gap-2"
                >
                  <Send size={18} />
                  Enviar via WhatsApp
                </button>
              </>

              <button
                onClick={() => setPedidoSelecionado(null)}
                className="w-full p-3 rounded-xl font-bold bg-gray-700 text-white"
              >
                Fechar
              </button>

            </div>

          </div>

        </div>
      )}

    </PageContainer>
  )
}