import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductById } from '../store/productsSlice';
import { StarIcon } from '@heroicons/react/24/solid';
import RelatedProducts from '../components/RelatedProducts';
import ReviewsAndRatings from '../components/ReviewsAndRatings';

const ProductPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { item: product, status, error } = useSelector(state => state.products);

  useEffect(() => {
    dispatch(fetchProductById(id));
  }, [dispatch, id]);

  if (status === 'loading') {
    return <div className="text-center mt-8">Loading...</div>;
  }

  if (status === 'failed') {
    return <div className="text-center mt-8 text-red-500">Error: {error}</div>;
  }

  if (!product) {
    return <div className="text-center mt-8">Product not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row -mx-4">
        <div className="md:flex-1 px-4">
          <img src={product.image} alt={product.name} className="rounded-lg shadow-md mb-4" />
        </div>
        <div className="md:flex-1 px-4">
          <h2 className="text-3xl font-bold mb-2">{product.name}</h2>
          <div className="flex items-center mb-4">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <StarIcon
                  key={i}
                  className={`h-5 w-5 ${
                    i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="ml-2 text-gray-600">({product.reviews} reviews)</span>
          </div>
          <div className="mb-4">
            <span className="text-3xl font-bold">{product.price.toLocaleString()}원</span>
            {product.originalPrice && (
              <span className="ml-2 text-gray-500 line-through">
                {product.originalPrice.toLocaleString()}원
              </span>
            )}
          </div>
          <p className="text-gray-700 mb-4">{product.description}</p>
          <button className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition duration-300">
            Add to Cart
          </button>
        </div>
      </div>
      <ReviewsAndRatings productId={id} />
      <RelatedProducts currentProductId={id} />
    </div>
  );
};

export default ProductPage;