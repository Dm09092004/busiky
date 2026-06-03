import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Cat, Eye, EyeOff, LogIn, Briefcase, Code, Palette, Search } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const success = await login(username, password);
      if (success) {
        navigate('/dashboard');
      } else {
        setError('Неверный логин или пароль');
      }
    } catch (err) {
      setError('Ошибка подключения к серверу');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (role: string) => {
    setIsLoading(true);
    const success = await login(role, 'demo123');
    if (success) {
      navigate(role === 'manager' ? '/dashboard' : '/my-day');
    }
    setIsLoading(false);
  };

  const demoAccounts = [
    { role: 'manager', label: 'Менеджер', icon: Briefcase, color: 'from-emerald-500 to-teal-500', bgColor: 'bg-emerald-50', textColor: 'text-emerald-700' },
    { role: 'developer', label: 'Разработчик', icon: Code, color: 'from-blue-500 to-indigo-500', bgColor: 'bg-blue-50', textColor: 'text-blue-700' },
    { role: 'designer', label: 'Дизайнер', icon: Palette, color: 'from-purple-500 to-pink-500', bgColor: 'bg-purple-50', textColor: 'text-purple-700' },
    { role: 'tester', label: 'Тестировщик', icon: Search, color: 'from-orange-500 to-red-500', bgColor: 'bg-orange-50', textColor: 'text-orange-700' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center p-4">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-200 rounded-full opacity-30 animate-float" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-teal-200 rounded-full opacity-30 animate-float" style={{ animationDelay: '1s' }} />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8 animate-fadeIn">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-400 to-teal-500 shadow-xl shadow-emerald-200 mb-4 animate-float">
            <Cat className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gradient">
            Studio KIT
          </h1>
          <p className="text-gray-500 mt-2">Система управления проектами</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-emerald-100 animate-slideUp">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Вход в систему</h2>
          
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-center gap-2 animate-shake">
              <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <span className="text-red-500 text-xs font-bold">!</span>
              </div>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Логин
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                placeholder="Введите логин"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Пароль
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all pr-12"
                  placeholder="Введите пароль"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-200 hover:shadow-xl hover:shadow-emerald-300 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Войти
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <span className="text-gray-500 text-sm">Нет аккаунта?</span>{' '}
            <Link to="/register" className="text-emerald-600 hover:text-emerald-700 font-medium text-sm">
              Зарегистрироваться
            </Link>
          </div>
        </div>

        {/* Demo accounts */}
        <div className="mt-6 bg-white/80 backdrop-blur rounded-2xl p-6 border border-emerald-100 animate-fadeIn" style={{ animationDelay: '0.3s' }}>
          <p className="text-sm text-gray-500 text-center mb-4">
            Демо-аккаунты для тестирования:
          </p>
          <div className="grid grid-cols-2 gap-3">
            {demoAccounts.map((account, index) => (
              <button
                key={account.role}
                onClick={() => handleDemoLogin(account.role)}
                disabled={isLoading}
                className={`flex items-center gap-2 px-4 py-3 ${account.bgColor} ${account.textColor} rounded-xl hover:opacity-80 transition-all text-sm font-medium disabled:opacity-50 animate-fadeIn active:scale-95`}
                style={{ animationDelay: `${0.4 + index * 0.1}s` }}
              >
                <account.icon className="w-4 h-4" />
                {account.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400 text-center mt-4">
            Пароль для всех: demo123
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-400 text-xs mt-6 animate-fadeIn" style={{ animationDelay: '0.6s' }}>
          ООО "Студия КИТ" © 2024
        </p>
      </div>
    </div>
  );
}
