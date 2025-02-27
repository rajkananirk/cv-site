import * as React from "react"

const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 1000000

type ToasterToast = {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
}

export function useToast() {
  const [toasts, setToasts] = React.useState<ToasterToast[]>([])

  const toast = React.useCallback(({ title, description, action }: Omit<ToasterToast, "id">) => {
    setToasts((currentToasts) => {
      const id = Math.random().toString(36).slice(2)
      return [...currentToasts, { id, title, description, action }].slice(-TOAST_LIMIT)
    })
  }, [])

  const dismiss = React.useCallback((id: string) => {
    setToasts((currentToasts) =>
      currentToasts.filter((toast) => toast.id !== id)
    )
  }, [])

  return {
    toast,
    dismiss,
    toasts,
  }
} 