from django.conf import settings
from django.db import models

from hoagiecalendar.models.user import User


class Category(models.Model):
	name = models.CharField(max_length=50)

	def __str__(self) -> str:
		return self.name

	class Meta:
		db_table = "Category"


class Event(models.Model):
	start = models.DateTimeField()
	end = models.DateTimeField()
	name = models.CharField(max_length=100)
	location = models.CharField(max_length=100)
	description = models.TextField()
	host = models.CharField(max_length=100)
	owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
	category = models.ManyToManyField(Category, related_name="events", blank=True)
	saved_by = models.ManyToManyField(User, related_name="saved_events", blank=True)
	from_mail = models.BooleanField(default=False)
	# Manual sort position among events that share the same start time (lower comes first).
	ordering = models.PositiveIntegerField(default=0)
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	def __str__(self) -> str:
		return self.name

	class Meta:
		db_table = "Event"
		ordering = ["start", "ordering"]
