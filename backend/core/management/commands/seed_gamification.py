from django.core.management.base import BaseCommand
from core.models import LevelThreshold, Badge

class Command(BaseCommand):
    help = 'Seeds initial Gamification data including Level Thresholds and default Badges'

    def handle(self, *args, **kwargs):
        self.stdout.write('Seeding gamification data...')

        # 1. Seed Level Thresholds (1-10)
        # Formula: Level N = (N-1) * 500 XP
        levels = [
            {'level': 1, 'xp_required': 0, 'title': 'Novice'},
            {'level': 2, 'xp_required': 500, 'title': 'Learner'},
            {'level': 3, 'xp_required': 1200, 'title': 'Explorer'},
            {'level': 4, 'xp_required': 2000, 'title': 'Scholar'},
            {'level': 5, 'xp_required': 3000, 'title': 'Adept'},
            {'level': 6, 'xp_required': 4500, 'title': 'Expert'},
            {'level': 7, 'xp_required': 6500, 'title': 'Master'},
            {'level': 8, 'xp_required': 9000, 'title': 'Grandmaster'},
            {'level': 9, 'xp_required': 12000, 'title': 'Legend'},
            {'level': 10, 'xp_required': 15000, 'title': 'Mythic'},
        ]

        for level_data in levels:
            obj, created = LevelThreshold.objects.update_or_create(
                level=level_data['level'],
                defaults={
                    'xp_required': level_data['xp_required'],
                    'title': level_data['title']
                }
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f"Created Level {obj.level} ({obj.xp_required} XP)"))

        # 2. Seed Default Badges
        badges = [
            {
                'name': 'First Steps',
                'description': 'Awarded for completing your very first lesson.',
                'image_url': 'https://api.dicebear.com/7.x/icons/svg?seed=first-steps&backgroundColor=e0f2fe&icon=footsteps'
            },
            {
                'name': 'Quiz Master',
                'description': 'Awarded for passing 5 quizzes with 100% scores.',
                'image_url': 'https://api.dicebear.com/7.x/icons/svg?seed=quiz-master&backgroundColor=fef08a&icon=trophy'
            },
            {
                'name': 'Social Butterfly',
                'description': 'Awarded for starting a discussion that receives over 10 replies.',
                'image_url': 'https://api.dicebear.com/7.x/icons/svg?seed=social&backgroundColor=fce7f3&icon=chat'
            },
            {
                'name': 'Course Completed',
                'description': 'Awarded for finishing your first full course.',
                'image_url': 'https://api.dicebear.com/7.x/icons/svg?seed=graduated&backgroundColor=dcfce7&icon=academic-cap'
            }
        ]

        for badge_data in badges:
            obj, created = Badge.objects.get_or_create(
                name=badge_data['name'],
                defaults={
                    'description': badge_data['description'],
                    'image_url': badge_data['image_url']
                }
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f"Created Badge: {obj.name}"))

        self.stdout.write(self.style.SUCCESS('Successfully seeded gamification data!'))
