from rest_framework import serializers, status
from rest_framework.response import Response
from rest_framework.views import APIView

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
        fields = ["start", "end", "name", "location", "description", 
                  "host", "owner", "category", "from_mail", "ordering"]
        read_only_fields = ["owner", "created_at", "updated_at"]
        

class EventView(APIView):
    def get(self, request) -> Response:
        start_time = request.query_params.get("start_time")
        end_time = request.query_params.get("end_time")

        # return an error if start_time or end_time are not in the request
        if not start_time or not end_time:
            return Response(
                {"detail": "Both start_time and end_time query parameters are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # get all events that overlap with the given time interval
        # (event end is after the start of the range, and event start is before the end of the range)
        queryset = Event.objects.filter(end__gt=start_time, start__lt=end_time).order_by("-created_at")

        # filter by matching category IDs (allow multiple categories)
        category_ids = request.query_params.getlist("category_id")
        if category_ids:
            queryset = queryset.filter(category__id__in=category_ids)

        # make sure events returned are unique (in case of multiple category matches)
        queryset = queryset.distinct()

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
