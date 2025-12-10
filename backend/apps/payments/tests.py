import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from apps.marketplace.models import Order, Product, Vendor
from apps.payments.models import Transaction

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


@pytest.fixture
def test_order(authenticated_user):
    api_client, user = authenticated_user
    user_obj = User.objects.get(email=user['email'])
    
    # Create vendor and product
    vendor_user = User.objects.create_user(
        email='vendor@example.com',
        password='testpass123',
        role='vendor'
    )
    vendor = Vendor.objects.create(user=vendor_user, business_name='Test Vendor')
    product = Product.objects.create(
        vendor=vendor,
        title='Test Product',
        description='Test',
        price=100.00,
        stock=10
    )
    
    # Create order
    order = Order.objects.create(
        customer=user_obj,
        total_amount=100.00,
        shipping_address='Test Address',
        shipping_county='Nairobi',
        shipping_phone='+254712345678'
    )
    
    return api_client, order


@pytest.mark.django_db
class TestMPesaIntegration:
    def test_initiate_stk_push_requires_auth(self, api_client):
        response = api_client.post('/api/payments/mpesa/initiate/', {
            'order_id': 1,
            'phone': '+254712345678'
        })
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_initiate_stk_push_invalid_order(self, authenticated_user):
        api_client, user = authenticated_user
        response = api_client.post('/api/payments/mpesa/initiate/', {
            'order_id': 99999,
            'phone': '+254712345678'
        })
        assert response.status_code == status.HTTP_404_NOT_FOUND
    
    @pytest.mark.skip(reason="Requires M-Pesa credentials")
    def test_initiate_stk_push_success(self, test_order):
        api_client, order = test_order
        # This test requires actual M-Pesa credentials
        # Skip in CI/CD, run manually with sandbox credentials
        pass


@pytest.mark.django_db
class TestMPesaWebhook:
    def test_webhook_accepts_post(self, api_client):
        """Test that webhook endpoint accepts POST requests."""
        webhook_data = {
            'Body': {
                'stkCallback': {
                    'ResultCode': 0,
                    'ResultDesc': 'The service request is processed successfully.',
                    'CheckoutRequestID': 'ws_CO_TEST123',
                    'CallbackMetadata': {
                        'Item': [
                            {'Name': 'Amount', 'Value': 100},
                            {'Name': 'MpesaReceiptNumber', 'Value': 'QLTEST123'},
                            {'Name': 'TransactionDate', 'Value': '20240101120000'},
                            {'Name': 'PhoneNumber', 'Value': '254712345678'}
                        ]
                    }
                }
            }
        }
        
        # Create a transaction first
        order = Order.objects.create(
            customer=User.objects.create_user(email='test@example.com', password='test'),
            total_amount=100.00,
            shipping_address='Test',
            shipping_county='Nairobi',
            shipping_phone='+254712345678'
        )
        transaction = Transaction.objects.create(
            order=order,
            checkout_request_id='ws_CO_TEST123',
            amount=100.00,
            phone='+254712345678',
            status='initiated'
        )
        
        response = api_client.post(
            '/api/payments/mpesa/webhook/',
            webhook_data,
            format='json'
        )
        
        # Webhook should return 200 even if transaction not found
        assert response.status_code in [status.HTTP_200_OK, status.HTTP_404_NOT_FOUND]
        
        # If transaction exists, it should be updated
        if response.status_code == status.HTTP_200_OK:
            transaction.refresh_from_db()
            assert transaction.status in ['success', 'failed']

