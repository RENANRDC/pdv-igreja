"use client"

import { useState } from "react"
import { login } from "@/services/auth"
import { useRouter } from "next/navigation"
import { getAuth } from "firebase/auth"
import { Eye, EyeOff } from "lucide-react"

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

      // 🔐 envia para backend criar sessão httpOnly
      const res = await fetch("/api/session", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!res.ok) {
        throw new Error("Erro ao criar sessão")
      }

      // ✅ sucesso → redireciona
      router.push("/")

    } catch (err: unknown) {
      if (err instanceof Error) {
        setErro(err.message)
      } else {
        setErro("Usuário ou senha inválidos")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col flex-1 bg-gray-900">

      <div className="flex flex-1 items-center justify-center p-4">

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
              onChange={(e) => setUsuario(e.target.value)}
              className="w-full p-3 mb-3 rounded-lg bg-gray-700 text-white outline-none border border-transparent focus:border-green-500"
            />

            <div className="relative mb-4">
              <input
                type={mostrarSenha ? "text" : "password"}
                placeholder="Senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
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
              {loading ? "Entrando..." : "Entrar"}
            </button>

          </form>

          {erro && (
            <p className="text-red-400 text-sm mt-3 text-center">
              {erro}
            </p>
          )}

        </div>

      </div>

    </div>
  )
}