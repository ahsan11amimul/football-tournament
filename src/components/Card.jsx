import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function Card({ className, children, hover = true, ...props }) {
  return (
    <div 
      className={twMerge(
        'glass-card p-6',
        hover && 'glass-card-hover',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, title, subtitle }) {
  return (
    <div className={twMerge('mb-6', className)}>
      {title && <h3 className="text-xl font-bold transition-colors duration-300" style={{ color: 'var(--text-color)' }}>{title}</h3>}
      {subtitle && <p className="text-sm mt-1 transition-colors duration-300" style={{ color: 'var(--text-muted)' }}>{subtitle}</p>}
      {children}
    </div>
  );
}
