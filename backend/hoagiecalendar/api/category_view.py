from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from ..models.event import Category
from .category_serializer import CategorySerializer


class CategoryView(APIView):
	def get(self, request) -> Response:
		categories = Category.objects.all()
		serializer = CategorySerializer(categories, many=True)
		return Response(serializer.data, status=status.HTTP_200_OK)
