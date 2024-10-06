import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api, { updateProfile } from '../services/api';

export const updateUserProfile = createAsyncThunk(
  'user/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await updateProfile(profileData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

export const fetchUserProfileWithOrders = createAsyncThunk(
  'user/fetchProfileWithOrders',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/users/${userId}/profile-with-orders`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState: {
    profile: null,
    orders: [],
    status: 'idle',
    error: null,
  },
  reducers: {
    // ... existing reducers
  },
  extraReducers: (builder) => {
    builder
      .addCase(updateUserProfile.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.profile = action.payload;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(fetchUserProfileWithOrders.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchUserProfileWithOrders.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.profile = action.payload;
        state.orders = action.payload.orders;
      })
      .addCase(fetchUserProfileWithOrders.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export default userSlice.reducer;