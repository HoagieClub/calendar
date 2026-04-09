from rest_framework import status
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from ..models.event import Event


class UserEventAttendingView(APIView):
	def post(self, request: Request) -> Response:
		event_id = request.query_params.get("event_id")

		if not event_id:
			return Response({"error": "invalid request: no event_id provided"}, status=status.HTTP_400_BAD_REQUEST)

		try:
			Event.objects.get(pk=event_id).attendees.add(request.user)
		except Event.DoesNotExist:
			return Response({"error": "event not found"}, status=status.HTTP_400_BAD_REQUEST)
		except Exception as e:
			return Response(
				{"error": f"an internal error has occured: {e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
			)

		return Response({"message": "added to event attendees (if not already added)"}, status=status.HTTP_201_CREATED)

	def delete(self, request: Request) -> Response:
		event_id = request.query_params.get("event_id")

		if not event_id:
			return Response({"error": "invalid request: no event_id provided"}, status=status.HTTP_400_BAD_REQUEST)

		try:
			Event.objects.get(pk=event_id).attendees.remove(request.user)
		except Event.DoesNotExist:
			return Response({"error": "event not found"}, status=status.HTTP_400_BAD_REQUEST)
		except Exception as e:
			return Response(
				{"error": f"an internal error has occured: {e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
			)

		return Response(
			{"message": "removed from event attendees (if user was an attendee)"}, status=status.HTTP_201_CREATED
		)
