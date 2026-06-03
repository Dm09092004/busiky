// =====================================================
//  Seed-данные: пользователи, навыки, проекты, задачи
//  Заменяют backend в режиме прототипа (localStorage)
// =====================================================

import type {
  User, Skill, Project, RoadmapStage, ProjectAssignment,
  Task, TimeEntry, ProjectHistory,
} from '../types';
import { analyzeComplexity } from '../utils/complexity';

export const SKILLS: Skill[] = [
  { id: 1,  name: 'React' },
  { id: 2,  name: 'Vue.js' },
  { id: 3,  name: 'Angular' },
  { id: 4,  name: 'Django / Python' },
  { id: 5,  name: 'Node.js' },
  { id: 6,  name: 'PostgreSQL' },
  { id: 7,  name: 'MongoDB' },
  { id: 8,  name: 'Docker' },
  { id: 9,  name: 'AWS' },
  { id: 10, name: 'Figma / UI' },
  { id: 11, name: 'TypeScript' },
  { id: 12, name: 'GraphQL' },
  { id: 13, name: 'Redis' },
  { id: 14, name: 'Vite / Webpack' },
  { id: 15, name: 'Тестирование' },
  { id: 16, name: 'SEO' },
  { id: 17, name: 'Machine Learning' },
  { id: 18, name: 'Mobile' },
  { id: 19, name: 'DevOps' },
  { id: 20, name: 'Анимация' },
];

export const USERS: User[] = [
  {
    id: 1, username: 'manager', email: 'manager@kit.ru', role: 'manager',
    first_name: 'Анна', last_name: 'Соколова', position: 'Руководитель проектов',
    work_start: '09:00', work_end: '18:00', lunch_start: '13:00', lunch_duration_min: 60,
    avatar_color: '#4DB6AC',
    skills: [
      { skill: SKILLS[9],  level: 5 },
      { skill: SKILLS[0],  level: 4 },
      { skill: SKILLS[3],  level: 3 },
    ],
  },
  {
    id: 2, username: 'dmitry', email: 'dmitry@kit.ru', role: 'employee',
    first_name: 'Дмитрий', last_name: 'Иванов', position: 'Frontend-разработчик',
    work_start: '10:00', work_end: '19:00', lunch_start: '14:00', lunch_duration_min: 60,
    avatar_color: '#5C6BC0',
    skills: [
      { skill: SKILLS[0],  level: 5 },
      { skill: SKILLS[10], level: 5 },
      { skill: SKILLS[13], level: 4 },
      { skill: SKILLS[19], level: 3 },
    ],
  },
  {
    id: 3, username: 'elena', email: 'elena@kit.ru', role: 'employee',
    first_name: 'Елена', last_name: 'Петрова', position: 'Backend-разработчик',
    work_start: '09:00', work_end: '18:00', lunch_start: '13:00', lunch_duration_min: 60,
    avatar_color: '#EC407A',
    skills: [
      { skill: SKILLS[3],  level: 5 },
      { skill: SKILLS[5],  level: 4 },
      { skill: SKILLS[7],  level: 4 },
      { skill: SKILLS[12], level: 4 },
    ],
  },
  {
    id: 4, username: 'artem', email: 'artem@kit.ru', role: 'employee',
    first_name: 'Артём', last_name: 'Кузнецов', position: 'UI/UX дизайнер',
    work_start: '10:00', work_end: '19:00', lunch_start: '14:00', lunch_duration_min: 60,
    avatar_color: '#FFA726',
    skills: [
      { skill: SKILLS[9],  level: 5 },
      { skill: SKILLS[19], level: 4 },
      { skill: SKILLS[15], level: 3 },
    ],
  },
  {
    id: 5, username: 'olga', email: 'olga@kit.ru', role: 'employee',
    first_name: 'Ольга', last_name: 'Морозова', position: 'QA-инженер',
    work_start: '09:00', work_end: '18:00', lunch_start: '13:00', lunch_duration_min: 60,
    avatar_color: '#26A69A',
    skills: [
      { skill: SKILLS[14], level: 5 },
      { skill: SKILLS[3],  level: 3 },
      { skill: SKILLS[0],  level: 3 },
    ],
  },
  {
    id: 6, username: 'pavel', email: 'pavel@kit.ru', role: 'employee',
    first_name: 'Павел', last_name: 'Сидоров', position: 'DevOps',
    work_start: '09:00', work_end: '18:00', lunch_start: '13:00', lunch_duration_min: 60,
    avatar_color: '#7E57C2',
    skills: [
      { skill: SKILLS[7],  level: 5 },
      { skill: SKILLS[8],  level: 4 },
      { skill: SKILLS[18], level: 5 },
    ],
  },
];

const todayISO = () => new Date().toISOString().split('T')[0];
const addDays = (d: number) => {
  const dt = new Date();
  dt.setDate(dt.getDate() + d);
  return dt.toISOString().split('T')[0];
};
const fullISO = (d: number) => {
  const dt = new Date();
  dt.setDate(dt.getDate() + d);
  return dt.toISOString();
};

// ────────── Проекты ──────────
const project1Spec = `Разработка корпоративного портала для логистической компании. Требуется React + TypeScript, бэкенд Django REST Framework, PostgreSQL. Аутентификация по JWT, ролевая модель, личный кабинет, дашборд с графиками. Интеграция с 1С, оптимизация под SEO, поддержка i18n. Адаптивная вёрстка, webpack-сборка, Docker.`;

const project2Spec = `Лендинг для кофейни. Простой одностраничный сайт с анимациями GSAP, адаптивный дизайн, форма обратной связи. Figma-макет предоставлен.`;

const project3Spec = `ML-сервис рекомендаций товаров. Python/Django, PostgreSQL, Redis, нейросеть на PyTorch. Высокая нагрузка, real-time обновления, CI/CD через GitLab.`;

const mkProject = (p: Omit<Project, 'complexity_score' | 'complexity_level'>): Project => {
  const r = analyzeComplexity(p.technical_spec, SKILLS);
  return { ...p, complexity_score: r.score, complexity_level: r.level };
};

export const PROJECTS: Project[] = [
  mkProject({
    id: 1, name: 'Портал логистики "Вектор"', client: 'ООО "Вектор-Логистик"',
    description: 'Корпоративный портал с личным кабинетом и интеграцией с 1С',
    technical_spec: project1Spec, status: 'active', priority: 'high',
    start_date: addDays(-10), deadline: addDays(40),
    required_skills: [1, 4, 6, 8, 11, 16, 19],
    manager_id: 1, created_at: fullISO(-15),
  }),
  mkProject({
    id: 2, name: 'Сайт кофейни "BrewBar"', client: 'ИП Сергеев',
    description: 'Лендинг с анимациями и адаптивным дизайном',
    technical_spec: project2Spec, status: 'planning', priority: 'medium',
    start_date: addDays(3), deadline: addDays(20),
    required_skills: [1, 10, 20, 14],
    manager_id: 1, created_at: fullISO(-2),
  }),
  mkProject({
    id: 3, name: 'ML-рекомендации для "АлиЭкспресс-Локал"', client: 'ООО "Розница+"',
    description: 'Сервис персонализированных рекомендаций',
    technical_spec: project3Spec, status: 'planning', priority: 'critical',
    start_date: addDays(7), deadline: addDays(60),
    required_skills: [4, 6, 13, 17, 19, 8],
    manager_id: 1, created_at: fullISO(-1),
  }),
  mkProject({
    id: 4, name: 'Интернет-магазин "Фермерские продукты"', client: 'ООО "ЭкоФерма"',
    description: 'Магазин с онлайн-оплатой и личным кабинетом',
    technical_spec: 'E-commerce платформа. React, TypeScript, Django, PostgreSQL. Платежи через ЮKassa, личный кабинет, корзина, история заказов. Оптимизация SEO, Docker, CI/CD.',
    status: 'active', priority: 'high',
    start_date: addDays(-25), deadline: addDays(15),
    required_skills: [1, 3, 4, 6, 8, 11, 15, 16],
    manager_id: 1, created_at: fullISO(-30),
  }),
];

// ────────── Этапы дорожных карт ──────────
export const STAGES: RoadmapStage[] = [
  // Проект 1
  { id: 1, project_id: 1, name: 'Аналитика и проектирование', description: 'Сбор требований, проектирование архитектуры', order: 1, planned_start: addDays(-10), planned_end: addDays(-3), actual_start: addDays(-10), actual_end: addDays(-4), estimated_hours: 32, status: 'done', required_skills: [1, 4, 10] },
  { id: 2, project_id: 1, name: 'Бэкенд: API и модели',     description: 'Django REST Framework, JWT, PostgreSQL',  order: 2, planned_start: addDays(-3), planned_end: addDays(10),  actual_start: addDays(-4),  estimated_hours: 80, status: 'in_progress', required_skills: [4, 6, 8] },
  { id: 3, project_id: 1, name: 'Фронтенд: дашборд',        description: 'React + TypeScript + MUI',                order: 3, planned_start: addDays(7),  planned_end: addDays(25),  estimated_hours: 64, status: 'pending', required_skills: [1, 11, 19] },
  { id: 4, project_id: 1, name: 'Интеграция с 1С',          description: 'Обмен данными',                           order: 4, planned_start: addDays(20), planned_end: addDays(32),  estimated_hours: 40, status: 'pending', required_skills: [4, 5] },
  { id: 5, project_id: 1, name: 'Тестирование и запуск',    description: 'QA, деплой',                              order: 5, planned_start: addDays(30), planned_end: addDays(40),  estimated_hours: 32, status: 'pending', required_skills: [14, 19] },
  // Проект 4
  { id: 6, project_id: 4, name: 'Дизайн и прототип',        description: 'Figma-макеты всех страниц',               order: 1, planned_start: addDays(-25), planned_end: addDays(-15), actual_start: addDays(-25), actual_end: addDays(-16), estimated_hours: 24, status: 'done', required_skills: [10] },
  { id: 7, project_id: 4, name: 'Каталог и корзина',         description: 'Карточки товаров, фильтры, корзина',      order: 2, planned_start: addDays(-15), planned_end: addDays(-3),  actual_start: addDays(-16), estimated_hours: 56, status: 'in_progress', required_skills: [1, 11] },
  { id: 8, project_id: 4, name: 'Оплата и заказы',          description: 'ЮKassa, личный кабинет',                  order: 3, planned_start: addDays(-2),  planned_end: addDays(8),   estimated_hours: 40, status: 'pending', required_skills: [1, 4] },
  { id: 9, project_id: 4, name: 'SEO и запуск',             description: 'Оптимизация, деплой',                     order: 4, planned_start: addDays(8),   planned_end: addDays(15),  estimated_hours: 20, status: 'pending', required_skills: [16, 19] },
];

// ────────── Назначения ──────────
export const ASSIGNMENTS: ProjectAssignment[] = [
  { id: 1, project_id: 1, user_id: 2, role_in_project: 'Frontend Lead',  assigned_at: fullISO(-10) },
  { id: 2, project_id: 1, user_id: 3, role_in_project: 'Backend Lead',   assigned_at: fullISO(-10) },
  { id: 3, project_id: 1, user_id: 4, role_in_project: 'UI/UX',          assigned_at: fullISO(-10) },
  { id: 4, project_id: 1, user_id: 5, role_in_project: 'QA',             assigned_at: fullISO(-5)  },
  { id: 5, project_id: 4, user_id: 2, role_in_project: 'Frontend',       assigned_at: fullISO(-25) },
  { id: 6, project_id: 4, user_id: 3, role_in_project: 'Backend',        assigned_at: fullISO(-25) },
  { id: 7, project_id: 4, user_id: 4, role_in_project: 'Design Lead',    assigned_at: fullISO(-25) },
];

// ────────── Задачи ──────────
export const TASKS: Task[] = [
  { id: 1,  project_id: 1, stage_id: 2, assignee_id: 3, title: 'Спроектировать модели User, Project, Task', description: 'ER-диаграмма, миграции, индексы', estimated_hours: 4, actual_hours: 4.5, status: 'done',        priority: 'high',   scheduled_date: addDays(-3), created_at: fullISO(-4), completed_at: fullISO(-2) },
  { id: 2,  project_id: 1, stage_id: 2, assignee_id: 3, title: 'Эндпоинты авторизации JWT',                 description: 'login, refresh, register, me',    estimated_hours: 6, actual_hours: 7,   status: 'done',        priority: 'high',   scheduled_date: addDays(-2), created_at: fullISO(-3), completed_at: fullISO(-1) },
  { id: 3,  project_id: 1, stage_id: 2, assignee_id: 3, title: 'CRUD для проектов и roadmap',               description: 'viewsets, фильтры, permissions', estimated_hours: 8, actual_hours: 5,   status: 'in_progress', priority: 'high',   scheduled_date: todayISO(), created_at: fullISO(-1) },
  { id: 4,  project_id: 1, stage_id: 2, assignee_id: 3, title: 'Анализ сложности по ТЗ',                    description: 'Эндпоинт + тесты',              estimated_hours: 5, actual_hours: 0,   status: 'in_progress', priority: 'medium', scheduled_date: todayISO(), created_at: fullISO(0)  },
  { id: 5,  project_id: 1, stage_id: 3, assignee_id: 2, title: 'Каркас React-приложения',                   description: 'Vite, роутинг, MUI-тема',       estimated_hours: 4, actual_hours: 4,   status: 'done',        priority: 'high',   scheduled_date: addDays(-1), created_at: fullISO(-3), completed_at: fullISO(0) },
  { id: 6,  project_id: 1, stage_id: 3, assignee_id: 2, title: 'Страница Dashboard менеджера',              description: 'StatCard, список проектов',     estimated_hours: 6, actual_hours: 2,   status: 'in_progress', priority: 'medium', scheduled_date: todayISO(), created_at: fullISO(0)  },
  { id: 7,  project_id: 1, stage_id: 3, assignee_id: 2, title: 'MyDay с Pomodoro-таймером',                 description: '45/5/15, интеграция с API',     estimated_hours: 8, actual_hours: 0,   status: 'new',          priority: 'high',   scheduled_date: addDays(1), created_at: fullISO(0)  },
  { id: 8,  project_id: 1, stage_id: 2, assignee_id: 5, title: 'Тест-кейсы для аутентификации',             description: 'pytest + Postman',               estimated_hours: 4, actual_hours: 1,   status: 'in_progress', priority: 'medium', scheduled_date: todayISO(), created_at: fullISO(0)  },
  { id: 9,  project_id: 1, stage_id: 3, assignee_id: 4, title: 'Макет дашборда в Figma',                    description: '4 графика, таблица',             estimated_hours: 5, actual_hours: 5,   status: 'done',        priority: 'medium', scheduled_date: addDays(-2), created_at: fullISO(-3), completed_at: fullISO(-1) },
  { id: 10, project_id: 1, stage_id: 2, assignee_id: 3, title: 'Логирование действий (audit log)',          description: 'middleware + signals',           estimated_hours: 3, actual_hours: 0,   status: 'new',          priority: 'low',    scheduled_date: addDays(1), created_at: fullISO(0)  },

  { id: 11, project_id: 4, stage_id: 7, assignee_id: 2, title: 'Каталог с фильтрами',                       description: 'категории, поиск, пагинация',    estimated_hours: 12, actual_hours: 9, status: 'in_progress', priority: 'high',   scheduled_date: todayISO(), created_at: fullISO(-5) },
  { id: 12, project_id: 4, stage_id: 7, assignee_id: 2, title: 'Корзина и оформление',                      description: 'стейт, валидация',               estimated_hours: 8,  actual_hours: 0, status: 'new',          priority: 'medium', scheduled_date: addDays(1), created_at: fullISO(0)  },
  { id: 13, project_id: 4, stage_id: 8, assignee_id: 3, title: 'Интеграция ЮKassa',                         description: 'веб-хуки, возврат',              estimated_hours: 10, actual_hours: 0, status: 'new',          priority: 'high',   scheduled_date: addDays(2), created_at: fullISO(0)  },
];

// ────────── TimeEntries (для истории) ──────────
export const TIME_ENTRIES: TimeEntry[] = [];

// ────────── История завершённых проектов (для аналитики) ──────────
export const PROJECT_HISTORY: ProjectHistory[] = [
  { id: 1, project_id: 1001, project_name: 'CRM "АвтоМир"',     complexity_score: 68, duration_days: 45, planned_hours: 320, actual_hours: 380, efficiency: 0.84, completed_at: fullISO(-90) },
  { id: 2, project_id: 1002, project_name: 'Лендинг "Клиника+"', complexity_score: 18, duration_days: 10, planned_hours: 40,  actual_hours: 38,  efficiency: 1.05, completed_at: fullISO(-70) },
  { id: 3, project_id: 1003, project_name: 'ERP для кафе',      complexity_score: 55, duration_days: 30, planned_hours: 180, actual_hours: 210, efficiency: 0.86, completed_at: fullISO(-50) },
  { id: 4, project_id: 1004, project_name: 'Приложение доставки', complexity_score: 82, duration_days: 75, planned_hours: 540, actual_hours: 690, efficiency: 0.78, completed_at: fullISO(-30) },
  { id: 5, project_id: 1005, project_name: 'Сайт-портфолио',   complexity_score: 12, duration_days: 7,  planned_hours: 24,  actual_hours: 22,  efficiency: 1.09, completed_at: fullISO(-20) },
];
