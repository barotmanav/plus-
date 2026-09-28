from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from apps.departments.models import Department
from apps.classes.models import CollegeClass
from apps.notices.models import NoticeCategory, Notice
from apps.notes.models import PersonalNote
from apps.notifications.models import Notification

User = get_user_model()

class Command(BaseCommand):
    help = 'Seeds initial departments, classes, users, categories, notices, and notes for CampusPulse'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.NOTICE("Seeding CampusPulse database..."))

        # 1. Departments
        depts_data = [
            ("Information Technology", "IT", "Dr. Ramesh Kulkarni"),
            ("Computer Engineering", "CE", "Dr. Sunita Mehta"),
            ("Mechanical Engineering", "ME", "Dr. Rajesh Deshmukh"),
            ("Civil Engineering", "CIVIL", "Dr. Anand Verma"),
        ]
        dept_map = {}
        for name, code, hod in depts_data:
            dept, _ = Department.objects.get_or_create(
                code=code,
                defaults={'name': name, 'hod_name': hod}
            )
            dept_map[code] = dept

        # 2. Classes
        classes_data = [
            ("IT-A", dept_map["IT"], 2, 3),
            ("IT-B", dept_map["IT"], 2, 3),
            ("IT-C", dept_map["IT"], 3, 5),
            ("CE-A", dept_map["CE"], 2, 3),
        ]
        class_map = {}
        for name, dept, year, sem in classes_data:
            c, _ = CollegeClass.objects.get_or_create(
                name=name, department=dept, year=year, semester=sem,
                defaults={'total_students': 60}
            )
            class_map[name] = c

        # 3. Categories
        cats_data = [
            ("Emergency", "emergency", "AlertTriangle", "#ef4444"),
            ("Academic", "academic", "BookOpen", "#3b82f6"),
            ("Examination", "examination", "FileText", "#f59e0b"),
            ("Placement", "placement", "GraduationCap", "#10b981"),
            ("Events", "events", "PartyPopper", "#8b5cf6"),
            ("Sports", "sports", "Trophy", "#ec4899"),
            ("General", "general", "Megaphone", "#64748b"),
        ]
        cat_map = {}
        for name, slug, icon, color in cats_data:
            cat, _ = NoticeCategory.objects.get_or_create(
                slug=slug,
                defaults={'name': name, 'icon_name': icon, 'color': color, 'is_active': True}
            )
            cat_map[slug] = cat

        # 4. Users
        # Super Admin
        super_admin, _ = User.objects.get_or_create(
            email="superadmin@campuspulse.edu",
            defaults={
                'first_name': "Dr. Vikram",
                'last_name': "Joshi",
                'role': User.Role.SUPER_ADMIN,
                'is_staff': True,
                'is_superuser': True,
            }
        )
        super_admin.set_password("AdminPass123!")
        super_admin.save()

        # Department Admin
        dept_admin, _ = User.objects.get_or_create(
            email="it_admin@campuspulse.edu",
            defaults={
                'first_name': "Prof. Neha",
                'last_name': "Gupta",
                'role': User.Role.DEPT_ADMIN,
                'department': dept_map["IT"],
                'is_staff': True,
            }
        )
        dept_admin.set_password("AdminPass123!")
        dept_admin.save()

        # Faculty Members
        faculty1, _ = User.objects.get_or_create(
            email="prof.sharma@campuspulse.edu",
            defaults={
                'first_name': "Prof. Arvind",
                'last_name': "Sharma",
                'role': User.Role.FACULTY,
                'department': dept_map["IT"],
                'is_staff': True,
            }
        )
        faculty1.set_password("FacultyPass123!")
        faculty1.save()

        faculty2, _ = User.objects.get_or_create(
            email="prof.patil@campuspulse.edu",
            defaults={
                'first_name': "Prof. Priya",
                'last_name': "Patil",
                'role': User.Role.FACULTY,
                'department': dept_map["CE"],
                'is_staff': True,
            }
        )
        faculty2.set_password("FacultyPass123!")
        faculty2.save()

        # CRs
        cr_rahul, _ = User.objects.get_or_create(
            email="cr.rahul@campuspulse.edu",
            defaults={
                'first_name': "Rahul",
                'last_name': "Verma",
                'role': User.Role.CR,
                'student_id': "IT-2024-042",
                'department': dept_map["IT"],
                'assigned_class': class_map["IT-A"],
                'is_cr': True,
            }
        )
        cr_rahul.set_password("StudentPass123!")
        cr_rahul.save()
        class_map["IT-A"].cr = cr_rahul
        class_map["IT-A"].save()

        cr_ananya, _ = User.objects.get_or_create(
            email="cr.ananya@campuspulse.edu",
            defaults={
                'first_name': "Ananya",
                'last_name': "Sharma",
                'role': User.Role.CR,
                'student_id': "IT-2024-080",
                'department': dept_map["IT"],
                'assigned_class': class_map["IT-B"],
                'is_cr': True,
            }
        )
        cr_ananya.set_password("StudentPass123!")
        cr_ananya.save()

        # 10 Students
        students_info = [
            ("Manav", "Barot", "manav@student.campuspulse.edu", "IT-2024-001", "IT", "IT-A"),
            ("Priya", "Patel", "priya@student.campuspulse.edu", "IT-2024-015", "IT", "IT-A"),
            ("Rohan", "Mehta", "rohan@student.campuspulse.edu", "IT-2024-018", "IT", "IT-A"),
            ("Sneha", "Roy", "sneha@student.campuspulse.edu", "IT-2024-088", "IT", "IT-B"),
            ("Amit", "Singh", "amit@student.campuspulse.edu", "CE-2024-012", "CE", "CE-A"),
            ("Kavita", "Shah", "kavita@student.campuspulse.edu", "CE-2024-034", "CE", "CE-A"),
            ("Deepak", "Nair", "deepak@student.campuspulse.edu", "ME-2024-009", "ME", None),
            ("Pooja", "Jadhav", "pooja@student.campuspulse.edu", "ME-2024-023", "ME", None),
            ("Nikhil", "Goyal", "nikhil@student.campuspulse.edu", "CIVIL-2024-004", "CIVIL", None),
            ("Anjali", "Desai", "anjali@student.campuspulse.edu", "CIVIL-2024-019", "CIVIL", None),
        ]
        manav_user = None
        for first, last, email, sid, dept_code, class_code in students_info:
            std, _ = User.objects.get_or_create(
                email=email,
                defaults={
                    'first_name': first,
                    'last_name': last,
                    'student_id': sid,
                    'role': User.Role.STUDENT,
                    'department': dept_map[dept_code],
                    'assigned_class': class_map.get(class_code) if class_code else None,
                }
            )
            std.set_password("StudentPass123!")
            std.save()
            if email.startswith("manav"):
                manav_user = std

        # 5. Sample Notices
        # Emergency Notice
        emerg, _ = Notice.objects.get_or_create(
            title="COLLEGE CLOSED TODAY: Severe Weather & Flash Flood Warning",
            defaults={
                'description': "Torrential rainfall has caused waterlogging across major access roads. All lectures and mid-term assessments scheduled for today stand suspended. Campus Gate 2 & 4 are barricaded. Hostellers must remain indoors.",
                'category': cat_map["emergency"],
                'priority': Notice.Priority.EMERGENCY,
                'status': Notice.Status.PUBLISHED,
                'audience_scope': Notice.AudienceScope.COLLEGE,
                'author': super_admin,
                'is_emergency': True,
                'is_pinned': True,
                'published_at': timezone.now(),
            }
        )

        # Academic Class Notice
        Notice.objects.get_or_create(
            title="Data Structures Lab & Unit Test Evaluation Schedule",
            defaults={
                'description': "Unit test for IT-A Data Structures will be conducted during Monday 10:00 AM lab session in Turing Computing Lab (Room 304). Bring printed logs and IDE setup.",
                'category': cat_map["academic"],
                'priority': Notice.Priority.HIGH,
                'status': Notice.Status.PUBLISHED,
                'audience_scope': Notice.AudienceScope.CLASS,
                'target_department': dept_map["IT"],
                'target_class': class_map["IT-A"],
                'author': faculty1,
                'is_pinned': True,
                'published_at': timezone.now(),
            }
        )

        # Placement Notice
        Notice.objects.get_or_create(
            title="Microsoft & Google Campus Hiring Drive 2026 - Registration Open",
            defaults={
                'description': "Training and Placement cell invites pre-final and final year engineers. Minimum CGPA threshold is 7.5. Online screening test on Oct 12th.",
                'category': cat_map["placement"],
                'priority': Notice.Priority.IMPORTANT,
                'status': Notice.Status.PUBLISHED,
                'audience_scope': Notice.AudienceScope.COLLEGE,
                'author': dept_admin,
                'published_at': timezone.now(),
            }
        )

        # 6. Personal Notes for Manav
        if manav_user:
            PersonalNote.objects.get_or_create(
                user=manav_user,
                title="DBMS Viva Preparation",
                defaults={
                    'content': "1. Revise normalization (1NF to BCNF).\n2. Practice SQL joins and subqueries.\n3. ACID properties.",
                    'is_pinned': True,
                    'color_tag': "#3b82f6"
                }
            )

        self.stdout.write(self.style.SUCCESS("CampusPulse database successfully seeded with all 5 roles, classes, and notices!"))
