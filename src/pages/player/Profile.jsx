import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import useAuthStore from '../../store/useAuthStore';
import { Card, CardHeader } from '../../components/Card';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { toast } from 'react-hot-toast';
import { User, Save, RefreshCw, Link as LinkIcon } from 'lucide-react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

import ImageUpload from '../../components/ImageUpload';

export default function Profile() {
  const { profile, setProfile } = useAuthStore();
  const [loading, setLoading] = useState(false);
  
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      fullName: profile?.fullName,
      avatarUrl: profile?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.uid}`
    }
  });

  const avatarUrl = watch('avatarUrl');

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const userRef = doc(db, 'users', profile.uid);
      await updateDoc(userRef, data);
      setProfile({ ...profile, ...data });
      
      MySwal.fire({
        title: 'Profile Updated!',
        text: 'Your identity has been saved.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
        background: 'var(--surface-color)',
        color: 'var(--text-color)'
      });
    } catch (error) {
      console.error(error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const randomizeAvatar = () => {
    const randomSeed = Math.random().toString(36).substring(7);
    setValue('avatarUrl', `https://api.dicebear.com/7.x/avataaars/svg?seed=${randomSeed}`);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      <div>
        <h1 className="text-4xl font-black italic uppercase tracking-tight" style={{ color: 'var(--text-color)' }}>
          Profile Settings
        </h1>
        <p className="text-slate-500 mt-2 font-medium">Manage your tournament identity and visual presence</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Avatar Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="flex flex-col items-center justify-center py-12 border-slate-200 dark:border-white/5 shadow-2xl">
            <div className="relative group">
              <div className="w-48 h-48 rounded-[3rem] bg-slate-100 dark:bg-slate-800 border-4 border-primary/20 overflow-hidden shadow-2xl relative transition-transform duration-500 group-hover:scale-105">
                <img 
                  src={avatarUrl} 
                  alt="Avatar" 
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.src = 'https://api.dicebear.com/7.x/initials/svg?seed=??'; }}
                />
              </div>
              
              <button 
                onClick={randomizeAvatar}
                className="absolute -bottom-2 -right-2 p-3 bg-primary text-white rounded-2xl shadow-xl hover:scale-110 active:scale-95 transition-all z-10"
                title="Randomize Avatar"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mt-8 text-center px-4">
              <h3 className="text-2xl font-black italic uppercase tracking-tight truncate w-full" style={{ color: 'var(--text-color)' }}>
                {profile?.fullName}
              </h3>
              <div className="flex items-center justify-center gap-2 mt-2">
                <span className="px-2 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase rounded border border-primary/10">
                  #{profile?.jerseyNumber || 'N/A'}
                </span>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  {profile?.jerseySize || 'No Size'}
                </span>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-slate-200 dark:border-white/5">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Account Status</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">Role</span>
                <span className="text-xs font-black uppercase text-primary italic">{profile?.role}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">Verified</span>
                <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
              </div>
            </div>
          </Card>
        </div>

        {/* Edit Form */}
        <div className="lg:col-span-8 space-y-8">
          <Card className="border-slate-200 dark:border-white/5 shadow-2xl">
            <CardHeader title="General Information" subtitle="Update your basic profile details" />
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Input
                  label="Display Name"
                  placeholder="John Doe"
                  error={errors.fullName?.message}
                  {...register('fullName', { required: 'Full name is required' })}
                />
                <Input
                  label="Phone Number"
                  value={profile?.phone}
                  disabled
                  className="opacity-60 cursor-not-allowed bg-slate-50 dark:bg-slate-800/50"
                />
              </div>

              <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-white/5">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Upload Profile Picture</label>
                <ImageUpload 
                  onUploadSuccess={(url) => setValue('avatarUrl', url)} 
                  folder="/profiles" 
                />
                <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-white/[0.02] rounded-2xl border border-slate-100 dark:border-white/5">
                  <LinkIcon className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                    You can either upload a new photo, randomize a cartoon avatar, or manually paste an image URL above. 
                    Your photo will be optimized automatically for the tournament dashboard.
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button type="submit" loading={loading} className="w-full md:w-auto h-12 px-10 text-xs font-black uppercase tracking-widest shadow-xl shadow-primary/20">
                  <Save className="w-4 h-4" />
                  Update Profile
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
