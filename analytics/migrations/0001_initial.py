from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('projects', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='ProjectHistory',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('complexity', models.IntegerField(blank=True, null=True, verbose_name='Сложность (1–10)')),
                ('planned_minutes', models.IntegerField(default=0, verbose_name='Плановые трудозатраты (мин)')),
                ('actual_minutes', models.IntegerField(default=0, verbose_name='Фактические трудозатраты (мин)')),
                ('deviation_minutes', models.IntegerField(default=0, verbose_name='Отклонение (мин)')),
                ('deviation_percent', models.FloatField(default=0.0, verbose_name='Отклонение (%)')),
                ('total_tasks', models.IntegerField(default=0, verbose_name='Всего задач')),
                ('completed_tasks', models.IntegerField(default=0, verbose_name='Выполнено задач')),
                ('completed_at', models.DateTimeField(auto_now_add=True, verbose_name='Дата завершения проекта')),
                ('project', models.OneToOneField(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='history',
                    to='projects.project',
                    verbose_name='Проект',
                )),
            ],
            options={
                'verbose_name': 'История проекта',
                'verbose_name_plural': 'Истории проектов',
                'ordering': ['-completed_at'],
            },
        ),
        migrations.CreateModel(
            name='StageHistory',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('stage_name', models.CharField(max_length=200, verbose_name='Название этапа')),
                ('planned_days', models.IntegerField(default=0, verbose_name='Плановая длительность (дн)')),
                ('actual_days', models.IntegerField(default=0, verbose_name='Фактическая длительность (дн)')),
                ('planned_minutes', models.IntegerField(default=0, verbose_name='Плановые трудозатраты (мин)')),
                ('actual_minutes', models.IntegerField(default=0, verbose_name='Фактические трудозатраты (мин)')),
                ('was_delayed', models.BooleanField(default=False, verbose_name='Этап был задержан')),
                ('project_history', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='stages',
                    to='analytics.projecthistory',
                    verbose_name='История проекта',
                )),
            ],
            options={
                'verbose_name': 'История этапа',
                'verbose_name_plural': 'Истории этапов',
            },
        ),
    ]
