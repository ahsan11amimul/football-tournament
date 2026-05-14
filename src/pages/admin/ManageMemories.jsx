import { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Card, CardHeader } from '../../components/Card';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { toast } from 'react-hot-toast';
import { Image as ImageIcon, Link as LinkIcon, Trash2, Save, Plus } from 'lucide-react';
import Swal from 'sweetalert2';

import ImageUpload from '../../components/ImageUpload';

export default function ManageMemories() {
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState("");

  useEffect(() => {
    const q = query(collection(db, 'memories'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMemories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const title = formData.get('title');

    if (!title || !uploadedUrl) {
      return toast.error('Please provide a title and upload an image');
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'memories'), {
        title,
        imageUrl: uploadedUrl,
        createdAt: new Date().toISOString()
      });

      toast.success('Moment saved to memories!');
      setUploadedUrl("");
      e.target.reset();
    } catch (error) {
      console.error(error);
      toast.error('Failed to save memory');
    } finally {
      setLoading(false);
    }
  };

  const deleteMemory = async (memory) => {
    const result = await Swal.fire({
      title: 'Delete this memory?',
      text: "This photo will be removed from the gallery.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#1E293B',
      confirmButtonText: 'Yes, delete it!',
      background: '#0F172A',
      color: '#fff'
    });

    if (result.isConfirmed) {
      try {
        await deleteDoc(doc(db, 'memories', memory.id));
        toast.success('Memory deleted');
      } catch (error) {
        toast.error('Failed to delete');
      }
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text-color)' }}>
            Tournament Memories
          </h1>
          <p className="text-slate-500 mt-1 font-medium">Capture and relive the best moments of the league</p>
        </div>
        <div className="bg-slate-100 dark:bg-white/5 px-4 py-2 rounded-xl border border-slate-200 dark:border-white/5 text-slate-500 text-xs font-bold uppercase tracking-wider">
          {memories.length} Moments Captured
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="h-fit">
          <CardHeader title="Add New Moment" subtitle="Upload a photo to save it forever" />
          <form onSubmit={handleSave} className="space-y-6">
            <Input name="title" label="Moment Title" placeholder="E.g. Squad Goals" required />
            
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Upload Photo</label>
              <ImageUpload 
                onUploadSuccess={(url) => setUploadedUrl(url)} 
                folder="/memories" 
              />
            </div>

            <Button type="submit" className="w-full" loading={loading} disabled={!uploadedUrl}>
              <Plus className="w-4 h-4" /> Save to Gallery
            </Button>
          </form>
        </Card>

        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {memories.map(memory => (
            <Card key={memory.id} className="p-0 overflow-hidden border-slate-200 dark:border-white/5 group shadow-xl shadow-black/5 dark:shadow-black/20">
              <div className="aspect-[16/10] overflow-hidden relative">
                <img 
                  src={memory.imageUrl} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                  alt="" 
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/400x250?text=Invalid+Image+URL'; }}
                />
              </div>
              <div className="p-4 flex items-center justify-between bg-slate-50 dark:bg-surface-glass border-t border-slate-200 dark:border-white/5">
                <div>
                  <p className="font-bold text-sm truncate max-w-[150px]" style={{ color: 'var(--text-color)' }}>{memory.title}</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    {memory.createdAt ? new Date(memory.createdAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <button 
                  onClick={() => deleteMemory(memory)} 
                  className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
