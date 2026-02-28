from django.db import models
from django.contrib.auth.models import AbstractUser
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
import uuid

# --- Infrastructure: Soft Delete Mechanism ---

class SoftDeleteQuerySet(models.QuerySet):
    def delete(self):
        return super().update(deleted_at=timezone.now())

    def hard_delete(self):
        return super().delete()

    def alive(self):
        return self.filter(deleted_at__isnull=True)

    def dead(self):
        return self.exclude(deleted_at__isnull=True)

from django.contrib.auth.models import UserManager

class SoftDeleteManager(UserManager):
    def get_queryset(self):
        return SoftDeleteQuerySet(self.model, using=self._db).alive()

    def all_with_deleted(self):
        return SoftDeleteQuerySet(self.model, using=self._db)

    def deleted(self):
        return SoftDeleteQuerySet(self.model, using=self._db).dead()

# --- New Enums from Prisma Schema ---
class NotificationType(models.TextChoices):
    COURSE = 'COURSE', 'Course'
    SYSTEM = 'SYSTEM', 'System'
    REPLY = 'REPLY', 'Reply'
    MESSAGE = 'MESSAGE', 'Message'
    PROMOTION = 'PROMOTION', 'Promotion'

class OrderStatus(models.TextChoices):
    PENDING = 'PENDING', 'Pending'
    PAID = 'PAID', 'Paid'
    CANCELLED = 'CANCELLED', 'Cancelled'
    REFUNDED = 'REFUNDED', 'Refunded'

class PaymentProvider(models.TextChoices):
    PAYDUNYA = 'PAYDUNYA', 'PayDunya'
    STRIPE = 'STRIPE', 'Stripe'

class PaymentStatus(models.TextChoices):
    PENDING = 'PENDING', 'Pending'
    COMPLETED = 'COMPLETED', 'Completed'
    FAILED = 'FAILED', 'Failed'
    REFUNDED = 'REFUNDED', 'Refunded'

class User(AbstractUser):
    ROLE_CHOICES = (
        ('student', 'Student'),
        ('teacher', 'Teacher'),
        ('admin', 'Admin'),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='student')
    xp_points = models.IntegerField(default=0)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    bio = models.TextField(max_length=500, blank=True)
    location = models.CharField(max_length=100, blank=True)
    timezone = models.CharField(max_length=50, default='UTC')
    is_pro = models.BooleanField(default=False)

    # Custom Additions
    email_verified = models.BooleanField(default=False)
    email_verification_token = models.CharField(max_length=255, unique=True, null=True, blank=True)
    password_reset_token = models.CharField(max_length=255, unique=True, null=True, blank=True)
    refresh_token = models.CharField(max_length=500, null=True, blank=True)
    two_factor_secret = models.CharField(max_length=255, null=True, blank=True)
    level_num = models.IntegerField(default=1) 
    deleted_at = models.DateTimeField(null=True, blank=True)

    objects = SoftDeleteManager()
    original_objects = models.Manager()

    class Meta:
        indexes = [
            models.Index(fields=['role']),
            models.Index(fields=['email_verified']),
            models.Index(fields=['deleted_at']),
        ]

    def __str__(self):
        return self.username

class Membership(models.Model):
    TIER_CHOICES = (
        ('free', 'Free'),
        ('pro', 'Pro'),
        ('elite', 'Elite'),
    )
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='membership')
    tier = models.CharField(max_length=20, choices=TIER_CHOICES, default='free')
    start_date = models.DateTimeField(auto_now_add=True)
    end_date = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.user.username} - {self.tier}"

class Course(models.Model):
    LEVEL_CHOICES = (
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
    )
    LANGUAGE_CHOICES = (
        ('en', 'English'),
        ('fr', 'French'),
        ('es', 'Spanish'),
        ('ar', 'Arabic'),
    )
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    description = models.TextField()
    short_description = models.CharField(max_length=500, blank=True)
    category = models.CharField(max_length=100)
    level = models.CharField(max_length=20, choices=LEVEL_CHOICES, default='beginner')
    language = models.CharField(max_length=10, choices=LANGUAGE_CHOICES, default='fr')
    thumbnail = models.ImageField(upload_to='courses/', null=True, blank=True)
    video_preview_url = models.URLField(max_length=500, blank=True)
    instructor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='teaching_courses')
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    discount_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    duration_hours = models.IntegerField(default=0)
    requirements = models.TextField(blank=True) 
    outcomes = models.TextField(blank=True) 
    is_published = models.BooleanField(default=False)
    is_featured = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    objects = SoftDeleteManager()
    original_objects = models.Manager()

    class Meta:
        indexes = [
            models.Index(fields=['is_published']),
            models.Index(fields=['level']),
            models.Index(fields=['category']),
            models.Index(fields=['instructor']),
        ]

    def save(self, *args, **kwargs):
        if not self.slug:
            from django.utils.text import slugify
            base_slug = slugify(self.title)
            slug = base_slug
            counter = 1
            while Course.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title

class Enrollment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='enrollments')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='enrollments')
    enrolled_at = models.DateTimeField(auto_now_add=True)
    progress = models.IntegerField(default=0) 
    status = models.CharField(max_length=50, default="active") # Prisma
    completed_at = models.DateTimeField(null=True, blank=True) # Prisma

    class Meta:
        unique_together = ('user', 'course')
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['enrolled_at']),
        ]

    def __str__(self):
        return f"{self.user.username} enrolled in {self.course.title}"

class Section(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='sections')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.course.title} - {self.title}"

class Lesson(models.Model):
    TYPE_CHOICES = (
        ('video', 'Video'),
        ('article', 'Article'),
        ('quiz', 'Quiz'),
        ('assignment', 'Assignment'),
    )
    section = models.ForeignKey(Section, on_delete=models.CASCADE, related_name='lessons')
    title = models.CharField(max_length=255)
    lesson_type = models.CharField(max_length=10, choices=TYPE_CHOICES, default='video')
    video_url = models.URLField(max_length=500, blank=True)
    video_file = models.FileField(upload_to='videos/', null=True, blank=True)
    content = models.TextField(blank=True) 
    summary = models.TextField(blank=True) 
    order = models.PositiveIntegerField(default=0)
    duration = models.CharField(max_length=20, blank=True) 
    is_preview = models.BooleanField(default=False)

    class Meta:
        ordering = ['order']
        indexes = [
            models.Index(fields=['lesson_type']),
            models.Index(fields=['is_preview']),
            models.Index(fields=['section']),
        ]

    def __str__(self):
        return self.title

class Resource(models.Model):
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='resources')
    title = models.CharField(max_length=255)
    file = models.FileField(upload_to='resources/')
    file_type = models.CharField(max_length=50, blank=True) 
    file_size = models.CharField(max_length=20, blank=True) 
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} ({self.lesson.title})"

class Quiz(models.Model):
    lesson = models.OneToOneField(Lesson, on_delete=models.CASCADE, related_name='quiz')
    title = models.CharField(max_length=255)
    xp_reward = models.IntegerField(default=100)
    passing_score = models.IntegerField(default=70) # Prisma
    time_limit = models.IntegerField(null=True, blank=True) # Prisma
    attempts_allowed = models.IntegerField(default=1) # Prisma

    def __str__(self):
        return self.title

class Question(models.Model):
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='questions')
    text = models.TextField()
    explanation = models.TextField(blank=True)
    type = models.CharField(max_length=50, default="SINGLE_CHOICE") # Prisma
    points = models.IntegerField(default=1) # Prisma

    def __str__(self):
        return self.text

class Choice(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='choices')
    text = models.CharField(max_length=255)
    is_correct = models.BooleanField(default=False)

    def __str__(self):
        return self.text

class QuizAttempt(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='quiz_attempts')
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='attempts')
    score = models.IntegerField()
    total_questions = models.IntegerField()
    passed = models.BooleanField(default=False) # Prisma
    completed_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.quiz.title} - {self.score}/{self.total_questions}"

class LessonProgress(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='lesson_progress')
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='progress')
    is_completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(auto_now_add=True)
    last_position = models.IntegerField(null=True, blank=True) # Prisma

    class Meta:
        unique_together = ('user', 'lesson')

    def __str__(self):
        return f"{self.user.username} - {self.lesson.title} - {self.is_completed}"

class Discussion(models.Model):
    title = models.CharField(max_length=255)
    content = models.TextField()
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='discussions')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='discussions', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    liked_by = models.ManyToManyField(User, related_name='liked_discussions', blank=True)
    is_resolved = models.BooleanField(default=False)
    view_count = models.IntegerField(default=0)
    deleted_at = models.DateTimeField(null=True, blank=True)

    objects = SoftDeleteManager()
    original_objects = models.Manager()

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title

    @property
    def likes_count(self):
        return self.liked_by.count()

class DiscussionReply(models.Model):
    discussion = models.ForeignKey(Discussion, on_delete=models.CASCADE, related_name='replies')
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='discussion_replies')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    liked_by = models.ManyToManyField(User, related_name='liked_replies', blank=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    objects = SoftDeleteManager()
    original_objects = models.Manager()

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"Reply by {self.author.username} on {self.discussion.title}"

    @property
    def likes_count(self):
        return self.liked_by.count()

class Notification(models.Model):
    NOTIFICATION_TYPES = (
        ('message', 'Message'),
        ('achievement', 'Achievement'),
        ('course', 'Course'),
        ('grade', 'Grade'),
        ('system', 'System'),
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES)
    title = models.CharField(max_length=255)
    description = models.TextField()
    link = models.CharField(max_length=255, null=True, blank=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    data = models.JSONField(null=True, blank=True) # Prisma

    class Meta:
        ordering = ['-created_at']

class Certificate(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='certificates')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='certificates')
    certificate_id = models.CharField(max_length=100, unique=True, blank=True)
    issued_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.certificate_id:
            import uuid
            self.certificate_id = str(uuid.uuid4())[:18].upper()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Certificate for {self.user.username} - {self.course.title}"

@receiver(post_save, sender=Enrollment)
def check_course_completion(sender, instance, **kwargs):
    if instance.progress == 100:
        Certificate.objects.get_or_create(user=instance.user, course=instance.course)

@receiver(post_save, sender=User)
def create_user_membership(sender, instance, created, **kwargs):
    if created:
        Membership.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_membership(sender, instance, **kwargs):
    try:
        instance.membership.save()
    except:
        pass

class LiveSession(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    instructor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='live_sessions')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='live_sessions', null=True, blank=True)
    is_public = models.BooleanField(default=True)
    is_live = models.BooleanField(default=False)
    scheduled_at = models.DateTimeField(null=True, blank=True)
    started_at = models.DateTimeField(null=True, blank=True)
    ended_at = models.DateTimeField(null=True, blank=True)
    meeting_link = models.URLField(max_length=500, blank=True)
    attendees_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} ({self.instructor.username})"

class Review(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews')
    rating = models.IntegerField(default=5)
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('course', 'user')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username}'s review on {self.course.title}"

class Assignment(models.Model):
    lesson = models.OneToOneField(Lesson, on_delete=models.CASCADE, related_name='assignment')
    title = models.CharField(max_length=255)
    instructions = models.TextField()
    total_points = models.IntegerField(default=100)
    due_date = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return self.title

class AssignmentSubmission(models.Model):
    assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE, related_name='submissions')
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='assignment_submissions')
    content = models.TextField(blank=True) # Text submission
    file = models.FileField(upload_to='submissions/', null=True, blank=True)
    grade = models.IntegerField(null=True, blank=True)
    feedback = models.TextField(blank=True)
    submitted_at = models.DateTimeField(auto_now_add=True)
    graded_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ('assignment', 'student')

    def __str__(self):
        return f"{self.student.username} - {self.assignment.title}"

class Order(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='orders')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=OrderStatus.choices, default=OrderStatus.PENDING)
    provider_transaction_id = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    currency = models.CharField(max_length=10, default="XOF") # Prisma
    paid_at = models.DateTimeField(null=True, blank=True) # Prisma

    def __str__(self):
        return f"Order {self.id} - {self.user.username} - {self.status}"

class Conversation(models.Model):
    participants = models.ManyToManyField(User, related_name='conversations')
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        return f"Conversation {self.id}"

class Message(models.Model):
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    content = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"Message from {self.sender.username} at {self.created_at}"

# --- New Prisma Models ---

class LevelThreshold(models.Model):
    level = models.IntegerField(unique=True)
    xp_required = models.IntegerField()
    title = models.CharField(max_length=255, null=True, blank=True)

class Badge(models.Model):
    name = models.CharField(max_length=255, unique=True)
    description = models.TextField(null=True, blank=True)
    image_url = models.URLField(max_length=500, null=True, blank=True)
    criteria = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

class UserBadge(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='badges')
    badge = models.ForeignKey(Badge, on_delete=models.CASCADE, related_name='users')
    awarded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'badge')

class Tag(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    followers = models.ManyToManyField(User, related_name='followed_tags', blank=True)

class DiscussionTag(models.Model):
    discussion = models.ForeignKey(Discussion, on_delete=models.CASCADE, related_name='discussion_tags')
    tag = models.ForeignKey(Tag, on_delete=models.CASCADE, related_name='discussions')

    class Meta:
        unique_together = ('discussion', 'tag')

class DiscussionView(models.Model):
    discussion = models.ForeignKey(Discussion, on_delete=models.CASCADE, related_name='views')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='discussion_views')
    viewed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('discussion', 'user')

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='order_items')
    price_at_purchase = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('order', 'course')

class Payment(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='payment_records', null=True, blank=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=10, default="XOF")
    provider = models.CharField(max_length=50, choices=PaymentProvider.choices, default=PaymentProvider.PAYDUNYA)
    status = models.CharField(max_length=20, choices=PaymentStatus.choices, default=PaymentStatus.PENDING)
    transaction_id = models.CharField(max_length=255, unique=True, null=True, blank=True)
    metadata = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
