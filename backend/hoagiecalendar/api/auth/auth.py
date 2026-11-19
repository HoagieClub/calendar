"""Authenticate API requests using Auth0 access tokens."""

from functools import lru_cache
from urllib.parse import urlparse

import jwt
from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.backends import BaseBackend
from django.contrib.auth.hashers import make_password
from django.contrib.auth.validators import UnicodeUsernameValidator
from django.core.exceptions import ImproperlyConfigured, ValidationError
from django.core.validators import validate_email
from django.db import IntegrityError, transaction
from jwt import PyJWKClient
from rest_framework import exceptions
from rest_framework.authentication import BaseAuthentication, get_authorization_header


class NoPasswordBackend(BaseBackend):
	"""Disable Django's local password authentication and session login."""


class AuthenticationServiceUnavailable(exceptions.APIException):
	status_code = 503
	default_detail = "Authentication service is unavailable."


@lru_cache(maxsize=4)
def jwks_client(issuer):
	# PyJWKClient caches the key set and refreshes it when a key ID is unknown.
	return PyJWKClient(f"{issuer}.well-known/jwks.json", timeout=5, lifespan=3600)


class Auth0JWTAuthentication(BaseAuthentication):
	def authenticate(self, request):
		header = get_authorization_header(request).split()
		if not header or header[0].lower() != b"bearer":
			return None
		if len(header) != 2:
			raise exceptions.AuthenticationFailed("Invalid bearer token header.")
		try:
			token = header[1].decode("ascii")
		except UnicodeDecodeError as exc:
			raise exceptions.AuthenticationFailed("Invalid bearer token header.") from exc

		claims = self.verify_token(token)
		user = self.get_user(claims)
		return user, claims

	def verify_token(self, token):
		domain = settings.AUTH0_DOMAIN
		audience = settings.AUTH0_AUDIENCE
		parsed = urlparse(f"https://{domain}")
		if (
			not audience
			or not domain
			or parsed.netloc != domain
			or not parsed.hostname
			or parsed.username
			or parsed.password
			or parsed.path
			or parsed.query
			or parsed.fragment
		):
			raise ImproperlyConfigured("Set AUTH0_DOMAIN to a hostname and configure AUTH0_AUDIENCE.")
		issuer = f"https://{domain}/"

		try:
			key = jwks_client(issuer).get_signing_key_from_jwt(token)
			return jwt.decode(
				token,
				key.key,
				algorithms=["RS256"],
				audience=audience,
				issuer=issuer,
				options={"require": ["exp", "iss", "aud", "sub"]},
			)
		except jwt.PyJWKClientConnectionError as exc:
			raise AuthenticationServiceUnavailable() from exc
		except jwt.PyJWTError as exc:
			raise exceptions.AuthenticationFailed("Invalid or expired access token.") from exc

	def get_user(self, claims):
		subject = claims.get("sub")
		if not isinstance(subject, str) or not subject or len(subject) > 255:
			raise exceptions.AuthenticationFailed("Invalid token subject.")
		if claims.get("gty") == "client-credentials":
			raise exceptions.AuthenticationFailed("A user access token is required.")

		email = claims.get("https://hoagie.io/email")
		name = claims.get("https://hoagie.io/name")
		if not isinstance(email, str) or len(email) > 254 or not isinstance(name, str) or not name.strip():
			raise exceptions.AuthenticationFailed("Required user profile claims are missing or invalid.")
		username = email.partition("@")[0]
		try:
			validate_email(email)
			if not username or len(username) > 150:
				raise ValidationError("Invalid netid.")
			UnicodeUsernameValidator()(username)
		except ValidationError as exc:
			raise exceptions.AuthenticationFailed("Invalid email or netid claim.") from exc
		name_parts = name.strip().split(maxsplit=1)
		first_name = name_parts[0][:150]
		last_name = name_parts[1][:150] if len(name_parts) > 1 else ""

		# The verified subject owns the account. Never link accounts by email or netid.
		try:
			with transaction.atomic():
				user, _ = get_user_model().objects.get_or_create(
					auth0_subject=subject,
					defaults={
						"username": username,
						"email": email,
						"first_name": first_name,
						"last_name": last_name,
						"password": make_password(None),
					},
				)
				if not user.is_active:
					raise exceptions.AuthenticationFailed("User account is inactive.")
				user.username = username
				user.email = email
				user.first_name = first_name
				user.last_name = last_name
				user.save(update_fields=["username", "email", "first_name", "last_name"])
		except IntegrityError as exc:
			raise exceptions.AuthenticationFailed("This netid is already associated with another account.") from exc
		return user

	def authenticate_header(self, request):
		return "Bearer"
