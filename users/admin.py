from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Skill, EmployeeSkill

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'role', 'is_staff')
    list_filter = ('role', 'is_staff', 'is_superuser')
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Дополнительно', {'fields': ('role', 'position', 'hourly_rate', 'hire_date', 'work_start_time', 'work_end_time','lunch_start','lunch_end')}),
    )
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('Дополнительно', {'fields': ('role', 'position', 'hourly_rate', 'hire_date', 'work_start_time', 'work_end_time')}),
    )

@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ('name', 'description')
    search_fields = ('name',)

@admin.register(EmployeeSkill)
class EmployeeSkillAdmin(admin.ModelAdmin):
    list_display = ('profile', 'skill', 'level', 'years_experience')
    list_filter = ('skill', 'level')
    search_fields = ('profile__username', 'skill__name')