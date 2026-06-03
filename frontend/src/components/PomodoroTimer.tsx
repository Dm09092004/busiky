import { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Coffee, Sun, Volume2, VolumeX } from 'lucide-react';
import { useTimer } from '../context/TimerContext';
import { useTheme } from '../context/ThemeContext';
import MascotCat from './MascotCat';

interface PomodoroTimerProps {
  onWorkComplete?: (minutes: number) => void;
  onSessionComplete?: () => void;
}

const mascotMessages = {
  work: {
    start: ['Поехали!', 'Время работать!', 'Сфокусируемся!', 'Начинаем!'],
    middle: ['Отлично идёшь!', 'Так держать!', 'Молодец!', 'Продолжай!'],
    end: ['Почти готово!', 'Ещё чуть-чуть!', 'Финишная прямая!', 'Скоро перерыв!'],
  },
  short_break: {
    start: ['Отдохни глаза', 'Разомнись!', 'Выпей воды', 'Потянись!'],
    middle: ['Расслабься', 'Глубокий вдох...', 'Хороший перерыв!'],
    end: ['Готов продолжить?', 'Скоро за работу!', 'Возвращаемся!'],
  },
  long_break: {
    start: ['Заслуженный отдых!', 'Ты молодец!', 'Большой перерыв!'],
    middle: ['Можно перекусить', 'Прогуляйся', 'Отдыхай!'],
    end: ['Готов к свершениям?', 'Скоро продолжим!', 'Возвращаемся!'],
  },
  idle: {
    start: ['Готов начать?', 'Жду команды!', 'Поработаем?'],
    middle: ['Готов начать?', 'Жду команды!', 'Поработаем?'],
    end: ['Готов начать?', 'Жду команды!', 'Поработаем?'],
  },
};

export default function PomodoroTimer({ onWorkComplete, onSessionComplete }: PomodoroTimerProps) {
  const { 
    phase, 
    timeLeft, 
    isRunning, 
    sessionsCompleted, 
    totalWorkedMinutes,
    activeTaskName,
    startTimer, 
    pauseTimer, 
    resetTimer, 
    skipPhase 
  } = useTimer();
  const { colors } = useTheme();
  
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [mascotMessage, setMascotMessage] = useState('Готов начать работу?');
  const [prevPhase, setPrevPhase] = useState(phase);

  // Load sound setting
  useEffect(() => {
    const settings = localStorage.getItem('studiokit_settings');
    if (settings) {
      const parsed = JSON.parse(settings);
      setSoundEnabled(parsed.soundEnabled ?? true);
    }
  }, []);

  // Update mascot message based on progress
  useEffect(() => {
    const workDuration = 45 * 60;
    const shortBreakDuration = 5 * 60;
    const longBreakDuration = 15 * 60;
    
    const totalDuration = phase === 'work' ? workDuration : 
                          phase === 'short_break' ? shortBreakDuration : 
                          phase === 'long_break' ? longBreakDuration : workDuration;
    const progress = ((totalDuration - timeLeft) / totalDuration) * 100;
    
    const messages = mascotMessages[phase] || mascotMessages.idle;
    let messagePool = messages.start;
    
    if (progress >= 66) {
      messagePool = messages.end;
    } else if (progress >= 33) {
      messagePool = messages.middle;
    }
    
    // Only update on phase change or significant progress change
    if (prevPhase !== phase) {
      const randomMessage = messagePool[Math.floor(Math.random() * messagePool.length)];
      setMascotMessage(randomMessage);
      setPrevPhase(phase);
    }
  }, [phase, timeLeft, prevPhase]);

  // Callbacks when phase completes
  useEffect(() => {
    if (timeLeft === 0 && prevPhase === 'work') {
      onWorkComplete?.(45);
      onSessionComplete?.();
    }
  }, [timeLeft, prevPhase, onWorkComplete, onSessionComplete]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const phaseConfig = {
    work: { label: 'Работа', icon: Sun },
    short_break: { label: 'Короткий перерыв', icon: Coffee },
    long_break: { label: 'Длинный перерыв', icon: Coffee },
    idle: { label: 'Готов', icon: Sun },
  };

  const current = phaseConfig[phase];
  const workDuration = 45 * 60;
  const shortBreakDuration = 5 * 60;
  const longBreakDuration = 15 * 60;
  
  const totalDuration = phase === 'work' ? workDuration : 
                        phase === 'short_break' ? shortBreakDuration : 
                        phase === 'long_break' ? longBreakDuration : workDuration;
  const progress = ((totalDuration - timeLeft) / totalDuration) * 100;

  const getMascotMood = () => {
    if (phase === 'idle') return 'happy';
    if (!isRunning) return 'happy';
    if (phase !== 'work') return 'sleeping';
    if (progress > 80) return 'encouraging';
    if (progress > 50) return 'tired';
    return 'working';
  };

  const toggleSound = () => {
    const newValue = !soundEnabled;
    setSoundEnabled(newValue);
    const settings = localStorage.getItem('studiokit_settings');
    const parsed = settings ? JSON.parse(settings) : {};
    localStorage.setItem('studiokit_settings', JSON.stringify({ ...parsed, soundEnabled: newValue }));
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl bg-gradient-to-r ${colors.gradient}`}>
            <current.icon className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-semibold text-gray-800">{current.label}</span>
        </div>
        <button
          onClick={toggleSound}
          className={`p-2 rounded-lg transition-colors ${
            soundEnabled ? `${colors.text} bg-gray-100` : 'text-gray-400 bg-gray-100'
          }`}
          title={soundEnabled ? 'Выключить звук' : 'Включить звук'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-center gap-6 mb-6 text-sm">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-800">{sessionsCompleted}</p>
          <p className="text-gray-500">сессий</p>
        </div>
        <div className="w-px h-10 bg-gray-200" />
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-800">
            {Math.floor(totalWorkedMinutes / 60)}ч {totalWorkedMinutes % 60}м
          </p>
          <p className="text-gray-500">отработано</p>
        </div>
      </div>

      {/* Active Task */}
      {activeTaskName && (
        <div className={`mb-4 px-4 py-2 rounded-xl bg-gradient-to-r ${colors.bgGradient} border`} style={{ borderColor: colors.primary + '30' }}>
          <p className="text-xs text-gray-500">Текущая задача:</p>
          <p className="text-sm font-medium text-gray-800 truncate">{activeTaskName}</p>
        </div>
      )}

      {/* Маскот */}
      <div className="flex justify-center mb-6">
        <MascotCat 
          mood={getMascotMood()} 
          message={mascotMessage}
          progress={isRunning ? progress : 0}
          size="md"
        />
      </div>

      {/* Таймер */}
      <div className="relative flex justify-center mb-8">
        <div className="relative w-56 h-56">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="112"
              cy="112"
              r="100"
              stroke="currentColor"
              strokeWidth="10"
              fill="none"
              className="text-gray-100"
            />
            <circle
              cx="112"
              cy="112"
              r="100"
              stroke={colors.primary}
              strokeWidth="10"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 100}
              strokeDashoffset={2 * Math.PI * 100 * (1 - progress / 100)}
              className="transition-all duration-1000"
            />
          </svg>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span 
              className="text-5xl font-bold"
              style={{ color: colors.primary }}
            >
              {formatTime(timeLeft)}
            </span>
            <span className="text-sm text-gray-400 mt-2 flex items-center gap-1">
              {isRunning ? (
                <>
                  <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: colors.primary }} />
                  В процессе
                </>
              ) : (
                'На паузе'
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Кнопки управления */}
      <div className="flex justify-center gap-4">
        <button
          onClick={resetTimer}
          className="p-3 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all active:scale-95"
          title="Сбросить"
        >
          <RotateCcw className="w-6 h-6" />
        </button>
        
        <button
          onClick={() => isRunning ? pauseTimer() : startTimer()}
          className={`px-8 py-3 rounded-xl text-white font-semibold shadow-lg transition-all transform hover:scale-105 active:scale-95 bg-gradient-to-r ${colors.gradient} ${
            isRunning ? 'animate-glow' : ''
          }`}
        >
          {isRunning ? (
            <span className="flex items-center gap-2">
              <Pause className="w-5 h-5" /> Пауза
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Play className="w-5 h-5" /> Старт
            </span>
          )}
        </button>
        
        <button
          onClick={skipPhase}
          className="p-3 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all active:scale-95"
          title={phase === 'work' || phase === 'idle' ? 'Перейти к перерыву' : 'Перейти к работе'}
        >
          {phase === 'work' || phase === 'idle' ? <Coffee className="w-6 h-6" /> : <Sun className="w-6 h-6" />}
        </button>
      </div>

      {/* Подсказка */}
      <div className="mt-6 p-4 rounded-xl" style={{ backgroundColor: colors.primary + '15' }}>
        <p className="text-sm text-center" style={{ color: colors.primary }}>
          {phase === 'work' || phase === 'idle'
            ? 'Сфокусируйтесь на задаче. После 4 сессий — длинный перерыв!'
            : 'Отдохните глаза, разомнитесь, выпейте воды. Скоро вернёмся к работе!'}
        </p>
      </div>
    </div>
  );
}
