"use client"

import { useEffect, useMemo, useState } from "react"
import BackButton from "@/components/BackButton"
import { fetchWithAuth } from "@/lib/fetchWithAuth"
import { Eye, EyeOff } from "lucide-react"
import { getAuth, signOut } from "firebase/auth"
import { cache } from "@/lib/cache"

/* ================= TYPES ================= */

type Role = "admin" | "user"

type User = {
  username: string
  role: Role
}

type ModalType = "create" | "edit" | null

type ToastType = {
  message: string
  type: "success" | "error"
} | null



/* ================= PAGE ================= */

export default function CredenciaisPage() {
  const [users, setUsers] = useState<User[]>([])
  const [search, setSearch] = useState("")

  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [modal, setModal] = useState<ModalType>(null)
  const [deleteModal, setDeleteModal] = useState<User | null>(null)

  const [isLoading, setIsLoading] = useState(false)
  const [toast, setToast] = useState<ToastType>(null)

  const [createForm, setCreateForm] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    role: "user" as Role,
  })

  const [editForm, setEditForm] = useState({
    newUsername: "",
    newPassword: "",
    confirmNewPassword: "",
    role: "user" as Role,
  })

  function showToast(message: string, type: "success" | "error") {
    setToast({ message, type })
    setTimeout(() => setToast(null), 2500)
  }

  function getErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message
    return "Erro inesperado"
  }

async function loadUsers() {
  try {
    const key = "/api/admin/users"

    // 🔥 usa cache global
    if (cache[key]) {
      const cached = cache[key] as { users?: User[] }
      setUsers(cached.users || [])
      return
    }

    const data = await fetchWithAuth(key)
    const list = Array.isArray(data?.users) ? data.users : []

    setUsers(list)

  } catch (err) {
    showToast(getErrorMessage(err), "error")
  }
}
  async function createUser() {
    const { username, password, confirmPassword, role } = createForm

    if (!username || !password || !confirmPassword) {
      return showToast("Preencha todos os campos", "error")
    }

    if (password !== confirmPassword) {
      return showToast("Senhas não coincidem", "error")
    }

    try {
      setIsLoading(true)

      await fetchWithAuth("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          username,
          password,
          role,
        }),
      })

      showToast("Usuário criado", "success")
      setModal(null)

      setCreateForm({
        username: "",
        password: "",
        confirmPassword: "",
        role: "user",
      })

      loadUsers()
    } catch (err) {
      showToast(getErrorMessage(err), "error")
    } finally {
      setIsLoading(false)
    }
  }

  async function updateUser() {
    if (!selectedUser) return

    const { newUsername, newPassword, confirmNewPassword, role } = editForm

    if (newPassword && newPassword !== confirmNewPassword) {
      return showToast("Senhas não coincidem", "error")
    }

    try {
      setIsLoading(true)

      await fetchWithAuth("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update",
          username: selectedUser.username,
          newUsername,
          newPassword,
          role,
        }),
      })

showToast("Usuário atualizado. Faça login novamente.", "success")

const auth = getAuth()
const currentUser = auth.currentUser

if (currentUser && selectedUser.username === currentUser.email?.split("@")[0]) {
  await signOut(auth)
  window.location.href = "/login"
  return
}

setModal(null)
setSelectedUser(null)

loadUsers()

} catch (err) {
  showToast(getErrorMessage(err), "error")
} finally {
  setIsLoading(false)
}
  }
  async function confirmDelete() {
    if (!deleteModal) return

    try {
      await fetchWithAuth("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete",
          username: deleteModal.username,
        }),
      })

      showToast("Usuário excluído", "success")
      setDeleteModal(null)
      loadUsers()
    } catch (err) {
      showToast(getErrorMessage(err), "error")
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const filteredUsers = useMemo(() => {
    return users.filter(u =>
      u.username.toLowerCase().includes(search.toLowerCase())
    )
  }, [users, search])

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-6">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between mb-6">
        <BackButton href="/admin" />
        <h1 className="text-lg sm:text-xl font-semibold">Credenciais</h1>

        <button
          onClick={() => setModal("create")}
          className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-sm w-full sm:w-auto"
        >
          + Novo usuário
        </button>
      </div>

      {/* SEARCH */}
      <div className="relative mb-4">
        <input
          placeholder="Buscar usuário..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-lg bg-zinc-800 border border-zinc-700 focus:border-green-600 outline-none"
        />
        <span className="absolute left-3 top-2.5 text-zinc-400">🔍</span>
      </div>

      {/* LISTA */}
<div className="space-y-3">
  {users.length === 0 ? (
    <p className="text-center text-gray-400">Carregando...</p>
  ) : (
    filteredUsers.map(user => (
      <div key={user.username} className="bg-zinc-800 p-4 rounded-lg">

        <div className="flex justify-between items-center mb-2">
          <span className="font-medium">{user.username}</span>
          <span className="text-xs text-gray-400">{user.role}</span>
        </div>

        <div className="flex gap-2 mt-3">
          <button
            onClick={() => {
              setSelectedUser(user)
              setEditForm({
                newUsername: user.username,
                newPassword: "",
                confirmNewPassword: "",
                role: user.role,
              })
              setModal("edit")
            }}
            className="flex-1 bg-blue-600/20 text-blue-400 p-2 rounded"
          >
            Editar
          </button>

          <button
            onClick={() => setDeleteModal(user)}
            className="flex-1 bg-red-600/20 text-red-400 p-2 rounded"
          >
            Excluir
          </button>
        </div>

      </div>
    ))
  )}
</div>

      {/* MODAIS */}
      {modal && (
        <Modal onClose={() => setModal(null)}>
          {modal === "create" && (
            <>
              <h2 className="text-lg font-semibold mb-4">Novo usuário</h2>

              <Input
                placeholder="Usuário"
                value={createForm.username}
                onChange={e => setCreateForm({ ...createForm, username: e.target.value })}
              />

              <Input
                type="password"
                placeholder="Senha"
                value={createForm.password}
                onChange={e => setCreateForm({ ...createForm, password: e.target.value })}
              />

              <Input
                type="password"
                placeholder="Confirmar senha"
                value={createForm.confirmPassword}
                onChange={e => setCreateForm({ ...createForm, confirmPassword: e.target.value })}
              />

              <Select
                value={createForm.role}
                onChange={e => setCreateForm({ ...createForm, role: e.target.value as Role })}
              />

              <Button onClick={createUser} loading={isLoading} label="Criar usuário" />
            </>
          )}

          {modal === "edit" && selectedUser && (
            <>
              <h2 className="text-lg font-semibold mb-4">Editar usuário</h2>

              <Input
                value={editForm.newUsername}
                onChange={e => setEditForm({ ...editForm, newUsername: e.target.value })}
              />

              <Input
                type="password"
                placeholder="Nova senha"
                value={editForm.newPassword}
                onChange={e => setEditForm({ ...editForm, newPassword: e.target.value })}
              />

              <Input
                type="password"
                placeholder="Confirmar senha"
                value={editForm.confirmNewPassword}
                onChange={e => setEditForm({ ...editForm, confirmNewPassword: e.target.value })}
              />

              <Select
                value={editForm.role}
                onChange={e => setEditForm({ ...editForm, role: e.target.value as Role })}
              />

              <Button onClick={updateUser} loading={isLoading} label="Salvar alterações" />
            </>
          )}
        </Modal>
      )}

      {deleteModal && (
        <Modal onClose={() => setDeleteModal(null)}>
          <h2 className="text-lg font-semibold mb-3 text-red-400">
            Confirmar exclusão
          </h2>

          <p className="text-sm text-gray-400 mb-4">
            Deseja realmente excluir <strong>{deleteModal.username}</strong>?
          </p>

          <div className="flex gap-2">
            <button
              onClick={() => setDeleteModal(null)}
              className="flex-1 bg-zinc-700 p-2 rounded"
            >
              Cancelar
            </button>

            <button
              onClick={confirmDelete}
              className="flex-1 bg-red-600 hover:bg-red-700 p-2 rounded"
            >
              Excluir
            </button>
          </div>
        </Modal>
      )}

      {toast && (
        <div className={`fixed bottom-5 right-5 px-4 py-2 rounded-lg shadow-lg text-sm
          ${toast.type === "success" ? "bg-green-600" : "bg-red-600"}`}>
          {toast.message}
        </div>
      )}
    </div>
  )
}

/* ================= COMPONENTS ================= */

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const isPassword = props.type === "password"
  const [show, setShow] = useState(false)

  return (
    <div className="relative mb-3">
      <input
        {...props}
        type={isPassword ? (show ? "text" : "password") : props.type}
        className="w-full p-2 pr-10 bg-zinc-800 rounded-md outline-none focus:ring-2 focus:ring-green-600"
      />

      {isPassword && (
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition"
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      )}
    </div>
  )
}

function Select({
  value,
  onChange,
}: {
  value: Role
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
}) {
  return (
    <select
      value={value}
      onChange={onChange}
      className="w-full p-2 mb-3 bg-zinc-800 rounded-md"
    >
      <option value="user">Usuário</option>
      <option value="admin">Admin</option>
    </select>
  )
}

function Button({
  onClick,
  loading,
  label,
}: {
  onClick: () => void
  loading?: boolean
  label: string
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="w-full bg-green-600 hover:bg-green-700 p-2 rounded-md transition disabled:opacity-60"
    >
      {loading ? "Processando..." : label}
    </button>
  )
}

function Modal({
  children,
  onClose,
}: {
  children: React.ReactNode
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center backdrop-blur-sm">
      <div className="bg-zinc-900 p-6 rounded-xl w-full max-w-sm border border-zinc-700 shadow-xl">
        {children}

        <button
          onClick={onClose}
          className="mt-4 w-full text-gray-400 hover:text-white transition"
        >
          Cancelar
        </button>
      </div>
    </div>
  )
}