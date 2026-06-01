import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import {
  Box, TextField, Button, Typography, Alert,
  InputAdornment, IconButton, CircularProgress,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
    } catch {
      setError('Неверное имя пользователя или пароль');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        bgcolor: 'background.default',
      }}
    >
      {/* Left decorative panel */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          width: '45%',
          background: 'linear-gradient(145deg, #1A7A6E 0%, #2D9C8E 50%, #52B788 100%)',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          p: 6,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative circles */}
        {[...Array(4)].map((_, i) => (
          <Box
            key={i}
            sx={{
              position: 'absolute',
              width: 200 + i * 120,
              height: 200 + i * 120,
              borderRadius: '50%',
              border: '1px solid rgba(255,255,255,0.1)',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          />
        ))}
        <Box sx={{ position: 'relative', textAlign: 'center', color: 'white' }}>
          <Box
            sx={{
              width: 72, height: 72, borderRadius: '20px',
              bgcolor: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(10px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              mx: 'auto', mb: 3,
              border: '1px solid rgba(255,255,255,0.3)',
            }}
          >
            <Typography sx={{ fontSize: 32, fontWeight: 800 }}>К</Typography>
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Студия КИТ
          </Typography>
          <Typography sx={{ opacity: 0.8, fontSize: 16, maxWidth: 280 }}>
            Система управления проектами для вашей команды
          </Typography>

          <Box sx={{ mt: 6, display: 'flex', flexDirection: 'column', gap: 2, textAlign: 'left' }}>
            {[
              'Умное расписание с техникой Pomodoro',
              'Тайм-трекинг и аналитика задач',
              'Дашборд менеджера в реальном времени',
            ].map((feat) => (
              <Box key={feat} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{
                  width: 6, height: 6, borderRadius: '50%',
                  bgcolor: 'rgba(255,255,255,0.7)', flexShrink: 0,
                }} />
                <Typography sx={{ opacity: 0.85, fontSize: 14 }}>{feat}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* Right login panel */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 3, md: 6 },
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 400 }}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
              Добро пожаловать
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Войдите в свой аккаунт, чтобы продолжить
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: '10px' }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.75, color: 'text.primary' }}>
                Имя пользователя
              </Typography>
              <TextField
                fullWidth
                placeholder="Введите имя пользователя"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                size="small"
                sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'white' } }}
              />
            </Box>

            <Box>
              <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.75, color: 'text.primary' }}>
                Пароль
              </Typography>
              <TextField
                fullWidth
                placeholder="Введите пароль"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                size="small"
                sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'white' } }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                        {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mt: 1, py: 1.5 }}
            >
              {loading ? <CircularProgress size={20} color="inherit" /> : 'Войти'}
            </Button>

            <Typography align="center" variant="body2" color="text.secondary">
              Нет аккаунта?{' '}
              <Link to="/register" style={{ color: '#2D9C8E', fontWeight: 600, textDecoration: 'none' }}>
                Зарегистрироваться
              </Link>
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Login;
