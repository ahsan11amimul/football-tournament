import { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Card, CardHeader } from '../../components/Card';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { toast } from 'react-hot-toast';
import { Calendar, Plus, Trash2, Edit2, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';

export default function ManageMatches() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'matches'), (snapshot) => {
      setMatches(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    setLoading(true);

    try {
      await addDoc(collection(db, 'matches'), {
        teamA: formData.get('teamA'),
        teamB: formData.get('teamB'),
        date: formData.get('date'),
        time: formData.get('time'),
        scoreA: 0,
        scoreB: 0,
        status: 'scheduled',
        createdAt: new Date().toISOString()
      });
      toast.success('Match scheduled!');
      e.target.reset();
    } catch (error) {
      toast.error('Failed to schedule match');
    } finally {
      setLoading(false);
    }
  };

  const updateScore = async (id, team, score) => {
    const parsedScore = parseInt(score);
    if (isNaN(parsedScore)) return; // Don't update if input is not a number

    const matchRef = doc(db, 'matches', id);
    await updateDoc(matchRef, {
      [`score${team}`]: parsedScore
    });
  };

  const finishMatch = async (id) => {
    await updateDoc(doc(db, 'matches', id), { status: 'completed' });
    toast.success('Match marked as completed');
  };

  const deleteMatch = async (id) => {
    if (confirm('Delete this match?')) {
      await deleteDoc(doc(db, 'matches', id));
      toast.success('Match deleted');
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text-color)' }}>Manage Matches</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="h-fit border-slate-200 dark:border-white/5 shadow-xl">
          <CardHeader title="Schedule Match" subtitle="Create a new tournament fixture" />
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input name="teamA" label="Team A" required placeholder="E.g. Warriors" />
            <Input name="teamB" label="Team B" required placeholder="E.g. Titans" />
            <Input name="date" label="Date" type="date" required defaultValue={new Date().toISOString().split('T')[0]} />
            <Input name="time" label="Time" type="time" required defaultValue="20:00" />
            <Button type="submit" className="w-full" loading={loading}>
              <Plus className="w-4 h-4" /> Schedule Match
            </Button>
          </form>
        </Card>

        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xl font-bold" style={{ color: 'var(--text-color)' }}>Match Fixtures</h3>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{matches.length} Total</span>
          </div>
          
          {matches.map((match) => (
            <Card key={match.id} className="border-slate-200 dark:border-white/5 hover:border-primary/20 transition-all shadow-lg shadow-black/5 dark:shadow-black/20">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex-1 text-center md:text-left">
                  <div className="flex items-center gap-2 justify-center md:justify-start mb-2">
                    <Calendar className="w-3.5 h-3.5 text-primary" />
                    <p className="text-[10px] text-primary font-black uppercase tracking-widest">
                      {match.date ? format(new Date(match.date), 'MMM dd, yyyy') : 'TBD'} @ {match.time || 'TBD'}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 justify-center md:justify-start">
                    <span className="font-bold text-lg" style={{ color: 'var(--text-color)' }}>{match.teamA}</span>
                    <span className="text-[10px] font-black text-slate-400 bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded-full">VS</span>
                    <span className="font-bold text-lg" style={{ color: 'var(--text-color)' }}>{match.teamB}</span>
                  </div>
                </div>

                {match.status !== 'completed' ? (
                  <div className="flex items-center gap-4 bg-slate-50 dark:bg-white/[0.03] p-3 rounded-2xl border border-slate-100 dark:border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-center">
                        <span className="text-[8px] font-black text-slate-400 uppercase mb-1">Score A</span>
                        <input 
                          type="number" 
                          className="w-14 h-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-center text-sm font-black transition-all focus:border-primary focus:ring-1 focus:ring-primary outline-none" 
                          style={{ color: 'var(--text-color)' }}
                          value={match.scoreA} 
                          onChange={(e) => updateScore(match.id, 'A', e.target.value)}
                        />
                      </div>
                      <span className="text-slate-300 dark:text-slate-700 font-bold mt-4">:</span>
                      <div className="flex flex-col items-center">
                        <span className="text-[8px] font-black text-slate-400 uppercase mb-1">Score B</span>
                        <input 
                          type="number" 
                          className="w-14 h-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-center text-sm font-black transition-all focus:border-primary focus:ring-1 focus:ring-primary outline-none" 
                          style={{ color: 'var(--text-color)' }}
                          value={match.scoreB} 
                          onChange={(e) => updateScore(match.id, 'B', e.target.value)}
                        />
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => finishMatch(match.id)}
                      className="h-10 border-green-500/20 text-green-600 dark:text-green-400 hover:bg-green-500/10"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-6 px-4">
                    <div className="flex flex-col items-center">
                      <span className="text-3xl font-black italic tracking-tighter" style={{ color: 'var(--text-color)' }}>{match.scoreA} : {match.scoreB}</span>
                      <span className="text-[9px] font-black text-green-600 dark:text-green-400 uppercase tracking-widest mt-1">Final Score</span>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => deleteMatch(match.id)}
                    className="p-2.5 bg-slate-50 dark:bg-white/5 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-all"
                  >
                    <Trash2 className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>
            </Card>
          ))}

          {matches.length === 0 && (
            <div className="py-20 border-2 border-dashed border-slate-200 dark:border-white/5 rounded-3xl flex flex-col items-center justify-center bg-slate-50/50 dark:bg-transparent">
              <Calendar className="w-12 h-12 text-slate-200 dark:text-slate-800 mb-2" />
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No matches scheduled</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
