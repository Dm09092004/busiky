from rest_framework import viewsets, permissions, filters
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from datetime import timedelta
from .models import Task, TimeEntry
from .serializers import TaskSerializer, TimeEntrySerializer, ScheduleSlotSerializer
from .schedule import generate_schedule


class MyScheduleView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        date_str = request.query_params.get('date')
        if date_str:
            from datetime import datetime
            for_date = datetime.strptime(date_str, '%Y-%m-%d').date()
        else:
            for_date = None

        schedule = generate_schedule(user, for_date)
        serializer = ScheduleSlotSerializer(schedule, many=True)
        return Response(serializer.data)


class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description']
    ordering_fields = ['priority', 'deadline', 'scheduled_date', 'created_at']
    ordering = ['-priority', 'deadline']

    def get_queryset(self):
        """
        Фильтрует задачи по пользователю и параметрам.
        Поддерживает фильтрацию по:
        - status: фильтр по статусу
        - project_id: фильтр по проекту
        - assigned_to: фильтр по исполнителю
        - scheduled_date: фильтр по запланированной дате
        - date_from, date_to: диапазон дат
        """
        queryset = Task.objects.all()
        user = self.request.user

        # Фильтруем по статусу
        status = self.request.query_params.get('status')
        if status:
            queryset = queryset.filter(status=status)

        # Фильтруем по проекту
        project_id = self.request.query_params.get('project_id')
        if project_id:
            queryset = queryset.filter(project_id=project_id)

        # Фильтруем по исполнителю
        assigned_to = self.request.query_params.get('assigned_to')
        if assigned_to:
            queryset = queryset.filter(assigned_to_id=assigned_to)
        else:
            # По умолчанию показываем задачи текущего пользователя
            queryset = queryset.filter(assigned_to=user)

        # Фильтруем по запланированной дате
        scheduled_date = self.request.query_params.get('scheduled_date')
        if scheduled_date:
            queryset = queryset.filter(scheduled_date=scheduled_date)

        # Фильтруем по диапазону дат
        date_from = self.request.query_params.get('date_from')
        date_to = self.request.query_params.get('date_to')
        if date_from:
            queryset = queryset.filter(scheduled_date__gte=date_from)
        if date_to:
            queryset = queryset.filter(scheduled_date__lte=date_to)

        # Получаем задачи "на сегодня"
        today = self.request.query_params.get('today')
        if today and today.lower() == 'true':
            today_date = timezone.now().date()
            queryset = queryset.filter(scheduled_date=today_date, status__in=['new', 'in_progress'])

        # Получаем просроченные задачи
        overdue = self.request.query_params.get('overdue')
        if overdue and overdue.lower() == 'true':
            today_date = timezone.now().date()
            queryset = queryset.filter(scheduled_date__lt=today_date, status__in=['new', 'in_progress'])

        # Сортируем по приоритету (критический → высокий → средний → низкий)
        queryset = queryset.order_by('-priority', 'scheduled_date', 'deadline')

        return queryset


class TimeEntryViewSet(viewsets.ModelViewSet):
    queryset = TimeEntry.objects.all()
    serializer_class = TimeEntrySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Возвращает только записи времени текущего пользователя"""
        return TimeEntry.objects.filter(user=self.request.user).order_by('-start_time')
