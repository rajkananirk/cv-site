import { useToast } from "./use-toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <div className="fixed top-0 right-0 z-50 w-full md:max-w-[420px] p-4 flex flex-col gap-2">
      {toasts.map(({ id, title, description }) => (
        <div key={id} className="bg-white shadow-lg rounded-lg p-4 border">
          {title && <div className="font-semibold">{title}</div>}
          {description && <div className="text-sm">{description}</div>}
        </div>
      ))}
    </div>
  )
} 