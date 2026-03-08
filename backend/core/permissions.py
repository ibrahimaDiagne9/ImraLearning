from rest_framework import permissions

class IsInstructorOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow instructors of a course to edit it.
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write permissions are only allowed to the instructor of the course.
        # Handle cases where obj is Course, Section, or Lesson
        if hasattr(obj, 'instructor'):
            return obj.instructor == request.user
        if hasattr(obj, 'section'):
            return obj.section.course.instructor == request.user
        if hasattr(obj, 'course'):
            return obj.course.instructor == request.user
        
        return False

class IsInstructor(permissions.BasePermission):
    """
    Custom permission to strictly allow ONLY instructors of a course to access the view.
    No read-only fallback.
    """
    def has_object_permission(self, request, view, obj):
        if hasattr(obj, 'instructor'):
            return obj.instructor == request.user
        if hasattr(obj, 'section'):
            return obj.section.course.instructor == request.user
        if hasattr(obj, 'course'):
            return obj.course.instructor == request.user
        if hasattr(obj, 'lesson'):
            return obj.lesson.section.course.instructor == request.user
        return False

class IsEmailVerified(permissions.BasePermission):
    """
    Custom permission to only allow verified users to perform actions.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.email_verified)
