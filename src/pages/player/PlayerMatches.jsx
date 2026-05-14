import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Card } from '../../components/Card';
import { Trophy, Calendar, MapPin, Clock, ChevronRight, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, isAfter, isBefore, parseISO } from 'date-fns';

export default function PlayerMatches() {
  const [matches, setMatches] = useState([]);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'matches'), orderBy('date', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMatches(docs);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const now = new Date();
  const upcoming = matches.filter(m => {
    try {
      return isAfter(parseISO(`${m.date}T${m.time}`), now);
    } catch (e) {
      return true; // Fallback for invalid dates
    }
  });
  const results = matches.filter(m => {
    try {
      return isBefore(parseISO(`${m.date}T${m.time}`), now) || m.status === 'completed';
    } catch (e) {
      return false;
    }
  });

  const displayMatches = activeTab === 'upcoming' ? upcoming : results.reverse();

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter" style={{ color: 'var(--text-color)' }}>Match Schedule</h1>
          <p className="text-slate-500 mt-1 font-medium">Tournament fixtures and live results</p>
        </div>
        
        <div className="flex p-1 bg-slate-100 dark:bg-white/5 rounded-2xl border border-white/5">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'upcoming' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-500 hover:text-primary dark:hover:text-white'}`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setActiveTab('results')}
            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'results' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-500 hover:text-primary dark:hover:text-white'}`}
          >
            Results
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <AnimatePresence mode="wait">
          {displayMatches.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-24 glass-card"
            >
              <Calendar className="w-20 h-20 text-slate-200 dark:text-slate-800 mx-auto mb-6" />
              <h3 className="text-xl font-black italic uppercase tracking-tight" style={{ color: 'var(--text-color)' }}>No {activeTab} matches</h3>
              <p className="text-slate-500 mt-2 font-medium">Check back later for updated fixtures.</p>
            </motion.div>
          ) : (
            displayMatches.map((match, idx) => (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="hover:border-primary/20 transition-all duration-300 group">
                  <div className="flex flex-col md:flex-row items-center gap-10">
                    {/* Time & Venue */}
                    <div className="md:w-48 text-center md:text-left space-y-3">
                      <div className="flex items-center justify-center md:justify-start gap-2 text-primary font-black uppercase tracking-widest text-[10px]">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{match.date ? format(parseISO(match.date), 'EEE, MMM dd') : 'TBA'}</span>
                      </div>
                      <div className="flex items-center justify-center md:justify-start gap-2" style={{ color: 'var(--text-muted)' }}>
                        <Clock className="w-3.5 h-3.5" />
                        <span className="text-sm font-bold">{match.time}</span>
                      </div>
                      <div className="flex items-center justify-center md:justify-start gap-2 text-slate-400">
                        <MapPin className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-bold uppercase">Main Stadium</span>
                      </div>
                    </div>

                    {/* Scoreboard */}
                    <div className="flex-1 flex items-center justify-between w-full">
                      {/* Team A */}
                      <div className="flex flex-col items-center gap-3 flex-1">
                        <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-slate-50 dark:bg-white/5 border border-white/5 p-4 flex items-center justify-center transition-transform group-hover:scale-110">
                          <img src={`https://api.dicebear.com/7.x/identicon/svg?seed=${match.teamA}`} alt="" className="w-full h-full" />
                        </div>
                        <p className="font-black italic uppercase text-xs md:text-sm text-center" style={{ color: 'var(--text-color)' }}>{match.teamA}</p>
                      </div>

                      {/* VS / Score */}
                      <div className="flex flex-col items-center px-6">
                        <div className="flex items-center gap-6">
                          <span className="text-4xl md:text-5xl font-black italic" style={{ color: 'var(--text-color)' }}>{match.scoreA ?? '-'}</span>
                          <span className="text-xl font-bold text-slate-400 italic">VS</span>
                          <span className="text-4xl md:text-5xl font-black italic" style={{ color: 'var(--text-color)' }}>{match.scoreB ?? '-'}</span>
                        </div>
                        <div className={`mt-4 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] transition-all ${
                          match.status === 'live' 
                          ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 animate-pulse' 
                          : 'bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400'
                        }`}>
                          {match.status || 'Scheduled'}
                        </div>
                      </div>

                      {/* Team B */}
                      <div className="flex flex-col items-center gap-3 flex-1">
                        <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-slate-50 dark:bg-white/5 border border-white/5 p-4 flex items-center justify-center transition-transform group-hover:scale-110">
                          <img src={`https://api.dicebear.com/7.x/identicon/svg?seed=${match.teamB}`} alt="" className="w-full h-full" />
                        </div>
                        <p className="font-black italic uppercase text-xs md:text-sm text-center" style={{ color: 'var(--text-color)' }}>{match.teamB}</p>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
