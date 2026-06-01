from django.db import models
from django.conf import settings


class ProjectHistory(models.Model):
    """
    Сохраняется автоматически при переводе проекта в статус 'completed'.
    Используется для улучшения прогнозов при создании новых проектов.
    """
    project = models.OneToOneField(
        'projects.Project',
        on_delete=models.CASCADE,
        related_name='history',
        verbose_name='Проект',
    )
    complexity = models.IntegerField(
        null=True, blank=True,
        verbose_name='Сложность (1–10)',
    )
    # Плановые трудозатраты — сумма planned_duration всех задач проекта (в минутах)
    planned_minutes = models.IntegerField(
        default=0,
        verbose_name='Плановые трудозатраты (мин)',
    )
    # Фактические трудозатраты — сумма actual_duration всех задач (в минутах)
    actual_minutes = models.IntegerField(
        default=0,
        verbose_name='Фактические трудозатраты (мин)',
    )
    # Разница: положительная — перерасход, отрицательная — экономия
    deviation_minutes = models.IntegerField(
        default=0,
        verbose_name='Отклонение (мин)',
    )
    # Отклонение в процентах относительно плана
    deviation_percent = models.FloatField(
        default=0.0,
        verbose_name='Отклонение (%)',
    )
    total_tasks = models.IntegerField(default=0, verbose_name='Всего задач')
    completed_tasks = models.IntegerField(default=0, verbose_name='Выполнено задач')

    completed_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Дата завершения проекта',
    )

    class Meta:
        verbose_name = 'История проекта'
        verbose_name_plural = 'Истории проектов'
        ordering = ['-completed_at']

    def __str__(self):
        return f'История: {self.project.name}'


class StageHistory(models.Model):
    """
    Срез по каждому этапу дорожной карты завершённого проекта.
    Используется для прогноза длительности этапов в новых похожих проектах.
    """
    project_history = models.ForeignKey(
        ProjectHistory,
        on_delete=models.CASCADE,
        related_name='stages',
        verbose_name='История проекта',
    )
    stage_name = models.CharField(max_length=200, verbose_name='Название этапа')
    planned_days = models.IntegerField(default=0, verbose_name='Плановая длительность (дн)')
    actual_days = models.IntegerField(default=0, verbose_name='Фактическая длительность (дн)')
    planned_minutes = models.IntegerField(default=0, verbose_name='Плановые трудозатраты (мин)')
    actual_minutes = models.IntegerField(default=0, verbose_name='Фактические трудозатраты (мин)')
    was_delayed = models.BooleanField(default=False, verbose_name='Этап был задержан')

    class Meta:
        verbose_name = 'История этапа'
        verbose_name_plural = 'Истории этапов'

    def __str__(self):
        return f'{self.project_history.project.name} — {self.stage_name}'
