import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Grid, Typography, CircularProgress,
  Alert, LinearProgress, Chip, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Button, Dialog,
  DialogTitle, DialogContent, TextField, MenuItem, Select,
  FormControl, InputLabel,
} from '@mui/material';
import toast from 'react-hot-toast';
import AddIcon from '@mui/icons-material/Add';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const API_BASE = 'http://127.0.0.1:8000/api';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [openNewProject, setOpenNewProject] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '', description: '', complexity: 5, budget: '', status: 'new',
  });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const headers = { 'Authorization': `Bearer ${token}` };

      const [projRes, tasksRes] = await Promise.all([
        fetch(`${API_BASE}/projects/`, { headers }),
        fetch(`${API_BASE}/tasks/`, { headers }),
      ]);

      const projectsData = projRes.ok ? await projRes.json() : [];
      const tasksData = tasksRes.ok ? await tasksRes.json() : [];

      setProjects(Array.isArray(projectsData) ? projectsData : []);
      setTasks(Array.isArray(tasksData) ? tasksData : []);
    } catch (err) {
      console.error(err);
      toast.error('Ошибка при загрузке данных');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async () => {
    if (!newProject.name.trim()) { toast.error('Введите название'); return; }
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${API_BASE}/projects/`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(newProject),
      });
      if (res.ok) {
        toast.success('Проект создан!');
        setOpenNewProject(false);
        setNewProject({ name: '', description: '', complexity: 5, budget: '', status: 'new' });
        fetchData();
      } else {
        toast.error('Ошибка при создании проекта');
      }
    } catch { toast.error('Ошибка при создании проекта'); }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const total = projects.length;
  const active = projects.filter(p => p.status === 'in_progress').length;
  const completed = projects.filter(p => p.status === 'completed').length;
  const totalTasks = tasks.length;
  const doneTasks = tasks.filter(t => t.status === 'done').length;
  const taskPct = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const statCards = [
    { label: 'Всего проектов', value: total, icon: <FolderOpenIcon />, color: '#2D9C8E', bg: 'linear-gradient(135deg,#2D9C8E,#52B788)' },
    { label: 'В работе', value: active, icon: <AccessTimeIcon />, color: '#F4845F', bg: 'linear-gradient(135deg,#F4845F,#F4A261)' },
    { label: 'Завершено', value: completed, icon: <CheckCircleIcon />, color: '#52B788', bg: 'linear-gradient(135deg,#52B788,#74C69D)' },
    { label: 'Задач выполнено', value: `${doneTasks}/${totalTasks}`, icon: <TaskAltIcon />, color: '#2D9C8E', bg: 'linear-gradient(135deg,#4DB6A9,#74C69D)' },
  ];

  const STATUS_LABEL = {
    new: { label: 'Новый', color: '#2D9C8E', bg: '#F0F9F7' },
    in_progress: { label: 'В работе', color: '#F4845F', bg: '#FEF5F1' },
    completed: { label: 'Завершён', color: '#52B788', bg: '#F0FAF4' },
    archived: { label: 'Архивный', color: '#90A4AE', bg: '#F5F7F6' },
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>Управление проектами</Typography>
          <Typography variant="body2" color="text.secondary">Обзор всех проектов и задач</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenNewProject(true)}>
          Новый проект
        </Button>
      </Box>

      {/* Статистика */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {statCards.map(s => (
          <Grid item xs={6} md={3} key={s.label}>
            <Card sx={{ background: s.bg, color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography sx={{ opacity: 0.85, fontSize: 13, mb: 0.5 }}>{s.label}</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>{s.value}</Typography>
                  </Box>
                  <Box sx={{ opacity: 0.7 }}>{s.icon}</Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Прогресс задач */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>Общий прогресс задач</Typography>
            <Typography variant="body1" sx={{ fontWeight: 700, color: 'primary.main' }}>{taskPct}%</Typography>
          </Box>
          <LinearProgress variant="determinate" value={taskPct} sx={{ height: 10, borderRadius: 5, mb: 1 }} />
          <Typography variant="caption" color="text.secondary">
            {doneTasks} из {totalTasks} задач выполнено
          </Typography>
        </CardContent>
      </Card>

      {/* Таблица проектов */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Все проекты</Typography>
          {projects.length === 0 ? (
            <Alert severity="info">Проектов пока нет</Alert>
          ) : (
            <TableContainer component={Paper} sx={{ borderRadius: '12px', overflow: 'hidden' }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'rgba(45,156,142,0.04)' }}>
                    {['Название', 'Статус', 'Сложность', 'Бюджет'].map(h => (
                      <TableCell key={h} sx={{ fontWeight: 600, fontSize: 12, color: 'text.secondary' }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {projects.map(p => {
                    const st = STATUS_LABEL[p.status] || STATUS_LABEL.new;
                    return (
                      <TableRow key={p.id} hover>
                        <TableCell sx={{ fontWeight: 500 }}>{p.name}</TableCell>
                        <TableCell>
                          <Chip label={st.label} size="small"
                            sx={{ bgcolor: st.bg, color: st.color, fontWeight: 600, fontSize: 11 }} />
                        </TableCell>
                        <TableCell>{p.complexity || '—'}/10</TableCell>
                        <TableCell>
                          {p.budget ? `${Number(p.budget).toLocaleString('ru-RU')} ₽` : '—'}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Диалог создания */}
      <Dialog open={openNewProject} onClose={() => setOpenNewProject(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: '20px' } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Создать новый проект</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField fullWidth label="Название" value={newProject.name}
              onChange={e => setNewProject(p => ({ ...p, name: e.target.value }))} />
            <TextField fullWidth label="Описание" multiline rows={3} value={newProject.description}
              onChange={e => setNewProject(p => ({ ...p, description: e.target.value }))} />
            <TextField fullWidth label="Сложность (1–10)" type="number"
              value={newProject.complexity}
              onChange={e => setNewProject(p => ({ ...p, complexity: parseInt(e.target.value) }))}
              inputProps={{ min: 1, max: 10 }} />
            <TextField fullWidth label="Бюджет (₽)" type="number" value={newProject.budget}
              onChange={e => setNewProject(p => ({ ...p, budget: e.target.value }))} />
            <FormControl fullWidth>
              <InputLabel>Статус</InputLabel>
              <Select value={newProject.status} label="Статус"
                onChange={e => setNewProject(p => ({ ...p, status: e.target.value }))}>
                <MenuItem value="new">Новый</MenuItem>
                <MenuItem value="in_progress">В работе</MenuItem>
                <MenuItem value="completed">Завершён</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <Box sx={{ px: 3, pb: 3, display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
          <Button onClick={() => setOpenNewProject(false)} color="inherit">Отмена</Button>
          <Button variant="contained" onClick={handleCreateProject}>Создать</Button>
        </Box>
      </Dialog>
    </Box>
  );
};

export default Dashboard;
