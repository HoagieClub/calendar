from datetime import datetime, timedelta, timezone
from types import SimpleNamespace
from unittest.mock import patch

import jwt
from cryptography.hazmat.primitives.asymmetric import rsa
from django.contrib.auth import authenticate, get_user_model
from django.db import connection
from django.db.migrations.executor import MigrationExecutor
from django.test import TestCase, TransactionTestCase, override_settings
from rest_framework.test import APIClient

from .models import Event


class AttendeesMigrationTests(TransactionTestCase):
	def test_attendees_table_is_removed_for_fresh_and_existing_migrations(self):
		initial = ("hoagiecalendar", "0001_initial")
		second = ("hoagiecalendar", "0002_alter_event_options_remove_event_attendees_and_more")
		latest = ("hoagiecalendar", "0003_remove_legacy_attendees_table")
		self.addCleanup(lambda: MigrationExecutor(connection).migrate([latest]))
		executor = MigrationExecutor(connection)
		executor.migrate([initial])
		old_apps = executor.loader.project_state([initial]).apps
		old_user = old_apps.get_model("hoagiecalendar", "User").objects.create(username="alice")
		old_event_model = old_apps.get_model("hoagiecalendar", "Event")
		event = old_event_model.objects.create(
			owner_id=old_user.pk, name="Event", location="Frist", host="Club", description="",
			start="2026-11-20T12:00:00Z", end="2026-11-20T13:00:00Z",
		)
		event.attendees.add(old_user)
		MigrationExecutor(connection).migrate([second])
		self.assertNotIn("Event_attendees", connection.introspection.table_names())

		# Simulate a database where the previous, state-only version of 0002 ran.
		through = old_event_model._meta.get_field("attendees").remote_field.through
		with connection.schema_editor() as editor:
			editor.create_model(through)
		through.objects.create(event_id=event.pk, user_id=old_user.pk)
		MigrationExecutor(connection).migrate([latest])
		self.assertNotIn("Event_attendees", connection.introspection.table_names())
		Event.objects.get(pk=event.pk).delete()
		get_user_model().objects.get(pk=old_user.pk).delete()


@override_settings(AUTH0_DOMAIN="example.auth0.com", AUTH0_AUDIENCE="calendar-api")
class Auth0AuthenticationTests(TestCase):
	@classmethod
	def setUpClass(cls):
		super().setUpClass()
		cls.key = rsa.generate_private_key(public_exponent=65537, key_size=2048)

	def setUp(self):
		self.client = APIClient()
		self.key_patch = patch("hoagiecalendar.api.auth.auth.jwks_client")
		self.mock_jwks = self.key_patch.start()
		self.addCleanup(self.key_patch.stop)
		self.mock_jwks.return_value.get_signing_key_from_jwt.return_value = SimpleNamespace(key=self.key.public_key())

	def token(self, **overrides):
		claims = {
			"sub": "auth0|alice",
			"iss": "https://example.auth0.com/",
			"aud": "calendar-api",
			"exp": datetime.now(timezone.utc) + timedelta(minutes=5),
			"https://hoagie.io/email": "alice@princeton.edu",
			"https://hoagie.io/name": "Alice Smith",
		}
		claims.update(overrides)
		return jwt.encode(claims, self.key, algorithm="RS256", headers={"kid": "test"})

	def authorize(self, token):
		self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

	def event_data(self):
		return {
			"name": "Campus event",
			"location": "Frist",
			"host": "Club",
			"start": "2026-11-20T12:00:00Z",
			"end": "2026-11-20T13:00:00Z",
			"description": "Hello",
		}

	def test_create_requires_authentication_and_provisions_owner_once(self):
		self.assertEqual(self.client.post("/event/", self.event_data(), format="json").status_code, 401)
		self.authorize(self.token())
		response = self.client.post("/event/", self.event_data(), format="json")
		self.assertEqual(response.status_code, 201)
		user = get_user_model().objects.get(auth0_subject="auth0|alice")
		self.assertEqual(
			(user.username, user.email, user.first_name, user.last_name),
			("alice", "alice@princeton.edu", "Alice", "Smith"),
		)
		self.assertFalse(user.has_usable_password())
		self.assertEqual(Event.objects.get().owner, user)
		self.assertEqual(self.client.get("/user/events/").status_code, 200)
		self.assertEqual(get_user_model().objects.count(), 1)

	def test_invalid_tokens_cannot_provision_users(self):
		for token in (
			self.token(aud="other-api"),
			self.token(iss="https://other.example/"),
			self.token(exp=datetime.now(timezone.utc) - timedelta(seconds=1)),
			self.token(gty="client-credentials"),
			"invalid.token.value",
		):
			with self.subTest(token=token):
				self.authorize(token)
				self.assertEqual(self.client.post("/event/", self.event_data(), format="json").status_code, 401)
		self.assertFalse(get_user_model().objects.exists())

	def test_event_reads_require_authentication(self):
		self.authorize(self.token())
		event_id = self.client.post("/event/", self.event_data(), format="json").data["id"]
		list_url = "/event/?start_time=2026-11-20T00:00:00Z&end_time=2026-11-21T00:00:00Z"
		detail_url = f"/event/{event_id}/"
		for url in (list_url, detail_url):
			with self.subTest(url=url):
				self.client.credentials()
				self.assertEqual(self.client.get(url).status_code, 401)
				self.authorize("invalid.token.value")
				self.assertEqual(self.client.get(url).status_code, 401)
				self.authorize(self.token())
				self.assertEqual(self.client.get(url).status_code, 200)

	def test_bad_signature_and_inactive_user_are_rejected(self):
		self.mock_jwks.return_value.get_signing_key_from_jwt.return_value = SimpleNamespace(
			key=rsa.generate_private_key(public_exponent=65537, key_size=2048).public_key()
		)
		self.authorize(self.token())
		self.assertEqual(self.client.get("/user/events/").status_code, 401)
		self.mock_jwks.return_value.get_signing_key_from_jwt.return_value = SimpleNamespace(key=self.key.public_key())
		get_user_model().objects.create_user(username="disabled", auth0_subject="auth0|alice", is_active=False)
		self.assertEqual(self.client.get("/user/events/").status_code, 401)

	def test_only_owner_can_change_event(self):
		self.authorize(self.token())
		event_id = self.client.post("/event/", self.event_data(), format="json").data["id"]
		self.authorize(self.token(sub="auth0|bob", **{"https://hoagie.io/email": "bob@princeton.edu"}))
		self.assertEqual(self.client.delete(f"/event/{event_id}/").status_code, 404)
		self.assertEqual(self.client.put(f"/event/{event_id}/", self.event_data(), format="json").status_code, 404)
		self.authorize(self.token())
		self.assertEqual(self.client.delete(f"/event/{event_id}/").status_code, 204)

	def test_legacy_user_is_linked_and_keeps_event_ownership(self):
		user = get_user_model().objects.create_user(username="alice")
		data = self.event_data()
		event = Event.objects.create(owner=user, **data)
		self.authorize(self.token())
		response = self.client.get("/user/events/")
		self.assertEqual(response.status_code, 200)
		self.assertEqual([item["id"] for item in response.data], [event.id])
		user.refresh_from_db()
		self.assertEqual(user.auth0_subject, "auth0|alice")
		self.assertEqual(get_user_model().objects.count(), 1)
		self.assertEqual(self.client.put(f"/event/{event.id}/", data, format="json").status_code, 200)
		self.assertEqual(self.client.delete(f"/event/{event.id}/").status_code, 204)

	def test_inactive_legacy_user_is_not_linked(self):
		user = get_user_model().objects.create_user(username="alice", is_active=False)
		self.authorize(self.token())
		self.assertEqual(self.client.get("/user/events/").status_code, 401)
		user.refresh_from_db()
		self.assertIsNone(user.auth0_subject)

	def test_local_password_login_is_disabled(self):
		get_user_model().objects.create_user(username="local", password="example-password")
		self.assertIsNone(authenticate(username="local", password="example-password"))

	def test_profile_changes_and_netid_conflicts(self):
		self.authorize(self.token())
		self.assertEqual(self.client.get("/user/events/").status_code, 200)
		self.authorize(
			self.token(**{"https://hoagie.io/email": "alice2@princeton.edu", "https://hoagie.io/name": "Alice Jones"})
		)
		self.assertEqual(self.client.get("/user/events/").status_code, 200)
		user = get_user_model().objects.get(auth0_subject="auth0|alice")
		self.assertEqual((user.username, user.last_name), ("alice2", "Jones"))
		self.authorize(self.token(sub="auth0|other", **{"https://hoagie.io/email": "alice2@other.edu"}))
		self.assertEqual(self.client.get("/user/events/").status_code, 401)
		self.assertEqual(get_user_model().objects.count(), 1)

	def test_missing_profile_claim_is_rejected(self):
		self.authorize(self.token(**{"https://hoagie.io/email": None}))
		self.assertEqual(self.client.get("/user/events/").status_code, 401)
		self.assertFalse(get_user_model().objects.exists())

	def test_cors_preflight(self):
		response = self.client.options(
			"/event/",
			HTTP_ORIGIN="http://localhost:3000",
			HTTP_ACCESS_CONTROL_REQUEST_METHOD="POST",
			HTTP_ACCESS_CONTROL_REQUEST_HEADERS="authorization,content-type",
		)
		self.assertEqual(response.status_code, 200)
		self.assertEqual(response["Access-Control-Allow-Origin"], "http://localhost:3000")
		response = self.client.options(
			"/event/",
			HTTP_ORIGIN="https://calendar-preview.hoagie.io",
			HTTP_ACCESS_CONTROL_REQUEST_METHOD="POST",
			HTTP_ACCESS_CONTROL_REQUEST_HEADERS="authorization",
		)
		self.assertEqual(response["Access-Control-Allow-Origin"], "https://calendar-preview.hoagie.io")
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
