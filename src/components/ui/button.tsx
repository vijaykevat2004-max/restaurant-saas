'use client'
import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

const buttonVariants = cva('inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 disabled:opacity-50 active:scale-[0.98]', {
  variants: {
    variant: { default: 'bg-primary text-white hover:bg-primary-dark', secondary: 'bg-white text-secondary border-2 border-secondary hover:bg-gray-50', ghost: 'text-gray-600 hover:bg-gray-100', danger: 'bg-danger text-white hover:bg-red-600', outline: 'border-2 border-gray-300 text-gray-700 hover:bg-gray-50' },
    size: { default: 'h-14 px-6 text-base rounded', sm: 'h-10 px-4 text-sm rounded-sm', lg: 'h-16 px-8 text-lg rounded-lg', icon: 'h-12 w-12 rounded-full' },
  },
  defaultVariants: { variant: 'default', size: 'default' },
})

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> { isLoading?: boolean }
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, isLoading, children, disabled, ...props }, ref) => (
  <button className={cn(buttonVariants({ variant, size, className }))} ref={ref} disabled={disabled || isLoading} {...props}>
    {isLoading && <Loader2 className="h-5 w-5 animate-spin" />}
    {children}
  </button>
))
Button.displayName = 'Button'
export { Button, buttonVariants }
