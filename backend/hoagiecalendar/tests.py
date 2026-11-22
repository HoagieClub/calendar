from datetime import timedelta

from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from .models.event import Category, Event
from .models.user import User


class EventSearchTests(APITestCase):
	"""GET /event/ keyword search (CALR-15)."""

	@classmethod
	def setUpTestData(cls) -> None:
		cls.owner = User.objects.create_user(username="tester", password="x")
		cls.category = Category.objects.create(name="Academic")
		now = timezone.now()
		cls.future_title = cls._event("Robotics Demo Night", "Princeton Robotics Club", now + timedelta(days=1))
		cls.future_host = cls._event("Jazz Ensemble Concert", "Department of Music", now + timedelta(days=7))
		cls.past = cls._event("Robotics Workshop", "Princeton Robotics Club", now - timedelta(days=7))

	@classmethod
	def _event(cls, name: str, host: str, start, ordering: int = 0) -> Event:
		event = Event.objects.create(
			name=name,
			host=host,
			location="Friend Center 101",
			description="Details.",
			start=start,
			end=start + timedelta(hours=2),
			owner=cls.owner,
			ordering=ordering,
		)
		event.category.add(cls.category)
		return event

	def _names(self, response) -> list[str]:
		return [event["name"] for event in response.json()]

	def test_q_matches_name_case_insensitively_and_excludes_past(self) -> None:
		response = self.client.get("/event/", {"q": "ROBOTICS"})
		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertEqual(self._names(response), ["Robotics Demo Night"])

	def test_q_matches_host(self) -> None:
		response = self.client.get("/event/", {"q": "music"})
		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertEqual(self._names(response), ["Jazz Ensemble Concert"])

	def test_query_alias_is_accepted(self) -> None:
		response = self.client.get("/event/", {"query": "jazz"})
		self.assertEqual(self._names(response), ["Jazz Ensemble Concert"])

	def test_explicit_start_time_includes_past_events_ordered_by_start(self) -> None:
		month_ago = (timezone.now() - timedelta(days=30)).isoformat()
		response = self.client.get("/event/", {"q": "robotics", "start_time": month_ago})
		self.assertEqual(self._names(response), ["Robotics Workshop", "Robotics Demo Night"])

	def test_window_required_without_q(self) -> None:
		response = self.client.get("/event/")
		self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
		self.assertIn("start_time", response.json()["error"])

	def test_invalid_start_time_is_rejected(self) -> None:
		response = self.client.get("/event/", {"q": "robotics", "start_time": "2026-13-01T00:00:00Z"})
		self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

	def test_same_start_time_sorts_by_ordering(self) -> None:
		start = timezone.now() + timedelta(days=2)
		self._event("Second at 7pm", "Club B", start, ordering=1)
		self._event("First at 7pm", "Club A", start, ordering=0)
		response = self.client.get("/event/", {"q": "7pm"})
		self.assertEqual(self._names(response), ["First at 7pm", "Second at 7pm"])

	def test_window_without_q_still_works(self) -> None:
		now = timezone.now()
		response = self.client.get(
			"/event/",
			{"start_time": (now - timedelta(days=30)).isoformat(), "end_time": (now + timedelta(days=30)).isoformat()},
		)
		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertEqual(len(response.json()), 3)

class EventOwnerTests(APITestCase):
	"""GET expose creator netid and email (CALR-24)."""
	
	@classmethod
	def setUpTestData(cls) -> None:
		cls.owner = User.objects.create_user(
            username="abc123",
            email="abc123@princeton.edu",
            password="testpassword123",
        )

		cls.start = timezone.now() + timedelta(days=1)
		cls.event = Event.objects.create(
            name="Test Event",
            start=cls.start,
            end=cls.start + timedelta(hours=1),
            location="Test Location",
            description="Test Description",
            host="Test Host",
            owner=cls.owner,
        )

	def test_event_detail_exposes_owner_fields(self) -> None:
		response = self.client.get(f"/event/{self.event.id}/")

		self.assertEqual(response.status_code, status.HTTP_200_OK)

		data = response.json()
		self.assertEqual(data["owner_netid"], "abc123")
		self.assertEqual(data["owner_email"], "abc123@princeton.edu")
		self.assertNotIn("owner", data)

	def test_event_list_exposes_owner_fields(self) -> None:
		response = self.client.get(
            "/event/",
            {
                "start_time": (self.start - timedelta(minutes=1)).isoformat(),
                "end_time": (self.start + timedelta(hours=2)).isoformat(),
            },
        )

		self.assertEqual(response.status_code, status.HTTP_200_OK)

		events = response.json()
		self.assertEqual(len(events), 1)
		self.assertEqual(events[0]["owner_netid"], "abc123")
		self.assertEqual(events[0]["owner_email"], "abc123@princeton.edu")
		self.assertNotIn("owner", events[0])
