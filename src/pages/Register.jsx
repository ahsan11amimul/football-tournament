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
import { translations } from '../utils/translations';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function Register() {
  const [loading, setLoading] = useState(false);
  const { language, setUser, setProfile } = useAuthStore();
  const t = translations[language] || translations['en'];
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
      title={t.registerTitle} 
      subtitle={t.registerSubtitle}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label={t.fullName}
            placeholder="John Doe"
            error={errors.fullName?.message}
            {...register('fullName', { required: t.fullNameRequired })}
          />
          <Input
            label={t.phone}
            placeholder="01XXXXXXXXX"
            error={errors.phone?.message}
            {...register('phone', { required: t.phoneRequired })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label={t.jerseyNumber}
            type="number"
            placeholder="10"
            error={errors.jerseyNumber?.message}
            {...register('jerseyNumber', { required: t.required })}
          />
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300 ml-1">{t.jerseySize}</label>
            <select 
              {...register('jerseySize', { required: t.required })}
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
          label={t.paidAmountLabel}
          type="number"
          placeholder="500"
          error={errors.paidAmount?.message}
          {...register('paidAmount')}
        />

        <Input
          label={t.password}
          type="password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register('password', { 
            required: t.passwordRequired,
            minLength: { value: 6, message: t.minPassword }
          })}
        />

        <Button 
          type="submit" 
          className="w-full mt-4" 
          loading={loading}
        >
          <UserPlus className="w-4 h-4" />
          {t.registerBtn}
        </Button>

        <p className="text-center text-slate-400 text-sm mt-4">
          {t.alreadyHaveAccount}{' '}
          <Link to="/login" className="text-primary hover:underline font-semibold">
            {t.loginLink}
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
