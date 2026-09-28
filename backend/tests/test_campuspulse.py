from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from apps.departments.models import Department
from apps.classes.models import CollegeClass
from apps.notices.models import NoticeCategory, Notice
from apps.notes.models import PersonalNote

User = get_user_model()

class CampusPulsePermissionTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.dept = Department.objects.create(name="Information Technology", code="IT")
        self.class_it_a = CollegeClass.objects.create(name="IT-A", department=self.dept, year=2, semester=3)
        self.category = NoticeCategory.objects.create(name="Academic", slug="academic")

        # Create Student
        self.student = User.objects.create_user(
            email="student@campuspulse.edu",
            password="TestPassword123!",
            role=User.Role.STUDENT,
            department=self.dept,
            assigned_class=self.class_it_a
        )

        # Create CR
        self.cr = User.objects.create_user(
            email="cr@campuspulse.edu",
            password="TestPassword123!",
            role=User.Role.CR,
            is_cr=True,
            department=self.dept,
            assigned_class=self.class_it_a
        )

        # Create Faculty
        self.faculty = User.objects.create_user(
            email="faculty@campuspulse.edu",
            password="TestPassword123!",
            role=User.Role.FACULTY,
            department=self.dept
        )

    def test_student_cannot_publish_notice_directly(self):
        self.client.force_authenticate(user=self.student)
        payload = {
            "title": "Unauthorized Student Notice",
            "description": "Attempting direct publish",
            "category": self.category.id,
            "priority": "NORMAL"
        }
        response = self.client.post("/api/notices/", payload)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_cr_cannot_create_emergency_alert(self):
        self.client.force_authenticate(user=self.cr)
        payload = {
            "title": "False Emergency Alarm",
            "description": "CR trying to bypass rules",
            "category": self.category.id,
            "priority": "EMERGENCY"
        }
        response = self.client.post("/api/notices/", payload)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Class Representatives are not permitted", str(response.data))

    def test_cr_notice_goes_to_pending_approval(self):
        self.client.force_authenticate(user=self.cr)
        payload = {
            "title": "Class IT-A Lab Reschedule",
            "description": "Please bring logs on Monday",
            "category": self.category.id,
            "priority": "NORMAL"
        }
        response = self.client.post("/api/notices/", payload)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        notice = Notice.objects.get(id=response.data["id"])
        self.assertEqual(notice.status, Notice.Status.PENDING_APPROVAL)
        self.assertTrue(notice.is_cr_submission)
        self.assertEqual(notice.target_class, self.class_it_a)

    def test_personal_notes_strict_privacy_isolation(self):
        # Note for Student
        PersonalNote.objects.create(user=self.student, title="Student Secret Note", content="Viva answers")

        # Authenticate as CR or another student
        self.client.force_authenticate(user=self.cr)
        response = self.client.get("/api/notes/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # CR must not see the student's note
        self.assertEqual(len(response.data["results"] if "results" in response.data else response.data), 0)
