from typing import cast

from django.db import models
from rest_framework import status
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from ..models.event import AnnotatedEvent, Event


class EventAttendeeView(APIView):
    def get(self, request: Request) -> Response:
        event_id = request.query_params.get("event_id")
        event_ids = request.query_params.get("event_ids")

        if event_id:
            event = cast(AnnotatedEvent, Event.objects.annotate(attending=models.Count("attending")).get(pk=event_id))

            return Response({"attendee_count": event.attending_count}, status=status.HTTP_200_OK)

        if event_ids:
            event_ids = event_ids.split(",")
            events = cast(list[AnnotatedEvent], list(Event.objects.filter(pk__in=event_ids)))
            result = {event.pk: event.attending_count for event in events}

            return Response(result, status=status.HTTP_200_OK)

        return Response(
            {"error": "invalid request: no event_id or event_ids provided"}, status=status.HTTP_400_BAD_REQUEST
        )
    
    def post(self, request: Request) -> Response:
        event_id = request.query_params.get("event_id")

        if not event_id:
            return Response({"error": "invalid request: no event_id provided"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            Event.objects.get(pk=event_id).attendees.add(request.user)
        except Event.DoesNotExist:
            ...

        return Response({"message": "added to event attendees (if not already added)"}, status=status.HTTP_201_CREATED)
    
    def delete(self, request: Request) -> Response:
        event_id = request.query_params.get("event_id")

        if not event_id:
            return Response({"error": "invalid request: no event_id provided"}, status=status.HTTP_400_BAD_REQUEST)
        
        Event.objects.get(pk=event_id).attendees.remove(request.user)

        return Response({"message": "removed from event attendees (if user was an attendee)"}, status=status.HTTP_201_CREATED)