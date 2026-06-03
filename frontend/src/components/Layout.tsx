import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTimer } from '../context/TimerContext';
import { useTheme } from '../context/ThemeContext';
import NotificationsPanel from './NotificationsPanel';
import SettingsPanel from './SettingsPanel';
import {
  LayoutDashboard,
  FolderKanban,
  CalendarDays,
  BarChart3,
  User,
  LogOut,
  Menu,
  X,
  Cat,
  Settings,
  Bell,
  Play,
  Pause,
  Timer,
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: 'Дашборд', href: '/dashboard', icon: LayoutDashboard, roles: ['manager'] },
  { name: 'Проекты', href: '/projects', icon: FolderKanban, roles: ['manager', 'developer', 'designer', 'tester', 'analyst'] },
  { name: 'Мой день', href: '/my-day', icon: CalendarDays, roles: ['developer', 'designer', 'tester', 'analyst'] },
  { name: 'Аналитика', href: '/analytics', icon: BarChart3, roles: ['manager'] },
  { name: 'Профиль', href: '/profile', icon: User, roles: ['manager', 'developer', 'designer', 'tester', 'analyst'] },
];

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const { phase, timeLeft, isRunning, activeTaskName, startTimer, pauseTimer } = useTimer();
  const { colors } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const filteredNav = navigation.filter(item => 
    user && item.roles.includes(user.role)
  );

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getPhaseLabel = () => {
    switch (phase) {
      case 'work': return 'Работа';
      case 'short_break': return 'Перерыв';
      case 'long_break': return 'Отдых';
      default: return '';
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${colors.bgGradient}`}>
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? '' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 w-72 bg-white shadow-xl animate-slideRight">
          <div className="flex h-16 items-center justify-between px-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colors.gradient} flex items-center justify-center`}>
                <Cat className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-800">Studio KIT</span>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="text-gray-500 hover:text-gray-700">
              <X className="w-6 h-6" />
            </button>
          </div>
          <nav className="p-4 space-y-1">
            {filteredNav.map(item => (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  location.pathname === item.href
                    ? `bg-gradient-to-r ${colors.gradient} text-white shadow-lg`
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white/80 backdrop-blur-xl border-r border-gray-100 shadow-xl">
          <div className="flex h-20 items-center px-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${colors.gradient} flex items-center justify-center shadow-lg`}>
                <Cat className="w-7 h-7 text-white" />
              </div>
              <div>
                <span className={`text-xl font-bold ${colors.text}`}>Studio KIT</span>
                <p className="text-xs text-gray-500">Управление проектами</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {filteredNav.map(item => (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  location.pathname === item.href || location.pathname.startsWith(item.href + '/')
                    ? `bg-gradient-to-r ${colors.gradient} text-white shadow-lg`
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            ))}
          </nav>

          {/* User Card */}
          <div className="p-4 border-t border-gray-100">
            <div className={`flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r ${colors.bgGradient}`}>
              <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${colors.gradient} flex items-center justify-center text-white font-semibold`}>
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500 truncate capitalize">{user?.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-white transition-colors"
                title="Выйти"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Top bar */}
        <header className="sticky top-0 z-40 h-16 bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm">
          <div className="flex items-center justify-between h-full px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100"
              >
                <Menu className="w-6 h-6" />
              </button>

              <div className="hidden lg:block">
                <h1 className="text-lg font-semibold text-gray-800">
                  {filteredNav.find(n => location.pathname === n.href || location.pathname.startsWith(n.href + '/'))?.name || 'Studio KIT'}
                </h1>
              </div>
            </div>

            {/* Timer in header */}
            {(isRunning || phase !== 'idle') && (
              <div className={`hidden sm:flex items-center gap-3 px-4 py-2 rounded-xl ${
                phase === 'work' 
                  ? `bg-gradient-to-r ${colors.gradient} text-white` 
                  : 'bg-blue-100 text-blue-700'
              } animate-fadeIn`}>
                <Timer className="w-4 h-4" />
                <div className="text-center">
                  <p className="text-xs opacity-80">{getPhaseLabel()}</p>
                  <p className="text-lg font-bold font-mono">{formatTime(timeLeft)}</p>
                </div>
                {activeTaskName && (
                  <div className="hidden md:block border-l border-white/30 pl-3 max-w-[150px]">
                    <p className="text-xs truncate">{activeTaskName}</p>
                  </div>
                )}
                <button
                  onClick={() => isRunning ? pauseTimer() : startTimer()}
                  className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                >
                  {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
              </div>
            )}

            <div className="flex items-center gap-2">
              {/* Notifications */}
              <div className="relative">
                <button 
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    setShowSettings(false);
                  }}
                  className={`p-2 rounded-lg transition-colors relative ${
                    showNotifications 
                      ? `${colors.text} bg-gray-100` 
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                </button>
                {showNotifications && (
                  <NotificationsPanel onClose={() => setShowNotifications(false)} />
                )}
              </div>

              {/* Settings */}
              <div className="relative">
                <button 
                  onClick={() => {
                    setShowSettings(!showSettings);
                    setShowNotifications(false);
                  }}
                  className={`p-2 rounded-lg transition-colors ${
                    showSettings 
                      ? `${colors.text} bg-gray-100` 
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Settings className={`w-5 h-5 ${showSettings ? 'animate-spin' : ''}`} style={{ animationDuration: '3s' }} />
                </button>
                {showSettings && (
                  <SettingsPanel onClose={() => setShowSettings(false)} />
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
