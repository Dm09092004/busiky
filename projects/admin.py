from django.contrib import admin
from .models import Project, ProjectAssignment, RoadmapStage

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('name', 'status', 'complexity', 'budget', 'created_by', 'created_at')
    list_filter = ('status', 'created_by')
    search_fields = ('name', 'description')

@admin.register(ProjectAssignment)
class ProjectAssignmentAdmin(admin.ModelAdmin):
    list_display = ('project', 'user', 'role_in_project', 'is_active')
    list_filter = ('is_active', 'project')

@admin.register(RoadmapStage)
class RoadmapStageAdmin(admin.ModelAdmin):
    list_display = ('name', 'project', 'planned_start', 'planned_end', 'status')
    list_filter = ('status', 'project')