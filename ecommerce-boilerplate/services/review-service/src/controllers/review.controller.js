const Review = require('../models/review.model');
const logger = require('../utils/logger');

exports.create = async (req, res, next) => {
  try {
    const newReview = new Review(req.body);
    const savedReview = await newReview.save();
    res.status(201).json(savedReview);
  } catch (error) {
    logger.error('Error in create review:', error);
    next(error);
  }
};

exports.getAll = async (req, res, next) => {
  try {
    const reviews = await Review.find();
    res.json(reviews);
  } catch (error) {
    logger.error('Error in getAll reviews:', error);
    next(error);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    res.json(review);
  } catch (error) {
    logger.error('Error in getById review:', error);
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const updatedReview = await Review.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedReview) return res.status(404).json({ message: 'Review not found' });
    res.json(updatedReview);
  } catch (error) {
    logger.error('Error in update review:', error);
    next(error);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const deletedReview = await Review.findByIdAndDelete(req.params.id);
    if (!deletedReview) return res.status(404).json({ message: 'Review not found' });
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    logger.error('Error in delete review:', error);
    next(error);
  }
};