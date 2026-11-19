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
identified by Auth0 subject. On first sign-in, an existing user with the same
netid and no Auth0 subject is linked; a user already linked to another subject
is rejected. This assumes the tenant issues the email claim only for the owner
of that netid; ensure its SSO policy enforces that assumption before enabling
automatic linking. Only configure this API for
user-delegated access; machine-to-machine access is not supported. Local Django
password authentication is disabled. The built-in Django admin cannot be used
until a separate Auth0 SSO integration is added for it.

Requests use `Authorization: Bearer <access token>`. Event reads and creation
require authentication, and creation assigns `request.user` as the owner. Event
updates and deletes require the owner; `/user/events/` requires authentication.
The DRF authentication class is `hoagiecalendar/api/auth/auth.py`, following
Hoagie Mail's `Auth0JWTAuthentication` and `verify_token` structure. NetIDs come
from the email claim, not from parsing the subject.

### Adding an authenticated route

DRF requires authentication by default. A view can make that guard explicit:

```python
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView


class MyProfileView(APIView):
	permission_classes = [IsAuthenticated]

	def get(self, request):
		return Response({
			"netid": request.user.username,
			"email": request.user.email,
		})
```

Import the view and register it in `config/urls.py`:

```python
path("user/profile/", MyProfileView.as_view(), name="user-profile"),
```

DRF validates the `Authorization: Bearer <access token>` header before the
handler runs, and sets `request.user` to the corresponding Django user. Missing
or invalid credentials receive a 401. All routes require login for the MVP.
When changing a specific object, also check that `request.user` is allowed to
change it; authentication alone does not establish ownership.

The committed initial migration was recovered from this checkout's previously
ignored local migrations. Existing databases may have different migration
histories or schemas: inspect and reconcile those before running migrations.
The follow-up migrations drop the old attendees table, including any data in
it. Export any attendee data you need before migrating. A cleanup migration also
removes the table on databases that applied the earlier state-only migration.
