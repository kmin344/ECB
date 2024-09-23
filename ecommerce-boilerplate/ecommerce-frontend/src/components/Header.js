import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="bg-white border-b px-4 py-4 flex items-center justify-between">
      <nav>
        <ul className="flex space-x-4">
          <li><Link to="/shop">Shop</Link></li>
          <li><Link to="/about">About</Link></li>
          <li><Link to="/contact">Contact</Link></li>
        </ul>
      </nav>
      <Link to="/" className="text-2xl font-bold">Logo</Link>
      <div className="flex space-x-4">
        <button>Search</button>
        <button>Account</button>
        <button>Cart</button>
      </div>
    </header>
  );
};

export default Header;