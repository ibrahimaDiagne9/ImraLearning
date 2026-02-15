from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Course, Section, Lesson, Quiz, Question, Choice, Enrollment

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'role', 'xp_points', 'is_staff')
    fieldsets = UserAdmin.fieldsets + (
        ('Platform Info', {'fields': ('role', 'xp_points', 'avatar', 'bio')}),
    )

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('title', 'instructor', 'category', 'level', 'is_published')
    list_filter = ('category', 'level', 'is_published')
    search_fields = ('title', 'description')

class LessonInline(admin.TabularInline):
    model = Lesson
    extra = 1

@admin.register(Section)
class SectionAdmin(admin.ModelAdmin):
    list_display = ('title', 'course', 'order')
    inlines = [LessonInline]

@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ('title', 'section', 'lesson_type', 'order')

admin.site.register(Quiz)
admin.site.register(Question)
admin.site.register(Choice)
admin.site.register(Enrollment)
