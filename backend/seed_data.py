"""
Seed script to create demo data for DigiFarm Assist.
Run with: python manage.py shell < seed_data.py
Or: python manage.py runscript seed_data (if using django-extensions)
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'digi_farm.settings')
django.setup()

from apps.users.models import User
from apps.farms.models import Farm
from apps.marketplace.models import Vendor, Product, ProductCategory
from apps.knowledge.models import Article, Category
from decimal import Decimal


def create_users():
    """Create demo users."""
    print("Creating users...")
    
    # Create farmers
    farmer1 = User.objects.create_user(
        email='farmer1@digifarm.com',
        password='demo123',
        phone_number='+254712345678',
        role='farmer',
        location='Nairobi',
        is_verified=True
    )
    
    farmer2 = User.objects.create_user(
        email='farmer2@digifarm.com',
        password='demo123',
        phone_number='+254723456789',
        role='farmer',
        location='Nakuru',
        is_verified=True
    )
    
    farmer3 = User.objects.create_user(
        email='farmer3@digifarm.com',
        password='demo123',
        phone_number='+254734567890',
        role='farmer',
        location='Kisumu',
        is_verified=True
    )
    
    # Create vendors
    vendor_user1 = User.objects.create_user(
        email='vendor1@digifarm.com',
        password='demo123',
        phone_number='+254745678901',
        role='vendor',
        location='Nairobi',
        is_verified=True
    )
    
    vendor_user2 = User.objects.create_user(
        email='vendor2@digifarm.com',
        password='demo123',
        phone_number='+254756789012',
        role='vendor',
        location='Mombasa',
        is_verified=True
    )
    
    vendor1 = Vendor.objects.create(
        user=vendor_user1,
        business_name='AgriSupply Kenya',
        business_registration='C.123456',
        description='Leading supplier of agricultural inputs',
        is_verified=True,
        rating=Decimal('4.5')
    )
    
    vendor2 = Vendor.objects.create(
        user=vendor_user2,
        business_name='FarmTech Solutions',
        business_registration='C.789012',
        description='Modern farming equipment and supplies',
        is_verified=True,
        rating=Decimal('4.8')
    )
    
    print(f"Created {User.objects.count()} users")
    return {
        'farmers': [farmer1, farmer2, farmer3],
        'vendors': [vendor1, vendor2]
    }


def create_farms(users):
    """Create demo farms."""
    print("Creating farms...")
    
    farms = [
        Farm.objects.create(
            owner=users['farmers'][0],
            name='Green Valley Farm',
            description='Organic vegetable farm specializing in tomatoes and kale',
            location='Kiambu, Nairobi',
            latitude=Decimal('-1.2921'),
            longitude=Decimal('36.8219'),
            size_hectares=Decimal('5.0'),
            soil_type='Loamy',
            main_crops=['Tomatoes', 'Kale', 'Onions']
        ),
        Farm.objects.create(
            owner=users['farmers'][1],
            name='Highland Crops',
            description='Maize and wheat production',
            location='Nakuru County',
            latitude=Decimal('-0.3031'),
            longitude=Decimal('36.0800'),
            size_hectares=Decimal('10.0'),
            soil_type='Clay',
            main_crops=['Maize', 'Wheat']
        ),
        Farm.objects.create(
            owner=users['farmers'][2],
            name='Lake View Farm',
            description='Rice and fish farming',
            location='Kisumu County',
            latitude=Decimal('-0.0917'),
            longitude=Decimal('34.7680'),
            size_hectares=Decimal('8.5'),
            soil_type='Sandy Loam',
            main_crops=['Rice', 'Fish']
        ),
    ]
    
    print(f"Created {len(farms)} farms")
    return farms


def create_products(vendors):
    """Create demo products."""
    print("Creating products...")
    
    # Create categories
    seeds_category = ProductCategory.objects.create(
        name='Seeds',
        slug='seeds',
        description='High quality seeds for various crops'
    )
    
    fertilizer_category = ProductCategory.objects.create(
        name='Fertilizers',
        slug='fertilizers',
        description='Organic and inorganic fertilizers'
    )
    
    pesticide_category = ProductCategory.objects.create(
        name='Pesticides',
        slug='pesticides',
        description='Safe and effective pest control products'
    )
    
    equipment_category = ProductCategory.objects.create(
        name='Equipment',
        slug='equipment',
        description='Farming tools and equipment'
    )
    
    products = [
        Product.objects.create(
            vendor=vendors[0],
            title='Tomato Seeds - Hybrid F1',
            description='High yielding hybrid tomato seeds, resistant to common diseases',
            price=Decimal('500.00'),
            stock=100,
            category=seeds_category,
            is_verified=True
        ),
        Product.objects.create(
            vendor=vendors[0],
            title='NPK 20-10-10 Fertilizer',
            description='Balanced NPK fertilizer for general crop nutrition',
            price=Decimal('2500.00'),
            stock=50,
            category=fertilizer_category,
            is_verified=True
        ),
        Product.objects.create(
            vendor=vendors[0],
            title='Neem Oil Insecticide',
            description='Organic insecticide for pest control',
            price=Decimal('1200.00'),
            stock=75,
            category=pesticide_category,
            is_verified=True
        ),
        Product.objects.create(
            vendor=vendors[1],
            title='Maize Seeds - Pioneer',
            description='High quality maize seeds with excellent yield potential',
            price=Decimal('800.00'),
            stock=80,
            category=seeds_category,
            is_verified=True
        ),
        Product.objects.create(
            vendor=vendors[1],
            title='Drip Irrigation Kit',
            description='Complete drip irrigation system for efficient water use',
            price=Decimal('15000.00'),
            stock=20,
            category=equipment_category,
            is_verified=True
        ),
    ]
    
    print(f"Created {len(products)} products")
    return products


def create_articles():
    """Create demo knowledge articles."""
    print("Creating articles...")
    
    author = User.objects.filter(role='admin').first()
    if not author:
        author = User.objects.create_superuser(
            email='admin@digifarm.com',
            password='admin123'
        )
    
    category1 = Category.objects.create(
        name='Crop Management',
        slug='crop-management',
        description='Best practices for crop management'
    )
    
    category2 = Category.objects.create(
        name='Pest Control',
        slug='pest-control',
        description='Effective pest control strategies'
    )
    
    articles = [
        Article.objects.create(
            title='Best Practices for Tomato Farming',
            slug='best-practices-tomato-farming',
            body='''# Best Practices for Tomato Farming

Tomatoes are one of the most popular vegetables grown in Kenya. Here are some key practices:

## Soil Preparation
- Ensure well-drained soil with pH 6.0-6.8
- Add organic matter before planting
- Test soil for nutrient levels

## Planting
- Space plants 45-60cm apart
- Plant during rainy season or ensure irrigation
- Use stakes or trellises for support

## Watering
- Water consistently, avoid water stress
- Use drip irrigation for efficiency
- Water at base, avoid wetting leaves

## Pest and Disease Management
- Monitor regularly for pests
- Use integrated pest management
- Rotate crops to prevent disease buildup
''',
            author=author,
            category=category1,
            tags='tomatoes, farming, vegetables',
            published=True
        ),
        Article.objects.create(
            title='Organic Pest Control Methods',
            slug='organic-pest-control',
            body='''# Organic Pest Control Methods

Organic pest control is essential for sustainable farming:

## Neem Oil
- Effective against aphids, mites, and whiteflies
- Mix 2ml per liter of water
- Apply early morning or evening

## Companion Planting
- Plant marigolds to repel nematodes
- Basil repels tomato hornworms
- Onions deter many pests

## Physical Barriers
- Use row covers for young plants
- Handpick large pests
- Install traps for monitoring
''',
            author=author,
            category=category2,
            tags='pest control, organic, sustainable',
            published=True
        ),
    ]
    
    print(f"Created {len(articles)} articles")
    return articles


def main():
    """Main seed function."""
    print("=" * 50)
    print("DigiFarm Assist - Seed Data Script")
    print("=" * 50)
    
    # Clear existing data (optional - comment out to keep existing data)
    # User.objects.filter(email__contains='@digifarm.com').delete()
    
    users = create_users()
    farms = create_farms(users)
    products = create_products(users['vendors'])
    articles = create_articles()
    
    print("\n" + "=" * 50)
    print("Seed data created successfully!")
    print("=" * 50)
    print(f"\nDemo Accounts:")
    print(f"  Farmers: farmer1@digifarm.com, farmer2@digifarm.com, farmer3@digifarm.com")
    print(f"  Vendors: vendor1@digifarm.com, vendor2@digifarm.com")
    print(f"  Admin: admin@digifarm.com")
    print(f"  Password for all: demo123 (or admin123 for admin)")
    print(f"\nCreated:")
    print(f"  - {User.objects.count()} users")
    print(f"  - {Farm.objects.count()} farms")
    print(f"  - {Product.objects.count()} products")
    print(f"  - {Article.objects.count()} articles")


if __name__ == '__main__':
    main()

