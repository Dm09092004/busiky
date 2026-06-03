// =====================================================
//  Дашборд: для менеджера — статистика + перенос задач,
//  для сотрудника — личный кабинет + маскот
// =====================================================
import { useMemo, useState } from 'react';
import {
  Box, Typography, Paper, Grid, LinearProgress, Chip, Avatar, Button,
  Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemText,
} from '@mui/material';
import { Icon } from '../components/Icons';
import { useApp } from '../context/AppContext';
import { COMPLEXITY_LABELS } from '../utils/complexity';
import { Link } from 'react-router-dom';
import { previewCarryOver, carryOverTasks } from '../utils/carryOver';
import { logger } from '../utils/logger';
import { Mascot } from '../components/Mascot';
import { generateSchedule } from '../utils/schedule';

const STATUS_LABELS: Record<string, string> = {
  planning: 'Планирование', active: 'В работе', paused: 'Пауза', completed: 'Завершён',
};
const STATUS_COLORS: Record<string, 'default' | 'primary' | 'success' | 'warning' | 'info'> = {
  planning: 'default', active: 'primary', paused: 'warning', completed: 'success',
};
const PRIORITY_LABELS: Record<string, string> = {
  low: 'Низкий', medium: 'Средний', high: 'Высокий', critical: 'Критический',
};
const PRIORITY_COLORS: Record<string, string> = {
  low: '#7F8C8D', medium: '#5C6BC0', high: '#F39C12', critical: '#E74C3C',
};

function complexityColor(score: number) {
  if (score >= 75) return '#E74C3C';
  if (score >= 50) return '#F39C12';
  if (score >= 25) return '#5C6BC0';
  return '#27AE60';
}

interface MetricCardProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  accent?: string;
}

function MetricCard({ icon, value, label, accent }: MetricCardProps) {
  return (
    <Paper sx={{ p: 2.5, height: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
        <Box sx={{
          width: 36, height: 36, borderRadius: 1.5,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          bgcolor: accent ? `${accent}15` : 'rgba(77, 182, 172, 0.12)',
          color: accent ?? 'primary.main',
        }}>{icon}</Box>
        <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}>
          {label}
        </Typography>
      </Box>
      <Typography variant="h4" sx={{ fontWeight: 700, color: accent ?? 'primary.dark' }}>{value}</Typography>
    </Paper>
  );
}

export default function Dashboard() {
  const { user, projects, tasks, users, notify, reload } = useApp();
  const [carryOpen, setCarryOpen] = useState(false);
  const [carryList, setCarryList] = useState<any[]>([]);
  const [carrying, setCarrying] = useState(false);

  const openCarry = async () => {
    const list = await previewCarryOver();
    setCarryList(list);
    setCarryOpen(true);
    logger.info('dashboard', `Предпросмотр переноса: ${list.length} задач`);
  };

  const doCarry = async () => {
    setCarrying(true);
    try {
      const r = await carryOverTasks(false);
      notify(`Перенесено ${r.carried} задач на завтра`, 'success');
      setCarryOpen(false);
      await reload();
    } catch {
      notify('Ошибка переноса', 'error');
    } finally {
      setCarrying(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const slots = useMemo(() => {
    if (!user) return [];
    const myTasks = tasks.filter((t) => t.assignee_id === user.id && t.scheduled_date === today);
    return generateSchedule(user, myTasks);
  }, [user, tasks, today]);

  const myProjects = useMemo(() => {
    if (!user) return [];
    if (user.role === 'manager') return projects;
    return projects.slice(0, 3);
  }, [projects, user]);

  const metrics = useMemo<{
    active?: number; planning?: number; completed?: number;
    avgComplexity?: number; total?: number;
    todayTasks?: number; done?: number; totalHours?: number;
  } | null>(() => {
    if (!user) return null;
    if (user.role === 'manager') {
      const active = projects.filter((p) => p.status === 'active').length;
      const planning = projects.filter((p) => p.status === 'planning').length;
      const completed = projects.filter((p) => p.status === 'completed').length;
      const avgComplexity = projects.length
        ? Math.round(projects.reduce((s, p) => s + p.complexity_score, 0) / projects.length)
        : 0;
      return { active, planning, completed, avgComplexity, total: projects.length };
    } else {
      const myTasks = tasks.filter((t) => t.assignee_id === user.id);
      const todayTasks = myTasks.filter((t) => t.scheduled_date === today && t.status !== 'done');
      const done = myTasks.filter((t) => t.status === 'done').length;
      const totalHours = myTasks.reduce((s, t) => s + t.actual_hours, 0);
      return { todayTasks: todayTasks.length, done, total: myTasks.length, totalHours: Math.round(totalHours) };
    }
  }, [user, projects, tasks, today]);

  if (!user || !metrics) return null;

  const todayProgress = user.role === 'employee' && metrics.total
    ? Math.round(((metrics.done ?? 0) / metrics.total) * 100)
    : 0;

  return (
    <Box>
      {/* Приветствие + действия */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        <Box sx={{ flex: 1, minWidth: 280 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.dark', mb: 0.5 }}>
            Здравствуйте, {user.first_name}!
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            {new Date().toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })}
            {user.role === 'manager' ? ' · Обзор всех проектов студии' : ' · Ваши задачи и проекты'}
          </Typography>
        </Box>
        {user.role === 'manager' && (
          <Button
            variant="outlined" startIcon={<Icon.Refresh size={18} />}
            onClick={openCarry}
          >
            Перенести задачи
          </Button>
        )}
      </Box>

      {/* Метрики */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {user.role === 'manager' ? (
          <>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}><MetricCard icon={<Icon.Fire size={20} />} value={metrics.active ?? 0} label="В работе" accent="#4DB6AC" /></Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}><MetricCard icon={<Icon.Sparkle size={20} />} value={metrics.planning ?? 0} label="Планируется" accent="#5C6BC0" /></Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}><MetricCard icon={<Icon.Check size={20} />} value={metrics.completed ?? 0} label="Завершено" accent="#27AE60" /></Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}><MetricCard icon={<Icon.Target size={20} />} value={`${metrics.avgComplexity ?? 0}%`} label="Средняя сложность" accent="#F39C12" /></Grid>
          </>
        ) : (
          <>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}><MetricCard icon={<Icon.MyDay size={20} />} value={metrics.todayTasks ?? 0} label="Задач на сегодня" accent="#4DB6AC" /></Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}><MetricCard icon={<Icon.Check size={20} />} value={metrics.done ?? 0} label="Выполнено всего" accent="#27AE60" /></Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}><MetricCard icon={<Icon.Clock size={20} />} value={`${metrics.totalHours ?? 0} ч`} label="Отработано" accent="#5C6BC0" /></Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}><MetricCard icon={<Icon.Target size={20} />} value={metrics.total ?? 0} label="Всего задач" accent="#F39C12" /></Grid>
          </>
        )}
      </Grid>

      {/* Маскот для сотрудника */}
      {user.role === 'employee' && (
        <Paper sx={{ p: 2, mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Mascot slots={slots} progress={todayProgress} size={80} showBubble />
        </Paper>
      )}

      {/* Проекты */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {user.role === 'manager' ? 'Активные проекты' : 'Текущие проекты'}
        </Typography>
        <Box component={Link} to="/projects" sx={{
          display: 'flex', alignItems: 'center', gap: 0.5,
          color: 'primary.main', textDecoration: 'none', fontSize: 14, fontWeight: 500,
        }}>
          Все проекты <Icon.ChevronRight size={16} />
        </Box>
      </Box>

      <Grid container spacing={2.5}>
        {myProjects.map((p) => {
          const projTasks = tasks.filter((t) => t.project_id === p.id);
          const done = projTasks.filter((t) => t.status === 'done').length;
          const progress = projTasks.length ? Math.round((done / projTasks.length) * 100) : 0;
          const color = complexityColor(p.complexity_score);
          return (
            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={p.id}>
              <Paper
                component={Link} to={`/projects/${p.id}`}
                sx={{
                  p: 2.5, display: 'block', textDecoration: 'none', color: 'inherit',
                  transition: 'all 0.2s', height: '100%',
                  '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 24px rgba(31, 58, 55, 0.1)' },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5 }}>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>{p.name}</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>{p.client}</Typography>
                  </Box>
                  <Chip size="small" label={STATUS_LABELS[p.status]} color={STATUS_COLORS[p.status]} sx={{ ml: 1 }} />
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>Прогресс задач</Typography>
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>{progress}%</Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate" value={progress}
                    sx={{
                      height: 6, borderRadius: 3, bgcolor: 'rgba(77, 182, 172, 0.12)',
                      '& .MuiLinearProgress-bar': { borderRadius: 3, bgcolor: 'primary.main' },
                    }}
                  />
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
                  <Box sx={{
                    display: 'flex', alignItems: 'center', gap: 0.5,
                    px: 1, py: 0.3, borderRadius: 1, bgcolor: `${color}15`, color,
                  }}>
                    <Icon.Target size={12} />
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                      {p.complexity_score}% · {COMPLEXITY_LABELS[p.complexity_level]}
                    </Typography>
                  </Box>
                  <Box sx={{
                    display: 'flex', alignItems: 'center', gap: 0.5,
                    px: 1, py: 0.3, borderRadius: 1,
                    bgcolor: `${PRIORITY_COLORS[p.priority]}15`, color: PRIORITY_COLORS[p.priority],
                  }}>
                    <Icon.Fire size={12} />
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>{PRIORITY_LABELS[p.priority]}</Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex' }}>
                    {users.slice(0, 3).map((u, i) => (
                      <Avatar key={u.id} sx={{
                        bgcolor: u.avatar_color, width: 26, height: 26, fontSize: 11,
                        border: '2px solid #fff', ml: i > 0 ? -1 : 0,
                      }}>{u.first_name[0]}</Avatar>
                    ))}
                  </Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    до {new Date(p.deadline).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          );
        })}
      </Grid>

      {/* Диалог переноса задач */}
      <Dialog open={carryOpen} onClose={() => setCarryOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'primary.dark' }}>
          <Icon.Refresh size={20} /> Перенос незавершённых задач
        </DialogTitle>
        <DialogContent>
          {carryList.length === 0 ? (
            <Typography variant="body2" sx={{ color: 'text.secondary', py: 2, textAlign: 'center' }}>
              Нет задач для переноса. Все задачи на сегодня либо выполнены, либо запланированы на будущее.
            </Typography>
          ) : (
            <>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                Будет перенесено <strong>{carryList.length}</strong> задач на завтра:
              </Typography>
              <List dense sx={{ maxHeight: 300, overflow: 'auto' }}>
                {carryList.map((t) => (
                  <ListItem key={t.id}>
                    <ListItemText
                      primary={t.title}
                      secondary={`Была: ${t.scheduled_date} · Статус: ${t.status}`}
                    />
                  </ListItem>
                ))}
              </List>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setCarryOpen(false)}>Отмена</Button>
          <Button
            variant="contained" onClick={doCarry} disabled={carrying || carryList.length === 0}
            startIcon={<Icon.ChevronRight size={18} />}
          >
            {carrying ? 'Переносим...' : 'Перенести'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
