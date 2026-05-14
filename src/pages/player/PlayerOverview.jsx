import { motion } from 'framer-motion';
import { 
  DollarSign, 
  Users, 
  Calendar, 
  Trophy, 
  TrendingUp,
  CreditCard,
  ChevronRight,
  Shirt
} from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';
import { Card, CardHeader } from '../../components/Card';
import { Button } from '../../components/Button';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { translations } from '../../utils/translations';

export default function PlayerOverview() {
  const { profile, language } = useAuthStore();
  const t = translations[language];
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });
  const [liveStats, setLiveStats] = useState({
    totalPlayers: 0,
    nextMatch: 'Today, 8 PM'
  });

  useEffect(() => {
    const targetDate = new Date('2026-06-15T20:00:00'); // Example kickoff date
    
    const timer = setInterval(() => {
      const now = new Date();
      const difference = targetDate - now;
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          mins: Math.floor((difference / 1000 / 60) % 60),
          secs: Math.floor((difference / 1000) % 60)
        });
      }
    }, 1000);

    const q = query(collection(db, 'users'), where('role', '==', 'player'));
    const unsub = onSnapshot(q, (snap) => {
      setLiveStats(prev => ({ ...prev, totalPlayers: snap.size }));
    });

    return () => {
      clearInterval(timer);
      unsub();
    };
  }, []);

  const stats = [
    { label: t.paid, value: `৳${profile?.paidAmount || 0}`, icon: DollarSign, color: 'text-green-400', bg: 'bg-green-400/10' },
    { label: t.jerseyNumber, value: profile?.jerseyNumber || '-', icon: Trophy, color: 'text-primary', bg: 'bg-primary/10' },
    { label: t.registeredPlayers, value: liveStats.totalPlayers, icon: Users, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { label: t.nextMatch, value: liveStats.nextMatch, icon: Calendar, color: 'text-orange-400', bg: 'bg-orange-400/10' },
  ];  return (
    <div className="space-y-6 lg:space-y-10 pb-12">
      {/* Premium Stadium Banner with Logo */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[2rem] lg:rounded-[3rem] p-6 md:p-10 lg:p-14 text-white shadow-2xl shadow-primary/20 min-h-[300px] lg:min-h-[400px] flex items-center"
      >
        {/* Background Image Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 hover:scale-105"
          style={{ backgroundImage: 'url("/assets/banner.png")' }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/95 via-black/60 to-transparent" />
        
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between w-full gap-8 lg:gap-10">
          <div className="flex flex-col md:flex-row items-center gap-6 lg:gap-10 text-center md:text-left">
             {/* Logo */}
             <div className="w-28 h-28 md:w-36 md:h-36 lg:w-44 lg:h-44 bg-white/10 backdrop-blur-2xl rounded-[2rem] p-4 border border-white/20 shadow-2xl shrink-0">
                <img src="/assets/logo.png" alt="Logo" className="w-full h-full object-contain" />
             </div>
             
             <div className="max-w-xl">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
                  <span className="flex h-2.5 w-2.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
                  </span>
                  <span className="text-[10px] lg:text-[11px] font-black uppercase tracking-[0.4em] text-primary-light">{t.kickoff}</span>
                </div>
                <h2 className={`font-black italic uppercase tracking-tighter leading-[0.9] drop-shadow-2xl ${language === 'bn' ? 'text-4xl md:text-6xl mb-3' : 'text-4xl md:text-7xl'}`}>
                  {t.tournamentName}
                </h2>
                <div className="flex items-center justify-center md:justify-start gap-3 mt-5">
                  <span className="w-8 lg:w-12 h-0.5 bg-primary/50" />
                  <p className="text-white font-black tracking-[0.2em] uppercase text-xs lg:text-base italic opacity-90">
                    {t.sponsor}
                  </p>
                  <span className="w-8 lg:w-12 h-0.5 bg-primary/50" />
                </div>
             </div>
          </div>

          {/* Countdown Timer */}
          <div className="flex gap-4 md:gap-8 bg-black/60 backdrop-blur-3xl p-5 lg:p-8 rounded-[2.5rem] border border-white/10 shadow-2xl w-full lg:w-auto justify-around">
            {[
              { label: t.days, value: timeLeft.days },
              { label: t.hours, value: timeLeft.hours },
              { label: t.mins, value: timeLeft.mins },
              { label: t.secs, value: timeLeft.secs }
            ].map((unit, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl md:text-5xl font-black mb-1 tabular-nums tracking-tighter text-white">{String(unit.value).padStart(2, '0')}</div>
                <div className="text-[7px] md:text-[10px] font-black uppercase opacity-60 tracking-[0.3em] text-white/80">{unit.label}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        <div className="lg:col-span-8 space-y-8 lg:space-y-12">
          {/* Welcome & Stats */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
            <div>
              <h1 className="text-3xl lg:text-4xl font-black italic uppercase tracking-tight" style={{ color: 'var(--text-color)' }}>
                {t.welcome}, {profile?.fullName.split(' ')[0]} 👋
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-2 font-bold uppercase tracking-widest text-[10px] lg:text-xs opacity-70">{t.readyForMatches}</p>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/dashboard/payments" className="w-full md:w-auto">
                <Button variant="primary" className="w-full md:w-auto h-12 lg:h-14 px-8 lg:px-10 shadow-xl shadow-primary/30 text-[11px] font-black uppercase tracking-[0.2em]">
                  <CreditCard className="w-4 h-4" />
                  {t.payNow}
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8">
            {stats.map((stat, idx) => (
              <Card key={idx} className="flex items-center gap-6 p-8 border-slate-200 dark:border-white/5 hover:translate-y-[-8px] transition-all duration-500 group shadow-2xl shadow-black/5 dark:shadow-black/20">
                <div className={`w-16 h-16 lg:w-20 lg:h-20 rounded-[1.5rem] lg:rounded-[2rem] ${stat.bg} flex items-center justify-center transition-transform group-hover:rotate-12`}>
                  <stat.icon className={`w-8 h-8 lg:w-10 lg:h-10 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-slate-500 dark:text-slate-400 text-[10px] lg:text-xs font-black uppercase tracking-[0.2em]">{stat.label}</p>
                  <p className="text-3xl lg:text-4xl font-black mt-2 italic" style={{ color: 'var(--text-color)' }}>{stat.value}</p>
                </div>
              </Card>
            ))}
          </div>

          {/* Official Kit Spotlight */}
          <Card className="overflow-hidden p-0 border-slate-200 dark:border-white/5 group shadow-2xl">
             <div className="flex flex-col md:flex-row">
                <div className="md:w-1/2 p-8 lg:p-12 flex flex-col justify-center space-y-6">
                   <div className="flex items-center gap-3 text-primary">
                      <Shirt className="w-6 h-6" />
                      <span className="text-[10px] font-black uppercase tracking-[0.3em]">Official Season Kit</span>
                   </div>
                   <h3 className="text-4xl lg:text-5xl font-black italic uppercase tracking-tight leading-none" style={{ color: 'var(--text-color)' }}>
                      Home Kit<br/>2024/25
                   </h3>
                   <p className="text-slate-500 dark:text-slate-400 text-sm lg:text-base leading-relaxed font-medium">
                      Designed for peak performance. Featuring premium breathable fabric and the official TBPL crest.
                   </p>
                   <div className="pt-4 flex gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-[#C8102E] shadow-xl border-4 border-white/10" />
                      <div className="w-10 h-10 rounded-2xl bg-[#003366] shadow-xl border-4 border-white/10" />
                   </div>
                </div>
                <div className="md:w-1/2 aspect-square md:aspect-auto relative bg-slate-100 dark:bg-white/5 overflow-hidden">
                   <img 
                    src="/assets/kit.png" 
                    alt="Official Kit" 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                   />
                </div>
             </div>
          </Card>
        </div>

        {/* Sidebar Sections */}
        <div className="lg:col-span-4 space-y-8 lg:space-y-12">
           {/* Payment History */}
           <Card className="relative overflow-hidden border-slate-200 dark:border-white/5 shadow-2xl p-8 lg:p-10">
             <div className="absolute -top-6 -right-6 p-4 opacity-5 pointer-events-none">
                <Trophy className="w-48 h-48" />
             </div>
              <CardHeader title="Payment Progress" subtitle="Contribution towards registration" />
              <div className="flex flex-col items-center justify-center py-10">
                <div className="relative w-48 h-48 mb-8 group">
                  <svg className="w-full h-full transform -rotate-90 drop-shadow-2xl">
                    <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-100 dark:text-slate-800" />
                    <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray="552.9" strokeDashoffset={552.9 * (1 - (profile?.paidAmount / 1500))} className="text-primary transition-all duration-1000" strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center transition-transform duration-500 group-hover:scale-110">
                    <span className="text-4xl font-black italic" style={{ color: 'var(--text-color)' }}>
                      {Math.round((profile?.paidAmount / 1500) * 100)}%
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest mt-1">Paid</span>
                  </div>
                </div>
                <div className="w-full space-y-5">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Goal</span>
                    <span className="text-lg font-black italic" style={{ color: 'var(--text-color)' }}>৳1500</span>
                  </div>
                  <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                     <div className="h-full bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.3)]" style={{ width: `${Math.min((profile?.paidAmount / 1500) * 100, 100)}%` }} />
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Collected</span>
                    <span className="text-lg font-black italic text-green-500">৳{profile?.paidAmount || 0}</span>
                  </div>
                </div>
              </div>
              <Link to="/dashboard/payments">
                <Button variant="outline" className="w-full mt-6 h-12 text-[10px] font-black uppercase tracking-[0.2em] border-slate-200 dark:border-white/10 hover:bg-primary hover:text-white hover:border-primary">
                  Make Payment
                </Button>
              </Link>
           </Card>

           {/* Schedule Mini */}
           <Card className="border-slate-200 dark:border-white/5 shadow-2xl p-8">
              <CardHeader title="Next Match" subtitle="Upcoming tournament fixture" />
              <div className="mt-6 p-6 rounded-[2rem] bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 shadow-inner">
                 <div className="flex items-center justify-between mb-6">
                    <span className="px-3 py-1 bg-primary text-white text-[9px] font-black uppercase tracking-widest rounded-lg shadow-lg shadow-primary/20">Tonight</span>
                    <span className="text-[10px] font-black text-slate-500 tracking-[0.1em]">08:00 PM</span>
                 </div>
                 <div className="flex items-center justify-between gap-6">
                    <div className="text-center flex-1">
                       <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-white dark:bg-slate-900 p-2 shadow-lg border border-slate-200 dark:border-white/5 transition-transform hover:scale-110">
                          <img src="https://api.dicebear.com/7.x/identicon/svg?seed=A" alt="" className="w-full h-full object-contain" />
                       </div>
                       <p className="text-[10px] font-black uppercase truncate tracking-tighter" style={{ color: 'var(--text-color)' }}>Warriors</p>
                    </div>
                    <span className="text-sm font-black text-slate-300 dark:text-slate-700 italic mt-4">VS</span>
                    <div className="text-center flex-1">
                       <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-white dark:bg-slate-900 p-2 shadow-lg border border-slate-200 dark:border-white/5 transition-transform hover:scale-110">
                          <img src="https://api.dicebear.com/7.x/identicon/svg?seed=B" alt="" className="w-full h-full object-contain" />
                       </div>
                       <p className="text-[10px] font-black uppercase truncate tracking-tighter" style={{ color: 'var(--text-color)' }}>Lightning</p>
                    </div>
                 </div>
              </div>
           </Card>
        </div>
      </div>

    </div>
  );
}
