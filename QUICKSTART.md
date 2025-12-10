# Quick Start Checklist

Follow these steps to get DigiFarm Assist running locally.

## Prerequisites Check

- [ ] Docker and Docker Compose installed
- [ ] Git installed
- [ ] M-Pesa Daraja sandbox account created (optional for basic testing)

## Setup Steps

### 1. Clone and Navigate

```bash
git clone <repository-url>
cd DigiFarm
```

### 2. Configure Environment Variables

```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env with your settings (at minimum, keep defaults for local dev)

# Frontend
cp frontend/.env.example frontend/.env
# Edit frontend/.env if needed (defaults work for local dev)
```

### 3. Start Services

```bash
docker-compose up -d
```

This starts:
- PostgreSQL database
- Redis
- Django backend (port 8000)
- Celery worker
- Celery beat (scheduler)
- Flower (Celery monitoring, port 5555)
- React frontend (port 5173)

### 4. Run Migrations

```bash
docker-compose exec backend python manage.py migrate
```

### 5. Create Superuser

```bash
docker-compose exec backend python manage.py createsuperuser
```

### 6. Seed Demo Data (Optional)

```bash
docker-compose exec backend python manage_seed.py
```

### 7. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000/api
- **API Documentation**: http://localhost:8000/api/docs
- **Django Admin**: http://localhost:8000/admin
- **Flower (Celery)**: http://localhost:5555
- **Health Check**: http://localhost:8000/health

## Testing the Application

### 1. Register a New User

Visit http://localhost:5173/register and create an account.

### 2. Test Crop Diagnosis

1. Login to the application
2. Navigate to "Diagnosis"
3. Upload a crop image
4. Wait for diagnosis result (check Celery logs if needed)

### 3. Browse Marketplace

1. Navigate to "Marketplace"
2. Browse products
3. Create an order (requires products in database - use seed script)

### 4. Test M-Pesa Payment (Requires Setup)

See [README.md](README.md#m-pesa-setup) for M-Pesa configuration.

## Common Issues

### Port Already in Use

If ports 8000, 5173, or 5432 are in use:

```bash
# Stop conflicting services or change ports in docker-compose.yml
docker-compose down
```

### Database Connection Error

```bash
# Ensure database is running
docker-compose ps db

# Check logs
docker-compose logs db
```

### Celery Tasks Not Running

```bash
# Check Celery logs
docker-compose logs celery

# Restart Celery
docker-compose restart celery
```

### Frontend Not Loading

```bash
# Check frontend logs
docker-compose logs frontend

# Rebuild if needed
docker-compose up -d --build frontend
```

## Next Steps

1. **Configure M-Pesa**: See [README.md](README.md#m-pesa-setup)
2. **Read Documentation**: See [README.md](README.md) and [DEPLOYMENT.md](DEPLOYMENT.md)
3. **Run Tests**: See [TESTING.md](TESTING.md)
4. **Deploy**: See [DEPLOYMENT.md](DEPLOYMENT.md)

## Demo Accounts (After Seeding)

After running `manage_seed.py`, you can login with:

- **Farmer**: farmer1@digifarm.com / demo123
- **Vendor**: vendor1@digifarm.com / demo123
- **Admin**: admin@digifarm.com / admin123

## Development Commands

```bash
# View logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f celery

# Run Django shell
docker-compose exec backend python manage.py shell

# Run Django management commands
docker-compose exec backend python manage.py <command>

# Access database
docker-compose exec db psql -U postgres -d digifarm

# Restart services
docker-compose restart backend
docker-compose restart frontend

# Stop all services
docker-compose down

# Stop and remove volumes (clears database)
docker-compose down -v
```

## Production Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

