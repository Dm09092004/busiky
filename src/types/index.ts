// Типы для системы управления проектами Studio KIT

export type UserRole = 'manager' | 'developer' | 'designer' | 'tester' | 'analyst';

export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatar?: string;
  workStart: string; // "09:00"
  workEnd: string;   // "18:00"
  lunchStart: string; // "13:00"
  lunchEnd: string;   // "14:00"
  skills: EmployeeSkill[];
}

export interface Skill {
  id: number;
  name: string;
  category: string;
}

export interface EmployeeSkill {
  id: number;
  skill: Skill;
  level: number; // 1-5
}

export type ProjectStatus = 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
export type ProjectComplexity = 'low' | 'medium' | 'high' | 'very_high';

export interface Project {
  id: number;
  name: string;
  description: string;
  client: string;
  status: ProjectStatus;
  complexity: ProjectComplexity;
  startDate: string;
  endDate: string;
  plannedHours: number;
  actualHours: number;
  budget: number;
  technicalSpec?: string;
  manager: User;
  team: User[];
  roadmap: RoadmapStage[];
  createdAt: string;
}

export interface RoadmapStage {
  id: number;
  name: string;
  description: string;
  order: number;
  plannedHours: number;
  actualHours: number;
  startDate: string;
  endDate: string;
  status: 'pending' | 'in_progress' | 'completed';
  projectId: number;
}

export type TaskStatus = 'new' | 'in_progress' | 'on_review' | 'completed' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Task {
  id: number;
  title: string;
  description: string;
  projectId: number;
  projectName: string;
  stageId?: number;
  assigneeId: number;
  assignee: User;
  status: TaskStatus;
  priority: TaskPriority;
  plannedHours: number;
  actualHours: number;
  scheduledDate: string;
  dueDate: string;
  createdAt: string;
  timeEntries: TimeEntry[];
}

export interface TimeEntry {
  id: number;
  taskId: number;
  userId: number;
  startTime: string;
  endTime?: string;
  duration: number; // в минутах
  description?: string;
}

export interface ScheduleBlock {
  id: string;
  type: 'work' | 'short_break' | 'long_break' | 'lunch';
  startTime: string;
  endTime: string;
  taskId?: number;
  task?: Task;
  duration: number;
}

export interface StaffRecommendation {
  user: User;
  score: number;
  matchingSkills: string[];
  currentLoad: number; // процент загрузки
  availability: string;
}

export interface ProjectAnalytics {
  projectId: number;
  projectName: string;
  plannedHours: number;
  actualHours: number;
  efficiency: number;
  stageComparison: {
    stageName: string;
    planned: number;
    actual: number;
  }[];
  teamPerformance: {
    userName: string;
    tasksCompleted: number;
    hoursWorked: number;
    efficiency: number;
  }[];
}

export interface DashboardStats {
  activeProjects: number;
  completedProjects: number;
  totalEmployees: number;
  avgEfficiency: number;
  projectsByStatus: { status: string; count: number }[];
  recentActivity: ActivityLog[];
  upcomingDeadlines: { projectName: string; deadline: string; daysLeft: number }[];
}

export interface ActivityLog {
  id: number;
  type: 'project_created' | 'task_completed' | 'stage_completed' | 'user_assigned';
  message: string;
  timestamp: string;
  userId: number;
  userName: string;
}

export interface MascotState {
  mood: 'happy' | 'working' | 'tired' | 'celebrating' | 'sleeping' | 'encouraging';
  message: string;
}
