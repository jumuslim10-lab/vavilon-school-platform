import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all duration-200 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        default: "bg-[rgb(var(--color-accent))] text-white hover:bg-[rgb(var(--color-accent-hover))] shadow-sm hover:shadow-md",
        secondary: "bg-[rgb(var(--color-surface-hover))] text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-border))] border border-[rgb(var(--color-border))]",
        success: "bg-[rgb(var(--color-success))] text-white hover:opacity-90 shadow-sm",
        destructive: "bg-[rgb(var(--color-error))] text-white hover:opacity-90 shadow-sm",
        outline: "border border-[rgb(var(--color-border))] bg-transparent hover:bg-[rgb(var(--color-surface-hover))]",
        ghost: "hover:bg-[rgb(var(--color-surface-hover))] text-[rgb(var(--color-text-secondary))]",
        link: "text-[rgb(var(--color-accent))] underline-offset-4 hover:underline p-0",
      },
      size: {
        default: "h-10 px-4 py-2 text-sm rounded-[var(--radius-md)]",
        sm: "h-8 px-3 text-xs rounded-[var(--radius-sm)]",
        lg: "h-12 px-6 text-base rounded-[var(--radius-md)]",
        icon: "h-10 w-10 rounded-[var(--radius-md)]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
