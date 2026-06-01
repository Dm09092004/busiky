import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import MyDay from './pages/MyDay';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import Analytics from './pages/Analytics';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import { CircularProgress, Box } from '@mui/material';

// Защищённый маршрут: только для авторизованных
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }
  return user ? children : <Navigate to="/login" />;
};

// Защищённый маршрут только для менеджера/админа
const ManagerRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }
  if (!user) return <Navigate to="/login" />;
  if (!['manager', 'admin'].includes(user.role)) return <Navigate to="/projects" />;
  return children;
};

const withLayout = (Component) => (
  <PrivateRoute>
    <Layout>
      <Component />
    </Layout>
  </PrivateRoute>
);

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        <Routes>
          {/* Публичные */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Для всех авторизованных */}
          <Route path="/my-day" element={
            <PrivateRoute><Layout><MyDay /></Layout></PrivateRoute>
          } />
          <Route path="/projects" element={
            <PrivateRoute><Layout><Projects /></Layout></PrivateRoute>
          } />
          <Route path="/projects/:id" element={
            <PrivateRoute><Layout><ProjectDetail /></Layout></PrivateRoute>
          } />
          <Route path="/profile" element={
            <PrivateRoute><Layout><Profile /></Layout></PrivateRoute>
          } />

          {/* Только для менеджера/админа */}
          <Route path="/dashboard" element={
            <ManagerRoute><Layout><Dashboard /></Layout></ManagerRoute>
          } />
          <Route path="/projects/:id/analytics" element={
            <ManagerRoute><Layout><Analytics /></Layout></ManagerRoute>
          } />

          {/* Редирект с корня */}
          <Route path="/" element={<Navigate to="/my-day" />} />
          <Route path="*" element={<Navigate to="/my-day" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
