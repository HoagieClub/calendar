# Hoagie Calendar Backend

This is the backend directory for Hoagie Calendar.

## Auth0 authentication

Create an Auth0 API configured to issue RS256-signed access tokens. Set these
backend environment variables:

- `AUTH0_DOMAIN`: the Auth0 tenant domain without a scheme or trailing slash
  (for example, `your-tenant.us.auth0.com`).
- `AUTH0_AUDIENCE`: the Auth0 API identifier. Set the same audience in the
  frontend so its Auth0 client requests a token for this API.
- `CORS_ALLOWED_ORIGINS`: comma-separated exact frontend origins to allow in
  addition to `http://localhost:3000`, `https://calendar.hoagie.io`, and
  `https://calendar-preview.hoagie.io`. Include any other Vercel origins used
  by your deployment.

Run `uv sync` and `uv run manage.py migrate` after configuring the database.
The first valid bearer token for a subject creates a local user with an unusable
password. The username is the email local part, and email and name are refreshed
from the `https://hoagie.io/email` and `https://hoagie.io/name` access-token
claims on each request. Configure the tenant to emit these claims. Accounts are
identified by Auth0 subject; a netid collision is rejected rather than linking
accounts automatically. Only configure this API for
user-delegated access; machine-to-machine access is not supported. Local Django
password authentication is disabled. The built-in Django admin cannot be used
until a separate Auth0 SSO integration is added for it.

Requests use `Authorization: Bearer <access token>`. See `EventView.get_permissions`
in `hoagiecalendar/api/event_views.py` for a route guard: event reads are public,
while POST requires authentication and assigns `request.user` as the owner. Event
updates and deletes require the owner; `/user/events/` requires authentication.
The Next.js proxy currently requires a session even for its event reads.
The DRF authentication class is `hoagiecalendar/api/auth/auth.py`, following
Hoagie Mail's `Auth0JWTAuthentication` and `verify_token` structure. NetIDs come
from the email claim, not from parsing the subject.

The committed initial migration was recovered from this checkout's previously
ignored local migrations. Existing databases may have different migration
histories or schemas: inspect and reconcile those before running migrations.
The follow-up migration preserves the old attendees table while removing it from
Django's model state; it does not delete its data.
