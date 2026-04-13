import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import FooterWrapper from "@/components/FooterWrapper"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Central Gourmet | Sistema de Pedidos",
  description: "Sistema de pedidos em tempo real integrado entre atendimento, cozinha e cliente.",

  openGraph: {
    title: "Central Gourmet | Sistema de Pedidos",
    description: "Sistema de pedidos em tempo real integrado entre atendimento, cozinha e cliente.",
    url: "https://pdv-igreja.vercel.app",
    siteName: "Central Gourmet",
    images: [
      {
        url: "https://pdv-igreja.vercel.app/logo2.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "pt_BR",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Central Gourmet | Sistema de Pedidos",
    description: "Sistema de pedidos em tempo real integrado entre atendimento, cozinha e cliente.",
    images: ["https://pdv-igreja.vercel.app/logo2.png"],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased bg-gray-900`}
    >
      <body className="min-h-[100dvh] flex flex-col text-white">

        <main className="flex-1">
          {children}
        </main>

        <FooterWrapper />

      </body>
    </html>
  )
}