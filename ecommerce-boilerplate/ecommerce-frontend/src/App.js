import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import styled from 'styled-components';
import Header from './components/Header';
import Home from './pages/Home';
// import Shop from './pages/Shop';
// import MembershipBenefits from './pages/MembershipBenefits';
import Cart from './components/Cart';
import Profile from './components/Profile';
import { Provider } from 'react-redux';
import {store} from './store';

const AppWrapper = styled.div`
  font-family: 'Arial', sans-serif;
  color: #333;
`;

const MainContent = styled.main`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
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
            {/* <Route path="/shop" element={<Shop />} /> */}
            {/* <Route path="/membership-benefits" element={<MembershipBenefits />} /> */}
            <Route path="/cart" element={<Cart />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </MainContent>
      </AppWrapper>
    </Router>
    </Provider>
  );
};

export default App;