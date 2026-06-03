// =====================================================
//  Страница "Мой день" — задачи на сегодня + Pomodoro
//  + маскот-котик "Кити" + точное расписание
// =====================================================
import { useMemo, useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Grid, Checkbox, Chip, IconButton, Tooltip,
  LinearProgress, Button,
} from '@mui/material';
import { Icon } from '../components/Icons';
import { useApp } from '../context/AppContext';
import { api } from '../api/store';
import { generateSchedule, getCurrentPhase, minutesToNextBreak } from '../utils/schedule';
import { logger } from '../utils/logger';
import { Link } from 'react-router-dom';
import { Mascot } from '../components/Mascot';
import { PomodoroTimer as PomodoroWidget } from '../components/PomodoroTimer';

const PRIORITY_COLORS: Record<string, string> = {
  low: '#7F8C8D', medium: '#5C6BC0', high: '#F39C12',
};
const PRIORITY_LABELS: Record<string, string> = { low: 'Низкий', medium: 'Средний', high: 'Высокий' };
const STATUS_LABELS: Record<string, string> = {
  new: 'Новая', in_progress: 'В работе', review: 'На проверке', done: 'Готово', blocked: 'Заблокирована',
};
const STATUS_COLORS: Record<string, 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info'> = {
  new: 'default', in_progress: 'primary', review: 'info', done: 'success', blocked: 'error',
};

export default function MyDay() {
  const { user, tasks, projects, activeTimer, startTimer, stopTimer, notify, reload } = useApp();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const today = new Date().toISOString().split('T')[0];

  const myTasksToday = useMemo(() => {
    if (!user) return [];
    return tasks
      .filter((t) => t.assignee_id === user.id && t.scheduled_date === today)
      .sort((a, b) => {
        const order: Record<string, number> = { in_progress: 0, new: 1, review: 2, blocked: 3, done: 4 };
        return (order[a.status] ?? 9) - (order[b.status] ?? 9);
      });
  }, [tasks, user, today]);

  const slots = useMemo(() => {
    if (!user) return [];
    return generateSchedule(user, myTasksToday);
  }, [user, myTasksToday]);

  const currentSlot = useMemo(() => getCurrentPhase(slots, now), [slots, now]);
  const minsToNext = useMemo(() => minutesToNextBreak(slots, now), [slots, now]);

  if (!user) return null;

  const completedToday = myTasksToday.filter((t) => t.status === 'done').length;
  const totalToday = myTasksToday.length;
  const progress = totalToday ? Math.round((completedToday / totalToday) * 100) : 0;
  const totalPlanned = myTasksToday.reduce((s, t) => s + t.estimated_hours, 0);
  const totalActual = myTasksToday.reduce((s, t) => s + t.actual_hours, 0);

  const onToggleDone = async (taskId: number, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'done' ? 'new' : 'done';
      await api.updateTask(taskId, { status: newStatus });
      logger.info('myday', `Изменён статус задачи #${taskId}: ${newStatus}`);
      if (newStatus === 'done') {
        notify('Задача отмечена как выполненная. Кити рад!', 'success');
        // Анимация празднования: запускаем кратковременное уведомление
        const total = myTasksToday.length;
        const doneCount = myTasksToday.filter(t => t.status === 'done').length + 1;
        if (doneCount === total) {
          notify('Все задачи на сегодня выполнены! Ура!', 'success');
        }
      } else {
        notify('Статус возвращён', 'info');
      }
      await reload();
    } catch {
      notify('Ошибка обновления задачи', 'error');
    }
  };

  const onStartTask = async (taskId: number) => {
    if (activeTimer?.task_id === taskId) {
      await stopTimer();
    } else {
      await startTimer(taskId);
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.dark', mb: 0.5 }}>
          Мой день
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          {new Date().toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })}
        </Typography>
      </Box>

      {/* Маскот-котик + прогресс дня */}
      <Paper sx={{ p: 2.5, mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Mascot slots={slots} progress={progress} size={100} showBubble />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Прогресс дня: {completedToday} из {totalToday}
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.dark' }}>{progress}%</Typography>
          </Box>
          <LinearProgress
            variant="determinate" value={progress}
            sx={{ height: 8, borderRadius: 4, mb: 1, bgcolor: 'rgba(77, 182, 172, 0.12)', '& .MuiLinearProgress-bar': { borderRadius: 4 } }}
          />
          {minsToNext !== null && currentSlot && (
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              <Icon.Clock size={11} /> До конца текущей фазы: <strong>{minsToNext} мин</strong> · {currentSlot.type === 'work' ? 'фокус-сессия' : currentSlot.type === 'lunch' ? 'обед' : 'перерыв'}
            </Typography>
          )}
        </Box>
      </Paper>

      {/* Быстрая статистика */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, md: 3 }}>
          <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 40, height: 40, borderRadius: 1.5, bgcolor: 'rgba(77, 182, 172, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'primary.main' }}>
              <Icon.Clock size={20} />
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>Запланировано</Typography>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>{totalPlanned.toFixed(1)} ч</Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 40, height: 40, borderRadius: 1.5, bgcolor: 'rgba(39, 174, 96, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'success.main' }}>
              <Icon.Check size={20} />
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>Отработано</Typography>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>{totalActual.toFixed(1)} ч</Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 40, height: 40, borderRadius: 1.5, bgcolor: 'rgba(243, 156, 18, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'warning.main' }}>
              <Icon.Fire size={20} />
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>В работе</Typography>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>{myTasksToday.filter(t => t.status === 'in_progress').length}</Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 40, height: 40, borderRadius: 1.5, bgcolor: 'rgba(92, 107, 192, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'info.main' }}>
              <Icon.Sparkle size={20} />
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>Pomodoro</Typography>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>{slots.filter(s => s.type === 'work').length}</Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Левая колонка — задачи */}
        <Grid size={{ xs: 12, lg: 7 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>Задачи на сегодня</Typography>
            <Button
              component={Link} to="/projects" size="small" variant="text"
              endIcon={<Icon.ChevronRight size={16} />}
            >
              Все проекты
            </Button>
          </Box>
          {user.role === 'manager' && (
            <Box sx={{ mb: 2, p: 1.5, borderRadius: 2, bgcolor: 'rgba(77, 182, 172, 0.06)', border: '1px dashed', borderColor: 'primary.light' }}>
              <Typography variant="caption" sx={{ color: 'primary.dark', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Icon.Sparkle size={14} />
                Совет: используйте вкладку «Команда» в проектах, чтобы планировать задачи на сотрудников.
              </Typography>
            </Box>
          )}

          {myTasksToday.length === 0 && (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Icon.Trophy size={48} />
              <Typography variant="h6" sx={{ mt: 1, mb: 0.5 }}>Задач на сегодня нет</Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Загляните в проекты — возможно, пора запланировать новые задачи.
              </Typography>
            </Paper>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {myTasksToday.map((task) => {
              const project = projects.find((p) => p.id === task.project_id);
              const isActive = activeTimer?.task_id === task.id;
              const isDone = task.status === 'done';
              return (
                <Paper key={task.id} sx={{
                  p: 2, display: 'flex', alignItems: 'center', gap: 1.5,
                  opacity: isDone ? 0.7 : 1,
                  border: isActive ? '2px solid' : '1px solid',
                  borderColor: isActive ? 'primary.main' : 'divider',
                  transition: 'all 0.2s',
                }}>
                  <Checkbox
                    checked={isDone}
                    onChange={() => onToggleDone(task.id, task.status)}
                    sx={{ color: 'primary.main', '&.Mui-checked': { color: 'success.main' } }}
                  />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{
                      fontWeight: 500, mb: 0.3,
                      textDecoration: isDone ? 'line-through' : 'none',
                      color: isDone ? 'text.secondary' : 'text.primary',
                    }}>
                      {task.title}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                      {project && (
                        <Box component={Link} to={`/projects/${project.id}`} sx={{
                          display: 'flex', alignItems: 'center', gap: 0.5,
                          color: 'primary.main', textDecoration: 'none', fontSize: 12,
                        }}>
                          <Icon.Briefcase size={12} /> {project.name}
                        </Box>
                      )}
                      <Chip size="small" label={PRIORITY_LABELS[task.priority]} sx={{
                        bgcolor: `${PRIORITY_COLORS[task.priority]}15`,
                        color: PRIORITY_COLORS[task.priority], fontWeight: 600, height: 20, fontSize: 11,
                      }} />
                      <Chip size="small" label={STATUS_LABELS[task.status]} color={STATUS_COLORS[task.status]} sx={{ height: 20, fontSize: 11 }} />
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        <Icon.Clock size={11} /> {task.estimated_hours}ч
                      </Typography>
                    </Box>
                  </Box>
                  <Tooltip title={isActive ? 'Остановить таймер' : 'Запустить Pomodoro'}>
                    <IconButton
                      onClick={() => onStartTask(task.id)}
                      sx={{
                        color: isActive ? 'error.main' : 'primary.main',
                        bgcolor: isActive ? 'rgba(231, 76, 60, 0.1)' : 'rgba(77, 182, 172, 0.1)',
                        '&:hover': { bgcolor: isActive ? 'rgba(231, 76, 60, 0.2)' : 'rgba(77, 182, 172, 0.2)' },
                      }}
                    >
                      {isActive ? <Icon.Stop size={18} /> : <Icon.Play size={18} />}
                    </IconButton>
                  </Tooltip>
                </Paper>
              );
            })}
          </Box>
        </Grid>

        {/* Правая колонка — Pomodoro */}
        <Grid size={{ xs: 12, lg: 5 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Pomodoro-таймер</Typography>
          <PomodoroWidget slots={slots} onComplete={() => {}} />

          <Typography variant="h6" sx={{ fontWeight: 600, mt: 3, mb: 2 }}>Расписание на сегодня</Typography>
          <Paper sx={{ p: 2 }}>
            {slots.length === 0 && (
              <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', py: 2 }}>
                Нет задач — расписание пусто.
              </Typography>
            )}
            {slots.map((s, i) => {
              const isPast = now > s.end;
              const isCurrent = currentSlot?.start.getTime() === s.start.getTime();
              return (
                <Box key={i} sx={{
                  display: 'flex', alignItems: 'center', gap: 1.5, py: 0.8, px: 1, borderRadius: 1,
                  borderBottom: i < slots.length - 1 ? '1px dashed' : 'none', borderColor: 'divider',
                  bgcolor: isCurrent ? 'rgba(77, 182, 172, 0.08)' : 'transparent',
                  opacity: isPast ? 0.5 : 1,
                  transition: 'all 0.2s',
                }}>
                  <Box sx={{
                    width: 6, height: 32, borderRadius: 3,
                    bgcolor: s.type === 'lunch' ? '#F39C12' : s.type === 'break' ? '#5C6BC0' : '#4DB6AC',
                  }} />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {s.type === 'work' ? 'Фокус' : s.type === 'lunch' ? 'Обед' : s.type === 'break' ? 'Перерыв' : '—'}
                      </Typography>
                      {isCurrent && <Chip size="small" label="сейчас" color="primary" sx={{ height: 16, fontSize: 10 }} />}
                    </Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {s.start.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                      {' – '}
                      {s.end.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                  </Box>
                  {s.type === 'work' && (
                    <Chip size="small" label={`${Math.round((s.end.getTime() - s.start.getTime()) / 60000)} мин`} sx={{ height: 20, fontSize: 11 }} />
                  )}
                </Box>
              );
            })}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
