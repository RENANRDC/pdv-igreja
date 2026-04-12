import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import FooterWrapper from "@/components/FooterWrapper"
import Preload from "@/components/Preload"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Central Gourmet",
  description: "Sistema de pedidos e gestão da Central Gourmet",

  openGraph: {
    title: "Central Gourmet",
    description: "Sistema de pedidos e gestão da Central Gourmet",
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
    title: "Central Gourmet",
    description: "Sistema de pedidos e gestão da Central Gourmet",
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-screen flex flex-col bg-gray-900 text-white">

        {/* 🔥 PRELOAD GLOBAL */}
        <Preload />

        <main className="flex-1">
          {children}
        </main>

        <FooterWrapper />

      </body>
    </html>
  )
}