from django.db.models import Q
from django.shortcuts import get_object_or_404
from django.utils import timezone as dj_tz
from django.utils.dateparse import parse_datetime
from rest_framework import serializers, status
from rest_framework.response import Response
from rest_framework.views import APIView

from ..models.event import Event


def _parse_query_datetime(value: str):
	dt = parse_datetime(value)
	if dt is None:
		return None
	if dj_tz.is_naive(dt):
		dt = dj_tz.make_aware(dt, dj_tz.get_current_timezone())
	return dt


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
		fields = ["id", "start", "end", "name", "location", "description", "host", "owner", "category", "from_mail"]
		read_only_fields = ["id", "owner"]


class EventView(APIView):
	def get(self, request) -> Response:
		qs = Event.objects.all().prefetch_related("category")

		range_start = request.query_params.get("start")
		range_end = request.query_params.get("end")
		if range_start is not None:
			dt_start = _parse_query_datetime(range_start)
			if dt_start is None:
				return Response({"detail": "Invalid 'start' datetime."}, status=status.HTTP_400_BAD_REQUEST)
			qs = qs.filter(end__gt=dt_start)
		if range_end is not None:
			dt_end = _parse_query_datetime(range_end)
			if dt_end is None:
				return Response({"detail": "Invalid 'end' datetime."}, status=status.HTTP_400_BAD_REQUEST)
			qs = qs.filter(start__lt=dt_end)

		query_text = request.query_params.get("query")
		if query_text:
			q_stripped = query_text.strip()
			if q_stripped:
				qs = qs.filter(
					Q(name__icontains=q_stripped)
					| Q(location__icontains=q_stripped)
					| Q(description__icontains=q_stripped)
					| Q(host__icontains=q_stripped)
				)

		serializer = EventSerializer(qs.order_by("start"), many=True)
		return Response(serializer.data, status=status.HTTP_200_OK)

	def post(self, request) -> Response:
		# Logic to create an event
		pass


class EventDetailView(APIView):
	def get(self, request, event_id) -> Response:
		# Logic to get details of an event
		event = get_object_or_404(Event, id=event_id)
		serializer = EventSerializer(event)
		return Response(serializer.data, status=status.HTTP_200_OK)

	def put(self, request, event_id) -> Response:
		# Logic to update details of an event
		event = get_object_or_404(Event, id=event_id)
		serializer = EventSerializer(event, data=request.data)
		serializer.is_valid(raise_exception=True)
		serializer.save()
		return Response(serializer.data, status=status.HTTP_200_OK)

	def delete(self, request, event_id) -> Response:
		# Logic to delete an event
		pass
