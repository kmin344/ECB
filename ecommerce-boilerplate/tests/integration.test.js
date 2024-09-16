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

    // Test creating a product
    const createProductResponse = await axios.post(`${API_GATEWAY_URL}/api/products`, {
      name: 'Test Product',
      description: 'This is a test product',
      price: 9.99,
      stock: 10,
      category: 'Test Category'
    }, { headers });
    console.log('Create Product Response:', createProductResponse.data);
    
    const productId = createProductResponse.data._id;

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