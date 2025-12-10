# Environment Variables Reference

Complete list of all environment variables used in DigiFarm Assist.

## Backend Environment Variables

### Django Core

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `SECRET_KEY` | Django secret key for cryptographic signing | `django-insecure-change-me` | Yes |
| `DEBUG` | Enable/disable debug mode | `True` or `False` | Yes |
| `ALLOWED_HOSTS` | Comma-separated list of allowed hosts | `localhost,127.0.0.1,example.com` | Yes |

### Database

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `DB_NAME` | PostgreSQL database name | `digifarm` | Yes |
| `DB_USER` | PostgreSQL username | `postgres` | Yes |
| `DB_PASSWORD` | PostgreSQL password | `postgres` | Yes |
| `DB_HOST` | PostgreSQL host | `db` or `localhost` | Yes |
| `DB_PORT` | PostgreSQL port | `5432` | Yes |

### Celery & Redis

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `CELERY_BROKER_URL` | Redis URL for Celery broker | `redis://redis:6379/0` | Yes |
| `CELERY_RESULT_BACKEND` | Redis URL for Celery results | `redis://redis:6379/0` | Yes |

### CORS

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `CORS_ALLOWED_ORIGINS` | Comma-separated list of allowed origins | `http://localhost:3000,http://localhost:5173` | Yes |

### M-Pesa Daraja

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `MPESA_CONSUMER_KEY` | M-Pesa API consumer key | `your-consumer-key` | Yes |
| `MPESA_CONSUMER_SECRET` | M-Pesa API consumer secret | `your-consumer-secret` | Yes |
| `MPESA_SHORTCODE` | Business shortcode | `174379` (sandbox) | Yes |
| `MPESA_PASSKEY` | M-Pesa passkey | `your-passkey` | Yes |
| `MPESA_ENV` | Environment (sandbox/production) | `sandbox` | Yes |
| `MPESA_CALLBACK_URL` | Webhook callback URL | `https://your-domain.com/api/payments/mpesa/webhook/` | Yes |
| `MPESA_LNM_EXPIRY` | STK Push expiry time (seconds) | `174000` | Yes |

### Email Configuration

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `EMAIL_BACKEND` | Email backend class | `django.core.mail.backends.console.EmailBackend` | No |
| `EMAIL_HOST` | SMTP server host | `smtp.gmail.com` | No |
| `EMAIL_PORT` | SMTP server port | `587` | No |
| `EMAIL_USE_TLS` | Use TLS for email | `True` | No |
| `EMAIL_HOST_USER` | SMTP username | `your-email@gmail.com` | No |
| `EMAIL_HOST_PASSWORD` | SMTP password | `your-app-password` | No |
| `DEFAULT_FROM_EMAIL` | Default sender email | `noreply@digifarm.com` | No |

### AWS S3 (Optional)

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `USE_S3` | Enable S3 storage | `True` or `False` | No |
| `AWS_ACCESS_KEY_ID` | AWS access key | `your-access-key` | If USE_S3=True |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key | `your-secret-key` | If USE_S3=True |
| `AWS_STORAGE_BUCKET_NAME` | S3 bucket name | `digifarm-media` | If USE_S3=True |
| `AWS_S3_REGION_NAME` | AWS region | `us-east-1` | If USE_S3=True |

### Django Superuser (Development)

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `DJANGO_SUPERUSER_EMAIL` | Superuser email | `admin@digifarm.com` | No |
| `DJANGO_SUPERUSER_PASSWORD` | Superuser password | `admin123` | No |

## Frontend Environment Variables

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `VITE_API_URL` | Backend API URL | `http://localhost:8000/api` | Yes |

## Environment Setup Examples

### Local Development (.env)

```env
# Django
SECRET_KEY=django-insecure-dev-key-change-in-production
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DB_NAME=digifarm
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=db
DB_PORT=5432

# Celery
CELERY_BROKER_URL=redis://redis:6379/0
CELERY_RESULT_BACKEND=redis://redis:6379/0

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# M-Pesa (Sandbox)
MPESA_CONSUMER_KEY=your-sandbox-consumer-key
MPESA_CONSUMER_SECRET=your-sandbox-consumer-secret
MPESA_SHORTCODE=174379
MPESA_PASSKEY=your-sandbox-passkey
MPESA_ENV=sandbox
MPESA_CALLBACK_URL=https://your-ngrok-url.ngrok.io/api/payments/mpesa/webhook/
MPESA_LNM_EXPIRY=174000

# Email (Console for development)
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
```

### Production (.env)

```env
# Django
SECRET_KEY=<generate-strong-secret-key>
DEBUG=False
ALLOWED_HOSTS=your-domain.com,www.your-domain.com

# Database (from hosting provider)
DB_NAME=<from-provider>
DB_USER=<from-provider>
DB_PASSWORD=<from-provider>
DB_HOST=<from-provider>
DB_PORT=5432

# Celery (from Redis provider)
CELERY_BROKER_URL=redis://your-redis-url:6379/0
CELERY_RESULT_BACKEND=redis://your-redis-url:6379/0

# CORS
CORS_ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com

# M-Pesa (Production)
MPESA_CONSUMER_KEY=<production-consumer-key>
MPESA_CONSUMER_SECRET=<production-consumer-secret>
MPESA_SHORTCODE=<your-shortcode>
MPESA_PASSKEY=<production-passkey>
MPESA_ENV=production
MPESA_CALLBACK_URL=https://your-domain.com/api/payments/mpesa/webhook/
MPESA_LNM_EXPIRY=174000

# Email (SMTP)
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=noreply@your-domain.com

# S3 (Optional)
USE_S3=True
AWS_ACCESS_KEY_ID=<your-access-key>
AWS_SECRET_ACCESS_KEY=<your-secret-key>
AWS_STORAGE_BUCKET_NAME=digifarm-media
AWS_S3_REGION_NAME=us-east-1
```

## Generating Secret Keys

### Django SECRET_KEY

```python
# In Python shell
from django.core.management.utils import get_random_secret_key
print(get_random_secret_key())
```

Or use online generator: https://djecrety.ir/

## Security Best Practices

1. **Never commit `.env` files** to version control
2. **Use different keys** for development and production
3. **Rotate secrets** regularly in production
4. **Use environment-specific values** for all deployments
5. **Restrict access** to production environment variables
6. **Use secret management** services (AWS Secrets Manager, HashiCorp Vault) for production

## Quick Reference

### Required for Basic Setup
- `SECRET_KEY`
- `DEBUG`
- `ALLOWED_HOSTS`
- Database variables (`DB_*`)
- Celery variables (`CELERY_*`)
- `CORS_ALLOWED_ORIGINS`
- M-Pesa variables (`MPESA_*`)

### Optional but Recommended
- Email configuration (for notifications)
- S3 configuration (for media storage)
- Superuser credentials (for development)

### Production Only
- Strong `SECRET_KEY`
- `DEBUG=False`
- Production M-Pesa credentials
- SMTP email configuration
- S3 or CDN for media

