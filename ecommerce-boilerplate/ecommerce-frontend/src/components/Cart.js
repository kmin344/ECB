import React from 'react';

const Cart = ({ items }) => (
  <div className="cart">
    <h2>Your Cart</h2>
    {items.map(item => (
      <div key={item.id} className="cart-item">
        <span>{item.name}</span>
        <span>{item.quantity}</span>
        <span>{item.price}</span>
      </div>
    ))}
    <button>Checkout</button>
  </div>
);

export default Cart;
