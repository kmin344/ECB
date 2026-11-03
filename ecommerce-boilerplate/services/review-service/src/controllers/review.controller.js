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
    // Users live in auth-service's database, so reviews return the user ID.
    const reviews = await Review.find({ productId, status: { $ne: 'rejected' } });
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

    // Authors can delete their own review; admins can delete any review.
    const filter = req.user.role === 'admin' ? { _id: id } : { _id: id, userId };
    const review = await Review.findOneAndDelete(filter);

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

// Admin: every review, newest first
exports.listReviews = async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    logger.error('Error listing reviews:', error);
    res.status(500).json({ message: 'Error listing reviews', error: error.message });
  }
};

exports.getReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    res.json(review);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Review not found' });
    }
    res.status(500).json({ message: 'Error fetching review', error: error.message });
  }
};

// Admin: approve or reject a review
exports.updateReviewStatus = async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    res.json(review);
  } catch (error) {
    if (error.name === 'ValidationError' || error.name === 'CastError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Error updating review status', error: error.message });
  }
};

async function updateProductRating(productId) {
  const reviews = await Review.find({ productId });
  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;

  await Product.findByIdAndUpdate(productId, { averageRating });
}