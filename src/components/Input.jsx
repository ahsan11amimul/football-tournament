import { forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Input = forwardRef(({ label, error, className, ...props }, ref) => {
  return (
    <div className="w-full space-y-2">
      {label && (
        <label 
          className="block text-sm font-medium ml-1 transition-colors duration-300" 
          style={{ color: 'var(--text-muted)' }}
        >
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={twMerge(
          'premium-input w-full transition-all duration-300',
          error && 'border-red-500 focus:ring-red-500/20 focus:border-red-500',
          className
        )}
        {...props}
      />
      {error && (
        <p className="text-xs text-red-500 ml-1">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
