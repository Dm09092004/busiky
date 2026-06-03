from rest_framework import serializers
from .models import Project, ProjectAssignment, RoadmapStage


class ProjectSerializer(serializers.ModelSerializer):
    planned_hours = serializers.SerializerMethodField()
    actual_hours = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = '__all__'
        read_only_fields = ('created_at',)

    def get_planned_hours(self, obj):
        total = sum(t.planned_duration or 0 for t in obj.tasks.all())
        return round(total / 60, 1)

    def get_actual_hours(self, obj):
        total = sum(t.actual_duration or 0 for t in obj.tasks.all())
        return round(total / 60, 1)


class ProjectAssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectAssignment
        fields = '__all__'


class RoadmapStageSerializer(serializers.ModelSerializer):
    planned_hours = serializers.SerializerMethodField()
    actual_hours = serializers.SerializerMethodField()

    class Meta:
        model = RoadmapStage
        fields = '__all__'

    def get_planned_hours(self, obj):
        total = sum(t.planned_duration or 0 for t in obj.tasks.all())
        return round(total / 60, 1)

    def get_actual_hours(self, obj):
        total = sum(t.actual_duration or 0 for t in obj.tasks.all())
        return round(total / 60, 1)
