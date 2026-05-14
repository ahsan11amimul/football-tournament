import { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  Menu, 
  X, 
  LogOut, 
  Bell, 
  Search,
  ChevronRight,
  User
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '../store/useAuthStore';
import { logoutUser } from '../features/auth/authService';
import { Button } from '../components/Button';
import ThemeToggle from '../components/ThemeToggle';
import LanguageToggle from '../components/LanguageToggle';
import { translations } from '../utils/translations';
import useBrandingStore from '../store/useBrandingStore';

export default function DashboardLayout({ children, menuItems, variant = 'player' }) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const { profile, setProfile, setUser, language } = useAuthStore();
  const { branding } = useBrandingStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
    setProfile(null);
    navigate('/login');
  };

  const patternStyle = variant === 'admin' 
    ? 'var(--admin-pattern)' 
    : 'var(--player-pattern)';

  return (
    <div className="min-h-screen flex transition-colors duration-300" style={{ backgroundColor: 'var(--bg-color)' }}>
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside 
        className={`fixed lg:static inset-y-0 left-0 w-72 z-50 transform transition-transform duration-300 lg:transform-none border-r ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ backgroundColor: 'var(--sidebar-bg)', borderColor: 'var(--border-color)' }}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b" style={{ borderColor: 'var(--border-color)' }}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 p-1 flex items-center justify-center shrink-0 border border-slate-200 dark:border-white/5 overflow-hidden">
                {branding.logoUrl ? (
                  <img src={branding.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                ) : (
                  <img src="/assets/logo.png" alt="Logo" className="w-full h-full object-contain" />
                )}
              </div>
              <div className="min-w-0">
                <h1 className="text-sm font-black italic tracking-tighter text-gradient leading-tight uppercase">
                  {branding.tournamentName || translations[language].tournamentName}
                </h1>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mt-1">
                   {branding.sponsorName || translations[language].sponsor}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/admin' || item.path === '/dashboard'}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) => `
                  flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 group
                  ${isActive 
                    ? 'bg-primary text-white shadow-xl shadow-primary/30 font-bold' 
                    : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-primary dark:hover:text-primary'}
                `}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={`w-5 h-5 transition-transform group-hover:scale-110`} />
                  <span className="text-sm font-bold uppercase tracking-widest">{item.label}</span>
                </div>
                {location.pathname === item.path && (
                  <motion.div layoutId="activeNav" className="w-1.5 h-1.5 rounded-full bg-white shadow-sm" />
                )}
              </NavLink>
            ))}
          </nav>

          {/* User Section */}
          <div className="p-6 border-t" style={{ borderColor: 'var(--border-color)' }}>
            <div className="flex items-center gap-3 p-3 rounded-[1.5rem] bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 shadow-inner">
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/20 shadow-lg">
                <img 
                   src={profile?.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${profile?.fullName}`} 
                  alt="Avatar" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black truncate uppercase tracking-tight" style={{ color: 'var(--text-color)' }}>{profile?.fullName}</p>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-0.5">{profile?.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="mt-6 flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl text-slate-500 hover:text-red-500 hover:bg-red-500/10 transition-all font-black text-[10px] uppercase tracking-[0.2em] border border-transparent hover:border-red-500/20"
            >
              <LogOut className="w-4 h-4" />
              {translations[useAuthStore.getState().language].logout}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Background Pattern */}
        <div 
          className="absolute inset-0 opacity-40 pointer-events-none transition-all duration-500" 
          style={{ 
            backgroundImage: patternStyle,
            backgroundSize: variant === 'admin' ? '40px 40px' : '24px 24px'
          }} 
        />

        {/* Header */}
        <header className="h-20 lg:h-24 border-b z-30 transition-colors duration-300 relative" style={{ backgroundColor: 'var(--sidebar-bg)', borderColor: 'var(--border-color)' }}>
          <div className="h-full px-4 lg:px-10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setSidebarOpen(true)}
                className="p-3 lg:hidden bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl shadow-sm transition-all active:scale-90"
                style={{ color: 'var(--text-color)' }}
              >
                <Menu className="w-6 h-6" />
              </button>
              <div className="hidden md:flex items-center gap-3 px-5 py-3 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl text-slate-400 focus-within:border-primary/40 focus-within:bg-transparent transition-all shadow-inner group">
                <Search className="w-4 h-4 group-focus-within:text-primary transition-colors" />
                <input type="text" placeholder="Quick search..." className="bg-transparent border-none text-[11px] font-bold uppercase tracking-widest focus:ring-0 w-64 placeholder:text-slate-500" />
              </div>
            </div>

            <div className="flex items-center gap-2 lg:gap-5">
              <div className="flex items-center bg-slate-100 dark:bg-white/5 rounded-2xl p-1 gap-1 border border-slate-200 dark:border-white/5">
                <LanguageToggle />
                <ThemeToggle />
              </div>
              <button className="p-3 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl relative transition-all hover:scale-105 active:scale-95 shadow-sm group">
                <Bell className="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors" />
                <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-900 shadow-lg animate-pulse" />
              </button>
              <div className="hidden sm:block w-px h-8 bg-slate-200 dark:bg-white/10 mx-1" />
              <div className="hidden sm:flex items-center gap-3 pl-2">
                <div className="hidden text-right lg:block">
                  <p className="text-xs font-black italic uppercase tracking-tighter" style={{ color: 'var(--text-color)' }}>{profile?.fullName}</p>
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">#{profile?.jerseyNumber}</p>
                </div>
                <div className="w-11 h-11 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center border border-slate-200 dark:border-white/5 overflow-hidden shadow-lg group">
                  <img src={profile?.avatarUrl} alt="" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-10 custom-scrollbar relative z-10 pb-28 lg:pb-10">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border-t border-slate-200 dark:border-white/5 flex items-center justify-around px-4 z-40 lg:hidden shadow-[0_-10px_30px_rgba(0,0,0,0.1)]">
          {menuItems.slice(0, 4).map((item) => {
             const isActive = location.pathname === item.path || (item.path !== '/admin' && item.path !== '/dashboard' && location.pathname.startsWith(item.path));
             return (
               <NavLink
                 key={item.path}
                 to={item.path}
                 className={`flex flex-col items-center gap-1.5 px-3 py-1.5 rounded-2xl transition-all duration-300 ${isActive ? 'text-primary scale-110' : 'text-slate-500'}`}
               >
                 <item.icon className={`w-5 h-5 ${isActive ? 'fill-primary/10' : ''}`} />
                 <span className="text-[8px] font-black uppercase tracking-widest">{item.label}</span>
                 {isActive && (
                   <motion.div layoutId="bottomNavDot" className="w-1 h-1 rounded-full bg-primary" />
                 )}
               </NavLink>
             );
          })}
          <button 
            onClick={() => setSidebarOpen(true)}
            className="flex flex-col items-center gap-1.5 px-3 py-1.5 text-slate-500"
          >
            <Menu className="w-5 h-5" />
            <span className="text-[8px] font-black uppercase tracking-widest">More</span>
          </button>
        </nav>
      </div>
    </div>


  );
}
