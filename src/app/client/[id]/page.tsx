import type { Metadata } from "next"
import PedidoClient from "./PedidoClient"

export function generateMetadata(): Metadata {
  return {
    title: "Sistema de Pedidos em Tempo Real",
    description: "Acompanhe seu pedido em tempo real",

    openGraph: {
      title: "Central Gourmet | Sistema de Pedidos",
      description: "Acompanhe seu pedido em tempo real",
      images: ["/logo2.png"],
    },

    twitter: {
      card: "summary_large_image",
      title: "Central Gourmet | Sistema de Pedidos",
      description: "Acompanhe seu pedido em tempo real",
      images: ["/logo2.png"],
    },
  }
}

export default function Page() {
  return <PedidoClient />
}