"""
Management command: заполнить базу тестовыми данными.

Использование:
    python manage.py seed_data
    python manage.py seed_data --clear   # сначала удалить старые данные

Создаёт:
  - 1 менеджер  (manager / manager123)
  - 4 сотрудника (employee1–4 / emp123)
  - 3 проекта с разными статусами
  - Этапы дорожной карты для каждого проекта
  - Задачи с разными приоритетами и статусами
  - Назначения сотрудников на проекты
  - Записи тайм-трекинга
  - Навыки сотрудников
"""

from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import date, timedelta, time, datetime
import random


class Command(BaseCommand):
    help = 'Заполнить базу тестовыми данными'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Удалить существующие тестовые данные перед созданием новых',
        )

    def handle(self, *args, **options):
        from django.contrib.auth import get_user_model
        from projects.models import Project, ProjectAssignment, RoadmapStage
        from tasks.models import Task, TimeEntry
        from users.models import Skill, EmployeeSkill

        User = get_user_model()

        if options['clear']:
            self.stdout.write('Удаляю старые данные...')
            TimeEntry.objects.all().delete()
            Task.objects.all().delete()
            RoadmapStage.objects.all().delete()
            ProjectAssignment.objects.all().delete()
            Project.objects.all().delete()
            EmployeeSkill.objects.all().delete()
            Skill.objects.all().delete()
            User.objects.filter(username__in=[
                'manager', 'employee1', 'employee2', 'employee3', 'employee4'
            ]).delete()
            self.stdout.write(self.style.WARNING('Старые данные удалены.'))

        today = date.today()

        # ── 1. Пользователи ────────────────────────────────────────────────

        self.stdout.write('Создаю пользователей...')

        manager, _ = User.objects.get_or_create(
            username='manager',
            defaults={
                'first_name': 'Анна',
                'last_name': 'Петрова',
                'email': 'manager@kit.ru',
                'role': 'manager',
                'position': 'Руководитель проектов',
                'work_start_time': time(9, 0),
                'work_end_time': time(18, 0),
                'lunch_start': time(13, 0),
                'lunch_end': time(14, 0),
                'hire_date': date(2022, 3, 1),
            }
        )
        manager.set_password('manager123')
        manager.save()

        employees_data = [
            {
                'username': 'employee1',
                'first_name': 'Иван',
                'last_name': 'Козлов',
                'position': 'Frontend-разработчик',
                'email': 'ivan@kit.ru',
            },
            {
                'username': 'employee2',
                'first_name': 'Мария',
                'last_name': 'Смирнова',
                'position': 'Backend-разработчик',
                'email': 'maria@kit.ru',
            },
            {
                'username': 'employee3',
                'first_name': 'Алексей',
                'last_name': 'Новиков',
                'position': 'UI/UX Дизайнер',
                'email': 'alex@kit.ru',
            },
            {
                'username': 'employee4',
                'first_name': 'Елена',
                'last_name': 'Фёдорова',
                'position': 'QA-инженер',
                'email': 'elena@kit.ru',
            },
        ]

        employees = []
        for ed in employees_data:
            emp, _ = User.objects.get_or_create(
                username=ed['username'],
                defaults={
                    **ed,
                    'role': 'employee',
                    'work_start_time': time(9, 0),
                    'work_end_time': time(18, 0),
                    'lunch_start': time(13, 0),
                    'lunch_end': time(14, 0),
                    'hire_date': date(2023, 1, 15),
                }
            )
            emp.set_password('emp123')
            emp.save()
            employees.append(emp)

        ivan, maria, alex, elena = employees
        self.stdout.write(self.style.SUCCESS('  ✓ Пользователи созданы'))

        # ── 2. Навыки ────────────────────────────────────────────────────

        self.stdout.write('Создаю навыки...')

        skills_data = [
            ('React', 'Разработка интерфейсов на React'),
            ('Python', 'Backend-разработка на Python'),
            ('Django', 'Веб-фреймворк Django'),
            ('PostgreSQL', 'Реляционная база данных'),
            ('Figma', 'Дизайн интерфейсов'),
            ('CSS', 'Стилизация веб-страниц'),
            ('API', 'Проектирование REST API'),
            ('Тестирование', 'Ручное и автоматическое тестирование'),
        ]

        skills = {}
        for name, desc in skills_data:
            skill, _ = Skill.objects.get_or_create(name=name, defaults={'description': desc})
            skills[name] = skill

        # Навыки сотрудников
        emp_skills = {
            ivan:  [('React', 4), ('CSS', 5), ('Figma', 2)],
            maria: [('Python', 5), ('Django', 4), ('PostgreSQL', 4), ('API', 5)],
            alex:  [('Figma', 5), ('CSS', 4), ('React', 2)],
            elena: [('Тестирование', 5), ('API', 3), ('Python', 2)],
        }

        for emp, emp_skill_list in emp_skills.items():
            for skill_name, level in emp_skill_list:
                EmployeeSkill.objects.get_or_create(
                    profile=emp,
                    skill=skills[skill_name],
                    defaults={'level': level, 'years_experience': level * 0.8},
                )

        self.stdout.write(self.style.SUCCESS('  ✓ Навыки созданы'))

        # ── 3. Проекты ───────────────────────────────────────────────────

        self.stdout.write('Создаю проекты...')

        projects_data = [
            {
                'name': 'Редизайн сайта интернет-магазина',
                'description': (
                    'Полный редизайн существующего интернет-магазина одежды. '
                    'Новый фирменный стиль, улучшенный пользовательский опыт, '
                    'адаптивная вёрстка и интеграция с новой CRM-системой.'
                ),
                'technical_spec': (
                    'Нужен фронт на React, бэк на Django, дизайн в Figma, '
                    'верстка, база данных PostgreSQL, API интеграция с CRM. '
                    'Проект большой и сложный.'
                ),
                'complexity': 8,
                'budget': 450000,
                'status': 'in_progress',
                'planned_start': today - timedelta(days=30),
                'planned_end': today + timedelta(days=60),
                'members': [
                    (ivan, 'Frontend-разработчик', 80),
                    (maria, 'Backend-разработчик', 100),
                    (alex, 'Дизайнер', 60),
                    (elena, 'QA-инженер', 40),
                ],
                'stages': [
                    {
                        'name': 'Анализ и проектирование',
                        'order': 1,
                        'planned_start': today - timedelta(days=30),
                        'planned_end': today - timedelta(days=21),
                        'actual_start': today - timedelta(days=30),
                        'actual_end': today - timedelta(days=19),
                        'status': 'completed',
                    },
                    {
                        'name': 'Дизайн интерфейсов',
                        'order': 2,
                        'planned_start': today - timedelta(days=21),
                        'planned_end': today - timedelta(days=7),
                        'actual_start': today - timedelta(days=19),
                        'actual_end': today - timedelta(days=5),
                        'status': 'completed',
                    },
                    {
                        'name': 'Frontend-разработка',
                        'order': 3,
                        'planned_start': today - timedelta(days=14),
                        'planned_end': today + timedelta(days=21),
                        'actual_start': today - timedelta(days=12),
                        'actual_end': None,
                        'status': 'in_progress',
                    },
                    {
                        'name': 'Backend и интеграции',
                        'order': 4,
                        'planned_start': today - timedelta(days=7),
                        'planned_end': today + timedelta(days=28),
                        'actual_start': today - timedelta(days=5),
                        'actual_end': None,
                        'status': 'in_progress',
                    },
                    {
                        'name': 'Тестирование и запуск',
                        'order': 5,
                        'planned_start': today + timedelta(days=28),
                        'planned_end': today + timedelta(days=60),
                        'actual_start': None,
                        'actual_end': None,
                        'status': 'pending',
                    },
                ],
                'tasks': [
                    ('Разработка главной страницы', ivan, 'high', 'in_progress', 480, 320, 1),
                    ('Компонент карточки товара', ivan, 'high', 'done', 240, 260, 1),
                    ('Страница корзины и оформления', ivan, 'medium', 'in_progress', 360, 120, 1),
                    ('REST API для каталога товаров', maria, 'critical', 'done', 300, 280, 1),
                    ('Интеграция с CRM', maria, 'high', 'in_progress', 480, 200, 1),
                    ('Модели базы данных', maria, 'high', 'done', 180, 170, 1),
                    ('Дизайн главной страницы', alex, 'high', 'done', 360, 400, 1),
                    ('Дизайн мобильной версии', alex, 'medium', 'done', 240, 230, 1),
                    ('Функциональное тестирование', elena, 'medium', 'new', 300, 0, 1),
                    ('Регрессионное тестирование', elena, 'low', 'new', 240, 0, 1),
                ],
            },
            {
                'name': 'Корпоративный портал для HR',
                'description': (
                    'Разработка внутреннего корпоративного портала для HR-отдела. '
                    'Модули: учёт сотрудников, отпуска, KPI, новости компании.'
                ),
                'technical_spec': (
                    'Фронт React, бэк Django, база данных, API, '
                    'дизайн, верстка. Интеграция с 1С.'
                ),
                'complexity': 6,
                'budget': 280000,
                'status': 'completed',
                'planned_start': today - timedelta(days=90),
                'planned_end': today - timedelta(days=10),
                'members': [
                    (ivan, 'Frontend-разработчик', 60),
                    (maria, 'Backend-разработчик', 80),
                    (elena, 'QA-инженер', 30),
                ],
                'stages': [
                    {
                        'name': 'Аналитика и ТЗ',
                        'order': 1,
                        'planned_start': today - timedelta(days=90),
                        'planned_end': today - timedelta(days=75),
                        'actual_start': today - timedelta(days=90),
                        'actual_end': today - timedelta(days=72),
                        'status': 'completed',
                    },
                    {
                        'name': 'Разработка',
                        'order': 2,
                        'planned_start': today - timedelta(days=75),
                        'planned_end': today - timedelta(days=25),
                        'actual_start': today - timedelta(days=72),
                        'actual_end': today - timedelta(days=20),
                        'status': 'completed',
                    },
                    {
                        'name': 'Тестирование',
                        'order': 3,
                        'planned_start': today - timedelta(days=25),
                        'planned_end': today - timedelta(days=10),
                        'actual_start': today - timedelta(days=20),
                        'actual_end': today - timedelta(days=10),
                        'status': 'completed',
                    },
                ],
                'tasks': [
                    ('Модуль учёта сотрудников', ivan, 'high', 'done', 480, 510, 2),
                    ('Модуль отпусков', ivan, 'medium', 'done', 300, 290, 2),
                    ('API для HR-модулей', maria, 'high', 'done', 420, 400, 2),
                    ('Интеграция с 1С', maria, 'critical', 'done', 600, 680, 2),
                    ('Тестирование всех модулей', elena, 'high', 'done', 360, 340, 2),
                ],
            },
            {
                'name': 'Лендинг для стартапа FoodTech',
                'description': (
                    'Разработка продающего лендинга для стартапа в сфере доставки еды. '
                    'Современный дизайн, анимации, форма заявки, интеграция с CRM.'
                ),
                'technical_spec': 'Дизайн Figma, верстка, React, API интеграция.',
                'complexity': 3,
                'budget': 85000,
                'status': 'new',
                'planned_start': today + timedelta(days=7),
                'planned_end': today + timedelta(days=35),
                'members': [
                    (ivan, 'Frontend-разработчик', 40),
                    (alex, 'Дизайнер', 30),
                ],
                'stages': [
                    {
                        'name': 'Дизайн',
                        'order': 1,
                        'planned_start': today + timedelta(days=7),
                        'planned_end': today + timedelta(days=14),
                        'actual_start': None,
                        'actual_end': None,
                        'status': 'pending',
                    },
                    {
                        'name': 'Разработка',
                        'order': 2,
                        'planned_start': today + timedelta(days=14),
                        'planned_end': today + timedelta(days=28),
                        'actual_start': None,
                        'actual_end': None,
                        'status': 'pending',
                    },
                    {
                        'name': 'Запуск',
                        'order': 3,
                        'planned_start': today + timedelta(days=28),
                        'planned_end': today + timedelta(days=35),
                        'actual_start': None,
                        'actual_end': None,
                        'status': 'pending',
                    },
                ],
                'tasks': [
                    ('Дизайн лендинга в Figma', alex, 'high', 'new', 240, 0, 3),
                    ('Вёрстка главного блока', ivan, 'high', 'new', 180, 0, 3),
                    ('Форма заявки и валидация', ivan, 'medium', 'new', 120, 0, 3),
                    ('Анимации и интерактив', ivan, 'low', 'new', 150, 0, 3),
                ],
            },
        ]

        created_projects = []
        for pd in projects_data:
            proj, _ = Project.objects.get_or_create(
                name=pd['name'],
                defaults={
                    'description': pd['description'],
                    'technical_spec': pd['technical_spec'],
                    'complexity': pd['complexity'],
                    'budget': pd['budget'],
                    'status': pd['status'],
                    'planned_start': pd['planned_start'],
                    'planned_end': pd['planned_end'],
                    'created_by': manager,
                }
            )
            created_projects.append((proj, pd))

        self.stdout.write(self.style.SUCCESS('  ✓ Проекты созданы'))

        # ── 4. Назначения, этапы, задачи ─────────────────────────────────

        self.stdout.write('Создаю назначения, этапы и задачи...')

        priority_map = ['low', 'medium', 'high', 'critical']

        for proj, pd in created_projects:

            # Назначения
            for emp, role, planned_h in pd['members']:
                ProjectAssignment.objects.get_or_create(
                    project=proj,
                    user=emp,
                    defaults={
                        'role_in_project': role,
                        'is_active': True,
                        'planned_hours': planned_h,
                    }
                )

            # Этапы дорожной карты
            stage_objects = []
            for sd in pd['stages']:
                stage, _ = RoadmapStage.objects.get_or_create(
                    project=proj,
                    name=sd['name'],
                    defaults={
                        'order': sd['order'],
                        'planned_start': sd['planned_start'],
                        'planned_end': sd['planned_end'],
                        'actual_start': sd['actual_start'],
                        'actual_end': sd['actual_end'],
                        'status': sd['status'],
                    }
                )
                stage_objects.append(stage)

            # Задачи
            deadline_offset = 14
            for i, (title, assigned, priority, status, planned, actual, _) in enumerate(pd['tasks']):
                # Привязываем к этапу по порядку
                stage_idx = min(i // 2, len(stage_objects) - 1)
                stage = stage_objects[stage_idx] if stage_objects else None

                deadline = timezone.make_aware(
                    datetime.combine(today + timedelta(days=deadline_offset - i * 2), time(18, 0))
                )

                task, created = Task.objects.get_or_create(
                    project=proj,
                    title=title,
                    defaults={
                        'assigned_to': assigned,
                        'priority': priority,
                        'status': status,
                        'planned_duration': planned,
                        'actual_duration': actual,
                        'stage': stage,
                        'deadline': deadline,
                    }
                )

                # Записи тайм-трекинга для выполненных задач
                if created and actual > 0 and status in ('done', 'in_progress'):
                    start_dt = timezone.now() - timedelta(days=random.randint(1, 20))
                    end_dt = start_dt + timedelta(minutes=actual)
                    TimeEntry.objects.create(
                        task=task,
                        user=assigned,
                        start_time=start_dt,
                        end_time=end_dt,
                        duration=actual * 60,
                        notes='Автоматически сгенерировано тестовыми данными',
                    )

        self.stdout.write(self.style.SUCCESS('  ✓ Назначения, этапы и задачи созданы'))

        # ── 5. Финальный отчёт ────────────────────────────────────────────

        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS('━' * 50))
        self.stdout.write(self.style.SUCCESS('✓ База успешно заполнена тестовыми данными!'))
        self.stdout.write(self.style.SUCCESS('━' * 50))
        self.stdout.write('')
        self.stdout.write('Учётные данные для входа:')
        self.stdout.write('')
        self.stdout.write('  👤 Менеджер:')
        self.stdout.write('     Логин:  manager')
        self.stdout.write('     Пароль: manager123')
        self.stdout.write('     Роль:   manager (видит дашборд и аналитику)')
        self.stdout.write('')
        self.stdout.write('  👤 Сотрудники (пароль для всех: emp123):')
        self.stdout.write('     employee1 — Иван Козлов      (Frontend)')
        self.stdout.write('     employee2 — Мария Смирнова   (Backend)')
        self.stdout.write('     employee3 — Алексей Новиков  (Дизайн)')
        self.stdout.write('     employee4 — Елена Фёдорова   (QA)')
        self.stdout.write('')
        self.stdout.write('Что создано:')
        self.stdout.write('  • 3 проекта: в работе / завершён / новый')
        self.stdout.write('  • 10+ задач с разными статусами и приоритетами')
        self.stdout.write('  • Дорожные карты с этапами для каждого проекта')
        self.stdout.write('  • Записи тайм-трекинга для выполненных задач')
        self.stdout.write('  • Навыки сотрудников')
        self.stdout.write('')
        self.stdout.write('Открой: http://localhost:5173')
