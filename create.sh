#!/bin/bash

# Create main project directory
mkdir -p ecommerce-boilerplate
cd ecommerce-boilerplate

# API Gateway
mkdir -p api-gateway/src/{middleware,routes,config}
cat << EOF > api-gateway/src/app.js
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const app = express();

app.use('/api/products', createProxyMiddleware({ target: 'http://product-service:3001', changeOrigin: true }));
app.use('/api/orders', createProxyMiddleware({ target: 'http://order-service:3002', changeOrigin: true }));
app.use('/api/auth', createProxyMiddleware({ target: 'http://auth-service:3003', changeOrigin: true }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(\`API Gateway running on port \${PORT}\`));
EOF

cat << EOF > api-gateway/Dockerfile
FROM node:16
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 4000
CMD ["node", "src/app.js"]
EOF

# Services
for service in product-service order-service auth-service; do
    mkdir -p services/$service/src/{models,controllers,routes,config}
    
    # Create app.js for each service
    cat << EOF > services/$service/src/app.js
const express = require('express');
const mongoose = require('mongoose');
const app = express();

app.use(express.json());

mongoose.connect('mongodb://mongo:27017/${service}', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

app.use('/', require('./routes/${service%%-*}.routes'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(\`${service} running on port \${PORT}\`));
EOF

    # Create Dockerfile for each service
    cat << EOF > services/$service/Dockerfile
FROM node:16
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["node", "src/app.js"]
EOF
done

# Admin Dashboard
mkdir -p admin-dashboard/src/app/{components/{dashboard,products,orders},services,models}
mkdir -p admin-dashboard/src/{assets,environments}

cat << EOF > admin-dashboard/src/app/app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, HttpClientModule, AppRoutingModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
EOF

# Nginx
mkdir -p nginx
cat << EOF > nginx/nginx.conf
events {
    worker_connections 1024;
}

http {
    upstream api_servers {
        server api-gateway:4000;
    }

    server {
        listen 80;
        server_name localhost;

        location / {
            proxy_pass http://api_servers;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
        }
    }
}
EOF

# Docker Compose
cat << EOF > docker-compose.yml
version: '3'
services:
  api-gateway:
    build: ./api-gateway
    ports:
      - "4000:4000"
    depends_on:
      - product-service
      - order-service
      - auth-service

  product-service:
    build: ./services/product-service
    depends_on:
      - mongo

  order-service:
    build: ./services/order-service
    depends_on:
      - mongo

  auth-service:
    build: ./services/auth-service
    depends_on:
      - mongo

  mongo:
    image: mongo:latest
    volumes:
      - mongo-data:/data/db

  nginx:
    image: nginx:latest
    ports:
      - "80:80"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - api-gateway

volumes:
  mongo-data:
EOF

# PM2 Ecosystem
cat << EOF > ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'api-gateway',
      script: 'api-gateway/src/app.js',
      instances: 2,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
    },
    {
      name: 'product-service',
      script: 'services/product-service/src/app.js',
      instances: 2,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
    },
    {
      name: 'order-service',
      script: 'services/order-service/src/app.js',
      instances: 2,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
    },
    {
      name: 'auth-service',
      script: 'services/auth-service/src/app.js',
      instances: 2,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
    }
  ]
};
EOF

echo "Folder structure and basic file content created successfully!"