const Review = require('../models/review.model');
const Product = require('../models/product.model');
const logger = require('../utils/logger');

exports.createReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;
    const userId = req.user.id; // Assuming we have user info from auth middleware

    const newReview = new Review({
      productId,
      userId,
      rating,
      comment
    });

    await newReview.save();

    // Update product's average rating
    await updateProductRating(productId);

    logger.info(`New review created for product ${productId} by user ${userId}`);
    res.status(201).json(newReview);
  } catch (error) {
    logger.error('Error creating review:', error);
    res.status(500).json({ message: 'Error creating review', error: error.message });
  }
};

exports.getReviewsForProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const reviews = await Review.find({ productId }).populate('userId', 'name');
    res.json(reviews);
  } catch (error) {
    logger.error('Error fetching reviews:', error);
    res.status(500).json({ message: 'Error fetching reviews', error: error.message });
  }
};

exports.updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id;

    const review = await Review.findOneAndUpdate(
      { _id: id, userId },
      { rating, comment, updatedAt: Date.now() },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({ message: 'Review not found or user not authorized' });
    }

    await updateProductRating(review.productId);

    logger.info(`Review ${id} updated by user ${userId}`);
    res.json(review);
  } catch (error) {
    logger.error('Error updating review:', error);
    res.status(500).json({ message: 'Error updating review', error: error.message });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const review = await Review.findOneAndDelete({ _id: id, userId });

    if (!review) {
      return res.status(404).json({ message: 'Review not found or user not authorized' });
    }

    await updateProductRating(review.productId);

    logger.info(`Review ${id} deleted by user ${userId}`);
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    logger.error('Error deleting review:', error);
    res.status(500).json({ message: 'Error deleting review', error: error.message });
  }
};

async function updateProductRating(productId) {
  const reviews = await Review.find({ productId });
  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;

  await Product.findByIdAndUpdate(productId, { averageRating });
}