import { ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  children: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled,
  className = '',
  children,
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 ease-out disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variants = {
    primary: 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-md hover:shadow-lg focus:ring-orange-500',
    secondary: 'bg-white border-2 border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 focus:ring-slate-500',
    danger: 'bg-red-500 hover:bg-red-600 text-white shadow-md hover:shadow-lg focus:ring-red-500',
    ghost: 'bg-transparent text-slate-700 hover:bg-slate-100 focus:ring-slate-500',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm rounded-xl',
    md: 'px-4 py-2.5 text-base rounded-xl',
    lg: 'px-6 py-3 text-lg rounded-xl',
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`}
      disabled={disabled || loading}
      dir="rtl"
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
}

