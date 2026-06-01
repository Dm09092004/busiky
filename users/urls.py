from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RegisterView, SkillViewSet, EmployeeSkillViewSet, ProfileView

router = DefaultRouter()
router.register(r'skills', SkillViewSet)
router.register(r'employee-skills', EmployeeSkillViewSet)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('me/', ProfileView.as_view(), name='me'),  # алиас для AuthContext
    path('', include(router.urls)),
]
