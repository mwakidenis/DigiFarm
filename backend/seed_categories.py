import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'digi_farm.settings')
django.setup()

from apps.marketplace.models import ProductCategory

categories = [
    {'name': 'Seeds & Seedlings', 'slug': 'seeds', 'description': 'Quality seeds for all crops'},
    {'name': 'Fertilizers', 'slug': 'fertilizers', 'description': 'Organic and inorganic fertilizers'},
    {'name': 'Crop Protection', 'slug': 'protection', 'description': 'Pesticides, herbicides, and fungicides'},
    {'name': 'Farm Tools', 'slug': 'tools', 'description': 'Hand tools and equipment'},
    {'name': 'Animal Feeds', 'slug': 'feeds', 'description': 'Feeds for livestock and poultry'},
]

for cat in categories:
    obj, created = ProductCategory.objects.get_or_create(
        slug=cat['slug'],
        defaults={'name': cat['name'], 'description': cat['description']}
    )
    if created:
        print(f"Created category: {cat['name']}")
    else:
        print(f"Category already exists: {cat['name']}")

print("Category seeding done.")
