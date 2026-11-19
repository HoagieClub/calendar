from rest_framework.permissions import SAFE_METHODS, BasePermission


class IsOwnerOrReadOnly(BasePermission):
	"""Anyone may read an object; only its owner may change or delete it.

	This is an object-level check, so an APIView must call
	``self.check_object_permissions(request, obj)`` after loading the object.
	"""

	message = "You can only edit or delete events you created."

	def has_object_permission(self, request, view, obj) -> bool:
		if request.method in SAFE_METHODS:
			return True
		# AnonymousUser never equals a real User, so logged-out requests are denied too.
		return obj.owner == request.user
