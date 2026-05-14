import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Card } from '../../components/Card';
import { Camera, Image as ImageIcon, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Memories() {
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const q = query(collection(db, 'memories'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMemories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter">Tournament Wall of Fame</h1>
          <p className="text-slate-400 mt-1">Saved memories and group moments from the night</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {memories.map((memory, idx) => (
          <motion.div
            key={memory.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            onClick={() => setSelectedImage(memory)}
            className="cursor-pointer"
          >
            <Card className="p-0 overflow-hidden border-white/5 bg-white/[0.02] hover:bg-white/5 group transition-all duration-300 hover:-translate-y-2">
              <div className="aspect-square overflow-hidden relative">
                <img 
                  src={memory.imageUrl} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                  alt={memory.title} 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  <div className="w-full">
                    <p className="text-white font-black text-xs uppercase tracking-widest">{memory.title}</p>
                    <p className="text-primary text-[8px] font-bold mt-1 uppercase">
                      {new Date(memory.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}

        {memories.length === 0 && !loading && (
          <div className="col-span-full py-32 text-center glass-card border-dashed">
            <ImageIcon className="w-16 h-16 text-slate-800 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white">No memories yet</h3>
            <p className="text-slate-500 mt-2">The wall of fame is waiting for its first moment.</p>
          </div>
        )}
      </div>

      {/* Lightbox Overlay */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-12 cursor-zoom-out"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="max-w-6xl w-full flex flex-col items-center"
            >
              <img 
                src={selectedImage.imageUrl} 
                alt={selectedImage.title} 
                className="max-h-[80vh] w-auto object-contain rounded-2xl shadow-2xl shadow-primary/20"
              />
              <div className="mt-8 text-center">
                <h2 className="text-2xl md:text-4xl font-black text-white italic uppercase">{selectedImage.title}</h2>
                <p className="text-primary font-bold mt-2 uppercase tracking-widest text-sm">
                  {new Date(selectedImage.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
