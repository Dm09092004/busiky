// =====================================================
//  Профиль пользователя: навыки, рабочее время, статистика
// =====================================================
import { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Grid, Avatar, Chip, TextField, Button, Slider, Divider,
} from '@mui/material';
import { Icon } from '../components/Icons';
import { useApp } from '../context/AppContext';
import { api } from '../api/store';
import { logger } from '../utils/logger';

const SKILL_LIST = [
  'React', 'Vue.js', 'Angular', 'Django / Python', 'Node.js', 'PostgreSQL', 'MongoDB',
  'Docker', 'AWS', 'Figma / UI', 'TypeScript', 'GraphQL', 'Redis', 'Vite / Webpack',
  'Тестирование', 'SEO', 'Machine Learning', 'Mobile', 'DevOps', 'Анимация',
];

export default function Profile() {
  const { user, tasks, projects, notify, reload } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [position, setPosition] = useState('');
  const [workStart, setWorkStart] = useState('09:00');
  const [workEnd, setWorkEnd] = useState('18:00');
  const [lunchStart, setLunchStart] = useState('13:00');
  const [lunchDur, setLunchDur] = useState(60);
  const [skills, setSkills] = useState<{ name: string; level: number }[]>([]);

  useEffect(() => {
    if (user) {
      setName(`${user.first_name} ${user.last_name}`);
      setEmail(user.email);
      setPosition(user.position);
      setWorkStart(user.work_start);
      setWorkEnd(user.work_end);
      setLunchStart(user.lunch_start);
      setLunchDur(user.lunch_duration_min);
      setSkills(user.skills.map((s) => ({ name: s.skill.name, level: s.level })));
    }
  }, [user]);

  if (!user) return null;

  const myTasks = tasks.filter((t) => t.assignee_id === user.id);
  const myProjects = projects.filter((p) => p.status === 'active').slice(0, 3);
  const completed = myTasks.filter((t) => t.status === 'done').length;
  const totalHours = myTasks.reduce((s, t) => s + t.actual_hours, 0);

  const addSkill = (skill: string) => {
    if (skills.some((s) => s.name === skill)) return;
    setSkills([...skills, { name: skill, level: 3 }]);
    logger.info('profile', `Добавлен навык: ${skill}`);
  };
  const removeSkill = (name: string) => {
    setSkills(skills.filter((s) => s.name !== name));
  };
  const setLevel = (name: string, level: number) => {
    setSkills(skills.map((s) => s.name === name ? { ...s, level } : s));
  };

  const save = async () => {
    try {
      const [first, ...rest] = name.split(' ');
      await api.updateUser(user.id, {
        first_name: first || user.first_name,
        last_name: rest.join(' ') || user.last_name,
        email,
        position,
        work_start: workStart,
        work_end: workEnd,
        lunch_start: lunchStart,
        lunch_duration_min: lunchDur,
        skills: skills.map((s, i) => ({
          level: s.level as 1 | 2 | 3 | 4 | 5,
          skill: { id: i + 100, name: s.name },
        })),
      });
      notify('Профиль сохранён', 'success');
      await reload();
    } catch (e) {
      notify('Ошибка сохранения', 'error');
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.dark', mb: 0.5 }}>Профиль</Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>Личные данные, навыки и рабочее расписание</Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Avatar sx={{ bgcolor: user.avatar_color, width: 96, height: 96, fontSize: 36, fontWeight: 700, mx: 'auto', mb: 2 }}>
              {user.first_name[0]}{user.last_name[0]}
            </Avatar>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>{user.first_name} {user.last_name}</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>{user.position}</Typography>
            <Chip
              label={user.role === 'manager' ? 'Руководитель проектов' : 'Сотрудник'}
              color="primary" size="small"
            />
          </Paper>

          <Paper sx={{ p: 2.5, mt: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>Статистика</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>Активных задач</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{myTasks.filter(t => t.status !== 'done').length}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>Выполнено</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>{completed}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>Отработано</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{totalHours.toFixed(1)} ч</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>Проектов</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{myProjects.length}</Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Личные данные</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField label="ФИО" value={name} onChange={(e) => setName(e.target.value)} fullWidth />
              <TextField label="Email" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth />
              <TextField label="Должность" value={position} onChange={(e) => setPosition(e.target.value)} fullWidth />
            </Box>
          </Paper>

          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Рабочее расписание</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
              Используется для генерации Pomodoro-расписания и обеденного времени.
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 2 }}>
              <TextField type="time" label="Начало работы" slotProps={{ inputLabel: { shrink: true } }} value={workStart} onChange={(e) => setWorkStart(e.target.value)} />
              <TextField type="time" label="Конец работы" slotProps={{ inputLabel: { shrink: true } }} value={workEnd} onChange={(e) => setWorkEnd(e.target.value)} />
              <TextField type="time" label="Начало обеда" slotProps={{ inputLabel: { shrink: true } }} value={lunchStart} onChange={(e) => setLunchStart(e.target.value)} />
              <TextField type="number" label="Длительность обеда, мин" value={lunchDur} onChange={(e) => setLunchDur(Number(e.target.value))} />
            </Box>
          </Paper>

          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>Навыки</Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>Используются для подбора в проекты</Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>Добавить навык:</Typography>
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                {SKILL_LIST.filter((s) => !skills.some((us) => us.name === s)).map((s) => (
                  <Chip key={s} label={s} size="small" clickable variant="outlined"
                    onClick={() => addSkill(s)}
                    sx={{ '&:hover': { bgcolor: 'rgba(77, 182, 172, 0.08)' } }} />
                ))}
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            {skills.length === 0 && (
              <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', py: 2 }}>
                Навыки не добавлены. Нажмите на чип выше, чтобы добавить.
              </Typography>
            )}

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {skills.map((s) => (
                <Box key={s.name} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Chip
                    label={s.name} color="primary" size="small" sx={{ minWidth: 140 }}
                    onDelete={() => removeSkill(s.name)}
                  />
                  <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>Уровень:</Typography>
                    <Slider
                      value={s.level} onChange={(_, v) => setLevel(s.name, v as number)}
                      min={1} max={5} step={1} marks
                      valueLabelDisplay="auto" size="small"
                      sx={{ color: 'primary.main', maxWidth: 200 }}
                    />
                  </Box>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: 'primary.dark' }}>{s.level}/5</Typography>
                </Box>
              ))}
            </Box>
          </Paper>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
            <Button variant="outlined">Отмена</Button>
            <Button variant="contained" startIcon={<Icon.Check size={18} />} onClick={save}>Сохранить</Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
