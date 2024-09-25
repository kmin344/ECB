import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const QuickViewModal = ({ product, onClose }) => {
  if (!product) {
    return null; // Don't render anything if product is undefined
  }

  const { name, price, originalPrice, image, description } = product;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg max-w-2xl w-full relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/2">
            <img
              src={image || 'https://via.placeholder.com/300'}
              alt={name}
              className="w-full h-auto object-cover rounded"
            />
          </div>
          <div className="md:w-1/2 md:pl-8 mt-4 md:mt-0">
            <h2 className="text-2xl font-bold mb-2">{name}</h2>
            <p className="text-gray-600 mb-4">{description || 'No description available.'}</p>
            <div className="mb-4">
              <span className="text-2xl font-bold">
                {typeof price === 'number' ? `${price.toLocaleString()}원` : 'Price not available'}
              </span>
              {originalPrice && typeof originalPrice === 'number' && (
                <span className="ml-2 text-gray-500 line-through">
                  {originalPrice.toLocaleString()}원
                </span>
              )}
            </div>
            <button className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition duration-300">
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickViewModal;