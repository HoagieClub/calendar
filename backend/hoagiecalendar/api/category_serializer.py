from rest_framework import serializers

from ..models.event import Category


class CategorySerializer(serializers.ModelSerializer):
	class Meta:
		model = Category
		fields = ["id", "name"]
