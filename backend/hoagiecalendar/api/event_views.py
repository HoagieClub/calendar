from datetime import datetime

from django.db.models import Q
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.utils.dateparse import parse_datetime
from rest_framework import serializers, status
from rest_framework.response import Response
from rest_framework.views import APIView

from ..models.event import Event


def _parse_query_datetime(value: str) -> datetime | None:
	"""parse an ISO 8601 query parameter into an aware datetime.

	returns None when the value is not a valid datetime.
	values with no time zone attached are interpreted in the project time zone.
	"""
	try:
		parsed = parse_datetime(value)
	except ValueError:
		# well-formed but impossible (e.g. month 13).
		return None
	if parsed is None:
		return None
	if timezone.is_naive(parsed):
		parsed = timezone.make_aware(parsed, timezone.get_current_timezone())
	return parsed


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


class EventView(APIView):
	def get(self, request) -> Response:
		"""return events, either for a time window or for a keyword search.

		two ways to call this endpoint:

		1. time window: pass both ``start_time`` and ``end_time`` (ISO 8601).
		   returns every event that overlaps that window.

		2. keyword search: pass ``q``.
		   returns events whose name, host, location or description contains the text (ignoring case).
		   ``start_time`` and ``end_time`` are optional here.
		   if ``start_time`` is left out it defaults to now, so a search only returns current and future events.
		   ``query`` works the same as ``q``.

		in both cases ``category_id`` can be passed one or more times to keep only
		events in those categories.

		results are sorted by start time.
		"""
		params = request.query_params
		search = (params.get("q") or params.get("query") or "").strip()
		start_time = params.get("start_time")
		end_time = params.get("end_time")

		if not search and (not start_time or not end_time):
			return Response(
				{"error": "Both start_time and end_time query parameters are required unless q is provided."},
				status=status.HTTP_400_BAD_REQUEST,
			)

		# prefetch categories so serializing N events does not run N extra queries.
		queryset = Event.objects.all().prefetch_related("category")

		# lower bound: the caller's start_time, or "now" for a search without start_time.
		if start_time:
			range_start = _parse_query_datetime(start_time)
			if range_start is None:
				return Response({"error": "Invalid start_time datetime."}, status=status.HTTP_400_BAD_REQUEST)
		else:
			range_start = timezone.now()
		# an event overlaps the window if it ends at or after the lower bound...
		queryset = queryset.filter(end__gte=range_start)

		# ...and starts at or before the upper bound, when one is given.
		if end_time:
			range_end = _parse_query_datetime(end_time)
			if range_end is None:
				return Response({"error": "Invalid end_time datetime."}, status=status.HTTP_400_BAD_REQUEST)
			queryset = queryset.filter(start__lte=range_end)

		# filter by matching category IDs (allow multiple categories)
		category_ids = params.getlist("category_id")
		if category_ids:
			queryset = queryset.filter(category__id__in=category_ids)

		if search:
			queryset = queryset.filter(
				Q(name__icontains=search)
				| Q(host__icontains=search)
				| Q(location__icontains=search)
				| Q(description__icontains=search)
			)

		# make sure events returned are unique (in case of multiple category matches)
		queryset = queryset.distinct().order_by("start")
		serializer = EventSerializer(queryset, many=True)
		return Response(serializer.data, status=status.HTTP_200_OK)

	def post(self, request) -> Response:
		serializer = EventSerializer(data=request.data)
		serializer.is_valid(raise_exception=True)
		# saving the event with the user as the owner
		serializer.save(owner=request.user)
		return Response(serializer.data, status=status.HTTP_201_CREATED)


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
		event = get_object_or_404(Event, id=event_id)
		event.delete()
		return Response(status=status.HTTP_204_NO_CONTENT)
