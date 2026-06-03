import { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Zap, TrendingUp } from 'lucide-react';

interface LevelProgressProps {
  xp: number;
}

const LEVELS = [
  { level: 1, name: 'Новичок', xpRequired: 0, icon: '🌱' },
  { level: 2, name: 'Стажёр', xpRequired: 100, icon: '📚' },
  { level: 3, name: 'Джун', xpRequired: 300, icon: '💪' },
  { level: 4, name: 'Мидл', xpRequired: 600, icon: '⚡' },
  { level: 5, name: 'Сеньор', xpRequired: 1000, icon: '🔥' },
  { level: 6, name: 'Лид', xpRequired: 1500, icon: '👑' },
  { level: 7, name: 'Архитектор', xpRequired: 2200, icon: '🏛️' },
  { level: 8, name: 'Гуру', xpRequired: 3000, icon: '🧙' },
  { level: 9, name: 'Легенда', xpRequired: 4000, icon: '🌟' },
  { level: 10, name: 'Мастер', xpRequired: 5000, icon: '💎' },
];

export default function LevelProgress({ xp }: LevelProgressProps) {
  const { colors } = useTheme();
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [prevLevel, setPrevLevel] = useState(1);

  const getCurrentLevel = (xp: number) => {
    for (let i = LEVELS.length - 1; i >= 0; i--) {
      if (xp >= LEVELS[i].xpRequired) {
        return LEVELS[i];
      }
    }
    return LEVELS[0];
  };

  const getNextLevel = (currentLevel: number) => {
    return LEVELS.find(l => l.level === currentLevel + 1) || LEVELS[LEVELS.length - 1];
  };

  const currentLevel = getCurrentLevel(xp);
  const nextLevel = getNextLevel(currentLevel.level);
  
  const xpForCurrentLevel = currentLevel.xpRequired;
  const xpForNextLevel = nextLevel.xpRequired;
  const xpInLevel = xp - xpForCurrentLevel;
  const xpNeededForLevel = xpForNextLevel - xpForCurrentLevel;
  const progressPercent = (xpInLevel / xpNeededForLevel) * 100;

  // Level up animation
  useEffect(() => {
    if (currentLevel.level > prevLevel) {
      setShowLevelUp(true);
      setTimeout(() => setShowLevelUp(false), 3000);
    }
    setPrevLevel(currentLevel.level);
  }, [currentLevel.level, prevLevel]);

  return (
    <>
      <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
        <div className="flex items-center gap-3">
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
            style={{ background: `linear-gradient(135deg, ${colors.primary}20, ${colors.accent}20)` }}
          >
            {currentLevel.icon}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Уровень {currentLevel.level}</p>
                <p className="font-semibold text-gray-800">{currentLevel.name}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400">XP</p>
                <p className="font-bold" style={{ color: colors.primary }}>{xp}</p>
              </div>
            </div>
            
            {/* Progress bar */}
            <div className="mt-2">
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-500"
                  style={{ 
                    width: `${Math.min(100, progressPercent)}%`,
                    background: `linear-gradient(to right, ${colors.primary}, ${colors.accent})`,
                  }}
                />
              </div>
              <div className="flex justify-between mt-1">
                <p className="text-xs text-gray-400">{xpInLevel} / {xpNeededForLevel} XP</p>
                <p className="text-xs text-gray-400">До "{nextLevel.name}"</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Level Up Toast */}
      {showLevelUp && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-slideDown">
          <div 
            className="px-6 py-4 rounded-2xl shadow-2xl text-white flex items-center gap-4"
            style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.accent})` }}
          >
            <div className="text-4xl animate-bounce">{currentLevel.icon}</div>
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                <span className="font-bold text-lg">Уровень повышен!</span>
              </div>
              <p className="text-white/80">Теперь вы: {currentLevel.name}</p>
            </div>
            <Zap className="w-6 h-6 animate-pulse" />
          </div>
        </div>
      )}
    </>
  );
}

// XP rewards
export const XP_REWARDS = {
  TASK_COMPLETED: 10,
  POMODORO_SESSION: 5,
  PROJECT_COMPLETED: 100,
  STREAK_DAY: 15,
  ACHIEVEMENT_UNLOCKED: 25,
};
