"use client"

import { useState } from "react"
import { login } from "@/services/auth"
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore"
import { app } from "@/services/firebase"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [usuario, setUsuario] = useState("")
  const [senha, setSenha] = useState("")
  const [erro, setErro] = useState("")

  const router = useRouter()
  const db = getFirestore(app)

  async function handleLogin() {
    setErro("")

    if (!usuario || !senha) {
      setErro("Preencha todos os campos")
      return
    }

    try {
      // 🔥 converte usuário → email
      const email = `${usuario}@pdv.local`

      // 🔐 login firebase
      await login(email, senha)

      // 🔎 busca role no firestore
      const q = query(
        collection(db, "users"),
        where("username", "==", usuario)
      )

      const snapshot = await getDocs(q)

      if (snapshot.empty) {
        setErro("Usuário não encontrado")
        return
      }

      const userData = snapshot.docs[0].data()

      // 💾 salva role
      localStorage.setItem("role", userData.role)

      // 🚀 redireciona
      router.push("/")

    } catch (err) {
      setErro("Usuário ou senha inválidos")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">

      <div className="w-full max-w-sm bg-gray-800 rounded-2xl p-6 shadow-lg">

        {/* LOGO */}
        <div className="flex justify-center mb-4">
          <img src="/logo.png" alt="Logo" className="h-25 object-contain" />
        </div>

        <h1 className="text-white text-xl font-bold text-center">
          Central Gourmet
        </h1>

        <p className="text-gray-400 text-center mb-6">
          Faça login para continuar
        </p>

        <input
          placeholder="Usuário"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
          className="w-full p-3 mb-3 rounded-lg bg-gray-700 text-white outline-none"
        />

        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className="w-full p-3 mb-4 rounded-lg bg-gray-700 text-white outline-none"
        />

        <button
          onClick={handleLogin}
          className="w-full bg-green-600 hover:bg-green-700 transition p-3 rounded-lg font-bold text-white"
        >
          Entrar
        </button>

        {erro && (
          <p className="text-red-400 text-sm mt-3 text-center">
            {erro}
          </p>
        )}

      </div>
    </div>
  )
}