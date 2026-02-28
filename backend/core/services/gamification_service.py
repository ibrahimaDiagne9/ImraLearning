from django.db import transaction
from django.utils import timezone
from ..models import User, LevelThreshold, Badge, UserBadge, Notification

class GamificationService:
    @staticmethod
    def add_xp(user: User, xp_amount: int, reason: str = "") -> dict:
        """
        Adds XP to a user and checks if they leveled up.
        Returns a dict containing the updated xp, new_level (if any), and related info.
        """
        if xp_amount <= 0:
            return {"xp": user.xp_points, "leveled_up": False}

        with transaction.atomic():
            user.xp_points += xp_amount
            new_level = GamificationService._calculate_level(user.xp_points)
            
            leveled_up = False
            if new_level > user.level_num:
                user.level_num = new_level
                leveled_up = True
                
            user.save(update_fields=['xp_points', 'level_num'])
            
            if leveled_up:
                Notification.objects.create(
                    user=user,
                    type='achievement',
                    title=f"Level Up! \ud83c\udf89",
                    description=f"Congratulations! You've reached Level {new_level}."
                )
                
            return {
                "xp": user.xp_points,
                "level_num": user.level_num,
                "leveled_up": leveled_up,
                "xp_added": xp_amount,
                "reason": reason
            }
            
    @staticmethod
    def _calculate_level(current_xp: int) -> int:
        """
        Determines the appropriate level for a given amount of XP.
        Assumes LevelThreshold records exist.
        """
        # Get the highest level where xp_required <= current_xp
        threshold = LevelThreshold.objects.filter(xp_required__lte=current_xp).order_by('-level').first()
        if threshold:
            return threshold.level
        return 1 # Fallback to level 1

    @staticmethod
    def check_and_award_badges(user: User):
        """
        Checks all badges and awards any that the user qualifies for but doesn't have.
        """
        # For a full scale system, criteria might be evaluated here. 
        # For now, we provide manual/explicit triggers or simple stat checks.
        pass

    @staticmethod
    def award_badge(user: User, badge_name: str) -> bool:
        """
        Awards a specific badge by name if the user doesn't already have it.
        """
        try:
            badge = Badge.objects.get(name=badge_name)
        except Badge.DoesNotExist:
            return False

        with transaction.atomic():
            user_badge, created = UserBadge.objects.get_or_create(user=user, badge=badge)
            if created:
                Notification.objects.create(
                    user=user,
                    type='achievement',
                    title=f"New Badge Unlocked: {badge.name} \ud83c\udfc5",
                    description=badge.description or "You unlocked a new badge!",
                    link="/profile"
                )
                return True
        return False
