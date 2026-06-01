from django.contrib import admin
from .models import ProjectHistory, StageHistory


class StageHistoryInline(admin.TabularInline):
    model = StageHistory
    extra = 0
    readonly_fields = (
        'stage_name', 'planned_days', 'actual_days',
        'planned_minutes', 'actual_minutes', 'was_delayed',
    )


@admin.register(ProjectHistory)
class ProjectHistoryAdmin(admin.ModelAdmin):
    list_display = (
        'project', 'complexity',
        'planned_minutes', 'actual_minutes',
        'deviation_percent', 'completed_at',
    )
    list_filter = ('complexity',)
    readonly_fields = (
        'project', 'complexity',
        'planned_minutes', 'actual_minutes',
        'deviation_minutes', 'deviation_percent',
        'total_tasks', 'completed_tasks', 'completed_at',
    )
    inlines = [StageHistoryInline]
