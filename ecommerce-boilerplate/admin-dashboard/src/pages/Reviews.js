// src/pages/Reviews.js
import React, { useState, useEffect } from 'react';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, 
  Button, Dialog, DialogTitle, DialogContent, DialogActions, 
  Typography, Select, MenuItem, Rating
} from '@mui/material';
import Layout from '../components/Layout';
import { getReviews, updateReviewStatus, deleteReview } from '../services/api';

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [open, setOpen] = useState(false);
  const [currentReview, setCurrentReview] = useState(null);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await getReviews();
      setReviews(response.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      // TODO: Implement error handling
    }
  };

  const handleOpen = (review) => {
    setCurrentReview(review);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setCurrentReview(null);
  };

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    try {
      await updateReviewStatus(currentReview._id, newStatus);
      setReviews(reviews.map(review => 
        review._id === currentReview._id ? {...review, status: newStatus} : review
      ));
      handleClose();
    } catch (error) {
      console.error('Error updating review status:', error);
      // TODO: Implement error handling
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        await deleteReview(id);
        setReviews(reviews.filter(review => review._id !== id));
      } catch (error) {
        console.error('Error deleting review:', error);
        // TODO: Implement error handling
      }
    }
  };

  return (
    <Layout>
      <Typography variant="h4" gutterBottom>
        Reviews
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Product</TableCell>
              <TableCell>User</TableCell>
              <TableCell>Rating</TableCell>
              <TableCell>Comment</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reviews.map((review) => (
              <TableRow key={review._id}>
                <TableCell>{review.product.name}</TableCell>
                <TableCell>{review.user.name}</TableCell>
                <TableCell>
                  <Rating value={review.rating} readOnly />
                </TableCell>
                <TableCell>{review.comment.substring(0, 50)}...</TableCell>
                <TableCell>{review.status}</TableCell>
                <TableCell>
                  <Button color="primary" onClick={() => handleOpen(review)}>
                    View
                  </Button>
                  <Button color="secondary" onClick={() => handleDelete(review._id)}>
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Review Details</DialogTitle>
        <DialogContent>
          {currentReview && (
            <>
              <Typography variant="h6">Product: {currentReview.product.name}</Typography>
              <Typography>User: {currentReview.user.name}</Typography>
              <Typography>Rating: <Rating value={currentReview.rating} readOnly /></Typography>
              <Typography>Comment: {currentReview.comment}</Typography>
              <Typography>Status: {currentReview.status}</Typography>
              <Typography variant="h6" style={{marginTop: '1rem'}}>Update Status:</Typography>
              <Select
                value={currentReview.status}
                onChange={handleStatusChange}
                fullWidth
              >
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="approved">Approved</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
              </Select>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default Reviews;