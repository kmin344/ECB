import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import ProductList from './components/ProductList';
import Cart from './components/Cart';
import Profile from './components/Profile';
import {store} from './store';
import { Provider } from 'react-redux';

const App = () => {
  return (
    <Provider store={store}>
      <Router>
        <div className="App">
          <Header />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<ProductList products={[]} />} />
            <Route path="/cart" element={<Cart items={[]} />} />
            <Route path="/profile" element={<Profile user={{}} />} />
          </Routes>
        </div>
      </Router>
    </Provider>
  );
};

export default App;