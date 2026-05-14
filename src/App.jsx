import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './lib/firebase';
import useAuthStore from './store/useAuthStore';
import { getProfile } from './features/auth/authService';
import useBrandingStore from './store/useBrandingStore';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import PlayerDashboard from './pages/PlayerDashboard';
import AdminDashboard from './pages/AdminDashboard';

// Components
import LoadingScreen from './components/LoadingScreen';

function ProtectedRoute({ children, role }) {
  const { user, profile, loading } = useAuthStore();

  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" />;
  if (role && profile?.role !== role) return <Navigate to="/dashboard" />;

  return children;
}

function App() {
  const { setUser, setProfile, setLoading } = useAuthStore();
  const { subscribeBranding } = useBrandingStore();

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        const profile = await getProfile(user.uid);
        setProfile(profile);
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    const unsubBranding = subscribeBranding();

    return () => {
      unsubAuth();
      unsubBranding();
    };
  }, [setUser, setProfile, setLoading, subscribeBranding]);

  return (
    <Router>
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#1E293B',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)',
          },
        }}
      />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Player Routes */}
        <Route path="/dashboard/*" element={
          <ProtectedRoute role="player">
            <PlayerDashboard />
          </ProtectedRoute>
        } />

        {/* Admin Routes */}
        <Route path="/admin/*" element={
          <ProtectedRoute role="admin">
            <AdminDashboard />
          </ProtectedRoute>
        } />

        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
