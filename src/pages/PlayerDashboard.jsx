import { Routes, Route, Navigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Trophy, 
  Shirt, 
  CreditCard, 
  PieChart,
  MessageSquare,
  User as UserIcon,
  Image as ImageIcon,
  Shield
} from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import useAuthStore from '../store/useAuthStore';
import { translations } from '../utils/translations';

// Sub-pages
import PlayerOverview from './player/PlayerOverview';
import PlayerPayments from './player/PlayerPayments';
import JerseyVoting from './player/JerseyVoting';
import PlayerMatches from './player/PlayerMatches';
import TeamInfo from './player/TeamInfo';
import AllPlayers from './player/AllPlayers';
import Profile from './player/Profile';
import Memories from './player/Memories';
import JerseySheet from './admin/JerseySheet';
import GlobalChat from '../features/chat/GlobalChat';

export default function PlayerDashboard() {
  const { language } = useAuthStore();
  const t = translations[language];

  const PLAYER_MENU = [
    { label: t.dashboard, path: '/dashboard', icon: LayoutDashboard },
    { label: t.chat, path: '/dashboard/chat', icon: MessageSquare },
    { label: t.memories, path: '/dashboard/memories', icon: ImageIcon },
    { label: t.jerseys, path: '/dashboard/jerseys', icon: Shirt },
    { label: t.jerseySheet, path: '/dashboard/jersey-sheet', icon: Shield },
    { label: t.payments, path: '/dashboard/payments', icon: CreditCard },
    { label: t.matches, path: '/dashboard/matches', icon: Calendar },
    { label: t.teams, path: '/dashboard/team', icon: Trophy },
    { label: t.players, path: '/dashboard/players', icon: Users },
    { label: t.profile, path: '/dashboard/profile', icon: UserIcon },
  ];

  return (
    <DashboardLayout menuItems={PLAYER_MENU} variant="player">
      <Routes>
        <Route index element={<PlayerOverview />} />
        <Route path="chat" element={<GlobalChat />} />
        <Route path="memories" element={<Memories />} />
        <Route path="jerseys" element={<JerseyVoting />} />
        <Route path="jersey-sheet" element={<JerseySheet />} />
        <Route path="payments" element={<PlayerPayments />} />
        <Route path="matches" element={<PlayerMatches />} />
        <Route path="team" element={<TeamInfo />} />
        <Route path="players" element={<AllPlayers />} />
        <Route path="profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </DashboardLayout>
  );
}
