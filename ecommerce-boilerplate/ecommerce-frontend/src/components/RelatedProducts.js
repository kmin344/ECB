import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getRelatedProducts } from '../services/api';
import { StarIcon } from '@heroicons/react/24/solid';

const RelatedProducts = ({ currentProductId, category }) => {
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      try {
        setLoading(true);
        const response = await getRelatedProducts(currentProductId, category);
        setRelatedProducts(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedProducts();
  }, [currentProductId, category]);

  if (loading) return <div>Loading related products...</div>;
  if (error) return <div>Error loading related products: {error}</div>;

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold mb-4">Related Products</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {relatedProducts.map(product => (
          <Link key={product._id} to={`/product/${product._id}`} className="group">
            <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-200">
              <img 
                src={product.thumbnail} 
                alt={product.name} 
                className="h-full w-full object-cover object-center group-hover:opacity-75 transition-opacity duration-300"
              />
            </div>
            <h3 className="mt-4 text-sm text-gray-700">{product.name}</h3>
            <p className="mt-1 text-lg font-medium text-gray-900">{product.price.toLocaleString()}원</p>
            <div className="mt-1 flex items-center">
              {[...Array(5)].map((_, i) => (
                <StarIcon 
                  key={i} 
                  className={`h-4 w-4 ${i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-200'}`} 
                />
              ))}
              <span className="ml-1 text-sm text-gray-500">({product.reviews})</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RelatedProducts;