import { Routes, Route, Navigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Trophy, 
  Shirt, 
  CreditCard, 
  PieChart,
  Settings,
  MessageSquare,
  User as UserIcon,
  Image as ImageIcon,
  Shield
} from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import useAuthStore from '../store/useAuthStore';
import { translations } from '../utils/translations';

// Sub-pages
import AdminOverview from './admin/AdminOverview';
import ManagePlayers from './admin/ManagePlayers';
import ApprovePayments from './admin/ApprovePayments';
import ManageMatches from './admin/ManageMatches';
import ManageJerseys from './admin/ManageJerseys';
import JerseySheet from './admin/JerseySheet';
import FinanceSystem from './admin/FinanceSystem';
import ManageTeams from './admin/ManageTeams';
import ManageMemories from './admin/ManageMemories';
import Profile from './player/Profile';
import BrandingSettings from './admin/BrandingSettings';
import GlobalChat from '../features/chat/GlobalChat';

export default function AdminDashboard() {
  const { language } = useAuthStore();
  const t = translations[language];

  const ADMIN_MENU = [
    { label: t.dashboard, path: '/admin', icon: LayoutDashboard },
    { label: t.chat, path: '/admin/chat', icon: MessageSquare },
    { label: t.memories, path: '/admin/memories', icon: ImageIcon },
    { label: t.players, path: '/admin/players', icon: Users },
    { label: t.teams, path: '/admin/teams', icon: Shield },
    { label: t.payments, path: '/admin/payments', icon: CreditCard },
    { label: t.matches, path: '/admin/matches', icon: Calendar },
    { label: t.jerseys, path: '/admin/jerseys', icon: Shirt },
    { label: t.jerseySheet, path: '/admin/jersey-sheet', icon: Shield },
    { label: t.finance, path: '/admin/finance', icon: PieChart },
    { label: t.profile, path: '/admin/profile', icon: UserIcon },
    { label: t.branding, path: '/admin/branding', icon: Settings },
  ];

  return (
    <DashboardLayout menuItems={ADMIN_MENU} variant="admin">
      <Routes>
        <Route index element={<AdminOverview />} />
        <Route path="chat" element={<GlobalChat />} />
        <Route path="memories" element={<ManageMemories />} />
        <Route path="players" element={<ManagePlayers />} />
        <Route path="teams" element={<ManageTeams />} />
        <Route path="payments" element={<ApprovePayments />} />
        <Route path="matches" element={<ManageMatches />} />
        <Route path="jerseys" element={<ManageJerseys />} />
        <Route path="jersey-sheet" element={<JerseySheet />} />
        <Route path="finance" element={<FinanceSystem />} />
        <Route path="profile" element={<Profile />} />
        <Route path="branding" element={<BrandingSettings />} />
        <Route path="*" element={<Navigate to="/admin" />} />
      </Routes>
    </DashboardLayout>
  );
}
