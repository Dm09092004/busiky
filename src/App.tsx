// =====================================================
//  Главный компонент: провайдеры + роутинг + тема
// =====================================================
import { ThemeProvider, CssBaseline } from '@mui/material';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { mintTheme, darkTheme } from './theme';
import { AppProvider, useApp } from './context/AppContext';
import { Layout } from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MyDay from './pages/MyDay';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import Analytics from './pages/Analytics';
import Profile from './pages/Profile';
import { logger } from './utils/logger';
import { useEffect, useState, useMemo } from 'react';

interface ProtectedRoutesProps {
  onToggleTheme: () => void;
  themeMode: 'light' | 'dark';
}

function ProtectedRoutes({ onToggleTheme, themeMode }: ProtectedRoutesProps) {
  const { user } = useApp();

  useEffect(() => {
    if (user) {
      logger.info('app', `Активный пользователь: ${user.first_name} ${user.last_name} (${user.role})`);
    }
  }, [user]);

  if (!user) return <Navigate to="/login" replace />;

  return (
    <Routes>
      <Route element={<Layout onToggleTheme={onToggleTheme} themeMode={themeMode} />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/myday" element={<MyDay />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/:id" element={<ProjectDetail />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}

function PublicRoutes() {
  const { user } = useApp();
  if (user) return <Navigate to="/dashboard" replace />;
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Login />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  const [mode, setMode] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('kit_pm_theme');
    return (saved === 'dark' ? 'dark' : 'light');
  });

  const theme = useMemo(() => mode === 'dark' ? darkTheme : mintTheme, [mode]);

  useEffect(() => {
    localStorage.setItem('kit_pm_theme', mode);
    document.documentElement.style.colorScheme = mode;
  }, [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppProvider>
        <BrowserRouter>
          <RouterSwitch onToggleTheme={() => setMode(m => m === 'light' ? 'dark' : 'light')} themeMode={mode} />
        </BrowserRouter>
      </AppProvider>
    </ThemeProvider>
  );
}

function RouterSwitch({ onToggleTheme, themeMode }: { onToggleTheme: () => void; themeMode: 'light' | 'dark' }) {
  const { user } = useApp();
  return user ? <ProtectedRoutes onToggleTheme={onToggleTheme} themeMode={themeMode} /> : <PublicRoutes />;
}
