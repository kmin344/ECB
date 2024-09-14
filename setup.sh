#!/bin/bash

# Navigate to project root
cd ecommerce-boilerplate

# Function to create route file
create_route_file() {
    local service=$1
    local route_file="services/$service-service/src/routes/$service.routes.js"
    echo "Creating route file for $service service"
    mkdir -p "services/$service-service/src/routes"
    cat << EOF > "$route_file"
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.status(501).json({ message: 'Get all ${service}s not implemented yet' });
});

router.get('/:id', (req, res) => {
    res.status(501).json({ message: 'Get ${service} by id not implemented yet' });
});

router.post('/', (req, res) => {
    res.status(501).json({ message: 'Create ${service} not implemented yet' });
});

router.put('/:id', (req, res) => {
    res.status(501).json({ message: 'Update ${service} not implemented yet' });
});

router.delete('/:id', (req, res) => {
    res.status(501).json({ message: 'Delete ${service} not implemented yet' });
});

module.exports = router;
EOF
}

# Function to update app.js
update_app_js() {
    local service=$1
    local app_file="services/$service-service/src/app.js"
    echo "Updating app.js for $service service"
    cat << EOF > "$app_file"
const express = require('express');
const mongoose = require('mongoose');
const ${service}Routes = require('./routes/${service}.routes');

const app = express();

app.use(express.json());

mongoose.connect('mongodb://mongo:27017/${service}-service', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

app.use('/${service}s', ${service}Routes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(\`${service^} service running on port \${PORT}\`));
EOF
}

# Create route files and update app.js for each service
for service in product order auth; do
    create_route_file $service
    update_app_js $service
done

# Special case for auth routes
echo "Updating auth routes"
cat << EOF > "services/auth-service/src/routes/auth.routes.js"
const express = require('express');
const router = express.Router();

router.post('/register', (req, res) => {
    res.status(501).json({ message: 'User registration not implemented yet' });
});

router.post('/login', (req, res) => {
    res.status(501).json({ message: 'User login not implemented yet' });
});

router.post('/logout', (req, res) => {
    res.status(501).json({ message: 'User logout not implemented yet' });
});

module.exports = router;
EOF

# Update auth service app.js
sed -i 's|app.use('/auths', authRoutes);|app.use('/auth', authRoutes);|' services/auth-service/src/app.js

# Install dependencies for each service
services=("api-gateway" "services/product-service" "services/order-service" "services/auth-service")

for service in "${services[@]}"
do
    echo "Installing dependencies for $service"
    cd $service
    npm init -y
    npm install express mongoose
    if [ "$service" == "api-gateway" ]; then
        npm install http-proxy-middleware
    fi
    if [ "$service" == "services/auth-service" ]; then
        npm install bcryptjs jsonwebtoken
    fi
    cd -
done

# Build and start Docker services
docker-compose up --build -d

echo "All services are now set up and running!"
echo "Access the API Gateway at http://localhost:4000"
echo "Access the Admin Dashboard at http://localhost:4200"