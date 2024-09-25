import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { StarIcon } from '@heroicons/react/24/solid';

const ProductPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real application, you would fetch the product data from an API
    // For this example, we'll use a mock product
    const fetchProduct = async () => {
      // Simulating API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setProduct({
        id: id,
        name: `Product ${id}`,
        price: 39000,
        originalPrice: 44000,
        image: "https://cdn.imweb.me/thumbnail/20240606/9bded7c6993db.jpg",
        description: "This is a detailed description of the product. It provides information about the product's features, benefits, and any other relevant details that a customer might want to know.",
        rating: 4.5,
        reviews: 120,
      });
      setLoading(false);
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return <div className="text-center mt-8">Loading...</div>;
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
    </div>
  );
};

export default ProductPage;