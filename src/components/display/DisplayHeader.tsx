export default function DisplayHeader() {
  return (
    <div className="
      w-full border-b border-gray-800
      bg-gradient-to-r from-gray-900 to-gray-800
      sticky top-0 z-10
    ">
      <div className="max-w-7xl mx-auto flex items-center justify-between p-4">

        {/* ESQUERDA (IGUAL PADRÃO) */}
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

        {/* DIREITA (SEU CONTEÚDO) */}
        <div className="text-xs text-gray-400 text-right">
          Desenvolvido por{" "}
          <span className="font-semibold text-white">
            R2CodeX
          </span>
        </div>

      </div>
    </div>
  )
}