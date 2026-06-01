from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TaskViewSet, TimeEntryViewSet, MyScheduleView

router = DefaultRouter()
router.register(r'tasks', TaskViewSet, basename='task')
router.register(r'time-entries', TimeEntryViewSet, basename='timeentry')

urlpatterns = [
    path('', include(router.urls)),
    path('my-schedule/', MyScheduleView.as_view(), name='my-schedule'),
]
