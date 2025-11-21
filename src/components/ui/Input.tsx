import { InputHTMLAttributes, ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export function Input({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  className = '',
  ...props
}: InputProps) {
  const inputClasses = `
    w-full px-4 py-3 rounded-xl border bg-white
    text-right
    transition-all duration-150 ease-out
    focus:outline-none focus:ring-2 focus:ring-offset-0
    disabled:bg-slate-50 disabled:cursor-not-allowed
    ${error 
      ? 'border-red-300 focus:border-red-500 focus:ring-red-100' 
      : 'border-slate-200 focus:border-orange-500 focus:ring-orange-100'
    }
    ${leftIcon || rightIcon ? 'pl-10' : ''}
    ${className}
  `;

  return (
    <div className="space-y-2" dir="rtl">
      {label && (
        <label className="block text-sm font-medium text-slate-700 text-right">
          {label}
          {props.required && <span className="text-red-500 mr-1">*</span>}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
            {leftIcon}
          </div>
        )}
        <input
          className={inputClasses}
          dir="rtl"
          {...props}
        />
        {rightIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            {rightIcon}
          </div>
        )}
      </div>
      {error && (
        <p className="text-sm text-red-600 text-right">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-sm text-slate-500 text-right">{helperText}</p>
      )}
    </div>
  );
}

