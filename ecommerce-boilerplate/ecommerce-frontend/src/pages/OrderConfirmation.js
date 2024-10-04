import React from 'react';
import { Link } from 'react-router-dom';

const OrderConfirmation = () => {
  return (
    <div className="container mx-auto px-4 py-8 text-center">
      <h1 className="text-3xl font-bold mb-4">Thank You for Your Order!</h1>
      <p className="mb-4">Your order has been received and is being processed.</p>
      <p className="mb-8">You will receive an email confirmation shortly.</p>
      <Link to="/" className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
        Continue Shopping
      </Link>
    </div>
  );
};

export default OrderConfirmation;