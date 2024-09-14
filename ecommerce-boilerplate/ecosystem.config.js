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
