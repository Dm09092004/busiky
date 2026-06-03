import { useMemo } from 'react';
import { RoadmapStage } from '../types';
import { CheckCircle2, Clock, Circle } from 'lucide-react';

interface GanttChartProps {
  stages: RoadmapStage[];
  projectStart: string;
  projectEnd: string;
}

export default function GanttChart({ stages, projectStart, projectEnd }: GanttChartProps) {
  const { totalDays, monthLabels, dayWidth } = useMemo(() => {
    const start = new Date(projectStart);
    const end = new Date(projectEnd);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    // Generate month labels
    const months: { label: string; start: number; width: number }[] = [];
    let currentDate = new Date(start);
    let dayIndex = 0;
    
    while (currentDate <= end) {
      const monthStart = dayIndex;
      const monthName = currentDate.toLocaleDateString('ru-RU', { month: 'short' });
      
      // Find end of month
      const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
      const monthEnd = nextMonth > end ? end : new Date(nextMonth.getTime() - 1);
      const daysInMonth = Math.ceil((monthEnd.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      
      months.push({
        label: monthName,
        start: monthStart,
        width: daysInMonth,
      });
      
      dayIndex += daysInMonth;
      currentDate = nextMonth;
    }
    
    return {
      totalDays: days,
      monthLabels: months,
      dayWidth: Math.max(8, Math.min(20, 800 / days)),
    };
  }, [projectStart, projectEnd]);

  const getStagePosition = (stage: RoadmapStage) => {
    const projectStartDate = new Date(projectStart);
    const stageStart = new Date(stage.startDate);
    const stageEnd = new Date(stage.endDate);
    
    const startOffset = Math.max(0, Math.ceil((stageStart.getTime() - projectStartDate.getTime()) / (1000 * 60 * 60 * 24)));
    const duration = Math.ceil((stageEnd.getTime() - stageStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    return {
      left: startOffset * dayWidth,
      width: duration * dayWidth,
    };
  };

  const statusColors = {
    completed: {
      bg: 'bg-gradient-to-r from-emerald-400 to-teal-400',
      border: 'border-emerald-500',
      text: 'text-white',
    },
    in_progress: {
      bg: 'bg-gradient-to-r from-blue-400 to-indigo-400',
      border: 'border-blue-500',
      text: 'text-white',
    },
    pending: {
      bg: 'bg-gradient-to-r from-gray-200 to-gray-300',
      border: 'border-gray-400',
      text: 'text-gray-600',
    },
  };

  const getStatusIcon = (status: RoadmapStage['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'in_progress':
        return <Clock className="w-4 h-4 animate-pulse" />;
      default:
        return <Circle className="w-4 h-4" />;
    }
  };

  const today = new Date();
  const projectStartDate = new Date(projectStart);
  const todayOffset = Math.ceil((today.getTime() - projectStartDate.getTime()) / (1000 * 60 * 60 * 24));
  const showTodayLine = todayOffset >= 0 && todayOffset <= totalDays;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-emerald-100 overflow-hidden">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <line x1="3" y1="10" x2="21" y2="10" />
          <line x1="9" y1="4" x2="9" y2="20" />
        </svg>
        Диаграмма Ганта
      </h3>

      <div className="overflow-x-auto">
        <div style={{ minWidth: totalDays * dayWidth + 200 }}>
          {/* Month Headers */}
          <div className="flex border-b border-gray-200 mb-2">
            <div className="w-48 flex-shrink-0" />
            <div className="flex">
              {monthLabels.map((month, i) => (
                <div
                  key={i}
                  className="text-xs font-medium text-gray-500 text-center border-l border-gray-100 first:border-l-0"
                  style={{ width: month.width * dayWidth }}
                >
                  {month.label}
                </div>
              ))}
            </div>
          </div>

          {/* Grid background */}
          <div className="relative">
            {/* Today line */}
            {showTodayLine && (
              <div 
                className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
                style={{ left: 200 + todayOffset * dayWidth }}
              >
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 px-1.5 py-0.5 bg-red-500 text-white text-xs rounded">
                  Сегодня
                </div>
              </div>
            )}

            {/* Stages */}
            {stages.map((stage, index) => {
              const position = getStagePosition(stage);
              const colors = statusColors[stage.status];
              
              return (
                <div 
                  key={stage.id}
                  className="flex items-center h-12 border-b border-gray-100 group animate-fadeIn"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Stage name */}
                  <div className="w-48 flex-shrink-0 pr-4">
                    <div className="flex items-center gap-2">
                      <span className={colors.text === 'text-white' ? 'text-gray-400' : colors.text}>
                        {getStatusIcon(stage.status)}
                      </span>
                      <span className="text-sm font-medium text-gray-700 truncate">
                        {stage.name}
                      </span>
                    </div>
                  </div>
                  
                  {/* Timeline */}
                  <div className="relative flex-1 h-full">
                    {/* Grid lines */}
                    <div className="absolute inset-0 flex">
                      {[...Array(totalDays)].map((_, i) => (
                        <div 
                          key={i} 
                          className="border-l border-gray-50 h-full"
                          style={{ width: dayWidth }}
                        />
                      ))}
                    </div>
                    
                    {/* Stage bar */}
                    <div
                      className={`absolute top-2 h-8 rounded-lg ${colors.bg} shadow-md transition-all hover:shadow-lg cursor-pointer group-hover:ring-2 ring-offset-1 ${colors.border}`}
                      style={{
                        left: position.left,
                        width: position.width,
                      }}
                    >
                      <div className={`h-full flex items-center justify-between px-2 ${colors.text}`}>
                        <span className="text-xs font-medium truncate">
                          {stage.name}
                        </span>
                        <span className="text-xs opacity-75">
                          {stage.plannedHours}ч
                        </span>
                      </div>
                      
                      {/* Progress overlay */}
                      {stage.status === 'in_progress' && stage.actualHours > 0 && (
                        <div 
                          className="absolute inset-0 bg-white/30 rounded-lg animate-progress-stripe"
                          style={{ 
                            width: `${Math.min(100, (stage.actualHours / stage.plannedHours) * 100)}%`,
                            transition: 'width 0.5s ease-out',
                          }}
                        />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gradient-to-r from-emerald-400 to-teal-400" />
              <span className="text-xs text-gray-500">Завершено</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gradient-to-r from-blue-400 to-indigo-400" />
              <span className="text-xs text-gray-500">В работе</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gradient-to-r from-gray-200 to-gray-300" />
              <span className="text-xs text-gray-500">Ожидает</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-red-500" />
              <span className="text-xs text-gray-500">Сегодня</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
