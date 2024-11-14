interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  brutal?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  brutal = true,
  className = '',
  children,
  ...props
}: ButtonProps) {
  const baseStyles = 'font-bold transition-all duration-200 inline-flex items-center justify-center';

  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-hover',
    secondary: 'bg-secondary text-white hover:bg-secondary-hover',
    outline: 'border-2 border-neutral-900 hover:bg-neutral-100',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const brutalStyles = brutal
    ? 'border-2 border-black shadow-brutal hover:shadow-brutalHover hover:translate-x-[-2px] hover:translate-y-[-2px]'
    : '';

  return (
    <button
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${sizes[size]}
        ${brutalStyles}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}
