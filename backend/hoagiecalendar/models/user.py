from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
	# Nullable for existing rows that have not yet been linked to an Auth0 identity.
	auth0_subject = models.CharField(max_length=255, unique=True, null=True, blank=True)

	def __str__(self) -> str:
		return f"{self.get_full_name()} ({self.username})"

	class Meta:
		db_table = "User"
