import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Loader2 } from 'lucide-react';

export function Button({ 
  className, 
  variant = 'primary', 
  size = 'md', 
  loading = false, 
  children, 
  disabled, 
  ...props 
}) {
  const baseStyles = 'premium-button inline-flex items-center justify-center gap-2';
  
  const variants = {
    primary: 'bg-primary text-white hover:opacity-90 hover:shadow-lg hover:shadow-primary/30',
    secondary: 'bg-slate-800 dark:bg-white/10 text-white hover:bg-slate-700 dark:hover:bg-white/20',
    outline: 'border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-[var(--text-color)]',
    ghost: 'hover:bg-slate-100 dark:hover:bg-white/5 text-[var(--text-color)]',
    danger: 'bg-red-500 text-white hover:bg-red-600 hover:shadow-lg hover:shadow-red-500/30',
    accent: 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/30',
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-6 py-2.5',
    lg: 'px-8 py-3.5 text-lg',
  };

  return (
    <button
      className={twMerge(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
}
