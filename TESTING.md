# Testing Guide

## Backend Testing

### Running Tests

```bash
cd backend
pytest
```

### Running Specific Tests

```bash
# Test specific app
pytest apps/users/tests.py

# Test specific class
pytest apps/users/tests.py::TestUserRegistration

# Test with coverage
pytest --cov=apps --cov-report=html
```

### Test Coverage

The project uses pytest-cov for coverage reporting. To generate coverage reports:

```bash
pytest --cov=apps --cov-report=term --cov-report=html
```

Coverage report will be available in `htmlcov/index.html`

## Frontend Testing

### Linting

```bash
cd frontend
npm run lint
```

## Manual Testing Checklist

### Authentication
- [ ] User registration with valid data
- [ ] User registration with invalid data (password mismatch, duplicate email)
- [ ] User login with valid credentials
- [ ] User login with invalid credentials
- [ ] Get user profile (authenticated)
- [ ] Get user profile (unauthenticated)
- [ ] Update user profile

### Farms
- [ ] Create farm (authenticated)
- [ ] List farms
- [ ] Filter farms by county
- [ ] Filter farms by crop
- [ ] Get farm details

### Crop Diagnosis
- [ ] Upload crop image (authenticated)
- [ ] Upload crop image (unauthenticated) - should fail
- [ ] Poll for diagnosis result
- [ ] View diagnosis result with recommendations

### Marketplace
- [ ] List products
- [ ] Search products
- [ ] Filter products by category/price
- [ ] Create order
- [ ] View order details
- [ ] Cancel order

### M-Pesa Payments
- [ ] Initiate STK Push
- [ ] Receive webhook callback
- [ ] Verify transaction status update
- [ ] Verify order status update

### Knowledge Hub
- [ ] List articles
- [ ] View article details
- [ ] Search articles
- [ ] Filter by category/tag

## API Testing with cURL

### Register User

```bash
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpass123",
    "password2": "testpass123",
    "phone_number": "+254712345678",
    "role": "farmer",
    "location": "Nairobi"
  }'
```

### Login

```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpass123"
  }'
```

### Upload Crop Image

```bash
curl -X POST http://localhost:8000/api/diagnosis/upload/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "image=@/path/to/image.jpg" \
  -F "notes=Test crop image"
```

### Create Order

```bash
curl -X POST http://localhost:8000/api/marketplace/orders/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "order_items": [
      {"product_id": 1, "quantity": 2}
    ],
    "shipping_address": "123 Main St",
    "shipping_county": "Nairobi",
    "shipping_phone": "+254712345678"
  }'
```

### Initiate M-Pesa Payment

```bash
curl -X POST http://localhost:8000/api/payments/mpesa/initiate/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": 1,
    "phone": "+254712345678"
  }'
```

### Simulate M-Pesa Webhook (Development)

```bash
curl -X POST http://localhost:8000/api/payments/mpesa/confirmation_sim/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "checkout_request_id": "ws_CO_123456789",
    "result_code": 0,
    "mpesa_receipt_number": "QLTEST123"
  }'
```

## Postman Collection

Import `postman_collection.json` into Postman for easy API testing. The collection includes:
- Pre-configured requests for all endpoints
- Environment variables for base URL and tokens
- Example request bodies

## Load Testing

For load testing, consider using:
- **Apache Bench (ab)**: Simple HTTP benchmarking
- **Locust**: Python-based load testing
- **JMeter**: Java-based load testing

Example with Apache Bench:

```bash
ab -n 1000 -c 10 http://localhost:8000/api/marketplace/products/
```

## Integration Testing

### M-Pesa Sandbox Testing

1. Use test credentials from Safaricom Developer Portal
2. Use test phone numbers: +254708374149 (for testing)
3. Test STK Push flow end-to-end
4. Verify webhook receives callbacks

### Celery Task Testing

```bash
# Start Celery worker
celery -A digi_farm worker -l info

# Monitor tasks
celery -A digi_farm inspect active

# Check task results
celery -A digi_farm result <task_id>
```

## Performance Testing

### Database Query Optimization

- Use `select_related()` and `prefetch_related()` for related objects
- Add database indexes for frequently queried fields
- Monitor slow queries with Django Debug Toolbar (development)

### API Response Times

Monitor API response times:
- Use Django logging middleware
- Set up APM (Application Performance Monitoring)
- Monitor Celery task execution times

## Security Testing

- [ ] Test authentication bypass attempts
- [ ] Test SQL injection (Django ORM protects against this)
- [ ] Test XSS vulnerabilities
- [ ] Test CSRF protection
- [ ] Verify rate limiting works
- [ ] Test file upload restrictions
- [ ] Verify sensitive data is not exposed in responses

