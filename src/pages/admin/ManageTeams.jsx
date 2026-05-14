import { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, doc, deleteDoc, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Card, CardHeader } from '../../components/Card';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { toast } from 'react-hot-toast';
import { Shield, Plus, Trash2, UserPlus, Users } from 'lucide-react';

import ImageUpload from '../../components/ImageUpload';

export default function ManageTeams() {
  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadedLogo, setUploadedLogo] = useState("");

  useEffect(() => {
    // Fetch Teams
    const unsubscribeTeams = onSnapshot(collection(db, 'teams'), (snapshot) => {
      setTeams(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Fetch Players
    const playerQuery = query(collection(db, 'users'), where('role', '==', 'player'));
    const unsubscribePlayers = onSnapshot(playerQuery, (snapshot) => {
      setPlayers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubscribeTeams();
      unsubscribePlayers();
    };
  }, []);

  const createTeam = async (e) => {
    e.preventDefault();
    const name = new FormData(e.target).get('name');
    
    if (!name) return toast.error('Team name is required');

    setLoading(true);
    try {
      await addDoc(collection(db, 'teams'), { 
        name, 
        logoUrl: uploadedLogo || null,
        createdAt: new Date().toISOString() 
      });
      toast.success('Team created!');
      setUploadedLogo("");
      e.target.reset();
    } catch (error) { 
      toast.error('Failed to create team'); 
    } finally { 
      setLoading(false); 
    }
  };

  const assignTeam = async (playerId, teamId) => {
    try {
      await updateDoc(doc(db, 'users', playerId), { teamId });
      toast.success('Player assigned to team!');
    } catch (error) { 
      toast.error('Failed to assign player'); 
    }
  };

  const removePlayerFromTeam = async (playerId) => {
    try {
      await updateDoc(doc(db, 'users', playerId), { teamId: null });
      toast.success('Player removed from team');
    } catch (error) { 
      toast.error('Failed to remove player'); 
    }
  };

  const deleteTeam = async (id) => {
    if (confirm('Are you sure? Players in this team will be unassigned.')) {
      // Unassign players first (Optional but good practice)
      const teamPlayers = players.filter(p => p.teamId === id);
      for (const p of teamPlayers) {
        await updateDoc(doc(db, 'users', p.id), { teamId: null });
      }
      await deleteDoc(doc(db, 'teams', id));
      toast.success('Team deleted');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text-color)' }}>
          Team Management
        </h1>
        <div className="bg-slate-100 dark:bg-white/5 px-4 py-2 rounded-xl border border-slate-200 dark:border-white/5 text-slate-500 text-xs font-bold uppercase tracking-wider">
          {teams.length} Teams Registered
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create Team Form */}
        <Card className="h-fit">
          <CardHeader title="Create New Team" subtitle="Add a new squad to the tournament" />
          <form onSubmit={createTeam} className="space-y-6">
            <Input name="name" label="Team Name" placeholder="E.g. Red Dragons FC" required />
            
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Team Logo (Optional)</label>
              <ImageUpload 
                onUploadSuccess={(url) => setUploadedLogo(url)} 
                folder="/teams" 
              />
            </div>

            <Button type="submit" className="w-full" loading={loading}>
              <Plus className="w-4 h-4" /> Create Team
            </Button>
          </form>
          
          <div className="mt-8">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 px-1">Unassigned Players</h4>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
              {players.filter(p => !p.teamId).map(p => (
                <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                  <span className="text-xs font-bold" style={{ color: 'var(--text-color)' }}>{p.fullName}</span>
                  <span className="text-[10px] font-black text-primary">#{p.jerseyNumber}</span>
                </div>
              ))}
              {players.filter(p => !p.teamId).length === 0 && (
                <p className="text-xs text-slate-500 text-center py-4 italic font-medium">All players assigned!</p>
              )}
            </div>
          </div>
        </Card>

        {/* Team List */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          {teams.map(team => {
            const teamSquad = players.filter(p => p.teamId === team.id);
            return (
              <Card key={team.id} className="border-slate-200 dark:border-white/5 group shadow-xl shadow-black/5 dark:shadow-black/20">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary overflow-hidden border border-primary/20">
                      {team.logoUrl ? (
                        <img src={team.logoUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Shield className="w-6 h-6" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold" style={{ color: 'var(--text-color)' }}>{team.name}</h3>
                      <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{teamSquad.length} Players</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => deleteTeam(team.id)}
                    className="p-2 text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase ml-1 tracking-widest">Assign Player</label>
                    <select 
                      onChange={(e) => assignTeam(e.target.value, team.id)}
                      className="premium-input w-full text-xs py-2.5"
                      value=""
                    >
                      <option value="" disabled>Select to assign...</option>
                      {players.filter(p => !p.teamId).map(p => (
                        <option key={p.id} value={p.id}>{p.fullName} (#{p.jerseyNumber})</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase ml-1 tracking-widest">Squad Roster</label>
                    <div className="space-y-1.5 min-h-[100px]">
                      {teamSquad.map(p => (
                        <div key={p.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 hover:border-primary/30 transition-all group/player">
                          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{p.fullName}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-primary">#{p.jerseyNumber}</span>
                            <button 
                              onClick={() => removePlayerFromTeam(p.id)}
                              className="p-1 text-slate-400 hover:text-red-500 opacity-0 group-hover/player:opacity-100 transition-opacity"
                            >
                              <Plus className="w-3.5 h-3.5 rotate-45" />
                            </button>
                          </div>
                        </div>
                      ))}
                      {teamSquad.length === 0 && (
                        <div className="h-24 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-white/5 rounded-2xl bg-slate-50/50 dark:bg-transparent">
                          <Users className="w-6 h-6 text-slate-300 dark:text-slate-800 mb-1" />
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No players yet</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
