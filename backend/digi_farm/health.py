"""
Health check endpoint for monitoring.
"""
from django.http import JsonResponse
from django.db import connection
from django.core.cache import cache
import redis


def health_check(request):
    """
    Health check endpoint.
    Returns 200 if all services are healthy, 503 otherwise.
    """
    status = {
        'status': 'healthy',
        'services': {}
    }
    overall_healthy = True
    
    # Check database
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            status['services']['database'] = 'healthy'
    except Exception as e:
        status['services']['database'] = f'unhealthy: {str(e)}'
        overall_healthy = False
    
    # Check Redis
    try:
        cache.set('health_check', 'ok', 10)
        if cache.get('health_check') == 'ok':
            status['services']['redis'] = 'healthy'
        else:
            status['services']['redis'] = 'unhealthy'
            overall_healthy = False
    except Exception as e:
        status['services']['redis'] = f'unhealthy: {str(e)}'
        overall_healthy = False
    
    if not overall_healthy:
        status['status'] = 'unhealthy'
        return JsonResponse(status, status=503)
    
    return JsonResponse(status, status=200)

