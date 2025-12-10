from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FarmViewSet

router = DefaultRouter()
router.register(r'', FarmViewSet, basename='farm')

urlpatterns = [
    path('', include(router.urls)),
]

