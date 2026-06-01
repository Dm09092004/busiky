from rest_framework import viewsets, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Project, ProjectAssignment, RoadmapStage
from .serializers import ProjectSerializer, ProjectAssignmentSerializer, RoadmapStageSerializer

# Вспомогательная функция для анализа сложности (если нет файла utils.py, определим здесь)
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
            return Response({"detail": "Доступ запрещен. Требуется роль менеджера."}, status=403)

        projects = Project.objects.all()
        result = []

        for project in projects:
            tasks = project.tasks.all()  # используем related_name 'tasks' из модели Task
            total_tasks = tasks.count()
            completed_tasks = tasks.filter(status='done').count()
            progress = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0

            assignments = ProjectAssignment.objects.filter(project=project, is_active=True).select_related('user')
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
                    'full_name': f"{user.first_name} {user.last_name}".strip(),
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