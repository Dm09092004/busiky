// =====================================================
//  Список проектов с фильтрами и кнопкой создания
// =====================================================
import { useState, useMemo } from 'react';
import {
  Box, Typography, Paper, Grid, TextField, InputAdornment, Chip, Button,
  MenuItem, Select, FormControl, InputLabel, LinearProgress,
} from '@mui/material';
import { Icon } from '../components/Icons';
import { useApp } from '../context/AppContext';
import { api } from '../api/store';
import { COMPLEXITY_LABELS, analyzeComplexity } from '../utils/complexity';
import { Link, useNavigate } from 'react-router-dom';

const STATUS_LABELS: Record<string, string> = {
  planning: 'Планирование', active: 'В работе', paused: 'Пауза', completed: 'Завершён',
};
const STATUS_COLORS: Record<string, 'default' | 'primary' | 'success' | 'warning'> = {
  planning: 'default', active: 'primary', paused: 'warning', completed: 'success',
};
const PRIORITY_LABELS: Record<string, string> = { low: 'Низкий', medium: 'Средний', high: 'Высокий', critical: 'Критический' };
const PRIORITY_COLORS: Record<string, string> = {
  low: '#7F8C8D', medium: '#5C6BC0', high: '#F39C12', critical: '#E74C3C',
};

function complexityColor(score: number) {
  if (score >= 75) return '#E74C3C';
  if (score >= 50) return '#F39C12';
  if (score >= 25) return '#5C6BC0';
  return '#27AE60';
}

export default function Projects() {
  const { user, projects, tasks, notify, reload } = useApp();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    name: '', client: '', description: '', technical_spec: '',
    status: 'planning', priority: 'medium',
    start_date: new Date().toISOString().split('T')[0],
    deadline: new Date(Date.now() + 30 * 86_400_000).toISOString().split('T')[0],
  });

  const filtered = useMemo(() => {
    let list = projects;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((p) =>
        p.name.toLowerCase().includes(q) ||
        p.client.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'all') list = list.filter((p) => p.status === statusFilter);
    return list;
  }, [projects, search, statusFilter]);

  const create = async () => {
    if (!user) return;
    if (!form.name.trim() || !form.technical_spec.trim()) {
      notify('Заполните название и ТЗ', 'warning');
      return;
    }
    setCreating(true);
    try {
      const r = analyzeComplexity(form.technical_spec, []);
      const proj = await api.createProject({
        ...form,
        status: form.status as any,
        priority: form.priority as any,
        manager_id: user.id,
        required_skills: r.detected_skills,
      });
      notify(`Проект «${proj.name}» создан. Сложность: ${proj.complexity_score}%`, 'success');
      setShowCreate(false);
      setForm({ ...form, name: '', client: '', description: '', technical_spec: '' });
      await reload();
      navigate(`/projects/${proj.id}`);
    } catch (e) {
      notify('Ошибка создания проекта', 'error');
    } finally {
      setCreating(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.dark', mb: 0.5 }}>Проекты</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>Всего: {projects.length}</Typography>
        </Box>
        {user?.role === 'manager' && (
          <Button
            variant="contained" startIcon={<Icon.Plus size={18} />}
            onClick={() => setShowCreate(true)}
          >
            Новый проект
          </Button>
        )}
      </Box>

      {/* Фильтры */}
      <Paper sx={{ p: 2, mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <TextField
          placeholder="Поиск по названию, клиенту, описанию..."
          size="small" sx={{ flex: 1, minWidth: 240 }}
          value={search} onChange={(e) => setSearch(e.target.value)}
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><Icon.Search size={18} /></InputAdornment> } }}
        />
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Статус</InputLabel>
          <Select value={statusFilter} label="Статус" onChange={(e) => setStatusFilter(e.target.value)}>
            <MenuItem value="all">Все</MenuItem>
            <MenuItem value="planning">Планирование</MenuItem>
            <MenuItem value="active">В работе</MenuItem>
            <MenuItem value="paused">Пауза</MenuItem>
            <MenuItem value="completed">Завершён</MenuItem>
          </Select>
        </FormControl>
      </Paper>

      <Grid container spacing={2.5}>
        {filtered.length === 0 && (
          <Grid size={12}>
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Icon.Projects size={48} />
              <Typography variant="h6" sx={{ mt: 1 }}>Проекты не найдены</Typography>
            </Paper>
          </Grid>
        )}
        {filtered.map((p) => {
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
                  height: '100%',
                  transition: 'all 0.2s',
                  '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 24px rgba(31, 58, 55, 0.1)' },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5 }}>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.3 }}>{p.name}</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>{p.client}</Typography>
                  </Box>
                  <Chip size="small" label={STATUS_LABELS[p.status]} color={STATUS_COLORS[p.status]} sx={{ ml: 1 }} />
                </Box>
                <Typography variant="body2" sx={{
                  color: 'text.secondary', mb: 2, minHeight: 40,
                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                }}>
                  {p.description}
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>Прогресс</Typography>
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>{done} / {projTasks.length}</Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate" value={progress}
                    sx={{ height: 6, borderRadius: 3, bgcolor: 'rgba(77, 182, 172, 0.12)', '& .MuiLinearProgress-bar': { borderRadius: 3, bgcolor: 'primary.main' } }}
                  />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
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
              </Paper>
            </Grid>
          );
        })}
      </Grid>

      {/* Модалка создания проекта */}
      {showCreate && (
        <Box sx={{
          position: 'fixed', inset: 0, zIndex: 1400,
          bgcolor: 'rgba(31, 58, 55, 0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2,
        }} onClick={() => setShowCreate(false)}>
          <Paper sx={{ p: 3, width: '100%', maxWidth: 640, maxHeight: '90vh', overflow: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.dark', mb: 2 }}>
              Новый проект
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField label="Название проекта" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <TextField label="Клиент" value={form.client} onChange={(e) => setForm({ ...form, client: e.target.value })} />
              <TextField label="Краткое описание" multiline rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              <TextField
                label="Техническое задание" multiline rows={6} required
                value={form.technical_spec}
                onChange={(e) => setForm({ ...form, technical_spec: e.target.value })}
                helperText="Опишите стек, требования, интеграции — система автоматически оценит сложность"
              />
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2 }}>
                <FormControl>
                  <InputLabel>Статус</InputLabel>
                  <Select value={form.status} label="Статус" onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    <MenuItem value="planning">Планирование</MenuItem>
                    <MenuItem value="active">В работе</MenuItem>
                  </Select>
                </FormControl>
                <FormControl>
                  <InputLabel>Приоритет</InputLabel>
                  <Select value={form.priority} label="Приоритет" onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                    <MenuItem value="low">Низкий</MenuItem>
                    <MenuItem value="medium">Средний</MenuItem>
                    <MenuItem value="high">Высокий</MenuItem>
                    <MenuItem value="critical">Критический</MenuItem>
                  </Select>
                </FormControl>
                <TextField type="date" label="Дедлайн" slotProps={{ inputLabel: { shrink: true } }} value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
              </Box>
              {form.technical_spec.length > 30 && (() => {
                const r = analyzeComplexity(form.technical_spec, []);
                const color = complexityColor(r.score);
                return (
                  <Box sx={{ p: 2, borderRadius: 2, bgcolor: `${color}10`, border: '1px solid', borderColor: `${color}40` }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Icon.Sparkle size={16} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color }}>
                        Предварительная оценка: {r.score}% · {COMPLEXITY_LABELS[r.level]}
                      </Typography>
                    </Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Обнаружено технологий: {r.detected_skills.length}
                    </Typography>
                  </Box>
                );
              })()}
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, mt: 3 }}>
              <Button onClick={() => setShowCreate(false)}>Отмена</Button>
              <Button variant="contained" onClick={create} disabled={creating} startIcon={<Icon.Wand size={18} />}>
                {creating ? 'Создаём...' : 'Создать проект'}
              </Button>
            </Box>
          </Paper>
        </Box>
      )}
    </Box>
  );
}
