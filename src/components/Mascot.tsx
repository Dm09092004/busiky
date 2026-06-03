// =====================================================
//  Маскот-котик "Кити" — живой SVG с эмоциями и анимациями
//  Реагирует на фазу Pomodoro и прогресс дня
// =====================================================
import { useEffect, useState } from 'react';
import { Box, Typography, Paper, Tooltip } from '@mui/material';
import type { ScheduleSlot } from '../utils/schedule';

type Mood = 'happy' | 'focus' | 'tired' | 'break' | 'sleep' | 'celebrate';

interface MascotProps {
  slots: ScheduleSlot[];
  progress: number; // 0..100
  size?: number;
  showBubble?: boolean;
}

const MESSAGES: Record<Mood, { text: string; sub: string }> = {
  happy:     { text: 'Привет! Я Кити',           sub: 'Готов помогать с задачами' },
  focus:     { text: 'Сосредоточься!',            sub: 'Время фокус-сессии 45 минут' },
  tired:     { text: 'Нужен перерыв...',          sub: 'Вы долго работаете без отдыха' },
  break:     { text: 'Отдыхай!',                  sub: 'Перерыв 5 минут — встань, разомнись' },
  sleep:     { text: 'Время обеда',               sub: 'Приятного аппетита! 🍽' },
  celebrate: { text: 'Отличная работа!',          sub: 'День почти завершён' },
};

function getMoodFromPhase(phase: ScheduleSlot['pomodoro_phase'] | 'idle', progress: number): Mood {
  if (phase === 'focus')     return 'focus';
  if (phase === 'short_break' || phase === 'long_break') return 'break';
  if (phase === 'lunch')     return 'sleep';
  if (progress >= 80)        return 'celebrate';
  return 'happy';
}

export function Mascot({ slots, progress, size = 140, showBubble = true }: MascotProps) {
  const [phase, setPhase] = useState<ScheduleSlot['pomodoro_phase'] | 'idle'>('idle');
  const [bounce, setBounce] = useState(false);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const slot = slots.find((s) => now >= s.start && now < s.end);
      setPhase(slot?.pomodoro_phase ?? 'idle');
    };
    tick();
    const id = setInterval(tick, 2000);
    return () => clearInterval(id);
  }, [slots]);

  // Периодический "прыжок" для жизни
  useEffect(() => {
    const id = setInterval(() => setBounce((b) => !b), 1800);
    return () => clearInterval(id);
  }, []);

  const mood = getMoodFromPhase(phase, progress);
  const msg = MESSAGES[mood];

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      <Tooltip title="Кити — твой помощник" arrow>
        <Box sx={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
          <CatMascot mood={mood} bounce={bounce} />
        </Box>
      </Tooltip>
      {showBubble && (
        <Paper sx={{
          p: 1.5, flex: 1, position: 'relative',
          bgcolor: '#fff', border: '1px solid', borderColor: 'primary.light',
          '&::before': {
            content: '""', position: 'absolute', left: -8, top: 18,
            width: 0, height: 0,
            borderTop: '8px solid transparent', borderBottom: '8px solid transparent',
            borderRight: '8px solid #fff',
          },
        }}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.dark' }}>
            {msg.text}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {msg.sub}
          </Typography>
        </Paper>
      )}
    </Box>
  );
}

// ─── Сам котик ───
function CatMascot({ mood, bounce }: { mood: Mood; bounce: boolean }) {
  const eyeShape = () => {
    if (mood === 'sleep')  return { ry: 0.8, y: 18, closed: true };
    if (mood === 'focus')  return { ry: 2.5, y: 18, closed: false };
    if (mood === 'happy')  return { ry: 3,   y: 18, closed: false };
    if (mood === 'break')  return { ry: 4,   y: 18, closed: false, happy: true };
    if (mood === 'tired')  return { ry: 2,   y: 19, closed: false, half: true };
    if (mood === 'celebrate') return { ry: 4, y: 17, closed: false, happy: true };
    return { ry: 3, y: 18, closed: false };
  };
  const eye = eyeShape();

  return (
    <svg viewBox="0 0 100 100" style={{
      width: '100%', height: '100%',
      animation: bounce ? 'catBounce 1.8s ease-in-out infinite' : 'none',
      '@keyframes catBounce': {},
    } as React.CSSProperties}>
      <defs>
        <linearGradient id="catBody" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#80CBC4"/>
          <stop offset="100%" stopColor="#4DB6AC"/>
        </linearGradient>
        <linearGradient id="catBelly" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF"/>
          <stop offset="100%" stopColor="#E0F2F1"/>
        </linearGradient>
      </defs>

      {/* Тень */}
      <ellipse cx="50" cy="92" rx="28" ry="3" fill="rgba(31,58,55,0.15)"/>

      {/* Хвост (за телом) */}
      <path
        d="M 78 65 Q 92 55, 88 40 Q 86 32, 80 38"
        stroke="url(#catBody)" strokeWidth="9" fill="none" strokeLinecap="round"
        style={{ transformOrigin: '78px 65px', animation: 'catTail 2.4s ease-in-out infinite', transform: mood === 'sleep' ? 'rotate(-15deg)' : 'none' }}
      />

      {/* Тело */}
      <ellipse cx="50" cy="62" rx="30" ry="26" fill="url(#catBody)"/>

      {/* Животик */}
      <ellipse cx="50" cy="68" rx="18" ry="14" fill="url(#catBelly)"/>

      {/* Лапки */}
      <ellipse cx="36" cy="84" rx="7" ry="4" fill="url(#catBody)"/>
      <ellipse cx="64" cy="84" rx="7" ry="4" fill="url(#catBody)"/>

      {/* Голова */}
      <circle cx="50" cy="38" r="22" fill="url(#catBody)"/>

      {/* Ушки */}
      <path d="M 32 26 L 28 12 L 42 22 Z" fill="#4DB6AC"/>
      <path d="M 32 24 L 32 16 L 40 22 Z" fill="#FFB4A2"/>
      <path d="M 68 26 L 72 12 L 58 22 Z" fill="#4DB6AC"/>
      <path d="M 68 24 L 68 16 L 60 22 Z" fill="#FFB4A2"/>

      {/* Глаза */}
      {eye.closed ? (
        <>
          <path d="M 38 20 Q 42 22, 46 20" stroke="#1F3A37" strokeWidth="2" fill="none" strokeLinecap="round"/>
          <path d="M 54 20 Q 58 22, 62 20" stroke="#1F3A37" strokeWidth="2" fill="none" strokeLinecap="round"/>
        </>
      ) : (
        <>
          <ellipse cx="42" cy={eye.y} rx="3.5" ry={eye.ry} fill="#1F3A37"/>
          <ellipse cx="58" cy={eye.y} rx="3.5" ry={eye.ry} fill="#1F3A37"/>
          {/* Блик */}
          <circle cx="43" cy={eye.y - 1} r="1" fill="#FFFFFF"/>
          <circle cx="59" cy={eye.y - 1} r="1" fill="#FFFFFF"/>
        </>
      )}

      {/* Носик */}
      <path d="M 48 26 L 52 26 L 50 29 Z" fill="#FF6B9D"/>

      {/* Рот */}
      {mood === 'happy' || mood === 'break' || mood === 'celebrate' ? (
        <path d="M 50 30 Q 46 34, 42 32 M 50 30 Q 54 34, 58 32" stroke="#1F3A37" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      ) : mood === 'sleep' ? (
        <path d="M 46 32 Q 50 35, 54 32" stroke="#1F3A37" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      ) : (
        <path d="M 46 32 Q 50 31, 54 32" stroke="#1F3A37" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      )}

      {/* Усики */}
      <line x1="30" y1="28" x2="20" y2="26" stroke="#1F3A37" strokeWidth="1"/>
      <line x1="30" y1="30" x2="20" y2="30" stroke="#1F3A37" strokeWidth="1"/>
      <line x1="70" y1="28" x2="80" y2="26" stroke="#1F3A37" strokeWidth="1"/>
      <line x1="70" y1="30" x2="80" y2="30" stroke="#1F3A37" strokeWidth="1"/>

      {/* Румянец */}
      {(mood === 'happy' || mood === 'celebrate') && (
        <>
          <ellipse cx="32" cy="28" rx="3" ry="2" fill="#FFB4A2" opacity="0.6"/>
          <ellipse cx="68" cy="28" rx="3" ry="2" fill="#FFB4A2" opacity="0.6"/>
        </>
      )}

      {/* Полоска на лбу у "фокуса" */}
      {mood === 'focus' && (
        <rect x="46" y="14" width="8" height="2" rx="1" fill="#1F3A37" opacity="0.3"/>
      )}

      {/* Звездочки для celebrate */}
      {mood === 'celebrate' && (
        <>
          <text x="14" y="20" fontSize="10" fill="#F39C12">✦</text>
          <text x="82" y="22" fontSize="8" fill="#F39C12">✦</text>
          <text x="20" y="50" fontSize="7" fill="#F39C12">✦</text>
        </>
      )}

      {/* Чашка кофе рядом при break */}
      {mood === 'break' && (
        <g transform="translate(72, 56)">
          <rect x="0" y="0" width="14" height="12" rx="1" fill="#FFFFFF" stroke="#1F3A37" strokeWidth="1"/>
          <path d="M 14 3 Q 18 3, 18 6 Q 18 9, 14 9" fill="none" stroke="#1F3A37" strokeWidth="1"/>
          <path d="M 4 -2 Q 5 0, 4 2 M 7 -3 Q 8 0, 7 2 M 10 -2 Q 11 0, 10 2" stroke="#7F8C8D" strokeWidth="1" fill="none"/>
        </g>
      )}

      <style>{`
        @keyframes catTail {
          0%, 100% { transform: rotate(-8deg); }
          50% { transform: rotate(8deg); }
        }
        @keyframes catBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      `}</style>
    </svg>
  );
}
