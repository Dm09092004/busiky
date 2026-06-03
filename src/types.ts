// =====================================================
//  Доменные типы — соответствуют моделям Django backend
// =====================================================

export type Role = 'manager' | 'employee';

export interface Skill {
  id: number;
  name: string;
}

export interface EmployeeSkill {
  skill: Skill;
  level: 1 | 2 | 3 | 4 | 5;
}

export interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  role: Role;
  position: string;
  work_start: string;       // "09:00"
  work_end: string;         // "18:00"
  lunch_start: string;      // "13:00"
  lunch_duration_min: number;
  skills: EmployeeSkill[];
  avatar_color: string;
  // Производные (вычисляются на лету)
  current_load_hours?: number;
  max_load_hours?: number;
}

export type ProjectStatus = 'planning' | 'active' | 'paused' | 'completed';
export type ProjectPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Project {
  id: number;
  name: string;
  client: string;
  description: string;
  technical_spec: string;       // ТЗ — текст для анализа сложности
  status: ProjectStatus;
  priority: ProjectPriority;
  start_date: string;           // ISO
  deadline: string;             // ISO
  complexity_score: number;     // 0..100 — вычисляется
  complexity_level: 'low' | 'medium' | 'high' | 'critical';
  required_skills: number[];    // ids Skill
  manager_id: number;
  created_at: string;
}

export interface RoadmapStage {
  id: number;
  project_id: number;
  name: string;
  description: string;
  order: number;
  planned_start: string;
  planned_end: string;
  actual_start?: string;
  actual_end?: string;
  estimated_hours: number;
  status: 'pending' | 'in_progress' | 'done';
  required_skills: number[];
}

export interface ProjectAssignment {
  id: number;
  project_id: number;
  user_id: number;
  role_in_project: string;
  assigned_at: string;
}

export type TaskStatus = 'new' | 'in_progress' | 'review' | 'done' | 'blocked';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: number;
  project_id: number;
  stage_id?: number;
  assignee_id?: number;
  title: string;
  description: string;
  estimated_hours: number;
  actual_hours: number;
  status: TaskStatus;
  priority: TaskPriority;
  scheduled_date: string;     // ISO date
  created_at: string;
  completed_at?: string;
}

export interface TimeEntry {
  id: number;
  task_id: number;
  user_id: number;
  started_at: string;
  ended_at?: string;
  duration_minutes: number;
  type: 'work' | 'break' | 'lunch';
  pomodoro_phase?: 'focus' | 'short_break' | 'long_break' | 'lunch';
}

export interface Recommendation {
  user: User;
  match_score: number;         // 0..100
  matched_skills: number;
  total_required: number;
  load_percent: number;
  reasons: string[];
}

export interface ProjectHistory {
  id: number;
  project_id: number;
  project_name: string;
  complexity_score: number;
  duration_days: number;
  planned_hours: number;
  actual_hours: number;
  efficiency: number;          // planned / actual
  completed_at: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
}
