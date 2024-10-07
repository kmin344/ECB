import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import styled from 'styled-components';
import Header from './components/Header';
import Home from './pages/Home';
import ShopPage from './pages/Shop';
// import MembershipBenefits from './pages/MembershipBenefits';
import ProductPage from './pages/Product';
import Cart from './pages/Cart';
import Profile from './pages/Profile';
import ProductList from './components/ProductList';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import { Provider } from 'react-redux';
import {store} from './store';
import Login from './pages/Login';
import Logout from './pages/Logout';

const AppWrapper = styled.div`
  font-family: 'Arial', sans-serif;
  color: #333;
`;

const MainContent = styled.main`
  margin: 0 auto;
`;

const App = () => {
  return (
    <Provider store={store}>
    <Router>
      <AppWrapper>
        <Header />
        <MainContent>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/logout" element={<Logout />} />
            <Route path="/products" element={<ProductList />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/product/:id" element={<ProductPage />} />
            {/* <Route path="/membership-benefits" element={<MembershipBenefits />} /> */}
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order-confirmation" element={<OrderConfirmation />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </MainContent>
      </AppWrapper>
    </Router>
    </Provider>
  );
};

export default App;