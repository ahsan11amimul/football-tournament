import { motion } from 'framer-motion';
import useAuthStore from '../store/useAuthStore';

export default function LanguageToggle() {
  const { language, setLanguage } = useAuthStore();

  return (
    <div className="flex p-1 bg-slate-100 dark:bg-white/5 rounded-xl border border-white/5">
      <button
        onClick={() => setLanguage('en')}
        className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${
          language === 'en' 
            ? 'bg-primary text-white shadow-sm' 
            : 'text-slate-400 hover:text-primary dark:hover:text-white'
        }`}
      >
        EN
      </button>
      <button
        onClick={() => setLanguage('bn')}
        className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${
          language === 'bn' 
            ? 'bg-primary text-white shadow-sm' 
            : 'text-slate-400 hover:text-primary dark:hover:text-white'
        }`}
      >
        বাংলা
      </button>
    </div>
  );
}
