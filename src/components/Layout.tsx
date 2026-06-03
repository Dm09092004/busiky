// =====================================================
//  Layout: боковое меню + верхняя панель + контент
// =====================================================
import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  AppBar, Toolbar, Typography, Avatar, Menu, MenuItem, Divider, IconButton, Tooltip,
} from '@mui/material';
import { Icon } from './Icons';
import { useApp } from '../context/AppContext';
import { LogPanel } from './LogPanel';
import { NotificationCenter } from './NotificationCenter';

const DRAWER_W = 240;

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Дашборд',     icon: <Icon.Dashboard size={20} />, managerOnly: false },
  { to: '/myday',     label: 'Мой день',    icon: <Icon.MyDay size={20} />,     managerOnly: false },
  { to: '/projects',  label: 'Проекты',     icon: <Icon.Projects size={20} />,  managerOnly: false },
  { to: '/analytics', label: 'Аналитика',   icon: <Icon.Analytics size={20} />, managerOnly: false },
  { to: '/profile',   label: 'Профиль',     icon: <Icon.Profile size={20} />,   managerOnly: false },
];

function initials(u: { first_name: string; last_name: string }) {
  return `${u.first_name[0] ?? ''}${u.last_name[0] ?? ''}`.toUpperCase();
}

interface LayoutProps {
  onToggleTheme?: () => void;
  themeMode?: 'light' | 'dark';
}

export function Layout({ onToggleTheme, themeMode }: LayoutProps) {
  const { user, logout, activeTimer, stopTimer, showLogs, setShowLogs } = useApp();
  const navigate = useNavigate();
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);

  if (!user) return null;

  const visibleNav = NAV_ITEMS.filter((n) => !n.managerOnly || user.role === 'manager');

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* ─── Sidebar ─── */}
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_W, flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_W, boxSizing: 'border-box',
            borderRight: '1px solid', borderColor: 'divider',
            bgcolor: '#FFFFFF',
          },
        }}
      >
        <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{
            width: 38, height: 38, borderRadius: 2,
            background: 'linear-gradient(135deg, #4DB6AC 0%, #26A69A 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700, fontSize: 18,
            boxShadow: '0 2px 8px rgba(77, 182, 172, 0.3)',
          }}>K</Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'primary.dark', lineHeight: 1.1 }}>KIT PM</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Студия КИТ</Typography>
          </Box>
        </Box>
        <Divider />
        <List sx={{ px: 1.5, py: 2 }}>
          {visibleNav.map((item) => (
            <ListItem key={item.to} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                component={NavLink}
                to={item.to}
                sx={{
                  borderRadius: 2,
                  '&.active': {
                    bgcolor: 'primary.main',
                    color: '#fff',
                    '& .MuiListItemIcon-root': { color: '#fff' },
                    '&:hover': { bgcolor: 'primary.dark' },
                  },
                  '&:hover': { bgcolor: 'rgba(77, 182, 172, 0.08)' },
                }}
              >
                <ListItemIcon sx={{ minWidth: 38, color: 'primary.main' }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} sx={{ '& .MuiListItemText-primary': { fontSize: 14, fontWeight: 500 } }} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Box sx={{ mt: 'auto', p: 2 }}>
          <Box sx={{
            p: 1.5, borderRadius: 2, bgcolor: 'rgba(77, 182, 172, 0.08)',
            border: '1px solid', borderColor: 'primary.light',
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Icon.Sparkle size={16} />
              <Typography variant="caption" sx={{ fontWeight: 600, color: 'primary.dark' }}>Подсказка</Typography>
            </Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', lineHeight: 1.4 }}>
              Нажмите иконку <strong>журнала</strong> в правом нижнем углу — увидите логи всех действий.
            </Typography>
          </Box>
        </Box>
      </Drawer>

      {/* ─── Main ─── */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <AppBar position="sticky" elevation={0}>
          <Toolbar sx={{ gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" sx={{ color: 'primary.dark', fontWeight: 600, lineHeight: 1.1 }}>
                {user.role === 'manager' ? 'Панель руководителя' : 'Личный кабинет'}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {user.position}
              </Typography>
            </Box>

            {activeTimer && (
              <Tooltip title="Идёт учёт времени. Нажмите, чтобы остановить.">
                <Box
                  onClick={stopTimer}
                  sx={{
                    display: 'flex', alignItems: 'center', gap: 1,
                    px: 1.5, py: 0.75, borderRadius: 2, cursor: 'pointer',
                    bgcolor: 'rgba(243, 156, 18, 0.12)', color: 'warning.main',
                    border: '1px solid', borderColor: 'warning.main',
                  }}
                >
                  <Box sx={{
                    width: 8, height: 8, borderRadius: '50%', bgcolor: 'warning.main',
                    animation: 'pulse 1.4s infinite',
                    '@keyframes pulse': {
                      '0%, 100%': { opacity: 1 },
                      '50%': { opacity: 0.3 },
                    },
                  }} />
                  <Icon.Clock size={16} />
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>Таймер активен</Typography>
                </Box>
              </Tooltip>
            )}

            {onToggleTheme && (
              <Tooltip title={themeMode === 'dark' ? 'Светлая тема' : 'Тёмная тема'}>
                <IconButton onClick={onToggleTheme}>
                  {themeMode === 'dark' ? <Icon.Sun size={20} /> : <Icon.Moon size={20} />}
                </IconButton>
              </Tooltip>
            )}

            <Tooltip title="Логи системы">
              <IconButton onClick={() => setShowLogs(!showLogs)}>
                <Icon.Log size={20} />
              </IconButton>
            </Tooltip>

            <Box
              onClick={(e) => setAnchor(e.currentTarget)}
              sx={{ display: 'flex', alignItems: 'center', gap: 1.2, cursor: 'pointer', pl: 1 }}
            >
              <Avatar sx={{ bgcolor: user.avatar_color, width: 36, height: 36, fontSize: 14, fontWeight: 600 }}>
                {initials(user)}
              </Avatar>
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.1 }}>
                  {user.first_name} {user.last_name}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {user.role === 'manager' ? 'Менеджер' : 'Сотрудник'}
                </Typography>
              </Box>
            </Box>

            <Menu open={!!anchor} anchorEl={anchor} onClose={() => setAnchor(null)}>
              <MenuItem onClick={() => { setAnchor(null); navigate('/profile'); }}>
                <ListItemIcon><Icon.Profile size={18} /></ListItemIcon>
                Профиль
              </MenuItem>
              <Divider />
              <MenuItem onClick={() => { setAnchor(null); logout(); navigate('/login'); }}>
                <ListItemIcon><Icon.Logout size={18} color="#E74C3C" /></ListItemIcon>
                <Typography color="error">Выйти</Typography>
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>

        <Box sx={{ flex: 1, p: 3, overflow: 'auto' }}>
          <Outlet />
        </Box>
      </Box>

      {/* ─── Уведомления ─── */}
      <NotificationCenter />

      <LogPanel />
    </Box>
  );
}
