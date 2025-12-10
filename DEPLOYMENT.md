# Deployment Guide

This guide covers deploying DigiFarm Assist to various platforms.

## General Prerequisites

Before deploying, ensure you have:
1. All environment variables configured (see README.md)
2. M-Pesa production credentials (if using production)
3. Database credentials
4. Domain name (for webhooks)

## Deployment Options

### 1. Render

#### Backend Deployment

1. **Create a new Web Service**
   - Connect your GitHub repository
   - Select `backend` as root directory
   - Build command: `pip install -r requirements.txt && python manage.py collectstatic --noinput`
   - Start command: `gunicorn digi_farm.wsgi:application --bind 0.0.0.0:$PORT`

2. **Add PostgreSQL Database**
   - Create a PostgreSQL database
   - Note the connection string

3. **Add Redis**
   - Create a Redis instance
   - Note the connection URL

4. **Environment Variables**
   ```
   SECRET_KEY=<generate-secure-key>
   DEBUG=False
   ALLOWED_HOSTS=your-app.onrender.com
   DB_NAME=<from-postgres>
   DB_USER=<from-postgres>
   DB_PASSWORD=<from-postgres>
   DB_HOST=<from-postgres>
   DB_PORT=5432
   CELERY_BROKER_URL=<redis-url>
   CELERY_RESULT_BACKEND=<redis-url>
   MPESA_CONSUMER_KEY=<your-key>
   MPESA_CONSUMER_SECRET=<your-secret>
   MPESA_SHORTCODE=<your-shortcode>
   MPESA_PASSKEY=<your-passkey>
   MPESA_ENV=production
   MPESA_CALLBACK_URL=https://your-app.onrender.com/api/payments/mpesa/webhook/
   ```

5. **Run Migrations**
   - In Render dashboard, go to Shell
   - Run: `python manage.py migrate`
   - Create superuser: `python manage.py createsuperuser`

#### Frontend Deployment

1. **Create a Static Site**
   - Root directory: `frontend`
   - Build command: `npm install && npm run build`
   - Publish directory: `dist`

2. **Environment Variables**
   ```
   VITE_API_URL=https://your-backend.onrender.com/api
   ```

#### Celery Worker (Separate Service)

1. **Create Background Worker**
   - Root directory: `backend`
   - Start command: `celery -A digi_farm worker -l info`

### 2. Heroku

#### Setup

1. **Install Heroku CLI**
   ```bash
   heroku login
   ```

2. **Create Apps**
   ```bash
   heroku create digifarm-backend
   heroku create digifarm-frontend
   ```

#### Backend

1. **Add Buildpacks**
   ```bash
   heroku buildpacks:add heroku/python -a digifarm-backend
   ```

2. **Add PostgreSQL**
   ```bash
   heroku addons:create heroku-postgresql:hobby-dev -a digifarm-backend
   ```

3. **Add Redis**
   ```bash
   heroku addons:create heroku-redis:hobby-dev -a digifarm-backend
   ```

4. **Set Environment Variables**
   ```bash
   heroku config:set SECRET_KEY=<your-secret> -a digifarm-backend
   heroku config:set DEBUG=False -a digifarm-backend
   # ... add all other env vars
   ```

5. **Deploy**
   ```bash
   git subtree push --prefix backend heroku main
   ```

6. **Run Migrations**
   ```bash
   heroku run python manage.py migrate -a digifarm-backend
   ```

#### Frontend

1. **Add Buildpack**
   ```bash
   heroku buildpacks:add heroku/nodejs -a digifarm-frontend
   heroku buildpacks:add https://github.com/heroku/heroku-buildpack-static -a digifarm-frontend
   ```

2. **Create static.json** in frontend directory:
   ```json
   {
     "root": "dist",
     "clean_urls": true,
     "routes": {
       "/**": "index.html"
     }
   }
   ```

3. **Deploy**
   ```bash
   git subtree push --prefix frontend heroku main
   ```

### 3. Railway

#### Backend

1. **Create New Project**
   - Connect GitHub repository
   - Add PostgreSQL service
   - Add Redis service

2. **Configure Service**
   - Root directory: `backend`
   - Start command: `gunicorn digi_farm.wsgi:application --bind 0.0.0.0:$PORT`
   - Add all environment variables

3. **Deploy**
   - Railway will auto-deploy on push to main

#### Frontend

1. **Create Static Site**
   - Use Vercel or Netlify (recommended for frontend)
   - Or use Railway with Node.js buildpack

### 4. AWS (EC2 + RDS)

#### Infrastructure Setup

1. **Launch EC2 Instance**
   - Ubuntu 22.04 LTS
   - Security group: Allow HTTP (80), HTTPS (443), SSH (22)

2. **Set Up RDS PostgreSQL**
   - Create RDS PostgreSQL instance
   - Note connection details

3. **Set Up ElastiCache Redis**
   - Create Redis cluster
   - Note connection URL

#### Application Deployment

1. **SSH into EC2**
   ```bash
   ssh -i your-key.pem ubuntu@your-ec2-ip
   ```

2. **Install Dependencies**
   ```bash
   sudo apt update
   sudo apt install python3-pip python3-venv nginx postgresql-client
   ```

3. **Clone Repository**
   ```bash
   git clone <your-repo-url>
   cd DigiFarm/backend
   ```

4. **Set Up Virtual Environment**
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt gunicorn
   ```

5. **Configure Environment**
   ```bash
   cp .env.example .env
   nano .env  # Edit with production values
   ```

6. **Run Migrations**
   ```bash
   python manage.py migrate
   python manage.py collectstatic --noinput
   ```

7. **Set Up Gunicorn**
   Create `/etc/systemd/system/digifarm.service`:
   ```ini
   [Unit]
   Description=DigiFarm Gunicorn
   After=network.target

   [Service]
   User=ubuntu
   WorkingDirectory=/home/ubuntu/DigiFarm/backend
   Environment="PATH=/home/ubuntu/DigiFarm/backend/venv/bin"
   ExecStart=/home/ubuntu/DigiFarm/backend/venv/bin/gunicorn digi_farm.wsgi:application --bind 0.0.0.0:8000

   [Install]
   WantedBy=multi-user.target
   ```

   ```bash
   sudo systemctl daemon-reload
   sudo systemctl start digifarm
   sudo systemctl enable digifarm
   ```

8. **Configure Nginx**
   Create `/etc/nginx/sites-available/digifarm`:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://127.0.0.1:8000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

   ```bash
   sudo ln -s /etc/nginx/sites-available/digifarm /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

9. **Set Up SSL (Let's Encrypt)**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

10. **Set Up Celery**
    Create `/etc/systemd/system/celery.service`:
    ```ini
    [Unit]
    Description=Celery Worker
    After=network.target

    [Service]
    User=ubuntu
    WorkingDirectory=/home/ubuntu/DigiFarm/backend
    Environment="PATH=/home/ubuntu/DigiFarm/backend/venv/bin"
    ExecStart=/home/ubuntu/DigiFarm/backend/venv/bin/celery -A digi_farm worker -l info

    [Install]
    WantedBy=multi-user.target
    ```

## Post-Deployment Checklist

- [ ] Run database migrations
- [ ] Create superuser account
- [ ] Seed demo data (optional)
- [ ] Verify M-Pesa webhook URL is accessible
- [ ] Test payment flow end-to-end
- [ ] Set up monitoring (Sentry, etc.)
- [ ] Configure backup strategy
- [ ] Set up CI/CD pipeline
- [ ] Update CORS settings
- [ ] Enable HTTPS
- [ ] Set up domain DNS

## Monitoring

### Recommended Tools

- **Sentry**: Error tracking
- **New Relic / Datadog**: Application performance monitoring
- **Uptime Robot**: Uptime monitoring
- **LogRocket**: Frontend monitoring

### Health Checks

- Backend: `GET /api/health/` (implement if needed)
- Database: Monitor connection pool
- Redis: Monitor memory usage
- Celery: Monitor queue length

## Scaling Considerations

- Use load balancer for multiple backend instances
- Enable database connection pooling
- Use CDN for static files
- Implement caching (Redis)
- Use message queue for heavy tasks
- Consider read replicas for database

## Security Checklist

- [ ] Use strong SECRET_KEY
- [ ] Set DEBUG=False
- [ ] Configure ALLOWED_HOSTS
- [ ] Enable HTTPS
- [ ] Set secure cookie flags
- [ ] Implement rate limiting
- [ ] Regular security updates
- [ ] Database backups
- [ ] Environment variable security

