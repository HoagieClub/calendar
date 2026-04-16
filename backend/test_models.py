from django.test import TestCase

from hoagiecalendar.api.event_views import EventSerializer
from hoagiecalendar.models.event import Event
from hoagiecalendar.models.user import User


# Test creating model and getting attendees count.
class EventModelTestCase(TestCase):
	def setUp(self):
		self.owner = User.objects.create_user(username="testuser", email="test@hoagie.io", password="testpass")

		self.event = Event.objects.create(
			start="2024-01-01T10:00:00Z",
			end="2024-01-01T12:00:00Z",
			name="Test Event",
			location="Test Location",
			description="Test Description",
			host="Test Host",
			owner=self.owner,
		)

	def test_attending_count(self):
		event = Event.objects.get(pk=self.event.pk)

		self.assertEqual(event.attending_count(), 0)

		event.attendees.add(self.owner)

		self.assertEqual(event.attending_count(), 1)

	def test_serializing(self):
		serializer = EventSerializer(self.event)
		deserializer = EventSerializer(data=serializer.data)

		self.assertTrue(deserializer.is_valid(), str(deserializer.errors))
