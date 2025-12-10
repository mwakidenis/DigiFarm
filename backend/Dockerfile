FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    postgresql-client \
    gcc \
    python3-dev \
    libpq-dev \
    nodejs \
    npm \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project
COPY . .

# Build frontend
WORKDIR /app/frontend
RUN npm install
RUN npm run build
RUN cp -r dist/* ../staticfiles/

WORKDIR /app

# Create media and static directories
RUN mkdir -p /app/media /app/staticfiles

# Run entrypoint script
ENTRYPOINT ["/app/entrypoint.sh"]

