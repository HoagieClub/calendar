from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import serializers
from ..models.event import Event

class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = ['start', 'end', 'name', 'location', 'description', 
                  'host', 'owner', 'category', 'from_mail']
        read_only_fields = ['owner']

        def validate_charfields(self, data):
            errors = []
            if len(data.get('name')) > 100 or len(data.get('name')) < 3:
                errors.append('name')
            if len(data.get('location')) > 100 or len(data.get('location')) < 3:
                errors.append('location')
            if len(data.get('host')) > 100 or len(data.get('host')) < 3:
                errors.append('host')
            if errors:
                raise serializers.ValidationError(
                    f"{", ".join(errors)} must be between 3 and 100 characters.")
            return data
        

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
