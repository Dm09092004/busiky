from django.db import models
from django.conf import settings

class Project(models.Model):
    STATUS_CHOICES = (
        ('new', 'Новый'),
        ('in_progress', 'В работе'),
        ('completed', 'Завершён'),
        ('archived', 'Архивный'),
    )

    name = models.CharField(max_length=200, verbose_name='Название')
    description = models.TextField(blank=True, verbose_name='Описание')
    technical_spec = models.TextField(blank=True, verbose_name='Техническое задание')
    complexity = models.IntegerField(null=True, blank=True, verbose_name='Сложность (1-10)')
    budget = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True, verbose_name='Бюджет')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='new', verbose_name='Статус')
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_projects',
        verbose_name='Менеджер проекта'
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Дата создания')
    started_at = models.DateTimeField(null=True, blank=True, verbose_name='Начало работ')
    completed_at = models.DateTimeField(null=True, blank=True, verbose_name='Завершение')
    planned_start = models.DateField(null=True, blank=True, verbose_name='Плановая дата начала')
    planned_end = models.DateField(null=True, blank=True, verbose_name='Плановая дата окончания')

    class Meta:
        verbose_name = 'Проект'
        verbose_name_plural = 'Проекты'
        ordering = ['-created_at']

    def __str__(self):
        return self.name


class ProjectAssignment(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='assignments', verbose_name='Проект')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='project_assignments', verbose_name='Сотрудник')
    role_in_project = models.CharField(max_length=100, blank=True, verbose_name='Роль')
    assigned_at = models.DateTimeField(auto_now_add=True, verbose_name='Дата назначения')
    unassigned_at = models.DateTimeField(null=True, blank=True, verbose_name='Дата снятия')
    is_active = models.BooleanField(default=True, verbose_name='Активно')
    planned_hours = models.FloatField(null=True, blank=True, verbose_name='Плановые часы')

    class Meta:
        verbose_name = 'Назначение на проект'
        verbose_name_plural = 'Назначения на проекты'
        unique_together = ['project', 'user', 'is_active']  # чтобы не было дублей активных назначений

    def __str__(self):
        return f'{self.user.username} - {self.project.name}'


class RoadmapStage(models.Model):
    STAGE_STATUS_CHOICES = (
        ('pending', 'Ожидание'),
        ('in_progress', 'В работе'),
        ('completed', 'Завершён'),
        ('delayed', 'Задержка'),
    )
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='roadmap_stages', verbose_name='Проект')
    name = models.CharField(max_length=200, verbose_name='Название этапа')
    description = models.TextField(blank=True, verbose_name='Описание')
    order = models.IntegerField(verbose_name='Порядок')
    planned_start = models.DateField(verbose_name='Плановая дата начала')
    planned_end = models.DateField(verbose_name='Плановая дата окончания')
    actual_start = models.DateField(null=True, blank=True, verbose_name='Фактическая дата начала')
    actual_end = models.DateField(null=True, blank=True, verbose_name='Фактическая дата окончания')
    status = models.CharField(max_length=20, choices=STAGE_STATUS_CHOICES, default='pending', verbose_name='Статус')

    class Meta:
        verbose_name = 'Этап дорожной карты'
        verbose_name_plural = 'Этапы дорожной карты'
        ordering = ['order']

    def __str__(self):
        return f'{self.project.name} - {self.name}'