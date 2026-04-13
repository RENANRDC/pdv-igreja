export default function Footer() {
  return (
    <footer className="
      fixed bottom-0 left-0 w-full z-50 pb-safe
      
      bg-gradient-to-t from-gray-900 to-gray-800
      border-t border-gray-700

      shadow-[0_-4px_20px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.05)]
    ">

      <div className="max-w-md mx-auto h-14 flex items-center justify-center text-xs text-gray-400">

        <span className="opacity-80">
          Desenvolvido por
        </span>

        <span className="
          ml-1 font-semibold text-gray-200
          hover:text-white transition
        ">
          R2CodeX
        </span>

      </div>

    </footer>
  )
}