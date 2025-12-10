from django.http import HttpResponse
from django.conf import settings
import os

def index(request):
    index_path = os.path.join(settings.STATIC_ROOT, 'index.html')
    try:
        with open(index_path, 'r') as f:
            content = f.read()
        return HttpResponse(content, content_type='text/html')
    except FileNotFoundError:
        return HttpResponse("Frontend not built", status=500)
