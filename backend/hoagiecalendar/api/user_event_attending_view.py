from rest_framework import status
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from hoagiecalendar.models.user import User

from ..models.event import Event
from .event_views import EventSerializer


def add_or_remove_attendee_from_event(event_id: str | None, user: User, add: bool) -> Response:
	if not event_id:
		return Response({"error": "invalid request: no event_id provided"}, status=status.HTTP_400_BAD_REQUEST)

	try:
		event = Event.objects.get(pk=event_id)
		if add:
			event.attendees.add(user)
			serializer = EventSerializer(event)

			return Response({"event": serializer.data}, status=status.HTTP_200_OK)
		else:
			event.attendees.remove(user)

			return Response(status=status.HTTP_204_NO_CONTENT)
	except ValueError:
		return Response({"error": "invalid event_id"}, status=status.HTTP_400_BAD_REQUEST)
	except Event.DoesNotExist:
		return Response({"error": "event not found"}, status=status.HTTP_404_NOT_FOUND)
	except Exception as _:
		# TODO: Log exception once logging is set up
		return Response({"error": "an internal error has occurred"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UserEventAttendingView(APIView):
	def post(self, request: Request) -> Response:
		return add_or_remove_attendee_from_event(
			event_id=request.query_params.get("event_id"),
			user=request.user,
			add=True,
		)

	def delete(self, request: Request) -> Response:
		return add_or_remove_attendee_from_event(
			event_id=request.query_params.get("event_id"),
			user=request.user,
			add=False,
		)
