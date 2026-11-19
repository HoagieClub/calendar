from datetime import timedelta

from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from .models.event import Event
from .models.user import User


class EventOwnershipTests(APITestCase):
	"""PUT and DELETE /event/<id>/ are limited to the event's owner (CALR-28)."""

	@classmethod
	def setUpTestData(cls) -> None:
		cls.owner = User.objects.create_user(username="owner", password="x")
		cls.stranger = User.objects.create_user(username="stranger", password="x")

	def setUp(self) -> None:
		start = timezone.now() + timedelta(days=1)
		self.event = Event.objects.create(
			name="Robotics Demo Night",
			host="Princeton Robotics Club",
			location="Friend Center 101",
			description="Details.",
			start=start,
			end=start + timedelta(hours=2),
			owner=self.owner,
			from_mail=True,
		)
		self.url = f"/event/{self.event.id}/"

	def _payload(self, **overrides) -> dict:
		payload = {
			"name": "Robotics Demo Night (moved)",
			"host": "Princeton Robotics Club",
			"location": "Friend Center 008",
			"description": "New room.",
			"start": self.event.start.isoformat(),
			"end": self.event.end.isoformat(),
			"category": [],
		}
		payload.update(overrides)
		return payload

	# owner

	def test_owner_can_edit(self) -> None:
		self.client.force_authenticate(self.owner)
		response = self.client.put(self.url, self._payload(), format="json")
		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.event.refresh_from_db()
		self.assertEqual(self.event.name, "Robotics Demo Night (moved)")
		self.assertEqual(self.event.location, "Friend Center 008")

	def test_owner_can_delete(self) -> None:
		self.client.force_authenticate(self.owner)
		response = self.client.delete(self.url)
		self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
		self.assertFalse(Event.objects.filter(id=self.event.id).exists())

	def test_put_cannot_change_owner_or_from_mail(self) -> None:
		self.client.force_authenticate(self.owner)
		response = self.client.put(self.url, self._payload(owner=self.stranger.id, from_mail=False), format="json")
		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.event.refresh_from_db()
		self.assertEqual(self.event.owner, self.owner)
		self.assertTrue(self.event.from_mail)
		# the rest of the edit still goes through.
		self.assertEqual(self.event.name, "Robotics Demo Night (moved)")

	# stranger

	def test_stranger_gets_403_on_put(self) -> None:
		self.client.force_authenticate(self.stranger)
		response = self.client.put(self.url, self._payload(), format="json")
		self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
		self.event.refresh_from_db()
		self.assertEqual(self.event.name, "Robotics Demo Night")

	def test_stranger_gets_403_on_delete(self) -> None:
		self.client.force_authenticate(self.stranger)
		response = self.client.delete(self.url)
		self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
		self.assertTrue(Event.objects.filter(id=self.event.id).exists())

	def test_stranger_can_still_read(self) -> None:
		self.client.force_authenticate(self.stranger)
		response = self.client.get(self.url)
		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertEqual(response.json()["name"], "Robotics Demo Night")

	# logged out

	def test_anonymous_gets_403_on_put_and_delete(self) -> None:
		self.assertEqual(self.client.put(self.url, self._payload(), format="json").status_code, 403)
		self.assertEqual(self.client.delete(self.url).status_code, 403)
		self.assertTrue(Event.objects.filter(id=self.event.id).exists())

	def test_missing_event_is_404_not_403(self) -> None:
		self.client.force_authenticate(self.stranger)
		self.assertEqual(self.client.delete("/event/999999/").status_code, status.HTTP_404_NOT_FOUND)
