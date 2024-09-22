import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProducts } from '../store/productsSlice';

const ProductList = ({ products }) => {
  const dispatch = useDispatch();
  const { items: products, status, error } = useSelector(state => state.products);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchProducts());
    }
  }, [status, dispatch]);

  return (
  <div className="product-list">
    {products.map(product => (
      <div key={product.id} className="product-item">
        <h3>{product.name}</h3>
        <p>{product.price}</p>
        <button>Add to Cart</button>
      </div>
    ))}
  </div>
)};

export default ProductList;