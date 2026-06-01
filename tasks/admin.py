from django.contrib import admin
from .models import Task, TimeEntry


class TimeEntryInline(admin.TabularInline):
    model = TimeEntry
    extra = 0
    readonly_fields = ('start_time', 'end_time', 'duration')


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ('title', 'project', 'assigned_to', 'status', 'priority', 'deadline', 'created_at')
    list_filter = ('status', 'priority', 'project', 'assigned_to')
    search_fields = ('title', 'description')
    inlines = [TimeEntryInline]
    fieldsets = (
        (None, {
            'fields': ('project', 'stage', 'title', 'description', 'assigned_to')
        }),
        ('Планирование', {
            'fields': ('status', 'priority', 'planned_duration', 'deadline', 'estimated_complexity')
        }),
        ('Фактические данные', {
            'fields': ('actual_duration', 'started_at', 'completed_at'),
            'classes': ('collapse',)
        }),
    )
    readonly_fields = ('actual_duration', 'started_at', 'completed_at')


@admin.register(TimeEntry)
class TimeEntryAdmin(admin.ModelAdmin):
    list_display = ('task', 'user', 'start_time', 'end_time', 'duration')
    list_filter = ('user', 'task__project')
    search_fields = ('task__title', 'user__username')
    date_hierarchy = 'start_time'