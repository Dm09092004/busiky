import { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Users, 
  FolderPlus, 
  CheckCircle, 
  AlertCircle,
  Clock,
  X,
  ChevronDown,
  ChevronUp,
  Cpu,
  FileText,
} from 'lucide-react';

export interface LogEntry {
  id: string;
  timestamp: Date;
  type: 'info' | 'success' | 'warning' | 'ai';
  category: 'roadmap' | 'analysis' | 'task' | 'project' | 'team' | 'system';
  message: string;
  details?: string;
}

interface ActivityLogProps {
  logs: LogEntry[];
  onClear?: () => void;
}

const categoryIcons = {
  roadmap: <Sparkles className="w-4 h-4" />,
  analysis: <Cpu className="w-4 h-4" />,
  task: <CheckCircle className="w-4 h-4" />,
  project: <FolderPlus className="w-4 h-4" />,
  team: <Users className="w-4 h-4" />,
  system: <AlertCircle className="w-4 h-4" />,
};

const typeStyles = {
  info: 'bg-blue-50 border-blue-200 text-blue-700',
  success: 'bg-emerald-50 border-emerald-200 text-emerald-700',
  warning: 'bg-amber-50 border-amber-200 text-amber-700',
  ai: 'bg-purple-50 border-purple-200 text-purple-700',
};

export default function ActivityLog({ logs, onClear }: ActivityLogProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const recentLogs = isExpanded ? logs : logs.slice(0, 3);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ru-RU', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit',
    });
  };

  if (logs.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-emerald-100 overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-gray-500" />
          <h3 className="font-semibold text-gray-800">Журнал активности</h3>
          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
            {logs.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {onClear && logs.length > 0 && (
            <button
              onClick={onClear}
              className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
              title="Очистить"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>
      
      <div className={`divide-y divide-gray-100 ${isExpanded ? 'max-h-96 overflow-y-auto' : ''}`}>
        {recentLogs.map((log, index) => (
          <div 
            key={log.id}
            className={`p-3 hover:bg-gray-50 transition-colors cursor-pointer animate-fadeIn`}
            style={{ animationDelay: `${index * 0.05}s` }}
            onClick={() => setExpandedLogId(expandedLogId === log.id ? null : log.id)}
          >
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${typeStyles[log.type]}`}>
                {categoryIcons[log.category]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-gray-800">{log.message}</span>
                  {log.type === 'ai' && (
                    <span className="px-1.5 py-0.5 bg-purple-100 text-purple-600 text-xs font-medium rounded">
                      AI
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Clock className="w-3 h-3" />
                  <span>{formatTime(log.timestamp)}</span>
                </div>
                
                {/* Детали */}
                {log.details && expandedLogId === log.id && (
                  <div className="mt-2 p-2 bg-gray-100 rounded-lg text-xs text-gray-600 font-mono whitespace-pre-wrap animate-slideDown">
                    {log.details}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {logs.length > 3 && !isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className="w-full p-3 text-sm text-emerald-600 hover:bg-emerald-50 transition-colors font-medium"
        >
          Показать ещё {logs.length - 3} записей
        </button>
      )}
    </div>
  );
}

// Хук для управления логами
export function useActivityLog() {
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const addLog = (
    type: LogEntry['type'],
    category: LogEntry['category'],
    message: string,
    details?: string
  ) => {
    const newLog: LogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      type,
      category,
      message,
      details,
    };
    
    setLogs(prev => [newLog, ...prev].slice(0, 100)); // Хранить максимум 100 записей
    
    return newLog;
  };

  const clearLogs = () => setLogs([]);

  // Восстановление из localStorage
  useEffect(() => {
    const saved = localStorage.getItem('studiokit_logs');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setLogs(parsed.map((l: any) => ({ ...l, timestamp: new Date(l.timestamp) })));
      } catch (e) {
        // ignore
      }
    }
  }, []);

  // Сохранение в localStorage
  useEffect(() => {
    localStorage.setItem('studiokit_logs', JSON.stringify(logs.slice(0, 50)));
  }, [logs]);

  return { logs, addLog, clearLogs };
}
