import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProducts } from '../store/productsSlice';
import ProductList from '../components/ProductList';

const Home = () => {
  const dispatch = useDispatch();
  const { items: products, status, error } = useSelector(state => state.products);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchProducts());
    }
  }, [status, dispatch]);

  return (
    <div className="home">
      <h1>Welcome to Our E-commerce Store</h1>
      <p>Discover our amazing products!</p>
      
      {status === 'loading' && <div>Loading products...</div>}
      {status === 'failed' && <div>Error: {error}</div>}
      {status === 'succeeded' && (
        <>
          <h2>Featured Products</h2>
          <ProductList products={products.slice(0, 4)} /> {/* Display first 4 products */}
        </>
      )}
    </div>
  );
};

export default Home;