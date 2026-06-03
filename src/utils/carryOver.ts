// =====================================================
//  Утилита "carry_over_tasks" — перенос незавершённых задач
//  Аналог Django management command
// =====================================================

import { api } from '../api/store';
import { logger } from './logger';
import type { Task } from '../types';

export interface CarryOverResult {
  total: number;
  carried: number;
  details: { id: number; title: string; from: string; to: string }[];
}

/**
 * Переносит все задачи со статусом new/in_progress/review/blocked
 * и scheduled_date <= today на следующий день.
 *
 * @param dryRun если true — только показывает, что будет перенесено, без изменений
 */
export async function carryOverTasks(dryRun = false): Promise<CarryOverResult> {
  logger.info('carry_over', `Запуск переноса задач (${dryRun ? 'тестовый режим' : 'реальный'})`);

  const allTasks = await api.listTasks();
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86_400_000).toISOString().split('T')[0];

  const toCarry = allTasks.filter((t) =>
    t.scheduled_date <= today &&
    (t.status === 'new' || t.status === 'in_progress' || t.status === 'review' || t.status === 'blocked')
  );

  const result: CarryOverResult = {
    total: allTasks.length,
    carried: toCarry.length,
    details: toCarry.map((t) => ({ id: t.id, title: t.title, from: t.scheduled_date, to: tomorrow })),
  };

  if (!dryRun) {
    for (const task of toCarry) {
      await api.updateTask(task.id, { scheduled_date: tomorrow });
      logger.debug('carry_over', `Задача #${task.id} «${task.title}» перенесена с ${task.scheduled_date} на ${tomorrow}`);
    }
    logger.ok('carry_over', `Перенесено ${toCarry.length} задач с ${today} на ${tomorrow}`);
  } else {
    logger.info('carry_over', `Будет перенесено ${toCarry.length} задач (тестовый режим)`);
  }

  return result;
}

/**
 * Возвращает задачи, которые будут перенесены (без изменений)
 */
export async function previewCarryOver(): Promise<Task[]> {
  const allTasks = await api.listTasks();
  const today = new Date().toISOString().split('T')[0];
  return allTasks.filter((t) =>
    t.scheduled_date <= today &&
    (t.status === 'new' || t.status === 'in_progress' || t.status === 'review' || t.status === 'blocked')
  );
}
