from django.shortcuts import get_object_or_404
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
        start_time = request.query_params.get('start_time')
        end_time = request.query_params.get('end_time')
        category_id = request.query_params.get('category_id')

        # get all events that start within the given time interval
        queryset = Event.objects.filter(start__gte=start_time, end__lte=end_time).order_by("-created_at")

        # filter by matching category (assume only one category for now)
        if category_id:
            queryset = queryset.filter(category__id=category_id)

        serializer = EventSerializer(queryset, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request) -> Response:
        # Logic to create an event
        pass


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
