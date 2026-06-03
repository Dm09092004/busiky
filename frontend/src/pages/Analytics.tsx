import { useState } from 'react';
import { useData } from '../context/DataContext';
import { 
  TrendingUp, 
  TrendingDown,
  BarChart3,
  PieChart,
  Users,
  Clock,
  Target,
  Award,
} from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement } from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement);

export default function Analytics() {
  const { projects, getProjectAnalytics } = useData();
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);

  const completedProjects = projects.filter(p => p.status === 'completed');
  const analytics = selectedProjectId ? getProjectAnalytics(selectedProjectId) : null;

  // Общая статистика
  const totalPlanned = projects.reduce((sum, p) => sum + p.plannedHours, 0);
  const totalActual = projects.reduce((sum, p) => sum + p.actualHours, 0);
  const avgEfficiency = completedProjects.length > 0
    ? completedProjects.reduce((sum, p) => sum + (p.actualHours > 0 ? (p.plannedHours / p.actualHours) * 100 : 0), 0) / completedProjects.length
    : 0;

  // Данные для графиков
  const projectComparisonData = {
    labels: projects.slice(0, 6).map(p => p.name.substring(0, 12) + (p.name.length > 12 ? '...' : '')),
    datasets: [
      {
        label: 'План (часы)',
        data: projects.slice(0, 6).map(p => p.plannedHours),
        backgroundColor: 'rgba(16, 185, 129, 0.6)',
        borderColor: '#10b981',
        borderWidth: 1,
      },
      {
        label: 'Факт (часы)',
        data: projects.slice(0, 6).map(p => p.actualHours),
        backgroundColor: 'rgba(99, 102, 241, 0.6)',
        borderColor: '#6366f1',
        borderWidth: 1,
      },
    ],
  };

  const statusDistributionData = {
    labels: ['Планирование', 'В работе', 'Завершены', 'На паузе'],
    datasets: [{
      data: [
        projects.filter(p => p.status === 'planning').length,
        projects.filter(p => p.status === 'in_progress').length,
        projects.filter(p => p.status === 'completed').length,
        projects.filter(p => p.status === 'on_hold').length,
      ],
      backgroundColor: ['#f59e0b', '#10b981', '#6366f1', '#ef4444'],
      borderWidth: 0,
    }],
  };

  const efficiencyTrendData = {
    labels: completedProjects.map(p => p.name.substring(0, 8) + '..'),
    datasets: [{
      label: 'Эффективность (%)',
      data: completedProjects.map(p => p.actualHours > 0 ? Math.round((p.plannedHours / p.actualHours) * 100) : 0),
      borderColor: '#10b981',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      fill: true,
      tension: 0.4,
    }],
  };

  const stageComparisonData = analytics ? {
    labels: analytics.stageComparison.map(s => s.stageName.substring(0, 10)),
    datasets: [
      {
        label: 'План',
        data: analytics.stageComparison.map(s => s.planned),
        backgroundColor: 'rgba(16, 185, 129, 0.6)',
      },
      {
        label: 'Факт',
        data: analytics.stageComparison.map(s => s.actual),
        backgroundColor: 'rgba(99, 102, 241, 0.6)',
      },
    ],
  } : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Аналитика</h1>
          <p className="text-gray-500 mt-1">Статистика и анализ эффективности проектов</p>
        </div>
        <select
          value={selectedProjectId || ''}
          onChange={(e) => setSelectedProjectId(e.target.value ? Number(e.target.value) : null)}
          className="px-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none bg-white"
        >
          <option value="">Все проекты</option>
          {projects.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-emerald-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Всего часов (план)</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">{totalPlanned}</p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-100">
              <Clock className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-emerald-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Всего часов (факт)</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">{Math.round(totalActual)}</p>
            </div>
            <div className="p-3 rounded-xl bg-blue-100">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-emerald-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Средняя эффективность</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">{Math.round(avgEfficiency)}%</p>
            </div>
            <div className={`p-3 rounded-xl ${avgEfficiency >= 100 ? 'bg-emerald-100' : 'bg-orange-100'}`}>
              {avgEfficiency >= 100 ? (
                <TrendingUp className="w-6 h-6 text-emerald-600" />
              ) : (
                <TrendingDown className="w-6 h-6 text-orange-600" />
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-emerald-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Завершено проектов</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">{completedProjects.length}</p>
            </div>
            <div className="p-3 rounded-xl bg-indigo-100">
              <Award className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Distribution */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-emerald-100">
          <div className="flex items-center gap-2 mb-4">
            <PieChart className="w-5 h-5 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-800">Распределение по статусам</h3>
          </div>
          <div className="h-64 flex items-center justify-center">
            <Doughnut 
              data={statusDistributionData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: { padding: 16, usePointStyle: true },
                  },
                },
                cutout: '60%',
              }}
            />
          </div>
        </div>

        {/* Project Comparison */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-lg border border-emerald-100">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-800">Сравнение план/факт по проектам</h3>
          </div>
          <div className="h-64">
            <Bar
              data={projectComparisonData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'top' },
                },
                scales: {
                  y: { beginAtZero: true },
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* Efficiency Trend */}
      {completedProjects.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-emerald-100">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-800">Тренд эффективности по завершённым проектам</h3>
          </div>
          <div className="h-64">
            <Line
              data={efficiencyTrendData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                },
                scales: {
                  y: { 
                    beginAtZero: true,
                    max: 150,
                    ticks: { callback: (value) => value + '%' },
                  },
                },
              }}
            />
          </div>
          <div className="mt-4 flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-emerald-500 rounded-full" />
              <span className="text-gray-600">≥100% — в срок или раньше</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full" />
              <span className="text-gray-600">&lt;100% — превышение часов</span>
            </div>
          </div>
        </div>
      )}

      {/* Selected Project Analytics */}
      {analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Stage Comparison */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-emerald-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Анализ этапов: {analytics.projectName}
            </h3>
            {stageComparisonData && analytics.stageComparison.length > 0 ? (
              <div className="h-64">
                <Bar
                  data={stageComparisonData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'top' } },
                    scales: { y: { beginAtZero: true } },
                  }}
                />
              </div>
            ) : (
              <p className="text-gray-500 text-center py-12">Нет данных по этапам</p>
            )}
          </div>

          {/* Team Performance */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-emerald-100">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-800">Производительность команды</h3>
            </div>
            {analytics.teamPerformance.length > 0 ? (
              <div className="space-y-4">
                {analytics.teamPerformance.map((member, i) => (
                  <div key={i} className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-800">{member.userName}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        member.efficiency >= 100 ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                        {member.efficiency}%
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Задач завершено:</span>
                        <span className="ml-2 font-medium">{member.tasksCompleted}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Часов:</span>
                        <span className="ml-2 font-medium">{member.hoursWorked}ч</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-12">Нет данных по команде</p>
            )}
          </div>
        </div>
      )}

      {/* Insights */}
      <div className="bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl p-6 shadow-xl text-white">
        <h3 className="text-lg font-semibold mb-4">📊 Ключевые выводы</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/10 rounded-xl p-4">
            <p className="text-sm opacity-80">Соотношение план/факт</p>
            <p className="text-2xl font-bold mt-1">
              {totalActual > 0 ? Math.round((totalPlanned / totalActual) * 100) : 0}%
            </p>
            <p className="text-sm opacity-80 mt-2">
              {totalActual <= totalPlanned 
                ? '✅ Укладываемся в план' 
                : '⚠️ Есть превышение часов'}
            </p>
          </div>
          <div className="bg-white/10 rounded-xl p-4">
            <p className="text-sm opacity-80">Активных проектов</p>
            <p className="text-2xl font-bold mt-1">
              {projects.filter(p => p.status === 'in_progress').length}
            </p>
            <p className="text-sm opacity-80 mt-2">
              из {projects.length} всего
            </p>
          </div>
          <div className="bg-white/10 rounded-xl p-4">
            <p className="text-sm opacity-80">Рекомендация</p>
            <p className="text-lg font-medium mt-1">
              {avgEfficiency >= 100 
                ? '🎉 Команда работает эффективно!' 
                : avgEfficiency >= 80 
                  ? '💪 Есть потенциал для улучшения'
                  : '📋 Рекомендуем пересмотреть оценки'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
