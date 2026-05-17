import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Card } from '../../components/Card';
import { Search, Users, Shield, Phone, User, Star, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';
import ShareModal from '../../components/ShareModal';
import useAuthStore from '../../store/useAuthStore';
import { translations } from '../../utils/translations';

export default function AllPlayers() {
  const { language } = useAuthStore();
  const t = translations[language];

  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareData, setShareData] = useState(null);

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

  const handleShareRoster = () => {
    const textMsg = language === 'bn' 
      ? `তালোড়া বাইগুনি প্রিমিয়ার লীগের খেলোয়াড় তালিকাটি দেখুন! আমাদের মোট ${players.length} জন খেলোয়াড় নিবন্ধিত রয়েছে। টুর্নামেন্টের উত্তেজনাপূর্ণ খবরের জন্য সাথে থাকুন! ⚽`
      : `Check out the active player roster for Talora Baiguni Premier League! We have ${players.length} registered players. Join us in the excitement! 🔥`;

    setShareData({
      title: language === 'bn' ? "⚽ টুর্নামেন্ট প্লেয়ার রোস্টার" : "⚽ Tournament Player Squad Roster",
      text: textMsg,
      url: window.location.href
    });
    setIsShareModalOpen(true);
  };

  const handleSharePlayer = (player) => {
    const teamName = teams[player.teamId] || (language === 'bn' ? 'অনির্ধারিত' : 'Unassigned');
    const statusMsg = player.paidAmount >= 1500 
      ? (language === 'bn' ? 'পরিশোধিত' : 'Paid') 
      : (language === 'bn' ? 'বাকি' : 'Due');

    const descMsg = language === 'bn'
      ? `🏃 নাম: ${player.fullName}\n👕 জার্সি: #${player.jerseyNumber || 'N/A'} (সাইজ: ${player.jerseySize || 'N/A'})\n🛡️ দল: ${teamName}\n📞 মোবাইল: ${player.phone}\n💳 পেমেন্ট: ${statusMsg}`
      : `🏃 Name: ${player.fullName}\n👕 Jersey: #${player.jerseyNumber || 'N/A'} (Size: ${player.jerseySize || 'N/A'})\n🛡️ Team: ${teamName}\n📞 Phone: ${player.phone}\n💳 Payment: ${statusMsg}`;

    setShareData({
      title: language === 'bn' ? `🏃 প্লেয়ার প্রোফাইল কার্ড: ${player.fullName}` : `🏃 Player Profile: ${player.fullName}`,
      text: descMsg,
      url: window.location.href
    });
    setIsShareModalOpen(true);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header with Search & Share */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter" style={{ color: 'var(--text-color)' }}>
            {language === 'bn' ? 'টুর্নামেন্ট রোস্টার' : 'Tournament Roster'}
          </h1>
          <p className="text-slate-500 mt-1 font-medium">
            {language === 'bn' ? 'খেলোয়াড়, দল এবং যোগাযোগের বিবরণ দেখুন' : 'Browse players, teams, and contact details'}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          <div className="relative w-full sm:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder={language === 'bn' ? 'নাম, জার্সি বা দল খুঁজুন...' : 'Search name, jersey or team...'}
              className="premium-input pl-12 w-full shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={handleShareRoster}
            className="premium-button bg-slate-800 dark:bg-white/10 hover:bg-slate-700 dark:hover:bg-white/20 text-white py-2.5 px-5 rounded-2xl flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wider w-full sm:w-auto shrink-0 border border-slate-200 dark:border-white/5"
            title="Share Roster"
          >
            <Share2 className="w-4 h-4 text-primary" />
            {language === 'bn' ? 'স্কোয়াড শেয়ার' : 'Share Squad'}
          </button>
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
                
                {/* Share Button (appears on card hover) */}
                <button
                  onClick={() => handleSharePlayer(player)}
                  className="absolute top-3 left-3 p-2 bg-black/60 hover:bg-primary backdrop-blur-md text-white rounded-full border border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-300"
                  title="Share Player Card"
                >
                  <Share2 className="w-3.5 h-3.5" />
                </button>

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

      <ShareModal 
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        shareData={shareData}
      />
    </div>
  );
}
