import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Project, Task, User, RoadmapStage, StaffRecommendation, DashboardStats, ProjectAnalytics } from '../types';
import { useAuth } from './AuthContext';

interface DataContextType {
  projects: Project[];
  tasks: Task[];
  employees: User[];
  isLoading: boolean;
  
  // Projects
  getProject: (id: number) => Project | undefined;
  createProject: (project: Partial<Project>) => Promise<Project>;
  updateProject: (id: number, data: Partial<Project>) => Promise<void>;
  deleteProject: (id: number) => Promise<void>;
  generateRoadmap: (projectId: number) => Promise<RoadmapStage[]>;
  getRecommendations: (projectId: number) => Promise<StaffRecommendation[]>;
  assignEmployee: (projectId: number, userId: number) => Promise<void>;
  
  // Tasks
  getTask: (id: number) => Task | undefined;
  getProjectTasks: (projectId: number) => Task[];
  getUserTasks: (userId: number, date?: string) => Task[];
  createTask: (task: Partial<Task>) => Promise<Task>;
  updateTask: (id: number, data: Partial<Task>) => Promise<void>;
  startTask: (taskId: number) => void;
  completeTask: (taskId: number) => void;
  
  // Analytics
  getDashboardStats: () => DashboardStats;
  getProjectAnalytics: (projectId: number) => ProjectAnalytics;
  
  // Time tracking
  logTime: (taskId: number, minutes: number) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Демо-данные сотрудников
const demoEmployees: User[] = [
  {
    id: 2,
    username: 'developer',
    email: 'dev@studiokit.ru',
    firstName: 'Алексей',
    lastName: 'Сидоров',
    role: 'developer',
    workStart: '10:00',
    workEnd: '19:00',
    lunchStart: '13:00',
    lunchEnd: '14:00',
    skills: [
      { id: 1, skill: { id: 1, name: 'React', category: 'Frontend' }, level: 5 },
      { id: 2, skill: { id: 2, name: 'TypeScript', category: 'Frontend' }, level: 4 },
      { id: 3, skill: { id: 3, name: 'Django', category: 'Backend' }, level: 4 },
    ],
  },
  {
    id: 3,
    username: 'designer',
    email: 'designer@studiokit.ru',
    firstName: 'Мария',
    lastName: 'Козлова',
    role: 'designer',
    workStart: '09:00',
    workEnd: '18:00',
    lunchStart: '12:00',
    lunchEnd: '13:00',
    skills: [
      { id: 4, skill: { id: 4, name: 'Figma', category: 'Design' }, level: 5 },
      { id: 5, skill: { id: 5, name: 'UI/UX', category: 'Design' }, level: 5 },
      { id: 6, skill: { id: 6, name: 'Photoshop', category: 'Design' }, level: 4 },
    ],
  },
  {
    id: 4,
    username: 'backend_dev',
    email: 'backend@studiokit.ru',
    firstName: 'Дмитрий',
    lastName: 'Волков',
    role: 'developer',
    workStart: '09:00',
    workEnd: '18:00',
    lunchStart: '13:00',
    lunchEnd: '14:00',
    skills: [
      { id: 7, skill: { id: 7, name: 'Python', category: 'Backend' }, level: 5 },
      { id: 8, skill: { id: 8, name: 'Django', category: 'Backend' }, level: 5 },
      { id: 9, skill: { id: 9, name: 'PostgreSQL', category: 'Database' }, level: 4 },
    ],
  },
  {
    id: 5,
    username: 'tester',
    email: 'qa@studiokit.ru',
    firstName: 'Елена',
    lastName: 'Новикова',
    role: 'tester',
    workStart: '10:00',
    workEnd: '19:00',
    lunchStart: '14:00',
    lunchEnd: '15:00',
    skills: [
      { id: 10, skill: { id: 10, name: 'Manual Testing', category: 'QA' }, level: 5 },
      { id: 11, skill: { id: 11, name: 'Selenium', category: 'QA' }, level: 3 },
    ],
  },
  {
    id: 6,
    username: 'frontend_dev',
    email: 'frontend@studiokit.ru',
    firstName: 'Анна',
    lastName: 'Морозова',
    role: 'developer',
    workStart: '09:00',
    workEnd: '18:00',
    lunchStart: '12:30',
    lunchEnd: '13:30',
    skills: [
      { id: 12, skill: { id: 12, name: 'Vue.js', category: 'Frontend' }, level: 5 },
      { id: 13, skill: { id: 13, name: 'React', category: 'Frontend' }, level: 4 },
      { id: 14, skill: { id: 14, name: 'CSS/SCSS', category: 'Frontend' }, level: 5 },
    ],
  },
];

// Демо-проекты
const initialProjects: Project[] = [
  {
    id: 1,
    name: 'Интернет-магазин "ТехноМир"',
    description: 'Разработка e-commerce платформы для продажи электроники',
    client: 'ООО "ТехноМир"',
    status: 'in_progress',
    complexity: 'high',
    startDate: '2024-01-15',
    endDate: '2024-04-15',
    plannedHours: 480,
    actualHours: 320,
    budget: 1500000,
    technicalSpec: 'Требуется разработка интернет-магазина с каталогом товаров, корзиной, личным кабинетом, интеграцией с 1С и платежными системами. Технологии: React, Django, PostgreSQL.',
    manager: demoEmployees[0],
    team: [demoEmployees[0], demoEmployees[1], demoEmployees[2]],
    roadmap: [
      { id: 1, name: 'Проектирование', description: 'Анализ требований и проектирование архитектуры', order: 1, plannedHours: 40, actualHours: 45, startDate: '2024-01-15', endDate: '2024-01-25', status: 'completed', projectId: 1 },
      { id: 2, name: 'Дизайн', description: 'Создание макетов интерфейса', order: 2, plannedHours: 60, actualHours: 55, startDate: '2024-01-26', endDate: '2024-02-10', status: 'completed', projectId: 1 },
      { id: 3, name: 'Разработка Backend', description: 'API, база данных, бизнес-логика', order: 3, plannedHours: 160, actualHours: 120, startDate: '2024-02-11', endDate: '2024-03-15', status: 'in_progress', projectId: 1 },
      { id: 4, name: 'Разработка Frontend', description: 'Реализация интерфейса', order: 4, plannedHours: 140, actualHours: 80, startDate: '2024-02-20', endDate: '2024-03-25', status: 'in_progress', projectId: 1 },
      { id: 5, name: 'Тестирование', description: 'QA и исправление багов', order: 5, plannedHours: 60, actualHours: 20, startDate: '2024-03-20', endDate: '2024-04-05', status: 'pending', projectId: 1 },
      { id: 6, name: 'Запуск', description: 'Деплой и запуск в продакшен', order: 6, plannedHours: 20, actualHours: 0, startDate: '2024-04-06', endDate: '2024-04-15', status: 'pending', projectId: 1 },
    ],
    createdAt: '2024-01-10',
  },
  {
    id: 2,
    name: 'CRM для автосалона',
    description: 'Система управления взаимоотношениями с клиентами',
    client: 'АвтоПлюс',
    status: 'planning',
    complexity: 'medium',
    startDate: '2024-03-01',
    endDate: '2024-05-30',
    plannedHours: 320,
    actualHours: 24,
    budget: 800000,
    technicalSpec: 'CRM система для автосалона: учет клиентов, история взаимодействий, воронка продаж, аналитика, интеграция с телефонией.',
    manager: demoEmployees[0],
    team: [demoEmployees[2]],
    roadmap: [],
    createdAt: '2024-02-20',
  },
  {
    id: 3,
    name: 'Мобильное приложение "Фитнес+"',
    description: 'Приложение для фитнес-клуба с бронированием и трекингом тренировок',
    client: 'Фитнес Клуб "Олимп"',
    status: 'completed',
    complexity: 'high',
    startDate: '2023-09-01',
    endDate: '2023-12-20',
    plannedHours: 400,
    actualHours: 420,
    budget: 1200000,
    manager: demoEmployees[0],
    team: [demoEmployees[0], demoEmployees[1], demoEmployees[3]],
    roadmap: [
      { id: 7, name: 'Проектирование', description: '', order: 1, plannedHours: 30, actualHours: 35, startDate: '2023-09-01', endDate: '2023-09-15', status: 'completed', projectId: 3 },
      { id: 8, name: 'Дизайн', description: '', order: 2, plannedHours: 50, actualHours: 55, startDate: '2023-09-16', endDate: '2023-10-05', status: 'completed', projectId: 3 },
      { id: 9, name: 'Разработка', description: '', order: 3, plannedHours: 250, actualHours: 260, startDate: '2023-10-06', endDate: '2023-11-30', status: 'completed', projectId: 3 },
      { id: 10, name: 'Тестирование', description: '', order: 4, plannedHours: 50, actualHours: 50, startDate: '2023-12-01', endDate: '2023-12-15', status: 'completed', projectId: 3 },
      { id: 11, name: 'Запуск', description: '', order: 5, plannedHours: 20, actualHours: 20, startDate: '2023-12-16', endDate: '2023-12-20', status: 'completed', projectId: 3 },
    ],
    createdAt: '2023-08-25',
  },
];

// Демо-задачи
const initialTasks: Task[] = [
  {
    id: 1,
    title: 'Разработка API для каталога товаров',
    description: 'Создать REST API endpoints для CRUD операций с товарами',
    projectId: 1,
    projectName: 'Интернет-магазин "ТехноМир"',
    stageId: 3,
    assigneeId: 4,
    assignee: demoEmployees[2],
    status: 'in_progress',
    priority: 'high',
    plannedHours: 16,
    actualHours: 10,
    scheduledDate: new Date().toISOString().split('T')[0],
    dueDate: '2024-03-05',
    createdAt: '2024-02-15',
    timeEntries: [],
  },
  {
    id: 2,
    title: 'Вёрстка страницы товара',
    description: 'Реализовать адаптивную верстку карточки товара по макету',
    projectId: 1,
    projectName: 'Интернет-магазин "ТехноМир"',
    stageId: 4,
    assigneeId: 2,
    assignee: demoEmployees[0],
    status: 'new',
    priority: 'medium',
    plannedHours: 8,
    actualHours: 0,
    scheduledDate: new Date().toISOString().split('T')[0],
    dueDate: '2024-03-08',
    createdAt: '2024-02-20',
    timeEntries: [],
  },
  {
    id: 3,
    title: 'Дизайн корзины',
    description: 'Создать макеты страницы корзины и оформления заказа',
    projectId: 1,
    projectName: 'Интернет-магазин "ТехноМир"',
    stageId: 2,
    assigneeId: 3,
    assignee: demoEmployees[1],
    status: 'completed',
    priority: 'high',
    plannedHours: 12,
    actualHours: 10,
    scheduledDate: '2024-02-01',
    dueDate: '2024-02-05',
    createdAt: '2024-01-28',
    timeEntries: [],
  },
  {
    id: 4,
    title: 'Интеграция платежной системы',
    description: 'Подключить Robokassa для приёма платежей',
    projectId: 1,
    projectName: 'Интернет-магазин "ТехноМир"',
    stageId: 3,
    assigneeId: 4,
    assignee: demoEmployees[2],
    status: 'new',
    priority: 'critical',
    plannedHours: 24,
    actualHours: 0,
    scheduledDate: new Date().toISOString().split('T')[0],
    dueDate: '2024-03-15',
    createdAt: '2024-02-25',
    timeEntries: [],
  },
  {
    id: 5,
    title: 'Тестирование формы регистрации',
    description: 'Провести функциональное тестирование регистрации и авторизации',
    projectId: 1,
    projectName: 'Интернет-магазин "ТехноМир"',
    stageId: 5,
    assigneeId: 5,
    assignee: demoEmployees[3],
    status: 'new',
    priority: 'medium',
    plannedHours: 4,
    actualHours: 0,
    scheduledDate: new Date().toISOString().split('T')[0],
    dueDate: '2024-03-25',
    createdAt: '2024-02-28',
    timeEntries: [],
  },
];

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Загрузка данных при монтировании
    const savedProjects = localStorage.getItem('studiokit_projects');
    const savedTasks = localStorage.getItem('studiokit_tasks');
    
    if (savedProjects) {
      setProjects(JSON.parse(savedProjects));
    }
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
  }, []);

  // Сохранение при изменениях
  useEffect(() => {
    localStorage.setItem('studiokit_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('studiokit_tasks', JSON.stringify(tasks));
  }, [tasks]);

  const getProject = (id: number) => projects.find(p => p.id === id);
  
  const createProject = async (projectData: Partial<Project>): Promise<Project> => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 300));
    
    const newProject: Project = {
      id: Date.now(),
      name: projectData.name || 'Новый проект',
      description: projectData.description || '',
      client: projectData.client || '',
      status: 'planning',
      complexity: 'medium',
      startDate: projectData.startDate || new Date().toISOString().split('T')[0],
      endDate: projectData.endDate || '',
      plannedHours: projectData.plannedHours || 0,
      actualHours: 0,
      budget: projectData.budget || 0,
      technicalSpec: projectData.technicalSpec,
      manager: user!,
      team: [],
      roadmap: [],
      createdAt: new Date().toISOString(),
    };
    
    setProjects(prev => [...prev, newProject]);
    setIsLoading(false);
    return newProject;
  };

  const updateProject = async (id: number, data: Partial<Project>) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
  };

  const deleteProject = async (id: number) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    setTasks(prev => prev.filter(t => t.projectId !== id));
  };

  const generateRoadmap = async (projectId: number): Promise<RoadmapStage[]> => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 800));
    
    const project = projects.find(p => p.id === projectId);
    if (!project) {
      setIsLoading(false);
      return [];
    }

    // Анализ ТЗ и генерация этапов
    const spec = project.technicalSpec?.toLowerCase() || '';
    const stages: RoadmapStage[] = [];
    let order = 1;
    const baseDate = new Date(project.startDate);

    // Базовые этапы
    stages.push({
      id: Date.now() + order,
      name: 'Анализ и проектирование',
      description: 'Анализ требований, проектирование архитектуры',
      order: order++,
      plannedHours: project.complexity === 'high' ? 60 : project.complexity === 'medium' ? 40 : 20,
      actualHours: 0,
      startDate: baseDate.toISOString().split('T')[0],
      endDate: new Date(baseDate.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'pending',
      projectId,
    });

    // Дизайн если есть UI
    if (spec.includes('дизайн') || spec.includes('интерфейс') || spec.includes('ui') || spec.includes('макет')) {
      stages.push({
        id: Date.now() + order,
        name: 'UX/UI Дизайн',
        description: 'Создание макетов и прототипов интерфейса',
        order: order++,
        plannedHours: project.complexity === 'high' ? 80 : 50,
        actualHours: 0,
        startDate: new Date(baseDate.getTime() + 11 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date(baseDate.getTime() + 25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'pending',
        projectId,
      });
    }

    // Backend
    if (spec.includes('api') || spec.includes('backend') || spec.includes('django') || spec.includes('база')) {
      stages.push({
        id: Date.now() + order,
        name: 'Разработка Backend',
        description: 'Серверная логика, API, база данных',
        order: order++,
        plannedHours: project.complexity === 'high' ? 160 : 100,
        actualHours: 0,
        startDate: new Date(baseDate.getTime() + 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date(baseDate.getTime() + 50 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'pending',
        projectId,
      });
    }

    // Frontend
    if (spec.includes('react') || spec.includes('frontend') || spec.includes('интерфейс') || spec.includes('верстка')) {
      stages.push({
        id: Date.now() + order,
        name: 'Разработка Frontend',
        description: 'Клиентская часть, интерфейс пользователя',
        order: order++,
        plannedHours: project.complexity === 'high' ? 140 : 80,
        actualHours: 0,
        startDate: new Date(baseDate.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date(baseDate.getTime() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'pending',
        projectId,
      });
    }

    // Интеграции
    if (spec.includes('интеграц') || spec.includes('1с') || spec.includes('платеж')) {
      stages.push({
        id: Date.now() + order,
        name: 'Интеграции',
        description: 'Подключение внешних сервисов и систем',
        order: order++,
        plannedHours: 40,
        actualHours: 0,
        startDate: new Date(baseDate.getTime() + 55 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date(baseDate.getTime() + 65 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'pending',
        projectId,
      });
    }

    // Тестирование (всегда)
    stages.push({
      id: Date.now() + order,
      name: 'Тестирование и QA',
      description: 'Функциональное тестирование, исправление багов',
      order: order++,
      plannedHours: project.complexity === 'high' ? 60 : 30,
      actualHours: 0,
      startDate: new Date(baseDate.getTime() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: new Date(baseDate.getTime() + 75 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'pending',
      projectId,
    });

    // Запуск (всегда)
    stages.push({
      id: Date.now() + order,
      name: 'Деплой и запуск',
      description: 'Развертывание на сервере, запуск в продакшен',
      order: order++,
      plannedHours: 20,
      actualHours: 0,
      startDate: new Date(baseDate.getTime() + 76 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: project.endDate,
      status: 'pending',
      projectId,
    });

    // Обновляем проект
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, roadmap: stages } : p));
    setIsLoading(false);
    return stages;
  };

  const getRecommendations = async (projectId: number): Promise<StaffRecommendation[]> => {
    await new Promise(r => setTimeout(r, 500));
    
    const project = projects.find(p => p.id === projectId);
    if (!project) return [];

    const spec = project.technicalSpec?.toLowerCase() || '';
    const recommendations: StaffRecommendation[] = [];

    demoEmployees.forEach(emp => {
      if (project.team.some(t => t.id === emp.id)) return;

      let score = 0;
      const matchingSkills: string[] = [];

      emp.skills.forEach(es => {
        const skillName = es.skill.name.toLowerCase();
        if (spec.includes(skillName) || 
            (skillName === 'react' && spec.includes('frontend')) ||
            (skillName === 'django' && spec.includes('backend')) ||
            (skillName === 'figma' && spec.includes('дизайн'))) {
          score += es.level * 20;
          matchingSkills.push(es.skill.name);
        }
      });

      if (score > 0 || matchingSkills.length > 0) {
        // Рассчитываем загрузку
        const userTasks = tasks.filter(t => t.assigneeId === emp.id && t.status !== 'completed');
        const currentLoad = Math.min(100, userTasks.length * 25);

        recommendations.push({
          user: emp,
          score: Math.min(100, score + (100 - currentLoad) / 2),
          matchingSkills,
          currentLoad,
          availability: currentLoad < 50 ? 'Доступен' : currentLoad < 80 ? 'Частично занят' : 'Загружен',
        });
      }
    });

    return recommendations.sort((a, b) => b.score - a.score);
  };

  const assignEmployee = async (projectId: number, userId: number) => {
    const employee = demoEmployees.find(e => e.id === userId);
    if (!employee) return;

    setProjects(prev => prev.map(p => {
      if (p.id === projectId && !p.team.some(t => t.id === userId)) {
        return { ...p, team: [...p.team, employee] };
      }
      return p;
    }));
  };

  const getTask = (id: number) => tasks.find(t => t.id === id);
  
  const getProjectTasks = (projectId: number) => tasks.filter(t => t.projectId === projectId);
  
  const getUserTasks = (userId: number, date?: string) => {
    return tasks.filter(t => {
      if (t.assigneeId !== userId) return false;
      if (date && t.scheduledDate !== date) return false;
      return true;
    });
  };

  const createTask = async (taskData: Partial<Task>): Promise<Task> => {
    const project = projects.find(p => p.id === taskData.projectId);
    const assignee = demoEmployees.find(e => e.id === taskData.assigneeId);
    
    const newTask: Task = {
      id: Date.now(),
      title: taskData.title || 'Новая задача',
      description: taskData.description || '',
      projectId: taskData.projectId || 0,
      projectName: project?.name || '',
      stageId: taskData.stageId,
      assigneeId: taskData.assigneeId || user?.id || 0,
      assignee: assignee || user!,
      status: 'new',
      priority: taskData.priority || 'medium',
      plannedHours: taskData.plannedHours || 4,
      actualHours: 0,
      scheduledDate: taskData.scheduledDate || new Date().toISOString().split('T')[0],
      dueDate: taskData.dueDate || '',
      createdAt: new Date().toISOString(),
      timeEntries: [],
    };
    
    setTasks(prev => [...prev, newTask]);
    return newTask;
  };

  const updateTask = async (id: number, data: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...data } : t));
  };

  const startTask = (taskId: number) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'in_progress' } : t));
  };

  const completeTask = (taskId: number) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'completed' } : t));
  };

  const logTime = (taskId: number, minutes: number) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return { ...t, actualHours: t.actualHours + minutes / 60 };
      }
      return t;
    }));

    // Обновляем часы проекта
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setProjects(prev => prev.map(p => {
        if (p.id === task.projectId) {
          return { ...p, actualHours: p.actualHours + minutes / 60 };
        }
        return p;
      }));
    }
  };

  const getDashboardStats = (): DashboardStats => {
    const activeProjects = projects.filter(p => p.status === 'in_progress').length;
    const completedProjects = projects.filter(p => p.status === 'completed').length;
    
    const avgEfficiency = projects
      .filter(p => p.status === 'completed' && p.actualHours > 0)
      .reduce((sum, p) => sum + (p.plannedHours / p.actualHours) * 100, 0) / 
      (completedProjects || 1);

    return {
      activeProjects,
      completedProjects,
      totalEmployees: demoEmployees.length,
      avgEfficiency: Math.round(avgEfficiency),
      projectsByStatus: [
        { status: 'Планирование', count: projects.filter(p => p.status === 'planning').length },
        { status: 'В работе', count: activeProjects },
        { status: 'Завершены', count: completedProjects },
        { status: 'На паузе', count: projects.filter(p => p.status === 'on_hold').length },
      ],
      recentActivity: [
        { id: 1, type: 'task_completed', message: 'Задача "Дизайн корзины" завершена', timestamp: new Date().toISOString(), userId: 3, userName: 'Мария К.' },
        { id: 2, type: 'project_created', message: 'Создан проект "CRM для автосалона"', timestamp: new Date(Date.now() - 86400000).toISOString(), userId: 1, userName: 'Иван П.' },
        { id: 3, type: 'user_assigned', message: 'Дмитрий В. назначен на проект', timestamp: new Date(Date.now() - 172800000).toISOString(), userId: 4, userName: 'Дмитрий В.' },
      ],
      upcomingDeadlines: projects
        .filter(p => p.status !== 'completed')
        .map(p => ({
          projectName: p.name,
          deadline: p.endDate,
          daysLeft: Math.ceil((new Date(p.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
        }))
        .sort((a, b) => a.daysLeft - b.daysLeft)
        .slice(0, 5),
    };
  };

  const getProjectAnalytics = (projectId: number): ProjectAnalytics => {
    const project = projects.find(p => p.id === projectId);
    if (!project) {
      return {
        projectId,
        projectName: '',
        plannedHours: 0,
        actualHours: 0,
        efficiency: 0,
        stageComparison: [],
        teamPerformance: [],
      };
    }

    return {
      projectId,
      projectName: project.name,
      plannedHours: project.plannedHours,
      actualHours: project.actualHours,
      efficiency: project.actualHours > 0 ? Math.round((project.plannedHours / project.actualHours) * 100) : 0,
      stageComparison: project.roadmap.map(stage => ({
        stageName: stage.name,
        planned: stage.plannedHours,
        actual: stage.actualHours,
      })),
      teamPerformance: project.team.map(member => {
        const memberTasks = tasks.filter(t => t.projectId === projectId && t.assigneeId === member.id);
        const completed = memberTasks.filter(t => t.status === 'completed').length;
        const hours = memberTasks.reduce((sum, t) => sum + t.actualHours, 0);
        const planned = memberTasks.reduce((sum, t) => sum + t.plannedHours, 0);
        return {
          userName: `${member.firstName} ${member.lastName}`,
          tasksCompleted: completed,
          hoursWorked: Math.round(hours * 10) / 10,
          efficiency: planned > 0 ? Math.round((planned / (hours || 1)) * 100) : 0,
        };
      }),
    };
  };

  return (
    <DataContext.Provider value={{
      projects,
      tasks,
      employees: demoEmployees,
      isLoading,
      getProject,
      createProject,
      updateProject,
      deleteProject,
      generateRoadmap,
      getRecommendations,
      assignEmployee,
      getTask,
      getProjectTasks,
      getUserTasks,
      createTask,
      updateTask,
      startTask,
      completeTask,
      getDashboardStats,
      getProjectAnalytics,
      logTime,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within DataProvider');
  }
  return context;
}
