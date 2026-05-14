import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { User, Phone, Hash, Shirt, DollarSign, Lock, UserPlus } from 'lucide-react';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import AuthLayout from '../layouts/AuthLayout';
import { registerPlayer } from '../features/auth/authService';
import useAuthStore from '../store/useAuthStore';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function Register() {
  const [loading, setLoading] = useState(false);
  const { setUser, setProfile } = useAuthStore();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const { user, profile } = await registerPlayer(data);
      
      setUser(user);
      setProfile(profile);
      toast.success('Registration successful! Welcome to the league.');
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Join the League" 
      subtitle="Create your player profile today"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Full Name"
            placeholder="John Doe"
            error={errors.fullName?.message}
            {...register('fullName', { required: 'Full name is required' })}
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
            placeholder="10"
            error={errors.jerseyNumber?.message}
            {...register('jerseyNumber', { required: 'Required' })}
          />
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300 ml-1">Jersey Size</label>
            <select 
              {...register('jerseySize', { required: 'Required' })}
              className="premium-input w-full appearance-none"
            >
              <option value="S">S</option>
              <option value="M">M</option>
              <option value="L">L</option>
              <option value="XL">XL</option>
              <option value="XXL">XXL</option>
            </select>
          </div>
        </div>

        <Input
          label="Paid Amount (Optional)"
          type="number"
          placeholder="500"
          error={errors.paidAmount?.message}
          {...register('paidAmount')}
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

        <Button 
          type="submit" 
          className="w-full mt-4" 
          loading={loading}
        >
          <UserPlus className="w-4 h-4" />
          Create Profile
        </Button>

        <p className="text-center text-slate-400 text-sm mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:underline font-semibold">
            Login
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
