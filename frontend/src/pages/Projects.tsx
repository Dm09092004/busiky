import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { 
  Plus, 
  Search, 
  Filter,
  Calendar,
  Users,
  Clock,
  ChevronRight,
  MoreVertical,
  Trash2,
  Edit2,
} from 'lucide-react';
import { Project, ProjectStatus } from '../types';

const statusConfig: Record<ProjectStatus, { label: string; color: string; bg: string }> = {
  planning: { label: 'Планирование', color: 'text-amber-700', bg: 'bg-amber-100' },
  in_progress: { label: 'В работе', color: 'text-emerald-700', bg: 'bg-emerald-100' },
  on_hold: { label: 'На паузе', color: 'text-red-700', bg: 'bg-red-100' },
  completed: { label: 'Завершён', color: 'text-indigo-700', bg: 'bg-indigo-100' },
  cancelled: { label: 'Отменён', color: 'text-gray-700', bg: 'bg-gray-100' },
};

const complexityConfig = {
  low: { label: 'Низкая', color: 'text-green-600' },
  medium: { label: 'Средняя', color: 'text-yellow-600' },
  high: { label: 'Высокая', color: 'text-orange-600' },
  very_high: { label: 'Очень высокая', color: 'text-red-600' },
};

export default function Projects() {
  const { projects, deleteProject } = useData();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all');
  const [menuOpen, setMenuOpen] = useState<number | null>(null);

  const isManager = user?.role === 'manager';

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.client.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = async (id: number) => {
    if (confirm('Вы уверены, что хотите удалить этот проект?')) {
      await deleteProject(id);
    }
    setMenuOpen(null);
  };

  const ProjectCard = ({ project }: { project: Project }) => {
    const status = statusConfig[project.status];
    const complexity = complexityConfig[project.complexity];
    const progress = project.plannedHours > 0 
      ? Math.min(100, Math.round((project.actualHours / project.plannedHours) * 100))
      : 0;

    return (
      <div className="bg-white rounded-2xl shadow-lg border border-emerald-100 hover:shadow-xl transition-all group">
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                  {status.label}
                </span>
                <span className={`text-xs font-medium ${complexity.color}`}>
                  {complexity.label} сложность
                </span>
              </div>
              <Link to={`/projects/${project.id}`}>
                <h3 className="text-lg font-semibold text-gray-800 hover:text-emerald-600 transition-colors">
                  {project.name}
                </h3>
              </Link>
              <p className="text-sm text-gray-500 mt-1">{project.client}</p>
            </div>
            {isManager && (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(menuOpen === project.id ? null : project.id)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <MoreVertical className="w-5 h-5" />
                </button>
                {menuOpen === project.id && (
                  <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-10">
                    <Link
                      to={`/projects/${project.id}/edit`}
                      className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50"
                    >
                      <Edit2 className="w-4 h-4" />
                      Редактировать
                    </Link>
                    <button
                      onClick={() => handleDelete(project.id)}
                      className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 w-full"
                    >
                      <Trash2 className="w-4 h-4" />
                      Удалить
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <p className="text-sm text-gray-600 mt-3 line-clamp-2">
            {project.description}
          </p>

          {/* Progress */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-500">Прогресс</span>
              <span className="font-medium text-gray-700">{progress}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${
                  progress >= 100 ? 'bg-red-400' : 'bg-gradient-to-r from-emerald-400 to-teal-500'
                }`}
                style={{ width: `${Math.min(100, progress)}%` }}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">
                {new Date(project.endDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">
                {Math.round(project.actualHours)}/{project.plannedHours}ч
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">
                {project.team.length} чел.
              </span>
            </div>
          </div>

          {/* Team avatars */}
          {project.team.length > 0 && (
            <div className="mt-4 flex items-center">
              <div className="flex -space-x-2">
                {project.team.slice(0, 4).map((member) => (
                  <div
                    key={member.id}
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xs font-medium border-2 border-white"
                    title={`${member.firstName} ${member.lastName}`}
                  >
                    {member.firstName[0]}{member.lastName[0]}
                  </div>
                ))}
                {project.team.length > 4 && (
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-xs font-medium border-2 border-white">
                    +{project.team.length - 4}
                  </div>
                )}
              </div>
            </div>
          )}

          <Link 
            to={`/projects/${project.id}`}
            className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 text-emerald-600 hover:text-emerald-700 font-medium rounded-xl hover:bg-emerald-50 transition-colors"
          >
            Открыть проект
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Проекты</h1>
          <p className="text-gray-500 mt-1">
            Всего {projects.length} проектов
          </p>
        </div>
        {isManager && (
          <Link
            to="/projects/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium rounded-xl shadow-lg shadow-emerald-200 hover:shadow-xl transition-all"
          >
            <Plus className="w-5 h-5" />
            Новый проект
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск по названию или клиенту..."
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ProjectStatus | 'all')}
            className="px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none bg-white"
          >
            <option value="all">Все статусы</option>
            {Object.entries(statusConfig).map(([key, value]) => (
              <option key={key} value={key}>{value.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-emerald-100">
          <div className="text-6xl mb-4">📁</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Проекты не найдены</h3>
          <p className="text-gray-500 mb-6">
            {searchQuery || statusFilter !== 'all' 
              ? 'Попробуйте изменить параметры поиска'
              : 'Создайте первый проект'}
          </p>
          {isManager && !searchQuery && statusFilter === 'all' && (
            <Link
              to="/projects/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium rounded-xl"
            >
              <Plus className="w-5 h-5" />
              Создать проект
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProjects.map(project => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
