import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { 
  FolderKanban, 
  Users, 
  TrendingUp, 
  Clock,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Activity,
  Plus,
  Zap,
  Target,
} from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function Dashboard() {
  const { getDashboardStats, projects } = useData();
  const { user } = useAuth();
  const [stats, setStats] = useState(getDashboardStats());

  useEffect(() => {
    setStats(getDashboardStats());
  }, [projects]);

  const statusColors = {
    'Планирование': '#f59e0b',
    'В работе': '#10b981',
    'Завершены': '#6366f1',
    'На паузе': '#ef4444',
  };

  const doughnutData = {
    labels: stats.projectsByStatus.map(s => s.status),
    datasets: [{
      data: stats.projectsByStatus.map(s => s.count),
      backgroundColor: stats.projectsByStatus.map(s => statusColors[s.status as keyof typeof statusColors] || '#94a3b8'),
      borderWidth: 0,
    }],
  };

  const barData = {
    labels: projects.slice(0, 5).map(p => p.name.substring(0, 15) + (p.name.length > 15 ? '...' : '')),
    datasets: [
      {
        label: 'План (ч)',
        data: projects.slice(0, 5).map(p => p.plannedHours),
        backgroundColor: 'rgba(16, 185, 129, 0.5)',
        borderColor: '#10b981',
        borderWidth: 1,
      },
      {
        label: 'Факт (ч)',
        data: projects.slice(0, 5).map(p => p.actualHours),
        backgroundColor: 'rgba(99, 102, 241, 0.5)',
        borderColor: '#6366f1',
        borderWidth: 1,
      },
    ],
  };

  const StatCard = ({ title, value, subtitle, icon: Icon, gradient, trend }: any) => (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-emerald-100 card-hover animate-fadeIn">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">{value}</p>
          {subtitle && <p className="text-sm text-gray-400 mt-1">{subtitle}</p>}
          {trend !== undefined && (
            <p className={`text-sm mt-2 flex items-center gap-1 ${trend > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
              <TrendingUp className={`w-4 h-4 ${trend < 0 ? 'rotate-180' : ''}`} />
              {Math.abs(trend)}% vs прошлый месяц
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fadeIn">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            Добро пожаловать, {user?.firstName}!
            <span className="text-2xl">👋</span>
          </h1>
          <p className="text-gray-500 mt-1">
            Вот обзор ваших проектов на сегодня
          </p>
        </div>
        <Link
          to="/projects/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium rounded-xl shadow-lg shadow-emerald-200 hover:shadow-xl transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Новый проект
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div style={{ animationDelay: '0.1s' }}>
          <StatCard
            title="Активные проекты"
            value={stats.activeProjects}
            icon={FolderKanban}
            gradient="from-emerald-400 to-teal-500"
            trend={12}
          />
        </div>
        <div style={{ animationDelay: '0.2s' }}>
          <StatCard
            title="Завершено проектов"
            value={stats.completedProjects}
            icon={CheckCircle2}
            gradient="from-indigo-400 to-purple-500"
          />
        </div>
        <div style={{ animationDelay: '0.3s' }}>
          <StatCard
            title="Сотрудников"
            value={stats.totalEmployees}
            icon={Users}
            gradient="from-orange-400 to-pink-500"
          />
        </div>
        <div style={{ animationDelay: '0.4s' }}>
          <StatCard
            title="Эффективность"
            value={`${stats.avgEfficiency}%`}
            subtitle="средняя по проектам"
            icon={Zap}
            gradient="from-cyan-400 to-blue-500"
          />
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project Status Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-emerald-100 animate-fadeIn card-hover" style={{ animationDelay: '0.5s' }}>
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-gray-400" />
            Статус проектов
          </h3>
          <div className="h-64 flex items-center justify-center">
            <Doughnut 
              data={doughnutData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: {
                      padding: 16,
                      usePointStyle: true,
                    },
                  },
                },
                cutout: '60%',
              }}
            />
          </div>
        </div>

        {/* Hours Comparison Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-lg border border-emerald-100 animate-fadeIn card-hover" style={{ animationDelay: '0.6s' }}>
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-gray-400" />
            План vs Факт (часы)
          </h3>
          <div className="h-64">
            <Bar
              data={barData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Deadlines */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-emerald-100 animate-fadeIn card-hover" style={{ animationDelay: '0.7s' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-400" />
              Ближайшие дедлайны
            </h3>
          </div>
          <div className="space-y-3">
            {stats.upcomingDeadlines.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Calendar className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-gray-400">Нет предстоящих дедлайнов</p>
              </div>
            ) : (
              stats.upcomingDeadlines.map((item, i) => (
                <div 
                  key={i}
                  className={`flex items-center justify-between p-4 rounded-xl transition-all animate-fadeIn ${
                    item.daysLeft <= 3 ? 'bg-red-50 border border-red-100' : 
                    item.daysLeft <= 7 ? 'bg-amber-50 border border-amber-100' : 
                    'bg-gray-50 border border-gray-100'
                  }`}
                  style={{ animationDelay: `${0.8 + i * 0.1}s` }}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      item.daysLeft <= 3 ? 'bg-red-100' : 
                      item.daysLeft <= 7 ? 'bg-amber-100' : 
                      'bg-gray-200'
                    }`}>
                      <AlertCircle className={`w-5 h-5 ${
                        item.daysLeft <= 3 ? 'text-red-500' : 
                        item.daysLeft <= 7 ? 'text-amber-500' : 
                        'text-gray-400'
                      }`} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{item.projectName}</p>
                      <p className="text-sm text-gray-500">{item.deadline}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    item.daysLeft <= 3 ? 'bg-red-100 text-red-700' : 
                    item.daysLeft <= 7 ? 'bg-amber-100 text-amber-700' : 
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {item.daysLeft} дн.
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-emerald-100 animate-fadeIn card-hover" style={{ animationDelay: '0.8s' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Activity className="w-5 h-5 text-gray-400" />
              Последние действия
            </h3>
          </div>
          <div className="space-y-4">
            {stats.recentActivity.map((activity, index) => (
              <div 
                key={activity.id} 
                className="flex items-start gap-3 animate-fadeIn"
                style={{ animationDelay: `${0.9 + index * 0.1}s` }}
              >
                <div className={`p-2 rounded-lg ${
                  activity.type === 'task_completed' ? 'bg-emerald-100 text-emerald-600' :
                  activity.type === 'project_created' ? 'bg-blue-100 text-blue-600' :
                  'bg-purple-100 text-purple-600'
                }`}>
                  {activity.type === 'task_completed' ? <CheckCircle2 className="w-4 h-4" /> :
                   activity.type === 'project_created' ? <FolderKanban className="w-4 h-4" /> :
                   <Users className="w-4 h-4" />}
                </div>
                <div className="flex-1">
                  <p className="text-gray-800">{activity.message}</p>
                  <p className="text-sm text-gray-400 flex items-center gap-1 mt-1">
                    <Clock className="w-3 h-3" />
                    {new Date(activity.timestamp).toLocaleDateString('ru-RU', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <Link
            to="/analytics"
            className="mt-4 flex items-center justify-center gap-2 w-full py-3 text-emerald-600 hover:text-emerald-700 font-medium rounded-xl hover:bg-emerald-50 transition-colors"
          >
            Смотреть всю аналитику
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Quick Tips */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-6 shadow-xl text-white animate-fadeIn" style={{ animationDelay: '1s' }}>
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white/20 rounded-xl">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Совет дня</h3>
            <p className="text-emerald-100 mt-1">
              Используйте технику Помодоро для повышения продуктивности: 45 минут работы, 5 минут отдыха. 
              После 4 циклов — длинный перерыв 15 минут.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
