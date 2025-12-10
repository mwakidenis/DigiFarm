import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

User = get_user_model()


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def user_data():
    return {
        'email': 'test@example.com',
        'password': 'testpass123',
        'password2': 'testpass123',
        'phone_number': '+254712345678',
        'role': 'farmer',
        'location': 'Nairobi'
    }


@pytest.mark.django_db
class TestUserRegistration:
    def test_register_user_success(self, api_client, user_data):
        response = api_client.post('/api/auth/register/', user_data)
        assert response.status_code == status.HTTP_201_CREATED
        assert 'tokens' in response.data
        assert 'user' in response.data
        assert response.data['user']['email'] == user_data['email']
    
    def test_register_user_password_mismatch(self, api_client, user_data):
        user_data['password2'] = 'different'
        response = api_client.post('/api/auth/register/', user_data)
        assert response.status_code == status.HTTP_400_BAD_REQUEST
    
    def test_register_user_duplicate_email(self, api_client, user_data):
        api_client.post('/api/auth/register/', user_data)
        response = api_client.post('/api/auth/register/', user_data)
        assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
class TestUserLogin:
    def test_login_success(self, api_client, user_data):
        # Register user first
        api_client.post('/api/auth/register/', user_data)
        
        # Login
        response = api_client.post('/api/auth/login/', {
            'email': user_data['email'],
            'password': user_data['password']
        })
        assert response.status_code == status.HTTP_200_OK
        assert 'tokens' in response.data
    
    def test_login_invalid_credentials(self, api_client):
        response = api_client.post('/api/auth/login/', {
            'email': 'wrong@example.com',
            'password': 'wrongpass'
        })
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
class TestUserProfile:
    def test_get_profile_authenticated(self, api_client, user_data):
        # Register and get token
        reg_response = api_client.post('/api/auth/register/', user_data)
        token = reg_response.data['tokens']['access']
        
        # Get profile
        api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = api_client.get('/api/users/me/')
        assert response.status_code == status.HTTP_200_OK
        assert response.data['email'] == user_data['email']
    
    def test_get_profile_unauthenticated(self, api_client):
        response = api_client.get('/api/users/me/')
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_update_profile(self, api_client, user_data):
        # Register and get token
        reg_response = api_client.post('/api/auth/register/', user_data)
        token = reg_response.data['tokens']['access']
        
        # Update profile
        api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = api_client.put('/api/users/me/', {
            'phone_number': '+254799999999',
            'location': 'Mombasa'
        })
        assert response.status_code == status.HTTP_200_OK
        assert response.data['phone_number'] == '+254799999999'

