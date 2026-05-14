import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import useBrandingStore from '../store/useBrandingStore';

export default function AuthLayout({ children, title, subtitle }) {
  const { branding } = useBrandingStore();
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden" style={{ backgroundColor: 'var(--bg-color)' }}>
      {/* Background Pattern */}
      <div className="absolute inset-0 dashboard-bg-pattern opacity-50 pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-lg shadow-black/5 mb-4 overflow-hidden border border-slate-200 dark:border-white/5">
            {branding.logoUrl ? (
              <img src={branding.logoUrl} alt="Logo" className="w-full h-full object-contain p-2" />
            ) : (
              <Trophy className="text-primary w-8 h-8" />
            )}
          </div>
          <h1 className="text-3xl font-bold text-center" style={{ color: 'var(--text-color)' }}>{title}</h1>
          {subtitle && <p className="text-slate-500 dark:text-slate-400 mt-2 text-center font-medium">{subtitle}</p>}
        </div>
        
        <div className="glass-card p-8 border-slate-200 dark:border-white/5">
          {children}
        </div>
        
        <p className="mt-8 text-center text-slate-500 text-sm font-medium">
          © 2026 TBPL Tournament. All rights reserved.
        </p>
      </motion.div>
    </div>

  );
}
