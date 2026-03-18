import { useToast as useToastContext } from "@/components/ui/toast"

export type { Toast } from "@/components/ui/toast"

export function useToast() {
  const { addToast, removeToast, toasts } = useToastContext()

  const toast = (options: {
    title?: string
    description?: string
    variant?: "default" | "success" | "error" | "warning" | "info"
    duration?: number
  }) => {
    return addToast(options)
  }

  const success = (title: string, description?: string) => {
    return addToast({ title, description, variant: "success" })
  }

  const error = (title: string, description?: string) => {
    return addToast({ title, description, variant: "error", duration: 8000 })
  }

  const warning = (title: string, description?: string) => {
    return addToast({ title, description, variant: "warning" })
  }

  const info = (title: string, description?: string) => {
    return addToast({ title, description, variant: "info" })
  }

  const dismiss = (id: string) => {
    removeToast(id)
  }

  return {
    toast,
    success,
    error,
    warning,
    info,
    dismiss,
    toasts,
  }
}
