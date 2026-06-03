import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (data: RegisterData) => Promise<boolean>;
  updateProfile: (data: Partial<User>) => void;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Демо-пользователи для тестирования
const demoUsers: User[] = [
  {
    id: 1,
    username: 'manager',
    email: 'manager@studiokit.ru',
    firstName: 'Иван',
    lastName: 'Петров',
    role: 'manager',
    workStart: '09:00',
    workEnd: '18:00',
    lunchStart: '13:00',
    lunchEnd: '14:00',
    skills: [],
  },
  {
    id: 2,
    username: 'developer',
    email: 'dev@studiokit.ru',
    firstName: 'Алексей',
    lastName: 'Сидоров',
    role: 'developer',
    workStart: '10:00',
    workEnd: '19:00',
    lunchStart: '13:00',
    lunchEnd: '14:00',
    skills: [
      { id: 1, skill: { id: 1, name: 'React', category: 'Frontend' }, level: 5 },
      { id: 2, skill: { id: 2, name: 'TypeScript', category: 'Frontend' }, level: 4 },
      { id: 3, skill: { id: 3, name: 'Python', category: 'Backend' }, level: 3 },
    ],
  },
  {
    id: 3,
    username: 'designer',
    email: 'designer@studiokit.ru',
    firstName: 'Мария',
    lastName: 'Козлова',
    role: 'designer',
    workStart: '09:00',
    workEnd: '18:00',
    lunchStart: '12:00',
    lunchEnd: '13:00',
    skills: [
      { id: 4, skill: { id: 4, name: 'Figma', category: 'Design' }, level: 5 },
      { id: 5, skill: { id: 5, name: 'UI/UX', category: 'Design' }, level: 5 },
    ],
  },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Проверяем сохранённую сессию
    const savedUser = localStorage.getItem('studiokit_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    // Имитация API запроса
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const foundUser = demoUsers.find(u => u.username === username);
    if (foundUser && password === 'demo123') {
      setUser(foundUser);
      localStorage.setItem('studiokit_user', JSON.stringify(foundUser));
      localStorage.setItem('studiokit_token', 'demo_jwt_token_' + foundUser.id);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('studiokit_user');
    localStorage.removeItem('studiokit_token');
  };

  const register = async (data: RegisterData): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newUser: User = {
      id: Date.now(),
      username: data.username,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role as any,
      workStart: '09:00',
      workEnd: '18:00',
      lunchStart: '13:00',
      lunchEnd: '14:00',
      skills: [],
    };
    
    setUser(newUser);
    localStorage.setItem('studiokit_user', JSON.stringify(newUser));
    localStorage.setItem('studiokit_token', 'demo_jwt_token_' + newUser.id);
    return true;
  };

  const updateProfile = (data: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      localStorage.setItem('studiokit_user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout,
      register,
      updateProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
