// =====================================================
//  ProjectDetail — главный экран проекта
//  Вкладки: Обзор / Roadmap / Задачи / Команда / Рекомендации / Аналитика
// =====================================================
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Box, Typography, Paper, Tabs, Tab, Grid, Chip, Button, LinearProgress,
  Avatar, TextField, IconButton, Tooltip, MenuItem, Select, FormControl, InputLabel,
  Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import { Icon } from '../components/Icons';
import { useApp } from '../context/AppContext';
import { api } from '../api/store';
import { COMPLEXITY_LABELS, analyzeComplexity } from '../utils/complexity';
import { logger } from '../utils/logger';
import type { Project, RoadmapStage, Task, Recommendation } from '../types';
import { RoadmapTimeline } from '../components/RoadmapTimeline';

const STATUS_LABELS: Record<string, string> = {
  planning: 'Планирование', active: 'В работе', paused: 'Пауза', completed: 'Завершён',
};
const STATUS_COLORS: Record<string, 'default' | 'primary' | 'success' | 'warning'> = {
  planning: 'default', active: 'primary', paused: 'warning', completed: 'success',
};
const PRIORITY_LABELS: Record<string, string> = { low: 'Низкий', medium: 'Средний', high: 'Высокий', critical: 'Критический' };
const PRIORITY_COLORS: Record<string, string> = { low: '#7F8C8D', medium: '#5C6BC0', high: '#F39C12', critical: '#E74C3C' };
const TASK_STATUS_LABELS: Record<string, string> = {
  new: 'Новая', in_progress: 'В работе', review: 'На проверке', done: 'Готово', blocked: 'Заблокирована',
};
const TASK_STATUS_COLORS: Record<string, 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info'> = {
  new: 'default', in_progress: 'primary', review: 'info', done: 'success', blocked: 'error',
};

function complexityColor(score: number) {
  if (score >= 75) return '#E74C3C';
  if (score >= 50) return '#F39C12';
  if (score >= 25) return '#5C6BC0';
  return '#27AE60';
}

interface TabPanelProps { value: number; index: number; children: React.ReactNode }
function TabPanel({ value, index, children }: TabPanelProps) {
  return value === index ? <Box sx={{ pt: 3 }}>{children}</Box> : null;
}

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const { user, users, notify } = useApp();
  const projectId = Number(id);

  const [project, setProject] = useState<Project | null>(null);
  const [stages, setStages] = useState<RoadmapStage[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [recs, setRecs] = useState<Recommendation[]>([]);
  const [tab, setTab] = useState(0);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [p, s, t, a, r] = await Promise.all([
        api.getProject(projectId),
        api.listStages(projectId),
        api.listTasks({ projectId }),
        api.listAssignments(projectId),
        api.recommendStaff(projectId),
      ]);
      setProject(p);
      setStages(s);
      setTasks(t);
      setAssignments(a);
      setRecs(r);
    } catch (e) {
      logger.err('project', `Ошибка загрузки проекта #${projectId}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) load();
  }, [projectId]);

  const handleGenerateRoadmap = async () => {
    try {
      await api.generateRoadmap(projectId);
      logger.ok('project', `Дорожная карта для #${projectId} перегенерирована`);
      notify('Дорожная карта сгенерирована', 'success');
      await load();
    } catch (e) {
      notify('Ошибка генерации roadmap', 'error');
    }
  };

  const handleAssign = async (userId: number) => {
    try {
      await api.assignUser(projectId, userId);
      logger.info('project', `Назначен #${userId} на проект #${projectId}`);
      notify('Сотрудник назначен на проект', 'success');
      await load();
    } catch (e) {
      notify('Ошибка назначения', 'error');
    }
  };

  const handleUnassign = async (userId: number) => {
    try {
      await api.unassignUser(projectId, userId);
      notify('Сотрудник снят с проекта', 'info');
      await load();
    } catch (e) { /* ignore */ }
  };

  if (loading || !project) {
    return <Typography sx={{ p: 3 }}>Загрузка проекта...</Typography>;
  }

  const projTasks = tasks;
  const done = projTasks.filter((t) => t.status === 'done').length;
  const progress = projTasks.length ? Math.round((done / projTasks.length) * 100) : 0;
  const color = complexityColor(project.complexity_score);
  const team = assignments.map((a) => users.find((u) => u.id === a.user_id)).filter(Boolean);
  const totalPlanned = stages.reduce((s, st) => s + st.estimated_hours, 0);
  const totalActual = projTasks.reduce((s, t) => s + t.actual_hours, 0);

  return (
    <Box>
      {/* Хлебные крошки */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, color: 'text.secondary' }}>
        <Box component={Link} to="/projects" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'inherit', textDecoration: 'none' }}>
          <Icon.ChevronRight size={14} style={{ transform: 'rotate(180deg)' }} />
          <Typography variant="body2">Все проекты</Typography>
        </Box>
      </Box>

      {/* Шапка */}
      <Paper sx={{ p: 3, mb: 3, background: `linear-gradient(135deg, ${color}08 0%, #FFFFFF 100%)` }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ flex: 1, minWidth: 280 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Chip size="small" label={STATUS_LABELS[project.status]} color={STATUS_COLORS[project.status]} />
              <Box sx={{
                display: 'flex', alignItems: 'center', gap: 0.5,
                px: 1, py: 0.3, borderRadius: 1, bgcolor: `${PRIORITY_COLORS[project.priority]}15`,
                color: PRIORITY_COLORS[project.priority],
              }}>
                <Icon.Fire size={12} />
                <Typography variant="caption" sx={{ fontWeight: 600 }}>{PRIORITY_LABELS[project.priority]}</Typography>
              </Box>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.dark', mb: 0.5 }}>{project.name}</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>{project.client}</Typography>
            <Typography variant="body1" sx={{ color: 'text.primary' }}>{project.description}</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            <Box sx={{ p: 2, borderRadius: 2, bgcolor: '#fff', border: '1px solid', borderColor: 'divider', minWidth: 130 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                <Icon.Target size={14} style={{ color }} />
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>Сложность</Typography>
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color }}>{project.complexity_score}%</Typography>
              <Typography variant="caption" sx={{ color }}>{COMPLEXITY_LABELS[project.complexity_level]}</Typography>
            </Box>
            <Box sx={{ p: 2, borderRadius: 2, bgcolor: '#fff', border: '1px solid', borderColor: 'divider', minWidth: 130 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                <Icon.Clock size={14} style={{ color: 'primary.main' }} />
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>Дедлайн</Typography>
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.dark' }}>
                {new Date(project.deadline).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>{project.deadline}</Typography>
            </Box>
            <Box sx={{ p: 2, borderRadius: 2, bgcolor: '#fff', border: '1px solid', borderColor: 'divider', minWidth: 130 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                <Icon.Briefcase size={14} style={{ color: 'primary.main' }} />
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>Команда</Typography>
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.dark' }}>{team.length}</Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>человек</Typography>
            </Box>
          </Box>
        </Box>
        <Box sx={{ mt: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Общий прогресс проекта</Typography>
            <Typography variant="caption" sx={{ fontWeight: 600 }}>{done} из {projTasks.length} задач · {progress}%</Typography>
          </Box>
          <LinearProgress
            variant="determinate" value={progress}
            sx={{ height: 8, borderRadius: 4, bgcolor: 'rgba(77, 182, 172, 0.12)', '& .MuiLinearProgress-bar': { borderRadius: 4, bgcolor: 'primary.main' } }}
          />
        </Box>
      </Paper>

      <Paper sx={{ mb: 3 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto"
              sx={{ borderBottom: '1px solid', borderColor: 'divider', px: 2 }}>
          <Tab label="Обзор" icon={<Icon.Analytics size={16} />} iconPosition="start" />
          <Tab label={`Roadmap (${stages.length})`} icon={<Icon.Layers size={16} />} iconPosition="start" />
          <Tab label={`Задачи (${tasks.length})`} icon={<Icon.CheckSquare size={16} />} iconPosition="start" />
          <Tab label={`Команда (${team.length})`} icon={<Icon.Team size={16} />} iconPosition="start" />
          <Tab label="Рекомендации" icon={<Icon.Sparkle size={16} />} iconPosition="start" />
        </Tabs>

        {/* ОБЗОР */}
        <TabPanel value={tab} index={0}>
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1.5 }}>Техническое задание</Typography>
                <Paper sx={{ p: 2, bgcolor: 'rgba(77, 182, 172, 0.04)' }}>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', color: 'text.secondary' }}>
                    {project.technical_spec}
                  </Typography>
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1.5 }}>Факторы сложности</Typography>
                {(() => {
                  const r = analyzeComplexity(project.technical_spec, []);
                  return r.factors.map((f) => (
                    <Box key={f.name} sx={{ mb: 1.5 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.3 }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>{f.name}</Typography>
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>{f.value} / {f.weight}</Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate" value={(f.value / f.weight) * 100}
                        sx={{ height: 5, borderRadius: 2, bgcolor: 'rgba(77, 182, 172, 0.12)' }}
                      />
                    </Box>
                  ));
                })()}
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>Запланировано</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>{totalPlanned}ч</Typography>
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>Отработано</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: 'success.main' }}>{totalActual.toFixed(1)}ч</Typography>
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>Задач всего</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.dark' }}>{tasks.length}</Typography>
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>Этапов</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.dark' }}>{stages.length}</Typography>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>

        {/* ROADMAP */}
        <TabPanel value={tab} index={1}>
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>Дорожная карта проекта</Typography>
              {user?.role === 'manager' && (
                <Button
                  variant="contained" startIcon={<Icon.Wand size={18} />}
                  onClick={handleGenerateRoadmap}
                >
                  {stages.length > 0 ? 'Перегенерировать' : 'Сгенерировать'}
                </Button>
              )}
            </Box>

            {stages.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <RoadmapTimeline stages={stages} />
              </Box>
            )}
            {stages.length === 0 && (
              <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'rgba(77, 182, 172, 0.04)' }}>
                <Icon.Layers size={48} />
                <Typography variant="h6" sx={{ mt: 1 }}>Дорожная карта не создана</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                  Нажмите «Сгенерировать», чтобы система автоматически разбила проект на этапы.
                </Typography>
                {user?.role === 'manager' && (
                  <Button variant="contained" startIcon={<Icon.Wand size={18} />} onClick={handleGenerateRoadmap}>
                    Сгенерировать дорожную карту
                  </Button>
                )}
              </Paper>
            )}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {stages.map((stage, i) => {
                const stageTasks = tasks.filter((t) => t.stage_id === stage.id);
                const stageDone = stageTasks.filter((t) => t.status === 'done').length;
                const stageProgress = stageTasks.length ? Math.round((stageDone / stageTasks.length) * 100) : 0;
                const statusColor = stage.status === 'done' ? 'success.main' : stage.status === 'in_progress' ? 'primary.main' : 'grey.400';
                return (
                  <Paper key={stage.id} sx={{ p: 2, borderLeft: '4px solid', borderColor: statusColor }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                      <Avatar sx={{ bgcolor: statusColor, width: 32, height: 32, fontSize: 14, fontWeight: 700 }}>
                        {i + 1}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{stage.name}</Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {stage.planned_start} → {stage.planned_end} · {stage.estimated_hours}ч
                        </Typography>
                      </Box>
                      <Chip
                        size="small"
                        label={stage.status === 'done' ? 'Завершён' : stage.status === 'in_progress' ? 'В работе' : 'Ожидает'}
                        sx={{
                          bgcolor: `${statusColor === 'grey.400' ? '#7F8C8D' : statusColor}15`,
                          color: statusColor === 'grey.400' ? '#7F8C8D' : statusColor,
                          fontWeight: 600,
                        }}
                      />
                    </Box>
                    {stage.description && (
                      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>{stage.description}</Typography>
                    )}
                    {stageTasks.length > 0 && (
                      <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.3 }}>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>Прогресс задач</Typography>
                          <Typography variant="caption" sx={{ fontWeight: 600 }}>{stageDone} / {stageTasks.length}</Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate" value={stageProgress}
                          sx={{ height: 5, borderRadius: 2, bgcolor: 'rgba(77, 182, 172, 0.12)' }}
                        />
                      </Box>
                    )}
                  </Paper>
                );
              })}
            </Box>
          </Box>
        </TabPanel>

        {/* ЗАДАЧИ */}
        <TabPanel value={tab} index={2}>
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>Все задачи проекта</Typography>
              {user?.role === 'manager' && (
                <Button variant="contained" startIcon={<Icon.Plus size={18} />} onClick={() => setShowTaskModal(true)}>
                  Новая задача
                </Button>
              )}
            </Box>
            {tasks.length === 0 && (
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <Icon.CheckSquare size={48} />
                <Typography variant="h6" sx={{ mt: 1 }}>Задач пока нет</Typography>
              </Paper>
            )}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {tasks.map((task) => {
                const assignee = users.find((u) => u.id === task.assignee_id);
                return (
                  <Paper key={task.id} sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontWeight: 500 }}>{task.title}</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
                        <Chip size="small" label={TASK_STATUS_LABELS[task.status]} color={TASK_STATUS_COLORS[task.status]} sx={{ height: 20, fontSize: 11 }} />
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          <Icon.Clock size={11} /> {task.estimated_hours}ч
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          <Icon.Calendar size={11} /> {task.scheduled_date}
                        </Typography>
                      </Box>
                    </Box>
                    {assignee && (
                      <Tooltip title={`${assignee.first_name} ${assignee.last_name}`}>
                        <Avatar sx={{ bgcolor: assignee.avatar_color, width: 32, height: 32, fontSize: 13 }}>
                          {assignee.first_name[0]}{assignee.last_name[0]}
                        </Avatar>
                      </Tooltip>
                    )}
                  </Paper>
                );
              })}
            </Box>
          </Box>
        </TabPanel>

        {/* КОМАНДА */}
        <TabPanel value={tab} index={3}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Команда проекта</Typography>
            {team.length === 0 && (
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <Icon.Team size={48} />
                <Typography variant="h6" sx={{ mt: 1 }}>Команда не сформирована</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>Перейдите во вкладку «Рекомендации», чтобы подобрать сотрудников</Typography>
              </Paper>
            )}
            <Grid container spacing={2}>
              {team.map((u) => u && (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={u.id}>
                  <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ bgcolor: u.avatar_color, width: 48, height: 48 }}>{u.first_name[0]}{u.last_name[0]}</Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{u.first_name} {u.last_name}</Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>{u.position}</Typography>
                    </Box>
                    {user?.role === 'manager' && (
                      <Tooltip title="Снять с проекта">
                        <IconButton size="small" onClick={() => handleUnassign(u.id)}>
                          <Icon.Close size={16} />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
        </TabPanel>

        {/* РЕКОМЕНДАЦИИ */}
        <TabPanel value={tab} index={4}>
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Icon.Sparkle size={20} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>Рекомендации по подбору команды</Typography>
            </Box>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
              Система анализирует навыки сотрудников, их текущую загрузку и требования проекта. Чем выше рейтинг — тем лучше совпадение.
            </Typography>
            <Grid container spacing={2}>
              {recs.map((rec) => {
                const isAssigned = assignments.some((a) => a.user_id === rec.user.id);
                const scoreColor = rec.match_score >= 70 ? '#27AE60' : rec.match_score >= 40 ? '#F39C12' : '#7F8C8D';
                return (
                  <Grid size={{ xs: 12, md: 6 }} key={rec.user.id}>
                    <Paper sx={{ p: 2.5, position: 'relative', border: isAssigned ? '1px solid' : 'none', borderColor: 'success.main' }}>
                      {isAssigned && (
                        <Chip
                          size="small" label="В команде" color="success" icon={<Icon.Check size={14} />}
                          sx={{ position: 'absolute', top: 12, right: 12 }}
                        />
                      )}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                        <Avatar sx={{ bgcolor: rec.user.avatar_color, width: 48, height: 48, fontSize: 16, fontWeight: 600 }}>
                          {rec.user.first_name[0]}{rec.user.last_name[0]}
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{rec.user.first_name} {rec.user.last_name}</Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>{rec.user.position}</Typography>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography variant="h5" sx={{ fontWeight: 700, color: scoreColor, lineHeight: 1 }}>{rec.match_score}</Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>рейтинг</Typography>
                        </Box>
                      </Box>
                      <Box sx={{ mb: 1.5 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.3 }}>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>Совпадение навыков</Typography>
                          <Typography variant="caption" sx={{ fontWeight: 600 }}>{rec.matched_skills} / {rec.total_required}</Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate" value={(rec.matched_skills / rec.total_required) * 100}
                          sx={{ height: 5, borderRadius: 2, bgcolor: 'rgba(77, 182, 172, 0.12)', '& .MuiLinearProgress-bar': { bgcolor: scoreColor } }}
                        />
                      </Box>
                      <Box sx={{ mb: 1.5 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.3 }}>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>Текущая загрузка</Typography>
                          <Typography variant="caption" sx={{ fontWeight: 600 }}>{rec.load_percent}%</Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate" value={rec.load_percent}
                          sx={{
                            height: 5, borderRadius: 2, bgcolor: 'rgba(77, 182, 172, 0.12)',
                            '& .MuiLinearProgress-bar': { bgcolor: rec.load_percent > 70 ? '#E74C3C' : rec.load_percent > 40 ? '#F39C12' : '#27AE60' },
                          }}
                        />
                      </Box>
                      {rec.user.skills.length > 0 && (
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1.5 }}>
                          {rec.user.skills.slice(0, 4).map((es) => (
                            <Chip key={es.skill.id} size="small" label={es.skill.name} variant="outlined" sx={{ height: 20, fontSize: 11 }} />
                          ))}
                        </Box>
                      )}
                      {rec.reasons.length > 0 && (
                        <Box sx={{ mb: 1.5 }}>
                          {rec.reasons.map((r, i) => (
                            <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.3 }}>
                              <Icon.Check size={12} style={{ color: scoreColor }} />
                              <Typography variant="caption" sx={{ color: 'text.secondary' }}>{r}</Typography>
                            </Box>
                          ))}
                        </Box>
                      )}
                      {user?.role === 'manager' && !isAssigned && (
                        <Button
                          fullWidth variant="contained" size="small"
                          startIcon={<Icon.Plus size={14} />}
                          onClick={() => handleAssign(rec.user.id)}
                        >
                          Назначить на проект
                        </Button>
                      )}
                    </Paper>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        </TabPanel>
      </Paper>

      {/* Модалка создания задачи */}
      <CreateTaskModal
        open={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        projectId={projectId}
        stages={stages}
        team={team as any}
        onCreated={load}
      />
    </Box>
  );
}

// ─── Модалка создания задачи ───
function CreateTaskModal({ open, onClose, projectId, stages, team, onCreated }: {
  open: boolean;
  onClose: () => void;
  projectId: number;
  stages: RoadmapStage[];
  team: any[];
  onCreated: () => void;
}) {
  const { notify } = useApp();
  const [form, setForm] = useState({
    title: '',
    description: '',
    estimated_hours: 4,
    priority: 'medium' as 'low' | 'medium' | 'high',
    status: 'new' as any,
    assignee_id: '' as number | '',
    stage_id: '' as number | '',
    scheduled_date: new Date().toISOString().split('T')[0],
  });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!form.title.trim()) { notify('Введите название задачи', 'warning'); return; }
    setSaving(true);
    try {
      await api.createTask({
        project_id: projectId,
        title: form.title,
        description: form.description,
        estimated_hours: Number(form.estimated_hours),
        priority: form.priority,
        status: form.status,
        assignee_id: form.assignee_id || undefined,
        stage_id: form.stage_id || undefined,
        scheduled_date: form.scheduled_date,
      });
      logger.ok('project', `Создана задача "${form.title}" в проекте #${projectId}`);
      notify('Задача создана', 'success');
      setForm({ ...form, title: '', description: '' });
      onClose();
      onCreated();
    } catch (e) {
      notify('Ошибка создания задачи', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 600, color: 'primary.dark' }}>Новая задача</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField label="Название" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} fullWidth autoFocus />
          <TextField label="Описание" multiline rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} fullWidth />
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2 }}>
            <TextField type="number" label="Часы" value={form.estimated_hours} onChange={(e) => setForm({ ...form, estimated_hours: Number(e.target.value) })} />
            <FormControl>
              <InputLabel>Приоритет</InputLabel>
              <Select value={form.priority} label="Приоритет" onChange={(e) => setForm({ ...form, priority: e.target.value as any })}>
                <MenuItem value="low">Низкий</MenuItem>
                <MenuItem value="medium">Средний</MenuItem>
                <MenuItem value="high">Высокий</MenuItem>
              </Select>
            </FormControl>
            <TextField type="date" label="Дата" slotProps={{ inputLabel: { shrink: true } }} value={form.scheduled_date} onChange={(e) => setForm({ ...form, scheduled_date: e.target.value })} />
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <FormControl>
              <InputLabel>Этап</InputLabel>
              <Select value={form.stage_id} label="Этап" onChange={(e) => setForm({ ...form, stage_id: e.target.value as number })}>
                <MenuItem value="">Без этапа</MenuItem>
                {stages.map((s) => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl>
              <InputLabel>Исполнитель</InputLabel>
              <Select value={form.assignee_id} label="Исполнитель" onChange={(e) => setForm({ ...form, assignee_id: e.target.value as number })}>
                <MenuItem value="">Без исполнителя</MenuItem>
                {team.map((u: any) => u && <MenuItem key={u.id} value={u.id}>{u.first_name} {u.last_name}</MenuItem>)}
              </Select>
            </FormControl>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>Отмена</Button>
        <Button variant="contained" onClick={save} disabled={saving} startIcon={<Icon.Plus size={18} />}>
          {saving ? 'Сохранение...' : 'Создать'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
