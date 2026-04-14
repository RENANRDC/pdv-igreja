export default function DisplayHeader() {
  return (
    <div className="
      w-full border-b border-gray-800
      bg-gray-900
      sticky top-0 z-10
    ">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">

        {/* ESQUERDA */}
        <div className="flex items-center gap-4">
          <img
            src="/logo.png"
            className="h-12 w-12"
          />

          <div className="leading-tight">
            <h1 className="text-xl font-bold">
              Central Gourmet
            </h1>

            <p className="text-[15px] text-gray-400">
              Painel ao vivo
            </p>
          </div>
        </div>

        {/* DIREITA */}
        <div className="text-[15px] text-gray-400 text-right leading-tight">
          Desenvolvido por{" "}
          <span className="font-semibold text-white text-base">
            R2CodeX
          </span>
        </div>

      </div>
    </div>
  )
}