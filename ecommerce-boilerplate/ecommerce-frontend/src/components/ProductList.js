import React from 'react';

const ProductList = ({ products }) => (
  <div className="product-list">
    {products.map(product => (
      <div key={product.id} className="product-item">
        <h3>{product.name}</h3>
        <p>{product.price}</p>
        <button>Add to Cart</button>
      </div>
    ))}
  </div>
);

export default ProductList;