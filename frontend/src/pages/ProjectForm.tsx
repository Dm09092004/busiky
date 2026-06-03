import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { ArrowLeft, Save, Sparkles } from 'lucide-react';
import { ProjectComplexity } from '../types';

export default function ProjectForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getProject, createProject, updateProject } = useData();
  
  const isEditing = !!id;
  const existingProject = isEditing ? getProject(Number(id)) : null;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    client: '',
    technicalSpec: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    plannedHours: 0,
    budget: 0,
    complexity: 'medium' as ProjectComplexity,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [analyzingSpec, setAnalyzingSpec] = useState(false);

  useEffect(() => {
    if (existingProject) {
      setFormData({
        name: existingProject.name,
        description: existingProject.description,
        client: existingProject.client,
        technicalSpec: existingProject.technicalSpec || '',
        startDate: existingProject.startDate,
        endDate: existingProject.endDate,
        plannedHours: existingProject.plannedHours,
        budget: existingProject.budget,
        complexity: existingProject.complexity,
      });
    }
  }, [existingProject]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'plannedHours' || name === 'budget' ? Number(value) : value,
    }));
  };

  const analyzeComplexity = async () => {
    if (!formData.technicalSpec) return;
    
    setAnalyzingSpec(true);
    await new Promise(r => setTimeout(r, 800));
    
    const spec = formData.technicalSpec.toLowerCase();
    let complexity: ProjectComplexity = 'medium';
    let hours = 160;

    // Простая эвристика анализа сложности
    const keywords = {
      high: ['интеграция', '1с', 'платеж', 'api', 'безопасност', 'шифрован'],
      very_high: ['микросервис', 'высоконагруж', 'realtime', 'machine learning', 'блокчейн'],
      low: ['лендинг', 'визитка', 'простой', 'статич'],
    };

    if (keywords.very_high.some(k => spec.includes(k))) {
      complexity = 'very_high';
      hours = 500;
    } else if (keywords.high.some(k => spec.includes(k))) {
      complexity = 'high';
      hours = 320;
    } else if (keywords.low.some(k => spec.includes(k))) {
      complexity = 'low';
      hours = 80;
    }

    // Корректировка по длине ТЗ
    if (spec.length > 500) hours += 80;
    if (spec.length > 1000) hours += 120;

    setFormData(prev => ({
      ...prev,
      complexity,
      plannedHours: hours,
    }));
    
    setAnalyzingSpec(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isEditing) {
        await updateProject(Number(id), formData);
        navigate(`/projects/${id}`);
      } else {
        const newProject = await createProject(formData);
        navigate(`/projects/${newProject.id}`);
      }
    } catch (error) {
      console.error('Error saving project:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const complexityLabels = {
    low: 'Низкая',
    medium: 'Средняя',
    high: 'Высокая',
    very_high: 'Очень высокая',
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">
          {isEditing ? 'Редактирование проекта' : 'Новый проект'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-emerald-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Основная информация</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Название проекта *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                placeholder="Интернет-магазин ТехноМир"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Клиент *
              </label>
              <input
                type="text"
                name="client"
                value={formData.client}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                placeholder="ООО ТехноМир"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Описание
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all resize-none"
                rows={3}
                placeholder="Краткое описание проекта"
              />
            </div>
          </div>
        </div>

        {/* Technical Specification */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-emerald-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Техническое задание</h3>
            <button
              type="button"
              onClick={analyzeComplexity}
              disabled={!formData.technicalSpec || analyzingSpec}
              className="flex items-center gap-2 px-4 py-2 text-emerald-600 hover:bg-emerald-50 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {analyzingSpec ? (
                <span className="w-5 h-5 border-2 border-emerald-200 border-t-emerald-500 rounded-full animate-spin" />
              ) : (
                <Sparkles className="w-5 h-5" />
              )}
              Анализировать сложность
            </button>
          </div>
          
          <textarea
            name="technicalSpec"
            value={formData.technicalSpec}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all resize-none"
            rows={8}
            placeholder="Опишите требования к проекту: функционал, технологии, интеграции..."
          />
          <p className="text-sm text-gray-400 mt-2">
            💡 Подробное ТЗ поможет автоматически определить сложность и сгенерировать дорожную карту
          </p>
        </div>

        {/* Project Parameters */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-emerald-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Параметры проекта</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Дата начала *
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Дата окончания *
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Плановые часы
              </label>
              <input
                type="number"
                name="plannedHours"
                value={formData.plannedHours}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                min={0}
                placeholder="160"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Бюджет (₽)
              </label>
              <input
                type="number"
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                min={0}
                step={1000}
                placeholder="500000"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Сложность проекта
              </label>
              <div className="grid grid-cols-4 gap-2">
                {Object.entries(complexityLabels).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, complexity: key as ProjectComplexity }))}
                    className={`px-4 py-3 rounded-xl border-2 font-medium transition-all ${
                      formData.complexity === key
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium"
          >
            Отмена
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-200 hover:shadow-xl transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            {isEditing ? 'Сохранить' : 'Создать проект'}
          </button>
        </div>
      </form>
    </div>
  );
}
