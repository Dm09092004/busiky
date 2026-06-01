import React from 'react';
import {
  AppBar, Toolbar, Typography, Button, Box, Avatar,
  Menu, MenuItem, Divider, IconButton, Tooltip, Chip,
} from '@mui/material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import TodayIcon from '@mui/icons-material/Today';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';

const NAV_ITEMS = [
  { label: 'Мой день', path: '/my-day', icon: <TodayIcon fontSize="small" /> },
  { label: 'Проекты', path: '/projects', icon: <FolderOpenIcon fontSize="small" /> },
];

const ROLE_LABELS = {
  employee: { label: 'Сотрудник', color: 'primary' },
  manager:  { label: 'Менеджер',  color: 'secondary' },
  admin:    { label: 'Админ',     color: 'error' },
};

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenu = (e) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const handleLogout = () => { logout(); handleClose(); navigate('/login'); };

  if (!user) return <>{children}</>;

  const roleInfo = ROLE_LABELS[user.role] || ROLE_LABELS.employee;
  const initials = user.first_name
    ? `${user.first_name[0]}${user.last_name?.[0] || ''}`.toUpperCase()
    : user.username[0].toUpperCase();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: 'white',
          borderBottom: '1px solid',
          borderColor: 'divider',
          top: 0,
          zIndex: 1100,
        }}
      >
        <Toolbar sx={{ px: { xs: 2, md: 4 }, gap: 1 }}>
          {/* Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 4 }}>
            <Box
              sx={{
                width: 32, height: 32, borderRadius: '10px',
                background: 'linear-gradient(135deg, #2D9C8E 0%, #4DB6A9 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Typography sx={{ color: 'white', fontSize: 14, fontWeight: 700 }}>К</Typography>
            </Box>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 700, color: 'text.primary', letterSpacing: '-0.01em' }}
            >
              Студия КИТ
            </Typography>
          </Box>

          {/* Nav */}
          <Box sx={{ display: 'flex', gap: 0.5, flexGrow: 1 }}>
            {NAV_ITEMS.map((item) => {
              const active = location.pathname === item.path;
              return (
                <Button
                  key={item.path}
                  component={Link}
                  to={item.path}
                  startIcon={item.icon}
                  sx={{
                    color: active ? 'primary.main' : 'text.secondary',
                    bgcolor: active ? 'rgba(45,156,142,0.08)' : 'transparent',
                    fontWeight: active ? 600 : 400,
                    px: 2,
                    '&:hover': { bgcolor: 'rgba(45,156,142,0.06)', color: 'primary.main' },
                    transition: 'all 0.15s ease',
                  }}
                >
                  {item.label}
                </Button>
              );
            })}
          </Box>

          {/* User */}
          <Tooltip title="Профиль">
            <Box
              onClick={handleMenu}
              sx={{
                display: 'flex', alignItems: 'center', gap: 1.5,
                cursor: 'pointer', px: 1.5, py: 0.75, borderRadius: '10px',
                '&:hover': { bgcolor: 'rgba(45,156,142,0.06)' },
                transition: 'background 0.15s ease',
              }}
            >
              <Avatar
                sx={{
                  width: 34, height: 34, fontSize: 13, fontWeight: 700,
                  background: 'linear-gradient(135deg, #2D9C8E 0%, #52B788 100%)',
                }}
              >
                {initials}
              </Avatar>
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', lineHeight: 1.2 }}>
                  {user.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : user.username}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {roleInfo.label}
                </Typography>
              </Box>
            </Box>
          </Tooltip>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            PaperProps={{
              sx: { mt: 1, minWidth: 200, borderRadius: '12px', border: '1px solid', borderColor: 'divider' },
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                {user.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : user.username}
              </Typography>
              <Typography variant="caption" color="text.secondary">{user.email}</Typography>
              <Box sx={{ mt: 0.5 }}>
                <Chip label={roleInfo.label} color={roleInfo.color} size="small" />
              </Box>
            </Box>
            <Divider />
            <MenuItem onClick={handleClose} component={Link} to="/profile" sx={{ gap: 1.5, mt: 0.5 }}>
              <PersonIcon fontSize="small" color="action" /> Профиль
            </MenuItem>
            <MenuItem onClick={handleLogout} sx={{ gap: 1.5, color: 'error.main', mb: 0.5 }}>
              <LogoutIcon fontSize="small" /> Выйти
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Box sx={{ px: { xs: 2, md: 4 }, py: 3, maxWidth: 1400, mx: 'auto' }}>
        {children}
      </Box>
    </Box>
  );
};

export default Layout;
