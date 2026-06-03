from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RegisterView, SkillViewSet, EmployeeSkillViewSet, ProfileView, UserListView

router = DefaultRouter()
router.register(r'skills', SkillViewSet)
router.register(r'employee-skills', EmployeeSkillViewSet, basename='employeeskill')

urlpatterns = [
    path('register/', RegisterView.as_view()),
    path('profile/', ProfileView.as_view()),
    path('me/', ProfileView.as_view()),
    path('list/', UserListView.as_view()),
    path('', include(router.urls)),
]
