from django.urls import path
from .views import ProjectAnalyticsView, ProjectSnapshotView

urlpatterns = [
    # GET  /api/projects/{project_id}/analytics/          — аналитика проекта
    # POST /api/projects/{project_id}/analytics/snapshot/ — ручной пересчёт
    path(
        'projects/<int:project_id>/analytics/',
        ProjectAnalyticsView.as_view(),
        name='project-analytics',
    ),
    path(
        'projects/<int:project_id>/analytics/snapshot/',
        ProjectSnapshotView.as_view(),
        name='project-analytics-snapshot',
    ),
]
