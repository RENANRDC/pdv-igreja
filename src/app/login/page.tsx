"use client"

import { useState } from "react"
import { login } from "@/services/auth"
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs
} from "firebase/firestore"
import { app } from "@/services/firebase"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [usuario, setUsuario] = useState("")
  const [senha, setSenha] = useState("")
  const [erro, setErro] = useState("")
  const [loading, setLoading] = useState(false)

  const router = useRouter()
  const db = getFirestore(app)

  async function handleLogin() {
    setErro("")

    if (!usuario || !senha) {
      setErro("Preencha todos os campos")
      return
    }

    try {
      setLoading(true)

      const email = `${usuario}@pdv.local`

      await login(email, senha)

      const q = query(
        collection(db, "users"),
        where("username", "==", usuario)
      )

      const snapshot = await getDocs(q)

      if (snapshot.empty) {
        setErro("Usuário não encontrado")
        setLoading(false)
        return
      }

      const userData = snapshot.docs[0].data()

      // 🔥 cookie usado pelo middleware
      document.cookie = `role=${userData.role}; path=/`

      router.push("/")

    } catch (err) {
      console.error(err)
      setErro("Usuário ou senha inválidos")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">

      {/* CONTEÚDO */}
      <div className="flex flex-1 items-center justify-center p-4">

        <div className="w-full max-w-sm bg-gray-800 rounded-2xl p-6 shadow-lg">

          {/* LOGO */}
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
              onChange={(e) => setUsuario(e.target.value)}
              className="w-full p-3 mb-3 rounded-lg bg-gray-700 text-white outline-none border border-transparent focus:border-green-500 focus:ring-2 focus:ring-green-500/30 transition"
            />

            {/* SENHA */}
            <input
              type="password"
              placeholder="Senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full p-3 mb-4 rounded-lg bg-gray-700 text-white outline-none border border-transparent focus:border-green-500 focus:ring-2 focus:ring-green-500/30 transition"
            />

            {/* BOTÃO */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 transition p-3 rounded-lg font-bold text-white disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>

          </form>

          {/* ERRO */}
          {erro && (
            <p className="text-red-400 text-sm mt-3 text-center">
              {erro}
            </p>
          )}

        </div>

      </div>

      {/* RODAPÉ */}
      <div className="text-center text-xs text-gray-500 pb-4">
        Desenvolvido por{" "}
        <span className="font-semibold text-gray-400">
          R2CodeX LTDA
        </span>
      </div>

    </div>
  )
}