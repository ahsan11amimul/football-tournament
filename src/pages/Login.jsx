import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Phone, Lock, LogIn } from 'lucide-react';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import AuthLayout from '../layouts/AuthLayout';
import { loginWithPhone } from '../features/auth/authService';
import useAuthStore from '../store/useAuthStore';
import { translations } from '../utils/translations';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const { language, setUser, setProfile } = useAuthStore();
  const t = translations[language] || translations['en'];
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const { user, profile } = await loginWithPhone(data.phone, data.password);
      setUser(user);
      setProfile(profile);
      toast.success('Welcome back, Champion!');
      navigate(profile.role === 'admin' ? '/admin' : '/dashboard');
    } catch (error) {
      console.error(error);
      toast.error('Invalid phone number or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout 
      title={t.loginTitle} 
      subtitle={t.loginSubtitle}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="relative">
          <Phone className="absolute left-3 top-10 text-slate-500 w-5 h-5" />
          <Input
            label={t.phone}
            placeholder="01XXXXXXXXX"
            className="pl-11"
            error={errors.phone?.message}
            {...register('phone', { 
              required: t.phoneRequired
            })}
          />
        </div>

        <div className="relative">
          <Lock className="absolute left-3 top-10 text-slate-500 w-5 h-5" />
          <Input
            label={t.password}
            type="password"
            placeholder="••••••••"
            className="pl-11"
            error={errors.password?.message}
            {...register('password', { required: t.passwordRequired })}
          />
        </div>

        <Button 
          type="submit" 
          className="w-full mt-2" 
          loading={loading}
        >
          <LogIn className="w-4 h-4" />
          {t.loginBtn}
        </Button>

        <p className="text-center text-slate-400 text-sm mt-4">
          {t.dontHaveAccount}{' '}
          <Link to="/register" className="text-primary hover:underline font-semibold">
            {t.registerLink}
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
