import * as React from 'react'
import { cn } from '@/lib/utils'

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'glass' | 'success' | 'warning' | 'premium'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', loading, children, disabled, ...props }, ref) => {
    const variants = {
      default: 'bg-gradient-to-r from-gray-400 via-gray-500 to-gray-600 hover:from-gray-500 hover:via-gray-600 hover:to-gray-700 text-white shadow-lg hover:shadow-xl border border-gray-300',
      secondary: 'bg-gradient-to-r from-gray-300 via-gray-400 to-gray-500 hover:from-gray-400 hover:via-gray-500 hover:to-gray-600 text-gray-800 shadow-lg hover:shadow-xl border border-gray-200',
      outline: 'border-2 bg-gradient-to-r from-transparent to-transparent hover:from-gray-50 hover:to-gray-100 border-gradient-silver text-gray-700 hover:text-gray-800 shadow-sm hover:shadow-md',
      ghost: 'bg-gradient-to-r from-transparent to-transparent hover:from-gray-100 hover:to-gray-200 text-gray-600 hover:text-gray-700',
      danger: 'bg-gradient-to-r from-red-400 via-red-500 to-red-600 hover:from-red-500 hover:via-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl border border-red-300',
      glass: 'bg-gradient-to-r from-white/30 via-white/40 to-white/30 hover:from-white/40 hover:via-white/50 hover:to-white/40 backdrop-blur-md border border-white/40 hover:border-white/50 text-gray-700 shadow-lg',
      success: 'bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 hover:from-emerald-500 hover:via-emerald-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl border border-emerald-300',
      warning: 'bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-500 hover:via-amber-600 hover:to-amber-700 text-white shadow-lg hover:shadow-xl border border-amber-300',
      premium: 'bg-gradient-metal-chrome hover:bg-gradient-metal-platinum text-gray-800 shadow-xl hover:shadow-2xl border border-gray-200 hover:border-gray-300',
    }

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2',
      lg: 'px-6 py-3 text-lg',
    }

    return (
      <button
        className={cn(
          'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden',
          'hover:scale-105 hover:shadow-xl transform-gpu',
          'before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent before:translate-x-[-200%] hover:before:translate-x-[200%] before:transition-transform before:duration-700',
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button } 