import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import useAuthStore from '../../store/useAuthStore';
import { Card, CardHeader } from '../../components/Card';
import { Trophy, Users, Shield, Target } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TeamInfo() {
  const { profile } = useAuthStore();
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.teamId) {
      setLoading(false);
      return;
    }

    const q = query(collection(db, 'users'), where('teamId', '==', profile.teamId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTeamMembers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    return () => unsubscribe();
  }, [profile?.teamId]);

  if (!profile?.teamId) {
    return (
      <div className="text-center py-24 glass-card">
        <Shield className="w-20 h-20 text-slate-200 dark:text-slate-800 mx-auto mb-6" />
        <h3 className="text-2xl font-black italic uppercase tracking-tight" style={{ color: 'var(--text-color)' }}>Squad Not Assigned</h3>
        <p className="text-slate-500 mt-2 font-medium">The tournament organizers will assign you to a team soon.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center gap-6">
        <div className="w-20 h-20 rounded-2xl bg-premium-gradient p-5 flex items-center justify-center shadow-xl shadow-primary/20">
          <Shield className="text-white w-full h-full" />
        </div>
        <div>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter" style={{ color: 'var(--text-color)' }}>My Team Squad</h1>
          <p className="text-slate-500 mt-1 font-medium">Tournament Roster & Performance</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Squad Size', value: `${teamMembers.length} Players`, icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10' },
          { label: 'Points', value: '0', icon: Trophy, color: 'text-green-400', bg: 'bg-green-400/10' },
          { label: 'Matches', value: '0 Played', icon: Target, color: 'text-orange-400', bg: 'bg-orange-400/10' }
        ].map((stat, i) => (
          <Card key={i} className="flex items-center gap-5">
            <div className={`w-14 h-14 rounded-2xl ${stat.bg} flex items-center justify-center`}>
              <stat.icon className={`w-7 h-7 ${stat.color}`} />
            </div>
            <div>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{stat.label}</p>
              <p className="text-2xl font-black italic uppercase mt-0.5" style={{ color: 'var(--text-color)' }}>{stat.value}</p>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader title="Squad Teammates" subtitle="The warriors standing by your side" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teamMembers.map((member) => (
            <motion.div 
              key={member.id} 
              whileHover={{ y: -4 }}
              className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-white/5 transition-all"
            >
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary/20">
                <img 
                  src={member.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${member.fullName}`} 
                  alt="" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-black italic uppercase text-sm truncate" style={{ color: 'var(--text-color)' }}>{member.fullName}</p>
                  {member.uid === profile.uid && (
                    <span className="text-[7px] bg-primary text-white px-1.5 py-0.5 rounded-full font-black uppercase">YOU</span>
                  )}
                </div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Jersey #{member.jerseyNumber} ({member.jerseySize})</p>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>
    </div>
  );
}
