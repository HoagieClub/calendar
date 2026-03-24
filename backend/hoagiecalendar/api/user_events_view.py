from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from ..models.event import Event
from .event_views import EventSerializer

class UserEventsView(APIView):
	# Logic to get events user created
	def get(self, request) -> Response:
		events = Event.objects.filter(owner=request.user)
		serializer = EventSerializer(events, many=True)
		return Response(serializer.data, status=status.HTTP_200_OK)
