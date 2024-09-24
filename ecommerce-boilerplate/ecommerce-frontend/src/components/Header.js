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
      <Link to="/" className="text-2xl font-bold">
        <img className="scroll_logo fixed_transform" src="https://cdn.imweb.me/thumbnail/20240604/4f4d4fc80e8be.png" alt="아뜰리에페이(Atelier Faye)" width="151.304347826" />
      </Link>
      <div className="flex space-x-4">
        <button>Search</button>
        <button>Account</button>
        <button>Cart</button>
      </div>
    </header>
  );
};

export default Header;