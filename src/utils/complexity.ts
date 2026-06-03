// =====================================================
//  Анализ сложности проекта по тексту ТЗ
//  Соответствует backend-функции analyze_complexity()
// =====================================================

import type { Skill } from '../types';

export interface ComplexityResult {
  score: number;          // 0..100
  level: 'low' | 'medium' | 'high' | 'critical';
  factors: { name: string; weight: number; value: number }[];
  detected_skills: number[];   // ids обнаруженных навыков
}

// Словарь технологий/навыков → id (синхронизирован с backend)
const SKILL_KEYWORDS: Record<number, string[]> = {
  1: ['react', 'jsx', 'tsx', 'react.js', 'реакт'],
  2: ['vue', 'vue.js', 'vuex'],
  3: ['angular'],
  4: ['django', 'python', 'джанго', 'пайтон'],
  5: ['node', 'express', 'nest.js', 'nodejs'],
  6: ['postgresql', 'postgres', 'pgsql'],
  7: ['mongodb', ' mongo '],
  8: ['docker', 'контейнер'],
  9: ['aws', 'amazon', 's3', 'lambda'],
  10: ['figma', 'дизайн', 'макет', 'ui/ux', 'ux/ui'],
  11: ['typescript', 'ts'],
  12: ['graphql'],
  13: ['redis', 'кэш', 'cache'],
  14: ['webpack', 'vite', 'сборка', 'bundler'],
  15: ['тест', 'jest', 'pytest', 'testing'],
  16: ['seo', 'оптимизация', 'поиск'],
  17: ['ml', 'машинн', 'нейросет', 'ai', 'ии', 'ml-model'],
  18: ['mobile', 'мобильн', 'react native', 'flutter'],
  19: ['devops', 'ci/cd', 'jenkins', 'gitlab ci'],
  20: ['анимац', 'gsap', 'framer', 'motion'],
};

const COMPLEX_WORDS = [
  'интеграц', 'оптимиз', 'масштаб', 'безопасн',
  'авторизац', 'аутентифик', 'оплат', 'платеж',
  'real-time', 'высок', 'нагрузк', 'многоязыч', 'i18n',
];

const SIMPLE_WORDS = ['лендинг', 'визитк', 'простой', 'одностранич'];

export function analyzeComplexity(text: string, _skills: Skill[] = []): ComplexityResult {
  const lower = (text || '').toLowerCase();
  const factors: ComplexityResult['factors'] = [];

  // 1. Длина текста
  const len = (text || '').length;
  const lenScore = Math.min(40, Math.floor(len / 50));
  factors.push({ name: 'Объём ТЗ', weight: 20, value: lenScore });

  // 2. Количество уникальных слов
  const words = new Set(lower.split(/\s+/).filter(Boolean));
  const wordScore = Math.min(30, Math.floor(words.size / 20));
  factors.push({ name: 'Лексическое разнообразие', weight: 15, value: wordScore });

  // 3. Сложные ключевые слова
  const complexHits = COMPLEX_WORDS.filter((w) => lower.includes(w)).length;
  const complexScore = Math.min(30, complexHits * 8);
  factors.push({ name: 'Сложные требования', weight: 20, value: complexScore });

  // 4. Простые ключевые слова (снижают сложность)
  const simpleHits = SIMPLE_WORDS.filter((w) => lower.includes(w)).length;
  const simpleScore = Math.max(0, 20 - simpleHits * 10);
  factors.push({ name: 'Простота требований', weight: 10, value: simpleScore });

  // 5. Количество числовых требований (сроки, объёмы)
  const numberMatches = (lower.match(/\d+/g) || []).length;
  const numScore = Math.min(20, numberMatches * 3);
  factors.push({ name: 'Количественные требования', weight: 10, value: numScore });

  // 6. Наличие технических терминов
  const techTerms = (lower.match(/\b(api|бд|база|сервер|frontend|backend|frontend|backend|crm|erp)\b/g) || []).length;
  const techScore = Math.min(20, techTerms * 5);
  factors.push({ name: 'Технические термины', weight: 10, value: techScore });

  // Обнаружение навыков
  const detected: number[] = [];
  for (const [skillId, keywords] of Object.entries(SKILL_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) {
      detected.push(Number(skillId));
    }
  }
  const skillsScore = Math.min(25, detected.length * 5);
  factors.push({ name: 'Необходимые технологии', weight: 15, value: skillsScore });

  // Итоговый score
  const total = factors.reduce((s, f) => s + (f.value * f.weight) / 100, 0);
  const score = Math.max(5, Math.min(100, Math.round(total)));

  const level: ComplexityResult['level'] =
    score >= 75 ? 'critical' :
    score >= 50 ? 'high' :
    score >= 25 ? 'medium' : 'low';

  return { score, level, factors, detected_skills: detected };
}

export const COMPLEXITY_LABELS: Record<ComplexityResult['level'], string> = {
  low:      'Низкая',
  medium:   'Средняя',
  high:     'Высокая',
  critical: 'Критическая',
};
