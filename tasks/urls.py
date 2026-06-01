from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TaskViewSet, TimeEntryViewSet, MyScheduleView

router = DefaultRouter()
router.register(r'tasks', TaskViewSet)
router.register(r'time-entries', TimeEntryViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('my-schedule/', MyScheduleView.as_view(), name='my-schedule'),
]