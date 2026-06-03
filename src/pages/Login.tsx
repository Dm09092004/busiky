// =====================================================
//  Страница входа
// =====================================================
import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box, Paper, Typography, TextField, Button, Alert, Link, Divider, Chip,
} from '@mui/material';
import { Icon } from '../components/Icons';
import { useApp } from '../context/AppContext';

const DEMO_ACCOUNTS = [
  { user: 'manager', role: 'Менеджер проектов' },
  { user: 'dmitry',  role: 'Frontend-разработчик' },
  { user: 'elena',   role: 'Backend-разработчик' },
  { user: 'artem',   role: 'UI/UX дизайнер' },
];

export default function Login() {
  const { login, notify } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: 'manager', password: 'demo' });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(form.username, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка входа');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #E0F2F1 0%, #F5F9F8 50%, #FFFFFF 100%)',
      p: 2,
    }}>
      <Paper elevation={6} sx={{
        width: '100%', maxWidth: 880, borderRadius: 4, overflow: 'hidden',
        display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.1fr 1fr' },
        border: '1px solid', borderColor: 'primary.light',
      }}>
        {/* Левая панель — брендинг */}
        <Box sx={{
          p: 5, color: '#fff',
          background: 'linear-gradient(135deg, #4DB6AC 0%, #26A69A 100%)',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          position: 'relative', overflow: 'hidden',
        }}>
          <Box sx={{
            position: 'absolute', top: -60, right: -60, width: 220, height: 220,
            borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.08)',
          }} />
          <Box sx={{
            position: 'absolute', bottom: -40, left: -40, width: 160, height: 160,
            borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.06)',
          }} />
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 4, position: 'relative' }}>
              <Box sx={{
                width: 44, height: 44, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.18)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: 22, backdropFilter: 'blur(8px)',
              }}>K</Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1 }}>KIT PM</Typography>
                <Typography variant="caption" sx={{ opacity: 0.85 }}>Студия КИТ · Краснодар</Typography>
              </Box>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, lineHeight: 1.2, position: 'relative' }}>
              Управляйте проектами —<br/>а не таблицами
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.92, lineHeight: 1.6, position: 'relative' }}>
              Анализ сложности по ТЗ, подбор сотрудников с учётом навыков и загрузки,
              генерация дорожной карты и Pomodoro-расписание — всё в одной системе.
            </Typography>
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mt: 4, position: 'relative' }}>
            {[
              { icon: <Icon.Sparkle size={18} />, label: 'AI-анализ ТЗ' },
              { icon: <Icon.Team size={18} />,    label: 'Подбор команды' },
              { icon: <Icon.Calendar size={18} />, label: 'Pomodoro 45/5/15' },
              { icon: <Icon.Trending size={18} />, label: 'План/факт' },
            ].map((f) => (
              <Box key={f.label} sx={{
                display: 'flex', alignItems: 'center', gap: 1, p: 1.2,
                bgcolor: 'rgba(255,255,255,0.12)', borderRadius: 2,
                backdropFilter: 'blur(6px)',
              }}>
                {f.icon}
                <Typography variant="caption" sx={{ fontWeight: 500 }}>{f.label}</Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Правая панель — форма */}
        <Box sx={{ p: { xs: 3, md: 5 }, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.dark', mb: 0.5 }}>
            Вход в систему
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
            Введите учётные данные или выберите демо-аккаунт ниже.
          </Typography>

          <form onSubmit={submit}>
            <TextField
              fullWidth label="Логин" margin="normal" required autoComplete="username"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
            />
            <TextField
              fullWidth label="Пароль" type="password" margin="normal" required autoComplete="current-password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
            <Button
              type="submit" variant="contained" fullWidth size="large"
              disabled={loading} sx={{ mt: 3, py: 1.4, fontSize: 15 }}
              startIcon={<Icon.ChevronRight size={18} />}
            >
              {loading ? 'Вход...' : 'Войти'}
            </Button>
          </form>

          <Divider sx={{ my: 2.5 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>демо-аккаунты</Typography>
          </Divider>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mb: 2 }}>
            {DEMO_ACCOUNTS.map((a) => (
              <Chip
                key={a.user} label={`${a.user} · ${a.role}`}
                size="small" clickable variant="outlined"
                onClick={() => { setForm({ username: a.user, password: 'demo' }); notify(`Выбран демо-аккаунт: ${a.user}`, 'info'); }}
                sx={{ justifyContent: 'flex-start', borderColor: 'primary.light', '&:hover': { bgcolor: 'rgba(77, 182, 172, 0.08)' } }}
              />
            ))}
          </Box>
          <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', color: 'text.secondary' }}>
            Пароль для всех: <strong>demo</strong>
          </Typography>
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Link component={RouterLink} to="/register" variant="body2" sx={{ color: 'primary.main' }}>
              Нет аккаунта? Зарегистрироваться
            </Link>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
