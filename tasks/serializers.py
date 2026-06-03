from rest_framework import serializers
from .models import Task, TimeEntry


class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = '__all__'
        read_only_fields = ('created_at', 'actual_duration')


class TimeEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = TimeEntry
        fields = '__all__'
        read_only_fields = ('duration',)


class ScheduleSlotSerializer(serializers.Serializer):
    type = serializers.ChoiceField(choices=['work', 'break'])
    break_type = serializers.CharField(required=False, allow_blank=True)
    task_id = serializers.IntegerField(required=False, allow_null=True)
    task_title = serializers.CharField(required=False, allow_blank=True)
    planned_duration = serializers.IntegerField(required=False, allow_null=True)
    start = serializers.DateTimeField()
    end = serializers.DateTimeField()
    duration = serializers.IntegerField()
