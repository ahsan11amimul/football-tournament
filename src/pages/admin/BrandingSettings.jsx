import { useState, useEffect } from 'react';
import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  getDocs, 
  deleteDoc,
  query,
  where
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Card, CardHeader } from '../../components/Card';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { toast } from 'react-hot-toast';
import { 
  Settings, 
  Image as ImageIcon, 
  Trash2, 
  AlertTriangle,
  RefreshCw,
  Layout,
  Flag
} from 'lucide-react';
import ImageUpload from '../../components/ImageUpload';
import useAuthStore from '../../store/useAuthStore';
import { translations } from '../../utils/translations';
import Swal from 'sweetalert2';

export default function BrandingSettings() {
  const { language, profile } = useAuthStore();
  const t = translations[language];
  
  const [loading, setLoading] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [branding, setBranding] = useState({
    tournamentName: "Talora Baiguni Premier League",
    sponsorName: "Sponsored by Torun Somaj",
    logoUrl: "",
    bannerUrl: ""
  });

  useEffect(() => {
    const fetchBranding = async () => {
      const docRef = doc(db, 'settings', 'branding');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setBranding(docSnap.data());
      }
    };
    fetchBranding();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await setDoc(doc(db, 'settings', 'branding'), branding);
      toast.success('Branding updated successfully');
    } catch (error) {
      toast.error('Failed to update branding');
    } finally {
      setLoading(false);
    }
  };

  const handleResetDatabase = async () => {
    const result = await Swal.fire({
      title: t.resetDatabase,
      text: t.resetWarning,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      confirmButtonText: t.confirmReset,
      background: 'var(--surface-color)',
      color: 'var(--text-color)'
    });

    if (result.isConfirmed) {
      setResetting(true);
      try {
        const collectionsToClear = ['matches', 'teams', 'transactions', 'votes', 'jerseys', 'memories', 'payments', 'chat'];
        
        for (const colName of collectionsToClear) {
          try {
            const querySnapshot = await getDocs(collection(db, colName));
            const deletePromises = querySnapshot.docs.map(d => deleteDoc(doc(db, colName, d.id)));
            await Promise.all(deletePromises);
            console.log(`Cleared collection: ${colName}`);
          } catch (e) {
            console.warn(`Failed to clear collection: ${colName}`, e);
          }
        }

        // Clear non-admin users
        try {
          const usersRef = collection(db, 'users');
          const q = query(usersRef, where('role', '!=', 'admin'));
          const usersSnapshot = await getDocs(q);
          const userDeletePromises = usersSnapshot.docs.map(d => deleteDoc(doc(db, 'users', d.id)));
          await Promise.all(userDeletePromises);
          console.log(`Cleared non-admin users`);
        } catch (e) {
          console.warn(`Failed to clear non-admin users. This may require a composite index.`, e);
          // Fallback: fetch all and filter in memory if index is missing
          const usersSnapshot = await getDocs(collection(db, 'users'));
          const userDeletePromises = usersSnapshot.docs
            .filter(d => d.data().role !== 'admin')
            .map(d => deleteDoc(doc(db, 'users', d.id)));
          await Promise.all(userDeletePromises);
          console.log(`Cleared non-admin users using memory filter fallback`);
        }

        toast.success('Database reset successfully! All seed data removed.');
      } catch (error) {
        console.error(error);
        toast.error('Failed to reset database: ' + (error.message || 'Unknown error'));
      } finally {
        setResetting(false);
      }
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black italic uppercase tracking-tighter flex items-center gap-3" style={{ color: 'var(--text-color)' }}>
          <Settings className="text-primary w-8 h-8" />
          {t.branding}
        </h1>
        <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mt-1">Manage your tournament identity</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="h-fit">
          <CardHeader title="General Branding" subtitle="Names and slogans" />
          <form onSubmit={handleUpdate} className="space-y-6">
            <Input 
              label="Tournament Name" 
              value={branding.tournamentName} 
              onChange={(e) => setBranding({...branding, tournamentName: e.target.value})}
              required
            />
            <Input 
              label="Sponsor Details" 
              value={branding.sponsorName} 
              onChange={(e) => setBranding({...branding, sponsorName: e.target.value})}
              required
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{t.tournamentLogo}</label>
                <div className="p-4 border-2 border-dashed border-slate-200 dark:border-white/5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] flex flex-col items-center gap-4">
                  {branding.logoUrl && (
                    <img src={branding.logoUrl} alt="Logo Preview" className="w-20 h-20 object-contain rounded-xl bg-white p-2 shadow-lg" />
                  )}
                  <ImageUpload 
                    onUploadSuccess={(url) => setBranding({...branding, logoUrl: url})} 
                    folder="/branding" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{t.tournamentBanner}</label>
                <div className="p-4 border-2 border-dashed border-slate-200 dark:border-white/5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] flex flex-col items-center gap-4">
                  {branding.bannerUrl && (
                    <img src={branding.bannerUrl} alt="Banner Preview" className="w-full aspect-video object-cover rounded-xl shadow-lg" />
                  )}
                  <ImageUpload 
                    onUploadSuccess={(url) => setBranding({...branding, bannerUrl: url})} 
                    folder="/branding" 
                  />
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full py-4 text-xs font-black uppercase tracking-[0.2em]" loading={loading}>
              <RefreshCw className="w-4 h-4" /> {t.updateBranding}
            </Button>
          </form>
        </Card>

        <div className="space-y-8">
          <Card className="border-red-500/20 bg-red-500/[0.02]">
            <CardHeader 
              title={t.dangerZone} 
              subtitle="Critical actions for production deployment"
              titleColor="text-red-600 dark:text-red-400"
            />
            <div className="p-6 space-y-4">
              <div className="flex items-start gap-4 p-4 bg-red-500/10 rounded-2xl border border-red-500/20">
                <AlertTriangle className="text-red-500 w-6 h-6 shrink-0 mt-1" />
                <div>
                  <p className="text-sm font-bold text-red-600 dark:text-red-400">{t.resetDatabase}</p>
                  <p className="text-[10px] text-red-500/70 font-medium mt-1 leading-relaxed">{t.resetWarning}</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                className="w-full border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white"
                onClick={handleResetDatabase}
                loading={resetting}
              >
                <Trash2 className="w-4 h-4" /> {t.resetDatabase}
              </Button>
            </div>
          </Card>

          <Card className="border-primary/20 bg-primary/[0.02]">
            <CardHeader title="Current Identity" subtitle="How others see your tournament" />
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 dark:border-white/10 flex items-center justify-center p-2 shadow-xl">
                  {branding.logoUrl ? (
                    <img src={branding.logoUrl} alt="" className="w-full h-full object-contain" />
                  ) : (
                    <Flag className="text-primary w-8 h-8" />
                  )}
                </div>
                <div>
                  <h3 className="font-black italic uppercase tracking-tighter" style={{ color: 'var(--text-color)' }}>{branding.tournamentName}</h3>
                  <p className="text-xs font-bold text-slate-500">{branding.sponsorName}</p>
                </div>
              </div>
              
              {branding.bannerUrl && (
                <div className="relative aspect-[21/9] rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                  <img src={branding.bannerUrl} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                    <p className="text-white text-[10px] font-black uppercase tracking-widest">{branding.tournamentName}</p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
