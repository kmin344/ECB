import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { StarIcon } from '@heroicons/react/24/solid';
import { fetchReviews, submitReview } from '../redux/reviewsSlice';

const ReviewsAndRatings = ({ productId }) => {
  const dispatch = useDispatch();
  const { reviews, status, error } = useSelector(state => state.reviews);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });

  useEffect(() => {
    dispatch(fetchReviews(productId));
  }, [dispatch, productId]);

  const handleSubmitReview = (e) => {
    e.preventDefault();
    dispatch(submitReview({ productId, ...newReview }));
    setNewReview({ rating: 5, comment: '' });
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <StarIcon
        key={i}
        className={`h-5 w-5 ${
          i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  if (status === 'loading') return <div>Loading reviews...</div>;
  if (status === 'failed') return <div>Error: {error}</div>;

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold mb-4">Customer Reviews</h2>
      
      {reviews.map((review, index) => (
        <div key={index} className="mb-4 pb-4 border-b">
          <div className="flex items-center mb-2">
            {renderStars(review.rating)}
            <span className="ml-2 text-gray-600">{review.date}</span>
          </div>
          <p className="text-gray-700">{review.comment}</p>
        </div>
      ))}

      <form onSubmit={handleSubmitReview} className="mt-8">
        <h3 className="text-xl font-bold mb-4">Write a Review</h3>
        <div className="mb-4">
          <label className="block mb-2">Rating</label>
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setNewReview({ ...newReview, rating: star })}
                className={`mr-1 ${
                  star <= newReview.rating ? 'text-yellow-400' : 'text-gray-300'
                }`}
              >
                <StarIcon className="h-8 w-8" />
              </button>
            ))}
          </div>
        </div>
        <div className="mb-4">
          <label htmlFor="comment" className="block mb-2">
            Your Review
          </label>
          <textarea
            id="comment"
            value={newReview.comment}
            onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
            className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none"
            rows="4"
            required
          ></textarea>
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition duration-300"
        >
          Submit Review
        </button>
      </form>
    </div>
  );
};

export default ReviewsAndRatings;