import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from io import BytesIO
from PIL import Image

User = get_user_model()


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def authenticated_user(api_client):
    user_data = {
        'email': 'test@example.com',
        'password': 'testpass123',
        'password2': 'testpass123',
        'role': 'farmer'
    }
    response = api_client.post('/api/auth/register/', user_data)
    token = response.data['tokens']['access']
    api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
    return api_client, response.data['user']


def create_test_image():
    """Create a test image file."""
    img = Image.new('RGB', (100, 100), color='green')
    img_io = BytesIO()
    img.save(img_io, format='JPEG')
    img_io.seek(0)
    return img_io


@pytest.mark.django_db
class TestCropImageUpload:
    def test_upload_image_authenticated(self, authenticated_user):
        api_client, user = authenticated_user
        
        image_file = create_test_image()
        response = api_client.post('/api/diagnosis/upload/', {
            'image': image_file,
            'notes': 'Test crop image'
        }, format='multipart')
        
        assert response.status_code == status.HTTP_201_CREATED
        assert 'id' in response.data
        assert response.data['status'] == 'pending'
    
    def test_upload_image_unauthenticated(self, api_client):
        image_file = create_test_image()
        response = api_client.post('/api/diagnosis/upload/', {
            'image': image_file
        }, format='multipart')
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_get_diagnosis_list(self, authenticated_user):
        api_client, user = authenticated_user
        
        # Upload an image first
        image_file = create_test_image()
        upload_response = api_client.post('/api/diagnosis/upload/', {
            'image': image_file
        }, format='multipart')
        
        # Get list
        response = api_client.get('/api/diagnosis/upload/')
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) > 0

