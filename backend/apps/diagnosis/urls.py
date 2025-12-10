from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CropImageViewSet

router = DefaultRouter()
router.register(r'upload', CropImageViewSet, basename='diagnosis')

urlpatterns = [
    path('', include(router.urls)),
]

