#!/usr/bin/env python
"""Helper script to run seed data."""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'digi_farm.settings')
django.setup()

from seed_data import main

if __name__ == '__main__':
    main()

