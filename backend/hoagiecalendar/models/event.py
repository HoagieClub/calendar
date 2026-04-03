from typing import TYPE_CHECKING

from django.db import models

from .user import User


class Category(models.Model):
	name = models.CharField(max_length=50)

	def __str__(self) -> str:
		return self.name

	class Meta:
		db_table = "Category"


class EventManager(models.Manager):
	def get_queryset(self):
		return super().get_queryset().annotate(attending_count=models.Count("attendees"))

	def get_raw_queryset(self):
		return super().get_queryset()


class Event(models.Model):
	start = models.DateTimeField()
	end = models.DateTimeField()
	name = models.CharField(max_length=100)
	location = models.CharField(max_length=100)
	description = models.TextField()
	host = models.CharField(max_length=100)
	owner = models.ForeignKey(User, on_delete=models.CASCADE)
	category = models.ManyToManyField(Category, related_name="events", blank=True)
	from_mail = models.BooleanField(default=False)
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)
	attendees = models.ManyToManyField(User, related_name="events_attending", blank=True)

	objects = EventManager()

	def __str__(self) -> str:
		return self.name

	class Meta:
		db_table = "Event"
		ordering = ["start"]


if TYPE_CHECKING:

	class AnnotatedEvent(Event):  # Python type magic to make `attending_count` exist for type checker.
		attending_count: int
