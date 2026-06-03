import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import ActivityLog, { useActivityLog } from '../components/ActivityLog';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Users, 
  DollarSign,
  MapPin,
  Plus,
  Sparkles,
  UserPlus,
  CheckCircle2,
  Circle,
  PlayCircle,
  AlertTriangle,
  Edit2,
  X,
  Cpu,
  FileText,
  TrendingUp,
  Star,
} from 'lucide-react';
import { Task, StaffRecommendation, RoadmapStage } from '../types';
import GanttChart from '../components/GanttChart';
import { useTheme } from '../context/ThemeContext';

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    getProject, 
    getProjectTasks, 
    generateRoadmap, 
    getRecommendations,
    assignEmployee,
    createTask,
    updateProject,
  } = useData();
  const { user } = useAuth();
  const { colors } = useTheme();
  const { logs, addLog, clearLogs } = useActivityLog();
  const [showGantt, setShowGantt] = useState(false);
  
  const [activeTab, setActiveTab] = useState<'overview' | 'roadmap' | 'tasks' | 'team'>('overview');
  const [recommendations, setRecommendations] = useState<StaffRecommendation[]>([]);
  const [loadingRoadmap, setLoadingRoadmap] = useState(false);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assigneeId: 0,
    stageId: 0,
    priority: 'medium' as const,
    plannedHours: 4,
    dueDate: '',
  });

  const project = getProject(Number(id));
  const projectTasks = getProjectTasks(Number(id));
  const isManager = user?.role === 'manager';

  useEffect(() => {
    if (activeTab === 'team' && isManager && recommendations.length === 0) {
      loadRecommendations();
    }
  }, [activeTab]);

  if (!project) {
    return (
      <div className="text-center py-16 animate-fadeIn">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="w-10 h-10 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Проект не найден</h2>
        <Link to="/projects" className="text-emerald-600 hover:underline mt-4 inline-block">
          Вернуться к проектам
        </Link>
      </div>
    );
  }

  const loadRecommendations = async () => {
    setLoadingRecommendations(true);
    addLog('info', 'analysis', 'Запуск анализа навыков команды...', 
      `Проект: ${project.name}\nТЗ: ${project.technicalSpec?.substring(0, 100)}...`);
    
    const recs = await getRecommendations(project.id);
    
    if (recs.length > 0) {
      addLog('success', 'team', `Найдено ${recs.length} подходящих кандидатов`, 
        recs.map(r => `${r.user.firstName} ${r.user.lastName}: ${r.score}% совпадение`).join('\n'));
    } else {
      addLog('warning', 'team', 'Подходящие кандидаты не найдены', 
        'Попробуйте добавить техническое задание с описанием требуемых навыков');
    }
    
    setRecommendations(recs);
    setLoadingRecommendations(false);
  };

  const handleGenerateRoadmap = async () => {
    if (!project.technicalSpec) {
      addLog('warning', 'roadmap', 'Не удалось сгенерировать roadmap', 
        'Добавьте техническое задание для автоматической генерации этапов');
      return;
    }

    setLoadingRoadmap(true);
    addLog('ai', 'analysis', 'Анализ технического задания...', 
      `Длина ТЗ: ${project.technicalSpec.length} символов`);
    
    // Имитация анализа
    await new Promise(r => setTimeout(r, 500));
    
    const spec = project.technicalSpec.toLowerCase();
    const detectedKeywords: string[] = [];
    
    if (spec.includes('react') || spec.includes('frontend')) detectedKeywords.push('Frontend разработка');
    if (spec.includes('django') || spec.includes('backend') || spec.includes('api')) detectedKeywords.push('Backend разработка');
    if (spec.includes('дизайн') || spec.includes('ui') || spec.includes('макет')) detectedKeywords.push('UI/UX дизайн');
    if (spec.includes('интеграц') || spec.includes('1с') || spec.includes('платеж')) detectedKeywords.push('Интеграции');
    if (spec.includes('база') || spec.includes('postgresql') || spec.includes('mysql')) detectedKeywords.push('База данных');
    
    setAnalysisResult(`Обнаружены ключевые области:\n• ${detectedKeywords.join('\n• ')}`);
    
    addLog('ai', 'analysis', 'Анализ завершён', 
      `Обнаруженные технологии и области:\n${detectedKeywords.map(k => `• ${k}`).join('\n')}`);
    
    addLog('ai', 'roadmap', 'Генерация дорожной карты...', 
      `Сложность проекта: ${project.complexity}\nПлановые часы: ${project.plannedHours}`);
    
    const stages = await generateRoadmap(project.id);
    
    addLog('success', 'roadmap', `Создано ${stages.length} этапов`, 
      stages.map(s => `${s.order}. ${s.name} (${s.plannedHours}ч)`).join('\n'));
    
    setLoadingRoadmap(false);
  };

  const handleAssignEmployee = async (userId: number, userName: string) => {
    await assignEmployee(project.id, userId);
    addLog('success', 'team', `${userName} добавлен в команду`, 
      `Проект: ${project.name}`);
    loadRecommendations();
  };

  const handleCreateTask = async () => {
    if (!newTask.title || !newTask.assigneeId) return;
    
    await createTask({
      ...newTask,
      projectId: project.id,
      scheduledDate: new Date().toISOString().split('T')[0],
    });
    
    addLog('success', 'task', `Создана задача "${newTask.title}"`, 
      `Исполнитель: ID ${newTask.assigneeId}\nПлановые часы: ${newTask.plannedHours}`);
    
    setShowTaskModal(false);
    setNewTask({
      title: '',
      description: '',
      assigneeId: 0,
      stageId: 0,
      priority: 'medium',
      plannedHours: 4,
      dueDate: '',
    });
  };

  const handleUpdateStage = async (stageId: number, stageName: string, status: RoadmapStage['status']) => {
    const updatedRoadmap = project.roadmap.map(s => 
      s.id === stageId ? { ...s, status } : s
    );
    await updateProject(project.id, { roadmap: updatedRoadmap });
    
    const statusLabels = { pending: 'Ожидает', in_progress: 'В работе', completed: 'Завершён' };
    addLog('info', 'roadmap', `Этап "${stageName}" — ${statusLabels[status]}`);
  };

  const getTaskStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'in_progress': return <PlayCircle className="w-5 h-5 text-blue-500" />;
      case 'on_review': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      default: return <Circle className="w-5 h-5 text-gray-400" />;
    }
  };

  const statusColors: Record<string, string> = {
    planning: 'bg-amber-100 text-amber-700',
    in_progress: 'bg-emerald-100 text-emerald-700',
    on_hold: 'bg-red-100 text-red-700',
    completed: 'bg-indigo-100 text-indigo-700',
    cancelled: 'bg-gray-100 text-gray-700',
  };

  const statusLabels: Record<string, string> = {
    planning: 'Планирование',
    in_progress: 'В работе',
    on_hold: 'На паузе',
    completed: 'Завершён',
    cancelled: 'Отменён',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between animate-fadeIn">
        <div className="flex items-start gap-4">
          <button
            onClick={() => navigate('/projects')}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[project.status]}`}>
                {statusLabels[project.status]}
              </span>
              <span className="flex items-center gap-1 text-sm text-gray-500">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                {project.complexity === 'low' ? 'Низкая' :
                 project.complexity === 'medium' ? 'Средняя' :
                 project.complexity === 'high' ? 'Высокая' : 'Очень высокая'} сложность
              </span>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">{project.name}</h1>
            <p className="text-gray-500 mt-1">{project.client}</p>
          </div>
        </div>
        {isManager && (
          <Link
            to={`/projects/${project.id}/edit`}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <Edit2 className="w-4 h-4" />
            Редактировать
          </Link>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {(['overview', 'roadmap', 'tasks', 'team'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 font-medium text-sm border-b-2 transition-all ${
              activeTab === tab 
                ? 'border-emerald-500 text-emerald-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab === 'overview' && <span className="flex items-center gap-2"><FileText className="w-4 h-4" />Обзор</span>}
            {tab === 'roadmap' && <span className="flex items-center gap-2"><MapPin className="w-4 h-4" />Дорожная карта</span>}
            {tab === 'tasks' && <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" />Задачи ({projectTasks.length})</span>}
            {tab === 'team' && <span className="flex items-center gap-2"><Users className="w-4 h-4" />Команда ({project.team.length})</span>}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-emerald-100 card-hover">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-gray-400" />
                Описание
              </h3>
              <p className="text-gray-600">{project.description || 'Описание не указано'}</p>
              
              {project.technicalSpec && (
                <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <h4 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-purple-500" />
                    Техническое задание
                  </h4>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{project.technicalSpec}</p>
                </div>
              )}
            </div>

            {/* Progress */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-emerald-100 card-hover">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-gray-400" />
                Прогресс
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-500">Часы</span>
                    <span className="font-medium">{Math.round(project.actualHours)} / {project.plannedHours} ч</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-500"
                      style={{ width: `${Math.min(100, (project.actualHours / project.plannedHours) * 100)}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-500">Этапы</span>
                    <span className="font-medium">
                      {project.roadmap.filter(s => s.status === 'completed').length} / {project.roadmap.length}
                    </span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-indigo-400 to-purple-500 transition-all duration-500"
                      style={{ width: `${project.roadmap.length > 0 
                        ? (project.roadmap.filter(s => s.status === 'completed').length / project.roadmap.length) * 100 
                        : 0}%` 
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Activity Log */}
            {logs.length > 0 && (
              <ActivityLog logs={logs} onClear={clearLogs} />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-emerald-100 card-hover">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Детали</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-50">
                    <Calendar className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Сроки</p>
                    <p className="font-medium text-gray-800">
                      {new Date(project.startDate).toLocaleDateString('ru-RU')} — {new Date(project.endDate).toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-50">
                    <Clock className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Плановые часы</p>
                    <p className="font-medium text-gray-800">{project.plannedHours} часов</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-50">
                    <DollarSign className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Бюджет</p>
                    <p className="font-medium text-gray-800">
                      {project.budget.toLocaleString('ru-RU')} ₽
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-50">
                    <Users className="w-5 h-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Команда</p>
                    <p className="font-medium text-gray-800">{project.team.length} человек</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Team */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-emerald-100 card-hover">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Команда</h3>
              {project.team.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Команда не сформирована</p>
              ) : (
                <div className="space-y-3">
                  {project.team.slice(0, 5).map(member => (
                    <div key={member.id} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-medium shadow-md">
                        {member.firstName[0]}{member.lastName[0]}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{member.firstName} {member.lastName}</p>
                        <p className="text-sm text-gray-500">{member.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Roadmap Tab */}
      {activeTab === 'roadmap' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-emerald-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-gray-400" />
                Дорожная карта проекта
              </h3>
              {isManager && (
                <button
                  onClick={handleGenerateRoadmap}
                  disabled={loadingRoadmap || !project.technicalSpec}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-xl shadow-lg disabled:opacity-50 transition-all hover:shadow-xl active:scale-95"
                >
                  {loadingRoadmap ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Sparkles className="w-5 h-5" />
                  )}
                  {project.roadmap.length > 0 ? 'Перегенерировать' : 'Сгенерировать AI'}
                </button>
              )}
            </div>

            {/* Analysis Result */}
            {analysisResult && (
              <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-xl animate-slideDown">
                <div className="flex items-start gap-3">
                  <Cpu className="w-5 h-5 text-purple-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-purple-800">Результат анализа ТЗ</p>
                    <p className="text-sm text-purple-600 whitespace-pre-line mt-1">{analysisResult}</p>
                  </div>
                  <button onClick={() => setAnalysisResult(null)} className="text-purple-400 hover:text-purple-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {!project.technicalSpec && (
              <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  <p className="text-sm text-amber-700">
                    Добавьте техническое задание для автоматической генерации этапов
                  </p>
                </div>
              </div>
            )}

            {/* View Toggle */}
            {project.roadmap.length > 0 && (
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => setShowGantt(false)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    !showGantt 
                      ? `bg-gradient-to-r ${colors.gradient} text-white shadow-md` 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Список
                </button>
                <button
                  onClick={() => setShowGantt(true)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    showGantt 
                      ? `bg-gradient-to-r ${colors.gradient} text-white shadow-md` 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Диаграмма Ганта
                </button>
              </div>
            )}

            {project.roadmap.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500">Дорожная карта ещё не создана</p>
                {isManager && project.technicalSpec && (
                  <p className="text-sm text-gray-400 mt-2">
                    Нажмите кнопку "Сгенерировать AI" для автоматического создания этапов
                  </p>
                )}
              </div>
            ) : showGantt ? (
              <GanttChart 
                stages={project.roadmap}
                projectStart={project.startDate}
                projectEnd={project.endDate}
              />
            ) : (
              <div className="space-y-4">
                {project.roadmap.map((stage, index) => (
                  <div 
                    key={stage.id}
                    className="relative flex gap-4 animate-fadeIn"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {/* Timeline line */}
                    {index !== project.roadmap.length - 1 && (
                      <div className="absolute left-5 top-12 w-0.5 h-full bg-gray-200" />
                    )}
                    
                    {/* Status indicator */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10 transition-all ${
                      stage.status === 'completed' ? 'bg-emerald-100 text-emerald-600 ring-4 ring-emerald-50' :
                      stage.status === 'in_progress' ? 'bg-blue-100 text-blue-600 ring-4 ring-blue-50 animate-pulse' :
                      'bg-gray-100 text-gray-400'
                    }`}>
                      {stage.status === 'completed' ? <CheckCircle2 className="w-5 h-5" /> :
                       stage.status === 'in_progress' ? <PlayCircle className="w-5 h-5" /> :
                       <Circle className="w-5 h-5" />}
                    </div>
                    
                    {/* Stage content */}
                    <div className="flex-1 bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-800">{stage.name}</h4>
                          <p className="text-sm text-gray-500 mt-1">{stage.description}</p>
                        </div>
                        {isManager && (
                          <select
                            value={stage.status}
                            onChange={(e) => handleUpdateStage(stage.id, stage.name, e.target.value as RoadmapStage['status'])}
                            className="px-3 py-1 rounded-lg border border-gray-200 text-sm bg-white cursor-pointer hover:border-emerald-300 transition-colors"
                          >
                            <option value="pending">Ожидает</option>
                            <option value="in_progress">В работе</option>
                            <option value="completed">Завершён</option>
                          </select>
                        )}
                      </div>
                      <div className="flex items-center gap-6 mt-3 text-sm">
                        <span className="text-gray-500 flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(stage.startDate).toLocaleDateString('ru-RU')} — {new Date(stage.endDate).toLocaleDateString('ru-RU')}
                        </span>
                        <span className="text-gray-500 flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {stage.actualHours}/{stage.plannedHours} ч
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Logs for roadmap */}
          {logs.filter(l => l.category === 'roadmap' || l.category === 'analysis').length > 0 && (
            <ActivityLog 
              logs={logs.filter(l => l.category === 'roadmap' || l.category === 'analysis')} 
            />
          )}
        </div>
      )}

      {/* Tasks Tab */}
      {activeTab === 'tasks' && (
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-emerald-100 animate-fadeIn">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-gray-400" />
              Задачи проекта
            </h3>
            {isManager && (
              <button
                onClick={() => setShowTaskModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium rounded-xl shadow-lg transition-all hover:shadow-xl active:scale-95"
              >
                <Plus className="w-5 h-5" />
                Добавить задачу
              </button>
            )}
          </div>

          {projectTasks.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500">Задачи ещё не созданы</p>
              {isManager && (
                <button
                  onClick={() => setShowTaskModal(true)}
                  className="mt-4 text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  + Создать первую задачу
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {projectTasks.map((task, index) => (
                <div 
                  key={task.id} 
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all animate-fadeIn card-hover"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  {getTaskStatusIcon(task.status)}
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{task.title}</p>
                    <p className="text-sm text-gray-500">
                      {task.assignee.firstName} {task.assignee.lastName} • {task.plannedHours}ч
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    task.priority === 'critical' ? 'bg-red-100 text-red-700' :
                    task.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                    task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {task.priority === 'critical' ? 'Критично' :
                     task.priority === 'high' ? 'Высокий' :
                     task.priority === 'medium' ? 'Средний' : 'Низкий'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Team Tab */}
      {activeTab === 'team' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fadeIn">
          {/* Current Team */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-emerald-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-gray-400" />
              Текущая команда
            </h3>
            {project.team.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-gray-500">Команда ещё не сформирована</p>
              </div>
            ) : (
              <div className="space-y-3">
                {project.team.map((member, index) => (
                  <div 
                    key={member.id} 
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl animate-fadeIn"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-semibold shadow-md">
                      {member.firstName[0]}{member.lastName[0]}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{member.firstName} {member.lastName}</p>
                      <p className="text-sm text-gray-500">{member.email}</p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                      {member.role === 'developer' ? 'Разработчик' :
                       member.role === 'designer' ? 'Дизайнер' :
                       member.role === 'tester' ? 'Тестировщик' :
                       member.role === 'manager' ? 'Менеджер' : member.role}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recommendations */}
          {isManager && (
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-emerald-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                  AI Рекомендации
                </h3>
                <button
                  onClick={loadRecommendations}
                  disabled={loadingRecommendations}
                  className="text-emerald-600 hover:text-emerald-700 text-sm font-medium disabled:opacity-50 flex items-center gap-1"
                >
                  {loadingRecommendations && (
                    <span className="w-4 h-4 border-2 border-emerald-200 border-t-emerald-500 rounded-full animate-spin" />
                  )}
                  {loadingRecommendations ? 'Анализ...' : 'Обновить'}
                </button>
              </div>
              
              {loadingRecommendations ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin mb-4" />
                  <p className="text-gray-500">Анализ навыков...</p>
                </div>
              ) : recommendations.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Cpu className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-gray-500">
                    {project.technicalSpec 
                      ? 'Нет подходящих кандидатов'
                      : 'Добавьте ТЗ для анализа'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recommendations.map((rec, index) => (
                    <div 
                      key={rec.user.id} 
                      className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100 animate-fadeIn"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white font-medium shadow-md">
                            {rec.user.firstName[0]}{rec.user.lastName[0]}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">
                              {rec.user.firstName} {rec.user.lastName}
                            </p>
                            <p className="text-sm text-gray-500">{rec.user.role}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-purple-600">{Math.round(rec.score)}%</p>
                          <p className="text-xs text-gray-400">совпадение</p>
                        </div>
                      </div>
                      
                      <div className="mt-3 flex flex-wrap gap-1">
                        {rec.matchingSkills.map(skill => (
                          <span key={skill} className="px-2 py-1 bg-white text-purple-700 rounded-full text-xs border border-purple-200">
                            {skill}
                          </span>
                        ))}
                      </div>
                      
                      <div className="mt-3 flex items-center justify-between">
                        <span className={`text-sm flex items-center gap-1 ${
                          rec.currentLoad < 50 ? 'text-emerald-600' :
                          rec.currentLoad < 80 ? 'text-amber-600' :
                          'text-red-600'
                        }`}>
                          <div className={`w-2 h-2 rounded-full ${
                            rec.currentLoad < 50 ? 'bg-emerald-500' :
                            rec.currentLoad < 80 ? 'bg-amber-500' :
                            'bg-red-500'
                          }`} />
                          Загрузка: {rec.currentLoad}%
                        </span>
                        <button
                          onClick={() => handleAssignEmployee(rec.user.id, `${rec.user.firstName} ${rec.user.lastName}`)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-purple-500 text-white text-sm font-medium rounded-lg hover:bg-purple-600 transition-all active:scale-95"
                        >
                          <UserPlus className="w-4 h-4" />
                          Назначить
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Create Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-scaleIn">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-500" />
                Новая задача
              </h3>
              <button 
                onClick={() => setShowTaskModal(false)} 
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Название *</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={e => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                  placeholder="Введите название задачи"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
                <textarea
                  value={newTask.description}
                  onChange={e => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all resize-none"
                  rows={3}
                  placeholder="Опишите задачу"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Исполнитель *</label>
                  <select
                    value={newTask.assigneeId}
                    onChange={e => setNewTask(prev => ({ ...prev, assigneeId: Number(e.target.value) }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all bg-white cursor-pointer"
                  >
                    <option value={0}>Выберите</option>
                    {project.team.map(member => (
                      <option key={member.id} value={member.id}>
                        {member.firstName} {member.lastName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Этап</label>
                  <select
                    value={newTask.stageId}
                    onChange={e => setNewTask(prev => ({ ...prev, stageId: Number(e.target.value) }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all bg-white cursor-pointer"
                  >
                    <option value={0}>Без этапа</option>
                    {project.roadmap.map(stage => (
                      <option key={stage.id} value={stage.id}>{stage.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Приоритет</label>
                  <select
                    value={newTask.priority}
                    onChange={e => setNewTask(prev => ({ ...prev, priority: e.target.value as any }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all bg-white cursor-pointer"
                  >
                    <option value="low">Низкий</option>
                    <option value="medium">Средний</option>
                    <option value="high">Высокий</option>
                    <option value="critical">Критично</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Часы</label>
                  <input
                    type="number"
                    value={newTask.plannedHours}
                    onChange={e => setNewTask(prev => ({ ...prev, plannedHours: Number(e.target.value) }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                    min={1}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Дедлайн</label>
                  <input
                    type="date"
                    value={newTask.dueDate}
                    onChange={e => setNewTask(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
              <button
                onClick={() => setShowTaskModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={handleCreateTask}
                disabled={!newTask.title || !newTask.assigneeId}
                className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium rounded-xl disabled:opacity-50 transition-all hover:shadow-lg active:scale-95"
              >
                Создать
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
