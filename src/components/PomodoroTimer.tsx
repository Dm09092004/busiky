// =====================================================
//  Pomodoro-таймер с ТОЧНЫМ setTimeout и интеграцией
//  уведомлений о перерывах + маскот
// =====================================================
import { useEffect, useRef, useState, useCallback } from 'react';
import { Box, Typography, LinearProgress, Paper, Chip } from '@mui/material';
import { Icon } from './Icons';
import { Mascot } from './Mascot';
import type { ScheduleSlot } from '../utils/schedule';
import { useApp } from '../context/AppContext';
import { breakNotifier } from './NotificationCenter';

interface PomodoroTimerProps {
  slots: ScheduleSlot[];
  onComplete?: () => void;
  compact?: boolean;
}

type Phase = 'focus' | 'short_break' | 'long_break' | 'lunch' | 'idle';

const PHASE_INFO: Record<Phase, { label: string; color: string; icon: React.ReactNode; description: string; minutes: number }> = {
  focus:       { label: 'Фокус-сессия',  color: '#4DB6AC', icon: <Icon.Target size={16} />,    description: 'Сосредоточьтесь на задаче. Уведомим о перерыве.', minutes: 45 },
  short_break: { label: 'Короткий перерыв', color: '#5C6BC0', icon: <Icon.Coffee size={16} />, description: 'Встаньте, разомнитесь. 5 минут отдыха.',       minutes: 5 },
  long_break:  { label: 'Длинный перерыв',  color: '#7E57C2', icon: <Icon.Sun size={16} />,    description: 'Длинный перерыв после 4 pomodoro.',             minutes: 15 },
  lunch:       { label: 'Обед',             color: '#F39C12', icon: <Icon.Coffee size={16} />,  description: 'Приятного аппетита!',                          minutes: 60 },
  idle:        { label: 'Свободное время',  color: '#7F8C8D', icon: <Icon.Moon size={16} />,   description: 'Нет активной фазы. Загляните позже.',          minutes: 0 },
};

function formatMMSS(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function PomodoroTimer({ slots, onComplete, compact = false }: PomodoroTimerProps) {
  const { activeTimer, stopTimer, notify, tasks } = useApp();
  const [phase, setPhase] = useState<Phase>('idle');
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [progress, setProgress] = useState(0);
  const phaseStartRef = useRef<number>(0);
  const phaseDurationRef = useRef<number>(0);
  const tickerRef = useRef<number | null>(null);
  const scheduledRef = useRef<boolean>(false);

  const clearTicker = useCallback(() => {
    if (tickerRef.current !== null) {
      window.clearTimeout(tickerRef.current);
      tickerRef.current = null;
    }
  }, []);

  // Запуск фазы с ТОЧНЫМ расписанием уведомления
  const startPhase = useCallback((newPhase: Phase, endTime: Date, taskId: number | null) => {
    clearTicker();
    breakNotifier.cancel();

    const now = Date.now();
    const durationMs = endTime.getTime() - now;
    const durationSec = Math.max(0, Math.round(durationMs / 1000));

    setPhase(newPhase);
    setSecondsLeft(durationSec);
    phaseStartRef.current = now;
    phaseDurationRef.current = durationSec;
    scheduledRef.current = false;

    // === ТОЧНЫЙ setTimeout для уведомления о конце фазы ===
    if (newPhase === 'focus' && durationMs > 0) {
      // Уведомим за 30 сек до конца
      const warnAt = Math.max(1000, durationMs - 30_000);
      window.setTimeout(() => {
        notify('Через 30 секунд перерыв. Завершите текущую мысль.', 'info');
      }, warnAt);
      // Уведомление о конце
      window.setTimeout(() => {
        if (newPhase === 'focus' && taskId !== null) {
          onComplete?.();
        }
        notify(
          newPhase === 'focus' ? 'Фокус-сессия завершена! Пора сделать перерыв.' :
          'Перерыв окончен.',
          'success'
        );
      }, durationMs);
    } else if (newPhase === 'short_break' || newPhase === 'long_break' || newPhase === 'lunch') {
      // Уведомление в конце перерыва
      window.setTimeout(() => {
        notify('Перерыв окончен. Время возвращаться к работе!', 'success');
      }, durationMs);
    }

    // === Тикер для отображения ===
    const tick = () => {
      const elapsed = Math.floor((Date.now() - phaseStartRef.current) / 1000);
      const remaining = phaseDurationRef.current - elapsed;
      if (remaining <= 0) {
        setSecondsLeft(0);
        setProgress(100);
        return;
      }
      setSecondsLeft(remaining);
      setProgress((elapsed / phaseDurationRef.current) * 100);
      tickerRef.current = window.setTimeout(tick, 250);
    };
    tickerRef.current = window.setTimeout(tick, 250);
  }, [clearTicker, notify, onComplete]);

  // Следим за расписанием (проверка раз в 2 сек)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const slot = slots.find((s) => now >= s.start && now < s.end);
      if (!slot) {
        if (phase !== 'idle') setPhase('idle');
        return;
      }
      const newPhase = slot.pomodoro_phase as Phase;
      // Меняем фазу только при реальной смене
      if (newPhase !== phase) {
        startPhase(newPhase, slot.end, slot.task_id ?? null);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [slots, phase, startPhase]);

  useEffect(() => () => { clearTicker(); breakNotifier.cancel(); }, [clearTicker]);

  const info = PHASE_INFO[phase];
  const isActive = phase !== 'idle';

  // Расчёт прогресса дня для маскота
  const { user: appUser } = useApp();
  const today = new Date().toISOString().split('T')[0];
  const myTasksToday = tasks.filter((t) => t.assignee_id === appUser?.id && t.scheduled_date === today);
  const done = myTasksToday.filter((t) => t.status === 'done').length;
  const dayProgress = myTasksToday.length ? Math.round((done / myTasksToday.length) * 100) : 0;

  if (compact) {
    return (
      <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, border: '1px solid', borderColor: `${info.color}40` }}>
        <Box sx={{
          width: 48, height: 48, borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          bgcolor: `${info.color}15`, color: info.color,
        }}>
          {info.icon}
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: info.color, letterSpacing: 0.5 }}>
              {info.label.toUpperCase()}
            </Typography>
            {activeTimer && (
              <Chip
                size="small" label="Таймер активен" color="warning"
                onClick={stopTimer} onDelete={stopTimer}
                sx={{ height: 18, fontSize: 10 }}
              />
            )}
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 700, fontFamily: 'ui-monospace, monospace', color: 'primary.dark', lineHeight: 1.1 }}>
            {formatMMSS(secondsLeft)}
          </Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Paper sx={{
        p: 3,
        background: `linear-gradient(135deg, ${info.color}08 0%, #FFFFFF 100%)`,
        border: '1px solid', borderColor: `${info.color}40`,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{
              width: 10, height: 10, borderRadius: '50%', bgcolor: info.color,
              boxShadow: `0 0 12px ${info.color}`,
              animation: isActive ? 'pulse 1.4s infinite' : 'none',
              '@keyframes pulse': { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.4 } },
            }} />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: info.color }}>
              {info.icon}
              <Typography variant="overline" sx={{ color: info.color, fontWeight: 700, letterSpacing: 1 }}>
                {info.label}
              </Typography>
            </Box>
          </Box>
          {activeTimer && (
            <Chip
              size="small" label="Остановить таймер" color="error"
              onClick={stopTimer} onDelete={stopTimer}
              icon={<Icon.Stop size={12} />}
            />
          )}
        </Box>

        <Typography variant="h2" sx={{
          fontWeight: 700, fontFamily: 'ui-monospace, monospace',
          color: 'primary.dark', textAlign: 'center', mb: 2, fontSize: { xs: '3rem', md: '3.5rem' },
        }}>
          {formatMMSS(secondsLeft)}
        </Typography>

        <LinearProgress
          variant="determinate" value={progress}
          sx={{
            height: 10, borderRadius: 5, mb: 2, bgcolor: `${info.color}15`,
            '& .MuiLinearProgress-bar': { bgcolor: info.color, borderRadius: 5, transitionDuration: '250ms' },
          }}
        />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
          {info.icon}
          <Typography variant="caption">{info.description}</Typography>
        </Box>
      </Paper>

      {/* Маскот-котик Кити */}
      <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Mascot slots={slots} progress={dayProgress} size={80} showBubble />
      </Paper>
    </Box>
  );
}
