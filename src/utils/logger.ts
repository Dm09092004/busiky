// =====================================================
//  Логгер — единая точка логирования для всего приложения
//  Пишет в localStorage, выводит в коноль и в LogPanel
// =====================================================

export type LogLevel = 'info' | 'success' | 'warn' | 'error' | 'debug';

export interface LogEntry {
  id: string;
  ts: number;
  level: LogLevel;
  scope: string;
  message: string;
  data?: unknown;
}

const STORAGE_KEY = 'kit_pm_logs';
const MAX_LOGS = 500;

type Listener = (logs: LogEntry[]) => void;
const listeners: Set<Listener> = new Set();

function load(): LogEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as LogEntry[];
  } catch {
    return [];
  }
}

function save(logs: LogEntry[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs.slice(-MAX_LOGS)));
  } catch {
    /* ignore */
  }
}

function emit() {
  const logs = load();
  listeners.forEach((l) => l(logs));
}

export const logger = {
  subscribe(listener: Listener) {
    listeners.add(listener);
    listener(load());
    return () => { listeners.delete(listener); };
  },

  getAll(): LogEntry[] {
    return load();
  },

  clear() {
    save([]);
    emit();
  },

  log(level: LogLevel, scope: string, message: string, data?: unknown) {
    const entry: LogEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      ts: Date.now(),
      level,
      scope,
      message,
      data,
    };
    const logs = [...load(), entry];
    save(logs);

    const style =
      level === 'error' ? 'color:#e74c3c;font-weight:600' :
      level === 'warn'  ? 'color:#f39c12;font-weight:600' :
      level === 'success' ? 'color:#27ae60;font-weight:600' :
      level === 'debug' ? 'color:#7f8c8d' :
      'color:#16a085';

    // eslint-disable-next-line no-console
    console.log(`%c[${scope}] ${message}`, style, data ?? '');
    emit();
  },

  info(scope: string, msg: string, data?: unknown)  { this.log('info',  scope, msg, data); },
  ok(scope: string, msg: string, data?: unknown)    { this.log('success', scope, msg, data); },
  warn(scope: string, msg: string, data?: unknown)  { this.log('warn',  scope, msg, data); },
  err(scope: string, msg: string, data?: unknown)   { this.log('error', scope, msg, data); },
  debug(scope: string, msg: string, data?: unknown) { this.log('debug', scope, msg, data); },
};
