import { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Card, CardHeader } from '../../components/Card';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { toast } from 'react-hot-toast';
import { Shirt, Plus, Trash2, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';

import ImageUpload from '../../components/ImageUpload';

import useAuthStore from '../../store/useAuthStore';
import { translations } from '../../utils/translations';

export default function ManageJerseys() {
  const { language } = useAuthStore();
  const t = translations[language];
  
  const [jerseys, setJerseys] = useState([]);
  const [votes, setVotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState("");

  useEffect(() => {
    const unsubJerseys = onSnapshot(collection(db, 'jerseys'), (snapshot) => {
      setJerseys(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    
    const unsubVotes = onSnapshot(collection(db, 'votes'), (snapshot) => {
      setVotes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubJerseys();
      unsubVotes();
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const name = formData.get('name');
    const description = formData.get('description');

    if (!name || !uploadedUrl) {
      return toast.error('Please provide a name and upload a design');
    }

    setLoading(true);

    try {
      await addDoc(collection(db, 'jerseys'), {
        name,
        description,
        imageUrl: uploadedUrl,
        voteCount: 0,
        createdAt: new Date().toISOString()
      });
      toast.success('Jersey design added!');
      setUploadedUrl("");
      e.target.reset();
    } catch (error) {
      toast.error('Failed to add jersey');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Delete this design?',
      text: "This kit will be removed from the voting list.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      await deleteDoc(doc(db, 'jerseys', id));
      toast.success('Design removed');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text-color)' }}>
          {t.jerseys}
        </h1>
        <div className="bg-slate-100 dark:bg-white/5 px-4 py-2 rounded-xl border border-slate-200 dark:border-white/5 text-slate-500 text-xs font-bold uppercase tracking-wider">
          {jerseys.length} Total Designs
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Add Jersey Form */}
        <Card className="h-fit">
          <CardHeader title="Add New Design" subtitle="Upload a concept kit for voting" />
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input name="name" label="Design Name" required placeholder="E.g. Neon Strike" />
            <Input name="description" label="Description" required placeholder="Describe the kit..." />
            
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Upload Jersey Image</label>
              <ImageUpload 
                onUploadSuccess={(url) => setUploadedUrl(url)} 
                folder="/jerseys" 
              />
            </div>

            <Button type="submit" className="w-full" loading={loading} disabled={!uploadedUrl}>
              <Plus className="w-4 h-4" /> Save Design
            </Button>
          </form>
        </Card>

        {/* Jersey List */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          {jerseys.map((jersey) => (
            <Card key={jersey.id} className="group relative overflow-hidden p-0 border-slate-200 dark:border-white/5 shadow-xl shadow-black/5 dark:shadow-black/20">
              <div className="aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-white/5 relative">
                <img 
                  src={jersey.imageUrl} 
                  alt={jersey.name} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/400x300?text=Invalid+Image+URL'; }}
                />
                <div className="absolute top-3 left-3 px-2 py-1 bg-primary/90 text-white text-[10px] font-black uppercase rounded shadow-lg backdrop-blur-sm">
                  Official Concept
                </div>
              </div>
              <div className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg" style={{ color: 'var(--text-color)' }}>{jersey.name}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1">{jersey.description}</p>
                  </div>
                  <button 
                    onClick={() => handleDelete(jersey.id)}
                    className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/5">
                  <div className="flex items-center gap-2 text-primary font-black italic uppercase tracking-tighter">
                    <Shirt className="w-5 h-5" />
                    <span>{jersey.voteCount} Votes</span>
                  </div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    ID: {jersey.id.slice(0, 8)}
                  </div>
                </div>

                {/* Voters List */}
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/5">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t.votedBy}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {votes.filter(v => v.jerseyId === jersey.id).map(v => (
                      <span key={v.id} className="px-2 py-0.5 bg-slate-100 dark:bg-white/5 rounded text-[9px] font-bold text-slate-500">
                        {v.playerName}
                      </span>
                    ))}
                    {votes.filter(v => v.jerseyId === jersey.id).length === 0 && (
                      <span className="text-[9px] italic text-slate-400">{t.noVotes}</span>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
          
          {jerseys.length === 0 && (
            <div className="md:col-span-2 py-20 border-2 border-dashed border-slate-200 dark:border-white/5 rounded-3xl flex flex-col items-center justify-center bg-slate-50/50 dark:bg-transparent">
              <ImageIcon className="w-12 h-12 text-slate-200 dark:text-slate-800 mb-2" />
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No designs uploaded yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
