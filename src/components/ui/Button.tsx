import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-colors';
    const focusStyles = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2';
    const disabledStyles = 'disabled:opacity-50 disabled:pointer-events-none';

    const variantStyles = {
      primary: 'bg-primary text-white hover:bg-primary/90',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
      ghost: 'hover:bg-accent hover:text-accent-foreground',
    };

    const sizeStyles = {
      sm: 'h-9 px-3 text-sm',
      md: 'h-10 px-4 py-2',
      lg: 'h-11 px-8',
    };

    return (
      <button
        className={cn(
          baseStyles,
          focusStyles,
          disabledStyles,
          variantStyles[variant],
          sizeStyles[size],
          className || ''
        )}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <span className="mr-2">
            <span className="sr-only">Loading</span>
            {/* Add your loading spinner component here */}
          </span>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
