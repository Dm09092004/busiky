from rest_framework import viewsets, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.exceptions import NotFound, PermissionDenied
from django.db import models as django_models
from datetime import date, timedelta

from .models import Project, ProjectAssignment, RoadmapStage
from .serializers import ProjectSerializer, ProjectAssignmentSerializer, RoadmapStageSerializer


def analyze_complexity(text):
    keywords = ['фронт', 'бэк', 'дизайн', 'верстка', 'база', 'api', 'интеграция', 'сложный', 'большой']
    score = sum(1 for kw in keywords if kw in text.lower())
    return min(10, max(1, score))


class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['post'])
    def analyze(self, request):
        text = request.data.get('text', '')
        complexity = analyze_complexity(text)
        return Response({'complexity': complexity})

    @action(detail=True, methods=['post'])
    def generate_roadmap(self, request, pk=None):
        """
        Автоматически генерирует этапы дорожной карты на основе сложности проекта.
        Если есть история похожих проектов — использует их средние значения.
        """
        if request.user.role not in ('manager', 'admin'):
            raise PermissionDenied('Только менеджер может генерировать дорожную карту.')

        try:
            project = Project.objects.get(pk=pk)
        except Project.DoesNotExist:
            raise NotFound('Проект не найден.')

        complexity = project.complexity or 5

        # Типовые этапы с процентами от общей длительности
        STAGE_TEMPLATES = [
            {'name': 'Анализ и проектирование', 'pct': 0.10},
            {'name': 'Дизайн интерфейсов',      'pct': 0.15},
            {'name': 'Разработка',               'pct': 0.40},
            {'name': 'Тестирование',             'pct': 0.20},
            {'name': 'Внедрение и запуск',       'pct': 0.15},
        ]

        # Базовая длительность: сложность * 7 дней
        total_days = complexity * 7

        # Если есть история похожих проектов — улучшаем прогноз
        try:
            from analytics.models import ProjectHistory, StageHistory
            similar = ProjectHistory.objects.filter(
                complexity__range=(complexity - 1, complexity + 1)
            ).exclude(project=project)

            if similar.exists():
                # Берём средние длительности этапов из истории
                stage_avgs = {}
                for ph in similar:
                    for sh in ph.stages.all():
                        if sh.stage_name not in stage_avgs:
                            stage_avgs[sh.stage_name] = []
                        stage_avgs[sh.stage_name].append(sh.actual_days or sh.planned_days)

                # Если нашли данные — пересчитываем total_days
                if stage_avgs:
                    total_days = sum(
                        sum(v) / len(v) for v in stage_avgs.values()
                    )
        except Exception:
            pass  # Если analytics не подключена — используем базовый расчёт

        # Удаляем старые этапы если были
        RoadmapStage.objects.filter(project=project).delete()

        # Дата начала — сегодня или planned_start проекта
        start = project.planned_start or date.today()
        created_stages = []

        for i, tmpl in enumerate(STAGE_TEMPLATES):
            duration = max(1, round(total_days * tmpl['pct']))
            stage_end = start + timedelta(days=duration)

            stage = RoadmapStage.objects.create(
                project=project,
                name=tmpl['name'],
                order=i + 1,
                planned_start=start,
                planned_end=stage_end,
                status='pending',
            )
            created_stages.append({
                'id': stage.id,
                'name': stage.name,
                'order': stage.order,
                'planned_start': stage.planned_start.isoformat(),
                'planned_end': stage.planned_end.isoformat(),
                'duration_days': duration,
                'status': stage.status,
            })
            start = stage_end

        return Response({
            'detail': f'Дорожная карта создана: {len(created_stages)} этапов.',
            'total_days': round(total_days),
            'complexity': complexity,
            'stages': created_stages,
        })

    @action(detail=True, methods=['get'])
    def recommend_staff(self, request, pk=None):
        """
        Рекомендует сотрудников на проект на основе:
        - Соответствия навыков техническому заданию (50%)
        - Текущей загрузки сотрудника (30%)
        - Среднего уровня владения навыками (20%)
        """
        if request.user.role not in ('manager', 'admin'):
            raise PermissionDenied('Только менеджер может получать рекомендации.')

        try:
            project = Project.objects.get(pk=pk)
        except Project.DoesNotExist:
            raise NotFound('Проект не найден.')

        from django.contrib.auth import get_user_model
        from users.models import EmployeeSkill, Skill
        from tasks.models import Task

        User = get_user_model()

        # Ключевые слова из ТЗ — определяем требуемые навыки
        spec = (project.technical_spec or project.description or '').lower()
        KEYWORD_SKILL_MAP = {
            'react':       'React',
            'фронт':       'React',
            'frontend':    'React',
            'python':      'Python',
            'django':      'Django',
            'бэк':         'Python',
            'backend':     'Python',
            'база':        'PostgreSQL',
            'postgresql':  'PostgreSQL',
            'дизайн':      'Figma',
            'figma':       'Figma',
            'верстка':     'CSS',
            'css':         'CSS',
            'api':         'API',
            'интеграция':  'API',
            'тест':        'Тестирование',
            'qa':          'Тестирование',
        }

        required_skills = set()
        for kw, skill_name in KEYWORD_SKILL_MAP.items():
            if kw in spec:
                required_skills.add(skill_name)

        # Если ТЗ пустое — берём все навыки
        if not required_skills:
            required_skills = set(Skill.objects.values_list('name', flat=True))

        employees = User.objects.filter(role='employee')
        recommendations = []

        # Максимальная загрузка для нормирования
        max_load = max(
            (Task.objects.filter(assigned_to=emp, status__in=['new', 'in_progress']).count()
             for emp in employees),
            default=1
        ) or 1

        for emp in employees:
            emp_skills = EmployeeSkill.objects.filter(profile=emp).select_related('skill')
            skill_names = {es.skill.name for es in emp_skills}

            # Соответствие навыков (0–1)
            if required_skills:
                match = len(skill_names & required_skills) / len(required_skills)
            else:
                match = 0

            # Загрузка (0–1, чем меньше задач — тем лучше)
            active_tasks = Task.objects.filter(
                assigned_to=emp, status__in=['new', 'in_progress']
            ).count()
            load_score = 1 - (active_tasks / max_load)

            # Средний уровень навыков (0–1)
            if emp_skills.exists():
                avg_level = emp_skills.aggregate(
                    avg=django_models.Avg('level')
                )['avg'] or 1
                level_score = (avg_level - 1) / 4  # нормируем 1–5 → 0–1
            else:
                level_score = 0

            # Итоговый рейтинг
            rating = round(match * 0.5 + load_score * 0.3 + level_score * 0.2, 3)

            # Совпадающие навыки
            matched = [es.skill.name for es in emp_skills if es.skill.name in required_skills]

            recommendations.append({
                'user_id': emp.id,
                'username': emp.username,
                'full_name': f'{emp.first_name} {emp.last_name}'.strip() or emp.username,
                'position': emp.position or '—',
                'rating': rating,
                'rating_pct': round(rating * 100),
                'active_tasks': active_tasks,
                'matched_skills': matched,
                'all_skills': [
                    {'name': es.skill.name, 'level': es.level}
                    for es in emp_skills
                ],
                'skill_match_pct': round(match * 100),
                'load_pct': round((1 - load_score) * 100),
            })

        # Сортируем по рейтингу
        recommendations.sort(key=lambda x: -x['rating'])

        return Response({
            'project_id': project.id,
            'project_name': project.name,
            'required_skills': list(required_skills),
            'recommendations': recommendations,
        })


class ProjectAssignmentViewSet(viewsets.ModelViewSet):
    queryset = ProjectAssignment.objects.all()
    serializer_class = ProjectAssignmentSerializer
    permission_classes = [permissions.IsAuthenticated]


class RoadmapStageViewSet(viewsets.ModelViewSet):
    queryset = RoadmapStage.objects.all()
    serializer_class = RoadmapStageSerializer
    permission_classes = [permissions.IsAuthenticated]


class ProjectDashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role not in ['manager', 'admin']:
            return Response({"detail": "Доступ запрещен."}, status=403)

        projects = Project.objects.all()
        result = []

        for project in projects:
            tasks = project.tasks.all()
            total_tasks = tasks.count()
            completed_tasks = tasks.filter(status='done').count()
            progress = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0

            assignments = ProjectAssignment.objects.filter(
                project=project, is_active=True
            ).select_related('user')

            members_data = []
            for assignment in assignments:
                user = assignment.user
                user_tasks = tasks.filter(assigned_to=user)
                user_total = user_tasks.count()
                user_completed = user_tasks.filter(status='done').count()
                user_progress = (user_completed / user_total * 100) if user_total > 0 else 0
                user_active = user_tasks.filter(status__in=['new', 'in_progress']).count()
                members_data.append({
                    'user_id': user.id,
                    'username': user.username,
                    'full_name': f'{user.first_name} {user.last_name}'.strip(),
                    'total_tasks': user_total,
                    'completed_tasks': user_completed,
                    'progress': user_progress,
                    'active_tasks': user_active,
                })

            result.append({
                'project_id': project.id,
                'project_name': project.name,
                'total_tasks': total_tasks,
                'completed_tasks': completed_tasks,
                'progress': progress,
                'members': members_data,
            })

        return Response(result)
