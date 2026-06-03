// =====================================================
//  Генератор расписания и Pomodoro-таймер
//  (аналог backend-функции generate_schedule)
// =====================================================

import type { User, Task } from '../types';
import { logger } from './logger';

export interface ScheduleSlot {
  task_id?: number;
  type: 'work' | 'break' | 'lunch';
  start: Date;
  end: Date;
  pomodoro_phase: 'focus' | 'short_break' | 'long_break' | 'lunch';
}

export const POMODORO = {
  FOCUS_MIN: 45,
  SHORT_BREAK_MIN: 5,
  LONG_BREAK_MIN: 15,
} as const;

/**
 * Генерирует расписание задач на день с учётом Pomodoro
 * (45 минут работы, 5 минут перерыв, обед из профиля)
 */
export function generateSchedule(
  user: User,
  tasks: Task[],
  date: Date = new Date()
): ScheduleSlot[] {
  logger.info('schedule', `Генерация расписания для ${user.first_name} на ${date.toLocaleDateString('ru-RU')}`);

  const slots: ScheduleSlot[] = [];
  const [startH, startM] = user.work_start.split(':').map(Number);
  const [endH, endM] = user.work_end.split(':').map(Number);
  const [lunchH, lunchM] = user.lunch_start.split(':').map(Number);

  let current = new Date(date);
  current.setHours(startH, startM, 0, 0);
  const workEnd = new Date(date);
  workEnd.setHours(endH, endM, 0, 0);
  const lunchStart = new Date(date);
  lunchStart.setHours(lunchH, lunchM, 0, 0);
  const lunchEnd = new Date(lunchStart.getTime() + user.lunch_duration_min * 60_000);

  // Сортируем задачи по приоритету и дате
  const priorityWeight: Record<string, number> = { high: 3, medium: 2, low: 1 };
  const sorted = [...tasks]
    .filter((t) => t.status !== 'done')
    .sort((a, b) => (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0));

  let taskIdx = 0;
  let pomodoroCount = 0;

  while (current < workEnd && taskIdx < sorted.length) {
    // Обед
    if (current >= lunchStart && current < lunchEnd) {
      slots.push({
        type: 'lunch',
        start: new Date(current),
        end: new Date(lunchEnd),
        pomodoro_phase: 'lunch',
      });
      current = new Date(lunchEnd);
      continue;
    }

    // Фокус-сессия 45 мин
    const focusEnd = new Date(current.getTime() + POMODORO.FOCUS_MIN * 60_000);
    if (focusEnd > workEnd || focusEnd > lunchStart && current < lunchStart) {
      // Не влезает полный Pomodoro — влезает частично
      const freeMs = (focusEnd > lunchStart ? lunchStart : workEnd).getTime() - current.getTime();
      if (freeMs < 15 * 60_000) break; // меньше 15 мин — не имеет смысла
    }

    const task = sorted[taskIdx];
    slots.push({
      task_id: task.id,
      type: 'work',
      start: new Date(current),
      end: new Date(focusEnd),
      pomodoro_phase: 'focus',
    });

    current = focusEnd;
    pomodoroCount++;
    taskIdx++;

    // Перерыв 5 мин (или 15 мин каждый 4-й цикл)
    const isLong = pomodoroCount % 4 === 0;
    const breakMin = isLong ? POMODORO.LONG_BREAK_MIN : POMODORO.SHORT_BREAK_MIN;
    const breakEnd = new Date(current.getTime() + breakMin * 60_000);

    if (breakEnd <= lunchStart && breakEnd <= workEnd) {
      slots.push({
        type: 'break',
        start: new Date(current),
        end: new Date(breakEnd),
        pomodoro_phase: isLong ? 'long_break' : 'short_break',
      });
      current = breakEnd;
    } else {
      // Перерыв пересекает обед или конец рабочего дня
      break;
    }
  }

  logger.ok('schedule', `Сгенерировано ${slots.length} слотов, покрыто ${taskIdx} задач`);
  return slots;
}

/** Текущая фаза Pomodoro на основе времени */
export function getCurrentPhase(
  slots: ScheduleSlot[],
  now: Date = new Date()
): ScheduleSlot | null {
  return (
    slots.find((s) => now >= s.start && now < s.end) ?? null
  );
}

/** Сколько минут до следующего перерыва/обеда */
export function minutesToNextBreak(slots: ScheduleSlot[], now: Date = new Date()): number | null {
  const current = getCurrentPhase(slots, now);
  if (!current) return null;
  return Math.max(0, Math.round((current.end.getTime() - now.getTime()) / 60_000));
}
