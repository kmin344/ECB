# E-commerce Microservices Project

This project is a microservices-based e-commerce application built using Node.js, Express, MongoDB, and Docker. It consists of several independent services that work together to provide a scalable and maintainable e-commerce platform.

## Services

1. **API Gateway**: Entry point for all client requests, routes to appropriate microservices.
2. **Product Service**: Manages product information and inventory.
3. **Order Service**: Handles order creation and management.
4. **Auth Service**: Manages user authentication and authorization.

## Technologies Used

- Node.js
- Express.js
- MongoDB
- Docker & Docker Compose
- Nginx (as reverse proxy)

## Prerequisites

- Docker and Docker Compose
- Node.js (for local development)

## Getting Started

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/ecommerce-microservices.git
   cd ecommerce-microservices
   ```

2. Run the setup script:
   ```
   chmod +x setup.sh
   ./setup.sh
   ```

   This script will create necessary directories, set up basic route structures, install dependencies, and start Docker containers.

3. The services should now be running. You can check their status with:
   ```
   docker compose ps
   ```

## API Endpoints

All requests should be made to the API Gateway: `http://localhost:4000`

### Product Service
- GET `/api/products`: Get all products
- POST `/api/products`: Create a new product

### Order Service
- GET `/api/orders`: Get all orders
- POST `/api/orders`: Create a new order

### Auth Service
- POST `/api/auth/register`: Register a new user
- POST `/api/auth/login`: Login a user

## Development

To develop a specific service:

1. Navigate to the service directory:
   ```
   cd services/[service-name]
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Make your changes and test them locally.

4. Rebuild the Docker containers:
   ```
   docker compose up --build -d
   ```

## Testing

You can test the API endpoints using cURL or Postman. Example cURL commands:

```bash
# Create a new product
curl -X POST http://localhost:4000/api/products -H "Content-Type: application/json" -d '{"name":"Test Product","description":"This is a test product","price":9.99,"category":"Electronics","inStock":true}'

# Get all products
curl http://localhost:4000/api/products

# Get a single product (replace <productId> with an actual ID)
curl http://localhost:4000/api/products/<productId>

# Update a product (replace <productId> with an actual ID)
curl -X PUT http://localhost:4000/api/products/<productId> -H "Content-Type: application/json" -d '{"name":"Updated Product","price":19.99}'

# Delete a product (replace <productId> with an actual ID)
curl -X DELETE http://localhost:4000/api/products/<productId>
```

## Troubleshooting

If you encounter any issues:

1. Check if all containers are running:
   ```
   docker compose ps
   ```

2. Check the logs of a specific service:
   ```
   docker compose logs [service-name]
   ```

3. Ensure all required ports are free on your host machine.

## Contributing

Please read CONTRIBUTING.md for details on our code of conduct, and the process for submitting pull requests.

## License

This project is licensed under the GPL 3.0 License - see the LICENSE file for details.