import os
import django
from django.contrib.auth import authenticate

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'digi_farm.settings')
django.setup()

email = 'admin@digifarm.com'
password = 'admin123'

user = authenticate(email=email, password=password)

if user is not None:
    if user.is_superuser and user.is_staff:
        print(f'SUCCESS: Admin user {email} authenticated and has correct permissions.')
    else:
        print(f'WARNING: User authenticated but missing superuser/staff status.')
else:
    print('FAILURE: Authentication failed.')
