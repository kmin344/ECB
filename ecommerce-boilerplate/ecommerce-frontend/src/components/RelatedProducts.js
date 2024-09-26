import React from 'react';
import { Link } from 'react-router-dom';
import { StarIcon } from '@heroicons/react/24/solid';

const RelatedProducts = ({ currentProductId }) => {
  // In a real application, you would fetch related products based on the current product
  // For this example, we'll use mock data
  const relatedProducts = [
    { id: 2, name: "Related Product 1", price: 35000, image: "https://cdn.imweb.me/thumbnail/20240606/9bded7c6993db.jpg", rating: 4.2, reviews: 89 },
    { id: 3, name: "Related Product 2", price: 42000, image: "https://cdn.imweb.me/thumbnail/20240606/9bded7c6993db.jpg", rating: 4.7, reviews: 156 },
    { id: 4, name: "Related Product 3", price: 38000, image: "https://cdn.imweb.me/thumbnail/20240606/9bded7c6993db.jpg", rating: 4.4, reviews: 102 },
    { id: 5, name: "Related Product 4", price: 45000, image: "https://cdn.imweb.me/thumbnail/20240606/9bded7c6993db.jpg", rating: 4.1, reviews: 73 },
  ].filter(product => product.id !== parseInt(currentProductId));

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold mb-4">Related Products</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {relatedProducts.map(product => (
          <Link key={product.id} to={`/product/${product.id}`} className="group">
            <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-200">
              <img 
                src={product.image} 
                alt={product.name} 
                className="h-full w-full object-cover object-center group-hover:opacity-75 transition-opacity duration-300"
              />
            </div>
            <h3 className="mt-2 text-sm text-gray-700">{product.name}</h3>
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