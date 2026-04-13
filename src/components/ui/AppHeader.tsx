import BackButton from "@/components/ui/BackButton"
import Button3D from "./Button3D"

type Props = {
  title?: string
  subtitle?: string
  showBack?: boolean
  onLogout?: () => void
}

export default function AppHeader({
  title,
  subtitle,
  showBack,
  onLogout
}: Props) {
  return (
    <div className="
      w-full border-b border-gray-800
      bg-gradient-to-r from-gray-900 to-gray-800
      sticky top-0 z-10
    ">
      <div className="max-w-md mx-auto flex items-center justify-between p-4">

        {/* ESQUERDA */}
        <div className="flex items-center gap-3">

          {showBack ? (
            <BackButton />
          ) : (
            <>
              <img src="/logo.png" className="h-10 w-10" />
              <div>
                <h1 className="text-base font-bold">
                  {title}
                </h1>
                {subtitle && (
                  <p className="text-xs text-gray-400">
                    {subtitle}
                  </p>
                )}
              </div>
            </>
          )}

        </div>

        {/* DIREITA */}
        {onLogout && (
          <Button3D onClick={onLogout}>
            Sair
          </Button3D>
        )}

      </div>
    </div>
  )
}