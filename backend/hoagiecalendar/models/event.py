from django.db import models

from .user import User

class Category(models.Model):
	name = models.CharField(max_length=50)

	def __str__(self) -> str:
		return self.name

	class Meta:
		db_table = "Category"

class Event(models.Model):
	start = models.DateTimeField()
	end  = models.DateTimeField()
	name = models.CharField(max_length=100)
	location = models.CharField(max_length=100)
	description = models.TextField()
	host = models.CharField(max_length=100)
	owner = models.ForeignKey(User, on_delete=models.CASCADE)
	category = models.ManyToManyField(Category, related_name="events", blank=True)
	from_mail = models.BooleanField(default=False)

	def __str__(self) -> str:
		return self.name

	class Meta:
		db_table = "Event"