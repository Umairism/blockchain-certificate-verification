# 🚀 Deployment Guide

Comprehensive deployment guide for the Blockchain Certificate Verification System across different environments.

## 🎯 Deployment Overview

This guide covers deployment strategies for various environments:
- **Development**: Local development setup
- **Staging**: Pre-production testing environment
- **Production**: Live production deployment

## 🏗️ Infrastructure Requirements

### Minimum System Requirements

#### Development Environment
- **CPU**: 2 cores
- **RAM**: 4GB
- **Storage**: 10GB free space
- **OS**: Windows 10, macOS 10.15+, or Ubuntu 18.04+

#### Production Environment
- **CPU**: 4+ cores
- **RAM**: 8GB+
- **Storage**: 50GB+ SSD
- **OS**: Ubuntu 20.04 LTS (recommended)

### Software Dependencies

#### Backend Requirements
```
Python 3.8+
pip 21.0+
SQLite 3.30+ (or PostgreSQL for production)
```

#### Frontend Requirements
```
Node.js 16.0+
npm 8.0+
```

## 🐳 Docker Deployment

### Docker Configuration

#### Backend Dockerfile
```dockerfile
# backend/Dockerfile
FROM python:3.9-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create non-root user
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:5000/api/health || exit 1

# Start application
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "4", "app:app"]
```

#### Frontend Dockerfile
```dockerfile
# frontend/Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code and build
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
```

#### Docker Compose Configuration
```yaml
# docker-compose.yml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "5000:5000"
    environment:
      - FLASK_ENV=production
      - SECRET_KEY=${SECRET_KEY}
      - JWT_SECRET_KEY=${JWT_SECRET_KEY}
      - DATABASE_URL=${DATABASE_URL}
    volumes:
      - ./backend/instance:/app/instance
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "80:80"
    environment:
      - VITE_API_BASE_URL=http://localhost:5000/api
    depends_on:
      - backend
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--spider", "http://localhost/"]
      interval: 30s
      timeout: 10s
      retries: 3

  nginx:
    image: nginx:alpine
    ports:
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - frontend
      - backend
    restart: unless-stopped

volumes:
  database_data:
```

### Docker Deployment Commands

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Scale backend service
docker-compose up -d --scale backend=3

# Stop all services
docker-compose down

# Rebuild and restart
docker-compose down && docker-compose up --build -d
```

## ☁️ Cloud Deployment

### AWS Deployment

#### Using AWS Elastic Beanstalk

1. **Prepare Application**
   ```bash
   # Create deployment package
   zip -r application.zip . -x "*.git*" "node_modules/*" "venv/*"
   ```

2. **Elastic Beanstalk Configuration**
   ```yaml
   # .ebextensions/python.config
   option_settings:
     aws:elasticbeanstalk:container:python:
       WSGIPath: app:app
     aws:elasticbeanstalk:application:environment:
       FLASK_ENV: production
       SECRET_KEY: your-secret-key
   ```

3. **Deploy Command**
   ```bash
   eb init
   eb create production-env
   eb deploy
   ```

#### Using AWS ECS (Fargate)

1. **Task Definition**
   ```json
   {
     "family": "blockchain-cert-app",
     "networkMode": "awsvpc",
     "requiresCompatibilities": ["FARGATE"],
     "cpu": "512",
     "memory": "1024",
     "containerDefinitions": [
       {
         "name": "backend",
         "image": "your-account.dkr.ecr.region.amazonaws.com/blockchain-cert-backend:latest",
         "portMappings": [
           {
             "containerPort": 5000,
             "protocol": "tcp"
           }
         ],
         "environment": [
           {
             "name": "FLASK_ENV",
             "value": "production"
           }
         ]
       }
     ]
   }
   ```

### Google Cloud Platform

#### Using Cloud Run

1. **Build and Push Image**
   ```bash
   # Build image
   docker build -t gcr.io/PROJECT_ID/blockchain-cert-backend ./backend
   
   # Push to Container Registry
   docker push gcr.io/PROJECT_ID/blockchain-cert-backend
   ```

2. **Deploy to Cloud Run**
   ```bash
   gcloud run deploy blockchain-cert-backend \
     --image gcr.io/PROJECT_ID/blockchain-cert-backend \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated
   ```

### Microsoft Azure

#### Using Azure Container Instances

```bash
# Create resource group
az group create --name blockchain-cert-rg --location eastus

# Deploy container
az container create \
  --resource-group blockchain-cert-rg \
  --name blockchain-cert-app \
  --image your-registry/blockchain-cert-backend:latest \
  --ports 5000 \
  --environment-variables FLASK_ENV=production
```

## 🌐 Traditional Server Deployment

### Ubuntu Server Setup

#### 1. System Preparation
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y python3 python3-pip python3-venv nginx nodejs npm git

# Create application user
sudo useradd -m -s /bin/bash blockchain-cert
sudo usermod -aG www-data blockchain-cert
```

#### 2. Application Deployment
```bash
# Switch to application user
sudo su - blockchain-cert

# Clone repository
git clone https://github.com/your-repo/blockchain-certificate-verification.git
cd blockchain-certificate-verification

# Backend setup
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
pip install gunicorn

# Frontend setup
cd ../frontend
npm install
npm run build

# Create production environment file
cat > /home/blockchain-cert/blockchain-certificate-verification/backend/.env << EOF
SECRET_KEY=your-production-secret-key
JWT_SECRET_KEY=your-production-jwt-key
DATABASE_URL=sqlite:///app.db
FLASK_ENV=production
EOF
```

#### 3. Systemd Service Configuration
```ini
# /etc/systemd/system/blockchain-cert-backend.service
[Unit]
Description=Blockchain Certificate Backend
After=network.target

[Service]
User=blockchain-cert
Group=www-data
WorkingDirectory=/home/blockchain-cert/blockchain-certificate-verification/backend
Environment=PATH=/home/blockchain-cert/blockchain-certificate-verification/backend/venv/bin
ExecStart=/home/blockchain-cert/blockchain-certificate-verification/backend/venv/bin/gunicorn --workers 3 --bind unix:blockchain-cert.sock -m 007 app:app
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
# Enable and start service
sudo systemctl daemon-reload
sudo systemctl enable blockchain-cert-backend
sudo systemctl start blockchain-cert-backend
```

#### 4. Nginx Configuration
```nginx
# /etc/nginx/sites-available/blockchain-cert
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /home/blockchain-cert/blockchain-certificate-verification/frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        include proxy_params;
        proxy_pass http://unix:/home/blockchain-cert/blockchain-certificate-verification/backend/blockchain-cert.sock;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/blockchain-cert /etc/nginx/sites-enabled
sudo nginx -t
sudo systemctl restart nginx
```

## 🔒 SSL/HTTPS Setup

### Using Let's Encrypt (Certbot)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal setup
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Manual SSL Certificate

```nginx
# /etc/nginx/sites-available/blockchain-cert-ssl
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;
    
    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    # ... rest of configuration
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

## 📊 Production Database Setup

### PostgreSQL Configuration

#### 1. Install PostgreSQL
```bash
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### 2. Database Setup
```bash
sudo -u postgres createuser --interactive blockchain_cert
sudo -u postgres createdb blockchain_cert_db --owner blockchain_cert
sudo -u postgres psql
```

```sql
-- Set password for user
ALTER USER blockchain_cert PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE blockchain_cert_db TO blockchain_cert;
```

#### 3. Update Application Configuration
```python
# Update DATABASE_URL in .env
DATABASE_URL=postgresql://blockchain_cert:secure_password@localhost/blockchain_cert_db

# Install PostgreSQL adapter
pip install psycopg2-binary
```

### Database Migration

```python
# migrations.py
from flask_migrate import Migrate, upgrade
from app import create_app
from database import db

app = create_app()
migrate = Migrate(app, db)

# Run migrations
flask db init
flask db migrate -m "Initial migration"
flask db upgrade
```

## 🔍 Monitoring and Logging

### Application Logging

#### Backend Logging Configuration
```python
# logging_config.py
import logging
from logging.handlers import RotatingFileHandler
import os

def setup_logging(app):
    if not app.debug:
        if not os.path.exists('logs'):
            os.mkdir('logs')
        
        file_handler = RotatingFileHandler(
            'logs/blockchain_cert.log',
            maxBytes=10240000,  # 10MB
            backupCount=10
        )
        
        file_handler.setFormatter(logging.Formatter(
            '%(asctime)s %(levelname)s: %(message)s '
            '[in %(pathname)s:%(lineno)d]'
        ))
        
        file_handler.setLevel(logging.INFO)
        app.logger.addHandler(file_handler)
        app.logger.setLevel(logging.INFO)
        app.logger.info('Blockchain Certificate application startup')
```

### System Monitoring

#### Prometheus Configuration
```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'blockchain-cert-backend'
    static_configs:
      - targets: ['localhost:5000']
    metrics_path: '/api/metrics'
    scrape_interval: 5s
```

#### Grafana Dashboard
```json
{
  "dashboard": {
    "title": "Blockchain Certificate System",
    "panels": [
      {
        "title": "API Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "http_request_duration_seconds",
            "legendFormat": "{{method}} {{endpoint}}"
          }
        ]
      }
    ]
  }
}
```

## 🔄 CI/CD Pipeline

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Python
        uses: actions/setup-python@v3
        with:
          python-version: 3.9
          
      - name: Install dependencies
        run: |
          cd backend
          pip install -r requirements.txt
          
      - name: Run tests
        run: |
          cd backend
          pytest
          
      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18
          
      - name: Install frontend dependencies
        run: |
          cd frontend
          npm ci
          
      - name: Run frontend tests
        run: |
          cd frontend
          npm test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to server
        uses: appleboy/ssh-action@v0.1.5
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.PRIVATE_KEY }}
          script: |
            cd /home/blockchain-cert/blockchain-certificate-verification
            git pull origin main
            
            # Backend deployment
            cd backend
            source venv/bin/activate
            pip install -r requirements.txt
            sudo systemctl restart blockchain-cert-backend
            
            # Frontend deployment
            cd ../frontend
            npm install
            npm run build
            sudo systemctl reload nginx
```

## 🛡️ Security Hardening

### Firewall Configuration

```bash
# UFW setup
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

### Application Security

#### Environment Variables
```bash
# Use systemd environment file
sudo mkdir -p /etc/systemd/system/blockchain-cert-backend.service.d
cat > /etc/systemd/system/blockchain-cert-backend.service.d/override.conf << EOF
[Service]
EnvironmentFile=/etc/blockchain-cert/environment
EOF
```

#### Secure Headers
```python
# app.py
from flask_talisman import Talisman

# Add security headers
Talisman(app, {
    'force_https': True,
    'force_https_permanent': True,
    'content_security_policy': {
        'default-src': "'self'",
        'script-src': "'self' 'unsafe-inline'",
        'style-src': "'self' 'unsafe-inline'"
    }
})
```

## 📋 Deployment Checklist

### Pre-deployment
- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Database migrations ready
- [ ] SSL certificates obtained
- [ ] Backup strategy in place
- [ ] Monitoring configured

### During Deployment
- [ ] Deploy to staging first
- [ ] Run smoke tests
- [ ] Check all endpoints
- [ ] Verify database connectivity
- [ ] Test authentication flow
- [ ] Validate certificate operations

### Post-deployment
- [ ] Monitor application logs
- [ ] Check system resources
- [ ] Verify SSL configuration
- [ ] Test from external networks
- [ ] Update documentation
- [ ] Notify stakeholders

## 🆘 Troubleshooting

### Common Issues

#### Application Won't Start
```bash
# Check service status
sudo systemctl status blockchain-cert-backend

# Check logs
sudo journalctl -u blockchain-cert-backend -f

# Check application logs
tail -f /home/blockchain-cert/blockchain-certificate-verification/backend/logs/blockchain_cert.log
```

#### Database Connection Issues
```bash
# Test database connection
sudo -u blockchain-cert psql -h localhost -U blockchain_cert -d blockchain_cert_db

# Check database logs
sudo tail -f /var/log/postgresql/postgresql-*.log
```

#### Nginx Issues
```bash
# Test nginx configuration
sudo nginx -t

# Check nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

### Performance Issues

#### High CPU Usage
```bash
# Check process usage
top -p $(pgrep -f gunicorn)

# Increase worker processes
# Edit /etc/systemd/system/blockchain-cert-backend.service
ExecStart=.../gunicorn --workers 6 --bind unix:blockchain-cert.sock -m 007 app:app
```

#### Memory Issues
```bash
# Check memory usage
free -h
ps aux --sort=-%mem | head

# Add swap if needed
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

## 📞 Support and Maintenance

### Regular Maintenance Tasks

#### Weekly
- Review application logs
- Check SSL certificate expiry
- Monitor disk space usage
- Backup database

#### Monthly
- Update system packages
- Review security logs
- Performance analysis
- Dependency updates

#### Quarterly
- Security audit
- Disaster recovery test
- Performance optimization
- Documentation updates

---

**For additional support, refer to the [Development Guide](./DEVELOPMENT.md) or create an issue on GitHub.**
