import { useState } from 'react';
import { 
  Bell, 
  CheckCircle2, 
  Clock, 
  FolderKanban, 
  Users, 
  AlertCircle,
  X,
  Check,
  Trash2,
} from 'lucide-react';

interface Notification {
  id: number;
  type: 'task' | 'project' | 'team' | 'reminder' | 'achievement';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const initialNotifications: Notification[] = [
  {
    id: 1,
    type: 'task',
    title: 'Задача завершена',
    message: 'Мария К. завершила задачу "Дизайн корзины"',
    time: '5 мин назад',
    read: false,
  },
  {
    id: 2,
    type: 'reminder',
    title: 'Напоминание',
    message: 'Через 2 часа дедлайн по проекту "ТехноМир"',
    time: '15 мин назад',
    read: false,
  },
  {
    id: 3,
    type: 'project',
    title: 'Новый проект',
    message: 'Вы назначены на проект "CRM для автосалона"',
    time: '1 час назад',
    read: true,
  },
  {
    id: 4,
    type: 'achievement',
    title: 'Достижение разблокировано!',
    message: 'Вы получили "Мастер Помодоро"',
    time: '2 часа назад',
    read: true,
  },
];

const typeIcons = {
  task: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
  project: <FolderKanban className="w-5 h-5 text-blue-500" />,
  team: <Users className="w-5 h-5 text-purple-500" />,
  reminder: <AlertCircle className="w-5 h-5 text-amber-500" />,
  achievement: <Bell className="w-5 h-5 text-pink-500" />,
};

interface NotificationsPanelProps {
  onClose: () => void;
}

export default function NotificationsPanel({ onClose }: NotificationsPanelProps) {
  const [notifications, setNotifications] = useState(initialNotifications);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: number) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40" 
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 animate-slideDown overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-800">Уведомления</h3>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs font-medium rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="p-1.5 text-gray-400 hover:text-emerald-500 rounded-lg hover:bg-emerald-50 transition-colors"
                title="Отметить все прочитанными"
              >
                <Check className="w-4 h-4" />
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={clearAll}
                className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                title="Очистить все"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Bell className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-gray-500">Нет уведомлений</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((notification, index) => (
                <div 
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer animate-fadeIn ${
                    !notification.read ? 'bg-blue-50/50' : ''
                  }`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {typeIcons[notification.type]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm ${!notification.read ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                          {notification.title}
                        </p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                          className="p-1 text-gray-400 hover:text-red-500 rounded opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5">{notification.message}</p>
                      <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {notification.time}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="p-3 border-t border-gray-100 bg-gray-50">
            <button className="w-full py-2 text-sm text-gray-600 hover:text-gray-800 font-medium rounded-xl hover:bg-gray-100 transition-colors">
              Показать все уведомления
            </button>
          </div>
        )}
      </div>
    </>
  );
}
