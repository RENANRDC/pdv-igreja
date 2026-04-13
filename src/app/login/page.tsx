"use client"

import { useState } from "react"
import { login } from "@/services/auth"
import { useRouter } from "next/navigation"
import { getAuth } from "firebase/auth"
import { Eye, EyeOff } from "lucide-react"
import { setCachedUser } from "@/hooks/useAdminGuard"

import PageContainer from "@/components/ui/PageContainer"

export default function LoginPage() {
  const [usuario, setUsuario] = useState("")
  const [senha, setSenha] = useState("")
  const [erro, setErro] = useState("")
  const [loading, setLoading] = useState(false)
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const router = useRouter()

  async function handleLogin() {
    if (!usuario || !senha) {
      setErro("Preencha todos os campos")
      return
    }

    try {
      setLoading(true)

      const email = `${usuario}@pdv.local`
      await login(email, senha)

      const auth = getAuth()
      const token = await auth.currentUser?.getIdToken()

      await fetch("/api/session", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      })

      setCachedUser({
        role: "admin",
        username: usuario,
      })

      router.push("/")

    } catch {
      setErro("Erro ao fazer login")
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageContainer>

      <div className="flex items-center justify-center min-h-[80vh]">

        <div className="w-full max-w-sm p-6 rounded-2xl 
          bg-gradient-to-br from-gray-800 to-gray-900
          border border-gray-700
          shadow-[0_10px_30px_rgba(0,0,0,0.8)]">

          <div className="flex justify-center mb-4">
            <img src="/logo.png" className="h-16" />
          </div>

          <h1 className="text-center text-xl font-semibold">
            Central Gourmet
          </h1>

          <p className="text-center text-gray-400 mb-6">
            Faça login para continuar
          </p>

          <input
            placeholder="Usuário"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            className="w-full p-3 mb-3 rounded-xl bg-gray-800 border border-gray-700"
          />

          <div className="relative mb-4">
            <input
              type={mostrarSenha ? "text" : "password"}
              placeholder="Senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full p-3 pr-12 rounded-xl bg-gray-800 border border-gray-700"
            />

            <button
              type="button"
              onClick={() => setMostrarSenha(!mostrarSenha)}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              {mostrarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button
            onClick={handleLogin}
            className="w-full p-3 rounded-xl bg-green-600 hover:bg-green-700"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>

          {erro && (
            <p className="text-red-400 text-sm mt-3 text-center">
              {erro}
            </p>
          )}

        </div>

      </div>

    </PageContainer>
  )
}