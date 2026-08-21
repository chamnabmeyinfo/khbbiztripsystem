import React from 'react';

export type ButtonVariant = 
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'danger'
  | 'emerald'
  | 'amber'
  | 'sky'
  | 'navy';

export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'icon' | 'pill';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isLoading?: boolean;
  fullWidth?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white shadow-sm hover:shadow border border-transparent',
  secondary: 'bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 border border-slate-200',
  outline: 'bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 border border-slate-300 shadow-2xs',
  ghost: 'bg-transparent hover:bg-slate-100 active:bg-slate-200 text-slate-600 hover:text-slate-900 border border-transparent',
  danger: 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white shadow-sm border border-transparent',
  emerald: 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-sm border border-transparent',
  amber: 'bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-900 font-semibold shadow-sm border border-transparent',
  sky: 'bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white shadow-sm border border-transparent',
  navy: 'bg-[#0f172a] hover:bg-[#1e293b] active:bg-[#020617] text-white shadow-sm border border-transparent',
};

const sizeStyles: Record<ButtonSize, string> = {
  xs: 'h-7 px-2.5 text-xs gap-1.5 rounded-md',
  sm: 'h-8.5 px-3 text-xs md:text-sm gap-2 rounded-lg',
  md: 'h-10 px-4 text-sm gap-2 rounded-lg font-medium',
  lg: 'h-12 px-5 text-base gap-2.5 rounded-xl font-medium',
  icon: 'h-9 w-9 p-0 rounded-lg justify-center',
  pill: 'h-7 px-3 text-xs gap-1.5 rounded-full font-semibold uppercase tracking-wider',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'primary',
  size = 'md',
  leftIcon,
  rightIcon,
  isLoading = false,
  fullWidth = false,
  className = '',
  disabled,
  children,
  type = 'button',
  ...props
}, ref) => {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || isLoading}
      className={`
        btn-unified
        inline-flex items-center justify-center
        font-medium transition-all duration-150 ease-in-out
        select-none whitespace-nowrap outline-none
        focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {isLoading ? (
        <span className="btn-spinner inline-flex items-center justify-center shrink-0">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </span>
      ) : leftIcon ? (
        <span className="btn-icon-wrapper btn-icon-left inline-flex items-center justify-center shrink-0 leading-none">
          {leftIcon}
        </span>
      ) : null}

      {children ? (
        <span className="btn-label inline-flex items-center justify-center leading-none">
          {children}
        </span>
      ) : null}

      {!isLoading && rightIcon ? (
        <span className="btn-icon-wrapper btn-icon-right inline-flex items-center justify-center shrink-0 leading-none">
          {rightIcon}
        </span>
      ) : null}
    </button>
  );
});

Button.displayName = 'Button';
export default Button;
