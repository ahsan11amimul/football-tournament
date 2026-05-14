import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, User, Hash, Ruler, DollarSign } from 'lucide-react';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { toast } from 'react-hot-toast';

export default function EditPlayerModal({ player, isOpen, onClose }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      fullName: player?.fullName || '',
      jerseyNumber: player?.jerseyNumber || '',
      jerseySize: player?.jerseySize || '',
      paidAmount: player?.paidAmount || 0,
    }
  });

  const onSubmit = async (data) => {
    try {
      const playerRef = doc(db, 'users', player.id);
      await updateDoc(playerRef, {
        fullName: data.fullName,
        jerseyNumber: parseInt(data.jerseyNumber),
        jerseySize: data.jerseySize,
        paidAmount: parseFloat(data.paidAmount),
      });
      toast.success('Player updated successfully!');
      onClose();
    } catch (error) {
      console.error(error);
      toast.error('Failed to update player');
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
                <h2 className="text-2xl font-black italic uppercase tracking-tight" style={{ color: 'var(--text-color)' }}>Edit Player</h2>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Update Tournament Credentials</p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors group">
                <X className="w-6 h-6 text-slate-400 group-hover:text-primary transition-colors" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-5">
                <Input
                  label="Full Name"
                  placeholder="Player Name"
                  error={errors.fullName?.message}
                  {...register('fullName', { required: 'Name is required' })}
                />
                
                <div className="grid grid-cols-2 gap-5">
                  <Input
                    label="Jersey Number"
                    type="number"
                    placeholder="E.g. 10"
                    error={errors.jerseyNumber?.message}
                    {...register('jerseyNumber', { required: 'Number is required' })}
                  />
                  <Input
                    label="Jersey Size"
                    placeholder="XL, L, M, S"
                    error={errors.jerseySize?.message}
                    {...register('jerseySize', { required: 'Size is required' })}
                  />
                </div>

                <Input
                  label="Paid Amount (৳)"
                  type="number"
                  placeholder="Amount in BDT"
                  error={errors.paidAmount?.message}
                  {...register('paidAmount', { required: 'Amount is required' })}
                />
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
                  <Save className="w-4 h-4" />
                  Save Changes
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
