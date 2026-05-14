import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(() => {
    // Default to light mode (false) unless explicitly saved as dark
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  return (
    <button
      onClick={() => setIsDark(!isDark)}
      className="p-2.5 rounded-xl transition-all group overflow-hidden relative border"
      style={{ backgroundColor: 'var(--surface-color)', borderColor: 'var(--border-color)' }}
      aria-label="Toggle Theme"
    >
      <div className="flex flex-col items-center">
        <motion.div
          initial={false}
          animate={{ y: isDark ? 0 : 40 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <Moon className="w-5 h-5 text-blue-400" />
        </motion.div>
        <motion.div
          initial={false}
          animate={{ y: isDark ? -40 : -20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        >
          <Sun className="w-5 h-5 text-orange-500" />
        </motion.div>
      </div>
    </button>
  );
}
