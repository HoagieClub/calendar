from django.db import models

class Category(models.Model):
	name = models.CharField(max_length=20)

	def __str__(self) -> str:
		return self.name

	class Meta:
		db_table = "Category"