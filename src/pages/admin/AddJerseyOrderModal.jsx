import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shirt } from 'lucide-react';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { collection, addDoc, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { toast } from 'react-hot-toast';

export default function AddJerseyOrderModal({ isOpen, onClose }) {
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingPlayers, setExistingPlayers] = useState([]);

  useEffect(() => {
    if (isOpen) {
      const fetchPlayers = async () => {
        try {
          const q = query(collection(db, 'users'), orderBy('fullName', 'asc'));
          const snapshot = await getDocs(q);
          const players = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setExistingPlayers(players.filter(p => p.role === 'player'));
        } catch (error) {
          console.error("Failed to fetch players", error);
        }
      };
      fetchPlayers();
    }
  }, [isOpen]);

  const handlePlayerSelect = (e) => {
    const selectedPlayerId = e.target.value;
    if (selectedPlayerId) {
      const player = existingPlayers.find(p => p.id === selectedPlayerId);
      if (player) {
        setValue('fullName', player.fullName || '');
        setValue('jerseyNumber', player.jerseyNumber || '');
        setValue('jerseySize', player.jerseySize || '');
      }
    } else {
      setValue('fullName', '');
      setValue('jerseyNumber', '');
      setValue('jerseySize', '');
    }
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'jersey_orders'), {
        fullName: data.fullName,
        jerseyNumber: parseInt(data.jerseyNumber) || 0,
        jerseySize: data.jerseySize,
        paidAmount: parseFloat(data.paidAmount) || 0,
        createdAt: new Date().toISOString(),
      });

      toast.success('Jersey order added successfully!');
      reset();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error('Failed to add order: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl border border-slate-200 dark:border-white/10"
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-black italic uppercase tracking-tight" style={{ color: 'var(--text-color)' }}>Add Jersey Order</h2>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Register New Jersey Order</p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors group">
                <X className="w-6 h-6 text-slate-400 group-hover:text-primary transition-colors" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-500 dark:text-slate-300 ml-1">Select Existing Player (Optional)</label>
                  <select 
                    onChange={handlePlayerSelect}
                    className="premium-input w-full appearance-none"
                  >
                    <option value="">-- Custom Name (No profile auto-fill) --</option>
                    {existingPlayers.map(p => (
                      <option key={p.id} value={p.id}>{p.fullName} (Current Jersey: #{p.jerseyNumber || 'N/A'}, Size: {p.jerseySize || 'N/A'})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    <Input
                    label="Full Name"
                    placeholder="Player Name"
                    error={errors.fullName?.message}
                    {...register('fullName', { required: 'Name is required' })}
                    />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Jersey Number"
                    type="number"
                    placeholder="E.g. 10"
                    error={errors.jerseyNumber?.message}
                    {...register('jerseyNumber', { required: 'Number is required' })}
                  />
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-500 dark:text-slate-300 ml-1">Jersey Size</label>
                    <select 
                      {...register('jerseySize', { required: 'Required' })}
                      className="premium-input w-full appearance-none"
                    >
                      <option value="">Select Size</option>
                      <option value="S">S</option>
                      <option value="M">M</option>
                      <option value="L">L</option>
                      <option value="XL">XL</option>
                      <option value="XXL">XXL</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    <Input
                    label="Paid Amount (৳)"
                    type="number"
                    placeholder="E.g. 500"
                    error={errors.paidAmount?.message}
                    {...register('paidAmount', { required: 'Amount is required' })}
                    />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onClose} 
                  className="flex-1 border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/5"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  variant="primary" 
                  className="flex-1 shadow-lg shadow-primary/30"
                  loading={isSubmitting}
                >
                  <Shirt className="w-4 h-4" />
                  Add Order
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
