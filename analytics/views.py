from django.db import models as django_models
from django.db.models.signals import post_save
from django.dispatch import receiver
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, serializers
from rest_framework.exceptions import NotFound, PermissionDenied

from projects.models import Project, RoadmapStage
from tasks.models import Task
from .models import ProjectHistory, StageHistory


# ---------------------------------------------------------------------------
# Вспомогательная функция: создать или обновить запись истории проекта
# ---------------------------------------------------------------------------

def snapshot_project(project):
    """
    Собирает фактические данные завершённого проекта и сохраняет в ProjectHistory.
    Вызывается автоматически через сигнал и вручную через эндпоинт.
    """
    tasks = Task.objects.filter(project=project)
    total_tasks = tasks.count()
    completed_tasks = tasks.filter(status='done').count()

    planned_minutes = tasks.aggregate(
        total=django_models.Sum('planned_duration')
    )['total'] or 0

    actual_minutes = tasks.aggregate(
        total=django_models.Sum('actual_duration')
    )['total'] or 0

    deviation_minutes = actual_minutes - planned_minutes
    deviation_percent = (
        round((deviation_minutes / planned_minutes) * 100, 1)
        if planned_minutes > 0 else 0.0
    )

    history, _ = ProjectHistory.objects.update_or_create(
        project=project,
        defaults={
            'complexity': project.complexity,
            'planned_minutes': planned_minutes,
            'actual_minutes': actual_minutes,
            'deviation_minutes': deviation_minutes,
            'deviation_percent': deviation_percent,
            'total_tasks': total_tasks,
            'completed_tasks': completed_tasks,
        },
    )

    # Сохраняем срез по каждому этапу дорожной карты
    StageHistory.objects.filter(project_history=history).delete()
    stages = RoadmapStage.objects.filter(project=project)

    for stage in stages:
        stage_tasks = tasks.filter(stage=stage)

        stage_planned = stage_tasks.aggregate(
            total=django_models.Sum('planned_duration')
        )['total'] or 0

        stage_actual = stage_tasks.aggregate(
            total=django_models.Sum('actual_duration')
        )['total'] or 0

        planned_days = 0
        actual_days = 0
        if stage.planned_start and stage.planned_end:
            planned_days = (stage.planned_end - stage.planned_start).days
        if stage.actual_start and stage.actual_end:
            actual_days = (stage.actual_end - stage.actual_start).days

        StageHistory.objects.create(
            project_history=history,
            stage_name=stage.name,
            planned_days=planned_days,
            actual_days=actual_days,
            planned_minutes=stage_planned,
            actual_minutes=stage_actual,
            was_delayed=stage.status == 'delayed',
        )

    return history


# ---------------------------------------------------------------------------
# Сигнал: автоматически сохранять историю при завершении проекта
# ---------------------------------------------------------------------------

@receiver(post_save, sender=Project)
def on_project_completed(sender, instance, **kwargs):
    """
    Срабатывает каждый раз при сохранении проекта.
    Если статус стал 'completed' — создаём или обновляем историю.
    """
    if instance.status == 'completed':
        snapshot_project(instance)


# ---------------------------------------------------------------------------
# Сериализаторы
# ---------------------------------------------------------------------------

class StageHistorySerializer(serializers.ModelSerializer):
    deviation_days = serializers.SerializerMethodField()
    deviation_minutes = serializers.SerializerMethodField()

    class Meta:
        model = StageHistory
        fields = [
            'stage_name',
            'planned_days', 'actual_days', 'deviation_days',
            'planned_minutes', 'actual_minutes', 'deviation_minutes',
            'was_delayed',
        ]

    def get_deviation_days(self, obj):
        return obj.actual_days - obj.planned_days

    def get_deviation_minutes(self, obj):
        return obj.actual_minutes - obj.planned_minutes


class ProjectHistorySerializer(serializers.ModelSerializer):
    stages = StageHistorySerializer(many=True, read_only=True)
    planned_hours = serializers.SerializerMethodField()
    actual_hours = serializers.SerializerMethodField()

    class Meta:
        model = ProjectHistory
        fields = [
            'id', 'complexity',
            'planned_minutes', 'actual_minutes',
            'planned_hours', 'actual_hours',
            'deviation_minutes', 'deviation_percent',
            'total_tasks', 'completed_tasks',
            'completed_at', 'stages',
        ]

    def get_planned_hours(self, obj):
        return round(obj.planned_minutes / 60, 1)

    def get_actual_hours(self, obj):
        return round(obj.actual_minutes / 60, 1)


# ---------------------------------------------------------------------------
# Эндпоинт: GET /api/projects/{project_id}/analytics/
# ---------------------------------------------------------------------------

class ProjectAnalyticsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, project_id):
        try:
            project = Project.objects.get(pk=project_id)
        except Project.DoesNotExist:
            raise NotFound('Проект не найден.')

        user = request.user
        is_manager = user.role in ('manager', 'admin')
        is_member = Task.objects.filter(project=project, assigned_to=user).exists()
        if not is_manager and not is_member:
            raise PermissionDenied('У вас нет доступа к аналитике этого проекта.')

        try:
            history = project.history
        except ProjectHistory.DoesNotExist:
            history = snapshot_project(project)

        serializer = ProjectHistorySerializer(history)
        data = serializer.data
        data['forecast'] = self._get_forecast(project)
        return Response(data)

    def _get_forecast(self, project):
        if not project.complexity:
            return None

        similar = ProjectHistory.objects.filter(
            complexity__range=(project.complexity - 1, project.complexity + 1),
        ).exclude(project=project)

        count = similar.count()
        if count == 0:
            return None

        avg_actual = similar.aggregate(
            avg=django_models.Avg('actual_minutes')
        )['avg'] or 0

        avg_planned = similar.aggregate(
            avg=django_models.Avg('planned_minutes')
        )['avg'] or 0

        avg_deviation_pct = similar.aggregate(
            avg=django_models.Avg('deviation_percent')
        )['avg'] or 0

        return {
            'based_on_projects': count,
            'avg_actual_minutes': round(avg_actual),
            'avg_actual_hours': round(avg_actual / 60, 1),
            'avg_planned_minutes': round(avg_planned),
            'avg_deviation_percent': round(avg_deviation_pct, 1),
            'note': (
                f'Прогноз на основе {count} похожих проектов '
                f'со сложностью {project.complexity - 1}–{project.complexity + 1}.'
            ),
        }
# ---------------------------------------------------------------------------
# Эндпоинт: POST /api/projects/{project_id}/analytics/snapshot/
# Ручной триггер для менеджера — пересчитать историю прямо сейчас
# ---------------------------------------------------------------------------

class ProjectSnapshotView(APIView):
    """
    Позволяет менеджеру вручную обновить историю проекта,
    не дожидаясь автоматического сигнала.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, project_id):
        if request.user.role not in ('manager', 'admin'):
            raise PermissionDenied('Только менеджер может запускать пересчёт аналитики.')

        try:
            project = Project.objects.get(pk=project_id)
        except Project.DoesNotExist:
            raise NotFound('Проект не найден.')

        history = snapshot_project(project)
        serializer = ProjectHistorySerializer(history)
        return Response({'detail': 'Аналитика обновлена.', 'data': serializer.data})
