from datetime import datetime, time, timedelta, date
from django.utils import timezone
from .models import Task

POMODORO_WORK = 45
POMODORO_SHORT_BREAK = 5
POMODORO_LONG_BREAK = 15
POMODORO_CYCLES_BEFORE_LONG = 4


def get_work_day_bounds(user, for_date=None):
    """Возвращает начало и конец рабочего дня."""
    if for_date is None:
        for_date = timezone.now().date()
    start_time = user.work_start_time or time(9, 0)
    end_time = user.work_end_time or time(18, 0)
    start_datetime = timezone.make_aware(datetime.combine(for_date, start_time))
    end_datetime = timezone.make_aware(datetime.combine(for_date, end_time))
    return start_datetime, end_datetime


def get_lunch_break(user, for_date=None):
    """Возвращает (lunch_start, lunch_end) или (None, None), если обед не задан."""
    if for_date is None:
        for_date = timezone.now().date()
    lunch_start = user.lunch_start
    lunch_end = user.lunch_end
    if lunch_start and lunch_end:
        lunch_start_dt = timezone.make_aware(datetime.combine(for_date, lunch_start))
        lunch_end_dt = timezone.make_aware(datetime.combine(for_date, lunch_end))
        return lunch_start_dt, lunch_end_dt
    return None, None


def get_tasks_for_day(user, for_date=None):
    """Возвращает задачи пользователя на день, отсортированные по приоритету."""
    if for_date is None:
        for_date = timezone.now().date()

    PRIORITY_ORDER = {'critical': 4, 'high': 3, 'medium': 2, 'low': 1}

    tasks = list(Task.objects.filter(
        assigned_to=user,
        status__in=['new', 'in_progress']
    ).select_related('project'))

    # Сортируем по числовому приоритету (не по строке алфавитно)
    tasks.sort(
        key=lambda t: (
            -PRIORITY_ORDER.get(t.priority, 2),
            t.deadline or timezone.now() + __import__('datetime').timedelta(days=365),
            t.created_at,
        )
    )
    return tasks

def create_slot(task, start, duration_minutes):
    end = start + timedelta(minutes=duration_minutes)
    return {
        'type': 'work',
        'task_id': task.id,
        'task_title': task.title,
        'planned_duration': task.planned_duration,
        'start': start.isoformat(),
        'end': end.isoformat(),
        'duration': duration_minutes,
    }


def create_break_slot(start, duration_minutes, break_type='short'):
    end = start + timedelta(minutes=duration_minutes)
    return {
        'type': 'break',
        'break_type': break_type,
        'start': start.isoformat(),
        'end': end.isoformat(),
        'duration': duration_minutes,
    }


def generate_schedule(user, for_date=None):
    if for_date is None:
        for_date = timezone.now().date()

    tasks = list(get_tasks_for_day(user, for_date))
    if not tasks:
        return []

    start_time, end_time = get_work_day_bounds(user, for_date)
    lunch_start, lunch_end = get_lunch_break(user, for_date)

    schedule = []
    current_time = start_time
    task_index = 0
    pomodoro_cycle = 0
    total_tasks = len(tasks)

    while current_time < end_time and task_index < total_tasks:
        # Обработка обеда: если наступило время обеда, вставляем перерыв и перепрыгиваем
        if lunch_start and lunch_end and current_time < lunch_end and current_time >= lunch_start:
            lunch_duration = (lunch_end - current_time).total_seconds() / 60
            if lunch_duration > 0:
                schedule.append(create_break_slot(current_time, lunch_duration, 'lunch'))
            current_time = lunch_end
            continue

        task = tasks[task_index]

        # Пропускаем, если задача уже выполнена (на всякий случай)
        if task.status == 'done':
            task_index += 1
            continue

        remaining_day = (end_time - current_time).total_seconds() / 60
        if remaining_day <= 0:
            break

        remaining_task = task.planned_duration - (task.actual_duration or 0)
        if remaining_task <= 0:
            task_index += 1
            continue

        # Определяем длительность рабочего слота
        work_duration = min(POMODORO_WORK, remaining_day, remaining_task)

        # Проверяем, не пересекается ли рабочий слот с обедом
        work_end_time = current_time + timedelta(minutes=work_duration)
        if lunch_start and lunch_end and current_time < lunch_end and work_end_time > lunch_start:
            # Урезаем слот до начала обеда
            work_duration = (lunch_start - current_time).total_seconds() / 60
            if work_duration <= 0:
                # Уже начался обед – пропускаем (обработано выше)
                current_time = lunch_end
                continue

        if work_duration <= 0:
            break

        schedule.append(create_slot(task, current_time, work_duration))
        current_time += timedelta(minutes=work_duration)

        remaining_task -= work_duration
        if remaining_task <= 0:
            task_index += 1

        pomodoro_cycle += 1

        if current_time >= end_time:
            break

        # Планирование перерыва (короткого или длинного)
        # Если сейчас обед, перерыв не нужен
        if lunch_start and lunch_end and current_time < lunch_end and current_time >= lunch_start:
            continue

        if pomodoro_cycle % POMODORO_CYCLES_BEFORE_LONG == 0:
            break_duration = min(POMODORO_LONG_BREAK, (end_time - current_time).total_seconds() / 60)
            if break_duration > 0:
                # Проверка пересечения с обедом
                break_end = current_time + timedelta(minutes=break_duration)
                if lunch_start and lunch_end and current_time < lunch_end and break_end > lunch_start:
                    break_duration = (lunch_start - current_time).total_seconds() / 60
                    if break_duration <= 0:
                        current_time = lunch_end
                        continue
                schedule.append(create_break_slot(current_time, break_duration, 'long'))
                current_time += timedelta(minutes=break_duration)
        else:
            break_duration = min(POMODORO_SHORT_BREAK, (end_time - current_time).total_seconds() / 60)
            if break_duration > 0:
                break_end = current_time + timedelta(minutes=break_duration)
                if lunch_start and lunch_end and current_time < lunch_end and break_end > lunch_start:
                    break_duration = (lunch_start - current_time).total_seconds() / 60
                    if break_duration <= 0:
                        current_time = lunch_end
                        continue
                schedule.append(create_break_slot(current_time, break_duration, 'short'))
                current_time += timedelta(minutes=break_duration)

    return schedule