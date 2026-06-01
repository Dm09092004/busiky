from rest_framework import viewsets, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated  # добавить эту строку
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
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

class TimeEntryViewSet(viewsets.ModelViewSet):
    queryset = TimeEntry.objects.all()
    serializer_class = TimeEntrySerializer
    permission_classes = [permissions.IsAuthenticated]