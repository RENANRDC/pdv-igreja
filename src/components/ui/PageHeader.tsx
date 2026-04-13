import BackButton from "@/components/ui/BackButton"

type Props = {
  title: string
  href?: string
  right?: React.ReactNode
}

export default function PageHeader({ title, href, right }: Props) {
  return (
    <div className="grid grid-cols-3 items-center mb-6">

      <div className="flex justify-start">
        {href && <BackButton href={href} />}
      </div>

      <div className="flex justify-center">
        <h1 className="text-2xl font-bold">
          {title}
        </h1>
      </div>

      <div className="flex justify-end">
        {right}
      </div>

    </div>
  )
}