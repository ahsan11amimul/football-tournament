import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Card } from '../../components/Card';
import { Search, Users, Shield, Phone, User, Star } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AllPlayers() {
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Fetch Teams for mapping
    const unsubTeams = onSnapshot(collection(db, 'teams'), (snapshot) => {
      const teamMap = {};
      snapshot.docs.forEach(doc => {
        teamMap[doc.id] = doc.data().name;
      });
      setTeams(teamMap);
    });

    // Fetch Players
    const q = query(collection(db, 'users'), where('role', '==', 'player'));
    const unsubPlayers = onSnapshot(q, (snapshot) => {
      setPlayers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    return () => {
      unsubTeams();
      unsubPlayers();
    };
  }, []);

  const filteredPlayers = players.filter(p => 
    p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.jerseyNumber?.toString().includes(searchTerm) ||
    teams[p.teamId]?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-12">
      {/* Header with Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter" style={{ color: 'var(--text-color)' }}>Tournament Roster</h1>
          <p className="text-slate-500 mt-1 font-medium">Browse players, teams, and contact details</p>
        </div>
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Search name, jersey or team..."
            className="premium-input pl-12 w-full shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Players List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredPlayers.map((player, idx) => (
          <motion.div
            key={player.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Card className="p-0 overflow-hidden group border-white/5 bg-white/[0.01]">
              {/* Avatar Header */}
              <div className="relative h-44 overflow-hidden bg-slate-100 dark:bg-white/5 flex items-center justify-center">
                <img 
                  src={player.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${player.fullName}`} 
                  alt={player.fullName} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute top-3 right-3 bg-white/90 dark:bg-black/80 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 shadow-lg">
                   <span className="text-xs font-black text-primary uppercase">#{player.jerseyNumber}</span>
                </div>
                {/* Team Badge */}
                <div className="absolute bottom-3 left-3 bg-primary px-3 py-1 rounded-lg shadow-lg">
                   <p className="text-[9px] font-black text-white uppercase tracking-tighter">
                    {teams[player.teamId] || 'Unassigned'}
                   </p>
                </div>
              </div>
              
              <div className="p-5 space-y-4">
                <div className="text-center">
                  <h3 className="text-lg font-black uppercase italic tracking-tight truncate" style={{ color: 'var(--text-color)' }}>
                    {player.fullName}
                  </h3>
                  <div className="flex items-center justify-center gap-1.5 mt-1">
                    <Phone className="w-3 h-3 text-slate-400" />
                    <p className="text-[10px] font-bold text-slate-500">{player.phone}</p>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-slate-50 dark:bg-white/5 p-2.5 rounded-xl border border-white/5 text-center">
                    <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-1">Jersey</p>
                    <p className="font-bold text-xs" style={{ color: 'var(--text-color)' }}>{player.jerseySize}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-white/5 p-2.5 rounded-xl border border-white/5 text-center">
                    <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-1">Status</p>
                    <div className="flex items-center justify-center gap-1">
                      <div className={`w-1.5 h-1.5 rounded-full ${player.paidAmount >= 1500 ? 'bg-green-500' : 'bg-orange-500'}`} />
                      <p className="font-bold text-[10px]" style={{ color: 'var(--text-color)' }}>
                        {player.paidAmount >= 1500 ? 'Paid' : 'Due'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-1">
                   <div className="flex items-center justify-between text-[10px] font-bold border-t border-white/5 pt-3">
                      <span className="text-slate-500 uppercase">Team Squad</span>
                      <span className="text-primary truncate max-w-[100px]">{teams[player.teamId] || 'Pending...'}</span>
                   </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}

        {filteredPlayers.length === 0 && !loading && (
          <div className="col-span-full py-20 text-center glass-card border-dashed">
            <Users className="w-12 h-12 text-slate-200 dark:text-slate-800 mx-auto mb-4" />
            <h3 className="text-slate-500 font-bold uppercase tracking-widest text-xs">No matching players found</h3>
          </div>
        )}
      </div>
    </div>
  );
}
