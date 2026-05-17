import { useState, useEffect } from 'react';
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  doc, 
  deleteDoc,
  updateDoc 
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Card, CardHeader } from '../../components/Card';
import { Button } from '../../components/Button';
import { 
  Search, 
  UserPlus, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Download,
  Users,
  CheckCircle,
  XCircle,
  FileDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import EditPlayerModal from './EditPlayerModal';
import AddPlayerModal from './AddPlayerModal';

const MySwal = withReactContent(Swal);

export default function ManagePlayers() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPlayers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredPlayers = players.filter(p => 
    p.role === 'player' && (
    p.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.phone?.includes(searchTerm) ||
    p.jerseyNumber?.toString().includes(searchTerm)
  ));

  const handleDelete = async (id, name) => {
    const result = await MySwal.fire({
      title: 'Are you sure?',
      text: `You are about to delete player: ${name}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#C8102E',
      cancelButtonColor: '#003366',
      confirmButtonText: 'Yes, delete!',
      background: '#0f172a',
      color: '#fff'
    });

    if (result.isConfirmed) {
      try {
        await deleteDoc(doc(db, 'users', id));
        MySwal.fire({
          title: 'Deleted!',
          text: 'Player has been removed.',
          icon: 'success',
          background: '#0f172a',
          color: '#fff'
        });
      } catch (error) {
        MySwal.fire('Error!', 'Failed to delete player.', 'error');
      }
    }
  };

  const exportToCSV = () => {
    const headers = ['Full Name', 'Jersey Number', 'Size', 'Paid Amount', 'Phone', 'Status'];
    const csvEscape = (val) => {
      if (val === null || val === undefined) return '';
      const stringVal = String(val);
      if (stringVal.includes(',') || stringVal.includes('"') || stringVal.includes('\n')) {
        return `"${stringVal.replace(/"/g, '""')}"`;
      }
      return stringVal;
    };

    const rows = filteredPlayers.map(p => [
      csvEscape(p.fullName),
      csvEscape(p.jerseyNumber),
      csvEscape(p.jerseySize),
      csvEscape(p.paidAmount),
      csvEscape(`'${p.phone}`),
      csvEscape(p.status)
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `TBPL_Player_Order_List_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--text-color)' }}>
            <Users className="text-primary" />
            Manage Players
          </h1>
          <p className="text-slate-500 text-sm font-medium">View and manage all registered athletes</p>
        </div>
        <div className="flex items-center gap-3">
           <Button variant="outline" onClick={exportToCSV} className="gap-2 border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/5">
            <FileDown className="w-4 h-4" />
            Export Order List
          </Button>
          <Button variant="primary" className="gap-2" onClick={() => setIsAddModalOpen(true)}>
            <UserPlus className="w-4 h-4" />
            Add Player
          </Button>
        </div>
      </div>

      <Card className="p-0 overflow-hidden border-slate-200 dark:border-white/5 shadow-xl shadow-black/5 dark:shadow-black/20">
        <div className="p-4 border-b border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/[0.02] flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search players..." 
              className="premium-input pl-10 w-full text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-white/[0.02] text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] border-b border-slate-100 dark:border-white/5">
                <th className="px-6 py-5">Player</th>
                <th className="px-6 py-5">Jersey</th>
                <th className="px-6 py-5">Payment</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              <AnimatePresence>
                {filteredPlayers.map((player) => (
                  <motion.tr 
                    key={player.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="group hover:bg-slate-50 dark:hover:bg-white/[0.01] transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-primary font-bold overflow-hidden border border-slate-200 dark:border-white/10 shadow-sm">
                          {player.avatarUrl ? (
                            <img src={player.avatarUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xl italic font-black">{player.fullName?.charAt(0)}</span>
                          )}
                        </div>
                        <div>
                          <p className="font-black italic uppercase tracking-tight text-sm" style={{ color: 'var(--text-color)' }}>{player.fullName}</p>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">{player.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 rounded-lg bg-primary/10 text-primary text-[10px] font-black border border-primary/10 tracking-widest shadow-sm">
                          #{player.jerseyNumber}
                        </span>
                        <span className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest">{player.jerseySize}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1.5 min-w-[120px]">
                        <p className="text-sm font-black italic" style={{ color: 'var(--text-color)' }}>৳{player.paidAmount || 0}</p>
                        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-green-500 transition-all shadow-[0_0_8px_rgba(34,197,94,0.4)]" 
                            style={{ width: `${Math.min((player.paidAmount / 1500) * 100, 100)}%` }} 
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm ${
                        player.status === 'active' 
                          ? 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20' 
                          : 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
                      }`}>
                        {player.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button 
                          onClick={() => setEditingPlayer(player)}
                          className="p-2.5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl text-slate-400 hover:text-primary transition-all active:scale-90"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(player.id, player.fullName)}
                          className="p-2.5 hover:bg-red-500/10 rounded-xl text-slate-400 hover:text-red-500 transition-all active:scale-90"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden p-4 space-y-4">
          {filteredPlayers.map((player) => (
            <Card key={player.id} className="p-5 border-slate-200 dark:border-white/5 shadow-xl shadow-black/5 active:scale-[0.98] transition-transform">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-primary font-bold overflow-hidden border border-slate-200 dark:border-white/10 shadow-sm">
                    {player.avatarUrl ? (
                      <img src={player.avatarUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xl italic font-black">{player.fullName?.charAt(0)}</span>
                    )}
                  </div>
                  <div>
                    <p className="font-black italic uppercase tracking-tight text-sm" style={{ color: 'var(--text-color)' }}>{player.fullName}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">{player.phone}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => setEditingPlayer(player)} className="p-2 text-slate-400 hover:text-primary"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(player.id, player.fullName)} className="p-2 text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/5">
                <div className="flex items-center gap-2">
                   <span className="px-2 py-1 rounded-lg bg-primary/10 text-primary text-[10px] font-black border border-primary/10 tracking-widest">
                    #{player.jerseyNumber}
                   </span>
                   <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">{player.jerseySize}</span>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Paid Amount</p>
                  <p className="text-sm font-black italic" style={{ color: 'var(--text-color)' }}>৳{player.paidAmount || 0}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
        
        {filteredPlayers.length === 0 && !loading && (
          <div className="py-20 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-slate-50 dark:bg-white/5 rounded-3xl flex items-center justify-center mb-4 shadow-inner">
              <Users className="w-10 h-10 text-slate-300 dark:text-slate-800" />
            </div>
            <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px]">No players found</p>
          </div>
        )}
      </Card>

      {editingPlayer && (
        <EditPlayerModal 
          player={editingPlayer} 
          isOpen={!!editingPlayer} 
          onClose={() => setEditingPlayer(null)} 
        />
      )}

      {/* Add Modal */}
      <AddPlayerModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />
    </div>
  );
}
