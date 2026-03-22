import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> { label?: string; error?: string; icon?: React.ReactNode }
const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, label, error, icon, ...props }, ref) => (
  <div className="w-full">
    {label && <label className="mb-2 block text-sm font-medium text-gray-700">{label}</label>}
    <div className="relative">
      {icon && <div className="absolute inset-y-0 left-0 flex items-center pl-4">{icon}</div>}
      <input type={type} className={cn('flex h-14 w-full rounded border border-gray-300 bg-white px-4 text-base focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:bg-gray-50', error && 'border-danger', icon && 'pl-12', className)} ref={ref} {...props} />
    </div>
    {error && <p className="mt-2 text-sm text-danger">{error}</p>}
  </div>
))
Input.displayName = 'Input'
export { Input }
