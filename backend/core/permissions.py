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
