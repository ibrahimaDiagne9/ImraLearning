from django.db.models.signals import post_save, m2m_changed
from django.dispatch import receiver
from .models import Discussion, DiscussionReply, Notification, User

@receiver(post_save, sender=DiscussionReply)
def create_reply_notification(sender, instance, created, **kwargs):
    if created:
        # Don't notify if user replies to their own discussion
        if instance.discussion.author != instance.author:
            Notification.objects.create(
                user=instance.discussion.author,
                type='message',
                title='New Reply',
                description=f'{instance.author.username} replied to your discussion: "{instance.discussion.title}"',
                link=f'/discussions/{instance.discussion.id}'
            )

@receiver(m2m_changed, sender=Discussion.liked_by.through)
def create_discussion_like_notification(sender, instance, action, pk_set, **kwargs):
    if action == "post_add":
        for user_id in pk_set:
            liker = User.objects.get(pk=user_id)
            if liker != instance.author:
                Notification.objects.create(
                    user=instance.author,
                    type='achievement',
                    title='Discussion Liked',
                    description=f'{liker.username} liked your discussion: "{instance.title}"',
                    link=f'/discussions/{instance.id}'
                )

@receiver(m2m_changed, sender=DiscussionReply.liked_by.through)
def create_reply_like_notification(sender, instance, action, pk_set, **kwargs):
    if action == "post_add":
        for user_id in pk_set:
            liker = User.objects.get(pk=user_id)
            if liker != instance.author:
                Notification.objects.create(
                    user=instance.author,
                    type='achievement',
                    title='Reply Liked',
                    description=f'{liker.username} liked your reply in: "{instance.discussion.title}"',
                    link=f'/discussions/{instance.discussion.id}'
                )

@receiver(post_save, sender=User)
def create_welcome_notification(sender, instance, created, **kwargs):
    if created:
        Notification.objects.create(
            user=instance,
            type='system',
            title='Welcome to e-MRA!',
            description='We are glad to have you here. Start your learning journey today!',
            link='/courses'
        )
