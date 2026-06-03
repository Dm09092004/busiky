"""
python manage.py seed_data_v2
python manage.py seed_data_v2 --clear
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import date, timedelta, time, datetime
import random


class Command(BaseCommand):
    help = 'Тестовые данные v2: проверка подбора сотрудников и дорожной карты'

    def add_arguments(self, parser):
        parser.add_argument('--clear', action='store_true')

    def handle(self, *args, **options):
        from django.contrib.auth import get_user_model
        from projects.models import Project, ProjectAssignment, RoadmapStage
        from tasks.models import Task, TimeEntry
        from users.models import Skill, EmployeeSkill

        User = get_user_model()
        today = date.today()

        if options['clear']:
            self.stdout.write('Удаляю старые данные...')
            TimeEntry.objects.all().delete()
            Task.objects.all().delete()
            RoadmapStage.objects.all().delete()
            ProjectAssignment.objects.all().delete()
            Project.objects.all().delete()
            EmployeeSkill.objects.all().delete()
            Skill.objects.all().delete()
            User.objects.filter(username__startswith='test_').delete()
            self.stdout.write(self.style.WARNING('Старые данные удалены.'))

        # ── Навыки ──────────────────────────────────────────────────────
        self.stdout.write('Создаю навыки...')
        skills_raw = [
            ('React', 'Frontend на React'),
            ('Python', 'Backend Python'),
            ('Django', 'Django REST Framework'),
            ('PostgreSQL', 'База данных'),
            ('Figma', 'UI/UX дизайн'),
            ('CSS', 'Вёрстка и стилизация'),
            ('API', 'REST API разработка'),
            ('Тестирование', 'QA и тестирование'),
        ]
        skills = {}
        for name, desc in skills_raw:
            s, _ = Skill.objects.get_or_create(name=name, defaults={'description': desc})
            skills[name] = s
        self.stdout.write(self.style.SUCCESS('  ✓ Навыки'))

        # ── Пользователи ────────────────────────────────────────────────
        self.stdout.write('Создаю пользователей...')

        manager, _ = User.objects.get_or_create(
            username='test_manager',
            defaults={
                'first_name': 'Анна', 'last_name': 'Петрова',
                'email': 'manager@test.ru', 'role': 'manager',
                'position': 'Руководитель проектов',
                'work_start_time': time(9, 0), 'work_end_time': time(18, 0),
                'lunch_start': time(13, 0), 'lunch_end': time(14, 0),
            }
        )
        manager.set_password('manager123')
        manager.save()

        emp_data = [
            ('test_ivan',  'Иван',    'Козлов',   'Frontend-разработчик',
             [('React', 5), ('CSS', 4), ('Figma', 2)]),
            ('test_maria', 'Мария',   'Смирнова', 'Backend-разработчик',
             [('Python', 5), ('Django', 5), ('PostgreSQL', 4), ('API', 4)]),
            ('test_alex',  'Алексей', 'Новиков',  'UI/UX Дизайнер',
             [('Figma', 5), ('CSS', 3), ('React', 2)]),
            ('test_elena', 'Елена',   'Фёдорова', 'QA-инженер',
             [('Тестирование', 5), ('API', 3), ('Python', 2)]),
            ('test_dima',  'Дмитрий', 'Орлов',    'Fullstack-разработчик',
             [('React', 4), ('Python', 4), ('Django', 3), ('PostgreSQL', 3), ('API', 4)]),
        ]

        employees = {}
        for username, fn, ln, pos, emp_skills in emp_data:
            emp, _ = User.objects.get_or_create(
                username=username,
                defaults={
                    'first_name': fn, 'last_name': ln,
                    'email': f'{username}@test.ru', 'role': 'employee',
                    'position': pos,
                    'work_start_time': time(9, 0), 'work_end_time': time(18, 0),
                    'lunch_start': time(13, 0), 'lunch_end': time(14, 0),
                }
            )
            emp.set_password('emp123')
            emp.save()
            employees[username] = emp

            for skill_name, level in emp_skills:
                EmployeeSkill.objects.get_or_create(
                    profile=emp, skill=skills[skill_name],
                    defaults={'level': level, 'years_experience': level * 0.7}
                )

        ivan  = employees['test_ivan']
        maria = employees['test_maria']
        alex  = employees['test_alex']
        elena = employees['test_elena']
        dima  = employees['test_dima']
        self.stdout.write(self.style.SUCCESS('  ✓ Пользователи и навыки'))

        # ── Проект 1: В работе (для теста подбора сотрудников) ──────────
        self.stdout.write('Создаю проекты...')

        p1, _ = Project.objects.get_or_create(
            name='[ТЕСТ] Интернет-магазин одежды',
            defaults={
                'description': 'Полный редизайн интернет-магазина с новым фронтендом на React.',
                'technical_spec': (
                    'Нужен фронт на React, бэк на Python Django, '
                    'база данных PostgreSQL, API интеграция, дизайн Figma, верстка CSS. '
                    'Проект сложный и большой.'
                ),
                'complexity': 8,
                'budget': 450000,
                'status': 'in_progress',
                'planned_start': today - timedelta(days=14),
                'planned_end': today + timedelta(days=60),
                'created_by': manager,
            }
        )

        # Назначаем только Ивана и Марию — Алекс и Дима свободны для рекомендаций
        for emp, role in [(ivan, 'Frontend'), (maria, 'Backend')]:
            ProjectAssignment.objects.get_or_create(
                project=p1, user=emp,
                defaults={'role_in_project': role, 'is_active': True, 'planned_hours': 80}
            )

        # Этапы дорожной карты для p1
        stages_p1 = [
            ('Анализ и проектирование', 1, today - timedelta(days=14), today - timedelta(days=7),
             today - timedelta(days=14), today - timedelta(days=6), 'completed'),
            ('Дизайн интерфейсов', 2, today - timedelta(days=7), today + timedelta(days=7),
             today - timedelta(days=6), None, 'in_progress'),
            ('Разработка', 3, today + timedelta(days=7), today + timedelta(days=35),
             None, None, 'pending'),
            ('Тестирование', 4, today + timedelta(days=35), today + timedelta(days=50),
             None, None, 'pending'),
            ('Запуск', 5, today + timedelta(days=50), today + timedelta(days=60),
             None, None, 'pending'),
        ]
        stage_objs_p1 = []
        for name, order, ps, pe, as_, ae, status in stages_p1:
            s, _ = RoadmapStage.objects.get_or_create(
                project=p1, name=name,
                defaults={
                    'order': order, 'planned_start': ps, 'planned_end': pe,
                    'actual_start': as_, 'actual_end': ae, 'status': status,
                }
            )
            stage_objs_p1.append(s)

        # Задачи для p1
        tasks_p1 = [
            ('Разработка главной страницы', ivan,  'high',     'in_progress', 480, 200, 0),
            ('Карточка товара компонент',   ivan,  'high',     'done',        240, 260, 0),
            ('Страница корзины',           ivan,  'medium',   'new',         360, 0,   0),
            ('REST API каталога',          maria, 'critical', 'done',        300, 285, 0),
            ('Интеграция с платёжной системой', maria, 'high', 'in_progress', 480, 120, 0),
            ('Модели базы данных',         maria, 'high',     'done',        180, 175, 0),
        ]
        for title, emp, pri, status, planned, actual, sidx in tasks_p1:
            t, _ = Task.objects.get_or_create(
                project=p1, title=title,
                defaults={
                    'assigned_to': emp, 'priority': pri, 'status': status,
                    'planned_duration': planned, 'actual_duration': actual,
                    'stage': stage_objs_p1[sidx] if sidx < len(stage_objs_p1) else None,
                    'deadline': timezone.make_aware(
                        datetime.combine(today + timedelta(days=30), time(18, 0))
                    ),
                }
            )
            if actual > 0 and status in ('done', 'in_progress'):
                if not t.time_entries.exists():
                    st = timezone.now() - timedelta(days=random.randint(1, 10))
                    TimeEntry.objects.create(
                        task=t, user=emp,
                        start_time=st,
                        end_time=st + timedelta(minutes=actual),
                        duration=actual * 60,
                    )

        # ── Проект 2: Завершённый (для прогноза аналитики) ─────────────
        p2, _ = Project.objects.get_or_create(
            name='[ТЕСТ] Корпоративный портал (завершён)',
            defaults={
                'description': 'Внутренний HR-портал компании.',
                'technical_spec': 'React фронт, Django бэк, PostgreSQL база, API интеграция.',
                'complexity': 7,
                'budget': 280000,
                'status': 'completed',
                'planned_start': today - timedelta(days=90),
                'planned_end': today - timedelta(days=10),
                'created_by': manager,
            }
        )
        for emp, role in [(dima, 'Fullstack'), (elena, 'QA')]:
            ProjectAssignment.objects.get_or_create(
                project=p2, user=emp,
                defaults={'role_in_project': role, 'is_active': True, 'planned_hours': 60}
            )

        stages_p2 = [
            ('Аналитика', 1, today-timedelta(days=90), today-timedelta(days=75),
             today-timedelta(days=90), today-timedelta(days=72), 'completed'),
            ('Разработка', 2, today-timedelta(days=75), today-timedelta(days=25),
             today-timedelta(days=72), today-timedelta(days=22), 'completed'),
            ('Тестирование', 3, today-timedelta(days=25), today-timedelta(days=10),
             today-timedelta(days=22), today-timedelta(days=10), 'completed'),
        ]
        stage_objs_p2 = []
        for name, order, ps, pe, as_, ae, status in stages_p2:
            s, _ = RoadmapStage.objects.get_or_create(
                project=p2, name=name,
                defaults={
                    'order': order, 'planned_start': ps, 'planned_end': pe,
                    'actual_start': as_, 'actual_end': ae, 'status': status,
                }
            )
            stage_objs_p2.append(s)

        tasks_p2 = [
            ('Модуль сотрудников',   dima,  'high',     'done', 480, 510, 1),
            ('Модуль отпусков',      dima,  'medium',   'done', 300, 290, 1),
            ('API для HR',           dima,  'high',     'done', 420, 400, 1),
            ('Тестирование модулей', elena, 'high',     'done', 360, 340, 2),
        ]
        for title, emp, pri, status, planned, actual, sidx in tasks_p2:
            t, _ = Task.objects.get_or_create(
                project=p2, title=title,
                defaults={
                    'assigned_to': emp, 'priority': pri, 'status': status,
                    'planned_duration': planned, 'actual_duration': actual,
                    'stage': stage_objs_p2[sidx] if sidx < len(stage_objs_p2) else None,
                    'deadline': timezone.make_aware(
                        datetime.combine(today - timedelta(days=15), time(18, 0))
                    ),
                }
            )
            if actual > 0 and not t.time_entries.exists():
                st = timezone.now() - timedelta(days=random.randint(20, 50))
                TimeEntry.objects.create(
                    task=t, user=emp,
                    start_time=st,
                    end_time=st + timedelta(minutes=actual),
                    duration=actual * 60,
                )

        # ── Проект 3: Новый (без дорожной карты — для теста generate_roadmap) ──
        p3, _ = Project.objects.get_or_create(
            name='[ТЕСТ] Лендинг для стартапа',
            defaults={
                'description': 'Быстрый лендинг с дизайном и анимациями.',
                'technical_spec': 'Дизайн Figma, верстка CSS, React фронт, API интеграция.',
                'complexity': 3,
                'budget': 85000,
                'status': 'new',
                'planned_start': today + timedelta(days=7),
                'planned_end': today + timedelta(days=35),
                'created_by': manager,
            }
        )
        # Намеренно НЕ создаём этапы — для теста generate_roadmap

        # Задачи для расписания сотрудников (my-day)
        schedule_tasks = [
            (ivan,  'Доработка компонента Header',  'critical', 'in_progress', 90,  0),
            (ivan,  'Исправление бага в корзине',   'high',     'new',         60,  0),
            (ivan,  'Рефакторинг API запросов',     'medium',   'new',         120, 0),
            (maria, 'Настройка JWT токенов',        'critical', 'in_progress', 60,  30),
            (maria, 'Оптимизация запросов к БД',    'high',     'new',         90,  0),
            (elena, 'Написание тест-кейсов',        'medium',   'new',         120, 0),
            (dima,  'Деплой тестового окружения',   'high',     'in_progress', 60,  20),
        ]
        for emp, title, pri, status, planned, actual in schedule_tasks:
            Task.objects.get_or_create(
                project=p1, title=title,
                defaults={
                    'assigned_to': emp, 'priority': pri, 'status': status,
                    'planned_duration': planned, 'actual_duration': actual,
                    'scheduled_date': today,
                    'deadline': timezone.make_aware(
                        datetime.combine(today + timedelta(days=3), time(18, 0))
                    ),
                }
            )

        self.stdout.write(self.style.SUCCESS('  ✓ Проекты, этапы, задачи'))

        # Итог
        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS('━' * 55))
        self.stdout.write(self.style.SUCCESS('✓ Тестовые данные v2 созданы!'))
        self.stdout.write(self.style.SUCCESS('━' * 55))
        self.stdout.write('')
        self.stdout.write('Логины:')
        self.stdout.write('  manager      / manager123  (менеджер)')
        self.stdout.write('  test_ivan    / emp123      (Frontend, много задач)')
        self.stdout.write('  test_maria   / emp123      (Backend)')
        self.stdout.write('  test_alex    / emp123      (Дизайн, свободен)')
        self.stdout.write('  test_elena   / emp123      (QA)')
        self.stdout.write('  test_dima    / emp123      (Fullstack, мало задач)')
        self.stdout.write('')
        self.stdout.write('Что проверять:')
        self.stdout.write('  1. Подбор сотрудников:')
        self.stdout.write('     GET /api/projects/1/recommend_staff/')
        self.stdout.write('     → Алекс и Дима получат высокий рейтинг (свободны + навыки)')
        self.stdout.write('')
        self.stdout.write('  2. Генерация дорожной карты:')
        self.stdout.write('     POST /api/projects/3/generate_roadmap/')
        self.stdout.write('     → Создаст 5 этапов для лендинга (сложность 3)')
        self.stdout.write('')
        self.stdout.write('  3. Расписание (My Day):')
        self.stdout.write('     Войди как test_ivan — увидишь задачи по приоритету')
        self.stdout.write('     critical → high → medium')
        self.stdout.write('')
        self.stdout.write('  4. Аналитика:')
        self.stdout.write('     GET /api/projects/2/analytics/')
        self.stdout.write('     → Проект завершён, данные есть')
