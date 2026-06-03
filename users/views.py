from rest_framework import generics, permissions, viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .models import Skill, EmployeeSkill
from .serializers import RegisterSerializer, SkillSerializer, EmployeeSkillSerializer, UserSerializer

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response({
            'user': {'id': user.id, 'username': user.username, 'email': user.email, 'role': user.role},
            'message': 'Пользователь успешно создан',
        })


class SkillViewSet(viewsets.ModelViewSet):
    queryset = Skill.objects.all()
    serializer_class = SkillSerializer
    permission_classes = [permissions.IsAuthenticated]


class EmployeeSkillViewSet(viewsets.ModelViewSet):
    serializer_class = EmployeeSkillSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = EmployeeSkill.objects.select_related('skill', 'profile').all()
        profile = self.request.query_params.get('profile')
        if profile:
            qs = qs.filter(profile_id=profile)
        return qs


class ProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)

    def patch(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class UserListView(APIView):
    """Список всех пользователей — для менеджеров и DataContext.employees"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        users = User.objects.prefetch_related('skills__skill').all()
        data = []
        for u in users:
            d = UserSerializer(u).data
            d['skills'] = [
                {'id': es.id, 'skill': es.skill_id, 'skill_name': es.skill.name, 'level': es.level}
                for es in u.skills.select_related('skill').all()
            ]
            data.append(d)
        return Response(data)
