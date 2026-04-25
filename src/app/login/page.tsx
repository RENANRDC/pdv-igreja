"use client"

import { useState } from "react"
import { login } from "@/services/auth"
import { useRouter } from "next/navigation"
import { getAuth } from "firebase/auth"
import { Eye, EyeOff } from "lucide-react"
import {
  setCachedUser,
  clearUserCache
} from "@/hooks/useAdminGuard"
import { fetchWithAuth } from "@/lib/fetchWithAuth"
import { clearCache } from "@/lib/cache"

import AuthCard from "@/components/ui/AuthCard"

export default function LoginPage() {
  const [usuario, setUsuario] = useState("")
  const [senha, setSenha] = useState("")
  const [erro, setErro] = useState("")
  const [loading, setLoading] = useState(false)
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const router = useRouter()

  async function handleLogin() {
    setErro("")

    if (!usuario || !senha) {
      setErro("Preencha todos os campos")
      return
    }

    try {
      setLoading(true)

      const email = `${usuario}@pdv.local`

      // 🔐 Login Firebase
      await login(email, senha)

      const auth = getAuth()
      const user = auth.currentUser

      if (!user) throw new Error("Erro ao autenticar")

      const token = await user.getIdToken(true)

      // 🔐 cria sessão no backend
      const res = await fetch("/api/session", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      })

      if (!res.ok) throw new Error("Erro ao criar sessão")

      // 🔥 LIMPA TODOS OS CACHES (ESSENCIAL)
      clearUserCache()
      clearCache()

      // 🔥 pega role com segurança (sem quebrar login)
      let role: "admin" | "user" = "user"

      try {
        const me = await fetchWithAuth("/api/me")
        role = me.role === "admin" ? "admin" : "user"
      } catch (err) {
        console.warn("Falha ao buscar /api/me:", err)
        // não quebra login
      }

      // 🔥 salva usuário corretamente
      setCachedUser({
        role,
        username: usuario,
      })

      // 🚀 redireciona
      router.replace("/")

    } catch (err: unknown) {
      const code = (err as { code?: string })?.code

      if (
        code === "auth/invalid-credential" ||
        code === "auth/wrong-password" ||
        code === "auth/user-not-found"
      ) {
        setErro("Usuário ou senha inválidos")
      } else {
        setErro("Erro ao fazer login")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-gray-900 p-6">

      <AuthCard>

        {/* LOGO */}
        <div className="flex justify-center mb-4">
          <div className="p-4 rounded-2xl 
            bg-gradient-to-br from-gray-700 to-gray-800
            shadow-[inset_0_1px_2px_rgba(255,255,255,0.1),0_6px_20px_rgba(0,0,0,0.6)]">
            <img src="/logo.png" alt="Logo" className="h-24 object-contain" />
          </div>
        </div>

        {/* TÍTULO */}
        <h1 className="text-white text-xl font-semibold text-center">
          Central Gourmet
        </h1>

        <p className="text-gray-400 text-center mb-6">
          Gestão de Pedidos
        </p>

        {/* FORM */}
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (!loading) handleLogin()
          }}
        >

          {/* USUÁRIO */}
          <input
            autoFocus
            placeholder="Usuário"
            value={usuario}
            onChange={(e) => {
              setUsuario(e.target.value)
              setErro("")
            }}
            className="w-full p-3 mb-3 rounded-xl 
            bg-gray-800 border border-gray-700 
            focus:border-green-500 outline-none
            shadow-inner"
          />

          {/* SENHA */}
          <div className="relative mb-4">
            <input
              type={mostrarSenha ? "text" : "password"}
              placeholder="Senha"
              value={senha}
              onChange={(e) => {
                setSenha(e.target.value)
                setErro("")
              }}
              className="w-full p-3 pr-12 rounded-xl 
              bg-gray-800 border border-gray-700 
              focus:border-green-500 outline-none
              shadow-inner"
            />

            <button
              type="button"
              onClick={() => setMostrarSenha(!mostrarSenha)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              {mostrarSenha ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* BOTÃO */}
          <button
            type="submit"
            disabled={loading}
            className="w-full p-3 rounded-xl font-semibold
            bg-green-600 hover:bg-green-700
            shadow-[0_6px_20px_rgba(0,0,0,0.6)]
            transition disabled:opacity-50"
          >
            {loading ? "Carregando..." : "Entrar"}
          </button>

        </form>

        {/* ERRO */}
        {erro && (
          <p className="text-red-400 text-sm mt-3 text-center">
            {erro}
          </p>
        )}

      </AuthCard>

    </div>
  )
}