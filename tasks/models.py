from django.db import models
from django.conf import settings


class Task(models.Model):
    STATUS_CHOICES = (
        ('new', 'Новая'),
        ('in_progress', 'В работе'),
        ('done', 'Выполнена'),
        ('blocked', 'Заблокирована'),
    )
    PRIORITY_CHOICES = (
        ('low', 1, 'Низкий'),
        ('medium', 2, 'Средний'),
        ('high', 3, 'Высокий'),
        ('critical', 4, 'Критический'),
    )

    project = models.ForeignKey(
        'projects.Project',
        on_delete=models.CASCADE,
        related_name='tasks',
        verbose_name='Проект'
    )
    # Опционально: привязка к этапу дорожной карты
    stage = models.ForeignKey(
        'projects.RoadmapStage',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='tasks',
        verbose_name='Этап'
    )
    title = models.CharField(max_length=200, verbose_name='Название')
    description = models.TextField(blank=True, verbose_name='Описание')
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='tasks',
        verbose_name='Исполнитель'
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='new', verbose_name='Статус')
    priority = models.CharField(max_length=20, choices=[(c[0], c[2]) for c in PRIORITY_CHOICES], default='medium', verbose_name='Приоритет')
    planned_duration = models.IntegerField(help_text='Плановое время в минутах', verbose_name='Плановое время')
    actual_duration = models.IntegerField(default=0, help_text='Фактическое время в минутах', verbose_name='Фактическое время')
    deadline = models.DateTimeField(null=True, blank=True, verbose_name='Срок выполнения')
    scheduled_date = models.DateField(null=True, blank=True, verbose_name='Запланированная дата')  # ✅ НОВОЕ
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Создана')
    started_at = models.DateTimeField(null=True, blank=True, verbose_name='Начало выполнения')
    completed_at = models.DateTimeField(null=True, blank=True, verbose_name='Завершена')
    estimated_complexity = models.IntegerField(null=True, blank=True, help_text='Оценка в story points', verbose_name='Сложность')

    class Meta:
        verbose_name = 'Задача'
        verbose_name_plural = 'Задачи'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', 'assigned_to']),
            models.Index(fields=['scheduled_date', 'priority']),
        ]

    def __str__(self):
        return f"{self.title} ({self.get_status_display()})"

    def get_priority_level(self):
        """Возвращает численный приоритет для сортировки"""
        priority_map = {'low': 1, 'medium': 2, 'high': 3, 'critical': 4}
        return priority_map.get(self.priority, 2)


class TimeEntry(models.Model):
    """Учёт времени, затраченного на задачу"""
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='time_entries', verbose_name='Задача')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='time_entries', verbose_name='Сотрудник')
    start_time = models.DateTimeField(verbose_name='Начало работы')
    end_time = models.DateTimeField(null=True, blank=True, verbose_name='Окончание работы')
    duration = models.IntegerField(help_text='Длительность в секундах', verbose_name='Длительность')
    notes = models.TextField(blank=True, verbose_name='Комментарий')

    class Meta:
        verbose_name = 'Запись времени'
        verbose_name_plural = 'Записи времени'
        ordering = ['-start_time']

    def __str__(self):
        return f"{self.user.username} - {self.task.title} ({self.start_time.strftime('%d.%m.%Y %H:%M')})"

    def save(self, *args, **kwargs):
        # Автоматически вычисляем длительность, если заданы начало и конец
        if self.start_time and self.end_time:
            delta = self.end_time - self.start_time
            self.duration = int(delta.total_seconds())
        super().save(*args, **kwargs)
        # Обновляем суммарное фактическое время задачи
        total = self.task.time_entries.filter(end_time__isnull=False).aggregate(total=models.Sum('duration'))['total'] or 0
        self.task.actual_duration = total // 60  # переводим в минуты
        self.task.save(update_fields=['actual_duration'])
