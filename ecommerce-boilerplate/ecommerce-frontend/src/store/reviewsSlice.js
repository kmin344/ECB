import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getReviews, postReview } from '../services/api';

export const fetchReviews = createAsyncThunk(
  'reviews/fetchReviews',
  async (productId) => {
    const response = await getReviews(productId);
    return response.data;
  }
);

export const submitReview = createAsyncThunk(
  'reviews/submitReview',
  async ({ productId, rating, comment }) => {
    const response = await postReview(productId, { rating, comment });
    return response.data;
  }
);

const reviewsSlice = createSlice({
  name: 'reviews',
  initialState: {
    reviews: [],
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchReviews.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchReviews.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.reviews = action.payload;
      })
      .addCase(fetchReviews.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(submitReview.fulfilled, (state, action) => {
        state.reviews.push(action.payload);
      });
  },
});

export default reviewsSlice.reducer;