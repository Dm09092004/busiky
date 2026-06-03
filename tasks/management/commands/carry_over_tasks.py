from django.core.management.base import BaseCommand
from django.utils import timezone
from tasks.models import Task

class Command(BaseCommand):
    help = 'Переносит незавершённые задачи на следующий день'

    def handle(self, *args, **options):
        today = timezone.now().date()
        tomorrow = today + timezone.timedelta(days=1)

        tasks = Task.objects.filter(
            status__in=['new', 'in_progress'],
            scheduled_date__lt=today
        )

        count = tasks.update(scheduled_date=tomorrow)
        self.stdout.write(self.style.SUCCESS(f'Перенесено {count} задач на {tomorrow}'))