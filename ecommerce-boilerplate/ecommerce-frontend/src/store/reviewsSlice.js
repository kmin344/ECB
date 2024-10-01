import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api, { getReviews, postReview } from '../services/api';

export const fetchReviews = createAsyncThunk(
  'reviews/fetchReviews',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await getReviews(productId);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

export const submitReview = createAsyncThunk(
  'reviews/submitReview',
  async ({ productId, review }, { rejectWithValue }) => {
    try {
      const response = await postReview(productId, review);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

const reviewsSlice = createSlice({
  name: 'reviews',
  initialState: {
    items: [],
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
        state.items = action.payload;
      })
      .addCase(fetchReviews.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload.message;
      })
      .addCase(submitReview.fulfilled, (state, action) => {
        state.items.push(action.payload);
      });
  },
});

export default reviewsSlice.reducer;