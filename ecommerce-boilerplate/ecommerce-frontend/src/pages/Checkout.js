import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { clearCart } from '../store/cartSlice';
import { useNavigate } from 'react-router-dom';

const Checkout = () => {
  const [step, setStep] = useState(1);
  const [shippingInfo, setShippingInfo] = useState({
    name: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
  });
  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, total } = useSelector(state => state.cart);

  const handleShippingSubmit = (e) => {
    e.preventDefault();
    setStep(2);
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    setStep(3);
  };

  const handleOrderPlacement = () => {
    // Here you would typically send the order to your backend
    console.log('Order placed:', { items, total, shippingInfo, paymentInfo });
    dispatch(clearCart());
    navigate('/order-confirmation');
  };

  const renderStepContent = () => {
    switch(step) {
      case 1:
        return (
          <form onSubmit={handleShippingSubmit} className="space-y-4">
            <h2 className="text-2xl font-bold">Shipping Information</h2>
            <input
              type="text"
              placeholder="Full Name"
              value={shippingInfo.name}
              onChange={(e) => setShippingInfo({...shippingInfo, name: e.target.value})}
              required
              className="w-full p-2 border rounded"
            />
            <input
              type="text"
              placeholder="Address"
              value={shippingInfo.address}
              onChange={(e) => setShippingInfo({...shippingInfo, address: e.target.value})}
              required
              className="w-full p-2 border rounded"
            />
            <input
              type="text"
              placeholder="City"
              value={shippingInfo.city}
              onChange={(e) => setShippingInfo({...shippingInfo, city: e.target.value})}
              required
              className="w-full p-2 border rounded"
            />
            <input
              type="text"
              placeholder="Postal Code"
              value={shippingInfo.postalCode}
              onChange={(e) => setShippingInfo({...shippingInfo, postalCode: e.target.value})}
              required
              className="w-full p-2 border rounded"
            />
            <input
              type="text"
              placeholder="Country"
              value={shippingInfo.country}
              onChange={(e) => setShippingInfo({...shippingInfo, country: e.target.value})}
              required
              className="w-full p-2 border rounded"
            />
            <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Next</button>
          </form>
        );
      case 2:
        return (
          <form onSubmit={handlePaymentSubmit} className="space-y-4">
            <h2 className="text-2xl font-bold">Payment Information</h2>
            <input
              type="text"
              placeholder="Card Number"
              value={paymentInfo.cardNumber}
              onChange={(e) => setPaymentInfo({...paymentInfo, cardNumber: e.target.value})}
              required
              className="w-full p-2 border rounded"
            />
            <input
              type="text"
              placeholder="Expiry Date (MM/YY)"
              value={paymentInfo.expiryDate}
              onChange={(e) => setPaymentInfo({...paymentInfo, expiryDate: e.target.value})}
              required
              className="w-full p-2 border rounded"
            />
            <input
              type="text"
              placeholder="CVV"
              value={paymentInfo.cvv}
              onChange={(e) => setPaymentInfo({...paymentInfo, cvv: e.target.value})}
              required
              className="w-full p-2 border rounded"
            />
            <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Next</button>
          </form>
        );
      case 3:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Order Summary</h2>
            {items.map(item => (
              <div key={item.id} className="flex justify-between">
                <span>{item.name} x {item.quantity}</span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="font-bold">Total: ${total.toFixed(2)}</div>
            <button onClick={handleOrderPlacement} className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">Place Order</button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Checkout</h1>
      <div className="flex mb-4">
        <div className={`flex-1 text-center ${step >= 1 ? 'text-blue-600' : ''}`}>Shipping</div>
        <div className={`flex-1 text-center ${step >= 2 ? 'text-blue-600' : ''}`}>Payment</div>
        <div className={`flex-1 text-center ${step >= 3 ? 'text-blue-600' : ''}`}>Confirmation</div>
      </div>
      {renderStepContent()}
    </div>
  );
};

export default Checkout;