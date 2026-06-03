import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { TimerProvider } from './context/TimerContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import ProjectForm from './pages/ProjectForm';
import MyDay from './pages/MyDay';
import Analytics from './pages/Analytics';
import Profile from './pages/Profile';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Загрузка...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={user?.role === 'manager' ? '/dashboard' : '/my-day'} />;
  }

  return <>{children}</>;
}

function Home() {
  const { user } = useAuth();
  return <Navigate to={user?.role === 'manager' ? '/dashboard' : '/my-day'} />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
      <Route path="/dashboard" element={<PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>} />
      <Route path="/projects" element={<PrivateRoute><Layout><Projects /></Layout></PrivateRoute>} />
      <Route path="/projects/new" element={<PrivateRoute><Layout><ProjectForm /></Layout></PrivateRoute>} />
      <Route path="/projects/:id" element={<PrivateRoute><Layout><ProjectDetail /></Layout></PrivateRoute>} />
      <Route path="/projects/:id/edit" element={<PrivateRoute><Layout><ProjectForm /></Layout></PrivateRoute>} />
      <Route path="/my-day" element={<PrivateRoute><Layout><MyDay /></Layout></PrivateRoute>} />
      <Route path="/analytics" element={<PrivateRoute><Layout><Analytics /></Layout></PrivateRoute>} />
      <Route path="/profile" element={<PrivateRoute><Layout><Profile /></Layout></PrivateRoute>} />
      <Route path="*" element={
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-6xl font-bold text-emerald-500 mb-4">404</h1>
            <p className="text-gray-600 mb-6">Страница не найдена</p>
            <a href="/" className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium rounded-xl">
              На главную
            </a>
          </div>
        </div>
      } />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <TimerProvider>
            <DataProvider>
              <AppRoutes />
            </DataProvider>
          </TimerProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
