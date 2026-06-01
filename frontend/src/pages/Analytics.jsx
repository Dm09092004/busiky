import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  Box, Typography, Card, Grid, Chip, Button,
  LinearProgress, Skeleton, Divider, Alert,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import RemoveIcon from '@mui/icons-material/Remove';

const fmt = (d) => d ? new Date(d).toLocaleDateString('ru-RU') : '—';

const fmtMins = (m) => {
  if (!m && m !== 0) return '—';
  const h = Math.floor(Math.abs(m) / 60);
  const min = Math.abs(m) % 60;
  const sign = m < 0 ? '−' : m > 0 ? '+' : '';
  return h > 0 ? `${sign}${h} ч ${min > 0 ? min + ' мин' : ''}` : `${sign}${min} мин`;
};

// Карточка метрики
const MetricCard = ({ label, value, sub, color, icon }) => (
  <Card sx={{ p: 3, height: '100%' }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <Box>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
          {label}
        </Typography>
        <Typography variant="h5" sx={{ fontWeight: 700, color: color || 'text.primary', mt: 0.5 }}>
          {value}
        </Typography>
        {sub && (
          <Typography variant="caption" color="text.secondary">{sub}</Typography>
        )}
      </Box>
      {icon && (
        <Box sx={{
          width: 40, height: 40, borderRadius: '10px',
          bgcolor: `${color || '#2D9C8E'}15`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {icon}
        </Box>
      )}
    </Box>
  </Card>
);

// Полоска план/факт для этапа
const StageBar = ({ stage }) => {
  const maxMins = Math.max(stage.planned_minutes, stage.actual_minutes, 1);
  const plannedPct = (stage.planned_minutes / maxMins) * 100;
  const actualPct = (stage.actual_minutes / maxMins) * 100;
  const devMins = stage.actual_minutes - stage.planned_minutes;
  const isOver = devMins > 0;
  const isEqual = devMins === 0;

  return (
    <Card sx={{ p: 2.5, mb: 1.5 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>{stage.stage_name}</Typography>
          {stage.was_delayed && (
            <Chip label="Задержка" size="small"
              sx={{ bgcolor: '#FEF0EC', color: '#E76F51', fontSize: 10, fontWeight: 600, height: 18 }} />
          )}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {isEqual ? (
            <RemoveIcon sx={{ fontSize: 16, color: '#90A4AE' }} />
          ) : isOver ? (
            <TrendingUpIcon sx={{ fontSize: 16, color: '#E76F51' }} />
          ) : (
            <TrendingDownIcon sx={{ fontSize: 16, color: '#52B788' }} />
          )}
          <Typography variant="caption" sx={{
            fontWeight: 700,
            color: isEqual ? '#90A4AE' : isOver ? '#E76F51' : '#52B788',
          }}>
            {isEqual ? 'В плане' : fmtMins(devMins)}
          </Typography>
        </Box>
      </Box>

      {/* Плановая полоска */}
      <Box sx={{ mb: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant="caption" color="text.secondary">План</Typography>
          <Typography variant="caption" color="text.secondary">
            {fmtMins(stage.planned_minutes).replace('+', '').replace('−', '')}
          </Typography>
        </Box>
        <Box sx={{ height: 8, bgcolor: 'rgba(45,156,142,0.1)', borderRadius: 4, overflow: 'hidden' }}>
          <Box sx={{
            width: `${plannedPct}%`, height: '100%',
            bgcolor: '#2D9C8E', borderRadius: 4,
          }} />
        </Box>
      </Box>

      {/* Фактическая полоска */}
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant="caption" color="text.secondary">Факт</Typography>
          <Typography variant="caption" color="text.secondary">
            {fmtMins(stage.actual_minutes).replace('+', '').replace('−', '')}
          </Typography>
        </Box>
        <Box sx={{ height: 8, bgcolor: 'rgba(244,132,95,0.1)', borderRadius: 4, overflow: 'hidden' }}>
          <Box sx={{
            width: `${actualPct}%`, height: '100%',
            bgcolor: isOver ? '#E76F51' : '#52B788', borderRadius: 4,
            transition: 'width 0.4s ease',
          }} />
        </Box>
      </Box>
    </Card>
  );
};

const Analytics = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`projects/${id}/analytics/`)
      .then(res => setData(res.data))
      .catch(() => setError('Не удалось загрузить аналитику проекта.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <Box>
        <Skeleton variant="text" width={240} height={40} sx={{ mb: 2 }} />
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {[1,2,3,4].map(i => <Grid item xs={6} md={3} key={i}><Skeleton variant="rounded" height={100} /></Grid>)}
        </Grid>
        <Skeleton variant="rounded" height={300} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(`/projects/${id}`)}
          sx={{ color: 'text.secondary', mb: 2, pl: 0 }}>
          Назад к проекту
        </Button>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  const isOver = data.deviation_minutes > 0;
  const isUnder = data.deviation_minutes < 0;
  const deviationColor = isOver ? '#E76F51' : isUnder ? '#52B788' : '#90A4AE';
  const tasksPct = data.total_tasks > 0
    ? Math.round((data.completed_tasks / data.total_tasks) * 100) : 0;

  return (
    <Box>
      {/* Шапка */}
      <Box sx={{ mb: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(`/projects/${id}`)}
          sx={{ color: 'text.secondary', mb: 2, pl: 0 }}>
          Назад к проекту
        </Button>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>Аналитика проекта</Typography>
        <Typography variant="body2" color="text.secondary">
          Сравнение плановых и фактических трудозатрат
        </Typography>
      </Box>

      {/* Ключевые метрики */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} md={3}>
          <MetricCard
            label="Плановые трудозатраты"
            value={`${data.planned_hours} ч`}
            sub={`${data.planned_minutes} мин`}
            color="#2D9C8E"
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <MetricCard
            label="Фактические трудозатраты"
            value={`${data.actual_hours} ч`}
            sub={`${data.actual_minutes} мин`}
            color="#F4845F"
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <MetricCard
            label="Отклонение"
            value={`${data.deviation_percent > 0 ? '+' : ''}${data.deviation_percent}%`}
            sub={isOver ? 'Перерасход' : isUnder ? 'Экономия' : 'В плане'}
            color={deviationColor}
            icon={isOver
              ? <TrendingUpIcon sx={{ color: deviationColor, fontSize: 20 }} />
              : isUnder
              ? <TrendingDownIcon sx={{ color: deviationColor, fontSize: 20 }} />
              : <RemoveIcon sx={{ color: deviationColor, fontSize: 20 }} />
            }
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <MetricCard
            label="Выполнение задач"
            value={`${tasksPct}%`}
            sub={`${data.completed_tasks} из ${data.total_tasks}`}
            color="#52B788"
          />
        </Grid>
      </Grid>

      {/* Общий прогресс */}
      <Card sx={{ p: 3, mb: 3 }}>
        <Typography variant="body2" sx={{ fontWeight: 600, mb: 2 }}>
          Сводное сравнение план / факт
        </Typography>
        <Box sx={{ mb: 1.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
            <Typography variant="caption" color="text.secondary">План</Typography>
            <Typography variant="caption" sx={{ fontWeight: 600, color: '#2D9C8E' }}>
              {data.planned_hours} ч
            </Typography>
          </Box>
          <LinearProgress variant="determinate" value={100}
            sx={{ height: 10, borderRadius: 5, '& .MuiLinearProgress-bar': { bgcolor: '#2D9C8E' } }} />
        </Box>
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
            <Typography variant="caption" color="text.secondary">Факт</Typography>
            <Typography variant="caption" sx={{ fontWeight: 600, color: deviationColor }}>
              {data.actual_hours} ч
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={data.planned_minutes > 0
              ? Math.min(100, (data.actual_minutes / data.planned_minutes) * 100)
              : 0}
            sx={{
              height: 10, borderRadius: 5,
              bgcolor: 'rgba(244,132,95,0.1)',
              '& .MuiLinearProgress-bar': { bgcolor: deviationColor },
            }}
          />
        </Box>
      </Card>

      {/* По этапам */}
      {data.stages && data.stages.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="body1" sx={{ fontWeight: 600, mb: 2 }}>
            По этапам дорожной карты
          </Typography>
          {data.stages.map((stage, idx) => (
            <StageBar key={idx} stage={stage} />
          ))}
        </Box>
      )}

      {/* Прогноз */}
      {data.forecast && (
        <Card sx={{ p: 3, border: '1px solid rgba(45,156,142,0.2)', bgcolor: 'rgba(45,156,142,0.03)' }}>
          <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
            🔮 Прогноз для похожих проектов
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {data.forecast.note}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6} md={4}>
              <Typography variant="caption" color="text.secondary">Среднее фактическое время</Typography>
              <Typography variant="body1" sx={{ fontWeight: 700, color: 'primary.main' }}>
                {data.forecast.avg_actual_hours} ч
              </Typography>
            </Grid>
            <Grid item xs={6} md={4}>
              <Typography variant="caption" color="text.secondary">Среднее отклонение</Typography>
              <Typography variant="body1" sx={{ fontWeight: 700,
                color: data.forecast.avg_deviation_percent > 0 ? '#E76F51' : '#52B788' }}>
                {data.forecast.avg_deviation_percent > 0 ? '+' : ''}{data.forecast.avg_deviation_percent}%
              </Typography>
            </Grid>
            <Grid item xs={6} md={4}>
              <Typography variant="caption" color="text.secondary">Проектов в выборке</Typography>
              <Typography variant="body1" sx={{ fontWeight: 700 }}>
                {data.forecast.based_on_projects}
              </Typography>
            </Grid>
          </Grid>
        </Card>
      )}
    </Box>
  );
};

export default Analytics;
