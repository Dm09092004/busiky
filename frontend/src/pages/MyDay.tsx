import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useTimer } from '../context/TimerContext';
import { useTheme } from '../context/ThemeContext';
import PomodoroTimer from '../components/PomodoroTimer';
import Achievements from '../components/Achievements';
import LevelProgress, { XP_REWARDS } from '../components/LevelProgress';
import DailyGoals from '../components/DailyGoals';
import { 
  CheckCircle2, 
  Circle, 
  PlayCircle, 
  Clock,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Flame,
  Target,
  AlertCircle,
  Star,
  Play,
} from 'lucide-react';
import { Task } from '../types';

export default function MyDay() {
  const { user } = useAuth();
  const { getUserTasks, updateTask, logTime, projects } = useData();
  const { setActiveTask, startTimer } = useTimer();
  const { colors } = useTheme();
  
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [activeTaskId, setActiveTaskId] = useState<number | null>(null);
  const [tasksCompletedToday, setTasksCompletedToday] = useState(0);
  const [pomodoroSessions, setPomodoroSessions] = useState(0);
  const [totalHoursWorked, setTotalHoursWorked] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(3);
  const [xp, setXp] = useState(0);

  const tasks = getUserTasks(user?.id || 0, selectedDate);

  // Load saved stats
  useEffect(() => {
    const savedStats = localStorage.getItem('studiokit_user_stats');
    if (savedStats) {
      const stats = JSON.parse(savedStats);
      setTasksCompletedToday(stats.tasksCompletedToday || 0);
      setPomodoroSessions(stats.pomodoroSessions || 0);
      setTotalHoursWorked(stats.totalHoursWorked || 0);
      setCurrentStreak(stats.currentStreak || 0);
      setXp(stats.xp || 0);
    }
  }, []);

  // Save stats
  useEffect(() => {
    localStorage.setItem('studiokit_user_stats', JSON.stringify({
      tasksCompletedToday,
      pomodoroSessions,
      totalHoursWorked,
      currentStreak,
      xp,
    }));
  }, [tasksCompletedToday, pomodoroSessions, totalHoursWorked, currentStreak, xp]);

  const handlePreviousDay = () => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() - 1);
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + 1);
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  const handleToday = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  const handleStartTask = (task: Task) => {
    setActiveTaskId(task.id);
    setActiveTask(task.id, task.title);
    updateTask(task.id, { status: 'in_progress' });
    startTimer(task.id, task.title);
  };

  const handleCompleteTask = (taskId: number) => {
    updateTask(taskId, { status: 'completed' });
    setTasksCompletedToday(prev => prev + 1);
    setXp(prev => prev + XP_REWARDS.TASK_COMPLETED);
    if (activeTaskId === taskId) {
      setActiveTaskId(null);
      setActiveTask(null, null);
    }
  };

  const handleWorkComplete = (minutes: number) => {
    if (activeTaskId) {
      logTime(activeTaskId, minutes);
      setTotalHoursWorked(prev => prev + minutes / 60);
    }
  };

  const handleSessionComplete = () => {
    setPomodoroSessions(prev => prev + 1);
    setXp(prev => prev + XP_REWARDS.POMODORO_SESSION);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    if (dateStr === today) return 'Сегодня';
    if (dateStr === tomorrow) return 'Завтра';
    if (dateStr === yesterday) return 'Вчера';

    return date.toLocaleDateString('ru-RU', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long' 
    });
  };

  const priorityConfig = {
    critical: { border: 'border-l-red-500', bg: 'bg-red-50', icon: <AlertCircle className="w-4 h-4 text-red-500" /> },
    high: { border: 'border-l-orange-500', bg: 'bg-orange-50', icon: <Star className="w-4 h-4 text-orange-500 fill-orange-500" /> },
    medium: { border: 'border-l-yellow-500', bg: 'bg-yellow-50', icon: null },
    low: { border: 'border-l-gray-300', bg: 'bg-gray-50', icon: null },
  };

  const getTaskProgress = (task: Task) => {
    if (task.plannedHours === 0) return 0;
    return Math.min(100, Math.round((task.actualHours / task.plannedHours) * 100));
  };

  const totalPlannedHours = tasks.reduce((sum, t) => sum + t.plannedHours, 0);
  const totalActualHours = tasks.reduce((sum, t) => sum + t.actualHours, 0);
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const completedProjects = projects.filter(p => p.status === 'completed').length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column - Tasks */}
      <div className="lg:col-span-2 space-y-6">
        {/* Date Navigation */}
        <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100 animate-fadeIn">
          <div className="flex items-center justify-between">
            <button
              onClick={handlePreviousDay}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-all active:scale-95"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-800 capitalize">
                {formatDate(selectedDate)}
              </h2>
              <p className="text-sm text-gray-500">
                {new Date(selectedDate).toLocaleDateString('ru-RU', { 
                  day: 'numeric', 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </p>
            </div>

            <button
              onClick={handleNextDay}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-all active:scale-95"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {selectedDate !== new Date().toISOString().split('T')[0] && (
            <button
              onClick={handleToday}
              className={`mt-3 w-full py-2 rounded-xl text-sm font-medium transition-colors hover:opacity-80`}
              style={{ color: colors.primary, backgroundColor: colors.primary + '15' }}
            >
              Вернуться к сегодня
            </button>
          )}
        </div>

        {/* Daily Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100 card-hover animate-fadeIn" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl" style={{ backgroundColor: colors.primary + '20' }}>
                <Target className="w-5 h-5" style={{ color: colors.primary }} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{completedTasks}/{tasks.length}</p>
                <p className="text-sm text-gray-500">Задач</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100 card-hover animate-fadeIn" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-100">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{totalActualHours.toFixed(1)}ч</p>
                <p className="text-sm text-gray-500">из {totalPlannedHours}ч</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100 card-hover animate-fadeIn" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-orange-100">
                <Flame className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{currentStreak}</p>
                <p className="text-sm text-gray-500">дней</p>
              </div>
            </div>
          </div>
        </div>

        {/* Task List */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 animate-fadeIn" style={{ animationDelay: '0.4s' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-gray-400" />
              Задачи на день
            </h3>
            {completedTasks > 0 && (
              <span 
                className="px-3 py-1 text-sm font-medium rounded-full"
                style={{ backgroundColor: colors.primary + '20', color: colors.primary }}
              >
                +{completedTasks} выполнено
              </span>
            )}
          </div>
          
          {tasks.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500">На этот день задач нет</p>
              <p className="text-sm text-gray-400 mt-2">Можете отдохнуть или взять задачи из других дней</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.map((task, index) => {
                const priority = priorityConfig[task.priority];
                const isActive = activeTaskId === task.id;
                
                return (
                  <div 
                    key={task.id}
                    className={`p-4 rounded-xl border-l-4 transition-all ${priority.border} ${priority.bg} ${
                      isActive ? 'ring-2 shadow-lg' : ''
                    } ${task.status === 'completed' ? 'opacity-60' : ''} animate-fadeIn card-hover`}
                    style={{ 
                      animationDelay: `${index * 0.05}s`,
                      ['--tw-ring-color' as any]: isActive ? colors.primary : undefined,
                    }}
                  >
                    <div className="flex items-start gap-4">
                      <button
                        onClick={() => task.status !== 'completed' && handleCompleteTask(task.id)}
                        className={`mt-1 flex-shrink-0 transition-all active:scale-90 ${
                          task.status === 'completed' ? 'text-emerald-500' : 'text-gray-300 hover:text-emerald-400'
                        }`}
                        disabled={task.status === 'completed'}
                      >
                        {task.status === 'completed' ? (
                          <CheckCircle2 className="w-6 h-6" />
                        ) : task.status === 'in_progress' ? (
                          <PlayCircle className="w-6 h-6 animate-pulse" style={{ color: colors.primary }} />
                        ) : (
                          <Circle className="w-6 h-6" />
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className={`font-medium ${task.status === 'completed' ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                            {task.title}
                          </h4>
                          {priority.icon}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{task.projectName}</p>
                        
                        <div className="mt-3">
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>{task.actualHours.toFixed(1)} / {task.plannedHours}ч</span>
                            <span>{getTaskProgress(task)}%</span>
                          </div>
                          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-500`}
                              style={{ 
                                width: `${getTaskProgress(task)}%`,
                                background: task.status === 'completed' 
                                  ? '#10b981' 
                                  : `linear-gradient(to right, ${colors.primary}, ${colors.accent})`,
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      {task.status !== 'completed' && (
                        <button
                          onClick={() => handleStartTask(task)}
                          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all active:scale-95 flex items-center gap-2 ${
                            isActive
                              ? 'text-white shadow-lg'
                              : 'border hover:opacity-80'
                          }`}
                          style={{
                            background: isActive ? `linear-gradient(to right, ${colors.primary}, ${colors.accent})` : undefined,
                            borderColor: isActive ? undefined : colors.primary + '40',
                            color: isActive ? 'white' : colors.primary,
                          }}
                        >
                          {isActive ? (
                            'Активна'
                          ) : (
                            <>
                              <Play className="w-4 h-4" />
                              Начать
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right Column - Timer & Info */}
      <div className="space-y-6">
        {/* Level & Achievements */}
        <div className="flex items-center justify-between gap-4 animate-fadeIn">
          <div className="flex-1">
            <LevelProgress xp={xp} />
          </div>
          <Achievements 
            tasksCompleted={tasksCompletedToday}
            pomodoroSessions={pomodoroSessions}
            totalHoursWorked={totalHoursWorked}
            projectsCompleted={completedProjects}
            currentStreak={currentStreak}
          />
        </div>

        {/* Daily Goals */}
        <div className="animate-fadeIn" style={{ animationDelay: '0.1s' }}>
          <DailyGoals 
            tasksCompleted={tasksCompletedToday}
            pomodoroSessions={pomodoroSessions}
            hoursWorked={totalHoursWorked}
          />
        </div>

        {/* Pomodoro Timer */}
        <div className="animate-fadeIn" style={{ animationDelay: '0.2s' }}>
          <PomodoroTimer 
            onWorkComplete={handleWorkComplete}
            onSessionComplete={handleSessionComplete}
          />
        </div>

        {/* Work Schedule Info */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 animate-fadeIn" style={{ animationDelay: '0.3s' }}>
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-400" />
            Рабочее время
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
              <span className="text-gray-500">Начало работы</span>
              <span className="font-medium text-gray-800">{user?.workStart || '09:00'}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
              <span className="text-gray-500">Обед</span>
              <span className="font-medium text-gray-800">{user?.lunchStart || '13:00'} — {user?.lunchEnd || '14:00'}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
              <span className="text-gray-500">Конец работы</span>
              <span className="font-medium text-gray-800">{user?.workEnd || '18:00'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
