import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { clearCart } from '../store/cartSlice';
import api from '../services/api';

// Card details are entered on Stripe's hosted page, never on this site.
const goToPayment = async (orderId) => {
  const { data } = await api.post('/payments/checkout', { orderId });
  window.location.assign(data.url);
};

const errorMessage = (error, fallback) =>
  (error.response && error.response.data && error.response.data.message) || fallback;

// Shown when the shopper comes back from Stripe without paying.
const UnpaidOrder = ({ orderId }) => {
  const [state, setState] = useState({ busy: false, message: null, cancelled: false });

  const pay = async () => {
    setState({ busy: true, message: null, cancelled: false });
    try {
      await goToPayment(orderId);
    } catch (error) {
      setState({ busy: false, message: errorMessage(error, 'Payment could not be started. Try again later.'), cancelled: false });
    }
  };

  const cancel = async () => {
    setState({ busy: true, message: null, cancelled: false });
    try {
      await api.post(`/orders/${orderId}/cancel`);
      setState({ busy: false, message: 'Your order is cancelled.', cancelled: true });
    } catch (error) {
      setState({ busy: false, message: errorMessage(error, 'The order could not be cancelled.'), cancelled: false });
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Payment not completed</h2>
      <p>Your order is saved and its items are held for you. Pay now, or cancel the order to release them.</p>
      {state.message && <p role="status">{state.message}</p>}
      {!state.cancelled && (
        <div className="flex gap-4">
          <button onClick={pay} disabled={state.busy} className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700">
            Pay now
          </button>
          <button onClick={cancel} disabled={state.busy} className="flex-1 border py-2 rounded">
            Cancel order
          </button>
        </div>
      )}
    </div>
  );
};

const Checkout = () => {
  const [searchParams] = useSearchParams();
  const returningOrderId = searchParams.get('cancelled') ? searchParams.get('orderId') : null;

  const [step, setStep] = useState(1);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);
  const [shippingInfo, setShippingInfo] = useState({
    name: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
  });

  const dispatch = useDispatch();
  const { items, total } = useSelector(state => state.cart);

  const handleShippingSubmit = (e) => {
    e.preventDefault();
    setStep(2);
  };

  const handleOrderPlacement = async () => {
    setBusy(true);
    setMessage(null);
    let orderId;
    try {
      // The server takes the user from the token and the prices from the
      // catalog, so only product ids, quantities and the address are sent.
      const { data: order } = await api.post('/orders', {
        products: items.map(item => ({ product: item.id, quantity: item.quantity })),
        shippingAddress: `${shippingInfo.name}, ${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.postalCode}, ${shippingInfo.country}`,
      });
      orderId = order._id;
      dispatch(clearCart());
    } catch (error) {
      setBusy(false);
      setMessage(errorMessage(error, 'There was an error placing your order. Please try again.'));
      return;
    }

    try {
      await goToPayment(orderId);
    } catch (error) {
      setBusy(false);
      setMessage(`Your order is saved, but payment could not be started: ${errorMessage(error, 'try again later')}.`);
      setStep(`unpaid:${orderId}`);
    }
  };

  if (returningOrderId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">Checkout</h1>
        <UnpaidOrder orderId={returningOrderId} />
      </div>
    );
  }

  const renderStepContent = () => {
    if (typeof step === 'string' && step.startsWith('unpaid:')) {
      return <UnpaidOrder orderId={step.slice('unpaid:'.length)} />;
    }
    switch (step) {
      case 1:
        return (
          <form onSubmit={handleShippingSubmit} className="space-y-4">
            <h2 className="text-2xl font-bold">Shipping Information</h2>
            {['name', 'address', 'city', 'postalCode', 'country'].map((field) => (
              <input
                key={field}
                type="text"
                placeholder={{ name: 'Full Name', address: 'Address', city: 'City', postalCode: 'Postal Code', country: 'Country' }[field]}
                value={shippingInfo[field]}
                onChange={(e) => setShippingInfo({ ...shippingInfo, [field]: e.target.value })}
                required
                className="w-full p-2 border rounded"
              />
            ))}
            <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Next</button>
          </form>
        );
      case 2:
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
            <p className="text-sm">You will pay on Stripe's secure page. The final price is confirmed by the store.</p>
            <button
              onClick={handleOrderPlacement}
              disabled={busy || items.length === 0}
              className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
            >
              {busy ? 'Placing order…' : 'Place order and pay'}
            </button>
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
        <div className={`flex-1 text-center ${step === 1 ? 'text-blue-600' : ''}`}>Shipping</div>
        <div className={`flex-1 text-center ${step !== 1 ? 'text-blue-600' : ''}`}>Review and pay</div>
      </div>
      {message && <p role="alert" className="mb-4 text-red-600">{message}</p>}
      {renderStepContent()}
    </div>
  );
};

export default Checkout;
