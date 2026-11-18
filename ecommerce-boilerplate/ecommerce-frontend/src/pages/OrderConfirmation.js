import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';

// Stripe sends the shopper here after payment. The order turns "processing"
// when Stripe's webhook reaches the store, which can take a few seconds.
const OrderConfirmation = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [order, setOrder] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!orderId) return undefined;
    let stopped = false;
    let attempts = 0;

    const load = async () => {
      try {
        const { data } = await api.get(`/orders/${orderId}`);
        if (stopped) return;
        setOrder(data);
        attempts += 1;
        if (data.status === 'pending' && attempts < 10) setTimeout(load, 2000);
      } catch (error) {
        if (!stopped) setFailed(true);
      }
    };
    load();
    return () => {
      stopped = true;
    };
  }, [orderId]);

  const paid = order && order.paidAt;

  return (
    <div className="container mx-auto px-4 py-8 text-center">
      <h1 className="text-3xl font-bold mb-4">Thank You for Your Order!</h1>
      {orderId && <p className="mb-2">Order number: {orderId}</p>}
      {failed && <p className="mb-4">We could not load the order. Check your profile for its status.</p>}
      {order && paid && <p className="mb-4">Your payment is confirmed and the order is being processed.</p>}
      {order && !paid && order.status === 'pending' && (
        <p className="mb-4">We are waiting for the payment confirmation. This page updates by itself.</p>
      )}
      {order && !paid && order.status === 'cancelled' && (
        <p className="mb-4">This order is cancelled. If you were charged, the payment is refunded.</p>
      )}
      <Link to="/" className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
        Continue Shopping
      </Link>
    </div>
  );
};

export default OrderConfirmation;
