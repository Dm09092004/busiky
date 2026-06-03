// =====================================================
//  Аналитика: графики план/факт, история, прогнозы
// =====================================================
import { useEffect, useState, useMemo } from 'react';
import {
  Box, Typography, Paper, Grid, Chip,
} from '@mui/material';
import { Icon } from '../components/Icons';
import { api } from '../api/store';
import type { ProjectHistory } from '../types';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement,
  ArcElement, Title, Tooltip, Legend, Filler,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { useApp } from '../context/AppContext';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler);

export default function Analytics() {
  const { projects, tasks, users } = useApp();
  const [history, setHistory] = useState<ProjectHistory[]>([]);

  useEffect(() => {
    api.listHistory().then(setHistory);
  }, []);

  // Агрегация по текущим проектам
  const activeProjects = projects.filter((p) => p.status !== 'completed');
  const totalPlanned = activeProjects.reduce((s, p) => {
    return s + (tasks.filter((t) => t.project_id === p.id).reduce((ss, t) => ss + t.estimated_hours, 0));
  }, 0);
  const totalActual = tasks.reduce((s, t) => s + t.actual_hours, 0);

  // Распределение задач по статусам
  const statusDistribution = {
    new: tasks.filter((t) => t.status === 'new').length,
    in_progress: tasks.filter((t) => t.status === 'in_progress').length,
    review: tasks.filter((t) => t.status === 'review').length,
    done: tasks.filter((t) => t.status === 'done').length,
    blocked: tasks.filter((t) => t.status === 'blocked').length,
  };

  const doughnutData = {
    labels: ['Новые', 'В работе', 'На проверке', 'Готово', 'Заблокированы'],
    datasets: [{
      data: [statusDistribution.new, statusDistribution.in_progress, statusDistribution.review, statusDistribution.done, statusDistribution.blocked],
      backgroundColor: ['#7F8C8D', '#4DB6AC', '#5C6BC0', '#27AE60', '#E74C3C'],
      borderWidth: 0,
    }],
  };

  // План/факт по проектам
  const planFactData = {
    labels: activeProjects.map((p) => p.name.length > 18 ? p.name.slice(0, 18) + '…' : p.name),
    datasets: [
      {
        label: 'Запланировано (ч)',
        data: activeProjects.map((p) => tasks.filter((t) => t.project_id === p.id).reduce((s, t) => s + t.estimated_hours, 0)),
        backgroundColor: 'rgba(77, 182, 172, 0.3)',
        borderColor: '#4DB6AC',
        borderWidth: 2,
        borderRadius: 6,
      },
      {
        label: 'Отработано (ч)',
        data: activeProjects.map((p) => tasks.filter((t) => t.project_id === p.id).reduce((s, t) => s + t.actual_hours, 0)),
        backgroundColor: 'rgba(39, 174, 96, 0.6)',
        borderColor: '#27AE60',
        borderWidth: 2,
        borderRadius: 6,
      },
    ],
  };

  // История: эффективность
  const historyData = {
    labels: history.map((h) => h.project_name.length > 16 ? h.project_name.slice(0, 16) + '…' : h.project_name),
    datasets: [
      {
        label: 'План (ч)',
        data: history.map((h) => h.planned_hours),
        borderColor: '#5C6BC0',
        backgroundColor: 'rgba(92, 107, 192, 0.1)',
        tension: 0.3, fill: true,
      },
      {
        label: 'Факт (ч)',
        data: history.map((h) => h.actual_hours),
        borderColor: '#F39C12',
        backgroundColor: 'rgba(243, 156, 18, 0.1)',
        tension: 0.3, fill: true,
      },
    ],
  };

  // Прогноз
  const avgEfficiency = history.length
    ? history.reduce((s, h) => s + h.efficiency, 0) / history.length
    : 1;
  const forecast = totalPlanned * (1 / avgEfficiency);
  const riskProjects = activeProjects.filter((p) => {
    const planned = tasks.filter((t) => t.project_id === p.id).reduce((s, t) => s + t.estimated_hours, 0);
    const actual = tasks.filter((t) => t.project_id === p.id).reduce((s, t) => s + t.actual_hours, 0);
    return actual > planned * 0.8 && p.status === 'active';
  });

  // Эффективность по сотрудникам
  const employeeStats = useMemo(() => {
    const stats: Record<number, { name: string; planned: number; actual: number; efficiency: number; color: string }> = {};
    for (const t of tasks) {
      if (!t.assignee_id) continue;
      const u = users.find((x) => x.id === t.assignee_id);
      if (!u) continue;
      if (!stats[t.assignee_id]) {
        stats[t.assignee_id] = { name: `${u.first_name} ${u.last_name}`, planned: 0, actual: 0, efficiency: 1, color: u.avatar_color };
      }
      stats[t.assignee_id].planned += t.estimated_hours;
      stats[t.assignee_id].actual += t.actual_hours;
    }
    Object.values(stats).forEach((s) => {
      s.efficiency = s.planned > 0 ? s.actual / s.planned : 1;
    });
    return Object.values(stats).sort((a, b) => b.actual - a.actual);
  }, [tasks, users]);

  const employeeData = {
    labels: employeeStats.map((s) => s.name),
    datasets: [
      {
        label: 'Запланировано (ч)',
        data: employeeStats.map((s) => Math.round(s.planned * 10) / 10),
        backgroundColor: 'rgba(77, 182, 172, 0.4)',
        borderColor: '#4DB6AC',
        borderWidth: 2,
        borderRadius: 6,
      },
      {
        label: 'Отработано (ч)',
        data: employeeStats.map((s) => Math.round(s.actual * 10) / 10),
        backgroundColor: 'rgba(39, 174, 96, 0.6)',
        borderColor: '#27AE60',
        borderWidth: 2,
        borderRadius: 6,
      },
    ],
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.dark', mb: 0.5 }}>Аналитика</Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          Сравнение плана и факта, прогнозы на основе истории завершённых проектов.
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper sx={{ p: 2.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Box sx={{ width: 32, height: 32, borderRadius: 1, bgcolor: 'rgba(77, 182, 172, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'primary.main' }}>
                <Icon.Target size={16} />
              </Box>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>Запланировано</Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.dark' }}>{totalPlanned} ч</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper sx={{ p: 2.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Box sx={{ width: 32, height: 32, borderRadius: 1, bgcolor: 'rgba(39, 174, 96, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'success.main' }}>
                <Icon.Check size={16} />
              </Box>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>Отработано</Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>{totalActual.toFixed(1)} ч</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper sx={{ p: 2.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Box sx={{ width: 32, height: 32, borderRadius: 1, bgcolor: 'rgba(243, 156, 18, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'warning.main' }}>
                <Icon.Trending size={16} />
              </Box>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>Прогноз (ч)</Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.main' }}>{forecast.toFixed(0)} ч</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              на основе {(avgEfficiency * 100).toFixed(0)}% эффективности
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper sx={{ p: 2.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Box sx={{ width: 32, height: 32, borderRadius: 1, bgcolor: 'rgba(231, 76, 60, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'error.main' }}>
                <Icon.Fire size={16} />
              </Box>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>Риски</Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: 'error.main' }}>{riskProjects.length}</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>проектов под риском</Typography>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Paper sx={{ p: 2.5, mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>План/факт по активным проектам</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 2 }}>
              Сравнение запланированных и фактических трудозатрат
            </Typography>
            <Box sx={{ height: 320 }}>
              <Bar
                data={planFactData}
                options={{
                  responsive: true, maintainAspectRatio: false,
                  plugins: { legend: { position: 'top' as const } },
                  scales: { y: { beginAtZero: true, ticks: { callback: (v) => v + 'ч' } } },
                }}
              />
            </Box>
          </Paper>

          <Paper sx={{ p: 2.5, mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>Загрузка сотрудников</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 2 }}>
              План и факт по каждому сотруднику
            </Typography>
            <Box sx={{ height: 280 }}>
              <Bar
                data={employeeData}
                options={{
                  responsive: true, maintainAspectRatio: false, indexAxis: 'y' as const,
                  plugins: { legend: { position: 'top' as const } },
                  scales: { x: { beginAtZero: true, ticks: { callback: (v) => v + 'ч' } } },
                }}
              />
            </Box>
          </Paper>

          <Paper sx={{ p: 2.5 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>История завершённых проектов</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 2 }}>
              Динамика план/факт по архивным проектам (для прогнозирования)
            </Typography>
            <Box sx={{ height: 280 }}>
              <Line
                data={historyData}
                options={{
                  responsive: true, maintainAspectRatio: false,
                  plugins: { legend: { position: 'top' as const } },
                  scales: { y: { beginAtZero: true } },
                }}
              />
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Paper sx={{ p: 2.5, mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>Распределение задач</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 2 }}>
              По статусам выполнения
            </Typography>
            <Box sx={{ height: 250 }}>
              <Doughnut
                data={doughnutData}
                options={{
                  responsive: true, maintainAspectRatio: false,
                  plugins: { legend: { position: 'bottom' as const, labels: { boxWidth: 12, font: { size: 11 } } } },
                }}
              />
            </Box>
          </Paper>

          <Paper sx={{ p: 2.5 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1.5 }}>Постпроектный анализ</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {history.map((h) => {
                const eff = h.efficiency;
                const effColor = eff >= 1 ? '#27AE60' : eff >= 0.85 ? '#F39C12' : '#E74C3C';
                return (
                  <Box key={h.id} sx={{ p: 1.5, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>{h.project_name}</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                      <Chip size="small" label={`Сложность: ${h.complexity_score}%`} variant="outlined" sx={{ height: 20, fontSize: 10 }} />
                      <Chip size="small" label={`${h.actual_hours}/${h.planned_hours}ч`} variant="outlined" sx={{ height: 20, fontSize: 10 }} />
                      <Chip size="small" label={`${(eff * 100).toFixed(0)}%`} sx={{ bgcolor: `${effColor}15`, color: effColor, fontWeight: 600, height: 20, fontSize: 10 }} />
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
