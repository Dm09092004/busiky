from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProjectViewSet, ProjectAssignmentViewSet, RoadmapStageViewSet, ProjectDashboardView

router = DefaultRouter()
router.register(r'projects', ProjectViewSet)
router.register(r'project-assignments', ProjectAssignmentViewSet)
router.register(r'roadmap-stages', RoadmapStageViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('dashboard/', ProjectDashboardView.as_view(), name='project-dashboard'),
]