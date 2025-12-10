"""
ASGI config for digi_farm project.
"""
import os

from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'digi_farm.settings')

application = get_asgi_application()

