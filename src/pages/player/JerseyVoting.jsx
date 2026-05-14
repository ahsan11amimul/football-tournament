import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, doc, runTransaction, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import useAuthStore from '../../store/useAuthStore';
import { Card, CardHeader } from '../../components/Card';
import { Button } from '../../components/Button';
import { toast } from 'react-hot-toast';
import { Shirt, Heart, CheckCircle2, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { translations } from '../../utils/translations';

export default function JerseyVoting() {
  const { user, profile, language } = useAuthStore();
  const t = translations[language];
  const [jerseys, setJerseys] = useState([]);
  const [userVote, setUserVote] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Fetch jerseys
    const jerseysUnsubscribe = onSnapshot(collection(db, 'jerseys'), (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setJerseys(docs.sort((a, b) => (b.voteCount || 0) - (a.voteCount || 0)));
      setLoading(false);
    });

    // 2. Fetch user's current vote
    let voteUnsubscribe = () => {};
    const uid = user?.uid || profile?.uid;
    
    if (uid) {
      console.log("Fetching vote for UID:", uid);
      const voteRef = doc(db, 'votes', uid);
      voteUnsubscribe = onSnapshot(voteRef, (snapshot) => {
        if (snapshot.exists()) {
          console.log("Vote found:", snapshot.data().jerseyId);
          setUserVote(snapshot.data().jerseyId);
        } else {
          console.log("No vote found for this user");
          setUserVote(null);
        }
      });
    } else {
      console.warn("No UID found for profile/user");
    }

    return () => {
      jerseysUnsubscribe();
      voteUnsubscribe();
    };
  }, [user?.uid, profile?.uid]);

  const handleVote = async (jerseyId) => {
    const uid = user?.uid || profile?.uid;
    
    if (!uid) {
      toast.error('You must be logged in to vote');
      return;
    }

    if (userVote) {
      toast.error('You have already submitted your vote!');
      return;
    }

    try {
      await runTransaction(db, async (transaction) => {
        const jerseyRef = doc(db, 'jerseys', jerseyId);
        const voteRef = doc(db, 'votes', uid);
        
        const jerseyDoc = await transaction.get(jerseyRef);
        if (!jerseyDoc.exists()) throw new Error("Jersey design no longer exists.");

        // Update jersey vote count
        const currentVotes = jerseyDoc.data().voteCount || 0;
        transaction.update(jerseyRef, {
          voteCount: currentVotes + 1
        });

        // Record user vote
        transaction.set(voteRef, {
          playerId: uid,
          playerName: profile?.fullName || 'Unknown Player',
          jerseyId: jerseyId,
          timestamp: new Date().toISOString()
        });
      });
      
      toast.success('Your vote has been counted!');
    } catch (error) {
      console.error("Voting Error:", error);
      toast.error(error.message || 'Failed to submit vote. Please try again.');
    }
  };

  const totalVotes = jerseys.reduce((sum, j) => sum + (j.voteCount || 0), 0);

  if (loading) return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {[1, 2, 3].map(i => <div key={i} className="h-96 skeleton rounded-2xl animate-pulse bg-slate-100 dark:bg-white/5" />)}
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3" style={{ color: 'var(--text-color)' }}>
            <Shirt className="text-primary w-8 h-8" />
            {t.jerseys}
          </h1>
          <p className="text-slate-500 mt-1 font-medium">{t.readyForMatches}</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 px-6 py-3 rounded-2xl shadow-xl shadow-black/5">
          <div className="text-center sm:pr-6 sm:border-r border-slate-200 dark:border-white/10">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t.totalVotes}</p>
            <p className="text-xl font-black" style={{ color: 'var(--text-color)' }}>{totalVotes}</p>
          </div>
          <div className="text-center sm:pl-2">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t.myStatus}</p>
            <div className="flex items-center gap-3">
              <p className={`text-sm font-black uppercase tracking-tighter ${userVote ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}`}>
                {userVote ? t.voted : t.votingLocked}
              </p>
              {userVote && (
                <button 
                  onClick={async () => {
                    const uid = user?.uid || profile?.uid;
                    if (uid) {
                      try {
                        const jerseyRef = doc(db, 'jerseys', userVote);
                        const voteRef = doc(db, 'votes', uid);
                        
                        await runTransaction(db, async (transaction) => {
                          const jerseyDoc = await transaction.get(jerseyRef);
                          if (jerseyDoc.exists()) {
                            transaction.update(jerseyRef, {
                              voteCount: Math.max(0, (jerseyDoc.data().voteCount || 0) - 1)
                            });
                          }
                          transaction.delete(voteRef);
                        });
                        toast.success('Vote cleared! You can vote again.');
                      } catch (e) {
                        console.error(e);
                        toast.error('Failed to clear vote');
                      }
                    }
                  }}
                  className="text-[9px] font-black uppercase text-primary hover:underline"
                >
                  ({t.reset})
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {jerseys.map((jersey, idx) => {
          const isWinner = idx === 0 && (jersey.voteCount || 0) > 0;
          const isVoted = String(userVote || '').trim() === String(jersey.id).trim();
          const percentage = totalVotes > 0 ? Math.round(((jersey.voteCount || 0) / totalVotes) * 100) : 0;

          return (
            <motion.div
              key={jersey.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className={`relative overflow-hidden group border-2 p-0 shadow-2xl transition-all duration-500 ${isVoted ? 'border-primary ring-4 ring-primary/10 scale-[1.02]' : 'border-slate-200 dark:border-white/5 shadow-black/5 dark:shadow-black/20'}`}>
                {isWinner && (
                  <div className="absolute top-4 left-4 bg-yellow-500 text-black text-[10px] font-black uppercase px-3 py-1.5 rounded-full z-10 flex items-center gap-1 shadow-lg shadow-yellow-500/40">
                    <TrendingUp className="w-3.5 h-3.5" /> {t.mostVoted}
                  </div>
                )}
                
                <div className="aspect-[4/5] overflow-hidden bg-slate-100 dark:bg-slate-900 relative">
                  <img 
                    src={jersey.imageUrl} 
                    alt={jersey.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                    <p className="text-white text-sm font-bold italic leading-relaxed">{jersey.description}</p>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-black italic uppercase tracking-tight" style={{ color: 'var(--text-color)' }}>{jersey.name}</h3>
                      <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">Design #{idx + 1}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-black italic text-primary leading-none">{percentage}%</p>
                      <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">{jersey.voteCount || 0} {t.totalVotes}</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden shadow-inner">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      className={`h-full shadow-[0_0_10px_rgba(200,16,46,0.3)] ${isWinner ? 'bg-primary' : 'bg-slate-400 dark:bg-slate-600'}`}
                    />
                  </div>

                  <Button
                    onClick={() => handleVote(jersey.id)}
                    variant={isVoted ? 'accent' : 'primary'}
                    disabled={!!userVote}
                    className="w-full py-4 text-xs font-black uppercase tracking-[0.2em] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isVoted ? (
                      <div className="flex items-center justify-center gap-2">
                        <CheckCircle2 className="w-5 h-5" /> 
                        <span>{t.voted}</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <Heart className="w-5 h-5" /> 
                        <span>{userVote ? t.votingLocked : t.submitVote}</span>
                      </div>
                    )}
                  </Button>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {jerseys.length === 0 && (
        <div className="text-center py-24 border-2 border-dashed border-slate-200 dark:border-white/5 rounded-[3rem] bg-slate-50/50 dark:bg-transparent">
          <Shirt className="w-20 h-20 text-slate-200 dark:text-slate-800 mx-auto mb-4" />
          <h3 className="text-xl font-black uppercase tracking-widest" style={{ color: 'var(--text-color)' }}>No Designs Uploaded Yet</h3>
          <p className="text-slate-500 mt-2 font-medium">The tournament admins will upload jersey designs soon.</p>
        </div>
      )}
    </div>
  );
}
