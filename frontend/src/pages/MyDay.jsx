import React, { useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Timer from '../components/Timer';
import {
  Typography, Box, CircularProgress, Chip, Divider,
  Dialog, DialogContent, DialogTitle, Button, LinearProgress,
} from '@mui/material';
import WorkIcon from '@mui/icons-material/Work';
import FreeBreakfastIcon from '@mui/icons-material/FreeBreakfast';
import LunchDiningIcon from '@mui/icons-material/LunchDining';
import NightsStayIcon from '@mui/icons-material/NightsStay';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const PRIORITY_CONFIG = {
  critical: { label: 'Критический', color: '#E76F51', bg: '#FEF0EC' },
  high:     { label: 'Высокий',     color: '#F4845F', bg: '#FEF5F1' },
  medium:   { label: 'Средний',     color: '#F4A261', bg: '#FEF8F0' },
  low:      { label: 'Низкий',      color: '#52B788', bg: '#F0FAF4' },
};

const EYE_EXERCISES = [
  { icon: '👁️', text: 'Посмотрите вдаль — на предмет за окном или на расстоянии 6+ метров. Удерживайте взгляд 20 секунд.' },
  { icon: '👀', text: 'Быстро поморгайте 15–20 раз, чтобы увлажнить глаза.' },
  { icon: '😌', text: 'Закройте глаза, слегка прикройте ладонями и расслабьтесь на 10 секунд.' },
];

const formatTime = (iso) =>
  new Date(iso).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });

const SlotCard = ({ slot, onComplete }) => {
  const isWork = slot.type === 'work';
  const isLunch = slot.break_type === 'lunch';
  const isLong = slot.break_type === 'long';
  const priority = slot.priority ? PRIORITY_CONFIG[slot.priority] : null;

  if (isWork) {
    return (
      <Box
        sx={{
          bgcolor: 'white',
          border: '1px solid',
          borderColor: 'rgba(45,156,142,0.12)',
          borderRadius: '14px',
          p: 2.5,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          boxShadow: '0 2px 8px rgba(28,43,42,0.05)',
          transition: 'box-shadow 0.2s ease',
          '&:hover': { boxShadow: '0 4px 16px rgba(28,43,42,0.09)' },
        }}
      >
        <Box
          sx={{
            width: 42, height: 42, borderRadius: '12px',
            background: 'linear-gradient(135deg, #2D9C8E, #52B788)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}
        >
          <WorkIcon sx={{ color: 'white', fontSize: 20 }} />
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.primary' }} noWrap>
              {slot.task_title}
            </Typography>
            {priority && (
              <Chip
                label={priority.label}
                size="small"
                sx={{ bgcolor: priority.bg, color: priority.color, fontWeight: 600, fontSize: 11, height: 20 }}
              />
            )}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
            <AccessTimeIcon sx={{ fontSize: 14 }} />
            <Typography variant="caption">
              {formatTime(slot.start)} — {formatTime(slot.end)} · {slot.duration} мин
            </Typography>
          </Box>
        </Box>

        <Timer taskId={slot.task_id} initialDuration={slot.duration} onComplete={onComplete} />
      </Box>
    );
  }

  // Break slot
  const breakConfig = isLunch
    ? { icon: <LunchDiningIcon sx={{ fontSize: 18, color: '#F4A261' }} />, label: 'Обед', bg: '#FEF8F0', border: '#F4A26130' }
    : isLong
    ? { icon: <NightsStayIcon sx={{ fontSize: 18, color: '#2D9C8E' }} />, label: 'Длинный перерыв', bg: '#F0F9F7', border: '#2D9C8E30' }
    : { icon: <FreeBreakfastIcon sx={{ fontSize: 18, color: '#52B788' }} />, label: 'Короткий перерыв', bg: '#F4FBF7', border: '#52B78830' };

  return (
    <Box
      sx={{
        bgcolor: breakConfig.bg,
        border: `1px solid ${breakConfig.border}`,
        borderRadius: '14px',
        px: 2.5, py: 1.5,
        display: 'flex', alignItems: 'center', gap: 2,
      }}
    >
      {breakConfig.icon}
      <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
        {breakConfig.label}
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
        {formatTime(slot.start)} — {formatTime(slot.end)}
      </Typography>
    </Box>
  );
};

const MyDay = () => {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [breakModal, setBreakModal] = useState({ show: false, type: null });
  const { user } = useAuth();

  const fetchSchedule = useCallback(async () => {
    try {
      const res = await api.get('my-schedule/');
      setSchedule(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const currentSlot = schedule.find((slot) => {
        const start = new Date(slot.start);
        const end = new Date(slot.end);
        return now >= start && now <= end;
      });
      if (currentSlot?.type === 'break' && !breakModal.show) {
        setBreakModal({ show: true, type: currentSlot.break_type });
        setTimeout(() => setBreakModal({ show: false, type: null }), 10000);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [schedule, breakModal.show]);

  const workSlots = schedule.filter((s) => s.type === 'work');
  const doneSlots = workSlots.filter((s) => s.status === 'done');
  const progress = workSlots.length ? (doneSlots.length / workSlots.length) * 100 : 0;

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Доброе утро';
    if (h < 18) return 'Добрый день';
    return 'Добрый вечер';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 760, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
          {greeting()}, {user?.first_name || user?.username} 👋
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {new Date().toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })}
        </Typography>
      </Box>

      {/* Progress card */}
      {schedule.length > 0 && (
        <Box
          sx={{
            bgcolor: 'white', borderRadius: '16px', p: 3, mb: 3,
            border: '1px solid rgba(45,156,142,0.12)',
            boxShadow: '0 2px 12px rgba(28,43,42,0.06)',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
              Прогресс дня
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>
              {Math.round(progress)}%
            </Typography>
          </Box>
          <LinearProgress variant="determinate" value={progress} sx={{ mb: 1 }} />
          <Typography variant="caption" color="text.secondary">
            {doneSlots.length} из {workSlots.length} задач выполнено
          </Typography>
        </Box>
      )}

      {/* Schedule */}
      {schedule.length === 0 ? (
        <Box
          sx={{
            bgcolor: 'white', borderRadius: '16px', p: 6, textAlign: 'center',
            border: '1px solid rgba(45,156,142,0.12)',
          }}
        >
          <Typography sx={{ fontSize: 48, mb: 2 }}>🎉</Typography>
          <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary', mb: 1 }}>
            На сегодня задач нет
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Отдыхайте или проверьте раздел «Проекты»
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {schedule.map((slot, idx) => (
            <SlotCard key={idx} slot={slot} onComplete={fetchSchedule} />
          ))}
        </Box>
      )}

      {/* Eye exercise modal */}
      <Dialog
        open={breakModal.show}
        onClose={() => setBreakModal({ show: false, type: null })}
        PaperProps={{ sx: { borderRadius: '20px', maxWidth: 440, width: '100%' } }}
      >
        <DialogTitle sx={{ textAlign: 'center', pt: 4, pb: 1 }}>
          <RemoveRedEyeIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1, display: 'block', mx: 'auto' }} />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {breakModal.type === 'lunch' ? 'Обеденный перерыв' : 'Разминка для глаз'}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ px: 3, pb: 3 }}>
          {breakModal.type !== 'lunch' ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              {EYE_EXERCISES.map((ex) => (
                <Box
                  key={ex.text}
                  sx={{
                    display: 'flex', gap: 2, p: 2, borderRadius: '12px',
                    bgcolor: 'rgba(45,156,142,0.06)',
                  }}
                >
                  <Typography sx={{ fontSize: 22, flexShrink: 0 }}>{ex.icon}</Typography>
                  <Typography variant="body2" color="text.secondary">{ex.text}</Typography>
                </Box>
              ))}
            </Box>
          ) : (
            <Typography variant="body1" color="text.secondary" align="center" sx={{ mt: 1 }}>
              Время обедать! Выйдите из-за стола, поешьте и отдохните. 🍽️
            </Typography>
          )}
          <Button
            fullWidth
            variant="contained"
            onClick={() => setBreakModal({ show: false, type: null })}
            sx={{ mt: 3 }}
          >
            Понятно
          </Button>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default MyDay;
