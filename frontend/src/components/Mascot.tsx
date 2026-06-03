import { useEffect, useState } from 'react';
import { MascotState } from '../types';

interface MascotProps {
  progress?: number; // 0-100
  isWorking?: boolean;
  isOnBreak?: boolean;
  tasksCompleted?: number;
}

const mascotStates: Record<MascotState['mood'], { emoji: string; messages: string[] }> = {
  happy: {
    emoji: '😺',
    messages: [
      'Отличная работа!',
      'Так держать! 💪',
      'Ты молодец!',
      'Продуктивный день!',
    ],
  },
  working: {
    emoji: '😼',
    messages: [
      'Фокусируемся...',
      'Работаем! 🔥',
      'В процессе...',
      'Не отвлекаемся!',
    ],
  },
  tired: {
    emoji: '😿',
    messages: [
      'Может, перерыв?',
      'Не забывай отдыхать',
      'Глазкам нужен отдых',
      'Попей водички 💧',
    ],
  },
  celebrating: {
    emoji: '🙀',
    messages: [
      'УРА! Задача готова! 🎉',
      'Победа! 🏆',
      'Супер результат!',
      'Ты звезда! ⭐',
    ],
  },
  sleeping: {
    emoji: '😴',
    messages: [
      'Zzzz...',
      'Отдыхаем...',
      'Тихий час',
      'Набираемся сил',
    ],
  },
  encouraging: {
    emoji: '😸',
    messages: [
      'Ты справишься!',
      'Верю в тебя!',
      'Ещё чуть-чуть!',
      'Почти готово!',
    ],
  },
};

export default function Mascot({ progress = 0, isWorking = false, isOnBreak = false, tasksCompleted = 0 }: MascotProps) {
  const [currentMood, setCurrentMood] = useState<MascotState['mood']>('happy');
  const [message, setMessage] = useState('');
  const [bounce, setBounce] = useState(false);

  useEffect(() => {
    let mood: MascotState['mood'] = 'happy';
    
    if (isOnBreak) {
      mood = 'sleeping';
    } else if (isWorking) {
      mood = progress > 80 ? 'encouraging' : 'working';
    } else if (tasksCompleted > 0) {
      mood = 'celebrating';
      setBounce(true);
      setTimeout(() => setBounce(false), 1000);
    } else if (progress > 60) {
      mood = 'tired';
    }

    setCurrentMood(mood);
    const messages = mascotStates[mood].messages;
    setMessage(messages[Math.floor(Math.random() * messages.length)]);
  }, [progress, isWorking, isOnBreak, tasksCompleted]);

  const state = mascotStates[currentMood];

  return (
    <div className="flex flex-col items-center">
      <div 
        className={`text-6xl transition-transform duration-300 ${bounce ? 'animate-bounce' : ''}`}
        style={{ filter: isOnBreak ? 'grayscale(0.3)' : 'none' }}
      >
        {state.emoji}
      </div>
      <div className="mt-2 px-4 py-2 bg-white rounded-2xl shadow-lg border border-emerald-100">
        <p className="text-sm text-gray-700 font-medium text-center">{message}</p>
      </div>
      {progress > 0 && (
        <div className="mt-3 w-full max-w-[120px]">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 text-center mt-1">{progress}% сессии</p>
        </div>
      )}
    </div>
  );
}
