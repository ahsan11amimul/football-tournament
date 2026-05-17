import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, UserPlus } from 'lucide-react';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { doc, setDoc } from 'firebase/firestore';
import { db, firebaseConfig } from '../../lib/firebase';
import { toast } from 'react-hot-toast';

// To create auth users without logging out the current admin
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';

// Initialize a secondary app for admin operations
const secondaryApp = initializeApp(firebaseConfig, 'Secondary');
const secondaryAuth = getAuth(secondaryApp);

const phoneToEmail = (phone) => {
  let clean = String(phone).replace(/\D/g, '');
  if (clean.startsWith('880')) clean = clean.substring(2); 
  if (clean.length === 10) clean = '0' + clean;
  return `${clean}@tournament.com`;
};

export default function AddPlayerModal({ isOpen, onClose }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const email = phoneToEmail(data.phone);

      // Create user in secondary Auth app
      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, data.password);
      const user = userCredential.user;

      // Save to Firestore using the primary db (admin is already authenticated)
      const playerRef = doc(db, 'users', user.uid);
      await setDoc(playerRef, {
        uid: user.uid,
        fullName: data.fullName,
        phone: data.phone,
        jerseyNumber: parseInt(data.jerseyNumber),
        jerseySize: data.jerseySize,
        paidAmount: parseFloat(data.paidAmount) || 0,
        role: 'player',
        createdAt: new Date().toISOString(),
        status: 'active'
      });

      toast.success('Player added successfully!');
      
      // We sign out from the secondary app to clean up its session, though it shouldn't affect the main app
      await secondaryAuth.signOut();
      
      reset();
      onClose();
    } catch (error) {
      console.error(error);
      if (error.code === 'auth/email-already-in-use') {
         toast.error('A player with this phone number is already registered.');
      } else {
         toast.error('Failed to add player: ' + error.message);
      }
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
                <h2 className="text-2xl font-black italic uppercase tracking-tight" style={{ color: 'var(--text-color)' }}>Add Player</h2>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Register New Athlete</p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors group">
                <X className="w-6 h-6 text-slate-400 group-hover:text-primary transition-colors" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                    label="Full Name"
                    placeholder="Player Name"
                    error={errors.fullName?.message}
                    {...register('fullName', { required: 'Name is required' })}
                    />
                    <Input
                    label="Phone Number"
                    placeholder="01XXXXXXXXX"
                    error={errors.phone?.message}
                    {...register('phone', { required: 'Phone is required' })}
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

                <div className="grid grid-cols-2 gap-4">
                    <Input
                    label="Paid Amount (৳)"
                    type="number"
                    placeholder="E.g. 500"
                    error={errors.paidAmount?.message}
                    {...register('paidAmount', { required: 'Amount is required' })}
                    />
                    <Input
                    label="Password"
                    type="password"
                    placeholder="••••••••"
                    error={errors.password?.message}
                    {...register('password', { 
                        required: 'Password is required',
                        minLength: { value: 6, message: 'Minimum 6 characters' }
                    })}
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
                  <UserPlus className="w-4 h-4" />
                  Add Player
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
