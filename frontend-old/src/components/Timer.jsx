import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Box, Button, Typography, CircularProgress } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import StopIcon from '@mui/icons-material/Stop';

const STORAGE_KEY = (taskId) => `timer_${taskId}`;

const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

const Timer = ({ taskId, initialDuration, onComplete }) => {
  const [timeLeft, setTimeLeft] = useState(initialDuration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [timeEntryId, setTimeEntryId] = useState(null);
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef(null);

  // Restore timer state from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY(taskId));
    if (saved) {
      const { entryId, startEpoch } = JSON.parse(saved);
      const elapsed = Math.floor((Date.now() - startEpoch) / 1000);
      const remaining = Math.max(0, initialDuration * 60 - elapsed);
      setTimeEntryId(entryId);
      setTimeLeft(remaining);
      setIsRunning(remaining > 0);
    }
  }, [taskId, initialDuration]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            handleStop();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning]);

  const handleStart = async () => {
    if (isRunning || loading) return;
    setLoading(true);
    const now = new Date().toISOString();
    try {
      const res = await api.post('time-entries/', {
        task: taskId, start_time: now, end_time: null, duration: 0, notes: '',
      });
      const entryId = res.data.id;
      setTimeEntryId(entryId);
      // Persist to localStorage for reload survival
      localStorage.setItem(STORAGE_KEY(taskId), JSON.stringify({ entryId, startEpoch: Date.now() }));
      setIsRunning(true);
    } catch {
      toast.error('Не удалось начать учёт времени');
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async () => {
    clearInterval(intervalRef.current);
    setIsRunning(false);
    localStorage.removeItem(STORAGE_KEY(taskId));
    if (timeEntryId) {
      const end = new Date().toISOString();
      try {
        await api.patch(`time-entries/${timeEntryId}/`, { end_time: end });
        toast.success('Время сохранено');
        if (onComplete) onComplete();
      } catch {
        toast.error('Ошибка сохранения времени');
      }
    }
    setTimeEntryId(null);
    setTimeLeft(initialDuration * 60);
  };

  const handlePause = () => {
    setIsRunning(false);
    localStorage.removeItem(STORAGE_KEY(taskId));
  };

  const pct = Math.round(((initialDuration * 60 - timeLeft) / (initialDuration * 60)) * 100);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexShrink: 0 }}>
      {/* Circular progress with time */}
      <Box sx={{ position: 'relative', display: 'inline-flex' }}>
        <CircularProgress
          variant="determinate"
          value={pct}
          size={46}
          thickness={3}
          sx={{ color: isRunning ? 'primary.main' : 'rgba(45,156,142,0.2)' }}
        />
        <Box sx={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Typography sx={{ fontSize: 10, fontWeight: 700, color: 'text.primary', fontFamily: 'monospace' }}>
            {formatTime(timeLeft)}
          </Typography>
        </Box>
      </Box>

      {/* Controls */}
      {!isRunning ? (
        <Button
          size="small" variant="contained" startIcon={loading ? <CircularProgress size={12} color="inherit" /> : <PlayArrowIcon />}
          onClick={handleStart} disabled={loading}
          sx={{ minWidth: 80, fontSize: 12, py: 0.75 }}
        >
          Старт
        </Button>
      ) : (
        <Button
          size="small" variant="outlined" startIcon={<PauseIcon />}
          onClick={handlePause}
          sx={{ minWidth: 80, fontSize: 12, py: 0.75 }}
        >
          Пауза
        </Button>
      )}
      <Button
        size="small" variant="text" startIcon={<StopIcon />}
        onClick={handleStop}
        sx={{ color: 'text.secondary', fontSize: 12, py: 0.75, '&:hover': { color: 'error.main' } }}
      >
        Стоп
      </Button>
    </Box>
  );
};

export default Timer;
