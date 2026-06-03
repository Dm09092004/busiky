import { useState, useEffect } from 'react';
import { 
  Settings, 
  Volume2, 
  VolumeX,
  Bell,
  Clock,
  X,
  Check,
} from 'lucide-react';

interface SettingsPanelProps {
  onClose: () => void;
}

interface AppSettings {
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  darkMode: boolean;
  pomodoroWork: number;
  pomodoroBreak: number;
  pomodoroLongBreak: number;
  autoStartBreaks: boolean;
}

const defaultSettings: AppSettings = {
  soundEnabled: true,
  notificationsEnabled: true,
  darkMode: false,
  pomodoroWork: 45,
  pomodoroBreak: 5,
  pomodoroLongBreak: 15,
  autoStartBreaks: false,
};

export default function SettingsPanel({ onClose }: SettingsPanelProps) {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const savedSettings = localStorage.getItem('studiokit_settings');
    if (savedSettings) {
      setSettings({ ...defaultSettings, ...JSON.parse(savedSettings) });
    }
  }, []);

  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings(prev => {
      const newSettings = { ...prev, [key]: value };
      localStorage.setItem('studiokit_settings', JSON.stringify(newSettings));
      return newSettings;
    });
    
    // Show saved indicator
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      updateSetting('notificationsEnabled', permission === 'granted');
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40" 
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 animate-slideDown overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-800">Настройки</h3>
          </div>
          <div className="flex items-center gap-2">
            {saved && (
              <span className="flex items-center gap-1 text-xs text-emerald-600 animate-fadeIn">
                <Check className="w-3 h-3" />
                Сохранено
              </span>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Settings List */}
        <div className="p-4 space-y-4">
          {/* Sound */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {settings.soundEnabled ? (
                <Volume2 className="w-5 h-5 text-emerald-500" />
              ) : (
                <VolumeX className="w-5 h-5 text-gray-400" />
              )}
              <div>
                <p className="text-sm font-medium text-gray-800">Звуки</p>
                <p className="text-xs text-gray-500">Звуковые уведомления</p>
              </div>
            </div>
            <button
              onClick={() => updateSetting('soundEnabled', !settings.soundEnabled)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                settings.soundEnabled ? 'bg-emerald-500' : 'bg-gray-300'
              }`}
            >
              <span 
                className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                  settings.soundEnabled ? 'left-7' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* Notifications */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className={`w-5 h-5 ${settings.notificationsEnabled ? 'text-blue-500' : 'text-gray-400'}`} />
              <div>
                <p className="text-sm font-medium text-gray-800">Уведомления</p>
                <p className="text-xs text-gray-500">Push-уведомления</p>
              </div>
            </div>
            <button
              onClick={() => {
                if (!settings.notificationsEnabled) {
                  requestNotificationPermission();
                } else {
                  updateSetting('notificationsEnabled', false);
                }
              }}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                settings.notificationsEnabled ? 'bg-blue-500' : 'bg-gray-300'
              }`}
            >
              <span 
                className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                  settings.notificationsEnabled ? 'left-7' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* Auto-start breaks */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className={`w-5 h-5 ${settings.autoStartBreaks ? 'text-purple-500' : 'text-gray-400'}`} />
              <div>
                <p className="text-sm font-medium text-gray-800">Авто-перерывы</p>
                <p className="text-xs text-gray-500">Автоматический старт</p>
              </div>
            </div>
            <button
              onClick={() => updateSetting('autoStartBreaks', !settings.autoStartBreaks)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                settings.autoStartBreaks ? 'bg-purple-500' : 'bg-gray-300'
              }`}
            >
              <span 
                className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                  settings.autoStartBreaks ? 'left-7' : 'left-1'
                }`}
              />
            </button>
          </div>

          <hr className="border-gray-100" />

          {/* Pomodoro Settings */}
          <div>
            <p className="text-sm font-medium text-gray-800 mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              Настройки Помодоро
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Работа</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateSetting('pomodoroWork', Math.max(15, settings.pomodoroWork - 5))}
                    className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium transition-colors"
                  >
                    -
                  </button>
                  <span className="w-12 text-center font-medium">{settings.pomodoroWork}м</span>
                  <button
                    onClick={() => updateSetting('pomodoroWork', Math.min(90, settings.pomodoroWork + 5))}
                    className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Короткий перерыв</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateSetting('pomodoroBreak', Math.max(1, settings.pomodoroBreak - 1))}
                    className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium transition-colors"
                  >
                    -
                  </button>
                  <span className="w-12 text-center font-medium">{settings.pomodoroBreak}м</span>
                  <button
                    onClick={() => updateSetting('pomodoroBreak', Math.min(15, settings.pomodoroBreak + 1))}
                    className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Длинный перерыв</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateSetting('pomodoroLongBreak', Math.max(5, settings.pomodoroLongBreak - 5))}
                    className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium transition-colors"
                  >
                    -
                  </button>
                  <span className="w-12 text-center font-medium">{settings.pomodoroLongBreak}м</span>
                  <button
                    onClick={() => updateSetting('pomodoroLongBreak', Math.min(30, settings.pomodoroLongBreak + 5))}
                    className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-100 bg-gray-50">
          <p className="text-xs text-gray-400 text-center">
            Настройки сохраняются автоматически
          </p>
        </div>
      </div>
    </>
  );
}
