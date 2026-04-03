from django.db import models

from rest_framework import serializers, status
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from typing import cast

from ..models.event import Event, AnnotatedEvent


class EventAttendeeView(APIView):
    def get(self, request: Request) -> Response:
        event_id = request.query_params.get("event_id")

        if event_id:
            event = cast(AnnotatedEvent, Event.objects.annotate(attending=models.Count("attending")).get(pk=event_id))

            return Response({"attendee_count": event.attending_count}, status=status.HTTP_200_OK)
        
        events = cast(list[AnnotatedEvent], list(Event.objects.all()))
        result = {event.pk: event.attending_count for event in events}

        return Response(result, status=status.HTTP_200_OK)
