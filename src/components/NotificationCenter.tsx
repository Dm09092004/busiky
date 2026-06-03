// =====================================================
//  Уведомления с прогресс-баром + иконками
//  (заменяет стандартный Snackbar)
// =====================================================
import { useState, useEffect } from 'react';
import { Box, Paper, Typography, LinearProgress } from '@mui/material';
import { Icon } from './Icons';
import { useApp } from '../context/AppContext';

export function NotificationCenter() {
  const { messages } = useApp();
  return (
    <Box sx={{ position: 'fixed', bottom: 24, left: 24, zIndex: 1400, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      {messages.map((m, idx) => (
        <NotificationItem key={m.id} message={m.text} severity={m.severity} index={idx} />
      ))}
    </Box>
  );
}

const SEVERITY_COLORS: Record<string, { bg: string; border: string; icon: string; iconColor: string }> = {
  success: { bg: 'rgba(39, 174, 96, 0.08)',  border: '#27AE60', icon: 'Check',  iconColor: '#27AE60' },
  info:    { bg: 'rgba(77, 182, 172, 0.08)', border: '#4DB6AC', icon: 'Bell',   iconColor: '#4DB6AC' },
  warning: { bg: 'rgba(243, 156, 18, 0.1)',  border: '#F39C12', icon: 'Lightning', iconColor: '#F39C12' },
  error:   { bg: 'rgba(231, 76, 60, 0.08)',  border: '#E74C3C', icon: 'Close',  iconColor: '#E74C3C' },
};

function NotificationItem({ message, severity, index }: { message: string; severity: string; index: number }) {
  const [progress, setProgress] = useState(100);
  const c = SEVERITY_COLORS[severity] ?? SEVERITY_COLORS.info;
  const IconComp = (Icon as any)[c.icon] ?? Icon.Bell;

  useEffect(() => {
    const duration = 3500;
    const start = Date.now();
    const id = setInterval(() => {
      const elapsed = Date.now() - start;
      setProgress(Math.max(0, 100 - (elapsed / duration) * 100));
    }, 50);
    return () => clearInterval(id);
  }, []);

  return (
    <Paper
      elevation={4}
      sx={{
        minWidth: 320, maxWidth: 420, p: 1.5,
        display: 'flex', alignItems: 'center', gap: 1.5,
        borderLeft: '4px solid', borderColor: c.border,
        bgcolor: c.bg,
        animation: 'slideIn 0.3s ease-out',
        transform: `translateY(${-index * 4}px)`,
        '@keyframes slideIn': {
          from: { transform: `translateX(-100%) translateY(${-index * 4}px)`, opacity: 0 },
          to: { transform: `translateX(0) translateY(${-index * 4}px)`, opacity: 1 },
        },
      }}
    >
      <Box sx={{
        width: 36, height: 36, borderRadius: 1.5,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        bgcolor: 'rgba(255,255,255,0.7)', color: c.iconColor, flexShrink: 0,
      }}>
        <IconComp size={18} />
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary', mb: 0.5 }}>
          {message}
        </Typography>
        <LinearProgress
          variant="determinate" value={progress}
          sx={{
            height: 3, borderRadius: 2, bgcolor: 'rgba(0,0,0,0.05)',
            '& .MuiLinearProgress-bar': { bgcolor: c.border, transitionDuration: '50ms' },
          }}
        />
      </Box>
    </Paper>
  );
}

// ─── Прерывание Pomodoro — точный setTimeout ───
export class BreakNotifier {
  private timerId: number | null = null;
  private listeners: Set<(msg: string) => void> = new Set();

  subscribe(fn: (msg: string) => void) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  scheduleBreak(timeMs: number, phase: 'short_break' | 'long_break' | 'lunch') {
    this.cancel();
    this.timerId = window.setTimeout(() => {
      const msg = phase === 'short_break' ? '☕ Короткий перерыв — отдохни 5 минут!' :
                  phase === 'long_break'  ? '🌿 Длинный перерыв 15 минут — встань, пройдись!' :
                                            '🍽 Обеденное время! Приятного аппетита!';
      this.listeners.forEach((l) => l(msg));
    }, timeMs);
  }

  cancel() {
    if (this.timerId !== null) {
      window.clearTimeout(this.timerId);
      this.timerId = null;
    }
  }
}

export const breakNotifier = new BreakNotifier();
