import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-[var(--radius-md)] border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] px-4 py-2 text-[var(--font-size-sm)] text-[rgb(var(--color-text-primary))] transition-colors duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[rgb(var(--color-text-tertiary))] focus-visible:outline-none focus-visible:border-[rgb(var(--color-accent))] disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
