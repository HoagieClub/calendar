from typing import TypedDict, cast

from rest_framework import serializers, status
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from hoagiecalendar.api.user_events_view import EventSerializer
from hoagiecalendar.models import Event


class SaveEventRequestSerializer(serializers.Serializer):
	event_id = serializers.BigIntegerField()


class SaveEventRequestData(TypedDict):
	event_id: int


class UserSavedEventsView(APIView):
	def get(self, request: Request) -> Response:
		user = request.user
		saved_events = user.saved_events.all()
		serializer = EventSerializer(saved_events, many=True, context={"request": request})

		return Response(serializer.data, status=status.HTTP_200_OK)

	def post(self, request: Request) -> Response:
		serializer = SaveEventRequestSerializer(data=request.data)
		if not serializer.is_valid():
			return Response({"error": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

		validated_data = cast(SaveEventRequestData, serializer.validated_data)

		try:
			event = Event.objects.get(pk=validated_data["event_id"])
			event.saved_by.add(request.user)

			return Response({"message": "event saved"}, status=status.HTTP_201_CREATED)
		except Event.DoesNotExist:
			return Response({"error": "event not found"}, status=status.HTTP_404_NOT_FOUND)
		except Exception as e:
			return Response({"error": f"an error occured while saving event for user: {e}"})

	def delete(self, request: Request) -> Response:
		serializer = SaveEventRequestSerializer(data=request.data)
		if not serializer.is_valid():
			return Response({"error": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

		validated_data = cast(SaveEventRequestData, serializer.validated_data)

		try:
			event = Event.objects.get(pk=validated_data["event_id"])
			event.saved_by.add(request.user)

			return Response({"message": "event unsaved"}, status=status.HTTP_200_OK)
		except Event.DoesNotExist:
			return Response({"error": "event not found"}, status=status.HTTP_404_NOT_FOUND)
		except Exception as e:
			return Response({"error": f"an error occured while unsaving event for user: {e}"})
