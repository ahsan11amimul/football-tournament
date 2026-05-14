import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Card } from '../../components/Card';
import { 
  Users, 
  DollarSign, 
  Calendar, 
  Trophy,
  ArrowUpRight,
  ChevronRight,
  Plus,
  Database,
  Shield
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/Button';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { seedDatabase } from '../../utils/seedData';
import { toast } from 'react-hot-toast';

export default function AdminOverview() {
  const [stats, setStats] = useState({
    players: 0,
    totalIncome: 0,
    pendingPayments: 0,
    matches: 0
  });

  useEffect(() => {
    // Real-time Players Count
    const qPlayers = query(collection(db, 'users'), where('role', '==', 'player'));
    const unsubPlayers = onSnapshot(qPlayers, (snap) => {
      setStats(prev => ({ ...prev, players: snap.size }));
    });

    // Real-time Pending Payments
    const qPayments = query(collection(db, 'payments'), where('status', '==', 'pending'));
    const unsubPayments = onSnapshot(qPayments, (snap) => {
      setStats(prev => ({ ...prev, pendingPayments: snap.size }));
    });

    // Real-time Total Income (from users collection for simplicity)
    const unsubUsers = onSnapshot(collection(db, 'users'), (snap) => {
      const income = snap.docs.reduce((acc, doc) => acc + (doc.data().paidAmount || 0), 0);
      setStats(prev => ({ ...prev, totalIncome: income }));
    });

    // Real-time Matches Count
    const unsubMatches = onSnapshot(collection(db, 'matches'), (snap) => {
      setStats(prev => ({ ...prev, matches: snap.size }));
    });

    return () => {
      unsubPlayers();
      unsubPayments();
      unsubUsers();
      unsubMatches();
    };
  }, []);

  const summaryData = [
    { label: 'Total Players', value: stats.players, icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { label: 'Total Income', value: `৳${stats.totalIncome}`, icon: DollarSign, color: 'text-green-400', bg: 'bg-green-400/10' },
    { label: 'Pending Payments', value: stats.pendingPayments, icon: ArrowUpRight, color: 'text-orange-400', bg: 'bg-orange-400/10' },
    { label: 'Total Matches', value: stats.matches, icon: Trophy, color: 'text-purple-400', bg: 'bg-purple-400/10' },
  ];  return (
    <div className="space-y-10 lg:space-y-14">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div>
          <h1 className="text-4xl lg:text-5xl font-black italic uppercase tracking-tighter" style={{ color: 'var(--text-color)' }}>
            Admin Control
          </h1>
          <p className="text-slate-500 mt-2 font-bold uppercase tracking-[0.2em] text-xs opacity-70">
            Tournament Management & Financial Insights
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            className="h-12 lg:h-14 px-6 border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/5 text-[10px] font-black uppercase tracking-widest"
            onClick={async () => {
              const success = await seedDatabase();
              if (success) toast.success('Database seeded with dummy data!');
            }}
          >
            <Database className="w-4 h-4" /> Seed Data
          </Button>
          <Link to="/admin/matches" className="flex-1 lg:flex-none">
            <Button variant="primary" className="w-full h-12 lg:h-14 px-8 shadow-xl shadow-primary/30 text-[10px] font-black uppercase tracking-widest">
              <Plus className="w-4 h-4" /> Create Match
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
        {summaryData.map((item, idx) => (
          <Card key={idx} className="flex items-center gap-6 p-8 border-slate-200 dark:border-white/5 shadow-2xl hover:translate-y-[-8px] transition-all duration-500 group">
            <div className={`w-16 h-16 lg:w-20 lg:h-20 rounded-[1.5rem] lg:rounded-[2rem] ${item.bg} flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-6`}>
              <item.icon className={`w-8 h-8 lg:w-10 lg:h-10 ${item.color}`} />
            </div>
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">{item.label}</p>
              <p className="text-3xl lg:text-4xl font-black mt-2 italic" style={{ color: 'var(--text-color)' }}>{item.value}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Quick Actions */}
        <div className="lg:col-span-4 space-y-8">
          <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 px-1">Quick Management</h3>
          <div className="grid grid-cols-1 gap-5">
            {[
              { to: '/admin/payments', label: 'Approve Payments', sub: `${stats.pendingPayments} requests waiting`, icon: DollarSign, color: 'bg-orange-500/10 text-orange-400' },
              { to: '/admin/players', label: 'Manage Players', sub: 'Edit or remove participants', icon: Users, color: 'bg-blue-500/10 text-blue-400' },
              { to: '/admin/jerseys', label: 'Upload Jerseys', sub: 'Add new kit designs', icon: Plus, color: 'bg-purple-500/10 text-purple-400' },
            ].map((link, i) => (
              <Link key={i} to={link.to}>
                <Card className="hover:bg-slate-100 dark:hover:bg-white/5 transition-all group p-6 border-slate-200 dark:border-white/5 shadow-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-5">
                      <div className={`w-14 h-14 rounded-2xl ${link.color} flex items-center justify-center transition-all group-hover:scale-110`}>
                        <link.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-black italic uppercase tracking-tight text-lg" style={{ color: 'var(--text-color)' }}>{link.label}</p>
                        <p className="text-xs text-slate-500 font-bold mt-1 opacity-70">{link.sub}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-6 h-6 text-slate-400 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Financial Preview Chart */}
        <Card className="lg:col-span-8 p-8 lg:p-10 border-slate-200 dark:border-white/5 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
            <div>
               <h3 className="text-2xl lg:text-3xl font-black italic uppercase tracking-tight" style={{ color: 'var(--text-color)' }}>Financial Trends</h3>
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Weekly registration revenue</p>
            </div>
            <Link to="/admin/finance">
              <Button variant="outline" className="h-10 px-6 text-[10px] font-black uppercase tracking-widest border-slate-200 dark:border-white/10">
                Full Analytics
              </Button>
            </Link>
          </div>

          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={[
                { name: 'Week 1', income: 4000 },
                { name: 'Week 2', income: 7000 },
                { name: 'Week 3', income: 5000 },
                { name: 'Week 4', income: 12000 },
                { name: 'Week 5', income: 8000 },
              ]}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C8102E" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#C8102E" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#94a3b8" 
                  fontSize={10} 
                  tickFormatter={(val) => val.toUpperCase()}
                  fontFamily="Inter"
                  fontWeight="bold"
                />
                <YAxis 
                  stroke="#94a3b8" 
                  fontSize={10}
                  fontFamily="Inter"
                  fontWeight="bold"
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--surface-color)', 
                    border: '1px solid var(--border-color)', 
                    borderRadius: '16px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
                  }}
                  itemStyle={{ color: 'var(--primary-color)', fontWeight: 'bold' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="income" 
                  stroke="#C8102E" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorIncome)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
