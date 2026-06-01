from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = (
        ('employee', 'Сотрудник'),
        ('manager', 'Менеджер'),
        ('admin', 'Администратор'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='employee')

    groups = models.ManyToManyField(
        'auth.Group',
        verbose_name='groups',
        blank=True,
        help_text='The groups this user belongs to.',
        related_name='custom_user_set',
        related_query_name='custom_user',
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        verbose_name='user permissions',
        blank=True,
        help_text='Specific permissions for this user.',
        related_name='custom_user_set',
        related_query_name='custom_user',
    )
    lunch_start = models.TimeField(null=True, blank=True, verbose_name='Начало обеда')
    lunch_end = models.TimeField(null=True, blank=True, verbose_name='Конец обеда')
    position = models.CharField(max_length=100, blank=True, verbose_name='Должность')
    hourly_rate = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, verbose_name='Почасовая ставка')
    hire_date = models.DateField(null=True, blank=True, verbose_name='Дата найма')
    work_start_time = models.TimeField(null=True, blank=True, verbose_name='Начало рабочего дня')
    work_end_time = models.TimeField(null=True, blank=True, verbose_name='Конец рабочего дня')
    
class Skill(models.Model):
    """Модель навыка (например, Python,项目管理, дизайн)"""
    name = models.CharField(max_length=100, unique=True, verbose_name='Название')
    description = models.TextField(blank=True, verbose_name='Описание')

    class Meta:
        verbose_name = 'Навык'
        verbose_name_plural = 'Навыки'
        ordering = ['name']

    def __str__(self):
        return self.name


class EmployeeSkill(models.Model):
    """Связь сотрудника с навыком и уровнем владения"""
    LEVEL_CHOICES = (
        (1, 'Новичок'),
        (2, 'Базовый'),
        (3, 'Средний'),
        (4, 'Продвинутый'),
        (5, 'Эксперт'),
    )
    profile = models.ForeignKey(
        'users.User',  # ссылаемся на нашу кастомную модель User
        on_delete=models.CASCADE,
        related_name='skills',
        verbose_name='Сотрудник'
    )
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE, related_name='employees', verbose_name='Навык')
    level = models.IntegerField(choices=LEVEL_CHOICES, default=1, verbose_name='Уровень')
    years_experience = models.FloatField(default=0, verbose_name='Лет опыта')

    class Meta:
        verbose_name = 'Навык сотрудника'
        verbose_name_plural = 'Навыки сотрудников'
        unique_together = ('profile', 'skill')  # чтобы у одного сотрудника не было дублей навыка

    def __str__(self):
        return f"{self.profile.username} - {self.skill.name} ({self.get_level_display()})"