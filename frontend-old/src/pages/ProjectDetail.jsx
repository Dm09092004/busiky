import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  Box, Typography, Chip, Button, Grid, Card, CardContent,
  LinearProgress, Avatar, Skeleton, Paper,
  Table, TableBody, TableCell, TableHead, TableRow, Tabs, Tab,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BarChartIcon from '@mui/icons-material/BarChart';
import RefreshIcon from '@mui/icons-material/Refresh';
import PeopleIcon from '@mui/icons-material/People';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';  // ← Добавлено!

const STATUS_CONFIG = {
  new:         { label: 'Новый',      color: '#2D9C8E', bg: '#F0F9F7' },
  in_progress: { label: 'В работе',   color: '#F4845F', bg: '#FEF5F1' },
  completed:   { label: 'Завершён',   color: '#52B788', bg: '#F0FAF4' },
  archived:    { label: 'Архивный',   color: '#90A4AE', bg: '#F5F7F6' },
};

const TASK_STATUS = {
  new:         { label: 'Новая',         color: '#2D9C8E', bg: '#F0F9F7' },
  in_progress: { label: 'В работе',      color: '#F4845F', bg: '#FEF5F1' },
  done:        { label: 'Выполнена',     color: '#52B788', bg: '#F0FAF4' },
  blocked:     { label: 'Заблокирована', color: '#E76F51', bg: '#FEF0EC' },
};

const PRIORITY_CONFIG = {
  critical: { label: 'Критический', color: '#E76F51' },
  high:     { label: 'Высокий',     color: '#F4845F' },
  medium:   { label: 'Средний',     color: '#F4A261' },
  low:      { label: 'Низкий',      color: '#52B788' },
};

const STAGE_STATUS = {
  pending:     { label: 'Ожидание', color: '#90A4AE' },
  in_progress: { label: 'В работе', color: '#F4845F' },
  completed:   { label: 'Завершён', color: '#52B788' },
  delayed:     { label: 'Задержка', color: '#E76F51' },
};

const fmt = (d) => d ? new Date(d).toLocaleDateString('ru-RU') : '—';

// ---------- Вкладка: Обзор ----------
const OverviewTab = ({ project, tasks, members }) => {
  const total = tasks.length;
  const done = tasks.filter(t => t.status === 'done').length;
  const progress = total > 0 ? (done / total) * 100 : 0;

  const statCards = [
    { label: 'Всего задач',  value: total,  icon: '📋' },
    { label: 'Выполнено',    value: done,   icon: '✅' },
    { label: 'В работе',     value: tasks.filter(t => t.status === 'in_progress').length, icon: '⏳' },
    { label: 'Участников',   value: members.length, icon: '👥' },
  ];

  return (
    <Box>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {statCards.map(s => (
          <Grid item xs={6} md={3} key={s.label}>
            <Card sx={{ p: 2.5, textAlign: 'center' }}>
              <Typography sx={{ fontSize: 28, mb: 0.5 }}>{s.icon}</Typography>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>{s.value}</Typography>
              <Typography variant="caption" color="text.secondary">{s.label}</Typography>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>Общий прогресс</Typography>
          <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>
            {Math.round(progress)}%
          </Typography>
        </Box>
        <LinearProgress variant="determinate" value={progress} sx={{ mb: 1.5 }} />
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          {project.planned_start && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <CalendarTodayIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                Начало: {fmt(project.planned_start)}
              </Typography>
            </Box>
          )}
          {project.planned_end && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <CalendarTodayIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                Окончание: {fmt(project.planned_end)}
              </Typography>
            </Box>
          )}
          {project.budget && (
            <Typography variant="caption" color="text.secondary">
              Бюджет: {Number(project.budget).toLocaleString('ru-RU')} ₽
            </Typography>
          )}
        </Box>
      </Card>

      {project.description && (
        <Card sx={{ p: 3, mb: 3 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Описание</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
            {project.description}
          </Typography>
        </Card>
      )}

      {members.length > 0 && (
        <Card sx={{ p: 3 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 2 }}>Команда</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {members.map(m => (
              <Box key={m.user_id} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar sx={{ width: 32, height: 32, fontSize: 12, bgcolor: 'primary.main' }}>
                  {(m.full_name || m.username || '?')[0]}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {m.full_name || m.username}
                  </Typography>
                  <LinearProgress variant="determinate" value={m.progress || 0}
                    sx={{ mt: 0.5, height: 4 }} />
                </Box>
                <Typography variant="caption" color="text.secondary">
                  {Math.round(m.progress || 0)}%
                </Typography>
              </Box>
            ))}
          </Box>
        </Card>
      )}
    </Box>
  );
};

// ---------- Вкладка: Задачи ----------
const TasksTab = ({ tasks }) => {
  if (tasks.length === 0) {
    return (
      <Card sx={{ p: 6, textAlign: 'center' }}>
        <Typography sx={{ fontSize: 40, mb: 1 }}>📋</Typography>
        <Typography variant="body1" sx={{ fontWeight: 600 }}>Задач пока нет</Typography>
        <Typography variant="body2" color="text.secondary">
          Задачи создаются через панель администратора
        </Typography>
      </Card>
    );
  }
  return (
    <Paper sx={{ borderRadius: '16px', overflow: 'hidden' }}>
      <Table>
        <TableHead>
          <TableRow sx={{ bgcolor: 'rgba(45,156,142,0.04)' }}>
            {['Задача', 'Статус', 'Приоритет', 'Дедлайн', 'Прогресс'].map(h => (
              <TableCell key={h} sx={{ fontWeight: 600, fontSize: 12, color: 'text.secondary' }}>
                {h}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {tasks.map(task => {
            const st = TASK_STATUS[task.status] || TASK_STATUS.new;
            const pr = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
            const pct = task.planned_duration > 0
              ? Math.min(100, Math.round((task.actual_duration / task.planned_duration) * 100))
              : 0;
            return (
              <TableRow key={task.id} hover>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>{task.title}</Typography>
                </TableCell>
                <TableCell>
                  <Chip label={st.label} size="small"
                    sx={{ bgcolor: st.bg, color: st.color, fontWeight: 600, fontSize: 11 }} />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ color: pr.color, fontWeight: 500 }}>
                    {pr.label}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {task.deadline ? fmt(task.deadline) : '—'}
                  </Typography>
                </TableCell>
                <TableCell sx={{ minWidth: 120 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LinearProgress variant="determinate" value={pct} sx={{ flex: 1, height: 5 }} />
                    <Typography variant="caption" color="text.secondary">{pct}%</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Paper>
  );
};

// ---------- Вкладка: Дорожная карта ----------
const RoadmapTab = ({ stages, onGenerateRoadmap, isManager }) => {
  if (stages.length === 0) {
    return (
      <Card sx={{ p: 6, textAlign: 'center' }}>
        <Typography sx={{ fontSize: 40, mb: 1 }}>🗺️</Typography>
        <Typography variant="body1" sx={{ fontWeight: 600 }}>Дорожная карта не создана</Typography>
        {isManager && (
          <Button 
            variant="contained" 
            startIcon={<RefreshIcon />}
            onClick={onGenerateRoadmap}
            sx={{ mt: 2 }}
          >
            Сгенерировать дорожную карту
          </Button>
        )}
      </Card>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {isManager && (
        <Button 
          variant="outlined" 
          startIcon={<RefreshIcon />}
          onClick={onGenerateRoadmap}
          sx={{ alignSelf: 'flex-start', mb: 2 }}
        >
          Перегенерировать дорожную карту
        </Button>
      )}
      {stages.map((stage, idx) => {
        const st = STAGE_STATUS[stage.status] || STAGE_STATUS.pending;
        const plannedDays = stage.planned_start && stage.planned_end
          ? Math.round((new Date(stage.planned_end) - new Date(stage.planned_start)) / 86400000)
          : null;
        return (
          <Card key={stage.id} sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
              <Box sx={{
                width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                bgcolor: stage.status === 'completed'
                  ? 'rgba(82,183,136,0.15)' : 'rgba(45,156,142,0.08)',
              }}>
                <Typography sx={{ fontWeight: 700, fontSize: 14, color: 'primary.main' }}>
                  {idx + 1}
                </Typography>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>{stage.name}</Typography>
                  <Chip label={st.label} size="small"
                    sx={{ bgcolor: `${st.color}18`, color: st.color, fontWeight: 600, fontSize: 11 }} />
                </Box>
                {stage.description && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {stage.description}
                  </Typography>
                )}
                <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                  <Typography variant="caption" color="text.secondary">
                    📅 {fmt(stage.planned_start)} — {fmt(stage.planned_end)}
                    {plannedDays !== null && ` (${plannedDays} дн)`}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Card>
        );
      })}
    </Box>
  );
};

// ---------- Вкладка: Рекомендации ----------
const RecommendationsTab = ({ recommendations }) => {
  const handleAssign = (emp) => {
    toast.info(`Назначение сотрудника ${emp.full_name} — в разработке`);
  };

  return (
    <Grid container spacing={3}>
      {recommendations.map((emp) => (
        <Grid item xs={12} sm={6} md={4} key={emp.user_id}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ width: 56, height: 56, mr: 2, bgcolor: 'primary.main' }}>
                  {emp.full_name?.[0] || '?'}
                </Avatar>
                <Box>
                  <Typography variant="h6">{emp.full_name}</Typography>
                  <Typography variant="body2" color="text.secondary">{emp.position}</Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Typography variant="h4" color="primary" sx={{ fontWeight: 700 }}>
                  {emp.rating_pct}%
                </Typography>
                <Typography variant="body2" color="text.secondary">рейтинг</Typography>
              </Box>

              {emp.matched_skills?.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                    Совпадающие навыки:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {emp.matched_skills.map(skill => (
                      <Chip key={skill} label={skill} size="small" color="success" />
                    ))}
                  </Box>
                </Box>
              )}
            </CardContent>
            <Box sx={{ p: 2, pt: 0 }}>
              <Button variant="contained" fullWidth onClick={() => handleAssign(emp)}>
                Назначить на проект
              </Button>
            </Box>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

// ---------- Главный компонент ----------
const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [stages, setStages] = useState([]);
  const [members, setMembers] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);

  const isManager = user?.role === 'manager' || user?.role === 'admin';

  const fetchAll = async () => {
    try {
      const [projRes, tasksRes, stagesRes] = await Promise.all([
        api.get(`projects/${id}/`),
        api.get(`tasks/?project_id=${id}`),
        api.get(`roadmap-stages/?project=${id}`),
      ]);
      setProject(projRes.data);
      setTasks(tasksRes.data);
      setStages(stagesRes.data);

      if (isManager) {
        const dashRes = await api.get('dashboard/');
        const projData = dashRes.data.find(p => String(p.project_id) === String(id));
        if (projData) setMembers(projData.members || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async () => {
    if (!isManager) return;
    try {
      const res = await api.get(`projects/${id}/recommend_staff/`);
      setRecommendations(res.data.recommendations || []);
    } catch (err) {
      console.error(err);
    }
  };

  const generateRoadmap = async () => {
    if (!window.confirm('Сгенерировать новую дорожную карту? Текущие этапы будут удалены.')) return;
    try {
      const res = await api.post(`projects/${id}/generate_roadmap/`);
      toast.success(res.data.detail || 'Дорожная карта обновлена!');
      const stagesRes = await api.get(`roadmap-stages/?project=${id}`);
      setStages(stagesRes.data);
    } catch (err) {
      toast.error('Ошибка генерации дорожной карты');
    }
  };

  useEffect(() => {
    fetchAll();
    fetchRecommendations();
  }, [id]);

  if (loading) return <Skeleton variant="rounded" height={400} />;

  if (!project) {
    return <Typography>Проект не найден</Typography>;
  }

  const status = STATUS_CONFIG[project.status] || STATUS_CONFIG.new;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/projects')}>
          Все проекты
        </Button>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mt: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>{project.name}</Typography>
            <Chip label={status.label} sx={{ bgcolor: status.bg, color: status.color }} />
          </Box>
          {isManager && (
            <Button variant="outlined" startIcon={<BarChartIcon />} component={Link} to={`/projects/${id}/analytics`}>
              Аналитика
            </Button>
          )}
        </Box>
      </Box>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 4 }}>
        <Tab label="Обзор" />
        <Tab label={`Задачи (${tasks.length})`} />
        <Tab label="Дорожная карта" />
        {isManager && <Tab label="Рекомендации" />}
      </Tabs>

      {tab === 0 && <OverviewTab project={project} tasks={tasks} members={members} />}
      {tab === 1 && <TasksTab tasks={tasks} />}
      {tab === 2 && <RoadmapTab stages={stages} onGenerateRoadmap={generateRoadmap} isManager={isManager} />}
      {tab === 3 && isManager && <RecommendationsTab recommendations={recommendations} />}
    </Box>
  );
};

export default ProjectDetail;