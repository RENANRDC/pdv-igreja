export default function DisplayHeader() {
  return (
    <div className="flex items-center justify-between px-6 py-4">

      {/* ESQUERDA (PADRÃO) */}
      <div className="flex items-center gap-3">
        <img src="/logo.png" className="h-10 w-10" />
        <div>
          <h1 className="text-base font-bold">
            Central Gourmet
          </h1>
          <p className="text-xs text-gray-400">
            Display
          </p>
        </div>
      </div>

      {/* DIREITA (SUA MARCA) */}
      <div className="text-xs text-gray-400">
        Desenvolvido por{" "}
        <span className="font-semibold text-white">
          R2CodeX
        </span>
      </div>

    </div>
  )
}