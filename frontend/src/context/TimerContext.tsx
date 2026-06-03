import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

type TimerPhase = 'work' | 'short_break' | 'long_break' | 'idle';

interface TimerContextType {
  phase: TimerPhase;
  timeLeft: number;
  isRunning: boolean;
  sessionsCompleted: number;
  totalWorkedMinutes: number;
  activeTaskId: number | null;
  activeTaskName: string | null;
  
  startTimer: (taskId?: number, taskName?: string) => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  skipPhase: () => void;
  setActiveTask: (taskId: number | null, taskName: string | null) => void;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

const STORAGE_KEY = 'studiokit_global_timer';
const WORK_DURATION = 45 * 60;
const SHORT_BREAK = 5 * 60;
const LONG_BREAK = 15 * 60;

export function TimerProvider({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<TimerPhase>('idle');
  const [timeLeft, setTimeLeft] = useState(WORK_DURATION);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [totalWorkedMinutes, setTotalWorkedMinutes] = useState(0);
  const [activeTaskId, setActiveTaskId] = useState<number | null>(null);
  const [activeTaskName, setActiveTaskName] = useState<string | null>(null);

  // Восстановление состояния
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const state = JSON.parse(saved);
        const now = Date.now();
        
        if (state.isRunning && state.startedAt) {
          const elapsed = Math.floor((now - state.startedAt) / 1000);
          const newTimeLeft = Math.max(0, state.timeLeft - elapsed);
          
          if (newTimeLeft > 0) {
            setPhase(state.phase);
            setTimeLeft(newTimeLeft);
            setIsRunning(true);
            setActiveTaskId(state.activeTaskId);
            setActiveTaskName(state.activeTaskName);
          }
        } else {
          setPhase(state.phase || 'idle');
          setTimeLeft(state.timeLeft || WORK_DURATION);
        }
        setSessionsCompleted(state.sessionsCompleted || 0);
        setTotalWorkedMinutes(state.totalWorkedMinutes || 0);
      } catch (e) {
        console.error('Failed to restore timer');
      }
    }
  }, []);

  // Сохранение
  const saveState = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      phase,
      timeLeft,
      isRunning,
      sessionsCompleted,
      totalWorkedMinutes,
      activeTaskId,
      activeTaskName,
      startedAt: isRunning ? Date.now() : null,
    }));
  }, [phase, timeLeft, isRunning, sessionsCompleted, totalWorkedMinutes, activeTaskId, activeTaskName]);

  useEffect(() => {
    saveState();
  }, [saveState]);

  // Таймер
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      handlePhaseComplete();
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft]);

  const handlePhaseComplete = () => {
    setIsRunning(false);
    playSound();

    if (phase === 'work') {
      setTotalWorkedMinutes(prev => prev + 45);
      setSessionsCompleted(prev => prev + 1);

      if ((sessionsCompleted + 1) % 4 === 0) {
        setPhase('long_break');
        setTimeLeft(LONG_BREAK);
      } else {
        setPhase('short_break');
        setTimeLeft(SHORT_BREAK);
      }
    } else {
      setPhase('work');
      setTimeLeft(WORK_DURATION);
    }
  };

  const playSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gainNode.gain.value = 0.2;
      oscillator.start();
      setTimeout(() => {
        oscillator.frequency.value = 1000;
      }, 150);
      setTimeout(() => oscillator.stop(), 300);
    } catch (e) {}
  };

  const startTimer = (taskId?: number, taskName?: string) => {
    if (phase === 'idle') {
      setPhase('work');
      setTimeLeft(WORK_DURATION);
    }
    if (taskId !== undefined) setActiveTaskId(taskId);
    if (taskName !== undefined) setActiveTaskName(taskName);
    setIsRunning(true);
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setPhase('idle');
    setTimeLeft(WORK_DURATION);
    setActiveTaskId(null);
    setActiveTaskName(null);
  };

  const skipPhase = () => {
    setIsRunning(false);
    if (phase === 'work' || phase === 'idle') {
      setPhase('short_break');
      setTimeLeft(SHORT_BREAK);
    } else {
      setPhase('work');
      setTimeLeft(WORK_DURATION);
    }
  };

  const setActiveTask = (taskId: number | null, taskName: string | null) => {
    setActiveTaskId(taskId);
    setActiveTaskName(taskName);
  };

  return (
    <TimerContext.Provider value={{
      phase,
      timeLeft,
      isRunning,
      sessionsCompleted,
      totalWorkedMinutes,
      activeTaskId,
      activeTaskName,
      startTimer,
      pauseTimer,
      resetTimer,
      skipPhase,
      setActiveTask,
    }}>
      {children}
    </TimerContext.Provider>
  );
}

export function useTimer() {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error('useTimer must be used within TimerProvider');
  }
  return context;
}
