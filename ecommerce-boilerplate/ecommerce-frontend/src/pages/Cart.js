import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { removeFromCart, updateQuantity, clearCart } from '../redux/cartSlice';
import { Link } from 'react-router-dom';

const Cart = () => {
  const dispatch = useDispatch();
  const { items, total } = useSelector(state => state.cart);

  const handleRemoveItem = (item) => {
    dispatch(removeFromCart(item));
  };

  const handleUpdateQuantity = (id, quantity) => {
    dispatch(updateQuantity({ id, quantity }));
  };

  const handleClearCart = () => {
    dispatch(clearCart());
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-4">Your Cart is Empty</h2>
        <Link to="/shop" className="text-blue-600 hover:underline">Continue Shopping</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-4">Your Cart</h2>
      {items.map(item => (
        <div key={item.id} className="flex items-center justify-between border-b py-4">
          <div>
            <h3 className="text-lg font-semibold">{item.name}</h3>
            <p className="text-gray-600">${item.price.toFixed(2)} each</p>
          </div>
          <div className="flex items-center">
            <input
              type="number"
              min="1"
              value={item.quantity}
              onChange={(e) => handleUpdateQuantity(item.id, parseInt(e.target.value))}
              className="w-16 px-2 py-1 border rounded mr-4"
            />
            <button
              onClick={() => handleRemoveItem(item)}
              className="text-red-600 hover:text-red-800"
            >
              Remove
            </button>
          </div>
        </div>
      ))}
      <div className="mt-8">
        <p className="text-xl font-bold">Total: ${total.toFixed(2)}</p>
        <div className="mt-4">
          <button
            onClick={handleClearCart}
            className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition duration-300 mr-4"
          >
            Clear Cart
          </button>
          <Link
            to="/checkout"
            className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition duration-300"
          >
            Proceed to Checkout
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Cart;