import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductById } from '../store/productsSlice';
import { addToCart } from '../store/cartSlice';
import { StarIcon } from '@heroicons/react/24/solid';
import RelatedProducts from '../components/RelatedProducts';
import ReviewsAndRatings from '../components/ReviewsAndRatings';

const Product = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { currentProduct, status, error } = useSelector(state => state.products);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    dispatch(fetchProductById(id));
  }, [dispatch, id]);

  const handleAddToCart = () => {
    if (currentProduct) {
      dispatch(addToCart({
        id: currentProduct._id,
        name: currentProduct.name,
        price: currentProduct.price,
        thumbnail: currentProduct.thumbnail,
        quantity: quantity
      }));
      // Optionally, you can add a toast notification here to inform the user
      alert('Product added to cart!');
    }
  };

  if (status === 'loading') {
    return <div className="text-center mt-8">Loading...</div>;
  }

  if (status === 'failed') {
    return <div className="text-center mt-8 text-red-500">Error: {error}</div>;
  }

  if (!currentProduct) {
    return <div className="text-center mt-8">Product not found</div>;
  }

  const {
    name,
    thumbnail,
    images,
    description,
    price,
    originalPrice,
    rating,
    reviews,
    category
  } = currentProduct;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row -mx-4">
        <div className="md:flex-1 px-4">
          <img src={thumbnail || (images && images[0])} alt={name} className="rounded-lg shadow-md mb-4" />
        </div>
        <div className="md:flex-1 px-4">
          <h2 className="text-3xl font-bold mb-2">{name}</h2>
          <div className="flex items-center mb-4">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <StarIcon
                  key={i}
                  className={`h-5 w-5 ${
                    i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="ml-2 text-gray-600">({reviews} reviews)</span>
          </div>
          <div className="mb-4">
            <span className="text-3xl font-bold">{price?.toLocaleString()}원</span>
            {originalPrice && (
              <span className="ml-2 text-gray-500 line-through">
                {originalPrice.toLocaleString()}원
              </span>
            )}
          </div>
          <p className="text-gray-700 mb-4">{description}</p>
          <div className="flex items-center mb-4">
            <label htmlFor="quantity" className="mr-2">Quantity:</label>
            <input
              type="number"
              id="quantity"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value)))}
              className="w-16 px-2 py-1 border rounded"
            />
          </div>
          <button 
            onClick={handleAddToCart}
            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition duration-300"
          >
            Add to Cart
          </button>
        </div>
      </div>
      
      <ReviewsAndRatings productId={id} />
      
      <RelatedProducts currentProductId={id} category={category} />
    </div>
  );
};

export default Product;