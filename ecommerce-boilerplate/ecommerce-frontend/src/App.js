import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { Provider } from 'react-redux';
import styled from 'styled-components';
import Header from './components/Header';
import Home from './pages/Home';
import ProductList from './components/ProductList';
import Cart from './components/Cart';
import Profile from './components/Profile';
import { store } from './store';
import GlobalStyle from './styles/GlobalStyle';
import theme from './styles/theme';

const AppWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const MainContent = styled.main`
  flex: 1;
  padding: 20px;
`;

const App = () => {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <GlobalStyle />
        <Router>
          <AppWrapper>
            <Header />
            <MainContent>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<ProductList />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/profile" element={<Profile />} />
              </Routes>
            </MainContent>
          </AppWrapper>
        </Router>
      </ThemeProvider>
    </Provider>
  );
};

export default App;