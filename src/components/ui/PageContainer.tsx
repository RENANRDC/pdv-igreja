export default function PageContainer({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-[100dvh] bg-gray-900 text-white p-6">
      {children}
    </div>
  )
}