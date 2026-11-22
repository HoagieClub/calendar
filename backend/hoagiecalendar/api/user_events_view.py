from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from ..models.event import Event
from .event_views import EventSerializer, with_is_saved


class UserEventsView(APIView):
	# Logic to get events user created
	def get(self, request) -> Response:
		events = with_is_saved(Event.objects.filter(owner=request.user).prefetch_related("category"), request.user)
		serializer = EventSerializer(events, many=True)
		return Response(serializer.data, status=status.HTTP_200_OK)


class UserSavedEventsView(APIView):
	permission_classes = [IsAuthenticated]

	def get(self, request) -> Response:
		events = with_is_saved(request.user.saved_events.prefetch_related("category"), request.user)
		return Response(EventSerializer(events, many=True).data, status=status.HTTP_200_OK)
