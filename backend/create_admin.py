import os
import django
from django.contrib.auth import get_user_model

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'digi_farm.settings')
django.setup()

User = get_user_model()

if not User.objects.filter(email='admin@digifarm.com').exists():
    User.objects.create_superuser(email='admin@digifarm.com', password='admin123')
    print('Superuser created: admin@digifarm.com / admin123')
else:
    print('Superuser already exists')
