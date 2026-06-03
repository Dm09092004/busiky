import { createContext, useContext, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { UserRole } from '../types';

interface ThemeColors {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  gradient: string;
  gradientHover: string;
  bgGradient: string;
  accent: string;
  ring: string;
  text: string;
}

interface ThemeContextType {
  colors: ThemeColors;
  role: UserRole | null;
}

const roleThemes: Record<UserRole, ThemeColors> = {
  manager: {
    primary: '#10b981',
    primaryLight: '#34d399',
    primaryDark: '#059669',
    gradient: 'from-emerald-500 to-teal-500',
    gradientHover: 'from-emerald-600 to-teal-600',
    bgGradient: 'from-emerald-50 via-white to-teal-50',
    accent: '#14b8a6',
    ring: 'ring-emerald-200',
    text: 'text-emerald-600',
  },
  developer: {
    primary: '#3b82f6',
    primaryLight: '#60a5fa',
    primaryDark: '#2563eb',
    gradient: 'from-blue-500 to-indigo-500',
    gradientHover: 'from-blue-600 to-indigo-600',
    bgGradient: 'from-blue-50 via-white to-indigo-50',
    accent: '#6366f1',
    ring: 'ring-blue-200',
    text: 'text-blue-600',
  },
  designer: {
    primary: '#a855f7',
    primaryLight: '#c084fc',
    primaryDark: '#9333ea',
    gradient: 'from-purple-500 to-pink-500',
    gradientHover: 'from-purple-600 to-pink-600',
    bgGradient: 'from-purple-50 via-white to-pink-50',
    accent: '#ec4899',
    ring: 'ring-purple-200',
    text: 'text-purple-600',
  },
  tester: {
    primary: '#f97316',
    primaryLight: '#fb923c',
    primaryDark: '#ea580c',
    gradient: 'from-orange-500 to-red-500',
    gradientHover: 'from-orange-600 to-red-600',
    bgGradient: 'from-orange-50 via-white to-red-50',
    accent: '#ef4444',
    ring: 'ring-orange-200',
    text: 'text-orange-600',
  },
  analyst: {
    primary: '#06b6d4',
    primaryLight: '#22d3ee',
    primaryDark: '#0891b2',
    gradient: 'from-cyan-500 to-blue-500',
    gradientHover: 'from-cyan-600 to-blue-600',
    bgGradient: 'from-cyan-50 via-white to-blue-50',
    accent: '#3b82f6',
    ring: 'ring-cyan-200',
    text: 'text-cyan-600',
  },
};

const defaultTheme: ThemeColors = roleThemes.manager;

const ThemeContext = createContext<ThemeContextType>({ colors: defaultTheme, role: null });

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const role = user?.role || null;
  const colors = role ? roleThemes[role] : defaultTheme;

  return (
    <ThemeContext.Provider value={{ colors, role }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
