import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva('inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium', {
  variants: {
    variant: { default: 'bg-gray-100 text-gray-800', primary: 'bg-primary/10 text-primary', success: 'bg-emerald-100 text-emerald-700', warning: 'bg-amber-100 text-amber-700', danger: 'bg-red-100 text-red-700', info: 'bg-blue-100 text-blue-700' },
    size: { default: 'text-sm px-3 py-1', sm: 'text-xs px-2 py-0.5', lg: 'text-base px-4 py-1.5' },
  },
  defaultVariants: { variant: 'default', size: 'default' },
})

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}
function Badge({ className, variant, size, ...props }: BadgeProps) { return <span className={cn(badgeVariants({ variant, size }), className)} {...props} /> }
export { Badge, badgeVariants }
