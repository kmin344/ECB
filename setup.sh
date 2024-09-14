#!/bin/bash

# Navigate to project root
cd ecommerce-boilerplate

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

# Setup admin dashboard
echo "Setting up admin dashboard"
if [ -d "admin-dashboard" ]; then
    echo "admin-dashboard directory already exists"
    cd admin-dashboard
    if [ ! -f "angular.json" ]; then
        echo "Not a valid Angular project. Initializing new Angular project..."
        cd ..
        rm -rf admin-dashboard
        npx @angular/cli new admin-dashboard --directory=admin-dashboard --routing=true --style=scss
        cd admin-dashboard
    fi
else
    echo "Creating new Angular project for admin dashboard"
    npx @angular/cli new admin-dashboard --directory=admin-dashboard --routing=true --style=scss
    cd admin-dashboard
fi

# Generate components and services if they don't exist
components=("dashboard" "products" "orders")
services=("product" "order" "auth")

for component in "${components[@]}"
do
    if [ ! -d "src/app/components/$component" ]; then
        ng generate component components/$component
    else
        echo "Component $component already exists"
    fi
done

for service in "${services[@]}"
do
    if [ ! -f "src/app/services/$service.service.ts" ]; then
        ng generate service services/$service
    else
        echo "Service $service already exists"
    fi
done

# Update app-routing.module.ts
cat << EOF > src/app/app-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ProductsComponent } from './components/products/products.component';
import { OrdersComponent } from './components/orders/orders.component';

const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'products', component: ProductsComponent },
  { path: 'orders', component: OrdersComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
EOF

# Update app.component.html
cat << EOF > src/app/app.component.html
<nav>
  <ul>
    <li><a routerLink="/dashboard">Dashboard</a></li>
    <li><a routerLink="/products">Products</a></li>
    <li><a routerLink="/orders">Orders</a></li>
  </ul>
</nav>
<router-outlet></router-outlet>
EOF

cd ..

# Function to update Dockerfile
update_dockerfile() {
    local service=$1
    echo "Updating Dockerfile for $service"
    cat << EOF > $service/Dockerfile
FROM node:16
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["node", "src/app.js"]
EOF
}

# Update Dockerfiles
update_dockerfile "api-gateway"
update_dockerfile "services/product-service"
update_dockerfile "services/order-service"
update_dockerfile "services/auth-service"

# Adjust the EXPOSE port for api-gateway
sed -i 's/EXPOSE 3000/EXPOSE 4000/' api-gateway/Dockerfile

echo "Dockerfiles updated successfully"

# Build and start Docker services
docker-compose up --build -d

# Start admin dashboard
cd admin-dashboard
npm start &

echo "All services are now running!"
echo "Access the API Gateway at http://localhost:4000"
echo "Access the Admin Dashboard at http://localhost:4200"