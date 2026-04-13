"use client"

import { useState } from "react"
import { login } from "@/services/auth"
import { useRouter } from "next/navigation"
import { getAuth } from "firebase/auth"
import { Eye, EyeOff } from "lucide-react"
import { setCachedUser } from "@/hooks/useAdminGuard"
import { fetchWithAuth } from "@/lib/fetchWithAuth"
import { cache } from "@/lib/cache"

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

      // 🔐 login firebase
      await login(email, senha)

      const auth = getAuth()
      const user = auth.currentUser

      if (!user) {
        throw new Error("Erro ao autenticar")
      }

      // 🔐 pega token seguro
      const token = await user.getIdToken()

      // 🔐 cria sessão no backend (CORRIGIDO)
      const res = await fetch("/api/session", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include", // 🔥 ESSENCIAL
      })

      if (!res.ok) {
        throw new Error("Erro ao criar sessão")
      }

      // 🔥 BUSCA USER E SALVA NO CACHE
      const meRes = await fetch("/api/me", {
        credentials: "include", // 🔥 garante uso do cookie
      })

      if (meRes.ok) {
        const data = await meRes.json()
        setCachedUser(data)
      }

      // 🔥 PRELOAD COZINHA (INSTANTÂNEO)
// 🔥 PRELOAD COZINHA (SE DER ERRO, IGNORA)
try {
  const pedidos = await fetchWithAuth("/api/pedidos")

  if (Array.isArray(pedidos)) {
    cache["cozinha-pedidos"] = pedidos
  } else if (Array.isArray(pedidos?.pedidos)) {
    cache["cozinha-pedidos"] = pedidos.pedidos
  }
} catch {}

      // PRELOAD CREDENCIAIS
      await fetchWithAuth("/api/admin/users")

      // ✅ redireciona
      router.push("/")

    } catch (err: unknown) {
      let mensagem = "Erro ao fazer login"

      if (
        typeof err === "object" &&
        err !== null &&
        "code" in err &&
        typeof (err as { code: unknown }).code === "string"
      ) {
        const errorCode = (err as { code: string }).code

        switch (errorCode) {
          case "auth/invalid-credential":
          case "auth/wrong-password":
          case "auth/user-not-found":
            mensagem = "Usuário ou senha inválidos"
            break

          case "auth/too-many-requests":
            mensagem = "Muitas tentativas. Tente novamente mais tarde"
            break

          case "auth/network-request-failed":
            mensagem = "Erro de conexão. Verifique sua internet"
            break

          default:
            mensagem = "Erro ao autenticar. Tente novamente"
        }
      }

      setErro(mensagem)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">

      <div className="w-full max-w-sm bg-gray-800 rounded-2xl p-6 shadow-lg">

        <div className="flex justify-center mb-4">
          <img
            src="/logo.png"
            alt="Logo"
            className="h-24 object-contain"
          />
        </div>

        <h1 className="text-white text-xl font-bold text-center">
          Central Gourmet
        </h1>

        <p className="text-gray-400 text-center mb-6">
          Faça login para continuar
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (!loading) handleLogin()
          }}
        >

          <input
            autoFocus
            placeholder="Usuário"
            value={usuario}
            onChange={(e) => {
              setUsuario(e.target.value)
              setErro("")
            }}
            className="w-full p-3 mb-3 rounded-lg bg-gray-700 text-white outline-none border border-transparent focus:border-green-500"
          />

          <div className="relative mb-4">
            <input
              type={mostrarSenha ? "text" : "password"}
              placeholder="Senha"
              value={senha}
              onChange={(e) => {
                setSenha(e.target.value)
                setErro("")
              }}
              className="w-full p-3 pr-12 rounded-lg bg-gray-700 text-white outline-none border border-transparent focus:border-green-500"
            />

            <button
              type="button"
              onClick={() => setMostrarSenha(!mostrarSenha)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              {mostrarSenha ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 transition p-3 rounded-lg font-bold text-white disabled:opacity-50"
          >
            {loading ? "Carregando..." : "Entrar"}
          </button>

        </form>

        {erro && (
          <p className="text-red-400 text-sm mt-3 text-center">
            {erro}
          </p>
        )}

      </div>

    </div>
  )
}