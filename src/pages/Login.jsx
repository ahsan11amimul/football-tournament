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

export default function Login() {
  const [loading, setLoading] = useState(false);
  const { setUser, setProfile } = useAuthStore();
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
      title="Welcome Back" 
      subtitle="Login to access your player dashboard"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="relative">
          <Phone className="absolute left-3 top-10 text-slate-500 w-5 h-5" />
          <Input
            label="Phone Number"
            placeholder="01XXXXXXXXX"
            className="pl-11"
            error={errors.phone?.message}
            {...register('phone', { 
              required: 'Phone number is required'
            })}
          />
        </div>

        <div className="relative">
          <Lock className="absolute left-3 top-10 text-slate-500 w-5 h-5" />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            className="pl-11"
            error={errors.password?.message}
            {...register('password', { required: 'Password is required' })}
          />
        </div>

        <Button 
          type="submit" 
          className="w-full mt-2" 
          loading={loading}
        >
          <LogIn className="w-4 h-4" />
          Login Now
        </Button>

        <p className="text-center text-slate-400 text-sm mt-4">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary hover:underline font-semibold">
            Register as Player
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
