from rest_framework import serializers
from .models import Project, ProjectAssignment, RoadmapStage
from django.contrib.auth import get_user_model
User = get_user_model()
class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = '__all__'
        read_only_fields = ('created_at',)

class ProjectAssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectAssignment
        fields = '__all__'

class RoadmapStageSerializer(serializers.ModelSerializer):
    class Meta:
        model = RoadmapStage
        fields = '__all__'

class UserProgressSerializer(serializers.Serializer):
    user_id = serializers.IntegerField()
    username = serializers.CharField()
    full_name = serializers.CharField()
    total_tasks = serializers.IntegerField()
    completed_tasks = serializers.IntegerField()
    progress = serializers.FloatField()
    active_tasks = serializers.IntegerField()

class ProjectProgressSerializer(serializers.Serializer):
    project_id = serializers.IntegerField()
    project_name = serializers.CharField()
    total_tasks = serializers.IntegerField()
    completed_tasks = serializers.IntegerField()
    progress = serializers.FloatField()
    members = UserProgressSerializer(many=True)