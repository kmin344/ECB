import { configureStore } from '@reduxjs/toolkit';
import productsReducer from './productsSlice';
import authReducer from './authSlice';
import reviewsReducer from './reviewsSlice';
// import cartReducer from './cartSlice';
// import userReducer from './userSlice';

export const store = configureStore({
  reducer: {
    products: productsReducer,
    auth: authReducer,
    review: reviewsReducer,
    // cart: cartReducer,
    // user: userReducer,
  },
});