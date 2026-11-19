from datetime import datetime, timedelta, timezone
from types import SimpleNamespace
from unittest.mock import patch

import jwt
from cryptography.hazmat.primitives.asymmetric import rsa
from django.contrib.auth import authenticate, get_user_model
from django.test import TestCase, override_settings
from rest_framework.test import APIClient

from .models import Event


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
			"name": "Campus event", "location": "Frist", "host": "Club",
			"start": "2026-11-20T12:00:00Z", "end": "2026-11-20T13:00:00Z",
			"description": "Hello",
		}

	def test_create_requires_authentication_and_provisions_owner_once(self):
		self.assertEqual(self.client.post("/event/", self.event_data(), format="json").status_code, 401)
		self.authorize(self.token())
		response = self.client.post("/event/", self.event_data(), format="json")
		self.assertEqual(response.status_code, 201)
		user = get_user_model().objects.get(auth0_subject="auth0|alice")
		self.assertEqual((user.username, user.email, user.first_name, user.last_name),
			("alice", "alice@princeton.edu", "Alice", "Smith"))
		self.assertFalse(user.has_usable_password())
		self.assertEqual(Event.objects.get().owner, user)
		self.assertEqual(self.client.get("/user/events/").status_code, 200)
		self.assertEqual(get_user_model().objects.count(), 1)

	def test_invalid_tokens_cannot_provision_users(self):
		for token in (
			self.token(aud="other-api"), self.token(iss="https://other.example/"),
			self.token(exp=datetime.now(timezone.utc) - timedelta(seconds=1)),
			self.token(gty="client-credentials"), "invalid.token.value",
		):
			with self.subTest(token=token):
				self.authorize(token)
				self.assertEqual(self.client.post("/event/", self.event_data(), format="json").status_code, 401)
		self.assertFalse(get_user_model().objects.exists())

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

	def test_local_password_login_is_disabled(self):
		get_user_model().objects.create_user(username="local", password="example-password")
		self.assertIsNone(authenticate(username="local", password="example-password"))

	def test_profile_changes_and_netid_conflicts(self):
		self.authorize(self.token())
		self.assertEqual(self.client.get("/user/events/").status_code, 200)
		self.authorize(self.token(**{"https://hoagie.io/email": "alice2@princeton.edu", "https://hoagie.io/name": "Alice Jones"}))
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
		response = self.client.options("/event/", HTTP_ORIGIN="http://localhost:3000",
			HTTP_ACCESS_CONTROL_REQUEST_METHOD="POST", HTTP_ACCESS_CONTROL_REQUEST_HEADERS="authorization,content-type")
		self.assertEqual(response.status_code, 200)
		self.assertEqual(response["Access-Control-Allow-Origin"], "http://localhost:3000")
		response = self.client.options("/event/", HTTP_ORIGIN="https://calendar-preview.hoagie.io",
			HTTP_ACCESS_CONTROL_REQUEST_METHOD="POST", HTTP_ACCESS_CONTROL_REQUEST_HEADERS="authorization")
		self.assertEqual(response["Access-Control-Allow-Origin"], "https://calendar-preview.hoagie.io")
