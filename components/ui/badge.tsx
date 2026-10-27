import * as React from "react"
import { cn } from "@/lib/utils"

const Badge = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: "default" | "success" | "warning" | "error" | "info" | "outline"
  }
>(({ className, variant = "default", ...props }, ref) => {
  const variantClasses = {
    default: "bg-[rgb(var(--color-border))] text-[rgb(var(--color-text-primary))]",
    success: "bg-[rgb(var(--color-success-light))] text-[rgb(var(--color-success))] border border-[rgb(var(--color-success))]/20",
    warning: "bg-[rgb(var(--color-warning-light))] text-[rgb(var(--color-warning))] border border-[rgb(var(--color-warning))]/20",
    error: "bg-[rgb(var(--color-error-light))] text-[rgb(var(--color-error))] border border-[rgb(var(--color-error))]/20",
    info: "bg-[rgb(var(--color-accent-light))] text-[rgb(var(--color-accent))] border border-[rgb(var(--color-accent))]/20",
    outline: "border border-[rgb(var(--color-border))] text-[rgb(var(--color-text-secondary))] bg-transparent",
  }

  return (
    <div
      ref={ref}
      className={cn(
        "inline-flex items-center rounded-[var(--radius-full)] px-2.5 py-0.5 text-[var(--font-size-xs)] font-medium transition-colors duration-200",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  )
})
Badge.displayName = "Badge"

export { Badge }
