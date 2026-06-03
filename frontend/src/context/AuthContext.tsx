import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';

const BASE = 'http://127.0.0.1:8000/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (data: RegisterData) => Promise<boolean>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─── HTTP helpers ─────────────────────────────────────
function getToken(): string | null {
  return localStorage.getItem('kit_access');
}

async function apiFetch(path: string, options: RequestInit = {}, skipAuth = false): Promise<any> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  const token = getToken();
  if (!skipAuth && token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { ...options, headers });

  if (res.status === 401 && !skipAuth) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      headers['Authorization'] = `Bearer ${getToken()}`;
      const res2 = await fetch(`${BASE}${path}`, { ...options, headers });
      if (!res2.ok) throw new Error(await res2.text());
      if (res2.status === 204) return null;
      return res2.json();
    }
    throw new Error('unauthorized');
  }

  if (!res.ok) {
    const text = await res.text();
    try { const j = JSON.parse(text); throw new Error(j.detail ?? JSON.stringify(j)); }
    catch (e: any) { if (e.message !== text) throw e; throw new Error(text); }
  }
  if (res.status === 204) return null;
  return res.json();
}

async function tryRefresh(): Promise<boolean> {
  const refresh = localStorage.getItem('kit_refresh');
  if (!refresh) return false;
  try {
    const res = await fetch(`${BASE}/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
    });
    if (!res.ok) return false;
    const d = await res.json();
    localStorage.setItem('kit_access', d.access);
    return true;
  } catch { return false; }
}

// ─── Маппинг Django User → фронтенд User ─────────────
function mapUser(raw: any): User {
  return {
    id: raw.id,
    username: raw.username,
    email: raw.email ?? '',
    firstName: raw.first_name ?? '',
    lastName: raw.last_name ?? '',
    role: mapRole(raw.role),
    workStart: raw.work_start_time ?? '09:00',
    workEnd: raw.work_end_time ?? '18:00',
    lunchStart: raw.lunch_start ?? '13:00',
    lunchEnd: raw.lunch_end ?? '14:00',
    skills: [],
  };
}

function mapRole(role: string): User['role'] {
  const map: Record<string, User['role']> = {
    manager: 'manager', admin: 'manager',
    employee: 'developer',
  };
  return map[role] ?? 'developer';
}

// ─── Provider ─────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) { setIsLoading(false); return; }

    apiFetch('/users/profile/')
      .then(async (raw) => {
        const u = mapUser(raw);
        // Подгружаем навыки
        try {
          const skills = await apiFetch(`/users/employee-skills/?profile=${raw.id}`);
          u.skills = (skills ?? []).map((es: any) => ({
            id: es.id,
            skill: { id: es.skill, name: es.skill_name ?? '', category: '' },
            level: es.level,
          }));
        } catch {}
        setUser(u);
      })
      .catch(() => {
        localStorage.removeItem('kit_access');
        localStorage.removeItem('kit_refresh');
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const data = await apiFetch('/token/', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      }, true);
      localStorage.setItem('kit_access', data.access);
      localStorage.setItem('kit_refresh', data.refresh);

      const raw = await apiFetch('/users/profile/');
      const u = mapUser(raw);
      try {
        const skills = await apiFetch(`/users/employee-skills/?profile=${raw.id}`);
        u.skills = (skills ?? []).map((es: any) => ({
          id: es.id,
          skill: { id: es.skill, name: es.skill_name ?? '', category: '' },
          level: es.level,
        }));
      } catch {}
      setUser(u);
      return true;
    } catch {
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('kit_access');
    localStorage.removeItem('kit_refresh');
    setUser(null);
  };

  const register = async (data: RegisterData): Promise<boolean> => {
    try {
      await apiFetch('/users/register/', {
        method: 'POST',
        body: JSON.stringify({
          username: data.username,
          email: data.email,
          first_name: data.firstName,
          last_name: data.lastName,
          password: data.password,
          password2: data.password,
        }),
      }, true);
      return login(data.username, data.password);
    } catch { return false; }
  };

  const updateProfile = async (patch: Partial<User>): Promise<void> => {
    if (!user) return;
    const body: any = {};
    if (patch.firstName !== undefined) body.first_name = patch.firstName;
    if (patch.lastName !== undefined)  body.last_name = patch.lastName;
    if (patch.email !== undefined)     body.email = patch.email;
    if (patch.workStart !== undefined) body.work_start_time = patch.workStart;
    if (patch.workEnd !== undefined)   body.work_end_time = patch.workEnd;
    if (patch.lunchStart !== undefined) body.lunch_start = patch.lunchStart;
    if (patch.lunchEnd !== undefined)   body.lunch_end = patch.lunchEnd;

    const raw = await apiFetch('/users/profile/', {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
    setUser(prev => prev ? { ...prev, ...mapUser(raw) } : prev);
  };

  return (
    <AuthContext.Provider value={{
      user, isAuthenticated: !!user, isLoading,
      login, logout, register, updateProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

// Экспортируем apiFetch для DataContext
export { apiFetch };
