const axios = require('axios');

const API_GATEWAY_URL = 'http://localhost:4000';

const random = Math.floor(Math.random() * 1000);

async function testAuthService() {
  console.log('Testing Auth Service...');
  
  try {
    // Test user registration
    
    const registerResponse = await axios.post(`${API_GATEWAY_URL}/api/auth/register`, {
      username: 'newuser' + random,
      email: 'newuser@example.com' + random,
      password: 'newpassword123' + random
    });
    console.log('email:', 'newuser@example.com' + random);
    console.log('password:', 'newpassword123' + random);
    console.log('Register Response:', registerResponse.data);

    // Test user login
    const loginResponse = await axios.post(`${API_GATEWAY_URL}/api/auth/login`, {
      email: 'newuser@example.com' + random,
      password: 'newpassword123' + random
    });
    console.log('Login Response:', loginResponse.data);

    console.log('Auth Service tests passed successfully!');
    return loginResponse.data.token;
  } catch (error) {
    console.error('Auth Service Test Error:', error.response ? error.response.data : error.message);
    throw error;
  }
}

async function testProductService(token) {
  console.log('Testing Product Service...');
  
  try {
    const headers = { Authorization: `Bearer ${token}` };

    const bestSellers = [
      { 
        id: 1, 
        name: "Best Seller 1", 
        price: 39000, 
        originalPrice: 44000,
        image: "https://cdn.imweb.me/thumbnail/20240606/9bded7c6993db.jpg", 
        rating: 4.5, 
        reviews: 120,
        description: "This is a description for Best Seller 1."
      },
      { id: 1, name: "Best Seller 1", price: 39000, image: "https://cdn.imweb.me/thumbnail/20240606/9bded7c6993db.jpg", rating: 4.5, reviews: 120, description: "This is a description for Best Seller 1." },
      { id: 2, name: "Best Seller 2", price: 49000, image: "https://cdn.imweb.me/thumbnail/20240606/9bded7c6993db.jpg", rating: 4.2, reviews: 85, description: "This is a description for Best Seller 1." },
      { id: 3, name: "Best Seller 3", price: 44000, image: "https://cdn.imweb.me/thumbnail/20240606/9bded7c6993db.jpg", rating: 4.8, reviews: 200, description: "This is a description for Best Seller 1." },
      { id: 4, name: "Best Seller 4", price: 52000, image: "https://cdn.imweb.me/thumbnail/20240606/9bded7c6993db.jpg", rating: 4.0, reviews: 150, description: "This is a description for Best Seller 1." },
  
    ];
  

    // Test creating a product
    bestSellers.map(async (product) => {
      const createProductResponse = await axios.post(`${API_GATEWAY_URL}/api/products`, {
        thumbnail: product.image,
        images: [product.image],
        name: product.name,
        description: product.description || '',
        price: product.price,
        stock: 10,
        category: 'Best Sellers',
        image: product.image
      }, { headers });
      console.log('Create Product Response:', createProductResponse.data);
    });

    // Test getting all products
    const getAllProductsResponse = await axios.get(`${API_GATEWAY_URL}/api/products`, { headers });
    console.log('Get All Products Response:', getAllProductsResponse.data);

    // Test getting a single product
    const getProductResponse = await axios.get(`${API_GATEWAY_URL}/api/products/${productId}`, { headers });
    console.log('Get Single Product Response:', getProductResponse.data);

    // Test updating a product
    const updateProductResponse = await axios.put(`${API_GATEWAY_URL}/api/products/${productId}`, {
      stock: 15
    }, { headers });
    console.log('Update Product Response:', updateProductResponse.data);

    // Test checking product availability
    const checkAvailabilityResponse = await axios.post(`${API_GATEWAY_URL}/api/products/check-availability`, {
      products: [{ productId, quantity: 5 }]
    }, { headers });
    console.log('Check Availability Response:', checkAvailabilityResponse.data);

    console.log('Product Service tests passed successfully!');
    return productId;
  } catch (error) {
    console.error('Product Service Test Error:', error.response ? error.response.data : error.message);
    throw error;
  }
}

async function testOrderService(token, productId) {
  console.log('Testing Order Service...');

  try {
    const headers = { Authorization: `Bearer ${token}` };

    // Test creating an order
    const createOrderPayload = {
      userId: "newuser" + random,  // This should be a valid user ID from your Auth Service
      products: [{ productId, quantity: 2 }],
      totalAmount: 19.98,  // This should be calculated based on the product price and quantity
      shippingAddress: "123 Test Street, Test City, Test Country 12345"
    };

    const createOrderResponse = await axios.post(
      `${API_GATEWAY_URL}/api/orders`,
      createOrderPayload,
      { headers }
    );
    console.log('Create Order Response:', createOrderResponse.data);

    const orderId = createOrderResponse.data._id;

    // Test getting all orders
    const getAllOrdersResponse = await axios.get(`${API_GATEWAY_URL}/api/orders`, { headers });
    console.log('Get All Orders Response:', getAllOrdersResponse.data);

    // Test getting a single order
    const getOrderResponse = await axios.get(`${API_GATEWAY_URL}/api/orders/${orderId}`, { headers });
    console.log('Get Single Order Response:', getOrderResponse.data);

    console.log('Order Service tests passed successfully!');
  } catch (error) {
    console.error('Order Service Test Error:', error.response ? error.response.data : error.message);
    console.error('Full error object:', error);
    throw error;
  }
}

async function runTests() {
  try {
    const token = await testAuthService();
    const productId = await testProductService(token);
    await testOrderService(token, productId);
  } catch (error) {
    console.error('Test run failed:', error);
  }
}

runTests();