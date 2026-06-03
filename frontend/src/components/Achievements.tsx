import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { 
  Trophy, 
  Flame, 
  Target, 
  Clock, 
  Star, 
  Zap,
  Award,
  TrendingUp,
  CheckCircle2,
  Coffee,
  X,
  Sparkles,
} from 'lucide-react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

interface AchievementsProps {
  tasksCompleted: number;
  pomodoroSessions: number;
  totalHoursWorked: number;
  projectsCompleted: number;
  currentStreak: number;
}

const achievementDefinitions = [
  {
    id: 'first_task',
    title: 'Первые шаги',
    description: 'Завершите первую задачу',
    icon: <CheckCircle2 className="w-5 h-5" />,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100',
    check: (stats: AchievementsProps) => stats.tasksCompleted >= 1,
    progress: (stats: AchievementsProps) => Math.min(stats.tasksCompleted, 1),
    max: 1,
  },
  {
    id: 'five_tasks',
    title: 'Продуктивный',
    description: 'Завершите 5 задач',
    icon: <Target className="w-5 h-5" />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    check: (stats: AchievementsProps) => stats.tasksCompleted >= 5,
    progress: (stats: AchievementsProps) => Math.min(stats.tasksCompleted, 5),
    max: 5,
  },
  {
    id: 'ten_tasks',
    title: 'Машина задач',
    description: 'Завершите 10 задач',
    icon: <Zap className="w-5 h-5" />,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    check: (stats: AchievementsProps) => stats.tasksCompleted >= 10,
    progress: (stats: AchievementsProps) => Math.min(stats.tasksCompleted, 10),
    max: 10,
  },
  {
    id: 'pomodoro_master',
    title: 'Мастер Помодоро',
    description: 'Завершите 4 сессии подряд',
    icon: <Clock className="w-5 h-5" />,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    check: (stats: AchievementsProps) => stats.pomodoroSessions >= 4,
    progress: (stats: AchievementsProps) => Math.min(stats.pomodoroSessions, 4),
    max: 4,
  },
  {
    id: 'eight_hours',
    title: 'Полный день',
    description: 'Отработайте 8 часов',
    icon: <Coffee className="w-5 h-5" />,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    check: (stats: AchievementsProps) => stats.totalHoursWorked >= 8,
    progress: (stats: AchievementsProps) => Math.min(Math.floor(stats.totalHoursWorked), 8),
    max: 8,
  },
  {
    id: 'streak_3',
    title: 'На волне',
    description: '3 дня подряд без пропусков',
    icon: <Flame className="w-5 h-5" />,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    check: (stats: AchievementsProps) => stats.currentStreak >= 3,
    progress: (stats: AchievementsProps) => Math.min(stats.currentStreak, 3),
    max: 3,
  },
  {
    id: 'streak_7',
    title: 'Неделя огня',
    description: '7 дней подряд без пропусков',
    icon: <TrendingUp className="w-5 h-5" />,
    color: 'text-pink-600',
    bgColor: 'bg-pink-100',
    check: (stats: AchievementsProps) => stats.currentStreak >= 7,
    progress: (stats: AchievementsProps) => Math.min(stats.currentStreak, 7),
    max: 7,
  },
  {
    id: 'project_done',
    title: 'Проект завершён',
    description: 'Завершите проект',
    icon: <Trophy className="w-5 h-5" />,
    color: 'text-amber-600',
    bgColor: 'bg-amber-100',
    check: (stats: AchievementsProps) => stats.projectsCompleted >= 1,
    progress: (stats: AchievementsProps) => Math.min(stats.projectsCompleted, 1),
    max: 1,
  },
  {
    id: 'five_projects',
    title: 'Ветеран',
    description: 'Завершите 5 проектов',
    icon: <Award className="w-5 h-5" />,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100',
    check: (stats: AchievementsProps) => stats.projectsCompleted >= 5,
    progress: (stats: AchievementsProps) => Math.min(stats.projectsCompleted, 5),
    max: 5,
  },
  {
    id: 'superstar',
    title: 'Суперзвезда',
    description: '20 задач + 10 сессий',
    icon: <Star className="w-5 h-5" />,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-100',
    check: (stats: AchievementsProps) => stats.tasksCompleted >= 20 && stats.pomodoroSessions >= 10,
    progress: (stats: AchievementsProps) => Math.min(stats.tasksCompleted, 20) + Math.min(stats.pomodoroSessions, 10),
    max: 30,
  },
];

export default function Achievements({ 
  tasksCompleted, 
  pomodoroSessions, 
  totalHoursWorked,
  projectsCompleted,
  currentStreak,
}: AchievementsProps) {
  const { colors } = useTheme();
  const [showModal, setShowModal] = useState(false);
  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null);
  const [unlockedIds, setUnlockedIds] = useState<string[]>([]);

  const stats = { tasksCompleted, pomodoroSessions, totalHoursWorked, projectsCompleted, currentStreak };

  useEffect(() => {
    const savedUnlocked = localStorage.getItem('studiokit_achievements');
    const previousUnlocked: string[] = savedUnlocked ? JSON.parse(savedUnlocked) : [];
    
    const currentUnlocked = achievementDefinitions
      .filter(a => a.check(stats))
      .map(a => a.id);
    
    const newUnlocked = currentUnlocked.filter(id => !previousUnlocked.includes(id));
    
    if (newUnlocked.length > 0) {
      const achievement = achievementDefinitions.find(a => a.id === newUnlocked[0]);
      if (achievement) {
        setNewAchievement({
          id: achievement.id,
          title: achievement.title,
          description: achievement.description,
          icon: achievement.icon,
          color: achievement.color,
          bgColor: achievement.bgColor,
        });
        localStorage.setItem('studiokit_achievements', JSON.stringify(currentUnlocked));
      }
    }
    
    setUnlockedIds(currentUnlocked);
  }, [tasksCompleted, pomodoroSessions, totalHoursWorked, projectsCompleted, currentStreak]);

  const unlockedCount = unlockedIds.length;
  const totalCount = achievementDefinitions.length;

  return (
    <>
      {/* Button */}
      <button
        onClick={() => setShowModal(true)}
        className={`flex items-center gap-2 px-4 py-2 bg-gradient-to-r ${colors.gradient} text-white rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 active:scale-95`}
      >
        <Trophy className="w-5 h-5" />
        <span className="font-semibold">{unlockedCount}</span>
        <span className="text-white/70">/</span>
        <span className="text-white/70">{totalCount}</span>
      </button>

      {/* New Achievement Toast */}
      {newAchievement && (
        <div className="fixed bottom-4 right-4 z-50 animate-slideUp">
          <div className="bg-white rounded-2xl shadow-2xl p-5 border-2 border-amber-400 max-w-sm relative overflow-hidden">
            {/* Confetti */}
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(15)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 rounded-full animate-confetti"
                  style={{
                    left: `${Math.random() * 100}%`,
                    backgroundColor: ['#fbbf24', '#f472b6', '#60a5fa', '#34d399'][i % 4],
                    animationDelay: `${Math.random() * 0.5}s`,
                  }}
                />
              ))}
            </div>

            <div className="flex items-start gap-4 relative z-10">
              <div className={`p-3 rounded-xl ${newAchievement.bgColor} animate-bounce`}>
                <div className={newAchievement.color}>{newAchievement.icon}</div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <p className="text-xs text-amber-600 font-semibold uppercase tracking-wide">
                    Новое достижение!
                  </p>
                </div>
                <p className="text-lg font-bold text-gray-800 mt-1">{newAchievement.title}</p>
                <p className="text-sm text-gray-500">{newAchievement.description}</p>
              </div>
              <button
                onClick={() => setNewAchievement(null)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden animate-scaleIn">
            {/* Header */}
            <div className={`p-6 bg-gradient-to-r ${colors.gradient}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-white">
                  <Trophy className="w-8 h-8" />
                  <div>
                    <h2 className="text-2xl font-bold">Достижения</h2>
                    <p className="text-white/80">
                      Разблокировано: {unlockedCount} из {totalCount}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 text-white/80 hover:text-white rounded-xl hover:bg-white/20 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              {/* Progress */}
              <div className="mt-4 h-3 bg-white/30 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white rounded-full transition-all duration-500"
                  style={{ width: `${(unlockedCount / totalCount) * 100}%` }}
                />
              </div>
            </div>
            
            {/* Achievements Grid */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {achievementDefinitions.map((achievement, index) => {
                  const isUnlocked = unlockedIds.includes(achievement.id);
                  const progress = achievement.progress(stats);
                  const max = achievement.max;
                  
                  return (
                    <div
                      key={achievement.id}
                      className={`p-4 rounded-xl border-2 transition-all animate-fadeIn ${
                        isUnlocked 
                          ? `${achievement.bgColor} border-transparent shadow-md` 
                          : 'bg-gray-50 border-gray-100 opacity-70'
                      }`}
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2.5 rounded-xl ${isUnlocked ? 'bg-white/60' : 'bg-gray-200'}`}>
                          <div className={isUnlocked ? achievement.color : 'text-gray-400'}>
                            {achievement.icon}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className={`font-semibold ${isUnlocked ? 'text-gray-800' : 'text-gray-500'}`}>
                              {achievement.title}
                            </p>
                            {isUnlocked && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-sm text-gray-500 mt-0.5">{achievement.description}</p>
                          
                          {/* Progress bar */}
                          <div className="mt-2">
                            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all duration-500 ${
                                  isUnlocked 
                                    ? 'bg-emerald-500' 
                                    : 'bg-gray-400'
                                }`}
                                style={{ width: `${(progress / max) * 100}%` }}
                              />
                            </div>
                            <p className="text-xs text-gray-400 mt-1">
                              {progress} / {max}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer Stats */}
            <div className="p-4 border-t border-gray-100 bg-gray-50">
              <div className="flex justify-center gap-8 text-center">
                <div>
                  <p className="text-2xl font-bold text-gray-800">{tasksCompleted}</p>
                  <p className="text-xs text-gray-500">Задач</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">{pomodoroSessions}</p>
                  <p className="text-xs text-gray-500">Сессий</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">{Math.floor(totalHoursWorked)}ч</p>
                  <p className="text-xs text-gray-500">Часов</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">{currentStreak}</p>
                  <p className="text-xs text-gray-500">Streak</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
