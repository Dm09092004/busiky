// =====================================================
//  Глобальный контекст: пользователь, состояние,
//  действия с задачами/проектами, уведомления, таймер
// =====================================================
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { api } from '../api/store';
import { logger } from '../utils/logger';
import type { User, Project, Task, TimeEntry } from '../types';
import { breakNotifier } from '../components/NotificationCenter';

type SnackbarSeverity = 'success' | 'info' | 'warning' | 'error';
interface SnackbarMessage { id: number; text: string; severity: SnackbarSeverity; }

interface AppContextValue {
  // Auth
  user: User | null;
  login: (login: string, password: string) => Promise<void>;
  register: (data: { username: string; email: string; first_name: string; last_name: string; password: string }) => Promise<void>;
  logout: () => void;
  // Data
  projects: Project[];
  tasks: Task[];
  users: User[];
  reload: () => Promise<void>;
  // Timer
  activeTimer: TimeEntry | null;
  startTimer: (taskId: number) => Promise<void>;
  stopTimer: () => Promise<void>;
  // Snackbar
  notify: (text: string, severity?: SnackbarSeverity) => void;
  messages: SnackbarMessage[];
  // Logs
  showLogs: boolean;
  setShowLogs: (v: boolean) => void;
}

const Ctx = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [activeTimer, setActiveTimer] = useState<TimeEntry | null>(null);
  const [messages, setMessages] = useState<SnackbarMessage[]>([]);
  const [showLogs, setShowLogs] = useState(false);

  const notify = useCallback((text: string, severity: SnackbarSeverity = 'info') => {
    const id = Date.now() + Math.random();
    setMessages((m) => [...m, { id, text, severity }]);
    setTimeout(() => setMessages((m) => m.filter((x) => x.id !== id)), 3500);
  }, []);

  // Подписка на уведомления о перерывах (точный setTimeout)
  useEffect(() => {
    const unsub = breakNotifier.subscribe((msg) => {
      notify(msg, 'warning');
    });
    return () => { unsub(); };
  }, [notify]);

  const reload = useCallback(async () => {
    const [u, p, t, us] = await Promise.all([
      api.me(),
      api.listProjects(),
      api.listTasks(),
      api.listUsers(),
    ]);
    setUser(u);
    setProjects(p);
    setTasks(t);
    setUsers(us);
  }, []);

  // initial load
  useEffect(() => {
    logger.info('app', 'Инициализация приложения KIT PM');
    reload();
  }, [reload]);

  // restore timer from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('kit_pm_active_timer');
    if (stored) {
      try {
        setActiveTimer(JSON.parse(stored));
        logger.debug('app', 'Восстановлен активный таймер из localStorage');
      } catch { /* ignore */ }
    }
  }, []);

  const login = useCallback(async (loginVal: string, password: string) => {
    const { user: u } = await api.login(loginVal, password);
    if (!u) throw new Error('Не удалось войти');
    setUser(u);
    await reload();
    notify(`Добро пожаловать, ${u.first_name}!`, 'success');
  }, [reload, notify]);

  const register = useCallback(async (data: { username: string; email: string; first_name: string; last_name: string; password: string }) => {
    const { user: u } = await api.register(data);
    if (!u) throw new Error('Не удалось зарегистрироваться');
    setUser(u);
    await reload();
    notify(`Аккаунт создан. Добро пожаловать, ${u.first_name}!`, 'success');
  }, [reload, notify]);

  const logout = useCallback(() => {
    api.logout();
    setUser(null);
    localStorage.removeItem('kit_pm_active_timer');
    setActiveTimer(null);
    notify('Вы вышли из системы', 'info');
  }, [notify]);

  const startTimer = useCallback(async (taskId: number) => {
    if (!user) return;
    if (activeTimer) {
      await api.stopTimer(user.id);
    }
    const te = await api.startTimer(taskId, user.id);
    setActiveTimer(te);
    localStorage.setItem('kit_pm_active_timer', JSON.stringify(te));
    const task = tasks.find((t) => t.id === taskId);
    logger.info('timer', `Запущен таймер: ${task?.title ?? `#${taskId}`}`);
    notify('Таймер запущен', 'success');
  }, [user, activeTimer, tasks, notify]);

  const stopTimer = useCallback(async () => {
    if (!user) return;
    const te = await api.stopTimer(user.id);
    setActiveTimer(null);
    localStorage.removeItem('kit_pm_active_timer');
    if (te) {
      // обновим фактические часы задачи
      const task = tasks.find((t) => t.id === te.task_id);
      if (task) {
        await api.updateTask(task.id, { actual_hours: task.actual_hours + te.duration_minutes / 60 });
      }
    }
    await reload();
    notify('Таймер остановлен', 'info');
  }, [user, tasks, reload, notify]);

  const value = useMemo<AppContextValue>(() => ({
    user, login, register, logout,
    projects, tasks, users, reload,
    activeTimer, startTimer, stopTimer,
    notify, messages,
    showLogs, setShowLogs,
  }), [user, login, register, logout, projects, tasks, users, reload, activeTimer, startTimer, stopTimer, notify, messages, showLogs]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp(): AppContextValue {
  const v = useContext(Ctx);
  if (!v) throw new Error('useApp must be used inside AppProvider');
  return v;
}
