import os
import django
from django.utils.text import slugify

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'imra_backend.settings')
django.setup()

from core.models import User, Course, Section, Lesson, Resource

def seed():
    # Get or create instructor
    admin, created = User.objects.get_or_create(
        username='admin',
        defaults={
            'email': 'admin@example.com',
            'role': 'admin',
            'is_staff': True,
            'is_superuser': True
        }
    )
    if created:
        admin.set_password('admin123')
        admin.save()
        print("Created admin user.")
    else:
        print("Using existing admin user.")
    
    # Define a premium course
    c1_title = "The Art of Cinematic Web Design"
    c1, created = Course.objects.get_or_create(
        title=c1_title,
        defaults={
            'slug': slugify(c1_title),
            'short_description': "Master the aesthetics of glassmorphism, depth, and micro-interactions in modern web applications.",
            'description': "In this comprehensive mastery course, you will learn how to build high-end user interfaces that compete with the world's top digital products. We dive deep into HSL color theory, Figma workflows, and advanced Tailwind/CSS techniques.",
            'category': "Design",
            'level': "advanced",
            'language': "en",
            'price': 199.99,
            'discount_price': 149.99,
            'duration_hours': 24,
            'instructor': admin,
            'is_published': True,
            'is_featured': True,
            'requirements': "- Basic knowledge of HTML/CSS\n- Passion for visual excellence\n- Figma account",
            'outcomes': "- Build professional glassmorphic interfaces\n- Understand micro-animation principles\n- Master premium color palettes",
            'thumbnail': "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2000&auto=format&fit=crop"
        }
    )

    if created:
        print(f"Created Course: {c1.title}")
        
        # Section 1
        s1 = Section.objects.create(course=c1, title="Foundation of Aesthetics", order=1)
        Lesson.objects.create(
            section=s1, title="The Psychology of Glassmorphism", 
            lesson_type='video', order=1, duration="12:45",
            video_url="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
            summary="Understanding why depth and blur resonate with high-end users."
        )
        Lesson.objects.create(
            section=s1, title="Color Theory: Beyond Hex Codes", 
            lesson_type='article', order=2, duration="20m",
            content="HSL is the secret weapon of modern designers. By controlling Hue, Saturation, and Lightness, you create harmonious palettes that feel alive.",
            summary="A deep dive into HSL and P3 color spaces."
        )

        # Section 2
        s2 = Section.objects.create(course=c1, title="Implementation & Animation", order=2)
        Lesson.objects.create(
            section=s2, title="Building the Frosted Glass Card", 
            lesson_type='video', order=1, duration="18:30",
            video_url="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
            summary="Step-by-step coding of a luxury card component."
        )
        Lesson.objects.create(
            section=s2, title="Assignment: Create your own Layout", 
            lesson_type='assignment', order=2, duration="2h",
            content="Use the principles learned to design a bento-style hero section.",
            summary="Practical application of benedicite principles."
        )

    # Simple course for variety
    c2_title = "Full-Stack Development with Python"
    c2, created = Course.objects.get_or_create(
        title=c2_title,
        defaults={
            'slug': slugify(c2_title),
            'short_description': "Build robust APIs and dynamic frontends using Django and React.",
            'category': "Development",
            'level': "intermediate",
            'language': "en",
            'price': 99.99,
            'instructor': admin,
            'is_published': True,
            'thumbnail': "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=2000&auto=format&fit=crop"
        }
    )
    if created:
        print(f"Created Course: {c2.title}")
        s1 = Section.objects.create(course=c2, title="API Design", order=1)
        Lesson.objects.create(
            section=s1, title="RESTful Principles", 
            lesson_type='video', order=1, duration="15:00",
            video_url="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
        )

    print("Seeding completed successfully!")

if __name__ == "__main__":
    seed()
