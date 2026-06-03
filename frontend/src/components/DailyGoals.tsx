import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Target, CheckCircle2, Flame, Clock, Trophy } from 'lucide-react';

interface DailyGoalsProps {
  tasksCompleted: number;
  pomodoroSessions: number;
  hoursWorked: number;
}

interface Goal {
  id: string;
  title: string;
  icon: React.ReactNode;
  current: number;
  target: number;
  xpReward: number;
}

export default function DailyGoals({ tasksCompleted, pomodoroSessions, hoursWorked }: DailyGoalsProps) {
  const { colors } = useTheme();
  const [completedToday, setCompletedToday] = useState<string[]>([]);

  const goals: Goal[] = [
    {
      id: 'tasks',
      title: 'Завершить 3 задачи',
      icon: <CheckCircle2 className="w-4 h-4" />,
      current: tasksCompleted,
      target: 3,
      xpReward: 20,
    },
    {
      id: 'pomodoro',
      title: '4 сессии Помодоро',
      icon: <Clock className="w-4 h-4" />,
      current: pomodoroSessions,
      target: 4,
      xpReward: 15,
    },
    {
      id: 'hours',
      title: 'Отработать 6 часов',
      icon: <Flame className="w-4 h-4" />,
      current: Math.floor(hoursWorked),
      target: 6,
      xpReward: 25,
    },
  ];

  // Check for newly completed goals
  useEffect(() => {
    goals.forEach(goal => {
      if (goal.current >= goal.target && !completedToday.includes(goal.id)) {
        setCompletedToday(prev => [...prev, goal.id]);
      }
    });
  }, [tasksCompleted, pomodoroSessions, hoursWorked]);

  const completedCount = goals.filter(g => g.current >= g.target).length;
  const totalXP = goals.filter(g => g.current >= g.target).reduce((sum, g) => sum + g.xpReward, 0);

  return (
    <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5" style={{ color: colors.primary }} />
          <h3 className="font-semibold text-gray-800">Цели на сегодня</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">{completedCount}/{goals.length}</span>
          {completedCount === goals.length && (
            <Trophy className="w-5 h-5 text-amber-500 animate-bounce" />
          )}
        </div>
      </div>

      <div className="space-y-3">
        {goals.map(goal => {
          const isCompleted = goal.current >= goal.target;
          const progress = Math.min(100, (goal.current / goal.target) * 100);
          
          return (
            <div 
              key={goal.id}
              className={`p-3 rounded-xl transition-all ${
                isCompleted 
                  ? 'bg-emerald-50 border border-emerald-200' 
                  : 'bg-gray-50 border border-gray-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-1.5 rounded-lg ${
                  isCompleted ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-200 text-gray-500'
                }`}>
                  {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : goal.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className={`text-sm font-medium ${isCompleted ? 'text-emerald-700 line-through' : 'text-gray-700'}`}>
                      {goal.title}
                    </p>
                    <span className={`text-xs font-medium ${isCompleted ? 'text-emerald-600' : 'text-gray-400'}`}>
                      +{goal.xpReward} XP
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        isCompleted ? 'bg-emerald-500' : ''
                      }`}
                      style={{ 
                        width: `${progress}%`,
                        background: isCompleted ? undefined : `linear-gradient(to right, ${colors.primary}, ${colors.accent})`,
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {goal.current} / {goal.target}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {completedCount > 0 && (
        <div 
          className="mt-4 p-3 rounded-xl text-center"
          style={{ backgroundColor: colors.primary + '15' }}
        >
          <p className="text-sm font-medium" style={{ color: colors.primary }}>
            Заработано сегодня: +{totalXP} XP
          </p>
        </div>
      )}
    </div>
  );
}
