type Props = {
  children: React.ReactNode
}

export default function AuthCard({ children }: Props) {
  return (
    <div className="w-full max-w-sm p-6 rounded-2xl 
      bg-gradient-to-br from-gray-800 to-gray-900
      border border-gray-700
      shadow-[0_10px_30px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.05)]">
      {children}
    </div>
  )
}