from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User
from .models import Skill, EmployeeSkill

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True, label='Подтверждение пароля')

    class Meta:
        model = User
        fields = ('username', 'password', 'password2', 'email', 'first_name', 'last_name',
                  'role', 'position', 'hourly_rate', 'hire_date', 'work_start_time', 'work_end_time')
        extra_kwargs = {
            'first_name': {'required': False},
            'last_name': {'required': False},
            'email': {'required': True},
            'role': {'read_only': True},  # роль будет устанавливаться автоматически
        }

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Пароли не совпадают."})
        return attrs

    def create(self, validated_data):
        # Удаляем поле password2, оно не нужно для создания
        validated_data.pop('password2')
        # Устанавливаем роль по умолчанию (employee)
        validated_data['role'] = 'employee'
        # Создаём пользователя с хэшированным паролем
        user = User.objects.create_user(**validated_data)
        return user
class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = '__all__'

class EmployeeSkillSerializer(serializers.ModelSerializer):
    skill_name = serializers.CharField(source='skill.name', read_only=True)
    username = serializers.CharField(source='profile.username', read_only=True)

    class Meta:
        model = EmployeeSkill
        fields = '__all__'
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'position', 'hourly_rate', 'work_start_time', 'work_end_time', 'lunch_start', 'lunch_end']