// =====================================================
//  Mock-API (замена backend в режиме прототипа)
//  Данные хранятся в localStorage, чтобы переживать
//  перезагрузку страницы (аналогично твоему backend)
// =====================================================

import type {
  User, Project, RoadmapStage, ProjectAssignment, Task, TimeEntry,
  ProjectHistory, Recommendation, AuthState,
} from '../types';
import {
  USERS, PROJECTS, STAGES, ASSIGNMENTS, TASKS, TIME_ENTRIES, PROJECT_HISTORY, SKILLS,
} from '../data/seed';
import { analyzeComplexity } from '../utils/complexity';
import { logger } from '../utils/logger';

const KEY = 'kit_pm_db_v1';

interface DB {
  users: User[];
  projects: Project[];
  stages: RoadmapStage[];
  assignments: ProjectAssignment[];
  tasks: Task[];
  time_entries: TimeEntry[];
  history: ProjectHistory[];
  current_user_id: number | null;
  counters: Record<string, number>;
}

function freshDB(): DB {
  return {
    users: JSON.parse(JSON.stringify(USERS)),
    projects: JSON.parse(JSON.stringify(PROJECTS)),
    stages: JSON.parse(JSON.stringify(STAGES)),
    assignments: JSON.parse(JSON.stringify(ASSIGNMENTS)),
    tasks: JSON.parse(JSON.stringify(TASKS)),
    time_entries: JSON.parse(JSON.stringify(TIME_ENTRIES)),
    history: JSON.parse(JSON.stringify(PROJECT_HISTORY)),
    current_user_id: null,
    counters: { task: 100, project: 100, stage: 100, assignment: 100, time: 100 },
  };
}

function load(): DB {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      const fresh = freshDB();
      localStorage.setItem(KEY, JSON.stringify(fresh));
      return fresh;
    }
    return JSON.parse(raw) as DB;
  } catch {
    const fresh = freshDB();
    localStorage.setItem(KEY, JSON.stringify(fresh));
    return fresh;
  }
}

function save(db: DB) {
  localStorage.setItem(KEY, JSON.stringify(db));
}

function nextId(db: DB, entity: string): number {
  db.counters[entity] = (db.counters[entity] || 100) + 1;
  return db.counters[entity];
}

function delay<T>(value: T, ms = 150): Promise<T> {
  return new Promise((r) => setTimeout(() => r(value), ms));
}

// ─────────────────────────────────────────────────
//  Публичный API
// ─────────────────────────────────────────────────
export const api = {
  // ─── Утилиты ───
  reset() {
    const fresh = freshDB();
    save(fresh);
    logger.warn('api', 'База данных сброшена к seed-данным');
  },

  // ─── Auth ───
  async login(username: string, password: string): Promise<AuthState> {
    logger.info('auth', `Попытка входа: ${username}`);
    const db = load();
    const user = db.users.find((u) => u.username === username);
    // Демо-режим: пароль = "demo"
    if (!user || password !== 'demo') {
      logger.err('auth', `Ошибка входа для ${username}`);
      throw new Error('Неверный логин или пароль (используйте "demo")');
    }
    db.current_user_id = user.id;
    save(db);
    logger.ok('auth', `Пользователь ${user.first_name} ${user.last_name} вошёл в систему`, { role: user.role });
    return { user, token: `mock-token-${user.id}-${Date.now()}` };
  },

  async register(data: { username: string; email: string; first_name: string; last_name: string; password: string }): Promise<AuthState> {
    logger.info('auth', `Регистрация: ${data.username}`);
    const db = load();
    if (db.users.some((u) => u.username === data.username)) {
      throw new Error('Пользователь с таким логином уже существует');
    }
    const { password: _pw, ...rest } = data;
    const newUser: User = {
      id: nextId(db, 'user'),
      ...rest,
      role: 'employee',
      position: 'Сотрудник',
      work_start: '09:00', work_end: '18:00', lunch_start: '13:00', lunch_duration_min: 60,
      avatar_color: '#4DB6AC',
      skills: [],
    };
    db.users.push(newUser);
    db.current_user_id = newUser.id;
    save(db);
    logger.ok('auth', `Создан пользователь ${data.username}`);
    return { user: newUser, token: `mock-token-${newUser.id}-${Date.now()}` };
  },

  async me(): Promise<User | null> {
    const db = load();
    const id = db.current_user_id;
    if (!id) return null;
    return db.users.find((u) => u.id === id) ?? null;
  },

  logout() {
    const db = load();
    const u = db.users.find((x) => x.id === db.current_user_id);
    db.current_user_id = null;
    save(db);
    logger.warn('auth', `Пользователь ${u?.username ?? '?'} вышел из системы`);
  },

  // ─── Users ───
  async listUsers(): Promise<User[]> {
    return delay(load().users);
  },

  async updateUser(id: number, patch: Partial<User>): Promise<User> {
    const db = load();
    const idx = db.users.findIndex((u) => u.id === id);
    if (idx < 0) throw new Error('User not found');
    db.users[idx] = { ...db.users[idx], ...patch };
    save(db);
    logger.ok('user', `Обновлён пользователь #${id}`, patch);
    return db.users[idx];
  },

  // ─── Skills ───
  async listSkills() {
    return delay(SKILLS);
  },

  // ─── Projects ───
  async listProjects(): Promise<Project[]> {
    return delay(load().projects);
  },

  async getProject(id: number): Promise<Project | null> {
    return delay(load().projects.find((p) => p.id === id) ?? null);
  },

  async createProject(p: Omit<Project, 'id' | 'created_at' | 'complexity_score' | 'complexity_level'>): Promise<Project> {
    const db = load();
    const r = analyzeComplexity(p.technical_spec, SKILLS);
    const proj: Project = {
      ...p,
      id: nextId(db, 'project'),
      created_at: new Date().toISOString(),
      complexity_score: r.score,
      complexity_level: r.level,
    };
    db.projects.push(proj);
    save(db);
    logger.ok('project', `Создан проект «${proj.name}» (сложность ${r.score})`, proj);
    return proj;
  },

  async updateProject(id: number, patch: Partial<Project>): Promise<Project> {
    const db = load();
    const idx = db.projects.findIndex((p) => p.id === id);
    if (idx < 0) throw new Error('Project not found');
    const updated = { ...db.projects[idx], ...patch };
    if (patch.technical_spec !== undefined) {
      const r = analyzeComplexity(patch.technical_spec, SKILLS);
      updated.complexity_score = r.score;
      updated.complexity_level = r.level;
    }
    db.projects[idx] = updated;
    save(db);
    logger.ok('project', `Обновлён проект #${id}`, patch);
    return updated;
  },

  async deleteProject(id: number): Promise<void> {
    const db = load();
    db.projects = db.projects.filter((p) => p.id !== id);
    db.stages = db.stages.filter((s) => s.project_id !== id);
    db.tasks = db.tasks.filter((t) => t.project_id !== id);
    save(db);
    logger.warn('project', `Удалён проект #${id}`);
  },

  // ─── Stages / Roadmap ───
  async listStages(projectId: number): Promise<RoadmapStage[]> {
    return delay(load().stages.filter((s) => s.project_id === projectId).sort((a, b) => a.order - b.order));
  },

  async generateRoadmap(projectId: number): Promise<RoadmapStage[]> {
    logger.info('roadmap', `Генерация дорожной карты для проекта #${projectId}`);
    const db = load();
    const proj = db.projects.find((p) => p.id === projectId);
    if (!proj) throw new Error('Project not found');

    // Удаляем старые этапы
    db.stages = db.stages.filter((s) => s.project_id !== projectId);

    const startDate = new Date(proj.start_date);
    const totalDays = Math.max(7, Math.round(
      (new Date(proj.deadline).getTime() - startDate.getTime()) / 86_400_000
    ));

    const templates: { name: string; weight: number; skills: number[] }[] = [
      { name: 'Аналитика и проектирование', weight: 0.12, skills: [10] },
      { name: 'Дизайн интерфейсов',        weight: 0.13, skills: [10, 19] },
      { name: 'Бэкенд-разработка',         weight: 0.25, skills: [4, 6] },
      { name: 'Фронтенд-разработка',       weight: 0.25, skills: [1, 11] },
      { name: 'Интеграции и тестирование', weight: 0.15, skills: [4, 14] },
      { name: 'Деплой и запуск',           weight: 0.10, skills: [8, 18] },
    ];

    const totalHours = Math.round(40 + proj.complexity_score * 1.5);
    let cursor = 0;
    const created: RoadmapStage[] = templates.map((t, i) => {
      const dur = Math.max(2, Math.round(totalDays * t.weight));
      const start = new Date(startDate.getTime() + cursor * 86_400_000);
      const end = new Date(start.getTime() + (dur - 1) * 86_400_000);
      cursor += dur;
      const stage: RoadmapStage = {
        id: nextId(db, 'stage'),
        project_id: projectId,
        name: t.name,
        description: `Этап ${i + 1}: ${t.name.toLowerCase()}`,
        order: i + 1,
        planned_start: start.toISOString().split('T')[0],
        planned_end: end.toISOString().split('T')[0],
        estimated_hours: Math.round(totalHours * t.weight),
        status: 'pending',
        required_skills: t.skills,
      };
      db.stages.push(stage);
      return stage;
    });

    save(db);
    logger.ok('roadmap', `Создано ${created.length} этапов для проекта #${projectId}`);
    return created;
  },

  // ─── Assignments ───
  async listAssignments(projectId: number): Promise<ProjectAssignment[]> {
    return delay(load().assignments.filter((a) => a.project_id === projectId));
  },

  async assignUser(projectId: number, userId: number, role = 'Участник'): Promise<ProjectAssignment> {
    const db = load();
    const exists = db.assignments.find((a) => a.project_id === projectId && a.user_id === userId);
    if (exists) {
      logger.warn('assign', `Пользователь #${userId} уже назначен на проект #${projectId}`);
      return exists;
    }
    const a: ProjectAssignment = {
      id: nextId(db, 'assignment'),
      project_id: projectId,
      user_id: userId,
      role_in_project: role,
      assigned_at: new Date().toISOString(),
    };
    db.assignments.push(a);
    save(db);
    logger.ok('assign', `Назначен #${userId} на проект #${projectId} как «${role}»`);
    return a;
  },

  async unassignUser(projectId: number, userId: number): Promise<void> {
    const db = load();
    db.assignments = db.assignments.filter((a) => !(a.project_id === projectId && a.user_id === userId));
    save(db);
    logger.warn('assign', `Снят #${userId} с проекта #${projectId}`);
  },

  // ─── Recommendations ───
  async recommendStaff(projectId: number): Promise<Recommendation[]> {
    logger.info('rec', `Подбор сотрудников для проекта #${projectId}`);
    const db = load();
    const project = db.projects.find((p) => p.id === projectId);
    if (!project) throw new Error('Project not found');
    const required = new Set(project.required_skills);

    // Текущая загрузка сотрудника (часы задач на сегодня)
    const today = new Date().toISOString().split('T')[0];
    const recommendations: Recommendation[] = db.users
      .filter((u) => u.role === 'employee')
      .map((u) => {
        const userSkills = u.skills.map((s) => s.skill.id);
        const matched = userSkills.filter((s) => required.has(s));
        const matchRatio = required.size > 0 ? matched.length / required.size : 0;

        // Уровень навыка (средний)
        const relevantLevels = u.skills
          .filter((s) => required.has(s.skill.id))
          .map((s) => s.level);
        const avgLevel = relevantLevels.length
          ? relevantLevels.reduce((a, b) => a + b, 0) / relevantLevels.length
          : 0;

        // Загрузка
        const loadHours = db.tasks
          .filter((t) => t.assignee_id === u.id && t.scheduled_date === today && t.status !== 'done')
          .reduce((s, t) => s + t.estimated_hours, 0);
        const maxHours = 8;
        const loadPercent = Math.min(100, (loadHours / maxHours) * 100);

        // Итоговый score
        const skillScore = matchRatio * 60;
        const levelScore = (avgLevel / 5) * 25;
        const loadScore = (1 - loadPercent / 100) * 15;
        const match_score = Math.round(skillScore + levelScore + loadScore);

        const reasons: string[] = [];
        if (matched.length > 0) reasons.push(`Совпадение по ${matched.length} из ${required.size} навыков`);
        if (avgLevel >= 4) reasons.push('Высокий уровень экспертизы');
        if (loadPercent < 30) reasons.push('Низкая текущая загрузка');
        else if (loadPercent > 70) reasons.push('Высокая загрузка — учитывайте при планировании');

        return {
          user: { ...u, current_load_hours: loadHours, max_load_hours: maxHours },
          match_score,
          matched_skills: matched.length,
          total_required: required.size,
          load_percent: Math.round(loadPercent),
          reasons,
        };
      })
      .sort((a, b) => b.match_score - a.match_score);

    logger.ok('rec', `Подобрано ${recommendations.length} кандидатов`);
    return recommendations;
  },

  // ─── Tasks ───
  async listTasks(filter?: { projectId?: number; assigneeId?: number; date?: string; status?: string }): Promise<Task[]> {
    const db = load();
    let tasks = db.tasks;
    if (filter?.projectId)   tasks = tasks.filter((t) => t.project_id === filter.projectId);
    if (filter?.assigneeId) tasks = tasks.filter((t) => t.assignee_id === filter.assigneeId);
    if (filter?.date)       tasks = tasks.filter((t) => t.scheduled_date === filter.date);
    if (filter?.status)     tasks = tasks.filter((t) => t.status === filter.status);
    return delay(tasks);
  },

  async createTask(t: Omit<Task, 'id' | 'created_at' | 'actual_hours'>): Promise<Task> {
    const db = load();
    const task: Task = {
      ...t,
      id: nextId(db, 'task'),
      created_at: new Date().toISOString(),
      actual_hours: 0,
    };
    db.tasks.push(task);
    save(db);
    logger.ok('task', `Создана задача «${task.title}» (проект #${task.project_id})`, task);
    return task;
  },

  async updateTask(id: number, patch: Partial<Task>): Promise<Task> {
    const db = load();
    const idx = db.tasks.findIndex((t) => t.id === id);
    if (idx < 0) throw new Error('Task not found');
    const updated = { ...db.tasks[idx], ...patch };
    if (patch.status === 'done' && !updated.completed_at) {
      updated.completed_at = new Date().toISOString();
    }
    db.tasks[idx] = updated;
    save(db);
    logger.ok('task', `Обновлена задача #${id}`, patch);
    return updated;
  },

  async deleteTask(id: number): Promise<void> {
    const db = load();
    db.tasks = db.tasks.filter((t) => t.id !== id);
    save(db);
    logger.warn('task', `Удалена задача #${id}`);
  },

  // ─── Time entries / Timer ───
  async startTimer(taskId: number, userId: number): Promise<TimeEntry> {
    const db = load();
    // Закрыть прошлую активную сессию
    db.time_entries.forEach((te) => {
      if (te.user_id === userId && !te.ended_at) te.ended_at = new Date().toISOString();
    });
    const te: TimeEntry = {
      id: nextId(db, 'time'),
      task_id: taskId,
      user_id: userId,
      started_at: new Date().toISOString(),
      duration_minutes: 0,
      type: 'work',
    };
    db.time_entries.push(te);
    save(db);
    logger.info('timer', `Запущен таймер по задаче #${taskId}`);
    return te;
  },

  async stopTimer(userId: number): Promise<TimeEntry | null> {
    const db = load();
    const active = db.time_entries.find((te) => te.user_id === userId && !te.ended_at);
    if (!active) return null;
    const now = new Date();
    active.ended_at = now.toISOString();
    active.duration_minutes = Math.round((now.getTime() - new Date(active.started_at).getTime()) / 60_000);

    // Обновляем actual_hours задачи
    const task = db.tasks.find((t) => t.id === active.task_id);
    if (task) {
      task.actual_hours = Math.round((task.actual_hours * 60 + active.duration_minutes) / 60 * 10) / 10;
    }
    save(db);
    logger.ok('timer', `Остановлен таймер (${active.duration_minutes} мин) по задаче #${active.task_id}`);
    return active;
  },

  // ─── History ───
  async listHistory(): Promise<ProjectHistory[]> {
    return delay(load().history);
  },

  // ─── DB access (для отладки) ───
  dump() {
    return load();
  },
};
