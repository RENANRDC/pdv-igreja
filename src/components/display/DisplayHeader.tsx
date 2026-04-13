export default function DisplayHeader() {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-gray-900/80 backdrop-blur">

      <div className="flex items-center gap-3">
        <img src="/logo.png" className="h-10" />
        <div>
          <h1 className="font-bold">Central Gourmet</h1>
          <p className="text-xs text-gray-400">Painel ao vivo</p>
        </div>
      </div>

      <div className="text-xs text-gray-400">
        Desenvolvido por <span className="font-semibold">R2CodeX</span>
      </div>

    </div>
  )
}