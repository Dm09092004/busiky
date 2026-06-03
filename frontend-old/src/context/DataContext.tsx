import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  Project, Task, User, RoadmapStage,
  StaffRecommendation, DashboardStats, ProjectAnalytics, ActivityLog,
} from '../types';
import { useAuth, apiFetch } from './AuthContext';

// ─── Types ────────────────────────────────────────────
interface DataContextType {
  projects: Project[];
  tasks: Task[];
  employees: User[];
  isLoading: boolean;
  getProject: (id: number) => Project | undefined;
  createProject: (project: Partial<Project>) => Promise<Project>;
  updateProject: (id: number, data: Partial<Project>) => Promise<void>;
  deleteProject: (id: number) => Promise<void>;
  generateRoadmap: (projectId: number) => Promise<RoadmapStage[]>;
  getRecommendations: (projectId: number) => Promise<StaffRecommendation[]>;
  assignEmployee: (projectId: number, userId: number) => Promise<void>;
  getTask: (id: number) => Task | undefined;
  getProjectTasks: (projectId: number) => Task[];
  getUserTasks: (userId: number, date?: string) => Task[];
  createTask: (task: Partial<Task>) => Promise<Task>;
  updateTask: (id: number, data: Partial<Task>) => Promise<void>;
  startTask: (taskId: number) => void;
  completeTask: (taskId: number) => void;
  getDashboardStats: () => DashboardStats;
  getProjectAnalytics: (projectId: number) => ProjectAnalytics;
  logTime: (taskId: number, minutes: number) => void;
  refresh: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// ─── Mappers ──────────────────────────────────────────
function mapDjangoRole(role: string): User['role'] {
  const m: Record<string, User['role']> = {
    manager: 'manager', admin: 'manager', employee: 'developer',
  };
  return m[role] ?? 'developer';
}

function mapUser(raw: any): User {
  return {
    id: raw.id,
    username: raw.username,
    email: raw.email ?? '',
    firstName: raw.first_name ?? '',
    lastName: raw.last_name ?? '',
    role: mapDjangoRole(raw.role),
    workStart: raw.work_start_time ?? '09:00',
    workEnd: raw.work_end_time ?? '18:00',
    lunchStart: raw.lunch_start ?? '13:00',
    lunchEnd: raw.lunch_end ?? '14:00',
    skills: (raw.skills ?? []).map((es: any) => ({
      id: es.id ?? 0,
      skill: { id: es.skill ?? 0, name: es.skill_name ?? '', category: '' },
      level: es.level ?? 1,
    })),
  };
}

function mapProject(raw: any, employees: User[]): Project {
  const manager = employees.find(e => e.id === raw.created_by) ?? employees[0];
  const team = (raw.team ?? []).map((uid: number) => employees.find(e => e.id === uid)).filter(Boolean) as User[];
  const complexity = calcComplexity(raw.technical_spec ?? raw.description ?? '', raw.complexity);

  return {
    id: raw.id,
    name: raw.name,
    description: raw.description ?? '',
    client: raw.client ?? '',
    status: mapProjectStatus(raw.status),
    complexity,
    startDate: raw.planned_start ?? raw.created_at?.split('T')[0] ?? new Date().toISOString().split('T')[0],
    endDate: raw.planned_end ?? '',
    plannedHours: raw.planned_hours ?? 0,
    actualHours: raw.actual_hours ?? 0,
    budget: raw.budget ?? 0,
    technicalSpec: raw.technical_spec ?? '',
    manager: manager ?? { id: 0, username: '', email: '', firstName: '', lastName: '', role: 'manager', workStart: '09:00', workEnd: '18:00', lunchStart: '13:00', lunchEnd: '14:00', skills: [] },
    team,
    roadmap: (raw.roadmap ?? []).map(mapStage),
    createdAt: raw.created_at ?? new Date().toISOString(),
  };
}

function mapProjectStatus(s: string): Project['status'] {
  const m: Record<string, Project['status']> = {
    new: 'planning', in_progress: 'in_progress', completed: 'completed', archived: 'on_hold',
  };
  return m[s] ?? 'planning';
}

function reverseStatus(s: Project['status']): string {
  const m: Record<Project['status'], string> = {
    planning: 'new', in_progress: 'in_progress', completed: 'completed', on_hold: 'archived', cancelled: 'archived',
  };
  return m[s] ?? 'new';
}

function calcComplexity(spec: string, djangoComplexity?: number): Project['complexity'] {
  if (djangoComplexity !== undefined) {
    if (djangoComplexity >= 8) return 'very_high';
    if (djangoComplexity >= 6) return 'high';
    if (djangoComplexity >= 4) return 'medium';
    return 'low';
  }
  const kw = ['api', 'интеграц', 'база', 'react', 'django', 'фронт', 'бэк', 'дизайн', 'верстка'];
  const count = kw.filter(k => spec.toLowerCase().includes(k)).length;
  if (count >= 6) return 'very_high';
  if (count >= 4) return 'high';
  if (count >= 2) return 'medium';
  return 'low';
}

function mapStage(raw: any): RoadmapStage {
  return {
    id: raw.id,
    name: raw.name,
    description: raw.description ?? '',
    order: raw.order,
    plannedHours: raw.planned_hours ?? raw.estimated_hours ?? 40,
    actualHours: raw.actual_hours ?? 0,
    startDate: raw.planned_start ?? '',
    endDate: raw.planned_end ?? '',
    status: raw.status === 'completed' ? 'completed' : raw.status === 'in_progress' ? 'in_progress' : 'pending',
    projectId: raw.project,
  };
}

function mapTask(raw: any, employees: User[], projects: Project[]): Task {
  const assignee = employees.find(e => e.id === raw.assigned_to)
    ?? { id: raw.assigned_to ?? 0, username: '', email: '', firstName: '—', lastName: '', role: 'developer' as User['role'], workStart: '09:00', workEnd: '18:00', lunchStart: '13:00', lunchEnd: '14:00', skills: [] };
  const proj = projects.find(p => p.id === raw.project);

  return {
    id: raw.id,
    title: raw.title,
    description: raw.description ?? '',
    projectId: raw.project,
    projectName: proj?.name ?? '',
    stageId: raw.stage ?? undefined,
    assigneeId: raw.assigned_to ?? 0,
    assignee,
    status: mapTaskStatus(raw.status),
    priority: raw.priority ?? 'medium',
    plannedHours: Math.round((raw.planned_duration ?? 60) / 60 * 10) / 10,
    actualHours: Math.round((raw.actual_duration ?? 0) / 60 * 10) / 10,
    scheduledDate: raw.scheduled_date ?? raw.deadline?.split('T')[0] ?? new Date().toISOString().split('T')[0],
    dueDate: raw.deadline?.split('T')[0] ?? '',
    createdAt: raw.created_at ?? new Date().toISOString(),
    timeEntries: [],
  };
}

function mapTaskStatus(s: string): Task['status'] {
  const m: Record<string, Task['status']> = {
    new: 'new', in_progress: 'in_progress', done: 'completed', blocked: 'cancelled',
  };
  return m[s] ?? 'new';
}

function reverseTaskStatus(s: Task['status']): string {
  const m: Record<Task['status'], string> = {
    new: 'new', in_progress: 'in_progress', on_review: 'in_progress', completed: 'done', cancelled: 'blocked',
  };
  return m[s] ?? 'new';
}

// ─── Provider ─────────────────────────────────────────
export function DataProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [employees, setEmployees] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadAll = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      // Загружаем параллельно
      const [empsRaw, projsRaw, tasksRaw] = await Promise.all([
        apiFetch('/users/list/').catch(() => []),
        apiFetch('/projects/').catch(() => []),
        apiFetch('/tasks/').catch(() => []),
      ]);

      const emps: User[] = (empsRaw ?? []).map(mapUser);
      setEmployees(emps);

      // Подгружаем назначения для каждого проекта
      const projsWithTeam = await Promise.all(
        (projsRaw ?? []).map(async (p: any) => {
          try {
            const assignments = await apiFetch(`/project-assignments/?project=${p.id}&is_active=true`);
            p.team = (assignments ?? []).map((a: any) => a.user);
          } catch { p.team = []; }
          try {
            const stages = await apiFetch(`/roadmap-stages/?project=${p.id}`);
            p.roadmap = stages ?? [];
          } catch { p.roadmap = []; }
          return p;
        })
      );

      const projs: Project[] = projsWithTeam.map(p => mapProject(p, emps));
      setProjects(projs);

      const mappedTasks: Task[] = (tasksRaw ?? []).map((t: any) => mapTask(t, emps, projs));
      setTasks(mappedTasks);
    } catch (e) {
      console.error('DataContext loadAll error:', e);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const refresh = async () => { await loadAll(); };

  // ─── Projects ───
  const getProject = (id: number) => projects.find(p => p.id === id);

  const createProject = async (data: Partial<Project>): Promise<Project> => {
    const body = {
      name: data.name ?? 'Новый проект',
      description: data.description ?? '',
      technical_spec: data.technicalSpec ?? '',
      client: data.client ?? '',
      status: reverseStatus(data.status ?? 'planning'),
      planned_start: data.startDate,
      planned_end: data.endDate,
      budget: data.budget ?? 0,
    };
    const raw = await apiFetch('/projects/', { method: 'POST', body: JSON.stringify(body) });

    // Анализ сложности
    if (data.technicalSpec) {
      try {
        const r = await apiFetch('/projects/analyze/', { method: 'POST', body: JSON.stringify({ text: data.technicalSpec }) });
        await apiFetch(`/projects/${raw.id}/`, { method: 'PATCH', body: JSON.stringify({ complexity: Math.round(r.complexity) }) });
        raw.complexity = r.complexity;
      } catch {}
    }

    const proj = mapProject({ ...raw, team: [], roadmap: [] }, employees);
    setProjects(prev => [...prev, proj]);
    return proj;
  };

  const updateProject = async (id: number, data: Partial<Project>) => {
    const body: any = {};
    if (data.name) body.name = data.name;
    if (data.status) body.status = reverseStatus(data.status);
    if (data.endDate) body.planned_end = data.endDate;
    if (data.startDate) body.planned_start = data.startDate;
    await apiFetch(`/projects/${id}/`, { method: 'PATCH', body: JSON.stringify(body) });
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
  };

  const deleteProject = async (id: number) => {
    await apiFetch(`/projects/${id}/`, { method: 'DELETE' });
    setProjects(prev => prev.filter(p => p.id !== id));
    setTasks(prev => prev.filter(t => t.projectId !== id));
  };

  const generateRoadmap = async (projectId: number): Promise<RoadmapStage[]> => {
    setIsLoading(true);
    try {
      const res = await apiFetch(`/projects/${projectId}/generate_roadmap/`, { method: 'POST' });
      const stages: RoadmapStage[] = (res.stages ?? []).map((s: any) => ({
        id: s.id,
        name: s.name,
        description: '',
        order: s.order,
        plannedHours: Math.round((res.total_days ?? 30) * 8 / 6),
        actualHours: 0,
        startDate: s.planned_start ?? '',
        endDate: s.planned_end ?? '',
        status: 'pending' as const,
        projectId,
      }));
      setProjects(prev => prev.map(p => p.id === projectId ? { ...p, roadmap: stages } : p));
      return stages;
    } finally {
      setIsLoading(false);
    }
  };

  const getRecommendations = async (projectId: number): Promise<StaffRecommendation[]> => {
    const res = await apiFetch(`/projects/${projectId}/recommend_staff/`);
    return (res.recommendations ?? []).map((r: any) => {
      const emp = employees.find(e => e.id === r.user_id);
      const u: User = emp ?? {
        id: r.user_id, username: r.username, email: '',
        firstName: r.full_name?.split(' ')[0] ?? '', lastName: r.full_name?.split(' ').slice(1).join(' ') ?? '',
        role: 'developer', workStart: '09:00', workEnd: '18:00', lunchStart: '13:00', lunchEnd: '14:00',
        skills: (r.all_skills ?? []).map((s: any, i: number) => ({ id: i, skill: { id: 0, name: s.name, category: '' }, level: s.level })),
      };
      return {
        user: u,
        score: r.rating_pct ?? 0,
        matchingSkills: r.matched_skills ?? [],
        currentLoad: r.load_pct ?? 0,
        availability: (r.load_pct ?? 0) < 30 ? 'Доступен' : (r.load_pct ?? 0) < 70 ? 'Частично занят' : 'Загружен',
      };
    });
  };

  const assignEmployee = async (projectId: number, userId: number) => {
    await apiFetch('/project-assignments/', {
      method: 'POST',
      body: JSON.stringify({ project: projectId, user: userId, role_in_project: 'Участник', is_active: true }),
    });
    const emp = employees.find(e => e.id === userId);
    if (emp) {
      setProjects(prev => prev.map(p =>
        p.id === projectId && !p.team.some(t => t.id === userId)
          ? { ...p, team: [...p.team, emp] }
          : p
      ));
    }
  };

  // ─── Tasks ───
  const getTask = (id: number) => tasks.find(t => t.id === id);
  const getProjectTasks = (projectId: number) => tasks.filter(t => t.projectId === projectId);
  const getUserTasks = (userId: number, date?: string) =>
    tasks.filter(t => t.assigneeId === userId && (!date || t.scheduledDate === date));

  const createTask = async (data: Partial<Task>): Promise<Task> => {
    const body = {
      project: data.projectId,
      stage: data.stageId ?? null,
      assigned_to: data.assigneeId ?? user?.id ?? null,
      title: data.title ?? 'Новая задача',
      description: data.description ?? '',
      planned_duration: Math.round((data.plannedHours ?? 4) * 60),
      status: 'new',
      priority: data.priority ?? 'medium',
      scheduled_date: data.scheduledDate ?? new Date().toISOString().split('T')[0],
      deadline: data.dueDate ? `${data.dueDate}T18:00:00Z` : null,
    };
    const raw = await apiFetch('/tasks/', { method: 'POST', body: JSON.stringify(body) });
    const task = mapTask(raw, employees, projects);
    setTasks(prev => [...prev, task]);
    return task;
  };

  const updateTask = async (id: number, data: Partial<Task>) => {
    const body: any = {};
    if (data.status !== undefined) body.status = reverseTaskStatus(data.status);
    if (data.actualHours !== undefined) body.actual_duration = Math.round(data.actualHours * 60);
    if (data.scheduledDate !== undefined) body.scheduled_date = data.scheduledDate;
    if (data.title !== undefined) body.title = data.title;
    if (data.priority !== undefined) body.priority = data.priority;
    if (data.assigneeId !== undefined) body.assigned_to = data.assigneeId;
    await apiFetch(`/tasks/${id}/`, { method: 'PATCH', body: JSON.stringify(body) });
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...data } : t));
  };

  const startTask = (taskId: number) => {
    updateTask(taskId, { status: 'in_progress' });
  };

  const completeTask = (taskId: number) => {
    updateTask(taskId, { status: 'completed' });
  };

  const logTime = async (taskId: number, minutes: number) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || !user) return;

    // Создаём запись времени
    const now = new Date();
    const start = new Date(now.getTime() - minutes * 60000);
    try {
      await apiFetch('/time-entries/', {
        method: 'POST',
        body: JSON.stringify({
          task: taskId, user: user.id,
          start_time: start.toISOString(),
          end_time: now.toISOString(),
          duration: minutes * 60,
        }),
      });
    } catch {}

    const newActual = task.actualHours + minutes / 60;
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, actualHours: Math.round(newActual * 10) / 10 } : t));
    setProjects(prev => prev.map(p => p.id === task.projectId
      ? { ...p, actualHours: Math.round((p.actualHours + minutes / 60) * 10) / 10 }
      : p
    ));
  };

  // ─── Analytics ───
  const getDashboardStats = (): DashboardStats => {
    const active = projects.filter(p => p.status === 'in_progress').length;
    const completed = projects.filter(p => p.status === 'completed').length;
    const avgEff = projects.filter(p => p.status === 'completed' && p.actualHours > 0)
      .reduce((sum, p) => sum + (p.plannedHours / p.actualHours) * 100, 0) / (completed || 1);

    const recentActivity: ActivityLog[] = tasks
      .filter(t => t.status === 'completed')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
      .map(t => ({
        id: t.id,
        type: 'task_completed',
        message: `Задача «${t.title}» выполнена`,
        timestamp: t.createdAt,
        userId: t.assigneeId,
        userName: `${t.assignee.firstName} ${t.assignee.lastName}`.trim() || t.assignee.username,
      }));

    return {
      activeProjects: active,
      completedProjects: completed,
      totalEmployees: employees.length,
      avgEfficiency: Math.round(avgEff),
      projectsByStatus: [
        { status: 'Планирование', count: projects.filter(p => p.status === 'planning').length },
        { status: 'В работе', count: active },
        { status: 'Завершены', count: completed },
        { status: 'На паузе', count: projects.filter(p => p.status === 'on_hold').length },
      ],
      recentActivity,
      upcomingDeadlines: projects
        .filter(p => p.status !== 'completed' && p.endDate)
        .map(p => ({
          projectName: p.name,
          deadline: p.endDate,
          daysLeft: Math.ceil((new Date(p.endDate).getTime() - Date.now()) / 86400000),
        }))
        .sort((a, b) => a.daysLeft - b.daysLeft)
        .slice(0, 5),
    };
  };

  const getProjectAnalytics = (projectId: number): ProjectAnalytics => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return { projectId, projectName: '', plannedHours: 0, actualHours: 0, efficiency: 0, stageComparison: [], teamPerformance: [] };

    return {
      projectId,
      projectName: project.name,
      plannedHours: project.plannedHours,
      actualHours: project.actualHours,
      efficiency: project.actualHours > 0 ? Math.round((project.plannedHours / project.actualHours) * 100) : 0,
      stageComparison: project.roadmap.map(s => ({
        stageName: s.name, planned: s.plannedHours, actual: s.actualHours,
      })),
      teamPerformance: project.team.map(member => {
        const memberTasks = tasks.filter(t => t.projectId === projectId && t.assigneeId === member.id);
        const done = memberTasks.filter(t => t.status === 'completed').length;
        const hours = memberTasks.reduce((s, t) => s + t.actualHours, 0);
        const planned = memberTasks.reduce((s, t) => s + t.plannedHours, 0);
        return {
          userName: `${member.firstName} ${member.lastName}`.trim() || member.username,
          tasksCompleted: done,
          hoursWorked: Math.round(hours * 10) / 10,
          efficiency: planned > 0 ? Math.round((planned / (hours || 1)) * 100) : 0,
        };
      }),
    };
  };

  return (
    <DataContext.Provider value={{
      projects, tasks, employees, isLoading,
      getProject, createProject, updateProject, deleteProject,
      generateRoadmap, getRecommendations, assignEmployee,
      getTask, getProjectTasks, getUserTasks,
      createTask, updateTask, startTask, completeTask,
      getDashboardStats, getProjectAnalytics, logTime, refresh,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
