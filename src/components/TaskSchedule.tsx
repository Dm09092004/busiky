import { useMemo } from 'react';
import { Task, ScheduleBlock } from '../types';
import { Coffee, Sun, UtensilsCrossed, Laptop } from 'lucide-react';

interface TaskScheduleProps {
  tasks: Task[];
  workStart: string;
  workEnd: string;
  lunchStart: string;
  lunchEnd: string;
}

export default function TaskSchedule({ 
  tasks, 
  workStart, 
  workEnd, 
  lunchStart, 
  lunchEnd 
}: TaskScheduleProps) {
  const schedule = useMemo(() => {
    const blocks: ScheduleBlock[] = [];
    
    const parseTime = (time: string) => {
      const [h, m] = time.split(':').map(Number);
      return h * 60 + m;
    };

    const formatTime = (minutes: number) => {
      const h = Math.floor(minutes / 60);
      const m = minutes % 60;
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    };

    const workStartMin = parseTime(workStart);
    const workEndMin = parseTime(workEnd);
    const lunchStartMin = parseTime(lunchStart);
    const lunchEndMin = parseTime(lunchEnd);
    
    const pomodoroWork = 45;
    const shortBreak = 5;
    const longBreak = 15;
    
    let currentTime = workStartMin;
    let sessionCount = 0;
    let taskIndex = 0;
    
    while (currentTime < workEndMin && taskIndex < tasks.length) {
      // Проверяем обед
      if (currentTime < lunchStartMin && currentTime + pomodoroWork > lunchStartMin) {
        // Добавляем короткий блок работы до обеда
        if (lunchStartMin - currentTime > 0) {
          blocks.push({
            id: `work-${blocks.length}`,
            type: 'work',
            startTime: formatTime(currentTime),
            endTime: formatTime(lunchStartMin),
            taskId: tasks[taskIndex]?.id,
            task: tasks[taskIndex],
            duration: lunchStartMin - currentTime,
          });
        }
        
        // Обед
        blocks.push({
          id: `lunch`,
          type: 'lunch',
          startTime: formatTime(lunchStartMin),
          endTime: formatTime(lunchEndMin),
          duration: lunchEndMin - lunchStartMin,
        });
        
        currentTime = lunchEndMin;
        continue;
      }
      
      // Помодоро сессия
      const sessionEnd = Math.min(currentTime + pomodoroWork, workEndMin);
      
      if (currentTime >= lunchStartMin && currentTime < lunchEndMin) {
        currentTime = lunchEndMin;
        continue;
      }
      
      blocks.push({
        id: `work-${blocks.length}`,
        type: 'work',
        startTime: formatTime(currentTime),
        endTime: formatTime(sessionEnd),
        taskId: tasks[taskIndex]?.id,
        task: tasks[taskIndex],
        duration: sessionEnd - currentTime,
      });
      
      currentTime = sessionEnd;
      sessionCount++;
      
      // Перерыв
      if (currentTime < workEndMin) {
        const breakDuration = sessionCount % 4 === 0 ? longBreak : shortBreak;
        const breakEnd = Math.min(currentTime + breakDuration, workEndMin);
        
        // Пропускаем перерыв если попадает на обед
        if (!(currentTime >= lunchStartMin && currentTime < lunchEndMin)) {
          blocks.push({
            id: `break-${blocks.length}`,
            type: sessionCount % 4 === 0 ? 'long_break' : 'short_break',
            startTime: formatTime(currentTime),
            endTime: formatTime(breakEnd),
            duration: breakEnd - currentTime,
          });
        }
        
        currentTime = breakEnd;
      }
      
      // Переходим к следующей задаче если текущая "завершена" по времени
      if (tasks[taskIndex] && sessionCount >= Math.ceil(tasks[taskIndex].plannedHours * 60 / pomodoroWork)) {
        taskIndex++;
        sessionCount = 0;
      }
    }
    
    return blocks;
  }, [tasks, workStart, workEnd, lunchStart, lunchEnd]);

  const getBlockStyle = (block: ScheduleBlock) => {
    switch (block.type) {
      case 'work':
        return 'bg-gradient-to-r from-emerald-100 to-teal-100 border-emerald-200';
      case 'short_break':
        return 'bg-blue-50 border-blue-200';
      case 'long_break':
        return 'bg-purple-50 border-purple-200';
      case 'lunch':
        return 'bg-orange-50 border-orange-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getBlockIcon = (type: ScheduleBlock['type']) => {
    switch (type) {
      case 'work':
        return <Laptop className="w-4 h-4 text-emerald-600" />;
      case 'short_break':
        return <Coffee className="w-4 h-4 text-blue-600" />;
      case 'long_break':
        return <Sun className="w-4 h-4 text-purple-600" />;
      case 'lunch':
        return <UtensilsCrossed className="w-4 h-4 text-orange-600" />;
    }
  };

  const getBlockLabel = (type: ScheduleBlock['type']) => {
    switch (type) {
      case 'work':
        return 'Работа';
      case 'short_break':
        return 'Короткий перерыв';
      case 'long_break':
        return 'Длинный перерыв';
      case 'lunch':
        return 'Обед';
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-emerald-100">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Расписание дня</h3>
      
      {schedule.length === 0 ? (
        <p className="text-gray-500 text-center py-8">
          Добавьте задачи для генерации расписания
        </p>
      ) : (
        <div className="space-y-2">
          {schedule.map(block => (
            <div 
              key={block.id}
              className={`flex items-center gap-3 p-3 rounded-xl border ${getBlockStyle(block)}`}
            >
              <div className="flex items-center gap-2 min-w-[100px]">
                <span className="text-sm font-medium text-gray-600">{block.startTime}</span>
                <span className="text-gray-300">—</span>
                <span className="text-sm font-medium text-gray-600">{block.endTime}</span>
              </div>
              
              <div className="flex items-center gap-2">
                {getBlockIcon(block.type)}
                <span className="text-sm font-medium">
                  {block.task ? block.task.title : getBlockLabel(block.type)}
                </span>
              </div>
              
              <span className="ml-auto text-xs text-gray-400">
                {block.duration} мин
              </span>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-4 p-3 bg-gray-50 rounded-xl">
        <p className="text-xs text-gray-500 text-center">
          📅 Расписание генерируется автоматически по технике Помодоро (45/5/15)
        </p>
      </div>
    </div>
  );
}
