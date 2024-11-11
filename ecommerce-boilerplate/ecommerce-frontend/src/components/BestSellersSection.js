import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { HeartIcon, StarIcon, EyeIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import QuickViewModal from './QuickViewModal';

const BestSellersSection = () => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [wishlist, setWishlist] = useState([]);

  // Mock product data for Best Sellers
  const bestSellers = [
    { 
      id: 1, 
      name: "Best Seller 1", 
      price: 39000, 
      originalPrice: 44000,
      image: "https://cdn.imweb.me/thumbnail/20240606/9bded7c6993db.jpg", 
      rating: 4.5, 
      reviews: 120,
      description: "This is a description for Best Seller 1."
    },
    { id: 1, name: "Best Seller 1", price: 39000, image: "https://cdn.imweb.me/thumbnail/20240606/9bded7c6993db.jpg", rating: 4.5, reviews: 120 },
    { id: 2, name: "Best Seller 2", price: 49000, image: "https://cdn.imweb.me/thumbnail/20240606/9bded7c6993db.jpg", rating: 4.2, reviews: 85 },
    { id: 3, name: "Best Seller 3", price: 44000, image: "https://cdn.imweb.me/thumbnail/20240606/9bded7c6993db.jpg", rating: 4.8, reviews: 200 },
    { id: 4, name: "Best Seller 4", price: 52000, image: "https://cdn.imweb.me/thumbnail/20240606/9bded7c6993db.jpg", rating: 4.0, reviews: 150 },
    { id: 4, name: "Best Seller 4", price: 52000, image: "https://cdn.imweb.me/thumbnail/20240606/9bded7c6993db.jpg", rating: 4.0, reviews: 150 },

  ];

  const toggleWishlist = (productId) => {
    setWishlist(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId) 
        : [...prev, productId]
    );
  };

  return (
    <section className="py-16 px-4">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">BEST SELLERS</h2>
          <Link to="/best-sellers" className="text-sm font-medium hover:underline">SHOP ALL &gt;</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {bestSellers.map(product => (
            <div key={product.id} className="group relative">
              <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-200">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="h-full w-full object-cover object-center group-hover:opacity-75 transition-opacity duration-300"
                />
                <div className="absolute top-2 right-2 flex flex-col gap-2">
                  <button 
                    onClick={() => toggleWishlist(product.id)}
                    className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors duration-200"
                  >
                    {wishlist.includes(product.id) 
                      ? <HeartSolidIcon className="h-5 w-5 text-red-500" />
                      : <HeartIcon className="h-5 w-5 text-gray-400" />
                    }
                  </button>
                  <button 
                    onClick={() => setSelectedProduct(product)}
                    className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors duration-200"
                  >
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  </button>
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-sm text-gray-700">{product.name}</h3>
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
              </div>
            </div>
          ))}
        </div>
      </div>
      {selectedProduct && (
        <QuickViewModal 
          product={selectedProduct} 
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </section>
  );
};

export default BestSellersSection;