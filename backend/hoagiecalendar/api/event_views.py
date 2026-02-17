from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import serializers
from ..models.event import Event

class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = '__all__'
        read_only_fields = ['owner']


class EventView(APIView):
    def get(self, request) -> Response:
        # Logic to get events
        pass

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
