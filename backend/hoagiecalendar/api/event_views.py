from urllib import request
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import serializers, status
from ..models.event import Event

class EventSerializer(serializers.ModelSerializer):
    name = serializers.CharField(
		max_length=100,
		min_length=3,
		error_messages={
			"required": "Name must be at least 3 characters.",
			"min_length": "Name must be at least 3 characters.",
			"max_length": "Name must be at most 100 characters.",
		},
	)
    location = serializers.CharField(
		max_length=100,
		min_length=3,
		error_messages={
			"required": "Location must be at least 3 characters.",
			"min_length": "Location must be at least 3 characters.",
			"max_length": "Location must be at most 100 characters.",
		},
	)
    host = serializers.CharField(
		max_length=100,
		min_length=3,
		error_messages={
			"required": "Host must be at least 3 characters.",
			"min_length": "Host must be at least 3 characters.",
			"max_length": "Host must be at most 100 characters.",
		},
	)
    class Meta:
        model = Event
        fields = ['start', 'end', 'name', 'location', 'description', 
                  'host', 'owner', 'category', 'from_mail']
        read_only_fields = ['owner']
        

class EventView(APIView):
    def get(self, request) -> Response:
        # Logic to get events
        pass

    def post(self, request) -> Response:
        # Logic to create an event
		# deserialize the request data
        serializer = EventSerializer(data=request.data)
		# add user info (request.user) and save the model instance.
        serializer.save(owner=request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)
  
class EventDetailView(APIView):
    def get(self, request, event_id) -> Response:
        # Logic to get details of an event
        pass

    def put(self, request, event_id) -> Response:
        # Logic to update details of an event
        pass

    def delete(self, request, event_id) -> Response:
        # Logic to delete an event
        pass
