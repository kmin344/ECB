import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Orders from './pages/Orders';
import Users from './pages/Users';
import Reviews from './pages/Reviews';
import Login from './pages/Login';

function App() {
  return (
    <Router>
      <Switch>
        <Route exact path="/" component={Dashboard} />
        <Route path="/products" component={Products} />
        <Route path="/orders" component={Orders} />
        <Route path="/users" component={Users} />
        <Route path="/reviews" component={Reviews} />
        <Route path="/login" component={Login} />
      </Switch>
    </Router>
  );
}