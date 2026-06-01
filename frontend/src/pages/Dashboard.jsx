import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Grid, Typography, CircularProgress, 
  Alert, LinearProgress, Chip, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Paper, Button, Dialog,
  DialogTitle, DialogContent, TextField, MenuItem, Select, FormControl,
  InputLabel
} from '@mui/material';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import toast from 'react-hot-toast';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';

const API_BASE = 'http://localhost:8000/api';
const COLORS = ['#2D9C8E', '#52B788', '#74C69D', '#B7E4C7', '#FFB4A2'];

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
  });
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [openNewProject, setOpenNewProject] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    complexity: 5,
    budget: '',
    status: 'new',
  });
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      
      // Загружаем проекты
      const projectsRes = await fetch(`${API_BASE}/projects/`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const projectsData = await projectsRes.json();
      setProjects(projectsData);

      // Загружаем задачи
      const tasksRes = await fetch(`${API_BASE}/tasks/`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const tasksData = await tasksRes.json();
      setTasks(tasksData);

      // Считаем статистику
      const completed = projectsData.filter(p => p.status === 'completed').length;
      const active = projectsData.filter(p => p.status === 'in_progress').length;
      const completedTasks = tasksData.filter(t => t.status === 'done').length;
      const inProgressTasks = tasksData.filter(t => t.status === 'in_progress').length;

      setStats({
        totalProjects: projectsData.length,
        activeProjects: active,
        completedProjects: completed,
        totalTasks: tasksData.length,
        completedTasks: completedTasks,
        inProgressTasks: inProgressTasks,
      });

      // Подготавливаем данные для графика
      const last7Days = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        last7Days.push({
          date: date.toLocaleDateString('ru-RU', { month: 'short', day: 'numeric' }),
          tasks: Math.floor(Math.random() * 10) + 3,
          completed: Math.floor(Math.random() * 8) + 1,
        });
      }
      setChartData(last7Days);
    } catch (err) {
      console.error('Ошибка загрузки данных:', err);
      toast.error('Ошибка при загрузке данных');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async () => {
    if (!newProject.name.trim()) {
      toast.error('Введите название проекта');
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${API_BASE}/projects/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
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
    } catch (err) {
      console.error('Ошибка:', err);
      toast.error('Ошибка при создании проекта');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const taskCompletion = stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0;
  const projectCompletion = stats.totalProjects > 0 ? Math.round((stats.completedProjects / stats.totalProjects) * 100) : 0;

  const statusData = [
    { name: 'Завершено', value: stats.completedProjects },
    { name: 'В работе', value: stats.activeProjects },
    { name: 'Новые', value: stats.totalProjects - stats.completedProjects - stats.activeProjects },
  ];

  return (
    <Box>
      {/* Заголовок */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Управление проектами
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenNewProject(true)}
        >
          Новый проект
        </Button>
      </Box>

      {/* Главная статистика */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #2D9C8E 0%, #52B788 100%)', color: 'white' }}>
            <CardContent>
              <Typography color="inherit" sx={{ opacity: 0.8, mb: 1 }}>
                Всего проектов
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {stats.totalProjects}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #4DB6A9 0%, #74C69D 100%)', color: 'white' }}>
            <CardContent>
              <Typography color="inherit" sx={{ opacity: 0.8, mb: 1 }}>
                В работе
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {stats.activeProjects}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #A8DADC 0%, #CFF0F5 100%)' }}>
            <CardContent>
              <Typography sx={{ opacity: 0.7, mb: 1 }}>
                Выполнено задач
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {stats.completedTasks}/{stats.totalTasks}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography sx={{ opacity: 0.7, mb: 1 }}>
                Прогресс
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ flex: 1 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={taskCompletion} 
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 600, minWidth: '35px' }}>
                  {taskCompletion}%
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Графики */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Линейный график активности */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Активность на неделю
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" stroke="#999" />
                  <YAxis stroke="#999" />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="tasks" 
                    stroke="#2D9C8E" 
                    strokeWidth={2}
                    name="Всего задач"
                    dot={{ fill: '#2D9C8E' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="completed" 
                    stroke="#52B788" 
                    strokeWidth={2}
                    name="Завершено"
                    dot={{ fill: '#52B788' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Круговая диаграмма статуса проектов */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Статус проектов
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Список проектов */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
            Активные проекты
          </Typography>
          {projects.length > 0 ? (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'background.paper' }}>
                    <TableCell>Название</TableCell>
                    <TableCell>Статус</TableCell>
                    <TableCell align="center">Сложность</TableCell>
                    <TableCell align="right">Бюджет</TableCell>
                    <TableCell align="center">Задач</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {projects.slice(0, 5).map((project) => {
                    const projectTasks = tasks.filter(t => t.project === project.id);
                    const statusLabel = {
                      new: 'Новый',
                      in_progress: 'В работе',
                      completed: 'Завершён',
                      archived: 'Архивный',
                    }[project.status];

                    return (
                      <TableRow key={project.id} hover>
                        <TableCell sx={{ fontWeight: 500 }}>{project.name}</TableCell>
                        <TableCell>
                          <Chip 
                            label={statusLabel} 
                            size="small"
                            color={project.status === 'completed' ? 'success' : project.status === 'in_progress' ? 'info' : 'default'}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell align="center">{project.complexity || '-'}</TableCell>
                        <TableCell align="right">${project.budget || '0'}</TableCell>
                        <TableCell align="center">{projectTasks.length}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Alert severity="info">Проектов не найдено</Alert>
          )}
        </CardContent>
      </Card>

      {/* Диалог создания проекта */}
      <Dialog open={openNewProject} onClose={() => setOpenNewProject(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Создать новый проект</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            fullWidth
            label="Название"
            value={newProject.name}
            onChange={(e) => setNewProject(prev => ({ ...prev, name: e.target.value }))}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Описание"
            multiline
            rows={3}
            value={newProject.description}
            onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Сложность (1-10)"
            type="number"
            value={newProject.complexity}
            onChange={(e) => setNewProject(prev => ({ ...prev, complexity: parseInt(e.target.value) }))}
            sx={{ mb: 2 }}
            inputProps={{ min: 1, max: 10 }}
          />
          <TextField
            fullWidth
            label="Бюджет"
            type="number"
            value={newProject.budget}
            onChange={(e) => setNewProject(prev => ({ ...prev, budget: e.target.value }))}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth>
            <InputLabel>Статус</InputLabel>
            <Select
              value={newProject.status}
              label="Статус"
              onChange={(e) => setNewProject(prev => ({ ...prev, status: e.target.value }))}
            >
              <MenuItem value="new">Новый</MenuItem>
              <MenuItem value="in_progress">В работе</MenuItem>
              <MenuItem value="completed">Завершён</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <Box sx={{ p: 2, display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
          <Button onClick={() => setOpenNewProject(false)}>Отмена</Button>
          <Button variant="contained" onClick={handleCreateProject}>
            Создать
          </Button>
        </Box>
      </Dialog>
    </Box>
  );
};

export default Dashboard;
