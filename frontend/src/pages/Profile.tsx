import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  User, 
  Mail, 
  Clock, 
  Save,
  Edit2,
  Plus,
  X,
  Star,
} from 'lucide-react';

const availableSkills = [
  { id: 1, name: 'React', category: 'Frontend' },
  { id: 2, name: 'TypeScript', category: 'Frontend' },
  { id: 3, name: 'Vue.js', category: 'Frontend' },
  { id: 4, name: 'CSS/SCSS', category: 'Frontend' },
  { id: 5, name: 'Python', category: 'Backend' },
  { id: 6, name: 'Django', category: 'Backend' },
  { id: 7, name: 'Node.js', category: 'Backend' },
  { id: 8, name: 'PostgreSQL', category: 'Database' },
  { id: 9, name: 'MongoDB', category: 'Database' },
  { id: 10, name: 'Figma', category: 'Design' },
  { id: 11, name: 'UI/UX', category: 'Design' },
  { id: 12, name: 'Photoshop', category: 'Design' },
  { id: 13, name: 'Manual Testing', category: 'QA' },
  { id: 14, name: 'Selenium', category: 'QA' },
  { id: 15, name: 'Git', category: 'Tools' },
  { id: 16, name: 'Docker', category: 'Tools' },
];

export default function Profile() {
  const { user, updateProfile } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [showSkillModal, setShowSkillModal] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    workStart: user?.workStart || '09:00',
    workEnd: user?.workEnd || '18:00',
    lunchStart: user?.lunchStart || '13:00',
    lunchEnd: user?.lunchEnd || '14:00',
  });
  const [skills, setSkills] = useState(user?.skills || []);
  const [newSkillId, setNewSkillId] = useState<number | null>(null);
  const [newSkillLevel, setNewSkillLevel] = useState(3);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = () => {
    updateProfile({ ...formData, skills });
    setIsEditing(false);
  };

  const handleAddSkill = () => {
    if (!newSkillId) return;
    
    const skill = availableSkills.find(s => s.id === newSkillId);
    if (!skill || skills.some(s => s.skill.id === newSkillId)) return;

    setSkills(prev => [...prev, {
      id: Date.now(),
      skill,
      level: newSkillLevel,
    }]);
    setShowSkillModal(false);
    setNewSkillId(null);
    setNewSkillLevel(3);
  };

  const handleRemoveSkill = (skillId: number) => {
    setSkills(prev => prev.filter(s => s.id !== skillId));
  };

  const handleSkillLevelChange = (skillId: number, level: number) => {
    setSkills(prev => prev.map(s => 
      s.id === skillId ? { ...s, level } : s
    ));
  };

  const roleLabels: Record<string, string> = {
    manager: 'Менеджер проектов',
    developer: 'Разработчик',
    designer: 'Дизайнер',
    tester: 'Тестировщик',
    analyst: 'Аналитик',
  };

  const roleIcons: Record<string, string> = {
    manager: '👔',
    developer: '💻',
    designer: '🎨',
    tester: '🔍',
    analyst: '📊',
  };

  const skillCategories = [...new Set(skills.map(s => s.skill.category))];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Card */}
      <div className="bg-gradient-to-br from-emerald-500 to-teal-500 rounded-3xl p-8 shadow-xl text-white">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="w-24 h-24 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-4xl font-bold">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div className="text-center sm:text-left">
            <h1 className="text-3xl font-bold">
              {user?.firstName} {user?.lastName}
            </h1>
            <p className="text-emerald-100 mt-1 flex items-center justify-center sm:justify-start gap-2">
              <span className="text-2xl">{roleIcons[user?.role || 'developer']}</span>
              {roleLabels[user?.role || 'developer']}
            </p>
            <p className="text-emerald-100 mt-2 text-sm">@{user?.username}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Info */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-emerald-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Личная информация</h3>
            <button
              onClick={() => isEditing ? handleSave() : setIsEditing(true)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium ${
                isEditing 
                  ? 'bg-emerald-500 text-white hover:bg-emerald-600' 
                  : 'text-emerald-600 hover:bg-emerald-50'
              }`}
            >
              {isEditing ? (
                <>
                  <Save className="w-4 h-4" />
                  Сохранить
                </>
              ) : (
                <>
                  <Edit2 className="w-4 h-4" />
                  Редактировать
                </>
              )}
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-500 mb-1">Имя</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                  />
                ) : (
                  <p className="font-medium text-gray-800 flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    {user?.firstName}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Фамилия</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                  />
                ) : (
                  <p className="font-medium text-gray-800">{user?.lastName}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-500 mb-1">Email</label>
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                />
              ) : (
                <p className="font-medium text-gray-800 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  {user?.email}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Work Schedule */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-emerald-100">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-800">Рабочее расписание</h3>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-500 mb-1">Начало работы</label>
                {isEditing ? (
                  <input
                    type="time"
                    name="workStart"
                    value={formData.workStart}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                  />
                ) : (
                  <p className="font-medium text-gray-800">{user?.workStart}</p>
                )}
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Конец работы</label>
                {isEditing ? (
                  <input
                    type="time"
                    name="workEnd"
                    value={formData.workEnd}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                  />
                ) : (
                  <p className="font-medium text-gray-800">{user?.workEnd}</p>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-500 mb-3">Обеденный перерыв</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Начало</label>
                  {isEditing ? (
                    <input
                      type="time"
                      name="lunchStart"
                      value={formData.lunchStart}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                    />
                  ) : (
                    <p className="font-medium text-gray-800">{user?.lunchStart}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Конец</label>
                  {isEditing ? (
                    <input
                      type="time"
                      name="lunchEnd"
                      value={formData.lunchEnd}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                    />
                  ) : (
                    <p className="font-medium text-gray-800">{user?.lunchEnd}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Skills */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-emerald-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-800">Навыки</h3>
          </div>
          <button
            onClick={() => setShowSkillModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-emerald-600 hover:bg-emerald-50 rounded-xl font-medium"
          >
            <Plus className="w-4 h-4" />
            Добавить навык
          </button>
        </div>

        {skills.length === 0 ? (
          <div className="text-center py-8">
            <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Навыки ещё не добавлены</p>
            <p className="text-sm text-gray-400 mt-1">Добавьте навыки для улучшения рекомендаций</p>
          </div>
        ) : (
          <div className="space-y-6">
            {skillCategories.map(category => (
              <div key={category}>
                <h4 className="text-sm font-medium text-gray-500 mb-3">{category}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {skills.filter(s => s.skill.category === category).map(skill => (
                    <div 
                      key={skill.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl group"
                    >
                      <div>
                        <p className="font-medium text-gray-800">{skill.skill.name}</p>
                        <div className="flex items-center gap-1 mt-1">
                          {[1, 2, 3, 4, 5].map(level => (
                            <button
                              key={level}
                              onClick={() => handleSkillLevelChange(skill.id, level)}
                              className={`w-5 h-5 rounded-full transition-colors ${
                                level <= skill.level 
                                  ? 'bg-emerald-500' 
                                  : 'bg-gray-200 hover:bg-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveSkill(skill.id)}
                        className="p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Skill Modal */}
      {showSkillModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">Добавить навык</h3>
              <button onClick={() => setShowSkillModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Навык</label>
                <select
                  value={newSkillId || ''}
                  onChange={e => setNewSkillId(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none bg-white"
                >
                  <option value="">Выберите навык</option>
                  {availableSkills
                    .filter(s => !skills.some(us => us.skill.id === s.id))
                    .map(skill => (
                      <option key={skill.id} value={skill.id}>
                        {skill.name} ({skill.category})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Уровень владения: {newSkillLevel}/5
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map(level => (
                    <button
                      key={level}
                      onClick={() => setNewSkillLevel(level)}
                      className={`w-10 h-10 rounded-full font-medium transition-colors ${
                        level <= newSkillLevel 
                          ? 'bg-emerald-500 text-white' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
                <p className="text-sm text-gray-400 mt-2">
                  {newSkillLevel === 1 ? 'Начинающий' :
                   newSkillLevel === 2 ? 'Базовый' :
                   newSkillLevel === 3 ? 'Средний' :
                   newSkillLevel === 4 ? 'Продвинутый' : 'Эксперт'}
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-gray-100">
              <button
                onClick={() => setShowSkillModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Отмена
              </button>
              <button
                onClick={handleAddSkill}
                disabled={!newSkillId}
                className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium rounded-xl disabled:opacity-50"
              >
                Добавить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
