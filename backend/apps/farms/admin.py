from django.contrib import admin
from .models import Farm


@admin.register(Farm)
class FarmAdmin(admin.ModelAdmin):
    list_display = ('name', 'owner', 'location', 'size_hectares', 'created_at')
    list_filter = ('created_at', 'soil_type')
    search_fields = ('name', 'owner__email', 'location')
    raw_id_fields = ('owner',)
    readonly_fields = ('created_at', 'updated_at')

