from django.shortcuts import get_object_or_404
from rest_framework import serializers, status
from rest_framework.response import Response
from rest_framework.views import APIView

from ..models.event import Event
from .permissions import IsOwnerOrReadOnly


class EventSerializer(serializers.ModelSerializer):
	name = serializers.CharField(
		max_length=100,
		min_length=3,
		error_messages={
			"blank": "Name must be at least 3 characters.",
			"min_length": "Name must be at least 3 characters.",
			"max_length": "Name must be at most 100 characters.",
		},
	)

	location = serializers.CharField(
		max_length=100,
		min_length=3,
		error_messages={
			"blank": "Location must be at least 3 characters.",
			"min_length": "Location must be at least 3 characters.",
			"max_length": "Location must be at most 100 characters.",
		},
	)

	host = serializers.CharField(
		max_length=100,
		min_length=3,
		error_messages={
			"blank": "Host must be at least 3 characters.",
			"min_length": "Host must be at least 3 characters.",
			"max_length": "Host must be at most 100 characters.",
		},
	)

	class Meta:
		model = Event
		fields = [
			"id",
			"start",
			"end",
			"name",
			"location",
			"description",
			"host",
			"owner",
			"category",
			"from_mail",
			"ordering",
		]
		read_only_fields = ["id", "owner", "created_at", "updated_at"]

	# fields that can be set when an event is created but never changed afterwards.
	# from_mail records where the event came from, so an edit must not flip it.
	immutable_on_update = ("owner", "from_mail")

	def update(self, instance: Event, validated_data: dict) -> Event:
		# ignore these fields like DRF ignores read-only input, instead of rejecting the request.
		for field in self.immutable_on_update:
			validated_data.pop(field, None)
		return super().update(instance, validated_data)


class EventView(APIView):
	def get(self, request) -> Response:
		start_time = request.query_params.get("start_time")
		end_time = request.query_params.get("end_time")

		# return an error if start_time or end_time are not in the request
		if not start_time or not end_time:
			return Response(
				{"error": "Both start_time and end_time query parameters are required."},
				status=status.HTTP_400_BAD_REQUEST,
			)

		# get all events that overlap with the given time interval
		# (event end is after the start of the range, and event start is before the end of the range)
		queryset = Event.objects.filter(end__gte=start_time, start__lte=end_time)

		# filter by matching category IDs (allow multiple categories)
		category_ids = request.query_params.getlist("category_id")
		if category_ids:
			queryset = queryset.filter(category__id__in=category_ids)

		# make sure events returned are unique (in case of multiple category matches)
		queryset = queryset.distinct()

		serializer = EventSerializer(queryset, many=True)

		return Response(serializer.data, status=status.HTTP_200_OK)

	def post(self, request) -> Response:
		serializer = EventSerializer(data=request.data)
		serializer.is_valid(raise_exception=True)
		# saving the event with the user as the owner
		serializer.save(owner=request.user)
		return Response(serializer.data, status=status.HTTP_201_CREATED)


class EventDetailView(APIView):
	# GET is open to everyone; PUT and DELETE are limited to the event's owner (403 otherwise).
	permission_classes = [IsOwnerOrReadOnly]

	def get_event(self, request, event_id) -> Event:
		event = get_object_or_404(Event, id=event_id)
		self.check_object_permissions(request, event)
		return event

	def get(self, request, event_id) -> Response:
		# Logic to get details of an event
		event = self.get_event(request, event_id)
		serializer = EventSerializer(event)
		return Response(serializer.data, status=status.HTTP_200_OK)

	def put(self, request, event_id) -> Response:
		# Logic to update details of an event
		event = self.get_event(request, event_id)
		serializer = EventSerializer(event, data=request.data)
		serializer.is_valid(raise_exception=True)
		serializer.save()
		return Response(serializer.data, status=status.HTTP_200_OK)

	def delete(self, request, event_id) -> Response:
		# Logic to delete an event
		event = self.get_event(request, event_id)
		event.delete()
		return Response(status=status.HTTP_204_NO_CONTENT)
