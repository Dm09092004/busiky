from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User, Skill, EmployeeSkill


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('username', 'password', 'password2', 'email', 'first_name', 'last_name')
        extra_kwargs = {'first_name': {'required': False}, 'last_name': {'required': False}}

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({'password': 'Пароли не совпадают.'})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        validated_data['role'] = 'employee'
        return User.objects.create_user(**validated_data)


class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = '__all__'


class EmployeeSkillSerializer(serializers.ModelSerializer):
    skill_name = serializers.CharField(source='skill.name', read_only=True)

    class Meta:
        model = EmployeeSkill
        fields = ['id', 'profile', 'skill', 'skill_name', 'level', 'years_experience']


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'role',
            'position', 'hourly_rate', 'work_start_time', 'work_end_time',
            'lunch_start', 'lunch_end', 'hire_date',
        ]
        read_only_fields = ['id', 'username', 'role']
